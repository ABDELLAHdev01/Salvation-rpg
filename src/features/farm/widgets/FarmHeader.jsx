import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';

const FarmHeader = ({ farmLevel }) => {
    return (
        <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
            <SectionHeader
                kicker="Harvestlands"
                title="Farm Plots"
                description="Cultivate the soil and expand your botanical empire. Nature provides for the patient."
            />
            <Panel variant="subtle" className="text-center min-w-[120px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Botany Mastery</p>
                <p className="mt-1 text-3xl font-black text-emerald-400 drop-shadow-sm">Lvl {farmLevel}</p>
            </Panel>
        </div>
    );
};

export default memo(FarmHeader);
