
import { test, expect } from '@playwright/test';
import { 
    checkIfElementIsDisplayed,
    navigateAndTestNavLogo,
    navigateToProfilePage,
    testIfCardsAreLoaded
} from './reusableFunctions';

test.beforeEach(async ({ page }) => {
    test.slow()
    await navigateAndTestNavLogo(page);
});

test("test rendering user profile", async ({ page }) => {
    await navigateToProfilePage(page);
});

test("test navigating to user profile, and each tab.", async ({ page }) => {
    await navigateToProfilePage(page);
    await page.waitForLoadState('domcontentloaded');
    await checkIfElementIsDisplayed(page, 'recenttab');
    const repostsTab = await checkIfElementIsDisplayed(page, 'repoststab');
    await checkIfElementIsDisplayed(page, 'bookmarkstab');
    await checkIfElementIsDisplayed(page, 'repliestab'); 
    await checkIfElementIsDisplayed(page, 'likestab');
    
    await repostsTab.click();
    await testIfCardsAreLoaded(page, 'post');
        
});


