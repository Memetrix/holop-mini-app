/**
 * HOLOP — Telegram WebApp API Hook
 * Provides typed access to the Telegram WebApp API.
 */

import { useEffect, useCallback, useMemo } from 'react';

// Type declaration for Telegram WebApp
declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

interface ThemeParams {
  bg_color?: string;
  text_color?: string;
  hint_color?: string;
  link_color?: string;
  button_color?: string;
  button_text_color?: string;
  secondary_bg_color?: string;
  header_bg_color?: string;
  accent_text_color?: string;
  section_bg_color?: string;
  section_header_text_color?: string;
  subtitle_text_color?: string;
  destructive_text_color?: string;
}

interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  close: () => void;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  platform: string;
  colorScheme: 'light' | 'dark';
  themeParams: ThemeParams;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    auth_date?: number;
  };
  MainButton: {
    text: string;
    color: string;
    textColor: string;
    isVisible: boolean;
    isActive: boolean;
    setText: (text: string) => void;
    show: () => void;
    hide: () => void;
    enable: () => void;
    disable: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
    showProgress: (leaveActive?: boolean) => void;
    hideProgress: () => void;
  };
  BackButton: {
    isVisible: boolean;
    show: () => void;
    hide: () => void;
    onClick: (callback: () => void) => void;
    offClick: (callback: () => void) => void;
  };
  HapticFeedback: {
    impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
    notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
    selectionChanged: () => void;
  };
  openInvoice: (url: string, callback?: (status: string) => void) => void;
  setBackgroundColor: (color: string) => void;
  setHeaderColor: (color: string) => void;
  enableClosingConfirmation: () => void;
  disableClosingConfirmation: () => void;
  isVerticalSwipesEnabled: boolean;
  disableVerticalSwipes: () => void;
  enableVerticalSwipes: () => void;
}

export function useTelegram() {
  const tg = useMemo(() => window.Telegram?.WebApp, []);

  useEffect(() => {
    if (tg) {
      tg.ready();
      tg.expand();
      tg.setBackgroundColor('#1A1008');
      tg.setHeaderColor('#1A1008');
      tg.enableClosingConfirmation();
      // Disable pull-to-close swipe gesture (Bot API 7.7+)
      if (tg.disableVerticalSwipes) {
        tg.disableVerticalSwipes();
      }
      // Re-call after a short delay — TG WebApp may not be fully ready on first call
      const timer = setTimeout(() => {
        try {
          tg.expand();
          if (tg.disableVerticalSwipes) {
            tg.disableVerticalSwipes();
          }
        } catch { /* ignore if already destroyed */ }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tg]);

  const user = useMemo(() => tg?.initDataUnsafe?.user ?? null, [tg]);
  const themeParams = useMemo(() => tg?.themeParams ?? {}, [tg]);
  const platform = useMemo(() => tg?.platform ?? 'unknown', [tg]);
  const colorScheme = useMemo(() => tg?.colorScheme ?? 'dark', [tg]);

  const showMainButton = useCallback((text: string, onClick: () => void) => {
    if (!tg) return;
    tg.MainButton.setText(text);
    tg.MainButton.show();
    tg.MainButton.onClick(onClick);
  }, [tg]);

  const hideMainButton = useCallback(() => {
    tg?.MainButton.hide();
  }, [tg]);

  const showBackButton = useCallback((onClick: () => void) => {
    if (!tg) return;
    tg.BackButton.show();
    tg.BackButton.onClick(onClick);
  }, [tg]);

  const hideBackButton = useCallback(() => {
    tg?.BackButton.hide();
  }, [tg]);

  const close = useCallback(() => {
    tg?.close();
  }, [tg]);

  return {
    tg,
    user,
    themeParams,
    platform,
    colorScheme,
    isAvailable: !!tg,
    showMainButton,
    hideMainButton,
    showBackButton,
    hideBackButton,
    close,
  };
}
