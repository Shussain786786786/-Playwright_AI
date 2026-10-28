import { Locator, Page } from "@playwright/test";

export type AdminCustomerDetails = {
    firstName: string;
    lastName: string;
    email: string;
    isEnabled: boolean;
};

export class AdminCustomersPage {
    private readonly page: Page;
    private readonly adminNavigation: Locator;

    // Locators
    private readonly customersMenu: Locator;
    private readonly customerListLink: Locator;
    private readonly emailFilter: Locator;
    private readonly filterButton: Locator;
    private readonly customerTable: Locator;
    private readonly txtFirstName: Locator;
    private readonly txtLastName: Locator;
    private readonly txtEmail: Locator;
    private readonly chkStatus: Locator;

    constructor(page: Page) {
        this.page = page;
        this.adminNavigation = page.getByRole("navigation").first();

        // Initialize locators with CSS selectors
        this.customersMenu = this.adminNavigation.getByRole("link", { name: /^Customers/ }).first();
        this.customerListLink = this.adminNavigation.getByRole("link", { name: /Customers/ }).last();
        this.emailFilter = page.getByRole("textbox", { name: "E-Mail" });
        this.filterButton = page.getByRole("button", { name: "Filter", exact: true });
        this.customerTable = page.getByRole("table");
        this.txtFirstName = page.getByLabel("First Name");
        this.txtLastName = page.getByLabel("Last Name");
        this.txtEmail = page.getByLabel("E-Mail");
        this.chkStatus = page.locator("#input-status");
    }

    /**
     * Opens the customer list and filters it by the supplied email address.
     * @param email - Unique customer email to search for
     */
    async searchCustomer(email: string): Promise<void> {
        await this.customersMenu.click();
        await this.customerListLink.click();
        await this.emailFilter.fill(email);
        await this.filterButton.click();
        await this.getCustomerRow(email).waitFor({ state: "visible" });
    }

    /**
     * Returns the customer table row matching an email address.
     * @param email - Customer email to find
     * @returns Locator - Matching customer row
     */
    getCustomerRow(email: string): Locator {
        return this.customerTable.getByRole("row").filter({ hasText: email });
    }

    /**
     * Opens the edit form for the customer matching an email address.
     * @param email - Customer email to open
     */
    async openCustomerDetails(email: string): Promise<void> {
        await this.getCustomerRow(email).getByRole("link", { name: "Edit", exact: true }).click();
    }

    /**
     * Reads the customer details and enabled status displayed by the Admin Portal.
     * @returns Promise<AdminCustomerDetails> - Values currently shown in the customer form
     */
    async getCustomerDetails(): Promise<AdminCustomerDetails> {
        return {
            firstName: await this.txtFirstName.inputValue(),
            lastName: await this.txtLastName.inputValue(),
            email: await this.txtEmail.inputValue(),
            isEnabled: await this.chkStatus.isChecked(),
        };
    }
}
