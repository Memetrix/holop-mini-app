/**
 * HOLOP Building Definitions
 * All 21 buildings with costs, incomes, and formulas.
 * Synced with bot: github.com/VSemenchuk/holop (game_config.py ESTATES)
 */

import type { Building } from '@/store/types';

// ─── Building Categories ───
export type BuildingCategory = 'income' | 'premium' | 'gold' | 'social';
export type BuildingCurrency = 'silver' | 'gold' | 'stars' | 'free';

// ─── Building Definition ───
export interface BuildingDef {
  id: string;
  nameRu: string;
  nameEn: string;
  baseCost: number;
  baseIncome: number;
  costMultiplier: number;
  incomeMultiplier: number;
  maxLevel: number;
  tier: number | 'premium' | 'gold' | 'social';
  category: BuildingCategory;
  currency: BuildingCurrency;
  assetKey: string;
  // Premium/Gold fields
  starsPrice?: number;
  goldPrice?: number;
  noLevel?: boolean;
  // Bonuses
  bonus?: Record<string, number | boolean | string>;
  // Prerequisites: {building_id: min_level}
  requires?: Record<string, number>;
  // Social building requirements
  requiresSubscription?: boolean;
  requiresReferrals?: boolean;
  referralLevels?: Record<number, number>;
}

// ─── Income Buildings (12) — purchased with silver, tiers 1-5 ───

export const BUILDINGS: BuildingDef[] = [
  // ── Tier 1 ──
  {
    id: 'izba',
    nameRu: 'Изба',
    nameEn: 'Hut',
    baseCost: 200,
    baseIncome: 8,
    costMultiplier: 1.6,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 1,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/izba',
  },
  {
    id: 'pashnya',
    nameRu: 'Пашня',
    nameEn: 'Arable Land',
    baseCost: 500,
    baseIncome: 15,
    costMultiplier: 1.6,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 1,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/pashnya',
  },
  {
    id: 'ambar',
    nameRu: 'Амбар',
    nameEn: 'Barn',
    baseCost: 1000,
    baseIncome: 20,
    costMultiplier: 1.6,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 1,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/ambar',
    requires: { pashnya: 2 },
  },

  // ── Tier 2 ──
  {
    id: 'melnitsa',
    nameRu: 'Мельница',
    nameEn: 'Mill',
    baseCost: 2000,
    baseIncome: 30,
    costMultiplier: 1.7,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 2,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/melnitsa',
    requires: { pashnya: 3 },
  },
  {
    id: 'konyushni',
    nameRu: 'Конюшни',
    nameEn: 'Stables',
    baseCost: 4000,
    baseIncome: 40,
    costMultiplier: 1.7,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 2,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/konyushni',
    requires: { kuznitsa: 2 },
  },
  {
    id: 'kuznitsa',
    nameRu: 'Кузница',
    nameEn: 'Smithy',
    baseCost: 6000,
    baseIncome: 50,
    costMultiplier: 1.75,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 2,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/kuznitsa',
    requires: { izba: 3 },
  },

  // ── Tier 3 ──
  {
    id: 'torg',
    nameRu: 'Торг',
    nameEn: 'Market',
    baseCost: 20000,
    baseIncome: 100,
    costMultiplier: 1.8,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 3,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/torg',
    requires: { melnitsa: 2, kuznitsa: 2 },
  },
  {
    id: 'skotny_dvor',
    nameRu: 'Скотный двор',
    nameEn: 'Cattle Yard',
    baseCost: 60000,
    baseIncome: 200,
    costMultiplier: 1.85,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 3,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/skotny_dvor',
    requires: { pashnya: 5, konyushni: 3 },
  },

  // ── Tier 4 ──
  {
    id: 'vinokurnya',
    nameRu: 'Винокурня',
    nameEn: 'Distillery',
    baseCost: 180000,
    baseIncome: 400,
    costMultiplier: 1.9,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 4,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/vinokurnya',
    requires: { pashnya: 5, melnitsa: 4 },
  },
  {
    id: 'terem',
    nameRu: 'Терем',
    nameEn: 'Mansion',
    baseCost: 500000,
    baseIncome: 800,
    costMultiplier: 1.95,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 4,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/terem',
    requires: { torg: 3, kuznitsa: 5 },
  },

  // ── Tier 5 ──
  {
    id: 'krepost',
    nameRu: 'Крепость',
    nameEn: 'Fortress',
    baseCost: 1500000,
    baseIncome: 2000,
    costMultiplier: 2.0,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 5,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/krepost',
    requires: { terem: 3, kuznitsa: 7 },
  },
  {
    id: 'kreml',
    nameRu: 'Кремль',
    nameEn: 'Kremlin',
    baseCost: 5000000,
    baseIncome: 5000,
    costMultiplier: 2.0,
    incomeMultiplier: 1.25,
    maxLevel: 15,
    tier: 5,
    category: 'income',
    currency: 'silver',
    assetKey: 'buildings/kreml',
    requires: { krepost: 3, torg: 5, terem: 5 },
  },

  // ── Premium Buildings (stars) ──
  {
    id: 'hram',
    nameRu: 'Храм',
    nameEn: 'Temple',
    baseCost: 50,
    baseIncome: 25,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'premium',
    category: 'premium',
    currency: 'stars',
    starsPrice: 50,
    noLevel: true,
    assetKey: 'buildings/hram',
    bonus: { defense_bonus: 0.10 },
  },
  {
    id: 'monastyr',
    nameRu: 'Монастырь',
    nameEn: 'Monastery',
    baseCost: 200,
    baseIncome: 100,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'premium',
    category: 'premium',
    currency: 'stars',
    starsPrice: 200,
    noLevel: true,
    assetKey: 'buildings/monastyr',
    bonus: { serf_slots: 1 },
  },
  {
    id: 'knyazhiy_dvor',
    nameRu: 'Княжий двор',
    nameEn: 'Prince Court',
    baseCost: 500,
    baseIncome: 300,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'premium',
    category: 'premium',
    currency: 'stars',
    starsPrice: 500,
    noLevel: true,
    assetKey: 'buildings/knyazhy_dvor',
    bonus: { income_bonus: 0.05 },
  },
  {
    id: 'zlatoglavyi_sobor',
    nameRu: 'Златоглавый собор',
    nameEn: 'Cathedral',
    baseCost: 1000,
    baseIncome: 500,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'premium',
    category: 'premium',
    currency: 'stars',
    starsPrice: 1000,
    noLevel: true,
    assetKey: 'buildings/zlatoglavy_sobor',
    bonus: { unique_title: 'blessed' },
  },

  // ── Gold Buildings ──
  {
    id: 'zastenok',
    nameRu: 'Застенок',
    nameEn: 'Dungeon',
    baseCost: 100,
    baseIncome: 75,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'gold',
    category: 'gold',
    currency: 'gold',
    goldPrice: 100,
    noLevel: true,
    assetKey: 'buildings/zastenok',
    bonus: { serf_gold_bonus: 0.20 },
  },
  {
    id: 'taynaya_kantselyariya',
    nameRu: 'Тайная канцелярия',
    nameEn: 'Secret Chancellery',
    baseCost: 300,
    baseIncome: 150,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'gold',
    category: 'gold',
    currency: 'gold',
    goldPrice: 300,
    noLevel: true,
    assetKey: 'buildings/taynaya_kantselyariya',
    bonus: { spy_vision: true },
  },
  {
    id: 'oprichny_dvor',
    nameRu: 'Опричный двор',
    nameEn: 'Oprichnina Court',
    baseCost: 500,
    baseIncome: 250,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'gold',
    category: 'gold',
    currency: 'gold',
    goldPrice: 500,
    noLevel: true,
    assetKey: 'buildings/oprichny_dvor',
    bonus: { raid_damage_reduction: 0.50 },
  },

  // ── Social Buildings (free) ──
  {
    id: 'vestovaya_bashnya',
    nameRu: 'Вестовая башня',
    nameEn: 'Herald Tower',
    baseCost: 0,
    baseIncome: 15,
    costMultiplier: 1.0,
    incomeMultiplier: 1.0,
    maxLevel: 1,
    tier: 'social',
    category: 'social',
    currency: 'free',
    noLevel: true,
    assetKey: 'buildings/vestovaya_bashnya',
    requiresSubscription: true,
  },
  {
    id: 'dom_druzey',
    nameRu: 'Дом друзей',
    nameEn: 'House of Friends',
    baseCost: 0,
    baseIncome: 5,
    costMultiplier: 1.0,
    incomeMultiplier: 1.5,
    maxLevel: 10,
    tier: 'social',
    category: 'social',
    currency: 'free',
    assetKey: 'buildings/dom_druzey',
    requiresReferrals: true,
    referralLevels: { 1: 1, 2: 3, 3: 5, 4: 7, 5: 10, 6: 15, 7: 25, 8: 50, 9: 100, 10: 150 },
  },
];

// ═══════════════════════════════════════
// UPGRADE COOLDOWNS (seconds, key = level BEFORE upgrade)
// Synced with bot: ESTATE_UPGRADE_COOLDOWNS
// ═══════════════════════════════════════

export const UPGRADE_COOLDOWNS: Record<number, number> = {
  1: 300,       // 5 min
  2: 900,       // 15 min
  3: 1800,      // 30 min
  4: 3600,      // 1 hour
  5: 7200,      // 2 hours
  6: 14400,     // 4 hours
  7: 28800,     // 8 hours
  8: 57600,     // 16 hours
  9: 86400,     // 24 hours
  10: 129600,   // 36 hours
  11: 172800,   // 48 hours (2 days)
  12: 259200,   // 72 hours (3 days)
  13: 345600,   // 96 hours (4 days)
  14: 432000,   // 120 hours (5 days)
};

// ═══════════════════════════════════════
// SPEED-UP COSTS (stars, key = level BEFORE upgrade)
// Synced with bot: UPGRADE_SPEED_COSTS
// ═══════════════════════════════════════

export const SPEED_UP_COSTS: Record<number, number> = {
  1: 1, 2: 2, 3: 3, 4: 5, 5: 10,
  6: 20, 7: 40, 8: 80, 9: 150,
  10: 250, 11: 400, 12: 600, 13: 800, 14: 1000,
};

// ═══════════════════════════════════════
// GOLD UPGRADE COSTS (levels 11-15)
// Synced with bot: GOLD_UPGRADE_BASE_COST + GOLD_UPGRADE_MULTIPLIER
// ═══════════════════════════════════════

const GOLD_UPGRADE_BASE_BY_TIER: Record<number, number> = {
  1: 5,    // Tier 1 (izba, pashnya, ambar)
  2: 10,   // Tier 2 (melnitsa, konyushni, kuznitsa)
  3: 20,   // Tier 3 (torg, skotny_dvor)
  4: 40,   // Tier 4 (vinokurnya, terem)
  5: 80,   // Tier 5 (krepost, kreml)
};

const GOLD_UPGRADE_MULTIPLIER: Record<number, number> = {
  11: 1,
  12: 2,
  13: 4,
  14: 8,
  15: 16,
};

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════

/** Get building cost at a given level (cumulative cost) */
export function getBuildingCost(building: BuildingDef, level: number): number {
  return Math.floor(building.baseCost * Math.pow(building.costMultiplier, level - 1));
}

/** Get silver cost to upgrade from currentLevel to currentLevel+1.
 *  Bot formula: cost(level+1) - cost(level) */
export function getUpgradeSilverCost(building: BuildingDef, currentLevel: number): number {
  if (currentLevel >= building.maxLevel) return 0;
  if (currentLevel + 1 > 10) return 0; // Gold levels — use getUpgradeGoldCost
  return getBuildingCost(building, currentLevel + 1) - getBuildingCost(building, currentLevel);
}

/** Get gold cost to upgrade from currentLevel to currentLevel+1 (for levels 11-15).
 *  Returns 0 if not a gold level or building can't be upgraded with gold. */
export function getUpgradeGoldCost(building: BuildingDef, currentLevel: number): number {
  const nextLevel = currentLevel + 1;
  if (nextLevel <= 10 || nextLevel > building.maxLevel) return 0;
  // Only income buildings (numeric tier) have gold upgrades
  if (typeof building.tier !== 'number') return 0;

  const baseCost = GOLD_UPGRADE_BASE_BY_TIER[building.tier] ?? 5;
  const multiplier = GOLD_UPGRADE_MULTIPLIER[nextLevel] ?? 1;
  return baseCost * multiplier;
}

/** Get building income at a given level */
export function getBuildingIncome(building: BuildingDef, level: number): number {
  return Math.floor(building.baseIncome * Math.pow(building.incomeMultiplier, level - 1));
}

/** Get currency type for a given level */
export function getUpgradeCurrency(level: number): 'silver' | 'gold' {
  return level <= 10 ? 'silver' : 'gold';
}

/** Get upgrade cooldown in seconds for a given level (level BEFORE upgrade) */
export function getUpgradeCooldown(currentLevel: number): number {
  return UPGRADE_COOLDOWNS[currentLevel] ?? 0;
}

/** Get speed-up cost in stars for a given level (level BEFORE upgrade) */
export function getSpeedUpCost(currentLevel: number): number {
  return SPEED_UP_COSTS[currentLevel] ?? 0;
}

/** Check if building prerequisites are met.
 *  Returns { met, missing[] } where missing contains unmet requirements. */
export function checkPrerequisites(
  building: BuildingDef,
  playerBuildings: Building[],
): { met: boolean; missing: Array<{ buildingId: string; requiredLevel: number; currentLevel: number }> } {
  if (!building.requires) return { met: true, missing: [] };

  const missing: Array<{ buildingId: string; requiredLevel: number; currentLevel: number }> = [];

  for (const [reqId, reqLevel] of Object.entries(building.requires)) {
    const playerBuilding = playerBuildings.find(b => b.id === reqId);
    const currentLevel = playerBuilding?.level ?? 0;
    if (currentLevel < reqLevel) {
      missing.push({ buildingId: reqId, requiredLevel: reqLevel, currentLevel });
    }
  }

  return { met: missing.length === 0, missing };
}

/** Get building definition by ID */
export function getBuildingById(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}

/** Get all income buildings (sorted by tier) */
export function getIncomeBuildings(): BuildingDef[] {
  return BUILDINGS.filter(b => b.category === 'income');
}

/** Get all premium buildings */
export function getPremiumBuildings(): BuildingDef[] {
  return BUILDINGS.filter(b => b.category === 'premium');
}

/** Get all gold buildings */
export function getGoldBuildings(): BuildingDef[] {
  return BUILDINGS.filter(b => b.category === 'gold');
}

/** Get all social buildings */
export function getSocialBuildings(): BuildingDef[] {
  return BUILDINGS.filter(b => b.category === 'social');
}

/** Format cooldown duration for display */
export function formatCooldown(seconds: number): string {
  if (seconds < 3600) return `${Math.ceil(seconds / 60)} мин`;
  if (seconds < 86400) return `${Math.round(seconds / 3600)} ч`;
  return `${Math.round(seconds / 86400)} дн`;
}
