/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type GameState = 'START' | 'PLAYING' | 'PAUSED' | 'WIN' | 'GAMEOVER';

export type PowerUpType = 'WIDE_PADDLE' | 'MULTI_BALL' | 'PIERCE_BALL' | 'EXTRA_LIFE' | 'SHIELD' | 'SLOW_BALL';

export interface PowerUp {
  id: string;
  x: number;
  y: number;
  type: PowerUpType;
  vy: number;
  radius: number;
  icon: string;
  color: string;
  duration: number; // in milliseconds
}

export interface ActiveEffect {
  type: PowerUpType;
  endTime: number;
  totalDuration: number;
}

export interface Ball {
  id: string;
  x: number;
  y: number;
  radius: number;
  dx: number;
  dy: number;
  speed: number;
  rotation: number;
  isPiercing?: boolean;
}

export interface Paddle {
  width: number;
  defaultWidth: number;
  height: number;
  x: number;
  y: number;
  speed: number;
  targetX: number;
}

export interface Brick {
  r: number;
  c: number;
  x: number;
  y: number;
  width: number;
  height: number;
  status: number; // 0 = broken, 1 = normal, 2 = cracked / multi-hit
  maxHits: number;
  hitsLeft: number;
  color: string;
  borderColor?: string;
  score: number;
  name: string;
  isSpecial?: boolean;
  powerUp?: PowerUpType;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
  shape?: 'rect' | 'circle' | 'star';
}

export interface FloatingText {
  id: string;
  text: string;
  x: number;
  y: number;
  color: string;
  bgColor?: string;
  size: number;
  opacity: number;
  vy: number;
  life: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  speedMode: 'CASUAL' | 'NORMAL' | 'SPEEDY';
  controlMode: 'AUTO' | 'MOUSE' | 'KEYBOARD' | 'TOUCH';
  snoopyCheer: boolean;
}
