
import { test, expect } from '@playwright/test';
import { 
    navigateToTabPage,
    navigateAndTestNavLogo,
    testIfCardsAreLoaded,
    checkIfElementIsDisplayed
} from './reusableFunctions';

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page)
});

test("test rendering messages", async ({ page }) => {
    await navigateToTabPage(page, 'messages');

    await testIfCardsAreLoaded(page, 'messagehistory');
});

test("test creating a messages", async ({ page }) => {
    await navigateToTabPage(page, 'messages');
    
    const messageHistoryCard = await checkIfElementIsDisplayed(page, "messagehistorycard");
    const messageInput = await checkIfElementIsDisplayed(page, 'messageinput');
    const submitMessage = await checkIfElementIsDisplayed(page, 'messagesubmitbutton');
    await messageHistoryCard.click();

    await messageInput.fill("Test message");
    
    await submitMessage.click();

    await page.waitForTimeout(5_000);
}); 

