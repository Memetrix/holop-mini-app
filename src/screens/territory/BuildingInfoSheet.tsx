/**
 * Building Info & Upgrade Bottom Sheet
 * Shows building details and upgrade option when a building is tapped on the city map.
 */

import { useState, useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getBuildingById, getBuildingCost, getBuildingIncome } from '@/config/buildings';
import { getAssetUrl } from '@/config/assets';
import { getParticleColor } from '@/config/cityLayout';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Button } from '@/components/ui/Button';
import type { Building } from '@/store/types';
import styles from './BuildingInfoSheet.module.css';

interface BuildingInfoSheetProps {
  building: Building;
  onClose: () => void;
}

// Convert hex number to CSS color string
function hexToCSS(hex: number): string {
  return '#' + hex.toString(16).padStart(6, '0');
}

export function BuildingInfoSheet({ building, onClose }: BuildingInfoSheetProps) {
  const upgradeBuilding = useGameStore((s) => s.upgradeBuilding);
  const user = useGameStore((s) => s.user);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();
  const [cooldownText, setCooldownText] = useState('');

  const def = getBuildingById(building.id);
  if (!def) return null;

  const isMaxLevel = building.level >= def.maxLevel;
  const isOnCooldown = building.cooldownUntil && new Date(building.cooldownUntil).getTime() > Date.now();

  const nextLevel = building.level + 1;
  const upgradeCost = isMaxLevel ? 0 : getBuildingCost(def, nextLevel);
  const nextIncome = isMaxLevel ? building.income : getBuildingIncome(def, nextLevel);
  const currency = nextLevel <= 10 ? 'silver' : 'gold';
  const canAfford = currency === 'silver' ? user.silver >= upgradeCost : user.gold >= upgradeCost;
  const canUpgrade = !isMaxLevel && !isOnCooldown && canAfford;

  const levelColor = hexToCSS(getParticleColor(building.level));

  // Cooldown timer
  useEffect(() => {
    if (!isOnCooldown || !building.cooldownUntil) return;

    const update = () => {
      const remaining = new Date(building.cooldownUntil!).getTime() - Date.now();
      if (remaining <= 0) {
        setCooldownText('');
        return;
      }
      const mins = Math.floor(remaining / 60000);
      const secs = Math.floor((remaining % 60000) / 1000);
      setCooldownText(`${mins}:${secs.toString().padStart(2, '0')}`);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [isOnCooldown, building.cooldownUntil]);

  const handleUpgrade = () => {
    haptics.success();
    upgradeBuilding(building.id);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />

        {/* Building Header */}
        <div className={styles.buildingHeader}>
          <img
            src={getAssetUrl(def.assetKey)}
            alt={def.nameRu}
            className={styles.buildingImg}
          />
          <div className={styles.buildingInfo}>
            <div className={styles.buildingName}>
              {language === 'ru' ? def.nameRu : def.nameEn}
            </div>
            <div className={styles.levelBadge}>
              <span
                className={styles.levelDot}
                style={{ backgroundColor: levelColor }}
              />
              {language === 'ru' ? 'Уровень' : 'Level'} {building.level} / {def.maxLevel}
            </div>
            <div className={styles.incomeRow}>
              <img src={getAssetUrl('currencies/silver')} alt="" className={styles.incomeIcon} />
              +{formatNumber(building.income)}/{language === 'ru' ? 'ч' : 'hr'}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>
              {language === 'ru' ? 'Текущий доход' : 'Current Income'}
            </span>
            <span className={styles.statValue}>+{formatNumber(building.income)}/ч</span>
          </div>
          {!isMaxLevel && (
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {language === 'ru' ? 'После апгрейда' : 'After Upgrade'}
              </span>
              <span className={styles.statValue}>+{formatNumber(nextIncome)}/ч</span>
            </div>
          )}
          {isMaxLevel && (
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {language === 'ru' ? 'Тир' : 'Tier'}
              </span>
              <span className={styles.statValue} style={{ textTransform: 'capitalize' }}>{def.tier}</span>
            </div>
          )}
        </div>

        {/* Upgrade Section */}
        <div className={styles.upgradeSection}>
          {isMaxLevel ? (
            <div className={styles.maxBadge}>
              {language === 'ru' ? 'Максимальный уровень' : 'Max Level'}
            </div>
          ) : isOnCooldown ? (
            <>
              <div className={styles.cooldownText}>
                ⏱ {language === 'ru' ? 'Кулдаун' : 'Cooldown'}: {cooldownText}
              </div>
              <Button variant="secondary" size="lg" fullWidth disabled>
                {language === 'ru' ? 'Подождите...' : 'Wait...'}
              </Button>
            </>
          ) : (
            <>
              <div className={styles.upgradeCost}>
                <img
                  src={getAssetUrl(currency === 'silver' ? 'currencies/silver' : 'currencies/gold')}
                  alt=""
                  className={styles.costIcon}
                />
                <span className={styles.costValue}>{formatNumber(upgradeCost)}</span>
                {currency === 'silver'
                  ? (language === 'ru' ? 'серебра' : 'silver')
                  : (language === 'ru' ? 'золота' : 'gold')
                }
              </div>
              <Button
                variant="primary"
                size="lg"
                fullWidth
                disabled={!canUpgrade}
                onClick={handleUpgrade}
              >
                {language === 'ru'
                  ? `Улучшить до ур. ${nextLevel}`
                  : `Upgrade to Lv. ${nextLevel}`
                }
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
