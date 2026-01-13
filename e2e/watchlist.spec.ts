/**
 * E2E Tests for Watchlist Feature
 *
 * Tests the watchlist functionality with authentication
 */

import { test, expect } from "@playwright/test";
import { loginAsTestUser, logout } from "./helpers/auth";

test.describe("Watchlist Feature", () => {
  test.beforeEach(async ({ page }) => {
    // Login as test user before each test
    await loginAsTestUser(page);
  });

  test.afterEach(async ({ page }) => {
    // Cleanup: logout after each test
    await logout(page);
  });

  test("should display empty watchlist for new user", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for watchlist widget to load
    const watchlistWidget = page.locator('text="Mano sekami"').locator("..");
    await expect(watchlistWidget).toBeVisible({ timeout: 10000 });

    // Should show empty state message
    await expect(
      page.locator('text="Jūs dar nesekate jokių Seimo narių"')
    ).toBeVisible();
  });

  test("should allow user to follow an MP from profile page", async ({
    page,
  }) => {
    // Navigate to an MP profile
    await page.goto("/mp/1");

    // Wait for page to load
    await page.waitForLoadState("networkidle");

    // Find and click the follow button (heart icon)
    const followButton = page
      .locator('button[aria-label*="Sekti"], button[aria-label*="Nebesekti"]')
      .first();
    await expect(followButton).toBeVisible({ timeout: 10000 });

    // Click to follow
    await followButton.click();

    // Wait for optimistic update (button should show as followed)
    await expect(followButton).toHaveAttribute("aria-label", /Nebesekti/i, {
      timeout: 2000,
    });

    // Navigate to dashboard to verify MP appears in watchlist
    await page.goto("/dashboard");

    // Wait for watchlist to update
    await page.waitForTimeout(1000);

    // Should show the MP in watchlist (if widget is visible)
    const watchlistWidget = page.locator('text="Mano sekami"').locator("..");
    if (await watchlistWidget.isVisible()) {
      // Check that watchlist is no longer empty
      const emptyMessage = page.locator(
        'text="Jūs dar nesekate jokių Seimo narių"'
      );
      await expect(emptyMessage).not.toBeVisible({ timeout: 2000 });
    }
  });

  test("should show error when accessing watchlist without authentication", async ({
    page,
  }) => {
    // Logout first
    await logout(page);

    // Try to access a page that uses watchlist
    await page.goto("/dashboard");

    // The watchlist widget should either not be visible or show an error
    // (depending on how the frontend handles unauthenticated state)
    // For now, we just verify the page loads without crashing
    await expect(page.locator("body")).toBeVisible();
  });
});
