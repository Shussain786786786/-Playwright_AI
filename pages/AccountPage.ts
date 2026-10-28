import { Locator, Page } from "@playwright/test";

export class AccountPage {
    private readonly page: Page;

    // Locators
    private readonly registrationHeading: Locator;
    private readonly dashboardHeading: Locator;
    private readonly logoutHeading: Locator;
    private readonly lnkLogout: Locator;
    private readonly lnkContinue: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.registrationHeading = page.getByRole("heading", { name: "Your Account Has Been Created!", exact: true });
        this.dashboardHeading = page.locator("#content").getByRole("heading", { name: "My Account", exact: true });
        this.logoutHeading = page.getByRole("heading", { name: "Account Logout", exact: true });
        this.lnkLogout = page.locator("#column-right").getByRole("link", { name: "Logout", exact: true });
        this.lnkContinue = page.getByRole("link", { name: "Continue", exact: true });
    }

    /**
     * Checks whether the registration confirmation is displayed.
     * @returns Promise<boolean> - true if the account-created heading is visible
     */
    async isRegistrationConfirmationVisible(): Promise<boolean> {
        try {
            await this.registrationHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking registration confirmation: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether the authenticated account dashboard is displayed.
     * @returns Promise<boolean> - true if the account dashboard heading is visible
     */
    async isDashboardVisible(): Promise<boolean> {
        try {
            await this.dashboardHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking account dashboard: ${error}`);
            return false;
        }
    }

    /**
     * Continues from an account confirmation or logout page.
     */
    async clickContinue(): Promise<void> {
        await this.lnkContinue.click();
    }

    /**
     * Opens the account menu and logs the customer out.
     */
    async logout(): Promise<void> {
        await this.lnkLogout.click();
    }

    /**
     * Checks whether the logout confirmation is displayed.
     * @returns Promise<boolean> - true if the logout heading is visible
     */
    async isLogoutConfirmationVisible(): Promise<boolean> {
        try {
            await this.logoutHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking logout confirmation: ${error}`);
            return false;
        }
    }
}
