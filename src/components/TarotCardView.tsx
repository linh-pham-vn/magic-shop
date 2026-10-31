import type { ReactNode } from 'react';
import type { Suit, TarotCard } from '../content';
import { SPARKLE } from './GoldOrnaments';

const SIZES = {
  sm: 'w-[4.5rem]',
  md: 'w-24',
  lg: 'w-40',
  // The Reading Room slots: sized in index.css (.card-slot-w), which also handles a phone turned sideways.
  slot: 'card-slot-w',
};

export type CardSize = keyof typeof SIZES;

interface Props {
  card: TarotCard;
  reversed: boolean;
  /** false = showing the back; true = flipped to the face. */
  revealed: boolean;
  size?: CardSize;
  /** Play the turning-over flourish: a gold sweep, and a reversed card turning upside down. */
  flourish?: boolean;
}

/** A tarot card that flips from its back to its face when `revealed` turns true. */
export function TarotCardView({ card, reversed, revealed, size = 'md', flourish = false }: Props) {
  // A reversed card is drawn upside down. During the flourish it turns there by animation;
  // Tailwind's rotate-180 would add to that turn, so it's only used once the flourish is over.
  const turn = reversed ? (flourish ? 'animate-reverse-turn' : 'rotate-180') : '';
  return (
    <div
      className={`card-scene aspect-[7/12] ${SIZES[size]}`}
      role="img"
      aria-label={revealed ? `${card.name}${reversed ? ', reversed' : ''}` : 'Face-down card'}
    >
      <div className={`card-inner ${revealed ? 'is-revealed' : ''}`}>
        <div className="card-side">
          <CardBack />
        </div>
        <div className="card-side card-front overflow-hidden rounded-lg">
          <div className={`h-full w-full ${turn}`}>
            <CardFace card={card} size={size} />
          </div>
          {flourish && revealed && <div className="card-sweep" aria-hidden="true" />}
        </div>
      </div>
    </div>
  );
}

/** Card back: velvet with a gold lattice, a double gold frame, a sun in the middle and a star in each corner. */
export function CardBack() {
  return (
    <div className="card-back-pattern h-full w-full rounded-lg border border-gold-500/80 p-[5%] shadow-lg shadow-velvet-950/70">
      <div className="relative flex h-full w-full items-center justify-center rounded-md border border-gold-500/50">
        <svg viewBox="0 0 24 24" className="gold-relief w-1/2" aria-hidden="true">
          <circle cx="12" cy="12" r="11" fill="none" stroke="url(#gold-foil)" strokeWidth="0.5" />
          <path d={SUN_RAYS_SMALL} fill="url(#gold-foil)" />
          <circle cx="12" cy="12" r="3.6" fill="url(#gold-foil)" />
        </svg>
        {['top-[4%] left-[6%]', 'top-[4%] right-[6%]', 'bottom-[4%] left-[6%]', 'bottom-[4%] right-[6%]'].map((corner) => (
          <svg key={corner} viewBox="0 0 24 24" className={`absolute w-[14%] ${corner}`} aria-hidden="true">
            <path d={SPARKLE} fill="url(#gold-foil)" />
          </svg>
        ))}
      </div>
    </div>
  );
}

/** Twelve slim rays for the sun on the card back. */
const SUN_RAYS_SMALL = Array.from({ length: 12 }, (_, i) => {
  const a = (i * Math.PI) / 6;
  const p = (r: number, ang: number) => `${(12 + r * Math.cos(ang)).toFixed(2)},${(12 + r * Math.sin(ang)).toFixed(2)}`;
  return `M${p(4, a - 0.2)} L${p(i % 2 ? 7.5 : 9.5, a)} L${p(4, a + 0.2)} Z`;
}).join(' ');

const ROMAN = ['0', 'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX', 'XXI'];
const MINOR_RANK = ['', 'A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'P', 'Kn', 'Q', 'K'];

/** Corner mark: a Roman numeral for Majors, a rank for Minors. */
function rankMark(card: TarotCard): string {
  return card.arcana === 'major' ? ROMAN[card.number] : MINOR_RANK[card.number];
}

/** Card face: number at the top, the gold suit symbol (or a star for Major Arcana), the name below. */
function CardFace({ card, size }: { card: TarotCard; size: CardSize }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-between rounded-lg border border-gold-400 bg-gradient-to-b from-velvet-800 to-velvet-950 p-1.5 shadow-lg shadow-velvet-950/70 ring-1 ring-gold-600/40 ring-inset">
      <span className={`text-gold-foil font-display font-semibold ${size === 'lg' ? 'text-lg' : size === 'slot' ? 'text-sm' : 'text-xs'}`}>
        {rankMark(card)}
      </span>
      <SuitIcon card={card} className="w-1/2" />
      <span
        className={`text-center leading-tight font-display text-gold-200 ${size === 'lg' ? 'text-base' : 'text-xs'}`}
      >
        {card.name}
      </span>
    </div>
  );
}

/** The card's suit symbol in gold line art, or a star for the Major Arcana. */
export function SuitIcon({ card, className = '' }: { card: TarotCard; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`gold-relief ${className}`}
      fill="none"
      stroke="url(#gold-foil)"
      strokeWidth={1.2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {card.suit ? SUIT_ICONS[card.suit] : <path d={MAJOR_STAR} />}
    </svg>
  );
}

const MAJOR_STAR = 'M12 3l1.8 6.2L20 11l-6.2 1.8L12 19l-1.8-6.2L4 11l6.2-1.8z';

// Simple line drawings, one per suit.
const SUIT_ICONS: Record<Suit, ReactNode> = {
  // A budding staff.
  wands: <path d="M12 3v18M12 7l3-2.5M12 11l-3-2.5M12 15l3-2.5" />,
  // A chalice.
  cups: <path d="M6 4h12v3a6 6 0 0 1-12 0zM12 13v6M8 20h8" />,
  // An upright sword with a crossguard.
  swords: <path d="M12 2l1.5 3v11h-3V5zM7.5 16h9M12 16v4M10.5 21h3" />,
  // A coin with a pentagram.
  pentacles: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 5L16.1 17.7 5.3 9.8h13.4L7.9 17.7z" />
    </>
  ),
};
