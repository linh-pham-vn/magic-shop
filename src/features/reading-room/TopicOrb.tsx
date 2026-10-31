import { useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { CATEGORIES } from '../../content';
import { ART } from '../../lib/art';
import type { Category } from '../../types';

/** How far (px) a finger must travel sideways before it counts as a swipe rather than a tap. */
const SWIPE_PX = 40;
/** Movement smaller than this is still a tap. */
const TAP_SLOP_PX = 8;

// Line icons for the four topics.
const TOPIC_ICONS: Record<Category, ReactNode> = {
  // An open eye: looking inward.
  self: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  // A briefcase.
  career: <path d="M4 8h16v11H4zM9 8V5h6v3M4 13h16" />,
  // A heart.
  relationship: <path d="M12 20s-7-4.5-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.5-7 10-7 10z" />,
  // A house.
  family: <path d="M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-5h4v5" />,
};

interface Props {
  /** Called with the chosen topic and where the ball is on screen (the smoke rises from there). */
  onPick: (category: Category, from: DOMRect) => void;
  /** True once a topic is chosen, so a second tap can't pick again. */
  disabled?: boolean;
}

/**
 * The crystal ball topic picker. The current topic floats inside the glass;
 * swipe sideways (or use the arrows, the dots or the arrow keys) to see the next,
 * and tap the ball to choose it.
 */
export function TopicOrb({ onPick, disabled }: Props) {
  const [index, setIndex] = useState(0);
  // Which way the last change went, so the new topic drifts in from that side.
  const [direction, setDirection] = useState<'next' | 'prev'>('next');
  const [dragX, setDragX] = useState(0);
  const start = useRef<{ x: number; y: number } | null>(null);
  const moved = useRef(false); // did this press turn into a swipe? (then it's not a tap)
  const ballRef = useRef<HTMLButtonElement>(null);

  const count = CATEGORIES.length;
  const topic = CATEGORIES[index];
  const go = (step: 1 | -1) => {
    setDirection(step === 1 ? 'next' : 'prev');
    setIndex((i) => (i + step + count) % count); // wraps around: Family → Self
  };
  const jump = (i: number) => {
    if (i === index) return;
    setDirection(i > index ? 'next' : 'prev');
    setIndex(i);
  };

  const choose = () => {
    if (disabled || moved.current || !ballRef.current) return;
    onPick(topic.key, ballRef.current.getBoundingClientRect());
  };

  // Swiping: follow the finger a little, then change topic if it went far enough.
  const onPointerDown = (e: PointerEvent) => {
    e.currentTarget.setPointerCapture(e.pointerId); // keep following even if the finger slides off the ball
    start.current = { x: e.clientX, y: e.clientY };
    moved.current = false;
  };
  const onPointerMove = (e: PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    if (Math.abs(dx) > TAP_SLOP_PX) moved.current = true;
    setDragX(Math.max(-60, Math.min(60, dx)) * 0.6); // a gentle, limited follow
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!start.current) return;
    const dx = e.clientX - start.current.x;
    start.current = null;
    setDragX(0);
    if (dx <= -SWIPE_PX) go(1);
    else if (dx >= SWIPE_PX) go(-1);
  };
  const onKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') go(1);
    else if (e.key === 'ArrowLeft') go(-1);
  };

  const prev = CATEGORIES[(index - 1 + count) % count];
  const next = CATEGORIES[(index + 1) % count];

  return (
    <div role="group" aria-roledescription="carousel" aria-label="Choose a topic" onKeyDown={onKeyDown}>
      <div className="flex items-center justify-center gap-1">
        <ArrowButton label={`Previous topic: ${prev.label}`} onClick={() => go(-1)} flip />

        <button
          ref={ballRef}
          type="button"
          onClick={choose}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          disabled={disabled}
          aria-label={`Choose ${topic.label}`}
          // touch-pan-y: up-and-down still scrolls the page; sideways is ours, for swiping.
          className="press relative w-[clamp(10rem,30dvh,14rem)] touch-pan-y select-none"
        >
          {/* The ball bobs gently (on an inner layer, so it doesn't fight the press effect). */}
          <span className="animate-orb-float relative block">
          <img src={ART.crystalBall} alt="" draggable={false} className="collage-cutout pointer-events-none w-full" />
          {/* The topic, floating inside the glass (the glass is the top ~70% of the painting). */}
          <span
            className="pointer-events-none absolute inset-x-[14%] top-[10%] flex h-[50%] items-center justify-center"
            style={{ transform: `translateX(${dragX}px)`, transition: dragX ? 'none' : 'transform 250ms ease-out' }}
          >
            <span
              key={topic.key}
              className={`flex flex-col items-center gap-1.5 ${direction === 'next' ? 'animate-orb-from-right' : 'animate-orb-from-left'}`}
            >
              {/* A soft white mist behind the words, so they read clearly on the painted glass. */}
              <span className="orb-mist" aria-hidden="true" />
              <svg
                viewBox="0 0 24 24"
                className="relative h-[clamp(1.75rem,5dvh,2.5rem)] w-[clamp(1.75rem,5dvh,2.5rem)]"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinejoin="round"
                aria-hidden="true"
                style={{ color: 'var(--color-velvet-800)' }}
              >
                {TOPIC_ICONS[topic.key]}
              </svg>
              <span className="relative font-display text-[clamp(1rem,3.2dvh,1.35rem)] font-bold tracking-[0.04em] text-velvet-950">
                {topic.label}
              </span>
            </span>
          </span>
          </span>
        </button>

        <ArrowButton label={`Next topic: ${next.label}`} onClick={() => go(1)} />
      </div>

      {/* One dot per topic; the bright one is showing. Each is a 44px tap target. */}
      <div className="mt-1 flex justify-center" role="tablist" aria-label="Topics">
        {CATEGORIES.map((c, i) => (
          <button
            key={c.key}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={c.label}
            onClick={() => jump(i)}
            className="flex h-11 w-9 items-center justify-center"
          >
            <span
              className={`block h-2 rounded-full transition-all duration-300 ${i === index ? 'w-5 bg-gold-300' : 'w-2 bg-gold-600/50'}`}
            />
          </button>
        ))}
      </div>
      <p className="text-center text-xs tracking-wide text-cream-500">Swipe to change · tap the ball to choose</p>
    </div>
  );
}

function ArrowButton({ label, onClick, flip }: { label: string; onClick: () => void; flip?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="press flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-gold-300 hover:bg-velvet-700/50"
    >
      <svg viewBox="0 0 24 24" className={`h-6 w-6 ${flip ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M9 5l7 7-7 7" />
      </svg>
    </button>
  );
}
