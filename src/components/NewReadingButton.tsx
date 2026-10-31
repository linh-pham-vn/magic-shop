/**
 * The round gold button in the top-left corner, on every screen: tap it to
 * start a new reading from wherever you are.
 */
export function NewReadingButton({ onClick }: { onClick: () => void }) {
  return (
    // Fixed to the screen and lined up with the app's centre column, so it never scrolls away.
    <div
      className="app-column pointer-events-none fixed inset-x-0 top-0 z-30 mx-auto max-w-md px-3"
      // Level with the top of the page content (the page starts 1.5rem down).
      style={{ paddingTop: 'calc(1.5rem - 2px + env(safe-area-inset-top))' }}
    >
      <button
        type="button"
        onClick={onClick}
        aria-label="New reading"
        title="New reading"
        className="press pointer-events-auto flex h-12 w-12 items-center justify-center rounded-full border border-gold-600/60 bg-velvet-900/80 shadow-lg shadow-velvet-950/60 backdrop-blur-sm hover:border-gold-400"
      >
        {/* A circling arrow (start again) with a little twinkling star where it begins. */}
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="url(#gold-foil)" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M19 12a7 7 0 1 1-2.05-4.95M19 4v4h-4" />
          <circle cx="12" cy="12" r="1.8" fill="url(#gold-foil)" stroke="none" className="animate-twinkle" />
        </svg>
      </button>
    </div>
  );
}
