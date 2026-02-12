import { useState } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import { DAILY_BONUS, DAILY_BONUS_CONFIG, getRestoreCost } from '@/config/dailyBonus';
import { Button } from '@/components/ui/Button';
import styles from './DailyBonus.module.css';

// ─── Helpers ───

/** Russian plural for "день" */
function pluralDays(n: number): string {
  const abs = Math.abs(n) % 100;
  const last = abs % 10;
  if (abs >= 11 && abs <= 19) return `${n} дней`;
  if (last === 1) return `${n} день`;
  if (last >= 2 && last <= 4) return `${n} дня`;
  return `${n} дней`;
}

/** Reward icon emoji for the dominant currency of a day. */
function rewardIcon(day: (typeof DAILY_BONUS)[number]): string {
  if (day.stars > 0) return '\u2B50';
  if (day.gold > 0) return '\uD83E\uDE99';
  return '\uD83E\uDEB6'; // silver coin fallback
}

/** Short label for a day's primary reward. */
function rewardLabel(day: (typeof DAILY_BONUS)[number]): string {
  if (day.stars > 0) return `${day.stars}`;
  if (day.gold > 0) return `${day.gold}`;
  return formatNumber(day.silver);
}

// ─── Streak status messages ───

const STREAK_MESSAGES: Record<string, string> = {
  too_early: 'Возвращайся позже',
  increment: 'Забрать награду!',
  freeze: 'Серия заморожена',
  rollback: 'Серия сброшена на -3 дня',
};

// ─── Component ───

export function DailyBonus() {
  const haptics = useHaptics();
  const getDailyBonusState = useGameStore((s) => s.getDailyBonusState);
  const claimDailyBonus = useGameStore((s) => s.claimDailyBonus);
  const restoreDailyStreak = useGameStore((s) => s.restoreDailyStreak);

  const [justClaimed, setJustClaimed] = useState(false);

  const state = getDailyBonusState();
  const { currentStreak, canClaim, streakAction, todayReward } = state;

  // Determine which cycle-day index we are on (0-indexed)
  // currentStreak is the *completed* streak count; next claim lands on currentStreak+1
  const nextDay = streakAction === 'rollback'
    ? Math.max(1, currentStreak - DAILY_BONUS_CONFIG.DAILY_ROLLBACK_DAYS)
    : streakAction === 'increment'
      ? currentStreak + 1
      : currentStreak; // freeze keeps current
  const todayIndex = ((Math.max(1, nextDay) - 1) % DAILY_BONUS_CONFIG.MAX_DAILY_STREAK);

  // ─── Handlers ───

  const handleClaim = () => {
    const ok = claimDailyBonus();
    if (ok) {
      haptics.success();
      setJustClaimed(true);
    }
  };

  const handleRestore = () => {
    const days = Math.min(
      DAILY_BONUS_CONFIG.DAILY_ROLLBACK_DAYS,
      DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX,
    );
    const ok = restoreDailyStreak(days);
    if (ok) {
      haptics.success();
    } else {
      haptics.error();
    }
  };

  // ─── Restore cost ───

  const restoreDays = Math.min(
    DAILY_BONUS_CONFIG.DAILY_ROLLBACK_DAYS,
    DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX,
  );
  const restoreCost = getRestoreCost(restoreDays);
  const showRestore = streakAction === 'rollback' || streakAction === 'freeze';

  // ─── Render helpers ───

  const firstRow = DAILY_BONUS.slice(0, 7);
  const secondRow = DAILY_BONUS.slice(7, 14);

  const renderDay = (day: (typeof DAILY_BONUS)[number], index: number) => {
    const isPast = index < todayIndex;
    const isToday = index === todayIndex;
    const isFuture = index > todayIndex;
    const isTodayClaimed = isToday && (justClaimed || !canClaim);

    return (
      <div
        key={day.day}
        className={`
          ${styles.dayCircle}
          ${isPast || isTodayClaimed ? styles.dayClaimed : ''}
          ${isToday && !isTodayClaimed ? styles.dayCurrent : ''}
          ${isFuture ? styles.dayFuture : ''}
        `}
      >
        <span className={styles.dayNumber}>{day.day}</span>

        {(isPast || isTodayClaimed) && (
          <span className={styles.checkmark}>&#10003;</span>
        )}

        {isToday && !isTodayClaimed && streakAction === 'too_early' && (
          <span className={styles.claimLabel}>&#8987;</span>
        )}

        {isToday && !isTodayClaimed && streakAction !== 'too_early' && (
          <span className={styles.claimLabel}>!</span>
        )}

        <span className={styles.dayReward}>
          {rewardIcon(day)} {rewardLabel(day)}
        </span>
      </div>
    );
  };

  // ─── Reward breakdown text ───

  const breakdownParts: string[] = [];
  if (todayReward.silver > 0) breakdownParts.push(`${formatNumber(todayReward.silver)} серебра`);
  if (todayReward.gold > 0) breakdownParts.push(`${todayReward.gold} золота`);
  if (todayReward.stars > 0) breakdownParts.push(`${todayReward.stars} звёзд`);

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.header}>
        <h3 className={styles.title}>Ежедневный бонус</h3>
        <span className={styles.streak}>
          Серия: {pluralDays(currentStreak)}
        </span>
      </div>

      {/* Status message */}
      <div className={styles.statusMessage}>
        {STREAK_MESSAGES[streakAction]}
      </div>

      {/* Row 1: Days 1-7 */}
      <div className={styles.daysRow}>
        {firstRow.map((day, i) => renderDay(day, i))}
      </div>

      {/* Row 2: Days 8-14 */}
      <div className={styles.daysRow}>
        {secondRow.map((day, i) => renderDay(day, i + 7))}
      </div>

      {/* Reward breakdown */}
      <div className={styles.rewardBreakdown}>
        {breakdownParts.join(' + ')}
      </div>

      {/* Claim button */}
      {canClaim && !justClaimed && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          onClick={handleClaim}
        >
          Забрать награду!
        </Button>
      )}

      {justClaimed && (
        <Button
          variant="primary"
          size="md"
          fullWidth
          disabled
        >
          Получено!
        </Button>
      )}

      {/* Restore streak button */}
      {showRestore && !justClaimed && (
        <div className={styles.restoreSection}>
          <Button
            variant="secondary"
            size="md"
            fullWidth
            onClick={handleRestore}
          >
            Восстановить серию ({restoreCost} ⭐)
          </Button>
          <span className={styles.restoreHint}>
            {DAILY_BONUS_CONFIG.DAILY_RESTORE_COST} звёзд за день, макс. {DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX} дня
          </span>
        </div>
      )}
    </div>
  );
}
