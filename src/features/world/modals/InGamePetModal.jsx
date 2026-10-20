import React from 'react';
import toast from 'react-hot-toast';
import audioManager from '../../../core/audio/AudioManager';
import characterService from '../../../core/services/CharacterService';
import gameEventBridge, { gameEvents } from '../../../core/phaser/gameEventBridge';
import { COMPANIONS } from '../../../core/data/companionData';

export default function InGamePetModal({
  isOpen,
  onClose,
  profile,
  onProfileUpdate = () => {},
}) {
  if (!isOpen) return null;

  const currentPetId = profile?.equippedPet || 'sheepdog';

  const handleEquipPet = (petId) => {
    const pet = COMPANIONS.find((p) => p.id === petId);
    if (!pet) return;

    audioManager.play(pet.sound);
    const updated = characterService.updateMockProfile({
      equippedPet: petId,
    });
    onProfileUpdate(updated);
    gameEventBridge.emit(gameEvents.EQUIP_PET, { petId });
    toast.success(`Summoned ${pet.name} to your side!`, { icon: pet.icon });
  };

  const handlePetMorale = (pet) => {
    audioManager.play(pet.sound);
    toast.success(`You patted ${pet.name}! Friendship increased! ❤️`, { icon: '💖' });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md select-none animate-fadeIn">
      <div className="relative flex flex-col w-full max-w-2xl rounded-3xl border-2 border-amber-500/60 bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 p-6 shadow-2xl shadow-amber-950/60 text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-700/40 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🐾</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-300">
                Warden Companion Sanctuary
              </h3>
              <p className="text-xs text-gray-400">
                Faithful allies who journey at your side, grant passive buffs, and fetch spoils
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Companion Cards Grid */}
        <div className="grid gap-3.5 sm:grid-cols-3">
          {COMPANIONS.map((pet) => {
            const isEquipped = currentPetId === pet.id;
            return (
              <div
                key={pet.id}
                className={`relative flex flex-col justify-between rounded-2xl border p-4 transition ${
                  isEquipped
                    ? 'border-amber-400 bg-amber-950/40 shadow-lg shadow-amber-950/50'
                    : 'border-gray-800 bg-gray-900/60 hover:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl">{pet.icon}</span>
                    {isEquipped ? (
                      <span className="rounded-full bg-amber-500/20 border border-amber-500/50 px-2 py-0.5 text-[9px] font-bold text-amber-300 uppercase">
                        Active
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handlePetMorale(pet)}
                        className="text-xs opacity-60 hover:opacity-100 transition"
                        title="Pet companion"
                      >
                        ❤️
                      </button>
                    )}
                  </div>

                  <h4 className="font-serif text-sm font-bold text-white mb-0.5">
                    {pet.name}
                  </h4>
                  <span
                    className="inline-block text-[9px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: pet.color }}
                  >
                    {pet.title}
                  </span>

                  <p className="text-[11px] text-gray-400 leading-relaxed mb-3">
                    {pet.desc}
                  </p>

                  <div className="rounded-xl border border-amber-600/20 bg-black/40 p-2 text-[10px] text-amber-200/90 mb-3 font-mono">
                    <span className="font-bold text-amber-400">PERK:</span> {pet.perk}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEquipPet(pet.id)}
                  disabled={isEquipped}
                  className={`w-full py-2 rounded-xl font-serif text-xs font-bold transition active:scale-95 ${
                    isEquipped
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 cursor-default'
                      : 'bg-amber-500 text-black hover:bg-amber-400 shadow'
                  }`}
                >
                  {isEquipped ? 'Following You ✓' : 'Summon Companion'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-3 border-t border-gray-800 flex items-center justify-between text-[11px] text-gray-400 font-mono">
          <span>Stand near your companion in-game and press <strong className="text-yellow-400">[E]</strong> to pet!</span>
          <span className="text-yellow-400">Hotkey: [P]</span>
        </div>
      </div>
    </div>
  );
}
