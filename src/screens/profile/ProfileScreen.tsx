/**
 * HOLOP "Двор" / "Court" — Central Hub
 * Core game mechanics: Bank (prominent), Kingdoms, Office, Daily, Rankings, Achievements, Seasons.
 * Profile/Settings/Help/Referrals moved to AvatarDrawer (TopBar).
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { formatIncome } from '@/hooks/useFormatNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BackHeader } from '@/components/ui/BackHeader';
import { useHaptics } from '@/hooks/useHaptics';
import { CourtScene } from '@/pixi/CourtScene';
import { DailyBonus } from './DailyBonus';
import { BankScreen } from '@/screens/bank/BankScreen';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';
import { AchievementsScreen } from '@/screens/achievements/AchievementsScreen';
import { ClanScreen } from '@/screens/clan/ClanScreen';
import { SeasonsScreen } from '@/screens/seasons/SeasonsScreen';
import { OfficeScreen } from '@/screens/office/OfficeScreen';
import styles from './ProfileScreen.module.css';

type SubScreen = null | 'bank' | 'clan' | 'leaderboard' | 'achievements' | 'seasons' | 'daily' | 'office';


interface ProfileScreenProps {
  /** When opened as overlay from AvatarDrawer, start on a specific sub-screen */
  initialSubScreen?: string;
  /** Callback when overlay back is pressed (instead of internal goBack) */
  onOverlayBack?: () => void;
}

export function ProfileScreen({ initialSubScreen, onOverlayBack }: ProfileScreenProps = {}) {
  const user = useGameStore((s) => s.user);
  const equipment = useGameStore((s) => s.equipment);
  const clan = useGameStore((s) => s.clan);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const language = useGameStore((s) => s.user.language);
  const getDailyBonusState = useGameStore((s) => s.getDailyBonusState);
  const haptics = useHaptics();

  const [subScreen, setSubScreen] = useState<SubScreen>(
    (initialSubScreen as SubScreen) ?? null,
  );

  // Viewport measurement for CourtScene
  const [viewSize, setViewSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const courtContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function measure() {
      if (courtContainerRef.current) {
        const rect = courtContainerRef.current.getBoundingClientRect();
        setViewSize({ w: rect.width, h: rect.height });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Daily bonus state
  const canClaimDaily = getDailyBonusState().canClaim;

  const handleCourtTap = useCallback((id: string) => {
    haptics.light();
    setSubScreen(id as SubScreen);
  }, [haptics]);

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);
  const goBack = onOverlayBack ? onOverlayBack : () => setSubScreen(null);

  // ─── Sub-screen routing ───
  if (subScreen === 'bank') return (
    <BankScreen header={<BackHeader onBack={goBack} titleRu="Казна" titleEn="Treasury" language={language} />} />
  );
  if (subScreen === 'leaderboard') return (
    <LeaderboardScreen header={<BackHeader onBack={goBack} titleRu="Рейтинги" titleEn="Rankings" language={language} />} />
  );
  if (subScreen === 'achievements') return (
    <AchievementsScreen header={<BackHeader onBack={goBack} titleRu="Достижения" titleEn="Achievements" language={language} />} />
  );
  if (subScreen === 'clan') return (
    <ClanScreen header={<BackHeader onBack={goBack} titleRu="Княжества" titleEn="Kingdoms" language={language} />} />
  );
  if (subScreen === 'seasons') return (
    <SeasonsScreen header={<BackHeader onBack={goBack} titleRu="Сезоны" titleEn="Seasons" language={language} />} />
  );
  if (subScreen === 'office') return (
    <OfficeScreen header={<BackHeader onBack={goBack} titleRu="Палата" titleEn="Office" language={language} />} />
  );
  if (subScreen === 'daily') return (
    <Screen header={<BackHeader onBack={goBack} titleRu="Ежедневный бонус" titleEn="Daily Bonus" language={language} />}>
      <DailyBonus />
    </Screen>
  );

  // ─── Profile sub-screen (when opened from overlay) ───
  if (initialSubScreen === 'profile') return (
    <Screen>
      <BackHeader onBack={goBack} titleRu="Профиль" titleEn="Profile" language={language} />

      {/* Player Card */}
      <div className={styles.profileCard}>
        <img src={getAssetUrl(title.assetKey)} alt={language === 'ru' ? title.nameRu : title.nameEn} className={styles.avatar} />
        <h2 className={styles.name}>@{user.username}</h2>
        <span className={styles.title}>{language === 'ru' ? title.nameRu : title.nameEn} {'\u2022'} {user.cityName}</span>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{language === 'ru' ? 'Атака' : 'Attack'}</span>
            <span className={styles.statValue}>ATK {user.attack}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{language === 'ru' ? 'Защита' : 'Defense'}</span>
            <span className={styles.statValue}>DEF {user.defense}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{language === 'ru' ? 'Здоровье' : 'Health'}</span>
            <span className={styles.statValue}>HP {user.health}/{user.maxHealth}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{language === 'ru' ? 'Доход' : 'Income'}</span>
            <span className={styles.statValue}>{formatIncome(totalIncome)}</span>
          </div>
        </div>

        {nextTitle && (
          <div style={{ marginTop: 'var(--space-4)', width: '100%' }}>
            <ProgressBar value={totalIncome} max={nextTitle.incomeThreshold} variant="gold" showLabel label={`${language === 'ru' ? 'До' : 'To'} ${language === 'ru' ? nextTitle.nameRu : nextTitle.nameEn}`} />
          </div>
        )}
      </div>

      {/* HP Bar */}
      <div className={styles.section}>
        <ProgressBar value={user.health} max={user.maxHealth} variant="health" showLabel label={language === 'ru' ? 'Здоровье' : 'Health'} height={10} />
      </div>

      {/* Equipment */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Снаряжение' : 'Equipment'}</h3>
        <div className={styles.equipGrid}>
          {equipment.weapon && (
            <div className={styles.equipItem}>
              <img src={getAssetUrl(`weapons/${equipment.weapon.id}`)} alt="" className={styles.equipImg} />
              <span>{language === 'ru' ? equipment.weapon.nameRu : equipment.weapon.nameEn}</span>
              <span className={styles.equipStat}>+{equipment.weapon.atkBonus} ATK</span>
            </div>
          )}
          {equipment.armor && (
            <div className={styles.equipItem}>
              <img src={getAssetUrl(`armor/${equipment.armor.id}`)} alt="" className={styles.equipImg} />
              <span>{language === 'ru' ? equipment.armor.nameRu : equipment.armor.nameEn}</span>
              <span className={styles.equipStat}>+{equipment.armor.defBonus} DEF</span>
            </div>
          )}
        </div>
      </div>

      {/* Clan Quick Info */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Княжество' : 'Kingdom'}</h3>
        {clan ? (
          <div className={styles.clanCard}>
            <div className={styles.clanInfo}>
              <span className={styles.clanName}>{clan.name}</span>
              <span className={styles.clanRole}>{clan.role}</span>
              <div className={styles.clanStats}>
                <span>{language === 'ru' ? 'Участников' : 'Members'}: {clan.memberCount}/{clan.maxMembers}</span>
                <span>{language === 'ru' ? 'Мощь' : 'Power'}: {clan.totalPower}</span>
              </div>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 'var(--space-2) 0' }}>
            {language === 'ru' ? 'Не состоите в княжестве' : 'Not in a kingdom'}
          </p>
        )}
      </div>
    </Screen>
  );

  // ─── Main Hub View ("Двор" / "Court") — Interactive PixiJS Courtyard ───
  return (
    <div className={styles.courtContainer} ref={courtContainerRef}>
      <CourtScene
        width={viewSize.w}
        height={viewSize.h}
        onItemTap={handleCourtTap}
        canClaimDaily={canClaimDaily}
        language={language}
      />
    </div>
  );
}
