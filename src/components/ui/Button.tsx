import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import styles from './Button.module.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  icon?: ReactNode;
  loading?: boolean;
  children: ReactNode;
}

export function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  icon,
  loading = false,
  children,
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const haptics = useHaptics();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled || loading) return;
    haptics.medium();
    onClick?.(e);
  };

  return (
    <button
      className={`${styles.button} ${styles[variant]} ${styles[size]} ${fullWidth ? styles.fullWidth : ''} ${loading ? styles.loading : ''}`}
      onClick={handleClick}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <div className={styles.spinner} />
      ) : (
        <>
          {icon && <span className={styles.icon}>{icon}</span>}
          <span className={styles.text}>{children}</span>
        </>
      )}
    </button>
  );
}
