import React, { useEffect, useRef, useCallback } from 'react';
import { GameState, DensityMode, Raindrop, FireFlame, SplashParticle, WaterRipple, SmokeParticle, SparkParticle, FloatingText, CigaretteSkin } from '../types/game';
import { soundFx } from '../utils/audio';

interface GameCanvasProps {
  gameState: GameState;
  skin: CigaretteSkin;
  densityMode?: DensityMode;
  onGameOver: (finalScore: number, flamesCount: number, dodgedCount: number, timeElapsed: number) => void;
  onVictory: (finalScore: number, flamesCount: number, dodgedCount: number, timeElapsed: number) => void;
  onScoreUpdate: (score: number, currentLength: number, flamesCount: number) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameState,
  skin,
  densityMode = 'LOW',
  onGameOver,
  onVictory,
  onScoreUpdate,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Game state refs (for 60fps loop access without stale closures)
  const stateRef = useRef({
    score: 0,
    flamesCollected: 0,
    rainDodged: 0,
    timeSurvived: 0,
    lastTime: 0,
    hasWon: false,
    gameOverTriggered: false,

    // Cigarette stats
    baseLength: 115,
    minLength: 46,
    currentLength: 115,
    thickness: 18,
    filterWidth: 38, // Realistic longer filter (~33% of base length, aspect ratio ~2.1:1)
    x: 300,
    y: 500,
    targetX: 300,
    targetY: 500,
    tiltAngle: -0.1, // ~6 degrees tilt

    // Flame spawn timer
    flameTimer: 0,
    flameInterval: 7.5, // seconds between flames

    // Score tick timer
    scoreTickTimer: 0,

    // Extinguish state
    isExtinguished: false,
    extinguishTimer: 0,

    // Screen shake / vibration
    shakeTime: 0,
    shakeDuration: 0,
    shakeIntensity: 0,
  });

  // Entities
  const raindropsRef = useRef<Raindrop[]>([]);
  const flamesRef = useRef<FireFlame[]>([]);
  const splashesRef = useRef<SplashParticle[]>([]);
  const ripplesRef = useRef<WaterRipple[]>([]);
  const smokeRef = useRef<SmokeParticle[]>([]);
  const sparksRef = useRef<SparkParticle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Keyboard keys down
  const keysRef = useRef<{ left: boolean; right: boolean; up: boolean; down: boolean }>({
    left: false,
    right: false,
    up: false,
    down: false,
  });

  // Reset all game variables
  const resetGame = useCallback(() => {
    stateRef.current.score = 0;
    stateRef.current.flamesCollected = 0;
    stateRef.current.rainDodged = 0;
    stateRef.current.timeSurvived = 0;
    stateRef.current.currentLength = stateRef.current.baseLength;
    stateRef.current.hasWon = false;
    stateRef.current.gameOverTriggered = false;
    stateRef.current.isExtinguished = false;
    stateRef.current.extinguishTimer = 0;
    stateRef.current.flameTimer = 2.0; // first flame appears soon
    stateRef.current.scoreTickTimer = 0;

    raindropsRef.current = [];
    flamesRef.current = [];
    splashesRef.current = [];
    ripplesRef.current = [];
    smokeRef.current = [];
    sparksRef.current = [];
    floatingTextsRef.current = [];

    const canvas = canvasRef.current;
    if (canvas) {
      stateRef.current.x = canvas.width / 2;
      stateRef.current.y = canvas.height * 0.78;
      stateRef.current.targetX = stateRef.current.x;
      stateRef.current.targetY = stateRef.current.y;
    }

    onScoreUpdate(0, stateRef.current.currentLength, 0);
  }, [onScoreUpdate]);

  // Initial / state change hook
  useEffect(() => {
    if (gameState === 'PLAYING' && stateRef.current.gameOverTriggered) {
      resetGame();
    }
  }, [gameState, resetGame]);

  // Resize canvas to display size
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement;
    if (!parent) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = parent.getBoundingClientRect();
    const width = Math.floor(rect.width);
    const height = Math.floor(rect.height);

    if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
      }

      // Initialize cigarette position if out of bounds
      if (stateRef.current.x === 300 && stateRef.current.y === 500) {
        stateRef.current.x = width / 2;
        stateRef.current.y = height * 0.78;
        stateRef.current.targetX = stateRef.current.x;
        stateRef.current.targetY = stateRef.current.y;
      }
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [handleResize]);

  // Mouse & Touch Interaction
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (gameState !== 'PLAYING') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    stateRef.current.targetX = clientX;
    // Allow subtle vertical movement in lower half of screen
    const minY = rect.height * 0.45;
    const maxY = rect.height * 0.90;
    stateRef.current.targetY = Math.max(minY, Math.min(maxY, clientY));
  }, [gameState]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'PLAYING') return;
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = true;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = true;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = true;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = true;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        keysRef.current.left = false;
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        keysRef.current.right = false;
      } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
        keysRef.current.up = false;
      } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
        keysRef.current.down = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [gameState]);

  // Core Animation Game Loop
  useEffect(() => {
    let animId: number;

    const render = (time: number) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const rect = canvas.getBoundingClientRect();
      const width = rect.width;
      const height = rect.height;

      if (!stateRef.current.lastTime) {
        stateRef.current.lastTime = time;
      }
      const dt = Math.min((time - stateRef.current.lastTime) / 1000, 0.1);
      stateRef.current.lastTime = time;

      // UPDATE GAME LOGIC IF PLAYING
      if (gameState === 'PLAYING' && !stateRef.current.isExtinguished) {
        stateRef.current.timeSurvived += dt;

        // Keyboard movement
        const moveSpeed = 480 * dt;
        if (keysRef.current.left) stateRef.current.targetX -= moveSpeed;
        if (keysRef.current.right) stateRef.current.targetX += moveSpeed;
        if (keysRef.current.up) stateRef.current.targetY -= moveSpeed;
        if (keysRef.current.down) stateRef.current.targetY += moveSpeed;

        // Clamp target position inside bounds
        const halfLen = stateRef.current.currentLength / 2;
        stateRef.current.targetX = Math.max(halfLen + 10, Math.min(width - halfLen - 10, stateRef.current.targetX));
        stateRef.current.targetY = Math.max(height * 0.45, Math.min(height * 0.88, stateRef.current.targetY));

        // Smooth lerp movement
        const lerpFactor = 0.22;
        stateRef.current.x += (stateRef.current.targetX - stateRef.current.x) * lerpFactor;
        stateRef.current.y += (stateRef.current.targetY - stateRef.current.y) * lerpFactor;

        // Dynamic tilt based on horizontal velocity
        const vx = stateRef.current.targetX - stateRef.current.x;
        const targetTilt = -0.08 + Math.max(-0.25, Math.min(0.25, vx * 0.005));
        stateRef.current.tiltAngle += (targetTilt - stateRef.current.tiltAngle) * 0.15;

        // Survival score tick
        stateRef.current.scoreTickTimer += dt;
        if (stateRef.current.scoreTickTimer >= 0.75) {
          stateRef.current.scoreTickTimer = 0;
          stateRef.current.score += 1;
          soundFx.playTick();
          onScoreUpdate(stateRef.current.score, stateRef.current.currentLength, stateRef.current.flamesCollected);

          // Check Victory Condition at 100 points
          if (stateRef.current.score >= 100 && !stateRef.current.hasWon) {
            stateRef.current.hasWon = true;
            soundFx.playVictory();
            // Celebratory victory vibration rumble!
            stateRef.current.shakeIntensity = 10;
            stateRef.current.shakeDuration = 0.5;
            stateRef.current.shakeTime = 0.5;
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([60, 40, 80, 40, 120]); } catch { /* ignore */ }
            }

            floatingTextsRef.current.push({
              id: Date.now(),
              x: width / 2,
              y: height * 0.35,
              text: '🏆 CHIẾN THẮNG 100 ĐIỂM! NHẬN BAO THUỐC',
              color: '#facc15',
              alpha: 1,
              scale: 1.5,
              life: 2.5,
            });
            onVictory(
              stateRef.current.score,
              stateRef.current.flamesCollected,
              stateRef.current.rainDodged,
              Math.floor(stateRef.current.timeSurvived)
            );
          }
        }

        // Spawn Distinct Water Droplets 💧 (Mật độ rải rác sôi động, nhịp độ dồn dập hấp dẫn)
        // MEDIUM (Mặc định): 8 giọt khởi đầu, tăng dần lên 16 giọt ở mốc 100
        // LOW (Thưa): 4 giọt khởi đầu, tăng dần lên 8 giọt
        const isMedium = densityMode === 'MEDIUM';
        const maxDrops = isMedium ? 16 : 8;
        const baseDrops = isMedium ? 8 : 4;
        const targetRainCount = Math.min(
          maxDrops,
          Math.max(baseDrops, Math.floor(baseDrops + (stateRef.current.score / 100) * (maxDrops - baseDrops)))
        );

        while (raindropsRef.current.length < targetRainCount) {
          const speedMultiplier = 1 + (stateRef.current.score / 100) * 0.22;
          const radius = 4.8 + Math.random() * 2.6; // 4.8px to 7.4px
          // Tốc độ mưa được điều chỉnh chậm hơn một tý (~200 - 285 px/s) tạo cảm giác êm dịu, dễ quan sát né tránh
          const baseSpeed = 200 + Math.random() * 85;
          const actualSpeed = baseSpeed * speedMultiplier;
          const height = radius * (1.85 + (actualSpeed / 350) * 0.35); // Khí động học: đuôi giọt nước thon dài theo tốc độ

          // Stagger spawn vertically with good spacing
          const spawnY = -60 - Math.random() * 180;
          const spawnX = 35 + Math.random() * (width - 70);

          raindropsRef.current.push({
            x: spawnX,
            y: spawnY,
            speed: actualSpeed, // Tốc độ rơi nhanh, dứt khoát và sống động
            radius,
            height,
            opacity: 0.92,
            angle: (Math.random() - 0.5) * 0.04,
            wobblePhase: Math.random() * Math.PI * 2,
            wobbleSpeed: 6 + Math.random() * 4,
            splash: false,
          });
        }

        // Spawn Flame 🔥 (Xuất hiện đều đặn để người chơi ăn thu ngắn thuốc)
        stateRef.current.flameTimer -= dt;
        if (stateRef.current.flameTimer <= 0 && flamesRef.current.length < 2) {
          stateRef.current.flameTimer = 4.5 + Math.random() * 3.5; // Xuất hiện mỗi 4.5-8s
          flamesRef.current.push({
            id: Date.now() + Math.random(),
            x: 50 + Math.random() * (width - 100),
            y: -35,
            radius: 18,
            speedY: 105 + Math.random() * 45,
            speedX: (Math.random() - 0.5) * 30,
            hue: 35 + Math.random() * 20,
            pulsePhase: Math.random() * Math.PI * 2,
          });
        }
      }

      // UPDATE EXTINQUISH ANIMATION (If hit by water)
      if (stateRef.current.isExtinguished) {
        stateRef.current.extinguishTimer += dt;
        if (stateRef.current.extinguishTimer >= 0.7 && !stateRef.current.gameOverTriggered) {
          stateRef.current.gameOverTriggered = true;
          onGameOver(
            stateRef.current.score,
            stateRef.current.flamesCollected,
            stateRef.current.rainDodged,
            Math.floor(stateRef.current.timeSurvived)
          );
        }
      }

      // Cigarette geometry & hit bounding
      const cigLen = stateRef.current.currentLength;
      const cigThick = stateRef.current.thickness;
      const cigX = stateRef.current.x;
      const cigY = stateRef.current.y;
      const cosA = Math.cos(stateRef.current.tiltAngle);
      const sinA = Math.sin(stateRef.current.tiltAngle);

      // Filter is at -cigLen/2, Ember is at +cigLen/2
      const emberX = cigX + (cigLen / 2) * cosA;
      const emberY = cigY + (cigLen / 2) * sinA;

      // EMIT PARTICLES FROM EMBER TIP
      if (gameState === 'PLAYING') {
        if (!stateRef.current.isExtinguished) {
          // Smoke emission
          if (Math.random() < 0.65) {
            smokeRef.current.push({
              x: emberX + (Math.random() - 0.5) * 4,
              y: emberY + (Math.random() - 0.5) * 4,
              vx: (Math.random() - 0.5) * 12 + 10 * cosA,
              vy: -25 - Math.random() * 35,
              size: 4 + Math.random() * 5,
              alpha: 0.5,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 1.5,
              color: skin.smokeColor,
              life: 0,
              maxLife: 1.4 + Math.random() * 0.8,
            });
          }

          // Sparks
          if (Math.random() < 0.25) {
            sparksRef.current.push({
              x: emberX,
              y: emberY,
              vx: (Math.random() - 0.3) * 40,
              vy: (Math.random() - 0.5) * 40 - 15,
              size: 1.5 + Math.random() * 2,
              alpha: 1,
              color: skin.emberColor,
              life: 0,
              maxLife: 0.4 + Math.random() * 0.3,
            });
          }
        } else {
          // Sizzle steam particles (extinguished)
          if (Math.random() < 0.8) {
            smokeRef.current.push({
              x: emberX + (Math.random() - 0.5) * 8,
              y: emberY + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 20,
              vy: -40 - Math.random() * 40,
              size: 6 + Math.random() * 7,
              alpha: 0.7,
              rotation: Math.random() * Math.PI * 2,
              rotSpeed: (Math.random() - 0.5) * 2,
              color: 'rgba(220, 230, 240, 0.65)',
              life: 0,
              maxLife: 1.0,
            });
          }
        }
      }

      // UPDATE WATER DROPLETS & CHECK COLLISION
      for (let i = raindropsRef.current.length - 1; i >= 0; i--) {
        const drop = raindropsRef.current[i];
        drop.y += drop.speed * dt;
        drop.wobblePhase += drop.wobbleSpeed * dt;
        drop.x += Math.sin(drop.wobblePhase) * 0.8 + Math.tan(drop.angle) * drop.speed * dt;

        // Collision detection with cigarette
        if (gameState === 'PLAYING' && !stateRef.current.isExtinguished) {
          // Translate drop point into cigarette local coordinate system
          const dx = drop.x - cigX;
          const dy = drop.y - cigY;
          // Rotate back by -tiltAngle
          const localX = dx * cosA + dy * sinA;
          const localY = -dx * sinA + dy * cosA;

          // Cigarette bounding box in local coordinates (snug, fair to player)
          const halfW = cigLen / 2 - 2;
          const halfH = (cigThick / 2) * 0.72;

          if (localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH) {
            // HIT BY WATER DROPLET!
            stateRef.current.isExtinguished = true;
            soundFx.playExtinguish();

            // Trigger intense screen shake & haptic vibration
            stateRef.current.shakeIntensity = 18;
            stateRef.current.shakeDuration = 0.45;
            stateRef.current.shakeTime = 0.45;
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate([70, 35, 120]); } catch { /* ignore */ }
            }

            // Hiệu ứng giọt nước vỡ toé & văng mạnh ra khi va vào điếu thuốc
            const splashHues = [
              'rgba(240, 249, 255, 0.98)',
              'rgba(186, 230, 253, 0.95)',
              'rgba(125, 211, 252, 0.92)',
              'rgba(56, 189, 248, 0.90)',
            ];
            // 34 hạt nước văng tung toé ra mọi hướng xung quanh điếu thuốc
            for (let s = 0; s < 34; s++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 60 + Math.random() * 165;
              splashesRef.current.push({
                x: drop.x,
                y: drop.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd - 50, // văng bốc cao lên không trung
                alpha: 0.98,
                size: 2.2 + Math.random() * 3.2,
                color: splashHues[Math.floor(Math.random() * splashHues.length)],
                life: 0,
                maxLife: 0.55 + Math.random() * 0.25,
              });
            }

            // Hơi nước bốc lên (sizzle steam) khi nước dập vào bề mặt điếu thuốc
            for (let sm = 0; sm < 14; sm++) {
              smokeRef.current.push({
                x: drop.x + (Math.random() - 0.5) * 14,
                y: drop.y + (Math.random() - 0.5) * 8,
                vx: (Math.random() - 0.5) * 40,
                vy: -60 - Math.random() * 55,
                size: 5 + Math.random() * 6,
                alpha: 0.75,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 2,
                color: 'rgba(241, 245, 249, 0.8)',
                life: 0,
                maxLife: 0.7,
              });
            }

            // Vòng sóng nước xung kích tại điểm va chạm
            ripplesRef.current.push({
              x: drop.x,
              y: drop.y,
              radius: 4,
              maxRadius: 28,
              alpha: 0.85,
              color: 'rgba(186, 230, 253, 0.85)',
            });

            floatingTextsRef.current.push({
              id: Date.now(),
              x: cigX,
              y: cigY - 30,
              text: 'DÍNH GIỌT NƯỚC! ĐIẾU THUỐC ĐÃ TẮT',
              color: '#38bdf8',
              alpha: 1,
              scale: 1.2,
              life: 1.8,
            });

            raindropsRef.current.splice(i, 1);
            continue;
          }
        }

        // Drop hits ground (Chạm vào mặt đất ẩm ướt)
        if (drop.y > height - 14) {
          stateRef.current.rainDodged += 1;
          // Hiệu ứng giọt nước văng toé lên khi chạm vào mặt đất
          const splashCount = 10 + Math.floor(Math.random() * 5); // 10 đến 14 hạt nước văng ra
          const groundHues = [
            'rgba(240, 249, 255, 0.95)',
            'rgba(186, 230, 253, 0.90)',
            'rgba(147, 197, 253, 0.85)',
          ];
          for (let s = 0; s < splashCount; s++) {
            splashesRef.current.push({
              x: drop.x + (Math.random() - 0.5) * 6,
              y: height - 12,
              vx: (Math.random() - 0.5) * 160, // văng toé mạnh sang hai bên
              vy: -55 - Math.random() * 95,    // bắn nảy lên cao khỏi mặt đất
              alpha: 0.9,
              size: 1.6 + Math.random() * 2.2,
              color: groundHues[Math.floor(Math.random() * groundHues.length)],
              life: 0,
              maxLife: 0.35 + Math.random() * 0.2,
            });
          }

          // Vòng sóng nước loang (ripple) trên mặt đường ẩm ướt
          ripplesRef.current.push({
            x: drop.x,
            y: height - 12,
            radius: 2,
            maxRadius: 16 + Math.random() * 8,
            alpha: 0.75,
            color: 'rgba(186, 230, 253, 0.75)',
          });

          raindropsRef.current.splice(i, 1);
        }
      }

      // UPDATE FLAMES & CHECK ABSORPTION
      for (let f = flamesRef.current.length - 1; f >= 0; f--) {
        const flame = flamesRef.current[f];
        flame.y += flame.speedY * dt;
        flame.pulsePhase += dt * 4;
        flame.x += Math.sin(flame.pulsePhase) * 1.5 + flame.speedX * dt;

        // Collision with cigarette
        if (gameState === 'PLAYING' && !stateRef.current.isExtinguished) {
          const dx = flame.x - cigX;
          const dy = flame.y - cigY;
          const localX = dx * cosA + dy * sinA;
          const localY = -dx * sinA + dy * cosA;

          const halfW = cigLen / 2 + flame.radius;
          const halfH = cigThick / 2 + flame.radius;

          if (localX >= -halfW && localX <= halfW && localY >= -halfH && localY <= halfH) {
            // EAT FLAME!
            soundFx.playFireCollect();
            stateRef.current.flamesCollected += 1;
            stateRef.current.score += 5; // bonus score for eating flame!

            // Trigger punchy flame vibration & tremor
            stateRef.current.shakeIntensity = 7;
            stateRef.current.shakeDuration = 0.22;
            stateRef.current.shakeTime = 0.22;
            if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
              try { navigator.vibrate(40); } catch { /* ignore */ }
            }

            // SHRINK CIGARETTE LENGTH!
            const shrinkAmount = 16;
            const previousLength = stateRef.current.currentLength;
            stateRef.current.currentLength = Math.max(
              stateRef.current.minLength,
              stateRef.current.currentLength - shrinkAmount
            );

            // Pop floating notification
            const reducedPx = previousLength - stateRef.current.currentLength;
            const shrinkMsg = reducedPx > 0
              ? `🔥 +5 ĐIỂM · CHÁY NGẮN BỚT -${reducedPx}PX!`
              : '🔥 +5 ĐIỂM · TÀN THUỐC CỰC GỌN!';

            floatingTextsRef.current.push({
              id: Date.now() + Math.random(),
              x: flame.x,
              y: flame.y - 20,
              text: shrinkMsg,
              color: '#f97316',
              alpha: 1,
              scale: 1.15,
              life: 1.6,
            });

            // 1. Spurt of radiant, blooming smoke particles (Làn khói tỏa ra khi ăn ngọn lửa)
            const smokeHues = [
              'rgba(254, 215, 170, 0.75)', // warm amber smoke
              'rgba(251, 146, 60, 0.70)',  // fiery orange smoke
              'rgba(241, 245, 249, 0.65)', // silky white tobacco smoke
              skin.smokeColor || 'rgba(226, 232, 240, 0.6)',
            ];
            const smokeCount = 32;
            for (let sm = 0; sm < smokeCount; sm++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 20 + Math.random() * 85;
              const upwardBias = -25 - Math.random() * 45; // khói bốc lên cao
              smokeRef.current.push({
                x: flame.x + (Math.random() - 0.5) * 12,
                y: flame.y + (Math.random() - 0.5) * 10,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd * 0.5 + upwardBias,
                size: 5 + Math.random() * 7,
                alpha: 0.8,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 2.8,
                color: smokeHues[Math.floor(Math.random() * smokeHues.length)],
                life: 0,
                maxLife: 0.85 + Math.random() * 0.75,
              });
            }

            // 2. Emit smoke wisps from the shortened ember tip
            for (let esm = 0; esm < 12; esm++) {
              smokeRef.current.push({
                x: emberX + (Math.random() - 0.5) * 8,
                y: emberY + (Math.random() - 0.5) * 6,
                vx: (Math.random() - 0.5) * 30 + 25 * cosA,
                vy: -40 - Math.random() * 50,
                size: 4 + Math.random() * 6,
                alpha: 0.75,
                rotation: Math.random() * Math.PI * 2,
                rotSpeed: (Math.random() - 0.5) * 2.5,
                color: skin.smokeColor,
                life: 0,
                maxLife: 1.0 + Math.random() * 0.6,
              });
            }

            // 3. Burst fiery spark particles
            for (let s = 0; s < 25; s++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = 60 + Math.random() * 140;
              sparksRef.current.push({
                x: flame.x,
                y: flame.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                size: 2.5 + Math.random() * 3,
                alpha: 1,
                color: Math.random() > 0.4 ? '#fbbf24' : '#ef4444',
                life: 0,
                maxLife: 0.55,
              });
            }

            onScoreUpdate(stateRef.current.score, stateRef.current.currentLength, stateRef.current.flamesCollected);

            // Check if victory reached via flame bonus
            if (stateRef.current.score >= 100 && !stateRef.current.hasWon) {
              stateRef.current.hasWon = true;
              soundFx.playVictory();
              onVictory(
                stateRef.current.score,
                stateRef.current.flamesCollected,
                stateRef.current.rainDodged,
                Math.floor(stateRef.current.timeSurvived)
              );
            }

            flamesRef.current.splice(f, 1);
            continue;
          }
        }

        // Remove flame if off bottom
        if (flame.y > height + 40) {
          flamesRef.current.splice(f, 1);
        }
      }

      // UPDATE PARTICLES
      for (let s = splashesRef.current.length - 1; s >= 0; s--) {
        const p = splashesRef.current[s];
        p.life += dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.vy += 380 * dt; // gravity kéo các hạt nước văng rơi trở lại
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);
        if (p.life >= p.maxLife) splashesRef.current.splice(s, 1);
      }

      // UPDATE WATER RIPPLES (Sóng nước loang trên mặt đất)
      for (let r = ripplesRef.current.length - 1; r >= 0; r--) {
        const rip = ripplesRef.current[r];
        rip.radius += 36 * dt;
        rip.alpha = Math.max(0, 0.75 * (1 - rip.radius / rip.maxRadius));
        if (rip.radius >= rip.maxRadius) ripplesRef.current.splice(r, 1);
      }

      for (let m = smokeRef.current.length - 1; m >= 0; m--) {
        const sm = smokeRef.current[m];
        sm.life += dt;
        sm.x += sm.vx * dt;
        sm.y += sm.vy * dt;
        sm.vy -= 24 * dt; // khói tự nhiên bốc lên cao
        sm.vx *= 0.98; // lực cản gió nhẹ
        sm.size += 14 * dt; // hạt khói nở dần khi phân tán
        sm.rotation += sm.rotSpeed * dt;
        const progress = Math.min(1, sm.life / sm.maxLife);
        // Đường cong mờ dần mềm mại
        sm.alpha = Math.max(0, Math.sin(progress * Math.PI) * 0.72);
        if (sm.life >= sm.maxLife) smokeRef.current.splice(m, 1);
      }

      for (let sp = sparksRef.current.length - 1; sp >= 0; sp--) {
        const sk = sparksRef.current[sp];
        sk.life += dt;
        sk.x += sk.vx * dt;
        sk.y += sk.vy * dt;
        sk.alpha = Math.max(0, 1 - sk.life / sk.maxLife);
        if (sk.life >= sk.maxLife) sparksRef.current.splice(sp, 1);
      }

      for (let t = floatingTextsRef.current.length - 1; t >= 0; t--) {
        const ft = floatingTextsRef.current[t];
        ft.life -= dt;
        ft.y -= 25 * dt;
        ft.alpha = Math.max(0, ft.life / 1.5);
        if (ft.life <= 0) floatingTextsRef.current.splice(t, 1);
      }

      // -------------------------------------------------------------
      // DRAW CANVAS SCENE WITH SCREEN SHAKE / VIBRATION
      // -------------------------------------------------------------
      let shakeOffsetX = 0;
      let shakeOffsetY = 0;
      if (stateRef.current.shakeTime > 0) {
        stateRef.current.shakeTime -= dt;
        const progress = Math.max(0, stateRef.current.shakeTime / (stateRef.current.shakeDuration || 0.3));
        const currentMag = stateRef.current.shakeIntensity * progress;
        shakeOffsetX = (Math.random() * 2 - 1) * currentMag;
        shakeOffsetY = (Math.random() * 2 - 1) * currentMag;
        if (stateRef.current.shakeTime <= 0) {
          stateRef.current.shakeIntensity = 0;
        }
      }

      ctx.clearRect(0, 0, width, height);
      ctx.save();
      ctx.translate(shakeOffsetX, shakeOffsetY);

      // 1. Dark Atmospheric Rainy Street Backdrop
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#07090e');
      bgGrad.addColorStop(0.65, '#0b0f17');
      bgGrad.addColorStop(1, '#111724');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant wet bokeh streetlights
      const bokeh = [
        { x: width * 0.15, y: height * 0.22, r: 45, color: 'rgba(245, 158, 11, 0.08)' },
        { x: width * 0.42, y: height * 0.18, r: 60, color: 'rgba(56, 189, 248, 0.07)' },
        { x: width * 0.82, y: height * 0.25, r: 50, color: 'rgba(239, 68, 68, 0.07)' },
        { x: width * 0.65, y: height * 0.32, r: 40, color: 'rgba(234, 179, 8, 0.06)' },
      ];
      bokeh.forEach(b => {
        const rad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        rad.addColorStop(0, b.color);
        rad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Wet pavement reflection bar at bottom
      const puddleGrad = ctx.createLinearGradient(0, height - 35, 0, height);
      puddleGrad.addColorStop(0, 'rgba(15, 23, 42, 0.4)');
      puddleGrad.addColorStop(0.5, 'rgba(30, 41, 59, 0.65)');
      puddleGrad.addColorStop(1, 'rgba(2, 6, 23, 0.9)');
      ctx.fillStyle = puddleGrad;
      ctx.fillRect(0, height - 35, width, 35);

      // Wet pavement subtle shimmer line
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, height - 34);
      ctx.lineTo(width, height - 34);
      ctx.stroke();

      // Expanding water ripples on pavement (Vòng sóng nước loang trên mặt đường)
      ripplesRef.current.forEach(rip => {
        ctx.save();
        ctx.strokeStyle = rip.color;
        ctx.globalAlpha = rip.alpha;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        // Flat perspective ellipse on wet ground pavement
        ctx.ellipse(rip.x, rip.y, rip.radius, rip.radius * 0.35, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 2. Draw Smoke Particles (Behind Rain)
      smokeRef.current.forEach(sm => {
        ctx.save();
        ctx.translate(sm.x, sm.y);
        ctx.rotate(sm.rotation);
        // Hạt khói mềm mại có viền mờ tự nhiên (feathered volumetric smoke)
        const rad = ctx.createRadialGradient(0, 0, 0, 0, 0, sm.size);
        rad.addColorStop(0, sm.color);
        rad.addColorStop(0.45, sm.color);
        rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = rad;
        ctx.globalAlpha = sm.alpha;
        ctx.beginPath();
        ctx.arc(0, 0, sm.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 3. Draw Water Droplets 💧
      raindropsRef.current.forEach(drop => {
        ctx.save();
        ctx.translate(drop.x, drop.y);
        ctx.rotate(drop.angle + Math.sin(drop.wobblePhase) * 0.06);

        const r = drop.radius;
        const h = drop.height;

        // Ambient cyan/blue glow around the water droplet
        const aura = ctx.createRadialGradient(0, 0, r * 0.3, 0, 0, r * 2.4);
        aura.addColorStop(0, 'rgba(56, 189, 248, 0.25)');
        aura.addColorStop(0.6, 'rgba(56, 189, 248, 0.08)');
        aura.addColorStop(1, 'rgba(56, 189, 248, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, r * 2.4, 0, Math.PI * 2);
        ctx.fill();

        // Teardrop path: pointed tip at (0, -h), round bulb at (0, 0)
        ctx.beginPath();
        ctx.moveTo(0, -h);
        ctx.bezierCurveTo(r * 1.25, -h * 0.35, r * 1.35, r * 0.65, 0, r);
        ctx.bezierCurveTo(-r * 1.35, r * 0.65, -r * 1.25, -h * 0.35, 0, -h);

        // 3D Water Droplet gradient
        const dropGrad = ctx.createLinearGradient(0, -h, 0, r);
        dropGrad.addColorStop(0, 'rgba(224, 242, 254, 0.95)'); // crystal light tip
        dropGrad.addColorStop(0.3, 'rgba(125, 211, 252, 0.92)'); // bright sky blue
        dropGrad.addColorStop(0.75, 'rgba(14, 165, 233, 0.95)'); // ocean blue
        dropGrad.addColorStop(1, 'rgba(3, 105, 161, 0.98)'); // deep water bulb base
        ctx.fillStyle = dropGrad;
        ctx.fill();

        // Crisp reflective water outer rim
        ctx.strokeStyle = 'rgba(240, 249, 255, 0.85)';
        ctx.lineWidth = 1.2;
        ctx.stroke();

        // 3D Specular Highlight curved glare on upper-left
        ctx.beginPath();
        ctx.ellipse(-r * 0.35, -r * 0.15, r * 0.28, r * 0.42, -0.4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.fill();

        // Second subtle glint dot at bottom right
        ctx.beginPath();
        ctx.arc(r * 0.38, r * 0.38, r * 0.18, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
        ctx.fill();

        ctx.restore();
      });

      // 4. Draw Splash Particles (Hạt nước văng toé sáng bóng, sống động)
      splashesRef.current.forEach(sp => {
        ctx.save();
        ctx.globalAlpha = sp.alpha;

        // Shiny water bead droplet
        ctx.fillStyle = sp.color;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();

        // High-gloss specular reflection dot on upper-left of water bead
        if (sp.size >= 1.5) {
          ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.beginPath();
          ctx.arc(sp.x - sp.size * 0.32, sp.y - sp.size * 0.32, sp.size * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      // 5. Draw Fire Flames 🔥
      flamesRef.current.forEach(flame => {
        ctx.save();
        ctx.translate(flame.x, flame.y);

        // Radiant heat aura
        const aura = ctx.createRadialGradient(0, 0, 4, 0, 0, flame.radius * 2.2);
        aura.addColorStop(0, 'rgba(251, 146, 60, 0.35)');
        aura.addColorStop(0.5, 'rgba(239, 68, 68, 0.15)');
        aura.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = aura;
        ctx.beginPath();
        ctx.arc(0, 0, flame.radius * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Flame teardrop shape
        const flamePulse = 1 + Math.sin(flame.pulsePhase) * 0.12;
        const flameHeight = flame.radius * 2.2 * flamePulse;
        const flameWidth = flame.radius * 1.5 * flamePulse;

        // Outer Flame (Red/Orange)
        ctx.beginPath();
        ctx.moveTo(0, -flameHeight);
        ctx.bezierCurveTo(flameWidth, -flameHeight * 0.3, flameWidth, flameHeight * 0.6, 0, flameHeight * 0.8);
        ctx.bezierCurveTo(-flameWidth, flameHeight * 0.6, -flameWidth, -flameHeight * 0.3, 0, -flameHeight);
        const flameGrad = ctx.createLinearGradient(0, -flameHeight, 0, flameHeight * 0.8);
        flameGrad.addColorStop(0, '#fef08a'); // yellow top
        flameGrad.addColorStop(0.4, '#f97316'); // orange middle
        flameGrad.addColorStop(1, '#dc2626'); // red base
        ctx.fillStyle = flameGrad;
        ctx.fill();

        // Inner Core (White/Yellow intense heat)
        ctx.beginPath();
        const coreH = flameHeight * 0.55;
        const coreW = flameWidth * 0.55;
        ctx.moveTo(0, -coreH * 0.8);
        ctx.bezierCurveTo(coreW, 0, coreW, coreH * 0.6, 0, coreH * 0.75);
        ctx.bezierCurveTo(-coreW, coreH * 0.6, -coreW, 0, 0, -coreH * 0.8);
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = 0.85;
        ctx.fill();

        // Flame label tag: "Ăn để thu ngắn"
        ctx.globalAlpha = 0.9;
        ctx.font = '600 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = '#fef08a';
        ctx.textAlign = 'center';
        ctx.fillText('ĂN LỬA 🔥', 0, flameHeight + 14);

        ctx.restore();
      });

      // 6. Draw Cigarette (The Player)
      ctx.save();
      ctx.translate(cigX, cigY);
      ctx.rotate(stateRef.current.tiltAngle);

      const halfW = cigLen / 2;
      const halfH = cigThick / 2;
      const fWidth = Math.min(stateRef.current.filterWidth, Math.max(26, cigLen - 16));
      const shaftWidth = cigLen - fWidth;

      // Drop shadow on wet ground
      ctx.shadowColor = 'rgba(0, 0, 0, 0.45)';
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 6;

      // Filter section (Left end - đầu lọc dài theo chuẩn điếu thuốc thật)
      const filterX = -halfW;
      const filterY = -halfH;
      const filterGrad = ctx.createLinearGradient(filterX, filterY, filterX, filterY + cigThick);
      filterGrad.addColorStop(0, skin.filterColor);
      filterGrad.addColorStop(0.25, '#f5d0a9');
      filterGrad.addColorStop(0.65, skin.filterColor);
      filterGrad.addColorStop(1, '#78350f');

      ctx.fillStyle = filterGrad;
      ctx.beginPath();
      // Round left corners of filter mouthpiece
      ctx.roundRect(filterX, filterY, fWidth, cigThick, [4, 0, 0, 4]);
      ctx.fill();

      // Laser ventilation perforation line (Vòng thoáng khí li ti đặc trưng)
      if (fWidth >= 28) {
        ctx.save();
        ctx.setLineDash([1.5, 2]);
        ctx.strokeStyle = 'rgba(120, 53, 15, 0.42)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(filterX + fWidth - 12, filterY + 1);
        ctx.lineTo(filterX + fWidth - 12, filterY + cigThick - 1);
        ctx.stroke();
        ctx.restore();
      }

      // Metallic gold foil dividing ring (Vòng nhẫn vàng kim loại ngăn cách đầu lọc)
      const ringX = filterX + fWidth - 3.5;
      const ringGrad = ctx.createLinearGradient(ringX, filterY, ringX, filterY + cigThick);
      ringGrad.addColorStop(0, '#d4af37');
      ringGrad.addColorStop(0.3, '#fef08a');
      ringGrad.addColorStop(0.7, '#d4af37');
      ringGrad.addColorStop(1, '#92400e');
      ctx.fillStyle = ringGrad;
      ctx.fillRect(ringX, filterY, 3.5, cigThick);

      // Fine dark seam before paper body
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(filterX + fWidth - 0.6, filterY, 0.6, cigThick);

      // Mouthpiece end subtle bevel
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(filterX + 0.5, filterY + 3);
      ctx.lineTo(filterX + 0.5, filterY + cigThick - 3);
      ctx.stroke();

      // White/Cream Cigarette Shaft (Paper body)
      const shaftX = filterX + fWidth;
      const shaftGrad = ctx.createLinearGradient(shaftX, filterY, shaftX, filterY + cigThick);
      shaftGrad.addColorStop(0, '#e2e8f0');
      shaftGrad.addColorStop(0.3, skin.bodyColor);
      shaftGrad.addColorStop(0.8, '#cbd5e1');
      shaftGrad.addColorStop(1, '#94a3b8');

      ctx.fillStyle = shaftGrad;
      ctx.fillRect(shaftX, filterY, shaftWidth, cigThick);

      // Subtle paper seams / tobacco line markings
      ctx.strokeStyle = 'rgba(100, 116, 139, 0.2)';
      ctx.lineWidth = 0.8;
      for (let markX = shaftX + 12; markX < shaftX + shaftWidth - 10; markX += 16) {
        ctx.beginPath();
        ctx.moveTo(markX, filterY);
        ctx.lineTo(markX, filterY + cigThick);
        ctx.stroke();
      }

      // Ash & Burning Ember Tip (Right end)
      const ashWidth = 8;
      const emberStartX = shaftX + shaftWidth - ashWidth;

      if (!stateRef.current.isExtinguished) {
        // Glowing hot ash gradient
        const emberGrad = ctx.createLinearGradient(emberStartX, filterY, emberStartX + ashWidth, filterY);
        emberGrad.addColorStop(0, '#52525b'); // grey ash
        emberGrad.addColorStop(0.4, '#dc2626'); // red burn
        emberGrad.addColorStop(0.8, skin.emberColor); // vibrant orange/flame
        emberGrad.addColorStop(1, skin.emberCore); // white hot core

        ctx.fillStyle = emberGrad;
        ctx.beginPath();
        ctx.roundRect(emberStartX, filterY, ashWidth, cigThick, [0, 4, 4, 0]);
        ctx.fill();

        // Pulsing radial heat aura at the tip
        const pulse = 1 + Math.sin(time * 0.008) * 0.25;
        const emberTipX = emberStartX + ashWidth;
        const emberTipY = 0;
        const glowRad = ctx.createRadialGradient(emberTipX, emberTipY, 2, emberTipX, emberTipY, 22 * pulse);
        glowRad.addColorStop(0, 'rgba(255, 237, 213, 0.85)');
        glowRad.addColorStop(0.4, 'rgba(249, 115, 22, 0.55)');
        glowRad.addColorStop(0.8, 'rgba(220, 38, 38, 0.2)');
        glowRad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = glowRad;
        ctx.beginPath();
        ctx.arc(emberTipX, emberTipY, 22 * pulse, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Wet extinguished soggy grey/black ash
        const soggyGrad = ctx.createLinearGradient(emberStartX, filterY, emberStartX + ashWidth, filterY);
        soggyGrad.addColorStop(0, '#27272a');
        soggyGrad.addColorStop(0.6, '#18181b');
        soggyGrad.addColorStop(1, '#09090b');

        ctx.fillStyle = soggyGrad;
        ctx.beginPath();
        ctx.roundRect(emberStartX, filterY, ashWidth, cigThick, [0, 4, 4, 0]);
        ctx.fill();
      }

      ctx.restore();

      // 7. Draw Sparks
      sparksRef.current.forEach(sp => {
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.alpha;
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // 8. Draw Floating Notifications
      floatingTextsRef.current.forEach(ft => {
        ctx.save();
        ctx.translate(ft.x, ft.y);
        ctx.scale(ft.scale, ft.scale);
        ctx.globalAlpha = ft.alpha;
        ctx.font = '700 14px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.fillStyle = ft.color;
        ctx.fillText(ft.text, 0, 0);
        ctx.restore();
      });

      // 9. Draw Length Badge indicator under cigarette
      if (gameState === 'PLAYING') {
        ctx.save();
        ctx.font = '500 11px Plus Jakarta Sans, sans-serif';
        ctx.fillStyle = 'rgba(203, 213, 225, 0.7)';
        ctx.textAlign = 'center';
        const lengthPercent = Math.round((cigLen / stateRef.current.baseLength) * 100);
        ctx.fillText(`Điếu thuốc: ${Math.round(cigLen)}mm (${lengthPercent}%)`, cigX, cigY + 26);
        ctx.restore();
      }

      // Restore outer shake transform
      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [gameState, skin, onGameOver, onVictory, onScoreUpdate]);

  return (
    <div className="relative w-full h-full select-none touch-none overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-950 shadow-2xl">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        className="w-full h-full block cursor-grab active:cursor-grabbing"
      />
    </div>
  );
};
