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
      <div className="rpg-panel-brown relative flex flex-col w-full max-w-2xl p-6 shadow-2xl text-white">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-amber-900/50 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="text-3xl drop-shadow">🐾</span>
            <div>
              <h3 className="font-serif text-lg font-bold text-amber-100 drop-shadow">
                Warden Companion Sanctuary
              </h3>
              <p className="text-xs text-amber-300/70">
                Faithful allies who journey at your side, grant passive buffs, and fetch spoils
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rpg-btn-square-brown h-8 w-8 text-xs font-bold text-amber-200"
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
                className={`rpg-slot-inset relative flex flex-col justify-between p-4 transition ${
                  isEquipped
                    ? 'bg-amber-950/40 ring-1 ring-amber-400'
                    : 'bg-stone-950/70 hover:brightness-110'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-3xl drop-shadow">{pet.icon}</span>
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

                  <h4 className="font-serif text-sm font-bold text-amber-100 mb-0.5">
                    {pet.name}
                  </h4>
                  <span
                    className="inline-block text-[9px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: pet.color }}
                  >
                    {pet.title}
                  </span>

                  <p className="text-[11px] text-amber-200/70 leading-relaxed mb-3">
                    {pet.desc}
                  </p>

                  <div className="rounded border border-amber-900/50 bg-black/40 p-2 text-[10px] text-amber-200/90 mb-3 font-mono">
                    <span className="font-bold text-amber-400">PERK:</span> {pet.perk}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleEquipPet(pet.id)}
                  disabled={isEquipped}
                  className={`${
                    isEquipped
                      ? 'rpg-btn-brown opacity-80 cursor-default'
                      : 'rpg-btn-beige text-amber-950'
                  } w-full py-1.5 font-serif text-xs font-bold`}
                >
                  {isEquipped ? 'Following You ✓' : 'Summon Companion'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer Hint */}
        <div className="mt-4 pt-3 border-t border-amber-900/50 flex items-center justify-between text-[11px] text-amber-300/80 font-mono">
          <span>Stand near your companion in-game and press <strong className="text-amber-300">[E]</strong> to pet!</span>
          <span className="text-amber-400 font-bold">Hotkey: [P]</span>
        </div>
      </div>
    </div>
  );
}
