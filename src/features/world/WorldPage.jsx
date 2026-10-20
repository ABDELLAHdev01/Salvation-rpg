import React, { useEffect, useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import PhaserWorldCanvas from '../../core/phaser/PhaserWorldCanvas';
import gameEventBridge, { gameEvents } from '../../core/phaser/gameEventBridge';
import audioManager from '../../core/audio/AudioManager';
import { getItemIcon } from '../../core/data/itemIcons';
import { EQUIPPED_TOOLS, DEFAULT_CUSTOMIZATION, sanitizeCustomization } from '../../core/phaser/characterCustomizationData';
import InGameInventoryModal from './modals/InGameInventoryModal';
import InGameWardrobeModal from './modals/InGameWardrobeModal';
import InGameForgeModal from './modals/InGameForgeModal';
import InGameBazaarModal from './modals/InGameBazaarModal';
import InGameGuildModal from './modals/InGameGuildModal';
import InGameSaveModal from './modals/InGameSaveModal';
import InGameHelpModal from './modals/InGameHelpModal';
import InGameFishingModal from './modals/InGameFishingModal';
import InGamePetModal from './modals/InGamePetModal';
import { COMPANIONS } from '../../core/data/companionData';
import WorldMinimap from './components/WorldMinimap';

const ZONES = [
  { id: 'homestead', label: 'Homestead', icon: '🏡', kicker: 'Sunforge Estate' },
  { id: 'west_road', label: 'West Road', icon: '🛣️', kicker: "King's Highway" },
  { id: 'village', label: 'Sunforge City', icon: '🏛️', kicker: "Adventurers' Plaza" },
  { id: 'forest', label: 'Whispering Forest', icon: '🌲', kicker: 'Enchanted Grove' },
  { id: 'mine', label: 'Deep Caverns', icon: '⛏️', kicker: 'Deepforge Seams' },
];

export default function WorldPage() {
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentZone, setCurrentZone] = useState('homestead');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Live player tracking for permanent minimap
  const [playerPosition, setPlayerPosition] = useState({ x: 480, y: 448 });
  const [playerFacing, setPlayerFacing] = useState('south');

  // Simulation Clock & Weather
  const [worldClock, setWorldClock] = useState({
    hour: 8,
    minute: 30,
    timeOfDay: 'day',
    weather: 'clear',
  });

  // In-Game Modal Overlays
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);
  const [isWardrobeOpen, setIsWardrobeOpen] = useState(false);
  const [isForgeOpen, setIsForgeOpen] = useState(false);
  const [isBazaarOpen, setIsBazaarOpen] = useState(false);
  const [isGuildOpen, setIsGuildOpen] = useState(false);
  const [isSaveOpen, setIsSaveOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isFishingOpen, setIsFishingOpen] = useState(false);
  const [isPetOpen, setIsPetOpen] = useState(false);

  // Load character & profile on mount
  const loadActiveHero = useCallback(() => {
    authService.ensureOfflineSession();
    const username = authService.getCurrentUsername() || 'offline-hero';
    let savedCharacter = characterService.getMockCharacter(username);
    let savedProfile = characterService.getMockProfile(username);

    // Auto-initialize default Warden if none exists so game boots immediately
    if (!savedCharacter) {
      savedCharacter = {
        characterName: 'Valen',
        race: 'HUMAN',
        raceKey: 'human',
        className: 'Vanguard',
        gender: 'Male',
        city: 'eldoria',
        customization: { ...DEFAULT_CUSTOMIZATION },
        userId: username,
      };
      const characters = JSON.parse(localStorage.getItem('mockCharacters') || '{}');
      characters[username] = savedCharacter;
      localStorage.setItem('mockCharacters', JSON.stringify(characters));
    }

    if (!savedProfile) {
      savedProfile = {
        username,
        stats: { level: 1, xp: 0, power: 120, gold: 350 },
        inventory: { 'health-potion': 3, iron: 6, copper: 4, turnip: 5 },
      };
      const profiles = JSON.parse(localStorage.getItem('mockProfiles') || '{}');
      profiles[username] = savedProfile;
      localStorage.setItem('mockProfiles', JSON.stringify(profiles));
    }

    setCharacter(savedCharacter);
    setProfile(savedProfile);
  }, []);

  useEffect(() => {
    loadActiveHero();
  }, [loadActiveHero]);

  // Listen to zone changes and in-game modal triggers from Phaser
  useEffect(() => {
    const cleanups = [
      gameEventBridge.on(gameEvents.ZONE_CHANGED, ({ zone }) => {
        setCurrentZone(zone);
      }),
      gameEventBridge.on(gameEvents.PLAYER_MOVED, ({ x, y, facing }) => {
        setPlayerPosition({ x, y });
        if (facing) setPlayerFacing(facing);
      }),
      gameEventBridge.on('OPEN_IN_GAME_INVENTORY', () => {
        setIsInventoryOpen(true);
      }),
      gameEventBridge.on('OPEN_IN_GAME_FORGE', () => {
        setIsForgeOpen(true);
      }),
      gameEventBridge.on('OPEN_IN_GAME_BAZAAR', () => {
        setIsBazaarOpen(true);
      }),
      gameEventBridge.on('OPEN_IN_GAME_GUILD', () => {
        setIsGuildOpen(true);
      }),
      gameEventBridge.on(gameEvents.OPEN_FISHING, () => {
        setIsFishingOpen(true);
      }),
      gameEventBridge.on('OPEN_IN_GAME_FISHING', () => {
        setIsFishingOpen(true);
      }),
      gameEventBridge.on(gameEvents.OPEN_PETS, () => {
        setIsPetOpen(true);
      }),
      gameEventBridge.on('OPEN_IN_GAME_PETS', () => {
        setIsPetOpen(true);
      }),
      gameEventBridge.on(gameEvents.ENVIRONMENT_TICK, (env) => {
        setWorldClock(env);
      }),
    ];

    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    // Global in-game keyboard shortcuts
    const handleKeyDown = (e) => {
      // Don't trigger if typing in an input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key === 'Escape') {
        setIsInventoryOpen(false);
        setIsWardrobeOpen(false);
        setIsForgeOpen(false);
        setIsBazaarOpen(false);
        setIsGuildOpen(false);
        setIsSaveOpen(false);
        setIsHelpOpen(false);
        setIsFishingOpen(false);
        setIsPetOpen(false);
      } else if (e.key === 'i' || e.key === 'I' || e.key === 'b' || e.key === 'B') {
        setIsInventoryOpen((prev) => !prev);
        audioManager.play('tap');
      } else if (e.key === 'c' || e.key === 'C') {
        setIsWardrobeOpen((prev) => !prev);
        audioManager.play('tap');
      } else if (e.key === 'g' || e.key === 'G') {
        setIsGuildOpen((prev) => !prev);
        audioManager.play('tap');
      } else if (e.key === 'p' || e.key === 'P') {
        setIsPetOpen((prev) => !prev);
        audioManager.play('tap');
      } else if (e.key === 'f' || e.key === 'F') {
        setIsFishingOpen((prev) => !prev);
        audioManager.play('tap');
      } else if (e.key === 'h' || e.key === 'H') {
        if (currentZone === 'homestead') {
          toast('You are already at Sunforge Homestead!', { icon: '🏡' });
        } else {
          audioManager.play('tap');
          toast('Recalling to Homestead...', { icon: '✨' });
          gameEventBridge.emit(gameEvents.RETURN_HOME);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanups.forEach((unsub) => unsub());
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentZone]);

  const handleReturnHome = () => {
    if (currentZone === 'homestead') {
      toast('You are already at Sunforge Homestead!', { icon: '🏡' });
      return;
    }
    audioManager.play('tap');
    toast('Recalling to Homestead...', { icon: '✨' });
    gameEventBridge.emit(gameEvents.RETURN_HOME);
  };

  const toggleFullscreen = () => {
    audioManager.play('tap');
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleSwitchZone = (zoneId) => {
    if (zoneId === currentZone) return;
    audioManager.play('tap');
    setCurrentZone(zoneId);
    gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: zoneId });
  };

  const handleUseInventoryPotion = (itemId) => {
    if (itemId.includes('potion') || itemId.includes('elixir')) {
      gameEventBridge.emit(gameEvents.USE_HEALING_POTION);
    }
  };

  const activeZoneMeta = ZONES.find((z) => z.id === currentZone) || ZONES[0];
  const playerLevel = profile?.stats?.level ?? 1;
  const playerGold = profile?.stats?.gold ?? 0;
  const playerXp = profile?.stats?.xp ?? 0;
  const currentToolId = character?.customization?.equippedTool || character?.customization?.tool || 'iron_pickaxe';
  const toolMeta = EQUIPPED_TOOLS.find((t) => t.id === currentToolId) || { name: 'Iron Pickaxe', icon: '⛏️' };
  const equippedPetId = profile?.equippedPet || 'sheepdog';
  const equippedPetMeta = COMPANIONS.find((c) => c.id === equippedPetId) || COMPANIONS[0];

  return (
    <div className="fixed inset-0 w-screen h-screen overflow-hidden bg-black select-none z-0">
      {/* 2D Interactive Phaser RPG Canvas filling 100% of viewport */}
      <PhaserWorldCanvas
        customization={sanitizeCustomization(character?.customization)}
        profile={profile}
        onProfileUpdate={setProfile}
        initialZone={currentZone}
        className="w-full h-full"
      />

      {/* =========================================================================
          TOP HUD OVERLAY
          ========================================================================= */}
      <header className="pointer-events-none fixed top-0 inset-x-0 z-20 flex items-start justify-between p-3 sm:p-4">
        {/* Top Left: Region Title & Fast Travel Navigation */}
        <div className="pointer-events-auto flex flex-col gap-2">
          {/* Current Region Card */}
          <div className="flex items-center gap-2 rounded-2xl border border-yellow-600/50 bg-gray-950/90 px-3.5 py-1.5 shadow-2xl backdrop-blur-md">
            <span className="text-xl">{activeZoneMeta.icon}</span>
            <div>
              <span className="block text-[9px] font-bold uppercase tracking-wider text-yellow-400/80 leading-none">
                {activeZoneMeta.kicker}
              </span>
              <span className="font-serif text-xs font-bold text-white sm:text-sm leading-tight">
                {activeZoneMeta.label}
              </span>
            </div>
          </div>

          {/* Fast-Travel Quick Bar */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-1.5 shadow-xl backdrop-blur-md">
            <span className="px-1.5 text-[9px] font-bold uppercase tracking-wider text-yellow-500/70">
              Travel:
            </span>
            {ZONES.map((zone) => {
              const isActive = currentZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSwitchZone(zone.id)}
                  className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
                    isActive
                      ? 'border border-yellow-400 bg-yellow-500/25 text-yellow-200 shadow'
                      : 'border border-transparent text-gray-400 hover:text-white hover:bg-gray-900'
                  }`}
                  title={`Fast-travel to ${zone.label}`}
                >
                  <span>{zone.icon}</span>
                  <span className="hidden md:inline">{zone.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Top Right: Player Stats & In-Game Action Menus */}
        <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-1.5 sm:gap-2">
          {/* Day/Night & Weather Clock */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
            <span className="text-sm">
              {worldClock.timeOfDay === 'night' ? '🌙' : worldClock.timeOfDay === 'dusk' ? '🌅' : '☀️'}
            </span>
            <span className="font-mono text-xs font-bold text-yellow-300">
              {String(worldClock.hour).padStart(2, '0')}:{String(worldClock.minute).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-gray-400 border-l border-yellow-700/40 pl-1.5">
              {worldClock.weather === 'rain' ? '🌧️ Rain' : worldClock.weather === 'thunderstorm' ? '⚡ Storm' : worldClock.weather === 'fog' ? '🌫️ Fog' : '☀️ Clear'}
            </span>
          </div>

          {/* Gold Counter */}
          <div className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
            <img src={getItemIcon('gold-coin')} alt="Gold" className="h-4 w-4 object-contain pixelated" />
            <span className="font-mono text-xs font-bold text-yellow-300">
              {playerGold}g
            </span>
          </div>

          {/* Level & XP */}
          <div className="hidden sm:flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 shadow-xl backdrop-blur-md">
            <span className="text-sm">⭐</span>
            <span className="font-mono text-xs font-bold text-yellow-300">
              Lvl {playerLevel} ({playerXp} XP)
            </span>
          </div>

          {/* Equipped Weapon / Tool */}
          <div
            className="hidden md:flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 shadow-xl backdrop-blur-md"
            title={`Equipped Weapon/Tool: ${toolMeta.name}`}
          >
            <img src={getItemIcon(currentToolId)} alt={toolMeta.name} className="h-4 w-4 object-contain pixelated" />
            <span className="font-serif text-xs font-bold text-gray-200">
              {toolMeta.name}
            </span>
          </div>

          {/* Return Home Fast Travel Button */}
          <button
            type="button"
            onClick={handleReturnHome}
            className={`flex items-center gap-1.5 rounded-2xl border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition active:scale-95 ${
              currentZone === 'homestead'
                ? 'border-gray-800 bg-gray-900/60 text-gray-500 opacity-60 cursor-default'
                : 'border-yellow-600/40 bg-gray-950/90 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/15'
            }`}
            title="Return Home to Sunforge Homestead [H]"
          >
            <span>🏡</span>
            <span className="hidden sm:inline">Home</span>
          </button>

          {/* Action Modals Buttons */}
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsGuildOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Adventurers' Guild Board & Renown [G]"
          >
            <span>⚔️</span>
            <span className="hidden sm:inline">Guild</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsInventoryOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Open Adventurer Pouch [I]"
          >
            <span>🎒</span>
            <span className="hidden sm:inline">Pouch</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsWardrobeOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Warden's Wardrobe Customizer [C]"
          >
            <span>🎨</span>
            <span className="hidden sm:inline">Wardrobe</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsPetOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-amber-600/50 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-amber-300 shadow-xl backdrop-blur-md hover:border-amber-400 hover:bg-amber-500/15 transition active:scale-95"
            title="Warden Companion Sanctuary [P]"
          >
            <span>{equippedPetMeta.icon}</span>
            <span className="hidden sm:inline">Pet</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsFishingOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-cyan-600/50 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-cyan-300 shadow-xl backdrop-blur-md hover:border-cyan-400 hover:bg-cyan-500/15 transition active:scale-95"
            title="Angler Fishing [F]"
          >
            <span>🎣</span>
            <span className="hidden sm:inline">Fish</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsForgeOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Artisan Forge & Smelter"
          >
            <span>⚒️</span>
            <span className="hidden md:inline">Forge</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsBazaarOpen(true);
            }}
            className="flex items-center gap-1.5 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-3 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Merchant Bazaar & Seed Shop"
          >
            <span>🏛️</span>
            <span className="hidden md:inline">Bazaar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsSaveOpen(true);
            }}
            className="flex items-center gap-1 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-2.5 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Save / Load Game"
          >
            <span>💾</span>
          </button>

          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              setIsHelpOpen(true);
            }}
            className="flex items-center gap-1 rounded-2xl border border-yellow-600/40 bg-gray-950/90 px-2.5 py-1.5 text-xs font-bold text-yellow-300 shadow-xl backdrop-blur-md hover:border-yellow-400 hover:bg-yellow-500/15 transition active:scale-95"
            title="Game Controls & Help [?]"
          >
            <span>❓</span>
          </button>

          {/* Fullscreen Toggle Button */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className={`flex items-center gap-1 rounded-2xl border px-3 py-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition active:scale-95 ${
              isFullscreen
                ? 'border-yellow-400 bg-yellow-500/30 text-yellow-200'
                : 'border-yellow-600/40 bg-gray-950/90 text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/15'
            }`}
            title="Toggle Borderless Fullscreen Mode [F11]"
          >
            <span>{isFullscreen ? '↙️' : '⛶'}</span>
            <span className="hidden sm:inline">{isFullscreen ? 'Window' : 'Fullscreen'}</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          BOTTOM HUD CONTROLS HINT (MINIMAL & NON-INTRUSIVE)
          ========================================================================= */}
      <footer className="pointer-events-none fixed bottom-3 left-4 z-20 hidden md:flex items-center gap-2 rounded-2xl border border-yellow-700/30 bg-gray-950/80 px-3.5 py-1 text-[11px] font-mono text-gray-300 backdrop-blur-md shadow-xl">
        <span className="text-yellow-400 font-bold">WASD</span> Walk ·
        <span className="text-yellow-400 font-bold">Shift</span> Sprint ·
        <span className="text-yellow-400 font-bold">Click/Space</span> Attack ·
        <span className="text-yellow-400 font-bold">[E]</span> Interact ·
        <span className="text-yellow-400 font-bold">[Q]</span> Heal ·
        <span className="text-yellow-400 font-bold">[H]</span> Home ·
        <span className="text-yellow-400 font-bold">[G]</span> Guild ·
        <span className="text-yellow-400 font-bold">[P]</span> Pet ·
        <span className="text-yellow-400 font-bold">[F]</span> Fish ·
        <span className="text-yellow-400 font-bold">[M]</span> Map
      </footer>

      {/* =========================================================================
          PERMANENT MINIMAP & EXPANDED WORLD ATLAS
          ========================================================================= */}
      <WorldMinimap
        currentZone={currentZone}
        playerPosition={playerPosition}
        playerFacing={playerFacing}
        discoveredRegions={profile?.discoveredRegions || ['homestead']}
        activeContracts={profile?.activeContracts || []}
        onReturnHome={handleReturnHome}
      />

      {/* =========================================================================
          IN-GAME MODALS (RENDER DIRECTLY OVER 2D REALM)
          ========================================================================= */}
      <InGameGuildModal
        isOpen={isGuildOpen}
        onClose={() => setIsGuildOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      <InGameInventoryModal
        isOpen={isInventoryOpen}
        onClose={() => setIsInventoryOpen(false)}
        inventory={profile?.inventory || {}}
        gold={playerGold}
        onUseItem={handleUseInventoryPotion}
      />

      <InGameWardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        character={character}
        onCharacterUpdate={setCharacter}
      />

      <InGameForgeModal
        isOpen={isForgeOpen}
        onClose={() => setIsForgeOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      <InGameBazaarModal
        isOpen={isBazaarOpen}
        onClose={() => setIsBazaarOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />

      <InGameSaveModal
        isOpen={isSaveOpen}
        onClose={() => setIsSaveOpen(false)}
        character={character}
        profile={profile}
        onReloadGame={loadActiveHero}
      />

      <InGameHelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      <InGameFishingModal
        isOpen={isFishingOpen}
        onClose={() => setIsFishingOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
        currentZone={currentZone}
      />

      <InGamePetModal
        isOpen={isPetOpen}
        onClose={() => setIsPetOpen(false)}
        profile={profile}
        onProfileUpdate={setProfile}
      />
    </div>
  );
}
