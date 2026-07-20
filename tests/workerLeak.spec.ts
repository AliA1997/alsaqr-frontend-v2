import { test, expect, Page } from '@playwright/test';
import { navigateAndTestNavLogo } from './reusableFunctions';

// Regression guard for the worker fork bomb.
//
// The worker bundles import `agent`, which used to import @stores/index, which
// imports modalStore, which imports prefetchModalData — whose module scope
// constructed a Worker. Every worker therefore spawned another worker on
// startup, ~2/sec forever. Each new worker context also booted Vite's HMR client
// and opened a WebSocket, which is where the "WebSocket failed to connect"
// console spam came from, and the unbounded workers eventually killed the tab.
//
// The app legitimately owns at most three workers (user data, widget data, modal
// data), so anything beyond a small ceiling means the chain is back.
const MAX_EXPECTED_WORKERS = 6;
const IDLE_MS = 30_000;

const countWorkers = (page: Page) => {
    let workers = 0;
    page.on('worker', () => { workers++; });
    return () => workers;
};

test('the app does not spawn workers in a loop while idle', async ({ page }) => {
    test.slow();

    const workerCount = countWorkers(page);

    await navigateAndTestNavLogo(page);
    await page.waitForTimeout(IDLE_MS);

    expect(workerCount()).toBeLessThanOrEqual(MAX_EXPECTED_WORKERS);
});

test('an idle session does not open websockets in a loop', async ({ page }) => {
    test.slow();

    // Vite's dev HMR client opens exactly one socket per document. A runaway
    // count means new worker contexts are being created behind our back.
    let sockets = 0;
    page.on('websocket', () => { sockets++; });

    await navigateAndTestNavLogo(page);
    await page.waitForTimeout(IDLE_MS);

    expect(sockets).toBeLessThanOrEqual(MAX_EXPECTED_WORKERS);
});
