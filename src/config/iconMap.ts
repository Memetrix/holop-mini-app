/**
 * Icon Map — centralized emoji-to-asset-key mapping
 * Replaces all emoji usage in the UI with CDN WebP icons.
 * Used by the <Icon> component and directly via getAssetUrl().
 */

export const ICON_MAP: Record<string, string> = {
  // ─── Hub / Main Navigation ───
  bank: 'ui_main/ui_bank',
  clan: 'ui_main/ui_knyazhestva',
  office: 'ui_territory/ui_palace',
  daily: 'ui_main/ui_bonus',
  leaderboard: 'ui_main/ui_ratings',
  achievements: 'ui_territory/ui_achievements',
  seasons: 'ui_ratings/ui_seasonal',
  referrals: 'ui_main/ui_referrals',
  settings: 'ui_misc/ui_profile',
  help: 'ui_misc/ui_profile',
  profile: 'ui_misc/ui_profile',

  // ─── Tab Bar Sections ───
  territory: 'ui_main/ui_territory',
  serfs: 'ui_main/ui_holopy',
  raids: 'ui_main/ui_nabegi',
  caves: 'ui_main/ui_caves',
  shop: 'ui_main/ui_shop',

  // ─── Territory Actions ───
  build: 'ui_territory/ui_build',
  upgrade: 'ui_territory/ui_upgrade',
  collect: 'ui_territory/ui_collect_income',
  victory: 'ui_main/ui_victory',
  defeat: 'ui_main/ui_defeat',
  construction: 'ui_main/ui_construction',
  building_upgrade: 'ui_main/ui_building_upgrade',

  // ─── Currencies ───
  silver: 'currencies/silver',
  gold: 'currencies/gold',
  stars: 'currencies/stars',
  reputation: 'currencies/reputation',

  // ─── Raids / Explosives ───
  bomb: 'explosives/bochka_porokha',
  flint: 'explosives/ognivo',
  master_defuse: 'explosives/porokhovykh_del_master',

  // ─── Serfs ───
  frog: 'potions/frog_potion',
  shield: 'holop_protection/strazha',
  knut: 'holop_protection/knut',
  oprichniki: 'holop_protection/oprichniki',
  volnaya: 'holop_protection/volnaya_gramota',

  // ─── Serf Professions ───
  prof_pakhar: 'holop_professions/pakhar',
  prof_remeslennik: 'holop_professions/remeslennik',
  prof_voin: 'holop_professions/voin',
  prof_zodchiy: 'holop_professions/zodchiy',
  prof_lazutchik: 'holop_professions/lazutchik',
  prof_volkhv: 'holop_professions/volkhv',

  // ─── Office / Palace Items ───
  bench: 'palace/skameya',
  scribe: 'palace/stol',
  carpet: 'palace/kovyor',
  icon_painting: 'palace/ikona',
  crown: 'palace/korona_monomakha',
  orb: 'palace/derzhava',
  ark: 'palace/zolotoy_kovcheg',
  throne: 'palace/tron',

  // ─── Shop Tabs ───
  lootbox: 'ui_shop/ui_lootboxes',
  consumables: 'ui_shop/ui_consumables',
  druzhina: 'ui_shop/ui_druzhina',
  profile_icons: 'ui_shop/ui_profile_icons',

  // ─── Caves ───
  dark_cave: 'ui_caves/ui_dark_cave',
  glory_cave: 'ui_caves/ui_glory_cave',

  // ─── Leaderboard Tabs ───
  lb_income: 'ui_ratings/ui_by_income',
  lb_serfs: 'ui_ratings/ui_by_holops',
  lb_battles: 'ui_ratings/ui_by_wins',
  lb_clans: 'ui_ratings/ui_by_knyazhestva',
  lb_diggers: 'ui_ratings/ui_rudoznatsy',
  lb_reputation: 'ui_ratings/ui_by_reputation',
  lb_season: 'ui_ratings/ui_seasonal',

  // ─── Bank ───
  bank_gold: 'ui_bank/ui_gold',
  bank_silver: 'ui_bank/ui_silver',

  // ─── Misc UI ───
  back: 'ui_misc/ui_back',
  referral_link: 'ui_misc/ui_referral_link',
  season_points: 'ui_territory/ui_season_points',
};
