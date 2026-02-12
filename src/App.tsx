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

  return (
    <>
      <TopBar />
      <ScreenRouter />
      <TabBar />
      <ToastContainer />
    </>
  );
}
