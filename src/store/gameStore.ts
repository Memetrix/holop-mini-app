/**
 * HOLOP Game — Zustand Store
 * Central state management with mock data.
 * Synced with bot: github.com/VSemenchuk/holop
 */

import { create } from 'zustand';
import type {
  TabId,
  User,
  Building,
  Serf,
  Equipment,
  RaidTarget,
  BattleResult,
  CombatEntry,
  Toast,
  RaidHistory,
  Inventory,
  ActiveDefenses,
  ActiveCaveBoosters,
  BankState,
  DailyBonusState,
  Clan,
} from './types';
import { GAME } from '@/config/constants';
import {
  getBuildingById,
  getBuildingIncome,
  getUpgradeSilverCost,
  getUpgradeGoldCost,
  getUpgradeCooldown,
  checkPrerequisites,
} from '@/config/buildings';
import { getNextTitle, getTitleReward } from '@/config/titles';
import { findFreeSlot } from '@/config/cityLayout';
import { MONSTERS } from '@/config/monsters';
import {
  getDailyReward,
  getStreakAction,
  getMasterBonus,
  DAILY_BONUS_CONFIG,
} from '@/config/dailyBonus';
import {
  WEAPONS,
  ARMOR,
  SPECIAL_ITEMS,
  DEFENSE_ITEMS,
  POTIONS,
  EXPLOSIVES,
  CAVE_BOOSTERS,
} from '@/config/weapons';
import {
  SERF_PROFESSIONS,
  SERF_PROTECTION,
  calculateRansomPrice,
} from '@/config/serfs';

// ─── Mock Data ───

const MOCK_USER: User = {
  id: 123456789,
  username: 'test_player',
  firstName: 'Игрок',
  lastName: '',
  cityName: 'Новгород',
  silver: 847293,
  gold: 156,
  stars: 42,
  refStars: 0,
  reputation: 340,
  health: 87,
  maxHealth: 100,
  hourlyIncome: 1250,
  titleLevel: 8,
  attack: 45,
  defense: 32,
  dailyStreak: 7,
  serfSlots: 8,
  serfSlotsUsed: 3,
  clanId: null,
  ironDomeActive: false,
  ironDomeUntil: null,
  caveCooldownUntil: null,
  raidCooldownUntil: null,
  lastIncomeCollect: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  language: 'ru',
  lastDailyBonus: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 25h ago — claimable
  dynamiteActive: false,
  dynamiteUntil: null,
  stoneWallCharges: 0,
  createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  totalCoinsEarned: 2500000,
  totalGoldEarned: 500,
};

// Mock buildings with correct income values (incomeMult 1.25)
const MOCK_BUILDINGS: Building[] = [
  { id: 'izba', level: 12, income: 93, cooldownUntil: null, slotIndex: 0 },
  { id: 'pashnya', level: 10, income: 112, cooldownUntil: null, slotIndex: 1 },
  { id: 'kuznitsa', level: 8, income: 238, cooldownUntil: null, slotIndex: 2 },
  { id: 'torg', level: 6, income: 305, cooldownUntil: null, slotIndex: 3 },
  { id: 'krepost', level: 3, income: 3125, cooldownUntil: null, slotIndex: 4 },
];

const MOCK_SERFS: Serf[] = [
  {
    id: 1, name: 'Ванька', nameEn: 'Vanka', professionId: 'craftsman_serf',
    goldPer30m: 12, goldBonus: 0.25,
    lastCollected: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    ownerId: 123456789, capturedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    protectionType: null, protectionUntil: null, dailyIncome: 576,
  },
  {
    id: 2, name: 'Марфа', nameEn: 'Marfa', professionId: 'architect',
    goldPer30m: 18, goldBonus: 0.35,
    lastCollected: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    ownerId: 123456789, capturedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    protectionType: 'strazha', protectionUntil: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    dailyIncome: 864,
  },
  {
    id: 3, name: 'Фёдор', nameEn: 'Fyodor', professionId: 'plowman',
    goldPer30m: 8, goldBonus: 0.0,
    lastCollected: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
    ownerId: 123456789, capturedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    protectionType: null, protectionUntil: null, dailyIncome: 384,
  },
];

const MOCK_EQUIPMENT: Equipment = {
  weapon: { id: 'sablya', nameRu: 'Дамасская сабля', nameEn: 'Damascus Saber', atkBonus: 10 },
  armor: { id: 'kolchuga', nameRu: 'Кольчуга', nameEn: 'Chainmail', defBonus: 3 },
  profileIcon: null,
};

const MOCK_INVENTORY: Inventory = {
  weapons: ['dubina', 'topor', 'mech', 'sablya'],
  armor: ['tulup', 'kolchuga'],
  specials: [],
  defenses: [],
  potions: [],
  explosives: [],
  caveBoosters: [],
};

const MOCK_ACTIVE_DEFENSES: ActiveDefenses = {
  ironDome: null,
  stoneWall: null,
  blessing: null,
  invisibility: null,
  chastokol: null,
  moat: null,
};

const MOCK_BANK: BankState = {
  unlocked: false,
  depositedSilver: 0,
  depositedAt: null,
  lastInterestClaim: null,
};

// Generate mock raid targets
function generateRaidTargets(): RaidTarget[] {
  const names = [
    { username: 'varyag_42', city: 'Киев', title: 7, silver: 523000, def: 25 },
    { username: 'tsarevich', city: 'Москва', title: 9, silver: 1200000, def: 45 },
    { username: 'boyarskiy', city: 'Владимир', title: 6, silver: 180000, def: 15 },
    { username: 'knyaginya', city: 'Суздаль', title: 8, silver: 890000, def: 35 },
    { username: 'oprichnik', city: 'Тверь', title: 10, silver: 2500000, def: 55 },
  ];
  return names.map((n, i) => ({
    id: 1000 + i,
    username: n.username,
    cityName: n.city,
    titleLevel: n.title,
    silver: n.silver,
    defense: n.def,
    health: 100,
    maxHealth: 100,
    hasIronDome: i === 4,
    hasStoneWall: i === 2,
    stoneWallCharges: i === 2 ? 3 : 0,
    isInvisible: false,
    hasMoat: i === 3,
  }));
}

// ─── Random serf name generator ───
const SERF_NAMES_RU = ['Ванька', 'Петруха', 'Сидор', 'Марфа', 'Глаша', 'Фёдор', 'Тихон', 'Лукерья', 'Ефим', 'Прасковья'];
const SERF_NAMES_EN = ['Vanka', 'Petrukha', 'Sidor', 'Marfa', 'Glasha', 'Fyodor', 'Tikhon', 'Lukerya', 'Efim', 'Praskovya'];

function randomSerfProfession(): typeof SERF_PROFESSIONS[number] {
  const totalWeight = SERF_PROFESSIONS.reduce((s, p) => s + p.dropWeight, 0);
  let roll = Math.random() * totalWeight;
  for (const prof of SERF_PROFESSIONS) {
    roll -= prof.dropWeight;
    if (roll <= 0) return prof;
  }
  return SERF_PROFESSIONS[0];
}

// ─── Store Interface ───

interface GameState {
  // State
  user: User;
  buildings: Building[];
  serfs: Serf[];
  equipment: Equipment;
  inventory: Inventory;
  activeDefenses: ActiveDefenses;
  activeCaveBoosters: ActiveCaveBoosters;
  bank: BankState;
  activeTab: TabId;
  raidTargets: RaidTarget[];
  raidHistory: RaidHistory[];
  clan: Clan | null;
  toasts: Toast[];

  // Computed
  totalHourlyIncome: number;

  // Navigation
  setActiveTab: (tab: TabId) => void;

  // Income
  collectIncome: () => void;
  tickIncome: () => void;

  // Buildings
  upgradeBuilding: (buildingId: string) => void;
  buildNewBuilding: (buildingId: string, slotIndex?: number) => void;

  // Raids
  refreshRaidTargets: () => void;
  executeRaid: (targetId: number) => BattleResult;

  // Caves
  executeCaveBattle: (monsterId: string) => BattleResult;
  resurrectInCave: (monsterLevel: number) => boolean;

  // Shop — universal buy
  buyItem: (category: string, itemId: string) => boolean;
  equipWeapon: (weaponId: string) => void;
  equipArmor: (armorId: string) => void;

  // Legacy shop (kept for backward compat)
  buyWeapon: (weaponId: string) => boolean;
  buyArmor: (armorId: string) => boolean;

  // Defense items
  activateDefense: (defenseId: string) => boolean;
  usePotion: (potionId: string) => boolean;
  useCaveBooster: (boosterId: string) => boolean;

  // Serfs
  collectSerfGold: () => number;
  protectSerf: (serfId: number, protectionId: string) => boolean;
  ransomSerf: (serfId: number) => boolean;

  // Daily Bonus
  getDailyBonusState: () => DailyBonusState;
  claimDailyBonus: () => boolean;
  restoreDailyStreak: (daysToRestore: number) => boolean;

  // Bank
  unlockBank: () => boolean;
  depositToBank: (amount: number) => boolean;
  withdrawFromBank: () => { silver: number; interest: number };

  // Toasts
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;

  // Title
  checkTitleUpgrade: () => boolean;

  // Health
  regenerateHealth: () => void;

  // Language
  setLanguage: (lang: 'ru' | 'en') => void;
}

// ─── Helper: calculate total hourly income ───
function calcTotalIncome(buildings: Building[]): number {
  return buildings.reduce((sum, b) => sum + b.income, 0);
}

// ─── Helper: simulate combat ───
function simulateCombat(
  attackerAtk: number,
  attackerDef: number,
  attackerHp: number,
  defenderAtk: number,
  defenderDef: number,
  defenderHp: number,
): { won: boolean; log: CombatEntry[] } {
  const log: CombatEntry[] = [];
  let aHp = attackerHp;
  let dHp = defenderHp;
  let turn = 0;

  while (aHp > 0 && dHp > 0 && turn < 20) {
    turn++;
    const aDmg = Math.max(1, Math.floor(
      (GAME.PVP_BASE_DAMAGE_MIN + Math.random() * (GAME.PVP_BASE_DAMAGE_MAX - GAME.PVP_BASE_DAMAGE_MIN))
      * (1 + attackerAtk * 0.02)
      - defenderDef * 0.5
    ));
    const dDmg = Math.max(1, Math.floor(
      (GAME.PVP_BASE_DAMAGE_MIN + Math.random() * (GAME.PVP_BASE_DAMAGE_MAX - GAME.PVP_BASE_DAMAGE_MIN))
      * (1 + defenderAtk * 0.02)
      - attackerDef * 0.5
    ));

    dHp = Math.max(0, dHp - aDmg);
    if (dHp > 0) {
      aHp = Math.max(0, aHp - dDmg);
    }

    log.push({
      turn,
      attackerDamage: aDmg,
      defenderDamage: dHp > 0 ? dDmg : 0,
      attackerHp: aHp,
      defenderHp: dHp,
    });
  }

  return { won: dHp <= 0, log };
}

// ─── Helper: get diminishing factor for repeated raids ───
function getDiminishingFactor(raidHistory: RaidHistory[], targetId: number): number {
  const now = Date.now();
  const recentRaids = raidHistory.filter(
    r => r.targetId === targetId && (now - new Date(r.raidedAt).getTime()) < 24 * 60 * 60 * 1000
  );
  if (recentRaids.length === 0) return 1;
  // Each repeat raid reduces loot by PVP_DIMINISHING_FACTOR^count
  return Math.pow(GAME.PVP_DIMINISHING_FACTOR, recentRaids.length);
}

// ─── Create Store ───

let toastCounter = 0;
let serfIdCounter = 100;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  user: { ...MOCK_USER },
  buildings: [...MOCK_BUILDINGS],
  serfs: [...MOCK_SERFS],
  equipment: { ...MOCK_EQUIPMENT },
  inventory: { ...MOCK_INVENTORY },
  activeDefenses: { ...MOCK_ACTIVE_DEFENSES },
  activeCaveBoosters: { healthPotion: false, strengthPotion: false, fortitudePotion: false, holyLight: false },
  bank: { ...MOCK_BANK },
  activeTab: 'territory',
  raidTargets: generateRaidTargets(),
  raidHistory: [],
  clan: null,
  toasts: [],
  totalHourlyIncome: calcTotalIncome(MOCK_BUILDINGS),

  // ═══════════════════════════════════════════
  // Navigation
  // ═══════════════════════════════════════════
  setActiveTab: (tab) => set({ activeTab: tab }),

  // ═══════════════════════════════════════════
  // Income Collection (with 24h cap + health mult)
  // ═══════════════════════════════════════════
  collectIncome: () => {
    const { user, totalHourlyIncome } = get();
    const now = Date.now();
    const lastCollect = new Date(user.lastIncomeCollect).getTime();
    const elapsed = now - lastCollect;
    const hoursPassed = Math.min(elapsed / (1000 * 60 * 60), GAME.INCOME_MAX_HOURS);
    const healthMult = user.health / 100;
    const earned = Math.floor(totalHourlyIncome * hoursPassed * healthMult);

    if (earned > 0) {
      set({
        user: {
          ...user,
          silver: Math.min(user.silver + earned, GAME.MAX_SILVER),
          lastIncomeCollect: new Date().toISOString(),
          totalCoinsEarned: user.totalCoinsEarned + earned,
        },
      });
      get().addToast({
        type: 'reward',
        message: `+${earned.toLocaleString('ru-RU')} серебра собрано!`,
      });
    }
  },

  // Idle tick — add 1 second of income
  tickIncome: () => {
    const { user, totalHourlyIncome } = get();
    const healthMult = user.health / 100;
    const perSecond = (totalHourlyIncome / 3600) * healthMult;
    if (perSecond > 0) {
      set({
        user: {
          ...user,
          silver: Math.min(user.silver + perSecond, GAME.MAX_SILVER),
        },
      });
    }
  },

  // ═══════════════════════════════════════════
  // Building Upgrade (silver L1-10, gold L11-15)
  // ═══════════════════════════════════════════
  upgradeBuilding: (buildingId) => {
    const { user, buildings } = get();
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const def = getBuildingById(buildingId);
    if (!def) return;
    if (building.level >= def.maxLevel) return;
    if (building.cooldownUntil && new Date(building.cooldownUntil).getTime() > Date.now()) return;

    const prereqs = checkPrerequisites(def, buildings);
    if (!prereqs.met) return;

    const nextLevel = building.level + 1;
    const isGoldLevel = nextLevel > GAME.BUILDING_SILVER_MAX_LEVEL;

    let cost: number;
    let currencyField: 'silver' | 'gold';

    if (isGoldLevel) {
      cost = getUpgradeGoldCost(def, building.level);
      currencyField = 'gold';
    } else {
      cost = getUpgradeSilverCost(def, building.level);
      currencyField = 'silver';
    }

    if (cost <= 0 || user[currencyField] < cost) return;

    const newIncome = getBuildingIncome(def, nextLevel);
    const cooldownSeconds = getUpgradeCooldown(building.level);
    const cooldownUntil = cooldownSeconds > 0
      ? new Date(Date.now() + cooldownSeconds * 1000).toISOString()
      : null;

    const newBuildings = buildings.map(b =>
      b.id === buildingId
        ? { ...b, level: nextLevel, income: newIncome, cooldownUntil }
        : b
    );

    set({
      user: { ...user, [currencyField]: user[currencyField] - cost },
      buildings: newBuildings,
      totalHourlyIncome: calcTotalIncome(newBuildings),
    });

    const currencyIcon = isGoldLevel ? '🏅' : '🪙';
    get().addToast({
      type: 'success',
      message: `${def.nameRu} улучшена до ур.${nextLevel}! (-${cost}${currencyIcon})`,
    });
    get().checkTitleUpgrade();
  },

  // Build new building
  buildNewBuilding: (buildingId, slotIndex) => {
    const { user, buildings } = get();
    if (buildings.find(b => b.id === buildingId)) return;

    const def = getBuildingById(buildingId);
    if (!def) return;

    const prereqs = checkPrerequisites(def, buildings);
    if (!prereqs.met) return;

    let canAfford = false;
    let newUser = { ...user };

    switch (def.currency) {
      case 'silver':
        canAfford = user.silver >= def.baseCost;
        if (canAfford) newUser.silver -= def.baseCost;
        break;
      case 'gold':
        canAfford = user.gold >= (def.goldPrice ?? def.baseCost);
        if (canAfford) newUser.gold -= (def.goldPrice ?? def.baseCost);
        break;
      case 'stars':
        canAfford = user.stars >= (def.starsPrice ?? def.baseCost);
        if (canAfford) newUser.stars -= (def.starsPrice ?? def.baseCost);
        break;
      case 'free':
        canAfford = true;
        break;
    }

    if (!canAfford) return;

    const occupiedSlots = buildings.map(b => b.slotIndex);
    const assignedSlot = slotIndex ?? findFreeSlot(occupiedSlots, user.titleLevel) ?? 0;

    const newBuilding: Building = {
      id: buildingId,
      level: 1,
      income: def.baseIncome,
      cooldownUntil: null,
      slotIndex: assignedSlot,
    };

    const newBuildings = [...buildings, newBuilding];
    set({
      user: newUser,
      buildings: newBuildings,
      totalHourlyIncome: calcTotalIncome(newBuildings),
    });

    get().addToast({ type: 'success', message: `${def.nameRu} построена!` });
    get().checkTitleUpgrade();
  },

  // ═══════════════════════════════════════════
  // Raids (with diminishing returns + defense checks)
  // ═══════════════════════════════════════════
  refreshRaidTargets: () => {
    set({ raidTargets: generateRaidTargets() });
  },

  executeRaid: (targetId) => {
    const { user, raidTargets, equipment, raidHistory } = get();
    const emptyResult: BattleResult = { won: false, combatLog: [], silverLooted: 0, goldLooted: 0, reputationGained: 0, serfCaptured: null };

    const target = raidTargets.find(t => t.id === targetId);
    if (!target) return emptyResult;

    // Title check
    if (user.titleLevel < GAME.PVP_UNLOCK_TITLE) return emptyResult;
    // Health check
    if (user.health < GAME.PVP_MIN_HEALTH_TO_ATTACK) return emptyResult;
    // Cooldown check
    if (user.raidCooldownUntil && new Date(user.raidCooldownUntil).getTime() > Date.now()) return emptyResult;
    // Iron Dome check
    if (target.hasIronDome) return emptyResult;

    const totalAtk = user.attack + (equipment.weapon?.atkBonus ?? 0);
    const totalDef = user.defense + (equipment.armor?.defBonus ?? 0);

    // Moat gives +50% hidden defense to target
    const targetDef = target.hasMoat ? Math.floor(target.defense * 1.5) : target.defense;

    const { won, log } = simulateCombat(
      totalAtk, totalDef, user.health,
      targetDef, targetDef, target.health,
    );

    let silverLooted = 0;
    let serfCaptured: Serf | null = null;

    if (won) {
      // Loot formula with title diff bonus + diminishing returns
      const titleDiff = Math.max(0, target.titleLevel - user.titleLevel);
      const titleBonus = 1 + titleDiff * GAME.PVP_TITLE_DIFF_LOOT_BONUS;
      const diminishing = getDiminishingFactor(raidHistory, targetId);
      const baseLoot = target.silver * GAME.PVP_LOOT_PERCENT * titleBonus * diminishing;
      silverLooted = Math.max(GAME.PVP_MIN_LOOT, Math.floor(baseLoot));

      // Serf capture chance (~20% on win, if slots available)
      if (user.serfSlotsUsed < user.serfSlots && Math.random() < 0.2) {
        const prof = randomSerfProfession();
        const nameIdx = Math.floor(Math.random() * SERF_NAMES_RU.length);
        serfCaptured = {
          id: ++serfIdCounter,
          name: SERF_NAMES_RU[nameIdx],
          nameEn: SERF_NAMES_EN[nameIdx],
          professionId: prof.id,
          goldPer30m: Math.floor(10 * (1 + prof.goldBonus)),
          goldBonus: prof.goldBonus,
          lastCollected: new Date().toISOString(),
          ownerId: user.id,
          capturedAt: new Date().toISOString(),
          protectionType: null,
          protectionUntil: null,
          dailyIncome: Math.floor(10 * (1 + prof.goldBonus) * 48), // 48 intervals per day
        };
      }
    }

    const lastEntry = log[log.length - 1];
    const newSerfs = serfCaptured ? [...get().serfs, serfCaptured] : get().serfs;

    // Record raid history for diminishing returns
    const newHistory: RaidHistory = {
      targetId,
      raidedAt: new Date().toISOString(),
      count: 1,
    };

    set({
      user: {
        ...user,
        health: lastEntry?.attackerHp ?? user.health,
        silver: Math.min(user.silver + silverLooted, GAME.MAX_SILVER),
        raidCooldownUntil: new Date(Date.now() + GAME.PVP_COOLDOWN_MINUTES * 60 * 1000).toISOString(),
        serfSlotsUsed: serfCaptured ? user.serfSlotsUsed + 1 : user.serfSlotsUsed,
      },
      serfs: newSerfs,
      raidHistory: [...raidHistory, newHistory],
    });

    return {
      won,
      combatLog: log,
      silverLooted,
      goldLooted: 0,
      reputationGained: won ? 15 : 0,
      serfCaptured,
    };
  },

  // ═══════════════════════════════════════════
  // Caves (with boosters + resurrection)
  // ═══════════════════════════════════════════
  executeCaveBattle: (monsterId) => {
    const { user, equipment, activeCaveBoosters } = get();
    const emptyResult: BattleResult = { won: false, combatLog: [], silverLooted: 0, goldLooted: 0, reputationGained: 0, serfCaptured: null };

    const monster = MONSTERS.find(m => m.id === monsterId);
    if (!monster) return emptyResult;

    // Cooldown check
    if (user.caveCooldownUntil && new Date(user.caveCooldownUntil).getTime() > Date.now()) return emptyResult;

    let totalAtk = user.attack + (equipment.weapon?.atkBonus ?? 0);
    let totalDef = user.defense + (equipment.armor?.defBonus ?? 0);
    let playerHp = user.health;

    // Apply cave boosters
    if (activeCaveBoosters.healthPotion) playerHp = Math.min(playerHp + 30, user.maxHealth + 30);
    if (activeCaveBoosters.strengthPotion) totalAtk += 15;
    if (activeCaveBoosters.fortitudePotion) totalDef += 15;

    let monsterAtk = monster.atk;
    if (activeCaveBoosters.holyLight) monsterAtk = Math.floor(monsterAtk * 0.9);

    const { won, log } = simulateCombat(
      totalAtk, totalDef, playerHp,
      monsterAtk, monster.def, monster.hp,
    );

    let silverLooted = 0;
    let goldLooted = 0;
    let reputationGained = 0;

    if (won) {
      silverLooted = monster.silverLoot;
      reputationGained = monster.reputation;
      if (Math.random() < monster.goldChance) {
        goldLooted = Math.floor(1 + Math.random() * 5);
      }
    }

    // Determine cooldown based on account age
    const accountAgeDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    const cooldownHours = accountAgeDays < GAME.CAVE_EARLY_PERIOD_DAYS
      ? GAME.CAVE_COOLDOWN_EARLY_HOURS
      : GAME.CAVE_COOLDOWN_LATE_HOURS;

    const lastEntry = log[log.length - 1];
    set({
      user: {
        ...user,
        health: lastEntry?.attackerHp ?? user.health,
        silver: Math.min(user.silver + silverLooted, GAME.MAX_SILVER),
        gold: Math.min(user.gold + goldLooted, GAME.MAX_GOLD),
        reputation: Math.min(user.reputation + reputationGained, GAME.MAX_REPUTATION),
        caveCooldownUntil: new Date(Date.now() + cooldownHours * 60 * 60 * 1000).toISOString(),
      },
      // Reset cave boosters after use
      activeCaveBoosters: { healthPotion: false, strengthPotion: false, fortitudePotion: false, holyLight: false },
    });

    return { won, combatLog: log, silverLooted, goldLooted, reputationGained, serfCaptured: null };
  },

  resurrectInCave: (monsterLevel) => {
    const { user } = get();
    const cost = GAME.CAVE_RESURRECTION_BASE_STARS + GAME.CAVE_RESURRECTION_PER_LEVEL_STARS * monsterLevel;
    if (user.stars < cost) return false;

    set({
      user: {
        ...user,
        stars: user.stars - cost,
        health: Math.floor(user.maxHealth * 0.5), // Resurrect at 50% HP
        caveCooldownUntil: null, // Clear cooldown on resurrect
      },
    });
    get().addToast({ type: 'success', message: `Воскрешение! (-${cost} звёзд)` });
    return true;
  },

  // ═══════════════════════════════════════════
  // Shop — Universal Buy
  // ═══════════════════════════════════════════
  buyItem: (category, itemId) => {
    const { user, inventory } = get();

    // Find item definition
    let item: { cost: number; currency: string } | undefined;
    switch (category) {
      case 'weapons': item = WEAPONS.find(w => w.id === itemId); break;
      case 'armor': item = ARMOR.find(a => a.id === itemId); break;
      case 'specials': item = SPECIAL_ITEMS.find(s => s.id === itemId); break;
      case 'defense': item = DEFENSE_ITEMS.find(d => d.id === itemId); break;
      case 'potions': item = POTIONS.find(p => p.id === itemId); break;
      case 'explosives': item = EXPLOSIVES.find(e => e.id === itemId); break;
      case 'boosters': item = CAVE_BOOSTERS.find(b => b.id === itemId); break;
    }
    if (!item) return false;

    // Check currency
    const currencyField = item.currency as 'silver' | 'gold' | 'stars';
    if (user[currencyField] < item.cost) return false;

    // Deduct cost
    const newUser = { ...user, [currencyField]: user[currencyField] - item.cost };

    // Add to inventory
    const newInventory = { ...inventory };
    if (category === 'weapons') {
      if (!newInventory.weapons.includes(itemId)) {
        newInventory.weapons = [...newInventory.weapons, itemId];
      }
    } else if (category === 'armor') {
      if (!newInventory.armor.includes(itemId)) {
        newInventory.armor = [...newInventory.armor, itemId];
      }
    } else {
      // Stackable items — find or add
      const key = category as keyof Pick<Inventory, 'specials' | 'defenses' | 'potions' | 'explosives' | 'caveBoosters'>;
      const listKey = category === 'boosters' ? 'caveBoosters' : key;
      const list = [...(newInventory[listKey] ?? [])];
      const existing = list.find(i => i.id === itemId);
      if (existing) {
        existing.quantity += 1;
      } else {
        list.push({ id: itemId, quantity: 1 });
      }
      (newInventory as Record<string, unknown>)[listKey] = list;
    }

    set({ user: newUser, inventory: newInventory });
    get().addToast({ type: 'success', message: 'Куплено!' });
    return true;
  },

  equipWeapon: (weaponId) => {
    const { inventory } = get();
    if (!inventory.weapons.includes(weaponId)) return;
    const def = WEAPONS.find(w => w.id === weaponId);
    if (!def) return;
    set({
      equipment: {
        ...get().equipment,
        weapon: { id: def.id, nameRu: def.nameRu, nameEn: def.nameEn, atkBonus: def.atkBonus },
      },
    });
  },

  equipArmor: (armorId) => {
    const { inventory } = get();
    if (!inventory.armor.includes(armorId)) return;
    const def = ARMOR.find(a => a.id === armorId);
    if (!def) return;
    set({
      equipment: {
        ...get().equipment,
        armor: { id: def.id, nameRu: def.nameRu, nameEn: def.nameEn, defBonus: def.defBonus },
      },
    });
  },

  // Legacy shop
  buyWeapon: (weaponId) => get().buyItem('weapons', weaponId),
  buyArmor: (armorId) => get().buyItem('armor', armorId),

  // ═══════════════════════════════════════════
  // Defense Items — Activate from Inventory
  // ═══════════════════════════════════════════
  activateDefense: (defenseId) => {
    const { inventory, activeDefenses } = get();

    // Check inventory
    const allItems = [...inventory.specials, ...inventory.defenses];
    const invItem = allItems.find(i => i.id === defenseId && i.quantity > 0);
    if (!invItem) return false;

    // Consume from inventory
    const newInventory = { ...inventory };
    for (const key of ['specials', 'defenses'] as const) {
      newInventory[key] = newInventory[key].map(i =>
        i.id === defenseId ? { ...i, quantity: i.quantity - 1 } : i
      ).filter(i => i.quantity > 0);
    }

    const now = new Date();
    const newDefenses = { ...activeDefenses };

    switch (defenseId) {
      case 'iron_dome':
        newDefenses.ironDome = { until: new Date(now.getTime() + GAME.IRON_DOME_DURATION_HOURS * 60 * 60 * 1000).toISOString() };
        set({ user: { ...get().user, ironDomeActive: true, ironDomeUntil: newDefenses.ironDome.until } });
        break;
      case 'kamennaya_stena':
        newDefenses.stoneWall = { until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() };
        break;
      case 'blagoslovenie':
        newDefenses.blessing = { until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() };
        break;
      case 'nevidimost':
        newDefenses.invisibility = { until: new Date(now.getTime() + GAME.INVISIBILITY_DURATION_HOURS * 60 * 60 * 1000).toISOString() };
        break;
      case 'chastokol':
        newDefenses.chastokol = { chargesLeft: 3, until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() };
        break;
      case 'rov':
        newDefenses.moat = { chargesLeft: 1 };
        break;
      default:
        return false;
    }

    set({ inventory: newInventory, activeDefenses: newDefenses });
    get().addToast({ type: 'success', message: 'Защита активирована!' });
    return true;
  },

  usePotion: (potionId) => {
    const { user, inventory } = get();
    const invItem = inventory.potions.find(i => i.id === potionId && i.quantity > 0);
    if (!invItem) return false;

    const newInventory = { ...inventory };
    newInventory.potions = newInventory.potions.map(i =>
      i.id === potionId ? { ...i, quantity: i.quantity - 1 } : i
    ).filter(i => i.quantity > 0);

    if (potionId === 'eliksir_zhizni') {
      set({
        user: { ...user, health: user.maxHealth },
        inventory: newInventory,
      });
      get().addToast({ type: 'success', message: 'Полное исцеление!' });
      return true;
    }
    return false;
  },

  useCaveBooster: (boosterId) => {
    const { inventory, activeCaveBoosters } = get();
    const invItem = inventory.caveBoosters.find(i => i.id === boosterId && i.quantity > 0);
    if (!invItem) return false;

    const newInventory = { ...inventory };
    newInventory.caveBoosters = newInventory.caveBoosters.map(i =>
      i.id === boosterId ? { ...i, quantity: i.quantity - 1 } : i
    ).filter(i => i.quantity > 0);

    const newBoosters = { ...activeCaveBoosters };
    switch (boosterId) {
      case 'health_potion': newBoosters.healthPotion = true; break;
      case 'strength_potion': newBoosters.strengthPotion = true; break;
      case 'fortitude_potion': newBoosters.fortitudePotion = true; break;
      case 'holy_light': newBoosters.holyLight = true; break;
    }

    set({ inventory: newInventory, activeCaveBoosters: newBoosters });
    get().addToast({ type: 'success', message: 'Бустер активирован!' });
    return true;
  },

  // ═══════════════════════════════════════════
  // Serfs (synced with bot: 8h cap + protection + ransom)
  // ═══════════════════════════════════════════
  collectSerfGold: () => {
    const { user, serfs } = get();
    const now = new Date();
    let totalGold = 0;

    const updatedSerfs = serfs.map(serf => {
      const lastCollected = new Date(serf.lastCollected);
      const hoursPassed = Math.min(
        (now.getTime() - lastCollected.getTime()) / (1000 * 60 * 60),
        GAME.SERF_MAX_ACCUMULATION_HOURS,
      );
      if (hoursPassed >= 0.5) {
        const hourlyGold = serf.goldPer30m * 2;
        const gold = Math.floor(hourlyGold * hoursPassed);
        totalGold += gold;
        return { ...serf, lastCollected: now.toISOString() };
      }
      return serf;
    });

    if (totalGold > 0) {
      set({
        user: {
          ...user,
          gold: Math.min(user.gold + totalGold, GAME.MAX_GOLD),
          totalGoldEarned: user.totalGoldEarned + totalGold,
        },
        serfs: updatedSerfs,
      });
      get().addToast({ type: 'reward', message: `+${totalGold} золота от холопов!` });
    }

    return totalGold;
  },

  protectSerf: (serfId, protectionId) => {
    const { user, serfs } = get();
    const serf = serfs.find(s => s.id === serfId);
    if (!serf) return false;

    const protection = SERF_PROTECTION.find(p => p.id === protectionId);
    if (!protection) return false;
    if (user.gold < protection.costGold) return false;

    const until = new Date(Date.now() + protection.durationHours * 60 * 60 * 1000).toISOString();
    set({
      user: { ...user, gold: user.gold - protection.costGold },
      serfs: serfs.map(s =>
        s.id === serfId ? { ...s, protectionType: protectionId, protectionUntil: until } : s
      ),
    });
    get().addToast({ type: 'success', message: `${protection.nameRu} установлена на ${serf.name}!` });
    return true;
  },

  ransomSerf: (serfId) => {
    const { user, serfs } = get();
    const serf = serfs.find(s => s.id === serfId);
    if (!serf) return false;

    const hoursOwned = (Date.now() - new Date(serf.capturedAt).getTime()) / (1000 * 60 * 60);
    const price = calculateRansomPrice(serf.dailyIncome, hoursOwned);

    if (user.silver < price) return false;

    set({
      user: {
        ...user,
        silver: user.silver - price,
        serfSlotsUsed: Math.max(0, user.serfSlotsUsed - 1),
      },
      serfs: serfs.filter(s => s.id !== serfId),
    });
    get().addToast({ type: 'info', message: `${serf.name} выкуплен(а) за ${price.toLocaleString('ru-RU')} серебра` });
    return true;
  },

  // ═══════════════════════════════════════════
  // Daily Bonus (14-day cycle with streak logic)
  // ═══════════════════════════════════════════
  getDailyBonusState: () => {
    const { user } = get();
    const now = Date.now();

    if (!user.lastDailyBonus) {
      const reward = getDailyReward(1);
      return {
        currentStreak: 0,
        lastClaimed: null,
        canClaim: true,
        streakAction: 'increment' as const,
        todayReward: { silver: reward.silver, gold: reward.gold, stars: reward.stars },
      };
    }

    const lastClaim = new Date(user.lastDailyBonus).getTime();
    const hoursSince = (now - lastClaim) / (1000 * 60 * 60);
    const action = getStreakAction(hoursSince);

    let nextStreak = user.dailyStreak;
    switch (action) {
      case 'increment': nextStreak = user.dailyStreak + 1; break;
      case 'freeze': break;
      case 'rollback': nextStreak = Math.max(1, user.dailyStreak - DAILY_BONUS_CONFIG.DAILY_ROLLBACK_DAYS); break;
    }

    const reward = getDailyReward(nextStreak);
    const masterBonus = getMasterBonus(nextStreak);

    return {
      currentStreak: user.dailyStreak,
      lastClaimed: user.lastDailyBonus,
      canClaim: action !== 'too_early',
      streakAction: action,
      todayReward: {
        silver: reward.silver + masterBonus,
        gold: reward.gold,
        stars: reward.stars,
      },
    };
  },

  claimDailyBonus: () => {
    const { user } = get();
    const state = get().getDailyBonusState();
    if (!state.canClaim) return false;

    let newStreak = user.dailyStreak;
    switch (state.streakAction) {
      case 'increment': newStreak = user.dailyStreak + 1; break;
      case 'freeze': break;
      case 'rollback': newStreak = Math.max(1, user.dailyStreak - DAILY_BONUS_CONFIG.DAILY_ROLLBACK_DAYS); break;
    }

    const { silver, gold, stars } = state.todayReward;

    set({
      user: {
        ...user,
        dailyStreak: newStreak,
        lastDailyBonus: new Date().toISOString(),
        silver: Math.min(user.silver + silver, GAME.MAX_SILVER),
        gold: Math.min(user.gold + gold, GAME.MAX_GOLD),
        stars: user.stars + stars,
        totalCoinsEarned: user.totalCoinsEarned + silver,
        totalGoldEarned: user.totalGoldEarned + gold,
      },
    });

    const parts: string[] = [];
    if (silver > 0) parts.push(`+${silver.toLocaleString('ru-RU')} серебра`);
    if (gold > 0) parts.push(`+${gold} золота`);
    if (stars > 0) parts.push(`+${stars} звёзд`);
    get().addToast({
      type: 'reward',
      message: `День ${newStreak}: ${parts.join(', ')}!`,
      duration: 5000,
    });
    return true;
  },

  restoreDailyStreak: (daysToRestore) => {
    const { user } = get();
    const cost = Math.min(daysToRestore, DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX) * DAILY_BONUS_CONFIG.DAILY_RESTORE_COST;
    if (user.stars < cost) return false;

    const restoredStreak = Math.min(user.dailyStreak + daysToRestore, DAILY_BONUS_CONFIG.MAX_DAILY_STREAK);
    set({
      user: {
        ...user,
        stars: user.stars - cost,
        dailyStreak: restoredStreak,
      },
    });
    get().addToast({ type: 'success', message: `Серия восстановлена! (-${cost} звёзд)` });
    return true;
  },

  // ═══════════════════════════════════════════
  // Bank (silver deposits with daily interest)
  // ═══════════════════════════════════════════
  unlockBank: () => {
    const { user, bank } = get();
    if (bank.unlocked) return true;
    if (user.stars < GAME.BANK_UNLOCK_COST_STARS) return false;

    set({
      user: { ...user, stars: user.stars - GAME.BANK_UNLOCK_COST_STARS },
      bank: { ...bank, unlocked: true },
    });
    get().addToast({ type: 'success', message: 'Казна открыта!' });
    return true;
  },

  depositToBank: (amount) => {
    const { user, bank } = get();
    if (!bank.unlocked) return false;
    if (amount < GAME.BANK_MIN_DEPOSIT || user.silver < amount) return false;

    set({
      user: { ...user, silver: user.silver - amount },
      bank: {
        ...bank,
        depositedSilver: bank.depositedSilver + amount,
        depositedAt: bank.depositedAt ?? new Date().toISOString(),
      },
    });
    get().addToast({ type: 'success', message: `Вложено ${amount.toLocaleString('ru-RU')} серебра в казну` });
    return true;
  },

  withdrawFromBank: () => {
    const { user, bank } = get();
    if (!bank.unlocked || bank.depositedSilver <= 0) return { silver: 0, interest: 0 };

    const depositedAt = bank.depositedAt ? new Date(bank.depositedAt).getTime() : Date.now();
    const daysPassed = Math.min(
      (Date.now() - depositedAt) / (1000 * 60 * 60 * 24),
      GAME.BANK_MAX_DEPOSIT_HOURS / 24,
    );
    const interest = Math.min(
      Math.floor(bank.depositedSilver * GAME.BANK_INTEREST_RATE_PER_DAY * daysPassed),
      GAME.BANK_MAX_INTEREST_PER_DAY,
    );

    const total = bank.depositedSilver + interest;

    set({
      user: { ...user, silver: Math.min(user.silver + total, GAME.MAX_SILVER) },
      bank: { ...bank, depositedSilver: 0, depositedAt: null, lastInterestClaim: new Date().toISOString() },
    });
    get().addToast({ type: 'reward', message: `Из казны: ${total.toLocaleString('ru-RU')} серебра (+${interest} процентов)` });
    return { silver: bank.depositedSilver, interest };
  },

  // ═══════════════════════════════════════════
  // Toasts
  // ═══════════════════════════════════════════
  addToast: (toast) => {
    const id = `toast_${++toastCounter}`;
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));
    setTimeout(() => { get().removeToast(id); }, toast.duration ?? 3000);
  },

  removeToast: (id) => {
    set((state) => ({ toasts: state.toasts.filter(t => t.id !== id) }));
  },

  // ═══════════════════════════════════════════
  // Title upgrade check — with rewards
  // ═══════════════════════════════════════════
  checkTitleUpgrade: () => {
    const { user, totalHourlyIncome } = get();
    const nextTitle = getNextTitle(user.titleLevel);
    if (!nextTitle) return false;

    if (totalHourlyIncome >= nextTitle.incomeThreshold) {
      const reward = getTitleReward(nextTitle.level);
      const rewardSilver = reward?.coins ?? 0;
      const rewardGold = reward?.gold ?? 0;

      set({
        user: {
          ...user,
          titleLevel: nextTitle.level,
          serfSlots: nextTitle.serfSlots,
          silver: Math.min(user.silver + rewardSilver, GAME.MAX_SILVER),
          gold: Math.min(user.gold + rewardGold, GAME.MAX_GOLD),
        },
      });

      let rewardMsg = `Новый титул: ${nextTitle.nameRu}!`;
      if (rewardSilver > 0 || rewardGold > 0) {
        const parts: string[] = [];
        if (rewardSilver > 0) parts.push(`+${rewardSilver.toLocaleString('ru-RU')}🪙`);
        if (rewardGold > 0) parts.push(`+${rewardGold}🏅`);
        rewardMsg += `\n${parts.join(' ')}`;
      }

      get().addToast({ type: 'reward', message: rewardMsg, duration: 5000 });
      return true;
    }
    return false;
  },

  // ═══════════════════════════════════════════
  // Health Regen
  // ═══════════════════════════════════════════
  regenerateHealth: () => {
    const { user } = get();
    if (user.health < user.maxHealth) {
      set({
        user: {
          ...user,
          health: Math.min(user.health + GAME.HEALTH_REGEN_PER_MIN, user.maxHealth),
        },
      });
    }
  },

  // ═══════════════════════════════════════════
  // Language
  // ═══════════════════════════════════════════
  setLanguage: (lang) => {
    set((state) => ({ user: { ...state.user, language: lang } }));
  },
}));
