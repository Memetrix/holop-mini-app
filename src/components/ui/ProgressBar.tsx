import styles from './ProgressBar.module.css';

interface ProgressBarProps {
  value: number;
  max: number;
  variant?: 'gold' | 'health' | 'xp' | 'danger';
  showLabel?: boolean;
  label?: string;
  height?: number;
}

export function ProgressBar({
  value,
  max,
  variant = 'gold',
  showLabel = false,
  label,
  height = 8,
}: ProgressBarProps) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  const isDanger = variant === 'health' && percent < 25;

  return (
    <div className={styles.wrapper}>
      {showLabel && (
        <div className={styles.labelRow}>
          <span className={styles.label}>{label}</span>
          <span className={styles.value}>{Math.floor(value)} / {max}</span>
        </div>
      )}
      <div className={styles.track} style={{ height }}>
        <div
          className={`${styles.fill} ${styles[variant]} ${isDanger ? styles.dangerPulse : ''}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
