import { useState, useEffect, useMemo } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { getTitleByLevel } from '@/config/titles';
import { GAME } from '@/config/constants';
import { Button } from '@/components/ui/Button';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { BattleScreen } from './BattleScreen';
import styles from './RaidsScreen.module.css';

/** Calculate diminishing factor for a target based on raid history (last 24h). */
function getRecentRaidCount(
  raidHistory: { targetId: number; raidedAt: string }[],
  targetId: number,
): number {
  const now = Date.now();
  return raidHistory.filter(
    (r) => r.targetId === targetId && now - new Date(r.raidedAt).getTime() < 24 * 60 * 60 * 1000,
  ).length;
}

/** Format seconds into M:SS countdown string. */
function formatCooldown(totalSeconds: number): string {
  if (totalSeconds <= 0) return '0:00';
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

export function RaidsScreen() {
  const raidTargets = useGameStore((s) => s.raidTargets);
  const user = useGameStore((s) => s.user);
  const raidHistory = useGameStore((s) => s.raidHistory);
  const refreshTargets = useGameStore((s) => s.refreshRaidTargets);
  const [battleTargetId, setBattleTargetId] = useState<number | null>(null);
  const [cooldownSeconds, setCooldownSeconds] = useState(0);

  const isPvpUnlocked = user.titleLevel >= 6;
  const isTsar = user.titleLevel >= 12;
  const lowHealth = user.health < GAME.PVP_MIN_HEALTH_TO_ATTACK;

  // -- Cooldown timer --
  useEffect(() => {
    function calcRemaining(): number {
      if (!user.raidCooldownUntil) return 0;
      const remaining = Math.ceil(
        (new Date(user.raidCooldownUntil).getTime() - Date.now()) / 1000,
      );
      return Math.max(0, remaining);
    }

    setCooldownSeconds(calcRemaining());
    const interval = setInterval(() => {
      const remaining = calcRemaining();
      setCooldownSeconds(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [user.raidCooldownUntil]);

  const onCooldown = cooldownSeconds > 0;

  // -- Filter out invisible targets --
  const visibleTargets = useMemo(
    () => raidTargets.filter((t) => !t.isInvisible),
    [raidTargets],
  );

  // -- Handle returning from battle with serf capture toast --
  const handleBattleBack = () => {
    setBattleTargetId(null);
  };

  // Wrapper to enter battle that also handles post-raid serf toast
  const handleAttack = (targetId: number) => {
    setBattleTargetId(targetId);
  };

  if (battleTargetId !== null) {
    return (
      <BattleScreen
        targetId={battleTargetId}
        onBack={handleBattleBack}
      />
    );
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

      {/* Tsar flavor restriction */}
      {isTsar && (
        <div className={styles.statusBanner}>
          <span className={styles.statusIcon}>&#128081;</span>
          <span>Царь не ведёт набеги лично</span>
        </div>
      )}

      {/* Cooldown timer display */}
      {!isTsar && onCooldown && (
        <div className={styles.statusBanner}>
          <span className={styles.statusIcon}>&#9203;</span>
          <span>Кулдаун: {formatCooldown(cooldownSeconds)}</span>
        </div>
      )}

      {/* Low health warning */}
      {!isTsar && lowHealth && (
        <div className={`${styles.statusBanner} ${styles.statusDanger}`}>
          <span className={styles.statusIcon}>&#10071;</span>
          <span>Мало здоровья! Минимум {GAME.PVP_MIN_HEALTH_TO_ATTACK} HP</span>
        </div>
      )}

      <div className={styles.targetList}>
        {visibleTargets.map((target) => {
          const title = getTitleByLevel(target.titleLevel);
          const recentCount = getRecentRaidCount(raidHistory, target.id);
          const diminishingFactor = recentCount > 0
            ? Math.pow(GAME.PVP_DIMINISHING_FACTOR, recentCount)
            : 1;

          const isIronDome = target.hasIronDome;
          const canAttack = !isTsar && !onCooldown && !lowHealth && !isIronDome;

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

                {/* Defense indicator badges */}
                <div className={styles.badges}>
                  {isIronDome && (
                    <span className={`${styles.badge} ${styles.badgeRed}`}>Железный купол</span>
                  )}
                  {target.hasStoneWall && (
                    <span className={`${styles.badge} ${styles.badgeBlue}`}>Каменная стена</span>
                  )}
                  {target.hasMoat && (
                    <span className={`${styles.badge} ${styles.badgeCyan}`}>Ров (+50% защиты)</span>
                  )}
                  {/* Diminishing returns warning */}
                  {recentCount > 0 && (
                    <span className={`${styles.badge} ${styles.badgeOrange}`}>
                      Лут: x{diminishingFactor.toFixed(2)}
                    </span>
                  )}
                </div>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleAttack(target.id)}
                disabled={!canAttack}
              >
                {isIronDome ? 'Защищён' : 'Напасть'}
              </Button>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
