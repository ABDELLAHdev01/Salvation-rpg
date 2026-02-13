import React from 'react';

/**
 * StandardIZED Panel component for Salvation RPG.
 * Supports Glass, Card (default), Ornament, and Subtle variants.
 */
export default function Panel({
    variant = 'card',
    children,
    className = '',
    ...rest
}) {
    let baseClass = 'rounded-2xl transition-all duration-300';
    let paddingClass = 'p-6';

    switch (variant) {
        case 'glass':
            baseClass = 'glass-panel shadow-2xl backdrop-blur-md court-reveal';
            paddingClass = 'p-8';
            break;
        case 'card':
            baseClass = 'court-card shadow-xl';
            paddingClass = 'p-6';
            break;
        case 'ornament':
            baseClass = 'image-panel ornament-frame relative overflow-hidden shadow-2xl';
            paddingClass = 'p-6';
            break;
        case 'subtle':
            baseClass = 'border border-yellow-700/10 bg-gray-950/40';
            paddingClass = 'p-4';
            break;
        default:
            baseClass = 'court-card shadow-xl';
    }

    return (
        <div className={`${baseClass} ${paddingClass} ${className}`.trim()} {...rest}>
            {variant === 'ornament' ? (
                <div className="image-panel-content relative z-10">{children}</div>
            ) : (
                children
            )}
        </div>
    );
}
