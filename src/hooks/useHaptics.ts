/**
 * HOLOP — Haptic Feedback Hook
 * Wraps Telegram HapticFeedback API with fallback.
 */

import { useCallback, useMemo } from 'react';

export function useHaptics() {
  const haptics = useMemo(
    () => window.Telegram?.WebApp?.HapticFeedback,
    []
  );

  /** Light tap (tab switch, toggle) */
  const light = useCallback(() => {
    haptics?.impactOccurred('light');
  }, [haptics]);

  /** Medium tap (button press, card selection) */
  const medium = useCallback(() => {
    haptics?.impactOccurred('medium');
  }, [haptics]);

  /** Heavy tap (important action, damage dealt) */
  const heavy = useCallback(() => {
    haptics?.impactOccurred('heavy');
  }, [haptics]);

  /** Rigid tap (error, blocked action) */
  const rigid = useCallback(() => {
    haptics?.impactOccurred('rigid');
  }, [haptics]);

  /** Success notification (purchase, upgrade, victory) */
  const success = useCallback(() => {
    haptics?.notificationOccurred('success');
  }, [haptics]);

  /** Error notification (insufficient funds, failed action) */
  const error = useCallback(() => {
    haptics?.notificationOccurred('error');
  }, [haptics]);

  /** Warning notification (low health, cooldown) */
  const warning = useCallback(() => {
    haptics?.notificationOccurred('warning');
  }, [haptics]);

  /** Selection change (scroll pick, slider) */
  const selection = useCallback(() => {
    haptics?.selectionChanged();
  }, [haptics]);

  return {
    light,
    medium,
    heavy,
    rigid,
    success,
    error,
    warning,
    selection,
    isAvailable: !!haptics,
  };
}
