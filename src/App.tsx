import { useEffect } from 'react';
import { TabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameStore } from '@/store/gameStore';

// Lazy screen imports
import { TerritoryScreen } from '@/screens/territory/TerritoryScreen';
import { RaidsScreen } from '@/screens/raids/RaidsScreen';
import { CavesScreen } from '@/screens/caves/CavesScreen';
import { ShopScreen } from '@/screens/shop/ShopScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';

function ScreenRouter() {
  const activeTab = useGameStore((s) => s.activeTab);

  switch (activeTab) {
    case 'territory':
      return <TerritoryScreen />;
    case 'raids':
      return <RaidsScreen />;
    case 'caves':
      return <CavesScreen />;
    case 'shop':
      return <ShopScreen />;
    case 'profile':
      return <ProfileScreen />;
    default:
      return <TerritoryScreen />;
  }
}

export function App() {
  // Start the idle game loop
  useGameLoop();

  // Prevent Telegram WebApp pull-to-close / overscroll bounce
  useEffect(() => {
    const handler = (e: TouchEvent) => {
      // Allow scrolling inside elements that have overflow-y: auto/scroll
      const target = e.target as HTMLElement;
      const scrollable = target.closest('[data-scrollable], .scrollable, [style*="overflow"]');
      if (scrollable) {
        const el = scrollable as HTMLElement;
        const { scrollTop, scrollHeight, clientHeight } = el;
        // At top and trying to scroll up — block
        if (scrollTop <= 0 && e.touches[0].clientY > (handler as unknown as { lastY: number }).lastY) {
          e.preventDefault();
        }
        // At bottom and trying to scroll down — block
        if (scrollTop + clientHeight >= scrollHeight && e.touches[0].clientY < (handler as unknown as { lastY: number }).lastY) {
          e.preventDefault();
        }
        (handler as unknown as { lastY: number }).lastY = e.touches[0].clientY;
        return;
      }
      // No scrollable parent — prevent all overscroll
      e.preventDefault();
    };
    (handler as unknown as { lastY: number }).lastY = 0;

    const trackStart = (e: TouchEvent) => {
      (handler as unknown as { lastY: number }).lastY = e.touches[0].clientY;
    };

    document.addEventListener('touchstart', trackStart, { passive: true });
    document.addEventListener('touchmove', handler, { passive: false });
    return () => {
      document.removeEventListener('touchstart', trackStart);
      document.removeEventListener('touchmove', handler);
    };
  }, []);

  return (
    <>
      <TopBar />
      <ScreenRouter />
      <TabBar />
      <ToastContainer />
    </>
  );
}
