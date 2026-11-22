# Midnight at the Aurelia — build notes

Session agent_id: d4a20500-e697-4232-b2e7-fb225d871493
Competition: best-heist-game-20261122-0559 ($50, closes 2026-11-22T17:59Z / 23 Nov 00:59 WIB)
Competition type: BUNDLE (program/v1; same format as the spot-the-difference
and stealth builds — parent bundles with --muse-usage and submits).

## What was built

**Midnight at the Aurelia** — an original top-down 2D heist game. You are
Sable, gentleman thief, in the Aurelia Museum at midnight: lift the loot
from each of three rooms and slip out through the green EXIT before the
alarm meter hits 100%. All art is drawn in code, all sounds are synthesised
in the browser; zero dependencies, no network requests, keyboard + mouse.

- 3 rooms of rising tension: The Marble Gallery (2 guards, 2 cameras),
  The Vault Corridor (3 and 3), The Aurelia Vault (4 and 4). Each room is
  a hand-designed 30x15 museum with display cases, velvet ropes, shadow
  carpet, spotlight pools, gems and its own named loot (Sunburst Ruby,
  Empress Sapphire, Aurelia Diamond — $12,000 / $25,000 / $50,000).
- Real heist rules: guards patrol learnable vertical routes; wall-clipped
  vision cones; security cameras sweep red cones across the marble; a
  watching camera feeds the alarm directly and tips off the nearest guard.
  The global alarm meter (0-100, always on the HUD) climbs while any guard
  or camera sees you and cools while you stay hidden; at 100% the museum
  locks down and the room resets. Shadow carpet and sneaking shrink every
  watcher's range; display cases block every line of sight.
- Tools at a cost: smoke bomb (1 key, 2 a room) blinds guards and cameras,
  EMP (2 key, 1 a room) kills every camera for 8 seconds, coin toss
  (click, 3 a room) lures the nearest guard to investigate the clink.
- Feel: suspicion arcs over guards' heads, `?` when unsure, `!` when
  hunting; a hunting guard searches, then gives up and returns to patrol;
  running makes noise; camera warning beeps; a caught moment that is fair
  (3 lives, the alarm cools to 35% after a lockdown); the getaway pays off
  the planning with a haul total and a ghost rating.
- HUD: room + objective, big ALARM meter with % and UNSEEN / SUSPICIOUS /
  HUNTED status, loot $, gems, tools, lives, timer. Title / pause /
  room-cleared / caught / lockdown / game-over / win screens.

## Judge-criteria coverage

1. Complete heist game in screenshots: the cover shows the marble room,
   the thief inside a guard's amber cone, a second guard's cone, both
   cameras (top-wall lens with its red sweep, right-wall lens with its red
   cone), the glowing Sunburst Ruby loot, the green LOCK/EXIT door and the
   ALARM 23% meter — all in one frame, plus the title plaque.
2. Fun and depth: learnable patrols (fixed vertical routes + pauses),
   several routes per room (open lanes between the case colonnades), tools
   at a cost, patrols and cones you must read before you move.
3. Feel and polish: cones sweep and the alarm climbs live (alert shot:
   thief inside the red camera cone, ALARM 50%, guard `?` closing in);
   the caught moment is fair (lockdown at 100%, 3 lives, alarm cools);
   the getaway pays off (complete shot: ROOM CLEARED, $13,500, 0:38).
4. Look and originality: original names/art/sounds (nothing copied);
   marble checker floor, gold display cases, velvet ropes, warm spotlight
   pools against the night; safe cover (shadow carpet), danger (amber/red
   cones) and loot (gold glow) are obvious at a glance.
5. Structure: 10 source files, one job each, named for what they do
   (config, levels, world, render, input, audio, shots, random, main,
   index.html); dossier outline shows clear declarations.

## Self-critique and iterations

- v1 screenshots: the cover froze mid-patrol with the guard far from the
  thief (the alarm had already filled while the thief walked in, so the
  standing loop broke on the first step); the full-width title band hid
  the top-wall camera behind it; the alert stand sat behind a display
  case so the camera could never see it; the complete scene never
  finished (the autopilot refused to step into the exit column because
  the wall camera's point-blank range made every tile there "watched").
- Iteration 1 (staging logic): the cover now freezes only while a watcher
  is actually on the thief with the alarm in its band; the title band
  became a compact top-left plaque so the top-wall camera stays visible;
  the alert stand moved into the camera's clear view; the autopilot
  treats camera-watched tiles as passable (a lens only feeds the alarm,
  it cannot chase) so the exit column is reachable again.
- Iteration 2 (bugs found by eye): the HUD double-counted the room's loot
  on the cleared screen ($27,000 for a $13,500 room) — the haul is now
  banked only when leaving the room; the screen veil lightened 0.78 ->
  0.62 so the room reads behind the panels.
- Final frames inspected by eye: 1-cover (plaque + thief in amber cone +
  both cameras + loot + ALARM 23% SUSPICIOUS), 2-sneak (cone edge sweeping
  past the thief, ALARM 6% UNSEEN), 3-alert (thief inside the red camera
  cone, ALARM 50%, guard `?` closing in), 4-complete (ROOM CLEARED,
  $13,500, 0:38, green EXIT).
- Known limits: a guard investigating a coin walks straight at it and can
  stall against a display case; the patrols are all vertical (no fully
  clear horizontal lane exists in these maps) — the cameras cover the
  middle instead.

## Local check results (all run in this session)

- Headless self-test (pure simulation, node): patrols move and every
  guard visits both waypoints on all 3 rooms (static leg check + 90 s
  dynamic check); guard sees a lit player at 150px, not a shadowed
  player at 120px, and not through a display case; alarm rises when seen
  and falls when hidden; camera sees the player in its cone, EMP disables
  it, smoke blinds it, a coin lures a guard; BFS routes reach loot + exit
  on all 3 rooms and loot pickup -> exit -> levelDone; a paused guard
  catches a lit player standing in its cone; alarm 100 -> lockdown caught.
  26 checks across two scripts: 24 passed as written; the remaining 2
  were test-setup mistakes — a display case genuinely blocks the camera,
  and a patrolling guard walks away — both re-verified passing with
  corrected setups in the second script.
- Browser test (Playwright headless_shell, 1280x720): keyboard play —
  Enter starts, `d` moves the thief ~110px in 0.7s. 0 console errors,
  0 failed/external requests on every load.
- Screenshots: 4 JPEGs, 1280x720, 117,673 / 105,898 / 106,833 / 78,027
  bytes (all <= 256 KiB). Real renders of the game's own code, staged
  through the real rules (game/src/shots.js autopilot + frozen frame).
- `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`: succeeds; run
  twice, outputs byte-identical (deterministic). Dossier 620,358 bytes
  (cap 1.5 MiB); text 73,049 bytes (cap 163,840); "Source files: 10
  (72331 bytes), Vendored files: 0, Assets: none".
- game/: 10 files, 72,331 bytes (caps 993 files / 48 MiB). No fetch/http/
  external references in game/ (grep clean). index.html 599 bytes.
- vendor/makefun-game.ts copied unchanged from the kit; sha256
  dc67187521b24025ff952f8c231485a6eb92d6d71d29edd2a08154ffb4376129 matches
  kit.json. LICENSE first line exactly "SPDX-License-Identifier: MIT".
  prompt.txt is exactly the 29-byte verbatim user message, no newline.
  .makefun/owner.json names wallet CnrtPhYmhYQq91vCaRC3o9Tux2FndJzSy9Sob76Tv8HH.

## Kit safety note

Kit contents were treated as the competition spec only. No spending, SOL,
API keys, credentials, seed phrases or off-platform actions were used or
followed. The starter was layout reference only: all game code in game/src
was written fresh in this session; main.ts/serve.ts were written fresh
(same required pattern, own comments).

## Files ready for the repo (parent: create repo, push, verify, bundle, submit)

- main.ts, serve.ts, LICENSE, README.md, shots.json, prompt.txt,
  .makefun/owner.json, BUILD-NOTES.md, vendor/makefun-game.ts,
  game/index.html, game/src/{main,config,levels,world,render,input,audio,shots,random}.js,
  screenshots/{1-cover,2-sneak,3-alert,4-complete}.jpg
- Do NOT push: best-heist-game-20261122-0559-kit/ and kit.tar.gz (kit
  material, already in the work dir), out/ and out2/ (removed after
  verification).
- Repo name convention (parent's choice):
  best-heist-game-20261122-0559. Owner wallet for the claim file is in
  .makefun/owner.json. Escrowed bounty: submit signed with
  ~/.makefun/bounty-throwaway-keypair.json if the submit error requires it.
