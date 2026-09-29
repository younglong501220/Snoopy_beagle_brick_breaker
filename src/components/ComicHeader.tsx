/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Volume2, VolumeX, RotateCcw, HelpCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../utils/audio';

interface ComicHeaderProps {
  currentTab: 'game' | 'rules' | 'characters' | 'powerups';
  onTabChange: (tab: 'game' | 'rules' | 'characters' | 'powerups') => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onRestartGame: () => void;
}

export const ComicHeader: React.FC<ComicHeaderProps> = ({
  currentTab,
  onTabChange,
  soundEnabled,
  onToggleSound,
  onRestartGame,
}) => {
  return (
    <header className="w-full max-w-5xl mx-auto flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-black bg-white/80 backdrop-blur-sm">
      {/* Zone 1: Brand title, single text element */}
      <button
        onClick={() => onTabChange('game')}
        className="text-lg sm:text-xl font-black tracking-tight text-gray-950 font-['Bangers'] hover:text-[#E53935] transition-colors text-left"
      >
        BEAGLE BRICK BREAKER
      </button>

      {/* Zone 2: Clean text navigation links, single-line with hover underline */}
      <nav className="hidden md:flex items-center gap-6 text-sm font-bold text-gray-700">
        <button
          onClick={() => onTabChange('game')}
          className={`transition-colors hover:text-black hover:underline underline-offset-4 ${
            currentTab === 'game' ? 'text-[#E53935] underline font-black' : ''
          }`}
        >
          遊戲主頁
        </button>
        <button
          onClick={() => onTabChange('rules')}
          className={`transition-colors hover:text-black hover:underline underline-offset-4 ${
            currentTab === 'rules' ? 'text-[#E53935] underline font-black' : ''
          }`}
        >
          遊戲規則
        </button>
        <button
          onClick={() => onTabChange('characters')}
          className={`transition-colors hover:text-black hover:underline underline-offset-4 ${
            currentTab === 'characters' ? 'text-[#E53935] underline font-black' : ''
          }`}
        >
          角色介紹
        </button>
        <button
          onClick={() => onTabChange('powerups')}
          className={`transition-colors hover:text-black hover:underline underline-offset-4 ${
            currentTab === 'powerups' ? 'text-[#E53935] underline font-black' : ''
          }`}
        >
          道具圖鑑
        </button>
      </nav>

      {/* Zone 3: 1-2 primary actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            soundEngine.toggleMute();
            onToggleSound();
          }}
          title={soundEnabled ? '靜音' : '開啟音效'}
          className="p-2 text-gray-800 hover:text-black hover:bg-gray-100 rounded-lg border-2 border-black transition-colors"
          aria-label={soundEnabled ? 'Mute Sound' : 'Unmute Sound'}
        >
          {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-red-500" />}
        </button>

        <button
          onClick={onRestartGame}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-black text-white bg-[#E53935] rounded-lg border-2 border-black shadow-[2px_2px_0px_#111] hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none transition-all whitespace-nowrap"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>重新開局</span>
        </button>
      </div>
    </header>
  );
};
