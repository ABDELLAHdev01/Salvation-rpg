import { describe, it, expect } from 'vitest';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_STYLES,
  OUTFITS,
  OUTFIT_COLORS,
  HEADWEAR,
  ACCESSORIES,
  EQUIPPED_TOOLS,
  DEFAULT_CUSTOMIZATION,
  sanitizeCustomization,
  getRandomCustomization,
} from '../src/core/phaser/characterCustomizationData';
import {
  FRAME_WIDTH,
  FRAME_HEIGHT,
  renderCharacterPreviewDataUrl,
} from '../src/core/phaser/CharacterSpriteGenerator';
import gameEventBridge, { gameEvents } from '../src/core/phaser/gameEventBridge';

describe('2D Fantasy Character Customization & Sprite Pipeline', () => {
  describe('Customization Data Model & Palette Definitions', () => {
    it('defines comprehensive palette options for all 10 character categories', () => {
      expect(SKIN_TONES.length).toBeGreaterThanOrEqual(6);
      expect(HAIR_STYLES.length).toBeGreaterThanOrEqual(6);
      expect(HAIR_COLORS.length).toBeGreaterThanOrEqual(6);
      expect(EYE_STYLES.length).toBeGreaterThanOrEqual(6);
      expect(OUTFITS.length).toBeGreaterThanOrEqual(5);
      expect(OUTFIT_COLORS.length).toBeGreaterThanOrEqual(5);
      expect(HEADWEAR.length).toBeGreaterThanOrEqual(5);
      expect(ACCESSORIES.length).toBeGreaterThanOrEqual(4);
      expect(EQUIPPED_TOOLS.length).toBeGreaterThanOrEqual(4);
    });

    it('provides valid defaults adhering to all defined palette keys', () => {
      expect(DEFAULT_CUSTOMIZATION).toBeDefined();
      expect(SKIN_TONES.some((s) => s.id === DEFAULT_CUSTOMIZATION.skinTone)).toBe(true);
      expect(HAIR_STYLES.some((h) => h.id === DEFAULT_CUSTOMIZATION.hairstyle)).toBe(true);
      expect(HAIR_COLORS.some((c) => c.id === DEFAULT_CUSTOMIZATION.hairColor)).toBe(true);
      expect(EYE_STYLES.some((e) => e.id === DEFAULT_CUSTOMIZATION.eyeStyle)).toBe(true);
      expect(OUTFITS.some((o) => o.id === DEFAULT_CUSTOMIZATION.outfit)).toBe(true);
      expect(OUTFIT_COLORS.some((c) => c.id === DEFAULT_CUSTOMIZATION.outfitColor)).toBe(true);
      expect(HEADWEAR.some((h) => h.id === DEFAULT_CUSTOMIZATION.headwear)).toBe(true);
      expect(ACCESSORIES.some((a) => a.id === DEFAULT_CUSTOMIZATION.accessory)).toBe(true);
      expect(EQUIPPED_TOOLS.some((t) => t.id === DEFAULT_CUSTOMIZATION.equippedTool)).toBe(true);
    });

    it('sanitizes invalid or corrupted customization payloads', () => {
      const sanitizedEmpty = sanitizeCustomization(null);
      expect(sanitizedEmpty).toEqual(DEFAULT_CUSTOMIZATION);

      const corrupted = {
        skinTone: 'neon_pink_alien',
        hairstyle: 'mohawk_999',
        hairColor: 'gamma_ray',
        eyeStyle: 'infrared',
        outfit: 'cyber_mech',
        outfitColor: 'hologram',
        headwear: 'space_helmet',
        accessory: 'jetpack',
        equippedTool: 'plasma_cannon',
      };

      const sanitizedCorrupted = sanitizeCustomization(corrupted);
      expect(sanitizedCorrupted.skinTone).toBe(DEFAULT_CUSTOMIZATION.skinTone);
      expect(sanitizedCorrupted.hairstyle).toBe(DEFAULT_CUSTOMIZATION.hairstyle);
      expect(sanitizedCorrupted.hairColor).toBe(DEFAULT_CUSTOMIZATION.hairColor);
      expect(sanitizedCorrupted.equippedTool).toBe(DEFAULT_CUSTOMIZATION.equippedTool);
    });

    it('generates valid randomized character configurations', () => {
      const random1 = getRandomCustomization();
      const random2 = getRandomCustomization();

      expect(SKIN_TONES.some((s) => s.id === random1.skinTone)).toBe(true);
      expect(HAIR_STYLES.some((h) => h.id === random1.hairstyle)).toBe(true);
      expect(HAIR_COLORS.some((c) => c.id === random1.hairColor)).toBe(true);
      expect(OUTFITS.some((o) => o.id === random1.outfit)).toBe(true);
      expect(EQUIPPED_TOOLS.some((t) => t.id === random1.equippedTool)).toBe(true);

      expect(random1).toBeDefined();
      expect(random2).toBeDefined();
    });
  });

  describe('Sprite Dimensions and Preview Rendering Safety', () => {
    it('enforces canonical 32x32 pixel-art frame dimensions', () => {
      expect(FRAME_WIDTH).toBe(32);
      expect(FRAME_HEIGHT).toBe(32);
    });

    it('handles headless / non-browser preview render safely without throwing', () => {
      // In node / jsdom without canvas support, should return empty string gracefully
      const preview = renderCharacterPreviewDataUrl(DEFAULT_CUSTOMIZATION, 'south', 4);
      expect(typeof preview).toBe('string');
    });
  });

  describe('Phaser <-> React Event Bridge', () => {
    it('supports subscribing, emitting, and cleanly unsubscribing events', () => {
      let receivedZone = null;
      const unsubscribe = gameEventBridge.on(gameEvents.ZONE_CHANGED, ({ zone }) => {
        receivedZone = zone;
      });

      gameEventBridge.emit(gameEvents.ZONE_CHANGED, { zone: 'mine' });
      expect(receivedZone).toBe('mine');

      unsubscribe();
      gameEventBridge.emit(gameEvents.ZONE_CHANGED, { zone: 'forest' });
      // Should remain 'mine' because listener was unsubscribed
      expect(receivedZone).toBe('mine');
    });

    it('defines all required world interaction events', () => {
      expect(gameEvents.INTERACTION_AVAILABLE).toBe('interaction:available');
      expect(gameEvents.INTERACTION_CLEARED).toBe('interaction:cleared');
      expect(gameEvents.ZONE_CHANGED).toBe('zone:changed');
      expect(gameEvents.FARM_PLOT_INTERACT).toBe('farm:interact');
      expect(gameEvents.MINE_NODE_INTERACT).toBe('mine:interact');
      expect(gameEvents.CHEST_OPEN).toBe('chest:open');
      expect(gameEvents.WORKBENCH_OPEN).toBe('workbench:open');
      expect(gameEvents.SWITCH_ZONE).toBe('zone:switch');
      expect(gameEvents.REFRESH_CUSTOMIZATION).toBe('player:refresh_customization');
    });
  });
});
