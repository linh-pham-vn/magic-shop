import type { ReactNode } from 'react';
import { displayFont } from '../lib/text';

interface Props {
  title?: string;
  hint?: string;
  children: ReactNode;
  className?: string;
}

/** A soft panel with an optional serif heading. */
export function Card({ title, hint, children, className = '' }: Props) {
  return (
    <section className={`rounded-2xl border border-velvet-600/70 bg-velvet-800/85 p-4 ${className}`}>
      {title && <h2 className={`${displayFont(title)} text-lg font-semibold tracking-[0.04em] text-gold-300`}>{title}</h2>}
      {hint && <p className="mt-0.5 text-xs text-cream-500">{hint}</p>}
      {title || hint ? <div className="mt-3">{children}</div> : children}
    </section>
  );
}
