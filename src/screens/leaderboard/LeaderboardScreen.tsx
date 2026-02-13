/**
 * HOLOP Leaderboard Screen — 7 ranking tabs with mock data
 * Matches bot structure: top_income, top_serfs, top_battles, top_clans, top_diggers, top_reputation, season_leaderboard
 * See PROJECT_MAP.md §12 "Рейтинги"
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './LeaderboardScreen.module.css';

type LeaderboardTab = 'income' | 'serfs' | 'battles' | 'clans' | 'diggers' | 'reputation' | 'season';

const TABS: { id: LeaderboardTab; labelRu: string; labelEn: string; emoji: string }[] = [
  { id: 'income', emoji: '💰', labelRu: 'Доход', labelEn: 'Income' },
  { id: 'serfs', emoji: '⛓️', labelRu: 'Холопы', labelEn: 'Serfs' },
  { id: 'battles', emoji: '⚔️', labelRu: 'Бои', labelEn: 'Battles' },
  { id: 'clans', emoji: '👑', labelRu: 'Княжества', labelEn: 'Kingdoms' },
  { id: 'diggers', emoji: '⛏️', labelRu: 'Рудознатцы', labelEn: 'Miners' },
  { id: 'reputation', emoji: '⭐', labelRu: 'Репутация', labelEn: 'Reputation' },
  { id: 'season', emoji: '🏆', labelRu: 'Сезон', labelEn: 'Season' },
];

// Mock leaderboard data
const MOCK_PLAYERS = [
  { rank: 1, username: 'tsar_ivan', value: 2_500_000, city: 'Москва' },
  { rank: 2, username: 'knyaginya', value: 1_890_000, city: 'Суздаль' },
  { rank: 3, username: 'oprichnik', value: 1_450_000, city: 'Тверь' },
  { rank: 4, username: 'varyag_42', value: 980_000, city: 'Киев' },
  { rank: 5, username: 'boyarskiy', value: 750_000, city: 'Владимир' },
  { rank: 6, username: 'drakon_777', value: 620_000, city: 'Новгород' },
  { rank: 7, username: 'medved_ru', value: 510_000, city: 'Ярославль' },
  { rank: 8, username: 'kazachka', value: 430_000, city: 'Ростов' },
  { rank: 9, username: 'voevoda', value: 350_000, city: 'Псков' },
  { rank: 10, username: 'peresvet', value: 280_000, city: 'Рязань' },
];

function getValueLabel(tab: LeaderboardTab, language: 'ru' | 'en'): string {
  switch (tab) {
    case 'income': return language === 'ru' ? '/ч' : '/h';
    case 'serfs': return '';
    case 'battles': return language === 'ru' ? ' побед' : ' wins';
    case 'clans': return language === 'ru' ? ' мощь' : ' power';
    case 'diggers': return language === 'ru' ? ' руды' : ' ore';
    case 'reputation': return ' ★';
    case 'season': return language === 'ru' ? ' оч.' : ' pts';
  }
}

function getRankMedal(rank: number): string {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return `#${rank}`;
}

export function LeaderboardScreen({ header }: { header?: ReactNode } = {}) {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('income');
  const language = useGameStore((s) => s.user.language);
  const user = useGameStore((s) => s.user);

  const currentTabDef = TABS.find(t => t.id === activeTab)!;

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          {language === 'ru' ? '🏆 Рейтинги' : '🏆 Rankings'}
        </h2>
      </div>

      {/* Tab bar */}
      <div className={styles.tabBar}>
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span>{tab.emoji}</span>
            <span className={styles.tabLabel}>{language === 'ru' ? tab.labelRu : tab.labelEn}</span>
          </button>
        ))}
      </div>

      {/* Leaderboard List */}
      <div className={styles.listCard}>
        <h3 className={styles.listTitle}>
          {currentTabDef.emoji} {language === 'ru' ? currentTabDef.labelRu : currentTabDef.labelEn}
        </h3>

        <div className={styles.list}>
          {MOCK_PLAYERS.map((player) => {
            const isMe = player.username === user.username;
            return (
              <div key={player.rank} className={`${styles.row} ${isMe ? styles.rowMe : ''}`}>
                <span className={styles.rank}>{getRankMedal(player.rank)}</span>
                <div className={styles.playerInfo}>
                  <span className={styles.playerName}>@{player.username}</span>
                  <span className={styles.playerCity}>{player.city}</span>
                </div>
                <span className={styles.value}>
                  {formatNumber(player.value)}{getValueLabel(activeTab, language)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Your rank */}
        <div className={styles.myRank}>
          <span className={styles.rank}>#42</span>
          <div className={styles.playerInfo}>
            <span className={styles.playerName}>@{user.username}</span>
            <span className={styles.playerCity}>{user.cityName}</span>
          </div>
          <span className={styles.value}>
            {formatNumber(user.hourlyIncome)}{getValueLabel(activeTab, language)}
          </span>
        </div>
      </div>
    </Screen>
  );
}
