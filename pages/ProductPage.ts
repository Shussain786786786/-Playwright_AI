import { expect, Locator, Page } from "@playwright/test";

export class ProductPage {
    private readonly page: Page;

    // Locators
    private readonly productPrice: Locator;
    private readonly txtQuantity: Locator;
    private readonly btnAddToCart: Locator;
    private readonly cartSummary: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.productPrice = page.getByRole("heading", { level: 2 });
        this.txtQuantity = page.locator("#input-quantity");
        this.btnAddToCart = page.getByRole("button", { name: "Add to Cart", exact: true });
        this.cartSummary = page.locator("#cart-total");
    }

    /**
     * Checks whether the requested product details are displayed.
     * @param productName - Expected product name
     * @returns Promise<boolean> - true if the product heading is visible
     */
    async isProductDetailsVisible(productName: string): Promise<boolean> {
        try {
            await this.page.getByRole("heading", { name: productName, exact: true }).waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking product details for ${productName}: ${error}`);
            return false;
        }
    }

    /**
     * Returns the product's displayed price.
     * @returns Promise<string> - Product price text
     */
    async getProductPrice(): Promise<string> {
        return (await this.productPrice.innerText()).trim();
    }

    /**
     * Sets the desired product quantity.
     * @param quantity - Quantity to add to the cart
     */
    async setQuantity(quantity: string): Promise<void> {
        await this.txtQuantity.fill(quantity);
    }

    /**
     * Adds the selected product to the shopping cart.
     */
    async addToCart(): Promise<void> {
        await this.btnAddToCart.click();
    }

    /**
     * Checks whether the cart summary reflects a successful product addition.
     * @param expectedSummary - Expected item count and cart total
     * @returns Promise<boolean> - true if the updated cart summary is visible
     */
    async isCartSummaryVisible(expectedSummary: string): Promise<boolean> {
        await expect(this.cartSummary).toHaveText(expectedSummary);
        return true;
    }
}
