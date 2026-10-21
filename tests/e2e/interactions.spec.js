import { test, expect } from '@playwright/test';

test.describe('In-World Interactions & Zone Portals', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.setItem('wardenTutorialCompleted', 'true');
      localStorage.setItem(
        'mockCharacters',
        JSON.stringify({
          'offline-hero': {
            name: 'Hero',
            race: 'human',
            className: 'Vanguard',
          },
        })
      );
      localStorage.setItem(
        'mockProfiles',
        JSON.stringify({
          'offline-hero': {
            username: 'offline-hero',
            stats: { level: 1, xp: 0, power: 120, gold: 350 },
            inventory: { 'health-potion': 2 },
          },
        })
      );
    });
    await page.goto('/');
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      const s = g?.scene?.getScene('WorldScene');
      return s && s.player && s.currentZone === 'homestead';
    }, { timeout: 15000 });
  });

  test('approaching cottage front door displays interaction prompt and allows entering', async ({ page }) => {
    // Teleport player near front door (x: 14 * 32 + 16, y: 7 * 32 + 20)
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.player.setPosition(14 * 32 + 16, 7 * 32 + 20);
    });

    await page.waitForTimeout(400);

    // Verify active prompt is displayed
    const promptText = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s.activePrompt ? s.activePrompt.prompt : null;
    });
    expect(promptText).toContain('Enter Cottage Home');

    // Trigger door entrance
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      if (s.activePrompt?.onTrigger) s.activePrompt.onTrigger();
    });

    // Wait for transition to homestead_interior
    await page.waitForFunction(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s && s.currentZone === 'homestead_interior';
    }, { timeout: 15000 });

    const currentZone = await page.evaluate(() => {
      return window.__PHASER_GAME__.scene.getScene('WorldScene').currentZone;
    });
    expect(currentZone).toBe('homestead_interior');
  });

  test('resting in bed restores player health', async ({ page }) => {
    // Fast-travel into Cottage Home via travel ribbon
    const cottageBtn = page.locator('button[title*="Cottage Home"]');
    await cottageBtn.click();

    await page.waitForFunction(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s && s.currentZone === 'homestead_interior' && s.player;
    }, { timeout: 15000 });

    // Damage player and move next to bed (x: 13 * 32 + 16, y: 11 * 32 + 16)
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.playerHp = 25;
      s.player.setPosition(13 * 32 + 16, 11 * 32 + 16);
    });

    await page.waitForTimeout(400);

    // Verify bed prompt
    const promptText = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s.activePrompt ? s.activePrompt.prompt : null;
    });
    expect(promptText).toContain('Sleep in Bed');

    // Trigger sleep in bed
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      if (s.activePrompt?.onTrigger) s.activePrompt.onTrigger();
    });

    await page.waitForTimeout(400);

    // Verify HP restored to maximum
    const hpStatus = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return { hp: s.playerHp, maxHp: s.playerMaxHp };
    });
    expect(hpStatus.hp).toBe(hpStatus.maxHp);
  });
});
