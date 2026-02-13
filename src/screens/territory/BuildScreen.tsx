/**
 * BuildScreen — Shows available buildings to construct
 * Renders as portal to avoid clipping by parent container.
 * Supports swipe-to-close gesture.
 */
import { createPortal } from 'react-dom';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { useSwipeSheet } from '@/hooks/useSwipeSheet';
import { getAssetUrl } from '@/config/assets';
import { BUILDINGS, checkPrerequisites, getBuildingById } from '@/config/buildings';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import styles from './BuildScreen.module.css';

interface BuildScreenProps {
  onClose: () => void;
  targetSlotIndex?: number;
}

export function BuildScreen({ onClose, targetSlotIndex }: BuildScreenProps) {
  const user = useGameStore((s) => s.user);
  const buildings = useGameStore((s) => s.buildings);
  const buildNewBuilding = useGameStore((s) => s.buildNewBuilding);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();
  const { sheetRef, handlers } = useSwipeSheet({ onClose });

  const builtIds = new Set(buildings.map((b) => b.id));
  const availableBuildings = BUILDINGS.filter(
    (def) => def.category === 'income' && !builtIds.has(def.id),
  );

  const handleBuild = (id: string) => {
    haptics.success();
    buildNewBuilding(id, targetSlotIndex);
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
        <div className={styles.header}>
          <h3>{language === 'ru' ? 'Построить здание' : 'Build Structure'}</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {availableBuildings.length === 0 ? (
          <div className={styles.empty}>
            <p>{language === 'ru' ? 'Все доступные здания построены!' : 'All available buildings constructed!'}</p>
          </div>
        ) : (
          <div className={styles.list}>
            {availableBuildings.map((def) => {
              const prereqs = checkPrerequisites(def, buildings);
              const canAfford = user.silver >= def.baseCost;
              const canBuild = canAfford && prereqs.met;
              return (
                <div key={def.id} className={`${styles.card} ${!prereqs.met ? styles.cardLocked : ''}`}>
                  <img
                    src={getAssetUrl(def.assetKey)}
                    alt={def.nameRu}
                    className={styles.img}
                  />
                  <div className={styles.info}>
                    <span className={styles.name}>{language === 'ru' ? def.nameRu : def.nameEn}</span>
                    <span className={styles.desc}>
                      +{formatNumber(def.baseIncome)}/{language === 'ru' ? 'ч' : 'h'} • {language === 'ru' ? 'макс. ур.' : 'max lv.'} {def.maxLevel}
                    </span>
                    <span className={styles.tier}>{def.tier}</span>
                    {!prereqs.met && (
                      <span className={styles.prereq}>
                        {language === 'ru' ? 'Нужно' : 'Requires'}: {prereqs.missing.map((m) => {
                          const req = getBuildingById(m.buildingId);
                          return `${language === 'ru' ? (req?.nameRu ?? m.buildingId) : (req?.nameEn ?? m.buildingId)} ${language === 'ru' ? 'ур.' : 'lv.'}${m.requiredLevel}`;
                        }).join(', ')}
                      </span>
                    )}
                  </div>
                  <div className={styles.action}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBuild(def.id)}
                      disabled={!canBuild}
                    >
                      <CurrencyBadge type="silver" amount={def.baseCost} size="sm" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}
