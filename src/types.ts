// Shared data shapes used across the app.

export type Category = 'self' | 'career' | 'relationship' | 'family';

/** App preferences, remembered in this browser. */
export interface AppSettings {
  /** When false, cards are never drawn reversed. */
  reversals: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = { reversals: true };

export interface DrawnCard {
  cardId: string;
  position: string;
  reversed: boolean;
}

// ---------- Readings ----------

/** One card as it appears in a finished reading. */
export interface AssembledCard {
  position: string;
  positionLabel: string;
  framing: string;
  cardId: string;
  cardName: string;
  reversed: boolean;
  keywords: string[];
  meaning: string;
}

export interface PatternNote {
  kind: 'major_chapter' | 'dominant_suit' | 'reversed_blocks';
  text: string;
}

/** A short personal message composed from the whole reading, revealed by scratching. */
export interface GiftMessage {
  greeting: string;
  /** A few sentences, one per thread of the reading (the cards, then any omen). */
  lines: string[];
  /** One word from the Advice card to take away with you. */
  wordToCarry: string;
  closing: string;
}

/** The full written reading. */
export interface AssembledReading {
  cards: AssembledCard[];
  patternNotes: PatternNote[];
  gift?: GiftMessage;
}
