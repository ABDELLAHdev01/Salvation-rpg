import React from 'react';
import ProgressBar from './ui/ProgressBar';

export default function XpBar({ current = 0, target = 1, label = 'XP', tone = 'gold' }) {
  const safeTarget = Math.max(1, target);
  const remaining = Math.max(0, safeTarget - current);

  return (
    <div className="space-y-1">
      <ProgressBar
        value={current}
        max={safeTarget}
        label={label}
        tone={tone}
        showMeta={true}
      />
      <p className="px-1 text-[10px] text-gray-500 uppercase tracking-widest font-medium">
        {remaining} XP to next level
      </p>
    </div>
  );
}
