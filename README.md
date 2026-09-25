# Block City: Puzzle & Build

A mobile-first hybrid-casual puzzle game prototype built with Phaser + TypeScript + Vite.

## Core loop

**Solve block puzzle -> earn Construction Star -> build your city -> play the next level.**

The current vertical slice includes:

- Premium mobile home screen
- 8x8 draggable block puzzle
- Row/column clearing
- Multi-level objective/reward progression
- Construction Star + coin rewards
- Refresh booster from Level 3
- 2.5D procedural city scene
- Coffee Shop + Pocket Park progression
- District completion, population growth and District 2 unlock
- Local progression save
- Daily Hub with streaks, missions and City Chest
- Builder XP, achievements and level road
- Debris, combo and Ice side objectives
- Weekly Event reward track
- City Journey campaign map and level briefing
- Three buildable districts: Starter Street, Riverside and Skyline Heights
- Metro Tower + Rooftop Garden progression
- In-game sound/haptics controls

## Run locally or in Vibaocode

Requirements: Node.js 20 or newer.

```bash
npm install
npm start
```

The Vite preview listens on `0.0.0.0:3000`. In Vibaocode, open this GitHub repository and its `ui-rebuild-v1` branch, then click **Run**. If Vibaocode asks for a start command, use `npm start`; if it asks for a preview port, use `3000`. The game is a portrait mobile web app and runs inside the App preview.

For local development with hot reload:

```bash
npm run dev
```

## Build

```bash
npm run build
```

See `PROJECT.md` for the design contract and UI requirements.


## v0.9 gameplay milestone
- 30 handcrafted campaign levels across six chapters.
- Chapter finales every five levels with larger rewards and a City build break.
- Board-aware fair piece generator with crowded-board mercy behavior.
- 1-3 performance medals and score targets per campaign level.
- Three-step onboarding in Levels 1-3.
- Near-win / tight-board feedback and a monetization-ready revive slot.
- Save v2 migration preserves existing local progress.
