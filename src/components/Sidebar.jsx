import React, { useState } from 'react';
import {
  Bars3Icon,
  HomeIcon,
  XMarkIcon,
  Squares2X2Icon,
  BookOpenIcon,
  BriefcaseIcon,
  UserCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation } from 'react-router-dom';

const PickaxeIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M4 7c2-2 5-2 7 0l1 1 2-2 3 3-2 2 1 1c2 2 2 5 0 7l-1-1c1-1 1-3 0-4l-1-1-6 6-3-3 6-6-1-1c-1-1-3-1-4 0L4 7z"
    />
  </svg>
);

const PigIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="10" cy="12" r="5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 10l-2-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 10l2-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16 15c2 0 3-1 3-3" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 17v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M13 17v2" />
    <rect x="8" y="12" width="4" height="3" rx="1" />
    <circle cx="9" cy="13.5" r="0.4" fill="currentColor" />
    <circle cx="11" cy="13.5" r="0.4" fill="currentColor" />
  </svg>
);

const HammerIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 9h7l2-2 4 4-2 2v7h-3v-6H8l-5-5z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l2-2 5 5-2 2-5-5z" />
  </svg>
);

const CompassIcon = ({ className }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6">
    <circle cx="12" cy="12" r="9" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M10 10l4-2-2 4-4 2 2-4z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 19v2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 12h2" />
  </svg>
);

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Squares2X2Icon },
  { name: 'Farm', href: '/farm', icon: PigIcon },
  { name: 'Mine', href: '/mining', icon: PickaxeIcon },
  { name: 'Market', href: '/market', icon: BriefcaseIcon },
  { name: 'Workshop', href: '/workshop', icon: HammerIcon },
  { name: 'Adventure', href: '/adventure', icon: BookOpenIcon },
  { name: 'Zones', href: '/zones', icon: CompassIcon },
  { name: 'Residence', href: '/housing', icon: HomeIcon }
];


export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);


  const items = [...navItems];

  const NavLinks = () => (
    <nav className="space-y-2">
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const linkClassName = `fantasy-navlink group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition-all ${isActive
          ? 'fantasy-navlink-active pl-8 text-yellow-200'
          : 'text-gray-400 hover:text-yellow-100'
          }`;

        if (item.external) {
          return (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => setIsOpen(false)}
              className={linkClassName}
            >
              <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-yellow-400' : 'text-gray-500'}`} />
              <span>{item.name}</span>
            </a>
          );
        }

        return (
          <Link
            key={item.name}
            to={item.href}
            onClick={() => setIsOpen(false)}
            className={linkClassName}
          >
            <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-yellow-400' : 'text-gray-500'}`} />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="lg:hidden fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 bg-gray-950/90 backdrop-blur border-b border-yellow-700/20">
        <div className="flex flex-1 justify-center">
          <Link to="/dashboard" className="flex items-center">
            <img
              src="/logo.webp"
              alt="Salvation"
              className="h-16 w-auto"
            />
          </Link>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-lg border border-yellow-700/40 p-2 text-yellow-200 bg-gray-900"
        >
          {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fantasy-sidebar-frame fixed inset-y-0 left-0 z-50 w-64 p-6 transition-transform lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        {/* Decorative Corners */}
        <div className="fantasy-corner fantasy-corner-tl" />
        <div className="fantasy-corner fantasy-corner-tr" />
        <div className="fantasy-corner fantasy-corner-bl" />
        <div className="fantasy-corner fantasy-corner-br" />

        <div className="relative z-20 flex flex-col h-full">
          <div className="sidebar-brand-frame flex flex-col items-center justify-center">
            <Link to="/dashboard" className="group">
              <img
                src="/logo.webp"
                alt="Salvation"
                className="h-32 w-auto drop-shadow-[0_0_25px_rgba(234,179,8,0.3)] transition-all group-hover:drop-shadow-[0_0_35px_rgba(234,179,8,0.5)] group-hover:scale-105"
              />
            </Link>
            <div className="mt-2 text-[10px] uppercase tracking-[0.5em] text-yellow-600 font-black">Official Oracle</div>
          </div>

          <div className="fantasy-divider-v2" aria-hidden="true">
            <span className="fantasy-divider-rune-v2">✥</span>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 py-4">
            <p className="px-4 text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mb-4 flex items-center gap-2">
              <span className="h-1 w-1 bg-yellow-700 rounded-full"></span>
              Lexicon of Realm
            </p>
            <NavLinks />
          </div>

          <div className="mt-auto pt-6 border-t border-yellow-700/10">
            <p className="px-4 text-[10px] uppercase tracking-[0.4em] text-gray-500 font-black mb-4">The Archive</p>
            <Link
              to="/load-save"
              className="group relative flex items-center justify-center gap-3 rounded-xl border border-yellow-700/30 bg-yellow-950/20 py-4 text-xs font-black text-yellow-200 hover:bg-yellow-900/30 transition-all overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/0 via-yellow-500/10 to-yellow-500/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              <ArrowDownTrayIcon className="h-5 w-5 text-yellow-500" />
              <span className="uppercase tracking-widest">Invoke Save State</span>
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
