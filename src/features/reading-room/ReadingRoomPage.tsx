import { useEffect, useRef, useState } from 'react';
import { Button } from '../../components/Button';
import { SpellTitle } from '../../components/SpellTitle';
import { Toggle } from '../../components/Toggle';
import { useReducedMotion } from '../../components/useReducedMotion';
import { CARD_BY_ID, CARDS, CATEGORIES, SPREAD_NAME, SPREAD_POSITIONS } from '../../content';
import { ART } from '../../lib/art';
import { assembleReading } from '../../lib/assembleReading';
import { useSettings } from '../../lib/settings';
import { drawOne } from '../../lib/shuffle';
import type { AssembledReading, Category, DrawnCard } from '../../types';
import { CardSlots } from './CardSlots';
import { ReadingSections } from './ReadingSections';
import { ShuffleDeck } from './ShuffleDeck';
import { SMOKE_MS, SMOKE_PEAK_MS, SmokeTransition } from './SmokeTransition';
import { TopicOrb } from './TopicOrb';

const RIFFLE_MS = 1100; // matches the riffle animation in index.css
const ALL_FACE_DOWN = [false, false, false];
const FULL_DECK = CARDS.map((c) => c.id);

/**
 * The home screen. Choose a topic, shuffle three times (one card each time),
 * then tap each card to turn it over. The reading appears once all three are face up.
 */
export function ReadingRoomPage() {
  const [settings, updateSettings] = useSettings();
  const reducedMotion = useReducedMotion();

  const [category, setCategory] = useState<Category | null>(null);
  // While choosing a topic: where the crystal ball is, so the smoke can billow out of it.
  const [smoke, setSmoke] = useState<{ x: number; y: number } | null>(null);
  const smokeTimers = useRef<number[]>([]);
  useEffect(() => () => smokeTimers.current.forEach(clearTimeout), []); // tidy up if you leave mid-smoke
  const [deck, setDeck] = useState<string[]>(FULL_DECK); // cards not yet drawn
  const [drawn, setDrawn] = useState<DrawnCard[]>([]);
  const [riffling, setRiffling] = useState(false);
  const [record, setRecord] = useState<AssembledReading | null>(null); // the written reading, once all three are drawn
  const [revealed, setRevealed] = useState<boolean[]>(ALL_FACE_DOWN); // face up, by slot
  // The deck, and where it was on screen when the latest card was drawn (the card flies from there).
  const deckRef = useRef<HTMLButtonElement>(null);
  const deckRectRef = useRef<DOMRect | null>(null);

  // Tapping the crystal ball: wisps of smoke curl up, the home screen dissolves, and the shuffle page eases in through the smoke.
  const pickTopic = (topic: Category, ball: DOMRect) => {
    if (smoke) return;
    if (reducedMotion) {
      setCategory(topic);
      return;
    }
    setSmoke({ x: ball.left + ball.width / 2, y: ball.top + ball.height * 0.36 }); // the middle of the glass
    smokeTimers.current = [
      window.setTimeout(() => {
        setCategory(topic);
        window.scrollTo(0, 0);
      }, SMOKE_PEAK_MS),
      window.setTimeout(() => setSmoke(null), SMOKE_MS),
    ];
  };

  const shuffle = () => {
    if (!category || riffling || drawn.length >= 3) return;
    setRiffling(true);
    setTimeout(
      () => {
        // Note where the deck is now; after the third card the deck leaves the screen.
        deckRectRef.current = deckRef.current?.getBoundingClientRect() ?? null;
        // A fresh shuffle of the cards still in the deck; the top card goes to the next slot.
        const { drawn: card, remaining } = drawOne(deck, SPREAD_POSITIONS[drawn.length], settings.reversals);
        const cards = [...drawn, card];
        setDeck(remaining);
        setDrawn(cards);
        setRiffling(false);
        if (cards.length === 3) setRecord(assembleReading(category, cards));
      },
      reducedMotion ? 0 : RIFFLE_MS,
    );
  };

  const startOver = () => {
    setCategory(null);
    setDeck(FULL_DECK);
    setDrawn([]);
    setRecord(null);
    setRevealed(ALL_FACE_DOWN);
    window.scrollTo(0, 0);
  };

  const topicLabel = CATEGORIES.find((c) => c.key === category)?.label;
  const allRevealed = record !== null && revealed.every(Boolean);

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] flex-col">
      {/* Before a topic is picked, the heading and tiles sit in the middle of the screen. */}
      <div
        className={`${category ? '' : 'my-auto pt-4'} ${
          // During the smoke: home dissolves away, then the shuffle page eases in.
          smoke ? (category ? 'animate-ease-in' : 'animate-dissolve-out') : ''
        }`}
      >
        <header className={`mb-[clamp(1rem,3.5dvh,2rem)] text-center ${category ? 'mt-[clamp(0.25rem,2dvh,2rem)]' : ''}`}>
          {!category && (
            <>
              {/* The shop's name, in the same capitals-and-script style as the titles. */}
              <SpellTitle as="p" caps="Magic" script="shop" size="sm" className="mx-auto mb-[clamp(0.25rem,2dvh,1rem)] w-fit" />
              {/* The woman holding the orb, from your collage, watches over the question. */}
              <img
                src={ART.womanOrb}
                alt=""
                className="animate-orb-glow mx-auto mb-1 h-[clamp(6rem,17dvh,10rem)] w-auto"
              />
            </>
          )}
          <SpellTitle
            as="h1"
            size={category ? 'lg' : 'xl'}
            caps={category ? topicLabel! : 'What are you'}
            // A different whisper for each moment of the reading.
            script={!category ? 'seeking?' : drawn.length < 3 ? 'let fate choose' : 'the cards have spoken'}
          />
          {/* While shuffling, the Shuffle button says what to do, so no extra line is needed. */}
          {(!category || drawn.length === 3) && (
            <p className="mt-1 text-sm text-cream-300">{!category ? 'Choose a topic to begin.' : SPREAD_NAME}</p>
          )}
          {category && drawn.length === 0 && (
            <button
              type="button"
              onClick={() => setCategory(null)}
              className="press mt-1 min-h-11 px-3 text-sm text-gold-400 underline-offset-4 hover:underline"
            >
              Change topic
            </button>
          )}
        </header>

        {!category ? (
          <TopicOrb onPick={pickTopic} disabled={smoke !== null} />
        ) : (
          // spread-row: deck and slots side by side on a phone turned sideways (index.css).
          <div className="spread-row space-y-[clamp(1rem,3dvh,2rem)]">
            {drawn.length < 3 && (
              <ShuffleDeck
                deckRef={deckRef}
                riffling={riffling}
                drawnCount={drawn.length}
                cardsLeft={deck.length}
                onShuffle={shuffle}
              />
            )}
            <CardSlots
              drawn={drawn}
              revealed={revealed}
              getDeckRect={() => deckRectRef.current}
              // A rare, powerful spread: all three cards from the Major Arcana, once they're face up.
              halo={allRevealed && drawn.length === 3 && drawn.every((d) => CARD_BY_ID.get(d.cardId)?.arcana === 'major')}
              // The cards can only be turned once all three are drawn (and the reading is ready).
              onReveal={record ? (i) => setRevealed((r) => r.map((up, j) => up || j === i)) : undefined}
              onRevealAll={() => setRevealed([true, true, true])}
            />
          </div>
        )}
      </div>

      {/*
        A short, invisible announcement for screen readers once the cards are turned.
        (Announcing the whole reading would read out hundreds of words unasked.)
      */}
      <p aria-live="polite" className="sr-only">
        {record && allRevealed ? 'Your reading is ready below.' : ''}
      </p>
      {record && allRevealed && (
        <div className="animate-deal-in mt-10 space-y-6">
          <ReadingSections reading={record} />
          <Button onClick={startOver} className="w-full">
            New reading
          </Button>
        </div>
      )}

      <footer className="mt-auto pt-[clamp(1.5rem,5dvh,3rem)]">
        <div className="mb-3 text-center">
          {/* When on, each card has a 50% chance of being drawn upside down (reversed). */}
          <Toggle
            label="Reversed cards"
            checked={settings.reversals}
            onChange={(reversals) => updateSettings({ reversals })}
          />
        </div>
        {/* The black cat from your collage keeps watch at the bottom of the page. */}
        <img src={ART.blackCat} alt="" className="collage-cutout mx-auto -mb-1 h-[clamp(4.5rem,11dvh,6.5rem)] w-auto" />
      </footer>
      {smoke && <SmokeTransition from={smoke} />}
    </div>
  );
}

