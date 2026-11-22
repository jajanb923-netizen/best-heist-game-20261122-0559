// Midnight at the Aurelia — boot, the game loop and the screen state machine.
// Screens: title, play, paused, level-done, caught, game-over, win.
// A ?shot=cover|sneak|alert|complete query stages a screenshot scene instead
// of the title screen.
import { CANVAS_HEIGHT, CANVAS_WIDTH, GAME } from './config.js';
import { LEVELS } from './levels.js';
import { createAudio } from './audio.js';
import { createInput, pressed, readMove, takeClick } from './input.js';
import { drawGame } from './render.js';
import { stageShot } from './shots.js';
import {
  createGameWorld, stepWorld, throwCoin, useEmp, useSmoke,
} from './world.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

const audio = createAudio();
const input = createInput(canvas);
input.onFirstGesture = () => audio.ensure();
input.attach();

const game = {
  levels: LEVELS,
  levelIndex: 0,
  world: null,
  screen: 'title',
  lives: GAME.lives,
  elapsed: 0,
  levelSeconds: 0,
  levelStart: 0,
  levelRating: '',
  finalRating: '',
  roomsCleared: 0,
  totalLoot: 0,
  bestSeconds: 0,
  coverTitle: false,
};

function loadLevel(index) {
  game.levelIndex = index;
  game.world = createGameWorld(LEVELS[index], index, 11);
  game.levelStart = game.elapsed;
  game.screen = 'play';
}

function startRun() {
  game.lives = GAME.lives;
  game.elapsed = 0;
  game.roomsCleared = 0;
  game.totalLoot = 0;
  loadLevel(0);
}

function rateRun() {
  const total = game.totalLoot;
  if (game.elapsed < 420 && total >= 89500) return 'A ghost run — every gem, every room, never truly seen. The Aurelia swears it is haunted.';
  if (total >= 70000) return 'A quiet shadow — the diamond is safe and the haul nearly complete.';
  if (total >= 40000) return 'A careful thief — seen, perhaps, but never caught.';
  return 'A loud escape — the diamond is safe, but the guards will remember tonight.';
}

function onCaught() {
  game.lives -= 1;
  if (game.world.caughtBy === -2) audio.playEvent('lockdown');
  else audio.playEvent('caught');
  if (game.lives <= 0) {
    game.screen = 'game-over';
  } else {
    game.screen = 'caught';
  }
}

function update(dt) {
  if (game.screen === 'title') {
    if (pressed(input, 'Enter')) startRun();
    return;
  }
  if (game.screen === 'paused') {
    if (pressed(input, 'Enter', 'p', 'P')) game.screen = 'play';
    if (pressed(input, 'r', 'R')) loadLevel(game.levelIndex);
    return;
  }
  if (game.screen === 'level-done') {
    if (pressed(input, 'Enter')) {
      // Bank this room's haul before moving on, so the HUD total stays true.
      game.totalLoot += game.world.lootValue;
      if (game.levelIndex + 1 >= LEVELS.length) {
        game.screen = 'win';
        game.finalRating = rateRun();
        if (game.bestSeconds === 0 || game.elapsed < game.bestSeconds) game.bestSeconds = game.elapsed;
        audio.playEvent('win');
      } else {
        loadLevel(game.levelIndex + 1);
      }
    }
    return;
  }
  if (game.screen === 'caught') {
    if (pressed(input, 'Enter')) {
      // The alarm cools after a lockdown; the room resets, the haul keeps.
      loadLevel(game.levelIndex);
      game.world.alarm = 35;
    }
    return;
  }
  if (game.screen === 'game-over' || game.screen === 'win') {
    if (pressed(input, 'Enter')) startRun();
    return;
  }

  // Play.
  game.elapsed += dt;
  if (pressed(input, 'p', 'P')) {
    game.screen = 'paused';
    return;
  }
  if (pressed(input, 'm', 'M')) audio.setMuted(!audio.muted);
  if (pressed(input, 'r', 'R')) {
    loadLevel(game.levelIndex);
    return;
  }
  if (pressed(input, '1')) {
    if (useSmoke(game.world)) audio.playEvent('smoke');
  }
  if (pressed(input, '2')) {
    if (useEmp(game.world)) audio.playEvent('emp');
  }
  const move = readMove(input);
  const click = takeClick(input);
  if (click && game.world.coins > 0) {
    if (throwCoin(game.world, click.x, click.y)) audio.playEvent('throw');
  }
  const events = stepWorld(game.world, move, dt);
  for (const event of events) audio.playEvent(event);
  if (game.world.caught) {
    onCaught();
    return;
  }
  if (game.world.levelDone) {
    game.levelSeconds = game.elapsed - game.levelStart;
    game.roomsCleared += 1;
    game.levelRating = game.world.gemsTaken === game.world.gems.length
      ? 'Every gem pocketed — a perfect, silent room.'
      : 'The loot is yours. The guards never knew.';
    audio.playEvent('exit');
    game.screen = 'level-done';
  }
}

let lastTime = performance.now();
function frame(now) {
  const dt = Math.min(0.05, (now - lastTime) / 1000);
  lastTime = now;
  // A staged screenshot scene is a frozen moment: draw it, never advance it.
  if (!shot) update(dt);
  drawGame(ctx, game);
  requestAnimationFrame(frame);
}

// A screenshot scene stages a frozen moment; the loop still draws it.
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
if (shot) {
  game.world = createGameWorld(LEVELS[0], 0, 11);
  stageShot(shot, game);
  window.__aureliaShot = shot;
} else {
  game.world = createGameWorld(LEVELS[0], 0, 11);
}
window.__aurelia = { game };
requestAnimationFrame(frame);
