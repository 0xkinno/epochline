import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function capture() {
  const dir = path.resolve(process.cwd(), 'video', 'captures');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  console.log('Launching chromium...');
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });

  console.log('Capturing Landing Page...');
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, '01_landing.png') });

  console.log('Capturing Lab Initial...');
  await page.goto('http://localhost:3000/lab', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, '02_lab_clean.png') });

  console.log('Triggering Contamination...');
  const contamBtn = page.getByRole('button', { name: /Contaminate|Inject|Future/i }).first();
  if (await contamBtn.isVisible()) {
    await contamBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(dir, '03_lab_refusal.png') });

  console.log('Restoring Clean Snapshot...');
  const cleanBtn = page.getByRole('button', { name: /Clean|Restore|Reset/i }).first();
  if (await cleanBtn.isVisible()) {
    await cleanBtn.click();
    await page.waitForTimeout(800);
  }
  await page.screenshot({ path: path.join(dir, '04_lab_valid.png') });

  console.log('Capturing Proof Center...');
  await page.goto('http://localhost:3000/proof', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(dir, '05_proof_center.png') });

  await browser.close();
  console.log('All captures saved successfully!');
}

capture().catch((err) => {
  console.error(err);
  process.exit(1);
});
