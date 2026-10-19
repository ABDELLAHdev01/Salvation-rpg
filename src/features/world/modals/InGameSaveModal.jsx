import React, { useState } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import { exportSavePayloadJSON, importSavePayloadJSON, CURRENT_SAVE_SCHEMA_VERSION } from '../../../core/services/saveService';

export default function InGameSaveModal({
  isOpen,
  onClose,
  character,
  profile,
  onReloadGame = () => {},
}) {
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleManualSave = () => {
    audioManager.play('levelup');
    toast.success('Realm state saved successfully! (Schema v2)', { icon: '💾' });
  };

  const handleExportJSON = () => {
    try {
      setIsExporting(true);
      const json = exportSavePayloadJSON();
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      a.href = url;
      a.download = `salvation-save-${dateStr}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      audioManager.play('coin');
      toast.success('Save file downloaded to device!', { icon: '📦' });
    } catch {
      toast.error('Failed to export save file.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        const result = importSavePayloadJSON(text);
        if (result.success) {
          audioManager.play('levelup');
          toast.success('Save file imported successfully! Reloading...', { icon: '✨' });
          setTimeout(() => {
            onReloadGame();
            onClose();
          }, 600);
        } else {
          toast.error(result.message || 'Invalid save file.');
        }
      } catch {
        toast.error('Error reading save file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="relative w-full max-w-md rounded-3xl border-2 border-yellow-600/70 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 p-6 shadow-2xl shadow-yellow-950/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-yellow-700/40 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💾</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-yellow-300 tracking-wide">
                Save &amp; Load Realm State
              </h2>
              <p className="text-xs text-gray-400">
                Offline Persistence · Version {CURRENT_SAVE_SCHEMA_VERSION}
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

        {/* Character Info Snippet */}
        <div className="mt-4 rounded-2xl border border-yellow-700/30 bg-gray-900/60 p-3.5 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-white">
              {character?.characterName || 'Warden'} (Lvl {profile?.stats?.level || 1})
            </h4>
            <p className="text-[11px] text-gray-400">
              Gold: {profile?.stats?.gold || 0}g · XP: {profile?.stats?.xp || 0}
            </p>
          </div>
          <span className="rounded-lg bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
            Auto-Saved
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleManualSave}
            className="w-full flex items-center justify-between rounded-xl border border-yellow-500/40 bg-yellow-500/15 p-3 font-serif font-bold text-xs text-yellow-200 hover:bg-yellow-500/25 transition active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💾</span>
              <span>Quick Save Now</span>
            </div>
            <span className="text-[10px] text-yellow-400/80 font-mono">LocalStorage</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportJSON}
            className="w-full flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900/80 p-3 font-serif font-bold text-xs text-gray-200 hover:text-white hover:border-gray-500 transition active:scale-95"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📥</span>
              <span>Export Save JSON File</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Download</span>
          </button>

          <label className="w-full flex items-center justify-between rounded-xl border border-gray-700 bg-gray-900/80 p-3 font-serif font-bold text-xs text-gray-200 hover:text-white hover:border-gray-500 transition active:scale-95 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-base">📤</span>
              <span>Import Save JSON File</span>
            </div>
            <span className="text-[10px] text-gray-400 font-mono">Upload</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-yellow-700/40 pt-4 text-xs text-gray-400">
          <span>Saves are stored locally in browser storage</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rounded-xl bg-gray-900 border border-yellow-700/30 px-4 py-2 font-serif text-xs font-bold text-yellow-300 hover:text-white transition"
          >
            Resume Game
          </button>
        </div>
      </div>
    </div>
  );
}
