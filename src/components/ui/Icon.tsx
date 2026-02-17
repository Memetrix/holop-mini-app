/**
 * Icon — renders a WebP icon from the CDN asset map.
 * Replaces all emoji usage in the UI with consistent brandbook icons.
 *
 * Usage:
 *   <Icon name="bank" />              — uses ICON_MAP lookup
 *   <Icon name="bank" size={28} />    — custom size
 *   <Icon name="currencies/gold" />   — direct asset key fallback
 */

import { ICON_MAP } from '@/config/iconMap';
import { getAssetUrl } from '@/config/assets';
import styles from './Icon.module.css';

interface IconProps {
  /** Key from ICON_MAP or direct asset key (e.g. "currencies/gold") */
  name: string;
  /** Icon size in px (default: 20) */
  size?: number;
  /** Additional CSS class */
  className?: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Inline styles */
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, className, alt = '', style }: IconProps) {
  const assetKey = ICON_MAP[name] ?? name;
  const url = getAssetUrl(assetKey);

  if (!url) return null;

  return (
    <img
      src={url}
      alt={alt}
      width={size}
      height={size}
      className={`${styles.icon}${className ? ` ${className}` : ''}`}
      style={style}
      draggable={false}
    />
  );
}
