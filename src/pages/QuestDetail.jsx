import React from 'react';
import { Link, useParams } from 'react-router-dom';
import Navbar from '../shared/layout/Navbar';
import { mockQuests } from '../data/mockQuests';

export default function QuestDetail() {
  const { questId } = useParams();
  const quest = mockQuests.find((item) => item.id === questId);

  if (!quest) {
    return (
      <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply">
        <Navbar />
        <div className="mx-auto max-w-4xl px-6 py-16 pt-24 text-center">
          <div className="rounded-2xl border border-yellow-700/40 bg-gray-950/70 p-8 shadow-xl backdrop-blur">
            <h1 className="text-3xl font-bold text-white">Quest not found</h1>
            <p className="mt-3 text-gray-300">The trail has gone cold. Return to the quest log.</p>
            <Link
              to="/quests"
              className="mt-6 inline-flex items-center rounded-lg border border-yellow-700/50 bg-gray-900/80 px-4 py-2 text-sm font-semibold text-yellow-200 hover:bg-gray-900"
            >
              Back to Quest Log
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('./jbm.jpg')] bg-gray-900 bg-blend-multiply dashboard-shell">
      <Navbar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-4xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur reveal glass-panel">
          <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">{quest.region}</p>
          <h1 className="mt-3 text-4xl font-extrabold text-white hero-title">{quest.title}</h1>
          <p className="mt-3 text-base text-gray-300">{quest.summary}</p>

          <div className="mt-6">
            <div className="flex items-center justify-between text-sm text-gray-300">
              <span>{quest.status}</span>
              <span className="text-yellow-300">{quest.progress}%</span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-gray-800">
              <div className="h-full rounded-full bg-yellow-500 shimmer-bar" style={{ width: `${quest.progress}%` }} />
            </div>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div>
              <h2 className="text-lg font-semibold text-white">Objectives</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {quest.objectives.map((objective) => (
                  <li key={objective} className="rounded-lg border border-yellow-700/30 bg-gray-900/80 px-3 py-2">
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Rewards</h2>
              <ul className="mt-3 space-y-2 text-sm text-gray-300">
                {quest.rewards.map((reward) => (
                  <li key={reward} className="rounded-lg border border-yellow-700/30 bg-gray-900/80 px-3 py-2">
                    {reward}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-2xl border border-yellow-700/30 bg-gray-900/80 p-6 hover-lift">
            <h2 className="text-lg font-semibold text-white">Recommended Party</h2>
            <p className="mt-2 text-sm text-gray-300">A balanced squad will handle the threats ahead.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-sm text-gray-300">Vanguard Tank</div>
              <div className="rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-sm text-gray-300">Arcane Support</div>
              <div className="rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-sm text-gray-300">Ranged Scout</div>
              <div className="rounded-lg border border-yellow-700/20 bg-gray-950/70 px-3 py-2 text-sm text-gray-300">Healer</div>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="rounded-lg px-4 py-2 text-sm font-semibold text-white action-primary">
              Continue Quest
            </button>
            <Link
              to="/quests"
              className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-semibold text-yellow-200 action-ghost"
            >
              Back to Quest Log
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
