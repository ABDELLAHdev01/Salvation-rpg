import React, { useEffect, useMemo, useRef, useState } from 'react';
import Sidebar from '../components/Sidebar';
import toast from 'react-hot-toast';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import {
  getDefaultZoneId,
  getUnlockedZoneIdsByLevel,
  getZoneById,
  zones,
} from '../data/zonesData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const formatMultiplier = (value) => {
  const safe = Number.isFinite(value) ? value : 1;
  const text = safe.toFixed(2);
  return `x${text.replace(/\.0+$/, '').replace(/(\.\d)0$/, '$1')}`;
};

const zoneThemes = {
  'sunforge-crossing': { hue: 44, accent: 'rgba(251, 191, 36, 0.9)', spot: 'rgba(251, 191, 36, 0.35)' },
  'verdant-veil': { hue: 140, accent: 'rgba(52, 211, 153, 0.85)', spot: 'rgba(52, 211, 153, 0.35)' },
  emberdeep: { hue: 18, accent: 'rgba(248, 113, 113, 0.85)', spot: 'rgba(248, 113, 113, 0.35)' },
  'skyreach-ridge': { hue: 198, accent: 'rgba(56, 189, 248, 0.85)', spot: 'rgba(56, 189, 248, 0.35)' },
  aetherworks: { hue: 268, accent: 'rgba(216, 180, 254, 0.85)', spot: 'rgba(216, 180, 254, 0.35)' },
};

const MiningIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="zone-map-icon" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7c2-2 5-2 7 0l1 1 2-2 3 3-2 2 1 1c2 2 2 5 0 7l-1-1c1-1 1-3 0-4l-1-1-6 6-3-3 6-6-1-1c-1-1-3-1-4 0L4 7z" />
  </svg>
);

const FarmIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="zone-map-icon" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c3 2 5 5 5 8a5 5 0 11-10 0c0-3 2-6 5-8z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-6" />
  </svg>
);

const ExpeditionIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="zone-map-icon" fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 10l5-2-2 5-5 2 2-5z" />
  </svg>
);

const WorkshopIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="zone-map-icon" fill="none" stroke="currentColor" strokeWidth="1.6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 9h7l2-2 4 4-2 2v7h-3v-6H8l-5-5z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l2-2 5 5-2 2-5-5z" />
  </svg>
);

export default function Zones() {
  const [profile, setProfile] = useState(null);
  const [zonePulseId, setZonePulseId] = useState(null);
  const prevZoneIdRef = useRef(null);
  const pulseTimeoutRef = useRef(null);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);
  }, []);

  const playerLevel = profile?.stats?.level ?? 1;
  const unlockedZoneIds = profile?.unlockedZones?.length
    ? profile.unlockedZones
    : getUnlockedZoneIdsByLevel(playerLevel);
  const unlockedSet = useMemo(() => new Set(unlockedZoneIds), [unlockedZoneIds]);
  const activeZone = getZoneById(profile?.activeZoneId) || getZoneById(getDefaultZoneId());
  const activeTheme = zoneThemes[activeZone?.id] || zoneThemes['sunforge-crossing'];

  useEffect(() => {
    if (!activeZone?.id) {
      return;
    }

    if (!prevZoneIdRef.current) {
      prevZoneIdRef.current = activeZone.id;
      return;
    }

    if (prevZoneIdRef.current === activeZone.id) {
      return;
    }

    setZonePulseId(activeZone.id);
    prevZoneIdRef.current = activeZone.id;
    if (pulseTimeoutRef.current) {
      window.clearTimeout(pulseTimeoutRef.current);
    }
    pulseTimeoutRef.current = window.setTimeout(() => {
      setZonePulseId(null);
      pulseTimeoutRef.current = null;
    }, 900);
  }, [activeZone?.id]);

  const handleSetActive = (zoneId) => {
    if (!profile) {
      return;
    }
    if (!unlockedSet.has(zoneId)) {
      toast.error('Reach the required level to unlock this zone.');
      return;
    }
    if (zoneId === profile.activeZoneId) {
      return;
    }
    const updated = characterService.updateMockProfile({ activeZoneId: zoneId });
    setProfile(updated);
    const zoneName = getZoneById(zoneId)?.name || 'Zone';
    toast.success(`${zoneName} is now active.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Frontiers</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Zones</h1>
              <p className="mt-3 text-base text-gray-300">
                Shift your focus across regions to bend idle rewards. Expeditions and workshop jobs lock their zone
                at dispatch, while mining and farming respond immediately.
              </p>
            </div>
            <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-4 py-2 text-xs font-semibold text-yellow-200">
              Level {playerLevel}
            </div>
          </div>

          <div
            className={`mt-6 rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-6 zone-active-panel ${
              zonePulseId === activeZone?.id ? 'zone-activate-panel' : ''
            }`}
            style={{
              '--zone-spot': activeTheme.spot,
            }}
          >
            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Active Zone</p>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-2xl font-semibold text-white">{activeZone?.name || 'Unknown zone'}</p>
                <p className="mt-2 text-sm text-gray-300">{activeZone?.description || 'No zone selected yet.'}</p>
              </div>
              <div className="rounded-xl border border-yellow-700/30 bg-gray-900/80 px-4 py-3 text-xs text-gray-300">
                <p className="uppercase tracking-[0.3em] text-gray-400">Core Bonuses</p>
                <p className="mt-2 text-yellow-200">
                  Mining {formatMultiplier(activeZone?.modifiers?.miningYieldMultiplier)} yield ·
                  {formatMultiplier(activeZone?.modifiers?.miningXpMultiplier)} XP
                </p>
                <p className="mt-1 text-yellow-200">
                  Farm {formatMultiplier(activeZone?.modifiers?.farmYieldMultiplier)} yield ·
                  {formatMultiplier(activeZone?.modifiers?.farmGrowMultiplier)} grow
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Available Zones</p>
                <p className="mt-2 text-sm text-gray-300">Unlock new regions as you level up.</p>
              </div>
              <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                Unlocked: {unlockedSet.size}/{zones.length}
              </span>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
              {zones.map((zone) => {
                const isUnlocked = unlockedSet.has(zone.id);
                const isActive = zone.id === activeZone?.id;
                const theme = zoneThemes[zone.id] || zoneThemes['sunforge-crossing'];
                return (
                  <div
                    key={zone.id}
                    className={`rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 shadow-[0_0_18px_rgba(15,23,42,0.4)] zone-card ${
                      zonePulseId === zone.id ? 'zone-activate-card' : ''
                    }`}
                    style={{
                      '--zone-spot': theme.spot,
                    }}
                  >
                    <div
                      className={`zone-map ${isUnlocked ? '' : 'zone-map-locked'} ${
                        zonePulseId === zone.id ? 'zone-map-transition' : ''
                      }`}
                      style={{
                        '--zone-hue': theme.hue,
                        '--zone-accent': theme.accent,
                        '--zone-spot': theme.spot,
                      }}
                    >
                      <div className="zone-map-scan" />
                      <div className="zone-map-grid" />
                      <div className="zone-map-rings" />
                      <div className="zone-map-compass">
                        <span>W</span>
                        <span>N</span>
                        <span>E</span>
                        <span>S</span>
                      </div>
                      <div className="zone-map-landmarks">
                        <span className="zone-map-landmark" title="Mining">
                          <MiningIcon />
                        </span>
                        <span className="zone-map-landmark" title="Farming">
                          <FarmIcon />
                        </span>
                        <span className="zone-map-landmark" title="Expeditions">
                          <ExpeditionIcon />
                        </span>
                        <span className="zone-map-landmark" title="Workshop">
                          <WorkshopIcon />
                        </span>
                      </div>
                      <div className="zone-map-pin" />
                      <div className="zone-map-label">
                        <span className="zone-map-kicker">Frontier Map</span>
                        <span className="zone-map-title tagesschrift-regular">{zone.name}</span>
                      </div>
                      {!isUnlocked && <div className="zone-map-lock">Locked</div>}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Level {zone.unlockLevel}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{zone.name}</h2>
                      </div>
                      <div className="flex items-center gap-2">
                        {isActive && (
                          <span className="rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-900">
                            Active
                          </span>
                        )}
                        {!isUnlocked && (
                          <span className="rounded-full border border-gray-700/60 bg-gray-950/80 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-400">
                            Locked
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-gray-300">{zone.description}</p>

                    <div className="mt-4 grid gap-2 text-xs text-gray-400">
                      <div className="flex items-center justify-between">
                        <span>Mining yield</span>
                        <span>{formatMultiplier(zone.modifiers?.miningYieldMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Mining XP</span>
                        <span>{formatMultiplier(zone.modifiers?.miningXpMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Farm grow</span>
                        <span>{formatMultiplier(zone.modifiers?.farmGrowMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Farm yield</span>
                        <span>{formatMultiplier(zone.modifiers?.farmYieldMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Animal output</span>
                        <span>{formatMultiplier(zone.modifiers?.farmAnimalYieldMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Expedition rewards</span>
                        <span>
                          {formatMultiplier(zone.modifiers?.expeditionGoldMultiplier)} gold ·
                          {formatMultiplier(zone.modifiers?.expeditionXpMultiplier)} XP
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Expedition time</span>
                        <span>{formatMultiplier(zone.modifiers?.expeditionDurationMultiplier)}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Workshop</span>
                        <span>
                          {formatMultiplier(zone.modifiers?.workshopXpMultiplier)} XP ·
                          {formatMultiplier(zone.modifiers?.workshopDurationMultiplier)} time
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSetActive(zone.id)}
                        disabled={!isUnlocked || isActive}
                        className={`rounded-full px-4 py-2 text-xs font-semibold ${
                          isActive
                            ? 'bg-yellow-500/10 text-yellow-200'
                            : isUnlocked
                              ? 'bg-yellow-400 text-gray-900'
                              : 'bg-gray-700 text-gray-400'
                        }`}
                      >
                        {isActive ? 'Active' : isUnlocked ? 'Set Active' : `Unlocks at L${zone.unlockLevel}`}
                      </button>
                      {!isUnlocked && (
                        <span className="text-xs text-gray-500">Gain levels to unlock this zone.</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
