// Midnight at the Aurelia — tuning numbers. Every speed, range and rate
// the heist simulation uses lives here, so balancing is one file.
export const TILE = 40;
export const COLS = 30;
export const ROWS = 15;
export const HUD_HEIGHT = 72;
export const BOARD_X = 40;
export const BOARD_Y = 72;
export const CANVAS_WIDTH = 1280;
export const CANVAS_HEIGHT = 720;

export const THIEF = {
  radius: 13,
  walkSpeed: 155,
  sneakSpeed: 84,
  runSpeed: 210,
  noiseWalk: 70,
  noiseRun: 160,
  noiseSneak: 26,
};

export const GUARD = {
  radius: 14,
  patrolSpeed: 64,
  chaseSpeed: 142,
  searchSpeed: 90,
  viewDistance: 240,
  viewDistanceShadow: 95,
  viewDistanceSneak: 175,
  halfAngle: 0.6, // radians, about 34 degrees each side
  closeRange: 52, // inside this, a guard sees you even in shadow
  catchDistance: 20,
  // Per-guard suspicion 0..100. Rates per second.
  riseLit: 95,
  riseShadow: 34,
  riseSneak: 0.55, // multiplier while the thief sneaks
  fall: 26,
  alertAt: 100,
  suspiciousAt: 35,
  memorySeconds: 3.2, // how long a guard chases a lost thief
  searchSeconds: 4.0,
};

export const CAMERA = {
  viewDistance: 260,
  halfAngle: 0.5, // about 29 degrees each side
  // Alarm points per second while a camera watches the thief.
  alarmLit: 26,
  alarmShadow: 10,
  alarmSneak: 0.5, // multiplier while the thief sneaks
  beepEvery: 1.6, // seconds between warning beeps while watching
};

export const ALARM = {
  // The global alarm meter 0..100. Guards feed it from their suspicion;
  // cameras feed it directly. It decays while nobody watches.
  decay: 9,
  guardFeed: 0.55, // alarm rises at this share of a guard's suspicion rate
  lockdownAt: 100,
  afterCaught: 35, // alarm the room resets to after a lockdown
  suspiciousAt: 40,
  highAt: 75,
};

export const TOOLS = {
  smokePerRoom: 2,
  smokeSeconds: 6,
  smokeRadius: 95,
  empPerRoom: 1,
  empSeconds: 8,
  coinsPerRoom: 3,
  coinLureRadius: 340,
};

export const GAME = {
  lives: 3,
  parSeconds: [150, 180, 210],
  roomNames: ['The Marble Gallery', 'The Vault Corridor', 'The Aurelia Vault'],
  roomSubtitles: [
    'Lift the Sunburst Ruby — slip past the night guards and their cameras.',
    'Longer patrols, more lenses. Shadows are your friends.',
    'One last room. The Aurelia Diamond waits behind the final lens.',
  ],
  lootNames: ['Sunburst Ruby', 'Empress Sapphire', 'Aurelia Diamond'],
  lootValues: [12000, 25000, 50000],
  gemValue: 1500,
};
