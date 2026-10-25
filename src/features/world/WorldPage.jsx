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
import { recordContractProgress, claimContractReward } from '../../core/quests/guildContracts';
import WorldMinimap from './components/WorldMinimap';
import BeginnerTutorialStepper from './components/BeginnerTutorialStepper';

const ZONES = [
  { id: 'homestead', label: 'Homestead', icon: '🏡', kicker: 'Sunforge Estate' },
  { id: 'homestead_interior', label: 'Cottage Home', icon: '🛋️', kicker: 'Homestead Manor' },
  { id: 'west_road', label: 'West Road', icon: '🛣️', kicker: "King's Highway" },
  { id: 'village', label: 'Sunforge City', icon: '🏛️', kicker: "Adventurers' Plaza" },
  { id: 'forest', label: 'Whispering Forest', icon: '🌲', kicker: 'Enchanted Grove' },
  { id: 'mine', label: 'Deep Caverns', icon: '⛏️', kicker: 'Deepforge Seams' },
];

export default function WorldPage() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentZone, setCurrentZone] = useState(() => {
    try {
      const isDone = localStorage.getItem('wardenTutorialCompleted') === 'true';
      return isDone ? 'homestead' : 'tutorial_island';
    } catch {
      return 'homestead';
    }
  });
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

  // First-time player interactive beginner tutorial stepper state
  const [tutorialStep, setTutorialStep] = useState(() => {
    try {
      const saved = localStorage.getItem('wardenTutorialStep');
      return saved !== null ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });

  const [isTutorialCompleted, setIsTutorialCompleted] = useState(() => {
    try {
      return localStorage.getItem('wardenTutorialCompleted') === 'true';
    } catch {
      return false;
    }
  });

  const [isTutorialCollapsed, setIsTutorialCollapsed] = useState(false);

  const [isTutorialHidden, setIsTutorialHidden] = useState(() => {
    try {
      return localStorage.getItem('wardenTutorialHidden') === 'true';
    } catch {
      return false;
    }
  });

  const dismissMovementTutorial = useCallback(() => {
    setIsTutorialHidden(true);
    try {
      localStorage.setItem('wardenTutorialHidden', 'true');
      localStorage.setItem('wardenTutorialCompleted', 'true');
    } catch {
      // ignore
    }
    if (currentZone === 'tutorial_island') {
      setCurrentZone('homestead');
      gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: 'homestead' });
      toast.success('Tutorial skipped! Sailing across to Sunforge Homestead...', { icon: '⛵' });
    }
  }, [currentZone]);

  const resetMovementTutorial = useCallback(() => {
    setTutorialStep(0);
    setIsTutorialCompleted(false);
    setIsTutorialHidden(false);
    setIsTutorialCollapsed(false);
    try {
      localStorage.removeItem('wardenTutorialStep');
      localStorage.removeItem('wardenTutorialCompleted');
      localStorage.removeItem('wardenTutorialHidden');
    } catch {
      // ignore
    }
    setCurrentZone('tutorial_island');
    gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: 'tutorial_island' });
    toast('Warden Journey Stepper restarted at Isle of Beginnings!', { icon: '📜' });
  }, []);

  const handleClaimTutorialReward = useCallback(() => {
    audioManager.play('levelup');
    setProfile((prev) => {
      if (!prev) return prev;
      const currentStats = prev.stats || { level: 1, xp: 0, power: 120, gold: 350 };
      const updated = {
        ...prev,
        stats: {
          ...currentStats,
          gold: (currentStats.gold || 0) + 50,
          xp: (currentStats.xp || 0) + 50,
        },
      };
      try {
        const username = authService.getCurrentUsername() || 'offline-hero';
        const profiles = JSON.parse(localStorage.getItem('mockProfiles') || '{}');
        profiles[username] = updated;
        localStorage.setItem('mockProfiles', JSON.stringify(profiles));
      } catch {
        // ignore
      }
      return updated;
    });
    toast.success('🎉 +50 Gold & +50 XP Awarded! Apprentice Warden Badge Acquired!', {
      duration: 5000,
      icon: '🏆',
    });
    setIsTutorialHidden(true);
    try {
      localStorage.setItem('wardenTutorialHidden', 'true');
      localStorage.setItem('wardenTutorialCompleted', 'true');
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

  // Unified Guild Contract & In-Game Progression Tracker
  const dispatchContractEvent = useCallback((eventType, payload) => {
    setProfile((prev) => {
      if (!prev) return prev;
      const { updated, activeContracts, autoCompleted } = recordContractProgress(
        eventType,
        payload,
        prev.activeContracts || []
      );
      if (!updated) return prev;

      const nextProfile = { ...prev, activeContracts };

      if (autoCompleted && autoCompleted.length > 0) {
        autoCompleted.forEach((cid) => {
          const claimRes = claimContractReward(cid, nextProfile);
          if (claimRes.success) {
            toast.success(`Completed: ${claimRes.contract.title}! +${claimRes.rewardsGranted.renown} Renown`, { icon: '⭐' });
            Object.assign(nextProfile, claimRes.updatedProfile);
          }
        });
      }

      characterService.saveMockProfile(prev.username || 'offline-hero', nextProfile);
      return nextProfile;
    });
  }, []);

  // Listen to zone changes and in-game modal triggers from Phaser
  useEffect(() => {
    const cleanups = [
      gameEventBridge.on(gameEvents.ZONE_CHANGED, ({ zone }) => {
        setCurrentZone(zone);
        dispatchContractEvent('zone:changed', { zone });
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
        dispatchContractEvent('guild:visited', {});
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
      gameEventBridge.on(gameEvents.COMBAT_ENEMY_DEFEATED, (payload) => {
        dispatchContractEvent('combat:enemy_defeated', {
          enemyType: payload?.enemyType || payload?.monster?.id,
          enemyTexture: payload?.monster?.texture,
        });
        if (payload?.loot) {
          setProfile((prev) => {
            if (!prev) return prev;
            const nextProfile = {
              ...prev,
              gold: (prev.gold || 0) + (payload.loot.gold || 0),
              inventory: { ...(prev.inventory || {}) },
            };
            if (Array.isArray(payload.loot.items)) {
              payload.loot.items.forEach((item) => {
                const count = nextProfile.inventory[item.itemId] || 0;
                nextProfile.inventory[item.itemId] = count + item.amount;
              });
            }
            characterService.saveMockProfile(prev.username || 'offline-hero', nextProfile);
            return nextProfile;
          });
        }
      }),
      gameEventBridge.on(gameEvents.CHEST_OPEN, () => {
        setIsInventoryOpen(true);
        dispatchContractEvent('chest:open', {});
      }),
      gameEventBridge.on(gameEvents.GUILD_VISITED, () => {
        dispatchContractEvent('guild:visited', {});
      }),
      gameEventBridge.on(gameEvents.PROP_INTERACT, (payload) => {
        dispatchContractEvent('prop:interacted', payload);
      }),
      gameEventBridge.on('farm:harvest', (payload) => {
        dispatchContractEvent('farm:harvest', payload);
      }),
      gameEventBridge.on('mine:shatter', (payload) => {
        dispatchContractEvent('mine:shatter', payload);
      }),
      gameEventBridge.on('forge:crafted', (payload) => {
        dispatchContractEvent('forge:crafted', payload);
      }),
      gameEventBridge.on('fish:caught', (payload) => {
        dispatchContractEvent('fish:caught', payload);
      }),
      gameEventBridge.on('LOOT_ACQUIRED', ({ itemId, amount = 1 }) => {
        if (!itemId) return;
        setProfile((prev) => {
          if (!prev) return prev;
          const currentCount = prev.inventory?.[itemId] || 0;
          const nextProfile = {
            ...prev,
            inventory: {
              ...(prev.inventory || {}),
              [itemId]: currentCount + amount,
            },
          };
          characterService.saveMockProfile(prev.username || 'offline-hero', nextProfile);
          return nextProfile;
        });
      }),
      gameEventBridge.on('RESTED_IN_BED', () => {
        toast.success('Rested comfortably in bed! Health fully restored.', { icon: '🛏️' });
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

  // Interactive Beginner Tutorial Stepper step progressions
  // Step 1 -> Step 2: First Steps (Movement)
  useEffect(() => {
    if (tutorialStep !== 0 || isTutorialCompleted || isTutorialHidden) return;
    const unsub = gameEventBridge.on(gameEvents.PLAYER_MOVED, () => {
      setTutorialStep(1);
      try {
        localStorage.setItem('wardenTutorialStep', '1');
      } catch {
        // ignore
      }
      if (currentZone === 'tutorial_island') {
        toast('First steps on the Isle! Walk over to the Castaway Supply Chest [E]', { icon: '📦' });
      } else {
        toast('First steps taken! Walk up to your Manor House front door [E]', { icon: '🏡' });
      }
    });
    return () => unsub();
  }, [tutorialStep, isTutorialCompleted, isTutorialHidden, currentZone]);

  // Island Tutorial Direct Step Advancements from WorldScene
  useEffect(() => {
    const unsubAdv = gameEventBridge.on('TUTORIAL_STEP_ADVANCE', ({ step }) => {
      setTutorialStep(step);
      try {
        localStorage.setItem('wardenTutorialStep', String(step));
      } catch {
        // ignore
      }
      if (step === 2) {
        toast('Gear salvaged! Walk north into the grove to forage Sunberries from the Fruit Tree [E]', { icon: '🍎' });
      } else if (step === 3) {
        toast('Sunberries harvested! Approach the training slime and attack with [Space] or Left Click', { icon: '⚔️' });
      } else if (step === 4) {
        toast('Trial of combat complete! Walk south to the pier and board the Sloop [E]', { icon: '⛵' });
      }
    });

    const unsubLeave = gameEventBridge.on('TUTORIAL_COMPLETED_LEAVE_ISLAND', () => {
      setIsTutorialCompleted(true);
      setIsTutorialHidden(true);
      try {
        localStorage.setItem('wardenTutorialCompleted', 'true');
        localStorage.setItem('wardenTutorialHidden', 'true');
        localStorage.setItem('wardenTutorialStep', '5');
      } catch {
        // ignore
      }
      toast.success('🎉 Tutorial Voyage Completed! Arriving at Sunforge Homestead...', { icon: '🏆', duration: 5000 });
      setCurrentZone('homestead');
    });

    return () => {
      unsubAdv();
      unsubLeave();
    };
  }, []);

  // Step 2 -> Step 3: Enter Homestead Cottage
  useEffect(() => {
    if (tutorialStep !== 1 || isTutorialCompleted || isTutorialHidden) return;
    if (currentZone === 'homestead_interior') {
      setTutorialStep(2);
      try {
        localStorage.setItem('wardenTutorialStep', '2');
      } catch {
        // ignore
      }
      toast('Welcome inside Cottage! Sleep in the cozy bed to restore full HP [E]', { icon: '🛏️' });
    }
  }, [currentZone, tutorialStep, isTutorialCompleted, isTutorialHidden]);

  // Step 3 -> Step 4: Rest in Bed
  useEffect(() => {
    if (tutorialStep !== 2 || isTutorialCompleted || isTutorialHidden) return;
    const unsub = gameEventBridge.on('RESTED_IN_BED', () => {
      setTutorialStep(3);
      try {
        localStorage.setItem('wardenTutorialStep', '3');
      } catch {
        // ignore
      }
      toast('Full vitality restored! Press [I] to inspect your Adventurer Pouch', { icon: '🎒' });
    });
    return () => unsub();
  }, [tutorialStep, isTutorialCompleted, isTutorialHidden]);

  // Step 4 -> Step 5: Open Adventurer Pouch
  useEffect(() => {
    if (tutorialStep !== 3 || isTutorialCompleted || isTutorialHidden) return;
    if (isInventoryOpen) {
      setTutorialStep(4);
      try {
        localStorage.setItem('wardenTutorialStep', '4');
      } catch {
        // ignore
      }
      toast('Pouch inspected! Check the World Atlas [M] or Minimap in the corner', { icon: '🗺️' });
    }
  }, [isInventoryOpen, tutorialStep, isTutorialCompleted, isTutorialHidden]);

  // Step 5: Open World Atlas (Completes Tutorial)
  useEffect(() => {
    if (tutorialStep !== 4 || isTutorialCompleted || isTutorialHidden) return;
    const unsub = gameEventBridge.on('WORLD_ATLAS_OPENED', () => {
      setTutorialStep(5);
      setIsTutorialCompleted(true);
      try {
        localStorage.setItem('wardenTutorialStep', '5');
        localStorage.setItem('wardenTutorialCompleted', 'true');
      } catch {
        // ignore
      }
      toast.success('🏆 All 5 Tutorial Steps Completed! Claim your reward in the guide!', { icon: '✨' });
    });
    return () => unsub();
  }, [tutorialStep, isTutorialCompleted, isTutorialHidden]);

  const handleReturnHome = () => {
    if (currentZone === 'tutorial_island') {
      toast('Board the sloop at the southern pier to set sail for Homestead!', { icon: '⛵' });
      return;
    }
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

  const activeZoneMeta = ZONES.find((z) => z.id === currentZone) || (
    currentZone === 'tutorial_island'
      ? { id: 'tutorial_island', label: 'Isle of Beginnings', icon: '🏝️', kicker: 'Tutorial Haven' }
      : ZONES[0]
  );
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
        <div className="pointer-events-auto flex flex-col gap-1.5 w-72 sm:w-80">
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
                <div className="relative h-4 flex-1 min-w-[100px] overflow-hidden rounded bg-black/80 border border-amber-900/70 p-[1px]">
                  <div
                    className="h-full rounded-sm bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-300 shadow-sm"
                    style={{ width: `${Math.max(0, Math.min(100, Math.round((playerHp / (playerMaxHp || 1)) * 100)))}%` }}
                  />
                  <span className="absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.9)]">
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
            {currentZone === 'tutorial_island' ? (
              <div className="flex items-center gap-2 px-2 py-0.5">
                <span className="text-[11px] font-serif font-bold text-amber-200 flex items-center gap-1.5">
                  <span>🏝️</span>
                  <span>Isle of Beginnings · Tutorial Haven</span>
                </span>
                <span className="text-[10px] text-amber-400/80 italic hidden lg:inline">
                  (Isolated Isle — Board the departure sloop to reach Homestead)
                </span>
              </div>
            ) : (
              <>
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
              </>
            )}
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
          INTERACTIVE BEGINNER WARDEN AWAKENING TUTORIAL STEPPER
          ========================================================================= */}
      {!isTutorialHidden && (
        <BeginnerTutorialStepper
          currentZone={currentZone}
          currentStep={tutorialStep}
          isCompleted={isTutorialCompleted}
          isCollapsed={isTutorialCollapsed}
          onToggleCollapse={() => setIsTutorialCollapsed((prev) => !prev)}
          onDismiss={dismissMovementTutorial}
          onClaimReward={handleClaimTutorialReward}
          onOpenPouch={() => setIsInventoryOpen(true)}
          onOpenAtlas={() => gameEventBridge.emit('OPEN_IN_GAME_ATLAS')}
        />
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
