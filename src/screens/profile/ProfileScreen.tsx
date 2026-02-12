import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { getProfessionById, getRarityColor, SERF_PROTECTION, calculateRansomPrice } from '@/config/serfs';
import { formatIncome, formatNumber } from '@/hooks/useFormatNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/hooks/useHaptics';
import { DailyBonus } from './DailyBonus';
import styles from './ProfileScreen.module.css';

function isProtectionActive(until: string | null): boolean {
  if (!until) return false;
  return new Date(until).getTime() > Date.now();
}

function formatProtectionRemaining(until: string): string {
  const diff = new Date(until).getTime() - Date.now();
  if (diff <= 0) return 'Истекла';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 24) return `${Math.floor(hours / 24)}д ${hours % 24}ч`;
  if (hours > 0) return `${hours}ч ${mins}м`;
  return `${mins}м`;
}

export function ProfileScreen() {
  const user = useGameStore((s) => s.user);
  const serfs = useGameStore((s) => s.serfs);
  const equipment = useGameStore((s) => s.equipment);
  const clan = useGameStore((s) => s.clan);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const collectSerfGold = useGameStore((s) => s.collectSerfGold);
  const protectSerf = useGameStore((s) => s.protectSerf);
  const ransomSerf = useGameStore((s) => s.ransomSerf);
  const haptics = useHaptics();

  const [expandedSerfId, setExpandedSerfId] = useState<number | null>(null);

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);

  const handleCollectGold = () => {
    const gold = collectSerfGold();
    if (gold > 0) haptics.success();
    else haptics.light();
  };

  const handleProtect = (serfId: number, protectionId: string) => {
    const ok = protectSerf(serfId, protectionId);
    if (ok) haptics.success();
    else haptics.error();
  };

  const handleRansom = (serfId: number) => {
    const ok = ransomSerf(serfId);
    if (ok) {
      haptics.success();
      setExpandedSerfId(null);
    } else {
      haptics.error();
    }
  };

  return (
    <Screen>
      {/* Player Card */}
      <div className={styles.profileCard}>
        <img src={getAssetUrl(title.assetKey)} alt={title.nameRu} className={styles.avatar} />
        <h2 className={styles.name}>@{user.username}</h2>
        <span className={styles.title}>{title.nameRu} {'\u2022'} {user.cityName}</span>

        <div className={styles.statsGrid}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Атака</span>
            <span className={styles.statValue}>ATK {user.attack}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Защита</span>
            <span className={styles.statValue}>DEF {user.defense}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Здоровье</span>
            <span className={styles.statValue}>HP {user.health}/{user.maxHealth}</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>Доход</span>
            <span className={styles.statValue}>{formatIncome(totalIncome)}</span>
          </div>
        </div>

        {nextTitle && (
          <div style={{ marginTop: 'var(--space-4)', width: '100%' }}>
            <ProgressBar value={totalIncome} max={nextTitle.incomeThreshold} variant="gold" showLabel label={`До ${nextTitle.nameRu}`} />
          </div>
        )}
      </div>

      {/* Daily Bonus */}
      <DailyBonus />

      {/* HP Bar */}
      <div className={styles.section}>
        <ProgressBar value={user.health} max={user.maxHealth} variant="health" showLabel label="Здоровье" height={10} />
      </div>

      {/* Equipment */}
      <div className={styles.section}>
        <h3>Снаряжение</h3>
        <div className={styles.equipGrid}>
          {equipment.weapon && (
            <div className={styles.equipItem}>
              <img src={getAssetUrl(`weapons/${equipment.weapon.id}`)} alt="" className={styles.equipImg} />
              <span>{equipment.weapon.nameRu}</span>
              <span className={styles.equipStat}>+{equipment.weapon.atkBonus} ATK</span>
            </div>
          )}
          {equipment.armor && (
            <div className={styles.equipItem}>
              <img src={getAssetUrl(`armor/${equipment.armor.id}`)} alt="" className={styles.equipImg} />
              <span>{equipment.armor.nameRu}</span>
              <span className={styles.equipStat}>+{equipment.armor.defBonus} DEF</span>
            </div>
          )}
        </div>
      </div>

      {/* Serfs */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>
          <h3>Холопы ({serfs.length}/{user.serfSlots})</h3>
          <Button variant="ghost" size="sm" onClick={handleCollectGold}>Собрать золото</Button>
        </div>

        {serfs.length === 0 && (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 'var(--space-4) 0' }}>
            Захватывай холопов в набегах!
          </p>
        )}

        <div className={styles.serfList}>
          {serfs.map((serf) => {
            const prof = getProfessionById(serf.professionId);
            const rarityColor = prof ? getRarityColor(prof.rarity) : '#A0A0A0';
            const hasProtection = isProtectionActive(serf.protectionUntil);
            const protDef = hasProtection
              ? SERF_PROTECTION.find(p => p.id === serf.protectionType)
              : null;
            const isExpanded = expandedSerfId === serf.id;

            const hoursOwned = (Date.now() - new Date(serf.capturedAt).getTime()) / (1000 * 60 * 60);
            const ransomPrice = calculateRansomPrice(serf.dailyIncome, hoursOwned);

            return (
              <div key={serf.id}>
                <div
                  className={`${styles.serfCard} ${hasProtection ? styles.serfProtected : ''}`}
                  onClick={() => setExpandedSerfId(isExpanded ? null : serf.id)}
                >
                  {prof && <img src={getAssetUrl(prof.assetKey)} alt="" className={styles.serfImg} />}
                  <div className={styles.serfInfo}>
                    <span className={styles.serfName}>{serf.name}</span>
                    <span className={styles.serfProf} style={{ color: rarityColor }}>
                      {prof?.nameRu ?? serf.professionId}
                    </span>
                    {hasProtection && protDef && (
                      <span className={styles.serfProtectionBadge}>
                        {protDef.nameRu} ({formatProtectionRemaining(serf.protectionUntil!)})
                      </span>
                    )}
                  </div>
                  <CurrencyBadge type="gold" amount={serf.goldPer30m} size="sm" />
                </div>

                {/* Expanded Serf Actions */}
                {isExpanded && (
                  <div className={styles.serfActions}>
                    {/* Protection Options */}
                    {!hasProtection && (
                      <div className={styles.serfActionGroup}>
                        <span className={styles.serfActionLabel}>Защита:</span>
                        <div className={styles.protectionList}>
                          {SERF_PROTECTION.map((prot) => (
                            <button
                              key={prot.id}
                              className={styles.protectionBtn}
                              onClick={(e) => { e.stopPropagation(); handleProtect(serf.id, prot.id); }}
                              disabled={user.gold < prot.costGold}
                            >
                              <span className={styles.protName}>{prot.nameRu}</span>
                              <span className={styles.protEffect}>{prot.effect}</span>
                              <span className={styles.protCost}>{prot.costGold} зол.</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ransom */}
                    <div className={styles.serfActionGroup}>
                      <Button
                        variant="ghost"
                        size="sm"
                        fullWidth
                        onClick={(e: React.MouseEvent) => { e.stopPropagation(); handleRansom(serf.id); }}
                        disabled={user.silver < ransomPrice}
                      >
                        Выкупить ({formatNumber(ransomPrice)} серебра)
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Clan */}
      <div className={styles.section}>
        <h3>Княжество</h3>
        {clan ? (
          <div className={styles.clanInfo}>
            <span className={styles.clanName}>{clan.name}</span>
            <span className={styles.clanRole}>{clan.role}</span>
            <div className={styles.clanStats}>
              <span>Участников: {clan.memberCount}/{clan.maxMembers}</span>
              <span>Мощь: {clan.totalPower}</span>
              <span>Бонус: +{Math.round(clan.incomeBonus * 100)}%</span>
            </div>
          </div>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: 'var(--space-4) 0' }}>
            Вступи в княжество или создай своё!
          </p>
        )}
      </div>
    </Screen>
  );
}
