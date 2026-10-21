import React from 'react';
import audioManager from '../../../core/audio/AudioManager';

const TUTORIAL_STEPS = [
  {
    step: 1,
    id: 'movement',
    title: 'First Steps & Pathfinding',
    badge: 'Movement',
    icon: '🧭',
    instruction: 'Walk across the homestead using [W, A, S, D], Arrow keys, or by clicking directly on the ground.',
    tip: 'Hold [Shift] to sprint. Point-and-click movement automatically pathfinds around obstacles.',
    keyHint: 'WASD / Click',
  },
  {
    step: 2,
    id: 'cottage',
    title: 'Enter Homestead Cottage',
    badge: 'Shelter',
    icon: '🏡',
    instruction: 'Walk up to the Manor House front door and press [E] to step inside your cottage home.',
    tip: 'Your cottage provides total sanctuary from wilderness beasts and nighttime cold.',
    keyHint: '[E] Front Door',
  },
  {
    step: 3,
    id: 'rest',
    title: 'Rest & Restore Health',
    badge: 'Sanctuary',
    icon: '🛏️',
    instruction: 'Approach the cozy cottage bed and press [E] to sleep and restore full 100% Health.',
    tip: 'Resting in bed triggers a restorative flash and fully replenishes your HP without potions.',
    keyHint: '[E] Cottage Bed',
  },
  {
    step: 4,
    id: 'pouch',
    title: 'Inspect Adventurer Pouch',
    badge: 'Equipment',
    icon: '🎒',
    instruction: 'Press [I] or click the [🎒 Pouch] ribbon button to inspect your inventory, tools, and potions.',
    tip: 'In battle, press [1] on your keyboard to instantly drink a Healing Potion (+45 HP).',
    keyHint: '[I] Pouch',
  },
  {
    step: 5,
    id: 'atlas',
    title: 'Chart the World Atlas',
    badge: 'Exploration',
    icon: '🗺️',
    instruction: 'Press [M] or click the Compass Minimap in the corner to survey the realm map and territories.',
    tip: 'Sunforge connects to West Road, Sunforge City Plaza, Whispering Woods, and Deepforge Caverns.',
    keyHint: '[M] Realm Atlas',
  },
];

export default function BeginnerTutorialStepper({
  currentStep = 0,
  isCompleted = false,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onDismiss = () => {},
  onClaimReward = () => {},
  onOpenPouch = () => {},
  onOpenAtlas = () => {},
}) {
  const activeStep = TUTORIAL_STEPS[Math.min(currentStep, TUTORIAL_STEPS.length - 1)];

  // Collapsed Floating Badge View
  if (isCollapsed) {
    return (
      <div className="fixed bottom-4 left-4 z-30 pointer-events-auto">
        <button
          type="button"
          onClick={() => {
            audioManager.play('tap');
            onToggleCollapse();
          }}
          className="rpg-btn-brown flex items-center gap-2 py-1.5 px-3 text-xs shadow-2xl backdrop-blur-md animate-fadeIn border border-amber-600/70 hover:brightness-110"
          title="Click to expand Beginner Warden Tutorial"
        >
          <span className="text-sm">🧭</span>
          <span className="font-serif font-bold text-amber-200">
            {isCompleted ? 'Tutorial Completed ✓' : `Warden Guide (${currentStep + 1}/5)`}
          </span>
          <span className="text-[10px] text-amber-400/80">▴ Expand</span>
        </button>
      </div>
    );
  }

  return (
    <aside
      className="rpg-panel-brown pointer-events-auto fixed bottom-3 left-4 z-30 flex flex-col gap-2 p-3.5 shadow-2xl backdrop-blur-md w-[92vw] max-w-lg animate-fadeIn border-2 border-amber-600/90"
      aria-label="Warden Awakening Tutorial Stepper"
    >
      {/* 1. Header Bar: Title, Step Count & Minimize/Dismiss Controls */}
      <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <div>
            <h3 className="font-serif text-xs sm:text-sm font-bold text-amber-100 flex items-center gap-1.5">
              <span>Warden&apos;s Awakening</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 bg-amber-950/80 text-amber-400 rounded border border-amber-800/80">
                {isCompleted ? 'Finished ✓' : `Step ${currentStep + 1} of 5`}
              </span>
            </h3>
            <p className="text-[10px] text-amber-300/70 font-serif">
              Beginner Realm Orientation &amp; Essentials
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onToggleCollapse();
            }}
            className="rpg-btn-square-brown h-6 w-6 text-[10px] flex items-center justify-center"
            title="Minimize tutorial guide"
          >
            <span>▾</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onDismiss();
            }}
            className="rpg-btn-beige text-[10px] py-0.5 px-2 font-serif font-bold"
            title="Skip or dismiss tutorial guide"
          >
            Skip ✕
          </button>
        </div>
      </div>

      {/* 2. Visual Stepper Breadcrumbs Bar */}
      <div className="flex items-center justify-between px-1 py-1">
        {TUTORIAL_STEPS.map((s, idx) => {
          const isDone = idx < currentStep || isCompleted;
          const isCurrent = idx === currentStep && !isCompleted;
          return (
            <React.Fragment key={s.id}>
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`flex h-6 w-6 sm:h-7 sm:w-7 items-center justify-center rounded-full text-xs font-bold transition-all shadow-md ${
                    isDone
                      ? 'bg-emerald-700 border-2 border-emerald-400 text-emerald-100'
                      : isCurrent
                      ? 'bg-amber-600 border-2 border-yellow-300 text-yellow-100 ring-2 ring-amber-400/50 scale-105'
                      : 'bg-stone-800/90 border border-stone-600/60 text-stone-400'
                  }`}
                  title={`${s.step}. ${s.title}`}
                >
                  {isDone ? '✓' : s.step}
                </div>
                <span
                  className={`text-[9px] font-serif hidden sm:inline ${
                    isCurrent ? 'text-amber-200 font-bold' : isDone ? 'text-emerald-300' : 'text-stone-500'
                  }`}
                >
                  {s.badge}
                </span>
              </div>
              {idx < TUTORIAL_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1 transition-colors ${
                    idx < currentStep || isCompleted ? 'bg-emerald-500/80' : 'bg-stone-700/60'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* 3. Active Step Card Content */}
      {!isCompleted ? (
        <div className="rpg-slot-inset p-2.5 bg-black/60 flex flex-col gap-1.5 rounded">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{activeStep.icon}</span>
              <span className="font-serif font-bold text-xs text-amber-200">
                {activeStep.title}
              </span>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-900/40 border border-amber-700/60 text-amber-300 font-bold">
              {activeStep.keyHint}
            </span>
          </div>

          <p className="text-[11px] text-amber-100 leading-relaxed font-serif">
            {activeStep.instruction}
          </p>

          <div className="flex items-start gap-1.5 text-[10px] text-amber-300/80 bg-amber-950/40 p-1.5 rounded border border-amber-800/40">
            <span className="text-amber-400">💡</span>
            <span>{activeStep.tip}</span>
          </div>

          {/* Quick Helper Interactive Shortcuts */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {currentStep === 3 && (
              <button
                type="button"
                onClick={() => {
                  audioManager.play('tap');
                  onOpenPouch();
                }}
                className="rpg-btn-beige text-[11px] py-1 px-3 font-serif"
              >
                🎒 Open Pouch [I] ➔
              </button>
            )}
            {currentStep === 4 && (
              <button
                type="button"
                onClick={() => {
                  audioManager.play('tap');
                  onOpenAtlas();
                }}
                className="rpg-btn-beige text-[11px] py-1 px-3 font-serif"
              >
                🗺️ Open World Atlas [M] ➔
              </button>
            )}
          </div>
        </div>
      ) : (
        /* 4. Completion State */
        <div className="rpg-slot-inset p-3 bg-black/70 flex flex-col items-center text-center gap-2 rounded border border-emerald-500/50">
          <span className="text-2xl animate-bounce">🏆</span>
          <div>
            <h4 className="font-serif text-sm font-bold text-emerald-300">
              Awakening Journey Completed!
            </h4>
            <p className="text-[11px] text-amber-200/90 font-serif max-w-sm mt-0.5">
              You have mastered basic movement, cottage sanctuary, health restoration, and world exploration.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              audioManager.play('levelup');
              onClaimReward();
            }}
            className="rpg-btn-beige text-xs py-1.5 px-4 font-serif font-bold text-amber-950 shadow-xl hover:scale-105 transition-transform"
          >
            Claim Warden Reward (+50 Gold &amp; +50 XP) ✨
          </button>
        </div>
      )}

      {/* 5. Subtitle & Hint */}
      <div className="flex items-center justify-between text-[9px] text-amber-400/60 pt-0.5">
        <span>Press [?] anytime in the top-right console for controls</span>
        <span>Progress saves automatically</span>
      </div>
    </aside>
  );
}
