import React from 'react';
import { formatDuration } from '../../data/miningData';
import { farmCrops } from '../../data/farmData';

export default function PlotCard({
    plot,
    now,
    openPlantModal,
    handleHarvest,
    plotRefs,
}) {
    const crop = plot.cropId ? farmCrops.find((entry) => entry.id === plot.cropId) : null;
    const remaining = plot.harvestAt ? Math.max(0, plot.harvestAt - now) : 0;
    const isReady = !!plot.harvestAt && remaining <= 0;
    const plotState = crop ? (isReady ? 'ready' : 'planted') : 'empty';
    const frameOffset = plotState === 'empty' ? 0 : plotState === 'planted' ? 33.333 : 66.666;
    const frameOffsetY = 0;
    const frameScaleY = 1;
    const isActionable = plotState === 'empty' || plotState === 'ready';

    const handlePlotClick = () => {
        if (plotState === 'empty') {
            openPlantModal(plot.id, 'single');
            return;
        }
        if (plotState === 'ready') {
            handleHarvest(plot.id);
        }
    };

    return (
        <div
            ref={(node) => {
                if (node) {
                    plotRefs.current.set(plot.id, node);
                } else {
                    plotRefs.current.delete(plot.id);
                }
            }}
            className={`relative mx-auto w-full max-w-[320px] overflow-hidden rounded-xl transition-transform duration-200 ${isActionable ? 'cursor-pointer hover:-translate-y-1 hover:shadow-xl' : ''
                }`}
            onClick={isActionable ? handlePlotClick : undefined}
            role={isActionable ? 'button' : undefined}
            tabIndex={isActionable ? 0 : undefined}
            onKeyDown={
                isActionable
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                            event.preventDefault();
                            handlePlotClick();
                        }
                    }
                    : undefined
            }
        >
            <div className="w-full overflow-hidden leading-none text-[0px]">
                <img
                    src="/plot/plotcCasesV2.png"
                    alt="Plot state"
                    className="block w-[300%] max-w-none align-top"
                    style={{
                        transform: `translate(-${frameOffset}%, ${frameOffsetY}%) scale(1, ${frameScaleY})`,
                        transformOrigin: 'center',
                    }}
                />
            </div>
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/90 via-gray-950/70 to-transparent p-4">
                <p className="text-xs uppercase tracking-[0.3em] text-gray-400">Plot {plot.id + 1}</p>
                {crop ? (
                    <>
                        <p className="mt-2 text-sm font-semibold text-white">{crop.name}</p>
                        <p className="mt-1 text-xs text-gray-400">
                            {isReady ? 'Ready to harvest' : `Ready in ${formatDuration(remaining)}`}
                        </p>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleHarvest(plot.id);
                            }}
                            className={`mt-3 rounded-lg px-3 py-2 text-xs font-semibold ${isReady ? 'action-primary text-white' : 'bg-gray-700 text-gray-300'
                                }`}
                            disabled={!isReady}
                        >
                            Harvest
                        </button>
                    </>
                ) : (
                    <>
                        <p className="mt-2 text-sm text-gray-300">Empty plot</p>
                        <button
                            type="button"
                            onClick={(event) => {
                                event.stopPropagation();
                                openPlantModal(plot.id, 'single');
                            }}
                            className="mt-3 rounded-lg px-3 py-2 text-xs font-semibold action-primary text-white"
                        >
                            Plant
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}
