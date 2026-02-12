/**
 * ResultEffect - PixiJS 8 ambient particle animation for battle result header
 * Victory: gold particle fountain, spinning sparkles, expanding light rings
 * Defeat: red embers drifting up, dark smoke wisps, occasional red flash
 * Loops continuously while mounted.
 */

import { useEffect, useRef } from 'react';
import { Application, Graphics } from 'pixi.js';

interface ResultEffectProps {
  won: boolean;
  width?: number;
  height?: number;
}

// ── Color constants ──

const GOLD_PRIMARY = 0xC8973E;
const GOLD_BRIGHT = 0xFFD700;
const GOLD_PARCHMENT = 0xF5ECD7;
const RED_DANGER = 0xDC3545;
const RED_EMBER = 0xFF6B6B;
const SMOKE_DARK = 0x333333;

// ── Particle types ──

interface FountainParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
}

interface SparkleParticle {
  x: number;
  y: number;
  phase: number;
  phaseSpeed: number;
  size: number;
  rotation: number;
  rotSpeed: number;
}

interface LightRing {
  x: number;
  y: number;
  age: number;
  maxAge: number;
}

interface EmberParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  flickerPhase: number;
}

interface SmokeParticle {
  x: number;
  y: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  growRate: number;
}

// ── Component ──

export function ResultEffect({ won, width = 375, height = 140 }: ResultEffectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    destroyedRef.current = false;
    const el = containerRef.current;
    if (!el) return;

    let app: Application | null = null;
    let cancelled = false;

    async function run(container: HTMLDivElement) {
      const pixiApp = new Application();
      await pixiApp.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (cancelled || destroyedRef.current) {
        pixiApp.destroy(true);
        return;
      }

      app = pixiApp;
      container.appendChild(pixiApp.canvas as HTMLCanvasElement);

      if (won) {
        initVictory(pixiApp, width, height, () => cancelled || destroyedRef.current);
      } else {
        initDefeat(pixiApp, width, height, () => cancelled || destroyedRef.current);
      }
    }

    run(el);

    return () => {
      cancelled = true;
      destroyedRef.current = true;
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      if (el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
    };
  }, [won, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        position: 'absolute',
        top: 0,
        left: 0,
        pointerEvents: 'none',
      }}
    />
  );
}

// ── Victory animation ──

function initVictory(
  pixiApp: Application,
  width: number,
  height: number,
  isCancelled: () => boolean,
) {
  const fountainParticles: FountainParticle[] = [];
  const sparkles: SparkleParticle[] = [];
  const rings: LightRing[] = [];

  const particleGfx = new Graphics();
  const sparkleGfx = new Graphics();
  const ringGfx = new Graphics();

  pixiApp.stage.addChild(ringGfx);
  pixiApp.stage.addChild(particleGfx);
  pixiApp.stage.addChild(sparkleGfx);

  // Pre-populate fountain particles so the effect is visible immediately
  const FOUNTAIN_COUNT = 100;
  const spawnX = width / 2;
  const spawnY = height;

  for (let i = 0; i < FOUNTAIN_COUNT; i++) {
    fountainParticles.push(createFountainParticle(spawnX, spawnY, height));
  }

  // Pre-populate sparkles
  const SPARKLE_COUNT = 25;
  for (let i = 0; i < SPARKLE_COUNT; i++) {
    sparkles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      phase: Math.random() * Math.PI * 2,
      phaseSpeed: 2 + Math.random() * 3,
      size: 1.5 + Math.random() * 2.5,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: 1 + Math.random() * 3,
    });
  }

  // Ring timer
  let ringTimer = 0;
  const RING_INTERVAL = 2.0;

  pixiApp.ticker.add((ticker) => {
    if (isCancelled()) return;

    const dt = ticker.deltaMS / 1000;

    // -- Fountain particles --
    particleGfx.clear();

    for (let i = fountainParticles.length - 1; i >= 0; i--) {
      const p = fountainParticles[i];
      p.life -= dt;

      if (p.life <= 0) {
        // Respawn
        fountainParticles[i] = createFountainParticle(spawnX, spawnY, height);
        continue;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 80 * dt; // gravity

      const lifeRatio = p.life / p.maxLife;
      const alpha = lifeRatio * 0.8;
      const size = p.size * (0.3 + 0.7 * lifeRatio);

      particleGfx.circle(p.x, p.y, size);
      particleGfx.fill({ color: p.color, alpha });
    }

    // -- Sparkle particles --
    sparkleGfx.clear();

    for (const s of sparkles) {
      s.phase += s.phaseSpeed * dt;
      s.rotation += s.rotSpeed * dt;

      const alpha = 0.3 + 0.7 * Math.abs(Math.sin(s.phase));
      const sz = s.size * (0.5 + 0.5 * Math.abs(Math.sin(s.phase * 0.7)));

      // Draw a 4-pointed star
      drawStar(sparkleGfx, s.x, s.y, sz, s.rotation, GOLD_BRIGHT, alpha);
    }

    // -- Light rings --
    ringTimer += dt;
    if (ringTimer >= RING_INTERVAL) {
      ringTimer -= RING_INTERVAL;
      rings.push({
        x: width / 2,
        y: height * 0.4,
        age: 0,
        maxAge: 1.5,
      });
    }

    ringGfx.clear();
    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.age += dt;

      if (r.age >= r.maxAge) {
        rings.splice(i, 1);
        continue;
      }

      const progress = r.age / r.maxAge;
      const radius = 10 + progress * Math.max(width, height) * 0.6;
      const alpha = (1 - progress) * 0.15;

      ringGfx.circle(r.x, r.y, radius);
      ringGfx.stroke({ color: GOLD_PRIMARY, width: 2, alpha });
    }
  });
}

function createFountainParticle(
  spawnX: number,
  spawnY: number,
  _maxHeight: number,
): FountainParticle {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * 1.2; // spread ~70 degrees
  const speed = 60 + Math.random() * 120;
  const life = 0.8 + Math.random() * 1.2;

  const colors = [GOLD_PRIMARY, GOLD_BRIGHT, GOLD_PARCHMENT];
  const color = colors[Math.floor(Math.random() * colors.length)];

  return {
    x: spawnX + (Math.random() - 0.5) * 30,
    y: spawnY,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life,
    maxLife: life,
    size: 1.5 + Math.random() * 3,
    color,
  };
}

function drawStar(
  gfx: Graphics,
  cx: number,
  cy: number,
  size: number,
  rotation: number,
  color: number,
  alpha: number,
) {
  // 4-pointed star using two perpendicular lines
  const len = size * 2;
  const halfLen = len / 2;
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);

  // Arm 1
  gfx.moveTo(cx - cos * halfLen, cy - sin * halfLen);
  gfx.lineTo(cx + cos * halfLen, cy + sin * halfLen);
  gfx.stroke({ color, width: 1.2, alpha });

  // Arm 2
  gfx.moveTo(cx + sin * halfLen, cy - cos * halfLen);
  gfx.lineTo(cx - sin * halfLen, cy + cos * halfLen);
  gfx.stroke({ color, width: 1.2, alpha });

  // Center dot
  gfx.circle(cx, cy, size * 0.4);
  gfx.fill({ color, alpha });
}

// ── Defeat animation ──

function initDefeat(
  pixiApp: Application,
  width: number,
  height: number,
  isCancelled: () => boolean,
) {
  const embers: EmberParticle[] = [];
  const smokes: SmokeParticle[] = [];

  const emberGfx = new Graphics();
  const smokeGfx = new Graphics();
  const flashOverlay = new Graphics();

  flashOverlay.rect(0, 0, width, height);
  flashOverlay.fill({ color: RED_DANGER });
  flashOverlay.alpha = 0;

  pixiApp.stage.addChild(smokeGfx);
  pixiApp.stage.addChild(flashOverlay);
  pixiApp.stage.addChild(emberGfx);

  // Pre-populate embers
  const EMBER_COUNT = 35;
  for (let i = 0; i < EMBER_COUNT; i++) {
    embers.push(createEmber(width, height));
  }

  // Pre-populate smoke
  const SMOKE_COUNT = 18;
  for (let i = 0; i < SMOKE_COUNT; i++) {
    smokes.push(createSmoke(width, height));
  }

  // Flash timer
  let flashTimer = 0;
  const FLASH_INTERVAL = 3.0;
  const FLASH_DURATION = 0.3;

  pixiApp.ticker.add((ticker) => {
    if (isCancelled()) return;

    const dt = ticker.deltaMS / 1000;

    // -- Embers --
    emberGfx.clear();

    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.life -= dt;
      e.flickerPhase += 6 * dt;

      if (e.life <= 0) {
        embers[i] = createEmber(width, height);
        continue;
      }

      e.x += e.vx * dt;
      e.y += e.vy * dt;

      const lifeRatio = e.life / e.maxLife;
      const flicker = 0.5 + 0.5 * Math.sin(e.flickerPhase);
      const alpha = lifeRatio * flicker * 0.9;
      const size = e.size * (0.4 + 0.6 * lifeRatio);

      emberGfx.circle(e.x, e.y, size);
      emberGfx.fill({ color: e.color, alpha });

      // Glow around ember
      emberGfx.circle(e.x, e.y, size * 2.5);
      emberGfx.fill({ color: e.color, alpha: alpha * 0.15 });
    }

    // -- Smoke --
    smokeGfx.clear();

    for (let i = smokes.length - 1; i >= 0; i--) {
      const s = smokes[i];
      s.life -= dt;

      if (s.life <= 0) {
        smokes[i] = createSmoke(width, height);
        continue;
      }

      s.y += s.vy * dt;
      s.size += s.growRate * dt;

      const lifeRatio = s.life / s.maxLife;
      // Fade in at start, fade out at end
      const fadeIn = Math.min((s.maxLife - s.life) / 0.5, 1);
      const alpha = lifeRatio * fadeIn * 0.08;

      smokeGfx.circle(s.x, s.y, s.size);
      smokeGfx.fill({ color: SMOKE_DARK, alpha });
    }

    // -- Red flash --
    flashTimer += dt;
    if (flashTimer >= FLASH_INTERVAL) {
      flashTimer -= FLASH_INTERVAL;
    }

    if (flashTimer < FLASH_DURATION) {
      const flashProgress = flashTimer / FLASH_DURATION;
      // Quick peak at 0.05 alpha, then fade
      const peakAt = 0.3;
      let flashAlpha: number;
      if (flashProgress < peakAt) {
        flashAlpha = (flashProgress / peakAt) * 0.05;
      } else {
        flashAlpha = (1 - (flashProgress - peakAt) / (1 - peakAt)) * 0.05;
      }
      flashOverlay.alpha = flashAlpha;
    } else {
      flashOverlay.alpha = 0;
    }
  });
}

function createEmber(canvasWidth: number, canvasHeight: number): EmberParticle {
  const life = 2 + Math.random() * 3;
  const colors = [RED_DANGER, RED_EMBER, 0xFF4444];
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * 10,
    vx: (Math.random() - 0.5) * 15,
    vy: -(10 + Math.random() * 25), // drift upward slowly
    life,
    maxLife: life,
    size: 1 + Math.random() * 2.5,
    color: colors[Math.floor(Math.random() * colors.length)],
    flickerPhase: Math.random() * Math.PI * 2,
  };
}

function createSmoke(canvasWidth: number, canvasHeight: number): SmokeParticle {
  const life = 3 + Math.random() * 3;
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * 20,
    vy: -(5 + Math.random() * 12),
    life,
    maxLife: life,
    size: 10 + Math.random() * 20,
    growRate: 8 + Math.random() * 12,
  };
}
