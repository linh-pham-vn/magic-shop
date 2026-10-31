import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { SPARKLE } from './GoldOrnaments';

/** How wide the "scratch" is, in screen pixels. */
const BRUSH = 38;
/** Once this share of the foil is scratched off, the rest dissolves by itself. */
const DONE_AT = 0.4;
/** How long the leftover foil takes to fade away (matches the CSS transition below). */
const FADE_MS = 700;

interface Props {
  children: ReactNode;
  /** Whispered on the foil, e.g. "your message". */
  hint?: string;
  /** Called once, when the message is fully revealed. */
  onRevealed?: () => void;
}

/**
 * A scratch card: the content sits under a layer of gold foil drawn on a canvas.
 * Rubbing the foil (finger or mouse) erases it; once enough is gone the rest fades away.
 * Up-and-down swipes still scroll the page, so the card never traps you.
 * The "Reveal without scratching" button underneath is the way in for keyboards,
 * screen readers, and anyone who'd rather not scratch.
 */
export function ScratchReveal({ children, hint = 'your message', onRevealed }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null); // where the finger was a moment ago
  const scratched = useRef(false); // has anyone started scratching? (then we never repaint the foil)
  const strokes = useRef(0);
  const [state, setState] = useState<'covered' | 'fading' | 'revealed'>('covered');

  // Paint the foil to fit the card, and repaint if the card changes size before you start.
  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || state !== 'covered') return;
    const paint = () => {
      if (scratched.current) return;
      const { width, height } = wrap.getBoundingClientRect();
      paintFoil(canvas, width, height, hint);
    };
    paint();
    document.fonts?.ready.then(paint); // repaint once the fancy fonts have loaded
    const observer = new ResizeObserver(paint);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, [hint, state]);

  const reveal = () => {
    if (state !== 'covered') return;
    setState('fading');
    setTimeout(() => {
      setState('revealed');
      onRevealed?.();
    }, FADE_MS);
  };

  // Erase a line of foil from the last point to this one.
  const scratch = (e: PointerEvent<HTMLCanvasElement>) => {
    const canvas = e.currentTarget;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    const point = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const from = last.current ?? point;
    ctx.globalCompositeOperation = 'destination-out'; // drawing now removes paint instead of adding it
    ctx.strokeStyle = '#000'; // fully opaque, so it removes the foil completely (the colour itself doesn't matter)
    ctx.lineWidth = BRUSH;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(point.x + 0.1, point.y); // the tiny offset makes a single tap leave a round mark
    ctx.stroke();
    last.current = point;
    scratched.current = true;
    // Checking how much is cleared is slow-ish, so only do it every few strokes.
    if (++strokes.current % 8 === 0 && clearedShare(canvas) >= DONE_AT) reveal();
  };

  const onPointerDown = (e: PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId); // keep scratching even if the finger slips off the edge
    last.current = null;
    scratch(e);
  };
  const onPointerMove = (e: PointerEvent<HTMLCanvasElement>) => {
    if (e.buttons === 0 && e.pointerType === 'mouse') return; // mouse just hovering, not pressed
    if (last.current) scratch(e);
  };
  const onPointerUp = (e: PointerEvent<HTMLCanvasElement>) => {
    last.current = null;
    if (clearedShare(e.currentTarget) >= DONE_AT) reveal();
  };
  return (
    <div>
      <div ref={wrapRef} className="relative">
        {/* Hidden from screen readers until revealed, so it stays a surprise for everyone. */}
        <div aria-hidden={state === 'covered'}>{children}</div>
        {state !== 'revealed' && (
          // The foil is only for fingers and mice; the button below does the same job for everyone.
          // touch-pan-y: a vertical swipe scrolls the page (the browser takes it over), a sideways rub scratches.
          <canvas
            ref={canvasRef}
            aria-hidden="true"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            className={`absolute inset-0 h-full w-full cursor-grab touch-pan-y rounded-2xl transition-opacity duration-700 active:cursor-grabbing ${
              state === 'fading' ? 'pointer-events-none opacity-0' : ''
            }`}
          />
        )}
      </div>
      {state === 'covered' && (
        <div className="mt-1 text-center">
          <button
            type="button"
            onClick={reveal}
            className="press min-h-11 px-4 text-sm text-gold-300 underline-offset-4 hover:underline"
          >
            Reveal without scratching
          </button>
        </div>
      )}
    </div>
  );
}

/** Share of the canvas that's been scratched clear (0–1), sampled on a coarse grid to stay quick. */
function clearedShare(canvas: HTMLCanvasElement): number {
  const ctx = canvas.getContext('2d');
  if (!ctx || canvas.width === 0) return 0;
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const step = 12; // look at every 12th pixel across and down
  let clear = 0;
  let total = 0;
  for (let y = 0; y < canvas.height; y += step) {
    for (let x = 0; x < canvas.width; x += step) {
      total++;
      if (data[(y * canvas.width + x) * 4 + 3] < 40) clear++;
    }
  }
  return clear / total;
}

/** Gold foil: a metallic gradient, a faint diamond lattice, a sparkle and the "Scratch to reveal" hint. */
function paintFoil(canvas: HTMLCanvasElement, width: number, height: number, hint: string) {
  const ctx = canvas.getContext('2d');
  if (!ctx || width === 0 || height === 0) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2); // sharp on high-resolution screens
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.globalCompositeOperation = 'source-over';

  // Rounded card shape, so the foil matches the card's corners.
  ctx.beginPath();
  ctx.roundRect(0, 0, width, height, 16);
  ctx.clip();

  // Brushed-gold gradient.
  const gold = ctx.createLinearGradient(0, 0, width, height);
  gold.addColorStop(0, '#8a6326');
  gold.addColorStop(0.3, '#e9c46f');
  gold.addColorStop(0.5, '#f7e3a4');
  gold.addColorStop(0.7, '#c99a45');
  gold.addColorStop(1, '#8a6326');
  ctx.fillStyle = gold;
  ctx.fillRect(0, 0, width, height);

  // Faint diamond lattice, like the card backs.
  ctx.strokeStyle = 'rgba(80, 50, 15, 0.18)';
  ctx.lineWidth = 1;
  for (let i = -height; i < width + height; i += 14) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + height, height);
    ctx.moveTo(i, height);
    ctx.lineTo(i + height, 0);
    ctx.stroke();
  }

  // A sparkle above the words.
  const cx = width / 2;
  const cy = height / 2;
  const size = 34;
  ctx.save();
  ctx.translate(cx - size / 2, cy - 62);
  ctx.scale(size / 24, size / 24);
  ctx.fillStyle = 'rgba(60, 35, 10, 0.75)';
  ctx.fill(new Path2D(SPARKLE));
  ctx.restore();

  // The hint, in the app's capitals-and-script style, pressed into the foil.
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(55, 32, 8, 0.85)';
  ctx.font = '700 22px "Cinzel Decorative", serif';
  ctx.fillText('Scratch to reveal', cx, cy);
  ctx.font = '30px "Pinyon Script", cursive';
  ctx.fillText(hint, cx, cy + 34);
}
