import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';

const ZoneControlPanel = ({ activeZone, unlockedZones, handleZoneChange }) => {
    return (
        <Panel variant="subtle" className="flex flex-col justify-center">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold mb-3 px-1">Zone Control</p>
            <select
                value={activeZone?.id || ''}
                onChange={handleZoneChange}
                className="w-full rounded-xl border border-yellow-700/20 bg-gray-950/90 px-4 py-2.5 text-sm text-yellow-100 focus:border-yellow-500/50 outline-none transition-all"
            >
                {unlockedZones.map((zone) => (
                    <option key={zone.id} value={zone.id} className="bg-gray-950">
                        {zone.name}
                    </option>
                ))}
            </select>
            <div className="mt-3 flex items-center gap-2 text-[10px] text-gray-500 uppercase tracking-widest px-1">
                <span className="font-bold text-yellow-500/70">Current:</span>
                <span>{activeZone?.name}</span>
            </div>
        </Panel>
    );
};

export default memo(ZoneControlPanel);
