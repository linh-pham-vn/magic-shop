// A spellbook-style title: engraved capitals (Cinzel Decorative draws lowercase as
// small capitals) with a romantic script word sweeping across them.

type Size = 'xl' | 'lg' | 'md' | 'sm';
import { displayFont } from '../lib/text';


// The script line is pulled up so it overlaps the capitals (negative top margin).
const SIZES: Record<Size, { caps: string; script: string }> = {
  xl: { caps: 'text-[clamp(2.3rem,10.5vw,3.3rem)] tracking-[0.01em]', script: 'text-[clamp(3.3rem,15vw,4.8rem)] -mt-[0.42em]' },
  // A short word like CAREER with a longer phrase: the script sits centred underneath, lightly overlapping.
  lg: { caps: 'text-[clamp(1.4rem,7vw,2.4rem)] tracking-[0.01em]', script: 'text-[clamp(2.3rem,10vw,3.1rem)] -mt-[0.22em] !pl-0' },
  md: { caps: 'text-[1.7rem] tracking-[0.02em]', script: 'text-[2.6rem] -mt-[0.4em]' },
  // Wordmark: widely spaced capitals, with the script tucked lower right so both stay legible.
  sm: { caps: 'text-xl tracking-[0.32em] pl-[0.32em]', script: 'text-[2.2rem] -mt-[0.32em] !pl-[46%]' },
};

interface Props {
  /** The bold capital line, e.g. "What are you". */
  caps: string;
  /** The script word(s) that sweep over it, e.g. "seeking?". English only: the script has no Vietnamese accents. */
  script?: string;
  size?: Size;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  align?: 'center' | 'left';
  className?: string;
}

export function SpellTitle({ caps, script, size = 'md', as: Tag = 'h2', align = 'center', className = '' }: Props) {
  const s = SIZES[size];
  return (
    // Screen readers get the words as one plain phrase; the two styled lines are visual only.
    <Tag aria-label={script ? `${caps} ${script}` : caps} className={`${align === 'center' ? 'text-center' : 'text-left'} ${className}`}>
      <span
        aria-hidden="true"
        className={`text-gold-foil block ${displayFont(caps)} leading-[0.95] font-bold ${s.caps}`}
      >
        {caps}
      </span>
      {script && (
        <span
          aria-hidden="true"
          className={`text-script-glow relative block font-script leading-[1.1] ${s.script} ${align === 'center' ? 'pl-[18%]' : 'pl-[22%]'}`}
          style={{ transform: 'rotate(-4deg)' }}
        >
          {script}
        </span>
      )}
    </Tag>
  );
}
