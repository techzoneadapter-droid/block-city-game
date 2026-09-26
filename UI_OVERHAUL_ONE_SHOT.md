# BLOCK CITY — ONE-SHOT UI OVERHAUL

You are the principal game UI engineer. Complete the entire Block City presentation-layer migration in this single run.

The owner is non-technical. Do not ask them to move files, rename assets, calculate coordinates, create folders, choose implementation alternatives, run Git commands, or send another prompt between phases.

## INPUT ASSETS

This task is started from Vibaocode with exactly nine uploaded PNG atlas/source images attached to the AI request. They correspond to:

1. Branding / logo / icon
2. Core UI / buttons / HUD / currency / panels
3. Navigation
4. Puzzle art / blocks / VFX / boosters
5. Puzzle gameplay UI / board / goals / moves / pieces
6. Characters / portraits / accessories / pet
7. Buildings / environment
8. Home screen assets
9. District / City management assets

The uploaded images are source atlases, not screenshots to paste into the game.

At the start:
- locate the nine uploaded image files in the Vibaocode/cloud sandbox or attachment workspace;
- copy the source files into a temporary folder such as `.ui-overhaul-source/`;
- inspect transparency and dimensions;
- extract/crop individual sprites from transparent atlas regions programmatically where possible;
- prefer alpha/connected-component or deterministic bounding-box extraction instead of manual approximate re-drawing;
- create the canonical runtime library under `public/assets/block-city-v2/`;
- never use an entire atlas as a screen background unless the asset itself is the intended decorative scene.

If the attachment system provides generated filenames rather than the names above, identify them by content/order. Do not ask the owner to rename them.

## CANONICAL ASSET AUTHORITY

When content is duplicated, use this authority order:

- Pack/Atlas 01 = branding
- Pack/Atlas 02 = shared/core UI
- Pack/Atlas 03 = navigation
- Pack/Atlas 04 = puzzle blocks / VFX / boosters
- Pack/Atlas 05 = puzzle-screen-specific UI
- Pack/Atlas 06 = characters
- Pack/Atlas 07 = buildings/environment
- Pack/Atlas 08 = Home-specific harbor scene + PLAY
- Pack/Atlas 09 = district-management-specific UI

A later screen-specific atlas may define composition but must not silently replace a higher-authority shared asset.

## NON-NEGOTIABLE SCOPE

Preserve unless a tiny compatibility fix is strictly required:
- puzzle rules;
- piece generation;
- drag/drop behavior;
- scoring and clear rules;
- economy values;
- save format;
- progression and level data;
- route/navigation semantics;
- current user-data compatibility.

Allowed changes:
- visual composition;
- shared UI architecture;
- sprite rendering;
- scene layout;
- responsive behavior;
- animation/tween feedback;
- visual hierarchy;
- safe-area handling;
- presentation-layer asset loading.

Do not use `git reset --hard`. Preserve existing intended work. If a dirty change conflicts with the migration, integrate it rather than discarding it.

## DESIGN-SYSTEM FIRST

Before rebuilding screens create/adapt reusable UI contracts:

- PlayerHud
- CurrencyChip
- ProgressBar
- PrimaryButton
- IconButton
- BottomNavigation
- BottomNavButton
- NotificationBadge
- Panel
- StatCard
- BuildingCard
- TaskRow
- DistrictHeader
- PuzzleBoardView
- PuzzleCellView
- PuzzlePieceView
- BoosterButton

Centralize:
- spacing;
- typography sizes;
- hitbox sizes;
- transition durations;
- press scale;
- safe-area offsets;
- z/layer rules;
- shared responsive metrics.

Scenes must compose shared components instead of reimplementing HUD/button styles independently.

## DYNAMIC DATA RULE

Never bake mutable values into static screenshots/composites.

These must remain runtime driven:
- player name;
- level;
- XP;
- coin;
- gem;
- lives/energy;
- moves;
- goals;
- score;
- population;
- income;
- happiness;
- appeal/district level;
- building prices;
- construction timer/progress;
- daily-task progress;
- notification counts.

Use art sprites as frames/icons/backgrounds and overlay runtime text/progress.

## PIVOTS / DEPTH

- generic UI: center unless component geometry requires another anchor;
- full-body characters: bottom-center `(0.5, 1)`;
- city buildings/environment: bottom-center `(0.5, 1)`;
- puzzle cells/blocks: center;
- city depth: ground Y, with grid X tie-breaker if needed;
- never blindly use center pivots for world objects.

## EXECUTION PHASES — ONE RUN

Do not stop for approval between phases.

**RESUME-SAFETY / LIMIT RULE:** After every completed phase—and immediately if context/token/runtime limits are approaching—persist an exact checkpoint in `.ui-overhaul-checkpoint.md` containing completed phases, changed files, asset-extraction/registry state, latest QA/build status, unresolved issues, and the single next action; commit and push all coherent buildable progress to `origin/main`, and on any resumed run read that checkpoint plus `git status`/recent commits first and continue from the recorded next action without repeating completed work or re-extracting/rebuilding assets that are already valid.

### PHASE 0 — AUDIT
Inspect:
- `git status`;
- current branch;
- `origin/main`;
- package scripts;
- scene graph;
- current state/data flow;
- current UI and procedural/placeholder art;
- existing tests and QA scripts.

Establish a functional baseline before changing presentation code.

### PHASE 1 — CANONICAL ASSET LIBRARY
Extract usable sprites from the nine uploaded atlas images into domain folders:

```
public/assets/block-city-v2/
  brand/
  core/
  navigation/
  home/
  puzzle/art/
  puzzle/ui/
  city/
  district/
  characters/
```

Create a runtime registry such as:
`public/assets/block-city-v2/asset-registry.json`.

Use logical keys rather than scene code depending on original atlas file names.

Examples:
- `brand.logo`
- `core.settings`
- `core.coinIcon`
- `nav.build.normal`
- `nav.build.selected`
- `puzzle.block.red`
- `puzzle.booster.hammer`
- `city.building.house`
- `character.builder.full`
- `home.harborScene`
- `district.header`

Verify exported sprites have alpha, no accidental neighboring sprite bleed, and no obvious crop damage.

### PHASE 2 — SHARED UI SYSTEM
Implement shared UI components/tokens and bind them to existing state/events. Do not create a second parallel HUD system per scene.

### PHASE 3 — GLOBAL HUD + NAVIGATION
Standardize:
- player HUD;
- currency chips;
- settings;
- bottom navigation;
- notification badges;
- safe areas.

Use Atlas 02 for core UI and Atlas 03 for shared navigation.

### PHASE 4 — HOME
Visual authority:
- logo: Atlas 01;
- HUD/core: Atlas 02;
- navigation: Atlas 03;
- harbor/home scene + PLAY: Atlas 08.

Keep existing routes/actions.

The hierarchy should read:
HUD -> logo/hero -> city scene -> PLAY -> bottom navigation.

Use subtle polish only: short button press, gentle logo/scene motion, one-shot badge motion. Avoid constant pulsing.

### PHASE 5 — CITY SHELL
Use Atlas 09 for:
- district header;
- statistics;
- tabs;
- building cards;
- construction queue;
- daily tasks;
- City bottom navigation.

Maintain a flexible city viewport. On short devices, management content must scroll rather than overlap bottom navigation.

### PHASE 6 — PUZZLE
Use:
- Atlas 04 = canonical blocks/obstacles/VFX/boosters;
- Atlas 05 = board/goals/moves/piece-specific UI.

Do not rewrite puzzle logic.
- cell geometry must align exactly;
- dragged pieces must use the existing rules;
- hitboxes follow visible pieces;
- booster buttons call existing actions;
- VFX are brief/non-blocking;
- HUD remains readable.

### PHASE 7 — CITY INTERACTIVE ART
Use Atlas 07 for real interactive buildings/environment.

Do not flatten selectable/upgradable buildings into one screenshot.
Use bottom-center pivots and ground-Y depth sorting.
Atlas 09 district scene may be used only as decorative/background material where compatible with gameplay.

### PHASE 8 — CHARACTERS / PROFILE
Use Atlas 06.
Preserve profile/progression data and current actions.
Use shared HUD/navigation.

### PHASE 9 — RESPONSIVE + VISUAL QA
At minimum inspect:
- 360x800
- 375x812
- 390x844
- 412x915
- 430x932
- 768x1024 if supported

Use live preview/browser tooling.

Check and self-correct:
- clipping;
- overflow;
- text fit;
- HUD/nav overlap;
- safe areas;
- stretched sprites;
- inconsistent scales;
- duplicate visual styles;
- missing textures;
- puzzle alignment;
- City z-order;
- button hitboxes;
- unreadably small text.

Repeat render -> inspect -> fix until quality gates pass.

## ART RULES

- Use the extracted canonical sprite when it exists.
- Do not redraw supplied glossy buttons/icons/buildings/blocks approximately with Phaser Graphics or CSS.
- Graphics is acceptable only for dynamic progress fills, masks, debug overlays, hitboxes, and genuinely simple geometry not supplied as art.
- Do not load all nine source atlases at boot.
- Runtime should load only needed canonical textures by domain/scene.
- Do not excessively upscale small exports when a higher-resolution asset is available.

## MOTION

- button press scale: about 0.94–0.97;
- press duration: about 80–120 ms;
- panel transitions: about 160–260 ms;
- badge bounce: one-shot only;
- avoid excessive particles/camera shake.

## FINAL VERIFICATION

Run the repository's actual checks. At minimum:
- `npm run qa` if defined;
- `npm run build`;
- exercise main navigation;
- exercise Puzzle drag/drop;
- inspect final `git diff`.

Then:
1. commit all intended migration changes with a meaningful message such as `feat: rebuild Block City UI with canonical asset system`;
2. push directly to `origin/main`;
3. `git fetch origin`;
4. verify `origin/main` equals the new commit;
5. remove temporary atlas extraction/debug files that are not product files;
6. leave working tree clean.

## FINAL RESPONSE ONLY

Return only:
- DONE / BLOCKED
- final origin/main SHA
- major files/folders changed
- npm run qa result
- npm run build result
- responsive viewport sizes actually checked
- one concise real limitation if one remains

Do not start another task after this migration.
