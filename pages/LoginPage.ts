import { Locator, Page } from "@playwright/test";

export class LoginPage {
    private readonly page: Page;

    // Locators
    private readonly txtEmail: Locator;
    private readonly txtPassword: Locator;
    private readonly btnLogin: Locator;
    private readonly loginHeading: Locator;
    private readonly warningMessage: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.txtEmail = page.getByLabel("E-Mail Address");
        this.txtPassword = page.getByLabel("Password");
        this.btnLogin = page.getByRole("button", { name: "Login", exact: true });
        this.loginHeading = page.getByRole("heading", { name: "Returning Customer", exact: true });
        this.warningMessage = page.getByText("Warning: No match for E-Mail Address and/or Password.", { exact: false });
    }

    /**
     * Checks whether the login page is displayed.
     * @returns Promise<boolean> - true if the login heading is visible
     */
    async isLoginPageVisible(): Promise<boolean> {
        try {
            await this.loginHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking login page: ${error}`);
            return false;
        }
    }

    /**
     * Checks whether OpenCart displays the invalid-credentials warning.
     * @returns Promise<boolean> - true if the login warning is visible
     */
    async isInvalidCredentialsWarningVisible(): Promise<boolean> {
        try {
            await this.warningMessage.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking invalid login warning: ${error}`);
            return false;
        }
    }

    /**
     * Authenticates a customer with email and password.
     * @param email - Customer email address
     * @param password - Customer password
     */
    async login(email: string, password: string): Promise<void> {
        try {
            await this.txtEmail.fill(email);
            await this.txtPassword.fill(password);
            await this.btnLogin.click();
        } catch (error) {
            console.log(`Error submitting customer login: ${error}`);
            throw error;
        }
    }
}
