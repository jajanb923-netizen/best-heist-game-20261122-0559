// Midnight at the Aurelia — the three rooms. Each map is 30 x 15 tiles.
//   # wall   . marble floor   D display case (blocks sight + movement)
//   V velvet rope (blocks movement, not sight)   S shadow carpet (hides you)
//   P pedestal plant (blocks movement, not sight)   E exit door
//   K the room's loot   * gem (collectible)   T thief start
// Guards patrol the waypoint lists; cameras are wall lenses that sweep
// between two angles (radians, 0 = east) at a fixed speed.
export const LEVELS = [
  {
    name: 'The Marble Gallery',
    map: [
      '##############################',
      '#T..S....D......D......S....E#',
      '#........D......D............#',
      '#.D....V......D.......V..*...#',
      '#........D......D............#',
      '#..S......D..S......D....D...#',
      '#........D......D............#',
      '#.V..........D..........V....#',
      '#........D......D............#',
      '#..D......D..S......D....*...#',
      '#........D......D............#',
      '#.S...V.......D.......V......#',
      '#........D......D......S.....#',
      '#..*......D......K.....D.....#',
      '##############################',
    ],
    guards: [
      { waypoints: [[5, 1], [5, 13]], pause: 1.2 },
      { waypoints: [[21, 1], [21, 13]], pause: 1.6 },
    ],
    cameras: [
      { col: 14, row: 0, from: 0.9, to: 2.2, speed: 0.55 },
      { col: 29, row: 7, from: 2.5, to: 3.8, speed: 0.45 },
    ],
    lamps: [[5, 1], [24, 1], [15, 7], [3, 12], [26, 12]],
  },
  {
    name: 'The Vault Corridor',
    map: [
      '##############################',
      '#T......D...S....D.......*..E#',
      '#..........D........D........#',
      '#.D...V........D......V......#',
      '#......D...S.......D.....D...#',
      '#..........D........D........#',
      '#..S....D......V......D......#',
      '#......D..........D......S...#',
      '#..........D...S....D........#',
      '#.V....D......D.......V..D...#',
      '#..........D........D........#',
      '#..D....S......D......D..*...#',
      '#..........D........D........#',
      '#..*....D......K....D....S...#',
      '##############################',
    ],
    guards: [
      { waypoints: [[5, 1], [5, 13]], pause: 1.0 },
      { waypoints: [[26, 1], [26, 13]], pause: 1.4 },
      { waypoints: [[13, 1], [13, 13]], pause: 1.2 },
    ],
    cameras: [
      { col: 10, row: 0, from: 0.8, to: 2.3, speed: 0.6 },
      { col: 19, row: 0, from: 0.8, to: 2.3, speed: 0.5 },
      { col: 0, row: 7, from: -0.6, to: 0.6, speed: 0.45 },
    ],
    lamps: [[4, 1], [25, 1], [15, 6], [2, 11], [27, 13]],
  },
  {
    name: 'The Aurelia Vault',
    map: [
      '##############################',
      '#T..S...D....D....D.....S...E#',
      '#.......D....D....D..........#',
      '#.D..V.....D....D.....V..*...#',
      '#.......D....D....D......D...#',
      '#..S....D..S....D....S...D...#',
      '#.......D....D....D..........#',
      '#.V....D....D....D....V......#',
      '#.......D....D....D......D...#',
      '#..D....D..S....D....S...*...#',
      '#.......D....D....D..........#',
      '#.S..V.....D....D.....V..D...#',
      '#.......D....D....D......S...#',
      '#..*....D....D....K....D.....#',
      '##############################',
    ],
    guards: [
      { waypoints: [[6, 1], [6, 13]], pause: 0.9 },
      { waypoints: [[10, 1], [10, 13]], pause: 1.2 },
      { waypoints: [[15, 1], [15, 13]], pause: 1.0 },
      { waypoints: [[24, 1], [24, 13]], pause: 1.4 },
    ],
    cameras: [
      { col: 8, row: 0, from: 0.8, to: 2.3, speed: 0.65 },
      { col: 21, row: 0, from: 0.8, to: 2.3, speed: 0.55 },
      { col: 0, row: 7, from: -0.6, to: 0.6, speed: 0.5 },
      { col: 29, row: 7, from: 2.5, to: 3.8, speed: 0.5 },
    ],
    lamps: [[5, 1], [24, 1], [15, 6], [2, 9], [27, 13], [12, 13]],
  },
];

/** Tile character at (col, row) of a level map. */
export function tileAt(level, col, row) {
  if (row < 0 || row >= level.map.length) return '#';
  const line = level.map[row];
  if (col < 0 || col >= line.length) return '#';
  return line[col];
}

/** True when a tile blocks movement. */
export function blocksMovement(tile) {
  return tile === '#' || tile === 'D' || tile === 'V' || tile === 'P';
}

/** True when a tile blocks a guard's or camera's line of sight. */
export function blocksSight(tile) {
  return tile === '#' || tile === 'D';
}

/** Find every tile holding `char` in a level map. */
export function findTiles(level, char) {
  const found = [];
  for (let row = 0; row < level.map.length; row += 1) {
    for (let col = 0; col < level.map[row].length; col += 1) {
      if (level.map[row][col] === char) found.push([col, row]);
    }
  }
  return found;
}
