import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

// Fonts are bundled with the app (no Google Fonts request at runtime).
// Cinzel Decorative: engraved, flourished capitals, like an old spellbook (no Vietnamese accents).
import '@fontsource/cinzel-decorative/400.css';
import '@fontsource/cinzel-decorative/700.css';
// Playfair Display SC: matching small capitals with full Vietnamese support, used for Vietnamese titles.
import '@fontsource/playfair-display-sc/400.css';
import '@fontsource/playfair-display-sc/700.css';
// Pinyon Script: the romantic copperplate script that sweeps through the titles.
import '@fontsource/pinyon-script/400.css';
// Plus Jakarta Sans: soft, clear body text (includes Vietnamese accents).
import '@fontsource/plus-jakarta-sans/400.css';
import '@fontsource/plus-jakarta-sans/500.css';
import '@fontsource/plus-jakarta-sans/600.css';
import './index.css';

import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
