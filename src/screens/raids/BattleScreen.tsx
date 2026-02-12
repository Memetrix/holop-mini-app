import { useState, useEffect, useCallback } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel } from '@/config/titles';
import { formatNumber } from '@/hooks/useFormatNumber';
import { Button } from '@/components/ui/Button';
import { BattleResultModal } from '@/components/game/BattleResultModal';
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
    setPhase('fighting');
    haptics.heavy();

    // Simulate a brief delay for battle animation
    setTimeout(() => {
      const battleResult = executeRaid(targetId);
      setResult(battleResult);
      setPhase('done');
    }, 1500);
  }, [executeRaid, targetId, haptics]);

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

      {/* Fight Animation */}
      {phase === 'fighting' && (
        <div className={styles.fightingOverlay}>
          <div className={styles.spinner} />
          <span className={styles.fightingText}>Битва идёт...</span>
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
