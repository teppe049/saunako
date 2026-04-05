import { chromium } from 'playwright';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const browser = await chromium.launch();
const page = await browser.newPage();
await page.setViewportSize({ width: 1500, height: 500 });
await page.goto(`file://${join(__dirname, 'x-header.html')}`);
await page.waitForTimeout(500);
await page.screenshot({
  path: join(__dirname, '..', 'x-header.png'),
  clip: { x: 0, y: 0, width: 1500, height: 500 },
});
console.log('Captured: x-header.png (1500x500)');
await browser.close();
