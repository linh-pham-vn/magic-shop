// Card shuffling with the browser's cryptographic random number generator.
import type { DrawnCard } from '../types';

/** Returns a whole number from 0 up to (but not including) `max`. */
export type RandomInt = (max: number) => number;

/**
 * A fair random integer in [0, max) from crypto.getRandomValues.
 *
 * Why the loop: a random 32-bit number has 4,294,967,296 possible values.
 * If that doesn't divide evenly by `max`, `value % max` would land on the
 * low numbers slightly more often. So we throw away values from the uneven
 * "leftover" at the top and draw again (this almost never happens).
 */
export function cryptoRandomInt(max: number): number {
  const limit = Math.floor(0x1_0000_0000 / max) * max;
  const buffer = new Uint32Array(1);
  do {
    crypto.getRandomValues(buffer);
  } while (buffer[0] >= limit);
  return buffer[0] % max;
}

/**
 * Fisher–Yates shuffle: walk from the last item to the first, swapping each
 * with a randomly chosen item at or before it. Every order is equally likely.
 * Returns a new array; the input is left untouched.
 * `randomInt` can be swapped for a predictable one in tests.
 */
export function shuffle<T>(items: readonly T[], randomInt: RandomInt = cryptoRandomInt): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * One shuffle, one card: shuffles the cards still in the deck and takes the top one.
 * Returns the drawn card and the deck without it, so the next shuffle can't repeat it.
 * The card has a 50% chance of being reversed, unless reversals are off.
 */
export function drawOne(
  deck: readonly string[],
  position: string,
  allowReversed: boolean,
  randomInt: RandomInt = cryptoRandomInt,
): { drawn: DrawnCard; remaining: string[] } {
  const [top, ...remaining] = shuffle(deck, randomInt);
  return {
    drawn: { cardId: top, position, reversed: allowReversed && randomInt(2) === 1 },
    remaining,
  };
}
