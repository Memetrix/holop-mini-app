/**
 * HOLOP Asset URL Map
 * Maps asset keys to CDN URLs from blob_urls.json
 */

import blobUrls from '@/data/blob_urls.json';

const assetMap = blobUrls as Record<string, string>;

/**
 * Get CDN URL for an asset by its key.
 * Keys use format: "category/name" (e.g., "buildings/izba", "monsters/volkolak")
 */
export function getAssetUrl(key: string): string {
  const url = assetMap[key];
  if (!url) {
    console.warn(`[HOLOP] Asset not found: ${key}`);
    return '';
  }
  return url;
}

/**
 * Get all assets in a category
 */
export function getAssetsByCategory(category: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const [key, url] of Object.entries(assetMap)) {
    if (key.startsWith(category + '/')) {
      result[key] = url;
    }
  }
  return result;
}

/**
 * Preload an image (returns a Promise)
 */
export function preloadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}

/**
 * Preload multiple assets by keys
 */
export async function preloadAssets(keys: string[]): Promise<void> {
  const urls = keys.map(getAssetUrl).filter(Boolean);
  await Promise.allSettled(urls.map(preloadImage));
}

/** CDN base URL */
export const CDN_BASE = 'https://hvtv6f4jyz7itmqv.public.blob.vercel-storage.com/holop/game/webp/';

/** All asset keys */
export const ALL_ASSET_KEYS = Object.keys(assetMap);

/** Export the raw map for direct access */
export { assetMap };
