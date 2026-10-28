import dotenv from "dotenv";
import { test as base } from "@playwright/test";
import { AdminCustomersPage } from "../pages/AdminCustomersPage";
import { AdminLoginPage } from "../pages/AdminLoginPage";
import { AccountPage } from "../pages/AccountPage";
import { CartPage } from "../pages/CartPage";
import { HomePage } from "../pages/HomePage";
import { LoginPage } from "../pages/LoginPage";
import { ProductPage } from "../pages/ProductPage";
import { RegistrationPage } from "../pages/RegistrationPage";
import { SearchResultsPage } from "../pages/SearchResultsPage";

dotenv.config();

const APP_URL = process.env.WEB_APP_URL;

if (!APP_URL) {
    throw new Error("WEB_APP_URL is not configured.");
}

type PageFixtures = {
    adminCustomersPage: AdminCustomersPage;
    adminLoginPage: AdminLoginPage;
    accountPage: AccountPage;
    cartPage: CartPage;
    homePage: HomePage;
    loginPage: LoginPage;
    productPage: ProductPage;
    registrationPage: RegistrationPage;
    searchResultsPage: SearchResultsPage;
};

export const test = base.extend<PageFixtures>({
    adminCustomersPage: async ({ page }, use) => {
        await use(new AdminCustomersPage(page));
    },
    adminLoginPage: async ({ page }, use) => {
        await use(new AdminLoginPage(page));
    },
    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },
    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
    homePage: async ({ page }, use) => {
        await page.goto(APP_URL);
        await use(new HomePage(page));
    },
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
    productPage: async ({ page }, use) => {
        await use(new ProductPage(page));
    },
    registrationPage: async ({ page }, use) => {
        await use(new RegistrationPage(page));
    },
    searchResultsPage: async ({ page }, use) => {
        await use(new SearchResultsPage(page));
    },
});

test.afterEach(async ({ page, context }) => {
    if (!page.isClosed()) {
        await page.close();
    }

    if (!context.isClosed()) {
        await context.close();
    }
});

export { expect } from "@playwright/test";
