import { useState } from 'react';
import { DEFAULT_SETTINGS, type AppSettings } from '../types';

// Settings are remembered in this browser's localStorage only; nothing is sent anywhere.
const KEY = 'magic-shop.settings';

function load(): AppSettings {
  try {
    const saved = localStorage.getItem(KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS; // e.g. a private window that blocks storage
  }
}

/** The app's settings, and a way to change one or more of them (the rest are kept). */
export function useSettings(): [AppSettings, (patch: Partial<AppSettings>) => void] {
  const [settings, setSettings] = useState(load);
  const update = (patch: Partial<AppSettings>) => {
    const next = { ...settings, ...patch };
    setSettings(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      // Can't remember it this time; the switch still works until the page is closed.
    }
  };
  return [settings, update];
}
