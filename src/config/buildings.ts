/**
 * HOLOP Building Definitions
 * All 20 buildings with costs, incomes, and formulas.
 */

export interface BuildingDef {
  id: string;
  nameRu: string;
  nameEn: string;
  baseCost: number;
  baseIncome: number;
  costMultiplier: number;
  incomeMultiplier: number;
  maxLevel: number;
  tier: 'early' | 'mid' | 'late' | 'special';
  category: 'income' | 'special';
  assetKey: string;
}

export const BUILDINGS: BuildingDef[] = [
  // Tier 1 — Early Game
  {
    id: 'izba',
    nameRu: 'Изба',
    nameEn: 'Hut',
    baseCost: 200,
    baseIncome: 8,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/izba',
  },
  {
    id: 'pashnya',
    nameRu: 'Пашня',
    nameEn: 'Arable Land',
    baseCost: 500,
    baseIncome: 15,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/pashnya',
  },
  {
    id: 'ambar',
    nameRu: 'Амбар',
    nameEn: 'Barn',
    baseCost: 1000,
    baseIncome: 20,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/ambar',
  },
  {
    id: 'melnitsa',
    nameRu: 'Мельница',
    nameEn: 'Mill',
    baseCost: 2000,
    baseIncome: 30,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/melnitsa',
  },
  {
    id: 'konyushni',
    nameRu: 'Конюшни',
    nameEn: 'Stables',
    baseCost: 4000,
    baseIncome: 40,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/konyushni',
  },
  {
    id: 'kuznitsa',
    nameRu: 'Кузница',
    nameEn: 'Smithy',
    baseCost: 6000,
    baseIncome: 50,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'early',
    category: 'income',
    assetKey: 'buildings/kuznitsa',
  },

  // Tier 2 — Mid Game
  {
    id: 'torg',
    nameRu: 'Торг',
    nameEn: 'Market',
    baseCost: 20000,
    baseIncome: 100,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'mid',
    category: 'income',
    assetKey: 'buildings/torg',
  },
  {
    id: 'skotny_dvor',
    nameRu: 'Скотный двор',
    nameEn: 'Cattle Yard',
    baseCost: 60000,
    baseIncome: 200,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'mid',
    category: 'income',
    assetKey: 'buildings/skotny_dvor',
  },
  {
    id: 'vinokurnya',
    nameRu: 'Винокурня',
    nameEn: 'Distillery',
    baseCost: 180000,
    baseIncome: 400,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'mid',
    category: 'income',
    assetKey: 'buildings/vinokurnya',
  },

  // Tier 3 — Late Game
  {
    id: 'terem',
    nameRu: 'Терем',
    nameEn: 'Mansion',
    baseCost: 500000,
    baseIncome: 800,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'late',
    category: 'income',
    assetKey: 'buildings/terem',
  },
  {
    id: 'krepost',
    nameRu: 'Крепость',
    nameEn: 'Fortress',
    baseCost: 1500000,
    baseIncome: 2000,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'late',
    category: 'income',
    assetKey: 'buildings/krepost',
  },
  {
    id: 'kreml',
    nameRu: 'Кремль',
    nameEn: 'Kremlin',
    baseCost: 5000000,
    baseIncome: 5000,
    costMultiplier: 1.9,
    incomeMultiplier: 1.5,
    maxLevel: 15,
    tier: 'late',
    category: 'income',
    assetKey: 'buildings/kreml',
  },

  // Special Buildings
  {
    id: 'hram',
    nameRu: 'Храм',
    nameEn: 'Temple',
    baseCost: 50000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/hram',
  },
  {
    id: 'monastyr',
    nameRu: 'Монастырь',
    nameEn: 'Monastery',
    baseCost: 100000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/monastyr',
  },
  {
    id: 'knyazhiy_dvor',
    nameRu: 'Княжий двор',
    nameEn: 'Prince Court',
    baseCost: 200000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/knyazhy_dvor',
  },
  {
    id: 'zlatoglavyi_sobor',
    nameRu: 'Златоглавый собор',
    nameEn: 'Cathedral',
    baseCost: 500000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/zlatoglavy_sobor',
  },
  {
    id: 'zastenok',
    nameRu: 'Застенок',
    nameEn: 'Dungeon',
    baseCost: 30000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/zastenok',
  },
  {
    id: 'taynaya_kantselyariya',
    nameRu: 'Тайная канцелярия',
    nameEn: 'Secret Office',
    baseCost: 150000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/taynaya_kantselyariya',
  },
  {
    id: 'vestovaya_bashnya',
    nameRu: 'Вестовая башня',
    nameEn: 'Herald Tower',
    baseCost: 80000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/vestovaya_bashnya',
  },
  {
    id: 'dom_druzey',
    nameRu: 'Дом друзей',
    nameEn: 'House of Friends',
    baseCost: 10000,
    baseIncome: 0,
    costMultiplier: 1.9,
    incomeMultiplier: 1.0,
    maxLevel: 10,
    tier: 'special',
    category: 'special',
    assetKey: 'buildings/dom_druzey',
  },
];

/** Get building cost at a given level */
export function getBuildingCost(building: BuildingDef, level: number): number {
  return Math.floor(building.baseCost * Math.pow(building.costMultiplier, level - 1));
}

/** Get building income at a given level */
export function getBuildingIncome(building: BuildingDef, level: number): number {
  return Math.floor(building.baseIncome * Math.pow(building.incomeMultiplier, level - 1));
}

/** Get currency type for a given level */
export function getUpgradeCurrency(level: number): 'silver' | 'gold' {
  return level <= 10 ? 'silver' : 'gold';
}

/** Get building definition by ID */
export function getBuildingById(id: string): BuildingDef | undefined {
  return BUILDINGS.find(b => b.id === id);
}

/** Get all income buildings (sorted by tier) */
export function getIncomeBuildings(): BuildingDef[] {
  return BUILDINGS.filter(b => b.category === 'income');
}
