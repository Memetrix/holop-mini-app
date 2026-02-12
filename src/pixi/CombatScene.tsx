/**
 * CombatScene - PixiJS 8 cinematic battle replay
 * Visualizes a combat sequence between player and opponent with
 * enter animations, per-round attacks, damage numbers, and result display.
 */

import { useEffect, useRef } from 'react';
import { Application, Assets, Container, Graphics, Sprite, Text, TextStyle } from 'pixi.js';
import type { BattleResult } from '@/store/types';
import { getAssetUrl } from '@/config/assets';
import { theme } from '@/config/theme';

interface CombatSceneProps {
  playerAssetKey: string;
  opponentAssetKey: string;
  result: BattleResult;
  onComplete: () => void;
  width?: number;
  height?: number;
}

// ── Easing helpers ──

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

function easeOutCubic(t: number): number {
  return 1 - Math.pow(1 - t, 3);
}

function easeOutQuad(t: number): number {
  return 1 - (1 - t) * (1 - t);
}

function easeInBack(t: number): number {
  const c = 1.70158;
  return (c + 1) * t * t * t - c * t * t;
}

// ── Particle type ──

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: number;
  alpha: number;
}

// ── Animation phases ──

const ENTER_DURATION = 1.0;
const ROUND_DURATION = 0.8;
const RESULT_DURATION = 1.5;

// ── Component ──

export function CombatScene({
  playerAssetKey,
  opponentAssetKey,
  result,
  onComplete,
  width = 375,
  height = 400,
}: CombatSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const destroyedRef = useRef(false);

  // Store callbacks/values in refs to avoid re-mounting PixiJS on every parent render
  const onCompleteRef = useRef(onComplete);
  useEffect(() => { onCompleteRef.current = onComplete; }, [onComplete]);

  const resultRef = useRef(result);
  useEffect(() => { resultRef.current = result; }, [result]);

  useEffect(() => {
    destroyedRef.current = false;
    const container = containerRef.current;
    if (!container) return;

    let app: Application | null = null;
    let cancelled = false;

    async function run(el: HTMLDivElement) {
      // ── Init PixiJS ──
      const pixiApp = new Application();
      await pixiApp.init({
        width,
        height,
        backgroundAlpha: 1,
        background: theme.pixi.bgDark,
        antialias: true,
        resolution: window.devicePixelRatio || 1,
        autoDensity: true,
      });

      if (cancelled || destroyedRef.current) {
        pixiApp.destroy(true);
        return;
      }

      app = pixiApp;
      el.appendChild(pixiApp.canvas as HTMLCanvasElement);

      // ── Load textures ──
      const playerUrl = getAssetUrl(playerAssetKey);
      const opponentUrl = getAssetUrl(opponentAssetKey);

      const [playerTex, opponentTex] = await Promise.all([
        playerUrl ? Assets.load(playerUrl) : Promise.resolve(null),
        opponentUrl ? Assets.load(opponentUrl) : Promise.resolve(null),
      ]);

      if (cancelled || destroyedRef.current) return;

      // ── Background vignette ──
      const vignette = new Graphics();
      vignette.rect(0, 0, width, height);
      vignette.fill({ color: theme.pixi.bgDark });
      // Radial darkening at edges
      const vignetteOverlay = new Graphics();
      vignetteOverlay.rect(0, 0, width, height);
      vignetteOverlay.fill({ color: 0x000000 });
      vignetteOverlay.alpha = 0.3;
      pixiApp.stage.addChild(vignette);
      pixiApp.stage.addChild(vignetteOverlay);

      // Ground line
      const groundY = height * 0.72;
      const groundLine = new Graphics();
      groundLine.moveTo(0, groundY);
      groundLine.lineTo(width, groundY);
      groundLine.stroke({ color: theme.pixi.goldDark, width: 1, alpha: 0.3 });
      pixiApp.stage.addChild(groundLine);

      // ── Sprite setup ──
      const spriteSize = Math.min(width * 0.3, 120);
      const playerRestX = width * 0.22;
      const opponentRestX = width * 0.78;
      const spriteY = groundY - spriteSize * 0.5;

      const playerSprite = new Sprite(playerTex ?? undefined);
      playerSprite.anchor.set(0.5, 0.5);
      playerSprite.width = spriteSize;
      playerSprite.height = spriteSize;
      playerSprite.y = spriteY;
      playerSprite.x = -spriteSize; // start off-screen left

      const opponentSprite = new Sprite(opponentTex ?? undefined);
      opponentSprite.anchor.set(0.5, 0.5);
      opponentSprite.width = spriteSize;
      opponentSprite.height = spriteSize;
      opponentSprite.y = spriteY;
      opponentSprite.x = width + spriteSize; // start off-screen right
      opponentSprite.scale.x = -Math.abs(opponentSprite.scale.x); // face left

      pixiApp.stage.addChild(playerSprite);
      pixiApp.stage.addChild(opponentSprite);

      // ── Overlay containers ──
      const effectsContainer = new Container();
      pixiApp.stage.addChild(effectsContainer);
      const uiContainer = new Container();
      pixiApp.stage.addChild(uiContainer);

      // ── Particle system ──
      const particles: Particle[] = [];
      const particleGraphics = new Graphics();
      effectsContainer.addChild(particleGraphics);

      function spawnSparks(cx: number, cy: number, count: number, color: number) {
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const speed = 40 + Math.random() * 120;
          particles.push({
            x: cx,
            y: cy,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed - 30,
            life: 0.3 + Math.random() * 0.4,
            maxLife: 0.3 + Math.random() * 0.4,
            size: 2 + Math.random() * 3,
            color,
            alpha: 1,
          });
        }
      }

      function spawnGoldRain(count: number) {
        for (let i = 0; i < count; i++) {
          particles.push({
            x: Math.random() * width,
            y: -10 - Math.random() * 50,
            vx: -10 + Math.random() * 20,
            vy: 60 + Math.random() * 100,
            life: 1.5 + Math.random() * 1.0,
            maxLife: 1.5 + Math.random() * 1.0,
            size: 2 + Math.random() * 4,
            color: theme.pixi.gold,
            alpha: 1,
          });
        }
      }

      // ── Floating damage numbers ──
      interface FloatingText {
        text: Text;
        startY: number;
        life: number;
        maxLife: number;
      }
      const floatingTexts: FloatingText[] = [];

      function spawnDamageNumber(x: number, y: number, damage: number) {
        const style = new TextStyle({
          fontSize: 26,
          fontWeight: 'bold',
          fill: theme.pixi.danger,
          stroke: { color: 0x000000, width: 3 },
          dropShadow: {
            color: 0x000000,
            blur: 2,
            distance: 1,
            angle: Math.PI / 4,
          },
        });
        const dmgText = new Text({ text: `-${damage}`, style });
        dmgText.anchor.set(0.5, 0.5);
        dmgText.x = x + (Math.random() - 0.5) * 20;
        dmgText.y = y;
        uiContainer.addChild(dmgText);
        floatingTexts.push({
          text: dmgText,
          startY: y,
          life: 0.8,
          maxLife: 0.8,
        });
      }

      // ── Flash circle (impact effect) ──
      interface FlashCircle {
        x: number;
        y: number;
        life: number;
        maxLife: number;
      }
      const flashCircles: FlashCircle[] = [];
      const flashGraphics = new Graphics();
      effectsContainer.addChild(flashGraphics);

      function spawnFlash(x: number, y: number) {
        flashCircles.push({ x, y, life: 0.25, maxLife: 0.25 });
      }

      // ── Red overlay for defeat ──
      const redOverlay = new Graphics();
      redOverlay.rect(0, 0, width, height);
      redOverlay.fill({ color: theme.pixi.danger });
      redOverlay.alpha = 0;
      pixiApp.stage.addChild(redOverlay);

      // ── Result text ──
      const currentResult = resultRef.current;
      const resultStyle = new TextStyle({
        fontSize: 36,
        fontWeight: 'bold',
        fill: currentResult.won ? theme.pixi.gold : theme.pixi.danger,
        stroke: { color: 0x000000, width: 4 },
        dropShadow: {
          color: 0x000000,
          blur: 4,
          distance: 2,
          angle: Math.PI / 4,
        },
        align: 'center',
      });
      const resultText = new Text({
        text: currentResult.won ? 'ПОБЕДА!' : 'ПОРАЖЕНИЕ',
        style: resultStyle,
      });
      resultText.anchor.set(0.5, 0.5);
      resultText.x = width / 2;
      resultText.y = height * 0.3;
      resultText.alpha = 0;
      resultText.scale.set(0.5);
      uiContainer.addChild(resultText);

      // ── Loot text (shown on victory) ──
      let lootText: Text | null = null;
      if (currentResult.won && (currentResult.silverLooted > 0 || currentResult.goldLooted > 0)) {
        const parts: string[] = [];
        if (currentResult.silverLooted > 0) parts.push(`${currentResult.silverLooted} серебра`);
        if (currentResult.goldLooted > 0) parts.push(`${currentResult.goldLooted} золота`);
        const lootStyle = new TextStyle({
          fontSize: 18,
          fontWeight: 'bold',
          fill: theme.pixi.parchment,
          stroke: { color: 0x000000, width: 2 },
          align: 'center',
        });
        lootText = new Text({
          text: `+${parts.join(', ')}`,
          style: lootStyle,
        });
        lootText.anchor.set(0.5, 0.5);
        lootText.x = width / 2;
        lootText.y = height * 0.3 + 36;
        lootText.alpha = 0;
        uiContainer.addChild(lootText);
      }

      // ── Animation state ──
      type Phase = 'enter' | 'battle' | 'result' | 'done';
      let phase: Phase = 'enter';
      let phaseTime = 0;
      let currentRound = 0;
      // Within a round: 0 = player attacks, 1 = opponent attacks
      let roundStep = 0;
      let roundStepTime = 0;
      let completeCalled = false;

      // ── Main loop ──
      pixiApp.ticker.add((ticker) => {
        if (cancelled || destroyedRef.current) return;

        const dt = ticker.deltaMS / 1000;
        phaseTime += dt;

        // -- Update particles --
        particleGraphics.clear();
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.life -= dt;
          if (p.life <= 0) {
            particles.splice(i, 1);
            continue;
          }
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 150 * dt; // gravity
          const lifeRatio = p.life / p.maxLife;
          p.alpha = lifeRatio;
          particleGraphics.circle(p.x, p.y, p.size * lifeRatio);
          particleGraphics.fill({ color: p.color, alpha: p.alpha });
        }

        // -- Update flash circles --
        flashGraphics.clear();
        for (let i = flashCircles.length - 1; i >= 0; i--) {
          const f = flashCircles[i];
          f.life -= dt;
          if (f.life <= 0) {
            flashCircles.splice(i, 1);
            continue;
          }
          const progress = 1 - f.life / f.maxLife;
          const radius = 10 + progress * 40;
          const alpha = (1 - progress) * 0.8;
          flashGraphics.circle(f.x, f.y, radius);
          flashGraphics.fill({ color: theme.pixi.white, alpha });
        }

        // -- Update floating texts --
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.life -= dt;
          if (ft.life <= 0) {
            uiContainer.removeChild(ft.text);
            ft.text.destroy();
            floatingTexts.splice(i, 1);
            continue;
          }
          const progress = 1 - ft.life / ft.maxLife;
          ft.text.y = ft.startY - progress * 50;
          ft.text.alpha = ft.life / ft.maxLife;
        }

        // ── Phase: ENTER ──
        if (phase === 'enter') {
          const t = Math.min(phaseTime / ENTER_DURATION, 1);
          const ease = easeOutCubic(t);
          playerSprite.x = lerp(-spriteSize, playerRestX, ease);
          opponentSprite.x = lerp(width + spriteSize, opponentRestX, ease);

          if (t >= 1) {
            phase = 'battle';
            phaseTime = 0;
            currentRound = 0;
            roundStep = 0;
            roundStepTime = 0;
          }
        }

        // ── Phase: BATTLE ──
        else if (phase === 'battle') {
          const log = currentResult.combatLog;

          if (currentRound >= log.length) {
            // All rounds done
            phase = 'result';
            phaseTime = 0;
          } else {
            const entry = log[currentRound];
            const halfRound = ROUND_DURATION / 2;
            roundStepTime += dt;

            if (roundStep === 0) {
              // Player attacks opponent
              const t = Math.min(roundStepTime / halfRound, 1);
              const shakeDist = 25;

              if (t < 0.5) {
                // Lunge forward
                const lungeT = easeInBack(t * 2);
                playerSprite.x = lerp(playerRestX, playerRestX + shakeDist, lungeT);
              } else if (t < 0.6) {
                // Snap back & trigger effects
                playerSprite.x = playerRestX;
                if (entry.attackerDamage > 0 && roundStepTime < halfRound * 0.65) {
                  spawnDamageNumber(opponentRestX, spriteY - spriteSize * 0.4, entry.attackerDamage);
                  spawnFlash(opponentRestX - spriteSize * 0.3, spriteY);
                  spawnSparks(opponentRestX - spriteSize * 0.3, spriteY, 8, theme.pixi.goldLight);
                  // Shake opponent
                  opponentSprite.x = opponentRestX + (Math.random() - 0.5) * 8;
                }
              } else {
                playerSprite.x = playerRestX;
                opponentSprite.x = lerp(opponentSprite.x, opponentRestX, 0.2);
              }

              if (t >= 1) {
                playerSprite.x = playerRestX;
                opponentSprite.x = opponentRestX;
                roundStep = 1;
                roundStepTime = 0;
              }
            } else {
              // Opponent attacks player
              const t = Math.min(roundStepTime / halfRound, 1);
              const shakeDist = 25;

              if (t < 0.5) {
                const lungeT = easeInBack(t * 2);
                opponentSprite.x = lerp(opponentRestX, opponentRestX - shakeDist, lungeT);
              } else if (t < 0.6) {
                opponentSprite.x = opponentRestX;
                if (entry.defenderDamage > 0 && roundStepTime < halfRound * 0.65) {
                  spawnDamageNumber(playerRestX, spriteY - spriteSize * 0.4, entry.defenderDamage);
                  spawnFlash(playerRestX + spriteSize * 0.3, spriteY);
                  spawnSparks(playerRestX + spriteSize * 0.3, spriteY, 8, theme.pixi.goldLight);
                  playerSprite.x = playerRestX + (Math.random() - 0.5) * 8;
                }
              } else {
                opponentSprite.x = opponentRestX;
                playerSprite.x = lerp(playerSprite.x, playerRestX, 0.2);
              }

              if (t >= 1) {
                playerSprite.x = playerRestX;
                opponentSprite.x = opponentRestX;
                roundStep = 0;
                roundStepTime = 0;
                currentRound++;
              }
            }
          }
        }

        // ── Phase: RESULT ──
        else if (phase === 'result') {
          const t = Math.min(phaseTime / RESULT_DURATION, 1);

          // Show result text with scale-in
          if (t < 0.4) {
            const scaleT = easeOutQuad(t / 0.4);
            resultText.alpha = scaleT;
            resultText.scale.set(lerp(0.5, 1.0, scaleT));
            if (lootText) lootText.alpha = 0;
          } else {
            resultText.alpha = 1;
            resultText.scale.set(1.0);
            if (lootText) {
              const lootT = Math.min((t - 0.4) / 0.3, 1);
              lootText.alpha = easeOutQuad(lootT);
            }
          }

          if (currentResult.won) {
            // Opponent fades out
            opponentSprite.alpha = lerp(1, 0, easeOutQuad(Math.min(t / 0.6, 1)));

            // Gold rain
            if (phaseTime < 1.2 && Math.random() < 0.4) {
              spawnGoldRain(3);
            }
          } else {
            // Red flash
            if (t < 0.3) {
              redOverlay.alpha = (1 - t / 0.3) * 0.4;
            } else {
              redOverlay.alpha = 0;
            }

            // Player staggers back
            if (t < 0.5) {
              const staggerT = easeOutQuad(t / 0.5);
              playerSprite.x = lerp(playerRestX, playerRestX - 30, staggerT);
              playerSprite.alpha = lerp(1, 0.5, staggerT);
            }
          }

          if (t >= 1) {
            phase = 'done';
            phaseTime = 0;
          }
        }

        // ── Phase: DONE ──
        else if (phase === 'done' && !completeCalled) {
          completeCalled = true;
          onCompleteRef.current();
        }
      });
    }

    run(container);

    return () => {
      cancelled = true;
      destroyedRef.current = true;
      if (app) {
        app.destroy(true, { children: true });
        app = null;
      }
      if (container) {
        while (container.firstChild) {
          container.removeChild(container.firstChild);
        }
      }
    };
  }, [playerAssetKey, opponentAssetKey, width, height]);

  return (
    <div
      ref={containerRef}
      style={{
        width,
        height,
        overflow: 'hidden',
        borderRadius: 12,
        background: theme.colors.bgDark,
      }}
    />
  );
}
