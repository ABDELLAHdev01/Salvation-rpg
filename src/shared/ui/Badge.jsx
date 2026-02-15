import React, { memo } from 'react';

/**
 * StandardIZED Badge component for Salvation RPG.
 * Supports Semantic (Success, Warning, Danger, Info) and Theme (Gold, Cyan) variants.
 */
const Badge = ({
    children,
    variant = 'gold',
    className = '',
    ...rest
}) => {
    let variantClass = '';

    switch (variant) {
        case 'success':
            variantClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            break;
        case 'warning':
            variantClass = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            break;
        case 'danger':
            variantClass = 'bg-red-500/10 text-red-400 border-red-500/20';
            break;
        case 'info':
            variantClass = 'bg-sky-500/10 text-sky-400 border-sky-500/20';
            break;
        case 'gold':
            variantClass = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
            break;
        case 'cyan':
            variantClass = 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20';
            break;
        case 'ghost':
            variantClass = 'bg-gray-800/40 text-gray-400 border-gray-700/40';
            break;
        default:
            variantClass = 'bg-yellow-500/10 text-yellow-300 border-yellow-500/20';
    }

    const baseClass = `inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm ${variantClass}`;

    return (
        <span className={`${baseClass} ${className}`.trim()} {...rest}>
            {children}
        </span>
    );
};

export default memo(Badge);
