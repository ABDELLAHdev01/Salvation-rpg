import React, { memo } from 'react';
import Panel from '../../../shared/ui/Panel';

const seasonBannerMap = {
    spring: '/farm/seasons/Spring.webp',
    summer: '/farm/seasons/Summer.webp',
    autumn: '/farm/seasons/Autumnpng.webp',
    winter: '/farm/seasons/winterpng.webp',
};

const getSeasonBanner = (season) => seasonBannerMap[season] || '/farm.webp';

const FarmWeatherPanel = ({ farmWeather }) => {
    if (!farmWeather) return null;

    return (
        <Panel variant="ornament">
            <p className="text-[10px] uppercase tracking-[0.3em] text-gray-300 font-bold mb-4">Seasonal Climate</p>
            <div className="aspect-video overflow-hidden rounded-xl bg-gray-900/80 mb-4">
                <img
                    src={getSeasonBanner(farmWeather.season)}
                    alt={`${farmWeather.season} banner`}
                    className="h-full w-full object-cover mix-blend-lighten opacity-80"
                />
            </div>
            <h4 className="text-xl font-bold text-white">{farmWeather.label}</h4>
            <p className="mt-2 text-sm text-gray-400">
                Current Season: <span className="text-yellow-500 font-bold uppercase">{farmWeather.season}</span>
            </p>
            <div className="mt-4 space-y-2">
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Growth Rate</span>
                    <span className="text-emerald-400 font-bold">x{farmWeather.growMultiplier}</span>
                </div>
                <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Yield Multiplier</span>
                    <span className="text-yellow-400 font-bold">x{farmWeather.yieldMultiplier}</span>
                </div>
            </div>
        </Panel>
    );
};

export default memo(FarmWeatherPanel);
