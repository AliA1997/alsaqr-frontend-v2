import { expect, Locator, Page } from "@playwright/test";

export const testCommunityId = "community_d62a256a-925d-4f61-8ea2-fbaf6a335529";
export const testUser = "devmtnali"

export const navigateAndTestNavLogo = async (page: any) => {
    if (!page.isClosed()) {
        await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/`);
    }
    const navLogo = await page.getByTestId("navlogo");
    await expect(navLogo).toBeVisible()
}

export const navigateToSpecificPage = async (page: Page, route: string) => {
    if (!page.isClosed()) {
        await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}${route}`);
        await page.waitForLoadState('domcontentloaded')
    }
}

export const navigateToTabPage = async (page: any, link: string) => {
    const navlink = page.getByTestId(link);
    await navlink.click();
    await page.waitForTimeout(10_000);
}


export const testDisplayingPosts = async (page: Page): Promise<Locator[]> => {
    await page.waitForTimeout(40_000);

    const postCard = page.getByTestId("postcard").first();
    const postUsernameLink = page.getByTestId("usernamelink").first();
    const postText = page.getByTestId("postcardtext").first();

    await expect(postCard).toBeVisible();
    await expect(postUsernameLink).toBeVisible();
    await expect(postText).toBeVisible();

    return [postCard, postUsernameLink, postText];
};

export const testLoadingCardsBasedOnEntity = async (
    page: Page, 
    expectLinkSuffix: string,
    entityCardPrefix: string,
    noLink?: boolean
): Promise<void> => {
    await page.waitForTimeout(30_000);

    const actualUrl = page.url();
    expect(actualUrl.includes(expectLinkSuffix)).toBeTruthy();

    const card = page.getByTestId(`${entityCardPrefix}card`).last();
    const cardText = page.getByTestId(`${entityCardPrefix}text`).last();

    await expect(card).toBeVisible();
    await expect(cardText).toBeVisible();
    
    if(noLink) {
        const link = page.getByTestId(`${entityCardPrefix}link`).last();
        await expect(link).toBeVisible();
    }
}

export const clickAndNavigateWithLink = async (
    page: Page,
    navLink: Locator
): Promise<void> => {
    await navLink.dblclick();

    await page.waitForTimeout(30_000);
}

export const testIfCardsAreLoaded = async (page: Page, entityCardPrefix: string): Promise<Locator> => {
    await page.waitForTimeout(30_000);
    
    const card = page.getByTestId(`${entityCardPrefix}card`).first();
    const cardText = page.getByTestId(`${entityCardPrefix}text`).first();

    await expect(card).toBeVisible();
    await expect(cardText).toBeVisible();

    return card;
}

export const openCommentDropdownAndLoadingComments = async (page: Page) => {
    await page.waitForTimeout(2_000);

    const commentIconButton = page.getByTestId("commentbutton").first();

    await expect(commentIconButton).toBeVisible();

    await commentIconButton.click(),

    await page.waitForTimeout(10_000);

    const commentBox = page.getByTestId('commentbox').first();
    await expect(commentBox).toBeVisible();
}

export const simulatePostBoxSubmit = async (page: Page, inputText?: string) => {
    const input = page.getByTestId("postboxinput");
    const submitButton = page.getByTestId("postboxbutton");

    await expect(input).toBeVisible();
    await expect(submitButton).toBeVisible();

    const actualInputText = inputText ?? "Test text from playwright test.";
    input.fill(actualInputText);

    await Promise.all([
        submitButton.dblclick(),
        page.waitForLoadState('networkidle')
    ]);

    const postText = page.getByTestId("postcardtext").first();

    await expect(postText.textContent).toEqual(actualInputText);
}

export const simulateCommentSubmit = async (page: Page, inputId: string, buttonId: string, inputText?: string) => {
    const input = page.getByTestId(inputId);
    const submitButton = page.getByTestId(buttonId);

    await expect(input).toBeVisible();
    await expect(submitButton).toBeVisible();

    const actualInputText = inputText ?? "Test text from playwright test.";
    input.fill(actualInputText);

    await Promise.all([
        submitButton.dblclick(),
        page.waitForLoadState('networkidle')
    ]);

    const commentText = page.getByTestId("commentcardtext").first();

    await expect(commentText.textContent).toEqual(actualInputText);
}

export const checkIfUserLoggedInTheUI = async (page: Page) =>  {
    page.waitForTimeout(10_000);
    const loggedInUserButton = page.getByTestId('loggedinuserbutton').first();
    
    await expect(loggedInUserButton).toBeVisible();

    return loggedInUserButton;
}

export const navigateToProfilePage = async (page: Page) => {
    await checkIfUserLoggedInTheUI(page);
    if (!page.isClosed()) {
        await page.goto(`${process.env.VITE_PUBLIC_BASE_URL}/users/${testUser}`);

        await page.waitForTimeout(30_000);

        const userHeaderUsername = page.getByTestId('userheaderusername').first();
        await expect(userHeaderUsername).toBeVisible();
    }
}

export const openModalAfterClickButton = async (page: Page, modalButtonId: string) => {
    const modalButton = page.getByTestId(modalButtonId);

     await expect(modalButton).toBeVisible();

     await modalButton.click();
}

export const checkIfElementIsDisplayed = async (page: Page, testId: string) => {
    const uiElement = page.getByTestId(testId);

    await expect(uiElement).toBeVisible();

    return uiElement;
}

export const simulateTextInputChanges = async (inputs: { elem: Locator, textToFill: string }[]) => {
     for(let i = 0; i < inputs.length; i++){
        const inpt = inputs[i];
        await inpt.elem.fill(inpt.textToFill);
     }
}
