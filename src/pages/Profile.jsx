import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import { mockQuests } from '../data/mockQuests';
import { getHousingTierById } from '../data/housingData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

export default function Profile() {
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [favoriteAchievement, setFavoriteAchievement] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (MOCK_AUTH) {
      const username = authService.getCurrentUsername();
      const nextCharacter = characterService.getMockCharacter(username);
      const nextProfile = characterService.getMockProfile(username);
      setCharacter(nextCharacter);
      setProfile(nextProfile);
      setTitle(nextProfile?.title || 'Warden Initiate');
      setBio(nextProfile?.bio || '');
      setFavoriteAchievement(nextProfile?.favoriteAchievement || '');
    }
  }, []);

  const achievements = mockQuests.map((quest) => `${quest.title} · ${quest.region}`);
  const activeHouse = getHousingTierById(profile?.houseId || 'starter-cottage');

  const handleSaveProfile = () => {
    if (!MOCK_AUTH) {
      return;
    }

    setIsSaving(true);
    const updated = characterService.updateMockProfile({
      title: title.trim() || 'Warden Initiate',
      bio: bio.trim(),
    });
    setProfile(updated);
    setIsSaving(false);
  };

  const handleFavoriteAchievement = (achievement) => {
    if (!MOCK_AUTH) {
      return;
    }

    const updated = characterService.updateMockProfile({
      favoriteAchievement: achievement,
    });
    setProfile(updated);
    setFavoriteAchievement(achievement);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
              <div className="h-28 w-28 overflow-hidden rounded-2xl border border-yellow-700/50 bg-gray-900/80">
                <img
                  src={character?.avatarUrl || '/raceicon/noimage.webp'}
                  alt={character?.name || 'Hero portrait'}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Hero Profile</p>
                <h1 className="mt-2 text-4xl font-extrabold text-white hero-title">
                  {character?.name || 'Unbound Wanderer'}
                </h1>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                  <span className="court-chip rounded-full px-3 py-1">
                    {character?.race || 'Unknown'} · {character?.sex || 'Unknown'}
                  </span>
                  <span className="court-chip rounded-full px-3 py-1">
                    {character?.className || 'Adventurer'}
                  </span>
                  <span className="court-chip rounded-full px-3 py-1">ID: {profile?.username || 'unknown'}</span>
                </div>
                <p className="mt-3 text-xs text-gray-400">
                  Residence: {activeHouse?.name || 'Starter Cottage'}
                </p>
                <p className="mt-1 text-xs text-yellow-200">
                  {activeHouse?.effect?.name || 'Rested Comfort'}: {activeHouse?.effect?.detail || '+2% health regeneration in safe zones.'}
                </p>
                {favoriteAchievement && (
                  <span className="mt-3 inline-flex items-center rounded-full border border-yellow-700/40 bg-gray-900/70 px-3 py-1 text-xs text-yellow-200">
                    Flair: {favoriteAchievement}
                  </span>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/character/edit"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Edit Character
              </Link>
              <Link
                to="/housing"
                className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white action-primary"
              >
                Manage Residence
              </Link>
            </div>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
            <div className="court-card rounded-2xl p-5">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Legacy Banner</p>
              <p className="mt-2 text-2xl font-semibold text-white">Embercrest Standard</p>
              <p className="mt-2 text-sm text-gray-300">Displayed across your hall of honors.</p>
            </div>
            <div className="image-panel image-panel-profile ornament-frame min-h-[140px] p-5">
              <div className="image-panel-content">
                <p className="text-xs uppercase tracking-[0.3em] text-yellow-300">Hall Portrait</p>
                <p className="mt-2 text-2xl font-semibold text-white">Court Archivum</p>
                <p className="mt-2 text-sm text-gray-300">Your deeds etched in gilded stone.</p>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Level</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.level ?? 1}</p>
            </div>
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Power</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.power ?? 0}</p>
            </div>
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Gold</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.gold ?? 0}</p>
            </div>
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Quests</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.quests ?? 0}</p>
            </div>
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Victories</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.victories ?? 0}</p>
            </div>
            <div className="court-card rounded-xl p-4 text-center hover-lift">
              <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Renown</p>
              <p className="mt-2 text-2xl font-semibold text-white">{profile?.stats?.renown ?? 0}</p>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 hover-lift">
              <h2 className="text-lg font-semibold text-white">Hero Title & Bio</h2>
              <div className="mt-4 space-y-4">
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Warden Initiate"
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div>
                  <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Bio</label>
                  <textarea
                    value={bio}
                    onChange={(event) => setBio(event.target.value)}
                    rows={4}
                    placeholder="Tell the realm about your legend."
                    className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSaveProfile}
                  disabled={isSaving}
                  className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${
                    isSaving ? 'bg-gray-700 text-gray-300' : 'action-primary text-white'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 hover-lift">
              <h2 className="text-lg font-semibold text-white">Achievements</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {achievements.map((achievement) => (
                  <li
                    key={achievement}
                    className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 ${
                      favoriteAchievement === achievement
                        ? 'border-yellow-400/60 bg-yellow-500/10 text-yellow-100'
                        : 'border-yellow-700/20 bg-gray-950/70'
                    }`}
                  >
                    <span>{achievement}</span>
                    <button
                      type="button"
                      onClick={() => handleFavoriteAchievement(achievement)}
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        favoriteAchievement === achievement
                          ? 'bg-yellow-500 text-gray-900'
                          : 'border border-yellow-700/30 text-yellow-200'
                      }`}
                    >
                      {favoriteAchievement === achievement ? 'Favorited' : 'Set Flair'}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/inventory"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              View Inventory
            </Link>
            <Link
              to="/character/edit"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Edit Character
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
