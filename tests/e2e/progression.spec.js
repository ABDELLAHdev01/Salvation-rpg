import { test, expect } from '@playwright/test';

test.describe('Tutorial Island & Realm Progression Lifecycle', () => {
  test('new game spawns on Tutorial Island and departs permanently to Homestead', async ({ page }) => {
    // Fresh profile - no tutorial completion
    await page.addInitScript(() => {
      localStorage.setItem('hasCreatedCharacter', 'true');
      localStorage.removeItem('wardenTutorialCompleted');
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

    // Verify departure pier prompt near sailboat (x: 400, y: 580)
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
});
