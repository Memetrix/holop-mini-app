/**
 * HOLOP Settings Screen — Language, account management
 * Matches bot structure: settings_language, settings_delete_account
 * See PROJECT_MAP.md §16 "Настройки"
 */

import type { ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/hooks/useHaptics';
import styles from './SettingsScreen.module.css';

export function SettingsScreen({ header }: { header?: ReactNode } = {}) {
  const language = useGameStore((s) => s.user.language);
  const setLanguage = useGameStore((s) => s.setLanguage);
  const addToast = useGameStore((s) => s.addToast);
  const haptics = useHaptics();

  const handleLanguage = (lang: 'ru' | 'en') => {
    setLanguage(lang);
    haptics.light();
    addToast({
      type: 'success',
      message: lang === 'ru' ? 'Язык изменён на русский' : 'Language changed to English',
    });
  };

  const handleDeleteAccount = () => {
    haptics.error();
    addToast({
      type: 'info',
      message: language === 'ru'
        ? 'Удаление аккаунта доступно только в боте'
        : 'Account deletion is only available in the bot',
    });
  };

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          {language === 'ru' ? '⚙️ Настройки' : '⚙️ Settings'}
        </h2>
      </div>

      {/* Language */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? '🌐 Язык' : '🌐 Language'}</h3>
        <div className={styles.langGrid}>
          <button
            className={`${styles.langBtn} ${language === 'ru' ? styles.langActive : ''}`}
            onClick={() => handleLanguage('ru')}
          >
            <span className={styles.langFlag}>🇷🇺</span>
            <span>Русский</span>
          </button>
          <button
            className={`${styles.langBtn} ${language === 'en' ? styles.langActive : ''}`}
            onClick={() => handleLanguage('en')}
          >
            <span className={styles.langFlag}>🇬🇧</span>
            <span>English</span>
          </button>
        </div>
      </div>

      {/* About */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'О приложении' : 'About'}</h3>
        <div className={styles.aboutList}>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>{language === 'ru' ? 'Версия' : 'Version'}</span>
            <span className={styles.aboutValue}>1.0.0-beta</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>{language === 'ru' ? 'Бот' : 'Bot'}</span>
            <span className={styles.aboutValue}>@holop_game_bot</span>
          </div>
          <div className={styles.aboutRow}>
            <span className={styles.aboutLabel}>{language === 'ru' ? 'Канал' : 'Channel'}</span>
            <span className={styles.aboutValue}>@holop_game</span>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className={styles.dangerSection}>
        <h3>{language === 'ru' ? '⚠️ Опасная зона' : '⚠️ Danger Zone'}</h3>
        <p className={styles.dangerText}>
          {language === 'ru'
            ? 'Удаление аккаунта необратимо. Все данные будут потеряны.'
            : 'Account deletion is irreversible. All data will be lost.'}
        </p>
        <Button variant="danger" fullWidth onClick={handleDeleteAccount}>
          {language === 'ru' ? 'Удалить аккаунт' : 'Delete Account'}
        </Button>
      </div>
    </Screen>
  );
}
