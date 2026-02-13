import React, { useState } from 'react';

export default function TermsAndAbout({ onAgree, onCancel }) {
  const [isChecked, setIsChecked] = useState(false);

  const handleCheckboxChange = () => {
    setIsChecked(!isChecked);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[480px] px-6 py-6 overflow-hidden">
      <div className="relative z-10 flex flex-col items-center justify-center w-full max-w-4xl">
        <h1 className="text-4xl font-extrabold text-white drop-shadow-md mb-6 text-center hero-title">
          Terms & Conditions <span role="img" aria-label="scroll">📜</span>
        </h1>

        {/* Terms Section */}
        <div className="text-white mb-6 text-left max-w-2xl space-y-4 drop-shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">Terms of Service ✍️</h2>
          <p className="text-lg leading-relaxed">
            Please read the following terms and conditions carefully before proceeding. By continuing, you agree to our terms:
          </p>
          <ul className="list-inside list-disc text-sm space-y-2">
            <li>You must be 13 years or older to create a character. 🎂</li>
            <li>Your character name must be between 3 and 15 characters and can only contain letters. 📝</li>
            <li>By continuing, you agree to our privacy policy and terms of service. 📑</li>
          </ul>
        </div>

        {/* About the Game Section */}
        <div className="text-white mb-6 text-left max-w-2xl space-y-4 drop-shadow-sm">
          <h2 className="text-2xl font-semibold mb-2">About the Game 🎮</h2>
          <p className="text-lg leading-relaxed">
            Welcome to <em>Salvation</em> — an epic online fantasy RPG. Create your own unique character, embark on exciting quests,
            battle fierce enemies, and explore vast worlds filled with adventure. Your choices shape your journey, and your power
            will grow as you level up and collect powerful items. 🛡️
          </p>
        </div>

        {/* Checkbox + Buttons */}
        <div className="flex flex-col items-center w-full">
          <label className="flex items-center text-white mb-6">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={handleCheckboxChange}
              className="mr-3 w-5 h-5 border-gray-500 border-2 rounded-md focus:ring-2 focus:ring-yellow-400"
            />
            <span className="text-sm leading-relaxed">
              I've read and agree to the <span className="font-semibold">Terms & Conditions</span> ✔️
            </span>
          </label>

          <div className="flex space-x-4 mt-6">
            <button
              onClick={onCancel}
              className="px-6 py-3 font-semibold rounded-lg action-ghost text-yellow-200 transition duration-300"
            >
              Cancel ❌
            </button>

            <button
              onClick={onAgree}
              disabled={!isChecked}
              className={`px-6 py-3 font-semibold rounded-lg transition duration-300 ${
                isChecked
                  ? 'action-primary text-white'
                  : 'bg-gray-700 text-gray-300 cursor-not-allowed'
              }`}
            >
              I Agree ✅
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
