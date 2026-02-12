/**
 * HOLOP — Idle Game Loop Hook
 * Increments silver every second based on hourly income.
 * Also handles health regeneration (1 HP per minute).
 */

import { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { GAME } from '@/config/constants';

export function useGameLoop() {
  const tickIncome = useGameStore((s) => s.tickIncome);
  const regenerateHealth = useGameStore((s) => s.regenerateHealth);
  const incomeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const healthIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Income tick every second
    incomeIntervalRef.current = setInterval(() => {
      tickIncome();
    }, GAME.INCOME_TICK_INTERVAL_MS);

    // Health regen every minute
    healthIntervalRef.current = setInterval(() => {
      regenerateHealth();
    }, 60 * 1000);

    return () => {
      if (incomeIntervalRef.current) clearInterval(incomeIntervalRef.current);
      if (healthIntervalRef.current) clearInterval(healthIntervalRef.current);
    };
  }, [tickIncome, regenerateHealth]);
}
