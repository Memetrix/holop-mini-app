/**
 * HOLOP Central Hub ("Ещё" / "More") — Main navigation hub
 * Mirrors bot's main ReplyKeyboard: all sections not in the TabBar
 * Bot has 15 buttons → 5 are in TabBar, remaining 10 are here
 * See PROJECT_MAP.md for full navigation tree
 */

import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { formatIncome } from '@/hooks/useFormatNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BackHeader } from '@/components/ui/BackHeader';
import { DailyBonus } from './DailyBonus';
import { BankScreen } from '@/screens/bank/BankScreen';
import { LeaderboardScreen } from '@/screens/leaderboard/LeaderboardScreen';
import { AchievementsScreen } from '@/screens/achievements/AchievementsScreen';
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { ReferralsScreen } from '@/screens/referrals/ReferralsScreen';
import { ClanScreen } from '@/screens/clan/ClanScreen';
import { SeasonsScreen } from '@/screens/seasons/SeasonsScreen';
import { HelpScreen } from '@/screens/help/HelpScreen';
import { OfficeScreen } from '@/screens/office/OfficeScreen';
import styles from './ProfileScreen.module.css';

type SubScreen = null | 'bank' | 'clan' | 'leaderboard' | 'achievements' | 'referrals' | 'seasons' | 'daily' | 'settings' | 'help' | 'office' | 'profile';

// Hub navigation items — matches bot's main keyboard rows 2-5
const HUB_ITEMS: { id: SubScreen; emoji: string; labelRu: string; labelEn: string }[] = [
  { id: 'bank', emoji: '🏦', labelRu: 'Казна', labelEn: 'Treasury' },
  { id: 'clan', emoji: '👑', labelRu: 'Княжества', labelEn: 'Kingdoms' },
  { id: 'office', emoji: '🏛️', labelRu: 'Палата', labelEn: 'Office' },
  { id: 'daily', emoji: '🎁', labelRu: 'Бонус', labelEn: 'Bonus' },
  { id: 'leaderboard', emoji: '🏆', labelRu: 'Рейтинги', labelEn: 'Rankings' },
  { id: 'achievements', emoji: '🎖️', labelRu: 'Достижения', labelEn: 'Achievements' },
  { id: 'seasons', emoji: '📊', labelRu: 'Сезоны', labelEn: 'Seasons' },
  { id: 'referrals', emoji: '👥', labelRu: 'Рефералы', labelEn: 'Referrals' },
  { id: 'settings', emoji: '⚙️', labelRu: 'Настройки', labelEn: 'Settings' },
  { id: 'help', emoji: 'ℹ️', labelRu: 'Помощь', labelEn: 'Help' },
  { id: 'profile', emoji: '👤', labelRu: 'Профиль', labelEn: 'Profile' },
];

export function ProfileScreen() {
  const user = useGameStore((s) => s.user);
  const equipment = useGameStore((s) => s.equipment);
  const clan = useGameStore((s) => s.clan);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const language = useGameStore((s) => s.user.language);

  const [subScreen, setSubScreen] = useState<SubScreen>(null);

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);
  const goBack = () => setSubScreen(null);

  // ─── Sub-screen routing — header passed into each screen's <Screen> ───
  if (subScreen === 'bank') return (
    <BankScreen header={<BackHeader onBack={goBack} titleRu="Казна" titleEn="Treasury" language={language} />} />
  );
  if (subScreen === 'leaderboard') return (
    <LeaderboardScreen header={<BackHeader onBack={goBack} titleRu="Рейтинги" titleEn="Rankings" language={language} />} />
  );
  if (subScreen === 'achievements') return (
    <AchievementsScreen header={<BackHeader onBack={goBack} titleRu="Достижения" titleEn="Achievements" language={language} />} />
  );
  if (subScreen === 'settings') return (
    <SettingsScreen header={<BackHeader onBack={goBack} titleRu="Настройки" titleEn="Settings" language={language} />} />
  );
  if (subScreen === 'referrals') return (
    <ReferralsScreen header={<BackHeader onBack={goBack} titleRu="Рефералы" titleEn="Referrals" language={language} />} />
  );
  if (subScreen === 'clan') return (
    <ClanScreen header={<BackHeader onBack={goBack} titleRu="Княжества" titleEn="Kingdoms" language={language} />} />
  );
  if (subScreen === 'seasons') return (
    <SeasonsScreen header={<BackHeader onBack={goBack} titleRu="Сезоны" titleEn="Seasons" language={language} />} />
  );
  if (subScreen === 'help') return (
    <HelpScreen header={<BackHeader onBack={goBack} titleRu="Помощь" titleEn="Help" language={language} />} />
  );
  if (subScreen === 'office') return (
    <OfficeScreen header={<BackHeader onBack={goBack} titleRu="Палата" titleEn="Office" language={language} />} />
  );
  if (subScreen === 'daily') return (
    <Screen header={<BackHeader onBack={goBack} titleRu="Ежедневный бонус" titleEn="Daily Bonus" language={language} />}>
      <DailyBonus />
    </Screen>
  );

  // ─── Profile sub-screen ───
  if (subScreen === 'profile') return (
    <Screen>
      <BackHeader onBack={goBack} titleRu="Профиль" titleEn="Profile" language={language} />

      {/* Player Card */}
      <div className={styles.profileCard}>
        <img src={getAssetUrl(title.assetKey)} alt={title.nameRu} className={styles.avatar} />
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

  // ─── Main Hub View ───
  return (
    <Screen>
      {/* Compact Player Banner */}
      <div className={styles.hubBanner}>
        <img src={getAssetUrl(title.assetKey)} alt="" className={styles.hubAvatar} />
        <div className={styles.hubPlayerInfo}>
          <span className={styles.hubName}>@{user.username}</span>
          <span className={styles.hubTitle}>{language === 'ru' ? title.nameRu : title.nameEn}</span>
        </div>
        <div className={styles.hubIncome}>
          <span className={styles.hubIncomeValue}>{formatIncome(totalIncome)}</span>
          <span className={styles.hubIncomeLabel}>{language === 'ru' ? '/час' : '/hr'}</span>
        </div>
      </div>

      {/* Navigation Grid — all bot sections not in TabBar */}
      <div className={styles.navGrid}>
        {HUB_ITEMS.map((item) => (
          <button
            key={item.id}
            className={styles.navBtn}
            onClick={() => setSubScreen(item.id)}
          >
            <span className={styles.navIcon}>{item.emoji}</span>
            <span className={styles.navLabel}>{language === 'ru' ? item.labelRu : item.labelEn}</span>
          </button>
        ))}
      </div>
    </Screen>
  );
}
