import { test, expect } from '@playwright/test';
import {
    checkIfElementIsDisplayed,
    navigateAndTestNavLogo,
    navigateToProfilePage,
} from './reusableFunctions';

// Coverage for the ported profile-collection tabs:
// Communities, Community Discussions, Meetup Groups, Meetup Events, Zook Selling Products.
// Each tab is asserted to render, then to show either a populated card or its empty-state title.

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page);
});

// Clicks a tab, then verifies either the entity card (populated) or the empty-state text.
const assertTabPopulatedOrEmpty = async (
    page: any,
    tabTestId: string,
    cardTestId: string,
    emptyText: string
) => {
    const tab = await checkIfElementIsDisplayed(page, tabTestId);
    await tab.click();
    await page.waitForTimeout(30_000);

    const populatedOrEmpty = page
        .getByTestId(cardTestId)
        .first()
        .or(page.getByText(emptyText).first());
    await expect(populatedOrEmpty).toBeVisible();
};

test('test profile collection tabs render', async ({ page }) => {
    await navigateToProfilePage(page);
    await page.waitForLoadState('domcontentloaded');

    await checkIfElementIsDisplayed(page, 'communitiestab');
    await checkIfElementIsDisplayed(page, 'discussionstab');
    await checkIfElementIsDisplayed(page, 'groupstab');
    await checkIfElementIsDisplayed(page, 'eventstab');
    await checkIfElementIsDisplayed(page, 'sellingproductstab');
});

test('test profile communities tab', async ({ page }) => {
    await navigateToProfilePage(page);
    await assertTabPopulatedOrEmpty(
        page,
        'communitiestab',
        'communitycard',
        'Not part of any communities'
    );
});

test('test profile community discussions tab', async ({ page }) => {
    await navigateToProfilePage(page);
    await assertTabPopulatedOrEmpty(
        page,
        'discussionstab',
        'communitydiscussioncard',
        'Not part of any community discussions'
    );
});

test('test profile meetup groups tab', async ({ page }) => {
    await navigateToProfilePage(page);
    await assertTabPopulatedOrEmpty(
        page,
        'groupstab',
        'groupcard',
        'Not a member of any group yet'
    );
});

test('test profile meetup events tab', async ({ page }) => {
    await navigateToProfilePage(page);
    await assertTabPopulatedOrEmpty(
        page,
        'eventstab',
        'eventcard',
        'No events attended yet'
    );
});

test('test profile zook selling products tab', async ({ page }) => {
    await navigateToProfilePage(page);
    await assertTabPopulatedOrEmpty(
        page,
        'sellingproductstab',
        'productcard',
        'You are not selling anything yet'
    );
});
