/**
 * HOLOP Clan/Kingdom Screen — Full clan management
 * Matches bot structure: clan_menu, create_clan, clan_members, clan_treasury, territories_menu, declare_war_menu
 * See PROJECT_MAP.md §10 "Княжества / Кланы"
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { GAME } from '@/config/constants';
import styles from './ClanScreen.module.css';

type ClanTab = 'overview' | 'members' | 'treasury' | 'territories' | 'war' | 'shop';

const MOCK_MEMBERS = [
  { username: 'tsar_ivan', role: 'leader', power: 125000, online: true },
  { username: 'boyarskiy', role: 'officer', power: 89000, online: true },
  { username: 'knyaginya', role: 'member', power: 67000, online: false },
  { username: 'oprichnik', role: 'member', power: 54000, online: false },
  { username: 'varyag_42', role: 'member', power: 43000, online: true },
];

const MOCK_TERRITORIES = [
  { id: 'rudnik', nameRu: 'Рудник', nameEn: 'Mine', bonusRu: '+10% к добыче', bonusEn: '+10% mining', claimed: true },
  { id: 'solyanye_kopi', nameRu: 'Соляные копи', nameEn: 'Salt Mines', bonusRu: '+5% к доходу', bonusEn: '+5% income', claimed: true },
  { id: 'torgoviy_put', nameRu: 'Торговый путь', nameEn: 'Trade Route', bonusRu: '+8% к торговле', bonusEn: '+8% trade', claimed: false },
  { id: 'svyataya_roshcha', nameRu: 'Святая роща', nameEn: 'Sacred Grove', bonusRu: '+3% к репутации', bonusEn: '+3% reputation', claimed: false },
  { id: 'stolitsa', nameRu: 'Столица', nameEn: 'Capital', bonusRu: '+15% ко всему', bonusEn: '+15% to all', claimed: false },
];

const ROLE_NAMES: Record<string, { ru: string; en: string }> = {
  leader: { ru: 'Великий князь', en: 'Grand Prince' },
  officer: { ru: 'Воевода', en: 'Voivode' },
  member: { ru: 'Дружинник', en: 'Warrior' },
};

export function ClanScreen({ header }: { header?: ReactNode } = {}) {
  const clan = useGameStore((s) => s.clan);
  const language = useGameStore((s) => s.user.language);
  const addToast = useGameStore((s) => s.addToast);
  const haptics = useHaptics();
  const [activeTab, setActiveTab] = useState<ClanTab>('overview');

  // No clan — show create/join
  if (!clan) {
    return (
      <Screen header={header}>
        <div className={styles.noClanCard}>
          <span className={styles.noClanIcon}><Icon name="clan" size={48} /></span>
          <h2 className={styles.noClanTitle}>
            {language === 'ru' ? 'Княжества' : 'Kingdoms'}
          </h2>
          <p className={styles.noClanDesc}>
            {language === 'ru'
              ? 'Создай или вступи в княжество. Вместе вы сможете захватывать территории и вести войны!'
              : 'Create or join a kingdom. Together you can capture territories and wage wars!'}
          </p>
          <div className={styles.noClanActions}>
            <Button
              variant="primary"
              fullWidth
              onClick={() => {
                haptics.light();
                addToast({
                  type: 'info',
                  message: language === 'ru'
                    ? `Создание стоит ${formatNumber(GAME.CLAN_CREATE_COST_SILVER)} серебра (титул ${GAME.CLAN_MIN_TITLE}+)`
                    : `Creation costs ${formatNumber(GAME.CLAN_CREATE_COST_SILVER)} silver (title ${GAME.CLAN_MIN_TITLE}+)`,
                });
              }}
            >
              {language === 'ru' ? 'Создать княжество' : 'Create Kingdom'}
            </Button>
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                haptics.light();
                addToast({ type: 'info', message: language === 'ru' ? 'Поиск княжеств скоро' : 'Kingdom search coming soon' });
              }}
            >
              {language === 'ru' ? 'Найти княжество' : 'Find Kingdom'}
            </Button>
          </div>
        </div>
      </Screen>
    );
  }

  // Has clan — show tabs
  const tabs: { id: ClanTab; icon: string | null; labelRu: string; labelEn: string }[] = [
    { id: 'overview', icon: null, labelRu: 'Обзор', labelEn: 'Overview' },
    { id: 'members', icon: 'referrals', labelRu: 'Участники', labelEn: 'Members' },
    { id: 'treasury', icon: 'bank', labelRu: 'Казна', labelEn: 'Treasury' },
    { id: 'territories', icon: null, labelRu: 'Территории', labelEn: 'Territories' },
    { id: 'war', icon: 'raids', labelRu: 'Война', labelEn: 'War' },
    { id: 'shop', icon: 'shop', labelRu: 'Магазин', labelEn: 'Shop' },
  ];

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}><Icon name="clan" size={20} /> {clan.name}</h2>
        <span className={styles.headerRole}>
          {ROLE_NAMES[clan.role]?.[language] ?? clan.role}
        </span>
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

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className={styles.section}>
          <div className={styles.overviewGrid}>
            <div className={styles.overviewStat}>
              <span className={styles.overviewValue}>{clan.memberCount}/{clan.maxMembers}</span>
              <span className={styles.overviewLabel}>{language === 'ru' ? 'Участники' : 'Members'}</span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.overviewValue}>{formatNumber(clan.totalPower)}</span>
              <span className={styles.overviewLabel}>{language === 'ru' ? 'Мощь' : 'Power'}</span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.overviewValue}>+{Math.round(clan.incomeBonus * 100)}%</span>
              <span className={styles.overviewLabel}>{language === 'ru' ? 'Бонус' : 'Bonus'}</span>
            </div>
            <div className={styles.overviewStat}>
              <span className={styles.overviewValue}>{clan.territories.length}/5</span>
              <span className={styles.overviewLabel}>{language === 'ru' ? 'Территории' : 'Territories'}</span>
            </div>
          </div>
          {clan.warActive && (
            <div className={styles.warBanner}>
              <Icon name="raids" size={16} /> {language === 'ru' ? 'Война идёт!' : 'War in progress!'}
            </div>
          )}
        </div>
      )}

      {activeTab === 'members' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Участники' : 'Members'}</h3>
          <div className={styles.memberList}>
            {MOCK_MEMBERS.map((m) => (
              <div key={m.username} className={styles.memberRow}>
                <div className={styles.memberInfo}>
                  <span className={styles.memberName}>
                    {m.online && <><span style={{ color: '#4CAF50' }}>●</span>{' '}</>}@{m.username}
                  </span>
                  <span className={styles.memberRole}>{ROLE_NAMES[m.role]?.[language] ?? m.role}</span>
                </div>
                <span className={styles.memberPower}>{formatNumber(m.power)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'treasury' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Казна княжества' : 'Kingdom Treasury'}</h3>
          <div className={styles.treasuryBalance}>
            <CurrencyBadge type="silver" amount={clan.treasury} size="lg" />
          </div>
          <p className={styles.treasuryHint}>
            {language === 'ru'
              ? 'Казна пополняется из налогов участников'
              : 'Treasury is funded by member taxes'}
          </p>
        </div>
      )}

      {activeTab === 'territories' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Территории' : 'Territories'}</h3>
          <div className={styles.territoryList}>
            {MOCK_TERRITORIES.map((t) => (
              <div key={t.id} className={`${styles.territoryCard} ${t.claimed ? styles.territoryClaimed : ''}`}>
                <div className={styles.territoryInfo}>
                  <span className={styles.territoryName}>
                    <span style={{ color: t.claimed ? '#4CAF50' : '#9e9e9e' }}>●</span>{' '}
                    {language === 'ru' ? t.nameRu : t.nameEn}
                  </span>
                  <span className={styles.territoryBonus}>{language === 'ru' ? t.bonusRu : t.bonusEn}</span>
                </div>
                {!t.claimed && (
                  <button
                    className={styles.claimBtn}
                    onClick={() => {
                      haptics.light();
                      addToast({ type: 'info', message: language === 'ru' ? 'Захват территорий скоро' : 'Territory capture coming soon' });
                    }}
                  >
                    {language === 'ru' ? 'Захватить' : 'Claim'}
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'war' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Войны' : 'Wars'}</h3>
          {clan.warActive ? (
            <div className={styles.warInfo}>
              <p><Icon name="raids" size={16} /> {language === 'ru' ? 'Война с "Орда"' : 'War with "Horde"'}</p>
              <p className={styles.warScore}>{language === 'ru' ? 'Счёт' : 'Score'}: 12 — 8</p>
            </div>
          ) : (
            <p className={styles.emptyText}>
              {language === 'ru' ? 'Нет активных войн' : 'No active wars'}
            </p>
          )}
          <Button
            variant="danger"
            fullWidth
            onClick={() => {
              haptics.light();
              addToast({ type: 'info', message: language === 'ru' ? 'Объявление войны скоро' : 'War declaration coming soon' });
            }}
          >
            {language === 'ru' ? 'Объявить войну' : 'Declare War'}
          </Button>
        </div>
      )}

      {activeTab === 'shop' && (
        <div className={styles.section}>
          <h3>{language === 'ru' ? 'Магазин княжества' : 'Kingdom Shop'}</h3>
          <p className={styles.emptyText}>
            {language === 'ru' ? 'Магазин княжества скоро откроется' : 'Kingdom shop coming soon'}
          </p>
        </div>
      )}
    </Screen>
  );
}
