/**
 * HOLOP Office (Палата) Screen — Reputation income system
 * Matches bot structure: office_handlers.py → show_office_interface()
 * See PROJECT_MAP.md §9 "Палата"
 *
 * Players unlock office for 250 gold, buy rep-generating items,
 * collect reputation once per 24h. Reputation gives PvP bonus (log scale).
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import styles from './OfficeScreen.module.css';

// ─── Office Items (matches bot office_handlers.py) ───

interface OfficeItem {
  id: string;
  icon: string;
  nameRu: string;
  nameEn: string;
  repPerDay: number;
  price: number;
  currency: 'gold' | 'stars';
}

const OFFICE_ITEMS: OfficeItem[] = [
  { id: 'bench',   icon: 'bench',         nameRu: 'Дубовая скамья',   nameEn: 'Oak Bench',       repPerDay: 1,  price: 1,  currency: 'gold' },
  { id: 'table',   icon: 'scribe',        nameRu: 'Писцовый стол',    nameEn: 'Scribe Table',    repPerDay: 2,  price: 2,  currency: 'gold' },
  { id: 'throne',  icon: 'throne',        nameRu: 'Резной трон',      nameEn: 'Carved Throne',   repPerDay: 3,  price: 3,  currency: 'stars' },
  { id: 'carpet',  icon: 'carpet',        nameRu: 'Персидский ковёр',  nameEn: 'Persian Carpet',  repPerDay: 10, price: 10, currency: 'stars' },
  { id: 'icon',    icon: 'icon_painting', nameRu: 'Древняя икона',    nameEn: 'Ancient Icon',    repPerDay: 20, price: 20, currency: 'stars' },
  { id: 'cap',     icon: 'crown',         nameRu: 'Шапка Мономаха',   nameEn: 'Monomakh Cap',    repPerDay: 30, price: 30, currency: 'stars' },
  { id: 'orb',     icon: 'orb',           nameRu: 'Царская держава',  nameEn: 'Royal Orb',       repPerDay: 50, price: 50, currency: 'stars' },
  { id: 'ark',     icon: 'ark',           nameRu: 'Золотой ковчег',   nameEn: 'Golden Ark',      repPerDay: 25, price: 25, currency: 'stars' },
];

// ─── Reputation caps by title level ───
const REP_CAPS: Record<number, number | null> = {
  1: 100, 2: 100, 3: 100, 4: 100, 5: 100, 6: 100, 7: 100,
  8: 1000, 9: 1000, 10: 5000, 11: null, 12: null,
};

function getRepCap(titleLevel: number): number | null {
  return REP_CAPS[titleLevel] ?? null;
}

function getRepBonus(rep: number, cap: number | null): number {
  const effective = cap ? Math.min(rep, cap) : rep;
  return (Math.log10(effective + 1) * 0.10) * 100;
}

// ─── Mock State ───
const MOCK_OFFICE = {
  unlocked: true,
  reputation: 47.5,
  totalRepEarned: 125.3,
  lastCollect: new Date(Date.now() - 8 * 3600_000).toISOString(), // 8h ago
  ownedItems: ['bench', 'table', 'throne'] as string[],
};

const UNLOCK_COST = 250; // gold

export function OfficeScreen({ header }: { header?: ReactNode } = {}) {
  const language = useGameStore((s) => s.user.language);
  const user = useGameStore((s) => s.user);
  const addToast = useGameStore((s) => s.addToast);
  const haptics = useHaptics();

  const [office, setOffice] = useState(MOCK_OFFICE);

  const repCap = getRepCap(user.titleLevel);
  const repBonus = getRepBonus(office.reputation, repCap);

  // Calculate daily income from owned items
  const dailyIncome = OFFICE_ITEMS
    .filter(item => office.ownedItems.includes(item.id))
    .reduce((sum, item) => sum + item.repPerDay, 0);

  // Calculate accumulated reputation since last collect
  const hoursSinceCollect = Math.min(
    (Date.now() - new Date(office.lastCollect).getTime()) / 3_600_000,
    24,
  );
  const accumulated = dailyIncome * (hoursSinceCollect / 24);
  const hoursUntilFull = Math.max(0, 24 - hoursSinceCollect);

  // ─── Handlers ───

  const handleUnlock = () => {
    if (user.gold < UNLOCK_COST) {
      haptics.error();
      addToast({ type: 'error', message: language === 'ru' ? 'Недостаточно золота' : 'Not enough gold' });
      return;
    }
    haptics.success();
    setOffice({ ...office, unlocked: true });
    addToast({
      type: 'success',
      message: language === 'ru' ? 'Палата открыта!' : 'Office unlocked!',
    });
  };

  const handleCollect = () => {
    if (accumulated < 0.01) {
      haptics.error();
      addToast({ type: 'info', message: language === 'ru' ? 'Пока нечего собирать' : 'Nothing to collect yet' });
      return;
    }
    if (repCap && office.reputation >= repCap) {
      haptics.error();
      addToast({
        type: 'info',
        message: language === 'ru' ? 'Репутация на максимуме для вашего уровня!' : 'Reputation capped for your level!',
      });
      return;
    }
    haptics.success();
    const earned = repCap ? Math.min(accumulated, repCap - office.reputation) : accumulated;
    setOffice({
      ...office,
      reputation: office.reputation + earned,
      totalRepEarned: office.totalRepEarned + earned,
      lastCollect: new Date().toISOString(),
    });
    addToast({
      type: 'success',
      message: `+${earned.toFixed(2)} ${language === 'ru' ? 'репутации' : 'reputation'}`,
    });
  };

  const handleBuyItem = (item: OfficeItem) => {
    if (office.ownedItems.includes(item.id)) return;
    const currency = item.currency === 'gold' ? user.gold : user.stars;
    if (currency < item.price) {
      haptics.error();
      addToast({
        type: 'error',
        message: language === 'ru' ? `Недостаточно ${item.currency === 'gold' ? 'золота' : 'звёзд'}` : `Not enough ${item.currency}`,
      });
      return;
    }
    haptics.success();
    setOffice({
      ...office,
      ownedItems: [...office.ownedItems, item.id],
    });
    addToast({
      type: 'success',
      message: `${language === 'ru' ? item.nameRu : item.nameEn}!`,
    });
  };

  // ─── Unlock Screen ───
  if (!office.unlocked) {
    return (
      <Screen header={header}>
        <div className={styles.unlockCard}>
          <span className={styles.unlockIcon}><Icon name="office" size={48} /></span>
          <h2 className={styles.unlockTitle}>
            {language === 'ru' ? 'Палата' : 'Office'}
          </h2>
          <p className={styles.unlockDesc}>
            {language === 'ru'
              ? 'Обустройте палату предметами, которые будут приносить репутацию каждый день. Репутация даёт бонус к бою.'
              : 'Furnish your office with items that generate reputation daily. Reputation gives PvP combat bonus.'}
          </p>
          <div className={styles.unlockCost}>
            <CurrencyBadge type="gold" amount={UNLOCK_COST} />
          </div>
          <Button variant="primary" fullWidth onClick={handleUnlock}>
            {language === 'ru' ? 'Открыть палату' : 'Unlock Office'}
          </Button>
        </div>
      </Screen>
    );
  }

  // ─── Main Office View ───
  return (
    <Screen header={header}>
      {/* Reputation Status */}
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          <Icon name="office" size={20} /> {language === 'ru' ? 'Палата' : 'Office'}
        </h2>
        <div className={styles.repStatus}>
          <div className={styles.repRow}>
            <span className={styles.repLabel}>{language === 'ru' ? 'Репутация' : 'Reputation'}</span>
            <span className={styles.repValue}>
              {office.reputation.toFixed(1)}
              {repCap && <span className={styles.repCap}>/{repCap}</span>}
              <span className={styles.repBonus}> (+{repBonus.toFixed(1)}%)</span>
            </span>
          </div>
          <div className={styles.repRow}>
            <span className={styles.repLabel}>{language === 'ru' ? 'Доход' : 'Income'}</span>
            <span className={styles.repValue}>+{dailyIncome}/{language === 'ru' ? 'день' : 'day'}</span>
          </div>
        </div>
        {repCap && (
          <ProgressBar
            value={office.reputation}
            max={repCap}
            variant="gold"
            showLabel
            label={language === 'ru' ? `Лимит уровня` : `Level cap`}
          />
        )}
      </div>

      {/* Collection */}
      <div className={styles.collectCard}>
        <div className={styles.collectInfo}>
          <span className={styles.collectLabel}>
            <Icon name="gold" size={14} /> {language === 'ru' ? 'Накоплено' : 'Accumulated'}
          </span>
          <span className={styles.collectValue}>+{accumulated.toFixed(2)}</span>
        </div>
        <div className={styles.collectTimer}>
          {hoursUntilFull > 0 ? (
            <span className={styles.timerText}>
              {language === 'ru' ? 'До полного' : 'Until full'}: {Math.floor(hoursUntilFull)}{language === 'ru' ? 'ч' : 'h'} {Math.floor((hoursUntilFull % 1) * 60)}{language === 'ru' ? 'м' : 'm'}
            </span>
          ) : (
            <span className={styles.timerFull}>{language === 'ru' ? 'Полностью накоплено!' : 'Fully accumulated!'}</span>
          )}
        </div>
        <Button
          variant="primary"
          fullWidth
          onClick={handleCollect}
          disabled={accumulated < 0.01}
        >
          <><Icon name="collect" size={14} /> {language === 'ru' ? 'Собрать' : 'Collect'} (+{accumulated.toFixed(2)})</>
        </Button>
      </div>

      {/* Owned Items */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Ваши предметы' : 'Your Items'}</h3>
        {office.ownedItems.length === 0 ? (
          <p className={styles.emptyText}>
            {language === 'ru' ? 'Нет предметов' : 'No items yet'}
          </p>
        ) : (
          <div className={styles.itemList}>
            {OFFICE_ITEMS.filter(item => office.ownedItems.includes(item.id)).map(item => (
              <div key={item.id} className={styles.ownedItem}>
                <span className={styles.itemEmoji}><Icon name={item.icon} size={24} /></span>
                <div className={styles.itemInfo}>
                  <span className={styles.itemName}>{language === 'ru' ? item.nameRu : item.nameEn}</span>
                  <span className={styles.itemRate}>+{item.repPerDay}/{language === 'ru' ? 'д' : 'd'}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shop */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Магазин' : 'Shop'}</h3>
        <div className={styles.itemList}>
          {OFFICE_ITEMS.filter(item => !office.ownedItems.includes(item.id)).map(item => (
            <div key={item.id} className={styles.shopItem}>
              <span className={styles.itemEmoji}><Icon name={item.icon} size={24} /></span>
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{language === 'ru' ? item.nameRu : item.nameEn}</span>
                <span className={styles.itemRate}>+{item.repPerDay}/{language === 'ru' ? 'д' : 'd'}</span>
              </div>
              <button
                className={styles.buyBtn}
                onClick={() => handleBuyItem(item)}
              >
                <>{item.price} <Icon name={item.currency === 'gold' ? 'gold' : 'stars'} size={14} /></>
              </button>
            </div>
          ))}
          {OFFICE_ITEMS.every(item => office.ownedItems.includes(item.id)) && (
            <p className={styles.emptyText}>
              {language === 'ru' ? 'Все предметы куплены!' : 'All items purchased!'}
            </p>
          )}
        </div>
      </div>

      {/* Info */}
      <div className={styles.infoCard}>
        <p className={styles.infoText}>
          {language === 'ru'
            ? 'Репутация даёт бонус к атаке и защите в PvP (логарифмическая шкала). Сбор доступен раз в 24 часа.'
            : 'Reputation gives PvP attack/defense bonus (logarithmic scale). Collection available once per 24 hours.'}
        </p>
      </div>
    </Screen>
  );
}
