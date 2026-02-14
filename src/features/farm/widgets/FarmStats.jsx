import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import XpBar from '../../../shared/ui/XpBar';
import Badge from '../../../shared/ui/Badge';

const FarmStats = ({ farmXp, farmXpTarget, landSize, gold, farmWeather }) => {
    return (
        <Panel variant="glass">
            <XpBar current={farmXp} target={farmXpTarget} label="Farming Progression" tone="emerald" />
            <div className="mt-4 flex flex-wrap gap-3">
                <Badge variant="success">Land Size: {landSize}</Badge>
                <Badge variant="gold">Gold: {gold}</Badge>
                {farmWeather && (
                    <Badge variant="info">{farmWeather.label} ({farmWeather.season})</Badge>
                )}
            </div>
        </Panel>
    );
};

export default memo(FarmStats);
