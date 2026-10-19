import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../../shared/layout/Navbar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import toast from 'react-hot-toast';
import audioManager from '../../core/audio/AudioManager';
import {
  SKIN_TONES,
  HAIR_STYLES,
  HAIR_COLORS,
  EYE_STYLES,
  OUTFITS,
  OUTFIT_COLORS,
  HEADWEAR,
  ACCESSORIES,
  EQUIPPED_TOOLS,
  DEFAULT_CUSTOMIZATION,
  getRandomCustomization,
  sanitizeCustomization,
} from '../../core/phaser/characterCustomizationData';
import { renderCharacterPreviewDataUrl } from '../../core/phaser/CharacterSpriteGenerator';
import gameEventBridge, { gameEvents } from '../../core/phaser/gameEventBridge';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';
const RACE_CHANGE_COST = 500;

const raceOptions = [
  {
    name: 'Human',
    key: 'human',
    description: 'Balanced and ambitious, humans adapt quickly and thrive in any role.',
    image: '/raceicon/human.webp',
    isEnabled: true,
  },
  {
    name: 'Elf',
    key: 'elf',
    description: 'Graceful and magically attuned, excelling in archery, spellcraft, and agility.',
    image: '/raceicon/elf.webp',
    isEnabled: true,
  },
  {
    name: 'Orc',
    key: 'orc',
    description: 'Ferocious and powerful, orcs are born warriors, thriving in close combat.',
    image: '/raceicon/org.webp',
    isEnabled: true,
  },
  {
    name: 'Dwarf',
    key: 'dwarf',
    description: 'Stout and determined, master craftsmen and fearless fighters.',
    image: '/raceicon/dowrf.webp',
    isEnabled: true,
  },
  {
    name: 'Vampire',
    key: 'vampire',
    description: 'Dark magic, enhanced strength, and a thirst for blood.',
    image: '/raceicon/vampire.webp',
    isEnabled: true,
  },
  {
    name: 'Werewolf',
    key: 'werewolf',
    description: 'Untamed hunters who transform under moonlight.',
    image: '/raceicon/wherewolf.webp',
    isEnabled: true,
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

  // 2D Character Customization State
  const [customization, setCustomization] = useState({ ...DEFAULT_CUSTOMIZATION });
  const [previewDirection, setPreviewDirection] = useState('south');
  const [editorTab, setEditorTab] = useState('pixel'); // 'pixel' | 'identity'

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
    const currentRaceKey = currentCharacter.raceKey || currentCharacter.race?.toLowerCase() || 'human';

    setCharacter(currentCharacter);
    setProfile(currentProfile);
    setName(currentCharacter.name || '');
    setRaceKey(currentRaceKey);
    setInitialRaceKey(currentRaceKey);
    setImageKey(currentCharacter.imageKey || 'male_1');
    setGender(currentCharacter.sex || 'Male');
    setCustomization(sanitizeCustomization(currentCharacter.customization));
  }, [navigate]);

  const updateProp = (field, value) => {
    audioManager.play('tap');
    setCustomization((prev) => ({ ...prev, [field]: value }));
  };

  const previewDataUrl = useMemo(() => {
    return renderCharacterPreviewDataUrl(customization, previewDirection, 6);
  }, [customization, previewDirection]);

  const handleRandomize = () => {
    audioManager.play('tap');
    const randomCustom = getRandomCustomization();
    setCustomization(randomCustom);
    toast.success('Randomized 2D appearance!', { icon: '🎲' });
  };

  const nameRegex = /^[A-Za-z]{2,15}$/;
  const isValidName = nameRegex.test(name.trim());
  const isRaceChange = raceKey && initialRaceKey && raceKey !== initialRaceKey;
  const goldAvailable = profile?.stats?.gold ?? 0;
  const canAffordRaceChange = !isRaceChange || goldAvailable >= RACE_CHANGE_COST;

  const handleSave = async (destination = '/profile') => {
    if (!isValidName || !raceKey) {
      toast.error('Please provide a valid name and select a race.');
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
        sex: gender,
        customization,
      });

      gameEventBridge.emit(gameEvents.REFRESH_CUSTOMIZATION, { customization });

      const username = authService.getCurrentUsername();
      setCharacter(characterService.getMockCharacter(username));
      setProfile(characterService.getMockProfile(username));
      setInitialRaceKey(raceKey);
      toast.success('Character updated successfully!');
      navigate(destination);
    } catch (error) {
      console.error('Failed to update character:', error);
      toast.error('Failed to update character.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell text-gray-100">
      <Navbar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-16 pt-24 sm:px-6">
        <div className="rounded-3xl border border-yellow-700/40 bg-gray-950/85 p-6 sm:p-8 shadow-2xl backdrop-blur">
          {/* Header */}
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between border-b border-yellow-700/30 pb-6">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] font-bold text-yellow-500">
                Sanctum of Transformation
              </p>
              <h1 className="mt-1 text-3xl font-serif font-extrabold text-white sm:text-4xl">
                Edit Adventurer
              </h1>
              <p className="mt-1 text-xs text-gray-300">
                Refine your 2D pixel-art appearance, outfit dyes, equipped tool, and name. Race change costs {RACE_CHANGE_COST} gold.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 px-4 py-2.5 text-xs text-gray-200">
                <p className="text-[10px] uppercase font-bold tracking-wider text-yellow-400">Gold Balance</p>
                <p className="font-mono text-xl font-bold text-yellow-300">{goldAvailable}g</p>
                {isRaceChange && (
                  <p className={`text-[10px] ${canAffordRaceChange ? 'text-emerald-300' : 'text-red-300'}`}>
                    {canAffordRaceChange ? `-${RACE_CHANGE_COST} gold will be deducted` : 'Not enough gold'}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={handleRandomize}
                className="flex items-center gap-1.5 rounded-xl border border-yellow-600/40 bg-gray-900 px-3 py-2 text-xs font-bold text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/20 transition"
              >
                <span>🎲</span>
                <span>Randomize Look</span>
              </button>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
            {/* Left Column: Live Pixel Art Preview */}
            <div className="flex flex-col rounded-2xl border border-yellow-700/30 bg-gray-900/60 p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-yellow-400">
                  2D Pixel Avatar
                </span>
                <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[9px] font-mono text-emerald-300">
                  Phaser 3 Sprite
                </span>
              </div>

              {/* Viewport */}
              <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-xl border border-yellow-700/30 bg-black/60 p-4 shadow-inner">
                {previewDataUrl ? (
                  <img
                    src={previewDataUrl}
                    alt={name}
                    className="h-40 w-40 object-contain filter drop-shadow-[0_6px_12px_rgba(0,0,0,0.8)]"
                    style={{ imageRendering: 'pixelated' }}
                  />
                ) : (
                  <span className="text-xs text-gray-500">Loading sprite...</span>
                )}
              </div>

              {/* Rotation buttons */}
              <div className="mt-3 flex items-center justify-center gap-2">
                {[
                  { id: 'south', label: 'Front', icon: '⬇️' },
                  { id: 'west', label: 'Left', icon: '⬅️' },
                  { id: 'east', label: 'Right', icon: '➡️' },
                  { id: 'north', label: 'Back', icon: '⬆️' },
                ].map((dir) => (
                  <button
                    key={dir.id}
                    type="button"
                    onClick={() => {
                      audioManager.play('tap');
                      setPreviewDirection(dir.id);
                    }}
                    className={`rounded-lg px-2 py-1 text-xs font-bold transition ${
                      previewDirection === dir.id
                        ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                        : 'border border-yellow-700/20 bg-gray-900/80 text-gray-400'
                    }`}
                  >
                    <span>{dir.icon}</span>
                  </button>
                ))}
              </div>

              {/* Identity summary */}
              <div className="mt-4 space-y-1.5 border-t border-yellow-700/20 pt-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-400">Hero:</span>
                  <span className="font-bold text-white">{name || character?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Lineage:</span>
                  <span className="font-semibold text-yellow-300 capitalize">{raceKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Class:</span>
                  <span className="font-semibold text-gray-200">{character?.className || 'Adventurer'}</span>
                </div>
              </div>

              {/* Save Quick Action Buttons */}
              <div className="mt-6 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleSave('/world')}
                  disabled={!isValidName || !raceKey || !canAffordRaceChange || isSaving}
                  className={`w-full rounded-xl py-2.5 font-serif text-xs font-bold transition ${
                    !isValidName || !raceKey || !canAffordRaceChange || isSaving
                      ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                      : 'bg-yellow-500 text-black hover:bg-yellow-400'
                  }`}
                >
                  {isSaving ? 'Saving...' : 'Save & Enter 2D World ➔'}
                </button>
                <button
                  type="button"
                  onClick={() => handleSave('/profile')}
                  disabled={!isValidName || !raceKey || !canAffordRaceChange || isSaving}
                  className="w-full rounded-xl border border-yellow-700/40 bg-gray-900 py-2 text-xs font-semibold text-gray-300 hover:text-white transition"
                >
                  Save &amp; Return to Profile
                </button>
                <Link
                  to="/world"
                  className="text-center text-xs text-yellow-400/80 hover:text-yellow-200 transition mt-1"
                >
                  Cancel Changes
                </Link>
              </div>
            </div>

            {/* Right Column: Customization Tabs */}
            <div className="space-y-6">
              {/* Tab Switcher */}
              <div className="flex items-center gap-2 border-b border-yellow-700/30 pb-3">
                <button
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setEditorTab('pixel');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    editorTab === 'pixel'
                      ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                      : 'border border-yellow-700/20 bg-gray-900/40 text-gray-400 hover:text-white'
                  }`}
                >
                  🎨 2D Appearance &amp; Gear
                </button>
                <button
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setEditorTab('identity');
                  }}
                  className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                    editorTab === 'identity'
                      ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                      : 'border border-yellow-700/20 bg-gray-900/40 text-gray-400 hover:text-white'
                  }`}
                >
                  📜 Hero Identity &amp; Race
                </button>
              </div>

              {editorTab === 'pixel' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Skin Tone */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Skin Complexion</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {SKIN_TONES.map((skin) => (
                        <button
                          key={skin.id}
                          type="button"
                          onClick={() => updateProp('skinTone', skin.id)}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                            customization.skinTone === skin.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <span className="h-5 w-5 rounded-full border border-black/40" style={{ backgroundColor: skin.base }} />
                          <span className="text-xs text-white">{skin.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Style */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Hairstyle</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {HAIR_STYLES.map((hair) => (
                        <button
                          key={hair.id}
                          type="button"
                          onClick={() => updateProp('hairstyle', hair.id)}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            customization.hairstyle === hair.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <p className="text-xs font-bold text-white">{hair.name}</p>
                          <p className="text-[10px] text-gray-400">{hair.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Hair Color */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Hair Dye</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {HAIR_COLORS.map((dye) => (
                        <button
                          key={dye.id}
                          type="button"
                          onClick={() => updateProp('hairColor', dye.id)}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                            customization.hairColor === dye.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <span className="h-5 w-5 rounded-full border border-black/40" style={{ backgroundColor: dye.base }} />
                          <span className="text-xs text-white">{dye.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Garb */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Apparel &amp; Armor</h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {OUTFITS.map((outfit) => (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => updateProp('outfit', outfit.id)}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            customization.outfit === outfit.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <p className="text-xs font-bold text-white">{outfit.name}</p>
                          <p className="text-[10px] text-gray-400">{outfit.desc}</p>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Outfit Dye */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Garb Color</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {OUTFIT_COLORS.map((dye) => (
                        <button
                          key={dye.id}
                          type="button"
                          onClick={() => updateProp('outfitColor', dye.id)}
                          className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                            customization.outfitColor === dye.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <span className="h-5 w-5 rounded-full border border-black/40" style={{ backgroundColor: dye.primary }} />
                          <span className="text-xs text-white">{dye.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Equipped Tool */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">Equipped World Tool</h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {EQUIPPED_TOOLS.map((tool) => (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => updateProp('equippedTool', tool.id)}
                          className={`flex items-center gap-2 rounded-xl border p-2.5 text-left transition ${
                            customization.equippedTool === tool.id
                              ? 'border-yellow-400 bg-yellow-500/10'
                              : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                          }`}
                        >
                          <span className="text-lg">{tool.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{tool.name}</p>
                            <p className="text-[10px] text-yellow-400 uppercase font-mono">{tool.type}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {editorTab === 'identity' && (
                <div className="space-y-5 animate-fadeIn">
                  {/* Rename */}
                  <div>
                    <label htmlFor="editHeroName" className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      Rename Legend
                    </label>
                    <input
                      id="editHeroName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a new name"
                      className="w-full rounded-xl border border-yellow-700/40 bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white focus:border-yellow-400 focus:outline-none"
                    />
                    {!isValidName && name && (
                      <p className="mt-1 text-xs text-red-300">Name must be 2–15 letters, alphabets only.</p>
                    )}
                  </div>

                  {/* Ancestry / Race */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400">Choose Race</h3>
                      {isRaceChange && (
                        <span className="text-[10px] text-amber-300 font-mono">
                          Fee: {RACE_CHANGE_COST} gold
                        </span>
                      )}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {raceOptions.map((race) => {
                        const isSelected = raceKey === race.key;
                        return (
                          <button
                            type="button"
                            key={race.key}
                            onClick={() => {
                              audioManager.play('tap');
                              setRaceKey(race.key);
                            }}
                            className={`flex items-start gap-3 rounded-2xl border p-3.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                                : 'border-yellow-700/20 bg-gray-900/40 hover:border-yellow-600/30'
                            }`}
                          >
                            <img
                              src={race.image}
                              alt={race.name}
                              className="h-10 w-10 rounded-xl bg-black/40 object-contain p-1"
                              onError={(event) => {
                                event.target.onerror = null;
                                event.target.src = '/raceicon/noimage.webp';
                              }}
                            />
                            <div>
                              <p className="text-sm font-bold text-white">{race.name}</p>
                              <p className="text-[11px] text-gray-400 mt-0.5">{race.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
