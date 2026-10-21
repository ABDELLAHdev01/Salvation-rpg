import React, { useEffect, useRef, useState } from 'react';
import Phaser from 'phaser';
import WorldScene from './scenes/WorldScene';
import gameEventBridge, { gameEvents } from './gameEventBridge';
import { farmCrops } from '../data/farmData';
import { addItems, removeItems } from '../services/inventoryService';
import characterService from '../services/CharacterService';
import toast from 'react-hot-toast';
import audioManager from '../audio/AudioManager';
import { recordContractProgress } from '../quests/guildContracts';

const ZONE_TITLES = {
  homestead: 'Sunforge Homestead & Manor',
  west_road: "Sunforge West Road & King's Highway",
  village: "Sunforge City Plaza & Adventurers' Guild",
  forest: 'The Whispering Enchanted Forest',
  mine: 'Deepforge Caverns & Seams',
};

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

    const progress = recordContractProgress('farm:harvest', { cropId: plot.cropId }, prof.activeContracts || []);

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      farmPlots: nextPlots,
      farmXp: nextXp,
      ...(progress.updated ? { activeContracts: progress.activeContracts } : {}),
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

    const progress = recordContractProgress('mine:shatter', { oreId: ore.type }, prof.activeContracts || []);

    const updated = characterService.updateMockProfile({
      inventory: nextInventory,
      miningXp: nextXp,
      ...(progress.updated ? { activeContracts: progress.activeContracts } : {}),
    });

    onProfileUpdateRef.current(updated);
    toast.success(`Mined ${yieldAmount} ${ore.name}! (+${xpGain} Mining XP)`);
  };

  // Initialize Phaser Game instance
  useEffect(() => {
    if (!containerRef.current) return;

    const w = window.innerWidth || 1280;
    const h = window.innerHeight || 800;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: w,
      height: h,
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
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
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
      if (gameRef.current) {
        gameRef.current.scale.resize(window.innerWidth, window.innerHeight);
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
        const prof = profileRef.current;
        if (prof) {
          const currentDiscovered = new Set(prof.discoveredRegions || ['homestead']);
          const isNew = !currentDiscovered.has(zone);
          currentDiscovered.add(zone);

          const progress = recordContractProgress('zone:changed', { zone }, prof.activeContracts || []);
          if (isNew || progress.updated) {
            const updated = characterService.updateMockProfile({
              discoveredRegions: Array.from(currentDiscovered),
              ...(progress.updated ? { activeContracts: progress.activeContracts } : {}),
            });
            onProfileUpdateRef.current(updated);
            if (isNew) {
              toast.success(`Discovered New Realm: ${ZONE_TITLES[zone] || zone}!`, { icon: '🗺️' });
            }
          }
        }
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
      gameEventBridge.on(gameEvents.FISH_CAUGHT, ({ fish }) => {
        const prof = profileRef.current;
        if (!prof) return;
        const progress = recordContractProgress('fish:caught', { fishId: fish?.id }, prof.activeContracts || []);
        if (progress.updated) {
          const updated = characterService.updateMockProfile({
            activeContracts: progress.activeContracts,
          });
          onProfileUpdateRef.current(updated);
        }
      }),
      gameEventBridge.on(gameEvents.CHEST_OPEN, () => {
        const prof = profileRef.current;
        if (prof) {
          const progress = recordContractProgress('chest:open', {}, prof.activeContracts || []);
          if (progress.updated) {
            const updated = characterService.updateMockProfile({
              activeContracts: progress.activeContracts,
            });
            onProfileUpdateRef.current(updated);
          }
        }
        gameEventBridge.emit('OPEN_IN_GAME_INVENTORY');
      }),
      gameEventBridge.on(gameEvents.WORKBENCH_OPEN, () => {
        gameEventBridge.emit('OPEN_IN_GAME_FORGE');
      }),
      gameEventBridge.on(gameEvents.NPC_TALK, () => {
        gameEventBridge.emit('OPEN_IN_GAME_BAZAAR');
      }),
      gameEventBridge.on(gameEvents.PROP_INTERACT, ({ propId }) => {
        const prof = profileRef.current;
        if (!prof) return;
        const progress = recordContractProgress('prop:interacted', { propId }, prof.activeContracts || []);
        if (progress.updated) {
          const updated = characterService.updateMockProfile({
            activeContracts: progress.activeContracts,
          });
          onProfileUpdateRef.current(updated);
          toast.success('Guild Discovery Recorded!', { icon: '📜' });
        }
      }),
      gameEventBridge.on(gameEvents.GUILD_VISITED, () => {
        const prof = profileRef.current;
        if (!prof) return;
        const progress = recordContractProgress('guild:visited', {}, prof.activeContracts || []);
        if (progress.updated) {
          const updated = characterService.updateMockProfile({
            activeContracts: progress.activeContracts,
          });
          onProfileUpdateRef.current(updated);
        }
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

        const progress = recordContractProgress(
          'combat:enemy_defeated',
          { enemyType: monster.texture },
          prof.activeContracts || []
        );

        const updated = characterService.updateMockProfile({
          inventory: nextInventory,
          stats: {
            ...prof.stats,
            gold: nextGold,
            xp: nextXp,
            victories: (prof.stats?.victories || 0) + 1,
          },
          ...(progress.updated ? { activeContracts: progress.activeContracts } : {}),
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

  return (
    <div className={`relative w-full h-full overflow-hidden bg-gray-950 select-none ${className}`}>
      {/* Phaser Canvas Host Container */}
      <div
        ref={containerRef}
        tabIndex={0}
        className="absolute inset-0 w-full h-full overflow-hidden outline-none"
        onClick={() => {
          if (gameRef.current?.canvas) {
            gameRef.current.canvas.focus();
          }
        }}
      />



      {/* Floating In-World Contextual Interaction Prompt */}
      {activePrompt && (
        <button
          type="button"
          onClick={() => {
            gameEventBridge.emit('TRIGGER_ACTIVE_PROMPT');
          }}
          className="rpg-btn-beige absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2.5 px-5 py-2 shadow-2xl animate-bounce cursor-pointer text-xs sm:text-sm font-serif font-bold text-amber-950"
        >
          <span className="text-base text-amber-700 font-black">⚡</span>
          <span>{activePrompt}</span>
        </button>
      )}

      {/* Seed Selection Modal (When clicking empty plot) */}
      {activePlotModal && (
        <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="rpg-panel-brown w-full max-w-md p-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-amber-900/50 pb-3">
              <h3 className="font-serif text-base font-bold text-amber-100 drop-shadow">
                Plant Seeds in Soil Plot
              </h3>
              <button
                type="button"
                onClick={() => {
                  setActivePlotModal(null);
                  gameEventBridge.emit(gameEvents.UNLOCK_CONTROLS);
                }}
                className="rpg-btn-square-brown h-7 w-7 text-xs font-bold text-amber-200"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-2.5">
              {farmCrops.map((crop) => (
                <div
                  key={crop.id}
                  className="rpg-slot-inset flex items-center justify-between p-2.5 text-xs bg-black/40"
                >
                  <div>
                    <p className="font-bold text-amber-100">{crop.name}</p>
                    <p className="text-[11px] text-amber-300/70">
                      Seed Cost: {crop.seedCost}g · Grow Time: {Math.round(crop.growMs / 60000)}m
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handlePlantSeed(crop.id)}
                    className="rpg-btn-beige text-xs py-1 px-3"
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
