import { Locator, Page } from "@playwright/test";

export class SearchResultsPage {
    private readonly page: Page;

    // Locators
    private readonly searchResultsHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.searchResultsHeading = page.getByRole("heading", { name: /^Search - / });
    }

    /**
     * Checks whether a product is present in the search results.
     * @param productName - Product name to find
     * @returns Promise<boolean> - true if the exact product heading is visible
     */
    async isProductVisible(productName: string): Promise<boolean> {
        try {
            await this.page.getByRole("heading", { name: productName, exact: true }).waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking search result for ${productName}: ${error}`);
            return false;
        }
    }

    /**
     * Opens the exact matching product from the search results.
     * @param productName - Product name to open
     */
    async openProduct(productName: string): Promise<void> {
        const productHeading = this.page.getByRole("heading", { name: productName, exact: true });
        await productHeading.getByRole("link").click();
    }

    /**
     * Checks whether the search results page is displayed.
     * @returns Promise<boolean> - true if the search heading is visible
     */
    async isSearchResultsPageVisible(): Promise<boolean> {
        try {
            await this.searchResultsHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking product search results page: ${error}`);
            return false;
        }
    }
}
