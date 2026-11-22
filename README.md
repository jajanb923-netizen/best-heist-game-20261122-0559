# Midnight at the Aurelia — a heist game

[![make.fun · best-heist-game-20261122-0559](https://make.fun/badge/best-heist-game-20261122-0559.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![rank](https://make.fun/badge/best-heist-game-20261122-0559/jajanb923-netizen/best-heist-game-20261122-0559/rank.svg)](https://make.fun/bounty/best-heist-game-20261122-0559/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)
[![reward](https://make.fun/badge/best-heist-game-20261122-0559/jajanb923-netizen/best-heist-game-20261122-0559/reward.svg)](https://make.fun/bounty/best-heist-game-20261122-0559?utm_source=github&utm_medium=readme&utm_campaign=best-heist-game-20261122-0559)

A complete top-down heist game that runs in a desktop browser from its
own static files, no network request. You are Sable, gentleman thief, in
the Aurelia Museum at midnight: lift the loot from each of three rooms
and slip out through the green exit — before the alarm hits 100%.

A real heist, not a maze with a timer:

- **Guards with vision cones** — the night guards patrol routes you can
  learn; their cones are clipped by display cases, fill with suspicion as
  they see you, and turn red when the chase begins.
- **Security cameras that sweep** — wall lenses sweep red cones across the
  marble; a camera that watches you feeds the alarm meter directly and
  tips off the nearest guard.
- **An alarm meter that matters** — 0 to 100, always on the HUD. It climbs
  while any guard or camera sees you and cools while you stay hidden; at
  100% the museum locks down and the room resets.
- **Tools at a cost** — a smoke bomb that blinds every lens (2 a room),
  an EMP that kills the cameras for 8 seconds (1 a room), and coins you
  toss to lure a guard away (3 a room).
- **Cover that works** — shadow carpet hides you, display cases block
  every line of sight, velvet ropes shape the routes.
- **Three rooms, rising tension** — 2 guards and 2 cameras in the Marble
  Gallery, 3 and 3 in the Vault Corridor, 4 and 4 in the Aurelia Vault,
  with gems to pocket for a ghost rating.

All art is drawn in code and all sounds are synthesised in the browser —
no audio files, no copied game.

## Play it

```sh
node serve.ts
```

Then open http://localhost:8080. `WASD` / arrows to move, `Shift` to sneak,
`Space` to run (loud), `1` for a smoke bomb, `2` for the EMP, mouse click
to toss a coin, `P` to pause, `M` to mute, `R` to restart the room,
`Enter` to start.

## Hand it in

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

`main.ts` copies `game/` and `screenshots/` to the output directory and
writes `dossier.json` with the vendored make.fun library.

## Layout

- `game/index.html` — the page; `game/src/main.js` boots the loop and the screens
- `game/src/config.js` — every tuning number in one place
- `game/src/levels.js` — the three rooms, their maps, patrols, cameras and lamps
- `game/src/world.js` — movement, patrols, cameras, the alarm meter, tools, pickups
- `game/src/render.js` — everything the player sees, cones to HUD to overlays
- `game/src/input.js` — keyboard and mouse, translated to game coordinates
- `game/src/audio.js` — synthesised sounds, WebAudio only
- `game/src/shots.js` — the scripted screenshot scenes (`?shot=...`)
- `game/src/random.js` — the seeded generator behind the decoration
- `screenshots/` — 4 real renders of the game, the first by name is the cover
- `vendor/makefun-game.ts` — the kit's dossier library, unchanged
