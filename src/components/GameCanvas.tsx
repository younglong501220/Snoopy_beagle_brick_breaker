/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Ball, Paddle, Brick, PowerUp, Particle, FloatingText, GameState, PowerUpType, ActiveEffect, GameSettings } from '../types/game';
import { soundEngine } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  score: number;
  lives: number;
  round: number;
  highScore: number;
  settings: GameSettings;
  onScoreChange: (score: number) => void;
  onLivesChange: (lives: number) => void;
  onRoundChange: (round: number) => void;
  onStateChange: (state: GameState) => void;
  onHighScoreChange: (score: number) => void;
  activeEffects: ActiveEffect[];
  onActiveEffectsChange: (effects: ActiveEffect[]) => void;
}

const CANVAS_WIDTH = 460;
const CANVAS_HEIGHT = 620;

// Comic speech onomatopoeias for hits and combos
const ONOMATOPOEIA_HITS = ['BONK!', 'POW!', 'WHAM!', 'CRACK!', 'BAM!', 'SMACK!'];
const ONOMATOPOEIA_COMBOS = ['WOW!', 'SMAAASH!', 'SUPER HIT!', 'GOOD GRIEF!', 'NICE CATCH!'];

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  score,
  lives,
  round,
  highScore,
  settings,
  onScoreChange,
  onLivesChange,
  onRoundChange,
  onStateChange,
  onHighScoreChange,
  activeEffects,
  onActiveEffectsChange,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Mutable game state held in refs for 60fps animation loop
  const paddleRef = useRef<Paddle>({
    width: 96,
    defaultWidth: 96,
    height: 22,
    x: CANVAS_WIDTH / 2 - 48,
    y: CANVAS_HEIGHT - 48,
    speed: 8,
    targetX: CANVAS_WIDTH / 2 - 48,
  });

  const ballsRef = useRef<Ball[]>([]);
  const bricksRef = useRef<Brick[][]>([]);
  const powerUpsRef = useRef<PowerUp[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);
  const comboRef = useRef<number>(0);
  const comboTimerRef = useRef<number>(0);
  const snoopyBounceRef = useRef<number>(0);
  const shieldActiveRef = useRef<boolean>(false);
  const leftPressedRef = useRef<boolean>(false);
  const rightPressedRef = useRef<boolean>(false);

  // Sync active effects with refs
  useEffect(() => {
    const hasShield = activeEffects.some((e) => e.type === 'SHIELD');
    shieldActiveRef.current = hasShield;

    const wideEffect = activeEffects.find((e) => e.type === 'WIDE_PADDLE');
    if (wideEffect) {
      paddleRef.current.width = paddleRef.current.defaultWidth * 1.35;
    } else {
      paddleRef.current.width = paddleRef.current.defaultWidth;
    }

    const pierceEffect = activeEffects.some((e) => e.type === 'PIERCE_BALL');
    ballsRef.current.forEach((b) => {
      b.isPiercing = pierceEffect;
    });
  }, [activeEffects]);

  // Spawn floating onomatopoeia text
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string = '#E53935') => {
    floatingTextsRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      text,
      x,
      y,
      color,
      size: 18 + Math.floor(Math.random() * 6),
      opacity: 1,
      vy: -1.8,
      life: 36,
    });
  }, []);

  // Spawn particle burst
  const addParticles = useCallback((x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1.5;
      particlesRef.current.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 4 + 3,
        color,
        life: 26,
        maxLife: 26,
        shape: Math.random() > 0.5 ? 'rect' : 'circle',
      });
    }
  }, []);

  // Drop a power-up capsule from a destroyed brick
  const spawnPowerUp = useCallback((x: number, y: number, type?: PowerUpType) => {
    const types: { type: PowerUpType; icon: string; color: string }[] = [
      { type: 'WIDE_PADDLE', icon: '🦴', color: '#E74C3C' },
      { type: 'MULTI_BALL', icon: '⚾', color: '#3498DB' },
      { type: 'PIERCE_BALL', icon: '⚡', color: '#F1C40F' },
      { type: 'SHIELD', icon: '🛡️', color: '#2ECC71' },
      { type: 'SLOW_BALL', icon: '🪶', color: '#9B59B6' },
      { type: 'EXTRA_LIFE', icon: '❤️', color: '#E91E63' },
    ];

    const selected = type
      ? types.find((t) => t.type === type) || types[0]
      : types[Math.floor(Math.random() * types.length)];

    powerUpsRef.current.push({
      id: Math.random().toString(36).substring(2, 9),
      x,
      y,
      type: selected.type,
      vy: 2.2,
      radius: 13,
      icon: selected.icon,
      color: selected.color,
      duration: selected.type === 'EXTRA_LIFE' || selected.type === 'MULTI_BALL' ? 0 : 12000,
    });
  }, []);

  // Initialize Bricks for current round
  const initBricks = useCallback(() => {
    const brickRows = 4 + Math.min(Math.floor((round - 1) / 2), 2);
    const brickCols = 7;
    const brickWidth = 54;
    const brickHeight = 22;
    const brickPadding = 6;
    const brickOffsetTop = 75;
    const brickOffsetLeft = (CANVAS_WIDTH - (brickCols * brickWidth + (brickCols - 1) * brickPadding)) / 2;

    const rowThemes = [
      { color: '#E74C3C', score: 40, name: 'Snoopy Red' },
      { color: '#F1C40F', score: 30, name: 'Woodstock Yellow' },
      { color: '#3498DB', score: 20, name: 'Lucy Blue' },
      { color: '#2ECC71', score: 10, name: 'Linus Green' },
      { color: '#E67E22', score: 50, name: 'Charlie Zig-Zag' },
      { color: '#9B59B6', score: 60, name: 'Peppermint Purple' },
    ];

    const newBricks: Brick[][] = [];
    for (let r = 0; r < brickRows; r++) {
      newBricks[r] = [];
      const theme = rowThemes[r % rowThemes.length];
      const isHardRow = r === 0 && round > 1;

      for (let c = 0; c < brickCols; c++) {
        // Chance to contain a powerup
        const hasPowerUp = Math.random() < 0.22;
        const maxHits = isHardRow ? 2 : 1;

        newBricks[r][c] = {
          r,
          c,
          x: brickOffsetLeft + c * (brickWidth + brickPadding),
          y: brickOffsetTop + r * (brickHeight + brickPadding),
          width: brickWidth,
          height: brickHeight,
          status: 1,
          maxHits,
          hitsLeft: maxHits,
          color: theme.color,
          score: theme.score,
          name: theme.name,
          isSpecial: hasPowerUp,
          powerUp: hasPowerUp ? undefined : undefined,
        };
      }
    }
    bricksRef.current = newBricks;
  }, [round]);

  // Reset ball position on paddle
  const resetBall = useCallback(() => {
    const baseSpeed = settings.speedMode === 'CASUAL' ? 4.2 : settings.speedMode === 'SPEEDY' ? 6.2 : 5.0;
    const speed = baseSpeed + (round - 1) * 0.4;
    const angle = Math.PI / 4 + Math.random() * (Math.PI / 2);

    ballsRef.current = [
      {
        id: 'ball-1',
        x: paddleRef.current.x + paddleRef.current.width / 2,
        y: paddleRef.current.y - 12,
        radius: 8.5,
        speed,
        dx: speed * Math.cos(angle) * (Math.random() > 0.5 ? 1 : -1),
        dy: -speed * Math.sin(angle),
        rotation: 0,
        isPiercing: activeEffects.some((e) => e.type === 'PIERCE_BALL'),
      },
    ];
  }, [round, settings.speedMode, activeEffects]);

  // Start new round or restart
  const startNewGame = useCallback(() => {
    onScoreChange(0);
    onLivesChange(3);
    onRoundChange(1);
    comboRef.current = 0;
    activeEffects.forEach(() => {});
    onActiveEffectsChange([]);
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    initBricks();
    resetBall();
    onStateChange('PLAYING');
    soundEngine.playPaddleHit(0);
  }, [onScoreChange, onLivesChange, onRoundChange, onActiveEffectsChange, initBricks, resetBall, onStateChange, activeEffects]);

  // Next round transition
  const startNextRound = useCallback(() => {
    onRoundChange(round + 1);
    powerUpsRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    initBricks();
    resetBall();
    onStateChange('PLAYING');
    soundEngine.playPaddleHit(0);
  }, [round, onRoundChange, initBricks, resetBall, onStateChange]);

  // Handle paddle movement from screen coordinate
  const movePaddleTo = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scale = CANVAS_WIDTH / rect.width;
    const canvasX = (clientX - rect.left) * scale;
    const p = paddleRef.current;
    p.x = Math.max(0, Math.min(CANVAS_WIDTH - p.width, canvasX - p.width / 2));
  }, []);

  // Keyboard navigation & controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        rightPressedRef.current = true;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        leftPressedRef.current = true;
      }
      if (e.code === 'Space') {
        e.preventDefault();
        if (gameState === 'START') {
          startNewGame();
        } else if (gameState === 'GAMEOVER') {
          startNewGame();
        } else if (gameState === 'WIN') {
          startNextRound();
        } else if (gameState === 'PLAYING') {
          // If no balls moving or paused
        }
      }
      if (e.code === 'KeyP') {
        if (gameState === 'PLAYING') {
          onStateChange('PAUSED');
        } else if (gameState === 'PAUSED') {
          onStateChange('PLAYING');
        }
      }
      if (e.code === 'KeyM') {
        soundEngine.toggleMute();
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        rightPressedRef.current = false;
      }
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        leftPressedRef.current = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState, startNewGame, startNextRound, onStateChange]);

  // Initialize game on mount
  useEffect(() => {
    initBricks();
    resetBall();
  }, [initBricks, resetBall]);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const render = () => {
      // 1. Clear Canvas with high-DPI crisp buffer
      ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Comic background paper tint
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      // Vintage comic strip halftone / neat grid
      ctx.strokeStyle = '#f4efe6';
      ctx.lineWidth = 1;
      for (let x = 0; x <= CANVAS_WIDTH; x += 28) {
        ctx.beginPath();
        ctx.moveTo(x, 52);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
      }
      for (let y = 52; y <= CANVAS_HEIGHT; y += 28) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
      }

      // Draw bottom safety shield if active
      if (shieldActiveRef.current) {
        ctx.save();
        ctx.fillStyle = '#2ECC71';
        ctx.fillRect(0, CANVAS_HEIGHT - 6, CANVAS_WIDTH, 6);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, CANVAS_HEIGHT - 6, CANVAS_WIDTH, 6);

        // Fence picket marks
        ctx.fillStyle = '#111111';
        for (let fx = 10; fx < CANVAS_WIDTH; fx += 20) {
          ctx.fillRect(fx, CANVAS_HEIGHT - 12, 4, 8);
        }
        ctx.restore();
      }

      // 2. Draw Bricks
      drawBricks(ctx, bricksRef.current);

      // 3. Draw Particles
      updateAndDrawParticles(ctx, particlesRef.current);

      // 4. Draw Power-Ups
      updateAndDrawPowerUps(ctx, powerUpsRef.current, paddleRef.current, (pu) => {
        // Collect powerup handler
        soundEngine.playPowerUpCollect();
        addFloatingText(pu.type.replace('_', ' '), pu.x, pu.y - 10, pu.color);
        addParticles(pu.x, pu.y, pu.color, 14);

        if (pu.type === 'EXTRA_LIFE') {
          onLivesChange(Math.min(lives + 1, 5));
        } else if (pu.type === 'MULTI_BALL') {
          // Spawn 2 extra balls
          const mainBall = ballsRef.current[0] || { x: paddleRef.current.x + 30, y: paddleRef.current.y - 20, speed: 5 };
          ballsRef.current.push(
            {
              id: Math.random().toString(),
              x: mainBall.x,
              y: mainBall.y,
              radius: 8.5,
              speed: mainBall.speed || 5,
              dx: 3.5,
              dy: -3.5,
              rotation: 0,
              isPiercing: activeEffects.some((e) => e.type === 'PIERCE_BALL'),
            },
            {
              id: Math.random().toString(),
              x: mainBall.x,
              y: mainBall.y,
              radius: 8.5,
              speed: mainBall.speed || 5,
              dx: -3.5,
              dy: -3.5,
              rotation: 0,
              isPiercing: activeEffects.some((e) => e.type === 'PIERCE_BALL'),
            }
          );
        } else if (pu.type === 'SLOW_BALL') {
          ballsRef.current.forEach((b) => {
            b.dx *= 0.75;
            b.dy *= 0.75;
          });
        } else {
          // Add or refresh active effect
          const duration = pu.duration;
          const now = Date.now();
          const filtered = activeEffects.filter((e) => e.type !== pu.type);
          onActiveEffectsChange([
            ...filtered,
            {
              type: pu.type,
              endTime: now + duration,
              totalDuration: duration,
            },
          ]);
        }
      });

      // 5. Draw Paddle (Snoopy's Iconic Red Doghouse with sleeping Snoopy)
      drawRedDoghousePaddle(ctx, paddleRef.current, snoopyBounceRef.current);

      // 6. Draw Baseball Balls
      ballsRef.current.forEach((ball) => {
        drawBaseball(ctx, ball);
      });

      // 7. Draw Floating Comic Text
      updateAndDrawFloatingTexts(ctx, floatingTextsRef.current);

      // 8. Draw Top HUD (Score, Round, Lives, Combo)
      drawHUD(ctx, score, round, lives, comboRef.current);

      // 9. Update Physics when playing
      if (gameState === 'PLAYING') {
        updatePhysics();
      }

      // Snoopy bounce decay
      if (snoopyBounceRef.current > 0) {
        snoopyBounceRef.current = Math.max(0, snoopyBounceRef.current - 0.4);
      }

      // Combo timer decay
      if (comboTimerRef.current > 0) {
        comboTimerRef.current--;
        if (comboTimerRef.current <= 0) {
          comboRef.current = 0;
        }
      }

      // Expire active powerups
      if (activeEffects.length > 0) {
        const now = Date.now();
        const valid = activeEffects.filter((e) => e.endTime > now);
        if (valid.length !== activeEffects.length) {
          onActiveEffectsChange(valid);
        }
      }

      animationId = requestAnimationFrame(render);
    };

    // Physics update function
    const updatePhysics = () => {
      const p = paddleRef.current;

      // Handle keyboard arrow movements
      if (rightPressedRef.current && p.x < CANVAS_WIDTH - p.width) {
        p.x += p.speed;
      }
      if (leftPressedRef.current && p.x > 0) {
        p.x -= p.speed;
      }

      const balls = ballsRef.current;
      for (let i = balls.length - 1; i >= 0; i--) {
        const ball = balls[i];

        ball.x += ball.dx;
        ball.y += ball.dy;
        ball.rotation += ball.dx * 0.05;

        // Bounce off left / right walls
        if (ball.x - ball.radius <= 0) {
          ball.x = ball.radius;
          ball.dx = Math.abs(ball.dx);
          soundEngine.playPaddleHit(-0.5);
        } else if (ball.x + ball.radius >= CANVAS_WIDTH) {
          ball.x = CANVAS_WIDTH - ball.radius;
          ball.dx = -Math.abs(ball.dx);
          soundEngine.playPaddleHit(0.5);
        }

        // Bounce off top HUD border
        if (ball.y - ball.radius <= 52) {
          ball.y = 52 + ball.radius;
          ball.dy = Math.abs(ball.dy);
          soundEngine.playPaddleHit(0);
        }

        // Bottom collision (Shield vs Fall)
        if (ball.y + ball.radius >= CANVAS_HEIGHT - 6 && shieldActiveRef.current) {
          ball.y = CANVAS_HEIGHT - 6 - ball.radius;
          ball.dy = -Math.abs(ball.dy);
          soundEngine.playShieldDeflect();
          addFloatingText('SAVED!', ball.x, CANVAS_HEIGHT - 30, '#2ECC71');
          addParticles(ball.x, CANVAS_HEIGHT - 8, '#2ECC71', 8);
          // Consume shield
          shieldActiveRef.current = false;
          onActiveEffectsChange(activeEffects.filter((e) => e.type !== 'SHIELD'));
        } else if (ball.y - ball.radius > CANVAS_HEIGHT) {
          // Ball fell through bottom
          balls.splice(i, 1);
          continue;
        }

        // Paddle collision (Doghouse roof angle physics)
        if (
          ball.y + ball.radius >= p.y &&
          ball.y - ball.radius <= p.y + p.height &&
          ball.x >= p.x - 6 &&
          ball.x <= p.x + p.width + 6 &&
          ball.dy > 0 // only when moving downward
        ) {
          const hitPoint = (ball.x - (p.x + p.width / 2)) / (p.width / 2);
          const currentSpeed = Math.hypot(ball.dx, ball.dy);
          const maxBounceAngle = Math.PI * 0.42; // Up to ~75 degrees
          const bounceAngle = hitPoint * maxBounceAngle;

          ball.dx = currentSpeed * Math.sin(bounceAngle);
          ball.dy = -Math.abs(currentSpeed * Math.cos(bounceAngle));
          ball.y = p.y - ball.radius;

          soundEngine.playPaddleHit(hitPoint);
          snoopyBounceRef.current = 8; // Snoopy bounce animation

          // Comic hit text if clean center catch
          if (Math.abs(hitPoint) < 0.2) {
            addFloatingText('NICE!', ball.x, p.y - 18, '#E53935');
          }
        }

        // Brick collisions
        let hitBrickThisFrame = false;
        const bricks = bricksRef.current;

        for (let r = 0; r < bricks.length; r++) {
          for (let c = 0; c < bricks[r].length; c++) {
            const b = bricks[r][c];
            if (b.status > 0) {
              if (
                ball.x + ball.radius > b.x &&
                ball.x - ball.radius < b.x + b.width &&
                ball.y + ball.radius > b.y &&
                ball.y - ball.radius < b.y + b.height
              ) {
                b.hitsLeft--;
                if (b.hitsLeft <= 0) {
                  b.status = 0;
                }

                // Increase combo and score
                comboRef.current++;
                comboTimerRef.current = 150; // ~2.5 seconds to sustain combo
                const comboMult = Math.min(comboRef.current, 5);
                const earned = b.score * (1 + (comboMult - 1) * 0.5);
                const nextScore = score + earned;
                onScoreChange(nextScore);
                if (nextScore > highScore) {
                  onHighScoreChange(nextScore);
                }

                soundEngine.playBrickHit(comboRef.current);
                addParticles(ball.x, ball.y, b.color, 10);

                // Comic onomatopoeia popup
                if (comboRef.current > 3) {
                  const comboText = ONOMATOPOEIA_COMBOS[comboRef.current % ONOMATOPOEIA_COMBOS.length];
                  addFloatingText(comboText, ball.x, ball.y - 12, b.color);
                } else if (Math.random() < 0.4) {
                  const hitWord = ONOMATOPOEIA_HITS[Math.floor(Math.random() * ONOMATOPOEIA_HITS.length)];
                  addFloatingText(hitWord, ball.x, ball.y - 10, '#111111');
                }

                // Spawn powerup if destroyed and brick is marked special
                if (b.status === 0 && (b.isSpecial || Math.random() < 0.16)) {
                  spawnPowerUp(b.x + b.width / 2, b.y + b.height / 2);
                }

                // If not piercing, reflect ball dy
                if (!ball.isPiercing) {
                  ball.dy = -ball.dy;
                  hitBrickThisFrame = true;
                }

                break;
              }
            }
          }
          if (hitBrickThisFrame && !ball.isPiercing) break;
        }
      }

      // Check if all balls were lost
      if (balls.length === 0) {
        soundEngine.playLoseLife();
        const nextLives = lives - 1;
        onLivesChange(nextLives);
        comboRef.current = 0;

        if (nextLives <= 0) {
          soundEngine.playGameOver();
          onStateChange('GAMEOVER');
        } else {
          resetBall();
        }
      }

      // Check if all bricks are cleared
      let allCleared = true;
      const bricks = bricksRef.current;
      for (let r = 0; r < bricks.length; r++) {
        for (let c = 0; c < bricks[r].length; c++) {
          if (bricks[r][c].status > 0) {
            allCleared = false;
            break;
          }
        }
        if (!allCleared) break;
      }

      if (allCleared) {
        soundEngine.playVictory();
        onStateChange('WIN');
      }
    };

    animationId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animationId);
  }, [
    gameState,
    score,
    lives,
    round,
    highScore,
    activeEffects,
    onScoreChange,
    onLivesChange,
    onStateChange,
    onHighScoreChange,
    onActiveEffectsChange,
    resetBall,
    addFloatingText,
    addParticles,
    spawnPowerUp,
  ]);

  // Touch and Mouse Event Handlers
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    movePaddleTo(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length > 0) {
      movePaddleTo(e.touches[0].clientX);
    }
  };

  const handleCanvasClick = () => {
    if (gameState === 'START') {
      startNewGame();
    } else if (gameState === 'GAMEOVER') {
      startNewGame();
    } else if (gameState === 'WIN') {
      startNextRound();
    }
  };

  return (
    <div className="relative flex flex-col items-center select-none touch-none">
      {/* Canvas container with comic shadow */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          onMouseMove={handleMouseMove}
          onTouchMove={handleTouchMove}
          onTouchStart={(e) => {
            if (e.touches.length > 0) {
              movePaddleTo(e.touches[0].clientX);
            }
            if (gameState !== 'PLAYING') {
              handleCanvasClick();
            }
          }}
          onClick={handleCanvasClick}
          className="bg-white border-4 border-black rounded-xl shadow-[6px_6px_0px_#111111] max-w-full aspect-[460/620] touch-none cursor-pointer block"
          style={{ width: '100%', maxWidth: '440px' }}
        />

        {/* Start Game Comic Overlay */}
        {gameState === 'START' && (
          <div
            onClick={startNewGame}
            className="absolute inset-0 bg-white/90 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer border-4 border-black"
          >
            <div className="w-16 h-16 bg-[#E53935] rounded-full border-3 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#111] mb-3 animate-bounce">
              ⚾
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-[#E53935] drop-shadow-[2px_2px_0px_#111] font-['Bangers'] mb-1">
              BEAGLE BREAKER
            </h2>
            <div className="text-sm font-bold text-gray-800 tracking-wide mb-3">
              小獵犬打磚塊 · 守護紅色狗屋
            </div>
            <div className="p-3 bg-amber-50 border-2 border-black rounded-lg text-xs text-gray-700 max-w-[280px] shadow-[2px_2px_0px_#111] space-y-1 mb-4 text-left">
              <div>🎯 <strong>操作</strong>：滑鼠、鍵盤左右鍵 或 手指滑動</div>
              <div>🦴 <strong>道具</strong>：接住掉落的骨頭、三連球與護盾</div>
              <div>🔥 <strong>連擊</strong>：連續擊碎磚塊激發升調漫畫音效！</div>
            </div>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 bg-[#E53935] text-white font-black text-lg border-3 border-black rounded-lg shadow-[4px_4px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111] transition-all"
            >
              點擊 或 按空白鍵開始
            </button>
          </div>
        )}

        {/* Win Game Comic Overlay */}
        {gameState === 'WIN' && (
          <div
            onClick={startNextRound}
            className="absolute inset-0 bg-white/95 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer border-4 border-black animate-in fade-in zoom-in duration-200"
          >
            <div className="w-16 h-16 bg-[#2ECC71] rounded-full border-3 border-black flex items-center justify-center text-3xl shadow-[3px_3px_0px_#111] mb-2 animate-bounce">
              🏆
            </div>
            <h2 className="text-4xl font-black tracking-tight text-[#2ECC71] drop-shadow-[2px_2px_0px_#111] font-['Bangers'] mb-1">
              ROUND {round} CLEAR!
            </h2>
            <p className="text-sm font-bold text-gray-800 mb-2">史努比高興得手舞足蹈！</p>
            <div className="bg-emerald-50 border-2 border-black rounded-lg p-3 w-64 mb-4 shadow-[2px_2px_0px_#111]">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>目前得分</span>
                <span className="tabular-nums font-mono text-base text-[#111]">{score}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mt-1">
                <span>剩餘生命</span>
                <span className="text-rose-600 font-bold">{'❤️'.repeat(lives)}</span>
              </div>
            </div>
            <button
              onClick={startNextRound}
              className="px-6 py-2.5 bg-[#2ECC71] text-white font-black text-lg border-3 border-black rounded-lg shadow-[4px_4px_0px_#111] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#111] transition-all"
            >
              進入第 {round + 1} 回合
            </button>
          </div>
        )}

        {/* Game Over Comic Overlay */}
        {gameState === 'GAMEOVER' && (
          <div
            onClick={startNewGame}
            className="absolute inset-0 bg-white/95 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer border-4 border-black animate-in fade-in zoom-in duration-200"
          >
            <div className="text-4xl mb-2">🐾</div>
            <h2 className="text-4xl font-black tracking-tight text-[#E53935] drop-shadow-[2px_2px_0px_#111] font-['Bangers'] mb-1">
              GOOD GRIEF!
            </h2>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">GAME OVER</p>
            <div className="bg-amber-50 border-2 border-black rounded-lg p-3 w-64 mb-4 shadow-[2px_2px_0px_#111]">
              <div className="flex justify-between text-xs font-bold text-gray-700">
                <span>最終得分</span>
                <span className="tabular-nums font-mono text-base text-[#E53935] font-black">{score}</span>
              </div>
              <div className="flex justify-between text-xs font-bold text-gray-700 mt-1">
                <span>歷史最高</span>
                <span className="tabular-nums font-mono text-sm text-gray-800">{highScore}</span>
              </div>
            </div>
            <button
              onClick={startNewGame}
              className="px-6 py-2.5 bg-[#111111] text-white font-black text-lg border-3 border-black rounded-lg shadow-[4px_4px_0px_#E53935] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_#E53935] transition-all"
            >
              重新挑戰
            </button>
          </div>
        )}

        {/* Paused Comic Overlay */}
        {gameState === 'PAUSED' && (
          <div
            onClick={() => onStateChange('PLAYING')}
            className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-xl flex flex-col items-center justify-center p-6 text-center cursor-pointer border-4 border-black"
          >
            <div className="bg-white p-6 rounded-xl border-4 border-black shadow-[6px_6px_0px_#111] max-w-[280px]">
              <h2 className="text-3xl font-black text-[#111] font-['Bangers'] mb-2">GAME PAUSED</h2>
              <p className="text-xs font-bold text-gray-600 mb-4">小獵犬正在狗屋上伸懶腰...</p>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onStateChange('PLAYING');
                }}
                className="w-full py-2 bg-[#E53935] text-white font-black text-sm border-2 border-black rounded shadow-[2px_2px_0px_#111]"
              >
                繼續遊戲 (P)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Comic Instructions HUD subtitle */}
      <div className="mt-2 text-xs text-gray-600 font-bold text-center tracking-tight">
        滑鼠移動 · 鍵盤左右鍵 / A、D · 手指滑動控制狗屋
      </div>
    </div>
  );
};

// --- Helper Canvas Drawing Functions ---

// 1. Draw Charlie Brown's Baseball
function drawBaseball(ctx: CanvasRenderingContext2D, ball: Ball) {
  ctx.save();
  ctx.translate(ball.x, ball.y);
  ctx.rotate(ball.rotation);

  // Piercing Woodstock flame glow if active
  if (ball.isPiercing) {
    ctx.beginPath();
    ctx.arc(0, 0, ball.radius + 4, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(241, 196, 15, 0.45)';
    ctx.fill();
  }

  // Ball Body
  ctx.beginPath();
  ctx.arc(0, 0, ball.radius, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Red Double Seams
  ctx.strokeStyle = '#D92525';
  ctx.lineWidth = 1.3;

  [-ball.radius * 0.45, ball.radius * 0.45].forEach((offsetX) => {
    ctx.beginPath();
    ctx.arc(offsetX, 0, ball.radius * 0.75, Math.PI * 0.65, Math.PI * 1.35, offsetX > 0);
    ctx.stroke();

    // Cross-stitches
    for (let i = -3; i <= 3; i++) {
      const sy = i * 2.1;
      const sx = offsetX + (offsetX > 0 ? -1.5 : 1.5);
      ctx.beginPath();
      ctx.moveTo(sx - 1.2, sy - 1.2);
      ctx.lineTo(sx + 1.2, sy + 1.2);
      ctx.stroke();
    }
  });

  ctx.restore();
}

// 2. Draw Snoopy's Iconic Red Doghouse Roof Paddle
function drawRedDoghousePaddle(ctx: CanvasRenderingContext2D, p: Paddle, bounce: number = 0) {
  ctx.save();
  const x = p.x;
  const y = p.y;
  const w = p.width;
  const h = p.height;
  const roofOverhang = 8;

  // Trapezoid Doghouse Gable Roof
  ctx.beginPath();
  ctx.moveTo(x - roofOverhang, y + h);
  ctx.lineTo(x + w + roofOverhang, y + h);
  ctx.lineTo(x + w - 4, y);
  ctx.lineTo(x + 4, y);
  ctx.closePath();

  ctx.fillStyle = '#E53935'; // Signature Beagle Red
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Roof ridge highlight
  ctx.beginPath();
  ctx.moveTo(x + 5, y + 4);
  ctx.lineTo(x + w - 5, y + 4);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#FFA4A2';
  ctx.stroke();

  // Center timber seam
  ctx.beginPath();
  ctx.moveTo(x + w / 2, y + 2);
  ctx.lineTo(x + w / 2, y + h);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Cute & Large Snoopy Snoozing / Leaning on the Doghouse Roof!
  drawSnoopyOnRoof(ctx, x + w / 2, y - bounce, bounce);

  ctx.restore();
}

// Cute & Prominent Vector Snoopy on Doghouse Roof
function drawSnoopyOnRoof(ctx: CanvasRenderingContext2D, cx: number, cy: number, bounce: number = 0) {
  ctx.save();
  const bounceY = -bounce * 0.9;
  const earFlap = bounce * 0.09;
  ctx.translate(cx, cy + bounceY);

  // Snoopy is lying on his back horizontally across the apex of the roof:
  // Head on the right (facing up/right), feet on the left sticking up

  // 1. Classic Snoopy Round Body
  ctx.beginPath();
  ctx.ellipse(-6, -11, 20, 10, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // 2. Black Spot on Snoopy's back / side
  ctx.beginPath();
  ctx.ellipse(-11, -9, 6.5, 5, -0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // 3. Two Paws / Feet sticking up on the left (classic Snoopy feet)
  // Left foot
  ctx.beginPath();
  ctx.ellipse(-23, -17, 5, 8, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();
  // Toe divider line
  ctx.beginPath();
  ctx.moveTo(-24, -22);
  ctx.lineTo(-24, -18);
  ctx.stroke();

  // Right foot (slightly closer)
  ctx.beginPath();
  ctx.ellipse(-16, -19, 5, 8, -0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2.2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();
  // Toe divider line
  ctx.beginPath();
  ctx.moveTo(-17, -24);
  ctx.lineTo(-17, -20);
  ctx.stroke();

  // 4. Little Black Tail on the far left
  ctx.beginPath();
  ctx.ellipse(-27, -6, 5, 2.5, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // 5. Red Collar
  ctx.fillStyle = '#E53935';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(8, -17, 6, 11, 2);
  ctx.fill();
  ctx.stroke();

  // 6. Classic Schulz Snoopy Head (Large & Expressive)
  ctx.beginPath();
  ctx.moveTo(11, -20);
  // Crown of head
  ctx.bezierCurveTo(14, -27, 24, -27, 28, -21);
  // Top of snout extending forward
  ctx.bezierCurveTo(32, -21, 39, -19, 39, -13);
  // Tip of snout & chin
  ctx.bezierCurveTo(39, -6, 31, -5, 24, -7);
  // Throat / neck back to collar
  ctx.bezierCurveTo(19, -8, 14, -10, 11, -13);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2.4;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // 7. Large Black Button Nose at the tip of the snout
  ctx.beginPath();
  ctx.ellipse(38.5, -15, 4.2, 3.2, 0.1, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // 8. Signature Drooping Black Floppy Ear
  ctx.save();
  ctx.translate(17, -15);
  ctx.rotate(0.35 + earFlap);
  ctx.beginPath();
  ctx.ellipse(0, 5, 7.5, 14, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();
  ctx.restore();

  // 9. Face Expression (Eyes, Smile)
  if (bounce > 2) {
    // Surprised / Awake: wide round eye with pupil
    ctx.beginPath();
    ctx.arc(26, -17, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#111111';
    ctx.fill();
    // Surprised eyebrow
    ctx.beginPath();
    ctx.arc(26, -21, 2.5, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.8;
    ctx.stroke();
    // Open happy mouth
    ctx.beginPath();
    ctx.arc(31, -9, 3, Math.PI * 0.1, Math.PI * 0.9, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  } else {
    // Sleeping peacefully: curved arc
    ctx.beginPath();
    ctx.arc(25, -15, 3.5, Math.PI * 1.1, Math.PI * 1.9, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 2;
    ctx.stroke();
    // Smile line at corner of mouth
    ctx.beginPath();
    ctx.arc(32, -9, 3.5, Math.PI * 0.2, Math.PI * 0.8, false);
    ctx.strokeStyle = '#111111';
    ctx.lineWidth = 1.8;
    ctx.stroke();
  }

  // 10. Front Paws clasped comfortably over his tummy
  ctx.beginPath();
  ctx.ellipse(1, -18, 5, 3.8, 0.2, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(5, -16, 4.8, 3.5, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Subtle comic "Zzz" drifting if calm
  if (bounce === 0) {
    ctx.fillStyle = '#888888';
    ctx.font = 'bold 9px "Comic Sans MS", cursive, sans-serif';
    ctx.fillText('z', 38, -25);
    ctx.font = 'bold 11px "Comic Sans MS", cursive, sans-serif';
    ctx.fillText('Z', 43, -31);
  }

  ctx.restore();
}

// 3. Draw Bricks with comic outlines & accents
function drawBricks(ctx: CanvasRenderingContext2D, bricks: Brick[][]) {
  for (let r = 0; r < bricks.length; r++) {
    for (let c = 0; c < bricks[r].length; c++) {
      const b = bricks[r][c];
      if (b.status > 0) {
        ctx.save();

        // Brick body
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);

        // Heavy Comic Outline
        ctx.lineWidth = 2.4;
        ctx.strokeStyle = '#111111';
        ctx.strokeRect(b.x, b.y, b.width, b.height);

        // Highlight stripe
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(b.x + 3, b.y + 3, b.width - 6, 3);

        // Charlie Brown Chevron if zig-zag brick
        if (b.name === 'Charlie Zig-Zag') {
          ctx.beginPath();
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 2.5;
          ctx.moveTo(b.x + 4, b.y + b.height / 2);
          ctx.lineTo(b.x + b.width / 4, b.y + b.height / 2 - 4);
          ctx.lineTo(b.x + b.width / 2, b.y + b.height / 2 + 4);
          ctx.lineTo(b.x + (b.width * 3) / 4, b.y + b.height / 2 - 4);
          ctx.lineTo(b.x + b.width - 4, b.y + b.height / 2);
          ctx.stroke();
        }

        // Crack marks if damaged
        if (b.hitsLeft < b.maxHits) {
          ctx.beginPath();
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
          ctx.lineWidth = 1.8;
          ctx.moveTo(b.x + 10, b.y + 4);
          ctx.lineTo(b.x + 22, b.y + 14);
          ctx.lineTo(b.x + 38, b.y + 9);
          ctx.stroke();
        }

        // Power-up star badge
        if (b.isSpecial) {
          ctx.fillStyle = '#FFFFFF';
          ctx.beginPath();
          ctx.arc(b.x + b.width - 8, b.y + 8, 3.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = '#111111';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        ctx.restore();
      }
    }
  }
}

// 4. Update and Draw Power-Ups
function updateAndDrawPowerUps(
  ctx: CanvasRenderingContext2D,
  powerUps: PowerUp[],
  paddle: Paddle,
  onCollect: (pu: PowerUp) => void
) {
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const pu = powerUps[i];
    pu.y += pu.vy;

    // Check collision with paddle
    if (
      pu.y + pu.radius >= paddle.y &&
      pu.y - pu.radius <= paddle.y + paddle.height &&
      pu.x + pu.radius >= paddle.x &&
      pu.x - pu.radius <= paddle.x + paddle.width
    ) {
      onCollect(pu);
      powerUps.splice(i, 1);
      continue;
    }

    // Check bottom boundary
    if (pu.y - pu.radius > CANVAS_HEIGHT) {
      powerUps.splice(i, 1);
      continue;
    }

    // Draw Capsule badge
    ctx.save();
    ctx.translate(pu.x, pu.y);

    ctx.beginPath();
    ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
    ctx.fillStyle = '#FFFFFF';
    ctx.fill();
    ctx.lineWidth = 2.4;
    ctx.strokeStyle = '#111111';
    ctx.stroke();

    // Inner color ring
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius - 3, 0, Math.PI * 2);
    ctx.fillStyle = pu.color;
    ctx.fill();

    // Emoji icon
    ctx.font = '12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(pu.icon, 0, 1);

    ctx.restore();
  }
}

// 5. Update and Draw Particles
function updateAndDrawParticles(ctx: CanvasRenderingContext2D, particles: Particle[]) {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = p.life / p.maxLife;
      ctx.fillStyle = p.color;

      if (p.shape === 'circle') {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1;
        ctx.stroke();
      } else {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
        ctx.strokeStyle = '#111111';
        ctx.lineWidth = 1;
        ctx.strokeRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
      }
      ctx.restore();
    }
  }
}

// 6. Update and Draw Floating Comic Text
function updateAndDrawFloatingTexts(ctx: CanvasRenderingContext2D, texts: FloatingText[]) {
  for (let i = texts.length - 1; i >= 0; i--) {
    const t = texts[i];
    t.y += t.vy;
    t.life--;
    t.opacity = t.life / 36;

    if (t.life <= 0) {
      texts.splice(i, 1);
    } else {
      ctx.save();
      ctx.globalAlpha = Math.max(0, t.opacity);
      ctx.font = `900 ${t.size}px "Bangers", "Comic Sans MS", sans-serif`;
      ctx.textAlign = 'center';

      // Comic black drop shadow & outline
      ctx.strokeStyle = '#111111';
      ctx.lineWidth = 3.5;
      ctx.strokeText(t.text, t.x, t.y);

      ctx.fillStyle = t.color;
      ctx.fillText(t.text, t.x, t.y);
      ctx.restore();
    }
  }
}

// 7. Draw Top HUD (Score, Round, Lives, Combo) with Snoopy & Woodstock illustrations
function drawHUD(ctx: CanvasRenderingContext2D, score: number, round: number, lives: number, combo: number) {
  ctx.save();

  // 1. Snoopy illustration next to SCORE
  drawHUDSnoopy(ctx, 20, 25);

  // Score Text
  ctx.fillStyle = '#111111';
  ctx.font = 'bold 16px "Patrick Hand", "Comic Sans MS", cursive, sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`SCORE: ${score}`, 42, 32);

  // 2. Woodstock illustration next to ROUND
  drawHUDWoodstock(ctx, CANVAS_WIDTH / 2 - 38, 24);

  // Round Text
  ctx.textAlign = 'left';
  ctx.fillText(`ROUND ${round}`, CANVAS_WIDTH / 2 - 16, 32);

  // 3. Lives section with Snoopy head/ear badges
  ctx.textAlign = 'right';
  ctx.fillText('LIVES:', CANVAS_WIDTH - 64, 32);
  for (let i = 0; i < lives; i++) {
    drawBeagleEar(ctx, CANVAS_WIDTH - 48 + i * 16, 26);
  }

  // Combo Streak badge if active
  if (combo > 1) {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#E53935';
    ctx.font = '900 13px "Bangers", sans-serif';
    ctx.fillText(`${combo}x COMBO!`, 42, 46);
  }

  // Comic border line under HUD
  ctx.beginPath();
  ctx.moveTo(14, 52);
  ctx.lineTo(CANVAS_WIDTH - 14, 52);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  ctx.restore();
}

// Mini Snoopy illustration on the HUD
function drawHUDSnoopy(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // White Head Profile
  ctx.beginPath();
  ctx.moveTo(-9, -4);
  ctx.bezierCurveTo(-7, -11, 0, -11, 4, -6);
  ctx.bezierCurveTo(8, -6, 12, -4, 12, 0);
  ctx.bezierCurveTo(12, 5, 7, 6, 2, 5);
  ctx.bezierCurveTo(-3, 4, -7, 2, -9, 0);
  ctx.closePath();
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Red Collar
  ctx.beginPath();
  ctx.roundRect(-10, 0, 4, 6, 1.2);
  ctx.fillStyle = '#E53935';
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.stroke();

  // Black Button Nose
  ctx.beginPath();
  ctx.ellipse(12, -1, 2.6, 2, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // Drooping Black Ear
  ctx.beginPath();
  ctx.ellipse(-5, 0, 4, 8, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // Happy Eye
  ctx.beginPath();
  ctx.arc(3, -2, 1.3, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // Smile
  ctx.beginPath();
  ctx.arc(6, 2, 2.2, Math.PI * 0.1, Math.PI * 0.9, false);
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.restore();
}

// Mini Woodstock illustration on the HUD
function drawHUDWoodstock(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Woodstock Yellow Head and Body
  ctx.fillStyle = '#F1C40F';
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.8;

  // Head
  ctx.beginPath();
  ctx.ellipse(0, -3, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Woodstock's Trademark Spiky Crest Feathers on top of head
  ctx.fillStyle = '#F1C40F';
  ctx.beginPath();
  ctx.moveTo(-3, -7);
  ctx.lineTo(-5, -12);
  ctx.lineTo(-1, -8);
  ctx.lineTo(1, -13);
  ctx.lineTo(2, -7);
  ctx.lineTo(5, -11);
  ctx.lineTo(4, -5);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Body
  ctx.beginPath();
  ctx.ellipse(-3, 4, 6, 5, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Wing
  ctx.beginPath();
  ctx.ellipse(-3, 3, 3.8, 2.6, 0.4, 0, Math.PI * 2);
  ctx.fillStyle = '#E5B80B';
  ctx.fill();
  ctx.stroke();

  // Orange Beak
  ctx.fillStyle = '#E67E22';
  ctx.beginPath();
  ctx.moveTo(3, -3);
  ctx.lineTo(9, -2);
  ctx.lineTo(3, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Eye
  ctx.fillStyle = '#111111';
  ctx.beginPath();
  ctx.arc(1.5, -3, 1.1, 0, Math.PI * 2);
  ctx.fill();

  // Little Stick Legs
  ctx.strokeStyle = '#111111';
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(-4, 8);
  ctx.lineTo(-4, 12);
  ctx.lineTo(-2, 12);
  ctx.moveTo(-1, 8);
  ctx.lineTo(-1, 12);
  ctx.lineTo(1, 12);
  ctx.stroke();

  ctx.restore();
}

// Draw cute beagle ear silhouette for lives counter
function drawBeagleEar(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Cute miniature Snoopy head with white face and black ear for life counter
  ctx.beginPath();
  ctx.ellipse(0, 0, 5, 4.5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#FFFFFF';
  ctx.fill();
  ctx.lineWidth = 1.5;
  ctx.strokeStyle = '#111111';
  ctx.stroke();

  // Drooping black ear
  ctx.beginPath();
  ctx.ellipse(-3, 0, 2.8, 5.5, 0.25, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  // Black nose dot
  ctx.beginPath();
  ctx.arc(4, 0, 1.2, 0, Math.PI * 2);
  ctx.fillStyle = '#111111';
  ctx.fill();

  ctx.restore();
}
