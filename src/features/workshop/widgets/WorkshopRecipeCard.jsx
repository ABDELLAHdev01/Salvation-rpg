import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';

const WorkshopRecipeCard = ({
    recipe, quantity, setQuantity, craftable,
    getOutputName, getRecipeTags, getOwnedForInput,
    getInputName, formatDuration, upgrade, handleQueue, canCraft
}) => {
    const q = quantity || 1;
    const tags = getRecipeTags(recipe);

    return (
        <Panel variant="subtle" className="hover:border-yellow-500/30 transition-all p-5">
            <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-white">{getOutputName(recipe)}</h4>
                <Badge variant="ghost">Lvl {recipe.levelRequired}</Badge>
            </div>

            {tags.length > 0 && (
                <div className="flex gap-2 mb-4">
                    {tags.map(t => <Badge key={t} variant="info" className="lowercase">{t}</Badge>)}
                </div>
            )}

            <div className="space-y-2 mb-4">
                {recipe.inputs.map((input) => {
                    const owned = getOwnedForInput(input);
                    const req = input.amount * q;
                    return (
                        <div key={input.id} className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">{getInputName(input)}</span>
                            <span className={owned >= req ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                                {owned}/{req}
                            </span>
                        </div>
                    );
                })}
            </div>

            <div className="flex items-center justify-between text-[10px] uppercase tracking-widest text-gray-500 mb-4 font-bold border-t border-yellow-700/5 pt-3">
                <span>{formatDuration(recipe.durationMs * q * (upgrade?.durationMultiplier || 1))}</span>
                <span className="text-yellow-500">+{recipe.xp * q} XP</span>
            </div>

            <div className="flex gap-2">
                <input
                    type="number"
                    min="1"
                    value={q}
                    onChange={(e) => setQuantity(recipe.id, e.target.value)}
                    className="w-16 rounded-xl border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-white focus:border-yellow-500/50 outline-none"
                />
                <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleQueue(recipe.id, q)}
                    disabled={!craftable}
                >
                    Craft {q > 1 ? `x${q}` : ''}
                </Button>
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleQueue(recipe.id, 5)}
                    disabled={!canCraft(recipe, 5)}
                >
                    5
                </Button>
            </div>
        </Panel>
    );
};

export default memo(WorkshopRecipeCard);
