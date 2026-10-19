import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { getHousingTierById, housingTiers, estateAmenities } from '../../core/data/housingData';
import { audioManager } from '../../core/audio/AudioManager';
import EstateAmenitiesPanel from './widgets/EstateAmenitiesPanel';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Housing() {
  const [profile, setProfile] = useState(null);
  const [ownedHouses, setOwnedHouses] = useState([]);
  const [activeHouseId, setActiveHouseId] = useState('starter-cottage');
  const [activeTab, setActiveTab] = useState('residences');

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
    audioManager.play('tap');
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
      audioManager.play('error');
      toast.error(`Level ${house.levelRequired} required.`);
      return;
    }

    if (gold < house.price) {
      audioManager.play('error');
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
    audioManager.play('coin');
    setTimeout(() => {
      audioManager.play('levelup');
    }, 250);
    toast.success(`Purchased ${house.name}.`);
  };

  const handlePurchaseAmenity = (amenity) => {
    if (!MOCK_AUTH || !profile) {
      return;
    }

    const currentOwnedAmenities = Array.isArray(profile.estateAmenities) ? profile.estateAmenities : [];
    if (currentOwnedAmenities.includes(amenity.id)) {
      return;
    }

    if (level < amenity.levelRequired) {
      audioManager.play('error');
      toast.error(`Level ${amenity.levelRequired} required.`);
      return;
    }

    if (gold < amenity.price) {
      audioManager.play('error');
      toast.error('Not enough gold for this furnishing.');
      return;
    }

    const nextGold = gold - amenity.price;
    const nextAmenities = [...currentOwnedAmenities, amenity.id];

    const updated = characterService.updateMockProfile({
      estateAmenities: nextAmenities,
      stats: {
        ...profile.stats,
        gold: nextGold,
      },
    });

    setProfile(updated);
    audioManager.play('anvil');
    setTimeout(() => {
      audioManager.play('coin');
    }, 200);
    toast.success(`Commissioned ${amenity.name}! Active: ${amenity.buff}`);
  };

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell lg:pl-64">
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
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full border border-yellow-500/40 bg-yellow-500/10 px-3 py-1 text-xs font-bold text-yellow-300">
                    Active Bonus: +{currentHouse.effect?.percent}% {currentHouse.effect?.stat}
                  </span>
                  <div className="rounded-full border border-yellow-700/40 bg-gray-950/70 px-3 py-1 text-xs text-yellow-200">
                    {currentHouse.tier} · Level {currentHouse.levelRequired}
                  </div>
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
              {currentHouse.description && (
                <p className="mt-4 text-sm text-gray-300 italic leading-relaxed">
                  "{currentHouse.description}"
                </p>
              )}
              <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                  <span className="text-xs font-bold text-yellow-400">+{currentHouse.effect?.percent}% {currentHouse.effect?.stat}</span>
                </div>
                <p className="mt-2 text-sm text-yellow-200">
                  {currentHouse.effect?.name || 'Rested Comfort'}: {currentHouse.effect?.detail || '+2% health regeneration in safe zones.'}
                </p>
                {Array.isArray(profile?.estateAmenities) && profile.estateAmenities.length > 0 && (
                  <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-yellow-700/20 pt-3">
                    <span className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                      Active Relics & Furnishings:
                    </span>
                    {estateAmenities
                      .filter((a) => profile.estateAmenities.includes(a.id))
                      .map((a) => (
                        <span
                          key={a.id}
                          className="rounded-full border border-emerald-500/40 bg-emerald-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-300"
                        >
                          {a.icon} {a.buff}
                        </span>
                      ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Homestead</p>
              <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Estate & Residence</h1>
              <p className="mt-3 text-base text-gray-300">
                Upgrade your residence, furnish interior amenities, and unlock powerful passive bonuses across the realm.
              </p>
            </div>
            <Link
              to="/missions"
              className="rounded-full border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
            >
              View Missions
            </Link>
          </div>

          {/* Housing Tabs */}
          <div className="mt-8 mb-6 flex items-center gap-3 border-b border-gray-800 pb-4">
            <button
              type="button"
              onClick={() => {
                setActiveTab('residences');
                audioManager.play('tap');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'residences'
                  ? 'action-primary text-white shadow-lg'
                  : 'action-ghost text-gray-400 hover:text-white'
              }`}
            >
              <span>🏰 Residences & Properties</span>
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">
                {ownedHouseList.length} Owned
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('amenities');
                audioManager.play('tap');
              }}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all ${
                activeTab === 'amenities'
                  ? 'action-primary text-white shadow-lg'
                  : 'action-ghost text-gray-400 hover:text-white'
              }`}
            >
              <span>🛋️ Interior Amenities & Relics</span>
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] text-yellow-300">
                {(profile?.estateAmenities || []).length} / {estateAmenities.length}
              </span>
            </button>
          </div>

          {activeTab === 'residences' ? (
            <>
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
                        {house.description && (
                          <p className="mt-3 text-xs text-gray-300 italic leading-relaxed">{house.description}</p>
                        )}
                        <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                            <span className="text-[11px] font-bold text-yellow-400">+{house.effect?.percent}% {house.effect?.stat}</span>
                          </div>
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
                        <p className="mt-4 text-sm text-gray-300 leading-relaxed">{house.description || house.prompt}</p>
                        <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-4 py-3">
                          <div className="flex items-center justify-between">
                            <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Residence Effect</p>
                            <span className="text-[11px] font-bold text-yellow-400">+{house.effect?.percent}% {house.effect?.stat}</span>
                          </div>
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
            </>
          ) : (
            <EstateAmenitiesPanel
              profile={profile}
              estateAmenities={estateAmenities}
              onPurchaseAmenity={handlePurchaseAmenity}
              gold={gold}
              level={level}
            />
          )}

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
