import { useState } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getDarkCaveMonsters, getGloryCaveMonsters } from '@/config/monsters';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { LootboxScene } from '@/pixi/LootboxScene';
import type { LootReward } from '@/pixi/LootboxScene';
import styles from './CavesScreen.module.css';

export function CavesScreen() {
  const user = useGameStore((s) => s.user);
  const executeCaveBattle = useGameStore((s) => s.executeCaveBattle);
  const [lootRewards, setLootRewards] = useState<LootReward[] | null>(null);

  const handleFight = (monsterId: string) => {
    const result = executeCaveBattle(monsterId);
    if (result.won) {
      const rewards: LootReward[] = [];
      if (result.silverLooted > 0) rewards.push({ type: 'silver', amount: result.silverLooted, label: `+${result.silverLooted} серебра` });
      if (result.goldLooted > 0) rewards.push({ type: 'gold', amount: result.goldLooted, label: `+${result.goldLooted} золота` });
      if (result.reputationGained > 0) rewards.push({ type: 'stars', amount: result.reputationGained, label: `+${result.reputationGained} репутации` });
      setLootRewards(rewards.length > 0 ? rewards : [{ type: 'silver', amount: 0, label: 'Ничего не найдено' }]);
    }
  };

  const darkCaveUnlocked = user.titleLevel >= 3;
  const gloryCaveUnlocked = user.titleLevel >= 4;
  const darkMonsters = getDarkCaveMonsters();
  const gloryMonsters = getGloryCaveMonsters();

  return (
    <Screen>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: 'var(--space-4)' }}>Пещеры</h2>

      {/* Dark Cave */}
      <div className={styles.caveSection}>
        <div className={styles.caveHeader}>
          <img src={getAssetUrl('ui_caves/ui_dark_cave')} alt="" className={styles.caveIcon} />
          <div>
            <h3>Тёмная пещера</h3>
            <span className={styles.caveSubtitle}>{darkCaveUnlocked ? 'Доступна' : 'Титул 3 (Челядин)'}</span>
          </div>
        </div>

        {darkCaveUnlocked && (
          <div className={styles.monsterList}>
            {darkMonsters.map((monster) => (
              <div key={monster.id} className={styles.monsterCard}>
                <img src={getAssetUrl(monster.assetKey)} alt={monster.nameRu} className={styles.monsterImg} />
                <div className={styles.monsterInfo}>
                  <span className={styles.monsterName}>{monster.nameRu}</span>
                  <div className={styles.monsterStats}>
                    <span>ATK {monster.atk}</span>
                    <span>DEF {monster.def}</span>
                    <span>HP {monster.hp}</span>
                  </div>
                  <CurrencyBadge type="silver" amount={monster.silverLoot} size="sm" />
                </div>
                <Button variant="primary" size="sm" onClick={() => handleFight(monster.id)}>
                  Бой
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Glory Cave */}
      <div className={styles.caveSection}>
        <div className={styles.caveHeader}>
          <img src={getAssetUrl('ui_caves/ui_glory_cave')} alt="" className={styles.caveIcon} />
          <div>
            <h3>Пещера славы</h3>
            <span className={styles.caveSubtitle}>{gloryCaveUnlocked ? 'Доступна' : 'Титул 4 (Ремесленник)'}</span>
          </div>
        </div>

        {gloryCaveUnlocked && (
          <div className={styles.monsterList}>
            {gloryMonsters.map((monster) => (
              <div key={monster.id} className={styles.monsterCard}>
                <img src={getAssetUrl(monster.assetKey)} alt={monster.nameRu} className={styles.monsterImg} />
                <div className={styles.monsterInfo}>
                  <span className={styles.monsterName}>{monster.nameRu}</span>
                  <div className={styles.monsterStats}>
                    <span>ATK {monster.atk}</span>
                    <span>DEF {monster.def}</span>
                    <span>HP {monster.hp}</span>
                  </div>
                  <CurrencyBadge type="silver" amount={monster.silverLoot} size="sm" />
                </div>
                <Button variant="primary" size="sm" onClick={() => handleFight(monster.id)}>
                  Бой
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* Lootbox Animation */}
      {lootRewards && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,16,8,0.95)' }}>
          <LootboxScene
            rewards={lootRewards}
            onComplete={() => setLootRewards(null)}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </div>
      )}
    </Screen>
  );
}
