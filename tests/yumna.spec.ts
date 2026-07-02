import { test, expect, Page, Route } from '@playwright/test';
import dotenv from 'dotenv';
import { navigateAndTestNavLogo, navigateToSpecificPage } from './reusableFunctions';

dotenv.config({ path: '.env.local' });

const DAILY_LIMIT = 30;

const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? '';
const SUPABASE_STORAGE_KEY = SUPABASE_URL
    ? `sb-${new URL(SUPABASE_URL).hostname.split('.')[0]}-auth-token`
    : '';

const MOCK_USER = {
    id: 'user_yumna-playwright-test',
    email: 'yumna.playwright@test.com',
    username: 'yumnaplaywright',
    avatar: '',
    bgThumbnail: '',
    bio: '',
    countryOfOrigin: 'UAE',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    following: [],
    followingCount: 0,
    followers: [],
    followerCount: 0,
    bookmarks: [],
    reposts: [],
    likedPosts: [],
    isCompleted: true,
    verified: false
};

// The api lives on another origin, so mocked responses need CORS headers
// (and preflight OPTIONS requests need to be answered) to reach axios.
const CORS_HEADERS = {
    'access-control-allow-origin': '*',
    'access-control-allow-methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'access-control-allow-headers': '*'
};

const fulfillJson = async (route: Route, status: number, body: object) => {
    if (route.request().method() === 'OPTIONS') {
        await route.fulfill({ status: 204, headers: CORS_HEADERS });
        return;
    }

    await route.fulfill({
        status,
        contentType: 'application/json',
        headers: CORS_HEADERS,
        body: JSON.stringify(body)
    });
};

const mockDailyUse = async (page: Page, numberOfRequests: number) => {
    await page.route('**/api/subscriptions/dailyUse*', (route) =>
        fulfillJson(route, 200, {
            subscriptionName: 'Basic',
            numberOfRequests,
            dailyRequestLimit: DAILY_LIMIT
        })
    );
};

const mockPromptResponse = async (page: Page, numberOfRequests: number, response?: string) => {
    await page.route('**/api/yumna/prompt', (route) =>
        fulfillJson(route, 200, {
            response: response ?? 'Hello! I am Yumna, your personal AI assistant.',
            dailyUse: {
                id: 'subscription_daily_use_1',
                userId: 'user_c1191483-90fb-4fc1-b094-524b2e05a47a',
                date: new Date().toISOString().split('T')[0],
                numberOfRequests
            }
        })
    );
};

const mockPromptOverLimit = async (page: Page) => {
    await page.route('**/api/yumna/prompt', (route) =>
        fulfillJson(route, 400, { error: 'Over your daily usage limit.' })
    );
};

// Seeds a supabase session in localStorage and mocks the session check endpoints
// so the app treats the browser as a logged in user.
const mockLoggedInSession = async (page: Page) => {
    const session = {
        access_token: 'playwright-access-token',
        token_type: 'bearer',
        expires_in: 3600 * 24 * 365,
        expires_at: Math.floor(Date.now() / 1000) + 3600 * 24 * 365,
        refresh_token: 'playwright-refresh-token',
        user: {
            id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
            aud: 'authenticated',
            role: 'authenticated',
            email: MOCK_USER.email,
            app_metadata: {},
            user_metadata: {},
            created_at: new Date().toISOString()
        }
    };

    await page.addInitScript(
        ([key, value]) => window.localStorage.setItem(key, value),
        [SUPABASE_STORAGE_KEY, JSON.stringify(session)] as [string, string]
    );
    await page.route('**/auth/v1/token*', (route) => fulfillJson(route, 200, session));
    await page.route('**/auth/v1/user*', (route) => fulfillJson(route, 200, session.user));
    await page.route('**/api/Session/signin*', (route) => fulfillJson(route, 200, {}));
    await page.route('**/api/Session/check*', (route) => fulfillJson(route, 200, { result: MOCK_USER }));
};

test.beforeEach(async ({ page }) => {
    test.slow();
    await navigateAndTestNavLogo(page);
});

// Pass tests --------------------------------------------------------------

test('renders yumna chatbot with avatar header and empty state chat bubble', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await expect(page.getByTestId('yumnaavatar')).toBeVisible();
    await expect(page.getByTestId('yumnaemptystate')).toBeVisible();
    await expect(page.getByTestId('yumnadailyuse')).toContainText(`0/${DAILY_LIMIT}`);
});

test('user with no prompts today prompts yumna and gets a response with daily use updated', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await mockPromptResponse(page, 1);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await page.getByTestId('yumnainput').fill('As-salamu alaykum Yumna!');
    await page.getByTestId('yumnasubmitbutton').click();

    await page.waitForTimeout(5_000);

    const messages = page.getByTestId('yumnamessagecard');
    await expect(messages).toHaveCount(2);
    await expect(page.getByTestId('yumnamessagetext').last()).toContainText('Yumna, your personal AI assistant');
    await expect(page.getByTestId('yumnamessagedate').last()).toBeVisible();
    await expect(page.getByTestId('yumnadailyuse')).toContainText(`1/${DAILY_LIMIT}`);
});

test('user with 20 prompts today gets a response but sees warning that requests are about to run out', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,20);
    await mockPromptResponse(page, 21);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await page.getByTestId('yumnainput').fill('What should I study today?');
    await page.getByTestId('yumnasubmitbutton').click();

    await page.waitForTimeout(5_000);

    await expect(page.getByTestId('yumnamessagecard')).toHaveCount(2);
    await expect(page.getByTestId('yumnadailyuse')).toContainText(`21/${DAILY_LIMIT}`);
    // 9 requests left (< 10), so the warning alert displays.
    await expect(page.getByTestId('warningalert')).toBeVisible();
});

test('prompt under or equal to 256 characters is indicated by the character count on the input', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    const promptText = 'a'.repeat(100);
    await page.getByTestId('yumnainput').fill(promptText);

    await expect(page.getByTestId('yumnacharcount')).toHaveText('100/256');
    await expect(page.getByTestId('yumnasubmitbutton')).toBeEnabled();
});

test('yumna chatbot is responsive across mobile, tablet, and desktop', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    const viewports = [
        { width: 375, height: 667 },   // mobile
        { width: 768, height: 1024 },  // tablet
        { width: 1280, height: 800 },  // desktop
    ];

    for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await expect(page.getByTestId('yumnaavatar')).toBeVisible();
        await expect(page.getByTestId('yumnainput')).toBeVisible();
        await expect(page.getByTestId('yumnasubmitbutton')).toBeVisible();
    }
});

// Fail tests --------------------------------------------------------------

test('user at the 30 prompt daily limit gets a danger alert, and the pro tier modal when prompting again', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,DAILY_LIMIT);
    await mockPromptOverLimit(page);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await page.getByTestId('yumnainput').fill('One more prompt please');
    await page.getByTestId('yumnasubmitbutton').click();
    await page.waitForTimeout(3_000);

    // First attempt over the limit: danger alert.
    await expect(page.getByTestId('dangeralert')).toBeVisible();
    await expect(page.getByTestId('yumnamessagecard')).toHaveCount(0);

    // Prompting again after the danger alert: pro subscription tier modal.
    await page.getByTestId('yumnasubmitbutton').click();
    await page.waitForTimeout(3_000);

    await expect(page.getByTestId('prosubscriptionmodal')).toBeVisible();
    await expect(page.getByTestId('prosubscriptionprice')).toContainText('TBD');
    const subscribeButton = page.getByTestId('prosubscribebutton');
    await expect(subscribeButton).toBeDisabled();
    await expect(subscribeButton).toHaveText('TBD');
});

test('cannot submit a prompt over 256 characters', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await page.getByTestId('yumnainput').fill('a'.repeat(300));

    await expect(page.getByTestId('yumnacharcount')).toHaveText('300/256');
    await expect(page.getByTestId('yumnasubmitbutton')).toBeDisabled();
});

test('cannot submit an empty prompt', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await expect(page.getByTestId('yumnainput')).toHaveValue('');
    await expect(page.getByTestId('yumnasubmitbutton')).toBeDisabled();
});

test('cannot submit files or images to the yumna chatbot', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,0);
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await expect(page.getByTestId('yumnainput')).toBeVisible();
    await expect(page.locator('input[type="file"]')).toHaveCount(0);
});

test('settings usage page displays daily use compared to the limit', async ({ page }) => {
    await mockLoggedInSession(page);
    await mockDailyUse(page,5);
    await navigateToSpecificPage(page, '/settings');
    await page.waitForTimeout(10_000);

    await page.getByTestId('usage').click();
    await page.waitForTimeout(3_000);

    await expect(page.getByTestId('usagedailyuse')).toContainText(`(5/${DAILY_LIMIT})`);
    await expect(page.getByTestId('usageupgradebutton')).toBeVisible();
});

test('user not logged in gets a login modal on the yumna chatbot', async ({ page }) => {
    await mockDailyUse(page,0);
    await page.context().clearCookies();
    await navigateToSpecificPage(page, '/yumna');
    await page.waitForTimeout(10_000);

    await expect(page.getByText('Sign in with Google')).toBeVisible();
});
