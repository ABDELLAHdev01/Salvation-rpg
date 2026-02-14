import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import XpBar from '../../../shared/ui/XpBar';
import Badge from '../../../shared/ui/Badge';

const MiningClickStats = ({
    miningXp, miningXpTarget, pickaxeLevel, miningForgeLevel,
    activeBoost
}) => {
    return (
        <Panel variant="glass">
            <XpBar current={miningXp} target={miningXpTarget} label="Geology Progression" tone="cyan" />
            <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="cyan">Pickaxe Lvl: {pickaxeLevel}</Badge>
                <Badge variant="gold">Forge: {miningForgeLevel}</Badge>
                {activeBoost && (
                    <Badge variant="info">Boost Active</Badge>
                )}
            </div>
        </Panel>
    );
};

export default memo(MiningClickStats);
