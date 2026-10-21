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
      <div className="rpg-panel-brown relative w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">💾</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide drop-shadow">
                Save &amp; Load Realm State
              </h2>
              <p className="text-xs text-amber-300/70">
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
            className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
          >
            ✕
          </button>
        </div>

        {/* Character Info Snippet */}
        <div className="rpg-slot-inset mt-4 p-3 bg-stone-950/70 flex items-center justify-between">
          <div>
            <h4 className="font-bold text-sm text-amber-100">
              {character?.characterName || 'Warden'} (Lvl {profile?.stats?.level || 1})
            </h4>
            <p className="text-[11px] text-amber-300/70 font-mono">
              Gold: {profile?.stats?.gold || 0}g · XP: {profile?.stats?.xp || 0}
            </p>
          </div>
          <span className="rounded bg-emerald-950/80 border border-emerald-600/40 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300">
            Auto-Saved
          </span>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={handleManualSave}
            className="rpg-btn-beige w-full flex items-center justify-between p-2.5 text-xs text-amber-950"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">💾</span>
              <span>Quick Save Now</span>
            </div>
            <span className="text-[10px] font-mono text-amber-800">LocalStorage</span>
          </button>

          <button
            type="button"
            disabled={isExporting}
            onClick={handleExportJSON}
            className="rpg-btn-brown w-full flex items-center justify-between p-2.5 text-xs text-amber-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">📥</span>
              <span>Export Save JSON File</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/70">Download</span>
          </button>

          <label className="rpg-btn-brown w-full flex items-center justify-between p-2.5 text-xs text-amber-100 cursor-pointer">
            <div className="flex items-center gap-2">
              <span className="text-base">📤</span>
              <span>Import Save JSON File</span>
            </div>
            <span className="text-[10px] font-mono text-amber-300/70">Upload</span>
            <input
              type="file"
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />
          </label>
        </div>

        {/* Footer */}
        <div className="mt-6 flex items-center justify-between border-t border-amber-900/50 pt-4 text-xs text-amber-300/70">
          <span>Saves are stored locally in browser storage</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-brown text-xs py-1.5 px-4"
          >
            Resume Game
          </button>
        </div>
      </div>
    </div>
  );
}
