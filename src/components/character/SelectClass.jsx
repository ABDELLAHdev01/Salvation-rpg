import React from 'react';

const classes = [
  {
    name: 'Vanguard',
    description: 'Frontline defender with high resilience and control.',
  },
  {
    name: 'Arcwarden',
    description: 'Arcane specialist who commands elemental forces.',
  },
  {
    name: 'Shadowblade',
    description: 'Agile duelist relying on precision and speed.',
  },
  {
    name: 'Dawnbinder',
    description: 'Support healer who protects allies with light.',
  },
];

export default function SelectClass({ selectedClass, onSelectClass, onContinue, onPrev }) {
  return (
    <div className="w-full max-w-4xl mx-auto">
      <h2 className="text-2xl font-semibold text-white mb-4 text-center hero-title">Choose Your Class</h2>
      <p className="text-sm text-gray-300 text-center mb-6">
        Each class offers a unique combat style. Choose the path that fits your legend.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {classes.map((entry) => (
          <button
            type="button"
            key={entry.name}
            onClick={() => onSelectClass(entry.name)}
            className={`rounded-xl border p-4 text-left transition hover-lift ${
              selectedClass === entry.name
                ? 'border-yellow-500 bg-yellow-500/10'
                : 'border-yellow-700/30 bg-gray-900/70'
            }`}
          >
            <h3 className="text-lg font-semibold text-white">{entry.name}</h3>
            <p className="mt-2 text-sm text-gray-300">{entry.description}</p>
          </button>
        ))}
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
          onClick={onContinue}
          disabled={!selectedClass}
          className={`px-6 py-2 font-semibold rounded-lg transition duration-300 ${
            selectedClass ? 'action-primary text-white' : 'bg-gray-700 text-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
