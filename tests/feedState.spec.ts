import { test, expect, Page } from '@playwright/test';

/**
 * Store-layer coverage for FeedState (src/stores/base/feedState.ts) -- the
 * shared paginated-feed mechanics every feed store now composes instead of
 * hand-rolling.
 *
 * These drive the class directly through the dev-only window.__alsaqrTest
 * bridge, so they need no logged-in session and no live backend. Feeds that
 * render through it are covered end-to-end by the existing feature specs
 * (community.spec.ts, lists.spec.ts, ...).
 */

type FeedItem = { postId: string; text: string };

const page1 = (items: FeedItem[], totalPages = 2) => ({
    items,
    pagination: { currentPage: 1, itemsPerPage: 2, totalItems: items.length * totalPages, totalPages },
});

/** Boots the app far enough for the store module to evaluate and attach. */
const gotoApp = async (page: Page) => {
    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);
    await page.waitForFunction(() => !!(window as any).__alsaqrTest?.FeedState, null, {
        timeout: 60_000,
    });
};

test.beforeEach(async ({ page }) => {
    test.slow();
    await gotoApp(page);
});

test.describe('FeedState -- query params', () => {

    test('axiosParams carries paging params, static params and predicates', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId, {
                itemsPerPage: 15,
                staticParams: { all: 'true' },
            });

            feed.setPredicate('searchTerm', 'falcon');
            feed.setPredicate('limitCount', 7);

            return feed.axiosParams.toString();
        });

        expect(result).toContain('currentPage=1');
        expect(result).toContain('itemsPerPage=15');
        expect(result).toContain('all=true');
        expect(result).toContain('searchTerm=falcon');
        expect(result).toContain('limitCount=7');
    });

    test('setPredicate deletes the key when given a falsy value', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            feed.setPredicate('searchTerm', 'falcon');
            const withTerm = feed.axiosParams.get('searchTerm');

            feed.setPredicate('searchTerm', undefined);
            const afterUndefined = feed.axiosParams.get('searchTerm');

            feed.setPredicate('searchTerm', 'falcon');
            feed.setPredicate('searchTerm', '');
            const afterEmptyString = feed.axiosParams.get('searchTerm');

            return { withTerm, afterUndefined, afterEmptyString };
        });

        expect(result.withTerm).toBe('falcon');
        expect(result.afterUndefined).toBeNull();
        expect(result.afterEmptyString).toBeNull();
    });

    test('Date predicates serialize as ISO strings', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            feed.setPredicate('since', new Date(Date.UTC(2026, 0, 15, 12, 0, 0)));
            return feed.axiosParams.get('since');
        });

        expect(result).toBe('2026-01-15T12:00:00.000Z');
    });

    test('setPage and setPagingParams both move the page', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId, { itemsPerPage: 10 });

            feed.setPage(3);
            const afterSetPage = feed.axiosParams.toString();

            feed.setPage(4, 50);
            const afterSetPageWithSize = feed.axiosParams.toString();

            // The setter the feed components call directly, with a PagingParams.
            feed.setPagingParams({ currentPage: 7, itemsPerPage: 30 });
            const afterSetPagingParams = feed.axiosParams.toString();

            return { afterSetPage, afterSetPageWithSize, afterSetPagingParams };
        });

        // setPage keeps the existing page size when none is given.
        expect(result.afterSetPage).toContain('currentPage=3');
        expect(result.afterSetPage).toContain('itemsPerPage=10');

        expect(result.afterSetPageWithSize).toContain('currentPage=4');
        expect(result.afterSetPageWithSize).toContain('itemsPerPage=50');

        expect(result.afterSetPagingParams).toContain('currentPage=7');
        expect(result.afterSetPagingParams).toContain('itemsPerPage=30');
    });
});

test.describe('FeedState -- registry', () => {

    test('items, isEmpty, getItem, removeItem and clearItems', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            const emptyAtStart = feed.isEmpty;

            feed.setItem({ postId: 'p1', text: 'one' });
            feed.setItem({ postId: 'p2', text: 'two' });
            feed.setItemByKey('p3', { postId: 'p3', text: 'three' });

            const ids = feed.items.map((i: any) => i.postId);
            const found = feed.getItem('p2')?.text;
            const missing = feed.getItem('nope');

            feed.removeItem('p1');
            const afterRemove = feed.items.map((i: any) => i.postId);

            feed.clearItems();

            return {
                emptyAtStart,
                ids,
                found,
                missing: missing ?? null,
                afterRemove,
                emptyAtEnd: feed.isEmpty,
            };
        });

        expect(result.emptyAtStart).toBe(true);
        expect(result.ids).toEqual(['p1', 'p2', 'p3']);
        expect(result.found).toBe('two');
        expect(result.missing).toBeNull();
        expect(result.afterRemove).toEqual(['p2', 'p3']);
        expect(result.emptyAtEnd).toBe(true);
    });

    test('setItem keys by the extractor, so a re-fetched item updates in place', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            feed.setItem({ postId: 'p1', text: 'original' });
            feed.setItem({ postId: 'p1', text: 'updated' });

            return { count: feed.items.length, text: feed.items[0].text };
        });

        expect(result.count).toBe(1);
        expect(result.text).toBe('updated');
    });

    test('hasMore reflects the pagination window', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            const withoutPagination = feed.hasMore;

            feed.setPagination({ currentPage: 1, itemsPerPage: 10, totalItems: 30, totalPages: 3 });
            const midway = feed.hasMore;

            feed.setPagination({ currentPage: 3, itemsPerPage: 10, totalItems: 30, totalPages: 3 });
            const atEnd = feed.hasMore;

            return { withoutPagination, midway, atEnd };
        });

        expect(result.withoutPagination).toBe(false);
        expect(result.midway).toBe(true);
        expect(result.atEnd).toBe(false);
    });

    test('reset clears predicate, registry, pagination and paging params', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId, { itemsPerPage: 25 });

            feed.setPredicate('searchTerm', 'falcon');
            feed.setItem({ postId: 'p1', text: 'one' });
            feed.setPagination({ currentPage: 4, itemsPerPage: 25, totalItems: 100, totalPages: 4 });
            feed.setPage(4);
            feed.setError({ statusCode: 500, message: 'boom', details: '' });

            feed.reset();

            return {
                items: feed.items.length,
                predicateSize: feed.predicate.size,
                pagination: feed.pagination ?? null,
                error: feed.error ?? null,
                params: feed.axiosParams.toString(),
            };
        });

        expect(result.items).toBe(0);
        expect(result.predicateSize).toBe(0);
        expect(result.pagination).toBeNull();
        expect(result.error).toBeNull();
        // Paging params go back to page 1 -- the drift that used to leave a feed
        // stranded on a stale page after a reset.
        expect(result.params).toContain('currentPage=1');
        expect(result.params).toContain('itemsPerPage=25');
    });
});

test.describe('FeedState -- load and response shapes', () => {

    test('load folds an { items, pagination } page into the registry', async ({ page }) => {
        const result = await page.evaluate(async (payload) => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            let seenParams = '';
            await feed.load((params: URLSearchParams) => {
                seenParams = params.toString();
                return Promise.resolve(payload);
            });

            return {
                seenParams,
                ids: feed.items.map((i: any) => i.postId),
                totalPages: feed.pagination?.totalPages,
                loading: feed.loadingInitial,
                error: feed.error ?? null,
            };
        }, page1([{ postId: 'p1', text: 'one' }, { postId: 'p2', text: 'two' }]));

        expect(result.ids).toEqual(['p1', 'p2']);
        expect(result.totalPages).toBe(2);
        expect(result.seenParams).toContain('currentPage=1');
        expect(result.loading).toBe(false);
        expect(result.error).toBeNull();
    });

    test('load accepts a PaginatedResult { data, pagination } body', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            await feed.load(() =>
                Promise.resolve({
                    data: [{ postId: 'p1', text: 'one' }],
                    pagination: { currentPage: 1, itemsPerPage: 25, totalItems: 1, totalPages: 1 },
                })
            );

            return { ids: feed.items.map((i: any) => i.postId), total: feed.pagination?.totalItems };
        });

        expect(result.ids).toEqual(['p1']);
        expect(result.total).toBe(1);
    });

    test('load accepts a bare array and an empty response without throwing', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;

            const bare = new FeedState((i: any) => i.postId);
            await bare.load(() => Promise.resolve([{ postId: 'p1', text: 'one' }]));

            const nothing = new FeedState((i: any) => i.postId);
            await nothing.load(() => Promise.resolve(undefined));

            const shapeless = new FeedState((i: any) => i.postId);
            await shapeless.load(() => Promise.resolve({ unexpected: true }));

            return {
                bareIds: bare.items.map((i: any) => i.postId),
                barePagination: bare.pagination ?? null,
                nothingCount: nothing.items.length,
                nothingError: nothing.error ?? null,
                shapelessCount: shapeless.items.length,
                shapelessError: shapeless.error ?? null,
            };
        });

        expect(result.bareIds).toEqual(['p1']);
        expect(result.barePagination).toBeNull();
        // The old stores destructured { items } off `?? []` and threw on an
        // empty body; these must simply come back empty.
        expect(result.nothingCount).toBe(0);
        expect(result.nothingError).toBeNull();
        expect(result.shapelessCount).toBe(0);
        expect(result.shapelessError).toBeNull();
    });

    test('loadingInitial is true during the request and false after', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            let duringLoad = false;
            const pending = feed.load(
                () =>
                    new Promise((resolve) => {
                        duringLoad = feed.loadingInitial;
                        setTimeout(() => resolve({ items: [], pagination: undefined }), 20);
                    })
            );

            await pending;
            return { duringLoad, after: feed.loadingInitial };
        });

        expect(result.duringLoad).toBe(true);
        expect(result.after).toBe(false);
    });
});

test.describe('FeedState -- clear strategies', () => {

    test('firstPage clears on page 1 and appends on later pages', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId, { itemsPerPage: 2 });

            await feed.load(() =>
                Promise.resolve({
                    items: [{ postId: 'p1' }, { postId: 'p2' }],
                    pagination: { currentPage: 1, itemsPerPage: 2, totalItems: 4, totalPages: 2 },
                })
            );
            const afterFirst = feed.items.map((i: any) => i.postId);

            feed.setPage(2);
            await feed.load(() =>
                Promise.resolve({
                    items: [{ postId: 'p3' }, { postId: 'p4' }],
                    pagination: { currentPage: 2, itemsPerPage: 2, totalItems: 4, totalPages: 2 },
                })
            );
            const afterSecond = feed.items.map((i: any) => i.postId);

            // Back to page 1 -- the registry should be wiped, not appended to.
            feed.setPage(1);
            await feed.load(() =>
                Promise.resolve({
                    items: [{ postId: 'p1' }],
                    pagination: { currentPage: 1, itemsPerPage: 2, totalItems: 1, totalPages: 1 },
                })
            );
            const afterReturn = feed.items.map((i: any) => i.postId);

            return { afterFirst, afterSecond, afterReturn };
        });

        expect(result.afterFirst).toEqual(['p1', 'p2']);
        // This is the paging regression the migration fixed: page 2 must add to
        // page 1, not replace it.
        expect(result.afterSecond).toEqual(['p1', 'p2', 'p3', 'p4']);
        expect(result.afterReturn).toEqual(['p1']);
    });

    test('always clears on every load, never keeps everything', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;

            const always = new FeedState((i: any) => i.postId, { clearStrategy: 'always' });
            await always.load(() => Promise.resolve({ items: [{ postId: 'p1' }] }));
            always.setPage(2);
            await always.load(() => Promise.resolve({ items: [{ postId: 'p2' }] }));

            const never = new FeedState((i: any) => i.postId, { clearStrategy: 'never' });
            await never.load(() => Promise.resolve({ items: [{ postId: 'p1' }] }));
            await never.load(() => Promise.resolve({ items: [{ postId: 'p2' }] }));

            return {
                always: always.items.map((i: any) => i.postId),
                never: never.items.map((i: any) => i.postId),
            };
        });

        expect(result.always).toEqual(['p2']);
        expect(result.never).toEqual(['p1', 'p2']);
    });

    test('refresh clears the registry and returns to page 1', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId, {
                itemsPerPage: 2,
                clearStrategy: 'never',
            });

            await feed.load(() => Promise.resolve({ items: [{ postId: 'p1' }, { postId: 'p2' }] }));
            feed.setPage(3);

            let seenParams = '';
            await feed.load(
                (params: URLSearchParams) => {
                    seenParams = params.toString();
                    return Promise.resolve({ items: [{ postId: 'fresh' }] });
                },
                { refresh: true }
            );

            return { ids: feed.items.map((i: any) => i.postId), seenParams };
        });

        expect(result.ids).toEqual(['fresh']);
        // refresh resets paging before the request goes out.
        expect(result.seenParams).toContain('currentPage=1');
    });
});

test.describe('FeedState -- error handling', () => {

    test('an axios-shaped failure is recorded and mirrored to commonStore', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState, store } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            store.commonStore.setServerError(null);

            await feed.load(() =>
                Promise.reject({
                    response: {
                        status: 404,
                        statusText: 'Not Found',
                        data: { message: 'No such feed' },
                    },
                })
            );

            return {
                feedError: feed.error,
                commonError: store.commonStore.error,
                loading: feed.loadingInitial,
                items: feed.items.length,
            };
        });

        expect(result.feedError.statusCode).toBe(404);
        expect(result.feedError.message).toBe('No such feed');
        // commonStore.setServerError existed but had zero call sites before this.
        expect(result.commonError.statusCode).toBe(404);
        expect(result.loading).toBe(false);
        expect(result.items).toBe(0);
    });

    test('a non-http failure still produces a ServerError rather than rejecting', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            let rejected = false;
            await feed
                .load(() => Promise.reject(new Error('network down')))
                .catch(() => {
                    rejected = true;
                });

            return { rejected, error: feed.error, loading: feed.loadingInitial };
        });

        // The point of the change: a failed feed no longer produces an unhandled
        // rejection, it produces observable state.
        expect(result.rejected).toBe(false);
        expect(result.error.statusCode).toBe(0);
        expect(result.error.message).toBe('network down');
        expect(result.loading).toBe(false);
    });

    test('error details fall back to statusText and carry a string body through', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;

            // No `message` on the body -> falls back to statusText.
            const noMessage = new FeedState((i: any) => i.postId);
            await noMessage.load(() =>
                Promise.reject({ response: { status: 500, statusText: 'Server Error', data: {} } })
            );

            // A plain-text error body is preserved rather than JSON-stringified.
            const textBody = new FeedState((i: any) => i.postId);
            await textBody.load(() =>
                Promise.reject({ response: { status: 403, statusText: 'Forbidden', data: 'nope' } })
            );

            // Neither a body message nor a statusText -> generic fallback.
            const bare = new FeedState((i: any) => i.postId);
            await bare.load(() => Promise.reject({ response: { status: 502 } }));

            return { noMessage: noMessage.error, textBody: textBody.error, bare: bare.error };
        });

        expect(result.noMessage.statusCode).toBe(500);
        expect(result.noMessage.message).toBe('Server Error');

        expect(result.textBody.statusCode).toBe(403);
        expect(result.textBody.details).toBe('nope');

        expect(result.bare.statusCode).toBe(502);
        expect(result.bare.message).toBe('Request failed');
    });

    test('a later successful load clears the previous error', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState } = (window as any).__alsaqrTest;
            const feed = new FeedState((i: any) => i.postId);

            await feed.load(() => Promise.reject(new Error('transient')));
            const afterFailure = feed.error?.message;

            await feed.load(() => Promise.resolve({ items: [{ postId: 'p1' }] }));

            return { afterFailure, afterRecovery: feed.error ?? null, ids: feed.items.map((i: any) => i.postId) };
        });

        expect(result.afterFailure).toBe('transient');
        expect(result.afterRecovery).toBeNull();
        expect(result.ids).toEqual(['p1']);
    });
});

test.describe('FeedState -- MobX integration', () => {

    test('items and loadingInitial are observable and notify reactions', async ({ page }) => {
        const result = await page.evaluate(async () => {
            const { FeedState, reaction } = (window as any).__alsaqrTest;

            const feed = new FeedState((i: any) => i.postId);
            const seenCounts: number[] = [];
            const seenLoading: boolean[] = [];

            const disposeItems = reaction(() => feed.items.length, (n: number) => seenCounts.push(n));
            const disposeLoading = reaction(
                () => feed.loadingInitial,
                (v: boolean) => seenLoading.push(v)
            );

            await feed.load(() =>
                Promise.resolve({ items: [{ postId: 'p1' }, { postId: 'p2' }] })
            );

            disposeItems();
            disposeLoading();

            return { seenCounts, seenLoading };
        });

        expect(result.seenCounts).toContain(2);
        expect(result.seenLoading).toEqual([true, false]);
    });

    test('the migrated stores all expose their feed surface through FeedState', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { store } = (window as any).__alsaqrTest;

            // storeName -> composed FeedState fields, the collection getters they
            // back, and the loading flags each store exposes. searchStore has
            // always had per-feed flags rather than a single loadingInitial.
            const migrated: Record<
                string,
                { feeds: string[]; collections: string[]; loadingFlags: string[] }
            > = {
                feedStore: { feeds: ['feed'], collections: ['posts'], loadingFlags: ['loadingInitial'] },
                bookmarkFeedStore: {
                    feeds: ['feed'], collections: ['bookmarkedPosts'], loadingFlags: ['loadingInitial'],
                },
                commentFeedStore: {
                    feeds: ['feed'], collections: ['comments'], loadingFlags: ['loadingInitial'],
                },
                communityFeedStore: {
                    feeds: ['feed'], collections: ['communities'], loadingFlags: ['loadingInitial'],
                },
                communityDiscussionFeedStore: {
                    feeds: ['feed'], collections: ['communityDiscussions'], loadingFlags: ['loadingInitial'],
                },
                listFeedStore: {
                    feeds: ['feed', 'savedListItemsFeed'],
                    collections: ['lists', 'savedListItems'],
                    loadingFlags: ['loadingInitial', 'loadingListItems'],
                },
                messageStore: {
                    feeds: ['feed', 'historyFeed'],
                    collections: ['directMessages', 'directMessageHistory'],
                    loadingFlags: ['loadingInitial', 'loadingHistory'],
                },
                notificationStore: {
                    feeds: ['feed'], collections: ['notifications'], loadingFlags: ['loadingInitial'],
                },
                searchStore: {
                    feeds: ['usersFeed', 'postsFeed'],
                    collections: ['searchedUsers', 'searchedPosts'],
                    loadingFlags: ['searchUsersLoadingInitial', 'searchPostsLoadingInitial'],
                },
                exploreStore: {
                    feeds: ['postsFeed', 'exploreNewsFeed', 'ajNewsFeed', 'sabqNewsFeed'],
                    collections: ['explorePosts', 'exploreNews', 'ajNews', 'sabqNews'],
                    loadingFlags: ['loadingInitial'],
                },
            };

            return Object.entries(migrated).map(([storeName, { feeds, collections, loadingFlags }]) => {
                const target = (store as any)[storeName];

                return {
                    storeName,
                    hasFeeds: feeds.every((f) => !!target[f]),
                    collectionsAreArrays: collections.every((c) => Array.isArray(target[c])),
                    loadingIsBoolean: loadingFlags.every((f) => typeof target[f] === 'boolean'),
                    paramsHavePaging: feeds.every(
                        (f) =>
                            target[f].axiosParams.has('currentPage') &&
                            target[f].axiosParams.has('itemsPerPage')
                    ),
                };
            });
        });

        expect(result).toHaveLength(10);
        for (const migratedStore of result) {
            expect(migratedStore, `${migratedStore.storeName} composes a FeedState`).toMatchObject({
                hasFeeds: true,
                collectionsAreArrays: true,
                loadingIsBoolean: true,
                paramsHavePaging: true,
            });
        }
    });

    test('notificationStore keeps its all=true static param after migration', async ({ page }) => {
        const params = await page.evaluate(() => {
            const { store } = (window as any).__alsaqrTest;
            return store.notificationStore.feed.axiosParams.toString();
        });

        expect(params).toContain('all=true');
    });

    test('listFeedStore and messageStore page their two feeds independently', async ({ page }) => {
        const result = await page.evaluate(() => {
            const { store } = (window as any).__alsaqrTest;

            store.listFeedStore.feed.setPage(2);
            store.listFeedStore.savedListItemsFeed.setPage(5);

            store.messageStore.feed.setPagination({
                currentPage: 1, itemsPerPage: 10, totalItems: 10, totalPages: 1,
            });
            store.messageStore.historyFeed.setPagination({
                currentPage: 2, itemsPerPage: 25, totalItems: 50, totalPages: 2,
            });

            const out = {
                lists: store.listFeedStore.pagingParams.currentPage,
                savedItems: store.listFeedStore.savedListItemsPagingParams.currentPage,
                messages: store.messageStore.pagination.currentPage,
                history: store.messageStore.historyPagination.currentPage,
            };

            store.listFeedStore.feed.reset();
            store.listFeedStore.savedListItemsFeed.reset();
            store.messageStore.feed.reset();
            store.messageStore.historyFeed.reset();

            return out;
        });

        expect(result.lists).toBe(2);
        expect(result.savedItems).toBe(5);
        // These used to share one `pagination` field, so loading the thread list
        // clobbered the open thread's pagination.
        expect(result.messages).toBe(1);
        expect(result.history).toBe(2);
    });
});
