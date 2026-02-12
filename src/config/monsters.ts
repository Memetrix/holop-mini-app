/**
 * HOLOP Monster Roster
 * 10 monsters from Slavic mythology for the Cave/Dungeon system
 */

export interface MonsterDef {
  level: number;
  id: string;
  nameRu: string;
  nameEn: string;
  atk: number;
  def: number;
  hp: number;
  silverLoot: number;
  goldChance: number;
  reputation: number;
  assetKey: string;
}

export const MONSTERS: MonsterDef[] = [
  {
    level: 1,
    id: 'volkolak',
    nameRu: 'Волколак',
    nameEn: 'Werewolf',
    atk: 20,
    def: 12,
    hp: 50,
    silverLoot: 100,
    goldChance: 0.05,
    reputation: 10,
    assetKey: 'monsters/volkolak',
  },
  {
    level: 2,
    id: 'nav',
    nameRu: 'Навь',
    nameEn: 'Spirit',
    atk: 28,
    def: 16,
    hp: 64,
    silverLoot: 180,
    goldChance: 0.10,
    reputation: 20,
    assetKey: 'monsters/nav',
  },
  {
    level: 3,
    id: 'upyr',
    nameRu: 'Упырь',
    nameEn: 'Vampire',
    atk: 36,
    def: 22,
    hp: 80,
    silverLoot: 324,
    goldChance: 0.15,
    reputation: 30,
    assetKey: 'monsters/upyr',
  },
  {
    level: 4,
    id: 'zmey',
    nameRu: 'Змей Горыныч',
    nameEn: 'Dragon',
    atk: 48,
    def: 30,
    hp: 96,
    silverLoot: 583,
    goldChance: 0.20,
    reputation: 40,
    assetKey: 'monsters/zmey_gorynych',
  },
  {
    level: 5,
    id: 'leshiy',
    nameRu: 'Леший',
    nameEn: 'Forest Spirit',
    atk: 55,
    def: 35,
    hp: 110,
    silverLoot: 1050,
    goldChance: 0.25,
    reputation: 50,
    assetKey: 'monsters/leshiy',
  },
  {
    level: 6,
    id: 'koschei',
    nameRu: 'Кощей',
    nameEn: 'Koschei',
    atk: 65,
    def: 45,
    hp: 130,
    silverLoot: 1889,
    goldChance: 0.30,
    reputation: 60,
    assetKey: 'monsters/koschey',
  },
  {
    level: 7,
    id: 'baba_yaga',
    nameRu: 'Баба Яга',
    nameEn: 'Baba Yaga',
    atk: 75,
    def: 52,
    hp: 148,
    silverLoot: 3401,
    goldChance: 0.35,
    reputation: 70,
    assetKey: 'monsters/baba_yaga',
  },
  {
    level: 8,
    id: 'vodyanoy',
    nameRu: 'Водяной Царь',
    nameEn: 'Water King',
    atk: 85,
    def: 59,
    hp: 166,
    silverLoot: 6122,
    goldChance: 0.40,
    reputation: 80,
    assetKey: 'monsters/vodyanoy_tsar',
  },
  {
    level: 9,
    id: 'zhar_ptitsa',
    nameRu: 'Жар-Птица',
    nameEn: 'Firebird',
    atk: 95,
    def: 66,
    hp: 184,
    silverLoot: 11019,
    goldChance: 0.45,
    reputation: 90,
    assetKey: 'monsters/zhar_ptitsa',
  },
  {
    level: 10,
    id: 'chernobog',
    nameRu: 'Чернобог',
    nameEn: 'Dark God',
    atk: 110,
    def: 80,
    hp: 220,
    silverLoot: 19835,
    goldChance: 0.50,
    reputation: 100,
    assetKey: 'monsters/chernobog',
  },
];

/** Get resurrection cost in Stars */
export function getResurrectionCost(monsterLevel: number): number {
  return 10 + 5 * monsterLevel;
}

/** Get monster by ID */
export function getMonsterById(id: string): MonsterDef | undefined {
  return MONSTERS.find(m => m.id === id);
}

/** Get monsters for Dark Cave (levels 1-5) */
export function getDarkCaveMonsters(): MonsterDef[] {
  return MONSTERS.filter(m => m.level <= 5);
}

/** Get monsters for Glory Cave (levels 6-10) */
export function getGloryCaveMonsters(): MonsterDef[] {
  return MONSTERS.filter(m => m.level >= 6);
}
