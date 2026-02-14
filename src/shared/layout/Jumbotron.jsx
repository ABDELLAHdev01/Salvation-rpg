import React from "react";
import { Link } from "react-router-dom";
import PlayersCount from "../ui/PlayersCount";

export default function Jumbotron() {
  return (
    <section className="relative min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 px-4 mx-auto max-w-7xl text-center py-24 lg:py-56 flex flex-col justify-center h-full">

        <img
          alt="Salvation Logo"
          src="logo.webp"
          className="mx-auto h-80 w-auto opacity-0 animate-[fadeIn_1s_ease-in-out_forwards]"
        />
        <h2 className="text-lg uppercase tracking-widest text-gray-300 mb-2 opacity-0 animate-[fadeIn_1s_ease-in-out_forwards]">
          A world torn by war, bound by fate
        </h2>

        <h1 className="mb-6 text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-tight text-white drop-shadow-xl opacity-0 animate-[slideUp_1s_0.3s_ease-out_forwards] hero-title">
          Enter the World of <span className="text-yellow-500">Sal<span className="text-white">Vation</span></span>
        </h1>

        <p className="mb-8 text-lg font-light text-gray-300 lg:text-xl sm:px-12 lg:px-44 opacity-0 animate-[fadeIn_1s_0.6s_ease-in-out_forwards]">
          In the shadows of shattered kingdoms and forgotten gods, heroes rise once more. Forge your name into legend as you choose your race, master your fate, and carve a path through treacherous lands and ancient lore.
        </p>

        <p className="mb-12 text-base font-medium text-gray-400 opacity-0 animate-[fadeIn_1s_0.9s_ease-in-out_forwards]">
          Elves whisper in the forests. Orcs sharpen their blades. Vampires hunger beneath the moon. <br />
          Will you be remembered... or forgotten?
        </p>

        <div className="flex flex-col sm:flex-row sm:justify-center gap-4 opacity-0 animate-[fadeIn_1s_1.2s_ease-in-out_forwards]">
          <Link
            to="/character"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white rounded-lg transition-all shadow-lg action-primary"
          >
            Begin Your Quest
            <svg
              className="w-4 h-4 ml-2 rtl:rotate-180"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 10"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M1 5h12m0 0L9 1m4 4L9 9"
              />
            </svg>
          </Link>

          <a
            href="/lore"
            className="inline-flex items-center justify-center px-6 py-3 text-lg font-medium text-white rounded-lg transition-all action-ghost"
          >
            Learn the Lore
          </a>
        </div>

        <div className="mt-16 opacity-0 animate-[fadeIn_1s_1.5s_ease-in-out_forwards]">
          <PlayersCount />
        </div>
      </div>

      {/* Scroll-down indicator */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </div>

      {/* Inline custom animations using Tailwind's arbitrary values */}
      <style jsx>{`
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
