import { useState, useEffect, useMemo } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import {
  WEAPONS,
  ARMOR,
  SPECIAL_ITEMS,
  DEFENSE_ITEMS,
  POTIONS,
  EXPLOSIVES,
  CAVE_BOOSTERS,
} from '@/config/weapons';
import type {
  WeaponDef,
  ArmorDef,
  SpecialItemDef,
  DefenseItemDef,
  PotionDef,
  ExplosiveDef,
  CaveBoosterDef,
} from '@/config/weapons';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/hooks/useHaptics';
import type { ShopCategory } from '@/store/types';
import styles from './ShopScreen.module.css';

// ─── Tab Definitions ───
interface TabDef {
  key: ShopCategory;
  label: string;
}

const TABS: TabDef[] = [
  { key: 'weapons', label: 'Оружие' },
  { key: 'armor', label: 'Броня' },
  { key: 'specials', label: 'Особое' },
  { key: 'defense', label: 'Защита' },
  { key: 'potions', label: 'Зелья' },
  { key: 'explosives', label: 'Взрывчатка' },
  { key: 'boosters', label: 'Бустеры' },
];

// ─── Helpers ───

type AnyItemDef =
  | WeaponDef
  | ArmorDef
  | SpecialItemDef
  | DefenseItemDef
  | PotionDef
  | ExplosiveDef
  | CaveBoosterDef;

function getItemsForCategory(category: ShopCategory): AnyItemDef[] {
  switch (category) {
    case 'weapons': return WEAPONS;
    case 'armor': return ARMOR;
    case 'specials': return SPECIAL_ITEMS;
    case 'defense': return DEFENSE_ITEMS;
    case 'potions': return POTIONS;
    case 'explosives': return EXPLOSIVES;
    case 'boosters': return CAVE_BOOSTERS;
  }
}

function getEffectText(item: AnyItemDef): string {
  if ('atkBonus' in item) return `+${item.atkBonus} ATK`;
  if ('defBonus' in item) return `+${item.defBonus} DEF`;
  if ('effect' in item) return item.effect;
  return '';
}

function getCurrencyForUser(
  user: { silver: number; gold: number; stars: number },
  currency: 'silver' | 'gold' | 'stars',
): number {
  return user[currency];
}

// ─── Component ───

export function ShopScreen() {
  const user = useGameStore((s) => s.user);
  const equipment = useGameStore((s) => s.equipment);
  const inventory = useGameStore((s) => s.inventory);
  const buyItem = useGameStore((s) => s.buyItem);
  const equipWeapon = useGameStore((s) => s.equipWeapon);
  const equipArmor = useGameStore((s) => s.equipArmor);
  const activateDefense = useGameStore((s) => s.activateDefense);
  const usePotion = useGameStore((s) => s.usePotion);
  const useCaveBooster = useGameStore((s) => s.useCaveBooster);
  const haptics = useHaptics();

  const [activeTab, setActiveTab] = useState<ShopCategory>('weapons');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);
  const [purchaseBonus, setPurchaseBonus] = useState<string>('');

  // Clear purchase animation after 800ms
  useEffect(() => {
    if (!purchasedId) return;
    const timer = setTimeout(() => {
      setPurchasedId(null);
      setPurchaseBonus('');
    }, 800);
    return () => clearTimeout(timer);
  }, [purchasedId]);

  const items = useMemo(() => getItemsForCategory(activeTab), [activeTab]);

  // ─── Inventory Helpers ───

  const isWeaponOwned = (id: string) => inventory.weapons.includes(id);
  const isArmorOwned = (id: string) => inventory.armor.includes(id);
  const isWeaponEquipped = (id: string) => equipment.weapon?.id === id;
  const isArmorEquipped = (id: string) => equipment.armor?.id === id;

  const getStackableQuantity = (category: ShopCategory, id: string): number => {
    let list: { id: string; quantity: number }[] = [];
    switch (category) {
      case 'specials': list = inventory.specials; break;
      case 'defense': list = inventory.defenses; break;
      case 'potions': list = inventory.potions; break;
      case 'explosives': list = inventory.explosives; break;
      case 'boosters': list = inventory.caveBoosters; break;
      default: return 0;
    }
    return list.find((i) => i.id === id)?.quantity ?? 0;
  };

  // ─── Handlers ───

  const handleBuy = (item: AnyItemDef) => {
    const currency = item.currency as 'silver' | 'gold' | 'stars';
    if (getCurrencyForUser(user, currency) < item.cost) {
      haptics.error();
      return;
    }

    const success = buyItem(activeTab, item.id);
    if (success) {
      haptics.success();
      setPurchasedId(item.id);
      setPurchaseBonus(getEffectText(item));
    } else {
      haptics.error();
    }
  };

  const handleEquipWeapon = (id: string) => {
    equipWeapon(id);
    haptics.success();
  };

  const handleEquipArmor = (id: string) => {
    equipArmor(id);
    haptics.success();
  };

  const handleActivateDefense = (id: string) => {
    const success = activateDefense(id);
    if (success) haptics.success();
    else haptics.error();
  };

  const handleUsePotion = (id: string) => {
    const success = usePotion(id);
    if (success) haptics.success();
    else haptics.error();
  };

  const handleUseCaveBooster = (id: string) => {
    const success = useCaveBooster(id);
    if (success) haptics.success();
    else haptics.error();
  };

  // ─── Render Action Button per category ───

  const renderActionButton = (item: AnyItemDef) => {
    const currency = item.currency as 'silver' | 'gold' | 'stars';
    const canAfford = getCurrencyForUser(user, currency) >= item.cost;

    // --- Weapons ---
    if (activeTab === 'weapons') {
      if (isWeaponEquipped(item.id)) {
        return <span className={styles.equippedBadge}>Экипировано</span>;
      }
      if (isWeaponOwned(item.id)) {
        return (
          <Button variant="secondary" size="sm" onClick={() => handleEquipWeapon(item.id)}>
            Экипировать
          </Button>
        );
      }
      return (
        <Button variant="secondary" size="sm" onClick={() => handleBuy(item)} disabled={!canAfford}>
          <CurrencyBadge type={currency} amount={item.cost} size="sm" />
        </Button>
      );
    }

    // --- Armor ---
    if (activeTab === 'armor') {
      if (isArmorEquipped(item.id)) {
        return <span className={styles.equippedBadge}>Экипировано</span>;
      }
      if (isArmorOwned(item.id)) {
        return (
          <Button variant="secondary" size="sm" onClick={() => handleEquipArmor(item.id)}>
            Экипировать
          </Button>
        );
      }
      return (
        <Button variant="secondary" size="sm" onClick={() => handleBuy(item)} disabled={!canAfford}>
          <CurrencyBadge type={currency} amount={item.cost} size="sm" />
        </Button>
      );
    }

    // --- Stackable categories (specials, defense, potions, explosives, boosters) ---
    const qty = getStackableQuantity(activeTab, item.id);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        {qty > 0 && (
          <span style={{
            fontSize: 11,
            color: 'var(--gold)',
            fontWeight: 600,
            background: 'rgba(200, 151, 62, 0.12)',
            borderRadius: 'var(--radius-sm)',
            padding: '2px 8px',
          }}>
            x{qty}
          </span>
        )}
        <div style={{ display: 'flex', gap: 6 }}>
          {/* Use/Activate buttons for owned items */}
          {qty > 0 && activeTab === 'defense' && (
            <Button variant="ghost" size="sm" onClick={() => handleActivateDefense(item.id)}>
              Активировать
            </Button>
          )}
          {qty > 0 && activeTab === 'specials' && (
            <Button variant="ghost" size="sm" onClick={() => handleActivateDefense(item.id)}>
              Активировать
            </Button>
          )}
          {qty > 0 && activeTab === 'potions' && (
            <Button variant="ghost" size="sm" onClick={() => handleUsePotion(item.id)}>
              Использовать
            </Button>
          )}
          {qty > 0 && activeTab === 'boosters' && (
            <Button variant="ghost" size="sm" onClick={() => handleUseCaveBooster(item.id)}>
              Использовать
            </Button>
          )}
          {/* Buy button always shown for stackable */}
          <Button variant="secondary" size="sm" onClick={() => handleBuy(item)} disabled={!canAfford}>
            <CurrencyBadge type={currency} amount={item.cost} size="sm" />
          </Button>
        </div>
      </div>
    );
  };

  // ─── Render ───

  return (
    <Screen>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: 'var(--space-3)' }}>
        Лавка
      </h2>

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          overflowX: 'auto',
          paddingBottom: 'var(--space-3)',
          marginBottom: 'var(--space-3)',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setActiveTab(tab.key);
              haptics.light();
            }}
            style={{
              flex: '0 0 auto',
              padding: '8px 14px',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-heading)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 150ms ease',
              background: activeTab === tab.key
                ? 'rgba(200, 151, 62, 0.2)'
                : 'var(--glass-bg)',
              color: activeTab === tab.key
                ? 'var(--gold-light)'
                : 'var(--parchment-dark)',
              borderBottom: activeTab === tab.key
                ? '2px solid var(--gold)'
                : '2px solid transparent',
              backdropFilter: 'blur(12px) saturate(1.6)',
              WebkitBackdropFilter: 'blur(12px) saturate(1.6)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div className={styles.itemList}>
        {items.map((item) => (
          <div
            key={item.id}
            className={`${styles.itemCard} ${
              (activeTab === 'weapons' && isWeaponEquipped(item.id)) ||
              (activeTab === 'armor' && isArmorEquipped(item.id))
                ? styles.equipped
                : ''
            } ${purchasedId === item.id ? styles.purchasing : ''}`}
          >
            <img
              src={getAssetUrl(item.assetKey)}
              alt={item.nameRu}
              className={styles.itemImg}
            />
            <div className={styles.itemInfo}>
              <span className={styles.itemName}>{item.nameRu}</span>
              <span className={styles.itemStat}>{getEffectText(item)}</span>
            </div>
            {renderActionButton(item)}
            {purchasedId === item.id && (
              <div className={styles.purchaseOverlay}>
                <span className={styles.purchaseText}>{purchaseBonus}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Screen>
  );
}
