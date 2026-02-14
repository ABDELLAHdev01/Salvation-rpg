import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import SelectRace from "./SelectRace";
import SelectSex from "./SelectSex";
import ChooseName from "./ChooseName";
import TermsAndAbout from "./TermsAndAbout";
import ReviewCharacter from "./ReviewCharacter";
import CharacterService from "../../core/services/CharacterService";
import toast from "react-hot-toast";

export default function CreateCharacter() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedRace, setSelectedRace] = useState(null);
  const [selectedGender, setSelectedGender] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [characterName, setCharacterName] = useState("");
  const navigate = useNavigate();

  const next = () => setCurrentIndex((prev) => Math.min(prev + 1, steps.length - 1));
  const prev = () => setCurrentIndex((prev) => Math.max(prev - 1, 0));

  const handleCharacterCreation = async () => {
    const characterData = {
      userId: 7, // TODO: Replace with dynamic user ID from auth context/session
      name: characterName,
      race: selectedRace?.toUpperCase() || null,
      raceKey: selectedRace?.toLowerCase() || null,
      sex: selectedGender,
      imageKey: selectedImage || null,
      characterNumber: selectedImage?.match(/\d+/)?.[0] || null,
    };

    try {
      await CharacterService.createCharacter(characterData);
      toast.success("Character created successfully!");
      navigate("/dashboard");
    } catch (error) {
      toast.error("Failed to create character. Please try again.");
      console.error("Character creation failed:", error);
    }
  };

  const stepLabels = [
    { title: "Terms" },
    { title: "Race" },
    { title: "Gender" },
    { title: "Name" },
    { title: "Review" },
  ];

  const steps = [
    <TermsAndAbout
      key="terms"
      onAgree={next}
      onCancel={() => toast.error("You must agree to proceed")}
    />,
    <SelectRace
      key="race"
      selectedRace={selectedRace}
      onSelectRace={setSelectedRace}
      onContinue={next}
      onPrev={prev}
    />,
    <SelectSex
      key="sex"
      selectedRace={selectedRace}
      selectedGender={selectedGender}
      selectedImage={selectedImage}
      onSelectGender={(sex) => {
        setSelectedGender(sex);
        setSelectedImage(null); // Reset image when gender changes
      }}
      onSelectImage={setSelectedImage}
      onContinue={next}
      onPrev={prev}
    />,
    <ChooseName
      key="name"
      characterName={characterName}
      selectedRace={selectedRace}
      selectedImage={selectedImage}
      onNameChange={setCharacterName}
      onContinue={handleCharacterCreation}
      onPrev={prev}
    />,
    <ReviewCharacter
      key="review"
      name={characterName}
      race={selectedRace}
      gender={selectedGender}
      selectedImage={selectedImage}
      onConfirm={handleCharacterCreation}
      onPrev={prev}
    />,
  ];

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 px-2 mx-auto max-w-screen-xl text-center py-10 lg:py-16 flex flex-col justify-center h-full">
        <div className="mx-auto w-full max-w-5xl rounded-2xl p-6 glass-panel hover-lift">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <p className="section-kicker text-xs uppercase tracking-[0.35em] text-yellow-500">
                Character Forge
              </p>
              <h1 className="mt-2 text-3xl font-extrabold text-white hero-title">
                Create Your Legend
              </h1>
              <p className="mt-2 text-sm text-gray-300">
                Step {currentIndex + 1} of {steps.length}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-300">
              {stepLabels.map((step, index) => (
                <span
                  key={step.title}
                  className={`rounded-full border px-3 py-1 ${index === currentIndex
                    ? "border-yellow-500 bg-yellow-500/10 text-yellow-200"
                    : "border-yellow-700/30 bg-gray-900/60"
                    }`}
                >
                  {step.title}
                </span>
              ))}
            </div>
          </div>

          <div className="mt-5 h-2 rounded-full bg-gray-800">
            <div
              className="h-full rounded-full bg-yellow-500 shimmer-bar"
              style={{ width: `${((currentIndex + 1) / steps.length) * 100}%` }}
            />
          </div>

          <div className="mt-8 flex flex-col space-y-4 sm:flex-row sm:justify-center sm:space-y-0">
            {steps[currentIndex]}
          </div>
        </div>
      </div>
    </section>
  );
}
