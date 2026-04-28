import { test, expect } from "@playwright/test";

test.describe("public / unauthenticated routes", () => {
  test("/dashboard redirects an unauthenticated user to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("/signup is removed and redirects to /login", async ({ page }) => {
    await page.goto("/signup");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("forgot-password page renders and accepts a known email", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await expect(
      page.getByRole("heading", { name: /forgot your password/i }),
    ).toBeVisible();

    await page.getByLabel(/email/i).fill("admin@qollab.com");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(
      page.getByText(/if an account exists for that email/i),
    ).toBeVisible();
  });

  test("forgot-password returns the same generic message for unknown emails", async ({
    page,
  }) => {
    await page.goto("/forgot-password");
    await page.getByLabel(/email/i).fill("nobody@qollab.test");
    await page.getByRole("button", { name: /send reset link/i }).click();

    await expect(
      page.getByText(/if an account exists for that email/i),
    ).toBeVisible();
  });

  test("login form rejects invalid credentials", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/email/i).fill("admin@qollab.com");
    await page.getByLabel(/password/i).fill("wrong-password");
    await page.getByRole("button", { name: /sign in/i }).click();

    await expect(page).toHaveURL(/\/login(\?|$)/);
    await expect(
      page.getByText(/credentials|invalid|incorrect|do not match/i).first(),
    ).toBeVisible();
  });
});
