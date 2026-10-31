import { useEffect, useRef } from 'react';
import { useReducedMotion } from './useReducedMotion';

/** Specks per 100,000 square pixels of screen: about 22 on a typical phone. */
const DENSITY = 9;

interface Speck {
  x: number;
  y: number;
  radius: number;
  /** Upward drift in pixels per second. */
  rise: number;
  /** How far it sways side to side, and where it is in that sway. */
  sway: number;
  phase: number;
  /** Twinkle speed. */
  twinkle: number;
}

/**
 * Tiny gold specks drifting slowly upward over the velvet, like dust in candlelight.
 * Drawn on one canvas (cheap for the phone), paused when the app isn't visible,
 * and switched off entirely when the device asks for reduced motion.
 */
export function Stardust() {
  const reducedMotion = useReducedMotion();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (reducedMotion || !canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let specks: Speck[] = [];

    const newSpeck = (atBottom: boolean): Speck => ({
      x: Math.random() * width,
      y: atBottom ? height + 10 : Math.random() * height,
      radius: 0.6 + Math.random() * 1.4,
      rise: 6 + Math.random() * 12,
      sway: 6 + Math.random() * 14,
      phase: Math.random() * Math.PI * 2,
      twinkle: 0.6 + Math.random() * 1.4,
    });

    // Match the canvas to the screen, sharp on high-resolution displays.
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.round(((width * height) / 100_000) * DENSITY);
      specks = Array.from({ length: count }, () => newSpeck(false));
    };
    resize();
    window.addEventListener('resize', resize);

    let frame = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min((now - last) / 1000, 0.1); // seconds; capped so a paused tab doesn't jump
      last = now;
      ctx.clearRect(0, 0, width, height);
      for (const s of specks) {
        s.y -= s.rise * dt;
        s.phase += dt * 0.6;
        if (s.y < -10) Object.assign(s, newSpeck(true)); // float off the top, reappear at the bottom
        const x = s.x + Math.sin(s.phase) * s.sway;
        const glow = 0.35 + 0.65 * Math.abs(Math.sin(now / 1000 * s.twinkle + s.phase));
        // A soft gold dot: bright centre fading out.
        const gradient = ctx.createRadialGradient(x, s.y, 0, x, s.y, s.radius * 3);
        gradient.addColorStop(0, `rgba(255, 236, 170, ${0.9 * glow})`);
        gradient.addColorStop(1, 'rgba(255, 236, 170, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, s.y, s.radius * 3, 0, Math.PI * 2);
        ctx.fill();
      }
      frame = requestAnimationFrame(draw);
    };
    frame = requestAnimationFrame(draw);

    // Stop drawing while the app is in the background, to save battery.
    const onVisibility = () => {
      cancelAnimationFrame(frame);
      if (!document.hidden) {
        last = performance.now();
        frame = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [reducedMotion]);

  if (reducedMotion) return null;
  return <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true" />;
}
