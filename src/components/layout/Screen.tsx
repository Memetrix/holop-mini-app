import type { ReactNode } from 'react';
import styles from './Screen.module.css';

interface ScreenProps {
  children: ReactNode;
  className?: string;
  scrollable?: boolean;
  noPadding?: boolean;
  header?: ReactNode;
}

export function Screen({ children, className = '', scrollable = true, noPadding = false, header }: ScreenProps) {
  return (
    <div
      className={`${styles.screen} ${scrollable ? styles.scrollable : ''} ${noPadding ? '' : styles.padded} ${className}`}
    >
      {header}
      {children}
    </div>
  );
}
