import React from 'react';
import audioManager from '../../../core/audio/AudioManager';

const TUTORIAL_STEPS_ISLAND = [
  {
    step: 1,
    id: 'movement',
    title: 'Stranded on the Isle',
    badge: 'Movement',
    icon: '🏝️',
    instruction: 'Awaken on the sunny shore. Move across the beach using [W, A, S, D], Arrow keys, or click directly on the sand.',
    tip: 'Hold [Shift] to sprint. Point-and-click movement automatically navigates along the beach.',
    keyHint: 'WASD / Click',
  },
  {
    step: 2,
    id: 'chest',
    title: 'Salvage Castaway Gear',
    badge: 'Equipment',
    icon: '📦',
    instruction: 'Walk to the Castaway Supply Chest on the beach and press [E] to claim your starter dagger & potions.',
    tip: 'Hotbar slot [1] immediately sips a potion (+45 HP) when in danger.',
    keyHint: '[E] Supply Chest',
  },
  {
    step: 3,
    id: 'forage',
    title: 'Island Foraging',
    badge: 'Sustenance',
    icon: '🍎',
    instruction: 'Head north into the grove and press [E] by the Fruit Tree to forage sweet Sunberries.',
    tip: 'Sunberries provide natural energy and can be cooked into delicious meals.',
    keyHint: '[E] Fruit Tree',
  },
  {
    step: 4,
    id: 'combat',
    title: 'Trial of Combat',
    badge: 'Combat',
    icon: '⚔️',
    instruction: 'Approach the training beach slime and press [Space] or Left Click to test your strike.',
    tip: 'Time your swings to knock enemies back and avoid taking counter damage.',
    keyHint: '[Space] Attack',
  },
  {
    step: 5,
    id: 'departure',
    title: 'Set Sail for Sunforge',
    badge: 'Voyage',
    icon: '⛵',
    instruction: 'Walk south to the wooden pier and board the Sloop [E] to sail to your Sunforge Homestead estate!',
    tip: 'Once you set sail, your journey begins on the mainland. There is no road back to this tutorial isle!',
    keyHint: '[E] Board Sloop',
  },
];

const TUTORIAL_STEPS_MAINLAND = [
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
  currentZone = 'tutorial_island',
  currentStep = 0,
  isCompleted = false,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onDismiss = () => {},
  onClaimReward = () => {},
  onOpenPouch = () => {},
  onOpenAtlas = () => {},
}) {
  const steps = currentZone === 'tutorial_island' ? TUTORIAL_STEPS_ISLAND : TUTORIAL_STEPS_MAINLAND;
  const activeStep = steps[Math.min(currentStep, steps.length - 1)];

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
      className="rpg-panel-brown pointer-events-auto fixed bottom-3 left-3 z-30 flex flex-col gap-1.5 p-2.5 sm:p-3 shadow-2xl backdrop-blur-md w-[92vw] max-w-sm max-h-[85vh] overflow-y-auto animate-fadeIn border border-amber-600/80"
      aria-label="Warden Awakening Tutorial Stepper"
    >
      {/* 1. Header Bar: Title, Step Count & Minimize/Dismiss Controls */}
      <div className="flex items-center justify-between border-b border-amber-900/60 pb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">📜</span>
          <div>
            <h2 className="text-xs font-serif font-bold tracking-wide uppercase text-amber-200 flex items-center gap-1.5">
              <span>Warden&apos;s Awakening</span>
              <span className="text-[10px] bg-amber-950/80 text-amber-300 px-1.5 py-0.2 rounded border border-amber-700/60">
                Step {Math.min(currentStep + 1, 5)} of 5
              </span>
            </h2>
            <p className="text-[10px] text-amber-400/80">
              {currentZone === 'tutorial_island' ? 'Isle of Beginnings Orientation' : 'Beginner Realm Orientation & Essentials'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onToggleCollapse();
            }}
            className="rpg-btn-square-brown h-6 w-6 text-[10px]"
            title="Minimize Tutorial Guide"
          >
            <span>▾</span>
          </button>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onDismiss();
            }}
            className="rpg-btn-beige h-6 px-1.5 text-[10px] font-bold"
            title="Skip Tutorial & Sail to Homestead"
          >
            Skip ✕
          </button>
        </div>
      </div>

      {/* 2. Visual Stepper Progress Ribbon */}
      <div className="flex items-center justify-between px-1 py-1 bg-amber-950/40 rounded border border-amber-900/40">
        {steps.map((st, index) => {
          const isDone = isCompleted || index < currentStep;
          const isCurrent = !isCompleted && index === currentStep;

          return (
            <div key={st.id} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold font-serif transition-transform ${
                    isDone
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950'
                      : isCurrent
                      ? 'bg-amber-500 text-stone-900 ring-2 ring-amber-300 ring-offset-1 ring-offset-stone-900 scale-110'
                      : 'bg-stone-800 text-stone-400 border border-stone-700'
                  }`}
                  title={`${st.badge}: ${st.title}`}
                >
                  {isDone ? '✓' : st.step}
                </div>
                <span
                  className={`text-[8px] font-sans tracking-tight text-center ${
                    isCurrent
                      ? 'text-amber-300 font-bold'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-stone-500'
                  }`}
                >
                  {st.badge}
                </span>
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`h-0.5 flex-1 mx-1 rounded ${
                    isDone ? 'bg-emerald-500' : 'bg-stone-700/60'
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* 3. Active Step Details Card */}
      {!isCompleted && activeStep && (
        <div className="flex flex-col gap-2 p-2 bg-stone-900/60 rounded border border-amber-900/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-base">{activeStep.icon}</span>
              <h3 className="text-xs font-serif font-bold text-amber-100">
                {activeStep.title}
              </h3>
            </div>
            <span className="text-[10px] font-mono bg-amber-900/50 text-amber-300 px-1.5 py-0.5 rounded border border-amber-700/50">
              {activeStep.keyHint}
            </span>
          </div>

          <p className="text-[11px] text-stone-200 leading-snug">
            {activeStep.instruction}
          </p>

          <div className="text-[10px] bg-amber-950/60 text-amber-300/90 p-1.5 rounded border border-amber-800/40 flex items-start gap-1">
            <span className="text-amber-400">💡</span>
            <span>{activeStep.tip}</span>
          </div>

          {/* Interactive shortcuts */}
          {activeStep.id === 'pouch' && (
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onOpenPouch();
              }}
              className="rpg-btn-beige text-[11px] py-1 px-2 font-bold flex items-center justify-center gap-1 shadow-md"
            >
              <span>🎒</span>
              <span>Open Adventurer Pouch Now [I]</span>
            </button>
          )}

          {activeStep.id === 'atlas' && (
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onOpenAtlas();
              }}
              className="rpg-btn-beige text-[11px] py-1 px-2 font-bold flex items-center justify-center gap-1 shadow-md"
            >
              <span>🗺️</span>
              <span>Open Full World Atlas [M]</span>
            </button>
          )}
        </div>
      )}

      {/* 4. Tutorial Completed Card */}
      {isCompleted && (
        <div className="flex flex-col gap-2 p-2.5 bg-emerald-950/50 rounded border border-emerald-700/70 text-center animate-fadeIn">
          <div className="text-2xl">🎉</div>
          <h3 className="text-xs font-serif font-bold text-emerald-200">
            Awakening Journey Completed!
          </h3>
          <p className="text-[10px] text-emerald-300/90">
            You have mastered the realm essentials. You are ready to explore the Sunforge lands!
          </p>
          <button
            type="button"
            onClick={onClaimReward}
            className="rpg-btn-beige text-xs py-1.5 px-3 font-bold flex items-center justify-center gap-1 shadow-lg border-emerald-500 hover:brightness-110"
          >
            <span>🏆</span>
            <span>Claim +50 Gold & +50 XP Reward!</span>
          </button>
        </div>
      )}

      {/* 5. Footer Quick Reminder */}
      <div className="flex items-center justify-between text-[9px] text-amber-400/60 pt-1 border-t border-amber-900/40">
        <span>Press [?] anytime in top-right for controls</span>
        <span>Progress saves automatically</span>
      </div>
    </aside>
  );
}
