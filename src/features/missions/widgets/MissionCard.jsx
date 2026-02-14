import React from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import Button from '../../../shared/ui/Button';

export default function MissionCard({ mission, progress, isComplete, handleClaim }) {
    const progressPct = mission.type === 'house'
        ? (isComplete ? 100 : 0)
        : Math.min(100, (progress / mission.target) * 100);

    return (
        <Panel
            variant={isComplete && !mission.claimed ? 'ornament' : 'card'}
            className={`transition-all duration-300 ${mission.claimed ? 'opacity-60 grayscale-[0.5]' : ''}`}
        >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex-1 w-full">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">{mission.label}</h3>
                        {mission.claimed && <Badge variant="success">Claimed</Badge>}
                        {isComplete && !mission.claimed && <Badge variant="gold" className="animate-pulse">Ready</Badge>}
                    </div>

                    <div className="mt-3 grid gap-x-6 gap-y-1 sm:grid-cols-2 text-xs text-gray-400 font-medium">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Progress:</span>
                            <span className={isComplete ? 'text-emerald-400' : 'text-gray-300'}>
                                {mission.type === 'house' ? (isComplete ? 'Owned' : 'Not owned') : `${progress} / ${mission.target}`}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-600">Reward:</span>
                            <span className="text-yellow-600/80">
                                +{mission.rewardGold}g, +{mission.rewardLevels} lvl, +{mission.rewardXp} XP
                            </span>
                        </div>
                    </div>

                    {!mission.claimed && (
                        <div className="mt-4 h-1 w-full bg-gray-800 rounded-full overflow-hidden">
                            <div
                                className={`h-full transition-all duration-1000 ${isComplete ? 'bg-emerald-500' : 'bg-yellow-500/50'}`}
                                style={{ width: `${progressPct}%` }}
                            />
                        </div>
                    )}
                </div>

                <Button
                    variant={isComplete && !mission.claimed ? 'ornate' : 'secondary'}
                    onClick={() => handleClaim(mission.id)}
                    disabled={!isComplete || mission.claimed}
                    size="sm"
                    className="min-w-[120px]"
                >
                    {mission.claimed ? 'Archived' : isComplete ? 'Claim Reward' : 'In Progress'}
                </Button>
            </div>
        </Panel>
    );
}
