import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { getBuildingById, getBuildingCost, getUpgradeCurrency } from '@/config/buildings';
import { formatNumber, formatIncome, formatTimeRemaining } from '@/hooks/useFormatNumber';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { BuildingScene } from '@/pixi/BuildingScene';
import { CoinShower } from '@/pixi/CoinShower';
import { BuildScreen } from './BuildScreen';
import styles from './TerritoryScreen.module.css';

export function TerritoryScreen() {
  const user = useGameStore((s) => s.user);
  const buildings = useGameStore((s) => s.buildings);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const collectIncome = useGameStore((s) => s.collectIncome);
  const upgradeBuilding = useGameStore((s) => s.upgradeBuilding);
  const haptics = useHaptics();
  const [showBuildSheet, setShowBuildSheet] = useState(false);
  const [showCoinShower, setShowCoinShower] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);

  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);
  const handleCollect = () => {
    haptics.success();
    // Calculate amount before collecting (store updates silver)
    const now = Date.now();
    const lastCollect = new Date(user.lastIncomeCollect).getTime();
    const hoursPassed = (now - lastCollect) / (1000 * 60 * 60);
    const earned = Math.floor(totalIncome * hoursPassed);
    if (earned > 0) {
      setCollectedAmount(earned);
      setShowCoinShower(true);
    }
    collectIncome();
  };

  return (
    <Screen>
      {/* Animated Building Map */}
      <div style={{ margin: 'calc(-1 * var(--space-4))', marginBottom: 'var(--space-4)', borderBottom: '1px solid var(--border)' }}>
        <BuildingScene width={window.innerWidth} height={240} />
      </div>

      {/* Title Progress */}
      <div className={styles.titleCard}>
        <div className={styles.titleHeader}>
          <img src={getAssetUrl(title.assetKey)} alt="" className={styles.titleIcon} />
          <div className={styles.titleInfo}>
            <span className={styles.titleName}>{title.nameRu}</span>
            {nextTitle && (
              <span className={styles.nextTitle}>{'\u2192'} {nextTitle.nameRu}</span>
            )}
          </div>
          <div className={styles.incomeTag}>
            <span className={styles.incomeValue}>{formatIncome(totalIncome)}</span>
          </div>
        </div>
        {nextTitle && (
          <ProgressBar value={totalIncome} max={nextTitle.incomeThreshold} variant="gold" showLabel label="Доход для следующего титула" />
        )}
      </div>

      {/* Action Buttons */}
      <div className={styles.actionRow}>
        <Button variant="primary" size="lg" fullWidth onClick={handleCollect}>
          <img src={getAssetUrl('ui_territory/ui_collect_income')} alt="" style={{width:20,height:20}} /> Собрать доход
        </Button>
        <Button variant="secondary" size="md" onClick={() => setShowBuildSheet(true)}>
          <img src={getAssetUrl('ui_territory/ui_build')} alt="" style={{width:20,height:20}} /> Строить
        </Button>
      </div>

      {/* Buildings List */}
      <div className={styles.sectionTitle}>
        <h3>Здания</h3>
        <span className={styles.buildingCount}>{buildings.length}</span>
      </div>

      <div className={styles.buildingList}>
        {buildings.map((building) => {
          const def = getBuildingById(building.id);
          if (!def) return null;
          const nextLevel = building.level + 1;
          const upgradeCost = getBuildingCost(def, nextLevel);
          const currency = getUpgradeCurrency(nextLevel);
          const isMaxLevel = building.level >= def.maxLevel;
          const canAfford = currency === 'silver' ? user.silver >= upgradeCost : user.gold >= upgradeCost;
          const onCooldown = building.cooldownUntil && new Date(building.cooldownUntil) > new Date();

          return (
            <div key={building.id} className={styles.buildingCard}>
              <img
                src={getAssetUrl(def.assetKey)}
                alt={def.nameRu}
                className={styles.buildingImg}
              />
              <div className={styles.buildingInfo}>
                <div className={styles.buildingName}>
                  <span>{def.nameRu}</span>
                  <span className={styles.buildingLevel}>ур. {building.level}</span>
                </div>
                <div className={styles.buildingIncome}>
                  +{formatNumber(building.income)}/ч
                </div>
              </div>
              <div className={styles.buildingAction}>
                {isMaxLevel ? (
                  <span className={styles.maxLevel}>МАКС</span>
                ) : onCooldown ? (
                  <span className={styles.cooldown}>{formatTimeRemaining(building.cooldownUntil)}</span>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => {
                      haptics.success();
                      upgradeBuilding(building.id);
                    }}
                    disabled={!canAfford}
                  >
                    <CurrencyBadge type={currency} amount={upgradeCost} size="sm" />
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Build Sheet */}
      {showBuildSheet && <BuildScreen onClose={() => setShowBuildSheet(false)} />}

      {/* Coin Shower Animation */}
      {showCoinShower && (
        <CoinShower
          amount={collectedAmount}
          onComplete={() => setShowCoinShower(false)}
        />
      )}
    </Screen>
  );
}
