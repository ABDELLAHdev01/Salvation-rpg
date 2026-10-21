import React, { useState } from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import characterService from '../../../core/services/CharacterService';
import { addItems, removeItems } from '../../../core/services/inventoryService';
import { getItemIcon } from '../../../core/data/itemIcons';
import { recordContractProgress } from '../../../core/quests/guildContracts';

const FORGE_RECIPES = [
  {
    id: 'iron-bar',
    name: 'Refined Iron Bar',
    icon: '🧱',
    category: 'Smelting',
    desc: 'Smelt raw iron ore in the high-heat forge chamber.',
    inputs: [{ id: 'iron', name: 'Iron Ore', count: 3 }],
    output: { id: 'iron-bar', name: 'Refined Iron Bar', count: 1 },
    xp: 25,
  },
  {
    id: 'copper-bar',
    name: 'Refined Copper Bar',
    icon: '🧱',
    category: 'Smelting',
    desc: 'Smelt malleable copper veins into sturdy bars.',
    inputs: [{ id: 'copper', name: 'Copper Ore', count: 3 }],
    output: { id: 'copper-bar', name: 'Refined Copper Bar', count: 1 },
    xp: 25,
  },
  {
    id: 'gold-bar',
    name: 'Gilded Sunforge Bar',
    icon: '🪙',
    category: 'Smelting',
    desc: 'Purify raw gold seam deposits into royal currency bullion.',
    inputs: [{ id: 'gold', name: 'Gold Ore', count: 3 }],
    output: { id: 'gold-bar', name: 'Gilded Sunforge Bar', count: 1 },
    xp: 45,
  },
  {
    id: 'health-potion',
    name: 'Health Elixir (+45 HP)',
    icon: '🧪',
    category: 'Alchemy',
    desc: 'Distill harvested sylvan herbs into a restorative combat tonic.',
    inputs: [{ id: 'herb', name: 'Sun Herbal Leaves', count: 2 }],
    output: { id: 'health-potion', name: 'Health Elixir', count: 1 },
    xp: 30,
  },
  {
    id: 'steel_broadsword',
    name: 'Steel Broadsword',
    icon: '⚔️',
    category: 'Smithing',
    desc: 'Temper steel bars into a formidable blade (+18 Physical Power).',
    inputs: [{ id: 'iron-bar', name: 'Refined Iron Bar', count: 3 }],
    output: { id: 'steel_broadsword', name: 'Steel Broadsword', count: 1 },
    xp: 60,
  },
];

export default function InGameForgeModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate = () => {},
}) {
  const [selectedRecipe, setSelectedRecipe] = useState(FORGE_RECIPES[0]);

  if (!isOpen) return null;

  const inventory = profile?.inventory || {};

  const canCraft = (recipe) => {
    return recipe.inputs.every((inp) => (inventory[inp.id] || 0) >= inp.count);
  };

  const handleCraft = (recipe) => {
    if (!canCraft(recipe)) {
      toast.error('Insufficient materials for this recipe.');
      return;
    }

    audioManager.play('anvil');

    // Deduct inputs
    const deductionMap = recipe.inputs.reduce((acc, it) => {
      acc[it.id] = it.count;
      return acc;
    }, {});
    let nextInv = removeItems(inventory, deductionMap);

    // Add output
    nextInv = addItems(nextInv, { [recipe.output.id]: recipe.output.count });

    const nextXp = (profile?.workshopXp || 0) + recipe.xp;

    const progress = recordContractProgress(
      'forge:crafted',
      { itemId: recipe.output.id, count: recipe.output.count },
      profile?.activeContracts || []
    );

    const updated = characterService.updateMockProfile({
      inventory: nextInv,
      workshopXp: nextXp,
      ...(progress.updated ? { activeContracts: progress.activeContracts } : {}),
    });

    onProfileUpdate(updated);
    toast.success(`Crafted ${recipe.output.name}! (+${recipe.xp} XP)`, { icon: '⚒️' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-fadeIn select-none">
      <div className="rpg-panel-brown relative w-full max-w-3xl p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">⚒️</span>
            <div>
              <h2 className="font-serif text-lg font-bold text-amber-100 tracking-wide sm:text-xl drop-shadow">
                Artisan Forge &amp; Crucible
              </h2>
              <p className="text-xs text-amber-300/70">
                Smelt ores, forge tempered blades, and brew restorative elixirs
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="mt-5 grid gap-6 md:grid-cols-[1fr_260px]">
          {/* Recipe List */}
          <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1 custom-scrollbar">
            {FORGE_RECIPES.map((recipe) => {
              const craftable = canCraft(recipe);
              const isSelected = selectedRecipe.id === recipe.id;

              return (
                <div
                  key={recipe.id}
                  onClick={() => setSelectedRecipe(recipe)}
                  className={`rpg-slot-inset flex items-center justify-between p-3.5 cursor-pointer transition ${
                    isSelected
                      ? 'bg-amber-950/40 ring-1 ring-amber-400'
                      : 'bg-stone-950/70 hover:brightness-110'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded bg-black/60 border border-amber-900/60 p-1.5 shadow-inner">
                      <img src={getItemIcon(recipe.output.id)} alt={recipe.name} className="h-8 w-8 object-contain pixelated drop-shadow-md" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-sm text-amber-100">{recipe.name}</h4>
                      <p className="text-[11px] text-amber-300/70">{recipe.desc}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={!craftable}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCraft(recipe);
                      }}
                      className={`${
                        craftable
                          ? 'rpg-btn-beige'
                          : 'rpg-btn-brown opacity-60 cursor-not-allowed'
                      } text-xs py-1 px-3`}
                    >
                      Forge
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recipe Details Panel */}
          <div className="rpg-slot-inset p-4 bg-stone-950/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 text-amber-300 font-serif font-bold text-sm border-b border-amber-900/50 pb-2">
                <img src={getItemIcon(selectedRecipe.output.id)} alt={selectedRecipe.name} className="h-5 w-5 object-contain pixelated" />
                <span>{selectedRecipe.name}</span>
              </div>

              <div className="mt-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">
                  Required Materials:
                </span>
                <div className="mt-2 space-y-2">
                  {selectedRecipe.inputs.map((inp) => {
                    const owned = inventory[inp.id] || 0;
                    const hasEnough = owned >= inp.count;

                    return (
                      <div
                        key={inp.id}
                        className="rpg-slot-inset flex items-center justify-between p-2 text-xs bg-stone-900/70"
                      >
                        <div className="flex items-center gap-2">
                          <img src={getItemIcon(inp.id)} alt={inp.name} className="h-4 w-4 object-contain pixelated" />
                          <span className="text-amber-100">{inp.name}</span>
                        </div>
                        <span
                          className={`font-mono font-bold ${
                            hasEnough ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {owned} / {inp.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="mt-4 rounded border border-amber-900/50 bg-amber-950/30 p-2.5 text-[11px] text-amber-300/90 font-serif">
                ⭐ Grants <span className="font-bold text-amber-200">+{selectedRecipe.xp} Workshop XP</span> on completion.
              </div>
            </div>

            <button
              type="button"
              disabled={!canCraft(selectedRecipe)}
              onClick={() => handleCraft(selectedRecipe)}
              className={`${
                canCraft(selectedRecipe)
                  ? 'rpg-btn-beige text-amber-950'
                  : 'rpg-btn-brown opacity-60 cursor-not-allowed'
              } mt-4 w-full py-2 font-serif text-xs font-bold`}
            >
              Forge {selectedRecipe.name} ⚒️
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-amber-900/50 pt-4 text-xs text-amber-300/70">
          <span>Workshop Forge active in Sunforge Homestead</span>
          <button
            type="button"
            onClick={() => {
              audioManager.play('tap');
              onClose();
            }}
            className="rpg-btn-brown text-xs py-1.5 px-4"
          >
            Back to Realm
          </button>
        </div>
      </div>
    </div>
  );
}
