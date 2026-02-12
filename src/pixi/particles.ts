/**
 * HOLOP PixiJS Particle Configuration Constants
 * Used by BuildingScene for coin, smoke, and spark particle effects.
 */

export const COIN_PARTICLE = {
  color: 0xc8973e,
  minSpeed: 0.3,
  maxSpeed: 1.2,
  minScale: 0.3,
  maxScale: 0.8,
  lifetime: 2000,
  spawnRate: 0.5,
};

export const SMOKE_PARTICLE = {
  color: 0x888888,
  alpha: 0.3,
  minSpeed: 0.2,
  maxSpeed: 0.5,
  lifetime: 3000,
};

export const SPARK_PARTICLE = {
  color: 0xffd700,
  minSpeed: 1,
  maxSpeed: 3,
  minScale: 0.1,
  maxScale: 0.4,
  lifetime: 800,
};

export const GLOW_COLORS = {
  gold: 0xc8973e,
  amber: 0xffb347,
  warm: 0xff8c42,
};
