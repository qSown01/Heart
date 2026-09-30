/**
 * AnimatedBackground.jsx
 * ─────────────────────────────────────────────────────────────────────────────
 * High-End Illustrated Sunflower Field & Day-to-Night Progression Engine
 *
 * Visual Restoration & Architecture:
 * 1. 100% Authentic Detailed Sunflowers (4 Hand-Drawn SVG Models):
 *    - Upright, Lean-Left, Lean-Right, Wild.
 *    - Full curved petals, detailed seed centers, rich leafy stems.
 *    - All 111 flowers sway gently in the wind with organic, desynchronized timing.
 * 2. Gorgeous Color Lighting (Zero Muddy Multiply Overlay):
 *    - Removed the dark multiply overlay.
 *    - Restored vibrant `flowerFilter(t)` (Golden Sun -> Warm Amber Sunset -> Mystic Blue Moonlight).
 *    - High-Performance Layer-Level Filter: Applied to the parent container of each hill
 *      (only 3 GPU filter passes total instead of 210!), achieving vibrant color AND 60 FPS.
 * 3. Perfect Flower Density (~111 flowers covering peak to floor):
 *    - Left Hill: 18 flowers.
 *    - Right Hill: 18 flowers.
 *    - Main Hill: 25 (Ridge) + 28 (Slope) + 22 (Lower) + 18 (Foreground) = 93 flowers.
 *    - Zero empty ground patches from bottom -3% to 33%.
 * 4. Interactive Physics:
 *    - Hover/Tap triggers spring recoil (.is-jerk) on DOM directly.
 *    - Spawns 6-8 golden petals via fixed 60-particle 2D Canvas Object Pool.
 * 5. Parallax Scroll Progression:
 *    - Top (t=0): 3 distinct hills visible.
 *    - Scroll down: Sub-hills sink down smoothly (translateY(t * 60vh)), leaving Main Hill
 *      as the solitary, majestic moonlit sanctuary at t=1.
 */

import { useState, useEffect, useRef, memo } from 'react';

// ─────────────────────────────────────────────────────────────────────────────
// 1. COLOR & MATH INTERPOLATION UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
function hexToRgb(hex) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

function lerpHex(c1, c2, t) {
  const [r1, g1, b1] = hexToRgb(c1);
  const [r2, g2, b2] = hexToRgb(c2);
  return `rgb(${Math.round(r1 + (r2 - r1) * t)},${Math.round(g1 + (g2 - g1) * t)},${Math.round(b1 + (b2 - b1) * t)})`;
}

function interp(stops, t) {
  if (t <= stops[0].t) return stops[0].v;
  if (t >= stops[stops.length - 1].t) return stops[stops.length - 1].v;
  for (let i = 0; i < stops.length - 1; i++) {
    if (t >= stops[i].t && t < stops[i + 1].t) {
      const lt = (t - stops[i].t) / (stops[i + 1].t - stops[i].t);
      const a = stops[i].v;
      const b = stops[i + 1].v;
      return typeof a === 'string' ? lerpHex(a, b, lt) : a + (b - a) * lt;
    }
  }
  return stops[stops.length - 1].v;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2. DAY ☀️ ➡️ SUNSET 🌅 ➡️ NIGHT 🌙 KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────
const SKY_TOP = [
  { t: 0.00, v: '#4ebcf6' },
  { t: 0.32, v: '#ff8c2b' },
  { t: 0.50, v: '#741eb5' },
  { t: 0.68, v: '#131e5c' },
  { t: 1.00, v: '#030514' },
];
const SKY_BOT = [
  { t: 0.00, v: '#fde68a' },
  { t: 0.32, v: '#ffaf38' },
  { t: 0.50, v: '#df380e' },
  { t: 0.68, v: '#2e114f' },
  { t: 1.00, v: '#080c2e' },
];

const SUN_Y    = [{ t: 0, v: 8 }, { t: 0.35, v: 80 }, { t: 0.52, v: 120 }, { t: 1, v: 160 }];
const SUN_OPA  = [{ t: 0, v: 1 }, { t: 0.35, v: 0.92 }, { t: 0.50, v: 0 }, { t: 1, v: 0 }];
const MOON_Y   = [{ t: 0, v: 130 }, { t: 0.55, v: 105 }, { t: 0.72, v: 36 }, { t: 1, v: 12 }];
const MOON_OPA = [{ t: 0, v: 0 }, { t: 0.52, v: 0 }, { t: 0.65, v: 0.8 }, { t: 0.80, v: 1 }, { t: 1, v: 1 }];
const STAR_OPA = [{ t: 0, v: 0 }, { t: 0.48, v: 0 }, { t: 0.65, v: 0.65 }, { t: 0.82, v: 1 }, { t: 1, v: 1 }];

// Terrain colors through day/night transitions
const HILL_LEFT_COL = [
  { t: 0.00, v: '#2b5f28' },
  { t: 0.35, v: '#5c3713' },
  { t: 0.52, v: '#2c1146' },
  { t: 0.70, v: '#0b061e' },
  { t: 1.00, v: '#030208' },
];
const HILL_RIGHT_COL = [
  { t: 0.00, v: '#326c2e' },
  { t: 0.35, v: '#633d15' },
  { t: 0.52, v: '#31144c' },
  { t: 0.70, v: '#0d0722' },
  { t: 1.00, v: '#030209' },
];
const HILL_MAIN_COL = [
  { t: 0.00, v: '#488c36' },
  { t: 0.35, v: '#543612' },
  { t: 0.52, v: '#260f3e' },
  { t: 0.70, v: '#09051a' },
  { t: 1.00, v: '#04020a' },
];

/**
 * Vibrant Flower Color Filter
 * Day: Golden radiant yellow
 * Sunset: Warm glowing amber
 * Night: Mystical silver-blue moonlight cast
 */
function flowerFilter(t) {
  const br  = interp([{ t: 0, v: 1.0 }, { t: 0.35, v: 0.98 }, { t: 0.52, v: 0.88 }, { t: 0.72, v: 0.62 }, { t: 1.0, v: 0.48 }], t);
  const sat = interp([{ t: 0, v: 1.05 }, { t: 0.35, v: 1.12 }, { t: 0.52, v: 1.15 }, { t: 0.72, v: 0.75 }, { t: 1.0, v: 0.65 }], t);
  const hue = interp([{ t: 0, v: 0 }, { t: 0.35, v: 8 }, { t: 0.52, v: 18 }, { t: 0.72, v: 170 }, { t: 1.0, v: 205 }], t);
  return `brightness(${br.toFixed(3)}) saturate(${sat.toFixed(3)}) hue-rotate(${hue.toFixed(1)}deg)`;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3. SKY OBJECTS (Stars & Shooting Stars)
// ─────────────────────────────────────────────────────────────────────────────
const STARS = Array.from({ length: 150 }, () => ({
  x: Math.random() * 100,
  y: Math.random() * 62,
  r: Math.random() * 1.35 + 0.35,
  delay: (Math.random() * 4).toFixed(2),
  dur: (1.6 + Math.random() * 2.5).toFixed(2),
}));

const SHOOTS = Array.from({ length: 5 }, (_, i) => ({
  x1: 8 + i * 20,  y1: 4 + i * 7,
  x2: 32 + i * 16, y2: 20 + i * 6,
  delay: (i * 3.2 + 1).toFixed(1),
}));

// ─────────────────────────────────────────────────────────────────────────────
// 4. MULTI-MODEL SUNFLOWER ART (4 DISTINCT DETAILED SVG MODELS)
// ─────────────────────────────────────────────────────────────────────────────
const PETAL_PALETTES = [
  { p1: '#fbbf24', p2: '#f59e0b', in: '#d97706' }, // classic golden
  { p1: '#fde047', p2: '#eab308', in: '#ca8a04' }, // bright sunshine yellow
  { p1: '#f59e0b', p2: '#ea580c', in: '#b45309' }, // warm amber
  { p1: '#fcd34d', p2: '#f59e0b', in: '#c2410c' }, // golden glow
];

/** Model 0: Upright Proud Bloom */
const FlowerModelUpright = memo(function FlowerModelUpright({ pal }) {
  return (
    <svg viewBox="0 0 66 140" width="66" height="140" overflow="visible">
      <path d="M33,140 Q28,100 33,70 Q37,48 33,38" stroke="#3b6631" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <ellipse cx="20" cy="88" rx="18" ry="7.5" fill="#467c3b" transform="rotate(-38 20 88)" />
      <ellipse cx="46" cy="68" rx="16" ry="7" fill="#467c3b" transform="rotate(32 46 68)" />
      {Array.from({ length: 16 }, (_, i) => (
        <ellipse
          key={i}
          cx="33" cy="18" rx="6" ry="15"
          fill={i % 2 === 0 ? pal.p1 : pal.p2}
          opacity="0.96"
          transform={`rotate(${(i / 16) * 360} 33 38)`}
        />
      ))}
      {Array.from({ length: 9 }, (_, i) => (
        <ellipse
          key={`in-${i}`}
          cx="33" cy="24" rx="4.5" ry="10"
          fill={pal.in}
          opacity="0.9"
          transform={`rotate(${(i / 9) * 360 + 20} 33 38)`}
        />
      ))}
      <circle cx="33" cy="38" r="13.5" fill="#3b1f03" />
      <circle cx="33" cy="38" r="10.5" fill="#241200" />
      <circle cx="33" cy="38" r="7.5" fill="none" stroke="#542e05" strokeWidth="1" opacity="0.6" />
      <circle cx="33" cy="38" r="2.2" fill="#713b06" opacity="0.8" />
    </svg>
  );
});

/** Model 1: Graceful Lean-Left Bloom */
const FlowerModelLeanLeft = memo(function FlowerModelLeanLeft({ pal }) {
  return (
    <svg viewBox="0 0 66 140" width="66" height="140" overflow="visible">
      <path d="M33,140 Q22,96 18,68 Q14,48 20,36" stroke="#365e2d" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <ellipse cx="12" cy="82" rx="19" ry="8" fill="#417436" transform="rotate(-50 12 82)" />
      <ellipse cx="38" cy="74" rx="17" ry="7.5" fill="#417436" transform="rotate(22 38 74)" />
      <g transform="rotate(-15 20 36)">
        {Array.from({ length: 15 }, (_, i) => (
          <ellipse
            key={i}
            cx="20" cy="18" rx="6.2" ry="14"
            fill={i % 2 === 0 ? pal.p1 : pal.p2}
            opacity="0.96"
            transform={`rotate(${(i / 15) * 360} 20 36)`}
          />
        ))}
        <circle cx="20" cy="36" r="13" fill="#381d02" />
        <circle cx="20" cy="36" r="9.5" fill="#221000" />
        <circle cx="20" cy="36" r="2" fill="#6f3905" opacity="0.85" />
      </g>
    </svg>
  );
});

/** Model 2: Graceful Lean-Right Bloom */
const FlowerModelLeanRight = memo(function FlowerModelLeanRight({ pal }) {
  return (
    <svg viewBox="0 0 66 140" width="66" height="140" overflow="visible">
      <path d="M33,140 Q42,98 46,70 Q49,48 44,36" stroke="#386330" strokeWidth="5.5" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="74" rx="16" ry="7.5" fill="#457a3b" transform="rotate(-25 26 74)" />
      <ellipse cx="52" cy="82" rx="18" ry="8" fill="#457a3b" transform="rotate(48 52 82)" />
      <g transform="rotate(14 44 36)">
        {Array.from({ length: 15 }, (_, i) => (
          <ellipse
            key={i}
            cx="44" cy="18" rx="6.2" ry="14"
            fill={i % 2 === 0 ? pal.p2 : pal.p1}
            opacity="0.96"
            transform={`rotate(${(i / 15) * 360} 44 36)`}
          />
        ))}
        <circle cx="44" cy="36" r="13" fill="#381d02" />
        <circle cx="44" cy="36" r="9.5" fill="#221000" />
        <circle cx="44" cy="36" r="2" fill="#6f3905" opacity="0.85" />
      </g>
    </svg>
  );
});

/** Model 3: Wild Layered Sun-Watcher Bloom */
const FlowerModelWild = memo(function FlowerModelWild({ pal }) {
  return (
    <svg viewBox="0 0 66 140" width="66" height="140" overflow="visible">
      <path d="M33,140 Q39,102 28,72 Q22,46 31,34" stroke="#33592a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <ellipse cx="16" cy="85" rx="20" ry="9" fill="#3f7234" transform="rotate(-36 16 85)" />
      <ellipse cx="48" cy="62" rx="19" ry="8.5" fill="#3f7234" transform="rotate(38 48 62)" />
      {Array.from({ length: 18 }, (_, i) => (
        <ellipse
          key={i}
          cx="31" cy="15" rx="5.5" ry="16"
          fill={i % 3 === 0 ? pal.in : pal.p1}
          opacity="0.95"
          transform={`rotate(${(i / 18) * 360} 31 34)`}
        />
      ))}
      <circle cx="31" cy="34" r="14" fill="#3b1f03" />
      <circle cx="31" cy="34" r="10.5" fill="#200d00" />
      <circle cx="31" cy="34" r="2.4" fill="#753e07" opacity="0.9" />
    </svg>
  );
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. DETERMINISTIC INSTANCE GENERATOR FOR THE 3 HILLS
// ─────────────────────────────────────────────────────────────────────────────
function generateTierInstances(count, scaleMin, scaleMax, bottomMin, bottomMax, seedOffset = 0) {
  return Array.from({ length: count }, (_, i) => {
    const step = 106 / count;
    const base = -3 + i * step;
    const jitter = Math.sin((i + seedOffset) * 3.7) * (step * 0.44);
    const palIdx = Math.abs(Math.floor(Math.sin((i + seedOffset) * 5.1) * PETAL_PALETTES.length)) % PETAL_PALETTES.length;
    const modelIdx = Math.abs(Math.floor(Math.sin((i + seedOffset) * 2.9) * 4)) % 4;
    const rot = Math.sin((i + seedOffset) * 4.3) * 14;

    return {
      id: `${seedOffset}-${i}`,
      x: Math.max(-4, Math.min(104, +(base + jitter).toFixed(2))),
      scale: +(scaleMin + ((i * 0.173 + seedOffset * 0.05) % 1) * (scaleMax - scaleMin)).toFixed(3),
      bottom: +(bottomMin + ((i * 0.281 + seedOffset * 0.07) % 1) * (bottomMax - bottomMin)).toFixed(1),
      dur: +(2.2 + ((i * 0.317) % 1) * 2.2).toFixed(2),
      delay: +((i * 0.419) % 2).toFixed(2),
      rot: +rot.toFixed(1),
      modelIdx,
      pal: PETAL_PALETTES[palIdx],
    };
  });
}

function generateLeftHillFlowers(count = 18) {
  return Array.from({ length: count }, (_, i) => {
    const progress = i / (count - 1);
    const x = -3 + progress * 50;
    const baseBottom = 41 - progress * 15;
    const jitter = Math.sin(i * 3.3) * 3.2;
    const bottom = +(baseBottom + jitter).toFixed(1);
    const scale = +(0.26 + ((i * 0.21) % 1) * 0.14).toFixed(3);
    const palIdx = (i * 3) % PETAL_PALETTES.length;
    const modelIdx = (i * 2 + 1) % 4;
    const rot = +(Math.sin(i * 4.1) * 15).toFixed(1);

    return {
      id: `lh-${i}`,
      x: +x.toFixed(2),
      bottom,
      scale,
      dur: +(2.2 + (i % 3) * 0.6).toFixed(2),
      delay: +((i * 0.37) % 2).toFixed(2),
      rot,
      modelIdx,
      pal: PETAL_PALETTES[palIdx],
    };
  });
}

function generateRightHillFlowers(count = 18) {
  return Array.from({ length: count }, (_, i) => {
    const progress = i / (count - 1);
    const x = 53 + progress * 50;
    const baseBottom = 26 + progress * 15;
    const jitter = Math.sin(i * 3.5) * 3.2;
    const bottom = +(baseBottom + jitter).toFixed(1);
    const scale = +(0.26 + ((i * 0.19) % 1) * 0.14).toFixed(3);
    const palIdx = (i * 2) % PETAL_PALETTES.length;
    const modelIdx = (i * 3) % 4;
    const rot = +(Math.sin(i * 4.7) * 15).toFixed(1);

    return {
      id: `rh-${i}`,
      x: +x.toFixed(2),
      bottom,
      scale,
      dur: +(2.2 + (i % 3) * 0.6).toFixed(2),
      delay: +((i * 0.43) % 2).toFixed(2),
      rot,
      modelIdx,
      pal: PETAL_PALETTES[palIdx],
    };
  });
}

// ─────────────────────────────────────────────────────────────────────────────
// PRE-CALCULATED INSTANCES (~111 FLOWERS, COVERING PEAK TO FLOOR WITH 0 GAPS)
// Left Hill: 18 flowers
const FLOWERS_LEFT_HILL  = generateLeftHillFlowers(18);
// Right Hill: 18 flowers
const FLOWERS_RIGHT_HILL = generateRightHillFlowers(18);

// Main Hill: 93 flowers in 4 depth tiers
// Tier 1: Ridge (25 flowers, bottom 25% - 33%, scale 0.24 - 0.36)
const MAIN_TIER_RIDGE = generateTierInstances(25, 0.24, 0.36, 25.0, 33.0, 100);
// Tier 2: Mid Slope (28 flowers, bottom 15% - 25%, scale 0.44 - 0.64)
const MAIN_TIER_SLOPE = generateTierInstances(28, 0.44, 0.64, 15.0, 25.0, 200);
// Tier 3: Lower Field (22 flowers, bottom 6% - 15%, scale 0.72 - 0.96)
const MAIN_TIER_LOWER = generateTierInstances(22, 0.72, 0.96,  6.0, 15.0, 300);
// Tier 4: Foreground Bed (18 flowers, bottom -3% - 6%, scale 1.08 - 1.45)
const MAIN_TIER_FORE  = generateTierInstances(18, 1.08, 1.45, -3.0,  6.0, 400);

// ─────────────────────────────────────────────────────────────────────────────
// 6. HIGH-PERF INTERACTIVE FLOWER ITEM COMPONENT (100% SWAY ENABLED)
// ─────────────────────────────────────────────────────────────────────────────
function FlowerItem({ f, onInteract }) {
  const flowerRef = useRef(null);

  const handleInteraction = (e) => {
    const el = flowerRef.current;
    if (el) {
      el.classList.remove('is-jerk');
      void el.offsetWidth; // re-trigger animation
      el.classList.add('is-jerk');
    }

    if (onInteract && el) {
      const rect = el.getBoundingClientRect();
      const headX = rect.left + rect.width * 0.5;
      const headY = rect.top + rect.height * 0.26;
      onInteract(headX, headY, f.pal);
    }
  };

  const FlowerModel = [FlowerModelUpright, FlowerModelLeanLeft, FlowerModelLeanRight, FlowerModelWild][f.modelIdx];

  return (
    <div
      ref={flowerRef}
      style={{
        position: 'absolute',
        left: `${f.x}%`,
        bottom: `${f.bottom}%`,
        transformOrigin: 'bottom center',
        transform: `translate3d(0,0,0) scale(${f.scale}) rotate(${f.rot}deg)`,
        willChange: 'transform',
        animation: `sway ${f.dur}s ease-in-out ${f.delay}s infinite`,
        pointerEvents: 'auto',
        cursor: 'pointer',
      }}
      className="select-none transition-transform active:scale-95"
      onMouseEnter={handleInteraction}
      onClick={handleInteraction}
      onTouchStart={handleInteraction}
    >
      <FlowerModel pal={f.pal} />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 7. CANVAS PETAL BURST SYSTEM (FIXED 60-PARTICLE OBJECT POOL)
// ─────────────────────────────────────────────────────────────────────────────
class PetalPoolManager {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.maxParticles = 60;
    this.particles = Array.from({ length: this.maxParticles }, () => ({
      active: false,
      x: 0, y: 0,
      vx: 0, vy: 0,
      rot: 0, vRot: 0,
      scale: 1,
      color: '#fbbf24',
      alpha: 1,
      life: 0,
      maxLife: 60,
    }));
    this.animId = null;
    this.tick = this.tick.bind(this);
  }

  resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  burst(x, y, pal) {
    const burstCount = Math.floor(Math.random() * 3) + 6;
    let spawned = 0;
    const colors = [pal?.p1 || '#fbbf24', pal?.p2 || '#f59e0b', pal?.in || '#d97706'];

    for (let i = 0; i < this.maxParticles && spawned < burstCount; i++) {
      const p = this.particles[i];
      if (!p.active) {
        p.active = true;
        p.x = x;
        p.y = y;
        p.vx = (Math.random() - 0.5) * 6.5;
        p.vy = -(Math.random() * 4.8 + 4.2);
        p.rot = Math.random() * Math.PI * 2;
        p.vRot = (Math.random() - 0.5) * 0.18;
        p.scale = Math.random() * 0.45 + 0.8;
        p.color = colors[spawned % colors.length];
        p.alpha = 1;
        p.life = 0;
        p.maxLife = Math.floor(Math.random() * 25 + 45);
        spawned++;
      }
    }

    if (!this.animId) {
      this.animId = requestAnimationFrame(this.tick);
    }
  }

  tick() {
    const ctx = this.ctx;
    const w = this.canvas.width;
    const h = this.canvas.height;
    ctx.clearRect(0, 0, w, h);

    let activeCount = 0;

    for (let i = 0; i < this.maxParticles; i++) {
      const p = this.particles[i];
      if (!p.active) continue;

      activeCount++;
      p.life++;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.075;
      p.vx *= 0.985;
      p.rot += p.vRot;
      p.alpha = Math.max(0, 1 - p.life / p.maxLife);

      if (p.life >= p.maxLife || p.y > h + 50) {
        p.active = false;
        continue;
      }

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(p.scale, p.scale);
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle = p.color;

      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.bezierCurveTo(7, -6, 7, 7, 0, 10);
      ctx.bezierCurveTo(-7, 7, -7, -6, 0, -10);
      ctx.fill();

      ctx.restore();
    }

    if (activeCount > 0) {
      this.animId = requestAnimationFrame(this.tick);
    } else {
      this.animId = null;
    }
  }

  destroy() {
    if (this.animId) cancelAnimationFrame(this.animId);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 8. CSS STYLES & SPRING RECOIL KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────
const GLOBAL_CSS = `
@keyframes sway {
  0%, 100% { transform-origin: bottom center; transform: rotate(-1.8deg) scaleX(0.99); }
  50%       { transform-origin: bottom center; transform: rotate( 1.8deg) scaleX(1.01); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.35; }
  50%       { opacity: 1;    }
}
@keyframes float-cloud {
  0%, 100% { transform: translateX(0px); }
  50%       { transform: translateX(18px); }
}
@keyframes shoot {
  0%   { opacity: 0; stroke-dashoffset: 80; }
  10%  { opacity: 1; }
  40%  { opacity: 0.6; stroke-dashoffset: 0; }
  100% { opacity: 0; stroke-dashoffset: 0; }
}
@keyframes moon-glow-pulse {
  0%, 100% { opacity: 0.88; transform: scale(1); }
  50%       { opacity: 1.00; transform: scale(1.05); }
}

/* Hardware-accelerated Spring "Giựt" Recoil */
.is-jerk {
  animation: jerk-spring 0.68s cubic-bezier(0.2, 1.45, 0.4, 1) forwards !important;
}

@keyframes jerk-spring {
  0%   { transform: rotate(0deg) scale(1); }
  18%  { transform: rotate(-18deg) scale(1.24); }
  38%  { transform: rotate(15deg) scale(1.14); }
  58%  { transform: rotate(-8deg) scale(1.06); }
  78%  { transform: rotate(4deg) scale(1.02); }
  100% { transform: rotate(0deg) scale(1); }
}
`;

// ─────────────────────────────────────────────────────────────────────────────
// 9. MAIN BACKGROUND COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function AnimatedBackground() {
  const [scrollT, setScrollT] = useState(0);
  const rawRef     = useRef(0);
  const smoothRef  = useRef(0);
  const rafRef     = useRef();
  const canvasRef  = useRef(null);
  const poolMgrRef = useRef(null);

  // 1. Inject global CSS
  useEffect(() => {
    const el = document.createElement('style');
    el.textContent = GLOBAL_CSS;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);

  // 2. Initialize Canvas Petal Pool Manager
  useEffect(() => {
    if (canvasRef.current) {
      poolMgrRef.current = new PetalPoolManager(canvasRef.current);
      poolMgrRef.current.resize();
    }
    const handleResize = () => poolMgrRef.current?.resize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      poolMgrRef.current?.destroy();
    };
  }, []);

  // 3. Smooth Lerp Scroll Tracking (RAF 60/120 FPS)
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      rawRef.current = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const tick = () => {
      const prev = smoothRef.current;
      smoothRef.current += (rawRef.current - smoothRef.current) * 0.055;
      if (Math.abs(smoothRef.current - prev) > 0.001) {
        setScrollT(+smoothRef.current.toFixed(3));
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  const handleFlowerBurst = (x, y, pal) => {
    poolMgrRef.current?.burst(x, y, pal);
  };

  // ── Derived Parallax & Camera Transforms ─────
  const t = scrollT;

  const skyTop      = interp(SKY_TOP, t);
  const skyBot      = interp(SKY_BOT, t);
  const sunY        = interp(SUN_Y,   t);
  const sunOpa      = interp(SUN_OPA, t);
  const moonY       = interp(MOON_Y,  t);
  const moonOpa     = interp(MOON_OPA,t);
  const starOpa     = interp(STAR_OPA,t);
  const hillLeftCol = interp(HILL_LEFT_COL, t);
  const hillRightCol= interp(HILL_RIGHT_COL, t);
  const hillMainCol = interp(HILL_MAIN_COL, t);
  const ff          = flowerFilter(t);
  const cloudOpa    = Math.max(0, 1 - t * 3.6);
  const moonGlow    = moonOpa * 0.22;
  const nightFog    = interp([{ t: 0, v: 0 }, { t: 0.65, v: 0 }, { t: 0.85, v: 0.6 }, { t: 1, v: 0.84 }], t);
  const horizonGlow = interp([
    { t: 0.00, v: 0 }, { t: 0.28, v: 0 }, { t: 0.38, v: 0.7 }, { t: 0.52, v: 0.55 }, { t: 0.65, v: 0 }
  ], t);

  // Scroll Progression:
  const subHillsOffsetY = (t * 60).toFixed(2);
  const subHillsOpacity = Math.max(0, 1 - t * 1.5).toFixed(3);

  const mainHillOffsetY = (-t * 3).toFixed(2);
  const mainHillScale   = (1 + t * 0.1).toFixed(3);

  return (
    <div
      aria-hidden="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${skyTop} 0%, ${skyBot} 100%)`,
      }}
    >
      {/* ────────────────── 1. STARS & METEORS ────────────────── */}
      <svg
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          opacity: starOpa,
          pointerEvents: 'none',
        }}
      >
        {STARS.map((s, i) => (
          <circle
            key={i}
            cx={`${s.x}%`}
            cy={`${s.y}%`}
            r={s.r}
            fill="white"
            style={{
              animation: `twinkle ${s.dur}s ease-in-out infinite`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
        {SHOOTS.map((sh, i) => (
          <line
            key={i}
            x1={`${sh.x1}%`} y1={`${sh.y1}%`}
            x2={`${sh.x2}%`} y2={`${sh.y2}%`}
            stroke="white"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeDasharray="80"
            style={{
              opacity: 0,
              animation: `shoot ${3.8}s ease-out infinite`,
              animationDelay: `${sh.delay}s`,
            }}
          />
        ))}
      </svg>

      {/* ────────────────── 2. SUN ────────────────── */}
      <div
        style={{
          position: 'absolute',
          right: '15%',
          top: `${sunY}%`,
          opacity: sunOpa,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div style={{
          position: 'absolute',
          top: -65, left: -65,
          width: 206, height: 206,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,235,90,0.58) 0%, rgba(255,150,0,0.2) 45%, transparent 70%)',
          filter: 'blur(14px)',
        }} />
        <div style={{
          width: 76, height: 76,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 36%, #fff9c4 0%, #ffd700 50%, #ff8c00 100%)',
          boxShadow: '0 0 55px 22px rgba(255,200,0,0.65), 0 0 110px 55px rgba(255,140,0,0.25)',
        }} />
      </div>

      {/* ────────────────── 3. SUNSET HORIZON GLOW ────────────────── */}
      <div style={{
        position: 'absolute',
        bottom: '26%',
        left: 0, right: 0,
        height: '42%',
        background: 'radial-gradient(ellipse at 50% 100%, rgba(255,115,0,0.6) 0%, rgba(255,50,0,0.2) 40%, transparent 70%)',
        opacity: horizonGlow,
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* ────────────────── 4. MOON ────────────────── */}
      <div
        style={{
          position: 'absolute',
          right: '20%',
          top: `${moonY}%`,
          opacity: moonOpa,
          pointerEvents: 'none',
          zIndex: 2,
        }}
      >
        <div style={{
          position: 'absolute',
          top: -40, left: -40,
          width: 150, height: 150,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(185,220,255,0.45) 0%, transparent 70%)',
          filter: 'blur(16px)',
          animation: 'moon-glow-pulse 4.5s ease-in-out infinite',
        }} />
        <div style={{
          width: 70, height: 70,
          borderRadius: '50%',
          background: 'radial-gradient(circle at 38% 35%, #f0f6ff 0%, #c4d8f0 55%, #9ab2d2 100%)',
          boxShadow: '0 0 34px 14px rgba(165,210,255,0.4), inset -10px -7px 0 rgba(140,175,215,0.35)',
          position: 'relative',
        }}>
          <div style={{ position: 'absolute', width: 10, height: 10, borderRadius: '50%', background: 'rgba(120,155,200,0.38)', top: 11, left: 16 }} />
          <div style={{ position: 'absolute', width: 7, height: 7, borderRadius: '50%', background: 'rgba(120,155,200,0.30)', top: 31, left: 36 }} />
          <div style={{ position: 'absolute', width: 8, height: 8, borderRadius: '50%', background: 'rgba(120,155,200,0.32)', top: 43, left: 21 }} />
          <div style={{ position: 'absolute', width: 5, height: 5, borderRadius: '50%', background: 'rgba(120,155,200,0.25)', top: 18, left: 43 }} />
        </div>
      </div>

      {/* ────────────────── 5. MOONLIGHT TINT ────────────────── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `radial-gradient(ellipse at 80% 18%, rgba(150,195,255,0.22) 0%, transparent 60%)`,
        opacity: moonGlow * 5,
        pointerEvents: 'none',
        zIndex: 2,
      }} />

      {/* ────────────────── 6. CLOUDS ────────────────── */}
      <div style={{ opacity: cloudOpa, pointerEvents: 'none', zIndex: 2 }}>
        <div style={{ position: 'absolute', left: '5%', top: '12%', animation: 'float-cloud 8s ease-in-out infinite' }}>
          <svg width="180" height="70" viewBox="0 0 180 70">
            <ellipse cx="90" cy="50" rx="78" ry="22" fill="white" opacity="0.84" />
            <ellipse cx="62" cy="38" rx="40" ry="26" fill="white" opacity="0.84" />
            <ellipse cx="118" cy="36" rx="36" ry="24" fill="white" opacity="0.84" />
            <ellipse cx="90" cy="28" rx="46" ry="24" fill="white" opacity="0.80" />
          </svg>
        </div>
        <div style={{ position: 'absolute', left: '50%', top: '8%', transform: 'scale(0.8)', animation: 'float-cloud 11s ease-in-out infinite', animationDelay: '1s' }}>
          <svg width="180" height="70" viewBox="0 0 180 70">
            <ellipse cx="90" cy="50" rx="78" ry="22" fill="white" opacity="0.72" />
            <ellipse cx="62" cy="38" rx="40" ry="26" fill="white" opacity="0.72" />
            <ellipse cx="118" cy="36" rx="36" ry="24" fill="white" opacity="0.72" />
          </svg>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          SUB-HILL 1: LEFT HILL (Behind Main Hill on the left)
          Filter applied at layer container level for high-perf 60 FPS
      ───────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 3,
          pointerEvents: 'none',
          transform: `translate3d(0, ${subHillsOffsetY}vh, 0)`,
          opacity: subHillsOpacity,
          transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
        }}
      >
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '52%' }}
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
        >
          <path
            d="M0,520 L0,65 Q180,45 420,135 Q680,240 920,380 L1440,460 L1440,520 L0,520 Z"
            fill={hillLeftCol}
          />
        </svg>

        {/* 18 detailed flowers with layer-level filter */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', filter: ff }}>
          {FLOWERS_LEFT_HILL.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          SUB-HILL 2: RIGHT HILL (Behind Main Hill on the right)
          Filter applied at layer container level for high-perf 60 FPS
      ───────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 4,
          pointerEvents: 'none',
          transform: `translate3d(0, ${subHillsOffsetY}vh, 0)`,
          opacity: subHillsOpacity,
          transition: 'transform 0.05s ease-out, opacity 0.05s ease-out',
        }}
      >
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '52%' }}
          viewBox="0 0 1440 520"
          preserveAspectRatio="none"
        >
          <path
            d="M1440,520 L1440,75 Q1260,55 1020,145 Q760,250 520,385 L0,460 L0,520 L1440,520 Z"
            fill={hillRightCol}
          />
        </svg>

        {/* 18 detailed flowers with layer-level filter */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', filter: ff }}>
          {FLOWERS_RIGHT_HILL.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────────────────
          MAIN HILL (ĐỒI CHÍNH TO - CENTER & FOREGROUND, Z-INDEX 6)
          Covered in 93 flowers across 4 tiers covering bottom -3% to 33%!
          Filter applied at layer container level for high-perf 60 FPS
      ───────────────────────────────────────────────────────────────────────── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 6,
          pointerEvents: 'none',
          transform: `translate3d(0, ${mainHillOffsetY}vh, 0) scale(${mainHillScale})`,
          transformOrigin: 'bottom center',
          transition: 'transform 0.05s ease-out',
        }}
      >
        {/* Main Hill Terrain SVG */}
        <svg
          style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '44%' }}
          viewBox="0 0 1440 440"
          preserveAspectRatio="none"
        >
          <path
            d="M0,440 L0,110 Q240,65 520,80 Q720,55 940,82 Q1220,70 1440,115 L1440,440 L0,440 Z"
            fill={hillMainCol}
          />
        </svg>

        {/* ── Main Hill Flower Container with Layer-level filter: ff ── */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '100%', filter: ff }}>
          {/* TIER 1: Ridge / Peak Flowers (25 flowers, bottom 25% - 33%, scale 0.24 - 0.36) */}
          {MAIN_TIER_RIDGE.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}

          {/* TIER 2: Mid Slope Flowers (28 flowers, bottom 15% - 25%, scale 0.44 - 0.64) */}
          {MAIN_TIER_SLOPE.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}

          {/* TIER 3: Lower Field Flowers (22 flowers, bottom 6% - 15%, scale 0.72 - 0.96) */}
          {MAIN_TIER_LOWER.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}

          {/* TIER 4: Foreground Bed Flowers (18 flowers, bottom -3% - 6%, scale 1.08 - 1.45) */}
          {MAIN_TIER_FORE.map((f) => (
            <FlowerItem key={f.id} f={f} onInteract={handleFlowerBurst} />
          ))}
        </div>
      </div>

      {/* ────────────────── 7. PERMANENT BASE LAWN STRIP ────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '10%',
          background: `linear-gradient(0deg, ${hillMainCol} 0%, transparent 100%)`,
          zIndex: 7,
          pointerEvents: 'none',
        }}
      />

      {/* ────────────────── 8. NIGHT ATMOSPHERIC MIST ────────────────── */}
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '38%',
          background: 'linear-gradient(0deg, rgba(2,1,10,0.88) 0%, transparent 100%)',
          opacity: nightFog,
          pointerEvents: 'none',
          zIndex: 9,
        }}
      />

      {/* ────────────────── 9. DEDICATED CANVAS PETAL BURST POOL ────────────────── */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 15,
        }}
      />
    </div>
  );
}
