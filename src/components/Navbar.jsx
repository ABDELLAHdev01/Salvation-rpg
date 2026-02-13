import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="fixed w-full z-50 nav-shell backdrop-blur">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex flex-col items-start gap-1">
            <span className="text-2xl font-bold text-yellow-500 tracking-wide hero-title">
              Sal<span className="text-white">Vation</span>
            </span>
            <span className="text-[10px] uppercase tracking-[0.35em] text-yellow-400">
              Online Fantastic RPG Game
            </span>
          </Link>
          <Link
            to="/character"
            className="inline-flex items-center rounded-full px-4 py-2 text-sm font-medium text-white action-primary nav-glow focus:outline-none focus:ring-2 focus:ring-white"
          >
            Start Your Journey
          </Link>
        </div>
      </div>
    </nav>
  );
}
