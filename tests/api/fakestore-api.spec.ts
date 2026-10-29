import "dotenv/config";
import Ajv from "ajv";
import { test, expect } from "@playwright/test";
import productSchema from "../../api/schemas/product_api_schema.json";
import { Routes } from "../../api/endpoints/routes";

const apiBaseUrl = process.env.API_BASE_URL ?? Routes.BASE_URL;
const productId = process.env.PRODUCT_ID ?? "1";
const validateProduct = new Ajv().compile(productSchema);

test("GET products returns a non-empty product list @api", async ({ request }) => {
    const response = await request.get(new URL(Routes.GET_ALL_PRODUCTS, apiBaseUrl).toString());

    expect(response.ok(), await response.text()).toBeTruthy();
    const products: unknown = await response.json();
    expect(Array.isArray(products)).toBe(true);
    expect(products).not.toHaveLength(0);
});

test("GET product by ID matches the product schema @api", async ({ request }) => {
    const route = Routes.GET_PRODUCT_BY_ID.replace("{id}", encodeURIComponent(productId));
    const response = await request.get(new URL(route, apiBaseUrl).toString());

    expect(response.ok(), await response.text()).toBeTruthy();
    const product: unknown = await response.json();
    expect(validateProduct(product), JSON.stringify(validateProduct.errors)).toBe(true);
});