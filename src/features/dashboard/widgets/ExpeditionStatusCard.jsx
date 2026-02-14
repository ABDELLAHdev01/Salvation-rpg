import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';
import Button from '../../../shared/ui/Button';

const ExpeditionStatusCard = ({ expeditionLocation, expeditionReady, expeditionRemaining, formatDuration }) => {
    return (
        <Panel variant="ornament" className="group">
            <SectionHeader kicker="Expedition" />
            <p className="mt-2 text-xl font-bold text-white transition-colors group-hover:text-yellow-400">
                {expeditionLocation ? expeditionLocation.name : 'No active mission'}
            </p>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed line-clamp-2">
                {expeditionLocation?.summary || 'Deploy a crew to start earning rewards and uncovering secrets.'}
            </p>
            <div className="mt-5 flex items-center justify-between">
                <div className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">
                    {expeditionLocation
                        ? expeditionReady
                            ? <span className="text-emerald-400 animate-pulse">Ready to claim</span>
                            : `Returns in: ${formatDuration(expeditionRemaining)}`
                        : 'Crews idle'}
                </div>
                <Button
                    variant={expeditionLocation ? 'primary' : 'secondary'}
                    size="sm"
                    to={expeditionLocation ? '/expedition-active' : '/adventure'}
                >
                    {expeditionLocation ? 'Monitor' : 'Deploy'}
                </Button>
            </div>
        </Panel>
    );
};

export default memo(ExpeditionStatusCard);
