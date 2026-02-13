import React from 'react';

/**
 * StandardIZED ProgressBar component for Salvation RPG.
 * Supports Gold, Emerald, Cyan, and Danger tones with shimmer animations.
 */
export default function ProgressBar({
    value,
    max,
    label,
    subLabel,
    tone = 'gold',
    size = 'md',
    showMeta = true,
    className = '',
}) {
    const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;

    let toneClass = 'bg-yellow-500/90 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
    let borderClass = 'border-yellow-500/20';

    switch (tone) {
        case 'emerald':
            toneClass = 'bg-emerald-500/90 shadow-[0_0_10px_rgba(16,185,129,0.4)]';
            borderClass = 'border-emerald-500/20';
            break;
        case 'cyan':
            toneClass = 'bg-cyan-500/90 shadow-[0_0_10px_rgba(6,182,212,0.4)]';
            borderClass = 'border-cyan-500/20';
            break;
        case 'danger':
            toneClass = 'bg-red-500/90 shadow-[0_0_10px_rgba(239,68,68,0.4)]';
            borderClass = 'border-red-500/20';
            break;
        default:
            toneClass = 'bg-yellow-500/90 shadow-[0_0_10px_rgba(234,179,8,0.4)]';
            borderClass = 'border-yellow-500/20';
    }

    let heightClass = 'h-2.5';
    if (size === 'sm') heightClass = 'h-1.5';
    if (size === 'lg') heightClass = 'h-4';

    return (
        <div className={`w-full ${className}`.trim()}>
            {showMeta && (label || subLabel) && (
                <div className="mb-2 flex items-end justify-between px-1">
                    <span className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-bold">
                        {label}
                    </span>
                    <span className="text-[11px] font-mono text-gray-300">
                        {subLabel || `${Math.round(value)}/${Math.round(max)}`}
                    </span>
                </div>
            )}

            <div className={`relative w-full overflow-hidden rounded-full border bg-black/60 shadow-inner ${borderClass} ${heightClass}`}>
                <div
                    className={`shimmer-bar h-full rounded-full transition-all duration-500 ease-out ${toneClass}`}
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
}
