import React, { memo } from 'react';
import { Link } from 'react-router-dom';

/**
 * StandardIZED Button component for Salvation RPG.
 * Supports Ornate, Primary, Secondary, Ghost, and Danger variants.
 */
const Button = ({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    to,
    disabled,
    isLoading,
    onClick,
    ...rest
}) => {
    // Ornate variant uses its own specific structure
    if (variant === 'ornate') {
        const combinedClassName = `ornate-button ${className} ${disabled ? 'opacity-50 pointer-events-none grayscale' : ''}`.trim();
        if (to && !disabled) {
            return (
                <Link to={to} className={combinedClassName} {...rest}>
                    <p aria-hidden="true">
                        <span>{isLoading ? '...' : children}</span>
                    </p>
                </Link>
            );
        }
        return (
            <button
                type="button"
                onClick={onClick}
                className={combinedClassName}
                disabled={disabled || isLoading}
                {...rest}
            >
                <p aria-hidden="true">
                    <span>{isLoading ? '...' : children}</span>
                </p>
            </button>
        );
    }

    let variantClass = '';
    if (disabled) {
        variantClass = 'bg-gray-800 text-gray-500 cursor-not-allowed border border-gray-700 opacity-60 grayscale';
    } else {
        switch (variant) {
            case 'primary':
                variantClass = 'action-primary text-white shadow-lg shadow-black/20';
                break;
            case 'secondary':
                variantClass = 'border border-yellow-700/40 bg-gray-950/60 text-yellow-200 hover:bg-yellow-900/10 hover:border-yellow-600/60';
                break;
            case 'ghost':
                variantClass = 'action-ghost text-yellow-200 hover:bg-yellow-500/10 border-transparent';
                break;
            case 'danger':
                variantClass = 'bg-red-950/30 text-red-100 border border-red-500/30 hover:bg-red-900/40';
                break;
            default:
                variantClass = 'action-primary text-white';
        }
    }

    let sizeClass = 'px-5 py-2.5 text-sm';
    switch (size) {
        case 'sm': sizeClass = 'px-3 py-1.5 text-xs'; break;
        case 'lg': sizeClass = 'px-8 py-3.5 text-base'; break;
        case 'icon': sizeClass = 'p-2.5'; break;
        default: sizeClass = 'px-5 py-2.5 text-sm';
    }

    const baseClass = `inline-flex items-center justify-center gap-2 rounded-xl font-bold tracking-wide transition-all duration-150 ui-interactive ${variantClass} ${sizeClass}`;

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
            onClick={onClick}
            className={`${baseClass} ${className}`.trim()}
            disabled={disabled || isLoading}
            {...rest}
        >
            {isLoading ? <span className="animate-pulse">Loading...</span> : children}
        </button>
    );
};

export default memo(Button);
