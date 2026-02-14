import React, { useMemo, useState } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { Navigate, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../shared/layout/Navbar';

const OFFLINE_MODE = import.meta.env.VITE_OFFLINE_MODE === 'true';
const STORAGE_KEYS = [
  'accessToken',
  'refreshToken',
  'mockUsers',
  'mockSessionUser',
  'mockCharacters',
  'mockProfiles',
  'mockNotifications',
];

const buildSavePayload = () => {
  const data = {};
  STORAGE_KEYS.forEach((key) => {
    const value = localStorage.getItem(key);
    if (value !== null) {
      data[key] = value;
    }
  });

  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    data,
  };
};

const downloadJson = (filename, content) => {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const formatTimestamp = (value) => {
  if (!value) {
    return 'Unknown';
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return 'Unknown';
  }
  return date.toLocaleString();
};

export default function LoadSave() {
  const navigate = useNavigate();
  const [importPayload, setImportPayload] = useState(null);
  const [importFileName, setImportFileName] = useState('');
  const [confirmState, setConfirmState] = useState({ open: false, action: null });

  const detectedKeys = useMemo(() => {
    if (!importPayload?.data) {
      return [];
    }
    return STORAGE_KEYS.filter((key) => Object.prototype.hasOwnProperty.call(importPayload.data, key));
  }, [importPayload]);

  const importedSummary = useMemo(() => {
    if (!importPayload?.data) {
      return null;
    }

    try {
      const rawCharacters = importPayload.data.mockCharacters;
      const rawProfiles = importPayload.data.mockProfiles;
      const rawSessionUser = importPayload.data.mockSessionUser;
      const characters = rawCharacters ? JSON.parse(rawCharacters) : null;
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : null;
      const username = typeof rawSessionUser === 'string' ? rawSessionUser : null;
      const character = username && characters ? characters[username] : null;
      const profile = username && profiles ? profiles[username] : null;

      return {
        username,
        characterName: character?.name || null,
        lastUpdated: profile?.updatedAt || profile?.lastUpdated || profile?.createdAt || null,
        miningLevel: profile?.miningLevel ?? null,
        gold: profile?.stats?.gold ?? null,
        version: importPayload.version ?? null,
        exportedAt: importPayload.exportedAt || null,
      };
    } catch {
      return {
        username: null,
        characterName: null,
        lastUpdated: null,
        miningLevel: null,
        gold: null,
        version: importPayload.version ?? null,
        exportedAt: importPayload.exportedAt || null,
      };
    }
  }, [importPayload]);

  const localSaveSummary = useMemo(() => {
    const username = localStorage.getItem('mockSessionUser');
    let characterName = null;
    let lastUpdated = null;

    try {
      const rawCharacters = localStorage.getItem('mockCharacters');
      const rawProfiles = localStorage.getItem('mockProfiles');
      const characters = rawCharacters ? JSON.parse(rawCharacters) : null;
      const profiles = rawProfiles ? JSON.parse(rawProfiles) : null;
      const character = username && characters ? characters[username] : null;
      const profile = username && profiles ? profiles[username] : null;
      characterName = character?.name || null;
      lastUpdated = profile?.updatedAt || profile?.lastUpdated || profile?.createdAt || null;
    } catch {
      characterName = null;
      lastUpdated = null;
    }

    return {
      username,
      characterName,
      lastUpdated,
    };
  }, []);

  if (!OFFLINE_MODE) {
    return <Navigate to="/" replace />;
  }

  const handleExport = () => {
    const payload = buildSavePayload();
    const json = JSON.stringify(payload, null, 2);
    const dateStamp = new Date().toISOString().slice(0, 10);
    downloadJson(`salvation-save-${dateStamp}.json`, json);
    toast.success('Save downloaded.');
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);

      if (!parsed || typeof parsed !== 'object' || typeof parsed.data !== 'object') {
        throw new Error('Invalid format');
      }

      setImportPayload(parsed);
      setImportFileName(file.name);
      toast.success('Save file loaded.');
    } catch {
      setImportPayload(null);
      setImportFileName('');
      toast.error('Invalid save file.');
    }
  };

  const applySave = () => {
    if (!importPayload?.data) {
      toast.error('Load a save file first.');
      return;
    }

    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    STORAGE_KEYS.forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(importPayload.data, key)) {
        const value = importPayload.data[key];
        localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
      }
    });

    toast.success('Save applied.');
    navigate('/dashboard');
  };

  const clearLocalSave = () => {
    STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
    toast.success('Local save cleared.');
    navigate('/');
  };

  const requestConfirm = (action) => {
    setConfirmState({ open: true, action });
  };

  const handleConfirm = () => {
    if (confirmState.action === 'apply') {
      applySave();
    }
    if (confirmState.action === 'clear') {
      clearLocalSave();
    }
    setConfirmState({ open: false, action: null });
  };

  const handleCancel = () => {
    setConfirmState({ open: false, action: null });
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <Navbar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-28">
        <div className="mb-10 rounded-2xl p-8 shadow-2xl backdrop-blur glass-panel">
          <p className="section-kicker text-sm uppercase tracking-[0.3em] text-yellow-500">Offline Vault</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Load or Export Your Save</h1>
          <p className="mt-3 text-sm text-gray-300">
            Keep your beta progress safe. Export your local save as JSON, or import a file to restore your
            hero on this device.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl p-6 shadow-xl backdrop-blur glass-panel">
            <h2 className="text-xl font-semibold text-white">Export Save</h2>
            <p className="mt-3 text-sm text-gray-300">
              Download a JSON file containing your offline progress. Store it somewhere safe.
            </p>
            <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/60 p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Current Local Save</p>
              <div className="mt-3 grid gap-2 text-sm text-gray-300">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Character</span>
                  <span className="text-gray-200">
                    {localSaveSummary.characterName || localSaveSummary.username || 'None'}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Last Updated</span>
                  <span className="text-gray-200">{formatTimestamp(localSaveSummary.lastUpdated)}</span>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={handleExport}
              className="mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Download Save
            </button>
          </div>

          <div className="rounded-2xl p-6 shadow-xl backdrop-blur glass-panel">
            <h2 className="text-xl font-semibold text-white">Import Save</h2>
            <p className="mt-3 text-sm text-gray-300">
              Choose a previously exported JSON file. Applying it will overwrite your current local save.
            </p>
            <input
              type="file"
              accept="application/json"
              onChange={handleFileChange}
              className="mt-4 w-full rounded-lg border border-yellow-700/40 bg-gray-950/60 p-2 text-sm text-gray-200"
            />
            {importFileName && (
              <p className="mt-3 text-xs text-gray-400">Loaded: {importFileName}</p>
            )}
            {importedSummary?.exportedAt && (
              <p className="mt-2 text-xs text-gray-400">
                Exported: {formatTimestamp(importedSummary.exportedAt)}
              </p>
            )}
            {importedSummary?.version != null && (
              <p className="mt-2 text-xs text-gray-400">Version: {importedSummary.version}</p>
            )}
            {importedSummary && (
              <div className="mt-3 rounded-xl border border-yellow-700/30 bg-gray-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Imported Save</p>
                <div className="mt-2 grid gap-2 text-xs text-gray-300">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Character</span>
                    <span className="text-gray-200">
                      {importedSummary.characterName || importedSummary.username || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Last Updated</span>
                    <span className="text-gray-200">{formatTimestamp(importedSummary.lastUpdated)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Mining Level</span>
                    <span className="text-gray-200">
                      {importedSummary.miningLevel != null ? importedSummary.miningLevel : 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.2em] text-gray-500">Gold</span>
                    <span className="text-gray-200">
                      {importedSummary.gold != null ? importedSummary.gold : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            )}
            {detectedKeys.length > 0 && (
              <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/60 p-3">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Included Data</p>
                <p className="mt-2 text-xs text-gray-300">{detectedKeys.join(', ')}</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => requestConfirm('apply')}
              className="mt-5 inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Apply Save
            </button>
          </div>
        </div>

        <div className="mt-8 rounded-2xl border border-red-700/30 bg-red-950/40 p-6 shadow-xl backdrop-blur">
          <h2 className="text-xl font-semibold text-white">Clear Local Save</h2>
          <p className="mt-3 text-sm text-gray-300">
            This removes all offline progress stored on this device. Use this if you want a fresh start.
          </p>
          <button
            type="button"
            onClick={() => requestConfirm('clear')}
            className="mt-5 inline-flex items-center justify-center rounded-lg border border-red-500/60 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-500/10"
          >
            Clear Local Save
          </button>
        </div>
      </div>

      {confirmState.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
          <div className="w-full max-w-md rounded-2xl border border-yellow-700/40 bg-gray-950/95 p-6 shadow-2xl">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Confirm</p>
            <h3 className="mt-3 flex items-center gap-2 text-2xl font-semibold text-white">
              {confirmState.action === 'clear' && (
                <ExclamationTriangleIcon className="h-5 w-5 text-red-300" />
              )}
              {confirmState.action === 'clear' ? 'Clear local save?' : 'Overwrite local save?'}
            </h3>
            <p className="mt-3 text-sm text-gray-300">
              {confirmState.action === 'clear'
                ? 'This removes all local progress from this device.'
                : 'This replaces your current local progress with the imported save file.'}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center justify-center rounded-lg border border-gray-600/60 px-4 py-2 text-sm font-semibold text-gray-200 hover:bg-gray-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white ${confirmState.action === 'clear'
                    ? 'bg-red-600 hover:bg-red-500'
                    : 'action-primary'
                  }`}
              >
                {confirmState.action === 'clear' ? 'Clear Save' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
