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
  lastDailyBonus: string | null;
  dynamiteActive: boolean;
  dynamiteUntil: string | null;
  stoneWallCharges: number;
  createdAt: string;
  totalCoinsEarned: number;
  totalGoldEarned: number;
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
  ownerId: number;
  capturedAt: string;
  protectionType: string | null;
  protectionUntil: string | null;
  dailyIncome: number;
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
  stoneWallCharges: number;
  isInvisible: boolean;
  hasMoat: boolean;
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
export type CaveType = 'dark' | 'glory' | 'reputation';

// ─── Shop Item Status ───
export interface ShopItemStatus {
  id: string;
  owned: boolean;
  equipped: boolean;
}

// ─── Inventory (owned items) ───
export interface Inventory {
  weapons: string[];       // owned weapon IDs
  armor: string[];         // owned armor IDs
  specials: InventoryItem[];  // Iron Dome, Stone Wall, Trebuchet, Frog Potion
  defenses: InventoryItem[];  // Rov, Chastokol, Blagoslovenie, Nevidimost
  potions: InventoryItem[];   // Eliksir Zhizni
  explosives: InventoryItem[];// Bochka Porokha, Ognivo, Poroshkoviy Master
  caveBoosters: InventoryItem[];
}

export interface InventoryItem {
  id: string;
  quantity: number;
}

// ─── Active Defenses (currently applied) ───
export interface ActiveDefenses {
  ironDome: { until: string } | null;
  stoneWall: { until: string } | null;
  blessing: { until: string } | null;
  invisibility: { until: string } | null;
  chastokol: { chargesLeft: number; until: string } | null;
  moat: { chargesLeft: number } | null;
}

// ─── Active Cave Boosters ───
export interface ActiveCaveBoosters {
  healthPotion: boolean;    // +30 max HP
  strengthPotion: boolean;  // +15 ATK
  fortitudePotion: boolean; // +15 DEF
  holyLight: boolean;       // -10% monster damage
}

// ─── Bank State ───
export interface BankState {
  unlocked: boolean;
  depositedSilver: number;
  depositedAt: string | null;
  lastInterestClaim: string | null;
}

// ─── Daily Bonus ───
export interface DailyBonus {
  day: number;
  type: CurrencyType;
  amount: number;
  claimed: boolean;
}

// ─── Daily Bonus State ───
export interface DailyBonusState {
  currentStreak: number;
  lastClaimed: string | null;
  canClaim: boolean;
  streakAction: 'too_early' | 'increment' | 'freeze' | 'rollback';
  todayReward: { silver: number; gold: number; stars: number };
}

// ─── Cave Run ───
export interface CaveRun {
  id: number;
  caveType: CaveType;
  currentLevel: number;
  playerHp: number;
  playerMaxHp: number;
  totalSilver: number;
  totalGold: number;
  itemsFound: string[];
  status: 'active' | 'victory' | 'defeat' | 'exited';
}

// ─── Raid History (diminishing returns) ───
export interface RaidHistory {
  targetId: number;
  raidedAt: string;
  count: number;
}

// ─── Shop Category ───
export type ShopCategory = 'weapons' | 'armor' | 'specials' | 'defense' | 'potions' | 'explosives' | 'boosters';

// ─── Clan ───
export interface Clan {
  id: string;
  name: string;
  memberCount: number;
  maxMembers: number;
  totalPower: number;
  incomeBonus: number;
  role: 'leader' | 'officer' | 'member' | 'grand_prince' | 'voivode' | 'boyar' | 'druzhinnik';
  treasury: number;
  territories: string[];
  rank: number | null;
  warActive: boolean;
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
  | 'shop/specials'
  | 'shop/defense'
  | 'shop/potions'
  | 'shop/explosives'
  | 'shop/boosters'
  | 'profile'
  | 'profile/serfs'
  | 'profile/serfs/detail'
  | 'profile/serfs/protect'
  | 'profile/serfs/ransom'
  | 'profile/clan'
  | 'profile/bank'
  | 'profile/daily';
