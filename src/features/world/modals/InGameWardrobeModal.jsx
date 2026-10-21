import React, { useState, useMemo } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import characterService from '../../../core/services/CharacterService';
import gameEventBridge, { gameEvents } from '../../../core/phaser/gameEventBridge';
import { getItemIcon } from '../../../core/data/itemIcons';
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
  getRandomCustomization,
  sanitizeCustomization,
} from '../../../core/phaser/characterCustomizationData';
import { renderCharacterPreviewDataUrl } from '../../../core/phaser/CharacterSpriteGenerator';

export default function InGameWardrobeModal({
  isOpen,
  onClose,
  character,
  onCharacterUpdate = () => {},
}) {
  const [custom, setCustom] = useState(() => sanitizeCustomization(character?.customization));
  const [direction, setDirection] = useState('south');
  const [category, setCategory] = useState('hair');

  const previewUrl = useMemo(() => {
    return renderCharacterPreviewDataUrl(custom, direction, 5);
  }, [custom, direction]);

  if (!isOpen) return null;

  const handleChange = (key, value) => {
    audioManager.play('tap');
    setCustom((prev) => ({ ...prev, [key]: value }));
  };

  const handleRandomize = () => {
    audioManager.play('tap');
    setCustom(getRandomCustomization());
    toast.success('Randomized appearance!', { icon: '🎲' });
  };

  const handleApply = async () => {
    audioManager.play('levelup');
    try {
      const sanitized = sanitizeCustomization(custom);
      const updated = await characterService.updateCharacter({
        customization: sanitized,
      });
      onCharacterUpdate(updated);
      gameEventBridge.emit(gameEvents.REFRESH_CUSTOMIZATION, { customization: sanitized });
      toast.success('Wardrobe updated in realm!', { icon: '✨' });
      onClose();
    } catch {
      toast.error('Failed to update wardrobe appearance.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="rpg-panel-brown relative w-full max-w-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">🎨</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide sm:text-xl drop-shadow">
                Warden&apos;s Mirror &amp; Wardrobe
              </h2>
              <p className="text-xs text-amber-300/70">
                Customize your animated 2D pixel-art avatar in real time
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
          >
            ✕
          </button>
        </div>

        {/* Content Body: Left Preview, Right Controls */}
        <div className="mt-5 grid gap-6 md:grid-cols-[220px_1fr]">
          {/* Left Preview Box */}
          <div className="rpg-slot-inset flex flex-col items-center justify-center p-4 bg-stone-950/80">
            <div className="flex h-44 w-44 items-center justify-center rounded border border-amber-900/60 bg-gradient-to-b from-stone-900 via-stone-950 to-black p-2 shadow-inner">
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Avatar Preview"
                  className="h-36 w-36 object-contain image-rendering-pixelated drop-shadow-lg"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="text-xs text-amber-300/50">Generating...</div>
              )}
            </div>

            {/* Direction Rotation */}
            <div className="mt-3 flex items-center gap-1">
              {[
                { id: 'south', label: 'Front' },
                { id: 'west', label: 'Left' },
                { id: 'east', label: 'Right' },
                { id: 'north', label: 'Back' },
              ].map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setDirection(d.id);
                  }}
                  className={`${
                    direction === d.id ? 'rpg-btn-beige active' : 'rpg-btn-brown'
                  } text-[10px] py-0.5 px-2`}
                >
                  {d.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleRandomize}
              className="rpg-btn-brown mt-3 w-full py-1 text-xs font-bold"
            >
              🎲 Randomize
            </button>
          </div>

          {/* Right Category Options */}
          <div>
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-1.5 border-b border-amber-900/50 pb-3">
              {[
                { id: 'hair', label: 'Hairstyle' },
                { id: 'hairColor', label: 'Hair Color' },
                { id: 'skin', label: 'Skin Tone' },
                { id: 'eyes', label: 'Eyes' },
                { id: 'outfit', label: 'Tunic' },
                { id: 'outfitColor', label: 'Color' },
                { id: 'headwear', label: 'Headwear' },
                { id: 'accessory', label: 'Cloak' },
                { id: 'tool', label: 'Weapon / Tool' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setCategory(tab.id);
                  }}
                  className={`${
                    category === tab.id ? 'rpg-btn-beige active' : 'rpg-btn-brown'
                  } text-xs py-0.5 px-2`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Options Selector List */}
            <div className="mt-4 max-h-64 overflow-y-auto space-y-1.5 pr-1 custom-scrollbar">
              {category === 'hair' &&
                HAIR_STYLES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('hairstyle', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.hairstyle === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {custom.hairstyle === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'hairColor' &&
                HAIR_COLORS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('hairColor', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.hairColor === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-black/40" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </div>
                    {custom.hairColor === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'skin' &&
                SKIN_TONES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('skinTone', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.skinTone === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-black/40" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </div>
                    {custom.skinTone === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'eyes' &&
                EYE_STYLES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('eyeStyle', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.eyeStyle === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-black/40" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </div>
                    {custom.eyeStyle === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'outfit' &&
                OUTFITS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('outfit', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.outfit === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {custom.outfit === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'outfitColor' &&
                OUTFIT_COLORS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('outfitColor', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.outfitColor === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full border border-black/40" style={{ backgroundColor: opt.color }} />
                      <span>{opt.name}</span>
                    </div>
                    {custom.outfitColor === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'headwear' &&
                HEADWEAR.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('headwear', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.headwear === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {custom.headwear === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'accessory' &&
                ACCESSORIES.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('accessory', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      custom.accessory === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <span>{opt.name}</span>
                    {custom.accessory === opt.id && <span>✓</span>}
                  </button>
                ))}

              {category === 'tool' &&
                EQUIPPED_TOOLS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleChange('equippedTool', opt.id)}
                    className={`w-full text-left rounded-xl px-3 py-2 text-xs font-bold transition flex items-center justify-between ${
                      (custom.equippedTool || custom.tool) === opt.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-gray-800 bg-gray-900/50 text-gray-300 hover:bg-gray-800'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img src={getItemIcon(opt.id)} alt={opt.name} className="h-4 w-4 object-contain pixelated" />
                      <span>{opt.name}</span>
                    </div>
                    {(custom.equippedTool || custom.tool) === opt.id && <span>✓</span>}
                  </button>
                ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-amber-900/50 pt-4">
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-brown text-xs py-1.5 px-4"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="rpg-btn-beige text-xs py-1.5 px-6 font-serif font-bold text-amber-950"
          >
            Apply Appearance ✨
          </button>
        </div>
      </div>
    </div>
  );
}
