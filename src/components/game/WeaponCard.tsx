import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './WeaponCard.module.css';

interface WeaponCardProps {
  id: string;
  nameRu: string;
  assetKey: string;
  statLabel: string;
  cost: number;
  currency?: 'silver' | 'gold';
  isEquipped?: boolean;
  canAfford?: boolean;
  onBuy?: () => void;
}

export function WeaponCard({
  id,
  nameRu,
  assetKey,
  statLabel,
  cost,
  currency = 'silver',
  isEquipped = false,
  canAfford = true,
  onBuy,
}: WeaponCardProps) {
  const cardClass = `${styles.card} ${isEquipped ? styles.equipped : ''}`;

  return (
    <div className={cardClass} data-item-id={id}>
      <img
        className={styles.image}
        src={getAssetUrl(assetKey)}
        alt={nameRu}
        width={44}
        height={44}
      />

      <div className={styles.info}>
        <span className={styles.name}>{nameRu}</span>
        <span className={styles.statBonus}>{statLabel}</span>
      </div>

      <div className={styles.right}>
        {isEquipped ? (
          <span className={styles.equippedBadge}>Экипировано</span>
        ) : onBuy ? (
          <button
            className={styles.buyBtn}
            onClick={onBuy}
            disabled={!canAfford}
          >
            <img
              className={styles.costIcon}
              src={getAssetUrl(`currencies/${currency}`)}
              alt={currency}
              width={14}
              height={14}
            />
            {formatNumber(cost)}
          </button>
        ) : null}
      </div>
    </div>
  );
}
