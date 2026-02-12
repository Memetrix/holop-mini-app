import type { ReactNode } from 'react';
import styles from './Screen.module.css';

interface ScreenProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  noPadding?: boolean;
}

export function Screen({ children, className = '', scrollable = true, noPadding = false }: ScreenProps) {
  return (
    <div
      className={`${styles.screen} ${scrollable ? styles.scrollable : ''} ${noPadding ? '' : styles.padded} ${className}`}
    >
      {children}
    </div>
  );
}
