import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { Helper } from "../../utils/helper";

test("End-to-End shopping flow @master @end-to-end @web", async ({
    accountPage,
    cartPage,
    homePage,
    loginPage,
    page,
    productPage,
    registrationPage,
    searchResultsPage,
}) => {
    const product = Helper.getProductDetails();
    const generatedEmail = RandomDataUtil.getEmail();
    const emailSeparator = generatedEmail.lastIndexOf("@");
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `${generatedEmail.slice(0, emailSeparator)}+${Date.now()}${generatedEmail.slice(emailSeparator)}`,
        password: RandomDataUtil.getPassword(12),
    };
    const pageErrors: string[] = [];

    page.on("pageerror", (error) => pageErrors.push(error.message));

    await test.step("1) Open the application", async () => {
        expect(await homePage.getPageTitle()).toBe("Your Store");
    });

    await test.step("2) Register a new customer with unique data", async () => {
        await homePage.openAccountMenu();
        await homePage.clickRegister();
        expect(await registrationPage.isRegistrationPageVisible()).toBeTruthy();
        await registrationPage.register(
            customer.firstName,
            customer.lastName,
            customer.email,
            customer.password,
        );
    });

    await test.step("3) Verify registration succeeded", async () => {
        expect(await accountPage.isRegistrationConfirmationVisible()).toBeTruthy();
        await accountPage.clickContinue();
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    await test.step("4) Log out of the new customer account", async () => {
        await accountPage.logout();
        expect(await accountPage.isLogoutConfirmationVisible()).toBeTruthy();
        await accountPage.clickContinue();
        expect(await homePage.getPageTitle()).toBe("Your Store");
    });

    await test.step("5) Log in with the newly created credentials", async () => {
        await homePage.openAccountMenu();
        expect(await homePage.areGuestAccountOptionsVisible()).toBeTruthy();
        await homePage.clickLogin();
        expect(await loginPage.isLoginPageVisible()).toBeTruthy();
        await loginPage.login(customer.email, customer.password);
    });

    await test.step("6) Verify successful authentication", async () => {
        await expect(page).toHaveURL(/route=account\/account/);
        expect(await accountPage.isDashboardVisible()).toBeTruthy();
    });

    await test.step("7) Search for the known product", async () => {
        await homePage.searchProduct(product.productName);
        expect(await searchResultsPage.isSearchResultsPageVisible()).toBeTruthy();
        expect(await searchResultsPage.isProductVisible(product.productName)).toBeTruthy();
    });

    await test.step("8) Open and verify the product details", async () => {
        await searchResultsPage.openProduct(product.productName);
        expect(await productPage.isProductDetailsVisible(product.productName)).toBeTruthy();
        expect(await productPage.getProductPrice()).toBe(product.totalPrice);
    });

    await test.step("9) Add the product to the cart", async () => {
        await productPage.setQuantity(product.productQuantity);
        await productPage.addToCart();
        const expectedCartSummary = `${Number(product.productQuantity)} item(s) - ${product.totalPrice}`;
        expect(await productPage.isCartSummaryVisible(expectedCartSummary)).toBeTruthy();
    });

    await test.step("10) Open the shopping cart", async () => {
        await homePage.openShoppingCart();
        expect(await cartPage.isCartPageVisible()).toBeTruthy();
    });

    await test.step("11) Verify the selected product is in the cart", async () => {
        expect(await cartPage.isProductVisible(product.productName)).toBeTruthy();
    });

    await test.step("12) Verify the cart quantity", async () => {
        expect(await cartPage.getProductQuantity(product.productName)).toBe(product.productQuantity);
    });

    await test.step("13) Verify the product price", async () => {
        expect(await cartPage.getProductUnitPrice(product.productName)).toBe(product.totalPrice);
    });

    await test.step("14) Verify the applicable cart total", async () => {
        expect(await cartPage.getProductLineTotal(product.productName)).toBe(product.totalPrice);
        expect(await cartPage.getGrandTotal()).toBe(product.totalPrice);
    });

    await test.step("15) Verify the journey finishes without runtime errors", async () => {
        expect(pageErrors).toEqual([]);
    });

    console.log("✅ End-to-end shopping flow completed successfully.");
});
