/**
 * HOLOP Game — TypeScript Type Definitions
 * All game entity types and state interfaces.
 */

// ─── Tab Navigation ───
export type TabId = 'territory' | 'raids' | 'caves' | 'shop' | 'profile';

// ─── Currency Types ───
export type CurrencyType = 'silver' | 'gold' | 'stars' | 'ref_stars' | 'reputation';

// ─── User / Player ───
export interface User {
  id: number;
  username: string;
  firstName: string;
  lastName: string;
  cityName: string;
  silver: number;
  gold: number;
  stars: number;
  refStars: number;
  reputation: number;
  health: number;
  maxHealth: number;
  hourlyIncome: number;
  titleLevel: number;
  attack: number;
  defense: number;
  dailyStreak: number;
  serfSlots: number;
  serfSlotsUsed: number;
  clanId: string | null;
  ironDomeActive: boolean;
  ironDomeUntil: string | null;
  caveCooldownUntil: string | null;
  raidCooldownUntil: string | null;
  lastIncomeCollect: string;
  language: 'ru' | 'en';
}

// ─── Building ───
export interface Building {
  id: string;
  level: number;
  income: number;
  cooldownUntil: string | null;
  slotIndex: number;
}

// ─── Serf ───
export interface Serf {
  id: number;
  name: string;
  nameEn: string;
  professionId: string;
  goldPer30m: number;
  goldBonus: number;
  lastCollected: string;
}

// ─── Equipment ───
export interface EquippedWeapon {
  id: string;
  nameRu: string;
  nameEn: string;
  atkBonus: number;
}

export interface EquippedArmor {
  id: string;
  nameRu: string;
  nameEn: string;
  defBonus: number;
}

export interface Equipment {
  weapon: EquippedWeapon | null;
  armor: EquippedArmor | null;
  profileIcon: string | null;
}

// ─── Raid Target ───
export interface RaidTarget {
  id: number;
  username: string;
  cityName: string;
  titleLevel: number;
  silver: number;
  defense: number;
  health: number;
  maxHealth: number;
  hasIronDome: boolean;
  hasStoneWall: boolean;
}

// ─── Combat Log Entry ───
export interface CombatEntry {
  turn: number;
  attackerDamage: number;
  defenderDamage: number;
  attackerHp: number;
  defenderHp: number;
}

// ─── Battle Result ───
export interface BattleResult {
  won: boolean;
  combatLog: CombatEntry[];
  silverLooted: number;
  goldLooted: number;
  reputationGained: number;
  serfCaptured: Serf | null;
}

// ─── Cave State ───
export type CaveType = 'dark' | 'glory';

// ─── Shop Item Status ───
export interface ShopItemStatus {
  id: string;
  owned: boolean;
  equipped: boolean;
}

// ─── Daily Bonus ───
export interface DailyBonus {
  day: number;
  type: CurrencyType;
  amount: number;
  claimed: boolean;
}

// ─── Clan ───
export interface Clan {
  id: string;
  name: string;
  memberCount: number;
  maxMembers: number;
  totalPower: number;
  incomeBonus: number;
  role: 'leader' | 'officer' | 'member';
}

// ─── Toast Notification ───
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info' | 'reward';
  message: string;
  duration?: number;
}

// ─── Screen / Navigation ───
export type ScreenId =
  | 'territory'
  | 'territory/build'
  | 'territory/upgrade'
  | 'raids'
  | 'raids/battle'
  | 'raids/result'
  | 'caves'
  | 'caves/battle'
  | 'caves/loot'
  | 'shop'
  | 'shop/weapons'
  | 'shop/armor'
  | 'shop/boosters'
  | 'profile'
  | 'profile/serfs'
  | 'profile/clan'
  | 'profile/bank'
  | 'profile/daily';
