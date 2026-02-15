import React from 'react';
import { Link } from 'react-router-dom';

export default function ProfileHeader({ character, profile, favoriteAchievement, activeHouse }) {
    return (
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="h-28 w-28 overflow-hidden rounded-2xl border border-yellow-700/50 bg-gray-900/80">
                    <img
                        src={character?.avatarUrl || '/raceicon/noimage.jpg'}
                        alt={character?.name || 'Hero portrait'}
                        className="h-full w-full object-cover"
                    />
                </div>
                <div>
                    <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Hero Profile</p>
                    <h1 className="mt-2 text-4xl font-extrabold text-white hero-title">
                        {character?.name || 'Unbound Wanderer'}
                    </h1>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-300">
                        <span className="court-chip rounded-full px-3 py-1">
                            {character?.race || 'Unknown'} · {character?.sex || 'Unknown'}
                        </span>
                        <span className="court-chip rounded-full px-3 py-1">
                            {character?.className || 'Adventurer'}
                        </span>
                        <span className="court-chip rounded-full px-3 py-1">ID: {profile?.username || 'unknown'}</span>
                    </div>
                    <p className="mt-3 text-xs text-gray-400">
                        Residence: {activeHouse?.name || 'Starter Cottage'}
                    </p>
                    <p className="mt-1 text-xs text-yellow-200">
                        {activeHouse?.effect?.name || 'Rested Comfort'}: {activeHouse?.effect?.detail || '+2% health regeneration in safe zones.'}
                    </p>
                    {favoriteAchievement && (
                        <span className="mt-3 inline-flex items-center rounded-full border border-yellow-700/40 bg-gray-900/70 px-3 py-1 text-xs text-yellow-200">
                            Flair: {favoriteAchievement}
                        </span>
                    )}
                </div>
            </div>
            <div className="flex flex-wrap gap-3">
                <Link
                    to="/character/edit"
                    className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-yellow-200 action-ghost"
                >
                    Edit Character
                </Link>
                <Link
                    to="/housing"
                    className="inline-flex items-center rounded-full px-4 py-2 text-xs font-semibold text-white action-primary"
                >
                    Manage Residence
                </Link>
            </div>
        </div>
    );
}
