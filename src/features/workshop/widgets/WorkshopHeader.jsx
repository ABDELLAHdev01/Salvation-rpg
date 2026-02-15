import React from 'react';
import Panel from '../../../shared/ui/Panel';
import Badge from '../../../shared/ui/Badge';
import XpBar from '../../../shared/ui/XpBar';
import SectionHeader from '../../../shared/ui/SectionHeader';

export default function WorkshopHeader({ workshopLevel, workshopXp, workshopXpTarget, activeJobsCount, gold, upgradeName }) {
    return (
        <>
            <div className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <SectionHeader
                    kicker="Crafting Hub"
                    title="The Grand Workshop"
                    description="Refine raw resources into legendary artifacts. Precision is the path to power."
                />
                <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[120px]">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Forge Mastery</p>
                    <p className="mt-1 text-3xl font-black text-amber-500 drop-shadow-sm">Lvl {workshopLevel}</p>
                </Panel>
            </div>

            <Panel variant="glass" className="mb-8">
                <XpBar current={workshopXp} target={workshopXpTarget || 1} label="Workshop Progression" tone="gold" />
                <div className="mt-4 flex flex-wrap gap-3">
                    <Badge variant="gold">Active Jobs: {activeJobsCount}</Badge>
                    <Badge variant="cyan">Gold: {gold}</Badge>
                    <Badge variant="info">Tools: {upgradeName || 'Basic'}</Badge>
                </div>
            </Panel>
        </>
    );
}
