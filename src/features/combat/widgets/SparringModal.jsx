import React, { useState } from 'react';
import { audioManager } from '../../../core/audio/AudioManager';

export default function SparringModal({
  isOpen,
  onClose,
  playerPower,
  opponentPower,
  stance,
  equippedGear = [],
  hazard,
}) {
  const [sparLog, setSparLog] = useState(null);

  if (!isOpen) return null;

  const handleRunSpar = () => {
    audioManager.play('strike');
    const weapon = equippedGear.find((g) => g.slot === 'weapon')?.name || 'weapon';
    const isWin = playerPower >= opponentPower * 0.95;

    const round1 = `You initiated an advance in ${stance?.name || 'Assault'}, testing defenses with your ${weapon}.`;
    const round2 = hazard?.name
      ? `The ${hazard.name} environment flared, demanding fast footwork and stance balance.`
      : `You parried a counter-thrust and held center ring.`;
    const round3 = isWin
      ? `Decisive opening! Your strike landed cleanly against the sparring automaton.`
      : `The automaton weathered the combo and checked your momentum.`;

    setSparLog({
      outcome: isWin ? 'Spar Advantage' : 'Spar Parity',
      rounds: [round1, round2, round3],
      projectedRatio: Math.round((playerPower / (playerPower + (opponentPower || 1))) * 100),
    });
  };

  const handleClose = () => {
    setSparLog(null);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="spar-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in"
    >
      <div className="relative w-full max-w-xl rounded-2xl border border-yellow-700/40 bg-gray-950 p-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-yellow-700/30 pb-4">
          <div>
            <span className="text-xs uppercase tracking-widest text-yellow-500 font-bold">
              Combat Practice
            </span>
            <h2 id="spar-modal-title" className="text-2xl font-bold text-white mt-1">
              Sparring Grounds
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800/80 transition-colors"
          >
            ✕
          </button>
        </div>

        <p className="mt-3 text-sm text-gray-300">
          Run practice drills against the training automaton to verify your gear bonuses, active stance, and combat forecast with zero gold risk.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-yellow-700/20 bg-gray-900/70 p-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Active Stance</span>
            <p className="text-base font-semibold text-yellow-300 mt-1">{stance?.name || 'Blazing Assault'}</p>
            <p className="text-xs text-gray-400 mt-0.5">{stance?.tagline}</p>
          </div>
          <div className="rounded-xl border border-yellow-700/20 bg-gray-900/70 p-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Forecast Odds</span>
            <p className="text-base font-semibold text-white mt-1">
              {Math.round((playerPower / (playerPower + (opponentPower || 1))) * 100)}% Estimated
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Power: {playerPower} vs {opponentPower || '???'}
            </p>
          </div>
        </div>

        {equippedGear.length > 0 && (
          <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-900/50 p-3">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Equipped Battle Gear</span>
            <div className="mt-2 flex flex-wrap gap-2">
              {equippedGear.map((item) => (
                <span
                  key={item.id}
                  className="rounded-lg border border-yellow-700/30 bg-gray-950/80 px-2.5 py-1 text-xs text-yellow-200"
                >
                  {item.name} ({item.slot})
                </span>
              ))}
            </div>
          </div>
        )}

        {sparLog && (
          <div className="mt-4 rounded-xl border border-yellow-600/30 bg-yellow-950/20 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold text-yellow-400">Spar Simulation Results</span>
              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-300">
                {sparLog.outcome}
              </span>
            </div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc list-inside mt-2">
              {sparLog.rounds.map((round) => (
                <li key={round}>{round}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-6 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={handleRunSpar}
            className="rounded-xl bg-yellow-500 hover:bg-yellow-400 px-5 py-2.5 text-sm font-bold text-gray-950 transition-colors shadow-lg"
          >
            {sparLog ? 'Spar Again' : 'Execute Spar Drill'}
          </button>
          <button
            type="button"
            onClick={handleClose}
            className="rounded-xl border border-yellow-700/40 px-4 py-2.5 text-sm font-semibold text-yellow-200 hover:bg-gray-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
