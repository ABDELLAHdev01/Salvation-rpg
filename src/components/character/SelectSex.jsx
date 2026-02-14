import React from 'react';

export default function SelectSex({
  selectedRace,
  selectedGender,
  selectedImage,
  onSelectGender,
  onSelectImage,
  onContinue,
  onPrev,
}) {
  const sexes = ['Male', 'Female'];

  const images = {
    Male: [
      { name: 'male_1', path: `/raceicon/${selectedRace.toLowerCase()}_male_1.webp` },
      { name: 'male_2', path: `/raceicon/${selectedRace.toLowerCase()}_male_2.webp` },
      { name: 'male_3', path: `/raceicon/${selectedRace.toLowerCase()}_male_3.webp` },
      { name: 'male_4', path: `/raceicon/${selectedRace.toLowerCase()}_male_4.webp` },
    ],
    Female: [
      { name: 'female_1', path: `/raceicon/${selectedRace.toLowerCase()}_female_1.webp` },
      { name: 'female_2', path: `/raceicon/${selectedRace.toLowerCase()}_female_2.webp` },
      { name: 'female_3', path: `/raceicon/${selectedRace.toLowerCase()}_female_3.webp` },
      { name: 'female_4', path: `/raceicon/${selectedRace.toLowerCase()}_female_4.webp` },
    ],
  };

  const defaultImage = '/raceicon/noimage.webp';

  const currentImages = selectedGender && images[selectedGender] ? images[selectedGender] : [];

  return (
    <div className="flex flex-col items-center justify-start min-h-[520px] backdrop-blur-sm px-4 py-4 overflow-hidden">
      <div className="w-full max-w-6xl">
        <h1 className="text-3xl font-bold text-white mb-6 text-center hero-title">Choose Your Gender</h1>

      {/* Gender selection buttons */}
      <div className="flex justify-center space-x-6 mb-6 mt-8">
        {sexes.map((sex) => (
          <div
            key={sex}
            onClick={() => onSelectGender(sex)}
            className={`cursor-pointer bg-gray-900/80 p-4 rounded-lg border border-yellow-700/30 text-center hover:border-yellow-500/70 transition duration-300 hover-lift ${
              selectedGender === sex ? 'ring-4 ring-yellow-400 shadow-yellow-500/50' : ''
            }`}
          >
            <h2 className="text-lg font-semibold text-white mb-1">{sex}</h2>
          </div>
        ))}
      </div>

      {/* Show character image options */}
      {selectedGender && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6 w-full">
          {currentImages.map((image, index) => (
            <div
              key={index}
              onClick={() => onSelectImage(image.name)}
              className={`cursor-pointer bg-gray-900/80 p-4 rounded-lg border border-yellow-700/30 text-center transition duration-300 hover-lift ${
                selectedImage === image.name ? 'ring-4 ring-yellow-400 scale-110 z-10' : 'hover:scale-105'
              }`}
            >
              <img
                src={image.path}
                alt={`${selectedGender} Option ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultImage;
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* Continue / Previous buttons */}
      <div className="flex space-x-4 mt-6 w-full justify-center">
        <button
          onClick={onPrev}
          className="px-6 py-2 font-semibold rounded-lg action-ghost text-yellow-200"
        >
          Previous
        </button>

        <button
          onClick={onContinue}
          disabled={!selectedGender || !selectedImage}
          className={`px-6 py-2 font-semibold rounded-lg shadow-lg transition duration-300 ${
            selectedGender && selectedImage
              ? 'action-primary text-white'
              : 'bg-gray-700 text-gray-300 cursor-not-allowed'
          }`}
        >
          Continue
        </button>
      </div>
      </div>
    </div>
  );
}
