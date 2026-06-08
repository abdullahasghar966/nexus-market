import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("renders hero, stats, and featured products", async ({ page }) => {
    await page.goto("/");

    await expect(
      page.getByRole("heading", {
        name: /the global marketplace for quality goods/i,
      }),
    ).toBeVisible();

    await expect(page.getByText("Explore Categories")).toBeVisible();
    await expect(page.getByText("Featured Products")).toBeVisible();
    await expect(page.getByText("Featured Vendors")).toBeVisible();
  });

  test("can navigate to the shop", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("link", { name: /start shopping/i }).click();
    await expect(page).toHaveURL(/\/products/);
    await expect(
      page.getByRole("heading", { name: /all products/i }),
    ).toBeVisible();
  });
});
