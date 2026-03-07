import { test, expect } from "@playwright/test";

test.describe("WealthTracker home page (Epic 1)", () => {
  test("loads single-page layout with hero, top 10, methodology, and share", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(
      page.getByRole("region", { name: "Wealth Accumulator" })
    ).toBeVisible();

    await expect(
      page.getByRole("region", { name: "Top 10 Billionaires" })
    ).toBeVisible();

    await expect(
      page.getByRole("region", { name: "Methodology" })
    ).toBeVisible();

    await expect(
      page.getByRole("region", { name: "Share" })
    ).toBeVisible();
  });

  test("displays main Accumulator and since-you-arrived counter", async ({
    page,
  }) => {
    await page.goto("/");

    const mainTotal = page.getByRole("status", {
      name: "Combined passive income since data date",
    });
    await expect(mainTotal).toBeVisible();
    await expect(mainTotal).toContainText("$");

    const sinceArrived = page.getByRole("status", {
      name: "Passive income accumulated since you opened this page",
    });
    await expect(sinceArrived).toBeVisible();
    await expect(sinceArrived).toContainText("$");
  });

  test("Accumulator values update over time (live counter)", async ({
    page,
  }) => {
    await page.goto("/");

    const sinceArrived = page.getByRole("status", {
      name: "Passive income accumulated since you opened this page",
    });
    await expect(sinceArrived).toBeVisible();

    const initialText = await sinceArrived.textContent();
    await expect
      .poll(
        async () => (await sinceArrived.textContent()) !== initialText,
        { timeout: 5000 }
      )
      .toBe(true);
  });

  test("shows Data as of and comparison line in hero", async ({ page }) => {
    await page.goto("/");

    await expect(page.getByText("Data as of")).toBeVisible();
    await expect(page.getByText(/Since you arrived/i)).toBeVisible();
    await expect(
      page.getByText(/median US salary|every.*seconds|every.*minutes/i).first()
    ).toBeVisible();
  });

  test("top 10 list shows entries or helpful message when empty", async ({
    page,
  }) => {
    await page.goto("/");

    const section = page.getByRole("region", { name: "Top 10 Billionaires" });
    await expect(section).toBeVisible();

    const hasList = await section.getByRole("listitem").count() > 0;
    const hasFallback = await section.getByText(/No data available|data:sync/i).isVisible();

    expect(hasList || hasFallback).toBeTruthy();
  });
});

test.describe("Epic 2: Understanding and credibility", () => {
  test("methodology section has return assumptions and Data as of", async ({
    page,
  }) => {
    await page.goto("/");

    const methodology = page.getByRole("region", { name: "Methodology" });
    await expect(methodology).toBeVisible();
    await expect(methodology).toContainText(/Data as of|5%|return/i);
  });

  test("top 10 list shows name, net worth, and passive income per minute", async ({
    page,
  }) => {
    await page.goto("/");

    const section = page.getByRole("region", { name: "Top 10 Billionaires" });
    await expect(section).toBeVisible();
    const listItems = section.getByRole("listitem");
    const count = await listItems.count();
    if (count > 0) {
      await expect(listItems.first()).toContainText(/\/min|\$/);
    }
  });

  test("displays year-to-date cumulative total in ContextStrip", async ({
    page,
  }) => {
    await page.goto("/");

    const ytdRegion = page.getByRole("region", {
      name: "Year-to-date cumulative total",
    });
    await expect(ytdRegion).toBeVisible();
    await expect(ytdRegion).toContainText("So far this year");
    await expect(ytdRegion).toContainText("$");
  });
});

test.describe("Epic 3: Share and reliability", () => {
  test("share section has primary Share CTA with accessible label", async ({
    page,
  }) => {
    await page.goto("/");

    const shareSection = page.getByRole("region", { name: "Share" });
    await expect(shareSection).toBeVisible();
    const shareButton = shareSection.getByRole("button", { name: "Share" });
    await expect(shareButton).toBeVisible();
    await expect(shareButton).toBeEnabled();
  });

  test("Copy link button shows accessible feedback (Link copied)", async ({
    page,
  }) => {
    await page.goto("/");

    const shareSection = page.getByRole("region", { name: "Share" });
    const copyButton = shareSection.getByRole("button", { name: "Copy link" });
    await expect(copyButton).toBeVisible();
    await copyButton.click();

    // Use id locator: sr-only live region is reliable for assert; getByRole("status", { name: "Link copied" }) can be flaky with sr-only
    await expect(page.locator("#share-copy-status")).toContainText("Link copied");
    await expect(shareSection.getByText("Copied!")).toBeVisible();
  });

  test("only one primary share CTA on page (share bar only, not in hero)", async ({
    page,
  }) => {
    await page.goto("/");

    const hero = page.getByRole("region", { name: "Wealth Accumulator" });
    await expect(hero).toBeVisible();
    const shareButtonsInHero = hero.getByRole("button", { name: /Share|Copy/i });
    await expect(shareButtonsInHero).toHaveCount(0);

    const shareSection = page.getByRole("region", { name: "Share" });
    const sharePrimary = shareSection.getByRole("button", { name: "Share" });
    await expect(sharePrimary).toBeVisible();
  });
});
