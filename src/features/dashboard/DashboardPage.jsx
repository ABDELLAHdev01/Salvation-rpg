import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import DiscordModal from '../../shared/modals/DiscordModal';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getHousingTierById } from '../../core/data/housingData';
import { getFarmXpForLevel } from '../../core/data/farmData';
import { formatDuration, getMiningXpForLevel } from '../../core/data/miningData';
import { getPlayerXpForLevel } from '../../core/data/playerData';
import { ensureGeneralMissions, getMissionProgress, isMissionComplete } from '../../core/data/missionData';
import { getExpeditionLocation } from '../../core/data/expeditionData';
import WorkshopService from '../../core/services/WorkshopService';
import { getWorkshopXpForLevel } from '../../core/data/workshopData';

// Standard UI Components
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';

// Dashboard Widgets
import PlayerIdentityCard from './widgets/PlayerIdentityCard';
import PlayerStatsBar from './widgets/PlayerStatsBar';
import ExpeditionStatusCard from './widgets/ExpeditionStatusCard';
import MissionSpotlight from './widgets/MissionSpotlight';
import SkillProgressGrid from './widgets/SkillProgressGrid';
import ResidenceCard from './widgets/ResidenceCard';
import MentorMilestoneModal from './widgets/MentorMilestoneModal';
import MentorCounselWidget from './widgets/MentorCounselWidget';
import WorldHUD from '../../core/world/WorldHUD';
import CitadelWorldView from '../../core/world/CitadelWorldView';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function DashboardPlayer() {
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [expeditionSession, setExpeditionSession] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [viewMode, setViewMode] = useState('world');

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

  return (
    <section className="min-h-screen bg-page-primary lg:pl-64 dashboard-shell">
      <Sidebar />
      <DiscordModal />
      <MentorMilestoneModal
        profile={profile}
        onMilestoneClaimed={(updated) => setProfile({ ...updated })}
      />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-4 py-8 pt-20 sm:px-6">
        {/* Fantasy RPG World HUD */}
        <WorldHUD
          title="Citadel of Salvation"
          zoneKicker="Capital Realm"
          levelLabel="Warden Lvl"
          level={playerLevel}
          currentXp={playerXp}
          targetXp={playerXpTarget}
          gold={profile?.stats?.gold ?? 0}
          weather={{ season: 'Spring', label: 'Sunforge Radiance' }}
          viewMode={viewMode}
          onToggleViewMode={() => setViewMode(viewMode === 'world' ? 'ledger' : 'world')}
          className="mb-6"
        />

        {viewMode === 'world' ? (
          <div className="space-y-6">
            {/* Direct Playable 2D World Banner */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border-2 border-yellow-500/40 bg-gradient-to-r from-yellow-950/60 via-gray-950 to-yellow-950/60 p-4 shadow-xl backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="text-3xl animate-bounce">🌍</span>
                <div>
                  <h3 className="font-serif text-base font-bold text-yellow-300">
                    Living 2D Fantasy RPG World
                  </h3>
                  <p className="text-xs text-gray-300">
                    Control your custom adventurer directly with WASD &amp; Sprint. Till soil, mine minerals, and explore Homestead, Caverns, Whispering Forest &amp; Village!
                  </p>
                </div>
              </div>
              <Button variant="primary" to="/world" className="shrink-0 font-serif shadow-lg">
                Enter 2D World ➔
              </Button>
            </div>

            {/* 2D Interactive Citadel Plaza */}
            <CitadelWorldView profile={profile} character={character} />

            {/* In-World Spotlights: Active Missions & Mentor Guidance */}
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <MissionSpotlight missionSpotlight={missionSpotlight} />
              <MentorCounselWidget profile={profile} />
            </div>
          </div>
        ) : (
          <div>
            <div className="mb-10 grid gap-6 lg:grid-cols-[1.35fr_0.65fr]">
              <Panel variant="glass" className="court-reveal">
                <PlayerIdentityCard
                  character={character}
                  playerLevel={playerLevel}
                  cityId={character?.city || profile?.city}
                  title={profile?.title}
                />
                <PlayerStatsBar
                  playerXp={playerXp}
                  playerXpTarget={playerXpTarget}
                  gold={profile?.stats?.gold}
                  activeHouse={activeHouse}
                />
                <div className="mt-6">
                  <ExpeditionStatusCard
                    expeditionLocation={expeditionLocation}
                    expeditionReady={expeditionReady}
                    expeditionRemaining={expeditionRemaining}
                    formatDuration={formatDuration}
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
                  <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4">
                    <Button variant="primary" to="/world">2D RPG World</Button>
                    <Button variant="secondary" to="/adventure">Expeditions</Button>
                    <Button variant="secondary" to="/arena">Colosseum</Button>
                    <Button variant="secondary" to="/missions">Missions</Button>
                    <Button variant="secondary" to="/guild">Fellowship</Button>
                    <Button variant="secondary" to="/housing">Housing</Button>
                    <Button variant="secondary" to="/inventory">Inventory</Button>
                    <Button variant="secondary" to="/market">Market</Button>
                    <Button variant="secondary" to="/workshop">Workshop</Button>
                  </div>
                </Panel>
              </div>

              <div className="space-y-8">
                <ResidenceCard
                  activeHouse={activeHouse}
                  estateAmenitiesCount={profile?.estateAmenities?.length || 0}
                />
                <MentorCounselWidget profile={profile} />
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
