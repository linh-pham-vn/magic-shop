// Typed access to the static JSON content. The JSON files are the source of
// truth (edit them freely); this file only describes their shape and builds
// quick lookups. content.test.ts checks the files match these shapes.
import type { Category } from '../types';
import giftsData from './gifts.json';
import patternsData from './patterns.json';
import positionsData from './positions.json';
import tarotData from './tarot.json';

export type Suit = 'wands' | 'cups' | 'swords' | 'pentacles';
export type Tone = 'supportive' | 'challenging' | 'neutral';

export interface CardMeaning {
  upright: string;
  reversed: string;
}

export interface TarotCard {
  id: string;
  name: string;
  arcana: 'major' | 'minor';
  /** Majors 0–21; minors 1–14 (Ace = 1 … Page 11, Knight 12, Queen 13, King 14). */
  number: number;
  suit: Suit | null;
  keywords: string[];
  tone: Tone;
  meanings: Record<Category, CardMeaning>;
}

export interface Position {
  label: string;
  framing: string;
}

export interface Patterns {
  majorChapter: string;
  suits: Record<Suit, { theme: string; text: string }>;
  reversedBlocks: string;
}

/** Building blocks for the gift message. {placeholders} are filled in by code. */
export interface Gifts {
  greetings: Record<Category, string>;
  situation: string;
  obstacle: string;
  essence: Record<Suit | 'major', CardMeaning>;
  omens: {
    major_chapter: string;
    reversed_blocks: string;
    suits: Record<Suit, string>;
  };
  closings: Record<Category, string>;
}

// JSON imports are typed loosely by TypeScript, so we state the real shapes here.
export const CARDS = tarotData as TarotCard[];
export const POSITIONS = positionsData as Record<string, Position>;
export const PATTERNS = patternsData as Patterns;
export const GIFTS = giftsData as Gifts;

export const CARD_BY_ID = new Map(CARDS.map((c) => [c.id, c]));

/** Every reading is the same three-card spread, dealt in this order. */
export const SPREAD_POSITIONS = ['situation', 'obstacle', 'advice'] as const;
export const SPREAD_NAME = 'Situation · Obstacle · Advice';

export const CATEGORIES: { key: Category; label: string }[] = [
  { key: 'self', label: 'Self' },
  { key: 'career', label: 'Career' },
  { key: 'relationship', label: 'Relationship' },
  { key: 'family', label: 'Family' },
];
