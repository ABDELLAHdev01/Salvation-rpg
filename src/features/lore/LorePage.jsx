import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../shared/layout/Navbar';

const chapters = [
  {
    title: 'The Shattered Kingdoms',
    text: 'Once united beneath a radiant banner, the kingdoms splintered after the Sunforge fell dark.',
  },
  {
    title: 'The North Wall',
    text: 'A fortress of iron and oathbound sentinels, holding back the shadow tide for a thousand winters.',
  },
  {
    title: 'The Ember Oath',
    text: 'A covenant sworn by the first heroes to rekindle the forge and bind fate to flame.',
  },
];

export default function Lore() {
  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <Navbar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Chronicles</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Lore of SalVation</h1>
          <p className="mt-4 text-base text-gray-300">
            Trace the legends that shape the realm. Each chapter is a fragment of the world you now command.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {chapters.map((chapter) => (
              <div key={chapter.title} className="rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-5 hover-lift">
                <h2 className="text-lg font-semibold text-white">{chapter.title}</h2>
                <p className="mt-2 text-sm text-gray-300">{chapter.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to="/character"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary"
            >
              Begin Your Quest
            </Link>
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Return to Sanctuary
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
