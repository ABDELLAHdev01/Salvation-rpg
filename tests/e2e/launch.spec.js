import { test, expect } from '@playwright/test';

test.describe('Game Launch & Initialization', () => {
  test('launches game, mounts canvas, and loads player without console errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', (err) => errors.push(err.message));

    // Seed mock profile so game loads directly to world
    await page.addInitScript(() => {
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.setItem(
        'mockCharacters',
        JSON.stringify({
          'offline-hero': {
            name: 'Hero',
            race: 'human',
            className: 'Vanguard',
            customization: {
              skinTone: '#fcd34d',
              hairStyle: 'short',
              hairColor: '#451a03',
              eyeStyle: 'normal',
              outfit: 'tunic',
              outfitColor: '#1e3a8a',
              headwear: 'none',
              accessory: 'none',
              equippedTool: 'steel_broadsword',
            },
          },
        })
      );
      localStorage.setItem(
        'mockProfiles',
        JSON.stringify({
          'offline-hero': {
            username: 'offline-hero',
            stats: { level: 1, xp: 0, power: 120, gold: 350 },
            inventory: { 'health-potion': 3, iron: 6, copper: 4, turnip: 5 },
          },
        })
      );
    });

    await page.goto('/');

    // Verify canvas is mounted
    const canvas = page.locator('canvas').first();
    await expect(canvas).toBeVisible({ timeout: 15000 });

    // Verify Phaser game instance and WorldScene player are available
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      const scene = g?.scene?.getScene('WorldScene');
      return !!g?.isBooted && !!scene?.player;
    }, { timeout: 15000 });

    const isRunning = await page.evaluate(() => {
      const g = window.__PHASER_GAME__;
      return g && g.isRunning && g.scene.isActive('WorldScene');
    });
    expect(isRunning).toBe(true);

    // Verify no critical unhandled errors
    expect(errors).toEqual([]);
  });
});
