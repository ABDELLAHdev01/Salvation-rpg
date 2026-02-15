import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import { mockQuests } from '../../core/data/mockQuests';
import { getHousingTierById } from '../../core/data/housingData';

// Profile Widgets
import ProfileHeader from './widgets/ProfileHeader';
import ProfileStatsGrid from './widgets/ProfileStatsGrid';
import ProfileBioForm from './widgets/ProfileBioForm';
import ProfileAchievements from './widgets/ProfileAchievements';

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
    if (!MOCK_AUTH) return;

    setIsSaving(true);
    const updated = characterService.updateMockProfile({
      title: title.trim() || 'Warden Initiate',
      bio: bio.trim(),
    });
    setProfile(updated);
    setIsSaving(false);
  };

  const handleFavoriteAchievement = (achievement) => {
    if (!MOCK_AUTH) return;

    const updated = characterService.updateMockProfile({ favoriteAchievement: achievement });
    setProfile(updated);
    setFavoriteAchievement(achievement);
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          <ProfileHeader
            character={character}
            profile={profile}
            favoriteAchievement={favoriteAchievement}
            activeHouse={activeHouse}
          />

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

          <ProfileStatsGrid stats={profile?.stats} />

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
            <ProfileBioForm
              title={title} setTitle={setTitle}
              bio={bio} setBio={setBio}
              handleSaveProfile={handleSaveProfile} isSaving={isSaving}
            />
            <ProfileAchievements
              achievements={achievements}
              favoriteAchievement={favoriteAchievement}
              handleFavoriteAchievement={handleFavoriteAchievement}
            />
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/inventory" className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost">
              View Inventory
            </Link>
            <Link to="/character/edit" className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost">
              Edit Character
            </Link>
            <Link to="/dashboard" className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
