import React from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';

export default function MissionsHeader({ playerLevel }) {
    return (
        <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <SectionHeader
                kicker="The Warden's Chronicle"
                title="Estate Decrees & Orders"
                description="Fulfill ancestral decrees and imperial orders to restore the Hearthlands and unlock renown."
            />
            <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[140px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Player Level</p>
                <p className="mt-1 text-4xl font-black text-white">{playerLevel}</p>
            </Panel>
        </div>
    );
}
