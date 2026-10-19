import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import WorldScene from './scenes/WorldScene';
import gameEventBridge, { gameEvents } from './gameEventBridge';
import { farmCrops } from '../data/farmData';
import { addItems, removeItems } from '../services/inventoryService';
import characterService from '../services/CharacterService';
import toast from 'react-hot-toast';
import audioManager from '../audio/AudioManager';

export default function PhaserWorldCanvas({
  customization = null,
  profile = null,
  onProfileUpdate = () => {},
  initialZone = 'homestead',
  className = '',
}) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const [activePrompt, setActivePrompt] = useState(null);
  const [currentZone, setCurrentZone] = useState(initialZone);
  const [activePlotModal, setActivePlotModal] = useState(null);

  const [playerHp, setPlayerHp] = useState(100);
  const [playerMaxHp, setPlayerMaxHp] = useState(100);

  const profileRef = useRef(profile);
  const onProfileUpdateRef = useRef(onProfileUpdate);
  const currentZoneRef = useRef(currentZone);
  const customizationRef = useRef(customization);
  const initialZoneRef = useRef(initialZone);
  const playerHpRef = useRef(playerHp);
  const playerMaxHpRef = useRef(playerMaxHp);
  const handleUsePotionRef = useRef(null);

  useEffect(() => {
    playerHpRef.current = playerHp;
  }, [playerHp]);

  useEffect(() => {
    playerMaxHpRef.current = playerMaxHp;
  }, [playerMaxHp]);

  useEffect(() => {
    profileRef.current = profile;
    if (profile?.stats?.level) {
      const max = 100 + (profile.stats.level - 1) * 15;
      setPlayerMaxHp(max);
      setPlayerHp((prev) => Math.min(prev, max));
    }
  }, [profile]);

  useEffect(() => {
    onProfileUpdateRef.current = onProfileUpdate;
  }, [onProfileUpdate]);

  useEffect(() => {
    currentZoneRef.current = currentZone;
  }, [currentZone]);

  useEffect(() => {
    customizationRef.current = customization;
    if (gameRef.current && customization) {
      gameEventBridge.emit(gameEvents.REFRESH_CUSTOMIZATION, { customization });
    }
  }, [customization]);

  // Handle in-world crop harvesting
  const handleHarvestCrop = (plot) => {
    const prof = profileRef.current;
    if (!prof) return;
    const crop = farmCrops.find((c) => c.id === plot.cropId);
    if (!crop) return;

    const yieldAmount = crop.yieldAmount || 3;
    const nextInventory = addItems(prof.inventory || {}, { [crop.yieldId]: yieldAmount });
    const nextPlots = (prof.farmPlots || []).map((p) =>
      p.id === plot.id ? { ...p, cropId: null, plantedAt: 0 } : p
    );
    const xpGain = 25;
    const nextXp = (prof.farmXp || 0) + xpGain;

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      farmPlots: nextPlots,
      farmXp: nextXp,
    });

    onProfileUpdateRef.current(updated);
    audioManager.play('harvest');
    toast.success(`Harvested ${yieldAmount} ${crop.name}! (+${xpGain} Farm XP)`);

    // Reload zone to refresh plots
    gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: currentZoneRef.current });
  };

  // Handle in-world mining node impact
  const handleMineNode = (ore) => {
    const prof = profileRef.current;
    if (!prof) return;
    const yieldAmount = 3;
    const nextInventory = addItems(prof.inventory || {}, { [ore.type]: yieldAmount });
    const xpGain = 20;
    const nextXp = (prof.miningXp || 0) + xpGain;

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningXp: nextXp,
    });

    onProfileUpdateRef.current(updated);
    toast.success(`Mined ${yieldAmount} ${ore.name}! (+${xpGain} Mining XP)`);
  };

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!containerRef.current) return;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: containerRef.current.clientWidth || 960,
      height: 600,
      backgroundColor: '#265c2b',
      pixelArt: true,
      input: {
        keyboard: true,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 0 },
          debug: false,
        },
      },
    };

    const game = new Phaser.Game(config);
    gameRef.current = game;

    // Cleanly add and start WorldScene with initial payload
    game.scene.add('WorldScene', WorldScene, true, {
      customization: customizationRef.current,
      profile: profileRef.current,
      zone: initialZoneRef.current,
    });

    const handleResize = () => {
      if (gameRef.current && containerRef.current) {
        const w = containerRef.current.clientWidth;
        gameRef.current.scale.resize(w, 600);
      }
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  // Listen for Game Events from Phaser
  useEffect(() => {
    const cleanups = [
      gameEventBridge.on(gameEvents.INTERACTION_AVAILABLE, ({ prompt }) => {
        setActivePrompt(prompt);
      }),
      gameEventBridge.on(gameEvents.INTERACTION_CLEARED, () => {
        setActivePrompt(null);
      }),
      gameEventBridge.on(gameEvents.ZONE_CHANGED, ({ zone }) => {
        setCurrentZone(zone);
      }),
      gameEventBridge.on(gameEvents.FARM_PLOT_INTERACT, ({ plot, isMature }) => {
        if (isMature) {
          handleHarvestCrop(plot);
        } else if (!plot.cropId) {
          setActivePlotModal(plot);
          gameEventBridge.emit(gameEvents.LOCK_CONTROLS);
        } else {
          toast(`Crop is still maturing. Water and sun are working!`, { icon: '🌱' });
        }
      }),
      gameEventBridge.on(gameEvents.MINE_NODE_INTERACT, ({ ore }) => {
        handleMineNode(ore);
      }),
      gameEventBridge.on(gameEvents.CHEST_OPEN, () => {
        toast('Vault Pouch: Check top HUD for pouch inventory items.', { icon: '🎒' });
      }),
      gameEventBridge.on(gameEvents.WORKBENCH_OPEN, () => {
        toast('Crafting Forge: Visit the Artisan Workshop to smelt refined bars!', { icon: '⚒️' });
      }),
      gameEventBridge.on(gameEvents.NPC_TALK, ({ stall }) => {
        toast(`Visiting ${stall.name}: Open Bazaar from Quick Access to trade wares.`, { icon: '🪙' });
      }),
      gameEventBridge.on(gameEvents.COMBAT_PLAYER_DAMAGED, ({ hp, maxHp }) => {
        setPlayerHp(hp);
        setPlayerMaxHp(maxHp);
      }),
      gameEventBridge.on(gameEvents.COMBAT_PLAYER_HEAL, ({ hp, maxHp }) => {
        setPlayerHp(hp);
        setPlayerMaxHp(maxHp);
      }),
      gameEventBridge.on(gameEvents.USE_HEALING_POTION, () => {
        if (handleUsePotionRef.current) handleUsePotionRef.current();
      }),
      gameEventBridge.on(gameEvents.COMBAT_PLAYER_DIED, () => {
        toast.error('Warden Fallen in combat! Awakening at Sunforge Homestead...', { icon: '💀' });
      }),
      gameEventBridge.on(gameEvents.COMBAT_ENEMY_DEFEATED, ({ monster, loot }) => {
        const prof = profileRef.current;
        if (!prof) return;

        let nextInventory = { ...(prof.inventory || {}) };
        if (loot.items && loot.items.length) {
          const itemMap = loot.items.reduce((acc, it) => {
            acc[it.id] = (acc[it.id] || 0) + it.amount;
            return acc;
          }, {});
          nextInventory = addItems(nextInventory, itemMap);
        }

        const nextGold = (prof.stats?.gold || 0) + (loot.gold || 0);
        const nextXp = (prof.stats?.xp || 0) + (loot.xp || 0);

        const updated = characterService.updateMockProfile({
          inventory: nextInventory,
          stats: {
            ...prof.stats,
            gold: nextGold,
            xp: nextXp,
            victories: (prof.stats?.victories || 0) + 1,
          },
        });

        onProfileUpdateRef.current(updated);
        toast.success(`Defeated ${monster.name}! (+${loot.gold}g, +${loot.xp} XP)`, { icon: '⚔️' });
      }),
    ];

    return () => cleanups.forEach((c) => c());
  }, []);

  // Handle potion consumption from inventory
  const handleUsePotion = () => {
    const prof = profileRef.current;
    if (!prof) return;

    if (playerHpRef.current >= playerMaxHpRef.current) {
      toast('Health is already full!', { icon: '💚' });
      return;
    }

    const potionCount = prof.inventory?.['health-potion'] || 0;
    if (potionCount <= 0) {
      toast.error('No Healing Elixirs left! Visit Bazaar or craft in Workshop.', { icon: '🧪' });
      return;
    }

    const nextInventory = removeItems(prof.inventory, { 'health-potion': 1 });
    const updated = characterService.updateMockProfile({ inventory: nextInventory });
    onProfileUpdateRef.current(updated);
    gameEventBridge.emit(gameEvents.EXECUTE_PLAYER_HEAL);
    toast.success(`Consumed Healing Elixir! (+45 HP, ${potionCount - 1} remaining)`, { icon: '🧪' });
  };
  handleUsePotionRef.current = handleUsePotion;

  // Handle in-world planting
  const handlePlantSeed = (cropId) => {
    const prof = profileRef.current;
    if (!prof || !activePlotModal) return;
    const crop = farmCrops.find((c) => c.id === cropId);
    if (!crop) return;

    const seedId = `seeds_${cropId}`;
    const ownedSeeds = prof.inventory?.[seedId] || 0;
    const seedCost = crop.seedCost || 10;
    const gold = prof.stats?.gold || 0;

    let nextInventory = { ...prof.inventory };
    let nextGold = gold;

    if (ownedSeeds > 0) {
      nextInventory = removeItems(prof.inventory, { [seedId]: 1 });
    } else if (gold >= seedCost) {
      nextGold = gold - seedCost;
    } else {
      toast.error(`Not enough gold for seeds (${seedCost}g).`);
      return;
    }

    const nextPlots = (prof.farmPlots || []).map((p) =>
      p.id === activePlotModal.id ? { ...p, cropId, plantedAt: Date.now() } : p
    );

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      farmPlots: nextPlots,
      stats: { ...prof.stats, gold: nextGold },
    });

    onProfileUpdateRef.current(updated);
    setActivePlotModal(null);
    gameEventBridge.emit(gameEvents.UNLOCK_CONTROLS);
    audioManager.play('tap');
    toast.success(`Planted ${crop.name}!`);

    // Reload zone to refresh plots
    gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: currentZoneRef.current });
  };

  const zoneTitles = {
    homestead: "Sunforge Homestead & Manor",
    mine: "Deepforge Caverns & Seams",
    forest: "The Whispering Enchanted Forest",
    village: "Imperial Merchant Bazaar Square",
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-700/50 bg-gray-950 shadow-2xl select-none ${className}`}>
      {/* Phaser Canvas Host Container */}
      <div ref={containerRef} className="relative w-full h-[600px] overflow-hidden" />

      {/* Zone Title Header Ribbon */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 rounded-2xl border border-yellow-600/40 bg-gray-950/85 px-4 py-2 shadow-xl backdrop-blur">
        <span className="text-base">🗺️</span>
        <div>
          <span className="block text-[9px] font-bold uppercase tracking-wider text-yellow-400/80">
            Current Region
          </span>
          <span className="font-serif text-xs font-bold text-white sm:text-sm">
            {zoneTitles[currentZone] || currentZone}
          </span>
        </div>
      </div>

      {/* Real-Time Player Health & Potion Bar */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 rounded-2xl border border-red-900/40 bg-gray-950/85 px-3.5 py-1.5 shadow-xl backdrop-blur">
        <span className="text-base">❤️</span>
        <div className="flex flex-col">
          <div className="flex items-center justify-between text-[10px] font-mono leading-none mb-1 text-gray-300">
            <span className="font-bold text-red-400">HEALTH</span>
            <span className="font-bold text-white ml-2">{playerHp}/{playerMaxHp}</span>
          </div>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-black/70 sm:w-32">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-600 via-amber-500 to-emerald-500 transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(100, Math.round((playerHp / (playerMaxHp || 1)) * 100)))}%` }}
            />
          </div>
        </div>

        {(() => {
          const potionCount = profile?.inventory?.['health-potion'] || 0;
          return (
            <button
              type="button"
              onClick={handleUsePotion}
              className={`flex items-center gap-1 rounded-xl border px-2 py-1 text-[11px] font-bold transition active:scale-95 ml-1 ${
                potionCount > 0
                  ? 'border-emerald-600/40 bg-emerald-950/70 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900'
                  : 'border-gray-800 bg-gray-900/60 text-gray-500 opacity-70'
              }`}
              title={potionCount > 0 ? `Drink Healing Elixir (+45 HP) [Q] (${potionCount} in pack)` : 'No healing potions in pack'}
            >
              <span>🧪</span>
              <span className="hidden sm:inline">[Q] Heal ({potionCount})</span>
            </button>
          );
        })()}
      </div>

      {/* Controls Quick Guide */}
      <div className="absolute top-4 right-4 z-20 hidden md:flex items-center gap-2 rounded-2xl border border-yellow-700/30 bg-gray-950/80 px-3 py-1.5 text-[11px] font-mono text-gray-300 backdrop-blur">
        <span className="text-yellow-400 font-bold">WASD</span> Move ·
        <span className="text-yellow-400 font-bold">Shift</span> Sprint ·
        <span className="text-yellow-400 font-bold">Space / Click</span> Attack ·
        <span className="text-yellow-400 font-bold">[E]</span> Interact
      </div>

      {/* Floating In-World Contextual Interaction Prompt */}
      {activePrompt && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 rounded-full border-2 border-yellow-400 bg-gray-950/95 px-6 py-2.5 shadow-2xl shadow-yellow-950/60 backdrop-blur animate-bounce cursor-pointer">
          <span className="text-base text-yellow-400 font-black">⚡</span>
          <span className="font-serif text-xs font-bold text-yellow-300 sm:text-sm">
            {activePrompt}
          </span>
        </div>
      )}

      {/* Seed Selection Modal (When clicking empty plot) */}
      {activePlotModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl border-2 border-yellow-600/60 bg-gray-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-serif text-base font-bold text-yellow-300">
                Plant Seeds in Soil Plot
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActivePlotModal(null);
                  gameEventBridge.emit(gameEvents.UNLOCK_CONTROLS);
                }}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-2.5">
              {farmCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="flex items-center justify-between rounded-xl border border-yellow-700/30 bg-gray-900/60 p-3 text-xs hover:border-yellow-500/50 transition"
                >
                  <div>
                    <p className="font-bold text-white">{crop.name}</p>
                    <p className="text-[11px] text-gray-400">
                      Seed Cost: {crop.seedCost}g · Grow Time: {Math.round(crop.growMs / 60000)}m
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlantSeed(crop.id)}
                    className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-bold text-gray-950 hover:brightness-110 shadow"
                  >
                    Plant
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
