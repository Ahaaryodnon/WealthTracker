import { test, expect } from "@playwright/test";

test.describe("Scale page", () => {
  test("renders the journey with heading and controls", async ({ page }) => {
    await page.goto("/scale");

    await expect(
      page.getByRole("region", { name: "Million, billion, trillion scale journey" })
    ).toBeVisible();

    await expect(page.getByRole("heading", { name: "A million, a billion, a trillion" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip to $1B" })).toBeVisible();
  });

  test("odometer advances when playing", async ({ page }) => {
    await page.goto("/scale");

    const odometer = page.getByRole("status", { name: "Current position on the scale" });
    await expect(odometer).toBeVisible();
    const before = await odometer.textContent();

    await page.getByRole("button", { name: "Play" }).click();
    await page.waitForTimeout(800);
    // Pause to freeze the value for comparison
    await page.getByRole("button", { name: "Pause" }).click();
    const after = await odometer.textContent();

    expect(after).not.toEqual(before);
  });

  test("skip to $1B jumps the odometer into the billions", async ({ page }) => {
    await page.goto("/scale");
    await page.getByRole("button", { name: "Skip to $1B" }).click();
    const odometer = page.getByRole("status", { name: "Current position on the scale" });
    await expect(odometer).toContainText("B");
  });

  test("home page links to the scale page", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "See how big a trillion really is →" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/scale\/?$/);
  });
});
