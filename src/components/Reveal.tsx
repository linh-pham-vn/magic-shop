import { useEffect, useRef, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Extra wait before this item rises in, so items in a group arrive one after another. */
  delayMs?: number;
}

/**
 * Fades and lifts its contents into place the first time they scroll into view.
 * The look lives in index.css (.reveal / .is-visible); with reduced motion the
 * contents are simply shown.
 */
export function Reveal({ children, delayMs = 0 }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Very old browsers without IntersectionObserver: just show it.
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-visible');
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        el.classList.add('is-visible');
        observer.disconnect(); // only animate in once
      },
      // Start a little before it's fully on screen, so it's moving as you reach it.
      { rootMargin: '0px 0px -8% 0px', threshold: 0.1 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="reveal" style={{ ['--reveal-delay' as string]: `${delayMs}ms` }}>
      {children}
    </div>
  );
}
