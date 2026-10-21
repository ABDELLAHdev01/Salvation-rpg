import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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

  // Live player combat status
  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);

  // First-time player movement tutorial banner (only shown on first play)
  const [showMovementTutorial, setShowMovementTutorial] = useState(() => {
    try {
      const seen = localStorage.getItem('hasSeenMovementTutorial') || localStorage.getItem('hasSeenOnboarding');
      return !seen;
    } catch {
      return false;
    }
  });

  const dismissMovementTutorial = useCallback(() => {
    setShowMovementTutorial(false);
    try {
      localStorage.setItem('hasSeenMovementTutorial', 'true');
      localStorage.setItem('hasSeenOnboarding', 'true');
    } catch {
      // ignore
    }
  }, []);

  const resetMovementTutorial = useCallback(() => {
    setShowMovementTutorial(true);
    try {
      localStorage.removeItem('hasSeenMovementTutorial');
    } catch {
      // ignore
    }
  }, []);

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
    const hasCreatedCharacter = localStorage.getItem('hasCreatedCharacter') === 'true';

    // First time playing: If player hasn't created a character yet, direct them to Character Creation!
    if (!savedCharacter || !hasCreatedCharacter) {
      navigate('/character', { replace: true });
      return;
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
  }, [navigate]);

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
      gameEventBridge.on(gameEvents.COMBAT_PLAYER_DAMAGED, ({ hp, maxHp }) => {
        if (hp !== undefined) setPlayerHp(hp);
        if (maxHp !== undefined) setPlayerMaxHp(maxHp);
      }),
      gameEventBridge.on(gameEvents.COMBAT_PLAYER_HEAL, ({ hp, maxHp }) => {
        if (hp !== undefined) setPlayerHp(hp);
        if (maxHp !== undefined) setPlayerMaxHp(maxHp);
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
      } else if (e.key === '1') {
        audioManager.play('tap');
        gameEventBridge.emit(gameEvents.USE_HEALING_POTION);
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

  // Auto-dismiss first-time movement guide after player moves and explores
  useEffect(() => {
    if (!showMovementTutorial) return;
    let timer = null;
    const unsub = gameEventBridge.on(gameEvents.PLAYER_MOVED, () => {
      if (!timer) {
        timer = setTimeout(() => {
          dismissMovementTutorial();
        }, 12000);
      }
    });
    return () => {
      unsub();
      if (timer) clearTimeout(timer);
    };
  }, [showMovementTutorial, dismissMovementTutorial]);

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
  const potionCount = profile?.inventory?.['health-potion'] || 0;

  const handleQuickHeal = () => {
    audioManager.play('tap');
    gameEventBridge.emit(gameEvents.USE_HEALING_POTION);
  };

  if (!character) {
    return (
      <div className="fixed inset-0 bg-stone-950 flex flex-col items-center justify-center text-amber-200 font-serif select-none">
        <span className="text-3xl animate-bounce mb-2">⚔️</span>
        <p className="text-sm tracking-wide text-amber-300">Awakening Warden...</p>
      </div>
    );
  }

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
          TOP HUD OVERLAY (3-COLUMN RESPONSIVE ARCHITECTURE)
          ========================================================================= */}
      <header className="pointer-events-none fixed top-0 inset-x-0 z-20 flex items-start justify-between gap-2 p-2 sm:p-3">
        {/* 1. Left: Hero Vitality Plate & Realm Region */}
        <div className="pointer-events-auto flex flex-col gap-1.5 max-w-[340px]">
          {/* Hero Banner Plate */}
          <div className="rpg-panel-brown flex items-center gap-2.5 p-2 backdrop-blur-md shadow-xl">
            {/* Class / Hero Emblem */}
            <div
              className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-amber-800/80 bg-stone-900/90 shadow-inner"
              title={`Equipped Tool: ${toolMeta.name}`}
            >
              <img src={getItemIcon(currentToolId)} alt={toolMeta.name} className="h-6 w-6 object-contain pixelated" />
              <span
                className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[9px] font-mono font-bold text-stone-950 border border-stone-900 shadow"
                title={`Level ${playerLevel} (${playerXp} XP)`}
              >
                {playerLevel}
              </span>
            </div>

            {/* Name, Gold, Health Bar */}
            <div className="flex flex-col flex-1 min-w-0">
              <div className="flex items-center justify-between text-xs leading-none mb-1">
                <div className="flex items-center gap-1.5 truncate">
                  <span className="font-serif font-bold text-amber-100 truncate text-[13px] drop-shadow">
                    {character?.characterName || 'Valen'}
                  </span>
                  <span className="text-[10px] text-amber-300/70 font-mono hidden sm:inline">
                    ({playerXp} XP)
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0 ml-1.5 font-mono text-[11px] font-bold text-yellow-300">
                  <img src={getItemIcon('gold-coin')} alt="Gold" className="h-3.5 w-3.5 object-contain pixelated" />
                  <span>{playerGold}g</span>
                </div>
              </div>

              {/* Health Bar with Numeric overlay */}
              <div className="flex items-center gap-1.5">
                <div className="relative h-3.5 flex-1 overflow-hidden rounded bg-black/80 border border-amber-900/70 p-[1px]">
                  <div
                    className="h-full rounded-sm bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round((playerHp / (playerMaxHp || 1)) * 100)))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[9px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
                    {playerHp}/{playerMaxHp}
                  </span>
                </div>

                {/* Quick Heal Potion Button */}
                <button
                  type="button"
                  onClick={handleQuickHeal}
                  className={`${
                    potionCount > 0 ? 'rpg-btn-beige' : 'rpg-btn-brown opacity-50 cursor-not-allowed'
                  } shrink-0 text-[10px] py-0.5 px-2 flex items-center gap-1 font-mono`}
                  title={potionCount > 0 ? `Drink Healing Elixir (+45 HP) [1] (${potionCount} in pack)` : 'No healing potions in pack'}
                >
                  <span>🧪</span>
                  <span>[1] {potionCount}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Region Badge */}
          <div className="rpg-panel-brown flex items-center gap-2 px-2.5 py-1 backdrop-blur-md self-start text-xs">
            <span className="text-base">{activeZoneMeta.icon}</span>
            <div className="leading-tight">
              <span className="block text-[8px] font-bold uppercase tracking-wider text-amber-400/90">
                {activeZoneMeta.kicker}
              </span>
              <span className="font-serif text-[11px] font-bold text-amber-100 drop-shadow">
                {activeZoneMeta.label}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Center: Realm Clock, Weather & Fast-Travel Bar */}
        <div className="pointer-events-auto hidden md:flex flex-col items-center gap-1.5">
          {/* Day/Night & Weather Pill */}
          <div className="rpg-panel-brown flex items-center gap-2 px-3 py-1 text-xs text-amber-200 backdrop-blur-md shadow-md">
            <span className="text-sm">
              {worldClock.timeOfDay === 'night' ? '🌙' : worldClock.timeOfDay === 'dusk' ? '🌅' : '☀️'}
            </span>
            <span className="font-mono text-xs font-bold text-amber-300">
              {String(worldClock.hour).padStart(2, '0')}:{String(worldClock.minute).padStart(2, '0')}
            </span>
            <span className="text-[10px] text-amber-300/60 border-l border-amber-800/60 pl-2">
              {worldClock.weather === 'rain' ? '🌧️ Rain' : worldClock.weather === 'thunderstorm' ? '⚡ Storm' : worldClock.weather === 'fog' ? '🌫️ Fog' : '☀️ Clear'}
            </span>
          </div>

          {/* Fast-Travel Highway Ribbon */}
          <div className="rpg-panel-brown flex items-center gap-1 p-1 backdrop-blur-md shadow-md">
            <span className="px-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-400">
              Travel:
            </span>
            {ZONES.map((zone) => {
              const isActive = currentZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSwitchZone(zone.id)}
                  className={`${isActive ? 'rpg-btn-beige active' : 'rpg-btn-brown'} text-[11px] py-0.5 px-2 flex items-center gap-1`}
                  title={`Fast-travel to ${zone.label}`}
                >
                  <span>{zone.icon}</span>
                  <span className="hidden lg:inline">{zone.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. Right: Single-Row Action Ribbon & Utilities */}
        <div className="pointer-events-auto flex items-center gap-1 sm:gap-1.5">
          {/* Action Modals Ribbon */}
          <div className="rpg-panel-brown flex items-center gap-1 p-1 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsInventoryOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Adventurer Pouch / Inventory [I]"
            >
              <span>🎒</span>
              <span className="hidden xl:inline ml-1 font-serif">Pouch</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsGuildOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Adventurers' Guild Board & Renown [G]"
            >
              <span>⚔️</span>
              <span className="hidden xl:inline ml-1 font-serif">Guild</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsForgeOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Artisan Forge & Smelter"
            >
              <span>⚒️</span>
              <span className="hidden xl:inline ml-1 font-serif">Forge</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsBazaarOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Merchant Bazaar & Seed Shop"
            >
              <span>🪙</span>
              <span className="hidden xl:inline ml-1 font-serif">Bazaar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsFishingOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Angler Fishing [F]"
            >
              <span>🎣</span>
              <span className="hidden xl:inline ml-1 font-serif">Fish</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsPetOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title={`Warden Companion Sanctuary (${equippedPetMeta.name}) [P]`}
            >
              <span>{equippedPetMeta.icon}</span>
              <span className="hidden xl:inline ml-1 font-serif">Pet</span>
            </button>

            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsWardrobeOpen(true);
              }}
              className="rpg-btn-brown text-xs py-1 px-2"
              title="Warden's Wardrobe Customizer [C]"
            >
              <span>🪞</span>
              <span className="hidden xl:inline ml-1 font-serif">Wardrobe</span>
            </button>
          </div>

          {/* Quick Utility Console */}
          <div className="rpg-panel-brown flex items-center gap-1 p-1 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsSaveOpen(true);
              }}
              className="rpg-btn-square-brown h-7 w-7 text-xs"
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
              className="rpg-btn-square-brown h-7 w-7 text-xs"
              title="Game Controls & Help [?]"
            >
              <span>❓</span>
            </button>

            <button
              type="button"
              onClick={toggleFullscreen}
              className="rpg-btn-square-brown h-7 w-7 text-xs"
              title="Toggle Borderless Fullscreen Mode [F11]"
            >
              <span>{isFullscreen ? '↙️' : '⛶'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          FIRST-TIME PLAYING MOVEMENT & CONTROLS TUTORIAL (SHOWN ONLY ON FIRST PLAY)
          ========================================================================= */}
      {showMovementTutorial && (
        <aside
          className="rpg-panel-brown pointer-events-auto fixed bottom-3 left-4 z-30 flex flex-col gap-2 p-3 shadow-2xl backdrop-blur-md max-w-xl animate-fadeIn border-2 border-amber-600/80"
          aria-label="First-time movement guide"
        >
          <div className="flex items-center justify-between border-b border-amber-900/50 pb-1.5 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-base">🧭</span>
              <span className="font-serif text-xs font-bold text-amber-100">
                Movement &amp; Controls Guide
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                dismissMovementTutorial();
              }}
              className="rpg-btn-beige text-[10px] py-0.5 px-2 font-bold font-serif"
              title="Dismiss guide (shown once on first play)"
            >
              Got It! ✕
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 text-[11px] font-mono text-amber-200">
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">WASD / ZQSD / Click</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Walk &amp; Pathfind</span>
            </div>
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">Shift (Hold)</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Sprint fast</span>
            </div>
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">Space / Click</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Attack foes</span>
            </div>
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">[E] / Click Prompt</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Interact &amp; Gather</span>
            </div>
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">[1] Quick Heal</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Drink potion (+45 HP)</span>
            </div>
            <div className="rpg-slot-inset p-1.5 bg-black/60 flex flex-col">
              <span className="text-yellow-400 font-bold font-mono">[M] Map · [I] Pouch</span>
              <span className="text-[10px] text-amber-100/80 font-serif">Atlas &amp; Inventory</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-[9px] text-amber-300/70 pt-0.5">
            <span>Shown only on your first play</span>
            <span>Click [❓] anytime for full guide</span>
          </div>
        </aside>
      )}

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
        onResetMovementTutorial={resetMovementTutorial}
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
