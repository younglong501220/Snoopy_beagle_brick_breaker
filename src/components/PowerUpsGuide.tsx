/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface PowerUpDoc {
  name: string;
  icon: string;
  color: string;
  duration: string;
  summary: string;
  tip: string;
}

const POWERUPS: PowerUpDoc[] = [
  {
    name: '加寬狗屋 (Bone Expansion)',
    icon: '🦴',
    color: '#E74C3C',
    duration: '12 秒',
    summary: '狗屋屋頂橫向延伸 +35% 寬度，極大降低漏球機率。',
    tip: '狗屋變寬後兩端斜率更大，更容易反彈出大角度斜射球！',
  },
  {
    name: '多重棒球 (Charlie’s Triple Baseballs)',
    icon: '⚾',
    color: '#3498DB',
    duration: '即時生效',
    summary: '從目前位置額外分裂出 2 顆棒球，三球齊發加速破壞！',
    tip: '多顆球在場上時，只要保住任意一顆球，遊戲就不會失敗。',
  },
  {
    name: '貫穿黃金球 (Woodstock Pierce)',
    icon: '⚡',
    color: '#F1C40F',
    duration: '12 秒',
    summary: '棒球被糊塗塌客的黃金光芒包覆，直接穿透所觸碰的磚塊。',
    tip: '直線貫穿整排磚塊的最佳神器，特別適合突破厚重紅磚陣容！',
  },
  {
    name: '圍欄守護 (Doghouse Picket Fence)',
    icon: '🛡️',
    color: '#2ECC71',
    duration: '1 次阻擋',
    summary: '在畫面底部架起綠色木圍欄，保護球體免於墜落深淵。',
    tip: '圍欄救球成功時會彈回空中並發出木質清脆反響。',
  },
  {
    name: '微風減速 (Gentle Breeze)',
    icon: '🪶',
    color: '#9B59B6',
    duration: '即時減速',
    summary: '減緩場上所有球體 25% 的飛行速度，找回控球節奏。',
    tip: '在高難度或高速關卡中，能讓你的反應時間更加從容。',
  },
  {
    name: '額外生命 (Beagle Heart)',
    icon: '❤️',
    color: '#E91E63',
    duration: '即時獲得',
    summary: '直接增加 1 點生命值（最高可累積至 5 點生命）。',
    tip: '右上角的黑色狗耳朵圖示會隨之增加一隻耳朵！',
  },
];

export const PowerUpsGuide: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto py-6 px-4">
      <div className="text-center mb-8">
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 font-['Bangers'] tracking-wide">
          SPECIAL POWER-UPS
        </h2>
        <div className="mt-1 text-sm text-gray-600 font-bold">
          擊碎特殊磚塊隨機掉落 · 用狗屋擋板接住道具
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {POWERUPS.map((item) => (
          <div
            key={item.name}
            className="p-5 bg-white border-3 border-black rounded-xl shadow-[4px_4px_0px_#111] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[6px_6px_0px_#111] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div
                  className="w-12 h-12 rounded-lg border-2 border-black flex items-center justify-center text-2xl shadow-[2px_2px_0px_#111] shrink-0"
                  style={{ backgroundColor: item.color }}
                >
                  {item.icon}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900 leading-tight">
                    {item.name}
                  </h3>
                  <div className="text-xs text-gray-500 font-bold mt-0.5">
                    <span>效果時長</span>
                    <span aria-hidden="true" className="mx-1">·</span>
                    <span className="text-gray-800 font-mono">{item.duration}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-gray-700 leading-relaxed">
                {item.summary}
              </p>
            </div>

            <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-start gap-1.5 text-xs text-amber-900 bg-amber-50/60 p-2 rounded-lg">
              <span className="font-black shrink-0">💡 提示：</span>
              <span>{item.tip}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
