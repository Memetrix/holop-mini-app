/**
 * HOLOP Help Screen — Game guide and info
 * Matches bot: help_command / help_menu
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { Icon } from '@/components/ui/Icon';
import styles from './HelpScreen.module.css';

type HelpSection = {
  id: string;
  icon: string;
  titleRu: string;
  titleEn: string;
  contentRu: string[];
  contentEn: string[];
};

const HELP_SECTIONS: HelpSection[] = [
  {
    id: 'basics',
    icon: 'territory',
    titleRu: 'Основы',
    titleEn: 'Basics',
    contentRu: [
      'Стройте и улучшайте здания, чтобы увеличить доход',
      'Собирайте серебро каждые несколько часов (макс. 24ч)',
      'Здоровье влияет на доход — следите за HP',
      'Повышайте титул, увеличивая общий доход',
    ],
    contentEn: [
      'Build and upgrade buildings to increase income',
      'Collect silver every few hours (max 24h cap)',
      'Health affects income — watch your HP',
      'Raise your title by increasing total income',
    ],
  },
  {
    id: 'buildings',
    icon: 'build',
    titleRu: 'Здания',
    titleEn: 'Buildings',
    contentRu: [
      '12 основных зданий (серебро, уровни 1-15)',
      'Уровни 11-15 стоят золото вместо серебра',
      'У каждого здания свой кулдаун улучшения',
      'Некоторые здания требуют предварительных строек',
      '4 премиум здания (звёзды), 3 золотых, 2 социальных',
    ],
    contentEn: [
      '12 main buildings (silver, levels 1-15)',
      'Levels 11-15 cost gold instead of silver',
      'Each building has its own upgrade cooldown',
      'Some buildings require prerequisites',
      '4 premium buildings (stars), 3 gold, 2 social',
    ],
  },
  {
    id: 'serfs',
    icon: 'serfs',
    titleRu: 'Холопы',
    titleEn: 'Serfs',
    contentRu: [
      'Захватывайте других игроков — они приносят золото',
      'У каждого холопа есть профессия и SPR',
      'Защищайте своих холопов стражей',
      'Используйте зелье жаб, чтобы снять охрану',
      'Выкупиться можно, если вас захватили',
    ],
    contentEn: [
      'Capture other players — they generate gold',
      'Each serf has a profession and SPR',
      'Protect your serfs with guards',
      'Use frog potion to remove guards',
      'You can ransom yourself if captured',
    ],
  },
  {
    id: 'pvp',
    icon: 'raids',
    titleRu: 'Набеги и PvP',
    titleEn: 'Raids & PvP',
    contentRu: [
      'PvP открывается с титула Купец (ур. 6)',
      'Набеги — грабьте серебро других игроков',
      'Укрепления и защитные предметы помогают в обороне',
      'Бочка пороха — уничтожить город врага',
      'Железный купол — защита от бочки',
    ],
    contentEn: [
      'PvP unlocks at Merchant title (level 6)',
      'Raids — steal silver from other players',
      'Fortifications and defense items help in defense',
      'Powder barrel — destroy enemy city',
      'Iron dome — protection from barrel',
    ],
  },
  {
    id: 'caves',
    icon: 'caves',
    titleRu: 'Пещеры',
    titleEn: 'Caves',
    contentRu: [
      'Тёмная пещера — серебро и опыт',
      'Пещера славы — репутация',
      'Чем глубже — тем сложнее монстры и лучше награды',
      'Используйте бустеры перед входом',
      'Можно воскреснуть за звёзды при смерти',
    ],
    contentEn: [
      'Dark cave — silver and experience',
      'Glory cave — reputation',
      'Deeper = harder monsters + better rewards',
      'Use boosters before entering',
      'Can resurrect for stars on death',
    ],
  },
  {
    id: 'clan',
    icon: 'clan',
    titleRu: 'Княжества',
    titleEn: 'Kingdoms',
    contentRu: [
      'Создайте или вступите в княжество (клан)',
      'Захватывайте территории для бонусов',
      'Объявляйте войны другим княжествам',
      'Казна пополняется налогами участников',
      'Магазин княжества — иконки, бустеры, здания',
    ],
    contentEn: [
      'Create or join a kingdom (clan)',
      'Capture territories for bonuses',
      'Declare wars on other kingdoms',
      'Treasury funded by member taxes',
      'Kingdom shop — icons, boosters, buildings',
    ],
  },
  {
    id: 'currencies',
    icon: 'gold',
    titleRu: 'Валюты',
    titleEn: 'Currencies',
    contentRu: [
      'Серебро — основная валюта (доход, стройки)',
      'Золото — от холопов, достижений, пещер',
      'Звёзды — премиум валюта (покупка в Telegram)',
      'Реферальные звёзды — от приглашённых друзей',
      'Репутация — от пещеры славы и достижений',
    ],
    contentEn: [
      'Silver — main currency (income, buildings)',
      'Gold — from serfs, achievements, caves',
      'Stars — premium currency (buy in Telegram)',
      'Referral stars — from invited friends',
      'Reputation — from glory cave and achievements',
    ],
  },
];

export function HelpScreen({ header }: { header?: ReactNode } = {}) {
  const language = useGameStore((s) => s.user.language);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  return (
    <Screen header={header}>
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          <Icon name="help" size={18} />{' '}
          {language === 'ru' ? 'Помощь' : 'Help'}
        </h2>
        <p className={styles.headerDesc}>
          {language === 'ru' ? 'Справочник по игре ХОЛОП' : 'HOLOP game guide'}
        </p>
      </div>

      <div className={styles.sectionList}>
        {HELP_SECTIONS.map((section) => (
          <div key={section.id} className={styles.section}>
            <button
              className={styles.sectionToggle}
              onClick={() => setExpandedSection(expandedSection === section.id ? null : section.id)}
            >
              <Icon name={section.icon} size={18} />
              <span className={styles.sectionTitle}>
                {language === 'ru' ? section.titleRu : section.titleEn}
              </span>
              <span className={styles.sectionArrow}>
                {expandedSection === section.id ? '▲' : '▼'}
              </span>
            </button>
            {expandedSection === section.id && (
              <div className={styles.sectionContent}>
                {(language === 'ru' ? section.contentRu : section.contentEn).map((item, i) => (
                  <p key={i} className={styles.helpItem}>• {item}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bot & Channel */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          {language === 'ru' ? 'Бот' : 'Bot'}: @holop_game_bot
        </p>
        <p className={styles.footerText}>
          {language === 'ru' ? 'Канал' : 'Channel'}: @holop_game
        </p>
        <p className={styles.footerText}>v1.0.0-beta</p>
      </div>
    </Screen>
  );
}
