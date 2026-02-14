import React from 'react';

export default function ProfileStatsGrid({ stats }) {
    const items = [
        { label: 'Level', value: stats?.level ?? 1 },
        { label: 'Power', value: stats?.power ?? 0 },
        { label: 'Gold', value: stats?.gold ?? 0 },
        { label: 'Quests', value: stats?.quests ?? 0 },
        { label: 'Victories', value: stats?.victories ?? 0 },
        { label: 'Renown', value: stats?.renown ?? 0 },
    ];

    return (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
                <div key={item.label} className="court-card rounded-xl p-4 text-center hover-lift">
                    <p className="text-xs uppercase tracking-[0.3em] text-gray-400">{item.label}</p>
                    <p className="mt-2 text-2xl font-semibold text-white">{item.value}</p>
                </div>
            ))}
        </div>
    );
}
