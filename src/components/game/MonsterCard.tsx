import type { MonsterDef } from '@/config/monsters';
import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './MonsterCard.module.css';

interface MonsterCardProps {
  monster: MonsterDef;
  onFight?: () => void;
  disabled?: boolean;
}

export function MonsterCard({ monster, onFight, disabled = false }: MonsterCardProps) {
  return (
    <div className={styles.card}>
      <img
        className={styles.image}
        src={getAssetUrl(monster.assetKey)}
        alt={monster.nameRu}
        width={64}
        height={64}
      />

      <span className={styles.name}>{monster.nameRu}</span>

      <div className={styles.stats}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>ATK</span>
          <span className={`${styles.statValue} ${styles.atkValue}`}>{monster.atk}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>DEF</span>
          <span className={`${styles.statValue} ${styles.defValue}`}>{monster.def}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>HP</span>
          <span className={`${styles.statValue} ${styles.hpValue}`}>{monster.hp}</span>
        </div>
      </div>

      <div className={styles.loot}>
        <span className={styles.lootItem}>
          <img
            className={styles.lootIcon}
            src={getAssetUrl('currencies/silver')}
            alt="silver"
            width={16}
            height={16}
          />
          {formatNumber(monster.silverLoot)}
        </span>
        <span className={styles.lootItem}>
          <img
            className={styles.lootIcon}
            src={getAssetUrl('currencies/gold')}
            alt="gold"
            width={16}
            height={16}
          />
          {Math.round(monster.goldChance * 100)}%
        </span>
      </div>

      {onFight && (
        <button
          className={styles.fightBtn}
          onClick={onFight}
          disabled={disabled}
        >
          Бой
        </button>
      )}
    </div>
  );
}
