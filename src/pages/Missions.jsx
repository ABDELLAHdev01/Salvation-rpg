import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { ensureGeneralMissions, getMissionProgress, isMissionComplete } from '../data/missionData';
import { getPlayerXpForLevel } from '../data/playerData';

// Standard UI Components
import Panel from '../components/ui/Panel';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import SectionHeader from '../components/ui/SectionHeader';
import ProgressBar from '../components/ui/ProgressBar';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Missions() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

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
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const missionIndex = missions.findIndex((m) => m.id === missionId);
    if (missionIndex === -1) {
      return;
    }

    const mission = missions[missionIndex];
    if (mission.claimed) {
      toast('Mission already claimed.', { icon: '✅' });
      return;
    }

    if (!isMissionComplete(mission, profile)) {
      toast.error('Mission not complete yet.');
      return;
    }

    // Prepare updates
    const tempMissions = missions.map((m) =>
      m.id === missionId ? { ...m, claimed: true } : m
    );

    const xpGain = Number(mission.rewardXp || 0);
    const { nextLevel, nextXp } = applyPlayerXp(playerLevel, playerXp, xpGain);
    const bonusLevels = Number(mission.rewardLevels || 0);
    const finalLevel = nextLevel + bonusLevels;
    const levelGain = finalLevel - playerLevel;

    // Trigger sequential mission replacement
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
    toast.success(`Claimed +${mission.rewardGold}g +${levelGain} lvl +${xpGain} XP.`);
  };

  return (
    <section className="min-h-screen bg-page-secondary dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">

        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <SectionHeader
            kicker="Progression"
            title="General Missions"
            description="Complete long-term goals to boost your character level and wealth."
          />
          <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[140px]">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Player Level</p>
            <p className="mt-1 text-4xl font-black text-white">{playerLevel}</p>
          </Panel>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Panel variant="subtle" className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-400">Current Gold</span>
            <span className="text-xl font-bold text-yellow-500">{gold.toLocaleString()}g</span>
          </Panel>
          <Panel variant="subtle" className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-gray-400">Missions Run</span>
            <span className="text-xl font-bold text-white">{completedCount}/{missions.length}</span>
          </Panel>
          <Panel variant="glass" className="sm:col-span-2 lg:col-span-1 py-3">
            <ProgressBar
              current={completedCount}
              target={missions.length}
              tone="gold"
              label="Legacy Completion"
            />
          </Panel>
        </div>

        <div className="space-y-4">
          {missions.map((mission) => {
            const progress = getMissionProgress(mission, profile);
            const isComplete = isMissionComplete(mission, profile);
            const progressPct = mission.type === 'house'
              ? (isComplete ? 100 : 0)
              : Math.min(100, (progress / mission.target) * 100);

            return (
              <Panel
                key={mission.id}
                variant={isComplete && !mission.claimed ? 'ornament' : 'card'}
                className={`transition-all duration-300 ${mission.claimed ? 'opacity-60 grayscale-[0.5]' : ''}`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex-1 w-full">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-white">{mission.label}</h3>
                      {mission.claimed && <Badge variant="success">Claimed</Badge>}
                      {isComplete && !mission.claimed && <Badge variant="gold" className="animate-pulse">Ready</Badge>}
                    </div>

                    <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-xs text-gray-400 font-medium">
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Progress:</span>
                        <span className={isComplete ? 'text-emerald-400' : 'text-gray-300'}>
                          {mission.type === 'house' ? (isComplete ? 'Owned' : 'Not owned') : `${progress} / ${mission.target}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">Reward:</span>
                        <span className="text-yellow-600/80">
                          +{mission.rewardGold}g, +{mission.rewardLevels} lvl, +{mission.rewardXp} XP
                        </span>
                      </div>
                    </div>

                    {!mission.claimed && (
                      <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-yellow-500/50'}`}
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    )}
                  </div>

                  <Button
                    variant={isComplete && !mission.claimed ? 'ornate' : 'secondary'}
                    onClick={() => handleClaim(mission.id)}
                    disabled={!isComplete || mission.claimed}
                    size="sm"
                    className="min-w-[120px]"
                  >
                    {mission.claimed ? 'Archived' : isComplete ? 'Claim Reward' : 'In Progress'}
                  </Button>
                </div>
              </Panel>
            );
          })}
        </div>
      </div>
    </section>
  );
}
