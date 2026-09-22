export type Cell = [number, number];

export type ChapterDefinition = {
  id: number;
  name: string;
  subtitle: string;
  startLevel: number;
  endLevel: number;
};

export type LevelDefinition = {
  targetLines: number;
  targetPlacements?: number;
  targetCombo?: number;
  rewardStars: number;
  rewardCoins: number;
  label: string;
  difficulty: "Easy" | "Medium" | "Hard";
  chapter: number;
  milestone?: boolean;
  buildBreak?: boolean;
  tutorialStep?: "drag" | "clear" | "tools";
  startingCells?: Cell[];
  specialCells?: Cell[];
  iceCells?: Cell[];
  scoreTarget: number;
};

export const TOTAL_CAMPAIGN_LEVELS = 30;

export const CHAPTERS: ChapterDefinition[] = [
  { id: 1, name: "Starter Street", subtitle: "Learn the block rhythm", startLevel: 1, endLevel: 5 },
  { id: 2, name: "Riverside", subtitle: "Debris joins the puzzle", startLevel: 6, endLevel: 10 },
  { id: 3, name: "Skyline Heights", subtitle: "Ice changes every clear", startLevel: 11, endLevel: 15 },
  { id: 4, name: "Neon Junction", subtitle: "Combo planning matters", startLevel: 16, endLevel: 20 },
  { id: 5, name: "Garden Quarter", subtitle: "Dense boards, smart choices", startLevel: 21, endLevel: 25 },
  { id: 6, name: "Grand Metropolis", subtitle: "Master every city rule", startLevel: 26, endLevel: 30 },
];

const P = {
  corner: [[7,0],[7,1],[6,0]] as Cell[],
  lowBar: [[7,2],[7,3],[7,4],[6,3]] as Cell[],
  splitCorners: [[6,0],[6,1],[6,6],[6,7],[7,0],[7,7]] as Cell[],
  gate: [[7,1],[7,2],[7,5],[7,6],[6,2],[6,5]] as Cell[],
  posts: [[5,0],[5,7],[6,0],[6,7],[7,0],[7,3],[7,4],[7,7]] as Cell[],
  downtown: [[5,1],[5,6],[6,1],[6,3],[6,4],[6,6],[7,3],[7,4]] as Cell[],
  avenue: [[4,0],[4,7],[5,1],[5,6],[6,2],[6,5],[7,2],[7,3],[7,4],[7,5]] as Cell[],
  skyline: [[4,1],[4,6],[5,1],[5,3],[5,4],[5,6],[6,2],[6,5],[7,0],[7,3],[7,4],[7,7]] as Cell[],
  finale: [[3,0],[3,7],[4,1],[4,6],[5,2],[5,5],[6,2],[6,3],[6,4],[6,5],[7,0],[7,1],[7,6],[7,7]] as Cell[],
  bridge: [[3,1],[3,6],[4,1],[4,6],[5,2],[5,5],[6,2],[6,5],[7,3],[7,4]] as Cell[],
  zigzag: [[2,0],[2,7],[3,1],[3,6],[4,2],[4,5],[5,3],[5,4],[7,1],[7,6]] as Cell[],
  plaza: [[3,2],[3,3],[3,4],[3,5],[5,1],[5,6],[7,2],[7,5]] as Cell[],
  towers: [[2,1],[2,6],[3,1],[3,6],[4,1],[4,6],[6,3],[6,4],[7,3],[7,4]] as Cell[],
  ring: [[2,2],[2,3],[2,4],[2,5],[3,2],[3,5],[4,2],[4,5],[5,2],[5,3],[5,4],[5,5]] as Cell[],
  dense: [[2,0],[2,2],[2,5],[2,7],[3,1],[3,3],[3,4],[3,6],[5,1],[5,6],[6,2],[6,5],[7,0],[7,3],[7,4],[7,7]] as Cell[],
};

function take(cells: Cell[], count: number) {
  return cells.slice(0, Math.min(count, cells.length));
}

const LEVELS: LevelDefinition[] = [
  { targetLines: 2, rewardStars: 1, rewardCoins: 30, label: "First Block", difficulty: "Easy", chapter: 1, tutorialStep: "drag", scoreTarget: 260 },
  { targetLines: 3, targetPlacements: 6, rewardStars: 1, rewardCoins: 35, label: "Finish the Street", difficulty: "Easy", chapter: 1, tutorialStep: "clear", startingCells: P.corner, scoreTarget: 360 },
  { targetLines: 3, targetPlacements: 7, rewardStars: 1, rewardCoins: 40, label: "Fresh Delivery", difficulty: "Easy", chapter: 1, tutorialStep: "tools", startingCells: P.lowBar, scoreTarget: 430 },
  { targetLines: 4, targetPlacements: 8, rewardStars: 1, rewardCoins: 45, label: "Corner Lots", difficulty: "Easy", chapter: 1, startingCells: P.splitCorners, scoreTarget: 520 },
  { targetLines: 5, targetPlacements: 9, rewardStars: 2, rewardCoins: 80, label: "Starter Street Finale", difficulty: "Medium", chapter: 1, milestone: true, buildBreak: true, startingCells: P.gate, scoreTarget: 680 },

  { targetLines: 4, targetPlacements: 9, rewardStars: 1, rewardCoins: 55, label: "River Cleanup", difficulty: "Medium", chapter: 2, startingCells: P.posts, specialCells: take(P.posts, 2), scoreTarget: 650 },
  { targetLines: 5, targetPlacements: 10, rewardStars: 1, rewardCoins: 60, label: "Market Grid", difficulty: "Medium", chapter: 2, startingCells: P.downtown, specialCells: take(P.downtown, 2), scoreTarget: 740 },
  { targetLines: 5, targetPlacements: 11, targetCombo: 2, rewardStars: 1, rewardCoins: 65, label: "Boardwalk Rhythm", difficulty: "Medium", chapter: 2, startingCells: P.avenue, specialCells: take(P.avenue, 3), scoreTarget: 820 },
  { targetLines: 6, targetPlacements: 11, targetCombo: 2, rewardStars: 2, rewardCoins: 75, label: "Bridge Works", difficulty: "Medium", chapter: 2, startingCells: P.bridge, specialCells: take(P.bridge, 3), scoreTarget: 920 },
  { targetLines: 7, targetPlacements: 12, targetCombo: 2, rewardStars: 2, rewardCoins: 120, label: "Riverside Finale", difficulty: "Hard", chapter: 2, milestone: true, buildBreak: true, startingCells: P.finale, specialCells: take(P.finale, 4), scoreTarget: 1100 },

  { targetLines: 5, targetPlacements: 10, rewardStars: 1, rewardCoins: 70, label: "Cold Foundations", difficulty: "Medium", chapter: 3, startingCells: P.gate, iceCells: take(P.gate, 2), scoreTarget: 780 },
  { targetLines: 6, targetPlacements: 11, rewardStars: 1, rewardCoins: 75, label: "Glass District", difficulty: "Medium", chapter: 3, startingCells: P.skyline, iceCells: take(P.skyline, 2), scoreTarget: 880 },
  { targetLines: 6, targetPlacements: 12, targetCombo: 2, rewardStars: 1, rewardCoins: 80, label: "Frozen Corners", difficulty: "Hard", chapter: 3, startingCells: P.bridge, specialCells: take(P.bridge, 2), iceCells: P.bridge.slice(2,4), scoreTarget: 980 },
  { targetLines: 7, targetPlacements: 12, targetCombo: 2, rewardStars: 2, rewardCoins: 90, label: "Tower Pressure", difficulty: "Hard", chapter: 3, startingCells: P.towers, specialCells: take(P.towers, 2), iceCells: P.towers.slice(2,5), scoreTarget: 1120 },
  { targetLines: 8, targetPlacements: 13, targetCombo: 2, rewardStars: 3, rewardCoins: 150, label: "Skyline Finale", difficulty: "Hard", chapter: 3, milestone: true, buildBreak: true, startingCells: P.zigzag, specialCells: take(P.zigzag, 3), iceCells: P.zigzag.slice(3,6), scoreTarget: 1320 },

  { targetLines: 6, targetPlacements: 12, targetCombo: 2, rewardStars: 1, rewardCoins: 85, label: "Neon Warmup", difficulty: "Medium", chapter: 4, startingCells: P.plaza, scoreTarget: 980 },
  { targetLines: 7, targetPlacements: 13, targetCombo: 2, rewardStars: 1, rewardCoins: 90, label: "Double Signal", difficulty: "Hard", chapter: 4, startingCells: P.avenue, specialCells: take(P.avenue, 2), scoreTarget: 1120 },
  { targetLines: 7, targetPlacements: 14, targetCombo: 3, rewardStars: 2, rewardCoins: 95, label: "Combo Crossing", difficulty: "Hard", chapter: 4, startingCells: P.ring, iceCells: take(P.ring, 2), scoreTarget: 1280 },
  { targetLines: 8, targetPlacements: 14, targetCombo: 3, rewardStars: 2, rewardCoins: 105, label: "Rush Hour", difficulty: "Hard", chapter: 4, startingCells: P.dense, specialCells: take(P.dense, 3), iceCells: P.dense.slice(3,5), scoreTarget: 1450 },
  { targetLines: 9, targetPlacements: 15, targetCombo: 3, rewardStars: 3, rewardCoins: 170, label: "Neon Finale", difficulty: "Hard", chapter: 4, milestone: true, buildBreak: true, startingCells: P.finale, specialCells: take(P.finale, 4), iceCells: P.finale.slice(4,7), scoreTarget: 1650 },

  { targetLines: 7, targetPlacements: 13, targetCombo: 2, rewardStars: 1, rewardCoins: 100, label: "Garden Paths", difficulty: "Medium", chapter: 5, startingCells: P.plaza, specialCells: take(P.plaza, 2), scoreTarget: 1120 },
  { targetLines: 8, targetPlacements: 14, targetCombo: 2, rewardStars: 2, rewardCoins: 105, label: "Courtyard Ice", difficulty: "Hard", chapter: 5, startingCells: P.ring, iceCells: take(P.ring, 3), scoreTarget: 1280 },
  { targetLines: 8, targetPlacements: 15, targetCombo: 3, rewardStars: 2, rewardCoins: 110, label: "Hedge Maze", difficulty: "Hard", chapter: 5, startingCells: P.zigzag, specialCells: take(P.zigzag, 3), iceCells: P.zigzag.slice(3,5), scoreTarget: 1420 },
  { targetLines: 9, targetPlacements: 15, targetCombo: 3, rewardStars: 2, rewardCoins: 120, label: "Greenhouse Grid", difficulty: "Hard", chapter: 5, startingCells: P.dense, specialCells: take(P.dense, 4), iceCells: P.dense.slice(4,7), scoreTarget: 1600 },
  { targetLines: 10, targetPlacements: 16, targetCombo: 3, rewardStars: 3, rewardCoins: 190, label: "Garden Finale", difficulty: "Hard", chapter: 5, milestone: true, buildBreak: true, startingCells: P.towers, specialCells: take(P.towers, 4), iceCells: P.towers.slice(4,7), scoreTarget: 1820 },

  { targetLines: 8, targetPlacements: 14, targetCombo: 2, rewardStars: 2, rewardCoins: 120, label: "Metropolis Gate", difficulty: "Hard", chapter: 6, startingCells: P.bridge, specialCells: take(P.bridge, 2), iceCells: P.bridge.slice(2,4), scoreTarget: 1400 },
  { targetLines: 9, targetPlacements: 15, targetCombo: 3, rewardStars: 2, rewardCoins: 130, label: "Central Station", difficulty: "Hard", chapter: 6, startingCells: P.skyline, specialCells: take(P.skyline, 3), iceCells: P.skyline.slice(3,6), scoreTarget: 1580 },
  { targetLines: 10, targetPlacements: 16, targetCombo: 3, rewardStars: 2, rewardCoins: 140, label: "City Core", difficulty: "Hard", chapter: 6, startingCells: P.ring, specialCells: take(P.ring, 4), iceCells: P.ring.slice(4,7), scoreTarget: 1780 },
  { targetLines: 10, targetPlacements: 17, targetCombo: 3, rewardStars: 3, rewardCoins: 150, label: "Master Grid", difficulty: "Hard", chapter: 6, startingCells: P.dense, specialCells: take(P.dense, 4), iceCells: P.dense.slice(4,8), scoreTarget: 1980 },
  { targetLines: 12, targetPlacements: 18, targetCombo: 4, rewardStars: 4, rewardCoins: 300, label: "Grand Metropolis", difficulty: "Hard", chapter: 6, milestone: true, buildBreak: true, startingCells: P.finale, specialCells: take(P.finale, 5), iceCells: P.finale.slice(5,9), scoreTarget: 2350 },
];

export function getChapterForLevel(level: number) {
  const clamped = Math.max(1, Math.min(TOTAL_CAMPAIGN_LEVELS, level));
  return CHAPTERS.find((chapter) => clamped >= chapter.startLevel && clamped <= chapter.endLevel) || CHAPTERS[CHAPTERS.length - 1];
}

export function getLevelDefinition(level: number): LevelDefinition {
  if (level <= TOTAL_CAMPAIGN_LEVELS) {
    return LEVELS[Math.max(0, level - 1)];
  }

  const cycle = level - TOTAL_CAMPAIGN_LEVELS;
  const base = LEVELS[LEVELS.length - 1];
  return {
    ...base,
    label: `Master Builder ${cycle}`,
    targetLines: Math.min(15, 12 + Math.floor(cycle / 3)),
    targetPlacements: Math.min(22, 18 + Math.floor(cycle / 3)),
    rewardCoins: Math.min(420, 300 + cycle * 8),
    rewardStars: cycle % 5 === 0 ? 4 : 2,
    milestone: cycle % 5 === 0,
    buildBreak: cycle % 5 === 0,
    scoreTarget: 2350 + cycle * 90,
  };
}

export function levelPerformanceMedal(level: number, score: number, boostersUsed: number) {
  const target = getLevelDefinition(level).scoreTarget;
  const adjusted = Math.max(0, score - boostersUsed * 80);
  if (adjusted >= target * 1.22) return 3;
  if (adjusted >= target * 0.92) return 2;
  return 1;
}

export const REFRESH_BOOSTER_UNLOCK_LEVEL = 3;
export const REFRESH_BOOSTER_COST = 80;

export const HAMMER_BOOSTER_UNLOCK_LEVEL = 5;
export const HAMMER_BOOSTER_COST = 60;

export const BULLDOZER_BOOSTER_UNLOCK_LEVEL = 7;
export const BULLDOZER_BOOSTER_COST = 120;
