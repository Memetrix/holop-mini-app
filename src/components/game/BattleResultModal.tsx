import { useEffect } from 'react';
import { useGameStore } from '@/store/gameStore';
import { useHaptics } from '@/hooks/useHaptics';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { ResultEffect } from '@/pixi/ResultEffect';
import styles from './BattleResultModal.module.css';

interface BattleResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  won: boolean;
  combatLog: Array<{
    turn: number;
    attackerDamage: number;
    defenderDamage: number;
    attackerHp: number;
    defenderHp: number;
  }>;
  silverLooted: number;
  goldLooted: number;
  reputationGained: number;
  opponentName?: string;
}

export function BattleResultModal({
  isOpen,
  onClose,
  won,
  combatLog,
  silverLooted,
  goldLooted,
  reputationGained,
  opponentName,
}: BattleResultModalProps) {
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      if (won) {
        haptics.success();
      } else {
        haptics.error();
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, won, haptics]);

  if (!isOpen) return null;

  const hasLoot = silverLooted > 0 || goldLooted > 0 || reputationGained > 0;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />

        {/* Header */}
        <div className={`${styles.header} ${won ? styles.headerWon : styles.headerLost}`}>
          <ResultEffect won={won} width={window.innerWidth > 428 ? 428 : window.innerWidth} height={140} />
          <h2 className={styles.title}>
            {won ? (language === 'ru' ? 'ПОБЕДА!' : 'VICTORY!') : (language === 'ru' ? 'ПОРАЖЕНИЕ' : 'DEFEAT')}
          </h2>
          {won && <div className={styles.shimmer} />}
        </div>

        {opponentName && (
          <p className={styles.opponent}>vs {opponentName}</p>
        )}

        {/* Loot Section */}
        {won && hasLoot && (
          <div className={styles.lootSection}>
            <h4 className={styles.sectionLabel}>{language === 'ru' ? 'Добыча' : 'Loot'}</h4>
            <div className={styles.lootGrid}>
              {silverLooted > 0 && (
                <CurrencyBadge type="silver" amount={silverLooted} size="lg" showSign />
              )}
              {goldLooted > 0 && (
                <CurrencyBadge type="gold" amount={goldLooted} size="lg" showSign />
              )}
              {reputationGained > 0 && (
                <CurrencyBadge type="reputation" amount={reputationGained} size="lg" showSign />
              )}
            </div>
          </div>
        )}

        {/* Combat Log */}
        <div className={styles.logSection}>
          <h4 className={styles.sectionLabel}>{language === 'ru' ? 'Боевой журнал' : 'Combat Log'}</h4>
          <div className={styles.logScroll}>
            {combatLog.map((entry) => (
              <div key={entry.turn} className={styles.logEntry}>
                <span className={styles.logTurn}>{language === 'ru' ? 'Раунд' : 'Round'} {entry.turn}</span>
                <div className={styles.logDamages}>
                  <span className={styles.dmgGreen}>
                    &minus;{entry.attackerDamage} HP {language === 'ru' ? 'врагу' : 'to enemy'}
                  </span>
                  <span className={styles.dmgSep}>{'\u2022'}</span>
                  <span className={styles.dmgRed}>
                    &minus;{entry.defenderDamage} HP {language === 'ru' ? 'вам' : 'to you'}
                  </span>
                </div>
                <div className={styles.logHp}>
                  <span>{language === 'ru' ? 'Враг' : 'Enemy'}: {entry.defenderHp} HP</span>
                  <span>{language === 'ru' ? 'Вы' : 'You'}: {entry.attackerHp} HP</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className={styles.actions}>
          <Button
            variant={won ? 'primary' : 'secondary'}
            size="lg"
            fullWidth
            onClick={onClose}
          >
            {won ? (language === 'ru' ? 'Забрать добычу' : 'Claim Loot') : (language === 'ru' ? 'Продолжить' : 'Continue')}
          </Button>
        </div>
      </div>
    </div>
  );
}
