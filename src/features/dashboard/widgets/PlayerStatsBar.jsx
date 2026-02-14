import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import XpBar from '../../../shared/ui/XpBar';

const PlayerStatsBar = ({ playerXp, playerXpTarget, gold, activeHouse }) => {
    return (
        <Panel variant="subtle" className="mt-8">
            <XpBar current={playerXp} target={playerXpTarget} label="Character XP" tone="gold" />
            <div className="mt-4 flex flex-wrap items-center gap-3">
                <Badge variant="gold">
                    <span className="text-yellow-500 font-black">●</span>
                    Gold: {gold ?? 0}
                </Badge>
                <Badge variant="ghost">
                    Residence: {activeHouse?.name || 'Starter Cottage'}
                </Badge>
                <Badge variant="info">
                    Buff: {activeHouse?.effect?.name || 'Rested Comfort'}
                </Badge>
            </div>
        </Panel>
    );
};

export default memo(PlayerStatsBar);
