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
import { LOOTBOXES, getDropChance, RARITY_COLORS } from '@/config/lootboxes';
import type { LootboxDef } from '@/config/lootboxes';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/hooks/useHaptics';
import type { ShopCategory } from '@/store/types';
import styles from './ShopScreen.module.css';

// ─── Tab Definitions ───
interface TabDef {
  key: ShopCategory;
  labelRu: string;
  labelEn: string;
}

const TABS: TabDef[] = [
  { key: 'weapons', labelRu: 'Оружие', labelEn: 'Weapons' },
  { key: 'armor', labelRu: 'Броня', labelEn: 'Armor' },
  { key: 'specials', labelRu: 'Особое', labelEn: 'Special' },
  { key: 'defense', labelRu: 'Защита', labelEn: 'Defense' },
  { key: 'potions', labelRu: 'Зелья', labelEn: 'Potions' },
  { key: 'explosives', labelRu: 'Взрывчатка', labelEn: 'Explosives' },
  { key: 'boosters', labelRu: 'Бустеры', labelEn: 'Boosters' },
  { key: 'lootboxes', labelRu: '📦 Лутбоксы', labelEn: '📦 Lootboxes' },
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
    case 'lootboxes': return []; // Lootboxes render separately
  }
}

function getEffectText(item: AnyItemDef, lang: string = 'ru'): string {
  if ('atkBonus' in item) return `+${item.atkBonus} ATK`;
  if ('defBonus' in item) return `+${item.defBonus} DEF`;
  if ('effect' in item) {
    if ('effectEn' in item && lang !== 'ru') return item.effectEn;
    return item.effect;
  }
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
  const openLootbox = useGameStore((s) => s.openLootbox);
  const language = useGameStore((s) => s.user.language);
  const haptics = useHaptics();

  const [activeTab, setActiveTab] = useState<ShopCategory>('weapons');
  const [purchasedId, setPurchasedId] = useState<string | null>(null);
  const [purchaseBonus, setPurchaseBonus] = useState<string>('');
  const [lootboxResults, setLootboxResults] = useState<{ nameRu: string; nameEn: string; rarity: string; silver?: number }[] | null>(null);
  const [expandedLootbox, setExpandedLootbox] = useState<string | null>(null);

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
      setPurchaseBonus(getEffectText(item, language));
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
        return <span className={styles.equippedBadge}>{language === 'ru' ? 'Экипировано' : 'Equipped'}</span>;
      }
      if (isWeaponOwned(item.id)) {
        return (
          <Button variant="secondary" size="sm" onClick={() => handleEquipWeapon(item.id)}>
            {language === 'ru' ? 'Экипировать' : 'Equip'}
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
        return <span className={styles.equippedBadge}>{language === 'ru' ? 'Экипировано' : 'Equipped'}</span>;
      }
      if (isArmorOwned(item.id)) {
        return (
          <Button variant="secondary" size="sm" onClick={() => handleEquipArmor(item.id)}>
            {language === 'ru' ? 'Экипировать' : 'Equip'}
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
              {language === 'ru' ? 'Активировать' : 'Activate'}
            </Button>
          )}
          {qty > 0 && activeTab === 'specials' && (
            <Button variant="ghost" size="sm" onClick={() => handleActivateDefense(item.id)}>
              {language === 'ru' ? 'Активировать' : 'Activate'}
            </Button>
          )}
          {qty > 0 && activeTab === 'potions' && (
            <Button variant="ghost" size="sm" onClick={() => handleUsePotion(item.id)}>
              {language === 'ru' ? 'Использовать' : 'Use'}
            </Button>
          )}
          {qty > 0 && activeTab === 'boosters' && (
            <Button variant="ghost" size="sm" onClick={() => handleUseCaveBooster(item.id)}>
              {language === 'ru' ? 'Использовать' : 'Use'}
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
        {language === 'ru' ? 'Лавка' : 'Shop'}
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
            {language === 'ru' ? tab.labelRu : tab.labelEn}
          </button>
        ))}
      </div>

      {/* Lootbox Tab */}
      {activeTab === 'lootboxes' ? (
        <div className={styles.itemList}>
          {LOOTBOXES.map((lb: LootboxDef) => {
            return (
              <div key={lb.id} className={styles.lootboxCard}>
                <div className={styles.lootboxHeader}>
                  <span className={styles.lootboxEmoji}>{lb.emoji}</span>
                  <div className={styles.lootboxTitle}>
                    <span className={styles.itemName}>
                      {language === 'ru' ? lb.nameRu : lb.nameEn}
                    </span>
                    <span className={styles.lootboxDesc}>
                      {language === 'ru' ? lb.descRu : lb.descEn}
                    </span>
                  </div>
                </div>

                {/* Purchase buttons */}
                <div className={styles.lootboxActions}>
                  {lb.bulkOptions.map((count) => (
                    <Button
                      key={count}
                      variant="secondary"
                      size="sm"
                      disabled={lb.currency === 'gold'
                        ? user.gold < lb.price * count
                        : user.stars < lb.price * count}
                      onClick={() => {
                        const result = openLootbox(lb.id, count);
                        if (result) {
                          haptics.success();
                          setLootboxResults(result.drops);
                        } else {
                          haptics.error();
                        }
                      }}
                    >
                      ×{count}&nbsp;
                      <CurrencyBadge type={lb.currency === 'gold' ? 'gold' : 'stars'} amount={lb.price * count} size="sm" />
                    </Button>
                  ))}
                </div>

                {/* Drop table toggle */}
                <button
                  className={styles.dropTableToggle}
                  onClick={() => setExpandedLootbox(expandedLootbox === lb.id ? null : lb.id)}
                >
                  {expandedLootbox === lb.id
                    ? (language === 'ru' ? '▲ Скрыть дроп-таблицу' : '▲ Hide drop table')
                    : (language === 'ru' ? '▼ Дроп-таблица' : '▼ Drop table')}
                </button>

                {/* Drop table */}
                {expandedLootbox === lb.id && (
                  <div className={styles.dropTable}>
                    {lb.drops.map((drop) => (
                      <div key={drop.id} className={styles.dropRow}>
                        <span
                          className={styles.dropRarity}
                          style={{ color: RARITY_COLORS[drop.rarity] }}
                        >
                          {language === 'ru' ? drop.nameRu : drop.nameEn}
                        </span>
                        <span className={styles.dropChance}>{getDropChance(lb, drop)}%</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {/* Lootbox results modal */}
          {lootboxResults && (
            <div className={styles.lootboxResults}>
              <h4 className={styles.resultsTitle}>
                {language === 'ru' ? '🎁 Выпало:' : '🎁 You got:'}
              </h4>
              {lootboxResults.map((drop, i) => (
                <div key={i} className={styles.resultItem}>
                  <span style={{ color: RARITY_COLORS[drop.rarity] }}>
                    {language === 'ru' ? drop.nameRu : drop.nameEn}
                  </span>
                  {drop.silver && (
                    <CurrencyBadge type="silver" amount={drop.silver} size="sm" />
                  )}
                </div>
              ))}
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setLootboxResults(null)}
              >
                {language === 'ru' ? 'Закрыть' : 'Close'}
              </Button>
            </div>
          )}
        </div>
      ) : (
        /* Items List */
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
                alt={language === 'ru' ? item.nameRu : item.nameEn}
                className={styles.itemImg}
              />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{language === 'ru' ? item.nameRu : item.nameEn}</span>
                <span className={styles.itemStat}>{getEffectText(item, language)}</span>
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
      )}
    </Screen>
  );
}
