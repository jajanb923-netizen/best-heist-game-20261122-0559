// Midnight at the Aurelia — everything drawn: the marble museum, the
// vision cones, the cameras, the thief, the HUD with its alarm meter and
// the title / caught / win screens. Cones are drawn over the floor and
// under the display cases, so the cases clip them for free.
import {
  ALARM, BOARD_X, BOARD_Y, CAMERA, CANVAS_HEIGHT, CANVAS_WIDTH, COLS, GAME,
  GUARD, HUD_HEIGHT, ROWS, TILE,
} from './config.js';
import { tileAt } from './levels.js';
import { GUARD_ALERT, GUARD_SEARCH, GUARD_SUSPICIOUS } from './world.js';

const GOLD = '#d9a441';
const TEAL = '#2dd4bf';

function formatTime(seconds) {
  const total = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  return `${minutes}:${rest < 10 ? '0' : ''}${rest}`;
}

function formatMoney(value) {
  return `$${value.toLocaleString('en-US')}`;
}

function conePath(ctx, x, y, facing, halfAngle, distance) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, distance, facing - halfAngle, facing + halfAngle);
  ctx.closePath();
}

function drawFloor(ctx, world) {
  const level = world.level;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = tileAt(level, col, row);
      const x = BOARD_X + col * TILE;
      const y = BOARD_Y + row * TILE;
      if (tile === '#') {
        ctx.fillStyle = '#0d1526';
        ctx.fillRect(x, y, TILE, TILE);
        continue;
      }
      const checker = (col + row) % 2 === 0;
      if (tile === 'S') {
        ctx.fillStyle = checker ? '#241b45' : '#1d1738';
      } else {
        ctx.fillStyle = checker ? '#1a2a4a' : '#152238';
      }
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = 'rgba(217,164,65,0.10)';
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);
      if (tile === 'S') {
        ctx.fillStyle = 'rgba(120,90,200,0.16)';
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 9, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
  // Warm spotlight pools under the lamps.
  for (const [col, row] of level.lamps) {
    const x = BOARD_X + col * TILE + TILE / 2;
    const y = BOARD_Y + row * TILE + TILE / 2;
    const gradient = ctx.createRadialGradient(x, y, 6, x, y, 110);
    gradient.addColorStop(0, 'rgba(255,214,120,0.20)');
    gradient.addColorStop(1, 'rgba(255,214,120,0)');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(x, y, 110, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawObstacles(ctx, world) {
  const level = world.level;
  for (let row = 0; row < ROWS; row += 1) {
    for (let col = 0; col < COLS; col += 1) {
      const tile = tileAt(level, col, row);
      const x = BOARD_X + col * TILE;
      const y = BOARD_Y + row * TILE;
      if (tile === 'D') {
        // A gold-framed display case with a glinting relic inside.
        ctx.fillStyle = '#0a1428';
        ctx.fillRect(x + 2, y + 2, TILE - 4, TILE - 4);
        ctx.fillStyle = 'rgba(127,212,255,0.16)';
        ctx.fillRect(x + 6, y + 6, TILE - 12, TILE - 12);
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 2.5;
        ctx.strokeRect(x + 3, y + 3, TILE - 6, TILE - 6);
        ctx.fillStyle = '#8fd8ff';
        ctx.beginPath();
        ctx.moveTo(x + 20, y + 13);
        ctx.lineTo(x + 26, y + 20);
        ctx.lineTo(x + 20, y + 27);
        ctx.lineTo(x + 14, y + 20);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,0.55)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + 9, y + 28);
        ctx.lineTo(x + 17, y + 10);
        ctx.stroke();
      } else if (tile === 'V') {
        // Velvet rope: two brass posts and a red sagging rope.
        ctx.fillStyle = '#c8a24a';
        ctx.beginPath();
        ctx.arc(x + 8, y + 20, 3.5, 0, Math.PI * 2);
        ctx.arc(x + 32, y + 20, 3.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#c2273f';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(x + 8, y + 20);
        ctx.quadraticCurveTo(x + 20, y + 30, x + 32, y + 20);
        ctx.stroke();
      } else if (tile === 'P') {
        ctx.fillStyle = '#7a4a22';
        ctx.fillRect(x + 13, y + 22, 14, 12);
        ctx.fillStyle = '#2f7d4f';
        ctx.beginPath();
        ctx.arc(x + 20, y + 16, 10, 0, Math.PI * 2);
        ctx.arc(x + 12, y + 20, 7, 0, Math.PI * 2);
        ctx.arc(x + 28, y + 20, 7, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawCones(ctx, world) {
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const guard of world.guards) {
    const distance = guard.state === GUARD_ALERT ? GUARD.viewDistance + 30 : GUARD.viewDistance;
    const colour = guard.state === GUARD_ALERT
      ? '255,70,70'
      : guard.state === GUARD_SUSPICIOUS || guard.state === GUARD_SEARCH
        ? '255,150,60'
        : '255,190,80';
    const gradient = ctx.createRadialGradient(guard.x, guard.y, 10, guard.x, guard.y, distance);
    gradient.addColorStop(0, `rgba(${colour},0.42)`);
    gradient.addColorStop(1, `rgba(${colour},0.10)`);
    ctx.fillStyle = gradient;
    conePath(ctx, guard.x, guard.y, guard.facing, GUARD.halfAngle, distance);
    ctx.fill();
  }
  for (const camera of world.cameras) {
    if (camera.disabledLeft > 0) continue;
    const colour = camera.watching ? '255,60,60' : '255,90,90';
    const gradient = ctx.createRadialGradient(camera.x, camera.y, 8, camera.x, camera.y, CAMERA.viewDistance);
    gradient.addColorStop(0, `rgba(${colour},0.40)`);
    gradient.addColorStop(1, `rgba(${colour},0.08)`);
    ctx.fillStyle = gradient;
    conePath(ctx, camera.x, camera.y, camera.angle, CAMERA.halfAngle, CAMERA.viewDistance);
    ctx.fill();
  }
  ctx.restore();
}

function drawGemsAndLoot(ctx, world) {
  for (const gem of world.gems) {
    if (gem.taken) continue;
    const bob = Math.sin(gem.phase) * 3;
    const glow = ctx.createRadialGradient(gem.x, gem.y + bob, 2, gem.x, gem.y + bob, 26);
    glow.addColorStop(0, 'rgba(255,215,106,0.55)');
    glow.addColorStop(1, 'rgba(255,215,106,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(gem.x, gem.y + bob, 26, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 9 + bob);
    ctx.lineTo(gem.x + 7, gem.y + bob);
    ctx.lineTo(gem.x, gem.y + 9 + bob);
    ctx.lineTo(gem.x - 7, gem.y + bob);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 9 + bob);
    ctx.lineTo(gem.x + 3, gem.y + bob);
    ctx.lineTo(gem.x, gem.y + 2 + bob);
    ctx.closePath();
    ctx.fill();
  }
  const loot = world.loot;
  if (!loot.taken) {
    const pulse = 1 + Math.sin(loot.phase) * 0.12;
    const glow = ctx.createRadialGradient(loot.x, loot.y, 4, loot.x, loot.y, 64 * pulse);
    glow.addColorStop(0, 'rgba(255,215,106,0.75)');
    glow.addColorStop(1, 'rgba(255,215,106,0)');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(loot.x, loot.y, 64 * pulse, 0, Math.PI * 2);
    ctx.fill();
    // A gold pedestal under the loot.
    ctx.fillStyle = '#3a2c14';
    ctx.fillRect(loot.x - 16, loot.y + 8, 32, 10);
    ctx.fillStyle = GOLD;
    ctx.fillRect(loot.x - 16, loot.y + 8, 32, 3);
    const colours = ['#ff5a6e', '#5aa2ff', '#e8f4ff'];
    ctx.fillStyle = colours[world.levelIndex] || '#ffd76a';
    ctx.beginPath();
    ctx.moveTo(loot.x, loot.y - 16);
    ctx.lineTo(loot.x + 13, loot.y - 2);
    ctx.lineTo(loot.x, loot.y + 12);
    ctx.lineTo(loot.x - 13, loot.y - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.75)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(loot.x - 13, loot.y - 2);
    ctx.lineTo(loot.x + 13, loot.y - 2);
    ctx.moveTo(loot.x, loot.y - 16);
    ctx.lineTo(loot.x, loot.y + 12);
    ctx.stroke();
    ctx.fillStyle = '#ffe9a8';
    ctx.font = 'bold 11px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText(GAME.lootNames[world.levelIndex], loot.x, loot.y - 26);
  }
}

function drawExit(ctx, world) {
  const exit = world.exit;
  const open = world.loot.taken;
  const glow = ctx.createRadialGradient(exit.x, exit.y, 4, exit.x, exit.y, 52);
  glow.addColorStop(0, open ? 'rgba(80,220,120,0.6)' : 'rgba(255,80,80,0.35)');
  glow.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glow;
  ctx.beginPath();
  ctx.arc(exit.x, exit.y, 52, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = open ? '#1d7a3a' : '#5a1d24';
  ctx.fillRect(exit.x - 17, exit.y - 17, 34, 34);
  ctx.strokeStyle = open ? '#6fe89a' : '#ff7070';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(exit.x - 17, exit.y - 17, 34, 34);
  ctx.fillStyle = open ? '#c9ffd9' : '#ffb3b3';
  ctx.font = 'bold 12px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(open ? 'EXIT' : 'LOCK', exit.x, exit.y + 4);
}

function drawCameras(ctx, world) {
  for (const camera of world.cameras) {
    const disabled = camera.disabledLeft > 0;
    // Wall mount + dome.
    ctx.fillStyle = '#39415a';
    ctx.fillRect(camera.x - 10, camera.y - 10, 20, 20);
    ctx.fillStyle = disabled ? '#5a6274' : '#222a3d';
    ctx.beginPath();
    ctx.arc(camera.x, camera.y, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = disabled ? '#8a93a6' : (camera.watching ? '#ff3b3b' : '#ff8a8a');
    ctx.beginPath();
    ctx.arc(camera.x + Math.cos(camera.angle) * 4, camera.y + Math.sin(camera.angle) * 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // A small red tally light that blinks while the lens watches.
    if (camera.watching && Math.floor(world.time * 3) % 2 === 0) {
      ctx.fillStyle = '#ff3b3b';
      ctx.beginPath();
      ctx.arc(camera.x, camera.y - 13, 3, 0, Math.PI * 2);
      ctx.fill();
    }
    if (disabled) {
      ctx.fillStyle = '#9fd8ff';
      ctx.font = 'bold 10px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('EMP', camera.x, camera.y - 14);
    }
  }
}

function drawGuard(ctx, guard) {
  const bob = Math.sin(guard.bobPhase) * 1.5;
  const alert = guard.state === GUARD_ALERT;
  // Body: navy uniform with a pale cap.
  ctx.fillStyle = alert ? '#7a1f2b' : '#22355e';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y + bob, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = alert ? '#ff8a8a' : '#8fa8d8';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = alert ? '#ff6b6b' : '#e8ecf4';
  ctx.beginPath();
  ctx.arc(guard.x, guard.y - 4 + bob, 8, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(guard.x - 8, guard.y - 5 + bob, 16, 3);
  // Facing tick.
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(guard.x, guard.y + bob);
  ctx.lineTo(guard.x + Math.cos(guard.facing) * 17, guard.y + Math.sin(guard.facing) * 17 + bob);
  ctx.stroke();
  // Suspicion arc + ? / ! mark.
  if (guard.suspicion > 2) {
    ctx.strokeStyle = guard.suspicion >= GUARD.alertAt ? '#ff4b4b' : '#ffb84d';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.arc(guard.x, guard.y - 20 + bob, 10, -Math.PI / 2, -Math.PI / 2 + (guard.suspicion / 100) * Math.PI * 2);
    ctx.stroke();
  }
  if (guard.state === GUARD_SUSPICIOUS || guard.state === GUARD_SEARCH) {
    ctx.fillStyle = '#ffd76a';
    ctx.font = 'bold 18px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('?', guard.x, guard.y - 28 + bob);
  } else if (alert) {
    ctx.fillStyle = '#ff4b4b';
    ctx.font = 'bold 20px Georgia, serif';
    ctx.textAlign = 'center';
    ctx.fillText('!', guard.x, guard.y - 28 + bob);
  }
}

function drawThief(ctx, world) {
  const player = world.player;
  const crouch = player.sneaking ? 0.82 : 1;
  // A bright ring so the thief reads at a glance, even shrunk.
  ctx.strokeStyle = player.hidden ? '#7c6cf0' : TEAL;
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(player.x, player.y, 18, 0, Math.PI * 2);
  ctx.stroke();
  // Cloak: deep violet hood with a teal scarf and a gold mask glint.
  ctx.fillStyle = '#2b1d4e';
  ctx.beginPath();
  ctx.arc(player.x, player.y, 13 * crouch + 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#4a2f7d';
  ctx.beginPath();
  ctx.arc(player.x, player.y - 3, 8, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = TEAL;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(player.x - 6, player.y + 4);
  ctx.lineTo(player.x + 6, player.y + 4);
  ctx.stroke();
  ctx.fillStyle = GOLD;
  ctx.beginPath();
  ctx.arc(player.x + Math.cos(player.facing) * 5, player.y + Math.sin(player.facing) * 5 - 3, 2.2, 0, Math.PI * 2);
  ctx.fill();
  if (player.running) {
    ctx.strokeStyle = 'rgba(45,212,191,0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(player.x - Math.cos(player.facing) * 14, player.y - Math.sin(player.facing) * 14);
    ctx.lineTo(player.x - Math.cos(player.facing) * 24, player.y - Math.sin(player.facing) * 24);
    ctx.stroke();
  }
}

function drawSmokeAndThrows(ctx, world) {
  for (const cloud of world.smoke) {
    const alpha = Math.min(0.75, cloud.life / 2);
    ctx.fillStyle = `rgba(184,196,212,${alpha})`;
    ctx.beginPath();
    ctx.arc(cloud.x, cloud.y, cloud.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(220,228,240,${alpha * 0.7})`;
    ctx.beginPath();
    ctx.arc(cloud.x - 28, cloud.y + 12, cloud.radius * 0.55, 0, Math.PI * 2);
    ctx.arc(cloud.x + 30, cloud.y - 10, cloud.radius * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  for (const t of world.throws) {
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath();
    ctx.arc(t.x, t.y, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,215,106,${t.life})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(t.x, t.y, 12 + (0.9 - t.life) * 22, 0, Math.PI * 2);
    ctx.stroke();
  }
  for (const p of world.particles) {
    ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
    ctx.fillStyle = p.colour;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}

function drawBoard(ctx, world) {
  drawFloor(ctx, world);
  drawCones(ctx, world);
  drawObstacles(ctx, world);
  drawExit(ctx, world);
  drawGemsAndLoot(ctx, world);
  drawCameras(ctx, world);
  for (const guard of world.guards) drawGuard(ctx, guard);
  drawThief(ctx, world);
  drawSmokeAndThrows(ctx, world);
  // Dust motes drift over everything, faintly.
  ctx.fillStyle = 'rgba(255,240,200,0.25)';
  for (const mote of world.dust) {
    ctx.beginPath();
    ctx.arc(mote.x, mote.y + Math.sin(mote.phase) * 4, mote.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // Board frame.
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(BOARD_X - 1, BOARD_Y - 1, COLS * TILE + 2, ROWS * TILE + 2);
}

function drawAlarmMeter(ctx, x, y, width, alarm) {
  const height = 22;
  ctx.fillStyle = '#0d1526';
  ctx.fillRect(x, y, width, height);
  const colour = alarm >= ALARM.highAt ? '#ff4b4b' : alarm >= ALARM.suspiciousAt ? '#ff9a3d' : '#3ddc84';
  const fillWidth = Math.max(0, Math.min(width - 4, ((width - 4) * alarm) / 100));
  const gradient = ctx.createLinearGradient(x, y, x + width, y);
  gradient.addColorStop(0, '#3ddc84');
  gradient.addColorStop(0.45, '#ff9a3d');
  gradient.addColorStop(1, '#ff4b4b');
  ctx.fillStyle = gradient;
  ctx.fillRect(x + 2, y + 2, fillWidth, height - 4);
  ctx.strokeStyle = colour;
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(`ALARM ${Math.round(alarm)}%`, x + width / 2, y + height - 6);
}

function drawHud(ctx, game) {
  const world = game.world;
  ctx.fillStyle = '#0a0f1e';
  ctx.fillRect(0, 0, CANVAS_WIDTH, HUD_HEIGHT);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, HUD_HEIGHT - 2, CANVAS_WIDTH, 2);
  // Left: title + room.
  ctx.textAlign = 'left';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 17px Georgia, serif';
  ctx.fillText('MIDNIGHT AT THE AURELIA', 16, 24);
  ctx.fillStyle = '#b9c4d8';
  ctx.font = '13px Georgia, serif';
  const objective = world.loot.taken
    ? `Room ${game.levelIndex + 1} · ${world.level.name} — loot secured, reach the EXIT`
    : `Room ${game.levelIndex + 1} · ${world.level.name} — steal the ${GAME.lootNames[game.levelIndex]}`;
  ctx.fillText(objective, 16, 46);
  // Centre: the alarm meter, big and impossible to miss.
  drawAlarmMeter(ctx, 470, 12, 340, world.alarm);
  const status = world.alertLevel === 2 ? 'HUNTED' : world.alertLevel === 1 ? 'SUSPICIOUS' : 'UNSEEN';
  ctx.fillStyle = world.alertLevel === 2 ? '#ff4b4b' : world.alertLevel === 1 ? '#ff9a3d' : '#3ddc84';
  ctx.font = 'bold 13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(status, 640, 52);
  // Right: loot, gems, tools, lives, timer. The HUD total is the banked
  // haul from earlier rooms plus this room's loot — except on the win
  // screen, where the last room is already banked.
  ctx.textAlign = 'right';
  ctx.fillStyle = '#ffd76a';
  ctx.font = 'bold 16px Georgia, serif';
  const haul = game.screen === 'win' ? game.totalLoot : game.totalLoot + world.lootValue;
  ctx.fillText(formatMoney(haul), 1264, 24);
  ctx.fillStyle = '#b9c4d8';
  ctx.font = '13px Georgia, serif';
  ctx.fillText(
    `◆ ${world.gemsTaken}/3   ☁ ${world.smokeLeft}   ⚡ ${world.empLeft}   ○ ${world.coins}   ♥ ${'♥'.repeat(game.lives)}${'♡'.repeat(Math.max(0, 3 - game.lives))}   ${formatTime(game.elapsed)}`,
    1264,
    46,
  );
}

function drawBottomBar(ctx) {
  ctx.fillStyle = '#0a0f1e';
  ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 40);
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, CANVAS_HEIGHT - 40, CANVAS_WIDTH, 2);
  ctx.fillStyle = '#b9c4d8';
  ctx.font = '13px Georgia, serif';
  ctx.textAlign = 'center';
  ctx.fillText(
    'WASD / arrows move · Shift sneak · Space run · 1 smoke bomb · 2 EMP · click tosses a coin · P pause · M mute',
    CANVAS_WIDTH / 2,
    CANVAS_HEIGHT - 15,
  );
}

function drawPanel(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(5,8,18,0.62)';
  ctx.fillRect(0, HUD_HEIGHT, CANVAS_WIDTH, ROWS * TILE);
  const panelWidth = 760;
  const panelX = (CANVAS_WIDTH - panelWidth) / 2;
  const panelY = 190;
  const panelHeight = 130 + lines.length * 26;
  ctx.fillStyle = '#0d1526';
  ctx.fillRect(panelX, panelY, panelWidth, panelHeight);
  ctx.strokeStyle = accent || GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(panelX, panelY, panelWidth, panelHeight);
  ctx.textAlign = 'center';
  ctx.fillStyle = accent || GOLD;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText(title, CANVAS_WIDTH / 2, panelY + 48);
  ctx.fillStyle = '#dfe6f2';
  ctx.font = '16px Georgia, serif';
  lines.forEach((line, index) => {
    ctx.fillText(line, CANVAS_WIDTH / 2, panelY + 88 + index * 26);
  });
}

function drawCoverBand(ctx, game) {
  // The cover keeps a compact title plaque over live play: it sits at the
  // top-left so the top-wall camera and its cone stay in the frame.
  ctx.fillStyle = 'rgba(5,8,18,0.82)';
  ctx.fillRect(40, 80, 560, 92);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 80, 560, 92);
  ctx.textAlign = 'center';
  ctx.fillStyle = GOLD;
  ctx.font = 'bold 30px Georgia, serif';
  ctx.fillText('MIDNIGHT AT THE AURELIA', 320, 118);
  ctx.fillStyle = '#dfe6f2';
  ctx.font = '14px Georgia, serif';
  ctx.fillText(
    'Three rooms. Four lenses. One diamond. Do not let the alarm reach 100%.',
    320,
    146,
  );
}

/** Draw the whole game for the current screen. */
export function drawGame(ctx, game) {
  ctx.fillStyle = '#070b16';
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  if (!game.world) return;
  drawBoard(ctx, game.world);
  drawHud(ctx, game);
  drawBottomBar(ctx);
  if (game.coverTitle) drawCoverBand(ctx, game);
  if (game.screen === 'title') {
    drawPanel(ctx, 'MIDNIGHT AT THE AURELIA', [
      'You are Sable, gentleman thief. Three rooms stand between you and the Aurelia Diamond.',
      'Slip past the night guards and their sweeping cameras. The alarm climbs when they see you —',
      'at 100% the museum locks down. Shadow carpet hides you; display cases block every lens.',
      '1 smoke bomb · 2 EMP · click tosses a coin to lure a guard · grab the gems on the way.',
      '',
      'Press Enter to begin the heist',
    ]);
  } else if (game.screen === 'paused') {
    drawPanel(ctx, 'PAUSED', ['The museum holds its breath.', 'Enter to resume · R to restart the room']);
  } else if (game.screen === 'level-done') {
    drawPanel(ctx, 'ROOM CLEARED', [
      game.levelRating,
      `Loot this room: ${formatMoney(game.world.lootValue)} · Time ${formatTime(game.levelSeconds)}`,
      'Press Enter for the next room',
    ], '#6fe89a');
  } else if (game.screen === 'caught') {
    const lockdown = game.world.caughtBy === -2;
    drawPanel(ctx, lockdown ? 'LOCKDOWN!' : 'CAUGHT!', [
      lockdown
        ? 'The alarm hit 100% — steel shutters slam down over every door.'
        : 'A guard laid hands on Sable. The night is not over yet.',
      `${game.lives} ${game.lives === 1 ? 'life' : 'lives'} left · the alarm cools to ${ALARM.afterCaught}%`,
      'Press Enter to try the room again',
    ], '#ff4b4b');
  } else if (game.screen === 'game-over') {
    drawPanel(ctx, 'THE HEIST FAILS', [
      'Three strikes, and the Aurelia keeps its diamond — tonight.',
      `Haul so far: ${formatMoney(game.totalLoot)}`,
      'Press Enter to start a new night',
    ], '#ff4b4b');
  } else if (game.screen === 'win') {
    drawPanel(ctx, 'THE AURELIA DIAMOND IS YOURS', [
      game.finalRating,
      `Total haul: ${formatMoney(game.totalLoot)} · ${formatTime(game.elapsed)} · ${game.roomsCleared} rooms`,
      'Press Enter to run it back',
    ], '#6fe89a');
  }
}
