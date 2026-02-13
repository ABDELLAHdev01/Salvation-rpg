import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { ensureGeneralMissions, getMissionProgress, isMissionComplete } from '../data/missionData';
import { getPlayerXpForLevel } from '../data/playerData';

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
  const playerLevel = profile?.stats?.level ?? 1;
  const playerXp = profile?.stats?.xp ?? 0;
  const gold = profile?.stats?.gold ?? 0;

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

    const missionIndex = missions.findIndex((mission) => mission.id === missionId);
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

    const nextMissions = [...missions];
    nextMissions[missionIndex] = { ...mission, claimed: true };

    const xpGain = mission.rewardXp || 0;
    const { nextLevel, nextXp } = applyPlayerXp(playerLevel, playerXp, xpGain);
    const bonusLevels = mission.rewardLevels || 0;
    const finalLevel = nextLevel + bonusLevels;
    const levelGain = finalLevel - playerLevel;

    const updated = characterService.updateMockProfile({
      generalMissions: nextMissions,
      stats: {
        ...profile.stats,
        level: finalLevel,
        xp: nextXp,
        gold: gold + (mission.rewardGold || 0),
      },
    });

    setProfile(updated);
    toast.success(`Mission claimed +${mission.rewardGold}g +${levelGain} level +${xpGain} XP.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm2.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Progression</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">General Missions</h1>
              <p className="mt-3 text-base text-gray-300">
                Complete long-term goals to boost your character level and gold.
              </p>
            </div>
            <Link
              to="/housing"
              className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
            >
              Back to Housing
            </Link>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Player Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{playerLevel}</p>
            </div>
            <div className="court-card rounded-xl p-4">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gold</p>
              <p className="mt-2 text-2xl font-semibold text-yellow-300">{gold}</p>
            </div>
            <div className="image-panel image-panel-housing ornament-frame p-4">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-300">Completed</p>
                <p className="mt-2 text-2xl font-semibold text-white">{completedCount}/{missions.length}</p>
              </div>
            </div>
          </div>

          <div className="mt-8 space-y-4">
            {missions.map((mission) => {
              const progress = getMissionProgress(mission, profile);
              const isComplete = isMissionComplete(mission, profile);
              return (
                <div
                  key={mission.id}
                  className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-4"
                >
                  <div>
                    <p className="text-sm font-semibold text-white">{mission.label}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      Progress: {mission.type === 'house' ? (isComplete ? 'Owned' : 'Not owned') : `${progress}/${mission.target}`}
                    </p>
                    <p className="mt-1 text-xs text-gray-400">
                      Rewards: +{mission.rewardLevels || 0} level · +{mission.rewardGold || 0}g · +{mission.rewardXp || 0} XP
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleClaim(mission.id)}
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${mission.claimed
                        ? 'bg-gray-700 text-gray-300'
                        : isComplete
                          ? 'action-primary text-white'
                          : 'bg-gray-700 text-gray-300'
                      }`}
                    disabled={!isComplete || mission.claimed}
                  >
                    {mission.claimed ? 'Claimed' : isComplete ? 'Claim Reward' : 'In Progress'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
