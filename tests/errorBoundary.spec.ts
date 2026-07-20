import { test, expect } from '@playwright/test';
import { navigateAndTestNavLogo } from './reusableFunctions';

// react-router renders its own unstyled fallback (branded "Unexpected Application
// Error!") for anything thrown inside a route element, and it gets there before
// any React boundary mounted above RouterProvider. These tests lock in that our
// own boundary owns that UI instead.
const REACT_ROUTER_DEFAULT_FALLBACK = 'Unexpected Application Error';

test.beforeEach(async ({ page }) => {
    test.slow();
    await page.context().clearCookies();
});

test('a failure in the layout shell renders our error boundary, not the react-router default', async ({ page }) => {
    // The Sidebar is lazily imported by PageContainer, which sits outside the
    // route-level boundary — so this failure lands on the router errorElement.
    await page.route('**/layout/Sidebar.tsx*', route => route.abort());

    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);

    const boundary = page.getByTestId('errorboundary');
    await expect(boundary).toBeVisible({ timeout: 30_000 });
    await expect(page.getByTestId('errorboundarytitle')).toContainText('This page failed to load');
    await expect(page.getByTestId('errorboundaryreload')).toBeVisible();

    await expect(page.locator('body')).not.toContainText(REACT_ROUTER_DEFAULT_FALLBACK);
});

test('the error boundary surfaces the underlying error during development', async ({ page }) => {
    await page.route('**/layout/Sidebar.tsx*', route => route.abort());

    await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);

    await expect(page.getByTestId('errorboundary')).toBeVisible({ timeout: 30_000 });

    // Dev builds show the real error so the failure is diagnosable in place.
    await expect(page.getByTestId('errorboundarymessage')).toContainText('Sidebar');
});

test('a healthy page renders no error boundary', async ({ page }) => {
    await navigateAndTestNavLogo(page);

    await expect(page.getByTestId('errorboundary')).toHaveCount(0);
});
