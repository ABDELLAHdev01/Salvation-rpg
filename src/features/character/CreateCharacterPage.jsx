import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CharacterService from '../../core/services/CharacterService';
import authService from '../../core/services/AuthService';
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
} from '../../core/phaser/characterCustomizationData';
import { renderCharacterPreviewDataUrl } from '../../core/phaser/CharacterSpriteGenerator';
import { cities } from '../../core/data/citiesData';

const FANTASY_NAMES = [
  'Aeloria', 'Valen', 'Theron', 'Kaelen', 'Rowan',
  'Seraphina', 'Torvald', 'Morrigan', 'Elowen', 'Corvus',
  'Brynjar', 'Astrid', 'Lyra', 'Fenris', 'Gwendolyn',
];

const RACES = [
  { id: 'human', name: 'Human', desc: 'Adaptable and determined champions of the realm.' },
  { id: 'elf', name: 'Elf', desc: 'Graceful wardens attuned to nature and arcane currents.' },
  { id: 'orc', name: 'Orc', desc: 'Fierce warriors endowed with legendary fortitude.' },
  { id: 'dwarf', name: 'Dwarf', desc: 'Master artisans of mountain stone and deep veins.' },
  { id: 'vampire', name: 'Vampire', desc: 'Nocturnal aristocrats wielding blood magic.' },
  { id: 'werewolf', name: 'Werewolf', desc: 'Primal predators bound to the lunar tides.' },
];

const CLASSES = [
  { id: 'Vanguard', name: 'Vanguard', role: 'Frontline Knight', icon: '🛡️' },
  { id: 'Arcwarden', name: 'Arcwarden', role: 'Arcane Elementalist', icon: '🔮' },
  { id: 'Warbrute', name: 'Warbrute', role: 'Berserker Juggernaut', icon: '🪓' },
  { id: 'Stoneguard', name: 'Stoneguard', role: 'Shieldbearer Bastion', icon: '🧱' },
  { id: 'Bloodcaller', name: 'Bloodcaller', role: 'Shadow Siphon Mage', icon: '🩸' },
  { id: 'Moonfang', name: 'Moonfang', role: 'Primal Stalker', icon: '🐺' },
];

const CLASS_LORE = {
  Vanguard: {
    icon: '🛡️',
    title: 'Vanguard (Knight)',
    tip: 'Stalwart frontline guardian of the Sunforge Order. High physical mitigation, steady melee swings, and robust vitality. Recommended for new adventurers seeking durability in open-world combat.',
  },
  Arcwarden: {
    icon: '🔮',
    title: 'Arcwarden (Mage)',
    tip: 'Master of elemental currents and arcane staves. Blasts foes with high critical damage from a safe distance.',
  },
  Warbrute: {
    icon: '🪓',
    title: 'Warbrute (Berserker)',
    tip: 'Fierce melee juggernaut that unleashes devastating knockback and ferocious sweeps on enemy hordes.',
  },
  Stoneguard: {
    icon: '🧱',
    title: 'Stoneguard (Bastion)',
    tip: 'Immovable shieldbearer forged in deep mountain stone. Withstands elite monster strikes and dungeon bosses.',
  },
  Bloodcaller: {
    icon: '🩸',
    title: 'Bloodcaller (Siphon)',
    tip: 'Occult shadow scholar wielding blood magic to leech life essence from vanquished beasts.',
  },
  Moonfang: {
    icon: '🐺',
    title: 'Moonfang (Stalker)',
    tip: 'Agile wilderness hunter with swift sprint acceleration, heightened evasion, and lethal ambush daggers.',
  },
};

const RACE_LORE = {
  human: {
    icon: '👑',
    title: 'Human Ancestry',
    tip: 'Versatile and resolute pioneers of the realm. Adaptable to any tool, crafting discipline, or combat calling.',
  },
  elf: {
    icon: '🌿',
    title: 'Elf Ancestry',
    tip: 'Ancient forest lineage attuned to Whispering Forest currents. Innate swiftness and natural spell affinity.',
  },
  orc: {
    icon: '🐗',
    title: 'Orc Ancestry',
    tip: 'Fierce mountain clans endowed with legendary constitution and powerful physical strikes.',
  },
  dwarf: {
    icon: '⛏️',
    title: 'Dwarf Ancestry',
    tip: 'Master artisans of mountain stone and deepforge seams. Exceptional mining mastery and underground sight.',
  },
  vampire: {
    icon: '🦇',
    title: 'Vampire Ancestry',
    tip: 'Noble nocturnal bloodline. Gains heightened power and sensory perception during dusk and nighttime.',
  },
  werewolf: {
    icon: '🐺',
    title: 'Werewolf Ancestry',
    tip: 'Primal predator bound to lunar phases. Unleashes primal fury and rapid burst sprint in the open wild.',
  },
};

const TOOL_LORE = {
  iron_pickaxe: {
    icon: '⛏️',
    title: 'Iron Pickaxe',
    tip: 'Essential mining implement. Cracks open copper, iron, gold, and crystal mineral veins throughout the Deep Caverns.',
  },
  steel_broadsword: {
    icon: '⚔️',
    title: 'Tempered Broadsword',
    tip: 'Balanced martial weapon with an 85° swing arc. Slices through forest slimes, wild wolves, and dungeon skeletons.',
  },
  forged_scythe: {
    icon: '🌾',
    title: 'Farmer Harvest Scythe',
    tip: 'Wide 120° harvesting sweep. Rapidly cuts wild grass tufts and harvests mature turnips, wheat, and sylvan herbs.',
  },
  oak_staff: {
    icon: '🪄',
    title: 'Elder Oak Wand',
    tip: 'Channeling conduit for arcane projectiles. Unleashes magical bursts across an 80° arc with knockback.',
  },
};

const WIZARD_STEPS = [
  { step: 1, id: 'identity', label: 'Identity & Calling', icon: '📜' },
  { step: 2, id: 'appearance', label: 'Visage & Hair', icon: '👤' },
  { step: 3, id: 'outfit', label: 'Garb & Equipment', icon: '🛡️' },
  { step: 4, id: 'allegiance', label: 'Allegiance & Embark', icon: '🏛️' },
];

export default function CreateCharacter() {
  const navigate = useNavigate();

  // Wizard Stepper State
  const [currentStep, setCurrentStep] = useState(1);

  // Character Identity State
  const [name, setName] = useState('');
  const [selectedRace, setSelectedRace] = useState('human');
  const [selectedClass, setSelectedClass] = useState('Vanguard');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [selectedCity, setSelectedCity] = useState(cities[0]?.id || 'eldoria');

  // 2D Customization State
  const [customization, setCustomization] = useState({ ...DEFAULT_CUSTOMIZATION });
  const [previewDirection, setPreviewDirection] = useState('south');

  // Interactive Tutorial / Lore Guide Box State
  const [activeTutorialTip, setActiveTutorialTip] = useState({
    icon: '🛡️',
    title: 'Vanguard (Frontline Knight)',
    tip: 'Stalwart frontline guardian of the Sunforge Order. High physical mitigation, steady melee swings, and robust vitality. Recommended for new adventurers seeking durability in open-world combat.',
  });

  useEffect(() => {
    authService.ensureOfflineSession();
  }, []);

  // Update a single customization property
  const updateProp = (field, value, tip = null) => {
    audioManager.play('tap');
    setCustomization((prev) => ({ ...prev, [field]: value }));
    if (tip) {
      setActiveTutorialTip(tip);
    }
  };

  // Live Pixel Art DataURL
  const previewDataUrl = useMemo(() => {
    return renderCharacterPreviewDataUrl(customization, previewDirection, 6);
  }, [customization, previewDirection]);

  // Randomize appearance
  const handleRandomize = () => {
    audioManager.play('tap');
    const randomCustom = getRandomCustomization();
    setCustomization(randomCustom);
    const randomName = FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
    setName(randomName);
    toast.success('Randomized character appearance!', { icon: '🎲' });
  };

  // Reset to default
  const handleReset = () => {
    audioManager.play('tap');
    setCustomization({ ...DEFAULT_CUSTOMIZATION });
    toast('Reset appearance to defaults.');
  };

  // Wizard Navigation with validation
  const handleNextStep = () => {
    audioManager.play('tap');
    if (currentStep === 1) {
      const trimmed = name.trim();
      if (!trimmed || trimmed.length < 2) {
        toast.error('Please enter an adventurer name (at least 2 letters) to continue!');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const handlePrevStep = () => {
    audioManager.play('tap');
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  // Character Creation Submission
  const handleCreate = async (destination = '/world') => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error('Please enter a valid adventurer name (at least 2 letters).');
      setCurrentStep(1);
      return;
    }

    const characterData = {
      name: trimmedName,
      characterName: trimmedName,
      race: selectedRace.toUpperCase(),
      raceKey: selectedRace.toLowerCase(),
      sex: selectedGender,
      gender: selectedGender,
      className: selectedClass,
      characterClass: selectedClass,
      city: selectedCity,
      customization,
      imageKey: 'male_1',
    };

    try {
      await CharacterService.createCharacter(characterData);
      localStorage.setItem('hasCreatedCharacter', 'true');
      toast.success(`Welcome to Salvation, ${trimmedName}!`, { icon: '⚔️' });
      navigate(destination);
    } catch (err) {
      console.error('Character creation failed:', err);
      toast.error('Failed to create character. Please try again.');
    }
  };

  const activeCityMeta = cities.find((c) => c.id === selectedCity) || cities[0];

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell text-gray-100 pb-16 select-none">
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 pt-10 sm:px-6">
        {/* Header Ribbon */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-yellow-700/30 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-500">
              Interactive Hero Forge &amp; Tutorial
            </p>
            <h1 className="text-3xl font-serif font-extrabold text-white tracking-wide">
              Adventurer Character Creator
            </h1>
            <p className="text-xs text-gray-300">
              Complete the 4 steps to create your custom hero and begin your journey in Salvation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRandomize}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-600/40 bg-gray-900/80 px-3 py-2 text-xs font-bold text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/20 transition active:scale-95"
            >
              <span>🎲</span>
              <span>Randomize</span>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-700/30 bg-gray-900/60 px-3 py-2 text-xs font-semibold text-gray-400 hover:text-white transition active:scale-95"
            >
              <span>↺</span>
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Customizer */}
        <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
          {/* Left Column: 2D Live Pixel Preview Card */}
          <div className="flex flex-col rounded-3xl border-2 border-yellow-600/40 bg-gray-950/85 p-5 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                Live 2D Sprite Preview
              </span>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Phaser 3 Ready
              </span>
            </div>

            {/* Pixel Viewport */}
            <div className="relative flex h-52 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-yellow-700/30 bg-gradient-to-b from-gray-900 to-black p-4 shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="h-40 w-40 rounded-full border-2 border-yellow-400 border-dashed animate-spin-slow" />
              </div>

              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt={name || 'Hero'}
                  className="relative z-10 h-40 w-40 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="text-xs text-gray-400 font-mono">Generating Sprite...</div>
              )}
            </div>

            {/* Direction Rotation Switcher */}
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mr-1">
                Rotate:
              </span>
              {[
                { id: 'south', label: 'Front (S)', icon: '⬇️' },
                { id: 'west', label: 'Left (W)', icon: '⬅️' },
                { id: 'east', label: 'Right (E)', icon: '➡️' },
                { id: 'north', label: 'Back (N)', icon: '⬆️' },
              ].map((dir) => (
                <button
                  key={dir.id}
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setPreviewDirection(dir.id);
                  }}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition ${
                    previewDirection === dir.id
                      ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                      : 'border border-yellow-700/20 bg-gray-900/60 text-gray-400 hover:text-white'
                  }`}
                  title={dir.label}
                >
                  <span>{dir.icon}</span>
                </button>
              ))}
            </div>

            {/* Quick Hero Name input */}
            <div className="mt-3 space-y-2 border-t border-yellow-700/30 pt-3 text-xs">
              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <label htmlFor="previewHeroName" className="text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                    Adventurer Name:
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const random = FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
                      setName(random);
                      audioManager.play('tap');
                    }}
                    className="text-[10px] font-bold text-yellow-400 hover:text-yellow-200 transition"
                  >
                    🎲 Random
                  </button>
                </div>
                <input
                  id="previewHeroName"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter hero name..."
                  className="w-full rounded-xl border border-yellow-700/50 bg-black/70 px-3 py-1.5 text-xs font-serif font-bold text-yellow-100 placeholder:text-gray-500 focus:border-yellow-400 focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-gray-400">Calling &amp; Race:</span>
                <span className="font-semibold text-yellow-300 capitalize">
                  {selectedClass} · {selectedRace}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starting City:</span>
                <span className="font-semibold text-emerald-300 capitalize">
                  {activeCityMeta?.displayName || selectedCity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starting Weapon:</span>
                <span className="font-mono text-yellow-200">
                  {EQUIPPED_TOOLS.find((t) => t.id === customization.equippedTool)?.name}
                </span>
              </div>
            </div>

            {/* Direct Launch Button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleCreate('/world')}
                className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 py-2.5 font-serif text-sm font-black text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-400 active:scale-[0.99]"
              >
                Enter 2D Fantasy World ➔
              </button>
            </div>
          </div>

          {/* Right Column: 4-Step Wizard Stepper & Tutorial Studio */}
          <div className="flex flex-col justify-between rounded-3xl border border-yellow-700/40 bg-gray-950/80 p-6 shadow-2xl backdrop-blur">
            <div>
              {/* Stepper Progress Bar Header */}
              <div className="border-b border-yellow-700/30 pb-4">
                <div className="flex items-center justify-between gap-1 sm:gap-2">
                  {WIZARD_STEPS.map((stepItem) => {
                    const isActive = currentStep === stepItem.step;
                    const isCompleted = currentStep > stepItem.step;

                    return (
                      <button
                        key={stepItem.step}
                        type="button"
                        onClick={() => {
                          audioManager.play('tap');
                          setCurrentStep(stepItem.step);
                        }}
                        className={`flex-1 flex items-center justify-center gap-1.5 rounded-xl py-2 px-1 text-center transition ${
                          isActive
                            ? 'border-2 border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow-lg'
                            : isCompleted
                            ? 'border border-emerald-500/50 bg-emerald-950/40 text-emerald-300'
                            : 'border border-yellow-900/30 bg-gray-900/40 text-gray-500 hover:text-gray-300'
                        }`}
                      >
                        <span className="text-sm">{isCompleted ? '✓' : stepItem.icon}</span>
                        <span className="hidden sm:inline font-serif text-xs font-bold truncate">
                          {stepItem.step}. {stepItem.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 1: IDENTITY & CALLING */}
              {currentStep === 1 && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  {/* Hero Name */}
                  <div>
                    <label htmlFor="charNameStep" className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      1. Choose Your Hero Legend Name
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="charNameStep"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter hero name (e.g. Valen, Rowan, Aeloria...)"
                        className="w-full rounded-xl border border-yellow-700/40 bg-gray-900/80 px-4 py-2.5 text-sm font-semibold text-white focus:border-yellow-400 focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const random = FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
                          setName(random);
                          audioManager.play('tap');
                        }}
                        className="rounded-xl border border-yellow-700/30 bg-gray-900 px-4 text-xs font-bold text-yellow-400 hover:border-yellow-500 transition shrink-0"
                      >
                        🎲 Random
                      </button>
                    </div>
                  </div>

                  {/* Calling / Class */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      2. Choose Your Calling (Class)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {CLASSES.map((cls) => {
                        const isSelected = selectedClass === cls.id;
                        return (
                          <button
                            key={cls.id}
                            type="button"
                            onClick={() => {
                              audioManager.play('tap');
                              setSelectedClass(cls.id);
                              setActiveTutorialTip(CLASS_LORE[cls.id] || { icon: cls.icon, title: cls.name, tip: cls.role });
                            }}
                            className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span className="text-2xl">{cls.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{cls.name}</p>
                              <p className="text-[10px] text-yellow-400/80 font-mono">{cls.role}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ancestry / Race */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      3. Choose Your Ancestry (Race)
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {RACES.map((race) => {
                        const isSelected = selectedRace === race.id;
                        return (
                          <button
                            key={race.id}
                            type="button"
                            onClick={() => {
                              audioManager.play('tap');
                              setSelectedRace(race.id);
                              setActiveTutorialTip(RACE_LORE[race.id] || { icon: '👑', title: race.name, tip: race.desc });
                            }}
                            className={`rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <p className="text-xs font-bold text-white">{race.name}</p>
                            <p className="text-[10px] text-gray-400 line-clamp-1">{race.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Gender Expression */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      4. Gender Expression
                    </h3>
                    <div className="flex gap-2">
                      {['Male', 'Female', 'Non-Binary'].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => {
                            audioManager.play('tap');
                            setSelectedGender(gender);
                          }}
                          className={`rounded-xl px-4 py-2 text-xs font-bold transition ${
                            selectedGender === gender
                              ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200'
                              : 'border border-yellow-700/20 bg-gray-900/50 text-gray-400 hover:text-white'
                          }`}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 2: VISAGE & HAIR */}
              {currentStep === 2 && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  {/* Skin Tone */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      1. Skin Complexion
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {SKIN_TONES.map((skin) => {
                        const isSelected = customization.skinTone === skin.id;
                        return (
                          <button
                            key={skin.id}
                            type="button"
                            onClick={() =>
                              updateProp('skinTone', skin.id, {
                                icon: '👤',
                                title: `${skin.name} Complexion`,
                                tip: 'Select a skin tone to personalize your character pixel-art sprite.',
                              })
                            }
                            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span
                              className="h-6 w-6 shrink-0 rounded-full border border-black/40 shadow-inner"
                              style={{ backgroundColor: skin.base }}
                            />
                            <span className="text-xs font-semibold text-white">{skin.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hairstyle */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      2. Hairstyle Cut
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {HAIR_STYLES.map((hair) => {
                        const isSelected = customization.hairstyle === hair.id;
                        return (
                          <button
                            key={hair.id}
                            type="button"
                            onClick={() =>
                              updateProp('hairstyle', hair.id, {
                                icon: '✂️',
                                title: `${hair.name} Hairstyle`,
                                tip: hair.desc || 'Custom hairstyle layered over your character silhouette.',
                              })
                            }
                            className={`rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <p className="text-xs font-bold text-white">{hair.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{hair.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hair Color Dye */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      3. Hair Color Dye
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {HAIR_COLORS.map((dye) => {
                        const isSelected = customization.hairColor === dye.id;
                        return (
                          <button
                            key={dye.id}
                            type="button"
                            onClick={() =>
                              updateProp('hairColor', dye.id, {
                                icon: '🎨',
                                title: `${dye.name} Hair Dye`,
                                tip: 'Dynamic procedural hair coloration applied to all 40 spritesheet walk and attack frames.',
                              })
                            }
                            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span
                              className="h-6 w-6 shrink-0 rounded-full border border-black/40 shadow-inner"
                              style={{ backgroundColor: dye.base }}
                            />
                            <span className="text-xs font-semibold text-white">{dye.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Eye Style */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      4. Eye / Iris Gaze
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {EYE_STYLES.map((eye) => {
                        const isSelected = customization.eyeStyle === eye.id;
                        return (
                          <button
                            key={eye.id}
                            type="button"
                            onClick={() =>
                              updateProp('eyeStyle', eye.id, {
                                icon: '👁️',
                                title: `${eye.name} Gaze`,
                                tip: 'Select iris color and expression for your hero.',
                              })
                            }
                            className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-black/40 shadow-inner"
                              style={{ backgroundColor: eye.color }}
                            />
                            <span className="text-xs font-semibold text-white">{eye.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: GARB & GEAR */}
              {currentStep === 3 && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  {/* Apparel Garb */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      1. Apparel &amp; Armor Tunic
                    </h3>
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      {OUTFITS.map((outfit) => {
                        const isSelected = customization.outfit === outfit.id;
                        return (
                          <button
                            key={outfit.id}
                            type="button"
                            onClick={() =>
                              updateProp('outfit', outfit.id, {
                                icon: '🛡️',
                                title: outfit.name,
                                tip: outfit.desc || 'Starter tunic and adventuring armor.',
                              })
                            }
                            className={`rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <p className="text-xs font-bold text-white">{outfit.name}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{outfit.desc}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outfit Dye Color */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      2. Tunic Dye Palette
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {OUTFIT_COLORS.map((dye) => {
                        const isSelected = customization.outfitColor === dye.id;
                        return (
                          <button
                            key={dye.id}
                            type="button"
                            onClick={() => updateProp('outfitColor', dye.id)}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span
                              className="h-5 w-5 shrink-0 rounded-full border border-black/40 shadow-inner"
                              style={{ backgroundColor: dye.base }}
                            />
                            <span className="text-xs font-semibold text-white">{dye.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Back Cloaks & Accessories */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      3. Back Cloak &amp; Accessories
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {ACCESSORIES.map((acc) => {
                        const isSelected = customization.accessory === acc.id;
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => updateProp('accessory', acc.id)}
                            className={`rounded-xl border p-2.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span className="text-xs font-semibold text-white">{acc.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Equipped Starter Tool */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      4. Equipped Starter Tool
                    </h3>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {EQUIPPED_TOOLS.map((tool) => {
                        const isSelected = customization.equippedTool === tool.id;
                        return (
                          <button
                            key={tool.id}
                            type="button"
                            onClick={() =>
                              updateProp('equippedTool', tool.id, TOOL_LORE[tool.id] || {
                                icon: tool.icon,
                                title: tool.name,
                                tip: tool.type,
                              })
                            }
                            className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-sm ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <span className="text-2xl">{tool.icon}</span>
                            <div>
                              <p className="text-xs font-bold text-white">{tool.name}</p>
                              <p className="text-[10px] text-yellow-400/80 uppercase font-mono">{tool.type}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 4: ALLEGIANCE & EMBARK */}
              {currentStep === 4 && (
                <div className="mt-6 space-y-6 animate-fadeIn">
                  {/* Starting City */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                      1. Choose Your Starting City &amp; Regional Perk
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
                      {cities.map((city) => {
                        const isSelected = selectedCity === city.id;
                        return (
                          <button
                            key={city.id}
                            type="button"
                            onClick={() => {
                              audioManager.play('tap');
                              setSelectedCity(city.id);
                              setActiveTutorialTip({
                                icon: '🏛️',
                                title: `${city.displayName} Allegiance`,
                                tip: `${city.theme} — City Perk: ${city.perk?.name}: ${city.perk?.description}`,
                              });
                            }}
                            className={`rounded-2xl border p-3.5 text-left transition ${
                              isSelected
                                ? 'border-yellow-400 bg-yellow-500/10 shadow-md ring-1 ring-yellow-400'
                                : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                            }`}
                          >
                            <p className="font-serif text-sm font-bold text-white">{city.displayName}</p>
                            <p className="text-[10px] text-yellow-400/90 font-mono mt-0.5">{city.theme}</p>
                            <div className="mt-2 rounded-lg bg-black/40 p-2 text-[11px] text-emerald-300">
                              <span className="font-bold">Perk: </span>{city.perk?.name}
                              <p className="text-[10px] text-gray-300 mt-0.5">{city.perk?.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Character Summary Review */}
                  <div className="rounded-2xl border border-yellow-700/30 bg-black/50 p-4 space-y-2 text-xs">
                    <h4 className="font-serif font-bold text-amber-200 uppercase tracking-wider text-xs border-b border-yellow-900/40 pb-1">
                      📜 Warden Dossier Review
                    </h4>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-400">Hero Name: </span>
                        <span className="font-bold text-yellow-300">{name || 'Unnamed'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Calling: </span>
                        <span className="font-bold text-white">{selectedClass}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Ancestry: </span>
                        <span className="font-bold text-white">{selectedRace}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Gender: </span>
                        <span className="font-bold text-white">{selectedGender}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Starting City: </span>
                        <span className="font-bold text-emerald-300">{activeCityMeta?.displayName}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Starting Tool: </span>
                        <span className="font-bold text-yellow-200">
                          {EQUIPPED_TOOLS.find((t) => t.id === customization.equippedTool)?.name}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls: Dynamic Tutorial Codex Box & Stepper Buttons */}
            <div className="mt-8 pt-4 border-t border-yellow-700/30 space-y-4">
              {/* Dynamic Interactive Tutorial & Lore Callout Box */}
              <div className="flex items-start gap-3 p-3.5 bg-stone-950/90 border border-yellow-600/50 rounded-2xl shadow-inner animate-fadeIn">
                <span className="text-2xl shrink-0 mt-0.5">{activeTutorialTip.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-yellow-400 font-bold">
                      💡 Tutorial &amp; Lore Codex
                    </span>
                    <span className="text-xs text-yellow-200 font-bold font-serif">
                      · {activeTutorialTip.title}
                    </span>
                  </div>
                  <p className="text-xs text-amber-100/90 font-serif leading-relaxed mt-1">
                    {activeTutorialTip.tip}
                  </p>
                </div>
              </div>

              {/* Wizard Navigation Buttons */}
              <div className="flex items-center justify-between gap-3">
                {currentStep > 1 ? (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex items-center gap-1.5 rounded-xl border border-yellow-700/40 bg-gray-900/80 px-4 py-2.5 text-xs font-bold text-gray-200 hover:border-yellow-400 transition"
                  >
                    <span>⬅️</span>
                    <span>Back: Step {currentStep - 1}</span>
                  </button>
                ) : (
                  <div />
                )}

                {currentStep < 4 ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-yellow-500 to-amber-500 px-6 py-2.5 text-xs font-serif font-black text-black shadow-lg shadow-yellow-500/20 hover:from-yellow-400 hover:to-amber-400 transition active:scale-[0.98]"
                  >
                    <span>Next: Step {currentStep + 1}</span>
                    <span>➔</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleCreate('/world')}
                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 px-7 py-3 text-sm font-serif font-black text-black shadow-lg shadow-emerald-500/30 hover:from-emerald-400 hover:to-green-500 transition active:scale-[0.98]"
                  >
                    <span>⚔️</span>
                    <span>Forge Hero &amp; Enter Realm ➔</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </section>
  );
}
