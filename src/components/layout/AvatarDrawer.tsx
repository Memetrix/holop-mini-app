/**
 * AvatarDrawer — Apple-style slide-out panel from TopBar avatar.
 * Contains player profile summary + navigation to Profile, Settings, Help, Referrals.
 * Opens via clicking the avatar in TopBar.
 */

import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { formatIncome } from '@/hooks/useFormatNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import { useHaptics } from '@/hooks/useHaptics';
import { useRef, useCallback, type TouchEvent } from 'react';
import styles from './AvatarDrawer.module.css';

interface AvatarDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function AvatarDrawer({ open, onClose }: AvatarDrawerProps) {
  const user = useGameStore((s) => s.user);
  const equipment = useGameStore((s) => s.equipment);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const language = useGameStore((s) => s.user.language);
  const setOverlayScreen = useGameStore((s) => s.setOverlayScreen);
  const haptics = useHaptics();

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);

  // Swipe-to-close (left direction)
  const drawerRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const isDragging = useRef(false);

  const onTouchStart = useCallback((e: TouchEvent) => {
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
    isDragging.current = false;
  }, []);

  const onTouchMove = useCallback((e: TouchEvent) => {
    const el = drawerRef.current;
    if (!el) return;
    const touchX = e.touches[0].clientX;
    const dx = touchX - startX.current;

    // Only drag if moving left (to close)
    if (dx < -10) {
      isDragging.current = true;
      currentX.current = touchX;
      const translateX = Math.max(dx * 0.8, -400);
      el.style.transform = `translateX(${translateX}px)`;
      el.style.transition = 'none';
    }
  }, []);

  const onTouchEnd = useCallback(() => {
    const el = drawerRef.current;
    if (!el) return;
    if (!isDragging.current) return;

    const dx = currentX.current - startX.current;
    isDragging.current = false;

    if (dx < -80) {
      el.style.transition = 'transform 250ms ease-out';
      el.style.transform = 'translateX(-100%)';
      setTimeout(onClose, 250);
    } else {
      el.style.transition = 'transform 200ms cubic-bezier(0.32, 0.72, 0, 1)';
      el.style.transform = 'translateX(0)';
    }
  }, [onClose]);

  const navigateTo = (screen: 'profile' | 'settings' | 'help' | 'referrals') => {
    haptics.light();
    setOverlayScreen(screen);
    onClose();
  };

  if (!open) return null;

  const navItems = [
    { id: 'profile' as const, icon: 'profile', labelRu: 'Профиль', labelEn: 'Profile' },
    { id: 'settings' as const, icon: 'settings', labelRu: 'Настройки', labelEn: 'Settings' },
    { id: 'help' as const, icon: 'help', labelRu: 'Помощь', labelEn: 'Help' },
    { id: 'referrals' as const, icon: 'referrals', labelRu: 'Рефералы', labelEn: 'Referrals' },
  ];

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={drawerRef}
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Player Card */}
        <div className={styles.playerCard}>
          <img
            src={getAssetUrl(title.assetKey)}
            alt={language === 'ru' ? title.nameRu : title.nameEn}
            className={styles.avatar}
          />
          <div className={styles.playerInfo}>
            <span className={styles.username}>@{user.username}</span>
            <span className={styles.titleCity}>
              {language === 'ru' ? title.nameRu : title.nameEn} &bull; {user.cityName}
            </span>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>ATK</span>
            <span className={styles.statValue}>{user.attack}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>DEF</span>
            <span className={styles.statValue}>{user.defense}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>HP</span>
            <span className={styles.statValue}>{user.health}/{user.maxHealth}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{language === 'ru' ? 'Доход' : 'Income'}</span>
            <span className={styles.statValue}>{formatIncome(totalIncome)}</span>
          </div>
        </div>

        {/* Title Progress */}
        {nextTitle && (
          <div className={styles.progressSection}>
            <ProgressBar
              value={totalIncome}
              max={nextTitle.incomeThreshold}
              variant="gold"
              showLabel
              label={`${language === 'ru' ? 'До' : 'To'} ${language === 'ru' ? nextTitle.nameRu : nextTitle.nameEn}`}
              height={8}
            />
          </div>
        )}

        {/* Equipment */}
        {(equipment.weapon || equipment.armor) && (
          <div className={styles.equipSection}>
            {equipment.weapon && (
              <div className={styles.equipItem}>
                <img src={getAssetUrl(`weapons/${equipment.weapon.id}`)} alt="" className={styles.equipImg} />
                <span className={styles.equipName}>{language === 'ru' ? equipment.weapon.nameRu : equipment.weapon.nameEn}</span>
                <span className={styles.equipStat}>+{equipment.weapon.atkBonus} ATK</span>
              </div>
            )}
            {equipment.armor && (
              <div className={styles.equipItem}>
                <img src={getAssetUrl(`armor/${equipment.armor.id}`)} alt="" className={styles.equipImg} />
                <span className={styles.equipName}>{language === 'ru' ? equipment.armor.nameRu : equipment.armor.nameEn}</span>
                <span className={styles.equipStat}>+{equipment.armor.defBonus} DEF</span>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className={styles.navList}>
          {navItems.map((item) => (
            <button
              key={item.id}
              className={styles.navItem}
              onClick={() => navigateTo(item.id)}
            >
              <Icon name={item.icon} size={24} />
              <span className={styles.navLabel}>
                {language === 'ru' ? item.labelRu : item.labelEn}
              </span>
              <span className={styles.navArrow}>&rsaquo;</span>
            </button>
          ))}
        </div>

        {/* Language Toggle */}
        <div className={styles.langToggle}>
          <button
            className={`${styles.langBtn} ${user.language === 'ru' ? styles.langActive : ''}`}
            onClick={() => useGameStore.getState().setLanguage('ru')}
          >
            RU
          </button>
          <button
            className={`${styles.langBtn} ${user.language === 'en' ? styles.langActive : ''}`}
            onClick={() => useGameStore.getState().setLanguage('en')}
          >
            EN
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
