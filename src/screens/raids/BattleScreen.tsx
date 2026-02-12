import { useState, useEffect, useCallback } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel } from '@/config/titles';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Button } from '@/components/ui/Button';
import { BattleResultModal } from '@/components/game/BattleResultModal';
import { CombatScene } from '@/pixi/CombatScene';
import type { BattleResult } from '@/store/types';
import styles from './BattleScreen.module.css';

interface BattleScreenProps {
  targetId: number;
  onBack: () => void;
}

type BattlePhase = 'pre' | 'fighting' | 'done';

export function BattleScreen({ targetId, onBack }: BattleScreenProps) {
  const user = useGameStore((s) => s.user);
  const equipment = useGameStore((s) => s.equipment);
  const raidTargets = useGameStore((s) => s.raidTargets);
  const executeRaid = useGameStore((s) => s.executeRaid);
  const haptics = useHaptics();

  const [phase, setPhase] = useState<BattlePhase>('pre');
  const [result, setResult] = useState<BattleResult | null>(null);

  const target = raidTargets.find((t) => t.id === targetId);

  const playerAtk = user.attack + (equipment.weapon?.atkBonus ?? 0);
  const playerDef = user.defense + (equipment.armor?.defBonus ?? 0);
  const playerTitle = getTitleByLevel(user.titleLevel);
  const targetTitle = target ? getTitleByLevel(target.titleLevel) : null;

  const startBattle = useCallback(() => {
    haptics.heavy();
    // Compute result immediately so CombatScene can replay it
    const battleResult = executeRaid(targetId);
    setResult(battleResult);
    setPhase('fighting');
    // CombatScene will call handleCombatComplete when done
  }, [executeRaid, targetId, haptics]);

  const handleCombatComplete = useCallback(() => {
    setPhase('done');
  }, []);

  // Cleanup overflow on unmount
  useEffect(() => {
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!target || !targetTitle) {
    return (
      <Screen>
        <div className={styles.notFound}>
          <p>Цель не найдена</p>
          <Button variant="secondary" onClick={onBack}>Назад</Button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen>
      {/* Back Button */}
      {phase === 'pre' && (
        <button className={styles.backBtn} onClick={onBack} type="button">
          &#8592; Назад
        </button>
      )}

      {/* VS Screen */}
      {(phase === 'pre' || phase === 'fighting') && (
        <div className={styles.vsContainer}>
          {/* Player Side */}
          <div className={styles.fighter}>
            <img
              src={getAssetUrl(playerTitle.assetKey)}
              alt={playerTitle.nameRu}
              className={styles.fighterAvatar}
            />
            <span className={styles.fighterName}>@{user.username}</span>
            <span className={styles.fighterTitle}>{playerTitle.nameRu}</span>
            <div className={styles.fighterStats}>
              <span>ATK {playerAtk}</span>
              <span>DEF {playerDef}</span>
              <span>HP {user.health}</span>
            </div>
          </div>

          {/* VS Badge */}
          <div className={`${styles.vsBadge} ${phase === 'fighting' ? styles.vsFighting : ''}`}>
            {phase === 'pre' ? 'VS' : '...'}
          </div>

          {/* Target Side */}
          <div className={styles.fighter}>
            <img
              src={getAssetUrl(targetTitle.assetKey)}
              alt={targetTitle.nameRu}
              className={styles.fighterAvatar}
            />
            <span className={styles.fighterName}>@{target.username}</span>
            <span className={styles.fighterTitle}>
              {targetTitle.nameRu} {'\u2022'} {target.cityName}
            </span>
            <div className={styles.fighterStats}>
              <span>DEF {target.defense}</span>
              <span>HP {target.health}</span>
              <span>{formatNumber(target.silver)} Ag</span>
            </div>
          </div>
        </div>
      )}

      {/* Fight Animation — CombatScene */}
      {phase === 'fighting' && result && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'var(--bg-dark)' }}>
          <CombatScene
            playerAssetKey={playerTitle.assetKey}
            opponentAssetKey={targetTitle.assetKey}
            result={result}
            onComplete={handleCombatComplete}
            width={window.innerWidth}
            height={window.innerHeight}
          />
        </div>
      )}

      {/* Attack Button */}
      {phase === 'pre' && (
        <div className={styles.attackSection}>
          <Button
            variant="primary"
            size="lg"
            fullWidth
            onClick={startBattle}
          >
            Напасть!
          </Button>
        </div>
      )}

      {/* Battle Result Modal */}
      {result && (
        <BattleResultModal
          isOpen={phase === 'done'}
          onClose={onBack}
          won={result.won}
          combatLog={result.combatLog}
          silverLooted={result.silverLooted}
          goldLooted={result.goldLooted}
          reputationGained={result.reputationGained}
          opponentName={target.username}
        />
      )}
    </Screen>
  );
}
