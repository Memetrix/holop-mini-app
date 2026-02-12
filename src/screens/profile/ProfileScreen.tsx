import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { getProfessionById } from '@/config/serfs';
import { formatIncome } from '@/hooks/useFormatNumber';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import styles from './ProfileScreen.module.css';

export function ProfileScreen() {
  const user = useGameStore((s) => s.user);
  const serfs = useGameStore((s) => s.serfs);
  const equipment = useGameStore((s) => s.equipment);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const collectSerfGold = useGameStore((s) => s.collectSerfGold);

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);
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
          <Button variant="ghost" size="sm" onClick={collectSerfGold}>Собрать золото</Button>
        </div>
        <div className={styles.serfList}>
          {serfs.map((serf) => {
            const prof = getProfessionById(serf.professionId);
            return (
              <div key={serf.id} className={styles.serfCard}>
                {prof && <img src={getAssetUrl(prof.assetKey)} alt="" className={styles.serfImg} />}
                <div className={styles.serfInfo}>
                  <span className={styles.serfName}>{serf.name}</span>
                  <span className={styles.serfProf}>{prof?.nameRu ?? serf.professionId}</span>
                </div>
                <CurrencyBadge type="gold" amount={serf.goldPer30m} size="sm" />
              </div>
            );
          })}
        </div>
      </div>
    </Screen>
  );
}
