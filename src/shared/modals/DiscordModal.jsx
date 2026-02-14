import React, { useEffect, useState } from 'react';
import './DiscordModal.css'; // Import the CSS file

const DISCORD_URL = 'https://discord.gg/BgqSghsmWY';
const DISCORD_INVITE_KEY = 'discordInviteSeen';

export default function DiscordModal() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const hasSeen = localStorage.getItem(DISCORD_INVITE_KEY);
    if (!hasSeen) {
      setIsModalOpen(true);
    }
  }, []);

  const handleCloseModal = () => {
    localStorage.setItem(DISCORD_INVITE_KEY, 'true');
    setIsModalOpen(false);
  };

  const handleJoinDiscord = () => {
    localStorage.setItem(DISCORD_INVITE_KEY, 'true');
    setIsModalOpen(false);
  };

  return (
    isModalOpen ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 fade-in">
        <div className="w-full max-w-md rounded-2xl border border-yellow-700/30 bg-gray-950/95 p-6 shadow-xl">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.3em] text-yellow-400">Guild Signal</p>
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-lg border border-yellow-700/40 px-3 py-1 text-xs font-semibold text-yellow-200"
            >
              Later
            </button>
          </div>
          <h2 className="mt-3 text-xl font-semibold text-white">Join the Discord Hall</h2>
          <p className="mt-2 text-sm text-gray-300">
            Meet other adventurers, share builds, and get event updates straight from the realm.
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleJoinDiscord}
              className="rounded-lg px-4 py-2 text-xs font-semibold action-primary text-white"
            >
              Join Discord
            </a>
            <button
              type="button"
              onClick={handleCloseModal}
              className="rounded-lg border border-yellow-700/40 px-4 py-2 text-xs font-semibold text-yellow-200"
            >
              Skip
            </button>
          </div>
        </div>
      </div>
    ) : null
  );
}
