import { createPortal } from 'react-dom';

/** How long the whole smoke effect lasts (the longest wisp in index.css, plus its delay). */
export const SMOKE_MS = 2400;
/** When the home screen has dissolved, so the shuffle page can ease in. */
export const SMOKE_PEAK_MS = 600;

// Each wisp: where it drifts (as a share of the screen; mostly upward), how big it grows,
// how far it twists, how strong it gets at its peak, and when it starts.
const PUFFS = [
  { px: -0.08, py: -0.32, ps: 1.6, pr: -30, po: 0.55, delay: 0 },
  { px: 0.1, py: -0.38, ps: 1.8, pr: 35, po: 0.5, delay: 80 },
  { px: -0.18, py: -0.22, ps: 1.4, pr: -50, po: 0.45, delay: 160 },
  { px: 0.2, py: -0.2, ps: 1.5, pr: 45, po: 0.45, delay: 220 },
  { px: 0.02, py: -0.5, ps: 2.2, pr: 20, po: 0.4, delay: 260 },
  { px: -0.25, py: -0.42, ps: 2, pr: -25, po: 0.35, delay: 340 },
  { px: 0.26, py: -0.46, ps: 2, pr: 30, po: 0.35, delay: 380 },
  { px: -0.05, py: -0.15, ps: 1.3, pr: -60, po: 0.5, delay: 120 },
  { px: 0.06, py: -0.62, ps: 2.4, pr: 15, po: 0.3, delay: 420 },
];

/**
 * Soft wisps of smoke curling up out of the crystal ball and fading as they rise.
 * `from` is the centre of the ball on screen. Purely decorative, and never blocks taps.
 */
export function SmokeTransition({ from }: { from: { x: number; y: number } }) {
  const w = window.innerWidth;
  const h = window.innerHeight;
  // Rendered straight into <body>, so the smoke covers everything, the New reading button included.
  return createPortal(
    <div
      className="smoke-veil"
      aria-hidden="true"
      style={{ ['--sx' as string]: `${from.x}px`, ['--sy' as string]: `${from.y}px` }}
    >
      {PUFFS.map((p, i) => (
        <span
          key={i}
          className="smoke-puff"
          style={{
            ['--px' as string]: `${p.px * w}px`,
            ['--py' as string]: `${p.py * h}px`,
            ['--ps' as string]: p.ps,
            ['--pr' as string]: `${p.pr}deg`,
            ['--po' as string]: p.po,
            animationDelay: `${p.delay}ms`,
          }}
        />
      ))}
    </div>,
    document.body,
  );
}
