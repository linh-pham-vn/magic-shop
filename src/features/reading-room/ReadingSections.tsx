import { Children, type ReactNode } from 'react';
import { Card } from '../../components/Card';
import { Reveal } from '../../components/Reveal';
import { ScratchReveal } from '../../components/ScratchReveal';
import { SpellTitle } from '../../components/SpellTitle';
import { CARD_BY_ID } from '../../content';
import { SuitIcon } from '../../components/TarotCardView';
import type { AssembledReading, GiftMessage } from '../../types';

/** The written reading: The Cards, then a personal message to scratch open. */
export function ReadingSections({ reading }: { reading: AssembledReading }) {
  return (
    <div className="space-y-6">
      <Section title="The Cards" caps="The cards" script="speak">
        {reading.cards.map((c) => (
          <Card key={c.position}>
            <div className="flex items-center gap-3">
              <SuitIcon card={CARD_BY_ID.get(c.cardId)!} className="h-9 w-9 shrink-0" />
              <div>
                <p className="text-xs tracking-wide text-cream-500 uppercase">{c.positionLabel}</p>
                <h3 className="mt-0.5 font-display text-lg font-semibold tracking-[0.03em] text-gold-300">
                  {c.cardName}
                  {c.reversed && <span className="ml-2 align-middle font-sans text-xs font-normal text-cream-300">Reversed</span>}
                </h3>
              </div>
            </div>
            <p className="mt-1 text-xs text-gold-400">{c.keywords.join(' · ')}</p>
            <p className="mt-2 text-sm text-cream-300">{c.framing}</p>
            <p className="mt-2 text-sm text-cream-100">{c.meaning}</p>
          </Card>
        ))}
      </Section>

      {reading.gift && (
        <Section title="A message for you" caps="A message" script="for you">
          <ScratchReveal hint="your message">
            <GiftCard gift={reading.gift} />
          </ScratchReveal>
        </Section>
      )}
    </div>
  );
}

/**
 * A section with a capitals-and-script title, e.g. "THE CARDS" + "speak". `title` is the plain name for screen readers.
 * As you scroll down, the title rises into view first, then each card follows a beat later.
 */
function Section({ title, caps, script, children }: { title: string; caps: string; script: string; children: ReactNode }) {
  return (
    <section aria-label={title}>
      <Reveal>
        <SpellTitle caps={caps} script={script} size="md" align="left" className="mb-2" />
      </Reveal>
      <div className="space-y-3">
        {Children.toArray(children).map((child, i) => (
          <Reveal key={i} delayMs={(i + 1) * 110}>
            {child}
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** The gift: a short letter from the reading, signed off with one word to carry with you. */
function GiftCard({ gift }: { gift: GiftMessage }) {
  return (
    <Card className="text-center">
      <p className="text-script-glow font-script text-3xl leading-tight text-gold-300">{gift.greeting}</p>
      <div className="mt-3 space-y-2 text-sm leading-relaxed text-cream-100">
        {gift.lines.map((line) => (
          <p key={line}>{line}</p>
        ))}
      </div>
      <div className="mx-auto my-4 h-px w-1/2 bg-gradient-to-r from-transparent via-gold-500/70 to-transparent" />
      <p className="text-xs tracking-[0.2em] text-cream-500 uppercase">Your word to carry</p>
      <p className="text-gold-foil mt-1 font-display text-2xl font-bold tracking-[0.06em]">{gift.wordToCarry}</p>
      <p className="mt-3 text-sm text-cream-300 italic">{gift.closing}</p>
    </Card>
  );
}
