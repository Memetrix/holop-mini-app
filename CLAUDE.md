# CLAUDE.md — HOLOP Telegram Mini App

> **CRITICAL**: This file is the primary context source. On context compaction — RE-READ THIS FILE FIRST.

## Project Overview

**HOLOP** — idle economic simulator Telegram Mini App (TMA). Ancient Russian setting: rise from Serf (Смерд) to Tsar (Царь). PvP raids, caves (PvE), serfs, clans, shop, bank, office, achievements, seasons.

- **Stack**: Vite 7 + React 19 + TypeScript 5.9 (strict) + PixiJS 8 + Zustand 5 + Telegram WebApp API
- **TMA repo**: `Memetrix/holop-mini-app` — THIS repo (React GUI)
- **Bot repo**: `VSemenchuk/holop` — Python (aiogram), PostgreSQL — THE source of truth for business logic
- **Architecture**: TMA is a GUI overlay for the bot. Player plays in BOTH bot AND mini-app. TMA must sync with bot logic.
- **Deploy**: `vercel --prod` → holop-mini-app.vercel.app
- **Build**: `npm run build` (tsc -b && vite build)

## Current State (2026-02-17)

**ALL 20+ SCREENS BUILT. All bilingual (ru/en). Zero emojis — all icons from CDN.**
**ALL DATA IS MOCK** — no real API calls yet. Future: FastAPI REST bridge TMA ↔ bot DB.

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # TypeScript check + Vite build
vercel --prod      # Deploy to production
```

## Directory Structure

```
src/
├── App.tsx                  # Root: TopBar + ScreenRouter + TabBar + OverlayRouter + Toast
├── main.tsx                 # Entry point: Telegram WebApp init
├── vite-env.d.ts            # Vite type declarations
│
├── store/
│   ├── gameStore.ts         # Zustand store (~1414 lines, ~25 actions, 16 state slices)
│   └── types.ts             # All game entity interfaces (~288 lines, 32+ types)
│
├── config/
│   ├── assets.ts            # CDN URL resolver: getAssetUrl(key) → blob_urls.json lookup
│   ├── buildings.ts         # 21 buildings: 4 categories, prerequisites, cooldowns, gold upgrades
│   ├── cityLayout.ts        # 16 city island slots with positions (for CityScene)
│   ├── courtyardLayout.ts   # 7 courtyard objects with positions (for CourtScene)
│   ├── constants.ts         # All limits, multipliers, cooldown tables
│   ├── dailyBonus.ts        # 14-day reward cycle, streak logic
│   ├── iconMap.ts           # ~80 semantic names → CDN asset keys (replaces all emojis)
│   ├── lootboxes.ts         # Normal (100 rep) + Premium (10 stars) drop tables
│   ├── monsters.ts          # 10 cave monsters: 5 dark + 5 glory
│   ├── serfs.ts             # 6 professions, 4 protection tiers, ransom formula
│   ├── theme.ts             # Color palette + font definitions
│   ├── titles.ts            # 12 title ranks: thresholds, attack gates, rewards
│   └── weapons.ts           # 8 weapons, 8 armor, 4 specials, 4 defenses, potions, explosives, boosters
│
├── pixi/                    # PixiJS canvas scenes (GPU-rendered)
│   ├── CityScene.tsx        # Territory map — pannable city with 16 island slots (~860 lines)
│   ├── CourtScene.tsx       # Court hub — static cobblestone courtyard with 7 objects (~350 lines)
│   ├── BuildingScene.tsx    # Single building sprite with animations
│   ├── CombatScene.tsx      # PvP/PvE battle animation
│   ├── CoinShower.tsx       # Gold coin particle effect on income collection
│   ├── LootboxScene.tsx     # Lootbox opening animation
│   ├── ResultEffect.tsx     # Victory/defeat visual effects
│   ├── particles.ts         # Shared particle utilities
│   ├── terrainNoise.ts      # Simplex noise + fBm + Whittaker biome generation (for CityScene)
│   └── waterShader.ts       # GLSL animated water filter (for CityScene rivers)
│
├── screens/
│   ├── territory/
│   │   ├── TerritoryScreen.tsx      # CityScene canvas + floating build button
│   │   ├── BuildScreen.tsx          # Build/upgrade panel with prerequisites
│   │   └── BuildingInfoSheet.tsx    # Building detail bottom sheet
│   ├── serfs/
│   │   └── SerfScreen.tsx           # My serfs + catalog + capture + frog potion
│   ├── raids/
│   │   ├── RaidsScreen.tsx          # Raid targets + bochka (powder barrel) catalog
│   │   └── BattleScreen.tsx         # Combat sequence screen
│   ├── caves/
│   │   └── CavesScreen.tsx          # Dark + Glory caves, boosters, combat, resurrection
│   ├── shop/
│   │   └── ShopScreen.tsx           # 8 tabs: weapons, armor, specials, defense, potions, explosives, boosters, lootboxes
│   ├── profile/
│   │   ├── ProfileScreen.tsx        # "Двор"/"Court" hub — CourtScene canvas → 7 sub-screens
│   │   └── DailyBonus.tsx           # 14-day bonus cycle UI
│   ├── bank/
│   │   └── BankScreen.tsx           # Deposit/withdraw, 2% daily interest
│   ├── clan/
│   │   └── ClanScreen.tsx           # No-clan/has-clan states, 6 internal tabs
│   ├── leaderboard/
│   │   └── LeaderboardScreen.tsx    # 7 leaderboard categories
│   ├── achievements/
│   │   └── AchievementsScreen.tsx   # 6 achievement categories + claim
│   ├── seasons/
│   │   └── SeasonsScreen.tsx        # Current season, reward tiers, history
│   ├── office/
│   │   └── OfficeScreen.tsx         # Reputation system, 8 items, daily collection
│   ├── settings/
│   │   └── SettingsScreen.tsx       # Language toggle, about, danger zone
│   ├── help/
│   │   └── HelpScreen.tsx           # Game guide, mechanics FAQ
│   └── referrals/
│       └── ReferralsScreen.tsx      # Link sharing, stats, reward tiers
│
├── components/
│   ├── layout/
│   │   ├── Screen.tsx               # Base screen wrapper (scrollable content area)
│   │   ├── TopBar.tsx               # Header: avatar, city name, daily/collect buttons, currencies
│   │   ├── TabBar.tsx               # 6 tabs: Territory, Serfs, Raids, Caves, Shop, Court
│   │   └── AvatarDrawer.tsx         # Slide-from-left drawer: profile, settings, help, referrals
│   ├── ui/
│   │   ├── Icon.tsx                 # CDN icon component (replaces all emojis)
│   │   ├── BackHeader.tsx           # Back button + bilingual title
│   │   ├── Button.tsx               # Styled button with variants
│   │   ├── CurrencyBadge.tsx        # Silver/gold/stars display
│   │   ├── Modal.tsx                # Modal dialog
│   │   ├── ProgressBar.tsx          # Health/XP/cooldown bars
│   │   └── Toast.tsx                # Toast notification system
│   └── game/                        # Legacy card components (NOT USED in current screens)
│       ├── BattleResultModal.tsx     # Active — PvP/PvE result modal
│       ├── BuildingCard.tsx          # ⚠️ Legacy — not imported anywhere
│       ├── CombatLog.tsx            # ⚠️ Legacy — not imported anywhere
│       ├── MonsterCard.tsx          # ⚠️ Legacy — not imported anywhere
│       ├── TitleProgress.tsx        # ⚠️ Legacy — not imported anywhere
│       └── WeaponCard.tsx           # ⚠️ Legacy — not imported anywhere
│
├── hooks/
│   ├── useFormatNumber.ts           # formatNumber(), formatIncome(), formatTime()
│   ├── useGameLoop.ts              # 1s interval: tick income, check cooldowns
│   ├── useHaptics.ts               # Telegram haptic feedback wrapper
│   ├── useSwipeSheet.ts            # Touch swipe-to-dismiss for bottom sheets
│   └── useTelegram.ts              # Telegram WebApp API hook
│
├── styles/
│   ├── global.css                   # CSS variables, glass morphism, safe area insets
│   ├── fonts.css                    # Neucha, Cormorant Garamond, Inter
│   └── animations.css               # Shared keyframe animations
│
└── data/
    └── blob_urls.json               # 500+ asset key → CDN URL mappings
```

## Architecture Patterns

### Navigation System
```
App.tsx
├── TopBar (fixed top)
│   ├── Avatar button → opens AvatarDrawer
│   ├── City name + title
│   ├── Daily Bonus indicator (pulses when claimable)
│   ├── Collect Income button (shows accumulated badge)
│   └── Currency display (silver, gold, stars)
├── ScreenRouter (main content area)
│   └── Switches on activeTab: territory | serfs | raids | caves | shop | profile
├── TabBar (fixed bottom, 6 tabs)
├── OverlayRouter (z-index 900, full-screen overlays)
│   └── Switches on overlayScreen: profile | settings | help | referrals
└── ToastContainer
```

**Two navigation layers**:
1. **Tab-based** — TabBar switches `activeTab` in store → ScreenRouter renders the tab screen
2. **Overlay-based** — AvatarDrawer sets `overlayScreen` in store → OverlayRouter renders on top

**Sub-screen routing** — ProfileScreen (Court hub) uses `useState<SubScreen>` for its 7 children:
`null | 'bank' | 'clan' | 'leaderboard' | 'achievements' | 'seasons' | 'daily' | 'office'`

### PixiJS + React Pattern
All PixiJS scenes follow this lifecycle:
```typescript
function MyScene({ width, height, ...props }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(props.onSomething); // Prevent re-mount
  callbackRef.current = props.onSomething;

  useEffect(() => {
    const el = containerRef.current;
    if (!el || width <= 0 || height <= 0) return;

    let destroyed = false;
    const app = new Application();

    async function setup() {
      await app.init({ width, height, backgroundAlpha: 0, antialias: true });
      if (destroyed) { app.destroy(); return; }
      el.appendChild(app.canvas);
      // ... create layers, load textures, add ticker
    }
    setup();

    return () => {
      destroyed = true;
      app.destroy(true, { children: true, texture: false });
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [width, height, /* reactive deps */]);

  return <div ref={containerRef} style={{ width, height }} />;
}
```

### CityScene vs CourtScene — Visual Differentiation

| Aspect | CityScene (Territory tab) | CourtScene (Court tab) |
|--------|--------------------------|----------------------|
| Ground | Simplex noise + fBm + Whittaker biomes | Procedural cobblestone + radial torchlight |
| Palette | Green/brown natural terrain | Warm brown/gold, evening torchlit |
| Water | GLSL animated shader | None |
| Interaction | Pan, zoom, momentum, pinch | Static viewport, tap only |
| World size | 900×1400, camera moves | Fits screen, no camera |
| Objects | Building sprites on island blobs | Icon sprites on glowing pedestals |
| Particles | Heavy (50-100+ per building) | Light (8 dust motes + 2 torches) |
| Borders | Open world, fades to water | Enclosed stone walls + arch gateway |

### Icon System (Zero Emojis)
```typescript
// src/config/iconMap.ts — 80+ semantic name → CDN asset key mappings
// src/components/ui/Icon.tsx — renders <img> from CDN
<Icon name="silver" size={16} />  // → getAssetUrl(ICON_MAP['silver']) → CDN WebP
```

### Bilingual System
```typescript
// Pattern used EVERYWHERE:
const language = useGameStore((s) => s.user.language); // 'ru' | 'en'
<span>{language === 'ru' ? 'Казна' : 'Treasury'}</span>

// Config data has dual fields:
{ nameRu: 'Изба', nameEn: 'Hut', effectRu: '+5 серебра/ч', effectEn: '+5 silver/h' }
```

### Glass Morphism (iOS 26 Liquid Glass)
```css
background: var(--glass-bg);          /* rgba(26, 16, 8, 0.65) */
backdrop-filter: blur(var(--glass-blur)) saturate(var(--glass-saturate));
border: 1px solid var(--glass-border); /* rgba(200, 151, 62, 0.15) */
```
- Outer cards: `blur(16px)`, modals: `blur(24px)`, buttons: `blur(12px)`
- `--top-bar-height` and `--tab-bar-height` use `calc(px + env(safe-area-inset-*))` — dynamic
- Use `height: 100%` on root, NOT `100dvh` (Telegram controls viewport)

### CDN Assets
```typescript
import { getAssetUrl } from '@/config/assets';
const url = getAssetUrl('buildings/izba'); // → Vercel Blob Storage CDN URL
```
- Base: `https://hvtv6f4jyz7itmqv.public.blob.vercel-storage.com/holop/game/webp/`
- 500+ WebP assets in `src/data/blob_urls.json`
- Categories: buildings, weapons, armor, defense, monsters, titles, palace, territories, currencies, ui_main, ui_territory, ui_ratings, ui_shop, ui_bank, ui_caves, ui_misc, shop_*, cave_boosters, holop_professions, holop_protection, explosives, potions

## Store Architecture (Zustand)

**File**: `src/store/gameStore.ts` (~1414 lines)

### State Slices (16)
```typescript
user: User                    // Player profile, currencies, stats
buildings: Building[]         // Owned buildings with levels and cooldowns
serfs: Serf[]                 // Captured serfs with protection/income
equipment: Equipment          // Weapon + armor + icon
inventory: Inventory          // All owned items by category
activeDefenses: ActiveDefenses // Currently active defense items
activeCaveBoosters: ActiveCaveBoosters
bank: BankState               // Deposit, interest
clan: Clan | null              // Kingdom membership
raidTargets: RaidTarget[]      // PvP target list
raidHistory: RaidHistory[]     // Diminishing returns tracking
caveRun: CaveRun | null        // Active cave exploration
activeTab: TabId               // Current tab (territory/serfs/raids/caves/shop/profile)
overlayScreen: string | null   // Active overlay (profile/settings/help/referrals)
toasts: Toast[]                // Notification queue
```

### Key Actions (~25)
- **Building**: `buildBuilding`, `upgradeBuilding`, `speedUpBuilding`, `collectIncome`, `tickIncome`
- **Combat**: `executeRaid`, `executeCaveBattle`, `resurrectInCave`
- **Shop**: `buyItem`, `equipWeapon`, `equipArmor`, `activateDefense`, `usePotion`, `useCaveBooster`
- **Serfs**: `protectSerf`, `ransomSerf`, `collectSerfGold`, `releaseSerf`, `buySerfSlot`, `rerollProfession`, `freeSelf`, `guardAllSerfs`
- **Economy**: `unlockBank`, `depositToBank`, `withdrawFromBank`, `getDailyBonusState`, `claimDailyBonus`, `restoreDailyStreak`, `openLootbox`
- **Nav**: `setActiveTab`, `setOverlayScreen`, `addToast`

### Computed Values
- `totalHourlyIncome` — sum of all building incomes × health factor
- `getDailyBonusState()` — calculates streak, reward, claimability

## Key Formulas (synced with bot game_config.py)

### Building Economy
- **Cost multipliers**: per-building (1.6 → 2.0), NOT uniform
- **Income multiplier**: 1.25 for all income buildings
- **Upgrade silver cost**: `cost(level+1) - cost(level)` (differential)
- **Gold upgrade cost (L11-15)**: `GOLD_BASE[tier] × GOLD_MULT[level]`
  - Tier base: {1:5, 2:10, 3:20, 4:40, 5:80}
  - Level mult: {11:1, 12:2, 13:4, 14:8, 15:16}
- **Income at level**: `baseIncome × 1.25^(level-1)`
- **Health affects income**: `income × (health / 100)`
- **24h income cap**: `hourlyIncome × 24` max accumulation

### Cooldowns (per-level, NOT flat)
L1:5m, L2:15m, L3:30m, L4:1h, L5:2h, L6:4h, L7:8h, L8:16h, L9:24h, L10:36h, L11:48h, L12:72h, L13:96h, L14:120h

### Serf System
- **SPR formula**: `goldPer30m = floor((3 + spr/50) × (1 + profBonus) × (1 + level × 0.10))`
- **Daily income**: `goldPer30m × 48`
- **Ransom**: `dailyIncome × 6 × (1 + min(0.10 × daysOwned, 1.0))`, min 500 silver
- **Multi-currency ransom**: silver(<15k) → gold(15k-100k, ÷100) → stars(>100k, ÷2000)
- **Freedom bonus**: +15% serf gold if player is free

### Raids
- **Diminishing returns**: `loot × 0.8^count` per target per 24h
- **Serf capture**: 20% chance on raid victory
- **Gate**: title level 6+, health 20+, Tsar cannot raid

## Building Categories (21 total, 4 types)

1. **Income** (silver, 12 buildings) — tiers 1-5, levels 1-15, L11-15 cost gold
2. **Premium** (stars, 4 buildings) — hram, monastyr, knyazhiy_dvor, zlatoglavyi_sobor
3. **Gold** (gold currency, 3 buildings) — zastenok, taynaya_kantselyariya, oprichny_dvor
4. **Social** (free, 2 buildings) — vestovaya_bashnya (subscription), dom_druzey (referrals)

### Prerequisites Chain
```
izba(3) → kuznitsa
pashnya(2) → ambar
pashnya(3) → melnitsa
kuznitsa(2) → konyushni
melnitsa(2)+kuznitsa(2) → torg
pashnya(5)+konyushni(3) → skotny_dvor
pashnya(5)+melnitsa(4) → vinokurnya
torg(3)+kuznitsa(5) → terem
terem(3)+kuznitsa(7) → krepost
krepost(3)+torg(5)+terem(5) → kreml
```

## Screens Summary

| Screen | Tab/Route | Key Features | Lines |
|--------|-----------|--------------|-------|
| TerritoryScreen | territory | CityScene canvas, build/upgrade sheets | ~200 |
| SerfScreen | serfs | My serfs, catalog, capture, frog, guard all | ~600 |
| RaidsScreen | raids | Target list, bochka catalog, attack/raid | ~500 |
| CavesScreen | caves | Dark+Glory caves, combat, boosters, resurrect | ~450 |
| ShopScreen | shop | 8 tabs, buy/equip, lootboxes | ~550 |
| ProfileScreen | profile (Court) | CourtScene canvas → 7 sub-screens | ~200 |
| BankScreen | profile→bank | Deposit/withdraw, 2% interest, 499★ unlock | ~250 |
| ClanScreen | profile→clan | Create/join, 6 tabs (overview/members/treasury/territories/war/shop) | ~450 |
| LeaderboardScreen | profile→leaderboard | 7 ranking tabs | ~200 |
| AchievementsScreen | profile→achievements | 6 categories, claim rewards | ~300 |
| SeasonsScreen | profile→seasons | Current season, tiers, history | ~200 |
| OfficeScreen | profile→office | 8 items, reputation, daily collection, PvP bonus | ~300 |
| DailyBonus | profile→daily | 14-day cycle, streak restore | ~200 |
| SettingsScreen | overlay | Language toggle, about, delete account | ~150 |
| HelpScreen | overlay | Game guide, FAQ sections | ~200 |
| ReferralsScreen | overlay | Link, stats, reward tiers, friends | ~200 |

## Telegram WebApp API

```typescript
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();
tg?.HapticFeedback.impactOccurred('medium');  // Haptics
tg?.initDataUnsafe?.user  // { id, first_name, username, language_code }
```

## Design System

### Colors
```
--gold: #C8973E          --gold-light: #E8C77B    --gold-dark: #8B6914
--parchment: #F5ECD7     --parchment-dark: #E8D9B8
--ink: #2C1810           --bg-dark: #1A1008       --bg-card: #231A0E
```

### Fonts
- **Neucha** — display/headings (medieval Russian cursive)
- **Cormorant Garamond** — serif subheadings
- **Inter** — body text

### Touch Targets
- Minimum 44×44px
- Dark theme by default (#1A1008)
- Contrast minimum 4.5:1

## Development Rules

1. **NO pushing to VSemenchuk/holop** — that's the separate bot repo
2. **All data is mock** — everything works without backend, data is hardcoded but realistic
3. **All assets from CDN** — never store images locally, use `getAssetUrl(key)`
4. **Mobile-first** — 375px minimum, 428px maximum width
5. **TypeScript strict** — no `any`, everything typed
6. **Bilingual** — RU default, EN second. `language === 'ru' ? ... : ...` pattern
7. **Zero emojis** — use `<Icon name="..." />` component everywhere
8. **PixiJS for canvas scenes** — DOM for UI, PixiJS for animated visuals
9. **Glass morphism** — `backdrop-filter: blur()` with warm gold-tinted translucency
10. **Screen component** — wrap scrollable content in `<Screen>`, use `header` prop for BackHeader

## On Context Loss (Compaction)

1. Re-read this CLAUDE.md
2. Check `git log --oneline -10` for recent changes
3. Run `npm run build` to verify clean state
4. Look at `src/App.tsx` for navigation structure
5. Check `src/store/gameStore.ts` for state shape
6. Continue work
