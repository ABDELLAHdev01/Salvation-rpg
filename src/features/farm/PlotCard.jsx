import React from 'react';
import { formatDuration } from '../../core/data/miningData';
import { farmCrops } from '../../core/data/farmData';
import Panel from '../../shared/ui/Panel';
import Button from '../../shared/ui/Button';

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

    // UI Sprite logic
    const frameOffset = plotState === 'empty' ? 0 : plotState === 'planted' ? 33.333 : 66.666;

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
        <Panel
            variant="subtle"
            className={`group relative overflow-hidden transition-all duration-300 border-yellow-700/10 hover:border-yellow-700/30 p-0 ${isActionable ? 'cursor-pointer hover-lift shadow-sm hover:shadow-xl' : ''
                }`}
            ref={(node) => {
                if (node) {
                    plotRefs.current.set(plot.id, node);
                } else {
                    plotRefs.current.delete(plot.id);
                }
            }}
            onClick={isActionable ? handlePlotClick : undefined}
            tabIndex={isActionable ? 0 : undefined}
        >
            <div className="w-full overflow-hidden leading-none text-[0px] bg-gray-950/20">
                <img
                    src="/plot/plotcCasesV2.webp"
                    alt="Plot state"
                    className="block w-[300%] max-w-none align-top transition-transform duration-500"
                    style={{
                        transform: `translateX(-${frameOffset}%)`,
                    }}
                />
            </div>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-gray-950/95 via-gray-950/80 to-transparent p-4 transition-transform duration-300 group-hover:translate-y-0">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-[0.3em] text-gray-400 font-bold">Plot {plot.id + 1}</p>
                    {crop && !isReady && (
                        <span className="text-[10px] font-mono text-cyan-400">{formatDuration(remaining)}</span>
                    )}
                </div>

                {crop ? (
                    <div className="space-y-3">
                        <h4 className="text-sm font-bold text-white truncate">{crop.name}</h4>
                        <Button
                            variant={isReady ? 'primary' : 'secondary'}
                            size="sm"
                            className="w-full h-8"
                            onClick={(event) => {
                                event.stopPropagation();
                                handleHarvest(plot.id);
                            }}
                            disabled={!isReady}
                        >
                            {isReady ? 'Harvest' : 'Growing...'}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <h4 className="text-sm text-gray-500 font-medium italic">Fallow Soil</h4>
                        <Button
                            variant="ornate"
                            size="sm"
                            className="w-full h-8"
                            onClick={(event) => {
                                event.stopPropagation();
                                openPlantModal(plot.id, 'single');
                            }}
                        >
                            Sow Seeds
                        </Button>
                    </div>
                )}
            </div>
        </Panel>
    );
}
