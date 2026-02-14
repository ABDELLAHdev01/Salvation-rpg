import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../shared/layout/Sidebar';
import DiscordModal from '../shared/modals/DiscordModal';
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
import Panel from '../shared/ui/Panel';
import Button from '../shared/ui/Button';

// Dashboard Widgets
import PlayerIdentityCard from '../features/dashboard/widgets/PlayerIdentityCard';
import PlayerStatsBar from '../features/dashboard/widgets/PlayerStatsBar';
import ExpeditionStatusCard from '../features/dashboard/widgets/ExpeditionStatusCard';
import ZoneControlPanel from '../features/dashboard/widgets/ZoneControlPanel';
import MissionSpotlight from '../features/dashboard/widgets/MissionSpotlight';
import SkillProgressGrid from '../features/dashboard/widgets/SkillProgressGrid';
import ResidenceCard from '../features/dashboard/widgets/ResidenceCard';

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
  const workshopQueue = profile?.workshopQueue || [];
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
    if (!profile) return;
    const nextZoneId = event.target.value;
    if (!nextZoneId || nextZoneId === profile.activeZoneId) return;
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
            <PlayerIdentityCard character={character} playerLevel={playerLevel} />
            <PlayerStatsBar
              playerXp={playerXp}
              playerXpTarget={playerXpTarget}
              gold={profile?.stats?.gold}
              activeHouse={activeHouse}
            />
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <ExpeditionStatusCard
                expeditionLocation={expeditionLocation}
                expeditionReady={expeditionReady}
                expeditionRemaining={expeditionRemaining}
                formatDuration={formatDuration}
              />
              <ZoneControlPanel
                activeZone={activeZone}
                unlockedZones={unlockedZones}
                handleZoneChange={handleZoneChange}
              />
            </div>
          </Panel>

          <MissionSpotlight missionSpotlight={missionSpotlight} />
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-8">
            <SkillProgressGrid
              miningLevel={miningLevel} miningXp={miningXp} miningXpTarget={miningXpTarget} miningInProgress={miningInProgress}
              farmLevel={farmLevel} farmXp={farmXp} farmXpTarget={farmXpTarget} farmLandSize={profile?.farmLandSize}
              workshopLevel={workshopLevel} workshopXp={workshopXp} workshopXpTarget={workshopXpTarget} workshopQueueLength={workshopQueue.length}
            />

            <Panel variant="glass" className="hover-lift">
              <div className="flex flex-col gap-1 mb-6">
                <p className="section-kicker text-xs uppercase tracking-[0.35em] text-yellow-500">Navigation</p>
                <h2 className="text-2xl font-black text-white hero-title">Quick Access</h2>
                <p className="text-sm text-gray-400">Central hub for all major systems.</p>
              </div>
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
            <ResidenceCard activeHouse={activeHouse} />
          </div>
        </div>
      </div>
    </section>
  );
}
