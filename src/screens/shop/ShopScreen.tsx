import { useState, useEffect } from 'react';
import { Screen } from '@/components/layout/Screen';
import { useGameStore } from '@/store/gameStore';
import { getAssetUrl } from '@/config/assets';
import { WEAPONS, ARMOR } from '@/config/weapons';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
import { Button } from '@/components/ui/Button';
import { useHaptics } from '@/hooks/useHaptics';
import styles from './ShopScreen.module.css';

export function ShopScreen() {
  const user = useGameStore((s) => s.user);
  const buyWeapon = useGameStore((s) => s.buyWeapon);
  const buyArmor = useGameStore((s) => s.buyArmor);
  const equipment = useGameStore((s) => s.equipment);
  const haptics = useHaptics();

  const [purchasedId, setPurchasedId] = useState<string | null>(null);
  const [purchaseBonus, setPurchaseBonus] = useState<string>('');

  useEffect(() => {
    if (!purchasedId) return;
    const timer = setTimeout(() => {
      setPurchasedId(null);
      setPurchaseBonus('');
    }, 800);
    return () => clearTimeout(timer);
  }, [purchasedId]);

  const handleBuyWeapon = (weaponId: string, atkBonus: number) => {
    buyWeapon(weaponId);
    haptics.success();
    setPurchasedId(weaponId);
    setPurchaseBonus(`+${atkBonus} ATK`);
  };

  const handleBuyArmor = (armorId: string, defBonus: number) => {
    buyArmor(armorId);
    haptics.success();
    setPurchasedId(armorId);
    setPurchaseBonus(`+${defBonus} DEF`);
  };

  return (
    <Screen>
      <h2 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold-light)', marginBottom: 'var(--space-4)' }}>Лавка</h2>

      {/* Weapons */}
      <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--parchment-dark)', marginBottom: 'var(--space-3)', fontWeight: 600 }}>Оружие</h4>
      <div className={styles.itemList}>
        {WEAPONS.map((weapon) => {
          const isEquipped = equipment.weapon?.id === weapon.id;
          return (
            <div key={weapon.id} className={`${styles.itemCard} ${isEquipped ? styles.equipped : ''} ${purchasedId === weapon.id ? styles.purchasing : ''}`}>
              <img src={getAssetUrl(weapon.assetKey)} alt={weapon.nameRu} className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{weapon.nameRu}</span>
                <span className={styles.itemStat}>+{weapon.atkBonus} ATK</span>
              </div>
              {isEquipped ? (
                <span className={styles.equippedBadge}>Экипировано</span>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => handleBuyWeapon(weapon.id, weapon.atkBonus)} disabled={user.silver < weapon.cost}>
                  <CurrencyBadge type="silver" amount={weapon.cost} size="sm" />
                </Button>
              )}
              {purchasedId === weapon.id && (
                <div className={styles.purchaseOverlay}>
                  <span className={styles.purchaseText}>{purchaseBonus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Armor */}
      <h4 style={{ fontFamily: 'var(--font-heading)', color: 'var(--parchment-dark)', margin: 'var(--space-5) 0 var(--space-3)', fontWeight: 600 }}>Броня</h4>
      <div className={styles.itemList}>
        {ARMOR.map((armor) => {
          const isEquipped = equipment.armor?.id === armor.id;
          return (
            <div key={armor.id} className={`${styles.itemCard} ${isEquipped ? styles.equipped : ''} ${purchasedId === armor.id ? styles.purchasing : ''}`}>
              <img src={getAssetUrl(armor.assetKey)} alt={armor.nameRu} className={styles.itemImg} />
              <div className={styles.itemInfo}>
                <span className={styles.itemName}>{armor.nameRu}</span>
                <span className={styles.itemStat}>+{armor.defBonus} DEF</span>
              </div>
              {isEquipped ? (
                <span className={styles.equippedBadge}>Экипировано</span>
              ) : (
                <Button variant="secondary" size="sm" onClick={() => handleBuyArmor(armor.id, armor.defBonus)} disabled={user.silver < armor.cost}>
                  <CurrencyBadge type="silver" amount={armor.cost} size="sm" />
                </Button>
              )}
              {purchasedId === armor.id && (
                <div className={styles.purchaseOverlay}>
                  <span className={styles.purchaseText}>{purchaseBonus}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Screen>
  );
}
