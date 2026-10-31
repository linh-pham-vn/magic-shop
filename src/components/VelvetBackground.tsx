import { GoldOrnaments } from './GoldOrnaments';
import { Stardust } from './Stardust';

/**
 * The blue-purple velvet backdrop with the collage ornaments and drifting stardust.
 * It's fixed to the screen, so it stays still while the page content scrolls over it.
 */
export function VelvetBackground() {
  return (
    <div className="velvet-bg fixed inset-0 z-0" aria-hidden="true">
      <GoldOrnaments />
      <Stardust />
    </div>
  );
}
