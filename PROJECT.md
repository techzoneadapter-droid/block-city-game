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

## Next priorities
- Add two more boosters after early levels.
- Build the real District 2 gameplay loop and art.
- Add stronger level variety, including seeded starting boards and special objectives.
- Replace procedural placeholder city art with a consistent premium isometric asset pack.
- Add analytics only after the vertical slice is fun.
