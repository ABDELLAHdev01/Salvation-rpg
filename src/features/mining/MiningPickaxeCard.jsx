import React from 'react';
import Panel from '../../components/ui/Panel';
import SectionHeader from '../../components/ui/SectionHeader';

export default function MiningPickaxeCard({ pickaxeLevel, currentPickaxe }) {
    return (
        <Panel className="p-4">
            <SectionHeader kicker="Pickaxe Level" className="mb-2" />
            <p className="mt-2 text-2xl font-semibold text-white">{pickaxeLevel}</p>
            <p className="mt-2 text-xs text-gray-400">
                {currentPickaxe?.name || 'Pickaxe'} | {currentPickaxe?.rarity || 'Common'}
            </p>
            {currentPickaxe?.visual && (
                <p className="mt-1 text-xs text-gray-500">{currentPickaxe.visual}</p>
            )}
        </Panel>
    );
}
