import React, { memo } from 'react';
import { Link } from 'react-router-dom';
import Panel from '../../../shared/ui/Panel';
import XpBar from '../../../shared/ui/XpBar';

const SkillProgressGrid = ({
    miningLevel, miningXp, miningXpTarget, miningInProgress,
    farmLevel, farmXp, farmXpTarget, farmLandSize,
    workshopLevel, workshopXp, workshopXpTarget, workshopQueueLength
}) => {
    return (
        <div className="grid gap-4 sm:grid-cols-3">
            <Panel variant="subtle" className="group hover:border-cyan-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Mining</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">Level {miningLevel}</p>
                <div className="mt-3">
                    <XpBar current={miningXp} target={miningXpTarget} label="Mining" tone="cyan" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>{miningInProgress ? 'MAPPING...' : 'IDLE'}</span>
                    <Link to="/mining" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
            </Panel>

            <Panel variant="subtle" className="group hover:border-emerald-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Farmstead</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">Level {farmLevel}</p>
                <div className="mt-3">
                    <XpBar current={farmXp} target={farmXpTarget} label="Farming" tone="emerald" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>{farmLandSize ?? 0} PLOTS</span>
                    <Link to="/farm" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
            </Panel>

            <Panel variant="subtle" className="group hover:border-amber-500/30 transition-colors">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Workshop</p>
                <p className="mt-1 text-lg font-bold text-white group-hover:text-amber-400 transition-colors">Level {workshopLevel}</p>
                <div className="mt-3">
                    <XpBar current={workshopXp} target={workshopXpTarget} label="Craft" tone="emerald" />
                </div>
                <div className="mt-3 flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                    <span>{workshopQueueLength} JOBS</span>
                    <Link to="/workshop" className="text-yellow-500 uppercase tracking-widest hover:underline decoration-1 underline-offset-4">Jump</Link>
                </div>
            </Panel>
        </div>
    );
};

export default memo(SkillProgressGrid);
