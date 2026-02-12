/**
 * HOLOP Weapons, Armor, Special Items, Defense, Potions, Explosives
 * Synced with bot game_config.py
 */

export interface WeaponDef {
  id: string;
  nameRu: string;
  nameEn: string;
  atkBonus: number;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  assetKey: string;
}

export interface ArmorDef {
  id: string;
  nameRu: string;
  nameEn: string;
  defBonus: number;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  assetKey: string;
}

export interface SpecialItemDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  charges?: number;
  durationHours?: number;
  assetKey: string;
}

export interface DefenseItemDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  durationHours: number;
  charges?: number;
  assetKey: string;
}

export interface PotionDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  assetKey: string;
}

export interface ExplosiveDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'silver' | 'gold' | 'stars';
  durationHours?: number;
  assetKey: string;
}

export interface CaveBoosterDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'stars';
  assetKey: string;
}

// ---------------------------------------------------------------------------
// WEAPONS — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const WEAPONS: WeaponDef[] = [
  // Silver-based
  { id: 'dubina', nameRu: 'Дубина', nameEn: 'Club', atkBonus: 1, cost: 100, currency: 'silver', assetKey: 'weapons/dubina' },
  { id: 'topor', nameRu: 'Топор', nameEn: 'Axe', atkBonus: 3, cost: 500, currency: 'silver', assetKey: 'weapons/topor' },
  { id: 'mech', nameRu: 'Меч', nameEn: 'Sword', atkBonus: 5, cost: 2000, currency: 'silver', assetKey: 'weapons/mech' },
  { id: 'sablya', nameRu: 'Дамасская сабля', nameEn: 'Damascus Saber', atkBonus: 10, cost: 10000, currency: 'silver', assetKey: 'weapons/sablya' },
  { id: 'samostrel', nameRu: 'Самострел', nameEn: 'Crossbow', atkBonus: 15, cost: 25000, currency: 'silver', assetKey: 'weapons/samostrel' },
  // Stars-based
  { id: 'pishchal', nameRu: 'Пищаль', nameEn: 'Arquebus', atkBonus: 25, cost: 50, currency: 'stars', assetKey: 'weapons/pishchal' },
  { id: 'grecheskiy_ogon', nameRu: 'Греческий огонь', nameEn: 'Greek Fire', atkBonus: 40, cost: 100, currency: 'stars', assetKey: 'weapons/grecheskiy_ogon' },
  // Gold-based
  { id: 'mech_kladenets', nameRu: 'Меч-кладенец', nameEn: 'Magic Sword', atkBonus: 60, cost: 200, currency: 'gold', assetKey: 'weapons/mech_kladenets' },
];

// ---------------------------------------------------------------------------
// ARMOR — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const ARMOR: ArmorDef[] = [
  // Silver-based
  { id: 'tulup', nameRu: 'Тулуп', nameEn: 'Sheepskin', defBonus: 1, cost: 100, currency: 'silver', assetKey: 'armor/tulup' },
  { id: 'kolchuga', nameRu: 'Кольчуга', nameEn: 'Chainmail', defBonus: 3, cost: 500, currency: 'silver', assetKey: 'armor/kolchuga' },
  { id: 'bakhterets', nameRu: 'Бахтерец', nameEn: 'Brigandine', defBonus: 5, cost: 2000, currency: 'silver', assetKey: 'armor/bakhterets' },
  { id: 'zertsalo', nameRu: 'Зерцало', nameEn: 'Mirror Armor', defBonus: 10, cost: 10000, currency: 'silver', assetKey: 'armor/zertsalo' },
  { id: 'laty', nameRu: 'Латы', nameEn: 'Plate Armor', defBonus: 15, cost: 25000, currency: 'silver', assetKey: 'armor/laty' },
  // Stars-based
  { id: 'dospekh_knyazhiy', nameRu: 'Доспех княжий', nameEn: 'Princely Armor', defBonus: 25, cost: 50, currency: 'stars', assetKey: 'armor/dospekh_knyazhiy' },
  { id: 'bronya_zagovorennaya', nameRu: 'Броня заговорённая', nameEn: 'Enchanted Armor', defBonus: 40, cost: 100, currency: 'stars', assetKey: 'armor/bronya_zagovorennaya' },
  // Gold-based
  { id: 'shchit_peresveta', nameRu: 'Щит Пересвета', nameEn: 'Peresvet Shield', defBonus: 60, cost: 200, currency: 'gold', assetKey: 'armor/shchit_peresveta' },
];

// ---------------------------------------------------------------------------
// SPECIAL ITEMS — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const SPECIAL_ITEMS: SpecialItemDef[] = [
  {
    id: 'iron_dome',
    nameRu: 'Железный купол',
    nameEn: 'Iron Dome',
    effect: 'Блокирует ВСЕ атаки на 24ч (1 заряд)',
    effectEn: 'Blocks ALL attacks for 24h (1 charge)',
    cost: 25,
    currency: 'stars',
    charges: 1,
    durationHours: 24,
    assetKey: 'defense/iron_dome',
  },
  {
    id: 'kamennaya_stena',
    nameRu: 'Каменная стена',
    nameEn: 'Stone Wall',
    effect: 'Блокирует ВСЕ атаки на 24ч',
    effectEn: 'Blocks ALL attacks for 24h',
    cost: 50,
    currency: 'stars',
    durationHours: 24,
    assetKey: 'defense/kamennaya_stena',
  },
  {
    id: 'trebuchet',
    nameRu: 'Требушет',
    nameEn: 'Trebuchet',
    effect: 'Пробивает «Железный купол» (пачка 5 шт)',
    effectEn: 'Pierces Iron Dome (pack of 5)',
    cost: 25,
    currency: 'stars',
    charges: 5,
    assetKey: 'special/trebuchet',
  },
  {
    id: 'frog_potion',
    nameRu: 'Зелье лягушки',
    nameEn: 'Frog Potion',
    effect: 'Превращает врага в лягушку',
    effectEn: 'Turns enemy into a frog',
    cost: 5,
    currency: 'stars',
    assetKey: 'special/frog_potion',
  },
];

// ---------------------------------------------------------------------------
// DEFENSE ITEMS — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const DEFENSE_ITEMS: DefenseItemDef[] = [
  {
    id: 'rov',
    nameRu: 'Ров',
    nameEn: 'Moat',
    effect: '+50% к защите (скрытый), 1 использование',
    effectEn: '+50% defense (hidden), 1 use',
    cost: 500,
    currency: 'silver',
    durationHours: 24,
    charges: 1,
    assetKey: 'defense/rov',
  },
  {
    id: 'chastokol',
    nameRu: 'Частокол',
    nameEn: 'Palisade',
    effect: 'Блокирует 3 набега',
    effectEn: 'Blocks 3 raids',
    cost: 2000,
    currency: 'silver',
    durationHours: 24,
    charges: 3,
    assetKey: 'defense/chastokol',
  },
  {
    id: 'blagoslovenie',
    nameRu: 'Благословение',
    nameEn: 'Blessing',
    effect: 'Блокирует все атаки на 24ч',
    effectEn: 'Blocks all attacks for 24h',
    cost: 150,
    currency: 'stars',
    durationHours: 24,
    assetKey: 'defense/blagoslovenie',
  },
  {
    id: 'nevidimost',
    nameRu: 'Невидимость',
    nameEn: 'Invisibility',
    effect: 'Скрыт от PvP поиска на 48ч',
    effectEn: 'Hidden from PVP search for 48h',
    cost: 300,
    currency: 'stars',
    durationHours: 48,
    assetKey: 'defense/nevidimost',
  },
];

// ---------------------------------------------------------------------------
// POTIONS — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const POTIONS: PotionDef[] = [
  {
    id: 'eliksir_zhizni',
    nameRu: 'Эликсир жизни',
    nameEn: 'Life Elixir',
    effect: 'Полное исцеление до 100% HP',
    effectEn: 'Full heal to 100% HP',
    cost: 50,
    currency: 'gold',
    assetKey: 'potions/eliksir_zhizni',
  },
];

// ---------------------------------------------------------------------------
// EXPLOSIVES — synced with bot game_config.py
// ---------------------------------------------------------------------------
export const EXPLOSIVES: ExplosiveDef[] = [
  {
    id: 'bochka_porokha',
    nameRu: 'Бочка пороха',
    nameEn: 'Powder Keg',
    effect: 'Блокирует весь доход врага на 24ч',
    effectEn: 'Blocks all enemy income for 24h',
    cost: 100,
    currency: 'stars',
    durationHours: 24,
    assetKey: 'explosives/bochka_porokha',
  },
  {
    id: 'ognivo',
    nameRu: 'Огниво',
    nameEn: 'Flint',
    effect: '33% шанс обезвредить бочку пороха',
    effectEn: '33% chance to defuse Powder Keg',
    cost: 5000,
    currency: 'silver',
    assetKey: 'explosives/ognivo',
  },
  {
    id: 'poroshkoviy_master',
    nameRu: 'Порошковый мастер',
    nameEn: 'Powder Master',
    effect: '100% обезвреживание бочки пороха',
    effectEn: '100% defuse Powder Keg',
    cost: 50,
    currency: 'stars',
    assetKey: 'explosives/poroshkoviy_master',
  },
];

// ---------------------------------------------------------------------------
// CAVE BOOSTERS (unchanged)
// ---------------------------------------------------------------------------
export const CAVE_BOOSTERS: CaveBoosterDef[] = [
  { id: 'health_potion', nameRu: 'Зелье здоровья', nameEn: 'Health Potion', effect: '+30 макс. HP', effectEn: '+30 Max HP', cost: 15, currency: 'stars', assetKey: 'cave_boosters/zdravie' },
  { id: 'strength_potion', nameRu: 'Зелье силы', nameEn: 'Strength Potion', effect: '+15 атака', effectEn: '+15 Attack', cost: 15, currency: 'stars', assetKey: 'cave_boosters/sila' },
  { id: 'fortitude_potion', nameRu: 'Зелье стойкости', nameEn: 'Fortitude Potion', effect: '+15 защита', effectEn: '+15 Defense', cost: 15, currency: 'stars', assetKey: 'cave_boosters/stoykost' },
  { id: 'holy_light', nameRu: 'Святой свет', nameEn: 'Holy Light', effect: '-10% урона монстра', effectEn: '-10% monster damage', cost: 20, currency: 'stars', assetKey: 'cave_boosters/svyatoy_svet' },
];

// ---------------------------------------------------------------------------
// Lookup helpers
// ---------------------------------------------------------------------------

/** Get weapon by ID */
export function getWeaponById(id: string): WeaponDef | undefined {
  return WEAPONS.find(w => w.id === id);
}

/** Get armor by ID */
export function getArmorById(id: string): ArmorDef | undefined {
  return ARMOR.find(a => a.id === id);
}

/** Get special item by ID */
export function getSpecialItemById(id: string): SpecialItemDef | undefined {
  return SPECIAL_ITEMS.find(s => s.id === id);
}

/** Get defense item by ID */
export function getDefenseItemById(id: string): DefenseItemDef | undefined {
  return DEFENSE_ITEMS.find(d => d.id === id);
}

/** Get potion by ID */
export function getPotionById(id: string): PotionDef | undefined {
  return POTIONS.find(p => p.id === id);
}

/** Get explosive by ID */
export function getExplosiveById(id: string): ExplosiveDef | undefined {
  return EXPLOSIVES.find(e => e.id === id);
}
