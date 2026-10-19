import React from 'react';
import Panel from '../../../shared/ui/Panel';
import Button from '../../../shared/ui/Button';

export default function ChronicleChapterCard({ chapter, progress, onClaim }) {
  const { completed, claimed, percent, completedCount, total } = progress;

  return (
    <Panel
      variant="glass"
      className={`relative overflow-hidden transition-all duration-300 ${
        completed && !claimed ? 'border-yellow-500/50 shadow-lg shadow-yellow-500/10' : ''
      }`}
    >
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-md border border-yellow-700/40 bg-yellow-950/60 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-yellow-300">
              Chapter {chapter.chapterNumber}
            </span>
            <span className="text-xs font-semibold text-yellow-500/80 uppercase tracking-widest">
              {chapter.badge}
            </span>
            {claimed && (
              <span className="rounded-full bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-0.5 text-[10px] font-bold text-emerald-400">
                Accolade Bestowed ✓
              </span>
            )}
          </div>

          <div>
            <h3 className="text-2xl font-black text-white hero-title">{chapter.title}</h3>
            <p className="text-xs font-medium text-yellow-400/90 tracking-wide mt-0.5">
              {chapter.subtitle}
            </p>
          </div>

          <p className="text-sm italic text-gray-300/90 leading-relaxed border-l-2 border-yellow-600/30 pl-3">
            "{chapter.lore}"
          </p>

          <div className="pt-2">
            <p className="text-[11px] uppercase tracking-wider text-gray-400 font-bold mb-2">
              Chapter Objectives ({completedCount}/{total})
            </p>
            <div className="space-y-2">
              {chapter.objectives.map((obj) => {
                const done = obj.isDone(progress.profile || {});
                return (
                  <div
                    key={obj.id}
                    className={`flex items-center justify-between rounded-lg border px-3 py-2 text-xs transition-all ${
                      done
                        ? 'border-emerald-600/30 bg-emerald-950/20 text-emerald-200'
                        : 'border-gray-800 bg-gray-900/60 text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold ${
                        done ? 'bg-emerald-500 text-black' : 'bg-gray-800 text-gray-400'
                      }`}>
                        {done ? '✓' : '○'}
                      </span>
                      <span>{obj.label}</span>
                    </div>
                    <span className="font-mono text-[11px] font-semibold">
                      {done ? 'Complete' : 'Pending'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-xl border border-yellow-700/20 bg-gray-950/80 p-4 md:w-64">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold">Chapter Progress</p>
            <div className="mt-2 flex items-center justify-between text-xs">
              <span className="font-semibold text-white">{percent}%</span>
              <span className="text-gray-400">{completedCount} of {total} Complete</span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-gray-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>

          <div className="space-y-1.5 border-t border-gray-800/80 pt-3 text-xs">
            <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mb-1">Rewards</p>
            <div className="flex items-center justify-between text-yellow-300 font-semibold">
              <span>Imperial Gold</span>
              <span>+{chapter.rewardGold}g</span>
            </div>
            <div className="flex items-center justify-between text-sky-300 font-semibold">
              <span>Warden Renown XP</span>
              <span>+{chapter.rewardXp} XP</span>
            </div>
            <div className="flex items-center justify-between text-amber-200 font-semibold">
              <span>Honorary Title</span>
              <span className="italic">«{chapter.titleReward}»</span>
            </div>
          </div>

          <div className="pt-1">
            {claimed ? (
              <Button variant="ghost" disabled className="w-full text-xs py-2 opacity-60">
                Claimed ✓
              </Button>
            ) : completed ? (
              <Button
                variant="primary"
                onClick={() => onClaim(chapter)}
                className="w-full text-xs py-2 animate-pulse font-bold"
              >
                Claim Accolade
              </Button>
            ) : (
              <Button variant="ghost" disabled className="w-full text-xs py-2 text-gray-500">
                Locked ({percent}%)
              </Button>
            )}
          </div>
        </div>
      </div>
    </Panel>
  );
}
