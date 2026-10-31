// Ornaments over the velvet: cut-outs from your collage (in public/art/)
// and gold foil stars drawn as SVG with the shared "gold-foil" gradient from <GoldDefs />.
import { useEffect, useRef, type CSSProperties } from 'react';
import { ART } from '../lib/art';
import { useReducedMotion } from './useReducedMotion';

const GOLD = 'url(#gold-foil)';

/**
 * The metallic gradient every ornament uses. Rendered once near the top of the app;
 * any inline SVG on the page can then refer to it as url(#gold-foil).
 */
export function GoldDefs() {
  return (
    <svg width="0" height="0" className="absolute" aria-hidden="true">
      <defs>
        <linearGradient id="gold-foil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#fff3c4" />
          <stop offset="0.3" stopColor="#e6c06a" />
          <stop offset="0.55" stopColor="#b8862f" />
          <stop offset="0.78" stopColor="#f2d68a" />
          <stop offset="1" stopColor="#8a5a1c" />
        </linearGradient>
      </defs>
    </svg>
  );
}

// ---------- Shapes (each on a 24 × 24 grid) ----------

/** A four-pointed sparkle with gently curved sides. */
export const SPARKLE = 'M12 0C12.9 7.4 16.6 11.1 24 12C16.6 12.9 12.9 16.6 12 24C11.1 16.6 7.4 12.9 0 12C7.4 11.1 11.1 7.4 12 0Z';

/** A classic five-pointed star (outer radius 11, inner 4.6). */
const STAR5 = '12,1 14.7,8.28 22.46,8.6 16.37,13.42 18.47,20.9 12,16.6 5.53,20.9 7.63,13.42 1.54,8.6 9.3,8.28';

/** Gold SVG stars drawn in code. */
type StarKind = 'sparkle' | 'compass' | 'star';
/** Cut-outs from your collage. */
type CutoutKind = 'moonMedallion' | 'celestialStar' | 'ribbonMoon' | 'goldStars';
type Kind = StarKind | CutoutKind;

const CUTOUTS: Record<CutoutKind, string> = {
  moonMedallion: ART.moonMedallion,
  celestialStar: ART.celestialStar,
  ribbonMoon: ART.ribbonMoon,
  goldStars: ART.goldStars,
};

interface OrnamentProps {
  kind: Kind;
  /** Width in pixels on a 375px-wide phone (cut-outs keep their own proportions and scale with the screen). */
  size: number;
  className?: string;
  style?: CSSProperties;
}

export function Ornament({ kind, size, className = '', style }: OrnamentProps) {
  if (kind in CUTOUTS) {
    return (
      <img
        src={CUTOUTS[kind as CutoutKind]}
        alt=""
        className={`collage-cutout ${className}`}
        // `size` is the width on a 375px-wide phone; it grows with wider screens, up to 30% larger.
        style={{ width: `min(${size * 1.3}px, ${(size / 3.75).toFixed(2)}vw)`, ...style }}
        aria-hidden="true"
      />
    );
  }

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={`gold-relief ${className}`}
      style={style}
      aria-hidden="true"
    >
      {kind === 'sparkle' && <path d={SPARKLE} fill={GOLD} />}
      {kind === 'compass' && (
        // An eight-pointed star: a large sparkle with a smaller one turned 45°.
        <>
          <path d={SPARKLE} fill={GOLD} transform="translate(12 12) rotate(45) scale(0.6) translate(-12 -12)" />
          <path d={SPARKLE} fill={GOLD} />
        </>
      )}
      {kind === 'star' && <polygon points={STAR5} fill={GOLD} />}
    </svg>
  );
}

// ---------- The scattered background layer ----------

interface Placement {
  kind: Kind;
  /** Position as a percentage of the screen, so it adapts to any phone size. */
  x: number;
  y: number;
  size: number;
  rotate?: number;
  /** Seconds of delay before twinkling, so the stars don't pulse in unison. */
  twinkle?: number;
  /** How "close" it feels, 0–1: closer pieces drift further when you scroll or move the pointer. */
  depth: number;
}

// Kept mostly to the edges so they frame the content rather than sit behind text.
// The collage cut-outs are "near" (deep parallax); the little stars are "far".
const PLACEMENTS: Placement[] = [
  { kind: 'celestialStar', x: 83, y: 0, size: 62, twinkle: 0, depth: 0.8 },
  { kind: 'moonMedallion', x: -7, y: 21, size: 92, rotate: -10, depth: 1 },
  { kind: 'ribbonMoon', x: 87, y: 64, size: 58, depth: 0.9 },
  { kind: 'goldStars', x: 1, y: 70, size: 46, rotate: -8, depth: 0.7 },
  { kind: 'sparkle', x: 42, y: 2, size: 14, twinkle: 1.2, depth: 0.3 },
  { kind: 'compass', x: 60, y: 8, size: 18, twinkle: 2.4, depth: 0.4 },
  { kind: 'sparkle', x: 4, y: 54, size: 16, twinkle: 3.1, depth: 0.35 },
  { kind: 'star', x: 66, y: 57, size: 12, twinkle: 1.8, depth: 0.25 },
  { kind: 'star', x: 24, y: 61, size: 10, twinkle: 2.7, depth: 0.2 },
  { kind: 'sparkle', x: 72, y: 80, size: 18, twinkle: 3.6, depth: 0.4 },
  { kind: 'star', x: 40, y: 74, size: 12, twinkle: 1.5, depth: 0.25 },
  { kind: 'sparkle', x: 30, y: 82, size: 12, twinkle: 0.3, depth: 0.3 },
];

// How far the nearest pieces move: with the pointer (each way) and per pixel scrolled.
const POINTER_SHIFT = 14;
const SCROLL_SHIFT = 0.08;
const MAX_SCROLL = 1500; // stop drifting after this much scrolling so pieces don't leave the screen

/**
 * Collage cut-outs and gold stars scattered over the velvet, with gentle depth:
 * as you scroll (and, on a computer, move the mouse) nearer pieces drift further
 * than distant ones. Off when the device asks for reduced motion. Purely decorative.
 */
export function GoldOrnaments() {
  const reducedMotion = useReducedMotion();
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (reducedMotion || !layer) return;

    let frame = 0;
    let pointerX = 0; // -1 (left edge) to 1 (right edge)
    let pointerY = 0;
    // Batch updates into one per screen refresh; the CSS transition does the smoothing.
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        layer.style.setProperty('--px', pointerX.toFixed(3));
        layer.style.setProperty('--py', pointerY.toFixed(3));
        layer.style.setProperty('--sy', String(Math.min(window.scrollY, MAX_SCROLL)));
      });
    };
    const onPointer = (e: PointerEvent) => {
      pointerX = (e.clientX / window.innerWidth) * 2 - 1;
      pointerY = (e.clientY / window.innerHeight) * 2 - 1;
      update();
    };

    window.addEventListener('scroll', update, { passive: true });
    // Pointer drift only for a mouse or trackpad; on a phone a finger isn't "hovering".
    const finePointer = window.matchMedia('(pointer: fine)').matches;
    if (finePointer) window.addEventListener('pointermove', onPointer, { passive: true });
    update();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('pointermove', onPointer);
    };
  }, [reducedMotion]);

  return (
    <div ref={layerRef} className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      {PLACEMENTS.map((p, i) => (
        <Ornament
          key={i}
          kind={p.kind}
          size={p.size}
          className={`absolute ${p.twinkle !== undefined ? 'animate-twinkle' : ''}`}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            transform: p.rotate ? `rotate(${p.rotate}deg)` : undefined,
            // `translate` is separate from `transform`, so the drift adds to any rotation.
            translate: `calc(var(--px, 0) * ${(p.depth * POINTER_SHIFT).toFixed(1)}px) calc(var(--py, 0) * ${(
              p.depth * POINTER_SHIFT
            ).toFixed(1)}px - var(--sy, 0) * ${(p.depth * SCROLL_SHIFT).toFixed(3)}px)`,
            transition: 'translate 700ms cubic-bezier(0.2, 0.8, 0.2, 1)',
            animationDelay: p.twinkle !== undefined ? `${p.twinkle}s` : undefined,
          }}
        />
      ))}
    </div>
  );
}
