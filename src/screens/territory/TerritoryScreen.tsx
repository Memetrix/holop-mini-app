/**
 * TerritoryScreen — Fullscreen Interactive City Map
 * PixiJS canvas fills the screen, React DOM overlays for HUD elements.
 */

import { useState, useCallback, useEffect, useRef } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { formatIncome } from '@/hooks/useFormatNumber';
import { getTitleByLevel, getNextTitle } from '@/config/titles';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { CityScene } from '@/pixi/CityScene';
import { CoinShower } from '@/pixi/CoinShower';
import { BuildingInfoSheet } from './BuildingInfoSheet';
import { BuildScreen } from './BuildScreen';
import type { Building } from '@/store/types';
import styles from './TerritoryScreen.module.css';

export function TerritoryScreen() {
  const user = useGameStore((s) => s.user);
  const buildings = useGameStore((s) => s.buildings);
  const totalIncome = useGameStore((s) => s.totalHourlyIncome);
  const collectIncome = useGameStore((s) => s.collectIncome);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  // Bottom sheets state
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null);
  const [targetSlotIndex, setTargetSlotIndex] = useState<number | null>(null);
  const [showBuildSheet, setShowBuildSheet] = useState(false);
  const [showCoinShower, setShowCoinShower] = useState(false);
  const [collectedAmount, setCollectedAmount] = useState(0);

  // Title info
  const title = getTitleByLevel(user.titleLevel);
  const nextTitle = getNextTitle(user.titleLevel);

  // Viewport size for CityScene
  const [viewSize, setViewSize] = useState({ w: window.innerWidth, h: window.innerHeight });
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function measure() {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setViewSize({ w: rect.width, h: rect.height });
      }
    }
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);

  // Handle slot tap from CityScene
  const handleSlotTap = useCallback((slotIndex: number, building: Building | null) => {
    haptics.light();
    if (building) {
      // Existing building → show info/upgrade sheet
      setSelectedBuilding(building);
    } else {
      // Empty slot → show build sheet
      setTargetSlotIndex(slotIndex);
      setShowBuildSheet(true);
    }
  }, [haptics]);

  // Collect income
  const handleCollect = () => {
    haptics.success();
    const now = Date.now();
    const lastCollect = new Date(user.lastIncomeCollect).getTime();
    const hoursPassed = (now - lastCollect) / (1000 * 60 * 60);
    const earned = Math.floor(totalIncome * hoursPassed);
    collectIncome();
    const displayAmount = earned > 0 ? earned : Math.max(1, Math.floor(totalIncome / 60));
    setCollectedAmount(displayAmount);
    setShowCoinShower(true);
  };

  // Close handlers
  const handleCloseBuild = useCallback(() => {
    setShowBuildSheet(false);
    setTargetSlotIndex(null);
  }, []);

  const handleCloseInfo = useCallback(() => {
    setSelectedBuilding(null);
  }, []);

  return (
    <div className={styles.cityContainer} ref={containerRef}>
      {/* Fullscreen PixiJS City */}
      <div className={styles.canvasWrap}>
        <CityScene
          width={viewSize.w}
          height={viewSize.h}
          onSlotTap={handleSlotTap}
        />
      </div>

      {/* ─── Floating HUD ─── */}

      {/* Top: Income + Title Progress */}
      <div className={styles.topHud}>
        <div className={styles.incomeCard}>
          <div className={styles.incomeRow}>
            <img
              src={getAssetUrl(title.assetKey)}
              alt=""
              className={styles.titleIcon}
            />
            <div className={styles.incomeInfo}>
              <span className={styles.titleName}>{language === 'ru' ? title.nameRu : title.nameEn}</span>
              <span className={styles.incomeValue}>{formatIncome(totalIncome)}</span>
            </div>
          </div>
          {nextTitle && (
            <ProgressBar
              value={totalIncome}
              max={nextTitle.incomeThreshold}
              variant="gold"
              showLabel
              label={language === 'ru' ? 'До следующего титула' : 'Until next title'}
            />
          )}
        </div>
      </div>

      {/* Bottom: Collect Button */}
      <div className={styles.bottomHud}>
        <Button variant="primary" size="lg" fullWidth onClick={handleCollect}>
          <img
            src={getAssetUrl('ui_territory/ui_collect_income')}
            alt=""
            style={{ width: 20, height: 20 }}
          />
          {language === 'ru' ? 'Собрать доход' : 'Collect Income'}
        </Button>
      </div>

      {/* Building count badge */}
      <div className={styles.buildingCountBadge}>
        {buildings.length} {language === 'ru' ? 'зданий' : 'buildings'}
      </div>

      {/* ─── Bottom Sheets ─── */}

      {showBuildSheet && (
        <BuildScreen
          targetSlotIndex={targetSlotIndex ?? undefined}
          onClose={handleCloseBuild}
        />
      )}

      {selectedBuilding && (
        <BuildingInfoSheet
          building={selectedBuilding}
          onClose={handleCloseInfo}
        />
      )}

      {/* ─── Coin Shower ─── */}
      {showCoinShower && (
        <CoinShower
          amount={collectedAmount}
          onComplete={() => setShowCoinShower(false)}
        />
      )}
    </div>
  );
}
