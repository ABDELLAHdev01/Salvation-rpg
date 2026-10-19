import { describe, it, expect } from 'vitest';
import {
  cities,
  getCityById,
  getCityByName,
  getCityPerk,
} from '../src/core/data/citiesData';

describe('Character & City Factions', () => {
  it('contains the three canonical starting cities with unique identities', () => {
    expect(cities.length).toBe(3);
    const cityIds = cities.map((c) => c.id);
    expect(cityIds).toContain('eldoria');
    expect(cityIds).toContain('valoria');
    expect(cityIds).toContain('drakmor');
  });

  it('guarantees each city defines a mechanical faction perk', () => {
    cities.forEach((city) => {
      expect(city.perk).toBeDefined();
      expect(city.perk.id).toBeDefined();
      expect(city.perk.name).toBeDefined();
      expect(city.perk.description).toBeDefined();
      expect(city.perk.type).toBeDefined();
      expect(city.perk.value).toBeGreaterThan(0);
    });
  });

  it('retrieves cities by ID and Name (case-insensitive)', () => {
    expect(getCityById('eldoria')?.name).toBe('Eldoria');
    expect(getCityById('VALORIA')?.name).toBe('Valoria');
    expect(getCityByName('drakmor')?.id).toBe('drakmor');
    expect(getCityById('nonexistent')).toBeNull();
  });

  it('retrieves city perks correctly', () => {
    expect(getCityPerk('eldoria')?.type).toBe('farm-growth');
    expect(getCityPerk('valoria')?.type).toBe('market-sell');
    expect(getCityPerk('drakmor')?.type).toBe('mining-yield');
    expect(getCityPerk('drakmor')?.damageBonus).toBe(5);
    expect(getCityPerk(null)).toBeNull();
  });
});

import {
  estateMentors,
  mentorMilestones,
  getMentorById,
  getMentorMilestoneById,
  checkMilestoneEligibility,
  getPendingMentorMilestones,
} from '../src/core/data/loreData';

describe('Estate Mentors & Narrative Milestones', () => {
  it('defines the five canonical estate mentors with domains and counsel tips', () => {
    expect(estateMentors.length).toBe(5);
    const mentorIds = estateMentors.map((m) => m.id);
    expect(mentorIds).toContain('elric');
    expect(mentorIds).toContain('selyse');
    expect(mentorIds).toContain('moira');
    expect(mentorIds).toContain('bran');
    expect(mentorIds).toContain('gideon');

    estateMentors.forEach((mentor) => {
      expect(mentor.name).toBeDefined();
      expect(mentor.title).toBeDefined();
      expect(mentor.domain).toBeDefined();
      expect(mentor.avatar).toBeDefined();
      expect(mentor.quote).toBeDefined();
      expect(mentor.tip).toBeDefined();
    });
  });

  it('defines key progression milestone thresholds for farm, mining, workshop, and estate', () => {
    expect(mentorMilestones.length).toBeGreaterThanOrEqual(4);

    const farmMilestone = getMentorMilestoneById('milestone_farm_5');
    expect(farmMilestone).toBeDefined();
    expect(farmMilestone.mentorId).toBe('selyse');
    expect(farmMilestone.reqSkill).toBe('farmLevel');
    expect(farmMilestone.reqValue).toBe(5);
    expect(farmMilestone.rewardTitle).toBe('Sylvan Tender');

    const miningMilestone = getMentorMilestoneById('milestone_mining_5');
    expect(miningMilestone).toBeDefined();
    expect(miningMilestone.mentorId).toBe('bran');
    expect(miningMilestone.reqSkill).toBe('miningLevel');
    expect(miningMilestone.reqValue).toBe(5);
    expect(miningMilestone.rewardTitle).toBe('Deep Delver');

    const workshopMilestone = getMentorMilestoneById('milestone_workshop_5');
    expect(workshopMilestone).toBeDefined();
    expect(workshopMilestone.mentorId).toBe('elric');
    expect(workshopMilestone.reqSkill).toBe('workshopLevel');
    expect(workshopMilestone.reqValue).toBe(5);
    expect(workshopMilestone.rewardTitle).toBe('Master Hearthsmith');

    const estateMilestone = getMentorMilestoneById('milestone_estate_tier_2');
    expect(estateMilestone).toBeDefined();
    expect(estateMilestone.mentorId).toBe('moira');
    expect(estateMilestone.rewardTitle).toBe('Hearth Patriarch');
  });

  it('evaluates player milestone eligibility accurately', () => {
    const farmMilestone = getMentorMilestoneById('milestone_farm_5');

    const noviceProfile = { farmLevel: 3, miningLevel: 2, acknowledgedMilestones: [] };
    expect(checkMilestoneEligibility(farmMilestone, noviceProfile)).toBe(false);

    const veteranFarmProfile = { farmLevel: 5, miningLevel: 2, acknowledgedMilestones: [] };
    expect(checkMilestoneEligibility(farmMilestone, veteranFarmProfile)).toBe(true);

    const pending = getPendingMentorMilestones(veteranFarmProfile);
    expect(pending.map((m) => m.id)).toContain('milestone_farm_5');

    // Once acknowledged, it should no longer be pending
    const acknowledgedProfile = {
      ...veteranFarmProfile,
      acknowledgedMilestones: ['milestone_farm_5'],
    };
    expect(getPendingMentorMilestones(acknowledgedProfile).map((m) => m.id)).not.toContain(
      'milestone_farm_5'
    );
  });

  it('evaluates estate tier 2 milestone eligibility via houses and amenities', () => {
    const estateMilestone = getMentorMilestoneById('milestone_estate_tier_2');

    const starterProfile = { ownedHouses: ['starter-cottage'], estateAmenities: [] };
    expect(checkMilestoneEligibility(estateMilestone, starterProfile)).toBe(false);

    const multiHouseProfile = { ownedHouses: ['starter-cottage', 'manor'], estateAmenities: [] };
    expect(checkMilestoneEligibility(estateMilestone, multiHouseProfile)).toBe(true);

    const furnishedProfile = {
      ownedHouses: ['starter-cottage'],
      estateAmenities: ['hearth-fire', 'lectern', 'training-dummy'],
    };
    expect(checkMilestoneEligibility(estateMilestone, furnishedProfile)).toBe(true);
  });

  it('retrieves mentor by id case-insensitively and returns null for invalid query', () => {
    expect(getMentorById('SELYSE')?.name).toBe('Selyse of the Sylvan Root');
    expect(getMentorById('bran')?.domain).toContain('Mines');
    expect(getMentorById('unknown_mentor')).toBeNull();
  });
});
