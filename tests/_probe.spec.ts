import { test, expect } from '@playwright/test';

test('probe auth + api fire', async ({ page }) => {
  const apiHits: string[] = [];
  page.on('request', (r) => {
    const u = r.url();
    if (u.includes('/api/Communities') || u.includes('/api/Lists')) apiHits.push(`${r.method()} ${u}`);
  });

  await page.goto('http://localhost:5173/communities');
  await page.waitForTimeout(15_000);

  const cookies = await page.context().cookies();
  console.log('PROBE userCookie:', cookies.find((c) => c.name === 'user') ? 'yes' : 'no');
  console.log('PROBE loggedInBtn:', await page.getByTestId('loggedinuserbutton').first().isVisible().catch(() => false));
  console.log('PROBE apiHits:', JSON.stringify(apiHits, null, 2));
});
