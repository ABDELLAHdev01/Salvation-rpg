import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { housingTiers } from '../data/housingData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const CHEAT_CODE = 'ivy';

export default function DevCheats() {
  const [profile, setProfile] = useState(null);
  const [code, setCode] = useState('');
  const [unlocked, setUnlocked] = useState(false);
  const [levelInput, setLevelInput] = useState('');
  const [goldInput, setGoldInput] = useState('');
  const [farmLevelInput, setFarmLevelInput] = useState('');
  const [miningLevelInput, setMiningLevelInput] = useState('');
  const [pickaxeLevelInput, setPickaxeLevelInput] = useState('');
  const [houseIdInput, setHouseIdInput] = useState('starter-cottage');

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);
  }, []);

  const handleUnlock = (event) => {
    event.preventDefault();
    if (code.trim() !== CHEAT_CODE) {
      toast.error('Invalid code.');
      return;
    }
    setUnlocked(true);
    toast.success('Cheats unlocked.');
  };

  const handleApply = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const nextLevel = levelInput ? Math.max(1, Number(levelInput)) : null;
    const nextGold = goldInput ? Math.max(0, Number(goldInput)) : null;
    const nextFarmLevel = farmLevelInput ? Math.max(1, Number(farmLevelInput)) : null;
    const nextMiningLevel = miningLevelInput ? Math.max(1, Number(miningLevelInput)) : null;
    const nextPickaxeLevel = pickaxeLevelInput ? Math.max(1, Number(pickaxeLevelInput)) : null;

    if (
      (nextLevel !== null && Number.isNaN(nextLevel)) ||
      (nextGold !== null && Number.isNaN(nextGold)) ||
      (nextFarmLevel !== null && Number.isNaN(nextFarmLevel)) ||
      (nextMiningLevel !== null && Number.isNaN(nextMiningLevel)) ||
      (nextPickaxeLevel !== null && Number.isNaN(nextPickaxeLevel))
    ) {
      toast.error('Enter valid numbers.');
      return;
    }

    const hasEdits =
      nextLevel !== null ||
      nextGold !== null ||
      nextFarmLevel !== null ||
      nextMiningLevel !== null ||
      nextPickaxeLevel !== null ||
      !!houseIdInput;

    if (!hasEdits) {
      toast.error('Enter a value first.');
      return;
    }

    const ownedHouses = profile.ownedHouses || ['starter-cottage'];
    const nextOwnedHouses = ownedHouses.includes(houseIdInput)
      ? ownedHouses
      : [...ownedHouses, houseIdInput];

    const updated = characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        level: nextLevel ?? profile.stats.level,
        gold: nextGold ?? profile.stats.gold,
      },
      farmLevel: nextFarmLevel ?? profile.farmLevel,
      miningLevel: nextMiningLevel ?? profile.miningLevel,
      pickaxeLevel: nextPickaxeLevel ?? profile.pickaxeLevel,
      houseId: houseIdInput || profile.houseId,
      ownedHouses: nextOwnedHouses,
    });

    setProfile(updated);
    toast.success('Cheats applied.');
  };

  const handleResetAll = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const updated = characterService.updateMockProfile({
      stats: {
        ...profile.stats,
        level: 1,
        power: 120,
        gold: 350,
        quests: 3,
        victories: 2,
        renown: 48,
      },
      houseId: 'starter-cottage',
      ownedHouses: ['starter-cottage'],
      miningLevel: 1,
      miningXp: 0,
      pickaxeLevel: 1,
      miningForgeLevel: 1,
      miningPrestigeLevel: 0,
      activeMiningBoost: null,
      miningBoosterCooldowns: {},
      miningAutoClaim: false,
      miningCooldownUntil: 0,
      miningContracts: null,
      miningHirelings: [],
      inventory: {},
      miningSession: null,
      lastMiningResult: null,
      farmLandSize: 3,
      farmPlots: [],
      farmAnimals: {},
      farmLevel: 1,
      farmXp: 0,
      farmTasks: null,
      farmWeather: null,
    });

    setProfile(updated);
    toast.success('Progress reset.');
  };

  const handleReadyAllPlants = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const now = Date.now();
    const nextPlots = (profile.farmPlots || []).map((plot) =>
      plot?.cropId
        ? {
            ...plot,
            harvestAt: now - 1000,
          }
        : plot
    );

    const updated = characterService.updateMockProfile({
      farmPlots: nextPlots,
    });

    setProfile(updated);
    toast.success('All planted crops are ready to harvest.');
  };

  const handleClearMiningCooldown = () => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const updated = characterService.updateMockProfile({
      miningCooldownUntil: 0,
      miningBoosterCooldowns: {},
    });

    setProfile(updated);
    toast.success('Mining cooldowns cleared.');
  };

  if (!MOCK_AUTH) {
    return (
      <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
        Cheats are available only in offline mode.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl bg-gray-950/80 p-6">
        <h1 className="text-xl font-semibold text-white">Dev Cheats</h1>
        <p className="mt-1 text-xs text-gray-400">Change `CHEAT_CODE` in this file to your own secret.</p>

        {!unlocked ? (
          <form onSubmit={handleUnlock} className="mt-6 space-y-3">
            <input
              type="password"
              value={code}
              onChange={(event) => setCode(event.target.value)}
              placeholder="Enter access code"
              className="w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
            />
            <button type="submit" className="w-full rounded-lg bg-yellow-500 px-3 py-2 text-sm font-semibold text-black">
              Unlock
            </button>
          </form>
        ) : (
          <div className="mt-6 space-y-4">
            <div>
              <label className="text-xs text-gray-400">Set Level</label>
              <input
                type="number"
                min="1"
                value={levelInput}
                onChange={(event) => setLevelInput(event.target.value)}
                placeholder="e.g. 50"
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Set Gold</label>
              <input
                type="number"
                min="0"
                value={goldInput}
                onChange={(event) => setGoldInput(event.target.value)}
                placeholder="e.g. 50000"
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Set Farm Level</label>
              <input
                type="number"
                min="1"
                value={farmLevelInput}
                onChange={(event) => setFarmLevelInput(event.target.value)}
                placeholder="e.g. 15"
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Set Mining Level</label>
              <input
                type="number"
                min="1"
                value={miningLevelInput}
                onChange={(event) => setMiningLevelInput(event.target.value)}
                placeholder="e.g. 20"
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Set Pickaxe Level</label>
              <input
                type="number"
                min="1"
                value={pickaxeLevelInput}
                onChange={(event) => setPickaxeLevelInput(event.target.value)}
                placeholder="e.g. 5"
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              />
            </div>
            <div>
              <label className="text-xs text-gray-400">Set House</label>
              <select
                value={houseIdInput}
                onChange={(event) => setHouseIdInput(event.target.value)}
                className="mt-1 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm text-white"
              >
                {housingTiers.map((tier) => (
                  <option key={tier.id} value={tier.id}>
                    {tier.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" onClick={handleApply} className="w-full rounded-lg bg-emerald-500 px-3 py-2 text-sm font-semibold text-black">
              Apply Cheats
            </button>
            <button
              type="button"
              onClick={handleResetAll}
              className="w-full rounded-lg bg-red-500/80 px-3 py-2 text-sm font-semibold text-white"
            >
              Reset Progress
            </button>
            <button
              type="button"
              onClick={handleReadyAllPlants}
              className="w-full rounded-lg bg-sky-500 px-3 py-2 text-sm font-semibold text-black"
            >
              Ready All Crops
            </button>
            <button
              type="button"
              onClick={handleClearMiningCooldown}
              className="w-full rounded-lg bg-amber-400 px-3 py-2 text-sm font-semibold text-black"
            >
              Clear Mining Cooldowns
            </button>
            <p className="text-xs text-gray-500">Current level: {profile?.stats?.level ?? 1} · Gold: {profile?.stats?.gold ?? 0}</p>
          </div>
        )}
      </div>
    </div>
  );
}
