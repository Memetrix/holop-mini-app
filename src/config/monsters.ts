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
    atk: 15,
    def: 10,
    hp: 40,
    silverLoot: 100,
    goldChance: 0.05,
    reputation: 10,
    assetKey: 'monsters/volkolak',
  },
  {
    level: 2,
    id: 'upyr',
    nameRu: 'Упырь',
    nameEn: 'Ghoul',
    atk: 25,
    def: 17,
    hp: 58,
    silverLoot: 180,
    goldChance: 0.10,
    reputation: 20,
    assetKey: 'monsters/upyr',
  },
  {
    level: 3,
    id: 'leshiy',
    nameRu: 'Леший',
    nameEn: 'Leshy',
    atk: 35,
    def: 24,
    hp: 76,
    silverLoot: 324,
    goldChance: 0.15,
    reputation: 30,
    assetKey: 'monsters/leshiy',
  },
  {
    level: 4,
    id: 'nav',
    nameRu: 'Навь',
    nameEn: 'Nav',
    atk: 45,
    def: 31,
    hp: 94,
    silverLoot: 583,
    goldChance: 0.20,
    reputation: 40,
    assetKey: 'monsters/nav',
  },
  {
    level: 5,
    id: 'zmey',
    nameRu: 'Змей Горыныч',
    nameEn: 'Zmey Gorynych',
    atk: 55,
    def: 38,
    hp: 112,
    silverLoot: 1050,
    goldChance: 0.25,
    reputation: 50,
    assetKey: 'monsters/zmey_gorynych',
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
