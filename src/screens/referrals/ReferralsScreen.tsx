/**
 * HOLOP Referrals Screen — Referral link, stats, friend rewards
 * Matches bot structure: referral()
 * See PROJECT_MAP.md §18 "Рефералы"
 */

import type { ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import styles from './ReferralsScreen.module.css';

// Mock referral data
const MOCK_REFERRALS = [
  { username: 'druzhok_1', joinedAt: '2026-01-15', earned: 50 },
  { username: 'novichok_42', joinedAt: '2026-02-01', earned: 30 },
  { username: 'boyarin_x', joinedAt: '2026-02-10', earned: 10 },
];

const REFERRAL_LEVELS = [
  { friends: 1, reward: 10, bonusRu: '+5 доход', bonusEn: '+5 income' },
  { friends: 3, reward: 30, bonusRu: '+10 доход', bonusEn: '+10 income' },
  { friends: 5, reward: 50, bonusRu: '+15 доход', bonusEn: '+15 income' },
  { friends: 10, reward: 100, bonusRu: '+25 доход', bonusEn: '+25 income' },
  { friends: 25, reward: 250, bonusRu: '+50 доход', bonusEn: '+50 income' },
  { friends: 50, reward: 500, bonusRu: 'Дом друзей Lv.MAX', bonusEn: 'Friends House Lv.MAX' },
];

export function ReferralsScreen({ header }: { header?: ReactNode } = {}) {
  const user = useGameStore((s) => s.user);
  const language = useGameStore((s) => s.user.language);
  const addToast = useGameStore((s) => s.addToast);
  const haptics = useHaptics();

  const refLink = `https://t.me/holop_game_bot?start=ref${user.id}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(refLink).then(() => {
      haptics.success();
      addToast({
        type: 'success',
        message: language === 'ru' ? 'Ссылка скопирована!' : 'Link copied!',
      });
    }).catch(() => {
      haptics.error();
    });
  };

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          {language === 'ru' ? '👥 Рефералы' : '👥 Referrals'}
        </h2>
        <p className={styles.subtitle}>
          {language === 'ru'
            ? 'Приглашай друзей и получай бонусы!'
            : 'Invite friends and earn bonuses!'}
        </p>
      </div>

      {/* Referral Link */}
      <div className={styles.linkCard}>
        <span className={styles.linkLabel}>
          {language === 'ru' ? 'Твоя реферальная ссылка' : 'Your referral link'}
        </span>
        <div className={styles.linkRow}>
          <span className={styles.linkText}>{refLink}</span>
          <button className={styles.copyBtn} onClick={handleCopyLink}>
            {language === 'ru' ? '📋 Копировать' : '📋 Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{MOCK_REFERRALS.length}</span>
          <span className={styles.statLabel}>{language === 'ru' ? 'Друзей' : 'Friends'}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatNumber(user.refStars)}</span>
          <span className={styles.statLabel}>{language === 'ru' ? 'Реф. звёзд' : 'Ref. Stars'}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{formatNumber(MOCK_REFERRALS.reduce((s, r) => s + r.earned, 0))}</span>
          <span className={styles.statLabel}>{language === 'ru' ? 'Заработано' : 'Earned'}</span>
        </div>
      </div>

      {/* Reward Levels */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Уровни наград' : 'Reward Levels'}</h3>
        <div className={styles.levelList}>
          {REFERRAL_LEVELS.map((level) => {
            const reached = MOCK_REFERRALS.length >= level.friends;
            return (
              <div key={level.friends} className={`${styles.levelRow} ${reached ? styles.levelReached : ''}`}>
                <span className={styles.levelFriends}>
                  {reached ? '✅' : '⬜'} {level.friends} {language === 'ru' ? 'друзей' : 'friends'}
                </span>
                <span className={styles.levelReward}>+{level.reward} ⭐</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Friend List */}
      <div className={styles.section}>
        <h3>{language === 'ru' ? 'Мои друзья' : 'My Friends'}</h3>
        {MOCK_REFERRALS.length === 0 ? (
          <p className={styles.emptyText}>
            {language === 'ru' ? 'Пока нет рефералов' : 'No referrals yet'}
          </p>
        ) : (
          <div className={styles.friendList}>
            {MOCK_REFERRALS.map((ref) => (
              <div key={ref.username} className={styles.friendRow}>
                <span className={styles.friendName}>@{ref.username}</span>
                <span className={styles.friendEarned}>+{ref.earned} ⭐</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
