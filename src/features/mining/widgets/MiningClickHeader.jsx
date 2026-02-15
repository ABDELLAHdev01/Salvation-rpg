import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';

const MiningClickHeader = ({ miningLevel }) => {
    return (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
            <SectionHeader
                kicker="The Depths"
                title="Crystal Caverns"
                description="Mine rare ores and ancient artifacts. Precision yields greater rewards."
            />
            <Panel variant="subtle" className="text-center min-w-[120px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Mining Mastery</p>
                <p className="mt-1 text-3xl font-black text-cyan-400 drop-shadow-sm">Lvl {miningLevel}</p>
            </Panel>
        </div>
    );
};

export default memo(MiningClickHeader);
