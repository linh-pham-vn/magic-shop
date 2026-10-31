import { useState } from 'react';
import { GoldDefs } from './components/GoldOrnaments';
import { NewReadingButton } from './components/NewReadingButton';
import { VelvetBackground } from './components/VelvetBackground';
import { ReadingRoomPage } from './features/reading-room/ReadingRoomPage';

export default function App() {
  // The New reading button swaps in a fresh Reading Room (a new key resets all its state).
  const [readingKey, setReadingKey] = useState(0);
  const newReading = () => {
    setReadingKey((k) => k + 1);
    window.scrollTo(0, 0);
  };

  return (
    <>
      <GoldDefs />
      <VelvetBackground />
      <NewReadingButton onClick={newReading} />
      <div
        className="app-column relative z-10 mx-auto min-h-dvh max-w-md px-4"
        style={{
          // Room for the notch at the top and the home indicator at the bottom.
          paddingTop: 'calc(1.5rem + env(safe-area-inset-top))',
          paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom))',
        }}
      >
        <ReadingRoomPage key={readingKey} />
      </div>
    </>
  );
}
