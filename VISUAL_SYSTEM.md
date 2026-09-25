# Block City Visual System

This file is the visual source of truth for future work on Block City.

## Art direction

Block City is a bright, friendly, premium 2.5D voxel mobile game. The target is a polished store-screenshot look, not a generic web UI.

Shared traits:
- Chunky toy-like 2.5D forms with readable front / top / side planes.
- Royal blue and cyan UI shells, navy outlines, white highlights and soft contact shadows.
- Warm yellow / gold primary CTA with orange extrusion.
- Rounded cards with visible bevel depth, not flat SaaS panels.
- Strong silhouette readability at 390x844.
- Original runtime assets only. Never crop or embed visual-reference boards.

## Approved visual-board roles

The approved nine-board set is interpreted as:
1. Logo system.
2. Buttons, panels and HUD chips.
3. Navigation and Settings.
4. Puzzle blocks, materials, effects and boosters.
5. Puzzle gameplay composition.
6. Character / avatar system.
7. Buildings and environment props.
8. Home composition.
9. City / district composition.

If a screen-specific composition conflicts with a generic component board, preserve the screen layout and use the component board for styling.

## Logo

BLOCK:
- White / icy-cyan face.
- Thick dark navy outline.
- Blue extrusion.

CITY:
- Bright yellow / gold face.
- Orange extrusion.
- Dark outline.

The logo must remain the dominant Home focal point between the HUD and city hero.

## Controls

Primary CTA:
- Bright yellow face.
- Golden depth.
- Orange lower extrusion.
- Navy outer outline.
- White top highlight.
- Press state moves the face down and visually compresses the extrusion.

Secondary controls:
- Saturated blue face.
- Cyan highlight.
- Navy edge.
- Visible depth and shadow.

Disabled:
- Cool gray.
- Reduced contrast.
- Still clearly dimensional.

## HUD

Player chip:
- Avatar at left.
- Player name.
- Level badge.
- XP progress.

Currency:
- Coin and gem/star chips.
- Large readable value.
- Green plus button.

Settings:
- Chunky blue square.
- White gear.

## Navigation

Home:
- Build.
- Puzzles.
- Shop.
- Friends.

World / management:
- City.
- Tasks.
- Map.
- Shop.
- Friends.

Selected navigation must use bright cyan / white edge light and stronger elevation. Notifications use a dimensional red badge.

## Puzzle

- 8x8 board.
- Deep navy recessed empty cells.
- Bright 2.5D blocks with top/front/side readability.
- Three-piece tray.
- Hammer, Shuffle and Clear Line.
- Strong yellow-white clear sweep.
- NICE / COMBO feedback.
- Puzzle background may show the Block City harbor, but board readability always wins.

Materials:
- Red, blue, green, yellow, purple.
- Grass, stone, wood, sand, metal, ice.
- Lava, coral/water, crystal and rainbow for later content.

## Characters

Voxel / chibi proportions with large expressive heads and compact bodies.

Core cast:
- Builder Boy.
- City Planner Girl.
- Construction Worker.
- Chef / Shop Owner.
- Mechanic.
- Sailor.
- Tourist.
- Corgi.

Portrait and full-body versions must share the same face, hair, clothing and profession cues.

## City and environment

Buildings:
- House.
- Shop.
- Apartment.
- Office.
- Cafe.
- Harbor restaurant.

Environment:
- Road tile.
- Grass tile.
- Trees and palms.
- Bench.
- Lamp.
- Fence.
- Bridge.
- Dock / pier.
- Lighthouse.
- Ferris wheel.
- Sailboat.

City composition should read as a lively seaside district with layered water, cliffs, roads, harbor structures, buildings and greenery.

## Home

Visual order:
HUD -> Logo -> Seaside city hero -> PLAY -> Home navigation.

The city should fill the screen with very little dead space. The PLAY button remains the strongest interactive CTA.

## Performance

- Prefer cached Canvas / Phaser textures over per-frame vector redraw.
- Reuse textures by semantic key.
- Keep ambient animation slow and lightweight.
- Avoid filters and large third-party dependencies.
- Maintain the 390x844 logical portrait layout.

## Visual director review — 2026-09-25

Reviewed Home, Puzzle, City, Friends/Profile, Map, Tasks and Shop/Event at
390×844 against their assigned boards. Runtime artwork remains original;
reference sheets are never loaded by the app.

- Shared environment geometry now supplies City, Map, catalog thumbnails and
  Puzzle's waterfront scenery. Building bevels, rooftop gardens, trees, bridge
  arches and contact shadows replace the superseded environment drawings.
- Shared HUD, navigation, progress tracks, reward icons and booster illustrations
  are consistent across scenes. Character portraits and bodies retain the same
  expression/costume rig, with softer outlines and stronger surface lighting.
- The Phaser parent respects device safe areas for every screen, preserving FIT
  scaling. Home no longer applies a second independent safe-area offset.
- The browser smoke check uses Chrome's real clock and the Home-ready signal;
  it also fails on boot errors and browser exceptions. It requires Node 22+ and
  Chrome/Chromium, with no additional package dependency.

Validation: `npm run qa`, `npm run build`, `npm run qa:browser`, and all five
`tests/systems.test.mjs` tests pass. The build retains Phaser's existing large-chunk
warning. Browser interaction checks covered the complete navigation journey,
construction and catalog tabs, district and settings dialogs, gift idempotency,
all eight avatars and persistence, puzzle mouse/touch placement, paid boosters,
level completion, daily play, and saved-session/no-moves recovery. Home and
settings also passed bounds checks at 360×800 and 430×932, plus simulated notched
safe areas. Repeated navigation reused the same 134 cached textures.

The production browser pass reported no runtime exceptions. A short headless
desktop sample measured 16.7 ms median/p95 frame intervals; this is not a
physical-device mobile benchmark. City detail and character rendering remain
simpler than the fully rendered reference illustrations.
