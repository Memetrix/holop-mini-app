import type { Building } from '@/store/types';
import { getAssetUrl } from '@/config/assets';
import { formatNumber, formatIncome } from '@/hooks/useFormatNumber';
import styles from './BuildingCard.module.css';

interface BuildingCardProps {
  building: Building;
  onUpgrade?: () => void;
  canAfford?: boolean;
  isMaxLevel?: boolean;
  upgradeCost?: number;
  upgradeCurrency?: 'silver' | 'gold';
}

export function BuildingCard({
  building,
  onUpgrade,
  canAfford = true,
  isMaxLevel = false,
  upgradeCost,
  upgradeCurrency = 'silver',
}: BuildingCardProps) {
  return (
    <div className={styles.card}>
      <img
        className={styles.image}
        src={getAssetUrl(`buildings/${building.id}`)}
        alt={building.id}
        width={48}
        height={48}
      />

      <div className={styles.info}>
        <span className={styles.name}>{building.id}</span>
        <span className={styles.level}>Уровень {building.level}</span>
      </div>

      <div className={styles.right}>
        <span className={styles.income}>{formatIncome(building.income)}</span>

        {isMaxLevel ? (
          <span className={styles.maxBadge}>MAX</span>
        ) : onUpgrade ? (
          <button
            className={styles.upgradeBtn}
            onClick={onUpgrade}
            disabled={!canAfford}
          >
            {upgradeCost !== undefined && (
              <img
                className={styles.costIcon}
                src={getAssetUrl(`currencies/${upgradeCurrency}`)}
                alt={upgradeCurrency}
                width={14}
                height={14}
              />
            )}
            {upgradeCost !== undefined ? formatNumber(upgradeCost) : 'Улучшить'}
          </button>
        ) : null}
      </div>
    </div>
  );
}
