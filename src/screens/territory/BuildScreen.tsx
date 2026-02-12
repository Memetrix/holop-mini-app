/**
 * BuildScreen — Shows available buildings to construct
 */
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { BUILDINGS } from '@/config/buildings';
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
  const haptics = useHaptics();

  const builtIds = new Set(buildings.map((b) => b.id));
  const availableBuildings = BUILDINGS.filter(
    (def) => def.category === 'income' && !builtIds.has(def.id),
  );

  const handleBuild = (id: string) => {
    haptics.success();
    buildNewBuilding(id, targetSlotIndex);
    onClose();
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div className={styles.handle} />
        <div className={styles.header}>
          <h3>Построить здание</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        {availableBuildings.length === 0 ? (
          <div className={styles.empty}>
            <p>Все доступные здания построены!</p>
          </div>
        ) : (
          <div className={styles.list}>
            {availableBuildings.map((def) => {
              const canAfford = user.silver >= def.baseCost;
              return (
                <div key={def.id} className={styles.card}>
                  <img
                    src={getAssetUrl(def.assetKey)}
                    alt={def.nameRu}
                    className={styles.img}
                  />
                  <div className={styles.info}>
                    <span className={styles.name}>{def.nameRu}</span>
                    <span className={styles.desc}>
                      +{formatNumber(def.baseIncome)}/ч • макс. ур. {def.maxLevel}
                    </span>
                    <span className={styles.tier}>{def.tier}</span>
                  </div>
                  <div className={styles.action}>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleBuild(def.id)}
                      disabled={!canAfford}
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
    </div>
  );
}
