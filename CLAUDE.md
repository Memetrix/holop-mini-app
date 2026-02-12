# CLAUDE.md — HOLOP Mini App (Telegram)

> **CRITICAL**: Этот файл — главный источник контекста. При compacting conversation — ПЕРЕЧИТАЙ этот файл первым делом.

## Проект

**HOLOP Mini App** — Telegram Mini App (TMA) для idle-экономического симулятора «HOLOP».
Древнерусский сеттинг: от Смерда до Царя. PvP набеги, пещеры, холопы, княжества.

- **Стек**: Vite + React + TypeScript + PixiJS + Telegram WebApp API
- **Бэкенд-бот**: Python (python-telegram-bot), PostgreSQL — в ОТДЕЛЬНОМ репо `VSemenchuk/holop`
- **Сайт-портфолио**: `/Users/alekseigakh/Desktop/holop_mascot/site/` (eremka.vercel.app)
- **Бот-репо (клонированный)**: `/Users/alekseigakh/Desktop/holop-bot/` — ТОЛЬКО ДЛЯ ЧТЕНИЯ, не пушить туда
- **Mini App проект**: `/Users/alekseigakh/Desktop/Projects/holop-mini-app/`

## Ключевые файлы для изучения

| Файл | Где | Зачем |
|------|-----|-------|
| `PRODUCT_BIBLE.md` | Этот проект | Вся игровая логика, экраны, экономика, формулы |
| `game_config.py` | holop-bot | Мастер-конфиг: все здания, титулы, формулы, баланс |
| `database_pg.py` | holop-bot | Модели данных, SQL-запросы |
| `handlers/*.py` | holop-bot | Логика каждой механики |
| `locales/ru.json` | holop-bot | Все UI-строки на русском |
| `shared.css` | site/public/css/ | Фирменный стиль (цвета, шрифты, компоненты) |
| `blob_urls_game_webp.json` | site/public/ | CDN URLs всех 157 игровых ассетов |

## Дизайн-система

### Цвета (HOLOP Brand)
```
--gold: #C8973E          (акценты, заголовки, кнопки)
--gold-light: #E8C77B    (ховеры, иконки)
--gold-dark: #8B6914     (тени, бордеры)
--parchment: #F5ECD7     (основной текст)
--parchment-dark: #E8D9B8 (вторичный текст)
--ink: #2C1810           (тёмный текст на светлом фоне)
--bg-dark: #1A1008       (основной фон)
--bg-card: #231A0E       (фон карточек)
--border: rgba(200,151,62,.15)
--glow: rgba(200,151,62,.06)
```

### Шрифты
- **Neucha** — курсивный, для заголовков (игровой стиль)
- **Cormorant Garamond** — серифный, для подзаголовков (элегантность)
- **Inter** — без засечек, для body текста (читаемость)

### Apple HIG 26 принципы
- Минимальный touch target: 44×44pt
- SF Pro для системных элементов (Dynamic Type)
- Liquid Glass: полупрозрачность, глубина, размытие на фоне — но в золотой палитре HOLOP
- Тёмная тема по умолчанию (фирменный #1A1008)
- Не предлагать отдельный переключатель темы — следовать системным настройкам
- Контраст минимум 4.5:1, стремиться к 7:1

## CDN ассетов

**Base URL**: `https://hvtv6f4jyz7itmqv.public.blob.vercel-storage.com/holop/`

Категории: buildings, weapons, armor, defense, monsters, titles, palace, territories, currencies, ui_main, ui_territory, ui_ratings, ui_shop, ui_bank, ui_caves, ui_misc, shop_boosters, shop_buildings, shop_icons, explosives, potions, cave_boosters, holop_professions, holop_protection

Все URL в файле `blob_urls_game_webp.json`.

## Telegram WebApp API

```typescript
// Инициализация
const tg = window.Telegram?.WebApp;
tg?.ready();
tg?.expand();  // Развернуть на весь экран

// Тема
tg?.themeParams  // bg_color, text_color, hint_color, button_color, etc.

// Haptics
tg?.HapticFeedback.impactOccurred('medium');
tg?.HapticFeedback.notificationOccurred('success');

// Кнопка назад
tg?.BackButton.show();
tg?.BackButton.onClick(() => navigate(-1));

// Главная кнопка
tg?.MainButton.setText('Собрать доход');
tg?.MainButton.show();
tg?.MainButton.onClick(() => collectIncome());

// Данные пользователя
tg?.initDataUnsafe?.user  // { id, first_name, last_name, username, language_code }
```

## Правила разработки

1. **НЕ ПУШИТЬ в VSemenchuk/holop** — это отдельный репо бота
2. **Мок-данные** — всё работает без бэкенда, данные захардкожены но реалистичны
3. **Все ассеты с CDN** — не хранить картинки локально
4. **Mobile-first** — 375px минимальная ширина, максимум 428px
5. **PixiJS только для анимаций** — Canvas для эффектов, DOM для UI
6. **TypeScript strict** — никаких `any`, всё типизировано
7. **Билингвальность** — RU по умолчанию, EN как второй язык
8. **Vercel deploy** — `vercel --prod` из корня проекта

## Экраны приложения (навигация)

```
Tab Bar (5 вкладок):
├── Территория (главный экран)
│   ├── Карта зданий (PixiJS CityScene с процедурным террейном)
│   ├── Строительство/улучшение (пререквизиты, per-level кулдауны, золотые апгрейды L11-15)
│   └── Сбор дохода (24ч кап, здоровье влияет)
├── Набеги (PvP)
│   ├── Список целей (невидимые скрыты, Iron Dome блокирует, Ров +50%)
│   ├── Cooldown + diminishing returns (0.8^count за 24ч)
│   ├── Экран боя + захват холопа (20% шанс)
│   └── Гейт: титул 6+, здоровье 20+, Царь не рейдит
├── Пещеры (PvE)
│   ├── Тёмная пещера (титул 3+) + Пещера славы (титул 4+)
│   ├── Кулдаун (8ч ранний / 24ч поздний)
│   ├── Бустеры (+HP, +ATK, +DEF, -DMG)
│   └── Воскрешение за звёзды
├── Магазин (7 категорий с табами)
│   ├── Оружие (8 шт, экипировка)
│   ├── Броня (8 шт, экипировка)
│   ├── Особое (Iron Dome, Stone Wall, Trebuchet, Frog Potion)
│   ├── Защита (Rov, Chastokol, Blagoslovenie, Nevidimost)
│   ├── Зелья (Eliksir Zhizni)
│   ├── Взрывчатка (Bochka Porokha, Ognivo, Poroshkoviy Master)
│   └── Бустеры (4 пещерных бустера)
└── Профиль
    ├── Титул / прогресс (награды за повышение: серебро + золото)
    ├── Ежедневный бонус (14-дневный цикл, freeze/rollback/restore)
    ├── Здоровье (ProgressBar)
    ├── Снаряжение (оружие + броня)
    ├── Холопы (защита, выкуп, сбор золота, раскрытие деталей тапом)
    └── Княжество (плейсхолдер)
```

## Ключевые конфиги и где они

| Конфиг | Файл | Что содержит |
|--------|------|--------------|
| Здания (21 шт) | `src/config/buildings.ts` | 4 категории, per-building costMult, пререквизиты, кулдауны, золотые апгрейды |
| Титулы (12 шт) | `src/config/titles.ts` | incomeThreshold, canAttack, lootBonus, награды за повышение |
| Монстры (10 шт) | `src/config/monsters.ts` | 5 тёмных + 5 славных, ATK/DEF/HP/лут |
| Оружие/Броня/Итемы | `src/config/weapons.ts` | 8 оружий, 8 брони, 4 особых, 4 защиты, 1 зелье, 3 взрывчатки, 4 бустера |
| Холопы | `src/config/serfs.ts` | 6 профессий, 4 типа защиты, формула выкупа |
| Ежедневный бонус | `src/config/dailyBonus.ts` | 14-дневный цикл, стрик логика, восстановление |
| Константы | `src/config/constants.ts` | Все лимиты, множители, кулдауны |

## Стор (Zustand)

Файл: `src/store/gameStore.ts` (~1200 строк)

Основные экшены:
- `buildBuilding`, `upgradeBuilding`, `speedUpBuilding` — строительство
- `collectIncome`, `tickIncome` — сбор дохода
- `executeRaid` — PvP с diminishing returns и захватом холопов
- `executeCaveBattle`, `resurrectInCave` — PvE
- `buyItem`, `equipWeapon`, `equipArmor` — магазин
- `activateDefense`, `usePotion`, `useCaveBooster` — использование итемов
- `protectSerf`, `ransomSerf`, `collectSerfGold` — управление холопами
- `getDailyBonusState`, `claimDailyBonus`, `restoreDailyStreak` — ежедневный бонус
- `unlockBank`, `depositToBank`, `withdrawFromBank` — банк

## При потере контекста (compacting)

1. Перечитай этот CLAUDE.md
2. Перечитай PRODUCT_BIBLE.md
3. Посмотри текущее состояние кода: `ls src/`
4. Проверь git log: `git log --oneline -10`
5. Продолжай работу
