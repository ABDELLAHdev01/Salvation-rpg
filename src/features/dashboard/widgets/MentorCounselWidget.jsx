import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { estateMentors, mentorMilestones } from '../../../core/data/loreData';

const MENTOR_NAV_MAP = {
  elric: { label: 'To Workshop', to: '/workshop' },
  selyse: { label: 'To Farm Plots', to: '/farm' },
  moira: { label: 'To Pastures', to: '/farm/animals' },
  bran: { label: 'To Mining Shafts', to: '/mining' },
  gideon: { label: 'To Market', to: '/market' },
};

export default function MentorCounselWidget({ profile }) {
  const [selectedMentorId, setSelectedMentorId] = useState('selyse');

  const mentor = estateMentors.find((m) => m.id === selectedMentorId) || estateMentors[0];
  const navTarget = MENTOR_NAV_MAP[mentor.id] || { label: 'To Estate', to: '/housing' };

  const milestone = mentorMilestones.find((m) => m.mentorId === mentor.id);
  const isMilestoneClaimed = milestone
    ? (profile?.acknowledgedMilestones || []).includes(milestone.id)
    : false;

  const getDomainStatus = (mentorId) => {
    switch (mentorId) {
      case 'selyse':
        return `Farm Level ${profile?.farmLevel ?? 1} · ${profile?.farmPlots?.length ?? 0} Plots Tilled`;
      case 'bran':
        return `Mining Level ${profile?.miningLevel ?? 1} · Tier ${profile?.pickaxeLevel ?? 1} Pickaxe`;
      case 'elric':
        return `Workshop Level ${profile?.workshopLevel ?? 1} · ${profile?.workshopQueue?.length ?? 0} Items Queued`;
      case 'moira':
        return `Estate Standing · ${profile?.estateAmenities?.length ?? 0} Amenities Furnished`;
      case 'gideon':
        return `Treasury: ${profile?.stats?.gold ?? 0}g · Contract Standing`;
      default:
        return 'Frontier Guardian';
    }
  };

  return (
    <div className="court-card rounded-2xl border border-yellow-700/30 bg-gray-950/85 p-6 backdrop-blur transition hover:border-yellow-500/40">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-yellow-700/20 pb-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-yellow-500">
            Advisory Council
          </p>
          <h3 className="text-xl font-bold text-white hero-title">Estate Mentors</h3>
        </div>
        <Link
          to="/lore"
          className="text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition"
        >
          View Full Annals →
        </Link>
      </div>

      {/* Mentor Avatars Selector */}
      <div className="mt-4 flex items-center justify-between gap-2 overflow-x-auto pb-2 scrollbar-thin">
        {estateMentors.map((m) => {
          const isSelected = m.id === selectedMentorId;
          return (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMentorId(m.id)}
              className={`group flex items-center gap-2 rounded-xl p-1.5 transition ${
                isSelected
                  ? 'bg-yellow-500/20 border border-yellow-500/60 shadow-md'
                  : 'border border-transparent hover:bg-gray-900/60'
              }`}
              title={`${m.name} (${m.domain})`}
            >
              <div
                className={`relative h-10 w-10 shrink-0 overflow-hidden rounded-lg border transition ${
                  isSelected ? 'border-yellow-400 ring-2 ring-yellow-400/40' : 'border-yellow-700/30 group-hover:border-yellow-500/50'
                }`}
              >
                <img
                  src={m.avatar}
                  alt={m.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="hidden sm:block text-left pr-2">
                <p className={`text-xs font-bold leading-none ${isSelected ? 'text-yellow-300' : 'text-gray-300'}`}>
                  {m.name.split(' ')[0]}
                </p>
                <p className="text-[10px] text-gray-500 capitalize">{m.domain.split('&')[0]}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Mentor Dialogue Vignette */}
      <div className="mt-4 rounded-xl border border-yellow-700/25 bg-gray-900/60 p-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b border-yellow-700/20 pb-3">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-yellow-500/50 bg-gray-950 shadow">
              <img
                src={mentor.avatar}
                alt={mentor.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h4 className="text-base font-bold text-white">{mentor.name}</h4>
              <p className="text-xs text-yellow-400 font-medium">{mentor.title}</p>
            </div>
          </div>
          <div className="rounded-lg bg-gray-950/80 border border-yellow-700/20 px-3 py-1.5 text-right">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Current Standing
            </span>
            <span className="text-xs font-bold text-yellow-200">
              {getDomainStatus(mentor.id)}
            </span>
          </div>
        </div>

        {/* Dialogue quote */}
        <div className="mt-3">
          <blockquote className="border-l-2 border-yellow-500/60 pl-3 text-xs italic text-gray-200 leading-relaxed">
            "{mentor.quote}"
          </blockquote>
          <div className="mt-3 flex items-start gap-2 rounded-lg bg-yellow-950/20 border border-yellow-700/30 p-2.5">
            <span className="text-yellow-400 text-xs">💡</span>
            <p className="text-[11px] text-yellow-100/90 leading-tight">
              <strong className="text-yellow-300">Frontier Counsel: </strong>
              {mentor.tip}
            </p>
          </div>
        </div>

        {/* Milestone & Quick Action */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 pt-2">
          {milestone ? (
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${isMilestoneClaimed ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-yellow-500/60 animate-pulse'}`} />
              <span className="text-xs text-gray-300">
                Honor: <strong className="text-white">{milestone.name}</strong>
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${isMilestoneClaimed ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30' : 'bg-yellow-950/60 text-yellow-300 border border-yellow-500/30'}`}>
                {isMilestoneClaimed ? 'Accord Sealed' : milestone.summary}
              </span>
            </div>
          ) : (
            <div className="text-xs text-gray-400 italic">Continuous Trade Partner</div>
          )}

          <Link
            to={navTarget.to}
            className="inline-flex items-center gap-1 rounded-lg border border-yellow-600/40 bg-yellow-600/20 px-3 py-1.5 text-xs font-bold text-yellow-200 transition hover:bg-yellow-600/30"
          >
            {navTarget.label} →
          </Link>
        </div>
      </div>
    </div>
  );
}
