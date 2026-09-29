/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { ActiveEffect, PowerUpType } from '../types/game';

interface ActivePowerUpsBarProps {
  activeEffects: ActiveEffect[];
}

const POWERUP_METAS: Record<PowerUpType, { label: string; icon: string; color: string }> = {
  WIDE_PADDLE: { label: '加寬狗屋', icon: '🦴', color: '#E74C3C' },
  MULTI_BALL: { label: '多重棒球', icon: '⚾', color: '#3498DB' },
  PIERCE_BALL: { label: '貫穿黃金球', icon: '⚡', color: '#F1C40F' },
  SHIELD: { label: '圍欄守護', icon: '🛡️', color: '#2ECC71' },
  SLOW_BALL: { label: '微風減速', icon: '🪶', color: '#9B59B6' },
  EXTRA_LIFE: { label: '額外生命', icon: '❤️', color: '#E91E63' },
};

export const ActivePowerUpsBar: React.FC<ActivePowerUpsBarProps> = ({ activeEffects }) => {
  const [, setTick] = useState(0);

  // Force re-render periodically to smoothly animate remaining time gauges
  useEffect(() => {
    if (activeEffects.length === 0) return;
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 200);
    return () => clearInterval(interval);
  }, [activeEffects]);

  if (activeEffects.length === 0) return null;

  const now = Date.now();

  return (
    <div className="w-full max-w-[440px] flex flex-wrap gap-2 justify-center my-2">
      {activeEffects.map((effect) => {
        const meta = POWERUP_METAS[effect.type] || { label: effect.type, icon: '⭐', color: '#333' };
        const remaining = Math.max(0, effect.endTime - now);
        const percent = Math.min(100, Math.max(0, (remaining / effect.totalDuration) * 100));

        return (
          <div
            key={effect.type}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-white border-2 border-black rounded-lg shadow-[2px_2px_0px_#111] text-xs font-bold"
          >
            <span>{meta.icon}</span>
            <span className="text-gray-800">{meta.label}</span>
            <div className="w-12 h-2 bg-gray-100 border border-black rounded-full overflow-hidden ml-1">
              <div
                className="h-full transition-all duration-200"
                style={{
                  width: `${percent}%`,
                  backgroundColor: meta.color,
                }}
              />
            </div>
            <span className="text-[10px] text-gray-500 tabular-nums w-4 text-right">
              {Math.ceil(remaining / 1000)}s
            </span>
          </div>
        );
      })}
    </div>
  );
};
