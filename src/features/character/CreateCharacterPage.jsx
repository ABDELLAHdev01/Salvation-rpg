import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import CharacterService from '../../core/services/CharacterService';
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

export default function CreateCharacter() {
  const navigate = useNavigate();

  // Character Identity State
  const [name, setName] = useState('Valen');
  const [selectedRace, setSelectedRace] = useState('human');
  const [selectedClass, setSelectedClass] = useState('Vanguard');
  const [selectedGender, setSelectedGender] = useState('Male');
  const [selectedCity, setSelectedCity] = useState(cities[0]?.id || 'eldoria');

  // 2D Customization State
  const [customization, setCustomization] = useState({ ...DEFAULT_CUSTOMIZATION });
  const [previewDirection, setPreviewDirection] = useState('south');
  const [activeTab, setActiveTab] = useState('appearance'); // 'appearance' | 'outfit' | 'identity'

  // Update a single customization property
  const updateProp = (field, value) => {
    audioManager.play('tap');
    setCustomization((prev) => ({ ...prev, [field]: value }));
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

  // Character Creation Submission
  const handleCreate = async (destination = '/world') => {
    const trimmedName = name.trim();
    if (!trimmedName || trimmedName.length < 2) {
      toast.error('Please enter a valid adventurer name (at least 2 letters).');
      return;
    }

    const characterData = {
      name: trimmedName,
      race: selectedRace.toUpperCase(),
      raceKey: selectedRace.toLowerCase(),
      sex: selectedGender,
      className: selectedClass,
      characterClass: selectedClass,
      city: selectedCity,
      customization,
      imageKey: 'male_1',
    };

    try {
      await CharacterService.createCharacter(characterData);
      toast.success(`Welcome to Salvation, ${trimmedName}!`, { icon: '⚔️' });
      navigate(destination);
    } catch (err) {
      console.error('Character creation failed:', err);
      toast.error('Failed to create character. Please try again.');
    }
  };

  const activeCityMeta = cities.find((c) => c.id === selectedCity) || cities[0];

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell text-gray-100 pb-16">
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 pt-12 sm:px-6">
        {/* Header Ribbon */}
        <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-yellow-700/30 pb-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] font-bold text-yellow-500">
              Living 2D Fantasy RPG
            </p>
            <h1 className="text-3xl font-serif font-extrabold text-white tracking-wide">
              Adventurer Customization Forge
            </h1>
            <p className="text-xs text-gray-300">
              Forge your original pixel-art avatar and embark into the interactive world of Salvation.
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
          {/* Left: 2D Live Pixel Preview Card */}
          <div className="flex flex-col rounded-3xl border-2 border-yellow-600/40 bg-gray-950/85 p-6 shadow-2xl backdrop-blur">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold uppercase tracking-widest text-yellow-500">
                Live 2D Sprite Preview
              </span>
              <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-mono text-emerald-300">
                Phaser 3 Ready
              </span>
            </div>

            {/* Pixel Viewport */}
            <div className="relative flex h-56 w-full items-center justify-center overflow-hidden rounded-2xl border-2 border-yellow-700/30 bg-gradient-to-b from-gray-900 to-black p-4 shadow-inner">
              {/* Background ambient rune circle */}
              <div className="absolute inset-0 flex items-center justify-center opacity-10 pointer-events-none">
                <div className="h-44 w-44 rounded-full border-2 border-yellow-400 border-dashed animate-spin-slow" />
              </div>

              {previewDataUrl ? (
                <img
                  src={previewDataUrl}
                  alt={name}
                  className="relative z-10 h-44 w-44 object-contain filter drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)]"
                  style={{ imageRendering: 'pixelated' }}
                />
              ) : (
                <div className="text-xs text-gray-400 font-mono">Generating Sprite...</div>
              )}
            </div>

            {/* Direction Rotation Switcher */}
            <div className="mt-4 flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 mr-1">
                Angle:
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
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1.5 text-xs font-bold transition ${
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

            {/* Character Summary Pill Badges */}
            <div className="mt-5 space-y-2 border-t border-yellow-700/30 pt-4 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Adventurer:</span>
                <span className="font-bold text-white">{name || 'Unnamed'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Ancestry &amp; Class:</span>
                <span className="font-semibold text-yellow-300 capitalize">
                  {selectedRace} · {selectedClass}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Starting City:</span>
                <span className="font-semibold text-emerald-300 capitalize">
                  {activeCityMeta?.displayName || selectedCity}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Equipped Tool:</span>
                <span className="font-mono text-yellow-200">
                  {EQUIPPED_TOOLS.find((t) => t.id === customization.equippedTool)?.name}
                </span>
              </div>
            </div>

            {/* Direct Action Launch Button */}
            <div className="mt-6 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => handleCreate('/world')}
                className="w-full rounded-2xl bg-gradient-to-r from-yellow-500 to-amber-500 py-3 font-serif text-sm font-black text-black shadow-lg shadow-yellow-500/20 transition hover:from-yellow-400 hover:to-amber-400 active:scale-[0.99]"
              >
                Enter 2D Fantasy World ➔
              </button>
              <button
                type="button"
                onClick={() => handleCreate('/dashboard')}
                className="w-full rounded-2xl border border-yellow-700/40 bg-gray-900/80 py-2.5 text-xs font-bold text-gray-300 hover:border-yellow-400 hover:text-white transition"
              >
                Enter Citadel Dashboard
              </button>
            </div>
          </div>

          {/* Right: Customization Options Studio */}
          <div className="rounded-3xl border border-yellow-700/40 bg-gray-950/80 p-6 shadow-2xl backdrop-blur">
            {/* Category Navigation Tabs */}
            <div className="flex flex-wrap items-center gap-2 border-b border-yellow-700/30 pb-4">
              {[
                { id: 'appearance', label: 'Body & Hair', icon: '👤' },
                { id: 'outfit', label: 'Garb & Equipment', icon: '🛡️' },
                { id: 'identity', label: 'Identity & Lineage', icon: '📜' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    audioManager.play('tap');
                    setActiveTab(tab.id);
                  }}
                  className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow-md'
                      : 'border border-yellow-700/20 bg-gray-900/40 text-gray-400 hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab 1: Body & Hair */}
            {activeTab === 'appearance' && (
              <div className="mt-6 space-y-6 animate-fadeIn">
                {/* Skin Tones */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Skin Complexion
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {SKIN_TONES.map((skin) => {
                      const isSelected = customization.skinTone === skin.id;
                      return (
                        <button
                          key={skin.id}
                          type="button"
                          onClick={() => updateProp('skinTone', skin.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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

                {/* Haircut Styles */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Hairstyle Cut
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {HAIR_STYLES.map((hair) => {
                      const isSelected = customization.hairstyle === hair.id;
                      return (
                        <button
                          key={hair.id}
                          type="button"
                          onClick={() => updateProp('hairstyle', hair.id)}
                          className={`rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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
                    Hair Color Dye
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {HAIR_COLORS.map((dye) => {
                      const isSelected = customization.hairColor === dye.id;
                      return (
                        <button
                          key={dye.id}
                          type="button"
                          onClick={() => updateProp('hairColor', dye.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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
                    Eye / Iris Gaze
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {EYE_STYLES.map((eye) => {
                      const isSelected = customization.eyeStyle === eye.id;
                      return (
                        <button
                          key={eye.id}
                          type="button"
                          onClick={() => updateProp('eyeStyle', eye.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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

            {/* Tab 2: Garb & Gear */}
            {activeTab === 'outfit' && (
              <div className="mt-6 space-y-6 animate-fadeIn">
                {/* Outfit Type */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Apparel &amp; Armor Garb
                  </h3>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {OUTFITS.map((outfit) => {
                      const isSelected = customization.outfit === outfit.id;
                      return (
                        <button
                          key={outfit.id}
                          type="button"
                          onClick={() => updateProp('outfit', outfit.id)}
                          className={`rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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

                {/* Outfit Dye Palette */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Garb Color Palette
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {OUTFIT_COLORS.map((dye) => {
                      const isSelected = customization.outfitColor === dye.id;
                      return (
                        <button
                          key={dye.id}
                          type="button"
                          onClick={() => updateProp('outfitColor', dye.id)}
                          className={`flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                              : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                          }`}
                        >
                          <span
                            className="h-6 w-6 shrink-0 rounded-full border border-black/40 shadow-inner"
                            style={{ backgroundColor: dye.primary }}
                          />
                          <span className="text-xs font-semibold text-white">{dye.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Headwear */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Headwear &amp; Helmets
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {HEADWEAR.map((head) => {
                      const isSelected = customization.headwear === head.id;
                      return (
                        <button
                          key={head.id}
                          type="button"
                          onClick={() => updateProp('headwear', head.id)}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                              : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                          }`}
                        >
                          <span className="text-xs font-semibold text-white">{head.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Accessory */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Back Cloaks &amp; Accessories
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
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                              : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                          }`}
                        >
                          <span className="text-xs font-semibold text-white">{acc.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Starter Equipped Tool */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Equipped Starter Tool
                  </h3>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {EQUIPPED_TOOLS.map((tool) => {
                      const isSelected = customization.equippedTool === tool.id;
                      return (
                        <button
                          key={tool.id}
                          type="button"
                          onClick={() => updateProp('equippedTool', tool.id)}
                          className={`flex items-center gap-2 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                              : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                          }`}
                        >
                          <span className="text-xl">{tool.icon}</span>
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

            {/* Tab 3: Identity & Lineage */}
            {activeTab === 'identity' && (
              <div className="mt-6 space-y-6 animate-fadeIn">
                {/* Adventurer Name */}
                <div>
                  <label htmlFor="charName" className="block text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Adventurer Legend Name
                  </label>
                  <div className="flex gap-2">
                    <input
                      id="charName"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter heroic name"
                      className="w-full rounded-xl border border-yellow-700/40 bg-gray-900/80 px-4 py-2.5 text-sm font-semibold text-white focus:border-yellow-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const random = FANTASY_NAMES[Math.floor(Math.random() * FANTASY_NAMES.length)];
                        setName(random);
                      }}
                      className="rounded-xl border border-yellow-700/30 bg-gray-900 px-3 text-xs font-bold text-yellow-400 hover:border-yellow-500 transition"
                    >
                      Random
                    </button>
                  </div>
                </div>

                {/* Calling / Class */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Calling / Character Class
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
                          }}
                          className={`flex items-start gap-2.5 rounded-xl border p-3 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
                              : 'border-yellow-700/20 bg-gray-900/50 hover:border-yellow-600/40'
                          }`}
                        >
                          <span className="text-xl">{cls.icon}</span>
                          <div>
                            <p className="text-xs font-bold text-white">{cls.name}</p>
                            <p className="text-[10px] text-gray-400">{cls.role}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Starting City */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Starting Realm &amp; City Perk
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

                {/* Ancestry / Race */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Ancestry / Race
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
                          }}
                          className={`rounded-xl border p-2.5 text-left transition ${
                            isSelected
                              ? 'border-yellow-400 bg-yellow-500/10 shadow-sm'
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

                {/* Gender */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-yellow-400 mb-2">
                    Gender Expression
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
          </div>
        </div>
      </main>
    </section>
  );
}
