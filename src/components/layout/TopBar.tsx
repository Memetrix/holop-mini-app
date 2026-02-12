import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import { getTitleByLevel } from '@/config/titles';
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
  const title = getTitleByLevel(user.titleLevel);

  return (
    <header className={styles.topBar}>
      <div className={styles.left}>
        <div className={styles.avatar}>
          <img
            src={getAssetUrl(title.assetKey)}
            alt={title.nameRu}
            className={styles.avatarImg}
          />
        </div>
        <div className={styles.info}>
          <span className={styles.cityName}>{user.cityName}</span>
          <span className={styles.titleName}>{title.nameRu}</span>
        </div>
      </div>
      <div className={styles.resources}>
        <CurrencyDisplay icon="currencies/silver" value={Math.floor(user.silver)} />
        <CurrencyDisplay icon="currencies/gold" value={user.gold} compact={false} />
        <CurrencyDisplay icon="currencies/stars" value={user.stars} compact={false} />
      </div>
    </header>
  );
}
