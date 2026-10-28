import path from "node:path";
import { test, expect } from "../../fixtures/pageFixtures";
import { DataProvider } from "../../utils/DataReader";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

type LoginTestCase = {
    testName: string;
    email: string;
    password: string;
    expected: "success" | "failure";
};

type LoginResponse = {
    error?: {
        warning?: string;
    };
};

const loginTestCases = DataProvider.readCsv<LoginTestCase>(
    path.resolve(__dirname, "../../testdata/opencart_logindata.csv"),
);
const validLogin = loginTestCases.find(({ expected }) => expected === "success");

if (!validLogin) {
    throw new Error("Login test data must include at least one success row.");
}

const product = Helper.getProductDetails();

test("Customer registration @master @sanity @web", async ({
    accountPage,
    homePage,
    page,
    registrationPage,
}) => {
    const generatedEmail = RandomDataUtil.getEmail();
    const emailSeparator = generatedEmail.lastIndexOf("@");
    const email = `${generatedEmail.slice(0, emailSeparator)}+${Date.now()}${generatedEmail.slice(emailSeparator)}`;
    const password = RandomDataUtil.getPassword(12);

    await test.step("1) Open the registration page", async () => {
        await homePage.openAccountMenu();
        await homePage.clickRegister();
        expect(await registrationPage.isRegistrationPageVisible()).toBeTruthy();
    });

    await test.step("2) Register with unique customer details", async () => {
        await registrationPage.register(
            RandomDataUtil.getFirstName(),
            RandomDataUtil.getLastName(),
            email,
            password,
        );
    });

    await test.step("3) Verify account creation and account navigation", async () => {
        expect(await accountPage.isRegistrationConfirmationVisible()).toBeTruthy();
        await accountPage.clickContinue();
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
        await expect(page).toHaveURL(/route=account\/account/);
    });

    console.log("Customer registration completed successfully.");
});

test("Valid customer login @master @sanity @web", async ({ accountPage, homePage, loginPage, page }) => {
    await test.step("1) Open the login page", async () => {
        await homePage.openAccountMenu();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    });

    await test.step("2) Log in with valid customer credentials", async () => {
        await loginPage.login(validLogin.email, validLogin.password);
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    console.log("Valid customer login completed successfully.");
});

test("Invalid customer login @master @regression @web", async ({ homePage, loginPage, page }) => {
    const invalidEmail = RandomDataUtil.getEmail();
    const invalidPassword = RandomDataUtil.getPassword(12);

    await test.step("1) Open the login page", async () => {
        await homePage.openAccountMenu();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
    });

    await test.step("2) Submit invalid credentials and verify the warning", async () => {
        const loginResponsePromise = page.waitForResponse((response) =>
            response.request().method() === "POST" &&
            response.url().includes("route=account/login.login"),
        );
        await loginPage.login(invalidEmail, invalidPassword);
        const loginResponse = await loginResponsePromise;
        const responseBody = await loginResponse.json() as LoginResponse;
        expect(responseBody.error?.warning).toMatch(
            /^Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/,
        );
        await expect(page).not.toHaveURL(/route=account\/account/);
    });

    console.log("Invalid customer login was rejected as expected.");
});

test("Customer logout @master @sanity @web", async ({ accountPage, homePage, loginPage, page }) => {
    await test.step("1) Log in with valid customer credentials", async () => {
        await homePage.openAccountMenu();
        await homePage.clickLogin();
        await loginPage.login(validLogin.email, validLogin.password);
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    await test.step("2) Log out and verify the confirmation", async () => {
        await accountPage.logout();
        expect(await accountPage.isLogoutConfirmationVisible()).toBeTruthy();
    });

    await test.step("3) Continue to the homepage and verify guest navigation", async () => {
        await accountPage.clickContinue();
        await expect(page).toHaveTitle("Your Store");
        await homePage.openAccountMenu();
        expect(await homePage.areGuestAccountOptionsVisible()).toBeTruthy();
    });

    console.log("Customer logout completed successfully.");
});

test("Product search @master @sanity @web", async ({ homePage, searchResultsPage }) => {
    await test.step("1) Search for the known product", async () => {
        await homePage.searchProduct(product.productName);
    });

    await test.step("2) Verify the search results and exact product name", async () => {
        expect(await searchResultsPage.isSearchResultsPageVisible()).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(product.productName)).toBeTruthy();
    });

    console.log("Product search completed successfully.");
});

test("Add a product to the shopping cart @master @sanity @web", async ({
    cartPage,
    homePage,
    productPage,
    searchResultsPage,
}) => {
    await test.step("1) Search for and open the known product", async () => {
        await homePage.searchProduct(product.productName);
        expect(await searchResultsPage.isSearchResultsPageVisible()).toBeTruthy();
        await searchResultsPage.openProduct(product.productName);
        expect(await productPage.isProductDetailsVisible(product.productName)).toBeTruthy();
        expect(await productPage.getProductPrice()).toBe(product.totalPrice);
    });

    await test.step("2) Add one item and verify the cart confirmation", async () => {
        await productPage.setQuantity(product.productQuantity);
        await productPage.addToCart();
        const expectedCartSummary = `${Number(product.productQuantity)} item(s) - ${product.totalPrice}`;
        expect(await productPage.isCartSummaryVisible(expectedCartSummary)).toBeTruthy();
    });

    await test.step("3) Verify the product and quantity in the cart", async () => {
        await homePage.openShoppingCart();
        expect(await cartPage.isCartPageVisible()).toBeTruthy();
        expect(await cartPage.isProductVisible(product.productName)).toBeTruthy();
        expect(await cartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
    });

    console.log("Product was added to the shopping cart successfully.");
});

for (const [index, testCase] of loginTestCases.entries()) {
    test(`${testCase.testName} (${index + 1}) @master @datadriven @web`, async ({
        accountPage,
        homePage,
        loginPage,
        page,
    }) => {
        await test.step("1) Open the login page", async () => {
            await homePage.openAccountMenu();
            await homePage.clickLogin();
            expect(await loginPage.isLoginPageVisible()).toBeTruthy();
        });

        await test.step("2) Submit the external login data and verify the outcome", async () => {
            const email = testCase.email.trim() ? testCase.email : "";
            const password = testCase.password.trim() ? testCase.password : "";

            if (testCase.expected === "success") {
                await loginPage.login(email, password);
                await expect(page).toHaveURL(/route=account\/account/);
                expect(await accountPage.isDashboardVisible()).toBeTruthy();
            } else {
                const loginResponsePromise = page.waitForResponse((response) =>
                    response.request().method() === "POST" &&
                    response.url().includes("route=account/login.login"),
                );
                await loginPage.login(email, password);
                const loginResponse = await loginResponsePromise;
                const responseBody = await loginResponse.json() as LoginResponse;
                expect(responseBody.error?.warning).toMatch(
                    /^Warning: (No match for E-Mail Address and\/or Password\.|Your account has exceeded allowed number of login attempts\.)/,
                );
                await expect(page).not.toHaveURL(/route=account\/account/);
            }
        });

        console.log(`Data-driven login case "${testCase.testName}" completed.`);
    });
}
