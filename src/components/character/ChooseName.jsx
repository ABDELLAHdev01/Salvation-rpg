import React, { useState, useEffect } from "react";

export default function ChooseName({
  characterName,
  selectedImage,
  onNameChange,
  onContinue,
  onPrev,
  selectedRace,
}) {
  const [isValidName, setIsValidName] = useState(false);

  const nameRegex = /^[A-Za-z]{3,15}$/;
  const defaultImage = "/raceicon/noimage.jpg";

  useEffect(() => {
    setIsValidName(nameRegex.test(characterName.trim()));
  }, [characterName]);

  const getImageSrc = () => {
    if (!selectedRace || !selectedImage) return defaultImage;
    return `/raceicon/${selectedRace.toLowerCase()}_${selectedImage}.png`;
  };

  return (
    <div className="flex flex-col items-center justify-between min-h-[520px] backdrop-blur-sm px-4 py-4 overflow-hidden">
      <div className="w-full max-w-3xl flex flex-col items-center">
        <h1 className="text-3xl font-bold text-white mb-4 text-center hero-title">
          Choose Your Name
        </h1>

      {selectedImage && selectedRace && (
        <div className="mb-4">
          <img
            src={getImageSrc()}
            alt="Selected character"
            className="w-60 h-60 object-cover rounded-lg"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = defaultImage;
            }}
          />
        </div>
      )}

      <input
        type="text"
        value={characterName}
        onChange={(e) => onNameChange(e.target.value)}
        placeholder="Enter your character's name"
        className="w-80 p-3 rounded-lg bg-gray-900/80 text-white text-lg placeholder-gray-400 border border-yellow-700/30 focus:outline-none focus:ring-2 focus:ring-yellow-400"
      />

      {!isValidName && characterName && (
        <p className="text-red-500 mt-2 text-sm">
          Name must be 3–15 letters, alphabets only.
        </p>
      )}

      <div className="flex space-x-4 mt-6">
        <button
          onClick={onPrev}
          className="px-6 py-2 font-semibold rounded-lg action-ghost text-yellow-200"
        >
          Previous
        </button>

        <button
          onClick={onContinue}
          disabled={!isValidName}
          className={`px-6 py-2 font-semibold rounded-lg shadow-lg transition duration-300 ${
            isValidName
              ? "action-primary text-white"
              : "bg-gray-700 text-gray-300 cursor-not-allowed"
          }`}
        >
          Create Character
        </button>
      </div>
      </div>
    </div>
  );
}
