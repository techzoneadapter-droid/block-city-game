# Block City - Project Context

## Product
Block City: Puzzle & Build is a mobile-first hybrid-casual Android game.

Core promise: **Every Block Builds Your City.**

The player solves relaxing 8x8 block puzzles, earns Construction Stars, and spends those stars to grow a premium cozy 2.5D city.

## Audience
Initial soft-launch markets:
- India
- Philippines

Default language:
- English

## Technical stack
- Phaser 3
- TypeScript
- Vite
- Mobile-first HTML5
- Portrait 390x844 logical resolution
- Later wrapped for Android with Capacitor

## Design rules
- Premium cozy visual style.
- Dark teal UI + vibrant blocks + warm city colors.
- Clean mobile interface. Never look like a cheap web demo.
- Core puzzle must remain understandable in under 10 seconds.
- Basic gameplay should work without a backend.
- Keep performance suitable for lower/mid-range Android devices.
- Do not add large dependencies without a strong reason.
- Do not replace Phaser with another engine.
- Do not change portrait orientation.
- Do not add banner ads into gameplay.
- Keep monetization out of the prototype until retention is proven.
- Save progression locally first.

## Current vertical slice
1. Home scene with Puzzle and City entry points.
2. 8x8 block puzzle.
3. Three draggable pieces per tray.
4. Fair tray generator that guarantees at least one currently placeable piece when possible.
5. Ghost placement preview while dragging, including invalid-placement feedback.
6. Horizontal/vertical line clearing with combo feedback.
7. Ten-level progression table plus scalable post-level-10 progression.
8. Dynamic line goals and star/coin rewards per level.
9. First-level drag tutorial.
10. Placement/clear particles, light sound feedback and optional device vibration.
11. Refresh booster unlocked at Level 3 and purchased with coins.
12. City scene with selectable buildings.
13. Coffee Shop three-stage progression.
14. Pocket Park three-stage progression.
15. District progress meter, population growth and District 2 unlock reward.
16. Local save for levels, currencies, booster uses and city progression.
17. Seeded starting boards and placement objectives.
18. Hammer and Row Clear boosters.
19. Riverside District 2 with River Market + Sunset Boardwalk progression.

## Phase 4 additions
- Seeded starting-board layouts from Level 2 onward.
- Secondary placement objectives on later levels.
- Hammer booster unlocked at Level 5: remove one chosen occupied cell.
- Row Clear booster unlocked at Level 7: clear the busiest row.
- Three-booster economy using earned coins.
- Riverside District 2 with its own riverfront visual identity.
- River Market and Sunset Boardwalk, each with three build stages.
- Riverside population growth and District 2 completion reward.

## Next priorities
- Add objective types beyond lines/placements, such as color streaks and combo missions.
- Add a lightweight daily challenge and streak loop.
- Add visual asset production pipeline for premium isometric buildings.
- Add onboarding for boosters when each one unlocks.
- Add analytics only after the vertical slice is fun.


## Phase 5 retention loop
- Daily Hub scene.
- 7-day check-in streak with escalating coin rewards and a day-7 Star.
- Deterministic daily challenge with unique seeded board and objectives per calendar day.
- Three daily missions: clear lines, place blocks, build a city stage.
- Mission rewards feed a persistent City Chest key meter.
- City Chest opens every 5 keys for coins + a Construction Star.
- Daily challenge grants one chest key and can only grant its reward once per day.
- Home screen surfaces a Daily reward-ready badge.
