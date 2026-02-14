import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import ProgressBar from '../../../shared/ui/ProgressBar';

const MissionsStats = ({ gold, completedCount, totalCount }) => {
    return (
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Panel variant="subtle" className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400">Current Gold</span>
                <span className="text-xl font-bold text-yellow-500">{gold.toLocaleString()}g</span>
            </Panel>
            <Panel variant="subtle" className="flex items-center justify-between">
                <span className="text-xs uppercase tracking-widest text-gray-400">Missions Run</span>
                <span className="text-xl font-bold text-white">{completedCount}/{totalCount}</span>
            </Panel>
            <Panel variant="glass" className="sm:col-span-2 lg:col-span-1 py-3">
                <ProgressBar
                    current={completedCount}
                    target={totalCount}
                    tone="gold"
                    label="Legacy Completion"
                />
            </Panel>
        </div>
    );
};

export default memo(MissionsStats);
