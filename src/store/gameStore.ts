/**
 * HOLOP Game — Zustand Store
 * Central state management with mock data.
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
} from './types';
import { GAME } from '@/config/constants';
import { getBuildingById, getBuildingIncome, getBuildingCost } from '@/config/buildings';
import { getNextTitle } from '@/config/titles';
import { MONSTERS } from '@/config/monsters';

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
  lastIncomeCollect: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1 hour ago for demo
  language: 'ru',
};

const MOCK_BUILDINGS: Building[] = [
  { id: 'izba', level: 12, income: 180, cooldownUntil: null },
  { id: 'pashnya', level: 10, income: 115, cooldownUntil: null },
  { id: 'kuznitsa', level: 8, income: 192, cooldownUntil: null },
  { id: 'torg', level: 6, income: 354, cooldownUntil: null },
  { id: 'krepost', level: 3, income: 409, cooldownUntil: null },
];

const MOCK_SERFS: Serf[] = [
  {
    id: 1,
    name: 'Ванька',
    nameEn: 'Vanka',
    professionId: 'craftsman_serf',
    goldPer30m: 12,
    goldBonus: 0.25,
    lastCollected: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
  },
  {
    id: 2,
    name: 'Марфа',
    nameEn: 'Marfa',
    professionId: 'architect',
    goldPer30m: 18,
    goldBonus: 0.35,
    lastCollected: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: 3,
    name: 'Фёдор',
    nameEn: 'Fyodor',
    professionId: 'plowman',
    goldPer30m: 8,
    goldBonus: 0.0,
    lastCollected: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
  },
];

const MOCK_EQUIPMENT: Equipment = {
  weapon: { id: 'sablya', nameRu: 'Сабля', nameEn: 'Saber', atkBonus: 10 },
  armor: { id: 'kolchuga', nameRu: 'Кольчуга', nameEn: 'Chainmail', defBonus: 5 },
  profileIcon: null,
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
  }));
}

// ─── Store Interface ───

interface GameState {
  // State
  user: User;
  buildings: Building[];
  serfs: Serf[];
  equipment: Equipment;
  activeTab: TabId;
  raidTargets: RaidTarget[];
  toasts: Toast[];

  // Computed (recalculated)
  totalHourlyIncome: number;

  // Navigation
  setActiveTab: (tab: TabId) => void;

  // Income
  collectIncome: () => void;
  tickIncome: () => void;

  // Buildings
  upgradeBuilding: (buildingId: string) => void;
  buildNewBuilding: (buildingId: string) => void;

  // Raids
  refreshRaidTargets: () => void;
  executeRaid: (targetId: number) => BattleResult;

  // Caves
  executeCaveBattle: (monsterId: string) => BattleResult;

  // Shop
  buyWeapon: (weaponId: string) => boolean;
  buyArmor: (armorId: string) => boolean;

  // Serfs
  collectSerfGold: () => number;

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

// ─── Create Store ───

let toastCounter = 0;

export const useGameStore = create<GameState>((set, get) => ({
  // Initial state
  user: { ...MOCK_USER },
  buildings: [...MOCK_BUILDINGS],
  serfs: [...MOCK_SERFS],
  equipment: { ...MOCK_EQUIPMENT },
  activeTab: 'territory',
  raidTargets: generateRaidTargets(),
  toasts: [],
  totalHourlyIncome: calcTotalIncome(MOCK_BUILDINGS),

  // Navigation
  setActiveTab: (tab) => set({ activeTab: tab }),

  // Collect accumulated income
  collectIncome: () => {
    const { user, totalHourlyIncome } = get();
    const now = Date.now();
    const lastCollect = new Date(user.lastIncomeCollect).getTime();
    const hoursPassed = (now - lastCollect) / (1000 * 60 * 60);
    const earned = Math.floor(totalHourlyIncome * hoursPassed);

    if (earned > 0) {
      set({
        user: {
          ...user,
          silver: Math.min(user.silver + earned, GAME.MAX_SILVER),
          lastIncomeCollect: new Date().toISOString(),
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
    const perSecond = totalHourlyIncome / 3600;
    if (perSecond > 0) {
      set({
        user: {
          ...user,
          silver: Math.min(user.silver + perSecond, GAME.MAX_SILVER),
        },
      });
    }
  },

  // Upgrade a building
  upgradeBuilding: (buildingId) => {
    const { user, buildings } = get();
    const building = buildings.find(b => b.id === buildingId);
    if (!building) return;

    const def = getBuildingById(buildingId);
    if (!def) return;

    if (building.level >= def.maxLevel) return;

    const nextLevel = building.level + 1;
    const cost = getBuildingCost(def, nextLevel);
    const currency = nextLevel <= 10 ? 'silver' : 'gold';

    if (currency === 'silver' && user.silver < cost) return;
    if (currency === 'gold' && user.gold < cost) return;

    const newIncome = getBuildingIncome(def, nextLevel);
    const newBuildings = buildings.map(b =>
      b.id === buildingId
        ? { ...b, level: nextLevel, income: newIncome, cooldownUntil: new Date(Date.now() + GAME.BUILDING_UPGRADE_COOLDOWN_MIN * 60 * 1000).toISOString() }
        : b
    );

    const newUser = {
      ...user,
      ...(currency === 'silver' ? { silver: user.silver - cost } : { gold: user.gold - cost }),
    };

    set({
      user: newUser,
      buildings: newBuildings,
      totalHourlyIncome: calcTotalIncome(newBuildings),
    });

    get().addToast({
      type: 'success',
      message: `${def.nameRu} улучшена до уровня ${nextLevel}!`,
    });
    get().checkTitleUpgrade();
  },

  // Build a new building
  buildNewBuilding: (buildingId) => {
    const { user, buildings } = get();
    if (buildings.find(b => b.id === buildingId)) return; // Already built

    const def = getBuildingById(buildingId);
    if (!def) return;

    if (user.silver < def.baseCost) return;

    const newBuilding: Building = {
      id: buildingId,
      level: 1,
      income: def.baseIncome,
      cooldownUntil: null,
    };

    const newBuildings = [...buildings, newBuilding];
    set({
      user: { ...user, silver: user.silver - def.baseCost },
      buildings: newBuildings,
      totalHourlyIncome: calcTotalIncome(newBuildings),
    });

    get().addToast({
      type: 'success',
      message: `${def.nameRu} построена!`,
    });
    get().checkTitleUpgrade();
  },

  // Raid
  refreshRaidTargets: () => {
    set({ raidTargets: generateRaidTargets() });
  },

  executeRaid: (targetId) => {
    const { user, raidTargets, equipment } = get();
    const target = raidTargets.find(t => t.id === targetId);
    if (!target) return { won: false, combatLog: [], silverLooted: 0, goldLooted: 0, reputationGained: 0, serfCaptured: null };

    const totalAtk = user.attack + (equipment.weapon?.atkBonus ?? 0);
    const totalDef = user.defense + (equipment.armor?.defBonus ?? 0);

    const { won, log } = simulateCombat(
      totalAtk, totalDef, user.health,
      target.defense, target.defense, target.health,
    );

    let silverLooted = 0;
    if (won) {
      const baseLoot = target.silver * GAME.PVP_LOOT_PERCENT;
      const robinHood = Math.max(0, target.titleLevel - user.titleLevel) * GAME.PVP_ROBIN_HOOD_PERCENT;
      silverLooted = Math.floor(baseLoot * (1 + robinHood));
    }

    const lastEntry = log[log.length - 1];
    set({
      user: {
        ...user,
        health: lastEntry?.attackerHp ?? user.health,
        silver: Math.min(user.silver + silverLooted, GAME.MAX_SILVER),
        raidCooldownUntil: new Date(Date.now() + (GAME.PVP_COOLDOWN_MIN + Math.random() * (GAME.PVP_COOLDOWN_MAX - GAME.PVP_COOLDOWN_MIN)) * 60 * 1000).toISOString(),
      },
    });

    return {
      won,
      combatLog: log,
      silverLooted,
      goldLooted: 0,
      reputationGained: won ? 15 : 0,
      serfCaptured: null,
    };
  },

  // Cave battle
  executeCaveBattle: (monsterId) => {
    const { user, equipment } = get();
    const monster = MONSTERS.find(m => m.id === monsterId);
    if (!monster) return { won: false, combatLog: [], silverLooted: 0, goldLooted: 0, reputationGained: 0, serfCaptured: null };

    const totalAtk = user.attack + (equipment.weapon?.atkBonus ?? 0);
    const totalDef = user.defense + (equipment.armor?.defBonus ?? 0);

    const { won, log } = simulateCombat(
      totalAtk, totalDef, user.health,
      monster.atk, monster.def, monster.hp,
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

    const lastEntry = log[log.length - 1];
    set({
      user: {
        ...user,
        health: lastEntry?.attackerHp ?? user.health,
        silver: Math.min(user.silver + silverLooted, GAME.MAX_SILVER),
        gold: Math.min(user.gold + goldLooted, GAME.MAX_GOLD),
        reputation: Math.min(user.reputation + reputationGained, GAME.MAX_REPUTATION),
        caveCooldownUntil: new Date(Date.now() + GAME.CAVE_COOLDOWN_EARLY_HOURS * 60 * 60 * 1000).toISOString(),
      },
    });

    return {
      won,
      combatLog: log,
      silverLooted,
      goldLooted,
      reputationGained,
      serfCaptured: null,
    };
  },

  // Shop
  buyWeapon: (weaponId) => {
    const { user } = get();
    // Import would be circular, so inline for now
    const weaponsCost: Record<string, number> = {
      dubina: 100, topor: 500, mech: 2000, sablya: 10000, samostrel: 15000, grecheskiy_ogon: 50000,
    };
    const cost = weaponsCost[weaponId] ?? 0;
    if (user.silver < cost) return false;

    set({
      user: { ...user, silver: user.silver - cost },
    });
    get().addToast({ type: 'success', message: 'Оружие куплено!' });
    return true;
  },

  buyArmor: (armorId) => {
    const { user } = get();
    const armorCost: Record<string, number> = {
      steganka: 200, kolchuga: 3000, laty: 15000, magic_shield: 50000,
    };
    const cost = armorCost[armorId] ?? 0;
    if (user.silver < cost) return false;

    set({
      user: { ...user, silver: user.silver - cost },
    });
    get().addToast({ type: 'success', message: 'Броня куплена!' });
    return true;
  },

  // Serfs
  collectSerfGold: () => {
    const { user, serfs } = get();
    const now = new Date();
    let totalGold = 0;

    const updatedSerfs = serfs.map(serf => {
      const lastCollected = new Date(serf.lastCollected);
      const minutesPassed = (now.getTime() - lastCollected.getTime()) / (1000 * 60);
      if (minutesPassed >= 30) {
        const intervals = Math.floor(minutesPassed / 30);
        const gold = serf.goldPer30m * intervals;
        totalGold += gold;
        return { ...serf, lastCollected: now.toISOString() };
      }
      return serf;
    });

    if (totalGold > 0) {
      set({
        user: { ...user, gold: Math.min(user.gold + totalGold, GAME.MAX_GOLD) },
        serfs: updatedSerfs,
      });
      get().addToast({
        type: 'reward',
        message: `+${totalGold} золота от холопов!`,
      });
    }

    return totalGold;
  },

  // Toasts
  addToast: (toast) => {
    const id = `toast_${++toastCounter}`;
    const newToast = { ...toast, id };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    // Auto-remove after duration
    setTimeout(() => {
      get().removeToast(id);
    }, toast.duration ?? 3000);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(t => t.id !== id),
    }));
  },

  // Title upgrade check
  checkTitleUpgrade: () => {
    const { user, totalHourlyIncome } = get();
    const nextTitle = getNextTitle(user.titleLevel);
    if (!nextTitle) return false;

    if (totalHourlyIncome >= nextTitle.incomeThreshold) {
      set({
        user: {
          ...user,
          titleLevel: nextTitle.level,
          serfSlots: nextTitle.serfSlots,
        },
      });
      get().addToast({
        type: 'reward',
        message: `Новый титул: ${nextTitle.nameRu}!`,
      });
      return true;
    }
    return false;
  },

  // Health regen
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

  // Language
  setLanguage: (lang) => {
    set((state) => ({
      user: { ...state.user, language: lang },
    }));
  },
}));
