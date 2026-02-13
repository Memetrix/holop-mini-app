/**
 * Lootbox Configuration — synced with bot lootbox_handlers.py
 * Normal = gold currency, Premium = stars currency
 * Drop tables with weighted probabilities
 */

// ─── Drop Category Types ───
export type DropCategory = 'silver' | 'army' | 'office' | 'icon' | 'consumable';

export interface DropItem {
  id: string;
  nameRu: string;
  nameEn: string;
  category: DropCategory;
  weight: number;
  /** For silver drops — range of coins */
  silverRange?: [number, number];
  /** For item drops — item ID reference */
  itemId?: string;
  /** Rarity label */
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface LootboxDef {
  id: 'normal' | 'premium';
  nameRu: string;
  nameEn: string;
  descRu: string;
  descEn: string;
  currency: 'gold' | 'stars';
  price: number;
  emoji: string;
  bulkOptions: number[];
  drops: DropItem[];
}

// ─── Normal Lootbox — 100 gold ───
const NORMAL_DROPS: DropItem[] = [
  // Silver (45% total)
  { id: 'n_silver_low', nameRu: '50-200 серебра', nameEn: '50-200 silver', category: 'silver', weight: 25, silverRange: [50, 200], rarity: 'common' },
  { id: 'n_silver_mid', nameRu: '201-500 серебра', nameEn: '201-500 silver', category: 'silver', weight: 15, silverRange: [201, 500], rarity: 'uncommon' },
  { id: 'n_silver_high', nameRu: '501-1000 серебра', nameEn: '501-1000 silver', category: 'silver', weight: 5, silverRange: [501, 1000], rarity: 'rare' },
  // Army items (25%)
  { id: 'n_dubina', nameRu: 'Дубина', nameEn: 'Club', category: 'army', weight: 8, itemId: 'dubina', rarity: 'common' },
  { id: 'n_tulup', nameRu: 'Тулуп', nameEn: 'Sheepskin Coat', category: 'army', weight: 8, itemId: 'tulup', rarity: 'common' },
  { id: 'n_topor', nameRu: 'Топор', nameEn: 'Axe', category: 'army', weight: 5, itemId: 'topor', rarity: 'uncommon' },
  { id: 'n_kolchuga', nameRu: 'Кольчуга', nameEn: 'Chainmail', category: 'army', weight: 4, itemId: 'kolchuga', rarity: 'uncommon' },
  // Office items (20%)
  { id: 'n_skameya', nameRu: 'Дубовая скамья', nameEn: 'Oak Bench', category: 'office', weight: 10, itemId: 'skameya', rarity: 'common' },
  { id: 'n_stol', nameRu: 'Стол с грамотами', nameEn: 'Desk with Documents', category: 'office', weight: 6, itemId: 'stol', rarity: 'uncommon' },
  { id: 'n_tron', nameRu: 'Резной трон', nameEn: 'Carved Throne', category: 'office', weight: 4, itemId: 'tron', rarity: 'rare' },
  // Profile icons (10%)
  { id: 'n_ladya', nameRu: 'Ладья', nameEn: 'Ship', category: 'icon', weight: 4, itemId: 'ladya', rarity: 'common' },
  { id: 'n_zvezda', nameRu: 'Звезда', nameEn: 'Star', category: 'icon', weight: 4, itemId: 'zvezda', rarity: 'common' },
  { id: 'n_ogon', nameRu: 'Огонь', nameEn: 'Fire', category: 'icon', weight: 2, itemId: 'ogon', rarity: 'uncommon' },
];

// ─── Premium Lootbox — 10 stars ───
const PREMIUM_DROPS: DropItem[] = [
  // Silver (20% consolation)
  { id: 'p_silver_low', nameRu: '100-400 серебра', nameEn: '100-400 silver', category: 'silver', weight: 12, silverRange: [100, 400], rarity: 'common' },
  { id: 'p_silver_mid', nameRu: '401-800 серебра', nameEn: '401-800 silver', category: 'silver', weight: 6, silverRange: [401, 800], rarity: 'uncommon' },
  { id: 'p_silver_high', nameRu: '801-1500 серебра', nameEn: '801-1500 silver', category: 'silver', weight: 2, silverRange: [801, 1500], rarity: 'rare' },
  // Rare army (25%)
  { id: 'p_mech', nameRu: 'Меч', nameEn: 'Sword', category: 'army', weight: 7, itemId: 'mech', rarity: 'uncommon' },
  { id: 'p_bakhterets', nameRu: 'Бахтерец', nameEn: 'Scale Armor', category: 'army', weight: 6, itemId: 'bakhterets', rarity: 'uncommon' },
  { id: 'p_sablya', nameRu: 'Сабля', nameEn: 'Sabre', category: 'army', weight: 6, itemId: 'sablya', rarity: 'rare' },
  { id: 'p_zertsalo', nameRu: 'Зерцало', nameEn: 'Mirror Shield', category: 'army', weight: 6, itemId: 'zertsalo', rarity: 'rare' },
  // Premium army (10%)
  { id: 'p_pishchal', nameRu: 'Пищаль', nameEn: 'Musket', category: 'army', weight: 6, itemId: 'pishchal', rarity: 'epic' },
  { id: 'p_dospekh', nameRu: 'Доспех княжий', nameEn: "Prince's Armor", category: 'army', weight: 4, itemId: 'dospekh_knyazhiy', rarity: 'epic' },
  // Expensive office (20%)
  { id: 'p_kovyor', nameRu: 'Персидский ковёр', nameEn: 'Persian Carpet', category: 'office', weight: 8, itemId: 'kovyor', rarity: 'uncommon' },
  { id: 'p_ikona', nameRu: 'Древняя икона', nameEn: 'Ancient Icon', category: 'office', weight: 6, itemId: 'ikona', rarity: 'rare' },
  { id: 'p_korona_m', nameRu: 'Корона Мономаха', nameEn: "Monomakh's Crown", category: 'office', weight: 4, itemId: 'korona_monomakha', rarity: 'epic' },
  { id: 'p_derzhava', nameRu: 'Держава', nameEn: 'Scepter', category: 'office', weight: 2, itemId: 'derzhava', rarity: 'legendary' },
  // Premium icons (15%)
  { id: 'p_almaz', nameRu: 'Алмаз', nameEn: 'Diamond', category: 'icon', weight: 5, itemId: 'almaz', rarity: 'rare' },
  { id: 'p_korona', nameRu: 'Корона', nameEn: 'Crown', category: 'icon', weight: 5, itemId: 'korona', rarity: 'rare' },
  { id: 'p_serdtse', nameRu: 'Сердце (+50% HP)', nameEn: 'Heart (+50% HP regen)', category: 'icon', weight: 3, itemId: 'serdtse', rarity: 'epic' },
  { id: 'p_meshok', nameRu: 'Мешок (+5% доход)', nameEn: 'Silver Bag (+5% income)', category: 'icon', weight: 2, itemId: 'meshok', rarity: 'legendary' },
  // Consumables (10%)
  { id: 'p_rov', nameRu: 'Ров с кольями ×2', nameEn: 'Ditch with Stakes ×2', category: 'consumable', weight: 6, itemId: 'rov', rarity: 'uncommon' },
  { id: 'p_ognivo', nameRu: 'Огниво', nameEn: 'Flint', category: 'consumable', weight: 4, itemId: 'ognivo', rarity: 'rare' },
];

// ─── Lootbox Definitions ───
export const LOOTBOXES: LootboxDef[] = [
  {
    id: 'normal',
    nameRu: 'Обычный лутбокс',
    nameEn: 'Normal Lootbox',
    descRu: 'Содержит оружие, броню, предметы для приказной избы и серебро',
    descEn: 'Contains weapons, armor, office items, and silver',
    currency: 'gold',
    price: 100,
    emoji: '📦',
    bulkOptions: [1, 5, 10],
    drops: NORMAL_DROPS,
  },
  {
    id: 'premium',
    nameRu: 'Премиум лутбокс',
    nameEn: 'Premium Lootbox',
    descRu: 'Улучшенный дроп! Редкое оружие, ценная мебель и уникальные иконки',
    descEn: 'Improved drops! Rare weapons, valuable furniture, and unique icons',
    currency: 'stars',
    price: 10,
    emoji: '⭐',
    bulkOptions: [1, 5],
    drops: PREMIUM_DROPS,
  },
];

// ─── Helper: Roll a random drop ───
export function rollDrop(lootbox: LootboxDef): DropItem {
  const totalWeight = lootbox.drops.reduce((sum, d) => sum + d.weight, 0);
  let roll = Math.random() * totalWeight;
  for (const drop of lootbox.drops) {
    roll -= drop.weight;
    if (roll <= 0) return drop;
  }
  return lootbox.drops[lootbox.drops.length - 1];
}

// ─── Helper: Get silver amount from a silver drop ───
export function rollSilverAmount(drop: DropItem): number {
  if (!drop.silverRange) return 0;
  const [min, max] = drop.silverRange;
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Rarity colors ───
export const RARITY_COLORS: Record<string, string> = {
  common: '#B0B0B0',
  uncommon: '#4CAF50',
  rare: '#2196F3',
  epic: '#9C27B0',
  legendary: '#FF9800',
};

// ─── Drop chance as percentage ───
export function getDropChance(lootbox: LootboxDef, drop: DropItem): number {
  const totalWeight = lootbox.drops.reduce((sum, d) => sum + d.weight, 0);
  return Math.round((drop.weight / totalWeight) * 100);
}
