import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import SectionHeader from '../../../shared/ui/SectionHeader';
import { getCityById } from '../../../core/data/citiesData';

const PlayerIdentityCard = ({ character, playerLevel, cityId }) => {
    const avatarSrc = (() => {
        const raw = character?.avatarUrl || '/raceicon/noimage.webp';
        return raw.startsWith('/') ? raw : `/${raw}`;
    })();

    const cityData = cityId ? getCityById(String(cityId).toLowerCase()) : null;
    const perk = cityData?.perk;

    return (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border-2 border-yellow-700/40 bg-gray-900/90 shadow-2xl mx-auto sm:mx-0">
                    <img
                        src={avatarSrc}
                        alt={character?.name || 'Unknown adventurer'}
                        className="h-full w-full object-cover"
                        onError={(event) => {
                            event.currentTarget.src = '/raceicon/noimage.webp';
                        }}
                    />
                </div>
                <div className="text-center sm:text-left">
                    <SectionHeader
                        kicker="Command Deck"
                        title={character?.name || 'Unbound Wanderer'}
                        description={`${character?.race || 'Unknown'} · ${character?.className || 'Adventurer'}`}
                    />
                    {cityData && (
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-yellow-700/40 bg-gray-950/70 px-2.5 py-0.5 text-yellow-300 font-medium">
                                <img src={cityData.logo} alt={cityData.name} className="h-3.5 w-3.5 object-contain" />
                                {cityData.name}
                            </span>
                            {perk && (
                                <span className="text-[11px] text-gray-400">
                                    ✦ {perk.name}
                                </span>
                            )}
                        </div>
                    )}
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
