import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import authService from '../../core/services/AuthService';
import characterService from '../../core/services/CharacterService';
import PhaserWorldCanvas from '../../core/phaser/PhaserWorldCanvas';
import WorldHUD from '../../core/world/WorldHUD';
import gameEventBridge, { gameEvents } from '../../core/phaser/gameEventBridge';
import { getItemById } from '../../core/data/itemsCatalog';
import { getPlayerXpForLevel } from '../../core/data/playerData';
import audioManager from '../../core/audio/AudioManager';
import { EQUIPPED_TOOLS } from '../../core/phaser/characterCustomizationData';

const MOCK_AUTH = import.meta.env.VITE_MOCK_AUTH === 'true';

const ZONES = [
  { id: 'homestead', label: 'Homestead & Manor', icon: '🏡', kicker: 'Sunforge Estate' },
  { id: 'mine', label: 'Deepforge Mine', icon: '⛏️', kicker: 'Subterranean Cavern' },
  { id: 'forest', label: 'Enchanted Forest', icon: '🌲', kicker: 'Wild Whispering Grove' },
  { id: 'village', label: 'Merchant Bazaar', icon: '🏛️', kicker: 'Imperial Plaza' },
];

export default function WorldPage() {
  const navigate = useNavigate();
  const [character, setCharacter] = useState(null);
  const [profile, setProfile] = useState(null);
  const [currentZone, setCurrentZone] = useState('homestead');
  const [isInventoryOpen, setIsInventoryOpen] = useState(false);

  useEffect(() => {
    if (!MOCK_AUTH) {
      navigate('/login');
      return;
    }

    const username = authService.getCurrentUsername();
    if (!username) {
      navigate('/login');
      return;
    }

    const savedCharacter = characterService.getMockCharacter(username);
    if (!savedCharacter) {
      navigate('/character');
      return;
    }

    const savedProfile = characterService.getMockProfile(username);
    setCharacter(savedCharacter);
    setProfile(savedProfile);
  }, [navigate]);

  useEffect(() => {
    const unsub = gameEventBridge.on(gameEvents.ZONE_CHANGED, ({ zone }) => {
      setCurrentZone(zone);
    });
    return unsub;
  }, []);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
  };

  const handleSwitchZone = (zoneId) => {
    if (zoneId === currentZone) return;
    audioManager.play('tap');
    setCurrentZone(zoneId);
    gameEventBridge.emit(gameEvents.SWITCH_ZONE, { zone: zoneId });
  };

  const playerLevel = profile?.stats?.level ?? 1;
  const playerXp = profile?.stats?.xp ?? 0;
  const playerXpTarget = getPlayerXpForLevel(playerLevel);

  // Active Tool metadata
  const currentToolId = character?.customization?.equippedTool || character?.customization?.tool || 'iron_pickaxe';
  const equippedToolMeta = EQUIPPED_TOOLS.find((t) => t.id === currentToolId) || {
    name: 'Iron Pickaxe',
    icon: '⛏️',
  };

  // Current zone metadata
  const activeZoneMeta = ZONES.find((z) => z.id === currentZone) || ZONES[0];

  // Inventory entries for the vault modal
  const inventoryItems = Object.entries(profile?.inventory || {})
    .filter(([, count]) => Number(count) > 0)
    .map(([itemId, count]) => {
      const item = getItemById(itemId) || {
        id: itemId,
        name: itemId.replace(/[-_]/g, ' '),
        category: 'Resource',
      };
      return { ...item, count };
    });

  return (
    <section className="min-h-screen bg-page-primary dashboard-shell text-gray-100">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />

      <main className="relative z-10 mx-auto max-w-6xl px-4 py-8 pt-20 sm:px-6">
        {/* World HUD */}
        <WorldHUD
          title={activeZoneMeta.label}
          zoneKicker={activeZoneMeta.kicker}
          levelLabel="Warden Lvl"
          level={playerLevel}
          currentXp={playerXp}
          targetXp={playerXpTarget}
          gold={profile?.stats?.gold ?? 0}
          weather={{ season: 'Spring', label: 'Sunforge Radiance' }}
          tool={{ name: equippedToolMeta.name, icon: equippedToolMeta.icon }}
          onOpenInventory={() => setIsInventoryOpen(true)}
          className="mb-4"
        />

        {/* Zone Fast-Travel Pills */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-yellow-700/30 bg-gray-950/70 p-2 backdrop-blur">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="hidden sm:inline-block px-2 text-[10px] font-bold uppercase tracking-widest text-yellow-500/80">
              Fast Travel:
            </span>
            {ZONES.map((zone) => {
              const isActive = currentZone === zone.id;
              return (
                <button
                  key={zone.id}
                  type="button"
                  onClick={() => handleSwitchZone(zone.id)}
                  className={`flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                    isActive
                      ? 'border border-yellow-400 bg-yellow-500/20 text-yellow-200 shadow-md'
                      : 'border border-yellow-700/20 bg-gray-900/60 text-gray-400 hover:border-yellow-600/40 hover:text-white'
                  }`}
                >
                  <span>{zone.icon}</span>
                  <span>{zone.label}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/character/edit"
              onClick={() => audioManager.play('tap')}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-700/40 bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/10 transition"
              title="Re-customize character appearance"
            >
              <span>🎨</span>
              <span className="hidden md:inline">Wardrobe</span>
            </Link>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                setIsInventoryOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl border border-yellow-700/40 bg-gray-900/80 px-3 py-1.5 text-xs font-bold text-yellow-300 hover:border-yellow-400 hover:bg-yellow-500/10 transition"
            >
              <span>🎒</span>
              <span>Vault Pouch ({inventoryItems.length})</span>
            </button>
          </div>
        </div>

        {/* 2D Phaser Interactive RPG Canvas */}
        <div className="relative">
          <PhaserWorldCanvas
            customization={character?.customization}
            profile={profile}
            onProfileUpdate={handleProfileUpdate}
            initialZone={currentZone}
          />
        </div>

        {/* Exploration Guide & Hotkeys Reference */}
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              <span>🎮</span>
              <span>Movement &amp; Input</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• <span className="font-mono text-yellow-300 font-semibold">WASD / Arrows</span>: Walk</li>
              <li>• <span className="font-mono text-yellow-300 font-semibold">Shift</span>: Hold to sprint</li>
              <li>• <span className="font-mono text-yellow-300 font-semibold">[E]</span>: Interact with object</li>
              <li>• Camera smoothly follows avatar</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              <span>⚔️</span>
              <span>Real-Time PvE Combat</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• <span className="font-mono text-yellow-300 font-semibold">Space / Click</span>: Swing weapon</li>
              <li>• <span className="font-mono text-yellow-300 font-semibold">[Q]</span>: Drink healing elixir</li>
              <li>• Slay Emerald Slimes &amp; Shadow Wolves in Forest</li>
              <li>• Defeat Skeletons &amp; Goblins in Mine</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              <span>🌾</span>
              <span>Farming &amp; Mining</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• <span className="text-emerald-300 font-semibold">Farm Plots</span>: Plant seeds &amp; harvest</li>
              <li>• <span className="text-amber-300 font-semibold">Cavern Seams</span>: Mine iron, gold &amp; geodes</li>
              <li>• <span className="text-sky-300 font-semibold">Vault Chest</span>: Open pouch inventory</li>
            </ul>
          </div>

          <div className="rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-4 backdrop-blur">
            <div className="flex items-center gap-2 text-yellow-400 font-bold text-sm mb-2">
              <span>🚪</span>
              <span>Realm Destinations</span>
            </div>
            <ul className="space-y-1 text-xs text-gray-300">
              <li>• Walk across stone roads to change zone</li>
              <li>• Forge in Mine: Smelt ingots</li>
              <li>• Bazaar: Trade goods &amp; gear</li>
              <li>• Return to <Link to="/dashboard" className="text-yellow-400 underline hover:text-yellow-200">Citadel Hub</Link></li>
            </ul>
          </div>
        </div>

        {/* Vault Pouch Modal */}
        {isInventoryOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-fadeIn">
            <div className="w-full max-w-lg rounded-3xl border-2 border-yellow-600/50 bg-gray-950 p-6 shadow-2xl">
              <div className="flex items-center justify-between border-b border-yellow-700/30 pb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">🎒</span>
                  <div>
                    <h3 className="font-serif text-lg font-bold text-white">Adventurer&apos;s Vault Pouch</h3>
                    <p className="text-xs text-gray-400">Items and harvested resources carried in your world pack</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsInventoryOpen(false)}
                  className="h-8 w-8 rounded-lg border border-yellow-700/30 bg-gray-900 text-sm font-bold text-gray-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="mt-4 max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {inventoryItems.length === 0 ? (
                  <div className="py-8 text-center text-sm text-gray-400">
                    Your pouch is empty. Mine some ores or harvest crops in the world!
                  </div>
                ) : (
                  inventoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-xl border border-yellow-700/20 bg-gray-900/60 p-2.5 transition hover:border-yellow-600/40"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-700/30 bg-black/50 text-xl">
                          {item.id.includes('iron') ? '⚙️' : item.id.includes('copper') ? '🪨' : item.id.includes('gold') ? '🪙' : item.id.includes('seed') ? '🌱' : '📦'}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white capitalize">{item.name}</p>
                          <p className="text-[10px] text-yellow-400/80 uppercase font-mono tracking-wider">{item.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-sm font-bold text-yellow-300">×{item.count}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="mt-5 flex items-center justify-between border-t border-yellow-700/30 pt-4">
                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-yellow-300">
                  <span>🪙</span>
                  <span>{profile?.stats?.gold ?? 0} Gold</span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to="/inventory"
                    className="rounded-xl border border-yellow-700/40 bg-gray-900 px-3 py-1.5 text-xs font-semibold text-yellow-300 hover:border-yellow-400 transition"
                  >
                    Open Full Ledger
                  </Link>
                  <button
                    type="button"
                    onClick={() => setIsInventoryOpen(false)}
                    className="rounded-xl bg-yellow-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-yellow-400 transition"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </section>
  );
}
