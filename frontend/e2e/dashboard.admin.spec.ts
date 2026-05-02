import { test, expect } from "@playwright/test";

test.describe("admin dashboard flows", () => {
  test("admin lands on /dashboard when visiting the root protected route", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test("admin can open /dashboard/users and see the user table", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings/users");
    await expect(page.getByRole("heading", { name: /^users$/i })).toBeVisible();
    // Seeded admin should always be present.
    await expect(page.getByText("admin@qollab.com").first()).toBeVisible();
    // Admin sees the "New user" CTA.
    await expect(
      page.getByRole("link", { name: /new user/i }),
    ).toBeVisible();
  });

  test("admin can open /dashboard/users/new and see the create form", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings/users/new");
    await expect(
      page.getByRole("heading", { name: /create a new user/i }),
    ).toBeVisible();
    await expect(page.getByLabel(/full name/i)).toBeVisible();
    await expect(page.getByLabel(/^email$/i)).toBeVisible();
    await expect(page.getByLabel(/^role$/i)).toBeVisible();
  });

  test("admin can update their own profile name on /dashboard/account", async ({
    page,
  }) => {
    await page.goto("/dashboard/account");
    await expect(page.getByRole("heading", { name: /^account$/i })).toBeVisible();

    const nameField = page.getByLabel(/full name/i);
    const original = (await nameField.inputValue()) || "System administrator";
    const updated = `${original} (e2e)`;

    await nameField.fill(updated);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/profile updated/i)).toBeVisible();

    // Restore the original value so the test is idempotent.
    await nameField.fill(original);
    await page.getByRole("button", { name: /save changes/i }).click();
    await expect(page.getByText(/profile updated/i)).toBeVisible();
  });

  test("admin can change password and revert it back", async ({ page }) => {
    await page.goto("/dashboard/account");

    // password -> password-e2e
    await page.getByLabel(/current password/i).fill("password");
    await page.getByLabel(/^new password$/i).fill("password-e2e");
    await page.getByLabel(/confirm new password/i).fill("password-e2e");
    await page.getByRole("button", { name: /update password/i }).click();
    await expect(page.getByText(/password updated/i)).toBeVisible();

    // password-e2e -> password (restore)
    await page.getByLabel(/current password/i).fill("password-e2e");
    await page.getByLabel(/^new password$/i).fill("password");
    await page.getByLabel(/confirm new password/i).fill("password");
    await page.getByRole("button", { name: /update password/i }).click();
    await expect(page.getByText(/password updated/i)).toBeVisible();
  });
});
