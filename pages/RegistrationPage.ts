import { Locator, Page } from "@playwright/test";

export class RegistrationPage {
    private readonly page: Page;

    // Locators
    private readonly txtFirstName: Locator;
    private readonly txtLastName: Locator;
    private readonly txtEmail: Locator;
    private readonly txtTelephone: Locator;
    private readonly txtPassword: Locator;
    private readonly txtPasswordConfirm: Locator;
    private readonly chkPrivacyPolicy: Locator;
    private readonly btnContinue: Locator;
    private readonly registrationHeading: Locator;

    constructor(page: Page) {
        this.page = page;

        // Initialize locators with CSS selectors
        this.txtFirstName = page.getByLabel("First Name");
        this.txtLastName = page.getByLabel("Last Name");
        this.txtEmail = page.getByLabel("E-Mail");
        this.txtTelephone = page.getByLabel("Telephone");
        this.txtPassword = page.getByLabel("Password", { exact: true });
        this.txtPasswordConfirm = page.getByLabel("Password Confirm", { exact: true });
        this.chkPrivacyPolicy = page.locator('input[name="agree"]');
        this.btnContinue = page.getByRole("button", { name: "Continue", exact: true });
        this.registrationHeading = page.getByRole("heading", { name: "Register Account", exact: true });
    }

    /**
     * Checks whether the registration page is displayed.
     * @returns Promise<boolean> - true if the registration heading is visible
     */
    async isRegistrationPageVisible(): Promise<boolean> {
        try {
            await this.registrationHeading.waitFor({ state: "visible" });
            return true;
        } catch (error) {
            console.log(`Error checking registration page: ${error}`);
            return false;
        }
    }

    /**
     * Completes and submits the customer registration form.
     * @param firstName - Customer first name
     * @param lastName - Customer last name
     * @param email - Unique customer email
     * @param password - Customer password
     */
    async register(
        firstName: string,
        lastName: string,
        email: string,
        telephone: string,
        password: string,
    ): Promise<void> {
        try {
            await this.txtFirstName.fill(firstName);
            await this.txtLastName.fill(lastName);
            await this.txtEmail.fill(email);
            await this.txtTelephone.fill(telephone);
            await this.txtPassword.fill(password);
            await this.txtPasswordConfirm.fill(password);
            await this.chkPrivacyPolicy.check();
            await this.btnContinue.click();
        } catch (error) {
            console.log(`Error completing customer registration: ${error}`);
            throw error;
        }
    }
}
