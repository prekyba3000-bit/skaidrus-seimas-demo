import { chromium, Browser, BrowserContext } from "playwright";

/**
 * Docker-compatible Playwright launch configuration
 * 
 * This configuration ensures Playwright works correctly in headless Docker environments
 * by using the necessary Chrome flags for sandboxing restrictions.
 */
export function getPlaywrightLaunchOptions() {
  return {
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-accelerated-2d-canvas",
      "--no-first-run",
      "--no-zygote",
      "--disable-gpu",
    ],
  };
}

/**
 * Launch a browser with Docker-compatible configuration
 */
export async function launchBrowser(): Promise<Browser> {
  return await chromium.launch(getPlaywrightLaunchOptions());
}

/**
 * Create a browser context with default settings
 */
export async function createBrowserContext(
  browser: Browser
): Promise<BrowserContext> {
  return await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  });
}
