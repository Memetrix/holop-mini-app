/**
 * HOLOP Title / Rank System
 * 12 titles from Смерд (Serf) to Царь (Tsar)
 * Synced with bot: github.com/VSemenchuk/holop (game_config.py TITLES)
 */

export interface TitleDef {
  level: number;
  id: string;
  nameRu: string;
  nameEn: string;
  incomeThreshold: number;
  serfSlots: number;
  specialUnlock: string | null;
  attackBonus: number;
  defenseBonus: number;
  lootBonus: number;
  canAttack: boolean;
  assetKey: string;
}

export interface TitleReward {
  coins: number;
  gold: number;
}

export const TITLES: TitleDef[] = [
  {
    level: 1,
    id: 'smerd',
    nameRu: 'Смерд',
    nameEn: 'Serf',
    incomeThreshold: 0,
    serfSlots: 2,
    specialUnlock: null,
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: false,
    assetKey: 'titles/title_smerd',
  },
  {
    level: 2,
    id: 'holop',
    nameRu: 'Холоп',
    nameEn: 'Bondsman',
    incomeThreshold: 15,
    serfSlots: 3,
    specialUnlock: null,
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: false,
    assetKey: 'titles/title_holop',
  },
  {
    level: 3,
    id: 'chelyadin',
    nameRu: 'Челядин',
    nameEn: 'Servant',
    incomeThreshold: 35,
    serfSlots: 4,
    specialUnlock: 'dark_cave',
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: false,
    assetKey: 'titles/title_chelyadin',
  },
  {
    level: 4,
    id: 'remeslennik',
    nameRu: 'Ремесленник',
    nameEn: 'Craftsman',
    incomeThreshold: 70,
    serfSlots: 5,
    specialUnlock: 'glory_cave',
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: false,
    assetKey: 'titles/title_remeslennik',
  },
  {
    level: 5,
    id: 'posadskiy',
    nameRu: 'Посадский',
    nameEn: 'Townsman',
    incomeThreshold: 120,
    serfSlots: 5,
    specialUnlock: null,
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: false,
    assetKey: 'titles/title_posadsky',
  },
  {
    level: 6,
    id: 'kupets',
    nameRu: 'Купец',
    nameEn: 'Merchant',
    incomeThreshold: 200,
    serfSlots: 6,
    specialUnlock: 'pvp',
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0.10,
    canAttack: true,
    assetKey: 'titles/title_kupets',
  },
  {
    level: 7,
    id: 'boyarin',
    nameRu: 'Боярин',
    nameEn: 'Boyar',
    incomeThreshold: 400,
    serfSlots: 7,
    specialUnlock: 'clan_create',
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0.15,
    canAttack: true,
    assetKey: 'titles/title_boyarin',
  },
  {
    level: 8,
    id: 'voevoda',
    nameRu: 'Воевода',
    nameEn: 'Voivode',
    incomeThreshold: 1000,
    serfSlots: 8,
    specialUnlock: null,
    attackBonus: 0.20,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: true,
    assetKey: 'titles/title_voevoda',
  },
  {
    level: 9,
    id: 'namestnik',
    nameRu: 'Наместник',
    nameEn: 'Governor',
    incomeThreshold: 2500,
    serfSlots: 9,
    specialUnlock: null,
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: true,
    assetKey: 'titles/title_namestnik',
  },
  {
    level: 10,
    id: 'knyaz',
    nameRu: 'Князь',
    nameEn: 'Prince',
    incomeThreshold: 6000,
    serfSlots: 10,
    specialUnlock: null,
    attackBonus: 0.30,
    defenseBonus: 0.30,
    lootBonus: 0,
    canAttack: true,
    assetKey: 'titles/title_knyaz',
  },
  {
    level: 11,
    id: 'velikiy_knyaz',
    nameRu: 'Великий Князь',
    nameEn: 'Grand Prince',
    incomeThreshold: 15000,
    serfSlots: 12,
    specialUnlock: null,
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: true,
    assetKey: 'titles/title_veliky_knyaz',
  },
  {
    level: 12,
    id: 'tsar',
    nameRu: 'Царь',
    nameEn: 'Tsar',
    incomeThreshold: 40000,
    serfSlots: 15,
    specialUnlock: 'raid_immunity',
    attackBonus: 0,
    defenseBonus: 0,
    lootBonus: 0,
    canAttack: true,
    assetKey: 'titles/title_tsar',
  },
];

// ═══════════════════════════════════════
// TITLE REWARDS — coins + gold for rank up
// Synced with bot: TITLE_REWARDS
// ═══════════════════════════════════════

export const TITLE_REWARDS: Record<number, TitleReward> = {
  2:  { coins: 150,   gold: 0 },
  3:  { coins: 300,   gold: 5 },
  4:  { coins: 500,   gold: 10 },
  5:  { coins: 800,   gold: 15 },
  6:  { coins: 1500,  gold: 30 },
  7:  { coins: 2500,  gold: 50 },
  8:  { coins: 4000,  gold: 75 },
  9:  { coins: 6000,  gold: 100 },
  10: { coins: 10000, gold: 150 },
  11: { coins: 20000, gold: 250 },
  12: { coins: 50000, gold: 500 },
};

// ═══════════════════════════════════════
// HELPER FUNCTIONS
// ═══════════════════════════════════════

/** Get title definition by level */
export function getTitleByLevel(level: number): TitleDef {
  return TITLES[level - 1] ?? TITLES[0];
}

/** Get the next title (or null if max) */
export function getNextTitle(currentLevel: number): TitleDef | null {
  if (currentLevel >= 12) return null;
  return TITLES[currentLevel]; // 0-indexed, so currentLevel gives next
}

/** Get reward for reaching a given title level (or null if no reward) */
export function getTitleReward(level: number): TitleReward | null {
  return TITLE_REWARDS[level] ?? null;
}

/** Calculate progress percentage to next title */
export function getTitleProgress(currentIncome: number, currentLevel: number): number {
  const current = getTitleByLevel(currentLevel);
  const next = getNextTitle(currentLevel);
  if (!next) return 100;

  const range = next.incomeThreshold - current.incomeThreshold;
  const progress = currentIncome - current.incomeThreshold;
  return Math.min(100, Math.max(0, (progress / range) * 100));
}

/** Get cumulative attack bonus for a title level */
export function getTotalAttackBonus(titleLevel: number): number {
  return TITLES
    .filter(t => t.level <= titleLevel)
    .reduce((sum, t) => sum + t.attackBonus, 0);
}

/** Get cumulative defense bonus for a title level */
export function getTotalDefenseBonus(titleLevel: number): number {
  return TITLES
    .filter(t => t.level <= titleLevel)
    .reduce((sum, t) => sum + t.defenseBonus, 0);
}

/** Check if a title level can attack other players */
export function canAttackAtTitle(titleLevel: number): boolean {
  const title = getTitleByLevel(titleLevel);
  return title.canAttack;
}
