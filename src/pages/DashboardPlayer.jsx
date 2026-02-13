import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import XpBar from '../components/XpBar';
import DiscordModal from '../components/DiscordModal';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { getHousingTierById } from '../data/housingData';
import { getFarmXpForLevel } from '../data/farmData';
import { formatDuration, getMiningXpForLevel } from '../data/miningData';
import { getPlayerXpForLevel } from '../data/playerData';
import { ensureGeneralMissions, getMissionProgress, isMissionComplete } from '../data/missionData';
import { getExpeditionLocation } from '../data/expeditionData';
import WorkshopService from '../services/WorkshopService';
import { getWorkshopXpForLevel } from '../data/workshopData';
import { getZoneById, getUnlockedZoneIdsByLevel, zones } from '../data/zonesData';
import { itemsById } from '../data/itemsCatalog';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function DashboardPlayer() {
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expeditionSession, setExpeditionSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const missionSpotlight = useMemo(() => {
    if (!profile?.generalMissions?.length) {
      return [];
    }

    return [...profile.generalMissions]
      .map((mission) => {
        const progress = getMissionProgress(mission, profile);
        const percent = mission.type === 'house'
          ? (isMissionComplete(mission, profile) ? 100 : 0)
          : Math.min(100, Math.round((progress / mission.target) * 100));
        return {
          ...mission,
          progress,
          percent,
          complete: isMissionComplete(mission, profile),
        };
      })
      .sort((a, b) => {
        if (a.complete !== b.complete) {
          return a.complete ? 1 : -1;
        }
        return b.percent - a.percent;
      })
      .slice(0, 3);
  }, [profile]);

  useEffect(() => {
    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const savedCharacter = characterService.getMockCharacter(username);
      const workshopResult = WorkshopService.processWorkshopQueue({ now: Date.now() });
      if (workshopResult.completedJobs?.length) {
        toast.success(`Workshop ready: ${workshopResult.completedJobs.length} craft(s) completed.`);
      }
      const nextProfile = characterService.getMockProfile(username);
      const { nextMissions, nextMeta, changed } = ensureGeneralMissions(
        nextProfile?.generalMissions,
        nextProfile,
        nextProfile?.generalMissionsMeta
      );
      setCharacter(savedCharacter);

      if (changed) {
        const updated = characterService.updateMockProfile({
          generalMissions: nextMissions,
          generalMissionsMeta: nextMeta,
        });
        setProfile(updated);
      } else {
        setProfile(nextProfile);
      }

      const expeditionKey = `expeditionSession:${username}`;
      const stored = localStorage.getItem(expeditionKey);
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed?.locationId && parsed?.startTime && parsed?.endTime) {
            setExpeditionSession(parsed);
          } else {
            localStorage.removeItem(expeditionKey);
          }
        } catch {
          localStorage.removeItem(expeditionKey);
        }
      }

      const timer = setInterval(() => setNow(Date.now()), 1000);
      return () => clearInterval(timer);
    }
  }, []);


  const activeHouse = getHousingTierById(profile?.houseId || 'starter-cottage');
  const playerLevel = profile?.stats?.level ?? 1;
  const playerXp = profile?.stats?.xp ?? 0;
  const playerXpTarget = getPlayerXpForLevel(playerLevel);
  const miningLevel = profile?.miningLevel ?? 1;
  const miningXp = profile?.miningXp ?? 0;
  const farmLevel = profile?.farmLevel ?? 1;
  const farmXp = profile?.farmXp ?? 0;
  const miningXpTarget = getMiningXpForLevel(miningLevel);
  const farmXpTarget = getFarmXpForLevel(farmLevel);
  const workshopLevel = profile?.workshopLevel ?? 1;
  const workshopXp = profile?.workshopXp ?? 0;
  const workshopXpTarget = getWorkshopXpForLevel(workshopLevel);
  const workshopQueue = profile?.workshopQueue || [];
  const nextWorkshopJob = useMemo(() => {
    if (!workshopQueue.length) {
      return null;
    }
    return [...workshopQueue].sort((a, b) => a.finishAt - b.finishAt)[0] || null;
  }, [workshopQueue]);
  const workshopRemaining = nextWorkshopJob ? Math.max(0, nextWorkshopJob.finishAt - now) : 0;
  const inventory = profile?.inventory || {};
  const inventoryTotals = useMemo(() => {
    const totals = {};
    Object.entries(inventory).forEach(([itemId, amount]) => {
      const item = itemsById[itemId];
      const type = item?.type || 'misc';
      totals[type] = (totals[type] || 0) + (amount || 0);
    });
    return totals;
  }, [inventory]);
  const miningInventoryCount = inventoryTotals.ore || 0;
  const farmInventoryTotal = inventoryTotals['farm-good'] || 0;
  const miningSession = profile?.miningSession || null;
  const miningEndsAt = miningSession?.endAt || 0;
  const miningRemaining = Math.max(0, miningEndsAt - now);
  const miningInProgress = miningRemaining > 0;
  const expeditionLocation = expeditionSession ? getExpeditionLocation(expeditionSession.locationId) : null;
  const expeditionRemaining = expeditionSession
    ? Math.max(0, expeditionSession.endTime - now)
    : 0;
  const expeditionReady = !!expeditionSession && expeditionRemaining === 0;
  const activeZone = getZoneById(profile?.activeZoneId) || zones[0];
  const unlockedZoneIds = profile?.unlockedZones?.length
    ? profile.unlockedZones
    : getUnlockedZoneIdsByLevel(playerLevel);
  const unlockedZones = zones.filter((zone) => unlockedZoneIds.includes(zone.id));

  const handleZoneChange = (event) => {
    if (!profile) {
      return;
    }
    const nextZoneId = event.target.value;
    if (!nextZoneId || nextZoneId === profile.activeZoneId) {
      return;
    }
    const updated = characterService.updateMockProfile({ activeZoneId: nextZoneId });
    setProfile(updated);
    const zoneName = getZoneById(nextZoneId)?.name || 'New zone';
    toast.success(`${zoneName} is now active.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <DiscordModal />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="rounded-2xl p-8 shadow-2xl backdrop-blur court-reveal glass-panel">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                <div className="h-20 w-20 overflow-hidden rounded-2xl border border-yellow-700/40 bg-gray-900/70">
                  <img
                    src={character?.avatarUrl || '/raceicon/noimage.jpg'}
                    alt={character?.name || 'Unknown adventurer'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <p className="section-kicker text-sm uppercase tracking-[0.3em] text-yellow-500">
                    Command Deck
                  </p>
                  <h1 className="mt-3 text-4xl font-extrabold text-white sm:text-5xl hero-title">
                    {character?.name || 'Unbound Wanderer'}
                  </h1>
                  <p className="mt-2 text-sm text-gray-300">
                    {character?.race || 'Unknown'} · {character?.className || 'Adventurer'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Level</p>
                <p className="mt-1 text-3xl font-semibold text-yellow-300">{playerLevel}</p>
              </div>
            </div>
            <div className="mt-6 overflow-hidden rounded-2xl border border-yellow-700/30 bg-gray-950/70">
              <img
                src="/banner.jpg"
                alt="Dashboard banner"
                className="h-44 w-full object-cover sm:h-56"
              />
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Character XP</p>
                <div className="mt-3">
                  <XpBar current={playerXp} target={playerXpTarget} label="Character XP" tone="gold" />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-gray-400">
                  <span className="inline-flex items-center gap-1 rounded-full border border-yellow-700/40 bg-yellow-500/10 px-3 py-1 text-yellow-200">
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      aria-hidden="true"
                    >
                      <ellipse cx="12" cy="7" rx="7" ry="3" />
                      <path d="M5 7v4c0 1.7 3.1 3 7 3s7-1.3 7-3V7" />
                      <path d="M5 11v4c0 1.7 3.1 3 7 3s7-1.3 7-3v-4" />
                    </svg>
                    <span>Gold: {profile?.stats?.gold ?? 0}</span>
                  </span>
                  <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1">
                    Residence: {activeHouse?.name || 'Starter Cottage'}
                  </span>
                  <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1">
                    Buff: {activeHouse?.effect?.name || 'Rested Comfort'}
                  </span>
                </div>
              </div>
              <div className="rounded-2xl border border-yellow-700/30 bg-gradient-to-br from-yellow-500/10 via-gray-950/80 to-gray-950/40 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Expedition Status</p>
                <p className="mt-2 text-xl font-semibold text-white">
                  {expeditionLocation ? expeditionLocation.name : 'No expedition'}
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  {expeditionLocation?.summary || 'Deploy a crew to start earning rewards.'}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>{expeditionLocation?.region || '—'}</span>
                  <span>·</span>
                  <span>{expeditionLocation?.biome || '—'}</span>
                </div>
                <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-xs text-gray-400">
                    {expeditionLocation
                      ? expeditionReady
                        ? 'Ready to claim rewards.'
                        : `Time left: ${formatDuration(expeditionRemaining)}`
                      : 'No active expedition.'}
                  </p>
                  <Link
                    to={expeditionLocation ? '/expedition-active' : '/adventure'}
                    className="rounded-lg px-3 py-2 text-xs font-semibold text-white action-primary"
                  >
                    {expeditionLocation ? 'View Expedition' : 'Start Expedition'}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-2xl p-6 shadow-xl backdrop-blur court-reveal court-reveal-delay-1 court-card">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-500">Missions Spotlight</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Your General Missions</h2>
            <p className="mt-2 text-sm text-gray-300">
              Track progression goals and claim rewards as you level up.
            </p>
            <div className="mt-4 space-y-3">
              {missionSpotlight.length === 0 ? (
                <div className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-3 text-sm text-gray-300">
                  Missions will appear once you start leveling up.
                </div>
              ) : (
                missionSpotlight.map((mission) => (
                  <div
                    key={mission.id}
                    className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-3"
                  >
                    <div className="flex items-center justify-between text-sm text-gray-200">
                      <span>{mission.label}</span>
                      <span className="text-yellow-300">{mission.percent}%</span>
                    </div>
                    <div className="mt-2 h-2 rounded-full bg-gray-800">
                      <div
                        className="h-full rounded-full bg-yellow-500 shimmer-bar"
                        style={{ width: `${mission.percent}%` }}
                      />
                    </div>
                    <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-400">
                      {mission.complete ? 'Complete' : 'In Progress'}
                    </p>
                  </div>
                ))
              )}
            </div>
            <Link
              to="/missions"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Open Missions
            </Link>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="space-y-6">
            {!character && MOCK_AUTH && (
              <div className="rounded-2xl border border-dashed border-yellow-600/60 bg-yellow-900/20 p-6">
                <p className="text-sm text-yellow-200">
                  You have not forged a character yet. Begin your creation to enter the realm.
                </p>
                <Link
                  to="/character"
                  className="mt-3 inline-flex items-center rounded-lg bg-yellow-600 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-500"
                >
                  Create Character
                </Link>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Mining Outpost</p>
                <p className="mt-2 text-xl font-semibold text-white">Level {miningLevel}</p>
                <div className="mt-3">
                  <XpBar current={miningXp} target={miningXpTarget} label="Mining XP" tone="cyan" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>Inventory: {miningInventoryCount}</span>
                  <span>·</span>
                  <span>{miningInProgress ? `Run ends in ${formatDuration(miningRemaining)}` : 'Idle'}</span>
                </div>
                <Link
                  to="/mining"
                  className="mt-4 inline-flex items-center text-xs font-semibold text-yellow-200"
                >
                  Go to Mining
                </Link>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Farmstead</p>
                <p className="mt-2 text-xl font-semibold text-white">Level {farmLevel}</p>
                <div className="mt-3">
                  <XpBar current={farmXp} target={farmXpTarget} label="Farm XP" tone="emerald" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>Goods: {farmInventoryTotal}</span>
                  <span>·</span>
                  <span>Land: {profile?.farmLandSize ?? 0} plots</span>
                </div>
                <Link
                  to="/farm"
                  className="mt-4 inline-flex items-center text-xs font-semibold text-yellow-200"
                >
                  Go to Farm
                </Link>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Workshop</p>
                <p className="mt-2 text-xl font-semibold text-white">Level {workshopLevel}</p>
                <div className="mt-3">
                  <XpBar current={workshopXp} target={workshopXpTarget} label="Workshop XP" tone="emerald" />
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-gray-400">
                  <span>Jobs: {workshopQueue.length}</span>
                  <span>·</span>
                  <span>
                    {nextWorkshopJob ? `Next ready in ${formatDuration(workshopRemaining)}` : 'Idle'}
                  </span>
                </div>
                <Link
                  to="/workshop"
                  className="mt-4 inline-flex items-center text-xs font-semibold text-yellow-200"
                >
                  Go to Workshop
                </Link>
              </div>
            </div>

            <div className="rounded-2xl p-6 shadow-xl backdrop-blur court-reveal court-reveal-delay-2 hover-lift glass-panel">
              <h3 className="text-xl font-semibold text-white">Quick Actions</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Link
                  to="/adventure"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-white action-primary"
                >
                  Expeditions Hub
                </Link>
                <Link
                  to="/missions"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Missions
                </Link>
                <Link
                  to="/housing"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Housing
                </Link>
                <Link
                  to="/inventory"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Inventory
                </Link>
                <Link
                  to="/market"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Market
                </Link>
                <Link
                  to="/workshop"
                  className="rounded-lg px-4 py-3 text-center text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Workshop
                </Link>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl p-6 shadow-xl backdrop-blur court-reveal court-reveal-delay-2 hover-lift glass-panel">
              <h3 className="text-xl font-semibold text-white">Active Zone</h3>
              <p className="mt-2 text-sm text-gray-300">
                Choose where your crews focus. Each zone shifts idle rewards.
              </p>
              <div className="mt-4">
                <select
                  value={activeZone?.id || ''}
                  onChange={handleZoneChange}
                  className="w-full rounded-lg border border-yellow-700/40 bg-gray-950/70 px-3 py-2 text-sm text-yellow-100"
                >
                  {unlockedZones.map((zone) => (
                    <option key={zone.id} value={zone.id} className="bg-gray-950">
                      {zone.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-4 text-sm text-gray-300">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Now Active</p>
                <p className="mt-2 text-base font-semibold text-white">{activeZone?.name || 'Unknown zone'}</p>
                <p className="mt-2 text-xs text-gray-400">{activeZone?.description || '—'}</p>
                <div className="mt-3 grid gap-2 text-xs text-gray-400">
                  <div className="flex items-center justify-between">
                    <span>Mining</span>
                    <span>
                      x{activeZone?.modifiers?.miningYieldMultiplier ?? 1} yield · x{activeZone?.modifiers?.miningXpMultiplier ?? 1} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Farm</span>
                    <span>
                      x{activeZone?.modifiers?.farmYieldMultiplier ?? 1} yield · x{activeZone?.modifiers?.farmGrowMultiplier ?? 1} grow
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Expeditions</span>
                    <span>
                      x{activeZone?.modifiers?.expeditionGoldMultiplier ?? 1} gold · x{activeZone?.modifiers?.expeditionXpMultiplier ?? 1} XP
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Workshop</span>
                    <span>
                      x{activeZone?.modifiers?.workshopXpMultiplier ?? 1} XP · x{activeZone?.modifiers?.workshopDurationMultiplier ?? 1} time
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div className="rounded-2xl p-6 shadow-xl backdrop-blur court-reveal court-reveal-delay-2 hover-lift glass-panel">
              <h3 className="text-xl font-semibold text-white">Residence</h3>
              <div className="mt-4 overflow-hidden rounded-2xl border border-yellow-700/30 bg-gray-950/70">
                <img
                  src={activeHouse?.image || '/houses/house_1.png'}
                  alt={activeHouse?.name || 'Residence'}
                  className="h-40 w-full object-cover"
                />
              </div>
              <p className="mt-2 text-sm text-gray-300">
                {activeHouse?.name || 'Starter Cottage'} · {activeHouse?.tier || 'Tier 1'}
              </p>
              <p className="mt-2 text-sm text-gray-400">
                Buff: {activeHouse?.effect?.name || 'Rested Comfort'}
              </p>
              <Link
                to="/housing"
                className="mt-4 inline-flex items-center text-xs font-semibold text-yellow-200"
              >
                Manage Housing
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
