import React from 'react';
import Panel from '../../shared/ui/Panel';
import SectionHeader from '../../shared/ui/SectionHeader';
import Button from '../../shared/ui/Button';
import Badge from '../../shared/ui/Badge';
import { miningConsumables, miningBoosterIcons } from '../../core/data/miningData';
import { formatDuration } from '../../core/data/miningData';
import { getItemCount } from '../../core/services/inventoryService';

export default function MiningBoosters({
    inventory,
    activeBoostId,
    boosterCooldowns,
    miningLevel,
    handleArmBooster,
}) {
    const renderBoosterIcon = (boosterId) => {
        const icon = miningBoosterIcons[boosterId];
        if (!icon) return null;
        return (
            <svg
                viewBox={icon.viewBox}
                className="h-4 w-4 text-yellow-200"
                fill="currentColor"
                aria-hidden="true"
            >
                <path d={icon.path} />
            </svg>
        );
    };

    return (
        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <Panel className="p-6">
                <SectionHeader
                    kicker="Mining Boosters"
                    description="Arm a consumable to increase mining XP on your next claim."
                    className="mb-4"
                />
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    {miningConsumables.map((booster) => {
                        const owned = getItemCount(inventory, booster.id);
                        const isArmed = activeBoostId === booster.id;
                        const cooldownUntil = boosterCooldowns[booster.id] || 0;
                        const isOnCooldown = cooldownUntil > Date.now();
                        const cooldownLabel = isOnCooldown
                            ? formatDuration(cooldownUntil - Date.now())
                            : 'Ready';
                        const meetsLevel = miningLevel >= booster.requiredMiningLevel;
                        const canArm = owned > 0 && !isArmed && !isOnCooldown && meetsLevel;

                        return (
                            <div
                                key={booster.id}
                                className="rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-yellow-500/10">
                                        {renderBoosterIcon(booster.id)}
                                    </span>
                                    <p className="text-sm font-semibold text-white">{booster.name}</p>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">{booster.description}</p>
                                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-300">
                                    <span>Owned: {owned}</span>
                                    <span>Req L{booster.requiredMiningLevel}</span>
                                    <span>Cooldown: {cooldownLabel}</span>
                                    {isArmed ? (
                                        <Badge variant="warning">Armed</Badge>
                                    ) : (
                                        <Button
                                            size="sm"
                                            onClick={() => handleArmBooster(booster.id)}
                                            disabled={!canArm}
                                        >
                                            Arm
                                        </Button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Panel>
            <Panel variant="image" className="image-panel-market p-6">
                <div className="image-panel-content">
                    <SectionHeader kicker="Passive Summary" className="mb-3" />
                    <p className="mt-3 text-sm text-gray-300">
                        Boosters stack with your pickaxe and hireling bonuses.
                    </p>
                </div>
            </Panel>
        </div>
    );
}
