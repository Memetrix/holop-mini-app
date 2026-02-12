/**
 * Building Info & Upgrade Bottom Sheet
 * Shows building details and upgrade option when a building is tapped on the city map.
 * Supports swipe-to-close gesture.
 */

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSwipeSheet } from '@/hooks/useSwipeSheet';
import {
  getBuildingById,
  getBuildingIncome,
  getUpgradeSilverCost,
  getUpgradeGoldCost,
  getUpgradeCooldown,
  getSpeedUpCost,
  formatCooldown,
} from '@/config/buildings';
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
  const { sheetRef, handlers } = useSwipeSheet({ onClose });

  const def = getBuildingById(building.id);
  if (!def) return null;

  const isMaxLevel = building.level >= def.maxLevel;
  const isOnCooldown = building.cooldownUntil && new Date(building.cooldownUntil).getTime() > Date.now();

  const nextLevel = building.level + 1;
  const currency = nextLevel <= 10 ? 'silver' : 'gold';
  const upgradeCost = isMaxLevel
    ? 0
    : currency === 'silver'
      ? getUpgradeSilverCost(def, building.level)
      : getUpgradeGoldCost(def, building.level);
  const nextIncome = isMaxLevel ? building.income : getBuildingIncome(def, nextLevel);
  const canAfford = currency === 'silver' ? user.silver >= upgradeCost : user.gold >= upgradeCost;
  const canUpgrade = !isMaxLevel && !isOnCooldown && canAfford;

  // Cooldown info for display before pressing upgrade
  const cooldownSeconds = isMaxLevel ? 0 : getUpgradeCooldown(building.level);
  const cooldownDisplay = cooldownSeconds > 0 ? formatCooldown(cooldownSeconds) : '';
  const speedUpStars = isMaxLevel ? 0 : getSpeedUpCost(building.level);

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

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div
        ref={sheetRef}
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
        {...handlers}
      >
        <div className={styles.handle} />

        {/* Large Building Image */}
        <div className={styles.imageSection}>
          <div className={styles.imageGlow} style={{ backgroundColor: `${levelColor}20` }} />
          <img
            src={getAssetUrl(def.assetKey)}
            alt={def.nameRu}
            className={styles.bigImage}
          />
        </div>

        {/* Building Info */}
        <div className={styles.buildingHeader}>
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
          {!isMaxLevel && cooldownDisplay && (
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {language === 'ru' ? 'Кулдаун' : 'Cooldown'}
              </span>
              <span className={styles.statValue}>{cooldownDisplay}</span>
            </div>
          )}
          {def.bonus && (
            <div className={styles.statCard}>
              <span className={styles.statLabel}>
                {language === 'ru' ? 'Бонус' : 'Bonus'}
              </span>
              <span className={styles.statValue}>
                {Object.entries(def.bonus).map(([key, val]) => {
                  if (typeof val === 'number') return `+${Math.round(val * 100)}% ${key.replace(/_/g, ' ')}`;
                  if (typeof val === 'boolean') return key.replace(/_/g, ' ');
                  return String(val);
                }).join(', ')}
              </span>
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
                {language === 'ru' ? 'Кулдаун' : 'Cooldown'}: {cooldownText}
              </div>
              <Button variant="secondary" size="lg" fullWidth disabled>
                {language === 'ru' ? 'Подождите...' : 'Wait...'}
              </Button>
              {speedUpStars > 0 && (
                <Button variant="primary" size="lg" fullWidth disabled>
                  {language === 'ru'
                    ? `Ускорить за ${speedUpStars} ⭐`
                    : `Speed up for ${speedUpStars} ⭐`
                  }
                </Button>
              )}
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
    </div>,
    document.body,
  );
}
