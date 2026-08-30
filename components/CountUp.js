'use client';
import { useEffect, useRef, useState } from 'react';
import { useInView } from 'framer-motion';

/** A number that counts up whenever it scrolls into view.
 *
 *  Not once — every time. Someone scrolling back up the page should see the
 *  figures come alive again rather than find them already spent, which is the
 *  difference between a page that feels live and one that just loaded.
 *
 *  `amount: 0.6` means the stat has to be properly on screen before it runs,
 *  so a number half-cut by the fold does not burn its count where nobody can
 *  see it. Anyone who has asked the OS to calm motion down gets the final
 *  figure immediately, with no count at all.
 */
export default function CountUp({ to, duration = 1100, prefix = '', suffix = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { amount: 0.6 });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;

    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduced) { setValue(to); return; }

    let raf;
    const start = performance.now();
    // Ease-out cubic: quick off the mark, settling onto the figure rather
    // than snapping to it.
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      setValue(Math.round(to * (1 - Math.pow(1 - t, 3))));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration]);

  return (
    <span ref={ref}>
      {prefix}{value}{suffix}
    </span>
  );
}
