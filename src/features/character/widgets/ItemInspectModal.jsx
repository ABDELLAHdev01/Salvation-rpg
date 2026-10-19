import React from 'react';
import { Link } from 'react-router-dom';
import audioManager from '../../../core/audio/AudioManager';

const rarityStyles = {
  Common: 'border-gray-500/50 text-gray-300 bg-gray-900/60',
  Uncommon: 'border-emerald-400/50 text-emerald-200 bg-emerald-950/40',
  Rare: 'border-sky-400/50 text-sky-200 bg-sky-950/40',
  Epic: 'border-fuchsia-400/50 text-fuchsia-200 bg-fuchsia-950/40',
  Legendary: 'border-amber-400/50 text-amber-200 bg-amber-950/40',
  Mythic: 'border-rose-400/50 text-rose-200 bg-rose-950/40',
  Relic: 'border-yellow-400/50 text-yellow-200 bg-yellow-950/50',
};

const getUtilityAdvice = (item) => {
  if (item.type === 'seed') {
    return {
      tip: 'Can be planted across estate plots to yield fresh crops.',
      nav: { label: 'To Farm Plots', to: '/farm' },
    };
  }
  if (item.type === 'ore') {
    return {
      tip: 'Can be smelted into durable metal bars in the Workshop.',
      nav: { label: 'To Workshop Smelter', to: '/workshop' },
    };
  }
  if (item.type === 'farm-good') {
    return {
      tip: 'High mercantile demand or used in artisan kitchen recipes.',
      nav: { label: 'To Market', to: '/market' },
    };
  }
  if (item.type === 'crafted') {
    return {
      tip: 'Refined artisan good ready to be traded for premium gold.',
      nav: { label: 'To Market', to: '/market' },
    };
  }
  if (item.type === 'gear') {
    return {
      tip: 'Combat equipment providing passive stat boosts in the Colosseum.',
      nav: { label: 'To Colosseum', to: '/arena' },
    };
  }
  return {
    tip: 'Valuable inventory commodity stored in your estate vault.',
    nav: { label: 'To Market', to: '/market' },
  };
};

export default function ItemInspectModal({ item, onClose, onQuickSell }) {
  if (!item) return null;

  const utility = getUtilityAdvice(item);
  const totalStackValue = (item.value || 0) * (item.amount || 1);
  const rarityClass = rarityStyles[item.rarity] || rarityStyles.Common;

  const handleSell = (qty) => {
    if (onQuickSell) {
      onQuickSell(item, qty);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          audioManager.play('tap');
          onClose();
        }
      }}
    >
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border-2 border-yellow-500/60 bg-gray-950 p-6 shadow-2xl shadow-yellow-950/50 court-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => {
            audioManager.play('tap');
            onClose();
          }}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-gray-400 hover:bg-gray-900 hover:text-white transition"
          aria-label="Close modal"
        >
          ✕
        </button>

        {/* Header */}
        <div className="flex items-start gap-4 border-b border-yellow-700/20 pb-4">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl border-2 border-yellow-500/60 bg-gray-900 shadow-md">
            <img
              src={item.image || '/raceicon/noimage.webp'}
              alt={item.name}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/raceicon/noimage.webp';
              }}
            />
          </div>
          <div className="flex-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${rarityClass}`}>
                {item.rarity || 'Common'}
              </span>
              <span className="rounded-full border border-yellow-700/30 bg-gray-900/60 px-2.5 py-0.5 text-[10px] font-semibold text-yellow-300">
                {item.category || 'Misc'}
              </span>
            </div>
            <h3 className="mt-1.5 text-2xl font-bold text-white hero-title">{item.name}</h3>
            <p className="text-xs text-gray-400 capitalize">{item.type || 'Commodity'}</p>
          </div>
        </div>

        {/* Item Lore / Description */}
        <div className="mt-4 rounded-xl border border-yellow-700/20 bg-gray-900/60 p-4">
          <p className="text-xs italic text-gray-200 leading-relaxed">
            "{item.description || 'An artifact of honest industry, preserved within the halls of the Solitary Hearth.'}"
          </p>
          <div className="mt-3 flex items-start gap-2 border-t border-yellow-700/20 pt-2.5">
            <span className="text-yellow-400 text-xs">✦</span>
            <p className="text-[11px] text-yellow-100/90 leading-tight">
              <strong className="text-yellow-300">Vault Guidance: </strong>
              {utility.tip}
            </p>
          </div>
        </div>

        {/* Valuation & Quantity Ledger */}
        <div className="mt-4 grid grid-cols-3 gap-2 rounded-xl border border-yellow-700/20 bg-gray-950/80 p-3 text-center">
          <div className="border-r border-yellow-700/20 pr-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Stored Amount
            </span>
            <span className="text-base font-bold text-yellow-300 font-mono">
              x{item.amount}
            </span>
          </div>
          <div className="border-r border-yellow-700/20 px-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Unit Worth
            </span>
            <span className="text-base font-bold text-yellow-400 font-mono">
              {item.value}g
            </span>
          </div>
          <div className="pl-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-400 block font-semibold">
              Stack Worth
            </span>
            <span className="text-base font-bold text-amber-300 font-mono">
              {totalStackValue}g
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="mt-5 space-y-3">
          {item.value > 0 && onQuickSell && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSell(1)}
                className="flex-1 rounded-xl border border-yellow-600/50 bg-yellow-600/20 py-2.5 text-xs font-bold text-yellow-200 transition hover:bg-yellow-600/30"
              >
                Liquidate 1 ({item.value}g)
              </button>
              {item.amount > 1 && (
                <button
                  type="button"
                  onClick={() => handleSell(item.amount)}
                  className="flex-1 rounded-xl bg-gradient-to-r from-yellow-600 via-amber-500 to-yellow-600 py-2.5 text-xs font-bold text-gray-950 transition hover:brightness-110 shadow"
                >
                  Liquidate All ({totalStackValue}g)
                </button>
              )}
            </div>
          )}

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-yellow-700/20">
            <Link
              to={utility.nav.to}
              onClick={() => {
                audioManager.play('tap');
                onClose();
              }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 hover:text-yellow-300 transition"
            >
              {utility.nav.label} →
            </Link>
            <button
              type="button"
              onClick={() => {
                audioManager.play('tap');
                onClose();
              }}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-gray-400 hover:text-white hover:bg-gray-900 transition"
            >
              Close Ledger
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
