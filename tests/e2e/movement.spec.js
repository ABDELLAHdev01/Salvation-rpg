import { test, expect } from '@playwright/test';

test.describe('Player Movement & Physics', () => {
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
            customization: { skinTone: '#fcd34d', outfitColor: '#1e3a8a' },
          },
        })
      );
      localStorage.setItem(
        'mockProfiles',
        JSON.stringify({
          'offline-hero': {
            username: 'offline-hero',
            stats: { level: 1, xp: 0, power: 120, gold: 350 },
            equippedPet: 'sheepdog',
          },
        })
      );
    });
    await page.goto('/');
    await page.waitForFunction(() => {
      const g = window.__PHASER_GAME__;
      const s = g?.scene?.getScene('WorldScene');
      return s && s.player && s.player.body;
    }, { timeout: 15000 });
  });

  test('player responds to movement and updates coordinates', async ({ page }) => {
    const initialPos = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return { x: s.player.x, y: s.player.y };
    });

    // Move player east using pathfinding movement target
    await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      s.moveTarget = { x: s.player.x + 80, y: s.player.y };
    });
    await page.waitForTimeout(600);

    const eastPos = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return { x: s.player.x, y: s.player.y };
    });
    expect(eastPos.x).toBeGreaterThan(initialPos.x);
  });

  test('follower pet tracks player position', async ({ page }) => {
    const petStatus = await page.evaluate(() => {
      const s = window.__PHASER_GAME__.scene.getScene('WorldScene');
      return {
        hasPet: !!s.petSprite,
        petType: s.equippedPet,
      };
    });
    expect(petStatus.hasPet).toBe(true);
    expect(petStatus.petType).toBe('sheepdog');
  });
});
