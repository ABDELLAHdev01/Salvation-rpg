import React from 'react';

export default function Badge({
    children,
    variant = 'default',
    className = '',
    ...rest
}) {
    let variantClass = 'bg-yellow-500/10 text-yellow-200 border border-yellow-500/20';

    if (variant === 'warning') {
        variantClass = 'bg-orange-500/10 text-orange-200 border border-orange-500/20';
    } else if (variant === 'success') {
        variantClass = 'bg-emerald-500/10 text-emerald-200 border border-emerald-500/20';
    } else if (variant === 'danger') {
        variantClass = 'bg-red-500/10 text-red-200 border border-red-500/20';
    } else if (variant === 'cyan') {
        variantClass = 'bg-cyan-500/10 text-cyan-200 border border-cyan-500/20';
    } else if (variant === 'ghost') {
        variantClass = 'bg-gray-800/50 text-gray-400 border border-gray-700/50';
    }

    const baseClass = `inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium backdrop-blur-sm ${variantClass}`;

    return (
        <span className={`${baseClass} ${className}`.trim()} {...rest}>
            {children}
        </span>
    );
}
