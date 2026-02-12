import { getAssetUrl } from '@/config/assets';
import styles from './TitleProgress.module.css';

interface TitleProgressProps {
  currentTitle: { nameRu: string; assetKey: string; level: number };
  nextTitle?: { nameRu: string; incomeThreshold: number; level: number } | null;
  currentIncome: number;
}

export function TitleProgress({ currentTitle, nextTitle, currentIncome }: TitleProgressProps) {
  const percent = nextTitle
    ? Math.min(100, Math.round((currentIncome / nextTitle.incomeThreshold) * 100))
    : 100;

  return (
    <div className={styles.container}>
      <div className={styles.currentTitle}>
        <img
          className={styles.titleIcon}
          src={getAssetUrl(currentTitle.assetKey)}
          alt={currentTitle.nameRu}
          width={32}
          height={32}
        />
        <span className={styles.titleName}>{currentTitle.nameRu}</span>
      </div>

      <div className={styles.progressArea}>
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className={styles.percent}>{percent}%</span>
      </div>

      <div className={styles.nextTitle}>
        {nextTitle ? (
          <span className={styles.nextName}>{nextTitle.nameRu}</span>
        ) : (
          <span className={styles.maxReached}>MAX</span>
        )}
      </div>
    </div>
  );
}
