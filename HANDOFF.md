# HANDOFF.md — Developer Handoff Document

> **Date**: 2026-02-17
> **Status**: Framework complete, all screens built with mock data. Ready for backend integration.
> **Deploy**: https://holop-mini-app.vercel.app

---

## What Is This Project?

HOLOP is a Telegram Mini App (TMA) — an idle economic simulator set in ancient Russia. Players build settlements, raid others (PvP), explore caves (PvE), manage serfs, trade in shops, join clans, and climb from Serf to Tsar.

The game already exists as a **Telegram bot** (`VSemenchuk/holop`, Python + aiogram + PostgreSQL). This TMA is a **graphical frontend** that mirrors the bot's functionality. A player can play in both the bot and the mini-app — they must share the same game state.

**Current reality**: The TMA runs entirely on mock data. There is no API connection to the bot. All game state is hardcoded in the Zustand store with realistic values.

---

## What Has Been Done

### Complete Screen Coverage (20+ screens)

Every game mechanic from the bot has a corresponding screen in the TMA:

| Category | Screens | Status |
|----------|---------|--------|
| **Territory** | Interactive PixiJS city map (CityScene), building/upgrade panels, income collection | Complete |
| **Serfs** | My serfs list, serf catalog (10 mock targets), capture, frog potion, guard, ransom, slot purchase, profession re-roll, freedom | Complete |
| **Raids (PvP)** | Target list, attack/raid mechanics, battle screen, result modal, revenge, diminishing returns, bochka (powder barrel) catalog | Complete |
| **Caves (PvE)** | Dark cave (title 3+), Glory cave (title 4+), combat sequence, boosters, resurrection, retreat | Complete |
| **Shop** | 8 tabs — weapons (8), armor (8), specials (4), defense (4), potions, explosives, boosters, lootboxes (2 types with drop tables) | Complete |
| **Court Hub** | Interactive PixiJS courtyard (CourtScene) → navigates to 7 sub-screens | Complete |
| **Bank/Treasury** | Unlock (499 stars), deposit/withdraw, 2% daily interest, 24h max | Complete |
| **Clans/Kingdoms** | No-clan (create/join), has-clan (6 tabs: overview, members, treasury, territories, war, shop) | Complete |
| **Leaderboards** | 7 tabs: income, serfs, battles, clans, diggers, reputation, seasonal | Complete |
| **Achievements** | 6 categories: warrior, trader, goldowner, famous, serfmaster, veteran + claim | Complete |
| **Seasons** | Current season info, 6 reward tiers, past seasons history | Complete |
| **Office (Палата)** | Reputation system, 8 purchasable items, daily collection, PvP bonus | Complete |
| **Daily Bonus** | 14-day reward cycle, streak logic (freeze/rollback/restore) | Complete |
| **Settings** | Language toggle (ru/en), about info, danger zone (delete account) | Complete |
| **Help** | Game guide with expandable sections: getting started, combat, buildings, serfs, economy, FAQ | Complete |
| **Referrals** | Link sharing + copy, stats, reward tier table, friend list | Complete |

### Technical Infrastructure

- **Full bilingual support (ru/en)** — every screen, every component, every modal uses `language === 'ru' ? ... : ...`
- **Zero emojis** — all UI icons are CDN WebP assets rendered via `<Icon name="..." />` component (~80 icon mappings)
- **PixiJS canvas scenes** — 2 major scenes (CityScene for territory, CourtScene for court hub) + 6 smaller effect scenes
- **Procedural terrain generation** — Simplex noise + fractal Brownian motion + Whittaker biome classification for territory map
- **Animated water shader** — Custom GLSL fragment shader for river effects
- **Glass morphism UI** — iOS 26 Liquid Glass style throughout (backdrop-filter blur + warm gold translucency)
- **Zustand store** — 1414 lines, 25+ actions, 16 state slices, all game formulas implemented
- **TypeScript strict** — no `any`, 288 lines of type definitions (32+ interfaces)
- **500+ CDN assets** — all served from Vercel Blob Storage, mapped in blob_urls.json
- **Telegram WebApp integration** — haptics, back button, theme params, user data, expand, pull-to-close prevention
- **CSS Modules** — every component has its own .module.css file
- **Responsive** — tested 375px (iPhone SE) to 428px (iPhone 14 Pro Max)

### Game Formulas Synced with Bot

All key formulas match the bot's `game_config.py`:
- Building costs with per-building multipliers (1.6→2.0)
- Income formula with 1.25 multiplier
- Gold upgrade costs (L11-15) with tier-based pricing
- Per-level cooldown table (5min→120h)
- Building prerequisites chain
- Serf SPR income formula
- Multi-currency ransom calculation
- Raid diminishing returns (0.8^count per 24h)
- Daily bonus 14-day cycle with streak mechanics
- Bank 2% daily interest
- Office reputation system with PvP bonus

---

## What Needs To Be Done

### Priority 1: Backend API Integration

This is the critical next step. Currently ALL data is mock.

**Proposed architecture**: FastAPI REST server as a bridge between the TMA and the bot's PostgreSQL database.

**API endpoints needed**:

```
GET  /api/user/{telegram_id}          → User profile + currencies
GET  /api/buildings/{telegram_id}     → Player's buildings
POST /api/buildings/build             → Build a new building
POST /api/buildings/upgrade           → Upgrade a building
POST /api/buildings/collect           → Collect income

GET  /api/serfs/{telegram_id}         → Player's serfs
POST /api/serfs/collect               → Collect serf gold
POST /api/serfs/protect               → Apply protection
POST /api/serfs/ransom                → Ransom a serf
POST /api/serfs/buy-slot              → Purchase serf slot

GET  /api/raids/targets/{telegram_id} → Available raid targets
POST /api/raids/attack                → Execute raid
GET  /api/raids/history               → Raid history

GET  /api/caves/status/{telegram_id}  → Cave cooldown, available caves
POST /api/caves/enter                 → Start cave run
POST /api/caves/battle                → Execute cave battle

GET  /api/shop/inventory/{telegram_id} → Owned items
POST /api/shop/buy                    → Purchase item
POST /api/shop/equip                  → Equip weapon/armor

GET  /api/daily/{telegram_id}         → Daily bonus state
POST /api/daily/claim                 → Claim daily bonus

GET  /api/bank/{telegram_id}          → Bank state
POST /api/bank/deposit                → Deposit silver
POST /api/bank/withdraw               → Withdraw silver

GET  /api/clan/{telegram_id}          → Clan info
POST /api/clan/create                 → Create clan
POST /api/clan/join                   → Join clan

GET  /api/leaderboard/{category}      → Leaderboard data
GET  /api/achievements/{telegram_id}  → Achievement progress

POST /api/lootbox/open                → Open lootbox
```

**Integration approach**:
1. Create `src/api/client.ts` — API client with auth (Telegram initData for verification)
2. Replace mock data in `gameStore.ts` actions with API calls
3. Add loading states, error handling, retry logic
4. Add optimistic updates where appropriate (e.g., collect income)
5. Add WebSocket or polling for real-time updates (raid notifications, serf captures)

### Priority 2: Onboarding / Tutorial

The only missing screen. New players need a guided flow:
- Welcome screen with Eremka mascot
- Build first building (izba)
- Collect first income
- Explain tabs (territory, raids, caves, shop, court)
- Explain serfs and PvP unlocking at title 6

### Priority 3: Polish & UX

- **Animations**: Add transition animations between screens (currently instant)
- **Loading states**: Show skeleton/spinner while data loads (needed for API integration)
- **Error handling**: Show error toasts on API failures with retry options
- **Offline mode**: Cache last known state, show stale indicators
- **Pull-to-refresh**: Standard mobile gesture for data refresh
- **Skeleton screens**: Loading placeholders for every screen
- **Sound effects**: Tap feedback, building completion, combat sounds (optional)

### Priority 4: Cleanup

- **Remove legacy components**: `BuildingCard.tsx`, `CombatLog.tsx`, `MonsterCard.tsx`, `TitleProgress.tsx`, `WeaponCard.tsx` — not imported anywhere, safe to delete
- **Remove unused CSS classes**: Some serf-related classes in `ProfileScreen.module.css` are leftover from when serfs were in the profile tab
- **Type cleanup**: Some `ScreenId` types in `types.ts` may be unused after navigation refactor
- **react-router-dom**: Listed in package.json but NOT used (navigation is Zustand-based) — can be removed

---

## Architecture Decisions to Know About

### Why No React Router?
Navigation is managed entirely through Zustand store (`activeTab` + `overlayScreen` + `useState<SubScreen>` per screen). This was chosen because:
- Telegram WebApp controls the browser history/back button
- Simple flat structure — 6 tabs with sub-screens, no deep nesting
- Zustand provides instant state-driven rendering without route transitions
- `react-router-dom` is still in package.json but unused — can be safely removed

### Why Two PixiJS Scenes?
- **CityScene** (Territory tab) — pannable 900×1400 world with procedural terrain, islands, buildings, heavy particles. This is the main game view.
- **CourtScene** (Court tab) — static viewport with cobblestone ground, stone walls, torches, 7 tappable game section objects. This is the hub for Bank, Kingdoms, etc.

They are intentionally different visual styles so players immediately feel they're in a different area.

### Why Mock Data?
The bot developer (VSemenchuk) and the TMA developer worked separately. All game formulas and UI were built to match the bot's logic, but the API bridge hasn't been built yet. The mock data is structured identically to what the real API would return.

### Why CDN Assets and Not Local?
500+ WebP game assets are stored in Vercel Blob Storage to keep the build small and load times fast. The `blob_urls.json` file maps asset keys to CDN URLs. `getAssetUrl(key)` is the single accessor function.

### Why Zero Emojis?
Emojis render inconsistently across platforms (especially Telegram WebView on Android). All UI icons are CDN WebP images rendered via the `<Icon>` component with the `iconMap.ts` mapping. This ensures visual consistency.

---

## How to Test

1. `npm run dev` → Open http://localhost:5173
2. Or deploy: `vercel --prod` → Test in Telegram via BotFather WebApp link
3. All screens are accessible — mock data is pre-populated
4. Switch language in Settings (AvatarDrawer → Settings → Language toggle)
5. Territory tab: tap empty island slots to build, tap buildings to upgrade/collect
6. Court tab: tap any object in the courtyard to open Bank, Kingdoms, etc.

---

## File Sizes (for context on complexity)

| File | Lines | Description |
|------|-------|-------------|
| `gameStore.ts` | 1414 | Zustand store — all game state + actions |
| `CityScene.tsx` | ~860 | Territory PixiJS map with terrain generation |
| `SerfScreen.tsx` | ~600 | Serf management + catalog |
| `ShopScreen.tsx` | ~550 | 8-tab shop |
| `RaidsScreen.tsx` | ~500 | PvP targets + bochka |
| `CavesScreen.tsx` | ~450 | PvE caves |
| `ClanScreen.tsx` | ~450 | Kingdom system |
| `CourtScene.tsx` | ~350 | Court hub PixiJS courtyard |
| `AchievementsScreen.tsx` | ~300 | 6 achievement categories |
| `OfficeScreen.tsx` | ~300 | Reputation system |
| `types.ts` | 288 | All TypeScript interfaces |
| `buildings.ts` | ~250 | Building configs |
| `BankScreen.tsx` | ~250 | Treasury screen |
| `weapons.ts` | ~250 | All shop item configs |
| `terrainNoise.ts` | ~220 | Simplex noise terrain |
| **Total source** | **~19,820** | All .ts/.tsx + .css files |
