// Turns a draw into the written reading, using only the static content files.
// Pure function: the same cards and topic always give the same reading.
import { CARD_BY_ID, GIFTS, PATTERNS, POSITIONS, type Suit } from '../content';
import type { AssembledCard, AssembledReading, Category, DrawnCard, GiftMessage, PatternNote } from '../types';

/** Pattern rules only make sense with a few cards on the table. */
const MIN_CARDS_FOR_PATTERNS = 3;
/** "A significant life chapter" needs at least this many Major Arcana. */
const MAJORS_FOR_CHAPTER = 3;

export function assembleReading(category: Category, cards: DrawnCard[]): AssembledReading {
  const assembled = {
    cards: cards.map((drawn): AssembledCard => {
      const card = CARD_BY_ID.get(drawn.cardId)!;
      const position = POSITIONS[drawn.position];
      return {
        position: drawn.position,
        positionLabel: position.label,
        framing: position.framing,
        cardId: card.id,
        cardName: card.name,
        reversed: drawn.reversed,
        keywords: card.keywords,
        meaning: card.meanings[category][drawn.reversed ? 'reversed' : 'upright'],
      };
    }),
    patternNotes: patternNotes(cards),
  };
  return { ...assembled, gift: giftMessage(category, assembled.cards, assembled.patternNotes) };
}

/** Notes about the spread as a whole: many Major Arcana, one suit leading, many reversals. */
export function patternNotes(cards: DrawnCard[]): PatternNote[] {
  if (cards.length < MIN_CARDS_FOR_PATTERNS) return [];
  const notes: PatternNote[] = [];
  const details = cards.map((d) => CARD_BY_ID.get(d.cardId)!);

  const majors = details.filter((c) => c.arcana === 'major').length;
  if (majors >= MAJORS_FOR_CHAPTER) notes.push({ kind: 'major_chapter', text: PATTERNS.majorChapter });

  // Count cards per suit (Major Arcana have no suit). A suit "leads" with 2+ cards
  // and strictly more than any other suit — a tie means no single theme.
  const counts = new Map<Suit, number>();
  for (const c of details) if (c.suit) counts.set(c.suit, (counts.get(c.suit) ?? 0) + 1);
  const ranked = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [top, second] = ranked;
  if (top && top[1] >= 2 && (!second || top[1] > second[1])) {
    notes.push({ kind: 'dominant_suit', text: PATTERNS.suits[top[0]].text });
  }

  // "Half or more reversed": with 3 cards that means 2 or 3.
  const reversed = cards.filter((c) => c.reversed).length;
  if (reversed * 2 >= cards.length) notes.push({ kind: 'reversed_blocks', text: PATTERNS.reversedBlocks });

  return notes;
}

/** Fills {name} placeholders in a content string. */
function fill(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? '');
}

/**
 * The gift: a short letter woven from the whole reading. It names the Situation's
 * mood, the Obstacle in your way, the Advice card's guidance and the strongest omen
 * in the spread, then leaves you one word to carry.
 */
export function giftMessage(
  category: Category,
  cards: AssembledCard[],
  notes: PatternNote[],
): GiftMessage | undefined {
  const byPosition = (p: string) => cards.find((c) => c.position === p);
  const situation = byPosition('situation');
  const obstacle = byPosition('obstacle');
  const advice = byPosition('advice');
  if (!situation || !obstacle || !advice) return undefined; // only for the full spread

  const adviceCard = CARD_BY_ID.get(advice.cardId)!;
  const lines = [
    fill(GIFTS.situation, { a: situation.keywords[0], b: situation.keywords[1] }),
    fill(GIFTS.obstacle, { card: obstacle.cardName, word: obstacle.keywords[0] }),
    GIFTS.essence[adviceCard.suit ?? 'major'][advice.reversed ? 'reversed' : 'upright'],
  ];

  // The strongest omen only, so the message stays short: a Major chapter, then a leading suit, then reversals.
  const omen = notes[0];
  if (omen?.kind === 'major_chapter') lines.push(GIFTS.omens.major_chapter);
  else if (omen?.kind === 'dominant_suit') {
    const suit = leadingSuit(cards);
    if (suit) lines.push(GIFTS.omens.suits[suit]);
  } else if (omen?.kind === 'reversed_blocks') lines.push(GIFTS.omens.reversed_blocks);

  const word = advice.keywords[0];
  return {
    greeting: GIFTS.greetings[category],
    lines,
    wordToCarry: word.charAt(0).toUpperCase() + word.slice(1),
    closing: GIFTS.closings[category],
  };
}

/** The suit with the most cards (2+), as patternNotes decides it. */
function leadingSuit(cards: AssembledCard[]): Suit | null {
  const counts = new Map<Suit, number>();
  for (const c of cards) {
    const suit = CARD_BY_ID.get(c.cardId)!.suit;
    if (suit) counts.set(suit, (counts.get(suit) ?? 0) + 1);
  }
  const [top] = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  return top && top[1] >= 2 ? top[0] : null;
}
