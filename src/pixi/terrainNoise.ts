/**
 * HOLOP — Procedural Noise Terrain Generator
 * Generates a rich terrain texture using Simplex noise + Whittaker-style biome mapping.
 * Renders to an offscreen canvas once, then used as a Sprite texture in CityScene.
 */

import { createNoise2D } from 'simplex-noise';
import alea from 'alea';
import { WORLD_WIDTH, WORLD_HEIGHT, CITY_SLOTS, ISLAND_RADIUS } from '@/config/cityLayout';

// ─── Biome color palette (warm medieval parchment tones) ───

interface BiomeColor {
  r: number;
  g: number;
  b: number;
}

const BIOME_COLORS: Record<string, BiomeColor> = {
  DEEP_WATER:     { r: 25,  g: 40,  b: 55 },   // dark river depth
  SHALLOW_WATER:  { r: 35,  g: 55,  b: 70 },   // murky shallows
  MARSH:          { r: 30,  g: 42,  b: 28 },   // swampy dark green
  SAND:           { r: 50,  g: 40,  b: 25 },   // dirt/clearing
  STEPPE:         { r: 42,  g: 35,  b: 20 },   // dry grassland
  FIELD:          { r: 48,  g: 40,  b: 22 },   // plowed field (warmer)
  GRASSLAND:      { r: 38,  g: 42,  b: 22 },   // meadow
  FOREST_LIGHT:   { r: 28,  g: 38,  b: 18 },   // birch grove
  FOREST_DENSE:   { r: 20,  g: 32,  b: 14 },   // deep pine forest
  HILL:           { r: 45,  g: 36,  b: 24 },   // rocky elevation
  HIGHLAND:       { r: 38,  g: 30,  b: 20 },   // bare highland
};

// ─── Whittaker-style biome classification ───

function getBiome(elevation: number, moisture: number): string {
  // Water zones
  if (elevation < 0.12) return 'DEEP_WATER';
  if (elevation < 0.18) return 'SHALLOW_WATER';
  if (elevation < 0.22 && moisture > 0.55) return 'MARSH';
  if (elevation < 0.22) return 'SAND';

  // Highlands
  if (elevation > 0.78) return 'HIGHLAND';
  if (elevation > 0.65) return moisture > 0.45 ? 'FOREST_DENSE' : 'HILL';

  // Mid elevations — most of the map
  if (moisture < 0.25) return 'STEPPE';
  if (moisture < 0.40) return 'FIELD';
  if (moisture < 0.55) return 'GRASSLAND';
  if (moisture < 0.72) return 'FOREST_LIGHT';
  return 'FOREST_DENSE';
}

// ─── Fractal Brownian Motion ───

type Noise2D = (x: number, y: number) => number;

function fbm(
  noise: Noise2D,
  x: number,
  y: number,
  octaves = 5,
  lacunarity = 2.0,
  persistence = 0.5,
): number {
  let value = 0;
  let amplitude = 1.0;
  let frequency = 1.0;
  let maxValue = 0;

  for (let i = 0; i < octaves; i++) {
    value += amplitude * noise(x * frequency, y * frequency);
    maxValue += amplitude;
    amplitude *= persistence;
    frequency *= lacunarity;
  }

  return value / maxValue; // normalize to [-1, 1]
}

// ─── Color utilities ───

function lerpColor(a: BiomeColor, b: BiomeColor, t: number): BiomeColor {
  return {
    r: Math.round(a.r + (b.r - a.r) * t),
    g: Math.round(a.g + (b.g - a.g) * t),
    b: Math.round(a.b + (b.b - a.b) * t),
  };
}

function clamp(v: number, min: number, max: number): number {
  return v < min ? min : v > max ? max : v;
}

// ─── Main terrain texture generator ───

export function generateTerrainCanvas(seed = 'holop-terrain-v2'): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = WORLD_WIDTH;
  canvas.height = WORLD_HEIGHT;
  const ctx = canvas.getContext('2d')!;
  const imageData = ctx.createImageData(WORLD_WIDTH, WORLD_HEIGHT);
  const data = imageData.data;

  // Create noise functions with different seeds
  const elevationNoise = createNoise2D(alea(seed + '-elevation'));
  const moistureNoise = createNoise2D(alea(seed + '-moisture'));
  const detailNoise = createNoise2D(alea(seed + '-detail'));
  const grainNoise = createNoise2D(alea(seed + '-grain'));

  // Feature scales (in world pixels)
  const ELEV_SCALE = 220;   // large terrain features
  const MOIST_SCALE = 280;  // moisture zones (slightly larger)
  const DETAIL_SCALE = 40;  // fine surface detail

  // Pre-compute island exclusion zones (soften terrain near islands)
  const islandCenters = CITY_SLOTS.map(s => ({
    x: s.x,
    y: s.y,
    r: ISLAND_RADIUS * s.scale + 15, // margin around islands
  }));

  for (let y = 0; y < WORLD_HEIGHT; y++) {
    for (let x = 0; x < WORLD_WIDTH; x++) {
      const nx = x / ELEV_SCALE;
      const ny = y / ELEV_SCALE;
      const mx = x / MOIST_SCALE;
      const my = y / MOIST_SCALE;

      // Raw elevation: 5-octave fBm, redistributed with power curve
      let elev = (fbm(elevationNoise, nx, ny, 5, 2.0, 0.5) + 1) / 2; // [0, 1]
      elev = Math.pow(elev * 1.1, 1.8); // flatten valleys, emphasize hills
      elev = clamp(elev, 0, 1);

      // Distance from edges — encourage water near borders
      const edgeFadeX = Math.min(x, WORLD_WIDTH - x) / 120;
      const edgeFadeY = Math.min(y, WORLD_HEIGHT - y) / 120;
      const edgeFade = clamp(Math.min(edgeFadeX, edgeFadeY), 0, 1);
      elev *= (0.5 + 0.5 * edgeFade); // push edges toward water

      // Moisture: independent noise
      let moist = (fbm(moistureNoise, mx + 10, my + 10, 4, 2.0, 0.55) + 1) / 2;
      moist = clamp(moist, 0, 1);

      // Small-scale jitter for organic biome boundaries
      const jitter = detailNoise(x / 30, y / 30) * 0.06;

      // Get biome
      const biome = getBiome(elev + jitter, moist + jitter);
      let color = BIOME_COLORS[biome] || BIOME_COLORS.GRASSLAND;

      // Biome blending: lerp with neighbor biome for softer transitions
      const biome2 = getBiome(elev + jitter + 0.04, moist + jitter);
      if (biome2 !== biome) {
        const neighbor = BIOME_COLORS[biome2] || BIOME_COLORS.GRASSLAND;
        color = lerpColor(color, neighbor, 0.3);
      }

      // Fine detail noise — adds organic surface variation
      const detail = detailNoise(x / DETAIL_SCALE, y / DETAIL_SCALE) * 6;

      // Paper grain — very fine noise for parchment texture
      const grain = grainNoise(x * 0.15, y * 0.15) * 3;

      // Elevation shading — lighter on hills, darker in valleys
      const shading = (elev - 0.4) * 15;

      // Compute final pixel color
      let r = color.r + detail + grain + shading;
      let g = color.g + detail + grain + shading;
      let b = color.b + detail * 0.5 + grain + shading * 0.6;

      // Darken near island edges (subtle vignette around settlements)
      let minIslandDist = 9999;
      for (const ic of islandCenters) {
        const dx = x - ic.x;
        const dy = y - ic.y;
        const d = Math.sqrt(dx * dx + dy * dy) - ic.r;
        if (d < minIslandDist) minIslandDist = d;
      }
      if (minIslandDist < 30 && minIslandDist > 0) {
        // Subtle warm ring near islands
        const ringFactor = 1 - (minIslandDist / 30);
        r += ringFactor * 8;
        g += ringFactor * 5;
        b += ringFactor * 2;
      }

      // Clamp to valid byte range
      r = clamp(Math.round(r), 0, 255);
      g = clamp(Math.round(g), 0, 255);
      b = clamp(Math.round(b), 0, 255);

      const idx = (y * WORLD_WIDTH + x) * 4;
      data[idx] = r;
      data[idx + 1] = g;
      data[idx + 2] = b;
      data[idx + 3] = 255;
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

// ─── River path data (exported for water shader overlay) ───

export interface RiverSegment {
  x1: number; y1: number;
  cx1: number; cy1: number;
  cx2: number; cy2: number;
  x2: number; y2: number;
  width: number;
}

export const RIVER_SEGMENTS: RiverSegment[] = [
  // Main river
  { x1: 0, y1: 380, cx1: 120, cy1: 350, cx2: 200, cy2: 420, x2: 320, y2: 400, width: 22 },
  { x1: 320, y1: 400, cx1: 430, cy1: 380, cx2: 480, cy2: 440, x2: 550, y2: 460, width: 20 },
  { x1: 550, y1: 460, cx1: 650, cy1: 490, cx2: 750, cy2: 470, x2: 900, y2: 520, width: 18 },
  // Branch
  { x1: 320, y1: 400, cx1: 340, cy1: 500, cx2: 280, cy2: 600, x2: 300, y2: 720, width: 14 },
  { x1: 300, y1: 720, cx1: 310, cy1: 800, cx2: 350, cy2: 900, x2: 380, y2: 1000, width: 12 },
];
