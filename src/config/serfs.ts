/**
 * HOLOP Serf / Holop System — Profession Definitions
 */

export interface SerfProfessionDef {
  id: string;
  nameRu: string;
  nameEn: string;
  goldBonus: number;
  dropWeight: number;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
  assetKey: string;
}

export interface SerfProtectionDef {
  id: string;
  nameRu: string;
  nameEn: string;
  effect: string;
  effectEn: string;
  cost: number;
  currency: 'stars';
  assetKey: string;
}

export const SERF_PROFESSIONS: SerfProfessionDef[] = [
  { id: 'plowman', nameRu: 'Пахарь', nameEn: 'Plowman', goldBonus: 0, dropWeight: 20, rarity: 'common', assetKey: 'holop_professions/pakhar' },
  { id: 'spy', nameRu: 'Лазутчик', nameEn: 'Spy', goldBonus: 0.10, dropWeight: 25, rarity: 'common', assetKey: 'holop_professions/lazutchik' },
  { id: 'warrior', nameRu: 'Воин', nameEn: 'Warrior', goldBonus: 0.15, dropWeight: 15, rarity: 'uncommon', assetKey: 'holop_professions/voin' },
  { id: 'craftsman_serf', nameRu: 'Ремесленник', nameEn: 'Craftsman', goldBonus: 0.25, dropWeight: 15, rarity: 'uncommon', assetKey: 'holop_professions/remeslennik' },
  { id: 'architect', nameRu: 'Зодчий', nameEn: 'Architect', goldBonus: 0.35, dropWeight: 10, rarity: 'rare', assetKey: 'holop_professions/zodchiy' },
  { id: 'mage', nameRu: 'Волхв', nameEn: 'Mage', goldBonus: 0.50, dropWeight: 3, rarity: 'epic', assetKey: 'holop_professions/volkhv' },
];

export const SERF_PROTECTION: SerfProtectionDef[] = [
  { id: 'knut', nameRu: 'Кнут', nameEn: 'Whip', effect: 'Блокирует захват на 24ч', effectEn: 'Blocks capture for 24h', cost: 50, currency: 'stars', assetKey: 'holop_protection/knut' },
  { id: 'strazha', nameRu: 'Стража', nameEn: 'Guard', effect: 'Блокирует захват на 24ч', effectEn: 'Blocks capture for 24h', cost: 100, currency: 'stars', assetKey: 'holop_protection/strazha' },
  { id: 'volnaya_gramota', nameRu: 'Вольная грамота', nameEn: 'Freedom Charter', effect: 'Холоп становится свободным', effectEn: 'Serf becomes free', cost: 200, currency: 'stars', assetKey: 'holop_protection/volnaya_gramota' },
];

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
