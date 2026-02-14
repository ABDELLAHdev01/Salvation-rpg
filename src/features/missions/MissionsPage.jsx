import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { ensureGeneralMissions, getMissionProgress, isMissionComplete } from '../../core/data/missionData';
import { getPlayerXpForLevel } from '../../core/data/playerData';

// Standard UI Components
import Panel from '../../shared/ui/Panel';

// Mission Widgets
import MissionsHeader from './widgets/MissionsHeader';
import MissionsStats from './widgets/MissionsStats';
import MissionCard from './widgets/MissionCard';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Missions() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!MOCK_AUTH) return;

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    const { nextMissions, nextMeta, changed } = ensureGeneralMissions(
      nextProfile?.generalMissions,
      nextProfile,
      nextProfile?.generalMissionsMeta
    );

    if (changed) {
      const updated = characterService.updateMockProfile({
        generalMissions: nextMissions,
        generalMissionsMeta: nextMeta,
      });
      setProfile(updated);
    } else {
      setProfile(nextProfile);
    }
  }, []);

  const missions = useMemo(() => profile?.generalMissions || [], [profile?.generalMissions]);
  const playerLevel = Number(profile?.stats?.level ?? 1);
  const playerXp = Number(profile?.stats?.xp ?? 0);
  const gold = Number(profile?.stats?.gold ?? 0);

  const completedCount = useMemo(
    () => missions.filter((mission) => isMissionComplete(mission, profile)).length,
    [missions, profile]
  );

  const applyPlayerXp = (startLevel, startXp, gain) => {
    let nextLevel = startLevel;
    let nextXp = startXp + gain;
    let target = getPlayerXpForLevel(nextLevel);

    while (nextXp >= target) {
      nextXp -= target;
      nextLevel += 1;
      target = getPlayerXpForLevel(nextLevel);
    }

    return { nextLevel, nextXp };
  };

  const handleClaim = (missionId) => {
    if (!MOCK_AUTH || !profile) return;

    const missionIndex = missions.findIndex((m) => m.id === missionId);
    if (missionIndex === -1) return;

    const mission = missions[missionIndex];
    if (mission.claimed) {
      toast('Mission already claimed.', { icon: '✅' });
      return;
    }

    if (!isMissionComplete(mission, profile)) {
      toast.error('Mission not complete yet.');
      return;
    }

    const tempMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );

    const xpGain = Number(mission.rewardXp || 0);
    const { nextLevel, nextXp } = applyPlayerXp(playerLevel, playerXp, xpGain);
    const bonusLevels = Number(mission.rewardLevels || 0);
    const finalLevel = nextLevel + bonusLevels;

    const { nextMissions, nextMeta } = ensureGeneralMissions(
      tempMissions,
      {
        ...profile,
        stats: {
          ...profile.stats,
          level: finalLevel,
          xp: nextXp,
          gold: gold + (mission.rewardGold || 0),
        },
      },
      profile.generalMissionsMeta
    );

    const updated = characterService.updateMockProfile({
      generalMissions: nextMissions,
      generalMissionsMeta: nextMeta,
      stats: {
        ...profile.stats,
        level: finalLevel,
        xp: nextXp,
        gold: gold + (mission.rewardGold || 0),
      },
    });

    setProfile(updated);
    toast.success(`Claimed +${mission.rewardGold}g +${finalLevel - playerLevel} lvl +${xpGain} XP.`);
  };

  return (
    <section className="min-h-screen bg-page-secondary dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <MissionsHeader playerLevel={playerLevel} />

        <MissionsStats
          gold={gold}
          completedCount={completedCount}
          totalCount={missions.length}
        />

        <div className="space-y-4">
          {missions.map((mission) => (
            <MissionCard
              key={mission.id}
              mission={mission}
              progress={getMissionProgress(mission, profile)}
              isComplete={isMissionComplete(mission, profile)}
              handleClaim={handleClaim}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
