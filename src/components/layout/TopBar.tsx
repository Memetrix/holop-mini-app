import { useState, useMemo } from 'react';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import { getTitleByLevel } from '@/config/titles';
import { Icon } from '@/components/ui/Icon';
import { useHaptics } from '@/hooks/useHaptics';
import { AvatarDrawer } from './AvatarDrawer';
import styles from './TopBar.module.css';

interface CurrencyDisplayProps {
  icon: string;
  value: number;
  compact?: boolean;
}

function CurrencyDisplay({ icon, value, compact = true }: CurrencyDisplayProps) {
  return (
    <div className={styles.currency}>
      <img src={getAssetUrl(icon)} alt="" className={styles.currencyIcon} />
      <span className={styles.currencyValue}>
        {compact ? formatNumber(value) : value.toLocaleString('ru-RU')}
      </span>
    </div>
  );
}

export function TopBar() {
  const user = useGameStore((s) => s.user);
  const language = useGameStore((s) => s.user.language);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const collectIncome = useGameStore((s) => s.collectIncome);
  const getDailyBonusState = useGameStore((s) => s.getDailyBonusState);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const title = getTitleByLevel(user.titleLevel);
  const haptics = useHaptics();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Check if daily bonus is claimable
  const dailyState = getDailyBonusState();
  const isDailyClaimable = dailyState.canClaim;

  // Calculate accumulated silver since last collect
  const accumulated = useMemo(() => {
    const lastCollect = new Date(user.lastIncomeCollect).getTime();
    const elapsed = Date.now() - lastCollect;
    const hours = elapsed / (1000 * 60 * 60);
    const healthMult = user.health / 100;
    return Math.floor(totalIncome * Math.min(hours, 24) * healthMult);
  }, [user.lastIncomeCollect, totalIncome, user.health]);

  const handleCollect = () => {
    if (accumulated > 0) {
      haptics.success();
      collectIncome();
    }
  };

  const handleDailyBonus = () => {
    haptics.light();
    // Navigate to Dvor tab and open daily bonus
    setActiveTab('profile');
    // The daily bonus sub-screen will need to be triggered
    // For now, just switch to the hub tab
  };

  return (
    <>
      <header className={styles.topBar}>
        <div className={styles.left} onClick={() => setDrawerOpen(true)}>
          <div className={styles.avatar}>
            <img
              src={getAssetUrl(title.assetKey)}
              alt={language === 'ru' ? title.nameRu : title.nameEn}
              className={styles.avatarImg}
            />
          </div>
          <div className={styles.info}>
            <span className={styles.cityName}>{user.cityName}</span>
            <span className={styles.titleName}>
              {language === 'ru' ? title.nameRu : title.nameEn}
            </span>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={styles.quickActions}>
          {/* Daily Bonus */}
          <button
            className={`${styles.quickBtn} ${isDailyClaimable ? styles.quickPulse : ''}`}
            onClick={handleDailyBonus}
            aria-label={language === 'ru' ? 'Бонус' : 'Bonus'}
          >
            <Icon name="daily" size={22} />
            {isDailyClaimable && <span className={styles.quickDot} />}
          </button>

          {/* Collect Income */}
          <button
            className={styles.quickBtn}
            onClick={handleCollect}
            aria-label={language === 'ru' ? 'Собрать' : 'Collect'}
          >
            <Icon name="collect" size={22} />
            {accumulated > 0 && (
              <span className={styles.quickBadge}>
                +{formatNumber(accumulated)}
              </span>
            )}
          </button>
        </div>

        <div className={styles.resources}>
          <CurrencyDisplay icon="currencies/silver" value={Math.floor(user.silver)} />
          <CurrencyDisplay icon="currencies/gold" value={user.gold} compact={false} />
          <CurrencyDisplay icon="currencies/stars" value={user.stars} compact={false} />
        </div>
      </header>
      <AvatarDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
