import React, { useState, useMemo, useEffect } from 'react';
import { miningOres, getTierByMiningLevel, formatDuration } from '../../core/data/miningData';
import audioManager from '../../core/audio/AudioManager';
import { PixelOreNodeSprite, PixelLantern } from '../../core/world/pixelAssets';

export default function MiningWorldView({
  miningLevel = 1,
  pickaxeLevel = 1,
  pickaxeUpgrade = null,
  forgeUpgrade = null,
  clickDamage = 15,
  clickCooldownMs = 800,
  canClick = true,
  momentum = 0,
  dailyVein = null,
  weeklySurge = null,
  onMineDeposit = () => {},
  pushReward = null,
  className = '',
}) {
  // Active cave ore deposits placed spatially in the 2D cavern
  const [deposits, setDeposits] = useState([
    {
      id: 'vein-1',
      oreId: 'iron',
      tier: 1,
      x: 18,
      y: 42,
      maxDurability: 60,
      currentDurability: 60,
      respawnUntil: 0,
    },
    {
      id: 'vein-2',
      oreId: 'copper',
      tier: 1,
      x: 38,
      y: 65,
      maxDurability: 65,
      currentDurability: 65,
      respawnUntil: 0,
    },
    {
      id: 'vein-3',
      oreId: 'bronze',
      tier: 1,
      x: 62,
      y: 38,
      maxDurability: 75,
      currentDurability: 75,
      respawnUntil: 0,
    },
    {
      id: 'vein-4',
      oreId: 'silver',
      tier: 2,
      x: 82,
      y: 55,
      maxDurability: 90,
      currentDurability: 90,
      respawnUntil: 0,
    },
    {
      id: 'vein-5',
      oreId: 'mystery-geode',
      tier: 2,
      x: 50,
      y: 20,
      maxDurability: 95,
      currentDurability: 95,
      respawnUntil: 0,
    },
    {
      id: 'vein-6',
      oreId: 'gold',
      tier: 3,
      x: 78,
      y: 18,
      maxDurability: 115,
      currentDurability: 115,
      respawnUntil: 0,
    },
  ]);

  const [selectedDepositId, setSelectedDepositId] = useState('vein-1');
  const [strikingDepositId, setStrikingDepositId] = useState(null);
  const [now, setNow] = useState(Date.now());

  // Clock tick for node regeneration timers
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Automatically regenerate depleted nodes once respawn timer expires
  useEffect(() => {
    setDeposits((prev) =>
      prev.map((dep) => {
        if (dep.respawnUntil > 0 && now >= dep.respawnUntil) {
          const oreInfo = miningOres.find((o) => o.id === dep.oreId);
          return {
            ...dep,
            currentDurability: oreInfo?.durability || dep.maxDurability,
            respawnUntil: 0,
          };
        }
        return dep;
      })
    );
  }, [now]);

  const selectedDeposit = useMemo(() => {
    return deposits.find((d) => d.id === selectedDepositId) || deposits[0];
  }, [deposits, selectedDepositId]);

  const selectedOre = useMemo(() => {
    if (!selectedDeposit) return miningOres[0];
    return miningOres.find((o) => o.id === selectedDeposit.oreId) || miningOres[0];
  }, [selectedDeposit]);

  const playerTier = getTierByMiningLevel(miningLevel);

  const handleStrikeNode = (deposit) => {
    if (!canClick) return;

    const isDepleted = deposit.respawnUntil > 0 || deposit.currentDurability <= 0;
    if (isDepleted) return;

    audioManager.play('mine_strike');
    setStrikingDepositId(deposit.id);

    const damage = Math.max(5, clickDamage);
    const nextDurability = Math.max(0, deposit.currentDurability - damage);
    const isShattered = nextDurability <= 0;

    // Trigger mining reward through the authoritative engine callback
    onMineDeposit({
      oreId: deposit.oreId,
      damage,
      isShattered,
      depositId: deposit.id,
    });

    if (pushReward) {
      pushReward(`+${isShattered ? 3 : 1} ${selectedOre.name}`, { tone: 'item' });
    }

    if (isShattered) {
      audioManager.play('node_shatter');
      // Depleted node rubble for 15 seconds
      const respawnTimer = Date.now() + 15000;
      setDeposits((prev) =>
        prev.map((d) =>
          d.id === deposit.id
            ? { ...d, currentDurability: 0, respawnUntil: respawnTimer }
            : d
        )
      );
    } else {
      setDeposits((prev) =>
        prev.map((d) =>
          d.id === deposit.id ? { ...d, currentDurability: nextDurability } : d
        )
      );
    }

    setTimeout(() => {
      setStrikingDepositId(null);
    }, 280);
  };

  return (
    <div className={`relative w-full overflow-hidden rounded-3xl border-2 border-yellow-700/40 bg-[#0c0d12] shadow-2xl ${className}`}>
      {/* 2D Subterranean Cave Canvas */}
      <div className="relative min-h-[580px] w-full p-4 sm:p-6 select-none bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#191d28] via-[#0f1118] to-[#08090d]">
        {/* Carved Cavern Walls & Stalactites */}
        <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#17192315_1px,transparent_1px),linear-gradient(to_bottom,#17192315_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

        {/* Ambient Drifting Dust Particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300/30 blur-[0.5px] animate-pulse" style={{ top: '20%', left: '45%', animationDuration: '4s' }} />
          <div className="absolute h-2 w-2 rounded-full bg-amber-200/20 blur-[1px] animate-ping" style={{ top: '70%', left: '25%', animationDuration: '7s' }} />
          <div className="absolute h-1 w-1 rounded-full bg-purple-300/30 blur-[0.5px] animate-pulse" style={{ top: '35%', left: '75%', animationDuration: '5s' }} />
        </div>

        {/* Cave Header & Lighting Props */}
        <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-gray-800/80 pb-4">
          <div className="flex items-center gap-3">
            <PixelLantern isFlickering={true} />
            <div>
              <p className="text-[10px] uppercase font-bold tracking-[0.25em] text-cyan-400">
                Cavern Strata · Depth Tier {playerTier}
              </p>
              <h2 className="font-serif text-base font-bold text-white sm:text-lg">
                The Sunforge Vein Chasm
              </h2>
            </div>
          </div>

          {/* Daily Vein & Surge Buff Badges */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {dailyVein && (
              <span className="rounded-xl border border-amber-600/30 bg-amber-950/40 px-3 py-1 text-amber-200 font-medium">
                ⚡ Vein Bonus: +{Math.round((dailyVein.multiplier - 1) * 100)}%
              </span>
            )}
            {weeklySurge && (
              <span className="rounded-xl border border-purple-600/30 bg-purple-950/40 px-3 py-1 text-purple-200 font-medium">
                🔮 Surge: +{Math.round((weeklySurge.xpBonus - 1) * 100)}% XP
              </span>
            )}
          </div>
        </div>

        {/* =========================================================================
            CAVE FLOOR: 2D ORE DEPOSITS SCENE
            Interactive clickable nodes positioned across the cavern chamber
            ========================================================================= */}
        <div className="relative z-10 my-6 h-[340px] sm:h-[380px] w-full rounded-2xl border border-gray-800/60 bg-gray-950/40 shadow-inner overflow-hidden">
          {/* Subterranean Ore Tracks & Rubble Detail */}
          <div className="absolute inset-x-8 bottom-12 h-2.5 border-y border-dashed border-gray-700/40 opacity-30 pointer-events-none" />

          {/* Ore Deposit Objects in Cavern */}
          {deposits.map((deposit) => {
            const isSelected = selectedDepositId === deposit.id;
            const isStriking = strikingDepositId === deposit.id;
            const isDepleted = deposit.respawnUntil > 0 || deposit.currentDurability <= 0;
            const durabilityPct = deposit.maxDurability > 0
              ? Math.round((deposit.currentDurability / deposit.maxDurability) * 100)
              : 0;
            const oreInfo = miningOres.find((o) => o.id === deposit.oreId);
            const remainingCooldown = Math.max(0, deposit.respawnUntil - now);

            return (
              <div
                key={deposit.id}
                onClick={() => {
                  setSelectedDepositId(deposit.id);
                  if (!isDepleted) {
                    handleStrikeNode(deposit);
                  }
                }}
                className={`absolute group cursor-pointer transition-transform duration-150 ${
                  isStriking ? 'scale-90 brightness-150' : 'hover:scale-110'
                }`}
                style={{
                  left: `${deposit.x}%`,
                  top: `${deposit.y}%`,
                  transform: `translate(-50%, -50%) ${isStriking ? 'scale(0.92)' : ''}`,
                }}
              >
                {/* Ore Sprite with Damage Cracking */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24">
                  <PixelOreNodeSprite
                    oreId={deposit.oreId}
                    durabilityPct={durabilityPct}
                    isDepleted={isDepleted}
                    isHovered={isSelected}
                  />

                  {/* Pickaxe Impact Spark Overlay on Hit */}
                  {isStriking && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-2xl animate-ping">💥</span>
                    </div>
                  )}

                  {/* Respawn Countdown Beacon */}
                  {isDepleted && (
                    <div className="absolute -bottom-2 inset-x-0 text-center">
                      <span className="rounded-full bg-red-950/90 border border-red-700/60 px-2 py-0.5 text-[9px] font-mono text-red-300">
                        {formatDuration(remainingCooldown)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Overhead In-World Durability Gauge */}
                {!isDepleted && (
                  <div className="absolute -top-3.5 inset-x-0 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-white drop-shadow-md truncate">
                      {oreInfo ? oreInfo.name : 'Ore'}
                    </span>
                    <div className="mt-0.5 h-1.5 w-12 overflow-hidden rounded-full bg-black/80 border border-yellow-700/30">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-yellow-400 transition-all duration-150"
                        style={{ width: `${durabilityPct}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            LOWER DOCK: MINING ACTION CONSOLE
            Shows current selected vein stats, durability, and strike button
            ========================================================================= */}
        {selectedDeposit && (
          <div className="relative z-10 rounded-2xl border-2 border-yellow-700/40 bg-gray-950/95 p-4 shadow-2xl backdrop-blur">
            <div className="flex flex-wrap items-center justify-between gap-4">
              {/* Vein Metadata */}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest font-bold text-cyan-400">
                    Tier {selectedDeposit.tier} Vein
                  </span>
                  <span className="rounded bg-yellow-950/60 border border-yellow-700/30 px-2 py-0.5 text-[10px] text-yellow-300 font-mono">
                    Durability: {selectedDeposit.currentDurability} / {selectedDeposit.maxDurability}
                  </span>
                </div>
                <h3 className="font-serif text-lg font-bold text-white mt-1">
                  {selectedOre.name} Deposit
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  Tool: <span className="text-amber-300 font-semibold">{pickaxeUpgrade?.name || 'Pickaxe'} (Lv {pickaxeLevel})</span> · Strike: <span className="text-yellow-300 font-mono font-bold">+{clickDamage} Dmg ({clickCooldownMs}ms)</span>
                  {forgeUpgrade && (
                    <span> · Forge: <span className="text-emerald-300 font-mono">x{forgeUpgrade.efficiency || 1}</span></span>
                  )}
                  {momentum > 0 && (
                    <span> · Momentum: <span className="text-cyan-300 font-mono font-bold">+{Math.round(momentum * 100)}%</span></span>
                  )}
                </p>
              </div>

              {/* Direct Strike Action Button */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled={!canClick || selectedDeposit.currentDurability <= 0}
                  onClick={() => handleStrikeNode(selectedDeposit)}
                  className={`flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-bold shadow-xl transition-all active:scale-95 ${
                    canClick && selectedDeposit.currentDurability > 0
                      ? 'border border-yellow-400 bg-gradient-to-r from-yellow-500 to-amber-600 text-gray-950 hover:brightness-110 shadow-yellow-950/50'
                      : 'border border-gray-800 bg-gray-900 text-gray-500 cursor-not-allowed opacity-50'
                  }`}
                >
                  <span className="text-lg">⛏️</span>
                  <span>
                    {selectedDeposit.currentDurability <= 0 ? 'Vein Depleted' : 'Strike Vein'}
                  </span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
