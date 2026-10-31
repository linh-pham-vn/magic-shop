import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';
import { SPARKLE } from '../../components/GoldOrnaments';
import { TarotCardView } from '../../components/TarotCardView';
import { useReducedMotion } from '../../components/useReducedMotion';
import { CARD_BY_ID, POSITIONS, SPREAD_POSITIONS } from '../../content';
import type { DrawnCard } from '../../types';

/** How long the turning-over flourish lasts (the longest part is the reversal turn in index.css). */
const FLOURISH_MS = 1800;

/** Where each sparkle flies when a card turns over: six directions around the card. */
const BURST = [
  [0, -70],
  [55, -40],
  [60, 30],
  [0, 70],
  [-60, 30],
  [-55, -40],
];

interface Props {
  drawn: DrawnCard[];
  /** Which cards are face up, by slot. */
  revealed: boolean[];
  /** Where the deck was on screen when the latest card was drawn, so it can fly from there. */
  getDeckRect?: () => DOMRect | null;
  /** All three cards are Major Arcana: a golden halo glows behind the spread. */
  halo?: boolean;
  /** Once all three are drawn: turn this card over (tap it). */
  onReveal?: (index: number) => void;
  /** Once all three are drawn: turn every card that's still face down. */
  onRevealAll?: () => void;
}

/** Three places for Situation, Obstacle and Advice. Empty until a card is drawn into each. */
export function CardSlots({ drawn, revealed, getDeckRect, halo, onReveal, onRevealAll }: Props) {
  const waiting = onReveal && revealed.some((r, i) => drawn[i] && !r);

  return (
    <>
      <div className="relative isolate flex justify-center gap-3">
        {halo && <div className="major-halo" aria-hidden="true" />}
        {SPREAD_POSITIONS.map((position, i) => {
          const card = drawn[i];
          const label = POSITIONS[position].label;
          return (
            <div key={position} className="flex flex-col items-center gap-2">
              {card ? (
                // key gives each newly drawn card its own flight
                <FlyingCard key={card.cardId} getDeckRect={getDeckRect}>
                  <FlipCard
                    card={card}
                    revealed={revealed[i]}
                    label={label}
                    onReveal={onReveal && !revealed[i] ? () => onReveal(i) : undefined}
                  />
                </FlyingCard>
              ) : (
                <EmptySlot />
              )}
              <span className="font-display text-xs tracking-[0.18em] text-gold-200 uppercase">{label}</span>
            </div>
          );
        })}
      </div>
      {waiting && (
        <div className="mt-1 flex flex-col items-center">
          <p className="text-sm text-cream-300">Tap each card to turn it over.</p>
          {/* The visible, keyboard-reachable way to turn them all at once. */}
          <button
            type="button"
            onClick={onRevealAll}
            className="press min-h-11 px-4 text-sm text-gold-300 underline-offset-4 hover:underline"
          >
            Reveal all cards
          </button>
        </div>
      )}
    </>
  );
}

/**
 * One drawn card. While it's face down and ready, it's a button: tap to turn it over.
 * As it turns, gold light sweeps across it and sparkles burst out; the flourish is
 * only kept for a moment, so it won't replay if the page is shown again later.
 */
function FlipCard({
  card,
  revealed,
  label,
  onReveal,
}: {
  card: DrawnCard;
  revealed: boolean;
  label: string;
  onReveal?: () => void;
}) {
  const reducedMotion = useReducedMotion();
  const [flourish, setFlourish] = useState(false);
  const wasRevealed = useRef(revealed);

  // Start the flourish at the moment this card turns face up.
  useEffect(() => {
    if (revealed && !wasRevealed.current && !reducedMotion) {
      setFlourish(true);
      const timer = setTimeout(() => setFlourish(false), FLOURISH_MS);
      wasRevealed.current = revealed;
      return () => {
        clearTimeout(timer);
        setFlourish(false);
      };
    }
    wasRevealed.current = revealed;
  }, [revealed, reducedMotion]);

  const view = (
    <TarotCardView
      card={CARD_BY_ID.get(card.cardId)!}
      reversed={card.reversed}
      revealed={revealed}
      size="slot"
      flourish={flourish}
    />
  );

  return (
    <div className="relative">
      {onReveal ? (
        <button
          type="button"
          onClick={onReveal}
          aria-label={`Turn over the ${label} card`}
          className="press block rounded-lg"
        >
          {view}
        </button>
      ) : (
        view
      )}
      {flourish &&
        BURST.map(([bx, by], i) => (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="sparkle-burst"
            style={{ ['--bx' as string]: `${bx}px`, ['--by' as string]: `${by}px`, animationDelay: `${350 + i * 40}ms` }}
            aria-hidden="true"
          >
            <path d={SPARKLE} fill="url(#gold-foil)" />
          </svg>
        ))}
    </div>
  );
}

/**
 * Wraps a newly drawn card so it flies in from the deck. Before the browser paints,
 * we measure how far the deck is from this slot and hand that distance to the
 * fly-to-slot animation (index.css) as --dx / --dy.
 */
function FlyingCard({ getDeckRect, children }: { getDeckRect?: () => DOMRect | null; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    const from = getDeckRect?.();
    if (!el || !from) return; // e.g. a reading restored without a deck on screen
    const to = el.getBoundingClientRect();
    el.style.setProperty('--dx', `${from.left + from.width / 2 - (to.left + to.width / 2)}px`);
    el.style.setProperty('--dy', `${from.top + from.height / 2 - (to.top + to.height / 2)}px`);
    el.classList.add('animate-fly-to-slot');
    // Undo it on cleanup, so a re-run (React does this in dev) measures the card at rest.
    return () => el.classList.remove('animate-fly-to-slot');
    // Runs once, when this card first appears.
  }, []);

  return (
    <div ref={ref} className="relative z-10">
      {children}
    </div>
  );
}

function EmptySlot() {
  return (
    <div className="card-slot-w flex aspect-[7/12] items-center justify-center rounded-lg border border-dashed border-gold-600/50 bg-velvet-950/55">
      <svg viewBox="0 0 24 24" className="w-5 opacity-40" aria-hidden="true">
        <path d={SPARKLE} fill="url(#gold-foil)" />
      </svg>
    </div>
  );
}
