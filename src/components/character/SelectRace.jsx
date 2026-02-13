import React from 'react';

export default function SelectRace({ onContinue, onSelectRace, selectedRace, onPrev }) {
  // Define races with an isEnabled property
  const races = [
    {
      name: 'Human',
      description:
        'Balanced and ambitious, humans adapt quickly and thrive in any role, from knights to scholars.',
      image: '/raceicon/human.png',
      isEnabled: true, // Enabled
    },
    {
      name: 'Elf',
      description:
        'Elves are graceful and magically attuned, excelling in archery, spellcraft, and agility.',
      image: '/raceicon/elf.png',
      isEnabled: true, // Enabled
    },
    {
      name: 'Orc',
      description:
        'Ferocious and powerful, orcs are born warriors, thriving in close combat and brute strength.',
      image: '/raceicon/org.png',
      isEnabled: false, // Disabled
    },
    {
      name: 'Dwarf',
      description:
        'Stout and determined, dwarves are master craftsmen and fearless fighters with unmatched resilience.',
      image: '/raceicon/dowrf.png',
      isEnabled: false, // Enabled
    },
    {
      name: 'Vampire',
      description:
        'Cursed with immortality, vampires possess dark magic, enhanced strength, and a thirst for blood.',
      image: '/raceicon/vampire.png',
      isEnabled: true, // Disabled
    },
    {
      name: 'Werewolf',
      description:
        'Fierce and untamed, werewolves transform under the moonlight and wield savage physical power.',
      image: '/raceicon/wherewolf.png',
      isEnabled: false, // Enabled
    },
  ];

  return (
    <div className="flex flex-col items-center justify-start min-h-[520px] backdrop-blur-sm px-4 py-4 overflow-y-auto">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center hero-title">
        Choose Your Race
        </h1>
      
      {/* Beta Notice */}
      <div className="bg-yellow-200 text-yellow-900 p-4 rounded-lg text-center mb-6 max-w-3xl mx-auto">
        <p className="text-lg font-semibold">
          Please note that some races are not available in this beta version. We are working hard to add more races in future updates!
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {races.map((race) => (
          <div
            key={race.name}
            className={`cursor-pointer bg-gray-900/80 p-5 rounded-lg border border-yellow-700/30 hover:border-yellow-500/70 transition duration-300 text-center hover-lift ${selectedRace === race.name ? 'ring-4 ring-yellow-400' : ''} ${!race.isEnabled ? 'opacity-50 cursor-not-allowed' : ''}`}
            onClick={() => race.isEnabled && onSelectRace(race.name)}
          >
            <img
              src={race.image}
              alt={race.name}
              className="w-20 h-20 mx-auto mb-3 object-contain"
              onError={(e) => e.target.src = '/raceicon/noimage.jpg'}
            />
            <h2 className="text-xl font-semibold text-white mb-1">{race.name}</h2>
            <p className="text-gray-400 text-sm">{race.description}</p>
          </div>
        ))}
      </div>

      <div className="flex space-x-4 mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-2 font-semibold rounded-lg action-ghost text-yellow-200"
        >
          Previous
        </button>

        <button
          onClick={onContinue}
          disabled={!selectedRace}
          className={`px-6 py-2 font-semibold rounded-lg shadow-lg transition duration-300 ${selectedRace ? 'action-primary text-white' : 'bg-gray-700 text-gray-300 cursor-not-allowed'}`}
        >
          Continue
        </button>
      </div>
      </div>
    </div>
  );
}
