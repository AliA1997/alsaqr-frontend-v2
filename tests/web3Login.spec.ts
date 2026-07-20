import { test, expect, Page } from '@playwright/test';
import { navigateAndTestNavLogo } from './reusableFunctions';

const TEST_WALLET_ADDRESS = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';

const testWeb3User = {
    id: 'user_web3_playwright',
    username: 'web3playwrightuser',
    email: '',
    walletAddress: TEST_WALLET_ADDRESS,
    avatar: '',
    bgThumbnail: '',
    bio: '',
    countryOfOrigin: '',
    hobbies: [],
    following: [],
    followingCount: 0,
    followers: [],
    followerCount: 0,
    bookmarks: [],
    reposts: [],
    likedPosts: [],
    isCompleted: true,
    verified: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
};

// Injects a minimal EIP-1193 provider so the wagmi injected connector can
// connect without a real wallet extension.
const injectFakeWalletProvider = async (page: Page) => {
    await page.addInitScript((address: string) => {
        Object.assign(window, {
            ethereum: {
                isMetaMask: true,
                request: async ({ method }: { method: string }) => {
                    switch (method) {
                        case 'eth_requestAccounts':
                        case 'eth_accounts':
                            return [address];
                        case 'eth_chainId':
                            return '0x1';
                        default:
                            return null;
                    }
                },
                on: () => { },
                removeListener: () => { },
            },
        });
    }, TEST_WALLET_ADDRESS);
};

const mockWeb3AuthEndpoints = async (page: Page) => {
    await page.route('**/api/auth/signin', route =>
        route.fulfill({ json: {} }));
    await page.route('**/api/Session/check*', route =>
        route.fulfill({ json: { result: testWeb3User } }));
};

// Opens the login modal from the sidebar "More" dropdown, signing out first
// when a session user is already present (test mode auto-logs the test user).
const openLoginModal = async (page: Page) => {
    await page.getByTestId('more').click();

    const signOut = page.getByTestId('sign out');
    if (await signOut.isVisible().catch(() => false)) {
        await signOut.click();
        await page.waitForTimeout(2_000);
    }

    const signIn = page.getByTestId('sign in');
    if (!(await signIn.isVisible().catch(() => false)))
        await page.getByTestId('more').click();

    await expect(signIn).toBeVisible();
    await signIn.click();
};

test.beforeEach(async ({ page }) => {
    test.slow();
    await page.context().clearCookies();
    await navigateAndTestNavLogo(page);
});

test('open the login modal, login with web3 button logs the user in', async ({ page }) => {
    await injectFakeWalletProvider(page);
    await mockWeb3AuthEndpoints(page);
    await page.reload();
    await navigateAndTestNavLogo(page);

    await openLoginModal(page);

    const web3Button = page.getByTestId('loginwithweb3button');
    await expect(web3Button).toBeVisible();
    await web3Button.click();

    const loggedInUserButton = page.getByTestId('loggedinuserbutton').first();
    await expect(loggedInUserButton).toBeVisible({ timeout: 30_000 });
});

test('login with web3 without a wallet installed displays a dangeralert', async ({ page }) => {
    await openLoginModal(page);

    const web3Button = page.getByTestId('loginwithweb3button');
    await expect(web3Button).toBeVisible();
    await web3Button.click();

    const dangerAlert = page.getByTestId('dangeralert');
    await expect(dangerAlert).toBeVisible();
    await expect(dangerAlert).toContainText('Install MetaMask');

    // No wallet means no session user was created.
    const loggedInUserButton = page.getByTestId('loggedinuserbutton');
    await expect(loggedInUserButton).toHaveCount(0);
});
