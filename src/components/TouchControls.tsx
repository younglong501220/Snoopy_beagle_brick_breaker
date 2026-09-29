/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ArrowLeft, ArrowRight, Pause, Play } from 'lucide-react';
import { GameState } from '../types/game';

interface TouchControlsProps {
  gameState: GameState;
  onPauseToggle: () => void;
  onSimulateKey: (key: string, isDown: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  gameState,
  onPauseToggle,
  onSimulateKey,
}) => {
  return (
    <div className="w-full max-w-[440px] flex items-center justify-between gap-3 mt-3 px-2">
      {/* Left button */}
      <button
        onPointerDown={() => onSimulateKey('ArrowLeft', true)}
        onPointerUp={() => onSimulateKey('ArrowLeft', false)}
        onPointerLeave={() => onSimulateKey('ArrowLeft', false)}
        className="flex-1 py-3 bg-white active:bg-gray-100 border-3 border-black rounded-xl shadow-[3px_3px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111] flex items-center justify-center text-gray-800 transition-all"
        aria-label="Move Left"
      >
        <ArrowLeft className="w-6 h-6 stroke-[3]" />
      </button>

      {/* Pause button */}
      <button
        onClick={onPauseToggle}
        className="px-5 py-3 bg-white active:bg-gray-100 border-3 border-black rounded-xl shadow-[3px_3px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111] flex items-center justify-center text-gray-800 transition-all font-bold text-xs"
        aria-label="Pause or Resume Game"
      >
        {gameState === 'PAUSED' ? (
          <Play className="w-5 h-5 fill-current text-[#2ECC71]" />
        ) : (
          <Pause className="w-5 h-5 fill-current text-gray-700" />
        )}
      </button>

      {/* Right button */}
      <button
        onPointerDown={() => onSimulateKey('ArrowRight', true)}
        onPointerUp={() => onSimulateKey('ArrowRight', false)}
        onPointerLeave={() => onSimulateKey('ArrowRight', false)}
        className="flex-1 py-3 bg-white active:bg-gray-100 border-3 border-black rounded-xl shadow-[3px_3px_0px_#111] active:translate-x-[1px] active:translate-y-[1px] active:shadow-[1px_1px_0px_#111] flex items-center justify-center text-gray-800 transition-all"
        aria-label="Move Right"
      >
        <ArrowRight className="w-6 h-6 stroke-[3]" />
      </button>
    </div>
  );
};
