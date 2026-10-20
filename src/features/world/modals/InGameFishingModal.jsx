import React, { useState, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import characterService from '../../../core/services/CharacterService';
import { addItems } from '../../../core/services/inventoryService';
import gameEventBridge, { gameEvents } from '../../../core/phaser/gameEventBridge';
import { FISH_SPECIES } from '../../../core/data/fishData';

export default function InGameFishingModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate = () => {},
  currentZone = 'homestead',
  onFishCaught = () => {},
}) {
  // Game states: 'casting', 'waiting', 'nibble', 'reeling', 'caught', 'escaped'
  const [gameState, setGameState] = useState('casting');
  const [caughtFish, setCaughtFish] = useState(null);
  const [caughtWeight, setCaughtWeight] = useState(0);

  // Reeling minigame physics
  const [fishY, setFishY] = useState(50); // 0% to 100%
  const [barY, setBarY] = useState(50); // Player tension bar center
  const [catchProgress, setCatchProgress] = useState(30); // 0 to 100%
  const isMouseDownRef = useRef(false);
  const animFrameRef = useRef(null);
  const targetFishRef = useRef(null);

  const startCasting = useCallback(() => {
    setGameState('waiting');
    audioManager.play('splash');

    // Random fish selected based on zone
    const available = (currentZone === 'mine')
      ? FISH_SPECIES
      : FISH_SPECIES.filter((f) => f.id !== 'void-eel');
    const selected = available[Math.floor(Math.random() * available.length)];
    targetFishRef.current = selected;

    // Nibble triggers between 1.8s and 3.5s
    const waitMs = 1800 + Math.random() * 1700;
    const biteTimer = setTimeout(() => {
      setGameState('nibble');
      audioManager.play('bite');
    }, waitMs);

    return () => clearTimeout(biteTimer);
  }, [currentZone]);

  // Start casting on open
  useEffect(() => {
    if (!isOpen) {
      setGameState('casting');
      setCaughtFish(null);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    const cleanup = startCasting();
    return () => {
      if (cleanup) cleanup();
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isOpen, startCasting]);

  // Strike when nibble appears
  const handleStrike = () => {
    if (gameState === 'nibble') {
      audioManager.play('strike');
      setGameState('reeling');
      setFishY(50);
      setBarY(50);
      setCatchProgress(35);
    } else if (gameState === 'waiting') {
      toast('Too early! Wait for the nibble (!)', { icon: '⚠️' });
    }
  };

  const handleCatchSuccess = useCallback((fishDef) => {
    audioManager.play('levelup');
    const [minW, maxW] = fishDef.weightRange;
    const weight = +(minW + Math.random() * (maxW - minW)).toFixed(1);

    setCaughtFish(fishDef);
    setCaughtWeight(weight);
    setGameState('caught');

    // Add fish to player inventory & reward XP
    const prof = profile;
    if (prof) {
      const nextInv = addItems(prof.inventory || {}, { [fishDef.id]: 1 });
      const nextXp = (prof.stats?.xp || 0) + fishDef.xpReward;
      const nextCatches = (prof.fishCaught || 0) + 1;

      const updated = characterService.updateMockProfile({
        inventory: nextInv,
        stats: {
          ...prof.stats,
          xp: nextXp,
        },
        fishCaught: nextCatches,
      });

      onProfileUpdate(updated);
      gameEventBridge.emit(gameEvents.FISH_CAUGHT, { fish: fishDef, weight });
      onFishCaught(fishDef);
    }
  }, [profile, onProfileUpdate, onFishCaught]);

  // Reeling game loop
  useEffect(() => {
    if (gameState !== 'reeling') return;

    let localFishY = 50;
    let localFishVelocity = 0;
    let localBarY = 50;
    let localProgress = 35;
    const fishDef = targetFishRef.current || FISH_SPECIES[0];
    const diff = fishDef.difficulty;

    let lastTime = performance.now();

    const loop = (now) => {
      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Fish random movement
      if (Math.random() < 0.04 * diff) {
        localFishVelocity = (Math.random() * 2 - 1) * 70 * diff;
      }
      localFishY += localFishVelocity * dt;
      localFishY = Math.max(10, Math.min(90, localFishY));

      // Player tension bar physics (hold mouse = move up, release = fall down)
      const barSpeed = 120;
      if (isMouseDownRef.current) {
        localBarY -= barSpeed * dt;
        if (Math.random() < 0.2) audioManager.play('reel');
      } else {
        localBarY += barSpeed * 0.85 * dt; // Gravity
      }
      localBarY = Math.max(12, Math.min(88, localBarY));

      // Check if fish is inside green tension bar (tolerance 14%)
      const barHeight = 22;
      const isInside = Math.abs(localFishY - localBarY) < barHeight / 2;

      if (isInside) {
        localProgress += 28 * dt;
      } else {
        localProgress -= 18 * dt;
      }

      setFishY(localFishY);
      setBarY(localBarY);
      setCatchProgress(Math.max(0, Math.min(100, localProgress)));

      if (localProgress >= 100) {
        // Success! Fish Caught
        handleCatchSuccess(fishDef);
        return;
      } else if (localProgress <= 0) {
        // Fish escaped
        audioManager.play('error');
        setGameState('escaped');
        toast.error('The fish slipped off the hook!', { icon: '🐟' });
        return;
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [gameState, handleCatchSuccess]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative flex flex-col items-center w-full max-w-md rounded-3xl border-2 border-cyan-500/60 bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-6 shadow-2xl shadow-cyan-950/60 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-cyan-700/40 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎣</span>
            <div>
              <h3 className="font-serif text-base font-bold text-cyan-300">
                Salvation Angler Waters
              </h3>
              <p className="text-[11px] text-gray-400">
                Patience, timing, and rod tension
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800/80 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* =====================================================================
            STATE: WAITING & NIBBLE
            ===================================================================== */}
        {(gameState === 'waiting' || gameState === 'nibble') && (
          <div className="flex flex-col items-center justify-center py-8 gap-4 w-full">
            <div className="relative flex h-36 w-36 items-center justify-center rounded-full border-4 border-cyan-500/40 bg-cyan-950/50 shadow-inner overflow-hidden">
              {/* Concentric Water Waves */}
              <div className="absolute inset-2 rounded-full border border-cyan-400/30 animate-ping opacity-60" />
              <div className="absolute inset-8 rounded-full border border-cyan-300/40 animate-pulse" />

              {/* Red-White Bobber */}
              <div className="relative z-10 flex flex-col items-center">
                {gameState === 'nibble' ? (
                  <div className="flex flex-col items-center animate-bounce">
                    <span className="text-3xl font-black text-red-500 drop-shadow-md">!</span>
                    <span className="rounded-full bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white shadow animate-pulse">
                      BITE!
                    </span>
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-full border-2 border-red-700 bg-gradient-to-t from-red-600 to-white shadow-lg animate-pulse" />
                )}
              </div>
            </div>

            <p className="font-serif text-sm text-cyan-200 font-semibold">
              {gameState === 'nibble' ? 'STRIKE NOW! Click or press [Space]!' : 'Watching the bobber ripple...'}
            </p>

            <button
              type="button"
              onClick={handleStrike}
              className={`w-full py-3 rounded-2xl font-serif text-sm font-bold shadow-lg transition active:scale-95 ${
                gameState === 'nibble'
                  ? 'bg-gradient-to-r from-red-500 to-amber-500 text-black hover:brightness-110 animate-bounce'
                  : 'border border-cyan-600/40 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-900/60'
              }`}
            >
              {gameState === 'nibble' ? '⚡ STRIKE! Hook the Fish!' : 'Waiting for Nibble...'}
            </button>
          </div>
        )}

        {/* =====================================================================
            STATE: REELING MINIGAME
            ===================================================================== */}
        {gameState === 'reeling' && (
          <div
            className="flex flex-col items-center w-full py-2"
            onMouseDown={() => { isMouseDownRef.current = true; }}
            onMouseUp={() => { isMouseDownRef.current = false; }}
            onTouchStart={() => { isMouseDownRef.current = true; }}
            onTouchEnd={() => { isMouseDownRef.current = false; }}
          >
            <div className="flex items-center justify-between w-full text-xs font-mono mb-2 px-2">
              <span className="text-cyan-300 font-bold">REEL TENSION</span>
              <span className="font-bold text-emerald-400">{Math.round(catchProgress)}%</span>
            </div>

            {/* Overall Catch Progress Bar */}
            <div className="h-2.5 w-full overflow-hidden rounded-full bg-black/70 mb-4 border border-cyan-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-400 transition-all duration-75"
                style={{ width: `${catchProgress}%` }}
              />
            </div>

            {/* Vertical Reeling Track */}
            <div className="relative h-64 w-20 rounded-2xl border-2 border-cyan-600/60 bg-gradient-to-b from-blue-950 via-slate-900 to-cyan-950 overflow-hidden shadow-inner cursor-pointer">
              {/* Water bubble particles */}
              <div className="absolute inset-0 opacity-20 pointer-events-none bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:12px_12px]" />

              {/* Player Tension Green Catch Zone */}
              <div
                className="absolute left-1 right-1 rounded-xl border border-emerald-400 bg-emerald-500/40 shadow-lg backdrop-blur-sm pointer-events-none transition-all duration-75"
                style={{
                  top: `${Math.max(0, barY - 11)}%`,
                  height: '22%',
                }}
              />

              {/* Swimming Fish Target */}
              <div
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-xl transition-all duration-75"
                style={{ top: `${fishY}%` }}
              >
                {targetFishRef.current?.icon || '🐟'}
              </div>
            </div>

            <p className="mt-4 text-[11px] text-gray-400 font-mono text-center">
              Hold Left Click or Space to raise bar · Keep fish inside green zone!
            </p>
          </div>
        )}

        {/* =====================================================================
            STATE: CAUGHT SUCCESS
            ===================================================================== */}
        {gameState === 'caught' && caughtFish && (
          <div className="flex flex-col items-center py-4 w-full animate-fadeIn">
            <span className="text-5xl mb-2">{caughtFish.icon}</span>
            <span
              className="rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-1"
              style={{ backgroundColor: `${caughtFish.color}25`, color: caughtFish.color, border: `1px solid ${caughtFish.color}60` }}
            >
              {caughtFish.rarity} Catch
            </span>
            <h4 className="font-serif text-lg font-bold text-white mb-1">
              {caughtFish.name}
            </h4>
            <p className="text-xs text-gray-400 mb-4">
              Weight: <span className="text-cyan-300 font-bold">{caughtWeight} lbs</span> · Value: <span className="text-yellow-400 font-bold">{caughtFish.sellValue}g</span>
            </p>

            <div className="flex items-center gap-2 w-full">
              <button
                type="button"
                onClick={startCasting}
                className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-black font-serif text-xs font-bold hover:bg-cyan-400 transition"
              >
                Cast Again 🎣
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-gray-700 bg-gray-800 text-gray-300 font-serif text-xs font-semibold hover:text-white transition"
              >
                Pocket Catch
              </button>
            </div>
          </div>
        )}

        {/* =====================================================================
            STATE: ESCAPED
            ===================================================================== */}
        {gameState === 'escaped' && (
          <div className="flex flex-col items-center py-6 w-full animate-fadeIn">
            <span className="text-4xl mb-2">💨</span>
            <h4 className="font-serif text-base font-bold text-red-400 mb-1">
              The Line Snapped Loose!
            </h4>
            <p className="text-xs text-gray-400 mb-4 text-center">
              The fish darted into the weeds. Better luck on the next cast!
            </p>
            <button
              type="button"
              onClick={startCasting}
              className="w-full py-2.5 rounded-xl bg-cyan-600 text-white font-serif text-xs font-bold hover:bg-cyan-500 transition"
            >
              Cast Again 🎣
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
