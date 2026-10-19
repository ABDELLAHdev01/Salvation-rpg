import React from 'react';

export default function ProfileBioForm({
    title,
    setTitle,
    bio,
    setBio,
    handleSaveProfile,
    isSaving,
    unlockedTitles = ['Warden Initiate'],
}) {
    return (
        <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 hover-lift">
            <h2 className="text-lg font-semibold text-white">Hero Title & Bio</h2>
            <div className="mt-4 space-y-4">
                <div>
                    <div className="flex items-center justify-between">
                        <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Title</label>
                        {unlockedTitles.length > 1 && (
                            <span className="text-[10px] text-yellow-400 font-semibold">
                                {unlockedTitles.length} Titles Earned
                            </span>
                        )}
                    </div>
                    {unlockedTitles.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                            {unlockedTitles.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => setTitle(t)}
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                                        title === t
                                            ? 'border border-yellow-500 bg-yellow-500/20 text-yellow-300 shadow-sm'
                                            : 'border border-gray-800 bg-gray-950/60 text-gray-400 hover:text-yellow-200 hover:border-gray-700'
                                    }`}
                                >
                                    «{t}»
                                </button>
                            ))}
                        </div>
                    )}
                    <input
                        type="text"
                        value={title}
                        onChange={(event) => setTitle(event.target.value)}
                        placeholder="Warden Initiate"
                        className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <div>
                    <label className="text-xs uppercase tracking-[0.3em] text-gray-400">Bio</label>
                    <textarea
                        value={bio}
                        onChange={(event) => setBio(event.target.value)}
                        rows={4}
                        placeholder="Tell the realm about your legend."
                        className="mt-2 w-full rounded-lg border border-yellow-700/30 bg-gray-950/70 px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className={`inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold ${isSaving ? 'bg-gray-700 text-gray-300' : 'action-primary text-white'}`}
                >
                    {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
}
