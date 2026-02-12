# HOLOP Product Bible

> Single source of truth for the HOLOP Telegram Mini App.
> All game data, mechanics, balancing numbers, and frontend specifications.

---

## Table of Contents

1. [Game Overview](#1-game-overview)
2. [Core Loop](#2-core-loop)
3. [Currencies](#3-currencies)
4. [Buildings (Territory System)](#4-buildings-territory-system)
5. [Title / Rank System](#5-title--rank-system)
6. [PvP Raid System](#6-pvp-raid-system)
7. [Cave / Dungeon System (PvE)](#7-cave--dungeon-system-pve)
8. [Serf / Holop System](#8-serf--holop-system)
9. [Shop System](#9-shop-system)
10. [Clan / Principality System](#10-clan--principality-system)
11. [Daily Bonus](#11-daily-bonus)
12. [Mock Data for Frontend](#12-mock-data-for-frontend)
13. [Navigation Structure](#13-navigation-structure)
14. [Asset URLs](#14-asset-urls)
15. [Key Design Decisions](#15-key-design-decisions)

---

## 1. Game Overview

| Field | Value |
|-------|-------|
| **Name** | HOLOP |
| **Genre** | Idle economic simulator |
| **Setting** | Ancient Russia, Slavic mythology |
| **Platform** | Telegram Mini App (WebApp API) |
| **Mascot** | Eremka / Ерёмка -- chibi medieval Russian peasant boy |
| **Season 1** | "Великий Передел" (The Great Division) |
| **Language** | Russian (default), English (supported) |
| **Target** | Mobile-first, 375--428px viewport |

### Premise

The player begins as a lowly Смерд (serf) in medieval Russia and climbs through 12 social ranks all the way to Царь (Tsar). Along the way they build settlements, raid other players, capture serfs, conquer mythological dungeons, and join clans -- all set against a backdrop of Slavic folklore and ancient Russian culture.

---

## 2. Core Loop

```
Build settlements
    --> Earn silver (hourly passive income)
        --> Upgrade title (unlock new ranks)
            --> Unlock mechanics (PvP, caves, clans)
                --> Raid other players (steal silver)
                    --> Capture serfs (earn gold)
                        --> Conquer dungeons (reputation + loot)
                            --> Join clans (bonuses + wars)
                                --> Loop back: reinvest into buildings
```

**Primary loop**: Build --> Earn --> Upgrade --> Unlock
**Secondary loops**: Raid --> Loot, Cave --> Reputation, Serf --> Gold

---

## 3. Currencies

### Currency Table

| Currency | Symbol | Purpose | Source |
|----------|--------|---------|--------|
| Silver | `silver` | Main resource for buildings, upgrades, shop | Buildings hourly income, raids, daily bonus |
| Gold | `gold` | Premium in-game currency | Serfs passive income, caves, converting stars |
| Stars | `stars` | Real-money premium currency | Telegram Stars payment |
| Referral Stars | `ref_stars` | Referral reward currency | Inviting friends via referral link |
| Reputation | `reputation` | Separate progression track | Palace items, cave completions, achievements |

### Starting Balances

```json
{
  "silver": 1000,
  "gold": 10,
  "stars": 0,
  "ref_stars": 0,
  "reputation": 0
}
```

### Maximum Caps

| Currency | Max Value |
|----------|-----------|
| Silver | 999,999,999,999 |
| Gold | 999,999 |
| Stars | No cap |
| Referral Stars | No cap |
| Reputation | 999,999 |

### Display Format

- Silver: compact notation with `K`, `M`, `B` suffixes (e.g. `847.3K`)
- Gold: full number up to 999,999
- Stars: full number
- Reputation: full number

---

## 4. Buildings (Territory System)

### Overview

Buildings are the primary income source. Each building generates silver per hour passively. Players unlock buildings progressively as they advance through titles.

### Building Mechanics

| Mechanic | Value |
|----------|-------|
| Max Level per building | 15 |
| Levels 1--10 | Upgraded with Silver |
| Levels 11--15 | Upgraded with Gold |
| Cost formula | `base_cost * cost_multiplier ^ (level - 1)` |
| Income formula | `base_income * income_multiplier ^ (level - 1)` |
| Upgrade cooldown | 30 minutes |
| Speed-up upgrade | Costs Stars (instant) |
| Default cost_multiplier | 1.9 (unless overridden) |
| Default income_multiplier | 1.5 (unless overridden) |
| Default max_level | 15 |

### Tier 1 -- Early Game (Silver Only)

| # | Emoji | ID | Name RU | Name EN | Base Cost | Base Income | cost_mult | income_mult | max_level | Notes |
|---|-------|----|---------|---------|-----------|-------------|-----------|-------------|-----------|-------|
| 1 | `izba_icon` | `izba` | Изба | Hut | 200 silver | +8/hr | 1.9 | 1.5 | 15 | Starting building |
| 2 | `pashnya_icon` | `pashnya` | Пашня | Arable Land | 500 silver | +15/hr | 1.9 | 1.5 | 15 | Requires Pashnya lvl 2 before Ambar unlocks |
| 3 | `ambar_icon` | `ambar` | Амбар | Barn | 1,000 silver | +20/hr | 1.9 | 1.5 | 15 | -- |
| 4 | `melnitsa_icon` | `melnitsa` | Мельница | Mill | 2,000 silver | +30/hr | 1.9 | 1.5 | 15 | -- |
| 5 | `konyushni_icon` | `konyushni` | Конюшни | Stables | 4,000 silver | +40/hr | 1.9 | 1.5 | 15 | -- |
| 6 | `kuznitsa_icon` | `kuznitsa` | Кузница | Smithy | 6,000 silver | +50/hr | 1.9 | 1.5 | 15 | -- |

### Tier 2--3 -- Mid Game

| # | Emoji | ID | Name RU | Name EN | Base Cost | Base Income | cost_mult | income_mult | max_level | Notes |
|---|-------|----|---------|---------|-----------|-------------|-----------|-------------|-----------|-------|
| 7 | `torg_icon` | `torg` | Торг | Market | 20,000 silver | +100/hr | 1.9 | 1.5 | 15 | -- |
| 8 | `skotny_dvor_icon` | `skotny_dvor` | Скотный двор | Cattle Yard | 60,000 silver | +200/hr | 1.9 | 1.5 | 15 | -- |
| 9 | `vinokurnya_icon` | `vinokurnya` | Винокурня | Distillery | 180,000 silver | +400/hr | 1.9 | 1.5 | 15 | -- |

### Tier 4--5 -- Late Game

| # | Emoji | ID | Name RU | Name EN | Base Cost | Base Income | cost_mult | income_mult | max_level | Notes |
|---|-------|----|---------|---------|-----------|-------------|-----------|-------------|-----------|-------|
| 10 | `terem_icon` | `terem` | Терем | Mansion | 500,000 silver | +800/hr | 1.9 | 1.5 | 15 | -- |
| 11 | `krepost_icon` | `krepost` | Крепость | Fortress | 1,500,000 silver | +2,000/hr | 1.9 | 1.5 | 15 | -- |
| 12 | `kreml_icon` | `kreml` | Кремль | Kremlin | 5,000,000 silver | +5,000/hr | 1.9 | 1.5 | 15 | -- |

### Special Buildings

| Emoji | ID | Name RU | Name EN | Description |
|-------|----|---------|---------|-------------|
| `hram_icon` | `hram` | Храм | Temple | Religious building |
| `monastyr_icon` | `monastyr` | Монастырь | Monastery | Religious building |
| `knyazhiy_dvor_icon` | `knyazhiy_dvor` | Княжий двор | Prince Court | Administrative |
| `zlatoglavyi_sobor_icon` | `zlatoglavyi_sobor` | Златоглавый собор | Cathedral | Grand religious building |
| `zastenok_icon` | `zastenok` | Застенок | Dungeon | Serf/interrogation building |
| `taynaya_kantselyariya_icon` | `taynaya_kantselyariya` | Тайная канцелярия | Secret Office | Espionage building |
| `vestovaya_bashnya_icon` | `vestovaya_bashnya` | Вестовая башня | Herald Tower | Communication building |
| `dom_druzey_icon` | `dom_druzey` | Дом друзей | House of Friends | Referral building |

### Cost & Income Tables (Example: Izba)

| Level | Cost | Income/hr | Currency |
|-------|------|-----------|----------|
| 1 | 200 | 8 | Silver |
| 2 | 380 | 12 | Silver |
| 3 | 722 | 18 | Silver |
| 4 | 1,372 | 27 | Silver |
| 5 | 2,607 | 40 | Silver |
| 6 | 4,953 | 61 | Silver |
| 7 | 9,411 | 91 | Silver |
| 8 | 17,881 | 137 | Silver |
| 9 | 33,974 | 205 | Silver |
| 10 | 64,551 | 308 | Silver |
| 11 | -- | -- | Gold |
| 12 | -- | -- | Gold |
| 13 | -- | -- | Gold |
| 14 | -- | -- | Gold |
| 15 | -- | -- | Gold |

> Formula: `cost(L) = 200 * 1.9^(L-1)`, `income(L) = 8 * 1.5^(L-1)`

---

## 5. Title / Rank System

Players progress through 12 titles based on their total hourly income. Each title unlocks new mechanics and increases serf capacity.

### All 12 Titles

| Level | Emoji | Title RU | Title EN | Income Threshold | Serf Slots | Special Unlock | Approx Time |
|-------|-------|----------|----------|-----------------|------------|----------------|-------------|
| 1 | `smerd_icon` | Смерд | Serf | 0/hr | 2 | Starting rank | -- |
| 2 | `holop_icon` | Холоп | Bondsman | 15/hr | 3 | -- | ~1 day |
| 3 | `chelyadin_icon` | Челядин | Servant | 35/hr | 4 | Dark Cave unlocked | -- |
| 4 | `remeslennik_icon` | Ремесленник | Craftsman | 70/hr | 5 | Glory Cave unlocked | -- |
| 5 | `posadskiy_icon` | Посадский | Townsman | 120/hr | 5 | -- | -- |
| 6 | `kupets_icon` | Купец | Merchant | 200/hr | 6 | **PVP ENABLED** | -- |
| 7 | `boyarin_icon` | Боярин | Boyar | 400/hr | 7 | Loot +15% | -- |
| 8 | `voevoda_icon` | Воевода | Voivode | 1,000/hr | 8 | Attack +20% | -- |
| 9 | `namestnik_icon` | Наместник | Governor | 2,500/hr | 9 | -- | -- |
| 10 | `knyaz_icon` | Князь | Prince | 6,000/hr | 10 | Attack +30%, Defense +30% | -- |
| 11 | `velikiy_knyaz_icon` | Великий Князь | Grand Prince | 15,000/hr | 12 | -- | -- |
| 12 | `tsar_icon` | Царь | Tsar | 40,000/hr | 15 | **RAID IMMUNITY** | -- |

### Title Progression Logic

```
if (player.hourly_income >= title_threshold[next_level]) {
    player.title_level += 1;
    player.serf_slots = title_serf_slots[player.title_level];
    // Check for special unlocks
}
```

### Key Milestones

- **Title 3 (Servant)**: Dark Cave unlocks -- first PvE content
- **Title 4 (Craftsman)**: Glory Cave unlocks -- harder PvE content
- **Title 6 (Merchant)**: PvP raids unlock -- competitive play begins
- **Title 7 (Boyar)**: Clan creation unlocked, +15% loot
- **Title 8 (Voivode)**: +20% attack bonus
- **Title 10 (Prince)**: +30% attack AND +30% defense
- **Title 12 (Tsar)**: Full raid immunity -- ultimate goal

---

## 6. PvP Raid System

### Unlock Condition

PvP raids unlock at **Title 6 (Merchant, 200/hr income)**.

### Combat Stats

| Stat | Base Value | Notes |
|------|-----------|-------|
| Max Health | 100 HP | Shared with PvE |
| Health Regen | +1 HP/min | Passive regeneration |
| Base Damage | 20--40 | Random range per attack |
| Loot Percentage | ~30% | Of defender's current silver |

### Raid Mechanics

| Mechanic | Value |
|----------|-------|
| Cooldown between raids | 1--5 minutes |
| Robin Hood bonus | +5% loot per title difference (attacker lower than defender) |
| Iron Dome | Blocks ALL incoming attacks for 24 hours (costs Stars) |
| Dynamite | Blocks enemy silver collection for 24 hours |
| Stone Wall | -20% incoming damage (single use, consumed on hit) |

### Loot Formula

```
base_loot = defender.silver * 0.30
robin_hood_bonus = max(0, defender.title_level - attacker.title_level) * 0.05
total_loot = base_loot * (1 + robin_hood_bonus)
```

### Raid Flow

1. Player selects "Raid" tab
2. System shows random opponent (within title range)
3. Player attacks (20--40 damage per hit)
4. If defender HP reaches 0: attacker wins, steals ~30% silver
5. If attacker HP reaches 0: raid fails, no loot
6. Cooldown starts (1--5 min)

---

## 7. Cave / Dungeon System (PvE)

### Two Cave Types

| Cave | Unlock | Description |
|------|--------|-------------|
| **Тёмная пещера** (Dark Cave) | Title 3 (Servant) | Beginner dungeon, easier monsters |
| **Пещера славы** (Glory Cave) | Title 4 (Craftsman) | Advanced dungeon, harder monsters |

### Monster Roster (10 Monsters, Slavic Mythology)

| # | Emoji | ID | Name RU | Name EN | ATK | DEF | HP | Silver Loot | Gold Chance | Reputation |
|---|-------|----|---------|---------|-----|-----|-----|-------------|-------------|------------|
| 1 | `volkolak_icon` | `volkolak` | Волколак | Werewolf | 20 | 12 | 50 | 100 | 5% | 10 |
| 2 | `nav_icon` | `nav` | Навь | Spirit | 28 | 16 | 64 | 180 | 10% | 20 |
| 3 | `upyr_icon` | `upyr` | Упырь | Vampire | 36 | 22 | 80 | 324 | 15% | 30 |
| 4 | `zmey_icon` | `zmey` | Змей Горыныч | Dragon | 48 | 30 | 96 | 583 | 20% | 40 |
| 5 | `leshiy_icon` | `leshiy` | Леший | Forest Spirit | 55 | 35 | 110 | 1,050 | 25% | 50 |
| 6 | `koschei_icon` | `koschei` | Кощей | Koschei | 65 | 45 | 130 | 1,889 | 30% | 60 |
| 7 | `baba_yaga_icon` | `baba_yaga` | Баба Яга | Baba Yaga | 75 | 52 | 148 | 3,401 | 35% | 70 |
| 8 | `vodyanoy_icon` | `vodyanoy` | Водяной Царь | Water King | 85 | 59 | 166 | 6,122 | 40% | 80 |
| 9 | `zhar_ptitsa_icon` | `zhar_ptitsa` | Жар-Птица | Firebird | 95 | 66 | 184 | 11,019 | 45% | 90 |
| 10 | `chernobog_icon` | `chernobog` | Чернобог | Dark God | 110 | 80 | 220 | 19,835 | 50% | 100 |

### Loot Formulas

```
silver_loot(level) = 100 * 1.8 ^ (level - 1)
gold_chance(level) = 5% + 5% * (level - 1)
reputation(level)  = 10 * level
```

### Resurrection

If the player dies in a cave:

```
resurrection_cost(monster_level) = 10 stars + 5 * monster_level
```

| Monster Level | Resurrection Cost |
|---------------|-------------------|
| 1 | 15 Stars |
| 2 | 20 Stars |
| 3 | 25 Stars |
| 5 | 35 Stars |
| 10 | 60 Stars |

### Cooldown

| Period | Cooldown |
|--------|----------|
| First 3 days after unlock | 8 hours between cave attempts |
| After 3 days | 24 hours between cave attempts |

### Cave Boosters (purchased with Stars)

| Emoji | ID | Name RU | Name EN | Effect | Cost |
|-------|----|---------|---------|--------|------|
| `health_potion_icon` | `health_potion` | Зелье здоровья | Health Potion | +30 Max HP | 15 Stars |
| `strength_potion_icon` | `strength_potion` | Зелье силы | Strength Potion | +15 Attack | 15 Stars |
| `fortitude_potion_icon` | `fortitude_potion` | Зелье стойкости | Fortitude Potion | +15 Defense | 15 Stars |
| `holy_light_icon` | `holy_light` | Святой свет | Holy Light | -10% monster damage | 20 Stars |

---

## 8. Serf / Holop System

### Overview

Players can capture other players as serfs. Serfs generate **Gold** passively (not silver). This is the primary source of gold income in the game.

### Core Mechanics

| Mechanic | Value |
|----------|-------|
| Gold collection interval | Every 30 minutes |
| Serf slots | 2 (Serf) to 15 (Tsar), based on title |
| Capture method | Raid victory or special items |
| Serf escape | Possible if not protected |

### Serf Slots by Title

| Title Level | Title | Serf Slots |
|-------------|-------|------------|
| 1 | Смерд | 2 |
| 2 | Холоп | 3 |
| 3 | Челядин | 4 |
| 4 | Ремесленник | 5 |
| 5 | Посадский | 5 |
| 6 | Купец | 6 |
| 7 | Боярин | 7 |
| 8 | Воевода | 8 |
| 9 | Наместник | 9 |
| 10 | Князь | 10 |
| 11 | Великий Князь | 12 |
| 12 | Царь | 15 |

### Serf Professions

Each captured serf is randomly assigned a profession that affects their gold output.

| Emoji | ID | Profession RU | Profession EN | Gold Bonus | Rarity (drop weight) |
|-------|----|---------------|---------------|-----------|---------------------|
| `plowman_icon` | `plowman` | Пахарь | Plowman | +0% | 20% |
| `craftsman_icon` | `craftsman_serf` | Ремесленник | Craftsman | +25% | 15% |
| `warrior_icon` | `warrior` | Воин | Warrior | +15% | 15% |
| `architect_icon` | `architect` | Зодчий | Architect | +35% | 10% |
| `spy_icon` | `spy` | Лазутчик | Spy | +10% | 25% |
| `mage_icon` | `mage` | Волхв | Mage | +50% | 3% (rare!) |

> **Note**: Remaining 12% is distributed among other/hidden professions or rounding.

### Protection Items

| Emoji | ID | Name RU | Name EN | Effect | Cost |
|-------|----|---------|---------|--------|------|
| `knut_icon` | `knut` | Кнут | Whip | Blocks capture for 24h | 50 Stars |
| `strazha_icon` | `strazha` | Стража | Guard | Blocks capture for 24h | 100 Stars |
| `volnaya_gramota_icon` | `volnaya_gramota` | Вольная грамота | Freedom Charter | Serf becomes free (used by serf) | 200 Stars |
| `zelie_zhabka_icon` | `zelie_zhabka` | Зелье-жабка | Frog Potion | Auto-capture (rare drop) | Rare drop only |

---

## 9. Shop System

### Weapons

| Emoji | ID | Name RU | Name EN | ATK Bonus | Cost | Currency |
|-------|----|---------|---------|-----------|------|----------|
| `dubina_icon` | `dubina` | Дубина | Club | +1 ATK | 100 | Silver |
| `topor_icon` | `topor` | Топор | Axe | +3 ATK | 500 | Silver |
| `mech_icon` | `mech` | Меч | Sword | +5 ATK | 2,000 | Silver |
| `sablya_icon` | `sablya` | Сабля | Saber | +10 ATK | 10,000 | Silver |
| `samostrel_icon` | `samostrel` | Самострел | Crossbow | +12 ATK | 15,000 | Silver |
| `grecheskiy_ogon_icon` | `grecheskiy_ogon` | Греческий огонь | Greek Fire | +25 ATK | 50,000 | Silver |

### Armor

| Emoji | ID | Name RU | Name EN | DEF Bonus | Cost | Currency |
|-------|----|---------|---------|-----------|------|----------|
| `steganka_icon` | `steganka` | Стёганка | Padded Coat | +2 DEF | 200 | Silver |
| `kolchuga_icon` | `kolchuga` | Кольчуга | Chainmail | +5 DEF | 3,000 | Silver |
| `laty_icon` | `laty` | Латы | Steel Plate | +10 DEF | 15,000 | Silver |
| `magic_shield_icon` | `magic_shield` | Магический щит | Magic Shield | +20 DEF | 50,000 | Silver |

### Special / Tactical Items

| Emoji | ID | Name RU | Name EN | Effect | Cost | Currency |
|-------|----|---------|---------|--------|------|----------|
| `iron_dome_icon` | `iron_dome` | Железный купол | Iron Dome | Blocks ALL attacks for 24h | Varies | Stars |
| `stone_wall_icon` | `stone_wall` | Каменная стена | Stone Wall | -20% incoming damage (single use) | Varies | Silver |
| `dynamite_icon` | `dynamite` | Динамит | Dynamite | Blocks enemy city collection for 24h | Varies | Stars |

### Profile Icons

Cosmetic items that also grant small bonuses.

| Emoji | ID | Name EN | Effect | Cost |
|-------|----|---------|--------|------|
| `heart_icon` | `icon_heart` | Heart | +5% HP | 100 Stars |
| `diamond_icon` | `icon_diamond` | Diamond | +5% gold income | 100 Stars |
| `crown_icon` | `icon_crown` | Crown | +5% silver income | 100 Stars |
| `dragon_icon` | `icon_dragon` | Dragon | +5% attack | 100 Stars |
| `eagle_icon` | `icon_eagle` | Eagle | +5% defense | 100 Stars |

---

## 10. Clan / Principality System

### Overview

Clans (called "Княжества" / Principalities) allow players to group together for shared bonuses, wars, and a shared treasury.

### Creation Requirements

| Requirement | Value |
|-------------|-------|
| Minimum Title | Boyar (Level 7) |
| Creation Cost | 25,000 Silver |
| Max Members | 50 |
| Income Bonus | +10% to all members |

### Clan Roles

| Role RU | Role EN | Permissions |
|---------|---------|-------------|
| Великий Князь | Grand Prince | Full control (leader) |
| Князь | Prince | Invite/kick members, manage treasury (officer) |
| Воевода | Voivode | Regular member |

### Clan Features

- **Shared Treasury**: Members contribute silver/gold
- **Clan Wars**: Organized PvP between clans
- **Income Bonus**: All members receive +10% hourly income
- **Clan Chat**: In-game communication
- **Leaderboard**: Clan ranking by total power

---

## 11. Daily Bonus

### Overview

Streak-based daily reward system. Rewards escalate over a 14-day cycle. Missing a day resets the streak to Day 1.

### Mechanics

| Mechanic | Value |
|----------|-------|
| Cycle length | 14 days |
| Reset condition | Miss 1 day |
| Claim window | 24 hours from last claim |

### Reward Structure

| Day | Reward Type | Notes |
|-----|-------------|-------|
| 1 | Silver (small) | Base amount |
| 2 | Silver (small) | Slight increase |
| 3 | Silver (medium) | -- |
| 4 | Silver (medium) | -- |
| 5 | Gold (small) | First gold reward |
| 6 | Silver (large) | -- |
| 7 | Stars (small) | **Milestone: first week** |
| 8 | Silver (large) | -- |
| 9 | Gold (medium) | -- |
| 10 | Silver (large) | -- |
| 11 | Gold (medium) | -- |
| 12 | Silver (large) | -- |
| 13 | Gold (large) | -- |
| 14 | Stars (large) | **Milestone: full cycle** |

> Exact amounts scale with player title level.

---

## 12. Mock Data for Frontend

Use these values for the demo/dev player state. All data is consistent and realistic for a mid-game player.

### Player State

```json
{
  "user": {
    "id": 123456789,
    "username": "test_player",
    "city_name": "Новгород",
    "silver": 847293,
    "gold": 156,
    "stars": 42,
    "reputation": 340,
    "health": 87,
    "max_health": 100,
    "hourly_income": 1250,
    "title_level": 8,
    "title_name": "Воевода",
    "title_name_en": "Voivode",
    "attack": 45,
    "defense": 32,
    "daily_streak": 7,
    "serf_slots": 8,
    "serf_slots_used": 3,
    "clan_id": null,
    "iron_dome_active": false,
    "cave_cooldown_until": null
  }
}
```

### Buildings State

```json
{
  "buildings": [
    {
      "id": "izba",
      "name": "Изба",
      "name_en": "Hut",
      "level": 12,
      "income": 180,
      "max_level": 15,
      "upgrade_currency": "gold",
      "upgrade_cost": 45,
      "cooldown_until": null
    },
    {
      "id": "pashnya",
      "name": "Пашня",
      "name_en": "Arable Land",
      "level": 10,
      "income": 115,
      "max_level": 15,
      "upgrade_currency": "silver",
      "upgrade_cost": 64551,
      "cooldown_until": null
    },
    {
      "id": "kuznitsa",
      "name": "Кузница",
      "name_en": "Smithy",
      "level": 8,
      "income": 192,
      "max_level": 15,
      "upgrade_currency": "silver",
      "upgrade_cost": 107412,
      "cooldown_until": null
    },
    {
      "id": "torg",
      "name": "Торг",
      "name_en": "Market",
      "level": 6,
      "income": 354,
      "max_level": 15,
      "upgrade_currency": "silver",
      "upgrade_cost": 495308,
      "cooldown_until": null
    },
    {
      "id": "krepost",
      "name": "Крепость",
      "name_en": "Fortress",
      "level": 3,
      "income": 409,
      "max_level": 15,
      "upgrade_currency": "silver",
      "upgrade_cost": 5415000,
      "cooldown_until": null
    }
  ]
}
```

### Serfs State

```json
{
  "serfs": [
    {
      "id": 1,
      "name": "Ванька",
      "name_en": "Vanka",
      "profession": "Ремесленник",
      "profession_en": "Craftsman",
      "profession_id": "craftsman_serf",
      "gold_per_30m": 12,
      "gold_bonus": 0.25,
      "last_collected": "2025-01-15T10:30:00Z"
    },
    {
      "id": 2,
      "name": "Марфа",
      "name_en": "Marfa",
      "profession": "Зодчий",
      "profession_en": "Architect",
      "profession_id": "architect",
      "gold_per_30m": 18,
      "gold_bonus": 0.35,
      "last_collected": "2025-01-15T10:00:00Z"
    },
    {
      "id": 3,
      "name": "Фёдор",
      "name_en": "Fyodor",
      "profession": "Пахарь",
      "profession_en": "Plowman",
      "profession_id": "plowman",
      "gold_per_30m": 8,
      "gold_bonus": 0.0,
      "last_collected": "2025-01-15T09:30:00Z"
    }
  ]
}
```

### Equipped Items

```json
{
  "equipment": {
    "weapon": {
      "id": "sablya",
      "name": "Сабля",
      "name_en": "Saber",
      "atk_bonus": 10
    },
    "armor": {
      "id": "kolchuga",
      "name": "Кольчуга",
      "name_en": "Chainmail",
      "def_bonus": 5
    },
    "special": [],
    "profile_icon": null
  }
}
```

---

## 13. Navigation Structure

### Tab Bar (5 tabs)

| # | Icon | Tab RU | Tab EN | Description |
|---|------|--------|--------|-------------|
| 1 | `territory_tab` | Территория | Territory | Build and upgrade buildings |
| 2 | `raids_tab` | Набеги | Raids | PvP combat and raiding |
| 3 | `caves_tab` | Пещеры | Caves | PvE dungeon system |
| 4 | `shop_tab` | Лавка | Shop | Buy weapons, armor, items |
| 5 | `profile_tab` | Профиль | Profile | Player stats, settings |

### Sub-Screens by Tab

**Territory** (Interactive City Map):
- Fullscreen PixiJS pannable city (900x1400 world, 16 island slots)
- Procedural terrain: organic island blobs, dirt paths, grass decoration
- Building sprites float on islands with level-colored particles
- Tap empty slot → BuildScreen (choose building to construct)
- Tap existing building → BuildingInfoSheet (info + upgrade)
- Drag to pan, momentum scrolling, tap vs drag disambiguation
- Floating HUD: income card (top), collect button (bottom)
- CoinShower animation on income collection
- Particle color by building level: Bronze (1-3), Silver (4-6), Gold (7-9), Emerald (10-12), Diamond (13-15)
- Upgrade-ready buildings glow brightly (gold pulse)
- Locked slots (gray, lock icon) unlock by title progression
- Slot unlock: 0-4 at title 1, 5-7 at title 3, 8-9 at title 5, 10-12 at title 7, 13-15 at title 9

**Raids**:
- Opponent finder
- Battle screen
- Raid log / history
- Serf management

**Caves**:
- Cave selection (Dark / Glory)
- Monster list
- Battle screen
- Loot results
- Booster shop

**Shop**:
- Weapons tab
- Armor tab
- Special items tab
- Profile icons tab
- Stars purchase (Telegram Stars)

**Profile**:
- Player stats card
- Title progression bar
- Daily bonus claim
- Clan info
- Settings (language, notifications)
- Referral link

---

## 14. Asset URLs

### CDN Base URL

All game assets are served from Vercel Blob CDN:

```
https://hvtv6f4jyz7itmqv.public.blob.vercel-storage.com/holop/game/webp/
```

### Asset Categories

| Category | Path | Description |
|----------|------|-------------|
| Buildings | `buildings/` | Building icons and animations |
| Weapons | `weapons/` | Weapon item icons |
| Armor | `armor/` | Armor item icons |
| Defense | `defense/` | Defense item icons |
| Monsters | `monsters/` | Cave monster sprites |
| Titles | `titles/` | Title/rank icons |
| UI | `ui/` | Interface elements |
| Effects | `effects/` | Particle and animation effects |

### Full URL Map

The complete mapping of asset IDs to blob URLs is maintained in:

```
/Users/alekseigakh/Desktop/holop_mascot/site/public/blob_urls_game_webp.json
```

### Example URLs

```
buildings/izba.webp
buildings/kreml.webp
monsters/zmey.webp
weapons/sablya.webp
titles/voevoda.webp
```

---

## 15. Key Design Decisions

### 1. Mobile-First Layout

- **Target viewport**: 375--428px width (iPhone SE through iPhone Pro Max)
- **No desktop layout**: Telegram Mini Apps are mobile-only
- **Touch targets**: Minimum 44pt (Apple HIG 26 compliance)
- **Scroll**: Vertical only, no horizontal swipe gestures

### 2. Visual Theme

- **Dark theme**: Gold accents on dark brown background
- **Brand colors**: HOLOP gold (#C5A55A approx), dark wood brown
- **Typography**: System fonts with Slavic-style headings
- **Contrast ratios**: WCAG AA compliant minimum

### 3. Rendering Architecture

- **PixiJS**: Used for animated elements (building sprites, lootbox animations, particle effects)
- **React DOM**: Used for all UI components (buttons, modals, lists, tab bar)
- **Hybrid approach**: PixiJS canvas layered behind React DOM overlays

### 4. Data Architecture

- **All data is mock** (no backend in current phase)
- **Data must be realistic and internally consistent**
- **State management**: React state / context (no external store needed for mock)
- **Future**: Backend will be Node.js with PostgreSQL

### 5. Localization

- **Default language**: Russian (RU)
- **Supported**: English (EN)
- **All strings**: Must have both RU and EN variants
- **Number formatting**: Russian locale (space as thousands separator)

### 6. Telegram Integration

Leverages the Telegram WebApp API for:

| Feature | API | Usage |
|---------|-----|-------|
| Theme | `Telegram.WebApp.themeParams` | Match Telegram's dark/light theme |
| Haptic Feedback | `Telegram.WebApp.HapticFeedback` | Tap feedback on buttons, success/error |
| Back Button | `Telegram.WebApp.BackButton` | Navigate back from sub-screens |
| Main Button | `Telegram.WebApp.MainButton` | Primary CTA (e.g., "Upgrade", "Attack") |
| Close | `Telegram.WebApp.close()` | Exit mini app |
| User Data | `Telegram.WebApp.initDataUnsafe.user` | Get Telegram user info |
| Stars Payment | `Telegram.WebApp.openInvoice()` | In-app purchases with Telegram Stars |

### 7. Apple HIG 26 Compliance

- **44pt minimum touch targets** for all interactive elements
- **Proper contrast ratios** for text legibility
- **Depth and layering** through shadows and elevation
- **Safe area insets** respected on all screens
- **Smooth 60fps animations** via PixiJS

---

## Appendix A: Formula Reference

### Building Cost at Level L

```
cost(L) = base_cost * cost_multiplier ^ (L - 1)
```

### Building Income at Level L

```
income(L) = base_income * income_multiplier ^ (L - 1)
```

### Total Hourly Income

```
total_income = SUM(building.income for each building)
```

### Cave Silver Loot

```
silver_loot(monster_level) = 100 * 1.8 ^ (monster_level - 1)
```

### Cave Gold Drop Chance

```
gold_chance(monster_level) = 0.05 + 0.05 * (monster_level - 1)
```

### Cave Reputation Reward

```
reputation(monster_level) = 10 * monster_level
```

### Resurrection Cost

```
resurrection_cost(monster_level) = 10 + 5 * monster_level  (in Stars)
```

### Raid Loot

```
base_loot = defender.silver * 0.30
robin_hood = max(0, defender.title - attacker.title) * 0.05
total_loot = base_loot * (1 + robin_hood)
```

---

## Appendix B: Game Constants

```json
{
  "MAX_SILVER": 999999999999,
  "MAX_GOLD": 999999,
  "MAX_REPUTATION": 999999,
  "MAX_HEALTH": 100,
  "HEALTH_REGEN_PER_MIN": 1,
  "BUILDING_MAX_LEVEL": 15,
  "BUILDING_SILVER_LEVELS": [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  "BUILDING_GOLD_LEVELS": [11, 12, 13, 14, 15],
  "BUILDING_UPGRADE_COOLDOWNS": "per-level: L1:5m, L2:15m, L3:30m, L4:1h, L5:2h, L6:4h, L7:8h, L8:16h, L9:24h, L10:36h, L11:48h, L12:72h, L13:96h, L14:120h",
  "SERF_COLLECTION_INTERVAL_MIN": 30,
  "PVP_UNLOCK_TITLE": 6,
  "PVP_COOLDOWN_MIN": 1,
  "PVP_COOLDOWN_MAX": 5,
  "PVP_BASE_DAMAGE_MIN": 20,
  "PVP_BASE_DAMAGE_MAX": 40,
  "PVP_LOOT_PERCENT": 0.30,
  "PVP_ROBIN_HOOD_PERCENT": 0.05,
  "CAVE_DARK_UNLOCK_TITLE": 3,
  "CAVE_GLORY_UNLOCK_TITLE": 4,
  "CAVE_COOLDOWN_EARLY_HOURS": 8,
  "CAVE_COOLDOWN_LATE_HOURS": 24,
  "CAVE_EARLY_PERIOD_DAYS": 3,
  "CLAN_CREATE_COST_SILVER": 25000,
  "CLAN_MIN_TITLE": 7,
  "CLAN_MAX_MEMBERS": 50,
  "CLAN_INCOME_BONUS": 0.10,
  "IRON_DOME_DURATION_HOURS": 24,
  "DYNAMITE_DURATION_HOURS": 24,
  "DAILY_BONUS_CYCLE_DAYS": 14,
  "STARTING_SILVER": 1000,
  "STARTING_GOLD": 10,
  "STARTING_STARS": 0
}
```

---

## Appendix C: TMA Implementation Status

All game mechanics from the bot have been synced to the TMA frontend:

| Feature | Status | Notes |
|---------|--------|-------|
| Building system (4 categories) | Done | income/premium/gold/social, per-building costMult, incomeMult 1.25 |
| Building prerequisites | Done | checkPrerequisites() in buildings.ts |
| Per-level cooldowns | Done | 14 levels, L1:5min to L14:120h |
| Gold upgrades (L11-15) | Done | tier-based gold costs |
| Title rewards on rank-up | Done | silver + gold per rank |
| Income collection (24h cap) | Done | health multiplier applied |
| PvP Raids | Done | cooldown timer, diminishing returns, defense badges, serf capture |
| Caves (PvE) | Done | cooldown, resurrection, cave boosters |
| Shop (7 categories) | Done | weapons/armor/specials/defense/potions/explosives/boosters |
| Daily Bonus (14-day cycle) | Done | streak logic, freeze/rollback/restore |
| Serf management | Done | protection, ransom, gold collection |
| Bank system | Done | deposit/withdraw/interest |
| Clan UI | Done | placeholder, shows clan info |
| Inventory system | Done | stackable items, equip/activate/use |

> **Last updated**: 2026-02-12
> **Version**: 1.1
> **Status**: Season 1 -- "Великий Передел" (all mechanics synced)
