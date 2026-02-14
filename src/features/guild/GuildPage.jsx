import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';

const members = [
  { name: 'Lyra the Dawnblade', role: 'Commander' },
  { name: 'Korran Ashheart', role: 'Vanguard' },
  { name: 'Mira of the Vale', role: 'Archivist' },
];

export default function Guild() {
  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-6 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Hall</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Guild & Party</h1>
          <p className="mt-3 text-base text-gray-300">
            Coordinate with your allies, plan raids, and keep the oath of your banner.
          </p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-4 hover-lift">
              <h2 className="text-lg font-semibold text-white">Dawnforged Vanguard</h2>
              <p className="mt-1 text-sm text-gray-300">Guild Rank: Silver III</p>
            </div>
            <div className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-4 hover-lift">
              <h2 className="text-lg font-semibold text-white">Party Status</h2>
              <p className="mt-1 text-sm text-gray-300">2/5 allies ready</p>
            </div>
          </div>
          <div className="mt-6">
            <p className="text-sm uppercase tracking-[0.3em] text-gray-400">Active Members</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {members.map((member) => (
                <div key={member.name} className="rounded-xl border border-yellow-700/30 bg-gray-900/80 p-4 hover-lift">
                  <p className="text-white font-semibold">{member.name}</p>
                  <p className="text-sm text-gray-300">{member.role}</p>
                </div>
              ))}
            </div>
          </div>
          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </section>
  );
}
