import React from 'react';

export default function ProfileAchievements({ achievements, favoriteAchievement, handleFavoriteAchievement }) {
    return (
        <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 hover-lift">
            <h2 className="text-lg font-semibold text-white">Achievements</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {achievements.map((achievement) => (
                    <li
                        key={achievement}
                        className={`flex flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 ${favoriteAchievement === achievement
                                ? 'border-yellow-400/60 bg-yellow-500/10 text-yellow-100'
                                : 'border-yellow-700/20 bg-gray-950/70'
                            }`}
                    >
                        <span>{achievement}</span>
                        <button
                            type="button"
                            onClick={() => handleFavoriteAchievement(achievement)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${favoriteAchievement === achievement
                                    ? 'bg-yellow-500 text-gray-900'
                                    : 'border border-yellow-700/30 text-yellow-200'
                                }`}
                        >
                            {favoriteAchievement === achievement ? 'Favorited' : 'Set Flair'}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}
