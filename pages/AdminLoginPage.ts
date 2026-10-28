import { Locator, Page } from "@playwright/test";

export class AdminLoginPage {
    private readonly page: Page;

    // Locators
    private readonly txtUsername: Locator;
    private readonly txtPassword: Locator;
    private readonly btnLogin: Locator;
    private readonly dashboardHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.txtUsername = page.getByLabel("Username");
        this.txtPassword = page.getByLabel("Password");
        this.btnLogin = page.getByRole("button", { name: "Login", exact: true });
        this.dashboardHeading = page.getByRole("heading", { name: "Dashboard", exact: true });
    }

    /**
     * Signs in to the OpenCart Admin Portal.
     * @param adminUrl - Admin Portal URL
     * @param username - Configured administrator username
     * @param password - Configured administrator password
     */
    async login(adminUrl: string, username: string, password: string): Promise<void> {
        await this.page.goto(adminUrl);
        await this.txtUsername.fill(username);
        await this.txtPassword.fill(password);
        await this.btnLogin.click();
    }

    /**
     * Checks whether the Admin Portal dashboard is displayed.
     * @returns Promise<boolean> - true when the dashboard heading is visible
     */
    async isDashboardVisible(): Promise<boolean> {
        try {
            await this.dashboardHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking Admin Portal dashboard: ${error}`);
            return false;
        }
    }
}
