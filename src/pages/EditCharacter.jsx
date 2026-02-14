import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../shared/layout/Navbar';
import authService from '../services/AuthService';
import characterService from '../services/CharacterService';
import toast from 'react-hot-toast';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const RACE_CHANGE_COST = 500;

const raceOptions = [
  {
    name: 'Human',
    key: 'human',
    description: 'Balanced and ambitious, humans adapt quickly and thrive in any role.',
    image: '/raceicon/human.png',
    isEnabled: true,
  },
  {
    name: 'Elf',
    key: 'elf',
    description: 'Graceful and magically attuned, excelling in archery, spellcraft, and agility.',
    image: '/raceicon/elf.png',
    isEnabled: true,
  },
  {
    name: 'Orc',
    key: 'orc',
    description: 'Ferocious and powerful, orcs are born warriors, thriving in close combat.',
    image: '/raceicon/org.png',
    isEnabled: false,
  },
  {
    name: 'Dwarf',
    key: 'dwarf',
    description: 'Stout and determined, master craftsmen and fearless fighters.',
    image: '/raceicon/dowrf.png',
    isEnabled: false,
  },
  {
    name: 'Vampire',
    key: 'vampire',
    description: 'Dark magic, enhanced strength, and a thirst for blood.',
    image: '/raceicon/vampire.png',
    isEnabled: true,
  },
  {
    name: 'Werewolf',
    key: 'werewolf',
    description: 'Untamed hunters who transform under moonlight.',
    image: '/raceicon/wherewolf.png',
    isEnabled: false,
  },
];

export default function EditCharacter() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [name, setName] = useState('');
  const [raceKey, setRaceKey] = useState('');
  const [initialRaceKey, setInitialRaceKey] = useState('');
  const [imageKey, setImageKey] = useState('');
  const [gender, setGender] = useState('Male');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!MOCK_AUTH) {
      toast.error('Edit character is only available in demo mode for now.');
      navigate('/profile');
      return;
    }

    const username = authService.getCurrentUsername();
    const currentCharacter = characterService.getMockCharacter(username);

    if (!currentCharacter) {
      navigate('/character');
      return;
    }

    const currentProfile = characterService.getMockProfile(username);

    const currentRaceKey = currentCharacter.raceKey || currentCharacter.race?.toLowerCase() || '';
    setCharacter(currentCharacter);
    setProfile(currentProfile);
    setName(currentCharacter.name || '');
    setRaceKey(currentRaceKey);
    setInitialRaceKey(currentRaceKey);
    setImageKey(currentCharacter.imageKey || '');
    setGender(currentCharacter.sex || 'Male');
  }, [navigate]);

  const imageOptions = useMemo(() => {
    const prefix = gender === 'Female' ? 'female' : 'male';
    return ['1', '2', '3', '4'].map((index) => `${prefix}_${index}`);
  }, [gender]);

  const nameRegex = /^[A-Za-z]{3,15}$/;
  const isValidName = nameRegex.test(name.trim());
  const isRaceChange = raceKey && initialRaceKey && raceKey !== initialRaceKey;
  const goldAvailable = profile?.stats?.gold ?? 0;
  const canAffordRaceChange = !isRaceChange || goldAvailable >= RACE_CHANGE_COST;

  const previewImage = raceKey && imageKey ? `/raceicon/${raceKey}_${imageKey}.png` : '/raceicon/noimage.jpg';

  const handleSave = async () => {
    if (!isValidName || !raceKey || !imageKey) {
      toast.error('Please complete the name, race, and portrait.');
      return;
    }

    if (!canAffordRaceChange) {
      toast.error(`Not enough gold. ${RACE_CHANGE_COST} gold required.`);
      return;
    }

    try {
      setIsSaving(true);
      await characterService.updateCharacter({
        name: name.trim(),
        race: raceKey.toUpperCase(),
        raceKey,
        imageKey,
      });
      const username = authService.getCurrentUsername();
      setCharacter(characterService.getMockCharacter(username));
      setProfile(characterService.getMockProfile(username));
      setInitialRaceKey(raceKey);
      navigate('/profile');
    } catch (error) {
      console.error('Failed to update character:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <Navbar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Sanctum of Change</p>
              <h1 className="mt-2 text-4xl font-extrabold text-white hero-title">Edit Character</h1>
              <p className="mt-2 text-sm text-gray-300">
                Update your name, portrait, and race. Race changes cost {RACE_CHANGE_COST} gold.
              </p>
            </div>
            <div className="rounded-xl border border-yellow-700/30 bg-gray-900/80 px-5 py-3 text-sm text-gray-200">
              <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Gold Balance</p>
              <p className="mt-1 text-2xl font-semibold text-white">{goldAvailable}</p>
              {isRaceChange && (
                <p className={`mt-1 text-xs ${canAffordRaceChange ? 'text-emerald-300' : 'text-red-300'}`}>
                  {canAffordRaceChange
                    ? `${RACE_CHANGE_COST} gold will be deducted`
                    : 'Not enough gold for race change'}
                </p>
              )}
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
              <div className="h-64 w-full overflow-hidden rounded-2xl border border-yellow-700/30 bg-gray-900/80">
                <img
                  src={previewImage}
                  alt={name || character?.name || 'Character portrait'}
                  className="h-full w-full object-cover"
                  onError={(event) => {
                    event.target.onerror = null;
                    event.target.src = '/raceicon/noimage.jpg';
                  }}
                />
              </div>
              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Current Identity</p>
                <p className="mt-2 text-2xl font-semibold text-white">{character?.name || 'Unknown Hero'}</p>
                <p className="mt-1 text-sm text-gray-300">
                  {character?.race || 'Unknown'} · {character?.sex || 'Unknown'} · {character?.className || 'Adventurer'}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
                <h2 className="text-lg font-semibold text-white">Rename Your Legend</h2>
                <input
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Enter a new name"
                  className="mt-4 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                {!isValidName && name && (
                  <p className="mt-2 text-xs text-red-300">Name must be 3–15 letters, alphabets only.</p>
                )}
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">Choose Race</h2>
                  <span className="text-xs uppercase tracking-[0.3em] text-gray-400">{gender}</span>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  {raceOptions.map((race) => {
                    const isSelected = raceKey === race.key;
                    const isLocked = !race.isEnabled && race.key !== initialRaceKey;
                    return (
                      <button
                        type="button"
                        key={race.key}
                        onClick={() => !isLocked && setRaceKey(race.key)}
                        className={`flex items-start gap-3 rounded-xl border p-4 text-left transition ${isSelected
                            ? 'border-yellow-400 bg-yellow-500/10'
                            : 'border-yellow-700/30 bg-gray-950/40 hover:border-yellow-500/70'
                          } ${isLocked ? 'cursor-not-allowed opacity-50' : ''}`}
                      >
                        <img
                          src={race.image}
                          alt={race.name}
                          className="h-12 w-12 rounded-xl bg-gray-900/60 object-contain"
                          onError={(event) => {
                            event.target.onerror = null;
                            event.target.src = '/raceicon/noimage.jpg';
                          }}
                        />
                        <div>
                          <p className="text-sm font-semibold text-white">{race.name}</p>
                          <p className="mt-1 text-xs text-gray-400">{race.description}</p>
                          {isLocked && (
                            <p className="mt-2 text-[10px] uppercase tracking-[0.3em] text-yellow-400">Locked</p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6">
                <h2 className="text-lg font-semibold text-white">Choose Portrait</h2>
                <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {imageOptions.map((image) => (
                    <button
                      type="button"
                      key={image}
                      onClick={() => setImageKey(image)}
                      className={`overflow-hidden rounded-xl border transition ${imageKey === image
                          ? 'border-yellow-400 ring-2 ring-yellow-400'
                          : 'border-yellow-700/30 hover:border-yellow-500/70'
                        }`}
                    >
                      <img
                        src={`/raceicon/${raceKey}_${image}.png`}
                        alt="Portrait option"
                        className="h-28 w-full object-cover"
                        onError={(event) => {
                          event.target.onerror = null;
                          event.target.src = '/raceicon/noimage.jpg';
                        }}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/profile"
                  className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
                >
                  Cancel
                </Link>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isValidName || !raceKey || !imageKey || isSaving}
                  className={`inline-flex items-center rounded-lg px-5 py-2 text-sm font-semibold transition ${!isValidName || !raceKey || !imageKey || isSaving
                      ? 'bg-gray-700 text-gray-300'
                      : 'action-primary text-white'
                    }`}
                >
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
