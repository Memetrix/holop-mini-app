import { useEffect, type ReactNode } from 'react';
import { useHaptics } from '@/hooks/useHaptics';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const haptics = useHaptics();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      haptics.light();
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen, haptics]);

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={styles.sheet}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.handle} />
        {title && <h3 className={styles.title}>{title}</h3>}
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  );
}
