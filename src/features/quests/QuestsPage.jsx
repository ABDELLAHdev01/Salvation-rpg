import React from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import { mockQuests } from '../../core/data/mockQuests';

export default function Quests() {
  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-5xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-6 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">Journal</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">Quest Log</h1>
          <p className="mt-3 text-base text-gray-300">Track your active and upcoming missions.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1 text-yellow-200">Active: 2</span>
            <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1 text-yellow-200">In Progress: 1</span>
            <span className="rounded-full border border-yellow-700/40 bg-gray-900/80 px-3 py-1 text-gray-300">Completed: 0</span>
          </div>
          <div className="mt-6 space-y-4">
            {mockQuests.map((quest) => (
              <Link
                key={quest.id}
                to={`/quests/${quest.id}`}
                className="block rounded-xl border border-yellow-700/30 bg-gray-900/80 p-4 transition hover:border-yellow-500/60 hover:bg-gray-900 hover-lift"
              >
                <div className="flex items-center justify-between text-sm text-gray-300">
                  <span>{quest.title}</span>
                  <span className="text-yellow-300">{quest.progress}%</span>
                </div>
                <p className="mt-2 text-xs uppercase tracking-[0.3em] text-gray-400">{quest.status}</p>
              </Link>
            ))}
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
