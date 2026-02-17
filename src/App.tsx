import { useEffect } from 'react';
import { TabBar } from '@/components/layout/TabBar';
import { TopBar } from '@/components/layout/TopBar';
import { ToastContainer } from '@/components/ui/Toast';
import { useGameLoop } from '@/hooks/useGameLoop';
import { useGameStore } from '@/store/gameStore';
import { BackHeader } from '@/components/ui/BackHeader';

// Lazy screen imports
import { TerritoryScreen } from '@/screens/territory/TerritoryScreen';
import { RaidsScreen } from '@/screens/raids/RaidsScreen';
import { CavesScreen } from '@/screens/caves/CavesScreen';
import { ShopScreen } from '@/screens/shop/ShopScreen';
import { ProfileScreen } from '@/screens/profile/ProfileScreen';
import { SerfScreen } from '@/screens/serfs/SerfScreen';

// Overlay screens (accessible from AvatarDrawer)
import { SettingsScreen } from '@/screens/settings/SettingsScreen';
import { HelpScreen } from '@/screens/help/HelpScreen';
import { ReferralsScreen } from '@/screens/referrals/ReferralsScreen';

function ScreenRouter() {
  const activeTab = useGameStore((s) => s.activeTab);

  switch (activeTab) {
    case 'territory':
      return <TerritoryScreen />;
    case 'serfs':
      return <SerfScreen />;
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

/**
 * Overlay screens — rendered on top of current tab, opened from AvatarDrawer.
 * Back button returns to previous tab (doesn't switch tabs).
 */
function OverlayRouter() {
  const overlayScreen = useGameStore((s) => s.overlayScreen);
  const setOverlayScreen = useGameStore((s) => s.setOverlayScreen);
  const language = useGameStore((s) => s.user.language);

  if (!overlayScreen) return null;

  const goBack = () => setOverlayScreen(null);

  switch (overlayScreen) {
    case 'profile':
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--bg-primary)' }}>
          <ProfileScreen initialSubScreen="profile" onOverlayBack={goBack} />
        </div>
      );
    case 'settings':
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--bg-primary)' }}>
          <SettingsScreen header={<BackHeader onBack={goBack} titleRu="Настройки" titleEn="Settings" language={language} />} />
        </div>
      );
    case 'help':
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--bg-primary)' }}>
          <HelpScreen header={<BackHeader onBack={goBack} titleRu="Помощь" titleEn="Help" language={language} />} />
        </div>
      );
    case 'referrals':
      return (
        <div style={{ position: 'fixed', inset: 0, zIndex: 900, background: 'var(--bg-primary)' }}>
          <ReferralsScreen header={<BackHeader onBack={goBack} titleRu="Рефералы" titleEn="Referrals" language={language} />} />
        </div>
      );
    default:
      return null;
  }
}

export function App() {
  // Start the idle game loop
  useGameLoop();

  // Prevent Telegram WebApp pull-to-close / overscroll bounce
  useEffect(() => {
    let lastY = 0;

    const onTouchStart = (e: TouchEvent) => {
      lastY = e.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!e.cancelable) return;

      const currentY = e.touches[0]?.clientY ?? 0;
      const deltaY = currentY - lastY;

      // Find the nearest scrollable ancestor
      let target = e.target as HTMLElement | null;
      while (target && target !== document.body) {
        const style = window.getComputedStyle(target);
        const overflowY = style.overflowY;
        if (overflowY === 'auto' || overflowY === 'scroll') {
          const { scrollTop, scrollHeight, clientHeight } = target;
          const isAtTop = scrollTop <= 0;
          const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1;

          // Scrolling up at top → block (pull-to-close trigger)
          if (isAtTop && deltaY > 0) {
            e.preventDefault();
            return;
          }
          // Scrolling down at bottom → block (overscroll bounce)
          if (isAtBottom && deltaY < 0) {
            e.preventDefault();
            return;
          }
          // Inside scrollable area with room to scroll → allow
          lastY = currentY;
          return;
        }
        target = target.parentElement;
      }

      // No scrollable parent — block all touch movement to prevent pull-to-close
      e.preventDefault();
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

  return (
    <>
      <TopBar />
      <ScreenRouter />
      <TabBar />
      <OverlayRouter />
      <ToastContainer />
    </>
  );
}
