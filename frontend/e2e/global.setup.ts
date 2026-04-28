import { test as setup, expect } from "@playwright/test";
import fs from "node:fs";
import path from "node:path";

const AUTH_DIR = path.join(__dirname, "..", "playwright", ".auth");
const ADMIN_STATE = path.join(AUTH_DIR, "admin.json");
const STAFF_STATE = path.join(AUTH_DIR, "staff.json");

const ADMIN = { email: "admin@qollab.com", password: "password" };
const STAFF = { email: "staff@qollab.com", password: "password" };

setup.beforeAll(() => {
  fs.mkdirSync(AUTH_DIR, { recursive: true });
});

setup("authenticate as admin", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(ADMIN.email);
  await page.getByLabel(/password/i).fill(ADMIN.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: ADMIN_STATE });
});

setup("authenticate as staff", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel(/email/i).fill(STAFF.email);
  await page.getByLabel(/password/i).fill(STAFF.password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL(/\/dashboard/);
  await expect(page).toHaveURL(/\/dashboard/);
  await page.context().storageState({ path: STAFF_STATE });
});
