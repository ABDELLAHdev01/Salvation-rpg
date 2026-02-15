import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';

const PlayerIdentityCard = ({ character, playerLevel }) => {
    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-yellow-700/40 bg-gray-900/90 shadow-2xl mx-auto sm:mx-0">
                    <img
                        src={character?.avatarUrl || '/raceicon/noimage.webp'}
                        alt={character?.name || 'Unknown adventurer'}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div className="text-center sm:text-left">
                    <SectionHeader
                        kicker="Command Deck"
                        title={character?.name || 'Unbound Wanderer'}
                        description={`${character?.race || 'Unknown'} · ${character?.className || 'Adventurer'}`}
                    />
                </div>
            </div>
            <Panel variant="subtle" className="text-center w-full sm:w-auto sm:min-w-[100px]">
                <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Level</p>
                <p className="mt-1 text-4xl font-black text-yellow-400 drop-shadow-sm">{playerLevel}</p>
            </Panel>
        </div>
    );
};

export default memo(PlayerIdentityCard);
