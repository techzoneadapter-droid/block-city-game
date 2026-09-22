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
1. Home scene.
2. 8x8 block puzzle.
3. Three draggable pieces per tray.
4. Horizontal/vertical line clearing.
5. Clear-three-lines level goal.
6. Level-complete reward: +1 Construction Star.
7. City scene.
8. Coffee Shop build progression.
9. Local save for level, stars, coins and building stage.

## Next priorities
- Improve fair piece generator.
- Add satisfying particles/sound/haptics.
- Add a second building and first full district loop.
- Add level data instead of one hard-coded goal.
- Add onboarding/tutorial.
- Add 3 boosters after early levels.
- Replace procedural placeholder city art with a consistent premium isometric asset pack.
- Add analytics only after the vertical slice is fun.
