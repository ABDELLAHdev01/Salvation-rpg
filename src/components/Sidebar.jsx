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
  { name: 'Adventure', href: '/adventure', icon: BookOpenIcon },
  { name: 'Zones', href: '/zones', icon: CompassIcon },
  { name: 'Residence', href: '/housing', icon: HomeIcon },
  { name: 'Farm', href: '/farm', icon: PigIcon },
  { name: 'Mine', href: '/mining', icon: PickaxeIcon },
  { name: 'Workshop', href: '/workshop', icon: HammerIcon },
  { name: 'Market', href: '/market', icon: BriefcaseIcon },
  { name: 'Discord', href: 'https://discord.gg/BgqSghsmWY', icon: UserCircleIcon, external: true },
];

const offlineNavItems = [{ name: 'Load Save', href: '/load-save', icon: ArrowDownTrayIcon }];

export default function Sidebar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => setIsOpen((prev) => !prev);


  const items = [...navItems, ...offlineNavItems];

  const NavLinks = () => (
    <nav className="fantasy-nav space-y-1">
      {items.map((item) => {
        const isActive = location.pathname === item.href;
        const linkClassName = `fantasy-navlink sidebar-link flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold transition ${
          isActive
            ? 'fantasy-navlink-active sidebar-link-active bg-yellow-500/10 text-yellow-200'
            : 'text-gray-300 hover:bg-white/5 hover:text-yellow-200'
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
              <item.icon className="fantasy-nav-icon h-5 w-5" />
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
            <item.icon className="fantasy-nav-icon h-5 w-5" />
            <span>{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="fantasy-topbar sidebar-topbar lg:hidden fixed inset-x-0 top-0 z-50 flex items-center justify-between px-4 py-3 backdrop-blur">
        <div className="flex flex-1 justify-center">
          <Link to="/dashboard" className="fantasy-logo flex items-center">
            <img
              src="/logo.webp"
              alt="Salvation"
              className="h-24 w-auto drop-shadow-[0_14px_32px_rgba(234,179,8,0.5)]"
            />
          </Link>
        </div>
        <button
          type="button"
          onClick={handleToggle}
          className="rounded-lg border border-yellow-700/40 p-2 text-yellow-200"
        >
          {isOpen ? <XMarkIcon className="h-5 w-5" /> : <Bars3Icon className="h-5 w-5" />}
        </button>
      </div>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fantasy-sidebar sidebar-shell fixed inset-y-0 left-0 z-50 w-64 p-6 backdrop-blur transition-transform lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center">
          <Link to="/dashboard" className="fantasy-logo flex items-center">
            <img
              src="/logo.webp"
              alt="Salvation"
              className="h-36 w-auto drop-shadow-[0_16px_40px_rgba(234,179,8,0.55)]"
            />
          </Link>
          <button
            type="button"
            onClick={handleToggle}
            className="lg:hidden rounded-lg border border-yellow-700/40 p-2 text-yellow-200"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        <div className="fantasy-divider" aria-hidden="true">
          <span className="fantasy-divider-line" />
          <span className="fantasy-divider-rune">✶</span>
          <span className="fantasy-divider-line" />
        </div>

        <div className="mt-8">
          <NavLinks />
        </div>

        <div className="mt-6">
          <div className="fantasy-divider" aria-hidden="true">
            <span className="fantasy-divider-line" />
            <span className="fantasy-divider-rune">✶</span>
            <span className="fantasy-divider-line" />
          </div>
        </div>

        <div className="mt-6 pt-2">
          <Link
            to="/load-save"
            className="block w-full rounded-xl border border-yellow-700/40 px-3 py-2 text-center text-sm font-semibold text-yellow-200"
          >
            Manage Save
          </Link>
        </div>
      </aside>
    </>
  );
}
