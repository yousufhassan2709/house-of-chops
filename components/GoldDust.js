/** The gold in the air.
 *
 *  A fixed layer of embers drifting up behind everything on the site. It is
 *  deliberately plain CSS with no canvas and no animation loop: twenty-six
 *  transform-and-opacity animations are handled entirely by the compositor,
 *  which costs the main thread nothing and keeps scrolling as sharp as it was
 *  before any of this was here.
 *
 *  Each mote gets its own column, size, drift, speed and a negative delay, so
 *  the field is already in motion on the first frame rather than starting from
 *  an empty screen and filling up. This renders on the server — there is no
 *  state, no randomness at runtime, and so nothing to mismatch on hydration.
 */

// [left %, size px, x-drift px, duration s, negative delay s, peak opacity]
const MOTES = [
  [4, 2.0, 34, 30, -2, 0.5], [11, 1.2, -22, 41, -19, 0.32], [17, 2.6, 18, 26, -8, 0.42],
  [23, 1.4, -30, 37, -27, 0.36], [29, 1.8, 26, 33, -12, 0.46], [35, 1.1, -16, 45, -4, 0.28],
  [41, 2.4, 30, 28, -22, 0.44], [47, 1.6, -26, 39, -15, 0.34], [53, 2.1, 20, 31, -30, 0.48],
  [58, 1.3, -34, 43, -9, 0.3], [64, 2.8, 24, 25, -17, 0.4], [70, 1.5, -20, 36, -33, 0.35],
  [76, 1.9, 32, 34, -6, 0.45], [82, 1.2, -28, 42, -24, 0.29], [88, 2.3, 16, 29, -11, 0.43],
  [94, 1.7, -24, 38, -35, 0.33], [8, 1.4, 28, 47, -13, 0.26], [26, 2.2, -18, 27, -25, 0.41],
  [44, 1.3, 22, 44, -31, 0.27], [61, 1.9, -32, 32, -3, 0.44], [79, 1.5, 26, 40, -20, 0.31],
  [92, 2.5, -20, 24, -28, 0.38], [14, 1.8, 20, 35, -37, 0.37], [38, 1.1, -26, 46, -7, 0.25],
  [67, 2.0, 30, 30, -16, 0.42], [85, 1.4, -22, 43, -26, 0.3],
];

export default function GoldDust() {
  return (
    <div className="dust" aria-hidden="true">
      {MOTES.map(([left, size, drift, dur, delay, op], i) => (
        <span
          key={i}
          style={{
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            '--drift': `${drift}px`,
            '--dur': `${dur}s`,
            '--delay': `${delay}s`,
            '--peak': op,
          }}
        />
      ))}
    </div>
  );
}
