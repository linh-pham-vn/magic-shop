import { describe, expect, it } from 'vitest';
import { cryptoRandomInt, drawOne, shuffle, type RandomInt } from './shuffle';

// The statistics tests run tens of thousands of shuffles. On a busy machine that can pass
// Vitest's default 5-second limit, so they get longer (the result itself is never in doubt).
const STATS_TIMEOUT_MS = 30_000;

/** A predictable "random" source that replays a fixed list of numbers. */
function scripted(values: number[]): RandomInt {
  let i = 0;
  return (max) => {
    const v = values[i++ % values.length];
    if (v >= max) throw new Error(`scripted value ${v} out of range for max ${max}`);
    return v;
  };
}

describe('cryptoRandomInt', () => {
  it('stays within range', () => {
    for (let n = 0; n < 2000; n++) {
      const v = cryptoRandomInt(78);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(78);
      expect(Number.isInteger(v)).toBe(true);
    }
  });
});

describe('shuffle', () => {
  it('returns the same items in a new array, without changing the input', () => {
    const deck = ['a', 'b', 'c', 'd', 'e'];
    const result = shuffle(deck);
    expect([...result].sort()).toEqual(deck);
    expect(deck).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('follows Fisher–Yates swaps exactly', () => {
    // i=3 swaps with 0, i=2 with 2 (no-op), i=1 with 0.
    expect(shuffle(['a', 'b', 'c', 'd'], scripted([0, 2, 0]))).toEqual(['b', 'd', 'c', 'a']);
  });

  it('makes every order of 3 items about equally likely', () => {
    const counts = new Map<string, number>();
    const runs = 60_000;
    for (let n = 0; n < runs; n++) {
      const key = shuffle(['a', 'b', 'c']).join('');
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    expect(counts.size).toBe(6);
    // Each of the 6 orders should come up about 10,000 times; allow ±6%.
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(9_400);
      expect(count).toBeLessThan(10_600);
    }
  }, STATS_TIMEOUT_MS);
});

describe('drawOne', () => {
  const deck = Array.from({ length: 78 }, (_, i) => `card-${i}`);

  it('takes one card for the position and returns the deck without it', () => {
    const { drawn, remaining } = drawOne(deck, 'situation', true);
    expect(drawn.position).toBe('situation');
    expect(deck).toContain(drawn.cardId);
    expect(remaining).toHaveLength(77);
    expect(remaining).not.toContain(drawn.cardId);
  });

  it('never repeats a card across three shuffles', () => {
    for (let n = 0; n < 500; n++) {
      let rest: string[] = deck;
      const ids: string[] = [];
      for (const position of ['situation', 'obstacle', 'advice']) {
        const result = drawOne(rest, position, true);
        ids.push(result.drawn.cardId);
        rest = result.remaining;
      }
      expect(new Set(ids).size).toBe(3);
      expect(rest).toHaveLength(75);
    }
  });

  it('never reverses cards when reversals are off', () => {
    for (let n = 0; n < 200; n++) expect(drawOne(deck, 'x', false).drawn.reversed).toBe(false);
  });

  it('reverses roughly half the cards when reversals are on', () => {
    let reversed = 0;
    const draws = 2_000;
    for (let n = 0; n < draws; n++) if (drawOne(deck, 'x', true).drawn.reversed) reversed++;
    expect(reversed / draws).toBeGreaterThan(0.45);
    expect(reversed / draws).toBeLessThan(0.55);
  }, STATS_TIMEOUT_MS);

  it('gives every card an equal chance to be drawn', () => {
    const small = ['a', 'b', 'c', 'd'];
    const counts = new Map<string, number>();
    for (let n = 0; n < 40_000; n++) {
      const id = drawOne(small, 'x', false).drawn.cardId;
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
    // Each should come up about 10,000 times; allow ±5%.
    for (const count of counts.values()) {
      expect(count).toBeGreaterThan(9_500);
      expect(count).toBeLessThan(10_500);
    }
  }, STATS_TIMEOUT_MS);
});
