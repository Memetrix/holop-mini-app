/**
 * HOLOP PixiJS BuildingScene
 * Renders an animated village with building sprites, particle effects,
 * ambient glow, and floating coin animations.
 *
 * Uses raw PixiJS 8 with a React ref container (no @pixi/react).
 */

import { useRef, useEffect } from 'react';
import { Application, Assets, Container, Graphics, Sprite } from 'pixi.js';
import { useGameStore } from '@/store/gameStore';
import { getBuildingById } from '@/config/buildings';
import { getAssetUrl } from '@/config/assets';
import { COIN_PARTICLE, SMOKE_PARTICLE, GLOW_COLORS } from './particles';
import type { Building } from '@/store/types';
import type { BuildingDef } from '@/config/buildings';

// ─── Types ───

interface BuildingSceneProps {
  width?: number;
  height?: number;
}

interface CoinParticle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
}

interface SmokeParticle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  startAlpha: number;
}

interface BuildingEntry {
  sprite: Sprite;
  glow: Graphics;
  baseY: number;
  phaseOffset: number;
  building: Building;
  def: BuildingDef;
}

// ─── Layout helpers ───

const GRID_COLS = 3;
const BUILDING_SIZE = 80;
const PADDING_Y = 30;
const ROW_GAP = 20;
const COL_GAP = 16;

function getBuildingPosition(index: number, sceneWidth: number): { x: number; y: number } {
  const col = index % GRID_COLS;
  const row = Math.floor(index / GRID_COLS);
  const totalGridWidth = GRID_COLS * BUILDING_SIZE + (GRID_COLS - 1) * COL_GAP;
  const offsetX = (sceneWidth - totalGridWidth) / 2;
  return {
    x: offsetX + col * (BUILDING_SIZE + COL_GAP) + BUILDING_SIZE / 2,
    y: PADDING_Y + row * (BUILDING_SIZE + ROW_GAP) + BUILDING_SIZE / 2,
  };
}

// ─── Particle helpers ───

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function createCoinParticle(x: number, y: number): CoinParticle {
  const gfx = new Graphics();
  const scale = randomRange(COIN_PARTICLE.minScale, COIN_PARTICLE.maxScale);
  const radius = 3 * scale;

  gfx.circle(0, 0, radius);
  gfx.fill({ color: COIN_PARTICLE.color, alpha: 0.9 });
  gfx.circle(0, 0, radius * 0.6);
  gfx.fill({ color: 0xffd700, alpha: 0.8 });

  gfx.x = x + randomRange(-15, 15);
  gfx.y = y;

  return {
    gfx,
    vx: randomRange(-0.3, 0.3),
    vy: -randomRange(COIN_PARTICLE.minSpeed, COIN_PARTICLE.maxSpeed),
    life: COIN_PARTICLE.lifetime,
    maxLife: COIN_PARTICLE.lifetime,
  };
}

function createSmokeParticle(x: number, y: number): SmokeParticle {
  const gfx = new Graphics();
  const radius = randomRange(2, 5);

  gfx.circle(0, 0, radius);
  gfx.fill({ color: SMOKE_PARTICLE.color, alpha: SMOKE_PARTICLE.alpha });

  gfx.x = x + randomRange(-5, 5);
  gfx.y = y;

  return {
    gfx,
    vx: randomRange(-0.15, 0.15),
    vy: -randomRange(SMOKE_PARTICLE.minSpeed, SMOKE_PARTICLE.maxSpeed),
    life: SMOKE_PARTICLE.lifetime,
    maxLife: SMOKE_PARTICLE.lifetime,
    startAlpha: SMOKE_PARTICLE.alpha,
  };
}

function createGlowGraphics(radius: number, color: number): Graphics {
  const glow = new Graphics();
  const steps = 6;
  for (let i = steps; i >= 1; i--) {
    const r = radius * (i / steps);
    const a = 0.04 * (1 - i / steps) + 0.01;
    glow.circle(0, 0, r);
    glow.fill({ color, alpha: a });
  }
  return glow;
}

// ─── Component ───

export function BuildingScene({ width = 375, height = 280 }: BuildingSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildings = useGameStore((s) => s.buildings);
  const buildingsRef = useRef<Building[]>(buildings);

  // Keep ref in sync for the animation loop to read latest buildings
  useEffect(() => {
    buildingsRef.current = buildings;
  }, [buildings]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container: HTMLDivElement = containerRef.current;

    let destroyed = false;
    const app = new Application();

    // Particle arrays
    const coinParticles: CoinParticle[] = [];
    const smokeParticles: SmokeParticle[] = [];
    const buildingEntries: BuildingEntry[] = [];

    // Containers
    const glowLayer = new Container();
    const buildingLayer = new Container();
    const particleLayer = new Container();

    // Coin spawn accumulators per building (keyed by index)
    const coinTimers: number[] = [];
    const smokeTimers: number[] = [];

    async function setup() {
      if (destroyed) return;

      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      container.appendChild(app.canvas);

      app.stage.addChild(glowLayer);
      app.stage.addChild(buildingLayer);
      app.stage.addChild(particleLayer);

      // Load building sprites
      await loadBuildings();

      if (destroyed) {
        app.destroy(true, { children: true });
        return;
      }

      // Start animation ticker
      app.ticker.add((ticker) => {
        if (destroyed) return;
        const dt = ticker.deltaTime;
        updateBuildingAnimations();
        updateCoinParticles(dt);
        updateSmokeParticles(dt);
        spawnParticles(dt);
      });
    }

    async function loadBuildings() {
      const currentBuildings = buildingsRef.current;

      for (let i = 0; i < currentBuildings.length; i++) {
        const building = currentBuildings[i];
        const def = getBuildingById(building.id);
        if (!def) continue;

        const url = getAssetUrl(def.assetKey);
        if (!url) continue;

        const pos = getBuildingPosition(i, width);

        // Create glow behind building
        const glowColor = i % 3 === 0
          ? GLOW_COLORS.gold
          : i % 3 === 1
            ? GLOW_COLORS.amber
            : GLOW_COLORS.warm;
        const glow = createGlowGraphics(BUILDING_SIZE * 0.7, glowColor);
        glow.x = pos.x;
        glow.y = pos.y;
        glowLayer.addChild(glow);

        // Load and create sprite
        let sprite: Sprite;
        try {
          const texture = await Assets.load(url);
          if (destroyed) return;
          sprite = new Sprite(texture);
        } catch {
          // Fallback: create a placeholder rectangle
          const placeholder = new Graphics();
          placeholder.roundRect(
            -BUILDING_SIZE / 2,
            -BUILDING_SIZE / 2,
            BUILDING_SIZE,
            BUILDING_SIZE,
            8,
          );
          placeholder.fill({ color: 0x4a3520, alpha: 0.6 });
          placeholder.stroke({ color: GLOW_COLORS.gold, width: 1, alpha: 0.4 });
          placeholder.x = pos.x;
          placeholder.y = pos.y;
          buildingLayer.addChild(placeholder);

          // Still need a Sprite for the entry, wrap in container approach:
          // Just skip this building for sprite-based animations
          coinTimers.push(0);
          smokeTimers.push(0);
          continue;
        }

        sprite.anchor.set(0.5);
        sprite.width = BUILDING_SIZE;
        sprite.height = BUILDING_SIZE;
        sprite.x = pos.x;
        sprite.y = pos.y;

        // Scale based on level (subtle growth)
        const levelScale = 1 + building.level * 0.008;
        sprite.width = BUILDING_SIZE * levelScale;
        sprite.height = BUILDING_SIZE * levelScale;

        buildingLayer.addChild(sprite);

        buildingEntries.push({
          sprite,
          glow,
          baseY: pos.y,
          phaseOffset: i * 1.2 + Math.random() * 0.5,
          building,
          def,
        });

        coinTimers.push(0);
        smokeTimers.push(0);
      }
    }

    function updateBuildingAnimations() {
      const time = performance.now() / 1000;

      for (const entry of buildingEntries) {
        // Gentle floating bob
        const bobAmount = 1.5 + entry.building.level * 0.1;
        entry.sprite.y = entry.baseY + Math.sin(time * 1.2 + entry.phaseOffset) * bobAmount;

        // Subtle glow pulse
        const glowPulse = 0.7 + 0.3 * Math.sin(time * 0.8 + entry.phaseOffset * 0.7);
        entry.glow.alpha = glowPulse;
        entry.glow.y = entry.sprite.y;

        // Very slight rotation wobble
        entry.sprite.rotation = Math.sin(time * 0.6 + entry.phaseOffset) * 0.015;

        // Subtle scale breathing
        const breathe = 1 + Math.sin(time * 0.9 + entry.phaseOffset) * 0.01;
        const levelScale = 1 + entry.building.level * 0.008;
        entry.sprite.width = BUILDING_SIZE * levelScale * breathe;
        entry.sprite.height = BUILDING_SIZE * levelScale * breathe;
      }
    }

    function spawnParticles(dt: number) {
      const msPerFrame = dt * (1000 / 60);

      for (let i = 0; i < buildingEntries.length; i++) {
        const entry = buildingEntries[i];
        const pos = { x: entry.sprite.x, y: entry.sprite.y };

        // Coin particles (income buildings only)
        if (entry.building.income > 0) {
          coinTimers[i] = (coinTimers[i] ?? 0) + msPerFrame;
          const spawnInterval = Math.max(400, 2000 - entry.building.income * 2);
          if (coinTimers[i] >= spawnInterval) {
            coinTimers[i] = 0;
            const coin = createCoinParticle(pos.x, pos.y - BUILDING_SIZE * 0.3);
            particleLayer.addChild(coin.gfx);
            coinParticles.push(coin);
          }
        }

        // Smoke particles (all buildings, sparse)
        smokeTimers[i] = (smokeTimers[i] ?? 0) + msPerFrame;
        const smokeInterval = 1500 + Math.random() * 500;
        if (smokeTimers[i] >= smokeInterval) {
          smokeTimers[i] = 0;
          const smoke = createSmokeParticle(
            pos.x + randomRange(-10, 10),
            pos.y - BUILDING_SIZE * 0.35,
          );
          particleLayer.addChild(smoke.gfx);
          smokeParticles.push(smoke);
        }
      }
    }

    function updateCoinParticles(dt: number) {
      const msPerFrame = dt * (1000 / 60);

      for (let i = coinParticles.length - 1; i >= 0; i--) {
        const p = coinParticles[i];
        p.life -= msPerFrame;

        if (p.life <= 0) {
          particleLayer.removeChild(p.gfx);
          p.gfx.destroy();
          coinParticles.splice(i, 1);
          continue;
        }

        const progress = 1 - p.life / p.maxLife;
        p.gfx.x += p.vx * dt;
        p.gfx.y += p.vy * dt;

        // Fade out in last 30%
        if (progress > 0.7) {
          p.gfx.alpha = (1 - progress) / 0.3;
        }

        // Slight horizontal drift
        p.vx += Math.sin(performance.now() / 500 + i) * 0.01;
      }
    }

    function updateSmokeParticles(dt: number) {
      const msPerFrame = dt * (1000 / 60);

      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.life -= msPerFrame;

        if (p.life <= 0) {
          particleLayer.removeChild(p.gfx);
          p.gfx.destroy();
          smokeParticles.splice(i, 1);
          continue;
        }

        const progress = 1 - p.life / p.maxLife;
        p.gfx.x += p.vx * dt;
        p.gfx.y += p.vy * dt;

        // Expand and fade
        const scale = 1 + progress * 1.5;
        p.gfx.scale.set(scale);
        p.gfx.alpha = p.startAlpha * (1 - progress);

        // Drift sideways
        p.vx += Math.sin(performance.now() / 800 + i * 0.5) * 0.005;
      }
    }

    setup();

    return () => {
      destroyed = true;

      // Clean up particles
      for (const p of coinParticles) {
        p.gfx.destroy();
      }
      coinParticles.length = 0;

      for (const p of smokeParticles) {
        p.gfx.destroy();
      }
      smokeParticles.length = 0;

      buildingEntries.length = 0;

      // Destroy app and remove canvas
      app.destroy(true, { children: true });
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    };
    // Re-initialize when buildings change (count or identity)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, buildings.length, buildings.map((b) => `${b.id}:${b.level}`).join(',')]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
      }}
    />
  );
}
