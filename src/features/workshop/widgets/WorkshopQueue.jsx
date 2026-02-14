import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';

const WorkshopQueue = ({ jobs, getRecipeOutputName, formatDuration, upgrade, getWorkshopRecipe }) => {
    return (
        <Panel variant="card">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-4">Production Queue</p>
            {jobs.length === 0 ? (
                <p className="text-sm text-gray-500 italic py-4">No active commissions.</p>
            ) : (
                <div className="space-y-4">
                    {jobs.map((job) => {
                        const recipe = getWorkshopRecipe(job.recipeId);
                        const totalDuration = (recipe?.durationMs || 0) * job.quantity * (upgrade?.durationMultiplier || 1);
                        const progress = totalDuration > 0 ? Math.max(5, 100 - (job.remainingMs / totalDuration) * 100) : 100;

                        return (
                            <div key={job.id} className="group rounded-xl border border-yellow-700/10 bg-gray-950/40 p-4 transition-all hover:bg-gray-950/60">
                                <div className="flex justify-between items-start">
                                    <p className="text-sm font-bold text-white">{getRecipeOutputName(job.recipeId)}</p>
                                    <Badge variant="cyan">x{job.quantity}</Badge>
                                </div>
                                <div className="mt-3">
                                    <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">
                                        <span>Progress</span>
                                        <span className="text-cyan-400">{formatDuration(job.remainingMs)}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </Panel>
    );
};

export default memo(WorkshopQueue);
