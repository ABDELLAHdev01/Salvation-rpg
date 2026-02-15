import React from 'react';

export default function ReviewCharacter({
  name,
  race,
  gender,
  selectedImage,
  onConfirm,
  onPrev,
}) {
  const defaultImage = '/raceicon/noimage.webp';
  const previewImage = race && selectedImage
    ? `/raceicon/${race.toLowerCase()}_${selectedImage}.webp`
    : defaultImage;

  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center hero-title">Review Your Legend</h2>
      <p className="text-xs leading-snug text-gray-300 text-center mb-6">
        Confirm your choices before forging your character.
      </p>

      <div className="grid gap-6 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/70 overflow-hidden hover-lift">
          <img
            src={previewImage}
            alt="Character preview"
            className="w-full h-80 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
        </div>
        <div className="rounded-2xl border border-yellow-700/30 bg-gray-900/70 p-5 hover-lift text-left">
          <div className="space-y-3 text-sm text-gray-300">
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Name</span>
              <span className="text-white font-semibold">{name || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Race</span>
              <span className="text-white font-semibold">{race || '—'}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400">Gender</span>
              <span className="text-white font-semibold">{gender || '—'}</span>
            </div>
          </div>
          <div className="mt-6 rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-xs text-gray-300">
            Your choices will shape your starting stats and storyline.
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-center gap-4">
        <button
          type="button"
          onClick={onPrev}
          className="px-6 py-2 font-semibold rounded-lg action-ghost text-yellow-200"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="px-6 py-2 font-semibold rounded-lg action-primary text-white"
        >
          Create Character
        </button>
      </div>
    </div>
  );
}
