import { chromium } from 'playwright';

const url = process.argv[2];
const name = process.argv[3] || '';
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

try {
  await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
  await page.waitForTimeout(5000);

  // Get time slots and plan names from schedule
  const scheduleData = await page.evaluate(() => {
    const columns = document.querySelectorAll('.schedule_container, .schedule-column, [class*="schedule_col"]');
    const boxes = document.querySelectorAll('.program-schedule-box');
    const seen = new Set();
    const plans = [];
    const timeSlots = [];

    for (const b of boxes) {
      const label = b.querySelector('.schedule-label')?.innerText?.trim();
      const timeEl = b.closest('[class*="schedule"]')?.querySelector('[class*="time"], .schedule-time');
      const parentText = b.parentElement?.innerText?.trim() || '';

      // Extract time from parent text (format like "8:30 - 10:00")
      const timeMatch = parentText.match(/(\d{1,2}:\d{2})\s*[-~〜]\s*(\d{1,2}:\d{2})/);
      if (timeMatch && label) {
        timeSlots.push({ label, time: `${timeMatch[1]}-${timeMatch[2]}`, full: parentText.includes('FULL') });
      }

      if (label && !seen.has(label) && !b.innerText.includes('FULL')) {
        seen.add(label);
        plans.push({ label, index: Array.from(boxes).indexOf(b) });
      }
    }
    return { plans, timeSlots };
  });

  // Group time slots by plan name
  const slotsByPlan = {};
  for (const s of scheduleData.timeSlots) {
    if (!slotsByPlan[s.label]) slotsByPlan[s.label] = new Set();
    slotsByPlan[s.label].add(s.time);
  }

  console.log(`=== ${name} ===`);
  console.log(`URL: ${url}`);

  // Print time slots per plan
  console.log(`\n[時間枠]`);
  for (const [plan, times] of Object.entries(slotsByPlan)) {
    const sortedTimes = Array.from(times).sort();
    console.log(`  ${plan}: ${sortedTimes.join(', ')}`);
  }

  // Get prices
  console.log(`\n[料金]`);
  for (const plan of scheduleData.plans) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(3000);

    await page.evaluate((idx) => {
      const boxes = document.querySelectorAll('.program-schedule-box');
      if (boxes[idx]) boxes[idx].dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, plan.index);

    await page.waitForTimeout(2000);
    const navUrl = page.url();
    const spaceId = navUrl.match(/space\/([A-Z0-9]+)/i)?.[1];
    if (!spaceId) { console.log(`  ${plan.label} | NO SPACE ID`); continue; }

    const base = navUrl.split('/reserve/')[0];
    const ticketUrl = `${base}/reserve/space/${spaceId}/ticket-purchase-register/?no=`;
    await page.goto(ticketUrl, { waitUntil: 'networkidle', timeout: 15000 });
    await page.waitForTimeout(2000);

    const priceText = await page.innerText('body');
    const priceMatch = priceText.match(/¥([\d,]+)/);
    console.log(`  ${plan.label} | ¥${priceMatch ? priceMatch[1] : 'not found'}`);
  }

  if (scheduleData.plans.length === 0) {
    console.log('  ※ 空き枠なし（全てFULL）- 料金取得不可');
  }
} catch(e) {
  console.log(`=== ${name} ===`);
  console.log(`ERROR: ${e.message}`);
} finally {
  await browser.close();
}
