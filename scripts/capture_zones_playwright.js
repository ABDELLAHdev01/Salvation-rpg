import { chromium } from '@playwright/test';
import path from 'path';
import fs from 'fs';

async function main() {
  const browser = await chromium.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: true,
  });
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

  await page.addInitScript(() => {
    localStorage.setItem('hasCreatedCharacter', 'true');
    localStorage.setItem('wardenTutorialCompleted', 'true');
  });

  await page.goto('http://127.0.0.1:5173/');
  await page.waitForFunction(() => {
    const s = window.__PHASER_GAME__?.scene?.getScene('WorldScene');
    return s && s.player && !s.isTransitioning;
  }, { timeout: 15000 });

  const outDir = 'C:\\Users\\abdel\\WorkSpace\\screenshots';
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  for (const zone of ['village', 'forest', 'homestead', 'west_road']) {
    console.log(`Switching to ${zone}...`);
    await page.evaluate((z) => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.isTransitioning = false;
      s.switchZone(z);
    }, zone);

    await page.waitForFunction((z) => {
      const s = window.__PHASER_GAME__?.scene?.getScene('WorldScene');
      return s && s.currentZone === z && !s.isTransitioning;
    }, zone, { timeout: 10000 });

    await page.waitForTimeout(800);
    const shotPath = path.join(outDir, `${zone}.png`);
    await page.screenshot({ path: shotPath });
    console.log(`Saved ${shotPath}`);
  }

  await browser.close();
  console.log('Capture completed!');
}

main().catch(console.error);
