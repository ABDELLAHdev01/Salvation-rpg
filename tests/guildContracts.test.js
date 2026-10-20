import { describe, it, expect } from 'vitest';
import {
  GUILD_RANKS,
  CONTRACT_REGISTRY,
  getGuildRank,
  getGuildRankProgress,
  getGuildBoardState,
  acceptGuildContract,
  recordContractProgress,
  claimContractReward,
} from '../src/core/quests/guildContracts';

describe('Guild Contracts & Progression System', () => {
  it('correctly calculates Guild Ranks based on renown thresholds', () => {
    expect(getGuildRank(0).name).toBe('Recruit');
    expect(getGuildRank(49).name).toBe('Recruit');
    expect(getGuildRank(50).name).toBe('Bronze Adventurer');
    expect(getGuildRank(149).name).toBe('Bronze Adventurer');
    expect(getGuildRank(150).name).toBe('Silver Adventurer');
    expect(getGuildRank(300).name).toBe('Gold Adventurer');
    expect(getGuildRank(500).name).toBe('Platinum Adventurer');
    expect(getGuildRank(800).name).toBe('Mythic Adventurer');
    expect(getGuildRank(2500).name).toBe('Mythic Adventurer');
  });

  it('calculates rank progression percentages and remaining renown', () => {
    const prog = getGuildRankProgress(25);
    expect(prog.currentRank.id).toBe('recruit');
    expect(prog.nextRank.id).toBe('bronze');
    expect(prog.progressPercent).toBe(50);
    expect(prog.renownNeeded).toBe(25);

    const maxProg = getGuildRankProgress(900);
    expect(maxProg.currentRank.id).toBe('mythic');
    expect(maxProg.nextRank).toBeNull();
    expect(maxProg.progressPercent).toBe(100);
  });

  it('correctly generates board state separating available, active, and completed contracts', () => {
    const mockProfile = {
      stats: { renown: 60 },
      activeContracts: [
        {
          id: 'main_01_homestead_foundations',
          acceptedAt: Date.now(),
          objectives: [{ id: 'harvest_turnip', current: 1 }],
        },
      ],
      completedContracts: {
        disc_01_sylvan_shrine: Date.now() - 100000,
      },
    };

    const board = getGuildBoardState(mockProfile);
    expect(board.rank.id).toBe('bronze');
    expect(board.active.length).toBe(1);
    expect(board.active[0].id).toBe('main_01_homestead_foundations');
    expect(board.completed.length).toBe(1);
    expect(board.completed[0].id).toBe('disc_01_sylvan_shrine');

    // Bronze rank should unlock bronze contracts
    const bronzeContract = board.available.find((c) => c.minRank === 'bronze');
    if (bronzeContract) {
      expect(bronzeContract.isEligible).toBe(true);
    }
  });

  it('accepts a contract only if eligible and not duplicate', () => {
    const mockProfile = {
      stats: { renown: 10 }, // Recruit
      activeContracts: [],
      completedContracts: {},
    };

    // Valid accept
    const res1 = acceptGuildContract('guild_01_slime_cull', mockProfile);
    expect(res1.success).toBe(true);
    expect(res1.updatedActiveContracts.length).toBe(1);

    // Duplicate accept rejection
    const res2 = acceptGuildContract('guild_01_slime_cull', {
      ...mockProfile,
      activeContracts: res1.updatedActiveContracts,
    });
    expect(res2.success).toBe(false);
    expect(res2.reason).toContain('already active');

    // Rank-gated rejection (Gold contract for a Recruit)
    const res3 = acceptGuildContract('guild_04_goblin_raiders', mockProfile);
    expect(res3.success).toBe(false);
    expect(res3.reason).toContain('Requires Guild Rank');
  });

  it('records combat and gathering progress on active contracts', () => {
    const initialActive = [
      {
        id: 'guild_01_slime_cull',
        objectives: [{ id: 'kill_slimes', current: 1 }],
      },
    ];

    // Slime defeated event
    const event1 = recordContractProgress(
      'combat:enemy_defeated',
      { enemyType: 'enemy_slime' },
      initialActive
    );

    expect(event1.updated).toBe(true);
    expect(event1.activeContracts[0].objectives[0].current).toBe(2);

    // Unrelated enemy defeat should not increment
    const event2 = recordContractProgress(
      'combat:enemy_defeated',
      { enemyType: 'enemy_wolf' },
      event1.activeContracts
    );
    expect(event2.updated).toBe(false);
    expect(event2.activeContracts[0].objectives[0].current).toBe(2);
  });

  it('claims rewards strictly once and grants gold, xp, renown, and items', () => {
    const contractDef = CONTRACT_REGISTRY.find((c) => c.id === 'guild_01_slime_cull');
    expect(contractDef).toBeDefined();
    const mockProfile = {
      stats: { level: 2, xp: 50, gold: 100, renown: 20, quests: 1 },
      inventory: { turnip: 2 },
      activeContracts: [
        {
          id: 'guild_01_slime_cull',
          objectives: [{ id: 'kill_slimes', current: 4 }], // Target reached
        },
      ],
      completedContracts: {},
    };

    const claimRes = claimContractReward('guild_01_slime_cull', mockProfile);
    expect(claimRes.success).toBe(true);
    expect(claimRes.rewardsGranted.gold).toBe(140);
    expect(claimRes.rewardsGranted.renown).toBe(20);

    const updated = claimRes.updatedProfile;
    expect(updated.stats.gold).toBe(240);
    expect(updated.stats.renown).toBe(40);
    expect(updated.stats.quests).toBe(2);
    expect(updated.inventory['slime-gel']).toBe(2);
    expect(updated.activeContracts.length).toBe(0);
    expect(updated.completedContracts['guild_01_slime_cull']).toBeDefined();

    // Re-claiming must fail
    const reClaim = claimContractReward('guild_01_slime_cull', updated);
    expect(reClaim.success).toBe(false);
    expect(reClaim.reason).toContain('already been claimed');
  });

  it('records progress across zone visits, prop interactions, and auto-completes non-turn-in contracts', () => {
    // 1. Test zone_visit and visit_guild on King's Highway contract
    const roadActive = [
      {
        id: 'main_02_road_to_city',
        objectives: [
          { id: 'exit_left', current: 0 },
          { id: 'reach_city', current: 0 },
          { id: 'visit_guild', current: 0 },
        ],
      },
    ];

    const visitRoad = recordContractProgress('zone:changed', { zone: 'west_road' }, roadActive);
    expect(visitRoad.updated).toBe(true);
    expect(visitRoad.activeContracts[0].objectives[0].current).toBe(1);

    const visitCity = recordContractProgress('zone:changed', { zone: 'village' }, visitRoad.activeContracts);
    expect(visitCity.updated).toBe(true);
    expect(visitCity.activeContracts[0].objectives[1].current).toBe(1);

    const visitGuild = recordContractProgress('guild:visited', {}, visitCity.activeContracts);
    expect(visitGuild.updated).toBe(true);
    expect(visitGuild.activeContracts[0].objectives[2].current).toBe(1);

    // 2. Test Discovery auto-completion (requiresTurnIn: false)
    const discoveryActive = [
      {
        id: 'disc_01_sylvan_shrine',
        objectives: [{ id: 'commune_shrine', current: 0 }],
      },
    ];

    const interactShrine = recordContractProgress(
      'prop:interacted',
      { propId: 'prop_shrine' },
      discoveryActive
    );
    expect(interactShrine.updated).toBe(true);
    expect(interactShrine.autoCompleted).toContain('disc_01_sylvan_shrine');
    expect(interactShrine.activeContracts.length).toBe(0); // Removed from active, moved to autoCompleted
  });

  it('tracks mining and forge crafting objectives accurately', () => {
    const active = [
      {
        id: 'main_03_deepforge_investigation',
        objectives: [
          { id: 'mine_iron', current: 1 },
          { id: 'forge_metal', current: 0 },
        ],
      },
    ];

    // Mine iron node
    const mineStep = recordContractProgress('mine:shatter', { oreId: 'iron' }, active);
    expect(mineStep.updated).toBe(true);
    expect(mineStep.activeContracts[0].objectives[0].current).toBe(2);

    // Craft iron bar
    const craftStep = recordContractProgress('forge:crafted', { itemId: 'iron-bar', count: 1 }, mineStep.activeContracts);
    expect(craftStep.updated).toBe(true);
    expect(craftStep.activeContracts[0].objectives[1].current).toBe(1);
  });
});
