import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Button } from '@/components/ui/Button';
import styles from './DailyBonus.module.css';

interface DailyBonusProps {
  currentStreak: number;
  onClaim?: () => void;
  claimed?: boolean;
}

const DAY_REWARDS = [100, 200, 300, 400, 500, 700, 1000];

export function DailyBonus({ currentStreak, onClaim, claimed = false }: DailyBonusProps) {
  const haptics = useHaptics();

  const handleClaim = () => {
    haptics.success();
    onClaim?.();
  };

  const todayIndex = Math.min(currentStreak, 6);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>Ежедневный бонус</h3>
        <span className={styles.streak}>
          Серия: {currentStreak} {currentStreak === 1 ? 'день' : 'дней'}
        </span>
      </div>

      <div className={styles.daysRow}>
        {DAY_REWARDS.map((reward, index) => {
          const isPast = index < todayIndex;
          const isToday = index === todayIndex;
          const isFuture = index > todayIndex;
          const isTodayClaimed = isToday && claimed;

          return (
            <div
              key={index}
              className={`
                ${styles.dayCircle}
                ${isPast || isTodayClaimed ? styles.dayClaimed : ''}
                ${isToday && !claimed ? styles.dayCurrent : ''}
                ${isFuture ? styles.dayFuture : ''}
              `}
            >
              <span className={styles.dayNumber}>{index + 1}</span>
              {(isPast || isTodayClaimed) && (
                <span className={styles.checkmark}>&#10003;</span>
              )}
              {isToday && !claimed && (
                <span className={styles.claimLabel}>!</span>
              )}
              <span className={styles.dayReward}>{formatNumber(reward)}</span>
            </div>
          );
        })}
      </div>

      {!claimed && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleClaim}
        >
          Забрать +{formatNumber(DAY_REWARDS[todayIndex])} серебра
        </Button>
      )}
    </div>
  );
}
