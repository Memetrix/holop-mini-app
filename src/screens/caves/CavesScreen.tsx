import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getDarkCaveMonsters, getGloryCaveMonsters } from '@/config/monsters';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import styles from './CavesScreen.module.css';

export function CavesScreen() {
  const user = useGameStore((s) => s.user);
  const executeCaveBattle = useGameStore((s) => s.executeCaveBattle);

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
                <Button variant="primary" size="sm" onClick={() => executeCaveBattle(monster.id)}>
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
                <Button variant="primary" size="sm" onClick={() => executeCaveBattle(monster.id)}>
                  Бой
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Screen>
  );
}
