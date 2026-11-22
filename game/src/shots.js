// Midnight at the Aurelia — the scripted screenshot scenes behind
// ?shot=cover|sneak|alert|complete. Each one plays the real rules forward
// from a fresh world, steered by a heist autopilot that re-routes around
// vision cones and waits in shadow when a guard looks its way, so every
// frame is what a real game looks like and the same seed always gives the
// same frame.
import { TILE } from './config.js';
import {
  cameraCanSeePlayer, createGameWorld, findRoute, guardCanSeePlayer,
  stepWorld, tileToPx, tileToPy,
} from './world.js';

const STEP = 1 / 60;

/** Is a board point inside any guard's cone right now (probe, no side effects)?
 * Cameras are deliberately left out: a lens only feeds the alarm, it cannot
 * chase, so the thief dashes through a camera's sweep instead of waiting
 * for it — and a camera's point-blank range would otherwise fence off the
 * whole exit column, where the lens hangs on the wall beside it. */
function pointIsWatched(world, x, y) {
  const savedX = world.player.x;
  const savedY = world.player.y;
  const savedSneak = world.player.sneaking;
  world.player.x = x;
  world.player.y = y;
  world.player.sneaking = true;
  let watched = false;
  for (const guard of world.guards) {
    if (guardCanSeePlayer(world, guard)) {
      watched = true;
      break;
    }
  }
  world.player.x = savedX;
  world.player.y = savedY;
  world.player.sneaking = savedSneak;
  return watched;
}

function nearestGuardDistance(world) {
  let best = Infinity;
  let bestGuard = null;
  for (const guard of world.guards) {
    const d = Math.hypot(guard.x - world.player.x, guard.y - world.player.y);
    if (d < best) {
      best = d;
      bestGuard = guard;
    }
  }
  return { distance: best, guard: bestGuard };
}

/**
 * Steer the thief toward a goal (a point, or the loot then the exit).
 * Waits (sneaking, in place) while the next step is watched; re-routes often.
 */
function heistPilot(world, plan) {
  const goal = plan.goal || (world.loot.taken ? world.exit : world.loot);
  const goalKey = plan.goal ? 'fixed' : world.loot.taken;
  // A guard closing in on a watched thief means a collision course: back
  // away, sneaking, before the alarm fills — the thief outruns a patrol.
  // Staging sets plan.retreat = false: there the thief holds still so the
  // frame catches the cone's edge instead of backing away from it.
  const near = nearestGuardDistance(world);
  if (plan.retreat !== false && near.guard && near.distance < 130 && pointIsWatched(world, world.player.x, world.player.y)) {
    const dx = world.player.x - near.guard.x;
    const dy = world.player.y - near.guard.y;
    const length = Math.hypot(dx, dy) || 1;
    return { x: dx / length, y: dy / length, sneak: true, run: false };
  }
  if (plan.goalKey !== goalKey || plan.path.length === 0 || plan.age > 0.4) {
    plan.path = findRoute(world, world.player.x, world.player.y, goal.x, goal.y);
    plan.goalKey = goalKey;
    plan.age = 0;
    plan.node = 1;
  }
  plan.age += STEP;
  if (plan.node >= plan.path.length) return { x: 0, y: 0, sneak: true, run: false };
  const node = plan.path[plan.node];
  const dx = node.x - world.player.x;
  const dy = node.y - world.player.y;
  if (Math.hypot(dx, dy) < 8) {
    plan.node += 1;
    return { x: 0, y: 0, sneak: true, run: false };
  }
  // Patience: do not step into a watched tile while a watcher is near.
  if (pointIsWatched(world, node.x, node.y)) {
    return { x: 0, y: 0, sneak: true, run: false };
  }
  return { x: dx, y: dy, sneak: true, run: false };
}

function newPlan(goal) {
  return { path: [], node: 1, age: 99, goalKey: null, goal: goal || null, retreat: false };
}

function runSteps(world, seconds, pilot, stopWhen, goal) {
  const plan = newPlan(goal || (pilot && pilot.goal ? pilot.goal : null));
  const total = Math.floor(seconds / STEP);
  for (let index = 0; index < total; index += 1) {
    const input = pilot ? pilot(world, plan) : { x: 0, y: 0, sneak: false, run: false };
    stepWorld(world, input, STEP);
    if (world.caught) return { caught: true };
    if (world.levelDone) return { done: true };
    if (stopWhen && stopWhen(world)) return { stopped: true };
  }
  return { timeout: true };
}

function stageCover(game) {
  // Try a few stands one tile off the first guard's patrol column until one
  // gives a live alarm in the 25-55 band with a guard cone in frame and no
  // capture: the guard's cone catches the thief as it walks past.
  const stands = [
    { x: tileToPx(6) + TILE / 2, y: tileToPy(6) + TILE / 2 },
    { x: tileToPx(4) + TILE / 2, y: tileToPy(9) + TILE / 2 },
    { x: tileToPx(4) + TILE / 2, y: tileToPy(10) + TILE / 2 },
    { x: tileToPx(4) + TILE / 2, y: tileToPy(4) + TILE / 2 },
  ];
  for (let attempt = 0; attempt < stands.length; attempt += 1) {
    game.world = createGameWorld(game.levels[0], 0, 11 + attempt);
    const stand = stands[attempt];
    const pilot = (world, plan) => { plan.goal = stand; return heistPilot(world, plan); };
    pilot.goal = stand;
    runSteps(game.world, 30, pilot, (world) => Math.hypot(world.player.x - stand.x, world.player.y - stand.y) < 14);
    if (game.world.caught) continue;
    // Stand in the open, un-sneaking, until the alarm climbs into its band
    // with a watcher on the thief — freeze on the cone, not mid-patrol.
    for (let index = 0; index < Math.floor(16 / STEP); index += 1) {
      stepWorld(game.world, { x: 0, y: 0, sneak: false, run: false }, STEP);
      if (game.world.caught) break;
      const hottest = Math.max(...game.world.guards.map((g) => g.suspicion));
      const watchedNow = game.world.guards.some((g) => guardCanSeePlayer(game.world, g))
        || game.world.cameras.some((c) => cameraCanSeePlayer(game.world, c));
      if ((watchedNow && game.world.alarm >= 22) || game.world.alarm >= 35 || hottest >= 85) break;
    }
    if (!game.world.caught && game.world.alarm >= 22) break;
  }
  game.screen = 'play';
  game.coverTitle = true;
}

function stageSneak(game) {
  game.world = createGameWorld(game.levels[0], 0, 11);
  // Sneak to the open floor one tile east of the first guard's patrol
  // column, then hold still while the guard walks south past Sable — the
  // cone's edge sweeps by a body's width away.
  const hideout = { x: tileToPx(6) + TILE / 2, y: tileToPy(6) + TILE / 2 };
  const pilot = (world, plan) => { plan.goal = hideout; return heistPilot(world, plan); };
  pilot.goal = hideout;
  runSteps(game.world, 40, pilot, (world) => {
    const arrived = Math.hypot(world.player.x - hideout.x, world.player.y - hideout.y) < 12;
    if (!arrived) return false;
    const guard = world.guards[0];
    const facingDown = Math.abs(guard.facing - Math.PI / 2) < 0.6;
    const nearRow = guard.y > tileToPy(3) && guard.y < tileToPy(7);
    return facingDown && nearRow && guard.suspicion < 45;
  });
  game.screen = 'play';
}

function stageAlert(game) {
  game.world = createGameWorld(game.levels[0], 0, 11);
  // Phase one: sneak to the open floor in the first camera's clear view,
  // approaching down the aisle beside its sweep — never across the lens.
  const stand = { x: tileToPx(12) + TILE / 2, y: tileToPy(4) + TILE / 2 };
  const pilot = (world, plan) => { plan.goal = stand; return heistPilot(world, plan); };
  pilot.goal = stand;
  runSteps(game.world, 40, pilot, (world) => Math.hypot(world.player.x - stand.x, world.player.y - stand.y) < 12);
  // Phase two: stand in the red lens while the alarm fills — freeze while
  // a guard is still a lunge away, the meter high, the lockdown not yet hit.
  for (let index = 0; index < Math.floor(20 / STEP); index += 1) {
    stepWorld(game.world, { x: 0, y: 0, sneak: false, run: false }, STEP);
    if (game.world.caught) break;
    const { distance, guard } = nearestGuardDistance(game.world);
    if (guard && guard.suspicion >= 70) break;
    if (game.world.alarm >= 50) break;
    if (distance < 110) break;
  }
  game.screen = 'play';
}

function stageComplete(game) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    game.world = createGameWorld(game.levels[0], 0, 11 + attempt);
    const world = game.world;
    // Pocket the nearest gem on the way, then the loot, then the exit.
    const gem = world.gems[0];
    runSteps(world, 90, heistPilot, (w) => w.gemsTaken >= 1, gem);
    if (world.caught) continue;
    const toLoot = runSteps(world, 120, heistPilot, (w) => w.loot.taken);
    if (toLoot.caught || world.caught) continue;
    const result = runSteps(world, 120, heistPilot);
    if (result.done || world.levelDone) {
      game.screen = 'level-done';
      game.levelSeconds = world.time;
      game.levelRating = world.gemsTaken === world.gems.length
        ? 'Every gem pocketed — a perfect, silent room.'
        : 'The loot is yours. The guards never knew.';
      return;
    }
  }
  // Fallback: a live room under the title is still a true render.
  game.world = createGameWorld(game.levels[0], 0, 11);
  runSteps(game.world, 6, null);
  game.screen = 'title';
}

/**
 * Set `game` to the named scene (cover, sneak, alert or complete) and return
 * nothing; main.js draws whatever screen the scene leaves.
 */
export function stageShot(name, game) {
  game.coverTitle = false;
  if (name === 'sneak') stageSneak(game);
  else if (name === 'alert') stageAlert(game);
  else if (name === 'complete') stageComplete(game);
  else stageCover(game);
  // The HUD clock shows the staged moment's own simulated time.
  game.elapsed = game.world.time;
}
