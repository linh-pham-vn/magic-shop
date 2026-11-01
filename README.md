# Magic Shop

Magic Shop is a small tarot app. Pick a topic, shuffle three times, and turn over
three cards for a Situation · Obstacle · Advice reading. Runs fully offline: no AI,
no network calls, no accounts. The only thing it remembers is your "Reversed cards"
switch, kept in this browser's localStorage.

## Run it

```bash
npm install
npm run dev      # local dev server
npm test         # unit tests (Vitest)
npm run build    # typecheck + static build into dist/
npm run deploy   # build and publish to GitHub Pages
```

Live at https://linh-pham-vn.github.io/magic-shop/

## How it works

Swipe the crystal ball to pick Self, Career, Relationship or Family, and tap it to
choose (smoke curls up and the shuffle page eases in). Then shuffle three times.
Each shuffle draws one card from the cards still in the deck. Tap each card to turn
it over, and the reading appears below, ending with a message you scratch to reveal.
The round button at the top left starts a new reading. With Reduce motion on, the animations
are skipped.

Card draws use `crypto.getRandomValues` with a Fisher–Yates shuffle. Every word of the
reading comes from static JSON files, so the same cards always give the same reading.

The look: midnight blue-purple velvet (CSS gradients and SVG noise), gold foil stars
and suit icons (SVG), and cut-outs from my own tarot collage in `public/art/`: the
woman holding an orb, a fan of tarot cards (the deck), the black cat, the moon
medallion, a celestial star, the ribbon with a crescent moon, two gold stars and
the crystal ball. Paths live in `src/lib/art.ts`.

## Where things live

- `src/lib/shuffle.ts`: Fisher–Yates shuffle with `crypto.getRandomValues`; `drawOne` draws one card per shuffle
- `src/lib/assembleReading.ts`: builds the written reading (The Cards, A message for you)
- `src/lib/settings.ts`: the Reversed cards switch, remembered in localStorage
- `src/content/`: editable JSON + `index.ts` types
  - `tarot.json` (78 cards, each with upright and reversed meanings for every topic)
  - `patterns.json` (notes on the spread as a whole), `positions.json` (Situation · Obstacle · Advice)
  - `gifts.json` (the scratch-to-reveal message: greetings, lines, closings)
  - `content.test.ts` checks every link between them, so run `npm test` after editing
- `src/features/reading-room/`: crystal ball topic picker, smoke transition, riffle deck, card slots, reading sections
- `src/components/`: shared pieces (buttons, cards, the scratch card, the gold ornaments)
- `src/types.ts`: shared data shapes
