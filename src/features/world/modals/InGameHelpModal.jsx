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
      <div className="relative w-full max-w-lg rounded-3xl border-2 border-yellow-600/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 shadow-2xl shadow-yellow-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-700/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🎮</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-yellow-300 tracking-wide">
                Realm Controls &amp; Guide
              </h2>
              <p className="text-xs text-gray-400">
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
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-yellow-700/40 bg-gray-900 text-gray-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Hotkeys List */}
        <div className="mt-4 max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
          {CONTROLS.map((ctrl) => (
            <div
              key={ctrl.key}
              className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 p-2.5 text-xs"
            >
              <kbd className="rounded-lg border border-yellow-700/40 bg-gray-950 px-2.5 py-1 font-mono font-bold text-yellow-300 shadow">
                {ctrl.key}
              </kbd>
              <span className="text-gray-300 text-right ml-3">{ctrl.action}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-yellow-700/40 pt-4 text-xs text-gray-400">
          <span>Fully playable offline in browser</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rounded-xl bg-yellow-500 px-5 py-2 font-serif text-xs font-bold text-black hover:bg-yellow-400 transition shadow"
          >
            Got It!
          </button>
        </div>
      </div>
    </div>
  );
}
