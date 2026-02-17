/**
 * Courtyard ("Двор") Layout Configuration
 * Defines positions and assets for 7 interactive objects in the PixiJS courtyard scene.
 * All positions are normalized (0-1) fractions of the scene viewport.
 */

export interface CourtyardItem {
  id: string;
  labelRu: string;
  labelEn: string;
  assetKey: string;
  /** X position as fraction of scene width (0 = left, 1 = right) */
  xPercent: number;
  /** Y position as fraction of scene height (0 = top, 1 = bottom) */
  yPercent: number;
  /** Base sprite size in px (at 375px reference width) */
  baseSize: number;
  /** Animation phase offset (radians) */
  animPhase: number;
}

/**
 * Horseshoe arrangement:
 *
 *              [Treasury/Bank]           ← center-top, largest
 *            /                 \
 *      [Kingdoms]           [Office]     ← mid-left / mid-right
 *          |                    |
 *     [Daily Bonus]       [Rankings]     ← lower-left / lower-right
 *            \                 /
 *       [Achievements]   [Seasons]       ← bottom row
 */
export const COURTYARD_ITEMS: CourtyardItem[] = [
  { id: 'bank',         labelRu: 'Казна',       labelEn: 'Treasury',     assetKey: 'palace/zolotoy_kovcheg',       xPercent: 0.50, yPercent: 0.12, baseSize: 72, animPhase: 0 },
  { id: 'clan',         labelRu: 'Княжества',   labelEn: 'Kingdoms',     assetKey: 'ui_main/ui_knyazhestva',       xPercent: 0.22, yPercent: 0.30, baseSize: 58, animPhase: 1.2 },
  { id: 'office',       labelRu: 'Палата',      labelEn: 'Office',       assetKey: 'ui_territory/ui_palace',       xPercent: 0.78, yPercent: 0.30, baseSize: 58, animPhase: 2.4 },
  { id: 'daily',        labelRu: 'Бонус',       labelEn: 'Bonus',        assetKey: 'ui_main/ui_bonus',             xPercent: 0.22, yPercent: 0.52, baseSize: 56, animPhase: 3.6 },
  { id: 'leaderboard',  labelRu: 'Рейтинги',    labelEn: 'Rankings',     assetKey: 'ui_main/ui_ratings',           xPercent: 0.78, yPercent: 0.52, baseSize: 56, animPhase: 4.8 },
  { id: 'achievements', labelRu: 'Достижения',  labelEn: 'Achievements', assetKey: 'ui_territory/ui_achievements', xPercent: 0.35, yPercent: 0.73, baseSize: 54, animPhase: 6.0 },
  { id: 'seasons',      labelRu: 'Сезоны',      labelEn: 'Seasons',      assetKey: 'ui_ratings/ui_seasonal',       xPercent: 0.65, yPercent: 0.73, baseSize: 54, animPhase: 7.2 },
];
