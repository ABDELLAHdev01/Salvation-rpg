import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../shared/layout/Sidebar';
import {
  worldHistory,
  estateMentors,
  factionLore,
  wardenOath,
  mentorMilestones,
} from '../../core/data/loreData';

const MENTOR_NAV_MAP = {
  elric: { label: 'Visit Workshop', to: '/workshop' },
  selyse: { label: 'Visit Farm Plots', to: '/farm' },
  moira: { label: 'Visit Pastures', to: '/farm/animals' },
  bran: { label: 'Visit Mining Shafts', to: '/mining' },
  gideon: { label: 'Visit Market', to: '/market' },
};

export default function Lore() {
  const [activeTab, setActiveTab] = useState('history');
  const [selectedMentorId, setSelectedMentorId] = useState('elric');

  const selectedMentor =
    estateMentors.find((m) => m.id === selectedMentorId) || estateMentors[0];
  const selectedMilestone = mentorMilestones.find(
    (m) => m.mentorId === selectedMentor.id
  );
  const mentorNav = MENTOR_NAV_MAP[selectedMentor.id] || {
    label: 'Visit Estate',
    to: '/housing',
  };

  const tabs = [
    { id: 'history', label: 'World Chronicles' },
    { id: 'factions', label: 'The Three Bastions' },
    { id: 'mentors', label: 'Estate Mentors' },
    { id: 'creed', label: 'The Warden\'s Creed' },
  ];

  return (
    <section className="min-h-screen bg-center bg-cover bg-no-repeat bg-[url('/jbm.webp')] bg-gray-900 bg-blend-multiply dashboard-shell lg:pl-64">
      <Sidebar />
      <div className="dashboard-orb orb-1" />
      <div className="dashboard-orb orb-2" />
      <div className="dashboard-orb orb-3" />
      <div className="relative z-10 mx-auto max-w-6xl px-6 py-16 pt-24">
        <div className="rounded-2xl p-8 shadow-xl backdrop-blur court-reveal glass-panel">
          
          {/* Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-yellow-700/30 pb-6">
            <div>
              <p className="section-kicker text-xs uppercase tracking-[0.4em] text-yellow-500">The Archivum of Aethelgard</p>
              <h1 className="mt-2 text-4xl font-extrabold text-white hero-title">Chronicles of Salvation</h1>
              <p className="mt-2 max-w-2xl text-base text-gray-300">
                The ancient annals of the Sunforge, the surviving realms, and the guardians who tend the solitary hearth.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center rounded-full px-5 py-2 text-xs font-semibold text-yellow-200 action-ghost"
              >
                Back to Dashboard
              </Link>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-6 flex flex-wrap gap-2 border-b border-yellow-700/20 pb-4">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
                  activeTab === tab.id
                    ? 'bg-yellow-500/20 border border-yellow-500/60 text-yellow-300 shadow-md'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/40 border border-transparent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab 1: World History */}
          {activeTab === 'history' && (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                {worldHistory.map((item) => (
                  <div
                    key={item.id}
                    className="court-card rounded-2xl border border-yellow-700/30 bg-gray-950/80 p-6 transition hover:border-yellow-500/50"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-yellow-500/90">
                        {item.era}
                      </span>
                    </div>
                    <h2 className="mt-2 text-xl font-bold text-white">{item.title}</h2>
                    <p className="mt-3 text-sm leading-relaxed text-gray-300">{item.text}</p>
                    <blockquote className="mt-4 border-l-2 border-yellow-600/50 pl-3 text-xs italic text-yellow-200/80">
                      "{item.quote}"
                    </blockquote>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: The Three Bastions */}
          {activeTab === 'factions' && (
            <div className="mt-8 space-y-6">
              <div className="grid gap-6 lg:grid-cols-3">
                {factionLore.map((faction) => (
                  <div
                    key={faction.id}
                    className="court-card flex flex-col justify-between rounded-2xl border border-yellow-700/30 bg-gray-950/85 p-6 transition hover:border-yellow-500/50"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={faction.logo}
                          alt={faction.name}
                          className="h-10 w-10 object-contain drop-shadow"
                        />
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-yellow-500">
                            {faction.kicker}
                          </p>
                          <h2 className="text-2xl font-bold text-white">{faction.name}</h2>
                        </div>
                      </div>
                      <p className="mt-4 text-xs italic text-gray-400 font-medium">"{faction.philosophy}"</p>
                      <p className="mt-3 text-sm leading-relaxed text-gray-300">{faction.description}</p>
                    </div>

                    <div className="mt-6 rounded-xl border border-yellow-700/30 bg-gray-900/90 p-3.5">
                      <p className="text-[10px] uppercase tracking-wider text-yellow-400 font-bold">
                        ✦ Faction Passive Trait
                      </p>
                      <p className="mt-1 text-xs font-semibold text-white">{faction.passiveName}</p>
                      <p className="mt-0.5 text-xs text-yellow-200/90">{faction.passiveBonus}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Estate Mentors */}
          {activeTab === 'mentors' && (
            <div className="mt-8 space-y-8">
              {/* Featured Illustrated Dialogue Banner */}
              <div className="court-card rounded-2xl border-2 border-yellow-500/50 bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-6 md:p-8 shadow-xl">
                <div className="flex flex-col md:flex-row gap-6 items-start">
                  <div className="relative shrink-0 mx-auto md:mx-0">
                    <div className="absolute inset-0 rounded-2xl bg-yellow-500/20 blur-xl" />
                    <img
                      src={selectedMentor.avatar}
                      alt={selectedMentor.name}
                      className="relative h-28 w-28 md:h-36 md:w-36 rounded-2xl border-2 border-yellow-500/70 object-cover shadow-2xl"
                    />
                    <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-yellow-500 px-3 py-0.5 text-[10px] font-black uppercase tracking-wider text-gray-950 shadow">
                      {selectedMentor.domain.split('&')[0]}
                    </span>
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-700/30 pb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-yellow-500">
                          Frontier Mentor & Counsel
                        </span>
                        <h2 className="text-2xl md:text-3xl font-extrabold text-white hero-title">
                          {selectedMentor.name}
                        </h2>
                        <p className="text-xs font-semibold text-yellow-300">
                          {selectedMentor.title}
                        </p>
                      </div>
                      <Link
                        to={mentorNav.to}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-yellow-500/50 bg-yellow-500/20 px-4 py-2 text-xs font-bold text-yellow-200 transition hover:bg-yellow-500/30"
                      >
                        {mentorNav.label} →
                      </Link>
                    </div>

                    <p className="mt-3 text-sm leading-relaxed text-gray-300">
                      {selectedMentor.lore}
                    </p>

                    {/* Dialogue speech banner */}
                    <div className="mt-4 rounded-xl border border-yellow-700/30 bg-black/40 p-4">
                      <p className="text-xs uppercase tracking-wider text-yellow-500 font-bold mb-1">
                        ✦ Mentor Dialogue
                      </p>
                      <blockquote className="text-sm italic text-gray-100 font-serif leading-relaxed">
                        "{selectedMentor.quote}"
                      </blockquote>
                      <p className="mt-2 text-xs text-yellow-200/90 font-medium">
                        <strong className="text-yellow-400">Practical Guidance: </strong>
                        {selectedMentor.tip}
                      </p>
                    </div>

                    {/* Associated Milestone */}
                    {selectedMilestone && (
                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-yellow-700/20 bg-gray-950/70 p-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-yellow-400">👑</span>
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                              Milestone Accord: {selectedMilestone.summary}
                            </p>
                            <p className="text-xs font-bold text-white">
                              {selectedMilestone.name}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="rounded bg-yellow-500/20 border border-yellow-500/40 px-2 py-0.5 text-[10px] font-bold text-yellow-300">
                            +{selectedMilestone.rewardGold}g
                          </span>
                          <span className="rounded bg-blue-500/20 border border-blue-500/40 px-2 py-0.5 text-[10px] font-bold text-blue-300">
                            +{selectedMilestone.rewardXp} XP
                          </span>
                          <span className="rounded bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 text-[10px] font-bold text-purple-300">
                            Title: {selectedMilestone.rewardTitle}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Mentors Selection Grid */}
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-500 mb-4">
                  Select a Mentor to Consult
                </p>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {estateMentors.map((mentor) => {
                    const isSelected = mentor.id === selectedMentorId;
                    return (
                      <button
                        key={mentor.id}
                        type="button"
                        onClick={() => setSelectedMentorId(mentor.id)}
                        className={`court-card flex flex-col justify-between rounded-2xl border p-5 text-left transition ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-500/10 shadow-lg ring-1 ring-yellow-500/50'
                            : 'border-yellow-700/30 bg-gray-950/85 hover:border-yellow-500/40 hover:bg-gray-900/60'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`h-12 w-12 shrink-0 overflow-hidden rounded-xl border bg-gray-900 shadow ${isSelected ? 'border-yellow-400' : 'border-yellow-700/40'}`}>
                            <img
                              src={mentor.avatar}
                              alt={mentor.name}
                              className="h-full w-full object-cover"
                            />
                          </div>
                          <div>
                            <h3 className="text-sm font-bold text-white">{mentor.name}</h3>
                            <p className="text-[11px] text-yellow-500 font-semibold">{mentor.title}</p>
                            <span className="inline-block mt-0.5 rounded bg-gray-800/80 px-2 py-0.5 text-[9px] text-gray-300">
                              {mentor.domain}
                            </span>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-400 line-clamp-2 italic">
                          "{mentor.quote}"
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: The Warden's Creed */}
          {activeTab === 'creed' && (
            <div className="mt-8 space-y-6">
              <div className="court-card rounded-2xl border border-yellow-700/40 bg-gray-950/90 p-8 text-center max-w-3xl mx-auto">
                <span className="text-xs uppercase tracking-[0.4em] text-yellow-500 font-bold">The Sacred Vow</span>
                <h2 className="mt-3 text-3xl font-extrabold text-white">{wardenOath.title}</h2>
                <div className="my-6 mx-auto h-0.5 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                <p className="text-base italic leading-relaxed text-gray-200 px-4">
                  "{wardenOath.inscription}"
                </p>
                <div className="my-6 mx-auto h-0.5 w-24 bg-gradient-to-r from-transparent via-yellow-500 to-transparent" />
                <p className="text-xs text-gray-400 max-w-xl mx-auto">
                  Carved into the lintel of every ancestral homestead across the Hearthlands. Inscribed by the First Wardens who refused to let the darkness prevail.
                </p>
              </div>
            </div>
          )}

          {/* Footer Navigation */}
          <div className="mt-10 flex flex-wrap gap-4 border-t border-yellow-700/20 pt-6">
            <Link
              to="/dashboard"
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-white action-primary"
            >
              Command Deck
            </Link>
            <Link
              to="/missions"
              className="inline-flex items-center rounded-lg px-5 py-2.5 text-sm font-semibold text-yellow-200 action-ghost"
            >
              The Warden's Chronicle
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
