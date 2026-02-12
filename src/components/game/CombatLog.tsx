import { getAssetUrl } from '@/config/assets';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './CombatLog.module.css';

interface CombatLogProps {
  log: Array<{
    turn: number;
    attackerDamage: number;
    defenderDamage: number;
    attackerHp: number;
    defenderHp: number;
  }>;
  won: boolean;
  silverLooted?: number;
  goldLooted?: number;
}

export function CombatLog({ log, won, silverLooted, goldLooted }: CombatLogProps) {
  const resultClass = won
    ? `${styles.result} ${styles.victory}`
    : `${styles.result} ${styles.defeat}`;

  const resultTextClass = won
    ? `${styles.resultText} ${styles.victoryText}`
    : `${styles.resultText} ${styles.defeatText}`;

  return (
    <div className={styles.container}>
      {log.map((entry) => (
        <div key={entry.turn} className={styles.round}>
          <span className={styles.roundLabel}>Раунд {entry.turn}:</span>
          <span className={styles.playerDamage}>
            Вы нанесли {entry.attackerDamage} урона
          </span>
          <span className={styles.separator}>&bull;</span>
          <span className={styles.receivedDamage}>
            Получено {entry.defenderDamage} урона
          </span>
        </div>
      ))}

      <div className={resultClass}>
        <span className={resultTextClass}>
          {won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
        </span>

        {won && (silverLooted || goldLooted) ? (
          <div className={styles.lootSummary}>
            {silverLooted ? (
              <span className={styles.lootItem}>
                <img
                  className={styles.lootIcon}
                  src={getAssetUrl('currencies/silver')}
                  alt="silver"
                  width={18}
                  height={18}
                />
                +{formatNumber(silverLooted)}
              </span>
            ) : null}
            {goldLooted ? (
              <span className={styles.lootItem}>
                <img
                  className={styles.lootIcon}
                  src={getAssetUrl('currencies/gold')}
                  alt="gold"
                  width={18}
                  height={18}
                />
                +{formatNumber(goldLooted)}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
