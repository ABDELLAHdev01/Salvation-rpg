import { test, expect } from '@playwright/test';

test.describe('Initial Character Creation & Immediate Responsive Walking', () => {
  test('fresh game launch allows immediate keyboard walk and click-to-move without errors', async ({ page }) => {
    // Collect all console logs and errors
    const logs = [];
    const errors = [];
    page.on('console', (msg) => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', (err) => errors.push(err.message));

    // 1. Fresh session - enter character creation
    await page.goto('/character');

    // Fill character name
    await page.waitForSelector('input', { timeout: 10000 });
    const nameInput = page.locator('input').first();
    await nameInput.fill('Valen');

    // Click submit/create button
    const submitBtn = page.getByRole('button', { name: /Enter 2D Fantasy World/i }).first();
    await submitBtn.click();

    // 2. Wait for WorldScene to mount and initialize player
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      const s = g?.scene?.getScene('WorldScene');
      return s && s.player && s.player.body;
    }, { timeout: 15000 });

    const status = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        zone: s.currentZone,
        playerPos: { x: s.player.x, y: s.player.y },
        controlsLocked: s.controlsLocked,
        isTransitioning: s.isTransitioning,
        activePrompt: s.activePrompt ? s.activePrompt.prompt : null,
        activeElement: document.activeElement ? `${document.activeElement.tagName}` : null,
      };
    });

    expect(status.zone).toBe('tutorial_island');
    expect(status.playerPos.x).toBe(410);
    expect(status.playerPos.y).toBe(520);
    expect(status.controlsLocked).toBe(false);
    expect(status.activeElement).toBe('CANVAS');

    // 3. Test Keyboard ArrowRight Walking
    await page.keyboard.down('ArrowRight');
    await page.waitForTimeout(400);
    const afterArrow = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        playerPos: { x: s.player.x, y: s.player.y },
        playerVelocity: { x: s.player.body.velocity.x, y: s.player.body.velocity.y },
        cursorsRightIsDown: s.cursors?.right?.isDown,
      };
    });
    await page.keyboard.up('ArrowRight');
    expect(afterArrow.playerPos.x).toBeGreaterThan(status.playerPos.x);

    // 4. Test KeyD (WASD) Walking
    await page.keyboard.down('KeyD');
    await page.waitForTimeout(400);
    const afterKeyD = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        playerPos: { x: s.player.x, y: s.player.y },
        playerVelocity: { x: s.player.body.velocity.x, y: s.player.body.velocity.y },
        keyDIsDown: s.keyD?.isDown,
      };
    });
    await page.keyboard.up('KeyD');
    expect(afterKeyD.playerPos.x).toBeGreaterThan(afterArrow.playerPos.x);

    // 5. Test Click-To-Move functionality
    await page.mouse.click(640, 400);
    await page.waitForTimeout(500);
    const afterClick = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        playerPos: { x: s.player.x, y: s.player.y },
        playerVelocity: { x: s.player.body.velocity.x, y: s.player.body.velocity.y },
        moveTarget: s.moveTarget,
      };
    });
    expect(afterClick.moveTarget).not.toBeNull();

    // Verify zero console page errors (no null sourceSize or setVelocity crashes)
    expect(errors).toHaveLength(0);
  });
});
