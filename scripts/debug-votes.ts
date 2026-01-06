import { chromium } from "playwright";

async function minimalScrape() {
    const browser = await chromium.launch();
    const page = await browser.newPage();
    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    });
    const page2 = await context.newPage();

    console.log("Navigating...");
    await page2.goto("https://www.lrs.lt/sip/portal.show?p_r=37067&p_k=1");
    
    // Cookie banner
    try {
        await page2.getByRole('button', { name: 'Patvirtinti visus' }).click({timeout: 2000});
    } catch(e) {}

    // Wait network idle
    await page2.waitForLoadState('networkidle');

    // Screenshot to see what's going on (simulated check via text dump)
    const text = await page2.innerHTML('body');
    console.log("HTML length:", text.length);
    
    // Check if the form is actually visible
    const formVisible = await page2.isVisible('form[name="formBalsKadencija"]');
    console.log("Form Visible:", formVisible);

    // Try just extracting the dropdown values without clicking
    const options = await page2.$$eval('.dropdownOption', opts => opts.map(o => o.innerText));
    console.log("Available Dropdown Options:", options);

    await browser.close();
}

minimalScrape().catch(console.error);
