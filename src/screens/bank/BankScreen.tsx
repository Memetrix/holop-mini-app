/**
 * HOLOP Bank/Treasury Screen — Silver deposits with daily interest
 * Matches bot structure: bank_silver_section, bank_show_deposit, bank_show_withdraw, bank_collect_bonus
 * See PROJECT_MAP.md §8 "Казна"
 */

import { useState, type ReactNode } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';
import { useHaptics } from '@/hooks/useHaptics';
import { formatNumber } from '@/hooks/useFormatNumber';
import { GAME } from '@/config/constants';
import styles from './BankScreen.module.css';

// ─── Helpers ───

function calculateCurrentInterest(depositedSilver: number, depositedAt: string | null): number {
  if (!depositedAt || depositedSilver <= 0) return 0;
  const daysPassed = Math.min(
    (Date.now() - new Date(depositedAt).getTime()) / (1000 * 60 * 60 * 24),
    GAME.BANK_MAX_DEPOSIT_HOURS / 24,
  );
  return Math.min(
    Math.floor(depositedSilver * GAME.BANK_INTEREST_RATE_PER_DAY * daysPassed),
    GAME.BANK_MAX_INTEREST_PER_DAY,
  );
}

function formatTimeSinceDeposit(depositedAt: string | null, lang: string = 'ru'): string {
  if (!depositedAt) return '—';
  const ms = Date.now() - new Date(depositedAt).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const mins = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (lang === 'ru') {
    if (hours >= 24) return `${Math.floor(hours / 24)}д ${hours % 24}ч`;
    if (hours > 0) return `${hours}ч ${mins}м`;
    return `${mins}м`;
  }
  if (hours >= 24) return `${Math.floor(hours / 24)}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

// ─── Deposit Amount Presets ───
const DEPOSIT_PRESETS = [0.25, 0.50, 0.75, 1.0];

export function BankScreen({ header }: { header?: ReactNode } = {}) {
  const user = useGameStore((s) => s.user);
  const bank = useGameStore((s) => s.bank);
  const unlockBank = useGameStore((s) => s.unlockBank);
  const depositToBank = useGameStore((s) => s.depositToBank);
  const withdrawFromBank = useGameStore((s) => s.withdrawFromBank);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');

  const currentInterest = calculateCurrentInterest(bank.depositedSilver, bank.depositedAt);
  const totalValue = bank.depositedSilver + currentInterest;

  const handleUnlock = () => {
    const ok = unlockBank();
    if (ok) haptics.success();
    else haptics.error();
  };

  const handleDeposit = () => {
    const amount = parseInt(depositAmount, 10);
    if (isNaN(amount) || amount < GAME.BANK_MIN_DEPOSIT) {
      haptics.error();
      return;
    }
    const ok = depositToBank(amount);
    if (ok) {
      haptics.success();
      setDepositAmount('');
      setShowDeposit(false);
    } else {
      haptics.error();
    }
  };

  const handlePreset = (fraction: number) => {
    const amount = Math.floor(user.silver * fraction);
    setDepositAmount(amount.toString());
  };

  const handleWithdraw = () => {
    const result = withdrawFromBank();
    if (result.silver > 0 || result.interest > 0) haptics.success();
    else haptics.error();
  };

  // ─── Locked State ───
  if (!bank.unlocked) {
    return (
      <Screen header={header}>
        <div className={styles.lockedCard}>
          <div className={styles.lockedIcon}><Icon name="bank" size={48} /></div>
          <h2 className={styles.lockedTitle}>
            {language === 'ru' ? 'Казна' : 'Treasury'}
          </h2>
          <p className={styles.lockedDesc}>
            {language === 'ru'
              ? 'Открой казну и получай проценты на вложенное серебро! До 10% в день.'
              : 'Unlock the treasury and earn interest on deposited silver! Up to 10% per day.'}
          </p>
          <div className={styles.lockedCost}>
            <CurrencyBadge type="stars" amount={GAME.BANK_UNLOCK_COST_STARS} size="lg" />
          </div>
          <Button
            variant="primary"
            fullWidth
            onClick={handleUnlock}
            disabled={user.stars < GAME.BANK_UNLOCK_COST_STARS}
          >
            {language === 'ru' ? 'Открыть казну' : 'Unlock Treasury'}
          </Button>
          {user.stars < GAME.BANK_UNLOCK_COST_STARS && (
            <p className={styles.insufficientText}>
              {language === 'ru'
                ? `Не хватает ${GAME.BANK_UNLOCK_COST_STARS - user.stars} звёзд`
                : `Need ${GAME.BANK_UNLOCK_COST_STARS - user.stars} more stars`}
            </p>
          )}
        </div>
      </Screen>
    );
  }

  // ─── Unlocked State ───
  return (
    <Screen header={header}>
      {/* Header */}
      <div className={styles.header}>
        <h2 className={styles.screenTitle}>
          <Icon name="bank" size={20} /> {language === 'ru' ? 'Казна' : 'Treasury'}
        </h2>
        <p className={styles.subtitle}>
          {language === 'ru'
            ? `Ставка: ${GAME.BANK_INTEREST_RATE_PER_DAY * 100}% в день • Макс: ${formatNumber(GAME.BANK_MAX_INTEREST_PER_DAY)} в день`
            : `Rate: ${GAME.BANK_INTEREST_RATE_PER_DAY * 100}%/day • Max: ${formatNumber(GAME.BANK_MAX_INTEREST_PER_DAY)}/day`}
        </p>
      </div>

      {/* Balance Overview */}
      <div className={styles.balanceCard}>
        <div className={styles.balanceRow}>
          <span className={styles.balanceLabel}>
            {language === 'ru' ? 'На счету' : 'Deposited'}
          </span>
          <CurrencyBadge type="silver" amount={bank.depositedSilver} />
        </div>
        {bank.depositedSilver > 0 && (
          <>
            <div className={styles.balanceRow}>
              <span className={styles.balanceLabel}>
                {language === 'ru' ? 'Проценты' : 'Interest'}
              </span>
              <span className={styles.interestValue}>+{formatNumber(currentInterest)}</span>
            </div>
            <div className={styles.balanceDivider} />
            <div className={styles.balanceRow}>
              <span className={styles.totalLabel}>
                {language === 'ru' ? 'Итого' : 'Total'}
              </span>
              <CurrencyBadge type="silver" amount={totalValue} size="lg" />
            </div>
            <div className={styles.depositMeta}>
              <span>{language === 'ru' ? 'Время в казне' : 'Time deposited'}: {formatTimeSinceDeposit(bank.depositedAt, language)}</span>
              <span>{language === 'ru' ? 'Макс. время' : 'Max time'}: {GAME.BANK_MAX_DEPOSIT_HOURS}{language === 'ru' ? 'ч' : 'h'}</span>
            </div>
          </>
        )}
      </div>

      {/* Actions */}
      <div className={styles.actionsGrid}>
        <Button
          variant="primary"
          fullWidth
          onClick={() => setShowDeposit(!showDeposit)}
        >
          {language === 'ru' ? 'Вложить' : 'Deposit'}
        </Button>
        <Button
          variant="secondary"
          fullWidth
          onClick={handleWithdraw}
          disabled={bank.depositedSilver <= 0}
        >
          {language === 'ru' ? 'Снять всё' : 'Withdraw All'}
        </Button>
      </div>

      {/* Deposit Panel */}
      {showDeposit && (
        <div className={styles.depositPanel}>
          <h3>{language === 'ru' ? 'Вложить серебро' : 'Deposit Silver'}</h3>
          <p className={styles.depositHint}>
            {language === 'ru'
              ? `Минимум: ${formatNumber(GAME.BANK_MIN_DEPOSIT)} серебра`
              : `Minimum: ${formatNumber(GAME.BANK_MIN_DEPOSIT)} silver`}
          </p>

          <div className={styles.presetRow}>
            {DEPOSIT_PRESETS.map((frac) => (
              <button
                key={frac}
                className={styles.presetBtn}
                onClick={() => handlePreset(frac)}
                disabled={user.silver < GAME.BANK_MIN_DEPOSIT}
              >
                {Math.round(frac * 100)}%
              </button>
            ))}
          </div>

          <div className={styles.inputRow}>
            <input
              type="number"
              className={styles.depositInput}
              value={depositAmount}
              onChange={(e) => setDepositAmount(e.target.value)}
              placeholder={String(GAME.BANK_MIN_DEPOSIT)}
              min={GAME.BANK_MIN_DEPOSIT}
              max={user.silver}
            />
            <Button
              variant="primary"
              size="sm"
              onClick={handleDeposit}
              disabled={!depositAmount || parseInt(depositAmount, 10) < GAME.BANK_MIN_DEPOSIT || parseInt(depositAmount, 10) > user.silver}
            >
              {language === 'ru' ? 'Вложить' : 'Deposit'}
            </Button>
          </div>

          <p className={styles.balanceHint}>
            {language === 'ru' ? 'Доступно' : 'Available'}: {formatNumber(user.silver, 'full')}
          </p>
        </div>
      )}

      {/* Info */}
      <div className={styles.infoCard}>
        <h3>{language === 'ru' ? 'Как работает казна' : 'How Treasury Works'}</h3>
        <ul className={styles.infoList}>
          <li>{language === 'ru' ? `${GAME.BANK_INTEREST_RATE_PER_DAY * 100}% начисляется ежедневно на вклад` : `${GAME.BANK_INTEREST_RATE_PER_DAY * 100}% interest accrues daily`}</li>
          <li>{language === 'ru' ? `Максимум ${formatNumber(GAME.BANK_MAX_INTEREST_PER_DAY)} серебра процентов в день` : `Maximum ${formatNumber(GAME.BANK_MAX_INTEREST_PER_DAY)} silver interest per day`}</li>
          <li>{language === 'ru' ? `Проценты начисляются до ${GAME.BANK_MAX_DEPOSIT_HOURS} часов` : `Interest accrues for up to ${GAME.BANK_MAX_DEPOSIT_HOURS} hours`}</li>
          <li>{language === 'ru' ? `Минимальный вклад: ${formatNumber(GAME.BANK_MIN_DEPOSIT)} серебра` : `Minimum deposit: ${formatNumber(GAME.BANK_MIN_DEPOSIT)} silver`}</li>
        </ul>
      </div>
    </Screen>
  );
}
