import { useGameStore } from '@/store/gameStore';
import styles from './Toast.module.css';

export function ToastContainer() {
  const toasts = useGameStore((s) => s.toasts);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div key={toast.id} className={`${styles.toast} ${styles[toast.type]}`}>
          <span className={styles.icon}>
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
            {toast.type === 'reward' && '🎁'}
          </span>
          <span className={styles.message}>{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
