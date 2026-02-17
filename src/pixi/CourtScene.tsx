/**
 * HOLOP Interactive Courtyard ("Двор") — PixiJS Scene
 * Medieval courtyard with 7 tappable objects representing game sections.
 * Visually distinct from CityScene: cobblestone ground, stone walls,
 * torchlit atmosphere, static viewport (no pan/zoom).
 */

import { useRef, useEffect } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Texture, Text } from 'pixi.js';
import { getAssetUrl } from '@/config/assets';
import { COURTYARD_ITEMS, type CourtyardItem } from '@/config/courtyardLayout';

// ─── Color Constants ───
const COLOR_BG = 0x1A1008;
const COLOR_GOLD = 0xC8973E;
const COLOR_GOLD_LIGHT = 0xE8C77B;
const COLOR_PARCHMENT = 0xF5ECD7;
const COLOR_TORCH_WARM = 0xFFAA33;
const COLOR_TORCH_HOT = 0xFF8800;
const COLOR_WALL = 0x3D3228;
const COLOR_WALL_BORDER = 0x524638;

const FONT_LABEL = 'Neucha, cursive';
const FONT_TITLE = 'Cormorant Garamond, serif';

// ─── Props ───
interface CourtSceneProps {
  width: number;
  height: number;
  onItemTap: (id: string) => void;
  canClaimDaily: boolean;
  language: 'ru' | 'en';
}

// ─── Seeded pseudo-random ───
function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Procedural Cobblestone Ground ───
function generateCobblestoneCanvas(w: number, h: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  // 1. Base radial gradient — warm torchlight vignette
  const grad = ctx.createRadialGradient(
    w * 0.5, h * 0.38, w * 0.08,
    w * 0.5, h * 0.38, w * 0.85,
  );
  grad.addColorStop(0, '#4A3D2A');   // center: warm brown
  grad.addColorStop(0.35, '#3A2D1A');
  grad.addColorStop(0.7, '#2A1F12');
  grad.addColorStop(1, '#1A1008');   // edges: very dark
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);

  // 2. Cobblestone pattern — staggered rounded rects
  const stoneSize = 18;
  const gap = 2;
  const rng = seededRandom(42);

  ctx.globalCompositeOperation = 'lighter';
  for (let row = 0; row < h / (stoneSize + gap) + 1; row++) {
    const y = row * (stoneSize + gap);
    const offset = row % 2 === 0 ? 0 : stoneSize * 0.5;
    for (let col = -1; col < w / (stoneSize + gap) + 2; col++) {
      const x = col * (stoneSize + gap) + offset;

      // Distance from center for brightness falloff
      const dx = (x - w * 0.5) / (w * 0.5);
      const dy = (y - h * 0.38) / (h * 0.5);
      const dist = Math.sqrt(dx * dx + dy * dy);
      const brightness = Math.max(0, 1 - dist * 0.8) * (0.03 + rng() * 0.04);

      // Slight size variation
      const sw = stoneSize - 2 + rng() * 3;
      const sh = stoneSize - 2 + rng() * 3;

      const r = Math.floor(58 + rng() * 20);
      const g = Math.floor(45 + rng() * 15);
      const b = Math.floor(26 + rng() * 10);

      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${brightness})`;
      ctx.beginPath();
      ctx.roundRect(x + 1, y + 1, sw, sh, 3);
      ctx.fill();
    }
  }
  ctx.globalCompositeOperation = 'source-over';

  // 3. Fine noise grain
  const imageData = ctx.getImageData(0, 0, w, h);
  const data = imageData.data;
  const grainRng = seededRandom(137);
  for (let i = 0; i < data.length; i += 4) {
    const noise = (grainRng() - 0.5) * 8;
    data[i] = Math.min(255, Math.max(0, data[i] + noise));
    data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + noise));
    data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + noise));
  }
  ctx.putImageData(imageData, 0, 0);

  // 4. Central warm glow overlay (additive)
  ctx.globalCompositeOperation = 'lighter';
  const glow = ctx.createRadialGradient(
    w * 0.5, h * 0.35, 0,
    w * 0.5, h * 0.35, w * 0.5,
  );
  glow.addColorStop(0, 'rgba(200, 151, 62, 0.08)');
  glow.addColorStop(0.5, 'rgba(200, 151, 62, 0.03)');
  glow.addColorStop(1, 'rgba(200, 151, 62, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = 'source-over';

  return canvas;
}

// ─── Draw Stone Walls ───
function drawWalls(gfx: Graphics, w: number, h: number) {
  const wallThickness = 28;
  const archWidth = w * 0.28;
  const archHeight = 36;
  const cornerRadius = 6;

  // Top wall
  gfx.roundRect(0, 0, w, wallThickness, cornerRadius);
  gfx.fill({ color: COLOR_WALL, alpha: 0.85 });
  gfx.roundRect(0, 0, w, wallThickness, cornerRadius);
  gfx.stroke({ color: COLOR_WALL_BORDER, width: 1.5, alpha: 0.4 });

  // Left wall
  gfx.roundRect(0, wallThickness, wallThickness, h - wallThickness, cornerRadius);
  gfx.fill({ color: COLOR_WALL, alpha: 0.8 });
  gfx.roundRect(0, wallThickness, wallThickness, h - wallThickness, cornerRadius);
  gfx.stroke({ color: COLOR_WALL_BORDER, width: 1.5, alpha: 0.35 });

  // Right wall
  gfx.roundRect(w - wallThickness, wallThickness, wallThickness, h - wallThickness, cornerRadius);
  gfx.fill({ color: COLOR_WALL, alpha: 0.8 });
  gfx.roundRect(w - wallThickness, wallThickness, wallThickness, h - wallThickness, cornerRadius);
  gfx.stroke({ color: COLOR_WALL_BORDER, width: 1.5, alpha: 0.35 });

  // Bottom wall — left portion
  gfx.roundRect(0, h - wallThickness, (w - archWidth) / 2, wallThickness, cornerRadius);
  gfx.fill({ color: COLOR_WALL, alpha: 0.75 });

  // Bottom wall — right portion
  gfx.roundRect((w + archWidth) / 2, h - wallThickness, (w - archWidth) / 2, wallThickness, cornerRadius);
  gfx.fill({ color: COLOR_WALL, alpha: 0.75 });

  // Arch gateway
  const archCx = w / 2;
  const archTop = h - wallThickness - archHeight * 0.3;
  gfx.moveTo(archCx - archWidth / 2, h);
  gfx.lineTo(archCx - archWidth / 2, archTop);
  gfx.arc(archCx, archTop, archWidth / 2, Math.PI, 0, false);
  gfx.lineTo(archCx + archWidth / 2, h);
  gfx.stroke({ color: COLOR_GOLD, width: 2, alpha: 0.25 });

  // Brick texture on walls (subtle horizontal lines)
  const brickRng = seededRandom(99);
  for (let y = 8; y < wallThickness - 4; y += 8) {
    gfx.moveTo(4, y);
    gfx.lineTo(w - 4, y);
    gfx.stroke({ color: COLOR_WALL_BORDER, width: 0.5, alpha: 0.15 + brickRng() * 0.1 });
  }
}

// ─── Draw Torch Flame (decorative) ───
function drawTorchHolder(gfx: Graphics, x: number, y: number) {
  // Holder bracket
  gfx.roundRect(x - 3, y, 6, 18, 2);
  gfx.fill({ color: 0x5A4A3A, alpha: 0.8 });
  gfx.roundRect(x - 5, y + 14, 10, 4, 2);
  gfx.fill({ color: 0x5A4A3A, alpha: 0.8 });
}

// ─── Glow Pedestal for Objects ───
function createGlowPedestal(radius: number): Graphics {
  const glow = new Graphics();
  // 4 concentric soft rings
  for (let i = 4; i >= 1; i--) {
    const r = radius * (i / 4) * 1.3;
    const a = 0.06 * (1 - i / 5) + 0.02;
    glow.circle(0, 0, r);
    glow.fill({ color: COLOR_GOLD, alpha: a });
  }
  // Inner bright core
  glow.circle(0, 0, radius * 0.4);
  glow.fill({ color: COLOR_GOLD_LIGHT, alpha: 0.06 });
  return glow;
}

// ─── Daily Bonus Highlight Glow ───
function createDailyGlow(radius: number): Graphics {
  const glow = new Graphics();
  for (let i = 5; i >= 1; i--) {
    const r = radius * (i / 5) * 1.6;
    const a = 0.1 * (1 - i / 6) + 0.03;
    glow.circle(0, 0, r);
    glow.fill({ color: 0xFFD700, alpha: a });
  }
  glow.circle(0, 0, radius * 0.8);
  glow.stroke({ color: COLOR_GOLD, width: 2, alpha: 0.5 });
  return glow;
}

// ─── Dust Mote Particle ───
interface DustMote {
  gfx: Graphics;
  x: number;
  y: number;
  baseAlpha: number;
  speed: number;
  drift: number;
  phase: number;
}

function spawnDustMote(w: number, h: number, rng: () => number): DustMote {
  const gfx = new Graphics();
  const radius = 1 + rng() * 1.5;
  gfx.circle(0, 0, radius);
  gfx.fill({ color: COLOR_PARCHMENT, alpha: 1 });

  return {
    gfx,
    x: rng() * w,
    y: rng() * h,
    baseAlpha: 0.08 + rng() * 0.15,
    speed: 0.12 + rng() * 0.2,
    drift: rng() * Math.PI * 2,
    phase: rng() * Math.PI * 2,
  };
}

// ─── Torch Flame Effect ───
interface TorchFlame {
  gfx: Graphics;
  x: number;
  y: number;
}

function createTorchFlame(x: number, y: number): TorchFlame {
  const gfx = new Graphics();
  // Initial draw
  gfx.circle(0, 0, 8);
  gfx.fill({ color: COLOR_TORCH_WARM, alpha: 0.5 });
  gfx.circle(0, -2, 4);
  gfx.fill({ color: COLOR_TORCH_HOT, alpha: 0.4 });
  gfx.x = x;
  gfx.y = y;
  return { gfx, x, y };
}

// ─── Tap Feedback Ring ───
interface TapRing {
  gfx: Graphics;
  life: number;
  maxLife: number;
}

// ─── Object Entry (runtime state) ───
interface ObjectEntry {
  item: CourtyardItem;
  container: Container;
  sprite: Sprite;
  glow: Graphics;
  dailyGlow?: Graphics;
  baseX: number;
  baseY: number;
  tapScale: number;
  tapScaleTarget: number;
}

// ──────────────────────────────────────────────────
// COURT SCENE COMPONENT
// ──────────────────────────────────────────────────

export function CourtScene({ width, height, onItemTap, canClaimDaily, language }: CourtSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onItemTapRef = useRef(onItemTap);

  useEffect(() => { onItemTapRef.current = onItemTap; }, [onItemTap]);

  useEffect(() => {
    if (!containerRef.current || width < 10 || height < 10) return;
    const el = containerRef.current;
    let destroyed = false;
    let appInitialized = false;
    const app = new Application();

    async function setup() {
      if (destroyed) return;
      await app.init({
        width,
        height,
        background: COLOR_BG,
        antialias: true,
        resolution: Math.min(window.devicePixelRatio || 1, 2),
        autoDensity: true,
      });
      if (destroyed) { try { app.destroy(true); } catch {} return; }
      appInitialized = true;
      el.appendChild(app.canvas);

      // ─── Layers ───
      const backgroundLayer = new Container();
      const wallLayer = new Container();
      const objectLayer = new Container();
      const particleLayer = new Container();
      const labelLayer = new Container();

      app.stage.addChild(backgroundLayer);
      app.stage.addChild(wallLayer);
      app.stage.addChild(objectLayer);
      app.stage.addChild(particleLayer);
      app.stage.addChild(labelLayer);

      // Scale factor relative to 375px reference
      const scaleFactor = width / 375;

      // ─── Background: Cobblestone ───
      const bgCanvas = generateCobblestoneCanvas(width, height);
      const bgTexture = Texture.from(bgCanvas);
      const bgSprite = new Sprite(bgTexture);
      backgroundLayer.addChild(bgSprite);

      // ─── Walls ───
      const wallGfx = new Graphics();
      drawWalls(wallGfx, width, height);
      wallLayer.addChild(wallGfx);

      // Torch holders
      const torchHolderGfx = new Graphics();
      drawTorchHolder(torchHolderGfx, 36, 6);
      drawTorchHolder(torchHolderGfx, width - 36, 6);
      wallLayer.addChild(torchHolderGfx);

      // ─── Torch Flames ───
      const torches: TorchFlame[] = [
        createTorchFlame(36, 4),
        createTorchFlame(width - 36, 4),
      ];
      for (const t of torches) particleLayer.addChild(t.gfx);

      // ─── Dust Motes ───
      const dustRng = seededRandom(777);
      const dustMotes: DustMote[] = [];
      for (let i = 0; i < 8; i++) {
        const mote = spawnDustMote(width, height, dustRng);
        mote.gfx.x = mote.x;
        mote.gfx.y = mote.y;
        mote.gfx.alpha = mote.baseAlpha;
        particleLayer.addChild(mote.gfx);
        dustMotes.push(mote);
      }

      // ─── Interactive Objects ───
      const objectEntries: ObjectEntry[] = [];
      const tapRings: TapRing[] = [];

      await document.fonts.ready; // Ensure Neucha is loaded

      for (const item of COURTYARD_ITEMS) {
        if (destroyed) return;

        const cx = item.xPercent * width;
        const cy = item.yPercent * height;
        const size = item.baseSize * scaleFactor;

        const container = new Container();
        container.x = cx;
        container.y = cy;

        // Glow pedestal
        const glow = createGlowPedestal(size * 0.7);
        container.addChild(glow);

        // Daily bonus extra glow
        let dailyGlow: Graphics | undefined;
        if (item.id === 'daily' && canClaimDaily) {
          dailyGlow = createDailyGlow(size * 0.75);
          container.addChild(dailyGlow);
        }

        // Load sprite from CDN
        let sprite: Sprite;
        try {
          const url = getAssetUrl(item.assetKey);
          if (!url) throw new Error('No URL');
          const texture = await Assets.load(url);
          if (destroyed) return;
          sprite = new Sprite(texture);
        } catch {
          // Fallback: draw a placeholder circle
          const fallback = new Graphics();
          fallback.circle(0, 0, size * 0.35);
          fallback.fill({ color: COLOR_GOLD, alpha: 0.3 });
          container.addChild(fallback);
          sprite = new Sprite(); // empty sprite
          sprite.width = 0;
          sprite.height = 0;
        }

        sprite.anchor.set(0.5, 0.5);
        sprite.width = size;
        sprite.height = size;
        container.addChild(sprite);

        // Hit area — make it at least 44px for touch targets
        const hitSize = Math.max(size, 44 * scaleFactor);
        const hitArea = new Graphics();
        hitArea.circle(0, 0, hitSize * 0.6);
        hitArea.fill({ color: 0x000000, alpha: 0.001 }); // nearly invisible
        container.addChild(hitArea);

        // Interactivity
        container.eventMode = 'static';
        container.cursor = 'pointer';
        container.on('pointertap', () => {
          onItemTapRef.current(item.id);

          // Tap feedback: scale bounce
          const entry = objectEntries.find(e => e.item.id === item.id);
          if (entry) entry.tapScaleTarget = 1.15;

          // Tap ring
          const ring = new Graphics();
          ring.circle(0, 0, hitSize * 0.6);
          ring.stroke({ color: COLOR_GOLD_LIGHT, width: 2, alpha: 0.5 });
          ring.x = cx;
          ring.y = cy;
          particleLayer.addChild(ring);
          tapRings.push({ gfx: ring, life: 0.3, maxLife: 0.3 });
        });

        objectLayer.addChild(container);

        // Label text below sprite
        const label = new Text({
          text: language === 'ru' ? item.labelRu : item.labelEn,
          style: {
            fontFamily: FONT_LABEL,
            fontSize: Math.round(12 * scaleFactor),
            fill: COLOR_PARCHMENT,
            align: 'center' as const,
            dropShadow: {
              color: 0x000000,
              blur: 3,
              distance: 1,
              alpha: 0.6,
            },
          },
        });
        label.anchor.set(0.5, 0);
        label.x = cx;
        label.y = cy + size * 0.55 + 4;
        labelLayer.addChild(label);

        objectEntries.push({
          item,
          container,
          sprite,
          glow,
          dailyGlow,
          baseX: cx,
          baseY: cy,
          tapScale: 1,
          tapScaleTarget: 1,
        });
      }

      // ─── "Двор" / "Court" Title at Top ───
      const titleText = new Text({
        text: language === 'ru' ? 'Двор' : 'Court',
        style: {
          fontFamily: FONT_TITLE,
          fontSize: Math.round(20 * scaleFactor),
          fill: COLOR_GOLD_LIGHT,
          align: 'center' as const,
          dropShadow: {
            color: 0x000000,
            blur: 6,
            distance: 2,
            alpha: 0.7,
          },
        },
      });
      titleText.anchor.set(0.5, 0);
      titleText.x = width / 2;
      titleText.y = 34;
      labelLayer.addChild(titleText);

      // ──────────────────────────────────────
      // TICKER — Animation Loop
      // ──────────────────────────────────────
      app.ticker.add((ticker) => {
        if (destroyed) return;
        const dt = ticker.deltaTime;
        const time = performance.now() / 1000;

        // ─── Object Idle Animations ───
        for (const entry of objectEntries) {
          const phase = entry.item.animPhase;

          // Gentle bob
          entry.container.y = entry.baseY + Math.sin(time * 1.0 + phase) * 2.5;

          // Scale breathing + tap bounce
          const breathe = 1 + Math.sin(time * 0.7 + phase) * 0.006;
          // Tap bounce ease-back
          if (entry.tapScale !== entry.tapScaleTarget) {
            if (entry.tapScaleTarget > 1) {
              entry.tapScale += (entry.tapScaleTarget - entry.tapScale) * 0.3;
              if (entry.tapScale > 1.12) entry.tapScaleTarget = 1; // snap back
            } else {
              entry.tapScale += (1 - entry.tapScale) * 0.1;
              if (Math.abs(entry.tapScale - 1) < 0.002) entry.tapScale = 1;
            }
          }
          const totalScale = breathe * entry.tapScale;
          entry.container.scale.set(totalScale);

          // Glow pulse
          entry.glow.alpha = 0.5 + 0.3 * Math.sin(time * 0.6 + phase);

          // Daily bonus special pulse
          if (entry.dailyGlow) {
            entry.dailyGlow.alpha = 0.5 + 0.5 * Math.sin(time * 3.0 + phase);
            entry.dailyGlow.scale.set(1 + 0.06 * Math.sin(time * 3.0 + phase));
          }
        }

        // ─── Torch Flames ───
        for (const torch of torches) {
          torch.gfx.alpha = 0.55 + Math.random() * 0.35;
          torch.gfx.scale.set(0.9 + Math.random() * 0.2);
          torch.gfx.y = torch.y + (Math.random() - 0.5) * 2;
        }

        // ─── Dust Motes ───
        for (const mote of dustMotes) {
          mote.y -= mote.speed * dt;
          mote.x += Math.sin(time * 0.4 + mote.phase) * 0.12 * dt;
          mote.gfx.alpha = mote.baseAlpha * (0.6 + 0.4 * Math.sin(time * 0.8 + mote.drift));

          // Recycle when off-screen
          if (mote.y < -10) {
            mote.y = height + 10;
            mote.x = dustRng() * width;
          }
          if (mote.x < -10) mote.x = width + 10;
          if (mote.x > width + 10) mote.x = -10;

          mote.gfx.x = mote.x;
          mote.gfx.y = mote.y;
        }

        // ─── Tap Rings ───
        for (let i = tapRings.length - 1; i >= 0; i--) {
          const ring = tapRings[i];
          ring.life -= dt / 60;
          const progress = 1 - ring.life / ring.maxLife;
          ring.gfx.alpha = Math.max(0, 0.5 * (1 - progress));
          ring.gfx.scale.set(1 + progress * 0.3);
          if (ring.life <= 0) {
            particleLayer.removeChild(ring.gfx);
            ring.gfx.destroy();
            tapRings.splice(i, 1);
          }
        }
      });
    }

    setup().catch(console.error);

    return () => {
      destroyed = true;
      if (appInitialized) {
        try { app.destroy(true, { children: true }); } catch {}
      }
      while (el.firstChild) el.removeChild(el.firstChild);
    };
  }, [width, height, canClaimDaily, language]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        overflow: 'hidden',
        touchAction: 'none',
      }}
    />
  );
}
