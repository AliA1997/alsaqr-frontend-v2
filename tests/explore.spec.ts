
import { test, expect } from '@playwright/test';
import { 
    checkIfElementIsDisplayed,
    navigateAndTestNavLogo,
    navigateToTabPage,
    testIfCardsAreLoaded
} from './reusableFunctions';

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page)
})

test("test rendering all explore news", async ({ page }) => {
    await navigateToTabPage(page, 'explore');

    await testIfCardsAreLoaded(page, 'explore');
});

test("test navigating to all tabs, make sure it's rendered accordingly.", async ({ page }) => {
    await navigateToTabPage(page, 'explore');
    
    await page.waitForLoadState('domcontentloaded');
    const ajTab = await checkIfElementIsDisplayed(page, 'ajtab');
    await checkIfElementIsDisplayed(page, 'argaamtab');
    await checkIfElementIsDisplayed(page, 'brtab');
    await checkIfElementIsDisplayed(page, 'ccntab');
    await checkIfElementIsDisplayed(page, 'sabqtab');
    
    await ajTab.click();
    await testIfCardsAreLoaded(page, 'explore');

});

