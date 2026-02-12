/**
 * CoinShower - PixiJS 8 fullscreen coin rain animation
 * Plays when the user collects income. Gold coins rain down with physics,
 * a large floating "+amount" text rises and fades. Auto-removes after 2 seconds.
 */

import { useEffect, useRef } from 'react';
import { Application, Graphics, Text, TextStyle } from 'pixi.js';
import { formatNumber } from '@/hooks/useFormatNumber';

interface CoinShowerProps {
  amount: number;
  onComplete: () => void;
  width?: number;
  height?: number;
}

// ── Coin particle ──

interface CoinParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  phase: number;
  phaseSpeed: number;
}

// ── Constants ──

const COIN_OUTER = 0xC8973E;
const COIN_INNER = 0xFFD700;
const DURATION_MS = 2000;
const COIN_COUNT_MIN = 40;
const COIN_COUNT_MAX = 80;
const GRAVITY = 0.15;

export function CoinShower({
  amount,
  onComplete,
  width = window.innerWidth,
  height = window.innerHeight,
}: CoinShowerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyedRef = useRef(false);

  useEffect(() => {
    destroyedRef.current = false;
    const el = containerRef.current;
    if (!el) return;

    let app: Application | null = null;
    let cancelled = false;

    async function run(container: HTMLDivElement) {
      const pixiApp = new Application();
      await pixiApp.init({
        width,
        height,
        backgroundAlpha: 0,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (cancelled || destroyedRef.current) {
        pixiApp.destroy(true);
        return;
      }

      app = pixiApp;
      container.appendChild(pixiApp.canvas as HTMLCanvasElement);

      // ── Spawn coins ──
      const coinCount = COIN_COUNT_MIN + Math.floor(Math.random() * (COIN_COUNT_MAX - COIN_COUNT_MIN));
      const coins: CoinParticle[] = [];

      for (let i = 0; i < coinCount; i++) {
        coins.push({
          x: Math.random() * width,
          y: -10 - Math.random() * height * 0.3,
          vx: (Math.random() - 0.5) * 4,
          vy: 1 + Math.random() * 3,
          radius: 4 + Math.random() * 4,
          phase: Math.random() * Math.PI * 2,
          phaseSpeed: 3 + Math.random() * 4,
        });
      }

      // ── Coin graphics (redrawn each frame) ──
      const coinGfx = new Graphics();
      pixiApp.stage.addChild(coinGfx);

      // ── Floating amount text ──
      const amountStyle = new TextStyle({
        fontSize: 42,
        fontWeight: 'bold',
        fontFamily: 'Neucha, cursive',
        fill: 0xFFD700,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: {
          color: 0x000000,
          blur: 6,
          distance: 2,
          angle: Math.PI / 4,
        },
        align: 'center',
      });
      const amountText = new Text({
        text: `+${formatNumber(amount)}`,
        style: amountStyle,
      });
      amountText.anchor.set(0.5, 0.5);
      amountText.x = width / 2;
      amountText.y = height / 2;
      pixiApp.stage.addChild(amountText);

      // ── Animation state ──
      let elapsed = 0;
      let completeCalled = false;

      pixiApp.ticker.add((ticker) => {
        if (cancelled || destroyedRef.current) return;

        const dt = ticker.deltaMS / 1000;
        elapsed += ticker.deltaMS;

        // ── Update coins ──
        coinGfx.clear();

        for (const coin of coins) {
          coin.vy += GRAVITY;
          coin.x += coin.vx;
          coin.y += coin.vy;
          coin.phase += coin.phaseSpeed * dt;

          // Sparkle alpha
          const sparkle = 0.6 + 0.4 * Math.sin(coin.phase);
          const fadeProgress = Math.min(elapsed / DURATION_MS, 1);
          const alpha = sparkle * (1 - fadeProgress * fadeProgress);

          // Outer circle
          coinGfx.circle(coin.x, coin.y, coin.radius);
          coinGfx.fill({ color: COIN_OUTER, alpha });

          // Inner bright circle
          coinGfx.circle(coin.x, coin.y, coin.radius * 0.6);
          coinGfx.fill({ color: COIN_INNER, alpha });
        }

        // ── Update floating text ──
        const textProgress = Math.min(elapsed / DURATION_MS, 1);
        amountText.y = height / 2 - textProgress * 80;
        amountText.alpha = 1 - textProgress * textProgress;

        // ── Complete ──
        if (elapsed >= DURATION_MS && !completeCalled) {
          completeCalled = true;
          onComplete();
        }
      });
    }

    run(el);

    return () => {
      cancelled = true;
      destroyedRef.current = true;
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      if (el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
    };
  }, [amount, onComplete, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 999,
        pointerEvents: 'none',
        width,
        height,
      }}
    />
  );
}
