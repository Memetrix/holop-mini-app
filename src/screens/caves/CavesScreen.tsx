import { useState, useEffect } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { getDarkCaveMonsters, getGloryCaveMonsters } from '@/config/monsters';
import { CAVE_BOOSTERS } from '@/config/weapons';
import { GAME } from '@/config/constants';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { LootboxScene } from '@/pixi/LootboxScene';
import type { LootReward } from '@/pixi/LootboxScene';
import styles from './CavesScreen.module.css';

function formatCountdown(targetTime: string): string {
  const diff = new Date(targetTime).getTime() - Date.now();
  if (diff <= 0) return '';
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const secs = Math.floor((diff % (1000 * 60)) / 1000);
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
}

export function CavesScreen() {
  const user = useGameStore((s) => s.user);
  const executeCaveBattle = useGameStore((s) => s.executeCaveBattle);
  const resurrectInCave = useGameStore((s) => s.resurrectInCave);
  const useCaveBooster = useGameStore((s) => s.useCaveBooster);
  const buyItem = useGameStore((s) => s.buyItem);
  const activeCaveBoosters = useGameStore((s) => s.activeCaveBoosters);
  const inventory = useGameStore((s) => s.inventory);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  const [lootRewards, setLootRewards] = useState<LootReward[] | null>(null);
  const [defeatMonsterLevel, setDefeatMonsterLevel] = useState<number | null>(null);
  const [cooldownText, setCooldownText] = useState('');

  // Cooldown ticker
  useEffect(() => {
    if (!user.caveCooldownUntil) { setCooldownText(''); return; }
    const tick = () => {
      const text = formatCountdown(user.caveCooldownUntil!);
      setCooldownText(text);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [user.caveCooldownUntil]);

  const isOnCooldown = !!user.caveCooldownUntil && new Date(user.caveCooldownUntil).getTime() > Date.now();

  const handleFight = (monsterId: string, monsterLevel: number) => {
    haptics.medium();
    const result = executeCaveBattle(monsterId);
    if (result.won) {
      haptics.success();
      const rewards: LootReward[] = [];
      if (result.silverLooted > 0) rewards.push({ type: 'silver', amount: result.silverLooted, label: `+${result.silverLooted} ${language === 'ru' ? 'серебра' : 'silver'}` });
      if (result.goldLooted > 0) rewards.push({ type: 'gold', amount: result.goldLooted, label: `+${result.goldLooted} ${language === 'ru' ? 'золота' : 'gold'}` });
      if (result.reputationGained > 0) rewards.push({ type: 'stars', amount: result.reputationGained, label: `+${result.reputationGained} ${language === 'ru' ? 'репутации' : 'reputation'}` });
      setLootRewards(rewards.length > 0 ? rewards : [{ type: 'silver', amount: 0, label: language === 'ru' ? 'Ничего не найдено' : 'Nothing found' }]);
    } else {
      haptics.error();
      setDefeatMonsterLevel(monsterLevel);
    }
  };

  const handleResurrect = () => {
    if (defeatMonsterLevel === null) return;
    haptics.medium();
    const success = resurrectInCave(defeatMonsterLevel);
    if (success) {
      setDefeatMonsterLevel(null);
    }
  };

  const handleBuyBooster = (boosterId: string) => {
    haptics.light();
    buyItem('boosters', boosterId);
  };

  const handleUseBooster = (boosterId: string) => {
    haptics.light();
    useCaveBooster(boosterId);
  };

  const darkCaveUnlocked = user.titleLevel >= GAME.CAVE_DARK_UNLOCK_TITLE;
  const gloryCaveUnlocked = user.titleLevel >= GAME.CAVE_GLORY_UNLOCK_TITLE;
  const darkMonsters = getDarkCaveMonsters();
  const gloryMonsters = getGloryCaveMonsters();

  // Active boosters display
  const activeBoosterLabels: string[] = [];
  if (activeCaveBoosters.healthPotion) activeBoosterLabels.push('+30 HP');
  if (activeCaveBoosters.strengthPotion) activeBoosterLabels.push('+15 ATK');
  if (activeCaveBoosters.fortitudePotion) activeBoosterLabels.push('+15 DEF');
  if (activeCaveBoosters.holyLight) activeBoosterLabels.push(language === 'ru' ? '-10% урона' : '-10% dmg');

  return (
    <Screen>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: 'var(--space-4)' }}>{language === 'ru' ? 'Пещеры' : 'Caves'}</h2>

      {/* Cooldown Banner */}
      {isOnCooldown && (
        <div style={{
          background: 'rgba(200,151,62,0.1)', border: '1px solid var(--border)',
          borderRadius: 12, padding: '12px 16px', marginBottom: 16, textAlign: 'center',
        }}>
          <span style={{ color: 'var(--gold)', fontWeight: 600 }}>{language === 'ru' ? 'Кулдаун' : 'Cooldown'}: {cooldownText}</span>
        </div>
      )}

      {/* Cave Boosters */}
      <div style={{
        background: 'var(--bg-card)', borderRadius: 12, padding: 12, marginBottom: 16,
        border: '1px solid var(--border)',
      }}>
        <h4 style={{ color: 'var(--gold-light)', marginBottom: 8, fontSize: 14 }}>{language === 'ru' ? 'Бустеры' : 'Boosters'}</h4>
        {activeBoosterLabels.length > 0 && (
          <div style={{ color: '#4CAF50', fontSize: 12, marginBottom: 8 }}>
            {language === 'ru' ? 'Активно' : 'Active'}: {activeBoosterLabels.join(', ')}
          </div>
        )}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {CAVE_BOOSTERS.map((b) => {
            const owned = inventory.caveBoosters.find(i => i.id === b.id);
            const qty = owned?.quantity ?? 0;
            const isActive = (
              (b.id === 'health_potion' && activeCaveBoosters.healthPotion) ||
              (b.id === 'strength_potion' && activeCaveBoosters.strengthPotion) ||
              (b.id === 'fortitude_potion' && activeCaveBoosters.fortitudePotion) ||
              (b.id === 'holy_light' && activeCaveBoosters.holyLight)
            );
            return (
              <div key={b.id} style={{
                flex: '1 1 calc(50% - 4px)', background: 'var(--bg-dark)',
                borderRadius: 8, padding: '8px 10px', fontSize: 12,
                border: isActive ? '1px solid #4CAF50' : '1px solid var(--border)',
              }}>
                <div style={{ fontWeight: 600, color: 'var(--parchment)' }}>{language === 'ru' ? b.nameRu : (b.nameEn ?? b.nameRu)}</div>
                <div style={{ color: 'var(--parchment-dark)', fontSize: 11 }}>{language === 'ru' ? b.effect : (b.effectEn ?? b.effect)}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  {qty > 0 && !isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleUseBooster(b.id)} style={{ fontSize: 11, padding: '2px 8px' }}>
                      {language === 'ru' ? `Исп. (${qty})` : `Use (${qty})`}
                    </Button>
                  )}
                  {isActive && <span style={{ color: '#4CAF50', fontSize: 11 }}>{language === 'ru' ? 'Активен' : 'Active'}</span>}
                  {qty === 0 && !isActive && (
                    <Button variant="ghost" size="sm" onClick={() => handleBuyBooster(b.id)} style={{ fontSize: 11, padding: '2px 8px' }}>
                      {b.cost} ⭐
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dark Cave */}
      <div className={styles.caveSection}>
        <div className={styles.caveHeader}>
          <img src={getAssetUrl('ui_caves/ui_dark_cave')} alt="" className={styles.caveIcon} />
          <div>
            <h3>{language === 'ru' ? 'Тёмная пещера' : 'Dark Cave'}</h3>
            <span className={styles.caveSubtitle}>{darkCaveUnlocked ? (language === 'ru' ? 'Доступна' : 'Available') : (language === 'ru' ? 'Титул 3 (Челядин)' : 'Title 3 (Serf)')}</span>
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleFight(monster.id, monster.level)}
                  disabled={isOnCooldown || user.health < 10}
                >
                  {isOnCooldown ? cooldownText : (language === 'ru' ? 'Бой' : 'Fight')}
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
            <h3>{language === 'ru' ? 'Пещера славы' : 'Glory Cave'}</h3>
            <span className={styles.caveSubtitle}>{gloryCaveUnlocked ? (language === 'ru' ? 'Доступна' : 'Available') : (language === 'ru' ? 'Титул 4 (Ремесленник)' : 'Title 4 (Craftsman)')}</span>
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
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleFight(monster.id, monster.level)}
                  disabled={isOnCooldown || user.health < 10}
                >
                  {isOnCooldown ? cooldownText : (language === 'ru' ? 'Бой' : 'Fight')}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Defeat Modal — Resurrection */}
      {defeatMonsterLevel !== null && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(26,16,8,0.95)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24,
        }}>
          <h2 style={{ color: '#ff6b6b', fontFamily: 'var(--font-display)', marginBottom: 12 }}>{language === 'ru' ? 'Поражение!' : 'Defeat!'}</h2>
          <p style={{ color: 'var(--parchment-dark)', textAlign: 'center', marginBottom: 24 }}>
            {language === 'ru' ? 'Ваш персонаж пал в бою. Можно воскреситься или вернуться.' : 'Your character fell in battle. You can resurrect or go back.'}
          </p>
          <div style={{ display: 'flex', gap: 12, flexDirection: 'column', width: '100%', maxWidth: 280 }}>
            <Button variant="primary" size="lg" fullWidth onClick={handleResurrect}>
              {language === 'ru' ? 'Воскреситься' : 'Resurrect'} ({GAME.CAVE_RESURRECTION_BASE_STARS + GAME.CAVE_RESURRECTION_PER_LEVEL_STARS * defeatMonsterLevel} ⭐)
            </Button>
            <Button variant="ghost" size="md" fullWidth onClick={() => setDefeatMonsterLevel(null)}>
              {language === 'ru' ? 'Вернуться' : 'Go Back'}
            </Button>
          </div>
        </div>
      )}

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
