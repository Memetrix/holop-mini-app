/**
 * HOLOP Serf / Holop System — Profession Definitions, Protection, Ransom & Config
 * Synced with bot game_config.py
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SerfOtherBonus {
  income_bonus?: number;
  attack_bonus?: number;
  build_speed?: number;
  daily_scout?: boolean;
  capture_immunity_hours?: number;
}

export interface SerfProfessionDef {
  id: string;
  nameRu: string;
  nameEn: string;
  goldBonus: number;
  dropWeight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  assetKey: string;
  otherBonus?: SerfOtherBonus;
}

export interface SerfProtectionDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  costGold: number;
  durationHours: number;
  potionsRequired: number;
  assetKey: string;
}

// ---------------------------------------------------------------------------
// Professions  (rarity mapped from bot drop rates)
//   pakhar 0.40, remeslennik 0.25, voin 0.15, zodchiy 0.10, lazutchik 0.07, volkhv 0.03
// ---------------------------------------------------------------------------

export const SERF_PROFESSIONS: SerfProfessionDef[] = [
  {
    id: 'plowman', nameRu: 'Пахарь', nameEn: 'Plowman',
    goldBonus: 0.50, dropWeight: 40, rarity: 'common',
    assetKey: 'holop_professions/pakhar',
  },
  {
    id: 'craftsman_serf', nameRu: 'Ремесленник', nameEn: 'Craftsman',
    goldBonus: 0.30, dropWeight: 25, rarity: 'uncommon',
    assetKey: 'holop_professions/remeslennik',
    otherBonus: { income_bonus: 0.05 },
  },
  {
    id: 'warrior', nameRu: 'Воин', nameEn: 'Warrior',
    goldBonus: 0.20, dropWeight: 15, rarity: 'uncommon',
    assetKey: 'holop_professions/voin',
    otherBonus: { attack_bonus: 10 },
  },
  {
    id: 'architect', nameRu: 'Зодчий', nameEn: 'Architect',
    goldBonus: 0.10, dropWeight: 10, rarity: 'rare',
    assetKey: 'holop_professions/zodchiy',
    otherBonus: { build_speed: 0.10 },
  },
  {
    id: 'spy', nameRu: 'Лазутчик', nameEn: 'Spy',
    goldBonus: 0.10, dropWeight: 7, rarity: 'rare',
    assetKey: 'holop_professions/lazutchik',
    otherBonus: { daily_scout: true },
  },
  {
    id: 'mage', nameRu: 'Волхв', nameEn: 'Mage',
    goldBonus: 0.50, dropWeight: 3, rarity: 'epic',
    assetKey: 'holop_professions/volkhv',
    otherBonus: { capture_immunity_hours: 24 },
  },
];

// ---------------------------------------------------------------------------
// Serf Config  (bot SERF_CONFIG)
// ---------------------------------------------------------------------------

export const SERF_CONFIG = {
  baseSlots: 2,
  maxSlots: 30,
  slotCostStars: 100,
  incomeIntervalMinutes: 30,
  maxAccumulationHours: 8,
  professionChoiceCostStars: 10,
  minHoursForTransfer: 8,
} as const;

// ---------------------------------------------------------------------------
// Protection  (bot SERF_PROTECTION — costs in gold, not stars)
// ---------------------------------------------------------------------------

export const SERF_PROTECTION: SerfProtectionDef[] = [
  {
    id: 'knut', nameRu: 'Кнут', nameEn: 'Whip',
    effect: 'Базовая защита на 12ч', effectEn: 'Basic protection for 12h',
    costGold: 50, durationHours: 12, potionsRequired: 1,
    assetKey: 'holop_protection/knut',
  },
  {
    id: 'strazha', nameRu: 'Стража', nameEn: 'Guard',
    effect: 'Стандартная защита на 24ч', effectEn: 'Standard protection for 24h',
    costGold: 120, durationHours: 24, potionsRequired: 1,
    assetKey: 'holop_protection/strazha',
  },
  {
    id: 'oprichniki', nameRu: 'Опричники', nameEn: 'Oprichniki',
    effect: 'Элитная защита на 48ч', effectEn: 'Elite protection for 48h',
    costGold: 320, durationHours: 48, potionsRequired: 2,
    assetKey: 'holop_protection/oprichniki',
  },
  {
    id: 'volnaya_gramota', nameRu: 'Вольная грамота', nameEn: 'Freedom Charter',
    effect: 'Абсолютная защита на 7 дней', effectEn: 'Absolute protection for 7 days',
    costGold: 1000, durationHours: 168, potionsRequired: 999,
    assetKey: 'holop_protection/volnaya_gramota',
  },
];

// ---------------------------------------------------------------------------
// Frog Potion  (bypasses protection)
// ---------------------------------------------------------------------------

export const FROG_POTION = {
  costStars: 5, // Synced with bot POTIONS.frog_potion.stars_price (ARMY_ITEMS price)
} as const;

// ---------------------------------------------------------------------------
// Ransom Config  (bot SERF_RANSOM_CONFIG)
// ---------------------------------------------------------------------------

export const SERF_RANSOM_CONFIG = {
  ownerShare: 0.70,
  baseMultiplier: 6,
  timeBonusPerDay: 0.10,
  timeBonusMax: 1.0,
  minPriceSilver: 500,
  goldThreshold: 15_000,
  starsThreshold: 100_000,
  silverToGold: 100,
  silverToStars: 2000,
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Get rarity color */
export function getRarityColor(rarity: SerfProfessionDef['rarity']): string {
  switch (rarity) {
    case 'common': return '#A0A0A0';
    case 'uncommon': return '#4CAF50';
    case 'rare': return '#2196F3';
    case 'epic': return '#9C27B0';
  }
}

/** Get profession by ID */
export function getProfessionById(id: string): SerfProfessionDef | undefined {
  return SERF_PROFESSIONS.find(p => p.id === id);
}

/**
 * Calculate ransom price in silver.
 * Formula: dailyIncome * baseMultiplier * (1 + min(timeBonusPerDay * daysOwned, timeBonusMax))
 * Clamped to minPriceSilver.
 */
export function calculateRansomPrice(dailyIncome: number, hoursOwned: number): number {
  const cfg = SERF_RANSOM_CONFIG;
  const daysOwned = hoursOwned / 24;
  const timeBonus = Math.min(cfg.timeBonusPerDay * daysOwned, cfg.timeBonusMax);
  const price = dailyIncome * cfg.baseMultiplier * (1 + timeBonus);
  return Math.max(Math.round(price), cfg.minPriceSilver);
}
