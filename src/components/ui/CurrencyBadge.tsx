import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './CurrencyBadge.module.css';

interface CurrencyBadgeProps {
  type: 'silver' | 'gold' | 'stars' | 'reputation';
  amount: number;
  size?: 'sm' | 'md' | 'lg';
  showSign?: boolean;
}

const CURRENCY_ICONS: Record<string, string> = {
  silver: 'currencies/silver',
  gold: 'currencies/gold',
  stars: 'currencies/stars',
  reputation: 'currencies/reputation',
};

export function CurrencyBadge({ type, amount, size = 'md', showSign = false }: CurrencyBadgeProps) {
  const prefix = showSign && amount > 0 ? '+' : '';
  return (
    <div className={`${styles.badge} ${styles[size]}`}>
      <img
        src={getAssetUrl(CURRENCY_ICONS[type])}
        alt={type}
        className={styles.icon}
      />
      <span className={`${styles.amount} ${showSign && amount > 0 ? styles.positive : ''} ${showSign && amount < 0 ? styles.negative : ''}`}>
        {prefix}{formatNumber(Math.abs(amount))}
      </span>
    </div>
  );
}
