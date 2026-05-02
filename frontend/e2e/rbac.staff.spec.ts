import { test, expect } from "@playwright/test";

test.describe("staff RBAC guards", () => {
  test("staff is blocked from /dashboard/users/new with an inline 403", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings/users/new");
    await expect(page.getByText(/403\s*[—-]\s*forbidden/i)).toBeVisible();
    await expect(
      page.getByText(/administrator privileges/i),
    ).toBeVisible();
  });

  test("staff is blocked from the users list with an inline 403", async ({
    page,
  }) => {
    await page.goto("/dashboard/settings/users");
    await expect(page.getByText(/403\s*[—-]\s*forbidden/i)).toBeVisible();
  });

  test("staff can still reach their own /dashboard/account", async ({
    page,
  }) => {
    await page.goto("/dashboard/account");
    await expect(page.getByRole("heading", { name: /^account$/i })).toBeVisible();
    await expect(page.getByText("staff@qollab.com")).toBeVisible();
  });
});
