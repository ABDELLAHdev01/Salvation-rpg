import { describe, it, expect } from 'vitest';
import {
  ensureGeneralMissions,
  getMissionProgress,
  isMissionComplete,
  chronicleChapters,
  getChapterProgress,
} from '../src/core/data/missionData';

describe('Mission & Chronicle Domain Logic', () => {
  const mockProfile = {
    stats: {
      level: 4,
      xp: 250,
      gold: 500,
      expeditionsCompleted: 2,
    },
    farmLevel: 3,
    miningLevel: 5,
    ownedHouses: ['starter-cottage'],
  };

  it('generates a full mission set for a fresh character profile', () => {
    const { nextMissions, nextMeta, changed } = ensureGeneralMissions([], mockProfile, null);

    expect(changed).toBe(true);
    expect(nextMissions.length).toBeGreaterThanOrEqual(4);
    expect(nextMeta.playerLevel).toBe(4);
    expect(nextMeta.farmLevel).toBe(3);
    expect(nextMeta.miningLevel).toBe(5);

    const types = nextMissions.map((m) => m.type);
    expect(types).toContain('player-level');
    expect(types).toContain('farm-level');
    expect(types).toContain('mining-level');
    expect(types).toContain('house');
  });

  it('accurately calculates progress across distinct mission types', () => {
    const playerMission = { type: 'player-level', target: 5 };
    const farmMission = { type: 'farm-level', target: 4 };
    const houseMission = { type: 'house', target: 'starter-cottage' };
    const expeditionsMission = { type: 'expeditions', target: 3 };

    expect(getMissionProgress(playerMission, mockProfile)).toBe(4);
    expect(getMissionProgress(farmMission, mockProfile)).toBe(3);
    expect(getMissionProgress(houseMission, mockProfile)).toBe(1);
    expect(getMissionProgress(expeditionsMission, mockProfile)).toBe(2);
  });

  it('evaluates mission completion correctly', () => {
    const incompleteMission = { type: 'player-level', target: 10 };
    const completeMission = { type: 'farm-level', target: 3 };
    const ownedHouseMission = { type: 'house', target: 'starter-cottage' };
    const unownedHouseMission = { type: 'house', target: 'grand-estate' };

    expect(isMissionComplete(incompleteMission, mockProfile)).toBe(false);
    expect(isMissionComplete(completeMission, mockProfile)).toBe(true);
    expect(isMissionComplete(ownedHouseMission, mockProfile)).toBe(true);
    expect(isMissionComplete(unownedHouseMission, mockProfile)).toBe(false);
  });

  it('preserves existing missions and meta when no changes occur', () => {
    const { nextMissions, nextMeta } = ensureGeneralMissions([], mockProfile, null);
    const result = ensureGeneralMissions(nextMissions, mockProfile, nextMeta);

    expect(result.changed).toBe(false);
    expect(result.nextMissions).toEqual(nextMissions);
  });

  it('validates narrative chronicle chapters structure and progression', () => {
    expect(chronicleChapters.length).toBe(5);

    chronicleChapters.forEach((ch, idx) => {
      expect(ch.id).toBe(`chapter-${idx + 1}`);
      expect(ch.chapterNumber).toBe(idx + 1);
      expect(ch.title).toBeDefined();
      expect(ch.subtitle).toBeDefined();
      expect(ch.lore).toBeDefined();
      expect(ch.rewardGold).toBeGreaterThan(0);
      expect(ch.rewardXp).toBeGreaterThan(0);
      expect(ch.titleReward).toBeDefined();
      expect(ch.objectives.length).toBeGreaterThanOrEqual(3);
    });
  });

  it('calculates chronicle chapter progress and completion accurately', () => {
    const chapter1 = chronicleChapters[0];
    const progress = getChapterProgress(chapter1, mockProfile);

    // mockProfile: level 4 (>=2), ownedHouses: ['starter-cottage'] (>=1), expeditionsCompleted: 2 (>=1)
    expect(progress.completed).toBe(true);
    expect(progress.claimed).toBe(false);
    expect(progress.percent).toBe(100);
    expect(progress.completedCount).toBe(3);

    // When claimed
    const claimedProfile = {
      ...mockProfile,
      claimedChapters: ['chapter-1'],
    };
    const claimedProgress = getChapterProgress(chapter1, claimedProfile);
    expect(claimedProgress.claimed).toBe(true);

    // Chapter 5: requires level 8, 5 expeditions, etc.
    const chapter5 = chronicleChapters[4];
    const ch5Progress = getChapterProgress(chapter5, mockProfile);
    expect(ch5Progress.completed).toBe(false);
    expect(ch5Progress.percent).toBeLessThan(100);
  });
});
