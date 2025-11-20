import { test, expect } from '@playwright/test';
import { 
    navigateAndTestNavLogo, 
    navigateToProfilePage, 
    openCommentDropdownAndLoadingComments, 
    testDisplayingPosts 
} from './reusableFunctions';

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page)
});


test("Test rendering of posts", async ({ page }) => {    
    await testDisplayingPosts(page);
});

test("Test navigating to a post", async ({ page }) => {
    const [examplePostCard] = await testDisplayingPosts(page);
    
    await Promise.all([
        examplePostCard.dblclick(),
        page.waitForLoadState("networkidle")
    ])

    const postTag = await page.getByTestId('posttag').first();
    await expect(postTag).toBeVisible();

    const actualPostTagText = await postTag.innerText();

    await expect(actualPostTagText).toEqual("Post");
});

test("Test navigating to a post, then comment", async ({ page }) => {
    await testDisplayingPosts(page);

    await openCommentDropdownAndLoadingComments(page);
});


test("Test navigating to profile from a post via usernamelink", async ({ page }) => {
    const [_, usernameLink] = await testDisplayingPosts(page);
    
    await usernameLink.dblclick();

    await page.waitForTimeout(30_000);

    const userHeaderUsername = page.getByTestId('userheaderusername');
    
    await expect(userHeaderUsername).toBeVisible()

});
