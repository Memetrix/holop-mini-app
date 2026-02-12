import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import type { TabId } from '@/store/types';
import styles from './TabBar.module.css';

const TABS: { id: TabId; labelRu: string; labelEn: string; icon: string }[] = [
  { id: 'territory', labelRu: 'Территория', labelEn: 'Territory', icon: 'ui_main/ui_territory' },
  { id: 'raids', labelRu: 'Набеги', labelEn: 'Raids', icon: 'ui_main/ui_nabegi' },
  { id: 'caves', labelRu: 'Пещеры', labelEn: 'Caves', icon: 'ui_main/ui_caves' },
  { id: 'shop', labelRu: 'Лавка', labelEn: 'Shop', icon: 'ui_main/ui_shop' },
  { id: 'profile', labelRu: 'Профиль', labelEn: 'Profile', icon: 'ui_misc/ui_profile' },
];

export function TabBar() {
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  const handleTabPress = (tabId: TabId) => {
    if (tabId !== activeTab) {
      haptics.light();
      setActiveTab(tabId);
    }
  };

  return (
    <nav className={styles.tabBar}>
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            className={`${styles.tab} ${isActive ? styles.active : ''}`}
            onClick={() => handleTabPress(tab.id)}
            aria-label={language === 'ru' ? tab.labelRu : tab.labelEn}
          >
            <div className={styles.iconWrap}>
              <img
                src={getAssetUrl(tab.icon)}
                alt=""
                className={styles.icon}
                loading="lazy"
              />
              {isActive && <div className={styles.activeGlow} />}
            </div>
            <span className={styles.label}>
              {language === 'ru' ? tab.labelRu : tab.labelEn}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
