import React from 'react';
import { Link } from 'react-router-dom';

export default function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    to,
    disabled,
    isLoading,
    ...rest
}) {
    let variantClass = '';

    // Variants
    if (disabled) {
        variantClass = 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700';
    } else if (variant === 'primary') {
        variantClass = 'action-primary text-white shadow-lg shadow-black/20 hover:brightness-110 active:scale-95';
    } else if (variant === 'secondary') {
        variantClass = 'border border-yellow-700/40 bg-gray-900/60 text-yellow-200 hover:bg-yellow-900/20 hover:border-yellow-600/60 active:scale-95';
    } else if (variant === 'ghost') {
        variantClass = 'action-ghost text-yellow-200 hover:bg-yellow-500/10 active:scale-95';
    } else if (variant === 'danger') {
        variantClass = 'bg-red-900/20 text-red-200 border border-red-500/20 hover:bg-red-900/40 active:scale-95';
    }

    // Sizes
    let sizeClass = 'px-4 py-2 text-sm';
    if (size === 'sm') {
        sizeClass = 'px-3 py-1 text-xs';
    } else if (size === 'lg') {
        sizeClass = 'px-6 py-3 text-base';
    } else if (size === 'icon') {
        sizeClass = 'p-2';
    }

    const baseClass = `inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-200 ${variantClass} ${sizeClass}`;

    if (to && !disabled) {
        return (
            <Link to={to} className={`${baseClass} ${className}`.trim()} {...rest}>
                {isLoading ? <span className="animate-pulse">...</span> : children}
            </Link>
        );
    }

    return (
        <button
            type="button"
            className={`${baseClass} ${className}`.trim()}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? <span className="animate-pulse">Loading...</span> : children}
        </button>
    );
}
