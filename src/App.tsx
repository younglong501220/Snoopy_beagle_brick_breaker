/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { GameState, ActiveEffect, GameSettings } from './types/game';
import { ComicHeader } from './components/ComicHeader';
import { GameCanvas } from './components/GameCanvas';
import { ActivePowerUpsBar } from './components/ActivePowerUpsBar';
import { TouchControls } from './components/TouchControls';
import { CharacterCards } from './components/CharacterCards';
import { PowerUpsGuide } from './components/PowerUpsGuide';
import { RulesGuide } from './components/RulesGuide';
import { soundEngine } from './utils/audio';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState<number>(0);
  const [lives, setLives] = useState<number>(3);
  const [round, setRound] = useState<number>(1);
  const [highScore, setHighScore] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('beagle_breaker_highscore');
      return saved ? parseInt(saved, 10) || 0 : 0;
    } catch {
      return 0;
    }
  });

  const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);
  const [currentTab, setCurrentTab] = useState<'game' | 'rules' | 'characters' | 'powerups'>('game');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    speedMode: 'NORMAL',
    controlMode: 'AUTO',
    snoopyCheer: true,
  });

  // Handle high score persistence
  const handleHighScoreChange = useCallback((newHigh: number) => {
    setHighScore(newHigh);
    try {
      localStorage.setItem('beagle_breaker_highscore', newHigh.toString());
    } catch {
      // Storage unavailable
    }
  }, []);

  // Sound toggle
  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    soundEngine.setMuted(!nextState);
  };

  // Restart / Reset
  const handleRestartGame = () => {
    setGameState('START');
    setScore(0);
    setLives(3);
    setRound(1);
    setActiveEffects([]);
    setCurrentTab('game');
  };

  // Touch control key simulation
  const handleSimulateKey = (key: string, isDown: boolean) => {
    const eventType = isDown ? 'keydown' : 'keyup';
    window.dispatchEvent(new KeyboardEvent(eventType, { code: key }));
  };

  const handlePauseToggle = () => {
    if (gameState === 'PLAYING') {
      setGameState('PAUSED');
    } else if (gameState === 'PAUSED') {
      setGameState('PLAYING');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      {/* 3-Zone Top Bar Contract */}
      <ComicHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onRestartGame={handleRestartGame}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-3 sm:p-4 max-w-5xl mx-auto w-full">
        {currentTab === 'game' && (
          <div className="flex flex-col items-center w-full">
            {/* Active Power-Ups Badge Bar */}
            <ActivePowerUpsBar activeEffects={activeEffects} />

            {/* Core Game Canvas */}
            <GameCanvas
              gameState={gameState}
              score={score}
              lives={lives}
              round={round}
              highScore={highScore}
              settings={settings}
              onScoreChange={setScore}
              onLivesChange={setLives}
              onRoundChange={setRound}
              onStateChange={setGameState}
              onHighScoreChange={handleHighScoreChange}
              activeEffects={activeEffects}
              onActiveEffectsChange={setActiveEffects}
            />

            {/* Mobile / Tablet Friendly Touch Buttons */}
            <TouchControls
              gameState={gameState}
              onPauseToggle={handlePauseToggle}
              onSimulateKey={handleSimulateKey}
            />

            {/* Ball Speed Difficulty Selector */}
            <div className="mt-4 flex items-center gap-2 p-1 bg-white/90 border-2 border-black rounded-lg shadow-[2px_2px_0px_#111] text-xs font-bold">
              <span className="px-2 text-gray-500 font-bold">球速：</span>
              {(['CASUAL', 'NORMAL', 'SPEEDY'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setSettings((s) => ({ ...s, speedMode: mode }))}
                  className={`px-3 py-1 rounded transition-colors ${
                    settings.speedMode === mode
                      ? 'bg-[#E53935] text-white shadow-[1px_1px_0px_#111]'
                      : 'text-gray-700 hover:text-black hover:bg-gray-100'
                  }`}
                >
                  {mode === 'CASUAL' ? '休閒' : mode === 'NORMAL' ? '標準' : '極速'}
                </button>
              ))}
            </div>
          </div>
        )}

        {currentTab === 'rules' && <RulesGuide />}
        {currentTab === 'characters' && <CharacterCards />}
        {currentTab === 'powerups' && <PowerUpsGuide />}
      </main>

      {/* Quiet Comic Footer */}
      <footer className="w-full max-w-5xl mx-auto py-3 px-4 text-center border-t-2 border-black/10 text-xs text-gray-500 font-bold">
        <span>小獵犬打磚塊 Beagle Brick Breaker</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>美式經典黑白漫畫復古風格</span>
        <span aria-hidden="true" className="mx-2">·</span>
        <span>Web Audio API 原生合成音效</span>
      </footer>
    </div>
  );
}
