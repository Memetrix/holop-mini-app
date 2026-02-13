/**
 * BackHeader — universal back navigation header for sub-screens
 * Used by ProfileScreen hub to provide back navigation to sub-screens
 */
import styles from './BackHeader.module.css';

interface BackHeaderProps {
  onBack: () => void;
  titleRu: string;
  titleEn: string;
  language: 'ru' | 'en';
}

export function BackHeader({ onBack, titleRu, titleEn, language }: BackHeaderProps) {
  return (
    <div className={styles.backHeader}>
      <button className={styles.backBtn} onClick={onBack}>
        ← {language === 'ru' ? 'Назад' : 'Back'}
      </button>
      <h2 className={styles.backTitle}>{language === 'ru' ? titleRu : titleEn}</h2>
    </div>
  );
}
