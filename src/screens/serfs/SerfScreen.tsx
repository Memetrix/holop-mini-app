/**
 * HOLOP Serf Screen — Full serf management
 * Matches bot structure: serf_collect, serf_my, serf_catalog, serf_buy_slot, serf_free_self, serf_buy_protection
 * See PROJECT_MAP.md §3 "Холопы"
 */

import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import {
  getProfessionById,
  getRarityColor,
  SERF_PROTECTION,
  SERF_CONFIG,
  calculateRansomPriceMultiCurrency,
  getSlotPurchaseCost,
  calculateSerfBonuses,
} from '@/config/serfs';
import { formatNumber } from '@/hooks/useFormatNumber';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useHaptics } from '@/hooks/useHaptics';
import styles from './SerfScreen.module.css';

// ─── Helpers ───

function isProtectionActive(until: string | null): boolean {
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

function formatProtectionRemaining(until: string, lang: string = 'ru'): string {
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return lang === 'ru' ? 'Истекла' : 'Expired';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (lang === 'ru') {
    if (hours > 24) return `${Math.floor(hours / 24)}д ${hours % 24}ч`;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  }
  if (hours > 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ─── Mock Catalog Targets ───
type CatalogTarget = {
  userId: number;
  username: string;
  cityName: string;
  spr: number;
  status: 'free' | 'owned' | 'guarded' | 'clan' | 'master';
  ownerName?: string;
  dailyIncome: number;
  ransomCost?: number;
  ransomCurrency?: 'silver' | 'gold' | 'stars';
};

const MOCK_CATALOG: CatalogTarget[] = [
  { userId: 1001, username: 'krestyanin_ivan', cityName: 'Тверь', spr: 45, status: 'free', dailyIncome: 120 },
  { userId: 1002, username: 'boyarin_petr', cityName: 'Москва', spr: 180, status: 'free', dailyIncome: 450 },
  { userId: 1003, username: 'kupets_nikolay', cityName: 'Новгород', spr: 95, status: 'owned', ownerName: 'knyaz_oleg', dailyIncome: 280, ransomCost: 50, ransomCurrency: 'gold' },
  { userId: 1004, username: 'voevoda_dmitriy', cityName: 'Рязань', spr: 250, status: 'guarded', dailyIncome: 600 },
  { userId: 1005, username: 'starets_aleksiy', cityName: 'Суздаль', spr: 30, status: 'free', dailyIncome: 80 },
  { userId: 1006, username: 'druzhina_vasya', cityName: 'Владимир', spr: 130, status: 'free', dailyIncome: 350 },
  { userId: 1007, username: 'oprichnik_boris', cityName: 'Киев', spr: 210, status: 'clan', dailyIncome: 520 },
  { userId: 1008, username: 'smerd_fedka', cityName: 'Псков', spr: 15, status: 'free', dailyIncome: 40 },
  { userId: 1009, username: 'knyazhna_olga', cityName: 'Ярославль', spr: 175, status: 'owned', ownerName: 'boyarin_sidor', dailyIncome: 420, ransomCost: 3500, ransomCurrency: 'silver' },
  { userId: 1010, username: 'vityaz_svyatoslav', cityName: 'Чернигов', spr: 320, status: 'guarded', dailyIncome: 780 },
];

const STATUS_LABELS_SHORT: Record<string, string> = {
  free: '(F)',
  owned: '(O)',
  guarded: '(G)',
  clan: '(C)',
  master: '(M)',
};

const STATUS_LABELS_RU: Record<string, string> = {
  free: 'Свободен',
  owned: 'Чужой холоп',
  guarded: 'Охрана',
  clan: 'Клан',
  master: 'Хозяин',
};

const STATUS_LABELS_EN: Record<string, string> = {
  free: 'Free',
  owned: 'Owned',
  guarded: 'Guarded',
  clan: 'Clan member',
  master: 'Master',
};

// ─── Component ───

type SerfView = 'my' | 'catalog';

export function SerfScreen() {
  const user = useGameStore((s) => s.user);
  const serfs = useGameStore((s) => s.serfs);
  const language = useGameStore((s) => s.user.language);
  const addToast = useGameStore((s) => s.addToast);
  const collectSerfGold = useGameStore((s) => s.collectSerfGold);
  const protectSerf = useGameStore((s) => s.protectSerf);
  const guardAllSerfs = useGameStore((s) => s.guardAllSerfs);
  const ransomSerf = useGameStore((s) => s.ransomSerf);
  const releaseSerf = useGameStore((s) => s.releaseSerf);
  const buySerfSlot = useGameStore((s) => s.buySerfSlot);
  const rerollProfession = useGameStore((s) => s.rerollProfession);
  const freeSelf = useGameStore((s) => s.freeSelf);
  const haptics = useHaptics();

  const [activeView, setActiveView] = useState<SerfView>('my');
  const [expandedSerfId, setExpandedSerfId] = useState<number | null>(null);
  const [showGuardAll, setShowGuardAll] = useState(false);
  const [confirmRelease, setConfirmRelease] = useState<number | null>(null);
  const [captureResult, setCaptureResult] = useState<{ target: string; success: boolean; profession?: string } | null>(null);

  // Serf bonuses from professions
  const serfBonuses = calculateSerfBonuses(serfs);
  const slotCost = getSlotPurchaseCost(user.serfSlotsPurchased);
  const canBuySlot = user.serfSlots < SERF_CONFIG.maxSlots && user.stars >= slotCost;

  // ─── Handlers ───

  const handleCollectGold = () => {
    const gold = collectSerfGold();
    if (gold > 0) haptics.success();
    else haptics.light();
  };

  const handleProtect = (serfId: number, protectionId: string) => {
    const ok = protectSerf(serfId, protectionId);
    if (ok) haptics.success();
    else haptics.error();
  };

  const handleGuardAll = (protectionId: string) => {
    const result = guardAllSerfs(protectionId);
    if (result) {
      haptics.success();
      setShowGuardAll(false);
    } else {
      haptics.error();
    }
  };

  const handleRansom = (serfId: number) => {
    const ok = ransomSerf(serfId);
    if (ok) {
      haptics.success();
      setExpandedSerfId(null);
    } else {
      haptics.error();
    }
  };

  const handleRelease = (serfId: number) => {
    if (confirmRelease !== serfId) {
      setConfirmRelease(serfId);
      return;
    }
    const ok = releaseSerf(serfId);
    if (ok) {
      haptics.success();
      setExpandedSerfId(null);
      setConfirmRelease(null);
    } else {
      haptics.error();
    }
  };

  const handleReroll = (serfId: number) => {
    const ok = rerollProfession(serfId);
    if (ok) haptics.success();
    else haptics.error();
  };

  const handleBuySlot = () => {
    const ok = buySerfSlot();
    if (ok) haptics.success();
    else haptics.error();
  };

  const handleFreeSelf = () => {
    const ok = freeSelf();
    if (ok) haptics.success();
  };

  // ─── Catalog Handlers ───

  const handleCapture = (target: CatalogTarget) => {
    if (target.status !== 'free' && target.status !== 'owned') {
      haptics.error();
      addToast({
        type: 'error',
        message: language === 'ru' ? 'Этого игрока нельзя захватить' : 'Cannot capture this player',
      });
      return;
    }
    if (serfs.length >= user.serfSlots) {
      haptics.error();
      addToast({
        type: 'error',
        message: language === 'ru' ? 'Нет свободных слотов!' : 'No free slots!',
      });
      return;
    }
    // For owned serfs, check ransom cost
    if (target.status === 'owned' && target.ransomCost) {
      const curr = target.ransomCurrency ?? 'silver';
      const balance = curr === 'silver' ? user.silver : curr === 'gold' ? user.gold : user.stars;
      if (balance < target.ransomCost) {
        haptics.error();
        addToast({
          type: 'error',
          message: language === 'ru' ? 'Недостаточно средств для выкупа' : 'Not enough funds for ransom',
        });
        return;
      }
    }
    // Mock capture result — always succeeds on free targets
    const professions = ['pakhar', 'remeslennik', 'voin', 'zodchiy', 'lazutchik', 'volkhv'];
    const weights = [40, 25, 15, 10, 7, 3];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let roll = Math.random() * totalWeight;
    let prof = professions[0];
    for (let i = 0; i < weights.length; i++) {
      roll -= weights[i];
      if (roll <= 0) { prof = professions[i]; break; }
    }
    const profDef = getProfessionById(prof);
    haptics.success();
    setCaptureResult({
      target: target.username,
      success: true,
      profession: profDef?.nameRu ?? prof,
    });
    addToast({
      type: 'reward',
      message: language === 'ru'
        ? `${target.username} захвачен! Профессия: ${profDef?.nameRu ?? prof}`
        : `${target.username} captured! Profession: ${profDef?.nameEn ?? prof}`,
    });
  };

  const handleFrog = (target: CatalogTarget) => {
    if (target.status !== 'guarded') return;
    if (user.stars < 5) {
      haptics.error();
      addToast({
        type: 'error',
        message: language === 'ru' ? 'Нужно 5 звёзд для зелья жаб' : 'Need 5 stars for frog potion',
      });
      return;
    }
    haptics.success();
    addToast({
      type: 'info',
      message: language === 'ru'
        ? `Зелье жаб использовано! Охрана у ${target.username} снята на 10 секунд`
        : `Frog potion used! Guard on ${target.username} removed for 10 seconds`,
    });
  };

  return (
    <Screen>
      {/* Header with gold collection */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h2 className={styles.screenTitle}><Icon name="serfs" size={20} /> {language === 'ru' ? 'Холопы' : 'Serfs'}</h2>
          <span className={styles.slotCount}>{serfs.length}/{user.serfSlots}</span>
        </div>
        <Button variant="primary" size="md" fullWidth onClick={handleCollectGold}>
          <><Icon name="gold" size={16} /> {language === 'ru' ? 'Собрать золото' : 'Collect Gold'}</>
        </Button>
        {user.isFree && (
          <span className={styles.freedomBadge}>{language === 'ru' ? 'Свободен (+15% к золоту)' : 'Free (+15% gold)'}</span>
        )}
      </div>

      {/* Quick Actions — matches bot serf menu buttons */}
      <div className={styles.quickActions}>
        {/* Guard All */}
        <button
          className={styles.actionBtn}
          onClick={() => setShowGuardAll(!showGuardAll)}
          disabled={serfs.length === 0}
        >
          <span className={styles.actionIcon}><Icon name="shield" size={16} /></span>
          <span className={styles.actionLabel}>{language === 'ru' ? 'Защитить всех' : 'Guard All'}</span>
        </button>

        {/* Buy Slot */}
        <button
          className={styles.actionBtn}
          onClick={handleBuySlot}
          disabled={!canBuySlot}
        >
          <span className={styles.actionIcon}>+</span>
          <span className={styles.actionLabel}>{language === 'ru' ? 'Слот' : 'Slot'} ({slotCost}<Icon name="stars" size={12} />)</span>
        </button>

        {/* Catalog */}
        <button
          className={`${styles.actionBtn} ${activeView === 'catalog' ? styles.actionActive : ''}`}
          onClick={() => setActiveView(activeView === 'catalog' ? 'my' : 'catalog')}
        >
          <span className={styles.actionIcon}><Icon name="serfs" size={16} /></span>
          <span className={styles.actionLabel}>{language === 'ru' ? 'Каталог' : 'Catalog'}</span>
        </button>

        {/* Free Self (visible only if captured) */}
        {!user.isFree && (
          <button className={styles.actionBtn} onClick={handleFreeSelf}>
            <span className={styles.actionIcon}></span>
            <span className={styles.actionLabel}>{language === 'ru' ? 'Выкупиться' : 'Free Self'}</span>
          </button>
        )}
      </div>

      {/* Guard All Panel */}
      {showGuardAll && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Выбери защиту для всех холопов:' : 'Choose protection for all serfs:'}</h3>
          <div className={styles.protectionList}>
            {SERF_PROTECTION.map((prot) => {
              const unguardedCount = serfs.filter(s => !isProtectionActive(s.protectionUntil)).length;
              const totalCost = unguardedCount * prot.costGold;
              return (
                <button
                  key={prot.id}
                  className={styles.protectionBtn}
                  onClick={() => handleGuardAll(prot.id)}
                  disabled={user.gold < totalCost || unguardedCount === 0}
                >
                  <span className={styles.protName}>{language === 'ru' ? prot.nameRu : prot.nameEn}</span>
                  <span className={styles.protEffect}>{language === 'ru' ? prot.effect : prot.effectEn}</span>
                  <span className={styles.protCost}>
                    {totalCost} {language === 'ru' ? 'зол.' : 'gold'} ({unguardedCount} {language === 'ru' ? 'шт.' : 'pcs'})
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Serf Bonuses Summary */}
      {serfs.length > 0 && (serfBonuses.attackBonus > 0 || serfBonuses.incomeBonus > 0) && (
        <div className={styles.bonusSummary}>
          {serfBonuses.attackBonus > 0 && (
            <span className={styles.bonusItem}><Icon name="raids" size={14} /> +{serfBonuses.attackBonus} ATK</span>
          )}
          {serfBonuses.incomeBonus > 0 && (
            <span className={styles.bonusItem}><Icon name="gold" size={14} /> +{Math.round(serfBonuses.incomeBonus * 100)}% {language === 'ru' ? 'доход' : 'income'}</span>
          )}
          {serfBonuses.buildSpeedBonus > 0 && (
            <span className={styles.bonusItem}><Icon name="build" size={14} /> -{Math.round(serfBonuses.buildSpeedBonus * 100)}% {language === 'ru' ? 'стройка' : 'build'}</span>
          )}
          {serfBonuses.hasDailyScout && (
            <span className={styles.bonusItem}><Icon name="raids" size={14} /> {language === 'ru' ? 'Разведка' : 'Scout'}</span>
          )}
        </div>
      )}

      {/* ─── Catalog View ─── */}
      {activeView === 'catalog' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Каталог жертв' : 'Target Catalog'}</h3>

          {/* Capture result banner */}
          {captureResult && (
            <div className={styles.captureResult}>
              <span>{captureResult.success ? <Icon name="serfs" size={16} /> : 'X'}</span>
              <span>
                {captureResult.success
                  ? (language === 'ru'
                    ? `${captureResult.target} захвачен! Профессия: ${captureResult.profession}`
                    : `${captureResult.target} captured! Profession: ${captureResult.profession}`)
                  : (language === 'ru' ? 'Захват не удался' : 'Capture failed')}
              </span>
              <button className={styles.closeResult} onClick={() => setCaptureResult(null)}>✕</button>
            </div>
          )}

          <div className={styles.serfList}>
            {MOCK_CATALOG.map((target) => {
              const canCapture = target.status === 'free' || target.status === 'owned';
              const isGuarded = target.status === 'guarded';
              const statusLabel = language === 'ru' ? STATUS_LABELS_RU[target.status] : STATUS_LABELS_EN[target.status];

              return (
                <div key={target.userId} className={styles.catalogCard}>
                  <div className={styles.catalogInfo}>
                    <span className={styles.serfName}>
                      {STATUS_LABELS_SHORT[target.status]} @{target.username}
                    </span>
                    <span className={styles.catalogMeta}>
                      {target.cityName} • SPR: {target.spr} • {statusLabel}
                    </span>
                    {target.status === 'owned' && target.ownerName && (
                      <span className={styles.catalogOwner}>
                        {language === 'ru' ? `Хозяин: @${target.ownerName}` : `Owner: @${target.ownerName}`}
                      </span>
                    )}
                  </div>
                  <div className={styles.catalogActions}>
                    {canCapture && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleCapture(target)}
                        disabled={serfs.length >= user.serfSlots}
                      >
                        {target.status === 'owned' && target.ransomCost
                          ? <><Icon name="raids" size={14} /> {formatNumber(target.ransomCost)} {target.ransomCurrency === 'gold' ? <Icon name="gold" size={14} /> : target.ransomCurrency === 'stars' ? <Icon name="stars" size={14} /> : <Icon name="silver" size={14} />}</>
                          : <>{language === 'ru' ? <><Icon name="raids" size={14} /> Захватить</> : <><Icon name="raids" size={14} /> Capture</>}</>}
                      </Button>
                    )}
                    {isGuarded && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleFrog(target)}
                        disabled={user.stars < 5}
                      >
                        <><Icon name="frog" size={16} /> {language === 'ru' ? 'Жаба (5' : 'Frog (5'}<Icon name="stars" size={14} />{')'}</>

                      </Button>
                    )}
                    {!canCapture && !isGuarded && (
                      <span className={styles.catalogBlocked}>
                        {language === 'ru' ? 'Недоступен' : 'Unavailable'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── My Serfs View ─── */}
      {activeView === 'my' && (
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Мои холопы' : 'My Serfs'}</h3>

        {serfs.length === 0 && (
          <p className={styles.emptyText}>
            {language === 'ru' ? 'Захватывай холопов в набегах!' : 'Capture serfs in raids!'}
          </p>
        )}

        <div className={styles.serfList}>
          {serfs.map((serf) => {
            const prof = getProfessionById(serf.professionId);
            const rarityColor = prof ? getRarityColor(prof.rarity) : '#A0A0A0';
            const hasProtection = isProtectionActive(serf.protectionUntil);
            const protDef = hasProtection
              ? SERF_PROTECTION.find(p => p.id === serf.protectionType)
              : null;
            const isExpanded = expandedSerfId === serf.id;

            const hoursOwned = (Date.now() - new Date(serf.capturedAt).getTime()) / (1000 * 60 * 60);
            const ransom = calculateRansomPriceMultiCurrency(serf.dailyIncome, hoursOwned);

            const currLabel = language === 'ru'
              ? (ransom.currency === 'silver' ? 'серебра' : ransom.currency === 'gold' ? 'золота' : 'звёзд')
              : ransom.currency;

            return (
              <div key={serf.id}>
                <div
                  className={`${styles.serfCard} ${hasProtection ? styles.serfProtected : ''}`}
                  onClick={() => {
                    setExpandedSerfId(isExpanded ? null : serf.id);
                    setConfirmRelease(null);
                  }}
                >
                  {prof && <img src={getAssetUrl(prof.assetKey)} alt="" className={styles.serfImg} />}
                  <div className={styles.serfInfo}>
                    <span className={styles.serfName}>{serf.name}</span>
                    <span className={styles.serfProf} style={{ color: rarityColor }}>
                      {language === 'ru' ? (prof?.nameRu ?? serf.professionId) : (prof?.nameEn ?? serf.professionId)}
                      {' '}<span className={styles.serfLevel}>{language === 'ru' ? 'ур.' : 'lv.'}{serf.level}</span>
                    </span>
                    {hasProtection && protDef && (
                      <span className={styles.serfProtectionBadge}>
                        <Icon name="shield" size={14} /> {language === 'ru' ? protDef.nameRu : protDef.nameEn} ({formatProtectionRemaining(serf.protectionUntil!, language)})
                      </span>
                    )}
                  </div>
                  <CurrencyBadge type="gold" amount={serf.goldPer30m} size="sm" />
                </div>

                {/* Expanded Serf Actions */}
                {isExpanded && (
                  <div className={styles.serfActions}>
                    {/* SPR + Daily Income Info */}
                    <div className={styles.serfMeta}>
                      <span>SPR: {serf.spr}</span>
                      <span>{language === 'ru' ? 'Доход' : 'Income'}: {serf.dailyIncome} {language === 'ru' ? 'зол./день' : 'gold/day'}</span>
                    </div>

                    {/* Protection Options */}
                    {!hasProtection && (
                      <div className={styles.serfActionGroup}>
                        <span className={styles.serfActionLabel}>{language === 'ru' ? 'Защита:' : 'Protection:'}</span>
                        <div className={styles.protectionList}>
                          {SERF_PROTECTION.map((prot) => (
                            <button
                              key={prot.id}
                              className={styles.protectionBtn}
                              onClick={(e) => { e.stopPropagation(); handleProtect(serf.id, prot.id); }}
                              disabled={user.gold < prot.costGold}
                            >
                              <span className={styles.protName}>{language === 'ru' ? prot.nameRu : prot.nameEn}</span>
                              <span className={styles.protEffect}>{language === 'ru' ? prot.effect : prot.effectEn}</span>
                              <span className={styles.protCost}>{prot.costGold} {language === 'ru' ? 'зол.' : 'gold'}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Re-roll Profession */}
                    <div className={styles.serfActionGroup}>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleReroll(serf.id); }}
                        disabled={user.stars < SERF_CONFIG.professionChoiceCostStars}
                      >
                        {language === 'ru' ? `Сменить профессию (${SERF_CONFIG.professionChoiceCostStars}` : `Reroll (${SERF_CONFIG.professionChoiceCostStars}`}<Icon name="stars" size={14} />{')'}
                      </Button>
                    </div>

                    {/* Ransom (multi-currency) */}
                    <div className={styles.serfActionGroup}>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRansom(serf.id); }}
                        disabled={
                          (ransom.currency === 'silver' && user.silver < ransom.amount) ||
                          (ransom.currency === 'gold' && user.gold < ransom.amount) ||
                          (ransom.currency === 'stars' && user.stars < ransom.amount)
                        }
                      >
                        <><Icon name="gold" size={14} /> {language === 'ru' ? 'Выкупить' : 'Ransom'} ({formatNumber(ransom.amount)} {currLabel})</>
                      </Button>
                    </div>

                    {/* Release */}
                    <div className={styles.serfActionGroup}>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRelease(serf.id); }}
                      >
                        {confirmRelease === serf.id
                          ? (language === 'ru' ? 'Точно отпустить?' : 'Confirm release?')
                          : (language === 'ru' ? 'Отпустить' : 'Release')}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      )}
    </Screen>
  );
}
