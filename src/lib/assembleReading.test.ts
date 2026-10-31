import { describe, expect, it } from 'vitest';
import { CARD_BY_ID, GIFTS, PATTERNS } from '../content';
import type { DrawnCard } from '../types';
import { assembleReading, patternNotes } from './assembleReading';

/** Builds a three-card draw: [cardId, reversed] for Situation, Obstacle, Advice. */
const draw = (...cards: [string, boolean][]): DrawnCard[] =>
  cards.map(([cardId, reversed], i) => ({ cardId, reversed, position: ['situation', 'obstacle', 'advice'][i] }));

describe('assembleReading › the cards', () => {
  const reading = assembleReading('career', draw(['the-sun', false], ['the-tower', true], ['ace-of-cups', false]));

  it('gives each card its position, framing and meaning for the topic', () => {
    expect(reading.cards[0]).toMatchObject({
      position: 'situation',
      positionLabel: 'Situation',
      framing: 'This card describes the situation as it is.',
      cardName: 'The Sun',
      reversed: false,
    });
    expect(reading.cards[0].meaning).toMatch(/^The Sun brings success/);
  });

  it('uses the reversed meaning for a reversed card', () => {
    expect(reading.cards[1].meaning).toMatch(/^Reversed, the Tower/);
  });

  it('gives the same reading for the same input', () => {
    const again = assembleReading('career', draw(['the-sun', false], ['the-tower', true], ['ace-of-cups', false]));
    expect(again).toEqual(reading);
  });
});

describe('patternNotes', () => {
  const kinds = (cards: DrawnCard[]) => patternNotes(cards).map((n) => n.kind);

  it('notes a significant chapter when all three are Major Arcana', () => {
    expect(kinds(draw(['the-fool', false], ['the-star', false], ['the-world', false]))).toEqual(['major_chapter']);
  });

  it('notes a dominant suit with 2 or 3 cards of it', () => {
    const notes = patternNotes(draw(['two-of-cups', false], ['five-of-cups', false], ['ace-of-wands', false]));
    expect(notes).toEqual([{ kind: 'dominant_suit', text: PATTERNS.suits.cups.text }]);
  });

  it('gives no suit note when every card is a different suit or a Major', () => {
    expect(kinds(draw(['two-of-cups', false], ['ace-of-wands', false], ['the-sun', false]))).toEqual([]);
  });

  it('notes internal blocks when 2 or 3 cards are reversed, not 1', () => {
    expect(kinds(draw(['two-of-cups', true], ['ace-of-wands', true], ['the-sun', false]))).toEqual(['reversed_blocks']);
    expect(kinds(draw(['two-of-cups', true], ['ace-of-wands', false], ['the-sun', false]))).toEqual([]);
  });

  it('can give several notes at once', () => {
    expect(kinds(draw(['the-fool', true], ['the-star', true], ['the-world', false]))).toEqual(['major_chapter', 'reversed_blocks']);
  });

  it('gives no notes for fewer than three cards', () => {
    expect(kinds(draw(['the-fool', true], ['the-star', true]))).toEqual([]);
  });
});

describe('the gift message', () => {
  const gift = (cards: DrawnCard[]) => assembleReading('career', cards).gift!;

  it('weaves the Situation, Obstacle and Advice cards into the message', () => {
    const g = gift(draw(['the-sun', false], ['the-tower', true], ['ace-of-cups', false]));
    expect(g.greeting).toBe(GIFTS.greetings.career);
    const [a, b] = CARD_BY_ID.get('the-sun')!.keywords;
    expect(g.lines[0]).toBe(`Right now your story is coloured by ${a} and ${b}.`);
    expect(g.lines[1]).toBe('The Tower sits across your path, asking you to look honestly at upheaval.');
    expect(g.lines[2]).toBe(GIFTS.essence.cups.upright);
    expect(g.wordToCarry).toBe('New feelings');
    expect(g.closing).toBe(GIFTS.closings.career);
  });

  it('uses the reversed guidance when the Advice card is reversed, and a Major Arcana voice for Majors', () => {
    expect(gift(draw(['two-of-cups', false], ['ace-of-wands', false], ['the-star', true])).lines[2]).toBe(GIFTS.essence.major.reversed);
  });

  it('adds the strongest omen of the spread', () => {
    expect(gift(draw(['the-fool', true], ['the-star', true], ['the-world', false])).lines).toContain(GIFTS.omens.major_chapter);
    expect(gift(draw(['two-of-cups', false], ['five-of-cups', false], ['ace-of-wands', false])).lines).toContain(GIFTS.omens.suits.cups);
    expect(gift(draw(['two-of-cups', true], ['ace-of-wands', true], ['the-sun', false])).lines).toContain(GIFTS.omens.reversed_blocks);
  });

  it('keeps the message to three lines when the spread has no omen', () => {
    expect(gift(draw(['two-of-cups', false], ['ace-of-wands', false], ['the-sun', false])).lines).toHaveLength(3);
  });

  it('leaves no unfilled {placeholders}', () => {
    const g = gift(draw(['the-sun', false], ['the-tower', true], ['ace-of-cups', false]));
    expect(g.lines.join(' ')).not.toMatch(/[{}]/);
  });
});
