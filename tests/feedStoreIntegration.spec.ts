import { test, expect } from '@playwright/test';

// Integration coverage for the FeedState migration: the migrated stores still
// issue the right requests, fold responses into their own feed, and surface
// failures as observable state.
//
// Route matchers here are URL predicates, not globs. A glob of the form
// "(star)(star)/api/explore(star)(star)" also matches the Vite dev-server module
// URL /src/utils/api/exploreApiClient.ts, so it stubs the source file itself with
// JSON and the app never boots.

test('exploreStore.loadExploreNews hits the endpoint and fills its own feed', async ({ page }) => {
    test.slow();

    let requestedUrl = '';
    await page.route((url) => url.pathname.startsWith('/api/explore'), async (route) => {
        requestedUrl = route.request().url();
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            headers: { pagination: JSON.stringify({ currentPage: 1, itemsPerPage: 40, totalItems: 2, totalPages: 1 }) },
            body: JSON.stringify({
                items: [
                    { title: 'Falcon story one', url: 'https://example.com/1' },
                    { title: 'Falcon story two', url: 'https://example.com/2' },
                ],
                pagination: { currentPage: 1, itemsPerPage: 40, totalItems: 2, totalPages: 1 },
            }),
        });
    });

    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);
    await page.waitForFunction(() => !!(window as any).__alsaqrTest?.store, null, { timeout: 60_000 });

    const result = await page.evaluate(async () => {
        const { store } = (window as any).__alsaqrTest;
        store.exploreStore.exploreNewsFeed.reset();
        store.exploreStore.ajNewsFeed.reset();

        await store.exploreStore.loadExploreNews();

        return {
            news: store.exploreStore.exploreNews.map((n: any) => n.title),
            widget: store.exploreStore.widgetExploreNews,
            aj: store.exploreStore.ajNews.length,
            error: store.exploreStore.exploreNewsFeed.error ?? null,
            loading: store.exploreStore.loadingInitial,
        };
    });

    expect(requestedUrl).toContain('currentPage=1');
    expect(requestedUrl).toContain('itemsPerPage=40');
    expect(result.news).toEqual(['Falcon story one', 'Falcon story two']);
    expect(result.widget[0]).toMatchObject({ title: 'Falcon story one', link: 'https://example.com/1' });
    // The bug this migration fixed: loading Popular must not touch other sources.
    expect(result.aj).toBe(0);
    expect(result.error).toBeNull();
    expect(result.loading).toBe(false);
});

test('communityFeedStore.loadCommunities drives a real request through FeedState', async ({ page }) => {
    test.slow();

    const urls: string[] = [];
    await page.route((url) => url.pathname.startsWith('/api/Communities'), async (route) => {
        urls.push(route.request().url());
        await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
                items: [{ communityId: 'community_1', name: 'Falcons', relationshipType: 'None' }],
                pagination: { currentPage: 1, itemsPerPage: 25, totalItems: 1, totalPages: 1 },
            }),
        });
    });

    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);
    await page.waitForFunction(() => !!(window as any).__alsaqrTest?.store, null, { timeout: 60_000 });

    const result = await page.evaluate(async () => {
        const { store } = (window as any).__alsaqrTest;
        store.communityFeedStore.feed.reset();
        store.communityFeedStore.setPredicate('searchTerm', 'falcon');

        await store.communityFeedStore.loadCommunities();

        return {
            names: store.communityFeedStore.communities.map((c: any) => c.name),
            error: store.communityFeedStore.feed.error ?? null,
        };
    });

    expect(urls.length).toBeGreaterThan(0);
    expect(urls.some((u) => u.includes('searchTerm=falcon'))).toBe(true);
    expect(result.names).toEqual(['Falcons']);
    expect(result.error).toBeNull();
});

test('a failing feed request lands as observable error state, not an unhandled rejection', async ({ page }) => {
    test.slow();

    const unhandled: string[] = [];
    page.on('pageerror', (e) => unhandled.push(e.message));

    await page.route((url) => url.pathname.startsWith('/api/Communities'), (route) =>
        route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'kaboom' }) })
    );

    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);
    await page.waitForFunction(() => !!(window as any).__alsaqrTest?.store, null, { timeout: 60_000 });

    const result = await page.evaluate(async () => {
        const { store } = (window as any).__alsaqrTest;
        store.communityFeedStore.feed.reset();

        await store.communityFeedStore.loadCommunities();

        return {
            error: store.communityFeedStore.feed.error,
            common: store.commonStore.error,
            loading: store.communityFeedStore.loadingInitial,
        };
    });

    expect(result.error.statusCode).toBe(500);
    expect(result.common.statusCode).toBe(500);
    expect(result.loading).toBe(false);
    expect(unhandled.filter((m) => m.includes('kaboom'))).toHaveLength(0);
});
