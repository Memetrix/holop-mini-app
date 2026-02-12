/**
 * HOLOP Interactive City — PixiJS Scene
 * Fullscreen pannable city map with procedural islands, building sprites,
 * level-colored particles, and touch drag navigation.
 */

import { useRef, useEffect } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Rectangle, Texture } from 'pixi.js';
import { useGameStore } from '@/store/gameStore';
import { getBuildingById } from '@/config/buildings';
import { getAssetUrl } from '@/config/assets';
import { getBuildingCost } from '@/config/buildings';
import {
  CITY_SLOTS,
  ISLAND_PATHS,
  WORLD_WIDTH,
  WORLD_HEIGHT,
  ISLAND_RADIUS,
  getParticleColor,
  getSparkleColor,
  seededRandom,
} from '@/config/cityLayout';
import { SMOKE_PARTICLE } from './particles';
import { generateTerrainCanvas, RIVER_SEGMENTS } from './terrainNoise';
import { createWaterFilter, updateWaterFilter } from './waterShader';
import type { Filter } from 'pixi.js';
import type { Building } from '@/store/types';
import type { BuildingDef } from '@/config/buildings';
import type { CitySlot } from '@/config/cityLayout';

// ─── Types ───

interface CitySceneProps {
  width: number;
  height: number;
  onSlotTap: (slotIndex: number, building: Building | null) => void;
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

interface SparkParticle {
  gfx: Graphics;
  angle: number;
  dist: number;
  speed: number;
  life: number;
  maxLife: number;
  centerX: number;
  centerY: number;
}

interface BuildingEntry {
  sprite: Sprite;
  glow: Graphics;
  upgradeGlow: Graphics | null;
  baseX: number;
  baseY: number;
  phaseOffset: number;
  building: Building;
  def: BuildingDef;
  slot: CitySlot;
}

// ─── Helpers ───

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function generateSmoothBlob(
  cx: number, cy: number, radius: number, seed: number,
  ySquash: number, yOffset: number, pointCount: number,
): { x: number; y: number }[] {
  // Generate smooth radii with Catmull-Rom-like interpolation
  const rng = seededRandom(seed);
  const rawRadii: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    rawRadii.push(radius * (0.88 + rng() * 0.24)); // tighter range = rounder
  }
  // Smooth pass: average each radius with neighbors (wrapping)
  const smoothed: number[] = [];
  for (let i = 0; i < pointCount; i++) {
    const prev = rawRadii[(i - 1 + pointCount) % pointCount];
    const curr = rawRadii[i];
    const next = rawRadii[(i + 1) % pointCount];
    smoothed.push(prev * 0.25 + curr * 0.5 + next * 0.25);
  }
  // Generate points
  const angleStep = (Math.PI * 2) / pointCount;
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < pointCount; i++) {
    const angle = i * angleStep;
    const r = smoothed[i];
    pts.push({
      x: cx + Math.cos(angle) * r,
      y: cy + yOffset + Math.sin(angle) * r * ySquash,
    });
  }
  return pts;
}

function drawSmoothClosedCurve(gfx: Graphics, pts: { x: number; y: number }[]) {
  const n = pts.length;
  if (n < 3) return;
  // Start at midpoint between last and first
  const mx = (pts[n - 1].x + pts[0].x) / 2;
  const my = (pts[n - 1].y + pts[0].y) / 2;
  gfx.moveTo(mx, my);
  for (let i = 0; i < n; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % n];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    gfx.quadraticCurveTo(curr.x, curr.y, midX, midY);
  }
  gfx.closePath();
}

function drawIslandBlob(gfx: Graphics, cx: number, cy: number, radius: number, seed: number, occupied: boolean) {
  const pointCount = 12; // more points = smoother

  // Draw shadow
  const shadowPts = generateSmoothBlob(cx, cy, radius + 5, seed, 0.55, 6, pointCount);
  drawSmoothClosedCurve(gfx, shadowPts);
  gfx.fill({ color: 0x000000, alpha: 0.2 });

  // Main island shape
  const mainPts = generateSmoothBlob(cx, cy, radius, seed, 0.65, 0, pointCount);
  drawSmoothClosedCurve(gfx, mainPts);
  gfx.fill({ color: occupied ? 0x3B2B1A : 0x2D2216, alpha: 0.85 });
  gfx.stroke({ color: 0xC8973E, width: 1.5, alpha: occupied ? 0.18 : 0.08 });

  // Inner terrain detail — small bumps
  const rng3 = seededRandom(seed + 100);
  for (let i = 0; i < 5; i++) {
    const angle = rng3() * Math.PI * 2;
    const dist = rng3() * radius * 0.45;
    const bx = cx + Math.cos(angle) * dist;
    const by = cy + Math.sin(angle) * dist * 0.65;
    const br = 4 + rng3() * 8;
    gfx.circle(bx, by, br);
    gfx.fill({ color: 0x2D3B1A, alpha: 0.12 + rng3() * 0.08 });
  }
}

function drawPlusIcon(gfx: Graphics, cx: number, cy: number) {
  const size = 14;
  const thickness = 4;
  // Horizontal bar
  gfx.roundRect(cx - size, cy - thickness / 2, size * 2, thickness, 2);
  gfx.fill({ color: 0xC8973E, alpha: 0.8 });
  // Vertical bar
  gfx.roundRect(cx - thickness / 2, cy - size, thickness, size * 2, 2);
  gfx.fill({ color: 0xC8973E, alpha: 0.8 });
  // Circle behind
  gfx.circle(cx, cy, 22);
  gfx.stroke({ color: 0xC8973E, width: 2, alpha: 0.5 });
}

function drawLockIcon(gfx: Graphics, cx: number, cy: number) {
  // Lock body
  gfx.roundRect(cx - 10, cy - 4, 20, 16, 3);
  gfx.fill({ color: 0x666666, alpha: 0.35 });
  // Lock shackle
  gfx.moveTo(cx - 6, cy - 4);
  gfx.arc(cx, cy - 10, 6, Math.PI, 0, false);
  gfx.lineTo(cx + 6, cy - 4);
  gfx.stroke({ color: 0x666666, width: 2, alpha: 0.35 });
  // Keyhole
  gfx.circle(cx, cy + 2, 2.5);
  gfx.fill({ color: 0x333333, alpha: 0.4 });
}

function createUpgradeGlow(radius: number): Graphics {
  const glow = new Graphics();
  // Outer soft halo — large warm bloom
  for (let i = 6; i >= 1; i--) {
    const r = radius * (i / 6) * 1.6;
    const a = 0.12 * (1 - i / 7) + 0.03;
    glow.circle(0, 0, r);
    glow.fill({ color: 0xC8973E, alpha: a });
  }
  // Inner bright core
  glow.circle(0, 0, radius * 0.5);
  glow.fill({ color: 0xFFD700, alpha: 0.15 });
  glow.circle(0, 0, radius * 0.3);
  glow.fill({ color: 0xFFE066, alpha: 0.12 });
  // Bright ring outline around island edge
  glow.circle(0, 0, radius * 0.95);
  glow.stroke({ color: 0xC8973E, width: 3, alpha: 0.6 });
  glow.circle(0, 0, radius * 1.05);
  glow.stroke({ color: 0xFFD700, width: 2, alpha: 0.3 });
  return glow;
}

// ─── Component ───

export function CityScene({ width, height, onSlotTap }: CitySceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buildings = useGameStore((s) => s.buildings);
  const titleLevel = useGameStore((s) => s.user.titleLevel);
  const userSilver = useGameStore((s) => s.user.silver);
  const userGold = useGameStore((s) => s.user.gold);

  const buildingsRef = useRef(buildings);
  const onSlotTapRef = useRef(onSlotTap);
  // Persist camera position & zoom across scene rebuilds (e.g. when building is constructed)
  const cameraRef = useRef<{ x: number; y: number; scale: number } | null>(null);

  useEffect(() => { buildingsRef.current = buildings; }, [buildings]);
  useEffect(() => { onSlotTapRef.current = onSlotTap; }, [onSlotTap]);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    let destroyed = false;
    let appInitialized = false;
    const app = new Application();

    // Particle arrays
    const coinParticles: CoinParticle[] = [];
    const smokeParticles: SmokeParticle[] = [];
    const sparkParticles: SparkParticle[] = [];
    const buildingEntries: BuildingEntry[] = [];
    const coinTimers: Map<number, number> = new Map();
    const smokeTimers: Map<number, number> = new Map();
    const sparkTimers: Map<number, number> = new Map();

    // Containers
    const worldContainer = new Container();
    const backgroundLayer = new Container();
    const islandLayer = new Container();
    const shadowLayer = new Container();
    const buildingLayer = new Container();
    const particleLayer = new Container();
    const uiIconLayer = new Container();

    // Water shader filter (applied to river container)
    let waterFilter: Filter | null = null;

    // Pan state (closure variables for 60fps)
    let isDragging = false;
    let lastPointerX = 0;
    let lastPointerY = 0;
    let velocityX = 0;
    let velocityY = 0;
    let dragDistance = 0;
    let dragStartTime = 0;

    // Zoom state (pinch-to-zoom)
    const MIN_SCALE = 0.55;
    const MAX_SCALE = 1.6;
    let worldScale = cameraRef.current?.scale ?? 1;
    let isPinching = false;
    let lastPinchDist = 0;
    let pinchCenterX = 0;
    let pinchCenterY = 0;

    // Initial camera position — restore previous position or center horizontally
    let worldX = cameraRef.current?.x ?? -(WORLD_WIDTH / 2 - width / 2);
    let worldY = cameraRef.current?.y ?? 80;

    // Plus icon references for pulsing
    const plusIcons: { gfx: Graphics; slot: CitySlot }[] = [];

    // Clamp world position with padding for HUD overlays (accounts for zoom)
    const HUD_TOP_PADDING = 120;    // space for income card at top
    const HUD_BOTTOM_PADDING = 80;  // space for collect button at bottom
    function clampWorld() {
      const scaledW = WORLD_WIDTH * worldScale;
      const scaledH = WORLD_HEIGHT * worldScale;
      const minX = -(scaledW - width);
      const maxX = 0;
      const minY = -(scaledH - height + HUD_BOTTOM_PADDING);
      const maxY = HUD_TOP_PADDING;
      // When zoomed out enough that world fits in viewport, center horizontally
      if (scaledW <= width) {
        worldX = (width - scaledW) / 2;
      } else {
        worldX = Math.max(minX, Math.min(maxX, worldX));
      }
      // Vertical: always respect HUD_TOP_PADDING so buildings aren't hidden behind TopBar
      if (scaledH <= height - HUD_TOP_PADDING) {
        // World fits below the HUD — push it down so top starts at HUD_TOP_PADDING
        worldY = HUD_TOP_PADDING;
      } else {
        worldY = Math.max(minY, Math.min(maxY, worldY));
      }
    }

    async function setup() {
      if (destroyed) return;

      await app.init({
        width,
        height,
        background: 0x120A04,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });

      if (destroyed) {
        try { app.destroy(true); } catch { /* */ }
        return;
      }

      appInitialized = true;
      el.appendChild(app.canvas);

      // Build world container hierarchy
      worldContainer.addChild(backgroundLayer);
      worldContainer.addChild(islandLayer);
      worldContainer.addChild(shadowLayer);
      worldContainer.addChild(buildingLayer);
      worldContainer.addChild(particleLayer);
      worldContainer.addChild(uiIconLayer);
      app.stage.addChild(worldContainer);

      // Set initial position and zoom
      worldContainer.scale.set(worldScale);
      clampWorld();
      worldContainer.x = worldX;
      worldContainer.y = worldY;

      // Setup pan/drag events (PixiJS pointer events)
      app.stage.eventMode = 'static';
      app.stage.hitArea = new Rectangle(0, 0, width, height);

      app.stage.on('pointerdown', (e) => {
        if (isPinching) return; // don't start drag during pinch
        isDragging = true;
        lastPointerX = e.global.x;
        lastPointerY = e.global.y;
        velocityX = 0;
        velocityY = 0;
        dragDistance = 0;
        dragStartTime = performance.now();
      });

      app.stage.on('pointermove', (e) => {
        if (!isDragging || isPinching) return;
        const dx = e.global.x - lastPointerX;
        const dy = e.global.y - lastPointerY;
        worldX += dx;
        worldY += dy;
        clampWorld();
        worldContainer.x = worldX;
        worldContainer.y = worldY;

        dragDistance += Math.abs(dx) + Math.abs(dy);
        velocityX = dx * 0.6;
        velocityY = dy * 0.6;
        lastPointerX = e.global.x;
        lastPointerY = e.global.y;
      });

      app.stage.on('pointerup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        if (isPinching) return; // don't fire tap after pinch
        const duration = performance.now() - dragStartTime;

        // Tap detection: small movement + short duration
        if (dragDistance < 12 && duration < 350) {
          handleTap(e.global.x, e.global.y);
        }
        // Otherwise momentum continues in ticker
      });

      app.stage.on('pointerupoutside', () => {
        isDragging = false;
      });

      // ─── Pinch-to-zoom (native touch events on canvas) ───
      const canvas = app.canvas;

      function getTouchDist(t1: Touch, t2: Touch): number {
        const dx = t1.clientX - t2.clientX;
        const dy = t1.clientY - t2.clientY;
        return Math.sqrt(dx * dx + dy * dy);
      }

      function getTouchCenter(t1: Touch, t2: Touch): { x: number; y: number } {
        return {
          x: (t1.clientX + t2.clientX) / 2,
          y: (t1.clientY + t2.clientY) / 2,
        };
      }

      function onTouchStart(e: TouchEvent) {
        if (e.touches.length === 2) {
          e.preventDefault();
          isPinching = true;
          isDragging = false;
          lastPinchDist = getTouchDist(e.touches[0], e.touches[1]);
          const center = getTouchCenter(e.touches[0], e.touches[1]);
          pinchCenterX = center.x;
          pinchCenterY = center.y;
        }
      }

      function onTouchMove(e: TouchEvent) {
        if (e.touches.length === 2 && isPinching) {
          e.preventDefault();
          const newDist = getTouchDist(e.touches[0], e.touches[1]);
          const center = getTouchCenter(e.touches[0], e.touches[1]);

          // Zoom factor from pinch distance change
          const scaleFactor = newDist / lastPinchDist;
          const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, worldScale * scaleFactor));

          if (newScale !== worldScale) {
            // Zoom toward pinch center:
            // Convert screen center to world coords, then adjust position
            const screenCX = pinchCenterX;
            const screenCY = pinchCenterY;
            // World point under the pinch center (before zoom)
            const worldPtX = (screenCX - worldX) / worldScale;
            const worldPtY = (screenCY - worldY) / worldScale;

            worldScale = newScale;
            worldContainer.scale.set(worldScale);

            // After zoom, keep the same world point under the pinch center
            worldX = screenCX - worldPtX * worldScale;
            worldY = screenCY - worldPtY * worldScale;
            clampWorld();
            worldContainer.x = worldX;
            worldContainer.y = worldY;
          }

          // Also pan with two-finger drag
          const panDx = center.x - pinchCenterX;
          const panDy = center.y - pinchCenterY;
          if (Math.abs(panDx) > 0.5 || Math.abs(panDy) > 0.5) {
            worldX += panDx;
            worldY += panDy;
            clampWorld();
            worldContainer.x = worldX;
            worldContainer.y = worldY;
          }

          lastPinchDist = newDist;
          pinchCenterX = center.x;
          pinchCenterY = center.y;
        }
      }

      function onTouchEnd(e: TouchEvent) {
        if (e.touches.length < 2) {
          isPinching = false;
        }
      }

      canvas.addEventListener('touchstart', onTouchStart, { passive: false });
      canvas.addEventListener('touchmove', onTouchMove, { passive: false });
      canvas.addEventListener('touchend', onTouchEnd, { passive: false });

      // Store cleanup for pinch listeners
      (canvas as HTMLCanvasElement & { _pinchCleanup?: () => void })._pinchCleanup = () => {
        canvas.removeEventListener('touchstart', onTouchStart);
        canvas.removeEventListener('touchmove', onTouchMove);
        canvas.removeEventListener('touchend', onTouchEnd);
      };

      // Draw terrain
      drawTerrain();

      // Draw islands and load buildings
      await drawIslandsAndBuildings();

      if (destroyed) return;

      // Ticker
      app.ticker.add((ticker) => {
        if (destroyed) return;
        const dt = ticker.deltaTime;
        const time = performance.now() / 1000;

        // Momentum deceleration
        if (!isDragging && (Math.abs(velocityX) > 0.1 || Math.abs(velocityY) > 0.1)) {
          worldX += velocityX;
          worldY += velocityY;
          velocityX *= 0.92;
          velocityY *= 0.92;
          clampWorld();
          worldContainer.x = worldX;
          worldContainer.y = worldY;
        }

        // Animated water shader
        if (waterFilter) updateWaterFilter(waterFilter, dt);

        // Building animations
        updateBuildingAnimations(time);

        // Plus icon pulsing
        for (const icon of plusIcons) {
          icon.gfx.alpha = 0.5 + 0.4 * Math.sin(time * 2 + icon.slot.index * 0.8);
        }

        // Particles
        spawnParticles(dt);
        updateCoinParticles(dt);
        updateSmokeParticles(dt);
        updateSparkParticles(dt, time);
      });
    }

    function handleTap(screenX: number, screenY: number) {
      // Convert screen coordinates to world coordinates (accounting for zoom)
      const wx = (screenX - worldX) / worldScale;
      const wy = (screenY - worldY) / worldScale;

      const currentBuildings = buildingsRef.current;
      const buildingMap = new Map(currentBuildings.map(b => [b.slotIndex, b]));

      // Check each slot (occupied or empty)
      for (const slot of CITY_SLOTS) {
        if (slot.unlockTitleLevel > titleLevel) continue; // locked
        const dx = wx - slot.x;
        const dy = wy - slot.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < ISLAND_RADIUS * slot.scale) {
          const building = buildingMap.get(slot.index) || null;
          onSlotTapRef.current(slot.index, building);
          return;
        }
      }
    }

    function drawTerrain() {
      // ─── 1. Noise-generated terrain texture (computed once) ───
      const terrainCanvas = generateTerrainCanvas();
      const terrainTexture = Texture.from(terrainCanvas);
      const terrainSprite = new Sprite(terrainTexture);
      backgroundLayer.addChild(terrainSprite);

      // ─── 2. Rivers (bezier curves over noise terrain) ───
      const river = new Graphics();
      for (const seg of RIVER_SEGMENTS) {
        // Wide dark base
        river.moveTo(seg.x1, seg.y1);
        river.bezierCurveTo(seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x2, seg.y2);
        river.stroke({ color: 0x1A2A3A, width: seg.width, alpha: 0.3 });
        // Brighter center highlight
        river.moveTo(seg.x1, seg.y1);
        river.bezierCurveTo(seg.cx1, seg.cy1, seg.cx2, seg.cy2, seg.x2, seg.y2);
        river.stroke({ color: 0x253848, width: seg.width * 0.45, alpha: 0.25 });
        // Subtle specular line
        river.moveTo(seg.x1, seg.y1 - 1);
        river.bezierCurveTo(seg.cx1, seg.cy1 - 1, seg.cx2, seg.cy2 - 1, seg.x2, seg.y2 - 1);
        river.stroke({ color: 0x3A5A70, width: 1.5, alpha: 0.12 });
      }
      // Apply animated water shader to rivers
      try {
        waterFilter = createWaterFilter();
        river.filters = [waterFilter];
      } catch {
        // GLSL shader may not be supported on all devices — fall back to no filter
      }
      backgroundLayer.addChild(river);

      // ─── 3. Dirt roads between islands ───
      const roads = new Graphics();
      for (const [a, b] of ISLAND_PATHS) {
        const sa = CITY_SLOTS[a];
        const sb = CITY_SLOTS[b];
        if (!sa || !sb) continue;
        const mx = (sa.x + sb.x) / 2 + Math.sin(a + b) * 25;
        const my = (sa.y + sb.y) / 2 + Math.cos(a * b) * 18;
        // Road shadow
        roads.moveTo(sa.x, sa.y);
        roads.quadraticCurveTo(mx, my + 2, sb.x, sb.y);
        roads.stroke({ color: 0x000000, width: 12, alpha: 0.1 });
        // Road body
        roads.moveTo(sa.x, sa.y);
        roads.quadraticCurveTo(mx, my, sb.x, sb.y);
        roads.stroke({ color: 0x3A2D1A, width: 8, alpha: 0.45 });
        // Road lighter edge
        roads.moveTo(sa.x, sa.y);
        roads.quadraticCurveTo(mx, my, sb.x, sb.y);
        roads.stroke({ color: 0x4A3D2A, width: 10, alpha: 0.1 });
      }
      backgroundLayer.addChild(roads);

      // ─── 4. Scattered trees (avoid islands + roads) ───
      const trees = new Graphics();
      const treeRng = seededRandom(333);
      for (let i = 0; i < 160; i++) {
        const x = treeRng() * WORLD_WIDTH;
        const y = treeRng() * WORLD_HEIGHT;
        // Skip if too close to any island center
        let tooClose = false;
        for (const s of CITY_SLOTS) {
          const dx = x - s.x, dy = y - s.y;
          if (Math.sqrt(dx * dx + dy * dy) < ISLAND_RADIUS * s.scale + 25) {
            tooClose = true;
            break;
          }
        }
        if (tooClose) continue;
        const size = 3 + treeRng() * 6;
        const shade = treeRng();
        // Tree crown (larger, more visible over noise terrain)
        trees.circle(x, y, size);
        trees.fill({
          color: shade < 0.4 ? 0x1E3012 : shade < 0.7 ? 0x2B3B18 : 0x263516,
          alpha: 0.3 + treeRng() * 0.15,
        });
        // Darker center dot
        trees.circle(x, y - 1, size * 0.45);
        trees.fill({ color: 0x0E1A06, alpha: 0.2 });
        // Highlight edge
        if (treeRng() > 0.5) {
          trees.circle(x + size * 0.3, y - size * 0.3, size * 0.25);
          trees.fill({ color: 0x3A4D28, alpha: 0.15 });
        }
      }
      backgroundLayer.addChild(trees);

      // ─── 5. Atmospheric fog patches ───
      const fog = new Graphics();
      const fogPatches = [
        { x: 200, y: 400, r: 200 },
        { x: 600, y: 700, r: 220 },
        { x: 400, y: 1100, r: 180 },
        { x: 100, y: 900, r: 160 },
        { x: 750, y: 300, r: 170 },
        { x: 450, y: 200, r: 150 },
      ];
      for (const f of fogPatches) {
        for (let ring = 4; ring >= 1; ring--) {
          fog.circle(f.x, f.y, f.r * (ring / 4));
          fog.fill({ color: 0x1A1208, alpha: 0.02 * (1 - ring / 5) });
        }
      }
      backgroundLayer.addChild(fog);
    }

    async function drawIslandsAndBuildings() {
      const currentBuildings = buildingsRef.current;
      const buildingMap = new Map(currentBuildings.map(b => [b.slotIndex, b]));

      for (const slot of CITY_SLOTS) {
        const building = buildingMap.get(slot.index);
        const isUnlocked = slot.unlockTitleLevel <= titleLevel;
        const isOccupied = building != null;

        // Draw island
        const islandGfx = new Graphics();
        drawIslandBlob(islandGfx, slot.x, slot.y, ISLAND_RADIUS * slot.scale, slot.islandSeed, isOccupied);
        if (!isUnlocked) {
          islandGfx.alpha = 0.3;
        }
        islandLayer.addChild(islandGfx);

        if (!isUnlocked) {
          // Draw lock icon
          const lock = new Graphics();
          drawLockIcon(lock, slot.x, slot.y);
          uiIconLayer.addChild(lock);
          continue;
        }

        if (!isOccupied) {
          // Draw "+" icon for empty unlocked slot
          const plus = new Graphics();
          drawPlusIcon(plus, slot.x, slot.y - 5);
          uiIconLayer.addChild(plus);
          plusIcons.push({ gfx: plus, slot });
          continue;
        }

        // Load and place building sprite
        const def = getBuildingById(building.id);
        if (!def) continue;

        const url = getAssetUrl(def.assetKey);
        if (!url) continue;

        // Building glow (ambient)
        const color = getParticleColor(building.level);
        const glow = new Graphics();
        const glowRadius = ISLAND_RADIUS * slot.scale * 0.8;
        for (let i = 5; i >= 1; i--) {
          const r = glowRadius * (i / 5);
          const a = 0.03 * (1 - i / 5) + 0.008;
          glow.circle(slot.x, slot.y, r);
          glow.fill({ color, alpha: a });
        }
        shadowLayer.addChild(glow);

        // Upgrade-ready glow
        let upgradeGlow: Graphics | null = null;
        const canUpgrade = building.level < (def.maxLevel || 15)
          && !building.cooldownUntil
          && (() => {
            const nextCost = getBuildingCost(def, building.level + 1);
            const currency = building.level + 1 <= 10 ? 'silver' : 'gold';
            return currency === 'silver' ? userSilver >= nextCost : userGold >= nextCost;
          })();
        if (canUpgrade) {
          upgradeGlow = createUpgradeGlow(ISLAND_RADIUS * slot.scale);
          upgradeGlow.x = slot.x;
          upgradeGlow.y = slot.y;
          shadowLayer.addChild(upgradeGlow);
        }

        // Load sprite
        let sprite: Sprite;
        try {
          const texture = await Assets.load(url);
          if (destroyed) return;
          sprite = new Sprite(texture);
        } catch {
          continue;
        }

        const buildingSize = 85 * slot.scale;
        const levelScale = 1 + building.level * 0.008;
        sprite.anchor.set(0.5, 0.7);
        sprite.width = buildingSize * levelScale;
        sprite.height = buildingSize * levelScale;
        sprite.x = slot.x;
        sprite.y = slot.y;
        buildingLayer.addChild(sprite);

        buildingEntries.push({
          sprite,
          glow,
          upgradeGlow,
          baseX: slot.x,
          baseY: slot.y,
          phaseOffset: slot.index * 1.1 + slot.islandSeed * 0.001,
          building,
          def,
          slot,
        });

        coinTimers.set(slot.index, 0);
        smokeTimers.set(slot.index, 0);
        sparkTimers.set(slot.index, 0);
      }
    }

    function updateBuildingAnimations(time: number) {
      for (const entry of buildingEntries) {
        // Bob
        const bobAmount = 2 + entry.building.level * 0.08;
        entry.sprite.y = entry.baseY + Math.sin(time * 1.2 + entry.phaseOffset) * bobAmount;

        // Glow pulse
        const glowPulse = 0.6 + 0.4 * Math.sin(time * 0.8 + entry.phaseOffset * 0.7);
        entry.glow.alpha = glowPulse;

        // Rotation wobble
        entry.sprite.rotation = entry.slot.rotation + Math.sin(time * 0.6 + entry.phaseOffset) * 0.012;

        // Scale breathing
        const breathe = 1 + Math.sin(time * 0.9 + entry.phaseOffset) * 0.008;
        const buildingSize = 85 * entry.slot.scale;
        const levelScale = 1 + entry.building.level * 0.008;
        entry.sprite.width = buildingSize * levelScale * breathe;
        entry.sprite.height = buildingSize * levelScale * breathe;

        // Upgrade-ready glow pulse (bright, breathing)
        if (entry.upgradeGlow) {
          const upgradePulse = 0.6 + 0.4 * Math.sin(time * 2.5 + entry.phaseOffset);
          entry.upgradeGlow.alpha = upgradePulse;
          // Scale breathing — glow expands and contracts
          const glowBreathe = 1 + 0.08 * Math.sin(time * 2.5 + entry.phaseOffset);
          entry.upgradeGlow.scale.set(glowBreathe);
          entry.upgradeGlow.y = entry.sprite.y;
        }
      }
    }

    function spawnParticles(dt: number) {
      const msPerFrame = dt * (1000 / 60);

      for (const entry of buildingEntries) {
        const idx = entry.slot.index;
        const px = entry.sprite.x;
        const py = entry.sprite.y;
        const color = getParticleColor(entry.building.level);

        // Coin particles
        if (entry.building.income > 0) {
          const t = (coinTimers.get(idx) ?? 0) + msPerFrame;
          coinTimers.set(idx, t);
          const interval = Math.max(500, 2500 - entry.building.income * 2);
          if (t >= interval) {
            coinTimers.set(idx, 0);
            const coin = createCoinParticleColored(px, py - 30, color);
            particleLayer.addChild(coin.gfx);
            coinParticles.push(coin);
          }
        }

        // Smoke (sparse)
        const st = (smokeTimers.get(idx) ?? 0) + msPerFrame;
        smokeTimers.set(idx, st);
        if (st >= 2000 + Math.random() * 500) {
          smokeTimers.set(idx, 0);
          const smoke = createSmokeParticleCity(px + randomRange(-10, 10), py - 35);
          particleLayer.addChild(smoke.gfx);
          smokeParticles.push(smoke);
        }

        // Sparkle particles (orbit around building, colored by level)
        const spt = (sparkTimers.get(idx) ?? 0) + msPerFrame;
        sparkTimers.set(idx, spt);
        const sparkInterval = Math.max(600, 3000 - entry.building.level * 100);
        if (spt >= sparkInterval) {
          sparkTimers.set(idx, 0);
          const sparkColor = getSparkleColor(entry.building.level);
          const spark = createSparkParticle(px, py - 15, sparkColor);
          particleLayer.addChild(spark.gfx);
          sparkParticles.push(spark);
        }
      }
    }

    function createCoinParticleColored(x: number, y: number, color: number): CoinParticle {
      const gfx = new Graphics();
      const scale = randomRange(0.3, 0.7);
      const radius = 3 * scale;
      gfx.circle(0, 0, radius);
      gfx.fill({ color, alpha: 0.85 });
      gfx.circle(0, 0, radius * 0.5);
      gfx.fill({ color: 0xFFFFFF, alpha: 0.3 });
      gfx.x = x + randomRange(-12, 12);
      gfx.y = y;
      return {
        gfx,
        vx: randomRange(-0.25, 0.25),
        vy: -randomRange(0.4, 1.0),
        life: 2000,
        maxLife: 2000,
      };
    }

    function createSmokeParticleCity(x: number, y: number): SmokeParticle {
      const gfx = new Graphics();
      const radius = randomRange(2, 4);
      gfx.circle(0, 0, radius);
      gfx.fill({ color: SMOKE_PARTICLE.color, alpha: SMOKE_PARTICLE.alpha });
      gfx.x = x;
      gfx.y = y;
      return {
        gfx,
        vx: randomRange(-0.12, 0.12),
        vy: -randomRange(0.2, 0.4),
        life: 2500,
        maxLife: 2500,
        startAlpha: SMOKE_PARTICLE.alpha,
      };
    }

    function createSparkParticle(cx: number, cy: number, color: number): SparkParticle {
      const gfx = new Graphics();
      gfx.circle(0, 0, randomRange(1, 2.5));
      gfx.fill({ color, alpha: 0.8 });
      const angle = Math.random() * Math.PI * 2;
      const dist = randomRange(15, 40);
      gfx.x = cx + Math.cos(angle) * dist;
      gfx.y = cy + Math.sin(angle) * dist * 0.7;
      return {
        gfx,
        angle,
        dist,
        speed: randomRange(0.3, 0.8),
        life: 1500,
        maxLife: 1500,
        centerX: cx,
        centerY: cy,
      };
    }

    function updateCoinParticles(dt: number) {
      const ms = dt * (1000 / 60);
      for (let i = coinParticles.length - 1; i >= 0; i--) {
        const p = coinParticles[i];
        p.life -= ms;
        if (p.life <= 0) {
          particleLayer.removeChild(p.gfx);
          p.gfx.destroy();
          coinParticles.splice(i, 1);
          continue;
        }
        const progress = 1 - p.life / p.maxLife;
        p.gfx.x += p.vx * dt;
        p.gfx.y += p.vy * dt;
        if (progress > 0.7) p.gfx.alpha = (1 - progress) / 0.3;
        p.vx += Math.sin(performance.now() / 500 + i) * 0.008;
      }
    }

    function updateSmokeParticles(dt: number) {
      const ms = dt * (1000 / 60);
      for (let i = smokeParticles.length - 1; i >= 0; i--) {
        const p = smokeParticles[i];
        p.life -= ms;
        if (p.life <= 0) {
          particleLayer.removeChild(p.gfx);
          p.gfx.destroy();
          smokeParticles.splice(i, 1);
          continue;
        }
        const progress = 1 - p.life / p.maxLife;
        p.gfx.x += p.vx * dt;
        p.gfx.y += p.vy * dt;
        p.gfx.scale.set(1 + progress * 1.5);
        p.gfx.alpha = p.startAlpha * (1 - progress);
      }
    }

    function updateSparkParticles(dt: number, time: number) {
      const ms = dt * (1000 / 60);
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.life -= ms;
        if (p.life <= 0) {
          particleLayer.removeChild(p.gfx);
          p.gfx.destroy();
          sparkParticles.splice(i, 1);
          continue;
        }
        const progress = 1 - p.life / p.maxLife;
        // Orbit around center
        p.angle += p.speed * dt * 0.03;
        p.gfx.x = p.centerX + Math.cos(p.angle) * p.dist;
        p.gfx.y = p.centerY + Math.sin(p.angle) * p.dist * 0.7;
        // Twinkle
        p.gfx.alpha = (0.5 + 0.5 * Math.sin(time * 8 + i * 2)) * (1 - progress);
      }
    }

    setup().catch(() => { /* init aborted */ });

    return () => {
      destroyed = true;

      // Save camera position + zoom for seamless restore after rebuild
      cameraRef.current = { x: worldX, y: worldY, scale: worldScale };

      // Clean up pinch-to-zoom touch listeners
      if (appInitialized) {
        const canvas = app.canvas as HTMLCanvasElement & { _pinchCleanup?: () => void };
        canvas._pinchCleanup?.();
      }

      for (const p of coinParticles) { try { p.gfx.destroy(); } catch { /* */ } }
      coinParticles.length = 0;
      for (const p of smokeParticles) { try { p.gfx.destroy(); } catch { /* */ } }
      smokeParticles.length = 0;
      for (const p of sparkParticles) { try { p.gfx.destroy(); } catch { /* */ } }
      sparkParticles.length = 0;
      buildingEntries.length = 0;
      plusIcons.length = 0;

      if (appInitialized) {
        try { app.destroy(true, { children: true }); } catch { /* */ }
      }
      while (el.firstChild) {
        el.removeChild(el.firstChild);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height, buildings.length, buildings.map(b => `${b.id}:${b.level}:${b.slotIndex}`).join(','), titleLevel]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        overflow: 'hidden',
        touchAction: 'none',
      }}
    />
  );
}
