export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'VICTORY';
export type DensityMode = 'LOW' | 'MEDIUM';

export interface CigaretteSkin {
  id: string;
  name: string;
  tagline: string;
  filterColor: string;
  bodyColor: string;
  emberColor: string;
  emberCore: string;
  smokeColor: string;
  unlockedAtScore: number;
  description: string;
  boxImage?: string;
  badge: string;
}

export interface Raindrop {
  x: number;
  y: number;
  speed: number;
  radius: number;
  height: number;
  opacity: number;
  angle: number;
  wobblePhase: number;
  wobbleSpeed: number;
  splash: boolean;
}

export interface FireFlame {
  id: number;
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  hue: number;
  pulsePhase: number;
  collected?: boolean;
}

export interface SplashParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface WaterRipple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
  color: string;
}

export interface SmokeParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  rotation: number;
  rotSpeed: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface SparkParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
  life: number;
  maxLife: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  scale: number;
  life: number;
}

export interface GameStats {
  score: number;
  highScore: number;
  flamesCollected: number;
  rainDodged: number;
  timeSurvived: number;
  currentLength: number;
  baseLength: number;
  minLength: number;
  gamesPlayed: number;
  victories: number;
}
