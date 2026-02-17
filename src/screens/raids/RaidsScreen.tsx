import { useState, useEffect, useMemo } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel } from '@/config/titles';
import { GAME } from '@/config/constants';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Icon } from '@/components/ui/Icon';
import { BattleScreen } from './BattleScreen';
import styles from './RaidsScreen.module.css';

/** Calculate diminishing factor for a target based on raid history (last 24h). */
function getRecentRaidCount(
  raidHistory: { targetId: number; raidedAt: string }[],
  targetId: number,
): number {
  const now = Date.now();
  return raidHistory.filter(
    (r) => r.targetId === targetId && now - new Date(r.raidedAt).getTime() < 24 * 60 * 60 * 1000,
  ).length;
}

/** Format seconds into M:SS countdown string. */
function formatCooldown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// ─── Bochka Catalog Mock Data ───

interface BochkaTarget {
  id: number;
  username: string;
  cityName: string;
  titleLevel: number;
  silver: number;
  isExploded: boolean;
  recoveryAt?: string;
  isMined: boolean; // already has a bochka planted
  clanName?: string;
}

const MOCK_BOCHKA_TARGETS: BochkaTarget[] = [
  { id: 201, username: 'knyaz_oleg', cityName: 'Новгород', titleLevel: 9, silver: 450000, isExploded: false, isMined: false, clanName: 'Волки' },
  { id: 202, username: 'boyarin_petr', cityName: 'Суздаль', titleLevel: 8, silver: 320000, isExploded: false, isMined: false },
  { id: 203, username: 'voevoda_dmitriy', cityName: 'Тверь', titleLevel: 10, silver: 680000, isExploded: false, isMined: true },
  { id: 204, username: 'kupets_nikolay', cityName: 'Псков', titleLevel: 7, silver: 180000, isExploded: true, recoveryAt: '2026-02-14T12:00:00Z', isMined: false },
  { id: 205, username: 'starets_aleksiy', cityName: 'Рязань', titleLevel: 6, silver: 95000, isExploded: false, isMined: false },
  { id: 206, username: 'druzhina_vasya', cityName: 'Владимир', titleLevel: 8, silver: 270000, isExploded: false, isMined: false, clanName: 'Орда' },
  { id: 207, username: 'smerd_fedka', cityName: 'Ростов', titleLevel: 7, silver: 150000, isExploded: false, isMined: false },
  { id: 208, username: 'krestyanin_ivan', cityName: 'Ярославль', titleLevel: 6, silver: 75000, isExploded: false, isMined: false },
];

type BochkaSort = 'level_desc' | 'level_asc' | 'silver_desc' | 'silver_asc';

type RaidView = 'targets' | 'bochka';

export function RaidsScreen() {
  const raidTargets = useGameStore((s) => s.raidTargets);
  const user = useGameStore((s) => s.user);
  const raidHistory = useGameStore((s) => s.raidHistory);
  const refreshTargets = useGameStore((s) => s.refreshRaidTargets);
  const addToast = useGameStore((s) => s.addToast);
  const language = useGameStore((s) => s.user.language);
  const [battleTargetId, setBattleTargetId] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const [view, setView] = useState<RaidView>('targets');
  const [bochkaSort, setBochkaSort] = useState<BochkaSort>('level_desc');
  const [bochkaSearch, setBochkaSearch] = useState('');

  const isPvpUnlocked = user.titleLevel >= 6;
  const isTsar = user.titleLevel >= 12;
  const lowHealth = user.health < GAME.PVP_MIN_HEALTH_TO_ATTACK;

  // -- Cooldown timer --
  useEffect(() => {
    function calcRemaining(): number {
      if (!user.raidCooldownUntil) return 0;
      const remaining = Math.ceil(
        (new Date(user.raidCooldownUntil).getTime() - Date.now()) / 1000,
      );
      return Math.max(0, remaining);
    }

    setCooldownSeconds(calcRemaining());
    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setCooldownSeconds(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [user.raidCooldownUntil]);

  const onCooldown = cooldownSeconds > 0;

  // -- Filter out invisible targets --
  const visibleTargets = useMemo(
    () => raidTargets.filter((t) => !t.isInvisible),
    [raidTargets],
  );

  // -- Bochka sorted & filtered targets --
  const bochkaTargets = useMemo(() => {
    let list = [...MOCK_BOCHKA_TARGETS];
    if (bochkaSearch) {
      const q = bochkaSearch.toLowerCase();
      list = list.filter(t => t.username.toLowerCase().includes(q) || t.cityName.toLowerCase().includes(q));
    }
    switch (bochkaSort) {
      case 'level_desc': list.sort((a, b) => b.titleLevel - a.titleLevel); break;
      case 'level_asc': list.sort((a, b) => a.titleLevel - b.titleLevel); break;
      case 'silver_desc': list.sort((a, b) => b.silver - a.silver); break;
      case 'silver_asc': list.sort((a, b) => a.silver - b.silver); break;
    }
    return list;
  }, [bochkaSort, bochkaSearch]);

  // -- Handle returning from battle --
  const handleBattleBack = () => {
    setBattleTargetId(null);
  };

  const handleAttack = (targetId: number) => {
    setBattleTargetId(targetId);
  };

  const handlePlantBochka = (target: BochkaTarget) => {
    if (target.isExploded || target.isMined) return;
    // Mock: check if player has bochka (100 stars)
    if (user.stars < 100) {
      addToast({
        type: 'error',
        message: language === 'ru' ? 'Нужна Бочка пороха (100 звёзд)' : 'Need Powder Keg (100 stars)',
      });
      return;
    }
    addToast({
      type: 'success',
      message: language === 'ru'
        ? `Бочка заложена у @${target.username}! Враг должен обезвредить за 10 мин.`
        : `Barrel planted at @${target.username}! Enemy must defuse in 10 min.`,
    });
  };

  if (battleTargetId !== null) {
    return (
      <BattleScreen
        targetId={battleTargetId}
        onBack={handleBattleBack}
      />
    );
  }

  if (!isPvpUnlocked) {
    return (
      <Screen>
        <div className={styles.locked}>
          <img src={getAssetUrl('ui_main/ui_nabegi')} alt="" className={styles.lockedIcon} />
          <h2>{language === 'ru' ? 'Набеги заблокированы' : 'Raids Locked'}</h2>
          <p>{language === 'ru'
            ? 'Достигни титула Купец (ур. 6), чтобы разблокировать PvP набеги.'
            : 'Reach Merchant title (lv. 6) to unlock PvP raids.'}</p>
        </div>
      </Screen>
    );
  }

  // ─── Bochka Catalog View ───
  if (view === 'bochka') {
    return (
      <Screen>
        <div className={styles.header}>
          <h2><Icon name="bomb" size={20} /> {language === 'ru' ? 'Бочка пороха' : 'Powder Keg'}</h2>
          <Button variant="ghost" size="sm" onClick={() => setView('targets')}>
            {language === 'ru' ? '← Набеги' : '← Raids'}
          </Button>
        </div>

        {/* Info banner */}
        <div className={styles.bochkaInfo}>
          <p>
            {language === 'ru'
              ? 'Выберите цель для подрыва. Бочка уничтожает весь доход города на 24 часа.'
              : 'Select target for explosion. Barrel destroys all city income for 24 hours.'}
          </p>
          <span className={styles.bochkaCost}>
            {language === 'ru' ? 'Стоимость:' : 'Cost:'} 100<Icon name="stars" size={14} />
          </span>
        </div>

        {/* Sort & Search */}
        <div className={styles.bochkaControls}>
          <input
            type="text"
            className={styles.bochkaSearchInput}
            placeholder={language === 'ru' ? 'Поиск по имени/городу...' : 'Search name/city...'}
            value={bochkaSearch}
            onChange={(e) => setBochkaSearch(e.target.value)}
          />
          <div className={styles.sortBtns}>
            {([
              { key: 'level_desc' as BochkaSort, label: language === 'ru' ? 'Ур. ↓' : 'Lv. ↓' },
              { key: 'level_asc' as BochkaSort, label: language === 'ru' ? 'Ур. ↑' : 'Lv. ↑' },
              { key: 'silver_desc' as BochkaSort, label: '$ ↓' },
              { key: 'silver_asc' as BochkaSort, label: '$ ↑' },
            ]).map(s => (
              <button
                key={s.key}
                className={`${styles.sortBtn} ${bochkaSort === s.key ? styles.sortActive : ''}`}
                onClick={() => setBochkaSort(s.key)}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Target List */}
        <div className={styles.targetList}>
          {bochkaTargets.map((target) => {
            const title = getTitleByLevel(target.titleLevel);
            const canPlant = !target.isExploded && !target.isMined;
            return (
              <div key={target.id} className={`${styles.targetCard} ${target.isExploded ? styles.targetExploded : ''}`}>
                <div className={styles.targetInfo}>
                  <div className={styles.targetHeader}>
                    <img src={getAssetUrl(title.assetKey)} alt="" className={styles.targetAvatar} />
                    <div>
                      <span className={styles.targetName}>@{target.username}</span>
                      <span className={styles.targetCity}>
                        {target.cityName} {'\u2022'} {language === 'ru' ? title.nameRu : title.nameEn}
                        {target.clanName && ` [${target.clanName}]`}
                      </span>
                    </div>
                  </div>
                  <div className={styles.targetStats}>
                    <CurrencyBadge type="silver" amount={target.silver} size="sm" />
                  </div>
                  <div className={styles.badges}>
                    {target.isExploded && (
                      <span className={`${styles.badge} ${styles.badgeRed}`}>
                        {language === 'ru' ? 'Взорван' : 'Exploded'}
                      </span>
                    )}
                    {target.isMined && !target.isExploded && (
                      <span className={`${styles.badge} ${styles.badgeOrange}`}>
                        {language === 'ru' ? 'Заминирован' : 'Mined'}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  className={styles.plantBtn}
                  onClick={() => handlePlantBochka(target)}
                  disabled={!canPlant}
                >
                  {canPlant
                    ? <><Icon name="bomb" size={16} /> {language === 'ru' ? 'Заложить' : 'Plant'}</>
                    : (language === 'ru' ? '—' : '—')}
                </button>
              </div>
            );
          })}
        </div>

        {/* Defuse info */}
        <div className={styles.bochkaDefuseInfo}>
          <h4>{language === 'ru' ? 'Обезвреживание' : 'Defusing'}</h4>
          <div className={styles.defuseRow}>
            <span><Icon name="flint" size={16} /> {language === 'ru' ? 'Огниво' : 'Flint'}</span>
            <span className={styles.defuseChance}>33%</span>
            <span className={styles.defuseCost}>5,000 <Icon name="silver" size={14} /></span>
          </div>
          <div className={styles.defuseRow}>
            <span><Icon name="master_defuse" size={16} /> {language === 'ru' ? 'Мастер' : 'Master'}</span>
            <span className={styles.defuseChance}>75%</span>
            <span className={styles.defuseCost}>50 <Icon name="stars" size={14} /></span>
          </div>
        </div>
      </Screen>
    );
  }

  // ─── Main Raid Targets View ───
  return (
    <Screen>
      <div className={styles.header}>
        <h2>{language === 'ru' ? 'Набеги' : 'Raids'}</h2>
        <div className={styles.headerActions}>
          <Button variant="ghost" size="sm" onClick={() => setView('bochka')}>
            <Icon name="bomb" size={20} />
          </Button>
          <Button variant="ghost" size="sm" onClick={refreshTargets}>
            {language === 'ru' ? 'Обновить' : 'Refresh'}
          </Button>
        </div>
      </div>

      {/* Tsar flavor restriction */}
      {isTsar && (
        <div className={styles.statusBanner}>
          <span className={styles.statusIcon}>&#128081;</span>
          <span>{language === 'ru' ? 'Царь не ведёт набеги лично' : 'The Tsar does not raid personally'}</span>
        </div>
      )}

      {/* Cooldown timer display */}
      {!isTsar && onCooldown && (
        <div className={styles.statusBanner}>
          <span className={styles.statusIcon}>&#9203;</span>
          <span>{language === 'ru' ? 'Кулдаун' : 'Cooldown'}: {formatCooldown(cooldownSeconds)}</span>
        </div>
      )}

      {/* Low health warning */}
      {!isTsar && lowHealth && (
        <div className={`${styles.statusBanner} ${styles.statusDanger}`}>
          <span className={styles.statusIcon}>&#10071;</span>
          <span>{language === 'ru' ? `Мало здоровья! Минимум ${GAME.PVP_MIN_HEALTH_TO_ATTACK} HP` : `Low health! Minimum ${GAME.PVP_MIN_HEALTH_TO_ATTACK} HP`}</span>
        </div>
      )}

      <div className={styles.targetList}>
        {visibleTargets.map((target) => {
          const title = getTitleByLevel(target.titleLevel);
          const recentCount = getRecentRaidCount(raidHistory, target.id);
          const diminishingFactor = recentCount > 0
            ? Math.pow(GAME.PVP_DIMINISHING_FACTOR, recentCount)
            : 1;

          const isIronDome = target.hasIronDome;
          const canAttack = !isTsar && !onCooldown && !lowHealth && !isIronDome;

          return (
            <div key={target.id} className={styles.targetCard}>
              <div className={styles.targetInfo}>
                <div className={styles.targetHeader}>
                  <img src={getAssetUrl(title.assetKey)} alt="" className={styles.targetAvatar} />
                  <div>
                    <span className={styles.targetName}>@{target.username}</span>
                    <span className={styles.targetCity}>
                      {target.cityName} {'\u2022'} {language === 'ru' ? title.nameRu : title.nameEn}
                    </span>
                  </div>
                </div>
                <div className={styles.targetStats}>
                  <CurrencyBadge type="silver" amount={target.silver} size="sm" />
                  <span className={styles.stat}>DEF {target.defense}</span>
                </div>

                {/* Defense indicator badges */}
                <div className={styles.badges}>
                  {isIronDome && (
                    <span className={`${styles.badge} ${styles.badgeRed}`}>
                      {language === 'ru' ? 'Железный купол' : 'Iron Dome'}
                    </span>
                  )}
                  {target.hasStoneWall && (
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>
                      {language === 'ru' ? 'Каменная стена' : 'Stone Wall'}
                    </span>
                  )}
                  {target.hasMoat && (
                    <span className={`${styles.badge} ${styles.badgeCyan}`}>
                      {language === 'ru' ? 'Ров (+50% защиты)' : 'Moat (+50% defense)'}
                    </span>
                  )}
                  {recentCount > 0 && (
                    <span className={`${styles.badge} ${styles.badgeOrange}`}>
                      {language === 'ru' ? 'Лут' : 'Loot'}: x{diminishingFactor.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAttack(target.id)}
                disabled={!canAttack}
              >
                {isIronDome
                  ? (language === 'ru' ? 'Защищён' : 'Shielded')
                  : (language === 'ru' ? 'Напасть' : 'Attack')}
              </Button>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
