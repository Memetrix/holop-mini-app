/**
 * HOLOP Seasons Screen — Season points, leaderboard, history
 * Matches bot structure: season_points, season_leaderboard, season_history
 * See PROJECT_MAP.md §1.7 Сезонные очки
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Icon } from '@/components/ui/Icon';
import styles from './SeasonsScreen.module.css';

type SeasonTab = 'overview' | 'leaderboard' | 'history' | 'rewards';

const MOCK_SEASON = {
  number: 3,
  nameRu: 'Сезон III — Медный Век',
  nameEn: 'Season III — Bronze Age',
  daysLeft: 18,
  totalDays: 30,
  playerPoints: 2450,
  playerRank: 42,
  tier: 'silver' as const,
};

const TIERS = [
  { id: 'bronze', nameRu: 'Бронза', nameEn: 'Bronze', minPoints: 0, color: '#CD7F32', rewardRu: '500 серебра', rewardEn: '500 silver' },
  { id: 'silver', nameRu: 'Серебро', nameEn: 'Silver', minPoints: 1000, color: '#C0C0C0', rewardRu: '2000 серебра + 10 золота', rewardEn: '2000 silver + 10 gold' },
  { id: 'gold', nameRu: 'Золото', nameEn: 'Gold', minPoints: 5000, color: '#FFD700', rewardRu: '5000 серебра + 50 золота', rewardEn: '5000 silver + 50 gold' },
  { id: 'diamond', nameRu: 'Алмаз', nameEn: 'Diamond', minPoints: 15000, color: '#B9F2FF', rewardRu: '15000 серебра + 200 золота + 25 stars', rewardEn: '15000 silver + 200 gold + 25 stars' },
  { id: 'legend', nameRu: 'Легенда', nameEn: 'Legend', minPoints: 50000, color: '#FF6B6B', rewardRu: '50000 серебра + 500 золота + 100 stars + титул', rewardEn: '50000 silver + 500 gold + 100 stars + title' },
];

const MOCK_LEADERBOARD = [
  { rank: 1, username: 'tsar_ivan', points: 48500, tier: 'diamond' },
  { rank: 2, username: 'boyarin_petr', points: 35200, tier: 'diamond' },
  { rank: 3, username: 'knyaz_oleg', points: 28900, tier: 'diamond' },
  { rank: 4, username: 'voevoda_dmitriy', points: 18700, tier: 'diamond' },
  { rank: 5, username: 'kupets_nikolay', points: 12400, tier: 'gold' },
  { rank: 6, username: 'oprichnik_boris', points: 9800, tier: 'gold' },
  { rank: 7, username: 'druzhina_vasya', points: 7500, tier: 'gold' },
  { rank: 8, username: 'starets_aleksiy', points: 5200, tier: 'gold' },
  { rank: 9, username: 'smerd_fedka', points: 3100, tier: 'silver' },
  { rank: 10, username: 'krestyanin_ivan', points: 1800, tier: 'silver' },
];

const MOCK_HISTORY = [
  { season: 2, nameRu: 'Сезон II — Железный Путь', nameEn: 'Season II — Iron Path', rank: 67, points: 1800, tier: 'silver' },
  { season: 1, nameRu: 'Сезон I — Основание', nameEn: 'Season I — Foundation', rank: 134, points: 650, tier: 'bronze' },
];

const POINT_SOURCES: { icon: string; textRu: string; textEn: string }[] = [
  { icon: 'silver', textRu: 'Сбор дохода: 1 очко за каждые 100 серебра', textEn: 'Income collection: 1 point per 100 silver' },
  { icon: 'build', textRu: 'Улучшение здания: 5-50 очков (зависит от уровня)', textEn: 'Building upgrade: 5-50 points (depends on level)' },
  { icon: 'raids', textRu: 'Победа в PvP: 10-30 очков', textEn: 'PvP victory: 10-30 points' },
  { icon: 'caves', textRu: 'Пещера: 5 очков за уровень', textEn: 'Cave: 5 points per level' },
  { icon: 'serfs', textRu: 'Захват холопа: 20 очков', textEn: 'Serf capture: 20 points' },
  { icon: 'achievements', textRu: 'Достижения: 10-100 очков', textEn: 'Achievements: 10-100 points' },
];

export function SeasonsScreen({ header }: { header?: ReactNode } = {}) {
  const language = useGameStore((s) => s.user.language);
  const [activeTab, setActiveTab] = useState<SeasonTab>('overview');

  const currentTierIdx = TIERS.findIndex(t => t.id === MOCK_SEASON.tier);
  const nextTier = TIERS[currentTierIdx + 1];

  const tabs: { id: SeasonTab; icon: string | null; labelRu: string; labelEn: string }[] = [
    { id: 'overview', icon: null, labelRu: 'Обзор', labelEn: 'Overview' },
    { id: 'leaderboard', icon: 'leaderboard', labelRu: 'Рейтинг', labelEn: 'Ranking' },
    { id: 'rewards', icon: 'daily', labelRu: 'Награды', labelEn: 'Rewards' },
    { id: 'history', icon: null, labelRu: 'История', labelEn: 'History' },
  ];

  return (
    <Screen header={header}>
      {/* Season Header */}
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          <Icon name="leaderboard" size={20} /> {language === 'ru' ? MOCK_SEASON.nameRu : MOCK_SEASON.nameEn}
        </h2>
        <span className={styles.daysLeft}>
          {language === 'ru' ? `${MOCK_SEASON.daysLeft} дней осталось` : `${MOCK_SEASON.daysLeft} days left`}
        </span>
        <ProgressBar
          value={MOCK_SEASON.totalDays - MOCK_SEASON.daysLeft}
          max={MOCK_SEASON.totalDays}
          variant="gold"
          height={6}
        />
      </div>

      {/* Tabs */}
      <div className={styles.tabBar}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.icon && <Icon name={tab.icon} size={16} />}
            <span className={styles.tabLabel}>{language === 'ru' ? tab.labelRu : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && (
        <div className={styles.section}>
          <div className={styles.pointsCard}>
            <span className={styles.pointsValue}>{MOCK_SEASON.playerPoints.toLocaleString()}</span>
            <span className={styles.pointsLabel}>{language === 'ru' ? 'очков' : 'points'}</span>
          </div>

          <div className={styles.tierInfo}>
            <span className={styles.tierBadge} style={{ color: TIERS[currentTierIdx].color }}>
              {language === 'ru' ? TIERS[currentTierIdx].nameRu : TIERS[currentTierIdx].nameEn}
            </span>
            <span className={styles.rankBadge}>
              #{MOCK_SEASON.playerRank}
            </span>
          </div>

          {nextTier && (
            <div style={{ marginTop: 'var(--space-3)' }}>
              <ProgressBar
                value={MOCK_SEASON.playerPoints}
                max={nextTier.minPoints}
                variant="gold"
                showLabel
                label={`${language === 'ru' ? 'До' : 'To'} ${language === 'ru' ? nextTier.nameRu : nextTier.nameEn}`}
              />
            </div>
          )}

          <div className={styles.sourcesSection}>
            <h4 className={styles.sourcesTitle}>
              {language === 'ru' ? 'Как получать очки:' : 'How to earn points:'}
            </h4>
            {POINT_SOURCES.map((src, i) => (
              <p key={i} className={styles.sourceItem}>
                <Icon name={src.icon} size={14} /> {language === 'ru' ? src.textRu : src.textEn}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Leaderboard */}
      {activeTab === 'leaderboard' && (
        <div className={styles.section}>
          <div className={styles.leaderList}>
            {MOCK_LEADERBOARD.map((player) => {
              const tierDef = TIERS.find(t => t.id === player.tier);
              return (
                <div key={player.rank} className={styles.leaderRow}>
                  <span className={styles.leaderRank}>
                    #{player.rank}
                  </span>
                  <div className={styles.leaderInfo}>
                    <span className={styles.leaderName}>@{player.username}</span>
                    <span className={styles.leaderTier} style={{ color: tierDef?.color }}>{language === 'ru' ? tierDef?.nameRu : tierDef?.nameEn}</span>
                  </div>
                  <span className={styles.leaderPoints}>{player.points.toLocaleString()}</span>
                </div>
              );
            })}
          </div>
          <div className={styles.userRank}>
            {language === 'ru' ? `Ваш рейтинг: #${MOCK_SEASON.playerRank}` : `Your rank: #${MOCK_SEASON.playerRank}`}
          </div>
        </div>
      )}

      {/* Rewards */}
      {activeTab === 'rewards' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Награды по тирам' : 'Tier Rewards'}</h3>
          <div className={styles.tierList}>
            {TIERS.map((tier) => {
              const isAchieved = MOCK_SEASON.playerPoints >= tier.minPoints;
              return (
                <div key={tier.id} className={`${styles.tierRow} ${isAchieved ? styles.tierAchieved : ''}`}>
                  <span className={styles.tierEmoji} style={{ color: tier.color, fontWeight: 700 }}>
                    {language === 'ru' ? tier.nameRu.charAt(0) : tier.nameEn.charAt(0)}
                  </span>
                  <div className={styles.tierDetails}>
                    <span className={styles.tierName}>
                      {language === 'ru' ? tier.nameRu : tier.nameEn}
                    </span>
                    <span className={styles.tierThreshold}>
                      {tier.minPoints.toLocaleString()} {language === 'ru' ? 'очков' : 'points'}
                    </span>
                    <span className={styles.tierReward}>
                      {language === 'ru' ? tier.rewardRu : tier.rewardEn}
                    </span>
                  </div>
                  {isAchieved && <span className={styles.tierCheck} style={{ color: '#4CAF50' }}>●</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* History */}
      {activeTab === 'history' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Прошлые сезоны' : 'Past Seasons'}</h3>
          {MOCK_HISTORY.length === 0 ? (
            <p className={styles.emptyText}>{language === 'ru' ? 'Это ваш первый сезон!' : 'This is your first season!'}</p>
          ) : (
            <div className={styles.historyList}>
              {MOCK_HISTORY.map((h) => {
                const tierDef = TIERS.find(t => t.id === h.tier);
                return (
                  <div key={h.season} className={styles.historyRow}>
                    <div className={styles.historyInfo}>
                      <span className={styles.historyName}>{language === 'ru' ? h.nameRu : h.nameEn}</span>
                      <span className={styles.historyMeta}>
                        #{h.rank} • {h.points.toLocaleString()} {language === 'ru' ? 'очков' : 'pts'} • <span style={{ color: tierDef?.color }}>{language === 'ru' ? tierDef?.nameRu : tierDef?.nameEn}</span>
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </Screen>
  );
}
