import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../shared/layout/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { getHousingTierById, housingTiers } from '../data/housingData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Housing() {
  const [profile, setProfile] = useState(null);
  const [ownedHouses, setOwnedHouses] = useState([]);
  const [activeHouseId, setActiveHouseId] = useState('starter-cottage');

  useEffect(() => {
    if (!MOCK_AUTH) {
      return;
    }

    const username = authService.getCurrentUsername();
    const nextProfile = characterService.getMockProfile(username);
    setProfile(nextProfile);
    setOwnedHouses(nextProfile?.ownedHouses || ['starter-cottage']);
    setActiveHouseId(nextProfile?.houseId || 'starter-cottage');
  }, []);

  const currentHouse = useMemo(() => getHousingTierById(activeHouseId), [activeHouseId]);
  const ownedHouseList = useMemo(
    () => housingTiers.filter((house) => ownedHouses.includes(house.id)),
    [ownedHouses]
  );
  const availableHouses = useMemo(
    () => housingTiers.filter((house) => !ownedHouses.includes(house.id)),
    [ownedHouses]
  );
  const gold = profile?.stats?.gold ?? 0;
  const level = profile?.stats?.level ?? 1;

  const handleSetActive = (houseId) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    if (houseId === activeHouseId) {
      return;
    }

    const updated = characterService.updateMockProfile({
      houseId,
    });

    setProfile(updated);
    setActiveHouseId(houseId);
    toast.success('Residence updated.');
  };

  const handlePurchase = (house) => {
    if (!MOCK_AUTH) {
      return;
    }

    if (ownedHouses.includes(house.id)) {
      return;
    }

    if (level < house.levelRequired) {
      toast.error(`Level ${house.levelRequired} required.`);
      return;
    }

    if (gold < house.price) {
      toast.error('Not enough gold for this residence.');
      return;
    }

    const nextGold = gold - house.price;
    const nextOwned = [...ownedHouses, house.id];

    const updated = characterService.updateMockProfile({
      houseId: house.id,
      ownedHouses: nextOwned,
      stats: {
        ...profile.stats,
        gold: nextGold,
      },
    });

    setProfile(updated);
    setOwnedHouses(nextOwned);
    setActiveHouseId(house.id);
    toast.success(`Purchased ${house.name}.`);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          {currentHouse && (
            <div className="rounded-2xl border border-yellow-400/70 bg-gray-900/80 p-6 shadow-[0_0_22px_rgba(250,204,21,0.25)]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Current Residence</p>
                  <h2 className="mt-2 text-3xl font-semibold text-white">{currentHouse.name}</h2>
                </div>
                <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                  {currentHouse.tier} · Level {currentHouse.levelRequired}
                </div>
              </div>
              {currentHouse.image && (
                <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-3">
                  <img
                    src={currentHouse.image}
                    alt={currentHouse.name}
                    className="w-full h-auto max-h-[680px] object-contain"
                  />
                </div>
              )}
              <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                <p className="mt-2 text-sm text-yellow-200">
                  {currentHouse.effect?.name || 'Rested Comfort'}: {currentHouse.effect?.detail || '+2% health regeneration in safe zones.'}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Homestead</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Player Housing</h1>
              <p className="mt-3 text-base text-gray-300">
                Upgrade your residence as you climb levels and earn gold. Each tier unlocks a new home.
              </p>
            </div>
            <Link
              to="/missions"
              className="rounded-full border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
            >
              View Missions
            </Link>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Owned Residences</p>
                <p className="mt-2 text-sm text-gray-300">Swap between any home you already own.</p>
              </div>
              <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                Owned: {ownedHouseList.length}
              </span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {ownedHouseList.map((house) => {
                const isActive = house.id === activeHouseId;
                return (
                  <div key={house.id} className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{house.tier}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{house.name}</h2>
                      </div>
                      <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                        Level {house.levelRequired}
                      </div>
                    </div>
                    {house.image && (
                      <div className="relative mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                        <img
                          src={house.image}
                          alt={house.name}
                          className="w-full h-auto max-h-[260px] object-contain"
                        />
                        {isActive && (
                          <span className="absolute right-3 top-3 rounded-full bg-yellow-400 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-gray-900">
                            Active
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                      <p className="mt-2 text-sm text-yellow-200">
                        {house.effect?.name || 'Rested Comfort'}: {house.effect?.detail || '+2% health regeneration in safe zones.'}
                      </p>
                    </div>
                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleSetActive(house.id)}
                        disabled={isActive}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isActive
                            ? 'bg-yellow-500/10 text-yellow-200'
                            : 'bg-yellow-400 text-gray-900'
                          }`}
                      >
                        {isActive ? 'Active' : 'Set Active'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Available Residences</p>
                <p className="mt-2 text-sm text-gray-300">Choose your next upgrade when you meet the level and gold.</p>
              </div>
              <span className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                Available: {availableHouses.length}
              </span>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              {availableHouses.map((house) => {
                const isOwned = false;
                const meetsLevel = level >= house.levelRequired;
                const canAfford = gold >= house.price;
                const isLocked = !isOwned && (!meetsLevel || !canAfford);

                return (
                  <div
                    key={house.id}
                    className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{house.tier}</p>
                        <h2 className="mt-2 text-2xl font-semibold text-white">{house.name}</h2>
                      </div>
                      <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                        Level {house.levelRequired} · {house.price}g
                      </div>
                    </div>
                    {house.image && (
                      <div className="mt-4 rounded-xl border border-yellow-700/30 bg-gray-950/70 p-2">
                        <img
                          src={house.image}
                          alt={house.name}
                          className="w-full h-auto max-h-[260px] object-contain"
                        />
                      </div>
                    )}
                    <p className="mt-4 text-sm text-gray-300">{house.prompt}</p>
                    <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                      <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                      <p className="mt-2 text-sm text-yellow-200">
                        {house.effect?.name || 'Rested Comfort'}: {house.effect?.detail || '+2% health regeneration in safe zones.'}
                      </p>
                    </div>

                    <div className="mt-5 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handlePurchase(house)}
                        disabled={isLocked}
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${isLocked
                            ? 'bg-gray-700 text-gray-400'
                            : 'bg-yellow-400 text-gray-900'
                          }`}
                      >
                        {house.price === 0 ? 'Claim' : 'Buy'}
                      </button>
                      {!meetsLevel && (
                        <span className="text-xs text-gray-400">Requires level {house.levelRequired}</span>
                      )}
                      {meetsLevel && !canAfford && !isOwned && (
                        <span className="text-xs text-gray-400">Need {house.price - gold}g more</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            {availableHouses.length === 0 && (
              <p className="mt-6 text-sm text-gray-300">All residences are owned. Await new tiers.</p>
            )}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Back to Dashboard
            </Link>
            <Link
              to="/profile"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
