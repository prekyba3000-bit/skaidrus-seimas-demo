import { test, expect } from "@playwright/test";

test.describe("Dashboard Search", () => {
  test("should filter bills when searching", async ({ page }) => {
    // 1. Go to dashboard
    await page.goto("/dashboard");

    // 2. Wait for the page to load and check that the list loads (> 0 items)
    // Wait for at least one activity item to appear
    await expect(page.locator('.activity-item').first()).toBeVisible({ timeout: 10000 });

    // Count initial items
    const activityItems = page.locator('.activity-item');
    const initialItemCount = await activityItems.count();
    expect(initialItemCount).toBeGreaterThan(0);

    // 3. Type "Dėl" into the search bar
    // Find the search input in the dashboard (not header)
    const searchInput = page.locator('input[placeholder*="Ieškoti pagal pavadinimą"], input[placeholder*="ieškoti pagal"]').first();
    await expect(searchInput).toBeVisible();
    
    await searchInput.fill("Dėl");

    // 4. Wait 1 second for debounce and API call
    await page.waitForTimeout(1000);

    // 5. Verify that the list content has changed/filtered
    // Wait for the list to update (might show loading state first)
    await page.waitForTimeout(500); // Additional wait for API response

    // Check that we still have results (filtered items)
    await expect(page.locator('.activity-item').first()).toBeVisible();
    
    const filteredItems = page.locator('.activity-item');
    const filteredCount = await filteredItems.count();
    
    // Should have some items (might be fewer than initial)
    expect(filteredCount).toBeGreaterThan(0);

    // Verify that at least one item contains "Dėl" in the title
    // The bill title should be visible in the activity item
    const hasFilteredContent = await page.locator('text=/Dėl/i').count();
    expect(hasFilteredContent).toBeGreaterThan(0);
  });

  test("should show all items when search is cleared", async ({ page }) => {
    await page.goto("/dashboard");

    // Wait for initial load
    const activityItems = page.locator('.activity-item');
    await expect(activityItems.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await activityItems.count();

    // Search for something
    const searchInput = page.locator('input[placeholder*="Ieškoti pagal pavadinimą"], input[placeholder*="ieškoti pagal"]').first();
    await searchInput.fill("Dėl");
    await page.waitForTimeout(1500); // Wait for debounce + API

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(1500); // Wait for debounce + API

    // Should show all items again
    const finalCount = await activityItems.count();
    expect(finalCount).toBeGreaterThanOrEqual(initialCount);
  });
});
