// Cut-outs from your own tarot collage, bundled in public/art/.
// They were lifted out with macOS's built-in subject cut-out while building
// the app; at runtime they're plain image files.

// BASE_URL keeps the paths right if the app is ever served from a sub-folder.
const art = (file: string) => `${import.meta.env.BASE_URL}art/${file}`;

export const ART = {
  /** The woman in black holding up an orb. Native 162 × 283. */
  womanOrb: art('woman-orb.png'),
  /** A fan of three tarot cards (The Sun in front). Native 333 × 293. */
  tarotFan: art('tarot-fan.png'),
  /** The black cat with golden eyes. Native 151 × 296. */
  blackCat: art('black-cat.png'),
  /** Engraved crescent moon in a starry medallion. Native 181 × 183. */
  moonMedallion: art('moon-medallion.png'),
  /** Gold star with a navy centre. Native 114 × 121. */
  celestialStar: art('celestial-star.png'),
  /** Blue ribbon with a little crescent moon. Native 214 × 532. */
  ribbonMoon: art('ribbon-moon.png'),
  /** Two padded gold stars. Native 120 × 153. */
  goldStars: art('gold-stars.png'),
  /** A watercolour crystal ball on a gold stand (your painting). Native 431 × 560; the glass is the top 70%. */
  crystalBall: art('crystal-ball.png'),
};
