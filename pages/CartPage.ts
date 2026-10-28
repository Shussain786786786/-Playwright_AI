import { Locator, Page } from "@playwright/test";

export class CartPage {
    private readonly page: Page;

    // Locators
    private readonly cartHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.cartHeading = page.getByRole("heading", { name: /^Shopping Cart/ });
    }

    /**
     * Checks whether the shopping cart page is displayed.
     * @returns Promise<boolean> - true if the cart heading is visible
     */
    async isCartPageVisible(): Promise<boolean> {
        try {
            await this.cartHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking shopping cart page: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether the exact product appears in the cart.
     * @param productName - Product name to find
     * @returns Promise<boolean> - true if its cart row is visible
     */
    async isProductVisible(productName: string): Promise<boolean> {
        try {
            await this.getProductRow(productName).waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking cart product ${productName}: ${error}`);
            return false;
        }
    }

    /**
     * Returns the quantity for a product in the cart.
     * @param productName - Product name whose quantity is requested
     * @returns Promise<string> - Quantity entered in the cart
     */
    async getProductQuantity(productName: string): Promise<string> {
        return this.getProductRow(productName).getByRole("textbox").inputValue();
    }

    /**
     * Returns the unit price for a product in the cart.
     * @param productName - Product name whose unit price is requested
     * @returns Promise<string> - Displayed unit price
     */
    async getProductUnitPrice(productName: string): Promise<string> {
        return (await this.getProductRow(productName).getByRole("cell").nth(4).innerText()).trim();
    }

    /**
     * Returns the line total for a product in the cart.
     * @param productName - Product name whose line total is requested
     * @returns Promise<string> - Displayed product total
     */
    async getProductLineTotal(productName: string): Promise<string> {
        return (await this.getProductRow(productName).getByRole("cell").nth(5).innerText()).trim();
    }

    /**
     * Returns the grand total displayed by the cart.
     * @returns Promise<string> - Cart grand total
     */
    async getGrandTotal(): Promise<string> {
        const totalRow = this.page.getByText("Total:", { exact: true }).locator("xpath=../..");
        return (await totalRow.getByRole("cell").last().innerText()).trim();
    }

    private getProductRow(productName: string): Locator {
        return this.page.getByRole("table").getByRole("row").filter({
            has: this.page.getByRole("link", { name: productName }),
        });
    }
}
