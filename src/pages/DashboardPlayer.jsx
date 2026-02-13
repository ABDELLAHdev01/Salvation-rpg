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

// Standard UI Components
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';

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
      .filter((m) => !m.claimed || (m.type === 'house' && m.target === 'complete'))
      .map((mission) => {
        const progress = getMissionProgress(mission, profile);
        const percent = mission.type === 'house'
          ? (isMissionComplete(mission, profile) ? 100 : 0)
          : Math.min(100, Math.round((progress / (mission.target || 1)) * 100));
        return {
          ...mission,
          progress,
          percent,
          complete: isMissionComplete(mission, profile),
        };
      })
      .sort((a, b) => {
        // Prioritize completed (ready to claim) but not claimed
        if (a.complete !== b.complete) {
          return a.complete ? -1 : 1;
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
  const workshopQueue = useMemo(
    () => profile?.workshopQueue || [],
    [profile?.workshopQueue]
  );
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
    <section className="min-h-screen bg-page-primary lg:pl-64 dashboard-shell">
      <Sidebar />
      <DiscordModal />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
          <Panel variant="glass" className="court-reveal">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-yellow-700/40 bg-gray-900/90 shadow-2xl mx-auto sm:mx-0">
                  <img
                    src={character?.avatarUrl || '/raceicon/noimage.jpg'}
                    alt={character?.name || 'Unknown adventurer'}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <SectionHeader
                    kicker="Command Deck"
                    title={character?.name || 'Unbound Wanderer'}
                    description={`${character?.race || 'Unknown'} · ${character?.className || 'Adventurer'}`}
                  />
                </div>
              </div>
              <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[100px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Level</p>
                <p className="mt-1 text-4xl font-black text-yellow-400 drop-shadow-sm">{playerLevel}</p>
              </Panel>
            </div>

            <Panel variant="subtle" className="mt-8">
              <XpBar current={playerXp} target={playerXpTarget} label="Character XP" tone="gold" />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant="gold">
                  <span className="text-yellow-500 font-black">●</span>
                  Gold: {profile?.stats?.gold ?? 0}
                </Badge>
                <Badge variant="ghost">
                  Residence: {activeHouse?.name || 'Starter Cottage'}
                </Badge>
                <Badge variant="info">
                  Buff: {activeHouse?.effect?.name || 'Rested Comfort'}
                </Badge>
              </div>
            </Panel>

            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Panel variant="ornament" className="group">
                <SectionHeader kicker="Expedition" />
                <p className="mt-2 text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
                  {expeditionLocation ? expeditionLocation.name : 'No active mission'}
                </p>
                <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-2">
                  {expeditionLocation?.summary || 'Deploy a crew to start earning rewards and uncovering secrets.'}
                </p>
                <div className="mt-5 flex items-center justify-between">
                  <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {expeditionLocation
                      ? expeditionReady
                        ? <span className="text-emerald-400 animate-pulse">Ready to claim</span>
                        : `Returns in: ${formatDuration(expeditionRemaining)}`
                      : 'Crews idle'}
                  </div>
                  <Button
                    variant={expeditionLocation ? 'primary' : 'secondary'}
                    size="sm"
                    to={expeditionLocation ? '/expedition-active' : '/adventure'}
                  >
                    {expeditionLocation ? 'Monitor' : 'Deploy'}
                  </Button>
                </div>
              </Panel>

              <Panel variant="subtle" className="flex flex-col justify-center">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-3">Zone Control</p>
                <select
                  value={activeZone?.id || ''}
                  onChange={handleZoneChange}
                  className="w-full rounded-xl border border-yellow-700/20 bg-gray-950/90 px-4 py-2.5 text-sm text-yellow-100 focus:border-yellow-500/50 outline-none transition-all"
                >
                  {unlockedZones.map((zone) => (
                    <option key={zone.id} value={zone.id} className="bg-gray-950">
                      {zone.name}
                    </option>
                  ))}
                </select>
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-bold text-yellow-500/70">Current:</span>
                  <span>{activeZone?.name}</span>
                </div>
              </Panel>
            </div>
          </Panel>

          <Panel variant="card" className="court-reveal-delay-1 flex flex-col">
            <SectionHeader
              kicker="Missions"
              title="Spotlight"
              description="Active progression goals."
            />
            <div className="mt-6 flex-1 space-y-4">
              {missionSpotlight.length === 0 ? (
                <Panel variant="subtle" className="text-center py-10">
                  <p className="text-sm text-gray-400 italic">Missions will appear as you progress.</p>
                </Panel>
              ) : (
                missionSpotlight.map((mission) => (
                  <div key={mission.id} className="group">
                    <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                      <span>{mission.label}</span>
                      <span className={mission.complete ? 'text-emerald-400 animate-pulse' : 'text-yellow-400'}>
                        {mission.complete ? 'READY' : `${mission.percent}%`}
                      </span>
                    </div>
                    <div className="relative h-2 rounded-full bg-gray-900 border border-white/5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 shimmer-bar ${mission.complete ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.3)]'}`}
                        style={{ width: `${mission.percent}%` }}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
            <Button variant="ornate" to="/missions" className="mt-8">
              Open Log
            </Button>
          </Panel>
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-8">
            <div className="grid gap-4 sm:grid-cols-3">
              <Panel variant="subtle" className="group hover:border-cyan-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Mining</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Level {miningLevel}</p>
                <div className="mt-3">
                  <XpBar current={miningXp} target={miningXpTarget} label="Mining" tone="cyan" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>{miningInProgress ? 'MAPPING...' : 'IDLE'}</span>
                  <Link to="/mining" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
              </Panel>

              <Panel variant="subtle" className="group hover:border-emerald-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Farmstead</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Level {farmLevel}</p>
                <div className="mt-3">
                  <XpBar current={farmXp} target={farmXpTarget} label="Farming" tone="emerald" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>{profile?.farmLandSize ?? 0} PLOTS</span>
                  <Link to="/farm" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
              </Panel>

              <Panel variant="subtle" className="group hover:border-amber-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Workshop</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Level {workshopLevel}</p>
                <div className="mt-3">
                  <XpBar current={workshopXp} target={workshopXpTarget} label="Craft" tone="emerald" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                  <span>{workshopQueue.length} JOBS</span>
                  <Link to="/workshop" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
              </Panel>
            </div>

            <Panel variant="glass" className="hover-lift">
              <SectionHeader
                title="Quick Access"
                description="Central hub for all major systems."
              />
              <div className="mt-6 grid gap-4 sm:grid-cols-3">
                <Button variant="secondary" to="/adventure">Expeditions</Button>
                <Button variant="secondary" to="/missions">Missions</Button>
                <Button variant="secondary" to="/housing">Housing</Button>
                <Button variant="secondary" to="/inventory">Inventory</Button>
                <Button variant="secondary" to="/market">Market</Button>
                <Button variant="secondary" to="/workshop">Workshop</Button>
              </div>
            </Panel>
          </div>

          <div className="space-y-8">
            <Panel variant="ornament" className="hover-lift">
              <SectionHeader kicker="Real Estate" title="Residence" />
              <div className="mt-4 aspect-video overflow-hidden rounded-xl border border-yellow-700/30 bg-gray-950/80 shadow-inner group">
                <img
                  src={activeHouse?.image || '/houses/house_1.png'}
                  alt={activeHouse?.name || 'Residence'}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
              </div>
              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Vibe</span>
                  <Badge variant="gold">{activeHouse?.tier || 'Tier 1'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Comfort</span>
                  <Badge variant="info">{activeHouse?.effect?.name || 'Rested Comfort'}</Badge>
                </div>
              </div>
              <Button variant="ghost" to="/housing" className="mt-6 w-full text-[11px] uppercase tracking-widest">
                Manage Property
              </Button>
            </Panel>
          </div>
        </div>
      </div>
    </section>
  );
}
