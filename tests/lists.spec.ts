
import { test, expect } from '@playwright/test';
import { 
    checkIfElementIsDisplayed,
    navigateAndTestNavLogo,
    navigateToSpecificPage,
    navigateToTabPage,
    openModalAfterClickButton,
    simulateTextInputChanges,
    testLoadingCardsBasedOnEntity
} from './reusableFunctions';


test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page)
});

test("test rendering lists", async ({ page }) => {
    await navigateToTabPage(page, 'lists');

    await testLoadingCardsBasedOnEntity(page, 'lists', 'list');
});

test("test navigating to a list", async ({ page }) => {
    await navigateToTabPage(page, 'lists');

    await testLoadingCardsBasedOnEntity(page, 'lists', 'list');

    const textLink = page.getByTestId('listtext').first();
    await textLink.click();

    await page.waitForTimeout(20_000);
    const savedListFeed = page.getByTestId('savedlistfeed').first();
    await expect(savedListFeed).toBeVisible();
});

test("test creating a list", async ({ page }) => {
        test.setTimeout(150_000)
        await navigateToSpecificPage(page, '/lists');
    
        await openModalAfterClickButton(page, 'createlistbutton');
        
        const nameInput = await checkIfElementIsDisplayed(page, 'nameinput');
        const radioBoxToClick = await checkIfElementIsDisplayed(page, 'privateradiobox');
        const multiSelectInput = await checkIfElementIsDisplayed(page, 'multiselectinput');
        await simulateTextInputChanges([
            {
                elem: nameInput,
                textToFill: "Test Name from Playwright"
            },
            {
                elem: multiSelectInput,
                textToFill: "tech"
            }
        ]);
        const multiSelectTagToClick = await checkIfElementIsDisplayed(page, 'multiselectfilteredlabel');
    
        await multiSelectTagToClick.click();
        await radioBoxToClick.click();
    
        const nextButton = await checkIfElementIsDisplayed(page, 'modalnextbutton');
        await nextButton.click();
        
        const reviewButton = await checkIfElementIsDisplayed(page, 'modalreviewbutton');
        await reviewButton.click();
        await checkIfElementIsDisplayed(page, 'modalreviewform');
    
        const submitButton = await checkIfElementIsDisplayed(page, 'modalsubmitbutton');
        await submitButton.click();
    
        await page.waitForTimeout(30_000);
});

