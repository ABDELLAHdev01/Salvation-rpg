import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';
import Button from '../../../shared/ui/Button';

const MissionSpotlight = ({ missionSpotlight }) => {
    console.log(missionSpotlight)
    return (
        <Panel variant="card" className="court-reveal-delay-1 flex flex-col h-full">
            <SectionHeader
                kicker="Missions"
                title="Spotlight"
                description="Active progression goals."
            />
            <div className="mt-6 flex-1 space-y-4">
                {missionSpotlight.length === 0 ? (
                    <Panel variant="subtle" className="text-center py-10">
                        <p className="text-sm text-gray-400 italic">Missions will appear as you progress.</p>
                    </Panel>
                ) : (
                    missionSpotlight.map((mission) => (
                        <div key={mission.id} className="group">
                            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1.5 px-1">
                                <span>{mission.label}</span>
                                <span className={mission.complete ? 'text-emerald-400 animate-pulse' : 'text-yellow-400'}>
                                    {mission.complete ? 'READY' : `${mission.percent}%`}
                                </span>
                            </div>
                            <div className="relative h-2 rounded-full bg-gray-900 border border-white/5 overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-700 shimmer-bar ${mission.complete ? 'bg-emerald-500/80 shadow-[0_0_8px_rgba(16,185,129,0.3)]' : 'bg-yellow-500/80 shadow-[0_0_8px_rgba(234,179,8,0.3)]'}`}
                                    style={{ width: `${mission.percent}%` }}
                                />
                            </div>
                        </div>
                    ))
                )}
            </div>
            <Button variant="ornate" to="/missions" className="mt-8">
                Open Log
            </Button>
        </Panel>
    );
};

export default memo(MissionSpotlight);
