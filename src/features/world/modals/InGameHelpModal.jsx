import React from 'react';
import audioManager from '../../../core/audio/AudioManager';

export default function InGameHelpModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const CONTROLS = [
    { key: 'W, A, S, D / Arrows', action: 'Move avatar in 8 directions across terrain' },
    { key: 'Mouse Click (Ground)', action: 'Click-to-move pathing to destination' },
    { key: 'Shift (Hold)', action: 'Sprint (boosts velocity from 135 to 210 px/s)' },
    { key: 'Space / Click Enemy', action: 'Swing equipped weapon in facing direction' },
    { key: 'E / Click Prompt', action: 'Interact with crops, ore deposits, NPCs, chests, forge' },
    { key: 'Q', action: 'Quick drink Health Elixir from pouch (+45 HP)' },
    { key: 'I / B', action: 'Toggle Adventurer Pouch Inventory' },
    { key: 'C', action: 'Toggle Mirror & Wardrobe customizer' },
    { key: 'F11 / ⛶', action: 'Toggle Fullscreen Mode' },
    { key: 'Esc', action: 'Close active modal / menu' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="rpg-panel-brown relative w-full max-w-lg p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">🎮</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide drop-shadow">
                Realm Controls &amp; Guide
              </h2>
              <p className="text-xs text-amber-300/70">
                Action RPG Movement, Combat &amp; Gathering
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

        {/* Hotkeys List */}
        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {CONTROLS.map((ctrl) => (
            <div
              key={ctrl.key}
              className="rpg-slot-inset flex items-center justify-between p-2 text-xs bg-stone-950/70"
            >
              <kbd className="rpg-slot-inset px-2.5 py-0.5 font-mono font-bold text-amber-300 bg-black/80">
                {ctrl.key}
              </kbd>
              <span className="text-amber-100 text-right ml-3 font-serif">{ctrl.action}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-amber-900/50 pt-4 text-xs text-amber-300/70">
          <span>Fully playable offline in browser</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-beige text-xs py-1.5 px-5 font-serif font-bold text-amber-950"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
