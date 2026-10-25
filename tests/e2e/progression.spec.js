import { test, expect } from '@playwright/test';

test.describe('Tutorial Island & Realm Progression Lifecycle', () => {
  test('new game spawns on Tutorial Island and departs permanently to Homestead', async ({ page }) => {
    // Fresh profile - no tutorial completion
    await page.addInitScript(() => {
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.removeItem('wardenTutorialCompleted');
      localStorage.removeItem('wardenTutorialHidden');
      localStorage.removeItem('wardenTutorialStep');
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
            inventory: {},
          },
        })
      );
    });

    await page.goto('/');

    // Verify initial spawn zone is tutorial_island
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      const s = g?.scene?.getScene('WorldScene');
      return s && s.player && s.currentZone === 'tutorial_island';
    }, { timeout: 15000 });

    const initialZone = await page.evaluate(() => {
      return window.__PHASER_GAME__.scene.getScene('WorldScene').currentZone;
    });
    expect(initialZone).toBe('tutorial_island');

    // 1. Verify Player Spawn Position and Facing West
    const spawnState = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        x: s.player.x,
        y: s.player.y,
        facing: s.playerFacing,
      };
    });
    expect(spawnState.x).toBe(410);
    expect(spawnState.y).toBe(520);
    expect(spawnState.facing).toBe('west');

    // 2. Verify Return Home safety check (isolated tutorial island cannot fast-travel home prematurely)
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.returnHome();
    });
    await page.waitForTimeout(300);
    const stillIsland = await page.evaluate(() => {
      return window.__PHASER_GAME__.scene.getScene('WorldScene').currentZone;
    });
    expect(stillIsland).toBe('tutorial_island');

    // 3. Move to departure pier near sailboat (x: 400, y: 580)
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.player.setPosition(400, 580);
    });
    await page.waitForTimeout(400);

    const promptText = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s.activePrompt ? s.activePrompt.prompt : null;
    });
    expect(promptText).toContain('Board Sloop to Sunforge Mainland');

    // Trigger departure
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      if (s.activePrompt?.onTrigger) s.activePrompt.onTrigger();
    });

    // Wait for arrival at Homestead
    await page.waitForFunction(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return s && s.currentZone === 'homestead';
    }, { timeout: 15000 });

    const finalZone = await page.evaluate(() => {
      return window.__PHASER_GAME__.scene.getScene('WorldScene').currentZone;
    });
    expect(finalZone).toBe('homestead');

    // Verify tutorial completed flag persisted in localStorage
    const isCompleted = await page.evaluate(() => {
      return localStorage.getItem('wardenTutorialCompleted');
    });
    expect(isCompleted).toBe('true');
  });

  test('navigates seamlessly across open-world zones and verifies active zone state', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.setItem('wardenTutorialCompleted', 'true');
      localStorage.setItem(
        'mockCharacters',
        JSON.stringify({
          'offline-hero': { name: 'Hero', race: 'human', className: 'Vanguard' },
        })
      );
      localStorage.setItem(
        'mockProfiles',
        JSON.stringify({
          'offline-hero': {
            username: 'offline-hero',
            stats: { level: 1, xp: 0, power: 120, gold: 350 },
          },
        })
      );
    });

    await page.goto('/');

    await page.waitForFunction(() => {
      const s = window.__PHASER_GAME__?.scene?.getScene('WorldScene');
      return s && s.player && !s.isTransitioning;
    }, { timeout: 15000 });

    const zonesToVerify = ['village', 'forest', 'mine', 'west_road', 'homestead'];
    for (const z of zonesToVerify) {
      await page.evaluate((targetZone) => {
        const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
        s.isTransitioning = false;
        s.switchZone(targetZone);
      }, z);

      await page.waitForFunction((targetZone) => {
        const s = window.__PHASER_GAME__?.scene?.getScene('WorldScene');
        return s && s.currentZone === targetZone && !s.isTransitioning;
      }, z, { timeout: 10000 });

      const currentZone = await page.evaluate(() => {
        return window.__PHASER_GAME__.scene.getScene('WorldScene').currentZone;
      });
      expect(currentZone).toBe(z);

      // Save screenshot
      await page.screenshot({ path: `C:/Users/abdel/WorkSpace/screenshots/${z}.png` });
    }
  });
});
