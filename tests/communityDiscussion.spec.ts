
import { test, expect } from '@playwright/test';
import { 
    navigateAndTestNavLogo, 
    testIfCardsAreLoaded, 
    navigateToSpecificPage,
    testCommunityId,
    openModalAfterClickButton,
    checkIfElementIsDisplayed,
    simulateTextInputChanges
} from './reusableFunctions';

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page);
})

test("test rendering community discussions",async ({ page }) => {
    await navigateToSpecificPage(page, `/communities/${testCommunityId}`);

    await testIfCardsAreLoaded(
        page,
        'communitydiscussion'
    );

});

test("test navigating to community discussion",async ({ page }) => {
    await navigateToSpecificPage(page, `/communities/${testCommunityId}`);

    // Check community discussion for clicked community
    await testIfCardsAreLoaded(
        page,
        'communitydiscussion'
    );
    
    const link = page.getByTestId(`communitydiscussionlink`).first();

    await expect(link).toBeVisible();
    
    await link.click();

    await page.waitForTimeout(20_000);

    const communityDiscussionMsgContainer = page.getByTestId('communitydiscussionmessagecontainer').first();
    
    await expect(communityDiscussionMsgContainer).toBeVisible();
});

test("test creating a community discussion, and refresh to see if it exists.",async ({ page }) => {
        test.setTimeout(150_000)
        await navigateToSpecificPage(page, `/communities/${testCommunityId}`);
    
        await openModalAfterClickButton(page, 'createcommunitydiscussionbutton');
        
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
