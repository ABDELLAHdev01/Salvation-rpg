import React from 'react';

export default function Panel({
    variant = 'card',
    children,
    className = '',
    ...rest
}) {
    let baseClass = 'rounded-2xl p-6 transition-all duration-300';

    if (variant === 'glass') {
        baseClass = 'rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel';
    } else if (variant === 'card') {
        baseClass = 'court-card rounded-2xl p-6';
    } else if (variant === 'image') {
        baseClass = 'image-panel ornament-frame p-6 relative overflow-hidden';
    } else if (variant === 'subtle') {
        baseClass = 'rounded-xl border border-yellow-700/20 bg-gray-950/70 p-4';
    }

    return (
        <div className={`${baseClass} ${className}`.trim()} {...rest}>
            {variant === 'image' ? (
                <div className="image-panel-content relative z-10">{children}</div>
            ) : (
                children
            )}
        </div>
    );
}
