/**
 * HOLOP Interactive City — Slot Layout & Configuration
 * 16 organic island slots for the city map.
 */

export const WORLD_WIDTH = 900;
export const WORLD_HEIGHT = 1400;
export const ISLAND_RADIUS = 65;

export interface CitySlot {
  index: number;
  x: number;
  y: number;
  scale: number;
  rotation: number;
  unlockTitleLevel: number;
  islandSeed: number;
}

// Organic village layout — staggered rows, no rigid grid
export const CITY_SLOTS: CitySlot[] = [
  // Row 1 — starting slots (title 1)
  { index: 0,  x: 180, y: 140,  scale: 1.10, rotation: -0.03, unlockTitleLevel: 1, islandSeed: 142 },
  { index: 1,  x: 420, y: 105,  scale: 1.00, rotation:  0.02, unlockTitleLevel: 1, islandSeed: 287 },
  { index: 2,  x: 660, y: 150,  scale: 0.95, rotation: -0.01, unlockTitleLevel: 1, islandSeed: 531 },
  // Row 2
  { index: 3,  x: 300, y: 300,  scale: 1.05, rotation:  0.04, unlockTitleLevel: 1, islandSeed: 673 },
  { index: 4,  x: 570, y: 320,  scale: 0.90, rotation: -0.02, unlockTitleLevel: 1, islandSeed: 819 },
  // Row 3 — title 3
  { index: 5,  x: 150, y: 490,  scale: 1.00, rotation:  0.01, unlockTitleLevel: 3, islandSeed: 156 },
  { index: 6,  x: 440, y: 470,  scale: 1.08, rotation: -0.04, unlockTitleLevel: 3, islandSeed: 394 },
  { index: 7,  x: 700, y: 510,  scale: 0.92, rotation:  0.03, unlockTitleLevel: 3, islandSeed: 728 },
  // Row 4 — title 5
  { index: 8,  x: 260, y: 670,  scale: 1.05, rotation: -0.02, unlockTitleLevel: 5, islandSeed: 445 },
  { index: 9,  x: 560, y: 690,  scale: 0.98, rotation:  0.01, unlockTitleLevel: 5, islandSeed: 612 },
  // Row 5 — title 7
  { index: 10, x: 170, y: 860,  scale: 0.95, rotation:  0.03, unlockTitleLevel: 7, islandSeed: 203 },
  { index: 11, x: 450, y: 840,  scale: 1.12, rotation: -0.01, unlockTitleLevel: 7, islandSeed: 567 },
  { index: 12, x: 680, y: 870,  scale: 1.00, rotation:  0.02, unlockTitleLevel: 7, islandSeed: 891 },
  // Row 6 — title 9
  { index: 13, x: 300, y: 1060, scale: 1.05, rotation: -0.03, unlockTitleLevel: 9, islandSeed: 334 },
  { index: 14, x: 550, y: 1040, scale: 0.95, rotation:  0.04, unlockTitleLevel: 9, islandSeed: 756 },
  { index: 15, x: 420, y: 1220, scale: 1.08, rotation: -0.02, unlockTitleLevel: 9, islandSeed: 489 },
];

// Path connections between nearby islands (for drawing dirt paths)
export const ISLAND_PATHS: [number, number][] = [
  [0, 1], [1, 2], [0, 3], [1, 3], [2, 4], [3, 4],
  [3, 6], [0, 5], [5, 6], [6, 7], [4, 7],
  [5, 8], [6, 8], [6, 9], [7, 9],
  [8, 10], [8, 11], [9, 11], [9, 12],
  [10, 13], [11, 13], [11, 14], [12, 14],
  [13, 15], [14, 15],
];

// Level-based particle color tiers
const PARTICLE_COLORS: { maxLevel: number; color: number }[] = [
  { maxLevel: 3,  color: 0xCD7F32 }, // Bronze
  { maxLevel: 6,  color: 0xC0C0C0 }, // Silver
  { maxLevel: 9,  color: 0xC8973E }, // Gold
  { maxLevel: 12, color: 0x50C878 }, // Emerald
  { maxLevel: 15, color: 0xE0E8FF }, // Diamond/white
];

export function getParticleColor(level: number): number {
  for (const tier of PARTICLE_COLORS) {
    if (level <= tier.maxLevel) return tier.color;
  }
  return 0xE0E8FF;
}

// Secondary sparkle color (lighter variant for variety)
const SPARKLE_COLORS: { maxLevel: number; color: number }[] = [
  { maxLevel: 3,  color: 0xE8A850 }, // Light bronze
  { maxLevel: 6,  color: 0xE0E0E0 }, // Light silver
  { maxLevel: 9,  color: 0xFFD700 }, // Bright gold
  { maxLevel: 12, color: 0x7DFFB0 }, // Light emerald
  { maxLevel: 15, color: 0xFFFFFF }, // Pure white
];

export function getSparkleColor(level: number): number {
  for (const tier of SPARKLE_COLORS) {
    if (level <= tier.maxLevel) return tier.color;
  }
  return 0xFFFFFF;
}

// Get all unlocked slots for a given title level
export function getUnlockedSlots(titleLevel: number): CitySlot[] {
  return CITY_SLOTS.filter(s => s.unlockTitleLevel <= titleLevel);
}

// Find the first free unlocked slot
export function findFreeSlot(occupiedSlotIndices: number[], titleLevel: number): number | null {
  for (const slot of CITY_SLOTS) {
    if (slot.unlockTitleLevel <= titleLevel && !occupiedSlotIndices.includes(slot.index)) {
      return slot.index;
    }
  }
  return null;
}

// Seeded pseudo-random for deterministic island shapes
export function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}
