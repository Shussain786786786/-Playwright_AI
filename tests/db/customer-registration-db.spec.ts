import dotenv from "dotenv";
import { test, expect } from "../../fixtures/pageFixtures";
import { RandomDataUtil } from "../../utils/dataGenerator";
import { executeQuery } from "../../utils/dbClient";

dotenv.config();

type CustomerRow = {
    customer_id: number;
    firstname: string;
    lastname: string;
    email: string;
    status: number;
    date_added: Date | string | null;
};

const adminAppUrl = process.env.ADMIN_APP_URL;
const adminUsername = process.env.ADMIN_USERNAME;
const adminPassword = process.env.ADMIN_PASSWORD;

if (!adminAppUrl || !adminUsername || !adminPassword) {
    throw new Error("ADMIN_APP_URL, ADMIN_USERNAME, and ADMIN_PASSWORD must be configured.");
}

test("New customer is validated in the Admin Portal and MySQL @master @db @web", async ({
    accountPage,
    adminCustomersPage,
    adminLoginPage,
    homePage,
    page,
    registrationPage,
}) => {
    const generatedEmail = RandomDataUtil.getEmail().toLowerCase();
    const emailSeparator = generatedEmail.lastIndexOf("@");
    const customer = {
        firstName: RandomDataUtil.getFirstName(),
        lastName: RandomDataUtil.getLastName(),
        email: `${generatedEmail.slice(0, emailSeparator)}+${Date.now()}${generatedEmail.slice(emailSeparator)}`,
        telephone: RandomDataUtil.getPhoneNumber(),
        password: RandomDataUtil.getPassword(12),
    };

    try {
        await test.step("1) Register a unique customer through the storefront", async () => {
            await homePage.openAccountMenu();
            await homePage.clickRegister();
            expect(await registrationPage.isRegistrationPageVisible()).toBeTruthy();
            await registrationPage.register(
                customer.firstName,
                customer.lastName,
                customer.email,
                customer.telephone,
                customer.password,
            );
            expect(await accountPage.isRegistrationConfirmationVisible()).toBeTruthy();
            await expect(page.getByRole("heading", {
                name: "Your Account Has Been Created!",
                exact: true,
            })).toBeVisible();
        });

        await test.step("2) Find and verify the customer in the Admin Portal", async () => {
            await adminLoginPage.login(adminAppUrl, adminUsername, adminPassword);
            expect(await adminLoginPage.isDashboardVisible()).toBeTruthy();

            await adminCustomersPage.searchCustomer(customer.email);
            const customerRow = adminCustomersPage.getCustomerRow(customer.email);
            await expect(customerRow).toHaveCount(1);
            await adminCustomersPage.openCustomerDetails(customer.email);

            const adminCustomer = await adminCustomersPage.getCustomerDetails();
            expect(adminCustomer.firstName).toBe(customer.firstName);
            expect(adminCustomer.lastName).toBe(customer.lastName);
            expect(adminCustomer.email).toBe(customer.email);
            expect(adminCustomer.isEnabled).toBe(true);
        });

        await test.step("3) Find and verify the customer in MySQL", async () => {
            const customers = await executeQuery<CustomerRow[]>(
                "SELECT customer_id, firstname, lastname, email, status, date_added FROM oc_customer WHERE email = ?",
                [customer.email],
            );

            expect(customers, "Exactly one customer record should match the generated email.").toHaveLength(1);
            expect(customers[0].firstname, "The database first name should match the registered value.")
                .toBe(customer.firstName);
            expect(customers[0].lastname, "The database last name should match the registered value.")
                .toBe(customer.lastName);
            expect(customers[0].email, "The database email should match the registered value.")
                .toBe(customer.email);
            expect(customers[0].status, "A newly registered customer should be enabled.")
                .toBe(1);
            expect(customers[0].date_added, "The customer record should have a date_added value.")
                .toBeTruthy();
        });
    } finally {
        await executeQuery(
            "DELETE FROM oc_customer WHERE email = ?",
            [customer.email],
        );
    }

    console.log("New customer was validated in the Admin Portal and MySQL.");
});
