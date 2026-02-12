import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel } from '@/config/titles';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { BattleScreen } from './BattleScreen';
import styles from './RaidsScreen.module.css';

export function RaidsScreen() {
  const raidTargets = useGameStore((s) => s.raidTargets);
  const user = useGameStore((s) => s.user);
  const refreshTargets = useGameStore((s) => s.refreshRaidTargets);
  const [battleTargetId, setBattleTargetId] = useState<number | null>(null);

  const isPvpUnlocked = user.titleLevel >= 6;

  if (battleTargetId !== null) {
    return <BattleScreen targetId={battleTargetId} onBack={() => setBattleTargetId(null)} />;
  }

  if (!isPvpUnlocked) {
    return (
      <Screen>
        <div className={styles.locked}>
          <img src={getAssetUrl('ui_main/ui_nabegi')} alt="" className={styles.lockedIcon} />
          <h2>Набеги заблокированы</h2>
          <p>Достигни титула Купец (ур. 6), чтобы разблокировать PvP набеги.</p>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      <div className={styles.header}>
        <h2>Набеги</h2>
        <Button variant="ghost" size="sm" onClick={refreshTargets}>Обновить</Button>
      </div>

      <div className={styles.targetList}>
        {raidTargets.map((target) => {
          const title = getTitleByLevel(target.titleLevel);
          return (
            <div key={target.id} className={styles.targetCard}>
              <div className={styles.targetInfo}>
                <div className={styles.targetHeader}>
                  <img src={getAssetUrl(title.assetKey)} alt="" className={styles.targetAvatar} />
                  <div>
                    <span className={styles.targetName}>@{target.username}</span>
                    <span className={styles.targetCity}>{target.cityName} {'\u2022'} {title.nameRu}</span>
                  </div>
                </div>
                <div className={styles.targetStats}>
                  <CurrencyBadge type="silver" amount={target.silver} size="sm" />
                  <span className={styles.stat}>DEF {target.defense}</span>
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setBattleTargetId(target.id)}
                disabled={target.hasIronDome}
              >
                {target.hasIronDome ? 'Защищён' : 'Напасть'}
              </Button>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
