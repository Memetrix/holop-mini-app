/**
 * HOLOP — Number Formatting Hook
 * Formats numbers with compact notation (1.2K, 3.4M, 5.6B)
 * and Russian locale formatting.
 */

import { useCallback } from 'react';
import { useGameStore } from '@/store/gameStore';

type FormatStyle = 'compact' | 'full' | 'short';

/** Format a number with compact notation */
export function formatNumber(value: number, style: FormatStyle = 'compact'): string {
  if (style === 'full') {
    return value.toLocaleString('ru-RU');
  }

  if (style === 'short') {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  }

  // Compact: same as short but with space and no decimals for smaller numbers
  if (value >= 1_000_000_000) {
    const b = value / 1_000_000_000;
    return b >= 10 ? `${Math.floor(b)}B` : `${b.toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return m >= 10 ? `${Math.floor(m)}M` : `${m.toFixed(1)}M`;
  }
  if (value >= 10_000) {
    const k = value / 1_000;
    return k >= 10 ? `${Math.floor(k)}K` : `${k.toFixed(1)}K`;
  }
  if (value >= 1_000) {
    return value.toLocaleString('ru-RU');
  }
  return value.toString();
}

/** Format time remaining from a date string */
export function formatTimeRemaining(dateStr: string | null): string {
  if (!dateStr) return '';

  const target = new Date(dateStr).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) return 'Готово';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  if (hours > 0) return `${hours}ч ${minutes}м`;
  if (minutes > 0) return `${minutes}м ${seconds}с`;
  return `${seconds}с`;
}

/** Format income per hour */
export function formatIncome(income: number): string {
  return `${formatNumber(income)}/ч`;
}

/** Hook version for use in components */
export function useFormatNumber() {
  const language = useGameStore((s) => s.user.language);

  const format = useCallback(
    (value: number, style: FormatStyle = 'compact') => formatNumber(value, style),
    []
  );

  const formatTime = useCallback(
    (dateStr: string | null) => formatTimeRemaining(dateStr),
    []
  );

  const _formatIncome = useCallback(
    (income: number) => formatIncome(income),
    []
  );

  return {
    format,
    formatTime,
    formatIncome: _formatIncome,
    language,
  };
}
