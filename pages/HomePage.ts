import { Locator, Page } from "@playwright/test";

export class HomePage {
    private readonly page: Page;

    // Locators
    private readonly lnkMyAccount: Locator;
    private readonly lnkShoppingCart: Locator;
    private readonly txtSearch: Locator;
    private readonly lnkRegister: Locator;
    private readonly lnkLogin: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.lnkMyAccount = page.getByRole("link", { name: "My Account", exact: true });
        this.lnkShoppingCart = page.getByRole("link", { name: "Shopping Cart", exact: true });
        this.txtSearch = page.getByRole("textbox", { name: "Search" });
        this.lnkRegister = page.getByRole("link", { name: "Register", exact: true });
        this.lnkLogin = page.getByRole("link", { name: "Login", exact: true });
    }

    /**
     * Opens the My Account navigation menu.
     */
    async openAccountMenu(): Promise<void> {
        await this.lnkMyAccount.click();
    }

    /**
     * Opens the customer registration page from the account menu.
     */
    async clickRegister(): Promise<void> {
        await this.lnkRegister.click();
    }

    /**
     * Opens the customer login page from the account menu.
     */
    async clickLogin(): Promise<void> {
        await this.lnkLogin.click();
    }

    /**
     * Checks whether guest account options are visible.
     * @returns Promise<boolean> - true when both Register and Login are visible
     */
    async areGuestAccountOptionsVisible(): Promise<boolean> {
        try {
            await this.lnkRegister.waitFor({ state: "visible" });
            await this.lnkLogin.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking guest account options: ${error}`);
            return false;
        }
    }

    /**
     * Searches the catalog for a product.
     * @param productName - Product name to search for
     */
    async searchProduct(productName: string): Promise<void> {
        await this.txtSearch.fill(productName);
        await this.txtSearch.press("Enter");
    }

    /**
     * Opens the shopping cart from the storefront navigation.
     */
    async openShoppingCart(): Promise<void> {
        await this.lnkShoppingCart.click();
    }

    /**
     * Returns the current page title.
     * @returns Promise<string> - Current document title
     */
    async getPageTitle(): Promise<string> {
        return this.page.title();
    }
}
