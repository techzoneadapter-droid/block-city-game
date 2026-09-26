# Block City canonical presentation system

## Approved visual-board roles

The nine owner-supplied atlases are authorized runtime sprite sources. This migration supersedes the previous design-only/procedural-art policy.

| Authority | Domain |
|---|---|
| 01 | Branding |
| 02 | Shared controls and HUD |
| 03 | Shared navigation |
| 04 | Puzzle blocks, boosters and effects |
| 05 | Puzzle wells, cells, goals and moves |
| 06 | Characters and accessories |
| 07 | Interactive buildings and environment |
| 08 | Home harbor scene and PLAY |
| 09 | District management surfaces |

`public/assets/block-city-v2/asset-registry.json` records crop bounds, source/output SHA-256, dimensions, pivots and transformations. `scripts/extract-ui-atlases.py` reproduces these exports from the original named attachments, using connected alpha bounds and explicit regions. Keep the sources in the attachment directory, never in the runtime library. Source panels with example values are sliced into clean frames before export. Baked numbers never drive live UI.

`src/ui/assets.ts` is the sole canonical texture loader and Canvas-compatible nine-slice renderer. Each scene requests its own domains; shared icons, boosters and player portraits are cached across scenes. Source sheets are never loaded at runtime.

`src/ui.ts` owns PlayerHud, CurrencyChip, ProgressBar, PrimaryButton, IconButton, BottomNavigation, BottomNavButton, NotificationBadge, Panel, StatCard and TaskRow. `src/ui/district.ts` supplies DistrictHeader, BuildingCard, statistics, construction and task surfaces. `src/puzzle/art.ts` and `src/toyBlock.ts` expose board, cell, piece and booster presentation. Scenes continue to own existing actions and state.

`src/ui/tokens.ts` centralizes spacing, type, minimum targets, motion, layers and viewport metrics. Phaser FIT preserves the 390×844 logical input geometry; the parent respects CSS safe areas. City management clips above navigation and scrolls on short viewports. Raster images preserve their native aspect ratio; only deliberately sliced frames resize in both axes.

World objects use bottom-center anchors and ground-Y depth sorting; previews use centered anchors. Puzzle geometry remains eight by eight with the original drag/drop, piece generation, scoring, goals, economy and save schema. Source colors are presentation-only.

Full-body and portrait art use Atlas 06. Where the sheet has incomplete alternate expressions, reuse the canonical portrait rather than displaying a damaged duplicate. Original fallback drawing remains only for icons/accessories not supplied as usable standalone art.

Run `npm run qa`, `npm run build`, and `npm run qa:browser`. Browser QA accepts `CHROME_BIN` for a local Chromium installation; `?qa` exposes the Phaser instance for inspection only. It is absent during normal play.
