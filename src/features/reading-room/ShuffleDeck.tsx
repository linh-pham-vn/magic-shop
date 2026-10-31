import type { RefObject } from 'react';
import { CardBack } from '../../components/TarotCardView';
import { ART } from '../../lib/art';

interface Props {
  riffling: boolean;
  /** How many cards have been drawn so far (0–3). */
  drawnCount: number;
  cardsLeft: number;
  onShuffle: () => void;
  /** Lets the Reading Room measure where the deck is, so drawn cards fly from it. */
  deckRef?: RefObject<HTMLButtonElement | null>;
}

/**
 * The deck: a fan of tarot cards cut from your collage. Each tap shuffles:
 * the fan sways while a few cards riffle out and back, then one card is drawn.
 * Three taps, three cards.
 */
export function ShuffleDeck({ riffling, drawnCount, cardsLeft, onShuffle, deckRef }: Props) {
  const done = drawnCount >= 3;
  const label = riffling ? 'Shuffling…' : `Shuffle · ${drawnCount + 1} of 3`;

  return (
    <div className="flex flex-col items-center gap-[clamp(0.5rem,2dvh,1rem)]">
      <button
        ref={deckRef}
        type="button"
        onClick={onShuffle}
        disabled={riffling || done}
        aria-label={done ? 'All three cards drawn' : label}
        className="deck-w press relative"
      >
        <img
          src={ART.tarotFan}
          alt="A fan of tarot cards"
          className={`collage-cutout w-full ${riffling ? 'animate-deck-sway' : ''}`}
        />
        {/* Cards fluttering out of the fan while shuffling. */}
        {riffling &&
          [0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`absolute top-[30%] left-[42%] aspect-[7/12] w-12 ${i % 2 ? 'animate-riffle-right' : 'animate-riffle-left'}`}
              style={{ animationDelay: `${i * 70}ms` }}
              aria-hidden="true"
            >
              <CardBack />
            </div>
          ))}
      </button>

      <p className="text-xs tracking-wide text-cream-500">{cardsLeft} cards in the deck</p>

      {!done && (
        <button
          type="button"
          onClick={onShuffle}
          disabled={riffling}
          className="min-h-11 rounded-full border border-gold-500 bg-gradient-to-b from-gold-300 to-gold-500 px-7 py-2.5 font-display text-base font-semibold tracking-[0.14em] text-velvet-950 uppercase shadow-lg shadow-velvet-950/50 press sheen disabled:opacity-60"
        >
          {label}
        </button>
      )}
    </div>
  );
}
