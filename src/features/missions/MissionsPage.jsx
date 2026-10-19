import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import {
  ensureGeneralMissions,
  getMissionProgress,
  isMissionComplete,
  chronicleChapters,
  getChapterProgress,
} from '../../core/data/missionData';
import { getPlayerXpForLevel } from '../../core/data/playerData';
import audioManager from '../../core/audio/AudioManager';

// Mission & Chronicle Widgets
import MissionsHeader from './widgets/MissionsHeader';
import MissionsStats from './widgets/MissionsStats';
import MissionCard from './widgets/MissionCard';
import ChronicleChapterCard from './widgets/ChronicleChapterCard';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Missions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'chapters' ? 'chapters' : 'decrees';
  const [activeTab, setActiveTab] = useState(initialTab);
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

  const chapterProgressList = useMemo(() => {
    return chronicleChapters.map((ch) => ({
      chapter: ch,
      progress: {
        ...getChapterProgress(ch, profile),
        profile,
      },
    }));
  }, [profile]);

  const completedChaptersCount = useMemo(() => {
    return chapterProgressList.filter((c) => c.progress.completed).length;
  }, [chapterProgressList]);

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
    audioManager.play(finalLevel > playerLevel ? 'levelup' : 'coin');
    toast.success(`Claimed +${mission.rewardGold}g +${finalLevel - playerLevel} lvl +${xpGain} XP.`);
  };

  const handleClaimChapter = (chapter) => {
    if (!MOCK_AUTH || !profile) return;

    const { completed, claimed } = getChapterProgress(chapter, profile);
    if (claimed) {
      toast('Chapter accolade already claimed.', { icon: '✅' });
      return;
    }
    if (!completed) {
      toast.error('Complete all chapter objectives first.');
      return;
    }

    const xpGain = Number(chapter.rewardXp || 0);
    const { nextLevel, nextXp } = applyPlayerXp(playerLevel, playerXp, xpGain);

    const existingClaimed = Array.isArray(profile.claimedChapters) ? profile.claimedChapters : [];
    const nextClaimedChapters = [...existingClaimed, chapter.id];

    const existingTitles = Array.isArray(profile.unlockedTitles) ? profile.unlockedTitles : ['Warden Initiate'];
    const nextTitles = Array.from(new Set([...existingTitles, chapter.titleReward]));

    const updated = characterService.updateMockProfile({
      claimedChapters: nextClaimedChapters,
      unlockedTitles: nextTitles,
      title: chapter.titleReward,
      stats: {
        ...profile.stats,
        level: nextLevel,
        xp: nextXp,
        gold: (profile.stats?.gold || 0) + (chapter.rewardGold || 0),
      },
    });

    setProfile(updated);
    audioManager.play('levelup');
    setTimeout(() => {
      audioManager.play('coin');
    }, 250);

    toast.success(
      `Chapter ${chapter.chapterNumber} Complete! Unlocked Title: «${chapter.titleReward}», +${chapter.rewardGold}g, +${xpGain} XP!`
    );
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setSearchParams(tab === 'chapters' ? { tab: 'chapters' } : {});
    audioManager.play('tap');
  };

  return (
    <section className="min-h-screen bg-page-secondary dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <MissionsHeader playerLevel={playerLevel} />

        {/* Tab Navigation */}
        <div className="mb-8 flex items-center gap-3 border-b border-gray-800 pb-4">
          <button
            type="button"
            onClick={() => switchTab('decrees')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'decrees'
                ? 'action-primary text-white shadow-lg'
                : 'action-ghost text-gray-400 hover:text-white'
            }`}
          >
            <span>📜 Estate Decrees & Bounties</span>
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">
              {completedCount}/{missions.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => switchTab('chapters')}
            className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
              activeTab === 'chapters'
                ? 'action-primary text-white shadow-lg'
                : 'action-ghost text-gray-400 hover:text-white'
            }`}
          >
            <span>⚔️ The Warden's Chronicle</span>
            <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">
              {completedChaptersCount}/{chronicleChapters.length} Chapters
            </span>
          </button>
        </div>

        {activeTab === 'decrees' ? (
          <>
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
          </>
        ) : (
          <div className="space-y-6">
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-5 backdrop-blur flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold">
                  Saga Progression
                </p>
                <h3 className="text-lg font-bold text-white hero-title">
                  Grand Chronicle of the Realm
                </h3>
                <p className="text-xs text-gray-400">
                  Permanent milestones tracking your rise from borderland initiate to Sovereign of the Realm.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-300">Current Title:</span>
                <span className="rounded-lg border border-yellow-600/40 bg-yellow-950/60 px-3 py-1.5 text-xs font-bold text-yellow-300">
                  «{profile?.title || 'Warden Initiate'}»
                </span>
              </div>
            </div>

            <div className="space-y-6">
              {chapterProgressList.map(({ chapter, progress }) => (
                <ChronicleChapterCard
                  key={chapter.id}
                  chapter={chapter}
                  progress={progress}
                  onClaim={handleClaimChapter}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
