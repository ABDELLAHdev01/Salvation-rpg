import React from 'react';
import { getItemCount } from '../../core/services/inventoryService';

export default function FarmTaskGroup({
    label,
    periodKey,
    tasks,
    doneCount,
    totalCount,
    inventory,
    handleDeliver,
}) {
    return (
        <div className="rounded-2xl border border-yellow-700/20 bg-gray-950/70 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{label}</p>
                    <p className="mt-2 text-sm text-gray-300">
                        {doneCount}/{totalCount} complete
                    </p>
                </div>
            </div>
            <div className="mt-4 space-y-3">
                {tasks.map((task) => {
                    const owned = getItemCount(inventory, task.goodId);
                    const remaining = Math.max(0, task.target - task.progress);
                    const canDeliver = owned > 0 && !task.claimed;
                    return (
                        <div
                            key={task.id}
                            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-3"
                        >
                            <div>
                                <p className="text-sm font-semibold text-white">{task.label}</p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Delivered {task.progress}/{task.target} · Owned {owned}
                                </p>
                                <p className="mt-1 text-xs text-gray-400">
                                    Rewards: +{task.rewardXp} XP · +{task.rewardGold}g
                                </p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => handleDeliver(periodKey, task.id)}
                                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${task.claimed
                                        ? 'bg-gray-700 text-gray-300'
                                        : canDeliver
                                            ? 'action-primary text-white'
                                            : 'bg-gray-700 text-gray-300'
                                        }`}
                                    disabled={!canDeliver}
                                >
                                    {task.claimed ? 'Complete' : remaining === 0 ? 'Complete' : 'Deliver'}
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
