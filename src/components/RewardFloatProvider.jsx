import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const RewardFloatContext = createContext(null);
const DEFAULT_DURATION = 1000;

const getAnchorRect = (anchor) => {
  const node = anchor?.current || anchor;
  if (!node || typeof node.getBoundingClientRect !== 'function') {
    return null;
  }
  return node.getBoundingClientRect();
};

export function RewardFloatProvider({ children }) {
  const [rewards, setRewards] = useState([]);
  const timeoutsRef = useRef(new Set());

  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeoutId) => window.clearTimeout(timeoutId));
      timeoutsRef.current.clear();
    };
  }, []);

  const pushReward = useCallback((text, options = {}) => {
    if (!text) {
      return;
    }

    const {
      anchor,
      tone = 'item',
      duration = DEFAULT_DURATION,
      delay = 0,
      x,
      y,
      jitter = 10,
      offsetY = -6,
    } = options;

    const schedule = () => {
      let posX = x;
      let posY = y;

      if (posX == null || posY == null) {
        const rect = getAnchorRect(anchor);
        if (rect) {
          posX = rect.left + rect.width / 2;
          posY = rect.top + rect.height * 0.2;
        }
      }

      if (posX == null || posY == null) {
        return;
      }

      const jitterX = jitter ? (Math.random() * 2 - 1) * jitter : 0;
      const jitterY = jitter ? (Math.random() * 2 - 1) * (jitter / 2) : 0;
      const id = `reward-${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const next = {
        id,
        text,
        tone,
        x: posX + jitterX,
        y: posY + offsetY + jitterY,
        duration,
      };

      setRewards((prev) => [...prev, next]);
      const removeId = window.setTimeout(() => {
        setRewards((prev) => prev.filter((item) => item.id !== id));
        timeoutsRef.current.delete(removeId);
      }, duration);
      timeoutsRef.current.add(removeId);
    };

    if (delay > 0) {
      const delayId = window.setTimeout(() => {
        schedule();
        timeoutsRef.current.delete(delayId);
      }, delay);
      timeoutsRef.current.add(delayId);
      return;
    }

    schedule();
  }, []);

  return (
    <RewardFloatContext.Provider value={pushReward}>
      {children}
      <div className="reward-float-layer" aria-hidden="true">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className={`reward-float reward-float--${reward.tone}`}
            style={{
              left: reward.x,
              top: reward.y,
              animationDuration: `${reward.duration}ms`,
            }}
          >
            {reward.text}
          </div>
        ))}
      </div>
    </RewardFloatContext.Provider>
  );
}

export function useRewardFloat() {
  const context = useContext(RewardFloatContext);
  return context || (() => {});
}
