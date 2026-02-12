/**
 * Daily Bonus System — 14-day reward cycle
 *
 * Synced with bot: DAILY_BONUS config
 * Keep rewards and constants in sync with server-side validation.
 *
 * Streak rules:
 *   0-24h since last claim  -> too_early (cannot claim)
 *   24-48h                  -> increment (streak + 1)
 *   48-72h                  -> freeze (streak unchanged)
 *   72h+                    -> rollback (streak - DAILY_ROLLBACK_DAYS)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Definition for a single day's bonus reward. */
export interface DailyBonusDayDef {
  /** Day number in the cycle (1-14). */
  day: number;
  /** Silver coins rewarded. */
  silver: number;
  /** Gold coins rewarded (0 if none). */
  gold: number;
  /** Stars rewarded (0 if none). */
  stars: number;
}

/** Action returned by streak evaluation. */
export type StreakAction = 'too_early' | 'increment' | 'freeze' | 'rollback';

// ---------------------------------------------------------------------------
// 14-Day Reward Cycle
// ---------------------------------------------------------------------------

/** Complete 14-day daily bonus cycle. Index 0 = Day 1. */
export const DAILY_BONUS: readonly DailyBonusDayDef[] = [
  { day: 1,  silver: 50,   gold: 0,  stars: 0  },
  { day: 2,  silver: 75,   gold: 0,  stars: 0  },
  { day: 3,  silver: 100,  gold: 0,  stars: 1  },
  { day: 4,  silver: 150,  gold: 0,  stars: 0  },
  { day: 5,  silver: 200,  gold: 5,  stars: 0  },
  { day: 6,  silver: 300,  gold: 0,  stars: 0  },
  { day: 7,  silver: 500,  gold: 10, stars: 2  }, // WEEKLY
  { day: 8,  silver: 600,  gold: 0,  stars: 0  },
  { day: 9,  silver: 750,  gold: 0,  stars: 0  },
  { day: 10, silver: 1000, gold: 0,  stars: 3  },
  { day: 11, silver: 1500, gold: 15, stars: 0  },
  { day: 12, silver: 2000, gold: 0,  stars: 0  },
  { day: 13, silver: 3000, gold: 20, stars: 0  },
  { day: 14, silver: 5000, gold: 50, stars: 10 }, // JACKPOT
] as const;

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Global daily bonus configuration constants. */
export const DAILY_BONUS_CONFIG = {
  /** Length of one full bonus cycle (days). */
  MAX_DAILY_STREAK: 14,

  /** Flat silver bonus per day for streaks beyond day 14. */
  DAILY_MASTER_BONUS: 200,

  /** Minimum hours between consecutive claims. */
  DAILY_BONUS_COOLDOWN: 24,

  /** Hours window where streak increments normally (24-48h). */
  DAILY_GRACE_HOURS: 48,

  /** Hours window where streak is frozen, not lost (48-72h). */
  DAILY_FREEZE_HOURS: 72,

  /** Days subtracted from streak when claiming after 72h+. */
  DAILY_ROLLBACK_DAYS: 3,

  /** Star cost per day to restore a broken streak. */
  DAILY_RESTORE_COST: 2,

  /** Maximum number of days that can be restored at once. */
  DAILY_RESTORE_MAX: 3,
} as const;

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Get the reward definition for a given streak day.
 *
 * Streak is 1-indexed and wraps around the 14-day cycle.
 * For example, streak 15 returns the Day 1 reward, streak 28 returns Day 14, etc.
 *
 * @param streak - Current streak day (1-indexed, minimum 1).
 * @returns The matching {@link DailyBonusDayDef} for that cycle position.
 */
export function getDailyReward(streak: number): DailyBonusDayDef {
  const clamped = Math.max(1, Math.floor(streak));
  const index = ((clamped - 1) % DAILY_BONUS_CONFIG.MAX_DAILY_STREAK);
  return DAILY_BONUS[index];
}

/**
 * Determine what happens to the player's streak based on time since last claim.
 *
 * | Hours since last claim | Result      |
 * |------------------------|-------------|
 * | 0 - 24                 | `too_early` |
 * | 24 - 48                | `increment` |
 * | 48 - 72                | `freeze`    |
 * | 72+                    | `rollback`  |
 *
 * @param hoursSinceLastClaim - Hours elapsed since the player's last daily claim.
 * @returns The {@link StreakAction} to apply.
 */
export function getStreakAction(hoursSinceLastClaim: number): StreakAction {
  const {
    DAILY_BONUS_COOLDOWN,
    DAILY_GRACE_HOURS,
    DAILY_FREEZE_HOURS,
  } = DAILY_BONUS_CONFIG;

  if (hoursSinceLastClaim < DAILY_BONUS_COOLDOWN) {
    return 'too_early';
  }
  if (hoursSinceLastClaim < DAILY_GRACE_HOURS) {
    return 'increment';
  }
  if (hoursSinceLastClaim < DAILY_FREEZE_HOURS) {
    return 'freeze';
  }
  return 'rollback';
}

/**
 * Calculate the star cost to restore a broken streak.
 *
 * Cost scales linearly: {@link DAILY_BONUS_CONFIG.DAILY_RESTORE_COST} stars per day.
 * Days are clamped to [0, {@link DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX}].
 *
 * @param daysToRestore - Number of streak days the player wants to recover (max 3).
 * @returns Total star cost for the restoration.
 */
export function getRestoreCost(daysToRestore: number): number {
  const clamped = Math.min(
    Math.max(0, Math.floor(daysToRestore)),
    DAILY_BONUS_CONFIG.DAILY_RESTORE_MAX,
  );
  return clamped * DAILY_BONUS_CONFIG.DAILY_RESTORE_COST;
}

/**
 * Calculate the master bonus silver for streaks beyond the 14-day cycle.
 *
 * Players who have completed the full cycle receive a flat
 * {@link DAILY_BONUS_CONFIG.DAILY_MASTER_BONUS} silver on top of their
 * cycled day reward. Returns 0 for streaks within the first cycle.
 *
 * @param streak - Current streak day (1-indexed).
 * @returns Extra silver to add on top of the regular day reward.
 */
export function getMasterBonus(streak: number): number {
  if (streak <= DAILY_BONUS_CONFIG.MAX_DAILY_STREAK) {
    return 0;
  }
  return DAILY_BONUS_CONFIG.DAILY_MASTER_BONUS;
}
