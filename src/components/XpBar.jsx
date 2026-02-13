import React from 'react';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

export default function XpBar({ current = 0, target = 1, label = 'XP', tone = 'gold' }) {
  const safeTarget = Math.max(1, target);
  const progress = clamp(Math.round((current / safeTarget) * 100), 0, 100);
  const remaining = Math.max(0, safeTarget - current);

  return (
    <div>
      <div className={`xp-meter xp-meter--${tone}`}>
        <div className="xp-meter__fill" style={{ width: `${progress}%` }}>
          <span className="xp-meter__spark" />
        </div>
      </div>
      <div className="xp-meter__meta">
        <span>{label}</span>
        <span>
          {current}/{safeTarget} ({progress}%)
        </span>
      </div>
      <p className="xp-meter__sub">{remaining} XP to next level</p>
    </div>
  );
}
