import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';
import { getCityById } from '../../../core/data/citiesData';

const PlayerIdentityCard = ({ character, playerLevel, cityId, title }) => {
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
                    <p className="text-[10px] uppercase tracking-[0.3em] text-yellow-500 font-bold mb-1">Command Deck</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                        <h2 className="text-2xl sm:text-3xl font-black text-white hero-title">
                            {character?.name || 'Unbound Wanderer'}
                        </h2>
                        <span className="rounded-md border border-yellow-700/40 bg-yellow-950/60 px-2.5 py-0.5 text-xs font-bold text-yellow-300">
                            «{title || 'Warden Initiate'}»
                        </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                        {character?.race || 'Unknown'} · {character?.className || 'Adventurer'}
                    </p>
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
