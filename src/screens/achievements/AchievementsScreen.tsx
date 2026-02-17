/**
 * HOLOP Achievements Screen — 6 categories with mock achievements
 * Matches bot structure: ach_cat:xxx, ach_claim:xxx
 * See PROJECT_MAP.md §15 "Достижения"
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Icon } from '@/components/ui/Icon';
import styles from './AchievementsScreen.module.css';

interface Achievement {
  id: string;
  nameRu: string;
  nameEn: string;
  descRu: string;
  descEn: string;
  target: number;
  current: number;
  rewardSilver: number;
  rewardGold: number;
  claimed: boolean;
}

interface AchCategory {
  id: string;
  nameRu: string;
  nameEn: string;
  icon: string;
  achievements: Achievement[];
}

const MOCK_CATEGORIES: AchCategory[] = [
  {
    id: 'warrior', nameRu: 'Воитель', nameEn: 'Warrior', icon: 'raids',
    achievements: [
      { id: 'w1', nameRu: 'Первая кровь', nameEn: 'First Blood', descRu: 'Выиграй 1 бой', descEn: 'Win 1 battle', target: 1, current: 1, rewardSilver: 100, rewardGold: 0, claimed: true },
      { id: 'w2', nameRu: 'Воин', nameEn: 'Fighter', descRu: 'Выиграй 10 боёв', descEn: 'Win 10 battles', target: 10, current: 7, rewardSilver: 500, rewardGold: 5, claimed: false },
      { id: 'w3', nameRu: 'Полководец', nameEn: 'Commander', descRu: 'Выиграй 100 боёв', descEn: 'Win 100 battles', target: 100, current: 7, rewardSilver: 5000, rewardGold: 50, claimed: false },
    ],
  },
  {
    id: 'trader', nameRu: 'Торговец', nameEn: 'Trader', icon: 'silver',
    achievements: [
      { id: 't1', nameRu: 'Первый доход', nameEn: 'First Income', descRu: 'Собери 1,000 серебра', descEn: 'Collect 1,000 silver', target: 1000, current: 1000, rewardSilver: 200, rewardGold: 0, claimed: true },
      { id: 't2', nameRu: 'Купец', nameEn: 'Merchant', descRu: 'Собери 100,000 серебра', descEn: 'Collect 100,000 silver', target: 100000, current: 85000, rewardSilver: 2000, rewardGold: 20, claimed: false },
      { id: 't3', nameRu: 'Магнат', nameEn: 'Tycoon', descRu: 'Собери 1,000,000 серебра', descEn: 'Collect 1M silver', target: 1000000, current: 85000, rewardSilver: 20000, rewardGold: 200, claimed: false },
    ],
  },
  {
    id: 'goldowner', nameRu: 'Златовладец', nameEn: 'Gold Owner', icon: 'gold',
    achievements: [
      { id: 'g1', nameRu: 'Золотая монета', nameEn: 'Gold Coin', descRu: 'Накопи 10 золота', descEn: 'Save 10 gold', target: 10, current: 10, rewardSilver: 500, rewardGold: 0, claimed: true },
      { id: 'g2', nameRu: 'Сундук', nameEn: 'Chest', descRu: 'Накопи 100 золота', descEn: 'Save 100 gold', target: 100, current: 45, rewardSilver: 2500, rewardGold: 10, claimed: false },
    ],
  },
  {
    id: 'famous', nameRu: 'Прославленный', nameEn: 'Famous', icon: 'reputation',
    achievements: [
      { id: 'f1', nameRu: 'Известный', nameEn: 'Known', descRu: 'Набери 100 репутации', descEn: 'Gain 100 reputation', target: 100, current: 50, rewardSilver: 500, rewardGold: 5, claimed: false },
    ],
  },
  {
    id: 'serfmaster', nameRu: 'Владыка', nameEn: 'Serfmaster', icon: 'serfs',
    achievements: [
      { id: 's1', nameRu: 'Первый холоп', nameEn: 'First Serf', descRu: 'Захвати 1 холопа', descEn: 'Capture 1 serf', target: 1, current: 1, rewardSilver: 300, rewardGold: 0, claimed: true },
      { id: 's2', nameRu: 'Землевладелец', nameEn: 'Landlord', descRu: 'Захвати 5 холопов', descEn: 'Capture 5 serfs', target: 5, current: 3, rewardSilver: 1500, rewardGold: 15, claimed: false },
    ],
  },
  {
    id: 'veteran', nameRu: 'Старожил', nameEn: 'Veteran', icon: 'daily',
    achievements: [
      { id: 'v1', nameRu: 'Новичок', nameEn: 'Newcomer', descRu: 'Играй 1 день', descEn: 'Play for 1 day', target: 1, current: 1, rewardSilver: 100, rewardGold: 0, claimed: true },
      { id: 'v2', nameRu: 'Старожил', nameEn: 'Veteran', descRu: 'Играй 7 дней', descEn: 'Play for 7 days', target: 7, current: 3, rewardSilver: 700, rewardGold: 7, claimed: false },
    ],
  },
];

export function AchievementsScreen({ header }: { header?: ReactNode } = {}) {
  const language = useGameStore((s) => s.user.language);
  const addToast = useGameStore((s) => s.addToast);
  const haptics = useHaptics();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const handleClaim = (ach: Achievement) => {
    if (ach.claimed || ach.current < ach.target) return;
    haptics.success();
    addToast({
      type: 'reward',
      message: language === 'ru'
        ? `Награда: ${formatNumber(ach.rewardSilver)} серебра${ach.rewardGold > 0 ? ` + ${ach.rewardGold} золота` : ''}`
        : `Reward: ${formatNumber(ach.rewardSilver)} silver${ach.rewardGold > 0 ? ` + ${ach.rewardGold} gold` : ''}`,
    });
  };

  const activeCat = MOCK_CATEGORIES.find(c => c.id === activeCategory);

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          <Icon name="achievements" size={20} /> {language === 'ru' ? 'Достижения' : 'Achievements'}
        </h2>
      </div>

      {/* Category Grid or Achievement List */}
      {!activeCat ? (
        <div className={styles.categoryGrid}>
          {MOCK_CATEGORIES.map((cat) => {
            const total = cat.achievements.length;
            const claimed = cat.achievements.filter(a => a.claimed).length;
            const claimable = cat.achievements.filter(a => !a.claimed && a.current >= a.target).length;
            return (
              <button
                key={cat.id}
                className={styles.categoryCard}
                onClick={() => setActiveCategory(cat.id)}
              >
                <span className={styles.catEmoji}><Icon name={cat.icon} size={24} /></span>
                <span className={styles.catName}>{language === 'ru' ? cat.nameRu : cat.nameEn}</span>
                <span className={styles.catProgress}>{claimed}/{total}</span>
                {claimable > 0 && <span className={styles.catBadge}>{claimable}</span>}
              </button>
            );
          })}
        </div>
      ) : (
        <>
          <button className={styles.backBtn} onClick={() => setActiveCategory(null)}>
            ← {language === 'ru' ? 'Назад' : 'Back'}
          </button>

          <div className={styles.achList}>
            <h3 className={styles.achTitle}>
              <Icon name={activeCat.icon} size={18} /> {language === 'ru' ? activeCat.nameRu : activeCat.nameEn}
            </h3>

            {activeCat.achievements.map((ach) => {
              const progress = Math.min(100, (ach.current / ach.target) * 100);
              const canClaim = !ach.claimed && ach.current >= ach.target;

              return (
                <div key={ach.id} className={`${styles.achCard} ${ach.claimed ? styles.achClaimed : ''}`}>
                  <div className={styles.achInfo}>
                    <span className={styles.achName}>
                      {language === 'ru' ? ach.nameRu : ach.nameEn}
                      {ach.claimed && ' (done)'}
                    </span>
                    <span className={styles.achDesc}>{language === 'ru' ? ach.descRu : ach.descEn}</span>
                    <div className={styles.achProgressBar}>
                      <div className={styles.achProgressFill} style={{ width: `${progress}%` }} />
                    </div>
                    <span className={styles.achProgressText}>
                      {formatNumber(ach.current)} / {formatNumber(ach.target)}
                    </span>
                  </div>
                  <div className={styles.achReward}>
                    <span className={styles.achRewardText}>
                      {formatNumber(ach.rewardSilver)} <Icon name="silver" size={14} />
                      {ach.rewardGold > 0 && <>{' '}{ach.rewardGold} <Icon name="gold" size={14} /></>}
                    </span>
                    {canClaim && (
                      <button className={styles.claimBtn} onClick={() => handleClaim(ach)}>
                        {language === 'ru' ? 'Забрать' : 'Claim'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Screen>
  );
}
