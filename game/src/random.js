// Midnight at the Aurelia — a tiny seeded random generator, so dust,
// sparkles and guard pauses are the same on every run of a seed.
export function makeRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}
