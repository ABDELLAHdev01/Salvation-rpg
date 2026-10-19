import React from 'react';
import toast from 'react-hot-toast';
import { getPendingMentorMilestones, getMentorById } from '../../../core/data/loreData';
import characterService from '../../../core/services/CharacterService';
import audioManager from '../../../core/audio/AudioManager';

export default function MentorMilestoneModal({ profile, onMilestoneClaimed }) {
  const pendingMilestones = getPendingMentorMilestones(profile);

  if (!pendingMilestones || pendingMilestones.length === 0) {
    return null;
  }

  const activeMilestone = pendingMilestones[0];
  const mentor = getMentorById(activeMilestone.mentorId);

  const handleClaim = () => {
    try {
      const updatedProfile = characterService.acknowledgeMentorMilestone(activeMilestone.id);
      audioManager.play('levelup');
      toast.success(`Acclaim Accepted: Unlocked title "${activeMilestone.rewardTitle}"!`, {
        icon: '👑',
      });
      if (onMilestoneClaimed) {
        onMilestoneClaimed(updatedProfile || profile);
      }
    } catch (err) {
      console.error('Failed to acknowledge mentor milestone:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-yellow-500/60 bg-gray-950 p-6 md:p-8 shadow-2xl shadow-yellow-950/50 court-card text-center">
        {/* Subtle background ambient glow */}
        <div className="pointer-events-none absolute -top-24 left-1/2 h-48 w-72 -translate-x-1/2 rounded-full bg-yellow-500/15 blur-3xl" />

        {/* Section kicker */}
        <div className="flex items-center justify-center gap-2">
          <span className="h-px w-8 bg-yellow-500/40" />
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-500">
            Estate Counsel & Tribute
          </p>
          <span className="h-px w-8 bg-yellow-500/40" />
        </div>

        {/* Mentor Avatar */}
        <div className="relative mx-auto mt-5 h-20 w-20">
          <div className="absolute inset-0 rounded-full bg-yellow-500/30 blur-md" />
          <img
            src={mentor?.avatar || '/raceicon/humanmale.webp'}
            alt={mentor?.name || 'Mentor'}
            className="relative h-20 w-20 rounded-full border-2 border-yellow-400/90 object-cover shadow-md"
          />
        </div>

        {/* Mentor Identity */}
        <div className="mt-3">
          <h3 className="text-xl font-bold text-white hero-title">{mentor?.name}</h3>
          <p className="text-xs font-semibold text-yellow-400">{mentor?.title}</p>
          <span className="inline-block mt-1 text-[10px] uppercase tracking-wider text-gray-400">
            Domain: {mentor?.domain}
          </span>
        </div>

        {/* Milestone Title & Summary */}
        <div className="mt-5 rounded-xl border border-yellow-700/30 bg-gray-900/80 p-4 text-left">
          <div className="flex items-center justify-between gap-2 border-b border-yellow-700/20 pb-2">
            <span className="text-xs font-black uppercase tracking-wider text-yellow-400">
              ✦ Milestone Achieved
            </span>
            <span className="rounded bg-yellow-500/20 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
              {activeMilestone.summary}
            </span>
          </div>
          <h4 className="mt-2 text-base font-bold text-white">{activeMilestone.name}</h4>
          <p className="mt-2 text-xs leading-relaxed text-gray-300 italic">
            "{activeMilestone.dialogue}"
          </p>
          <p className="mt-3 border-l-2 border-yellow-500/40 pl-2 text-[11px] text-yellow-200/80">
            — {activeMilestone.quote}
          </p>
        </div>

        {/* Tribute Rewards */}
        <div className="mt-5">
          <p className="text-[10px] uppercase tracking-[0.25em] text-gray-400 font-semibold">
            Tribute Bestowed
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-500/40 bg-yellow-950/40 px-3 py-1 text-xs font-bold text-yellow-300">
              🪙 +{activeMilestone.rewardGold} Gold
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-blue-500/40 bg-blue-950/40 px-3 py-1 text-xs font-bold text-blue-300">
              ✨ +{activeMilestone.rewardXp} Player XP
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-purple-500/40 bg-purple-950/40 px-3 py-1 text-xs font-bold text-purple-300">
              👑 Title: {activeMilestone.rewardTitle}
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 flex justify-center">
          <button
            type="button"
            onClick={handleClaim}
            className="w-full rounded-xl bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 py-3 text-sm font-bold text-gray-950 shadow-lg shadow-yellow-950/60 transition hover:brightness-110 active:scale-[0.99]"
          >
            Accept Acclaim & Seal Accord
          </button>
        </div>
      </div>
    </div>
  );
}
