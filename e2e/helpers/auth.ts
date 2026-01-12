/**
 * E2E Test Helpers for Authentication
 * 
 * Provides utilities for mocking authentication state in Playwright tests.
 * 
 * IMPORTANT: For E2E tests to work with protected endpoints, you need to either:
 * 1. Mock the backend authentication (recommended for E2E)
 * 2. Use a real test user account with valid OAuth session
 * 
 * This helper provides option 1 by intercepting tRPC calls and mocking auth responses.
 */

import { Page } from "@playwright/test";
import { COOKIE_NAME } from "../../shared/const";

/**
 * Mock a logged-in user by intercepting tRPC calls and mocking auth context
 * 
 * This intercepts the tRPC auth.me call and returns a mock user,
 * effectively bypassing the real authentication for E2E tests.
 */
export async function loginAsTestUser(page: Page, userId: string = "test-user-123") {
  // Intercept tRPC calls to mock authentication
  await page.route("**/api/trpc/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    
    // Check if this is an auth.me query
    if (url.searchParams.has("input") && url.pathname.includes("auth.me")) {
      // Return mock user data
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          result: {
            data: {
              id: 1,
              openId: userId,
              name: "Test User",
              email: "test@example.com",
              loginMethod: "test",
              role: "user",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              lastSignedIn: new Date().toISOString(),
            },
          },
        }),
      });
      return;
    }
    
    // For protected endpoints, we need to ensure the context includes the user
    // This is handled by the backend createContext, but for E2E we can intercept
    // and add user context to requests that need it
    
    // Continue with normal request
    await route.continue();
  });

  // Also set a cookie for consistency
  await page.context().addCookies([
    {
      name: COOKIE_NAME,
      value: `mock-session-${userId}`,
      domain: "localhost",
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "Lax",
    },
  ]);
}

/**
 * Clear authentication state (logout)
 */
export async function logout(page: Page) {
  await page.context().clearCookies();
  // Unroute any auth intercepts
  await page.unroute("**/api/trpc/*");
}

/**
 * Check if user is authenticated by verifying cookie exists
 */
export async function isAuthenticated(page: Page): Promise<boolean> {
  const cookies = await page.context().cookies();
  return cookies.some(cookie => cookie.name === COOKIE_NAME);
}
