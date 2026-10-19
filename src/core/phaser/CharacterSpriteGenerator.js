/**
 * CharacterSpriteGenerator
 * Generates layered pixel-art spritesheets and standalone previews
 * dynamically from character customization data.
 */

import {
  SKIN_TONES,
  HAIR_COLORS,
  EYE_STYLES,
  OUTFIT_COLORS,
  HEADWEAR,
  sanitizeCustomization,
} from './characterCustomizationData';

export const FRAME_WIDTH = 32;
export const FRAME_HEIGHT = 32;

/**
 * Draws a single 32x32 character frame onto a 2D rendering context
 */
export function drawCharacterFrame(ctx, offsetX, offsetY, customization, direction, action, frameStep) {
  const custom = sanitizeCustomization(customization);

  const skin = SKIN_TONES.find((s) => s.id === custom.skinTone) || SKIN_TONES[0];
  const hair = HAIR_COLORS.find((h) => h.id === custom.hairColor) || HAIR_COLORS[0];
  const eye = EYE_STYLES.find((e) => e.id === custom.eyeStyle) || EYE_STYLES[0];
  const outfitColor = OUTFIT_COLORS.find((c) => c.id === custom.outfitColor) || OUTFIT_COLORS[0];
  const headwearObj = HEADWEAR.find((h) => h.id === custom.headwear) || HEADWEAR[0];

  // Bob offset for walk animation
  const bob = (action === 'walk' && (frameStep === 1 || frameStep === 3)) ? -1 : 0;
  const legOffset = (action === 'walk') ? (frameStep === 1 ? -1 : frameStep === 3 ? 1 : 0) : 0;

  ctx.save();
  ctx.translate(offsetX, offsetY);

  // 1. Soft Ground Shadow
  ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
  ctx.beginPath();
  ctx.ellipse(16, 29, 8, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  // 2. Back Cloak / Accessory
  if (custom.accessory === 'warden_cloak' && (direction === 'north' || direction === 'south' || direction === 'east' || direction === 'west')) {
    ctx.fillStyle = '#0f172a';
    if (direction === 'north') {
      ctx.fillRect(11, 14 + bob, 10, 13);
    } else if (direction === 'south') {
      ctx.fillRect(10, 16 + bob, 12, 11);
    } else {
      ctx.fillRect(10, 15 + bob, 8, 12);
    }
  }

  // 3. Legs & Boots
  ctx.fillStyle = '#1c1917'; // Boots dark leather
  if (direction === 'south' || direction === 'north') {
    ctx.fillRect(12 + legOffset, 24 + bob, 3, 5);
    ctx.fillRect(17 - legOffset, 24 + bob, 3, 5);
    // Boot cuffs
    ctx.fillStyle = '#451a03';
    ctx.fillRect(12 + legOffset, 24 + bob, 3, 2);
    ctx.fillRect(17 - legOffset, 24 + bob, 3, 2);
  } else if (direction === 'west') {
    ctx.fillRect(14 + legOffset, 24 + bob, 4, 5);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(14 + legOffset, 24 + bob, 4, 2);
  } else { // east
    ctx.fillRect(14 - legOffset, 24 + bob, 4, 5);
    ctx.fillStyle = '#451a03';
    ctx.fillRect(14 - legOffset, 24 + bob, 4, 2);
  }

  // 4. Torso / Outfit Body
  ctx.fillStyle = outfitColor.primary;
  ctx.fillRect(11, 14 + bob, 10, 10);
  // Outfit Trim / Secondary Belt
  ctx.fillStyle = outfitColor.secondary;
  ctx.fillRect(12, 16 + bob, 8, 8);
  ctx.fillStyle = outfitColor.trim;
  ctx.fillRect(11, 22 + bob, 10, 2); // Belt
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(15, 22 + bob, 2, 2); // Belt buckle

  // 5. Arms & Hands
  ctx.fillStyle = outfitColor.primary;
  if (direction === 'south') {
    ctx.fillRect(9, 15 + bob, 2, 6);
    ctx.fillRect(21, 15 + bob, 2, 6);
    // Hands (skin tone)
    ctx.fillStyle = skin.base;
    ctx.fillRect(9, 21 + bob, 2, 2);
    ctx.fillRect(21, 21 + bob, 2, 2);
  } else if (direction === 'north') {
    ctx.fillRect(9, 15 + bob, 2, 6);
    ctx.fillRect(21, 15 + bob, 2, 6);
  } else if (direction === 'west') {
    ctx.fillRect(12 + legOffset, 15 + bob, 3, 6);
    ctx.fillStyle = skin.base;
    ctx.fillRect(12 + legOffset, 21 + bob, 3, 2);
  } else { // east
    ctx.fillRect(17 - legOffset, 15 + bob, 3, 6);
    ctx.fillStyle = skin.base;
    ctx.fillRect(17 - legOffset, 21 + bob, 3, 2);
  }

  // 6. Head (Skin tone)
  ctx.fillStyle = skin.base;
  ctx.fillRect(11, 6 + bob, 10, 9);
  // Jawline shade
  ctx.fillStyle = skin.shadow;
  ctx.fillRect(12, 14 + bob, 8, 1);

  // 7. Face: Eyes, Brows, Cheeks
  if (direction === 'south') {
    // Eyes
    ctx.fillStyle = eye.color;
    ctx.fillRect(13, 10 + bob, 2, 2);
    ctx.fillRect(17, 10 + bob, 2, 2);
    // Pupils
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(14, 10 + bob, 1, 2);
    ctx.fillRect(18, 10 + bob, 1, 2);
    // Eyebrows
    ctx.fillStyle = hair.shadow;
    ctx.fillRect(13, 9 + bob, 2, 1);
    ctx.fillRect(17, 9 + bob, 2, 1);
    // Smile / mouth
    ctx.fillStyle = skin.shadow;
    ctx.fillRect(15, 13 + bob, 2, 1);
  } else if (direction === 'west') {
    ctx.fillStyle = eye.color;
    ctx.fillRect(12, 10 + bob, 2, 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(12, 10 + bob, 1, 2);
    ctx.fillStyle = hair.shadow;
    ctx.fillRect(12, 9 + bob, 2, 1);
  } else if (direction === 'east') {
    ctx.fillStyle = eye.color;
    ctx.fillRect(18, 10 + bob, 2, 2);
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(19, 10 + bob, 1, 2);
    ctx.fillStyle = hair.shadow;
    ctx.fillRect(18, 9 + bob, 2, 1);
  }

  // 8. Hairstyle
  ctx.fillStyle = hair.base;
  if (custom.hairstyle === 'short_crop') {
    ctx.fillRect(10, 4 + bob, 12, 4);
    ctx.fillRect(10, 6 + bob, 2, 4);
    ctx.fillRect(20, 6 + bob, 2, 4);
  } else if (custom.hairstyle === 'flowing_locks') {
    ctx.fillRect(10, 4 + bob, 12, 4);
    ctx.fillRect(9, 6 + bob, 3, 10);
    ctx.fillRect(20, 6 + bob, 3, 10);
    if (direction === 'north') {
      ctx.fillRect(11, 7 + bob, 10, 8);
    }
  } else if (custom.hairstyle === 'braided') {
    ctx.fillRect(10, 4 + bob, 12, 4);
    ctx.fillRect(15, 3 + bob, 2, 2);
    if (direction === 'north' || direction === 'south') {
      ctx.fillRect(19, 8 + bob, 3, 9);
    }
  } else if (custom.hairstyle === 'topknot') {
    ctx.fillRect(10, 5 + bob, 12, 3);
    ctx.fillRect(14, 2 + bob, 4, 3);
    ctx.fillStyle = '#f59e0b'; // Ribbon
    ctx.fillRect(15, 4 + bob, 2, 1);
  } else if (custom.hairstyle === 'wild_mane') {
    ctx.fillRect(9, 3 + bob, 14, 5);
    ctx.fillRect(8, 7 + bob, 3, 8);
    ctx.fillRect(21, 7 + bob, 3, 8);
  } else { // elven_ponytail
    ctx.fillRect(10, 4 + bob, 12, 4);
    ctx.fillRect(15, 2 + bob, 3, 3);
    if (direction === 'north' || direction === 'east') {
      ctx.fillRect(13, 4 + bob, 2, 11);
    }
  }

  // Hair highlights
  ctx.fillStyle = hair.highlight;
  ctx.fillRect(12, 4 + bob, 4, 1);

  // 9. Headwear
  if (headwearObj.id === 'iron_helm') {
    ctx.fillStyle = '#71717a';
    ctx.fillRect(10, 3 + bob, 12, 5);
    ctx.fillStyle = '#a1a1aa';
    ctx.fillRect(11, 4 + bob, 10, 1);
    ctx.fillStyle = '#f59e0b'; // Crest
    ctx.fillRect(15, 1 + bob, 2, 3);
  } else if (headwearObj.id === 'leather_cowl' || headwearObj.id === 'ranger_hood') {
    ctx.fillStyle = headwearObj.id === 'ranger_hood' ? '#166534' : '#78350f';
    ctx.fillRect(9, 3 + bob, 14, 6);
    ctx.fillRect(9, 9 + bob, 2, 5);
    ctx.fillRect(21, 9 + bob, 2, 5);
  } else if (headwearObj.id === 'wizard_hat') {
    ctx.fillStyle = '#4338ca';
    ctx.fillRect(8, 6 + bob, 16, 2); // Brim
    ctx.fillRect(11, 3 + bob, 10, 3);
    ctx.fillRect(13, 0 + bob, 6, 3);
    ctx.fillRect(15, -2 + bob, 2, 2); // Tip
    ctx.fillStyle = '#fde047';
    ctx.fillRect(11, 5 + bob, 10, 1); // Gold band
  } else if (headwearObj.id === 'golden_circlet') {
    ctx.fillStyle = '#eab308';
    ctx.fillRect(11, 7 + bob, 10, 1);
    ctx.fillStyle = '#ef4444'; // Gem
    ctx.fillRect(15, 6 + bob, 2, 2);
  }

  // 10. Equipped Tool / Weapon
  if (custom.equippedTool) {
    const isMining = action === 'mine' || action === 'farm';
    const isAttacking = action === 'attack';
    let toolSwingAngle = 0;
    if (isMining) {
      toolSwingAngle = frameStep === 1 ? -0.4 : 0.6;
    } else if (isAttacking) {
      toolSwingAngle = frameStep === 0 ? -0.7 : frameStep === 1 ? 1.2 : frameStep === 2 ? 1.5 : 0.2;
    }

    ctx.save();
    if (direction === 'south' || direction === 'east') {
      ctx.translate(22, 18 + bob);
      ctx.rotate(toolSwingAngle);

      if (custom.equippedTool === 'iron_pickaxe') {
        // Wooden Handle
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-2, -8, 2, 12);
        // Iron Head
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-6, -10, 10, 3);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(-5, -9, 8, 1);
      } else if (custom.equippedTool === 'forged_scythe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-2, -10, 2, 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(0, -10, 6, Math.PI, Math.PI * 1.8);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
      } else if (custom.equippedTool === 'steel_broadsword') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1, 0, 2, 4); // Hilt
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-3, 0, 6, 1.5); // Guard
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.5, -10, 3, 10); // Blade
      } else if (custom.equippedTool === 'oak_staff') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1, -12, 2, 18);
        ctx.fillStyle = '#38bdf8'; // Glowing crystal tip
        ctx.fillRect(-2, -14, 4, 4);
      }

      if (isAttacking && (frameStep === 1 || frameStep === 2)) {
        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, -0.6, 1.4);
        ctx.stroke();
        ctx.restore();
      }
    } else if (direction === 'west') {
      ctx.translate(10, 18 + bob);
      ctx.rotate(-toolSwingAngle);

      if (custom.equippedTool === 'iron_pickaxe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(0, -8, 2, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-4, -10, 10, 3);
      } else if (custom.equippedTool === 'steel_broadsword') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.5, -10, 3, 10);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-3, 0, 6, 1.5);
      } else if (custom.equippedTool === 'forged_scythe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-2, -10, 2, 16);
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.arc(0, -10, 6, Math.PI, Math.PI * 1.8);
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = '#94a3b8';
        ctx.stroke();
      } else if (custom.equippedTool === 'oak_staff') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1, -12, 2, 18);
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(-2, -14, 4, 4);
      }

      if (isAttacking && (frameStep === 1 || frameStep === 2)) {
        ctx.save();
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(0, 0, 14, -1.4, 0.6);
        ctx.stroke();
        ctx.restore();
      }
    } else if (direction === 'north') {
      ctx.translate(16, 12 + bob);
      ctx.rotate(toolSwingAngle);

      if (custom.equippedTool === 'steel_broadsword') {
        ctx.fillStyle = '#e2e8f0';
        ctx.fillRect(-1.5, -12, 3, 10);
        ctx.fillStyle = '#eab308';
        ctx.fillRect(-3, -2, 6, 1.5);
      } else if (custom.equippedTool === 'iron_pickaxe') {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1, -8, 2, 12);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(-5, -10, 10, 3);
      } else {
        ctx.fillStyle = '#78350f';
        ctx.fillRect(-1, -10, 2, 14);
      }
    }
    ctx.restore();
  }

  ctx.restore();
}

/**
 * Generates an HTML5 Canvas containing the entire multi-row spritesheet for Phaser
 * 4 columns (frames) x 10 rows (animations)
 */
export function generateCharacterSpritesheetCanvas(customization) {
  const canvas = document.createElement('canvas');
  canvas.width = FRAME_WIDTH * 4;    // 128px
  canvas.height = FRAME_HEIGHT * 10; // 320px
  const ctx = canvas.getContext('2d');
  ctx.imageSmoothingEnabled = false;

  const rows = [
    { direction: 'south', action: 'walk' },   // Row 0: Walk South (0-3)
    { direction: 'west', action: 'walk' },    // Row 1: Walk West (4-7)
    { direction: 'east', action: 'walk' },    // Row 2: Walk East (8-11)
    { direction: 'north', action: 'walk' },   // Row 3: Walk North (12-15)
    { direction: 'south', action: 'mine' },   // Row 4: Mine Action (16-19)
    { direction: 'east', action: 'mine' },    // Row 5: Farm Action (20-23)
    { direction: 'south', action: 'attack' }, // Row 6: Attack South (24-27)
    { direction: 'west', action: 'attack' },  // Row 7: Attack West (28-31)
    { direction: 'east', action: 'attack' },  // Row 8: Attack East (32-35)
    { direction: 'north', action: 'attack' }, // Row 9: Attack North (36-39)
  ];

  rows.forEach((row, rowIndex) => {
    for (let frame = 0; frame < 4; frame += 1) {
      const offsetX = frame * FRAME_WIDTH;
      const offsetY = rowIndex * FRAME_HEIGHT;
      drawCharacterFrame(ctx, offsetX, offsetY, customization, row.direction, row.action, frame);
    }
  });

  return canvas;
}

/**
 * Returns a high-res scaled data URL of a single character frame for preview UI
 */
export function renderCharacterPreviewDataUrl(customization, direction = 'south', scale = 5) {
  if (typeof document === 'undefined') return '';
  try {
    const canvas = document.createElement('canvas');
    canvas.width = FRAME_WIDTH * scale;
    canvas.height = FRAME_HEIGHT * scale;
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    ctx.imageSmoothingEnabled = false;

    ctx.scale(scale, scale);
    drawCharacterFrame(ctx, 0, 0, customization, direction, 'idle', 0);
    return canvas.toDataURL();
  } catch {
    return '';
  }
}
