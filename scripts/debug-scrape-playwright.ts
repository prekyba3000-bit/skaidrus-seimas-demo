import { chromium } from "playwright";
import { writeFileSync } from "fs";

async function main() {
  const url = "https://e-seimas.lrs.lt/portal/legalAct/lt/TAP/";
  const browser = await chromium.launch();
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const content = await page.content();
  writeFileSync("debug-playwright.html", content);
  console.log("Saved debug-playwright.html, length", content.length);
  await browser.close();
}

main().catch(console.error);
