// Guards the hand-edited JSON files: if a typo breaks a link between them,
// these tests say exactly where.
import { describe, expect, it } from 'vitest';
import { CARDS, PATTERNS, POSITIONS, SPREAD_POSITIONS } from './index';

const CATEGORIES = ['self', 'career', 'relationship', 'family'] as const;

/** Counts sentences by splitting after . ! or ? followed by a space. */
const sentences = (text: string) => text.trim().split(/(?<=[.!?])\s+/).length;

/** Checks a meaning is filled in, 2–3 sentences, and ends with punctuation. */
function expectGoodMeaning(text: string | undefined, where: string) {
  expect(text, where).toBeTruthy();
  expect(text!.trim(), where).toMatch(/[.!?]$/);
  const count = sentences(text!);
  expect(count >= 2 && count <= 3, `${where} has ${count} sentences`).toBe(true);
}

describe('tarot.json', () => {
  it('has 78 cards with unique ids', () => {
    expect(CARDS).toHaveLength(78);
    expect(new Set(CARDS.map((c) => c.id)).size).toBe(78);
  });

  it('has 22 Major Arcana numbered 0–21 and 14 cards per suit', () => {
    const majors = CARDS.filter((c) => c.arcana === 'major');
    expect(majors.map((c) => c.number)).toEqual([...Array(22).keys()]);
    for (const suit of ['wands', 'cups', 'swords', 'pentacles']) {
      expect(CARDS.filter((c) => c.suit === suit).map((c) => c.number)).toEqual([...Array(14).keys()].map((n) => n + 1));
    }
  });

  it('gives every card a valid tone and some keywords', () => {
    for (const card of CARDS) {
      expect(['supportive', 'challenging', 'neutral'], card.id).toContain(card.tone);
      expect(card.keywords.length, card.id).toBeGreaterThan(0);
    }
  });

  it('has upright and reversed meanings for every card in every category', () => {
    for (const card of CARDS) {
      for (const cat of CATEGORIES) {
        expectGoodMeaning(card.meanings?.[cat]?.upright, `${card.id} ${cat} upright`);
        expectGoodMeaning(card.meanings?.[cat]?.reversed, `${card.id} ${cat} reversed`);
      }
    }
  });

  it('never repeats a meaning word for word', () => {
    const all = CARDS.flatMap((c) => CATEGORIES.flatMap((cat) => [c.meanings[cat].upright, c.meanings[cat].reversed]));
    // 78 cards × 4 topics × upright/reversed.
    expect(all).toHaveLength(624);
    expect(new Set(all).size).toBe(624);
  });
});

describe('patterns.json', () => {
  it('has text for every suit', () => {
    for (const suit of ['wands', 'cups', 'swords', 'pentacles'] as const) expect(PATTERNS.suits[suit].text).toBeTruthy();
    expect(PATTERNS.majorChapter && PATTERNS.reversedBlocks).toBeTruthy();
  });
});

describe('positions.json', () => {
  it('has a label and framing sentence for each of the three positions', () => {
    for (const id of SPREAD_POSITIONS) {
      expect(POSITIONS[id]?.label, id).toBeTruthy();
      expect(POSITIONS[id]?.framing, id).toBeTruthy();
    }
  });
});
