import { useEffect } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
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
          <h2 className={styles.title}>
            {won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ'}
          </h2>
          {won && <div className={styles.shimmer} />}
        </div>

        {opponentName && (
          <p className={styles.opponent}>vs {opponentName}</p>
        )}

        {/* Loot Section */}
        {won && hasLoot && (
          <div className={styles.lootSection}>
            <h4 className={styles.sectionLabel}>Добыча</h4>
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
          <h4 className={styles.sectionLabel}>Боевой журнал</h4>
          <div className={styles.logScroll}>
            {combatLog.map((entry) => (
              <div key={entry.turn} className={styles.logEntry}>
                <span className={styles.logTurn}>Раунд {entry.turn}</span>
                <div className={styles.logDamages}>
                  <span className={styles.dmgGreen}>
                    &minus;{entry.attackerDamage} HP врагу
                  </span>
                  <span className={styles.dmgSep}>{'\u2022'}</span>
                  <span className={styles.dmgRed}>
                    &minus;{entry.defenderDamage} HP вам
                  </span>
                </div>
                <div className={styles.logHp}>
                  <span>Враг: {entry.defenderHp} HP</span>
                  <span>Вы: {entry.attackerHp} HP</span>
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
            {won ? 'Забрать добычу' : 'Продолжить'}
          </Button>
        </div>
      </div>
    </div>
  );
}
