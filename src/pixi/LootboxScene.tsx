import { useEffect, useRef } from 'react';
import { Application, Container, Graphics, Text } from 'pixi.js';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface LootReward {
  type: 'silver' | 'gold' | 'stars' | 'item';
  amount?: number;
  label: string;
  assetKey?: string;
}

export interface LootboxSceneProps {
  rewards: LootReward[];
  onComplete: () => void;
  width?: number;
  height?: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PHASE_ANTICIPATION_END = 1500;
const PHASE_BURST_END = 2000;
const PHASE_REVEAL_END = 4000;
const PHASE_TOTAL = 5000;

const COLOR_GOLD = 0xc8973e;
const COLOR_GOLD_BRIGHT = 0xffd700;
const COLOR_WHITE = 0xffffff;
const COLOR_CHEST_BODY = 0x4a2f1a;
const COLOR_CHEST_LID = 0x5c3a20;
const COLOR_CHEST_TRIM = 0xc8973e;

const FONT_FAMILY = 'Neucha, cursive';

/* ------------------------------------------------------------------ */
/*  Particle type                                                      */
/* ------------------------------------------------------------------ */

interface Particle {
  gfx: Graphics;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  gravity: number;
  kind: 'coin' | 'sparkle';
}

/* ------------------------------------------------------------------ */
/*  Helper: random in range                                            */
/* ------------------------------------------------------------------ */

function rand(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/* ------------------------------------------------------------------ */
/*  Helper: bounce ease-out                                            */
/* ------------------------------------------------------------------ */

function bounceOut(t: number): number {
  if (t < 1 / 2.75) {
    return 7.5625 * t * t;
  } else if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  } else if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  }
  const t2 = t - 2.625 / 2.75;
  return 7.5625 * t2 * t2 + 0.984375;
}

/* ------------------------------------------------------------------ */
/*  Build the chest (body + lid + keyhole + trim)                      */
/* ------------------------------------------------------------------ */

function buildChest(cx: number, cy: number) {
  const bodyW = 100;
  const bodyH = 60;
  const lidH = 30;

  const chestContainer = new Container();
  chestContainer.x = cx;
  chestContainer.y = cy;

  // --- Body ---
  const body = new Graphics();
  body.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 6);
  body.fill(COLOR_CHEST_BODY);
  body.roundRect(-bodyW / 2, -bodyH / 2, bodyW, bodyH, 6);
  body.stroke({ color: COLOR_CHEST_TRIM, width: 2 });
  chestContainer.addChild(body);

  // --- Trim lines ---
  const trimLines = new Graphics();
  trimLines.moveTo(-bodyW / 2 + 8, -bodyH / 2 + 15);
  trimLines.lineTo(bodyW / 2 - 8, -bodyH / 2 + 15);
  trimLines.stroke({ color: COLOR_CHEST_TRIM, width: 1.5 });
  trimLines.moveTo(-bodyW / 2 + 8, bodyH / 2 - 10);
  trimLines.lineTo(bodyW / 2 - 8, bodyH / 2 - 10);
  trimLines.stroke({ color: COLOR_CHEST_TRIM, width: 1.5 });
  chestContainer.addChild(trimLines);

  // --- Keyhole ---
  const keyhole = new Graphics();
  keyhole.circle(0, 5, 6);
  keyhole.fill(COLOR_CHEST_TRIM);
  keyhole.rect(-2.5, 11, 5, 10);
  keyhole.fill(COLOR_CHEST_TRIM);
  chestContainer.addChild(keyhole);

  // --- Lid ---
  const lid = new Container();
  lid.x = 0;
  lid.y = -bodyH / 2;
  lid.pivot.set(0, lidH);

  const lidGfx = new Graphics();
  lidGfx.roundRect(-bodyW / 2 - 2, 0, bodyW + 4, lidH, 4);
  lidGfx.fill(COLOR_CHEST_LID);
  lidGfx.roundRect(-bodyW / 2 - 2, 0, bodyW + 4, lidH, 4);
  lidGfx.stroke({ color: COLOR_CHEST_TRIM, width: 2 });
  lid.addChild(lidGfx);

  // lid top trim
  const lidTrim = new Graphics();
  lidTrim.moveTo(-bodyW / 2 + 6, 8);
  lidTrim.lineTo(bodyW / 2 - 6, 8);
  lidTrim.stroke({ color: COLOR_GOLD_BRIGHT, width: 1.5 });
  lid.addChild(lidTrim);

  chestContainer.addChild(lid);

  return { chestContainer, lid };
}

/* ------------------------------------------------------------------ */
/*  Build a reward badge                                               */
/* ------------------------------------------------------------------ */

function buildRewardBadge(reward: LootReward, index: number, total: number, sceneW: number) {
  const badgeContainer = new Container();

  const spacing = Math.min(90, (sceneW - 40) / total);
  const startX = (sceneW - spacing * (total - 1)) / 2;
  badgeContainer.x = startX + index * spacing;
  badgeContainer.y = 0;
  badgeContainer.scale.set(0);
  badgeContainer.alpha = 0;

  // glow behind
  const glow = new Graphics();
  glow.circle(0, 0, 32);
  glow.fill({ color: COLOR_GOLD, alpha: 0.25 });
  badgeContainer.addChild(glow);

  // circle bg
  const circle = new Graphics();
  circle.circle(0, 0, 26);
  circle.fill(0x2a1f12);
  circle.circle(0, 0, 26);
  circle.stroke({ color: COLOR_GOLD, width: 2.5 });
  badgeContainer.addChild(circle);

  // icon text (emoji-style)
  const iconMap: Record<string, string> = {
    silver: '\u{1FA99}',
    gold: '\u{1FA99}',
    stars: '\u2B50',
    item: '\u2694\uFE0F',
  };
  const iconText = new Text({
    text: iconMap[reward.type] ?? '\u{1F381}',
    style: { fontSize: 20, fill: COLOR_WHITE },
  });
  iconText.anchor.set(0.5);
  iconText.y = -2;
  badgeContainer.addChild(iconText);

  // label below
  const labelText = new Text({
    text: reward.label,
    style: {
      fontFamily: FONT_FAMILY,
      fontSize: 14,
      fill: COLOR_WHITE,
      dropShadow: {
        color: COLOR_GOLD,
        blur: 4,
        distance: 0,
        alpha: 0.8,
      },
      align: 'center',
    },
  });
  labelText.anchor.set(0.5, 0);
  labelText.y = 32;
  badgeContainer.addChild(labelText);

  return badgeContainer;
}

/* ------------------------------------------------------------------ */
/*  Spawn particles                                                    */
/* ------------------------------------------------------------------ */

function spawnCoinParticle(
  container: Container,
  cx: number,
  cy: number,
  burst: boolean,
): Particle {
  const gfx = new Graphics();
  const r = rand(2, burst ? 5 : 3);
  const color = Math.random() > 0.5 ? COLOR_GOLD : COLOR_GOLD_BRIGHT;
  gfx.circle(0, 0, r);
  gfx.fill(color);
  gfx.x = cx + rand(-10, 10);
  gfx.y = cy + rand(-10, 10);
  container.addChild(gfx);

  const angle = burst ? rand(0, Math.PI * 2) : rand(-Math.PI, 0);
  const speed = burst ? rand(3, 8) : rand(0.5, 1.5);

  return {
    gfx,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 0,
    maxLife: burst ? rand(800, 1500) : rand(1500, 3000),
    gravity: burst ? 0.04 : 0.01,
    kind: 'coin',
  };
}

function spawnSparkle(
  container: Container,
  cx: number,
  cy: number,
  spread: number,
): Particle {
  const gfx = new Graphics();
  gfx.circle(0, 0, rand(1, 2.5));
  gfx.fill(COLOR_WHITE);
  gfx.x = cx + rand(-spread, spread);
  gfx.y = cy + rand(-spread, spread);
  gfx.alpha = rand(0.3, 1);
  container.addChild(gfx);

  return {
    gfx,
    vx: rand(-0.3, 0.3),
    vy: rand(-0.5, -0.1),
    life: 0,
    maxLife: rand(600, 1600),
    gravity: 0,
    kind: 'sparkle',
  };
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function LootboxScene({
  rewards,
  onComplete,
  width = 375,
  height = 400,
}: LootboxSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const appRef = useRef<Application | null>(null);

  // Store onComplete in a ref to avoid re-mounting PixiJS on every parent render
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let destroyed = false;
    const app = new Application();
    appRef.current = app;

    const boot = async () => {
      await app.init({
        width,
        height,
        backgroundAlpha: 0,
        resolution: window.devicePixelRatio || 2,
        antialias: true,
      });

      if (destroyed) {
        app.destroy(true);
        return;
      }

      const canvas = app.canvas as HTMLCanvasElement;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      el.appendChild(canvas);

      /* ---- Scene graph ---- */
      const root = new Container();
      app.stage.addChild(root);

      const particleLayer = new Container();
      root.addChild(particleLayer);

      const cx = width / 2;
      const cy = height * 0.45;

      // Glow behind chest
      const glowBg = new Graphics();
      glowBg.circle(cx, cy, 80);
      glowBg.fill({ color: COLOR_GOLD, alpha: 0.12 });
      root.addChild(glowBg);

      // Chest
      const { chestContainer, lid } = buildChest(cx, cy);
      root.addChild(chestContainer);

      // Flash overlay
      const flash = new Graphics();
      flash.rect(0, 0, width, height);
      flash.fill(COLOR_WHITE);
      flash.alpha = 0;
      root.addChild(flash);

      // Rewards container
      const rewardsContainer = new Container();
      rewardsContainer.y = cy + 80;
      root.addChild(rewardsContainer);

      const rewardBadges = rewards.map((r, i) =>
        buildRewardBadge(r, i, rewards.length, width),
      );
      for (const badge of rewardBadges) {
        rewardsContainer.addChild(badge);
      }

      /* ---- State ---- */
      const particles: Particle[] = [];
      let elapsed = 0;
      let burstSpawned = false;
      let completeFired = false;

      /* ---- Ticker ---- */
      app.ticker.add((ticker) => {
        if (destroyed) return;

        const dt = ticker.deltaMS;
        elapsed += dt;

        /* -- Update particles -- */
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life += dt;
          p.gfx.x += p.vx;
          p.gfx.y += p.vy;
          p.vy += p.gravity;

          const lifeRatio = p.life / p.maxLife;

          if (p.kind === 'sparkle') {
            // Twinkle
            p.gfx.alpha = (1 - lifeRatio) * (0.5 + 0.5 * Math.sin(p.life * 0.01));
          } else {
            p.gfx.alpha = 1 - lifeRatio;
          }

          if (p.life >= p.maxLife) {
            particleLayer.removeChild(p.gfx);
            p.gfx.destroy();
            particles.splice(i, 1);
          }
        }

        /* ===== Phase 1: Anticipation (0 — 1500ms) ===== */
        if (elapsed < PHASE_ANTICIPATION_END) {
          const t = elapsed / PHASE_ANTICIPATION_END;

          // Wobble with increasing intensity
          const wobbleIntensity = t * 4;
          chestContainer.rotation = Math.sin(elapsed * 0.02) * 0.03 * wobbleIntensity;
          chestContainer.x = cx + Math.sin(elapsed * 0.025) * wobbleIntensity;

          // Glow pulse
          glowBg.alpha = 0.12 + 0.08 * Math.sin(elapsed * 0.005);
          glowBg.scale.set(1 + 0.05 * Math.sin(elapsed * 0.004));

          // Gentle ambient particles
          if (Math.random() < 0.06 + t * 0.08) {
            particles.push(spawnCoinParticle(particleLayer, cx, cy, false));
          }
          if (Math.random() < 0.04) {
            particles.push(spawnSparkle(particleLayer, cx, cy, 60));
          }
        }

        /* ===== Phase 2: Burst (1500 — 2000ms) ===== */
        if (elapsed >= PHASE_ANTICIPATION_END && elapsed < PHASE_BURST_END) {
          const burstT = (elapsed - PHASE_ANTICIPATION_END) / (PHASE_BURST_END - PHASE_ANTICIPATION_END);

          // Lid opens
          lid.rotation = -burstT * 1.2;

          // Flash
          if (burstT < 0.4) {
            flash.alpha = (1 - burstT / 0.4) * 0.7;
          } else {
            flash.alpha = 0;
          }

          // Camera shake
          const shakeIntensity = (1 - burstT) * 6;
          root.x = (Math.random() - 0.5) * shakeIntensity;
          root.y = (Math.random() - 0.5) * shakeIntensity;

          // Burst particles (spawn once)
          if (!burstSpawned) {
            burstSpawned = true;
            for (let i = 0; i < 60; i++) {
              particles.push(spawnCoinParticle(particleLayer, cx, cy - 20, true));
            }
            for (let i = 0; i < 30; i++) {
              particles.push(spawnSparkle(particleLayer, cx, cy - 20, 30));
            }
          }

          // Reset chest wobble
          chestContainer.rotation = 0;
          chestContainer.x = cx;
        }

        /* ===== Phase 3: Reveal (2000 — 4000ms) ===== */
        if (elapsed >= PHASE_BURST_END && elapsed < PHASE_REVEAL_END) {
          // Stop shake
          root.x = 0;
          root.y = 0;

          // Lid stays open
          lid.rotation = -1.2;
          flash.alpha = 0;

          // Reveal rewards one by one
          const revealWindow = PHASE_REVEAL_END - PHASE_BURST_END; // 2000ms
          const perReward = revealWindow / Math.max(rewards.length, 1);

          for (let i = 0; i < rewardBadges.length; i++) {
            const badge = rewardBadges[i];
            const rewardStart = PHASE_BURST_END + i * perReward;
            const rewardElapsed = elapsed - rewardStart;

            if (rewardElapsed > 0) {
              const entryT = Math.min(rewardElapsed / 400, 1);
              const eased = bounceOut(entryT);
              badge.scale.set(eased);
              badge.alpha = Math.min(rewardElapsed / 200, 1);
            }
          }

          // Ongoing sparkles
          if (Math.random() < 0.08) {
            particles.push(spawnSparkle(particleLayer, cx, cy - 30, 80));
          }
        }

        /* ===== Phase 4: Settle (4000 — 5000ms) ===== */
        if (elapsed >= PHASE_REVEAL_END && elapsed < PHASE_TOTAL) {
          root.x = 0;
          root.y = 0;
          lid.rotation = -1.2;

          // All badges fully visible with gentle float
          for (let i = 0; i < rewardBadges.length; i++) {
            const badge = rewardBadges[i];
            badge.scale.set(1);
            badge.alpha = 1;
            badge.y = Math.sin((elapsed + i * 300) * 0.003) * 4;
          }

          // Glow pulse for "collect" area
          glowBg.alpha = 0.15 + 0.1 * Math.sin(elapsed * 0.006);

          // Rare sparkles
          if (Math.random() < 0.03) {
            particles.push(spawnSparkle(particleLayer, cx, cy, 100));
          }
        }

        /* ===== Complete ===== */
        if (elapsed >= PHASE_TOTAL && !completeFired) {
          completeFired = true;
          onCompleteRef.current();
        }
      });
    };

    boot().catch((err: unknown) => {
      console.error('[LootboxScene] init failed:', err);
    });

    return () => {
      destroyed = true;
      const a = appRef.current;
      if (a) {
        try { a.destroy(true, { children: true }); } catch { /* already gone */ }
        appRef.current = null;
      }
      // Force-remove any leftover canvas
      if (el) {
        while (el.firstChild) {
          el.removeChild(el.firstChild);
        }
      }
    };
  }, [width, height, rewards]);

  return <div ref={containerRef} style={{ width, height, overflow: 'hidden' }} />;
}
