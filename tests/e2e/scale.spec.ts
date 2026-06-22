import { test, expect } from "@playwright/test";

test.describe("Scale page (bars from zero)", () => {
  test("renders the wealth-to-scale region, heading, bars, and controls", async ({ page }) => {
    await page.goto("/scale");
    await expect(page.getByRole("region", { name: "Wealth to scale" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Wealth, to scale" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Play" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Skip to $1B" })).toBeVisible();
    // many bars render at the start
    expect(await page.getByTestId("wealth-bar").count()).toBeGreaterThan(8);
  });

  test("travelling ends bars: fewer remain 'running' after skipping to $1B", async ({ page }) => {
    await page.goto("/scale");
    const runningStart = await page.locator('[data-testid="wealth-bar"][data-state="running"]').count();
    const endedStart = await page.locator('[data-testid="wealth-bar"][data-state="ended"]').count();
    await page.getByRole("button", { name: "Skip to $1B" }).click();
    await expect(page.getByRole("status", { name: "Current position" })).toContainText("B");
    const runningAfter = await page.locator('[data-testid="wealth-bar"][data-state="running"]').count();
    const endedAfter = await page.locator('[data-testid="wealth-bar"][data-state="ended"]').count();
    expect(runningAfter).toBeLessThan(runningStart);
    expect(endedAfter).toBeGreaterThan(endedStart);
  });

  test("UK locale shows a UK Rich List bar", async ({ page }) => {
    await page.goto("/scale");
    await page.getByRole("button", { name: "GBP" }).click();
    await expect(page.getByText("Hinduja family")).toBeVisible();
  });

  test("home page links to the scale page", async ({ page }) => {
    await page.goto("/");
    const link = page.getByRole("link", { name: "See how big a trillion really is →" });
    await expect(link).toBeVisible();
    await link.click();
    await expect(page).toHaveURL(/\/scale\/?$/);
  });
});
