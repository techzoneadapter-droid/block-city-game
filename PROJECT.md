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


## Phase 6 meta progression
- Builder XP and persistent profile level.
- Home profile chip links to a dedicated Progress screen.
- Level Road visualization around the player's current level.
- Next Big Unlock milestone meter tied to district construction.
- Lifetime stats for lines, placements, builds, level completions and Daily Challenge completions.
- Five claimable achievements with coin/star rewards and City Chest key rewards.
- Special debris cells from Level 6 onward that must be cleared by completed lines or compatible boosters.
- Combo side-quest objectives from later levels.
- Hammer and Row Clear boosters correctly interact with debris objectives.
- Level-complete and Daily-complete screens now show Builder XP progression.


## Phase 7 modern live-ops pass
- Puzzle modes are now visually explicit: Normal Mode keeps Power Tools, Daily Challenge uses Fair Play with boosters disabled.
- Normal puzzle gets a redesigned three-card Power Tools dock with locked/unlocked states and active Hammer highlighting.
- In-game menu adds Home, Sound toggle and Haptics toggle.
- Later levels introduce Ice tiles: the first completed line cracks the ice while the tile remains occupied; compatible boosters can remove it instantly.
- Ice, Debris and Combo goals all appear in the side-quest HUD.
- Weekly rotating Event scene with deterministic weekly themes, 500-point progress track and five claimable reward milestones.
- Weekly Event points come from normal level clears, Daily Challenge completion and city construction.
- Home navigation now exposes Play, City, Daily and Event as first-class destinations with reward-ready badges.
- Daily Hub explicitly explains Fair Play rules and has a full animated City Chest opening reward.
- Version marker advanced to v0.7 across active gameplay surfaces.


## Phase 8 campaign and Skyline expansion
- PLAY now opens a dedicated City Journey campaign map instead of dropping directly into a puzzle.
- Campaign map visualizes the nearby level road, current NEXT node, milestone levels, difficulty, objectives, rewards and currently unlocked Power Tools.
- Added District 3: Skyline Heights.
- Skyline Heights contains Metro Tower and Rooftop Garden, each with three visual build stages and its own star/coin/population economy.
- Completing Riverside unlocks Skyline Heights; completing Skyline grants Master Builder status, bonus coins and stars.
- Builder Profile milestone copy now tracks the real Skyline unlock and Master Builder progression.
- Active gameplay surfaces use the v0.8 marker.


## Phase 9 - Puzzle 2.0 and 30-level campaign
- Replaced the short scalable campaign with 30 handcrafted campaign levels across six five-level chapters.
- Chapters: Starter Street, Riverside, Skyline Heights, Neon Junction, Garden Quarter and Grand Metropolis.
- Every chapter has its own named levels, board layouts, difficulty curve, objectives and a milestone finale.
- Levels 1-3 now form an onboarding trilogy: drag, line clearing, then Power Tools.
- Piece generation is board-aware: early levels unlock simpler shape pools, later levels introduce larger shapes, and crowded boards enter a mercy mode that guarantees more useful pieces without making the game deterministic.
- Puzzle scoring now rewards placed blocks, line clears, multi-line clears, combos, debris and ice progress.
- Every campaign level awards a 1-3 performance medal based on score and Power Tool usage.
- Campaign map now shows six chapter nodes, five-level routes, completion medals, finale markers, objective briefings, score targets and currently available Power Tools.
- Milestone levels 5/10/15/20/25/30 grant larger rewards, a one-time chapter coin bonus and deliberately route the player back into the City build loop.
- Added near-win and tight-board feedback so the player gets tension cues before the end state.
- No-moves screen now reports score/progress and includes a disabled Rewarded-Ad revive slot ready for v1.0 monetization wiring.
- Level completion has upgraded particles, score/medal feedback, chapter-complete treatment and smarter routing to Campaign or City.
- Save schema migrated to v2 with campaign medals, chapter reward claims, lifetime score and booster-usage tracking while preserving existing saves.
- v0.9 is the gameplay-focused pre-v1.0 milestone.
