/**
 * HOLOP Weapons, Armor, and Special Items
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

export const WEAPONS: WeaponDef[] = [
  { id: 'dubina', nameRu: 'Дубина', nameEn: 'Club', atkBonus: 1, cost: 100, currency: 'silver', assetKey: 'weapons/dubina' },
  { id: 'topor', nameRu: 'Топор', nameEn: 'Axe', atkBonus: 3, cost: 500, currency: 'silver', assetKey: 'weapons/topor' },
  { id: 'mech', nameRu: 'Меч', nameEn: 'Sword', atkBonus: 5, cost: 2000, currency: 'silver', assetKey: 'weapons/mech' },
  { id: 'sablya', nameRu: 'Сабля', nameEn: 'Saber', atkBonus: 10, cost: 10000, currency: 'silver', assetKey: 'weapons/sablya' },
  { id: 'samostrel', nameRu: 'Самострел', nameEn: 'Crossbow', atkBonus: 12, cost: 15000, currency: 'silver', assetKey: 'weapons/samostrel' },
  { id: 'grecheskiy_ogon', nameRu: 'Греческий огонь', nameEn: 'Greek Fire', atkBonus: 25, cost: 50000, currency: 'silver', assetKey: 'weapons/grecheskiy_ogon' },
];

export const ARMOR: ArmorDef[] = [
  { id: 'steganka', nameRu: 'Стёганка', nameEn: 'Padded Coat', defBonus: 2, cost: 200, currency: 'silver', assetKey: 'armor/tulup' },
  { id: 'kolchuga', nameRu: 'Кольчуга', nameEn: 'Chainmail', defBonus: 5, cost: 3000, currency: 'silver', assetKey: 'armor/kolchuga' },
  { id: 'laty', nameRu: 'Латы', nameEn: 'Steel Plate', defBonus: 10, cost: 15000, currency: 'silver', assetKey: 'armor/laty' },
  { id: 'magic_shield', nameRu: 'Магический щит', nameEn: 'Magic Shield', defBonus: 20, cost: 50000, currency: 'silver', assetKey: 'armor/shchit_peresveta' },
];

export const SPECIAL_ITEMS: SpecialItemDef[] = [
  {
    id: 'iron_dome',
    nameRu: 'Железный купол',
    nameEn: 'Iron Dome',
    effect: 'Блокирует ВСЕ атаки на 24ч',
    effectEn: 'Blocks ALL attacks for 24h',
    cost: 50,
    currency: 'stars',
    assetKey: 'defense/iron_dome',
  },
  {
    id: 'stone_wall',
    nameRu: 'Каменная стена',
    nameEn: 'Stone Wall',
    effect: '-20% входящего урона (разовый)',
    effectEn: '-20% incoming damage (single use)',
    cost: 5000,
    currency: 'silver',
    assetKey: 'defense/kamennaya_stena',
  },
  {
    id: 'dynamite',
    nameRu: 'Динамит',
    nameEn: 'Dynamite',
    effect: 'Блокирует сбор дохода врага на 24ч',
    effectEn: 'Blocks enemy income collection for 24h',
    cost: 30,
    currency: 'stars',
    assetKey: 'explosives/bochka_porokha',
  },
];

export const CAVE_BOOSTERS: CaveBoosterDef[] = [
  { id: 'health_potion', nameRu: 'Зелье здоровья', nameEn: 'Health Potion', effect: '+30 макс. HP', effectEn: '+30 Max HP', cost: 15, currency: 'stars', assetKey: 'cave_boosters/zdravie' },
  { id: 'strength_potion', nameRu: 'Зелье силы', nameEn: 'Strength Potion', effect: '+15 атака', effectEn: '+15 Attack', cost: 15, currency: 'stars', assetKey: 'cave_boosters/sila' },
  { id: 'fortitude_potion', nameRu: 'Зелье стойкости', nameEn: 'Fortitude Potion', effect: '+15 защита', effectEn: '+15 Defense', cost: 15, currency: 'stars', assetKey: 'cave_boosters/stoykost' },
  { id: 'holy_light', nameRu: 'Святой свет', nameEn: 'Holy Light', effect: '-10% урона монстра', effectEn: '-10% monster damage', cost: 20, currency: 'stars', assetKey: 'cave_boosters/svyatoy_svet' },
];

/** Get weapon by ID */
export function getWeaponById(id: string): WeaponDef | undefined {
  return WEAPONS.find(w => w.id === id);
}

/** Get armor by ID */
export function getArmorById(id: string): ArmorDef | undefined {
  return ARMOR.find(a => a.id === id);
}
