import React from 'react';

export default function SectionHeader({
    kicker,
    title,
    description,
    className = '',
    actions,
}) {
    return (
        <div className={`flex flex-wrap items-end justify-between gap-4 ${className}`.trim()}>
            <div className="max-w-3xl">
                {kicker && (
                    <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">
                        {kicker}
                    </p>
                )}
                {title && (
                    <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">
                        {title}
                    </h1>
                )}
                {description && (
                    <p className="mt-3 text-base text-gray-300 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
            {actions && (
                <div className="flex flex-wrap items-center gap-3">
                    {actions}
                </div>
            )}
        </div>
    );
}
