import { preloadAssets } from '../ui/assets';
import Phaser from "phaser";
import { puzzleBackdrop, puzzlePanel, boosterIcon, lineClearEffect, BoosterButton, PuzzleBoardView } from "../puzzle/art";
import { PuzzleCellView as ToyBlock, PuzzlePieceView } from "../toyBlock";
import { emitVoxelBurst, materialFromColor } from "../art/blockMaterials";
import { readPuzzleSession, writePuzzleSession, clearPuzzleSession } from "../puzzleSession";
import { audio } from "../audio";
import { PuzzleRandom, rescueTargets } from "../puzzleLogic";
import { playerHud, gameIcon, button, COLORS, H, panel, text, W } from "../ui";
import { loadSave, updateSave } from "../save";
import { getDailyChallenge, localDateKey } from "../retention";
import { profileLevelFromXp } from "../progression";
import {
  BULLDOZER_BOOSTER_COST,
  BULLDOZER_BOOSTER_UNLOCK_LEVEL,
  getChapterForLevel,
  getLevelDefinition,
  levelPerformanceMedal,
  HAMMER_BOOSTER_COST,
  HAMMER_BOOSTER_UNLOCK_LEVEL,
  REFRESH_BOOSTER_COST,
  REFRESH_BOOSTER_UNLOCK_LEVEL,
} from "../levels";

type Shape = number[][];

type Piece = {
  container: Phaser.GameObjects.Container;
  shape: Shape;
  homeX: number;
  homeY: number;
  trayCellSize: number;
  color: number;
};

const BOARD = 8;
const CELL = 43;
const GAP = 1;
const BOARD_PX = BOARD * CELL;
const BOARD_X = (W - BOARD_PX) / 2;
const BOARD_Y = 255;

const SHAPES: Shape[] = [
  [[1]],
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1], [1], [1]],
  [[1, 1], [1, 1]],
  [[1, 1], [1, 0]],
  [[1, 1], [0, 1]],
  [[1, 0], [1, 1]],
  [[0, 1], [1, 1]],
  [[1, 1, 1], [0, 1, 0]],
  [[1, 1, 1, 1]],
  [[1], [1], [1], [1]],
  [[1, 1, 1], [1, 0, 0]],
  [[1, 1, 1], [0, 0, 1]],
];

const PIECE_COLORS = [0x45df12, 0x00a7ff, 0xffd21a, 0xff414b, 0xbc35f1];

export class PuzzleScene extends Phaser.Scene {
  private grid: boolean[][] = [];
  private cells: ToyBlock[][] = [];
  private pieces: Piece[] = [];
  private linesCleared = 0;
  private targetLines = 3;
  private rewardStars = 1;
  private rewardCoins = 35;
  private scoreTarget = 300;
  private score = 0;
  private boostersUsedThisLevel = 0;
  private tutorialStep: "drag" | "clear" | "tools" | undefined;
  private buildBreak = false;
  private nearWinShown = false;
  private dangerShown = false;
  private scoreText!: Phaser.GameObjects.Text;
  private targetPlacements = 0;
  private placementsMade = 0;
  private targetCombo = 0;
  private bestCombo = 0;
  private targetSpecials = 0;
  private specialCleared = 0;
  private specialCells = new Set<string>();
  private targetIce = 0;
  private iceBroken = 0;
  private iceCells = new Set<string>();
  private objectiveLabels = new Map<string, Phaser.GameObjects.Text>();
  private settingsOverlay?: Phaser.GameObjects.Container;
  private level = 1;
  private goalText!: Phaser.GameObjects.Text;
  private movesText!: Phaser.GameObjects.Text;
  private movesCaption!: Phaser.GameObjects.Text;
  private coinText!: Phaser.GameObjects.Text;
  private comboText!: Phaser.GameObjects.Text;
  private combo = 0;
  private locked = false;
  private activePiece: Piece | null = null;
  private activePointerId: number | null = null;
  private dragOffsetX = 0;
  private dragOffsetY = 0;
  private domPointerId: number | null = null;
  private domMoveHandler?: (event: PointerEvent) => void;
  private domUpHandler?: (event: PointerEvent) => void;
  private domDownHandler?: (event: PointerEvent) => void;
  private ghostCells: ToyBlock[] = [];
  private ghostPlacement: { row: number; col: number; valid: boolean } | null = null;
  private tutorialGroup?: Phaser.GameObjects.Container;
  private tutorialShown = false;
  private boosterMode: "hammer" | null = null;
  private dailyMode = false;
  private dailyKey = "";
  private random = new PuzzleRandom("");
  private pendingClear = false;
  private sessionFinished = false;
  private noMovesOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super("PuzzleScene");
  }

  init(data?: { daily?: boolean; fresh?: boolean }) {
    this.dailyMode = Boolean(data?.daily);
    if (data?.fresh) clearPuzzleSession(this.dailyMode);
    this.dailyKey = this.dailyMode ? localDateKey() : "";
    this.random = new PuzzleRandom(this.dailyKey);
  }

  preload() { preloadAssets(this, ['puzzle.', 'city.']); }

  create() {
    puzzleBackdrop(this);

    const save = loadSave();
    this.level = save.level;
    this.pendingClear = false;
    this.sessionFinished = false;

    const normalDefinition = getLevelDefinition(this.level);
    const dailyDefinition = getDailyChallenge(this.dailyKey || localDateKey());
    const levelDefinition = this.dailyMode
      ? {
          targetLines: dailyDefinition.targetLines,
          targetPlacements: dailyDefinition.targetPlacements,
          rewardStars: dailyDefinition.rewardStars,
          rewardCoins: dailyDefinition.rewardCoins,
          label: dailyDefinition.title,
          difficulty: "Hard" as const,
          startingCells: dailyDefinition.startingCells,
        }
      : normalDefinition;

    this.targetLines = levelDefinition.targetLines;
    this.rewardStars = levelDefinition.rewardStars;
    this.rewardCoins = levelDefinition.rewardCoins;
    this.scoreTarget = "scoreTarget" in levelDefinition ? levelDefinition.scoreTarget || 300 : 900;
    this.tutorialStep = "tutorialStep" in levelDefinition ? levelDefinition.tutorialStep : undefined;
    this.buildBreak = "buildBreak" in levelDefinition ? Boolean(levelDefinition.buildBreak) : false;
    this.targetPlacements = levelDefinition.targetPlacements || 0;
    this.targetCombo = "targetCombo" in levelDefinition ? levelDefinition.targetCombo || 0 : 0;
    this.targetSpecials = "specialCells" in levelDefinition ? levelDefinition.specialCells?.length || 0 : 0;
    this.targetIce = "iceCells" in levelDefinition ? levelDefinition.iceCells?.length || 0 : 0;

    this.grid = Array.from({ length: BOARD }, () => Array(BOARD).fill(false));
    this.cells = [];
    this.pieces = [];
    this.linesCleared = 0;
    this.score = 0;
    this.boostersUsedThisLevel = 0;
    this.nearWinShown = false;
    this.dangerShown = false;
    this.placementsMade = 0;
    this.combo = 0;
    this.bestCombo = 0;
    this.specialCleared = 0;
    this.specialCells = new Set<string>();
    this.iceBroken = 0;
    this.iceCells = new Set<string>();
    this.objectiveLabels.clear();
    this.settingsOverlay = undefined;
    this.noMovesOverlay = undefined;
    this.locked = false;
    this.activePiece = null;
    this.activePointerId = null;
    this.ghostCells = [];
    this.ghostPlacement = null;
    this.tutorialShown = false;
    this.boosterMode = null;

    this.installCanvasDragFallback();
    const hud = playerHud(this, () => this.showSettingsOverlay(), () => !this.locked && !this.pendingClear && !this.activePiece, "home");
    this.coinText = hud.coinText;
    button(this, 38, 111, 52, 36, "‹", () => {
      if (!this.locked && !this.pendingClear) this.scene.start("HomeScene");
    });
    text(this, 144, 111, this.dailyMode ? "DAILY PUZZLE" : `LEVEL ${this.level}`, 17, "#ffffff", "800")
      .setStroke("#07539d", 3);

    this.scoreText = text(this, 308, 111, "SCORE 0", 13, "#ffffff", "800").setStroke("#07539d", 3);
    puzzlePanel(this, 135, 187, 244, 106, 'goals');
    text(this, 135, 157, "GOALS", 20, "#10366a", "800");
    this.createSideObjectiveText();

    puzzlePanel(this, 326, 187, 98, 106, 'moves', 18);
    panel(this, 326, 136, 45, 14, { fill: 0xffd047, stroke: 0xb47c24, radius: 4, shadow: false });
    this.add.circle(326, 128, 6, 0xffd64b).setStrokeStyle(2, 0xb47c24);
    this.add.circle(326, 127, 2, 0x195681);
    text(this, 326, 161, "MOVES", 16, "#123767", "800");
    this.movesText = text(this, 326, 194, this.targetPlacements > 0 ? String(this.targetPlacements) : "∞", 43, "#123767", "800");
    this.movesCaption = text(this, 326, 216, this.targetPlacements > 0 ? "TO PLACE" : "RELAXED", 11, "#537392", "800");

    this.comboText = text(this, W / 2, 432, "", 42, "#fff239", "800")
      .setStroke("#a94708", 8)
      .setShadow(0, 6, "#063167", 0, true, true)
      .setDepth(90)
      .setAlpha(0);

    this.createBoard();
    this.applyStartingCells(
      levelDefinition.startingCells || [],
      "specialCells" in levelDefinition ? levelDefinition.specialCells || [] : [],
      "iceCells" in levelDefinition ? levelDefinition.iceCells || [] : [],
    );
    puzzlePanel(this, W / 2, 665, W - 30, 102, "well", 17);
    [80, 195, 310].forEach((x) =>
      puzzlePanel(this, x, 665, 104, 86, "well", 14)
    );
    const restored = this.restoreSession();
    if (!restored) this.spawnTray();

    if (!restored && !this.dailyMode && this.tutorialStep && save.totalPlacements === 0) {
      this.time.delayedCall(380, () => this.showTutorial());
    }

    if (this.dailyMode) {
      this.createDailyFairPlayPanel();
    } else {
      this.createBoosters();
    }

    this.persistSession();
  }

  private sessionKey() { return this.dailyMode ? this.dailyKey : `level-${this.level}`; }

  private persistSession() {
    if (this.sessionFinished || this.cells.length !== BOARD) return;
    writePuzzleSession(this.dailyMode, {
      version: 1, key: this.sessionKey(), level: this.level, grid: this.grid,
      colors: this.cells.map((row, r) => row.map((cell, c) => this.grid[r][c] ? cell.fillColor : 0x194e83)),
      pieces: this.pieces.map(piece => ({ shape: piece.shape, color: piece.color, slot: Math.round((piece.homeX - 80) / 115) })),
      specialCells: [...this.specialCells], iceCells: [...this.iceCells], linesCleared: this.linesCleared,
      score: this.score, placementsMade: this.placementsMade, combo: this.combo, bestCombo: this.bestCombo,
      specialCleared: this.specialCleared, iceBroken: this.iceBroken, boostersUsed: this.boostersUsedThisLevel,
      randomState: this.random.state, pendingClear: this.pendingClear,
    });
  }

  private restoreSession() {
    const saved = readPuzzleSession(this.dailyMode, this.sessionKey(), this.level);
    if (!saved) return false;
    this.grid = saved.grid;
    this.specialCells = new Set(saved.specialCells); this.iceCells = new Set(saved.iceCells);
    this.linesCleared = saved.linesCleared; this.score = saved.score;
    this.placementsMade = saved.placementsMade; this.combo = saved.combo; this.bestCombo = saved.bestCombo;
    this.specialCleared = saved.specialCleared; this.iceBroken = saved.iceBroken;
    this.boostersUsedThisLevel = saved.boostersUsed; this.random.state = saved.randomState;
    this.cells.forEach((row, r) => row.forEach((cell, c) => cell.setFillStyle(saved.colors[r][c]).setStrokeStyle(1, this.grid[r][c] ? 0xc8faff : 0x2870a6)));
    this.pieces = saved.pieces.map(piece => this.createPiece(piece.shape, 80 + piece.slot * 115, 665, piece.color));
    this.goalText.setText(`${Math.min(this.linesCleared, this.targetLines)}/${this.targetLines}`);
    this.scoreText.setText(`SCORE ${this.score}`); this.updatePlacementGoal(); this.updateSideObjectiveText();
    if (saved.pendingClear) this.clearCompletedLines();
    if (this.objectiveComplete()) this.time.delayedCall(250, () => this.completeLevel());
    else if (!this.pieces.length) this.spawnTray();
    else if (!this.anyPieceFits()) this.time.delayedCall(250, () => this.showNoMoves());
    return true;
  }

  private createBoard() {
    // One bright outer shell joins the board and its three piece wells.
    PuzzleBoardView(this, W / 2, 480, BOARD_PX + 30, 480, 'frame', 23);
    puzzlePanel(this, W / 2, BOARD_Y + BOARD_PX / 2, BOARD_PX + 10, BOARD_PX + 10, 'well', 13);

    for (let r = 0; r < BOARD; r += 1) {
      const row: ToyBlock[] = [];
      for (let c = 0; c < BOARD; c += 1) {
        const x = BOARD_X + c * CELL + CELL / 2;
        const y = BOARD_Y + r * CELL + CELL / 2;
        row.push(
          new ToyBlock(this, x, y, CELL - GAP, 0x194e83)
            .setStrokeStyle(1, 0x0b477b, 0.55),
        );
      }
      this.cells.push(row);
    }
  }

  private spawnTray() {
    this.pieces.forEach((piece) => piece.container.destroy(true));
    this.pieces = [];

    const slots = [80, 195, 310];
    const trayY = 665;

    const shapes = this.generateFairTray();
    for (let i = 0; i < 3; i += 1) {
      const color = PIECE_COLORS[Math.floor(this.nextRandom() * PIECE_COLORS.length)];
      this.pieces.push(this.createPiece(shapes[i], slots[i], trayY, color));
    }

    this.persistSession();
    if (!this.anyPieceFits()) this.showNoMoves();
  }

  private createPiece(shape: Shape, x: number, y: number, color: number): Piece {
    // Fit long pieces inside their slot; drag previews still use board-cell scale.
    const mini = Math.min(33, 90 / shape[0].length, 76 / shape.length);
    const width = shape[0].length * mini;
    const height = shape.length * mini;

    const container = new PuzzlePieceView(this,x,y,shape,mini,color);

    const hitWidth = Math.max(width + 12, 58);
    const hitHeight = Math.max(height + 14, 58);
    const hitArea = this.add
      .rectangle(0, 0, hitWidth, hitHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    container.addAt(hitArea, 0);
    container.setSize(hitWidth, hitHeight);

    const piece: Piece = { container, shape, homeX: x, homeY: y, trayCellSize: mini, color };

    hitArea.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.locked || this.activePiece || this.children.list.some(child => child.name === 'blocking-dialog')) return;
      this.beginDrag(piece, pointer.worldX, pointer.worldY, pointer.id);
    });

    return piece;
  }

  private beginDrag(piece: Piece, worldX: number, worldY: number, pointerId: number | null = null) {
    if (this.locked || this.pendingClear || !piece.container.active) return;

    this.dismissTutorial();
    audio.play(this, "pickup");
    this.activePiece = piece;
    this.activePointerId = pointerId;
    this.dragOffsetX = worldX - piece.container.x;
    this.dragOffsetY = worldY - piece.container.y;

    piece.container.setDepth(80);
    this.tweens.killTweensOf(piece.container);
    this.tweens.add({
      targets: piece.container,
      scaleX: CELL / piece.trayCellSize,
      scaleY: CELL / piece.trayCellSize,
      duration: 90,
      ease: "Quad.Out",
    });
  }

  private canvasPoint(event: PointerEvent) {
    const canvas = this.game.canvas;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H,
    };
  }

  private findPieceAt(x: number, y: number) {
    const candidates = [...this.pieces].reverse();
    for (const piece of candidates) {
      if (!piece.container.active) continue;
      const halfW = Math.max(piece.container.width / 2, 34);
      const halfH = Math.max(piece.container.height / 2, 34);
      if (
        x >= piece.container.x - halfW &&
        x <= piece.container.x + halfW &&
        y >= piece.container.y - halfH &&
        y <= piece.container.y + halfH
      ) {
        return piece;
      }
    }
    return null;
  }

  private installCanvasDragFallback() {
    const canvas = this.game.canvas;
    canvas.style.touchAction = "none";

    this.domDownHandler = (event: PointerEvent) => {
      if (this.locked || this.activePiece || this.children.list.some(child => child.name === 'blocking-dialog')) return;
      const point = this.canvasPoint(event);

      if (this.boosterMode === "hammer") {
        event.preventDefault();
        const boardCell = this.boardCellAt(point.x, point.y);
        if (boardCell) this.useHammerOnCell(boardCell.row, boardCell.col);
        return;
      }

      const piece = this.findPieceAt(point.x, point.y);
      if (!piece) return;

      event.preventDefault();
      this.domPointerId = event.pointerId;
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch {
        // Pointer capture is optional in embedded previews.
      }
      this.beginDrag(piece, point.x, point.y);
    };

    this.domMoveHandler = (event: PointerEvent) => {
      if (!this.activePiece || event.pointerId !== this.domPointerId) return;
      event.preventDefault();

      const point = this.canvasPoint(event);
      this.activePiece.container.x = point.x - this.dragOffsetX;
      this.activePiece.container.y = point.y - this.dragOffsetY - 30;
      this.updateGhost(this.activePiece);
    };

    this.domUpHandler = (event: PointerEvent) => {
      if (!this.activePiece || event.pointerId !== this.domPointerId) return;
      event.preventDefault();

      const piece = this.activePiece;
      this.clearGhost();
      this.activePiece = null;
      this.activePointerId = null;
      this.domPointerId = null;

      try {
        canvas.releasePointerCapture(event.pointerId);
      } catch {
        // Ignore release errors.
      }

      if (this.locked || !this.tryPlace(piece)) {
        this.returnPiece(piece);
      }
    };

    canvas.addEventListener("pointerdown", this.domDownHandler, { passive: false });
    canvas.addEventListener("pointermove", this.domMoveHandler, { passive: false });
    canvas.addEventListener("pointerup", this.domUpHandler, { passive: false });
    canvas.addEventListener("pointercancel", this.domUpHandler, { passive: false });

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      if (this.domDownHandler) canvas.removeEventListener("pointerdown", this.domDownHandler);
      if (this.domMoveHandler) canvas.removeEventListener("pointermove", this.domMoveHandler);
      if (this.domUpHandler) {
        canvas.removeEventListener("pointerup", this.domUpHandler);
        canvas.removeEventListener("pointercancel", this.domUpHandler);
      }
    });
  }

  private returnPiece(piece: Piece) {
    if (!piece.container.active) return;
    audio.play(this, "invalid");
    this.clearGhost();
    if (this.activePiece === piece) {
      this.activePiece = null;
      this.activePointerId = null;
    }
    this.tweens.add({
      targets: piece.container,
      x: piece.homeX,
      y: piece.homeY,
      scaleX: 1,
      scaleY: 1,
      duration: 210,
      ease: "Back.Out",
      onComplete: () => piece.container.setDepth(20),
    });
  }

  private tryPlace(piece: Piece) {
    const shapeW = piece.shape[0].length;
    const shapeH = piece.shape.length;
    const targetX = piece.container.x - (shapeW * CELL) / 2;
    const targetY = piece.container.y - (shapeH * CELL) / 2;
    const col = Math.round((targetX - BOARD_X) / CELL);
    const row = Math.round((targetY - BOARD_Y) / CELL);

    if (!this.canPlace(piece.shape, row, col)) return false;

    this.clearGhost();

    piece.shape.forEach((line, r) => {
      line.forEach((value, c) => {
        if (!value) return;
        this.grid[row + r][col + c] = true;
        const cell = this.cells[row + r][col + c];
        cell.setFillStyle(piece.color, 1);
        cell.setStrokeStyle(2, 0xffffff, 0.65);
        cell.setScale(0.55);
        this.tweens.add({
          targets: cell,
          scaleX: 1,
          scaleY: 1,
          duration: 180,
          delay: (r + c) * 20,
          ease: "Back.Out",
        });
      });
    });

    this.placementsMade += 1;
    this.addScore(this.blockCount(piece.shape) * 8);
    this.updatePlacementGoal();
    updateSave((save) => ({
      ...save,
      dailyPlacements: save.dailyPlacements + 1,
      totalPlacements: save.totalPlacements + 1,
    }));
    this.placeFeedback(piece, row, col);
    piece.container.destroy(true);
    this.pieces = this.pieces.filter((item) => item !== piece);
    this.pendingClear = true;
    this.persistSession();

    this.time.delayedCall(200, () => {
      this.clearCompletedLines();
      this.pendingClear = false;
      this.persistSession();
      this.updateTensionFeedback();

      if (this.objectiveComplete()) {
        this.time.delayedCall(420, () => this.completeLevel());
      } else if (this.pieces.length === 0) {
        this.time.delayedCall(300, () => this.spawnTray());
      } else if (!this.anyPieceFits()) {
        this.time.delayedCall(320, () => this.showNoMoves());
      }
    });

    return true;
  }

  private createBoosters() {
    const configs = [
      {
        x: 195,
        key: "refresh",
        name: "Shuffle",
        unlock: REFRESH_BOOSTER_UNLOCK_LEVEL,
        cost: REFRESH_BOOSTER_COST,
        onUse: () => this.useRefreshBooster(),
      },
      {
        x: 70,
        key: "hammer",
        name: "Hammer",
        unlock: HAMMER_BOOSTER_UNLOCK_LEVEL,
        cost: HAMMER_BOOSTER_COST,
        onUse: () => this.toggleHammer(),
      },
      {
        x: 320,
        key: "row",
        name: "Clear Line",
        unlock: BULLDOZER_BOOSTER_UNLOCK_LEVEL,
        cost: BULLDOZER_BOOSTER_COST,
        onUse: () => this.useBulldozer(),
      },
    ];

    configs.forEach((config) => {
      const unlocked = this.level >= config.unlock;
      BoosterButton(this,config.x,758,{
        ...config,unlocked,affordable:loadSave().coins>=config.cost,
      });

    });

    this.updateBoosterDock();
  }

  private createDailyFairPlayPanel() {
    panel(this, W / 2, 776, W - 34, 86, { fill: 0xfff7dc, stroke: 0xe8be5d, radius: 17 });
    gameIcon(this, 55, 776, "lock", 42);
    text(this, 234, 761, "DAILY FAIR PLAY", 15, "#956113");
    text(this, 234, 790, "Same rules. No Power Tools.", 12, "#577d98");
  }

  private updateBoosterDock() {
    const coins = loadSave().coins;
    [['refresh', REFRESH_BOOSTER_COST], ['hammer', HAMMER_BOOSTER_COST], ['row', BULLDOZER_BOOSTER_COST]].forEach(([key, cost]) => {
      const tool = this.children.getByName(key + '-tool') as Phaser.GameObjects.Container | null;
      const count = tool?.getByName(key + '-count') as Phaser.GameObjects.Text | null;
      if (count && tool?.input?.enabled) count.setText(String(cost)).setColor(coins >= Number(cost) ? '#143e71' : '#697e91');
      if (key === 'hammer' && tool) {
        const selection = tool.getByName('selection') as Phaser.GameObjects.Arc;
        selection.setStrokeStyle(this.boosterMode === 'hammer' ? 5 : 2, this.boosterMode === 'hammer' ? 0xffe236 : 0x88efff);
      }
    });
  }

  private showSettingsOverlay() {
    if (this.settingsOverlay || this.locked || this.pendingClear) return;
    this.locked = true;

    const save = loadSave();
    const group = this.add.container(0, 0).setDepth(220);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.66).setInteractive();
    const card = panel(this, W / 2, 420, W - 58, 300, { fill: 0xf8fdff, stroke: 0x78cceb, radius: 24, shadowAlpha: 0.35 });

    const titleLabel = text(this, W / 2, 315, "GAME MENU", 18, "#123767", "800");
    const subtitle = text(
      this,
      W / 2,
      343,
      this.dailyMode ? "Daily Challenge • Fair Play" : `Level ${this.level} • Normal Mode`,
      9,
      "#66839c",
      "700",
    );

    const sound = button(
      this,
      W / 2,
      390,
      W - 110,
      42,
      save.soundEnabled ? "SOUND  •  ON" : "SOUND  •  OFF",
      () => {
        updateSave((current) => ({ ...current, soundEnabled: !current.soundEnabled }));
        group.destroy(true);
        this.settingsOverlay = undefined;
        this.locked = false;
        this.showSettingsOverlay();
      },
      save.soundEnabled ? COLORS.success : 0x8aa7b8,
      save.soundEnabled ? "success" : "muted",
    );

    const haptics = button(
      this,
      W / 2,
      442,
      W - 110,
      42,
      save.hapticsEnabled ? "HAPTICS  •  ON" : "HAPTICS  •  OFF",
      () => {
        updateSave((current) => ({ ...current, hapticsEnabled: !current.hapticsEnabled }));
        group.destroy(true);
        this.settingsOverlay = undefined;
        this.locked = false;
        this.showSettingsOverlay();
      },
      save.hapticsEnabled ? COLORS.success : 0x8aa7b8,
      save.hapticsEnabled ? "success" : "muted",
    );

    const resume = button(this, W / 2, 502, W - 110, 44, "RESUME", () => {
      group.destroy(true);
      this.settingsOverlay = undefined;
      this.locked = false;
    });

    const exit = button(this, W / 2, 557, W - 110, 40, "EXIT TO HOME", () => {
      this.scene.start("HomeScene");
    }, 0x8aa7b8, "muted");

    group.add([dim, card, titleLabel, subtitle, sound, haptics, resume, exit]);
    this.settingsOverlay = group;
  }

  private useRefreshBooster() {
    if (this.dailyMode || this.level < REFRESH_BOOSTER_UNLOCK_LEVEL || this.locked || this.pendingClear || this.activePiece) return;
    if (!this.grid.some(row => row.some(cell => !cell))) return;

    const save = loadSave();
    if (save.coins < REFRESH_BOOSTER_COST) {
      this.showToast("Not enough coins for Shuffle", "#ffe09b", "#493a1b");
      return;
    }

    this.boosterMode = null;
    this.updateBoosterDock();
    this.boostersUsedThisLevel += 1;
    const next = updateSave((current) => ({
      ...current,
      coins: current.coins - REFRESH_BOOSTER_COST,
      refreshUses: current.refreshUses + 1,
    }));

    this.coinText.setText(next.coins.toLocaleString("en"));
    this.updateBoosterDock();
    this.pulseHaptic(14);
    audio.play(this, "refresh");

    this.spawnTray();
    this.pieces.forEach(piece => {
      piece.container.setAlpha(0).setScale(0.8);
      this.tweens.add({ targets: piece.container, alpha: 1, scale: 1, duration: 150 });
    });
    this.showToast("Fresh blocks ready!", "#b9f8df", "#123a31");
  }

  private toggleHammer() {
    if (this.dailyMode || this.level < HAMMER_BOOSTER_UNLOCK_LEVEL || this.locked || this.pendingClear || this.activePiece) return;

    const save = loadSave();
    if (save.coins < HAMMER_BOOSTER_COST) {
      this.showToast("Not enough coins for Hammer", "#ffe09b", "#493a1b");
      return;
    }

    this.boosterMode = this.boosterMode === "hammer" ? null : "hammer";
    this.updateBoosterDock();
    this.showToast(
      this.boosterMode === "hammer" ? "Hammer: tap one occupied cell" : "Hammer cancelled",
      "#d8f8ed",
      "#173b36",
    );
  }

  private boardCellAt(x: number, y: number) {
    const col = Math.floor((x - BOARD_X) / CELL);
    const row = Math.floor((y - BOARD_Y) / CELL);
    if (row < 0 || row >= BOARD || col < 0 || col >= BOARD) return null;
    return { row, col };
  }

  private useHammerOnCell(row: number, col: number) {
    if (this.dailyMode || this.level < HAMMER_BOOSTER_UNLOCK_LEVEL || this.locked || this.pendingClear || this.activePiece || this.boosterMode !== "hammer") return;

    if (!this.grid[row][col]) {
      this.showToast("Choose an occupied cell", "#ffd9a1", "#493a1b");
      return;
    }

    const save = loadSave();
    if (save.coins < HAMMER_BOOSTER_COST) {
      this.boosterMode = null;
      this.showToast("Not enough coins for Hammer", "#ffe09b", "#493a1b");
      return;
    }

    this.boostersUsedThisLevel += 1;
    const next = updateSave((current) => ({
      ...current,
      coins: current.coins - HAMMER_BOOSTER_COST,
      hammerUses: current.hammerUses + 1,
    }));

    this.coinText.setText(next.coins.toLocaleString("en"));
    this.updateBoosterDock();
    this.boosterMode = null;
    this.updateBoosterDock();
    const hammeredKey = `${row}:${col}`;

    if (this.iceCells.has(hammeredKey)) {
      this.iceCells.delete(hammeredKey);
      this.iceBroken += 1;
    }

    if (this.specialCells.has(hammeredKey)) {
      this.specialCells.delete(hammeredKey);
      this.specialCleared += 1;
    }
    this.updateSideObjectiveText();

    this.grid[row][col] = false;

    const cell = this.cells[row][col];
    emitVoxelBurst(this, cell.x, cell.y, materialFromColor(cell.fillColor), { count: 9, distance: 48 });
    this.pulseHaptic([18, 22, 18]);
    audio.play(this, "hammer");
    this.cameras.main.shake(120, 0.003);

    this.tweens.add({
      targets: cell,
      scaleX: 1.35,
      scaleY: 1.35,
      alpha: 0,
      angle: 8,
      duration: 180,
      onComplete: () => {
        cell.setFillStyle(0x194e83, 1);
        cell.setStrokeStyle(1, 0x2870a6, 0.95);
        cell.setScale(1);
        cell.setAlpha(1);
        cell.setAngle(0);
      },
    });

    this.revalidateAfterTool();
    this.showToast("Block smashed!", "#d8f8ed", "#173b36");
    if (this.objectiveComplete()) {
      this.time.delayedCall(260, () => this.completeLevel());
    }
  }

  private useBulldozer(rescueRow?: number) {
    if (this.dailyMode || this.level < BULLDOZER_BOOSTER_UNLOCK_LEVEL || this.locked || this.pendingClear || this.activePiece) return;

    const save = loadSave();
    if (save.coins < BULLDOZER_BOOSTER_COST) {
      this.showToast("Not enough coins for Clear Line", "#ffe09b", "#493a1b");
      return;
    }

    let bestRow = -1;
    let bestCount = 0;
    for (let r = 0; r < BOARD; r += 1) {
      const count = this.grid[r].filter(Boolean).length;
      if (count > bestCount) {
        bestCount = count;
        bestRow = r;
      }
    }

    if (rescueRow !== undefined) { bestRow = rescueRow; bestCount = this.grid[bestRow].filter(Boolean).length; }

    if (bestRow < 0 || bestCount === 0) {
      this.showToast("Board is already clear", "#c5e4ec", "#17313a");
      return;
    }

    this.boostersUsedThisLevel += 1;
    const next = updateSave((current) => ({
      ...current,
      coins: current.coins - BULLDOZER_BOOSTER_COST,
      bulldozerUses: current.bulldozerUses + 1,
    }));
    this.coinText.setText(next.coins.toLocaleString("en"));
    this.updateBoosterDock();

    lineClearEffect(this, W / 2, BOARD_Y + bestRow * CELL + CELL / 2, BOARD_PX);
    const rocket = boosterIcon(this, BOARD_X - 12, BOARD_Y + bestRow * CELL + CELL / 2, 'row', 49).setAngle(32).setDepth(90);
    this.tweens.add({targets:rocket,x:BOARD_X+BOARD_PX+20,duration:330,ease:'Cubic.In',onComplete:()=>rocket.destroy()});
    for (let c = 0; c < BOARD; c += 1) {
      if (!this.grid[bestRow][c]) continue;
      const bulldozedKey = `${bestRow}:${c}`;
      if (this.iceCells.has(bulldozedKey)) {
        this.iceCells.delete(bulldozedKey);
        this.iceBroken += 1;
      }
      if (this.specialCells.has(bulldozedKey)) {
        this.specialCells.delete(bulldozedKey);
        this.specialCleared += 1;
      }
      this.grid[bestRow][c] = false;
      const cell = this.cells[bestRow][c];
      emitVoxelBurst(this, cell.x, cell.y, materialFromColor(cell.fillColor), {count:4,distance:32});
      this.tweens.add({
        targets: cell,
        x: cell.x + 18,
        alpha: 0,
        duration: 150,
        delay: c * 20,
        onComplete: () => {
          cell.x -= 18;
          cell.setFillStyle(0x194e83, 1);
          cell.setStrokeStyle(1, 0x2870a6, 0.95);
          cell.setAlpha(1);
        },
      });
    }

    this.updateSideObjectiveText();
    this.pulseHaptic([22, 20, 30]);
    audio.play(this, "bulldozer");
    this.revalidateAfterTool();
    this.showToast("Busiest row cleared!", "#d8f8ed", "#173b36");
    if (this.objectiveComplete()) {
      this.time.delayedCall(260, () => this.completeLevel());
    }
  }

  private showToast(message: string, color: string, background: string) {
    const toast = text(this, W / 2, 575, message, 10, color, "800").setDepth(130);
    toast.setBackgroundColor(background).setPadding(10, 6, 10, 6);
    this.tweens.add({
      targets: toast,
      y: 562,
      alpha: 0,
      duration: 650,
      delay: 700,
      onComplete: () => toast.destroy(),
    });
  }

  private nextRandom() {
    return this.dailyMode ? this.random.next() : Math.random();
  }

  private generateFairTray() {
    const difficultyLevel = this.dailyMode ? 15 : this.level;
    const unlockedShapeCount =
      difficultyLevel < 4 ? 7 :
      difficultyLevel < 9 ? 11 :
      SHAPES.length;
    const pool = SHAPES.slice(0, unlockedShapeCount);
    const fitting = pool.filter((shape) => this.shapeFitsAnywhere(shape));
    const occupancy = this.boardOccupancy();
    const result: Shape[] = [];

    if (!fitting.length) {
      return [
        [[1]],
        [[1, 1]],
        [[1], [1]],
      ];
    }

    const scored = fitting
      .map((shape) => ({
        shape,
        options: this.countPlacements(shape),
        blocks: this.blockCount(shape),
      }))
      .sort((a, b) => b.options - a.options);

    const mercyMode = occupancy >= 0.64;
    const challengeBias = Math.min(0.72, 0.18 + difficultyLevel * 0.018);

    if (mercyMode) {
      result.push(scored[0].shape);
      result.push(scored[Math.min(1, scored.length - 1)].shape);
    } else {
      const safeIndex = Math.floor(this.nextRandom() * Math.min(3, scored.length));
      result.push(scored[safeIndex].shape);
    }

    while (result.length < 3) {
      const source =
        this.nextRandom() < challengeBias
          ? scored.slice(Math.floor(scored.length / 2))
          : scored.slice(0, Math.max(1, Math.ceil(scored.length * 0.7)));
      const choices = source.length ? source : scored;
      const pick = choices[Math.floor(this.nextRandom() * choices.length)];
      result.push(pick.shape);
    }

    if (occupancy > 0.76 && !result.some((shape) => this.blockCount(shape) <= 2)) {
      const tiny = scored.find((entry) => entry.blocks <= 2);
      if (tiny) result[0] = tiny.shape;
    }

    return result;
  }

  private blockCount(shape: Shape) {
    return shape.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0), 0);
  }

  private boardOccupancy() {
    const occupied = this.grid.reduce(
      (sum, row) => sum + row.reduce((rowSum, filled) => rowSum + (filled ? 1 : 0), 0),
      0,
    );
    return occupied / (BOARD * BOARD);
  }

  private countPlacements(shape: Shape) {
    let options = 0;
    for (let r = 0; r < BOARD; r += 1) {
      for (let c = 0; c < BOARD; c += 1) {
        if (this.canPlace(shape, r, c)) options += 1;
      }
    }
    return options;
  }

  private totalCurrentMoves() {
    return this.pieces.reduce((sum, piece) => sum + this.countPlacements(piece.shape), 0);
  }

  private addScore(points: number) {
    this.score = Math.max(0, this.score + Math.round(points));
    this.scoreText?.setText(`SCORE ${this.score}`);
  }

  private remainingObjectiveCount() {
    let remaining = Math.max(0, this.targetLines - this.linesCleared);
    if (this.targetPlacements) remaining += Math.max(0, this.targetPlacements - this.placementsMade);
    if (this.targetCombo) remaining += Math.max(0, this.targetCombo - this.bestCombo);
    if (this.targetSpecials) remaining += Math.max(0, this.targetSpecials - this.specialCleared);
    if (this.targetIce) remaining += Math.max(0, this.targetIce - this.iceBroken);
    return remaining;
  }

  private updateTensionFeedback() {
    if (!this.nearWinShown && !this.objectiveComplete() && this.remainingObjectiveCount() <= 2) {
      this.nearWinShown = true;
      this.showToast("SO CLOSE • one final push!", "#d8f8ed", "#173b36");
      audio.play(this, "combo");
    }

    const moves = this.totalCurrentMoves();
    const occupancy = this.boardOccupancy();
    if (!this.dangerShown && moves > 0 && moves <= 3 && occupancy > 0.62) {
      this.dangerShown = true;
      this.showToast("TIGHT BOARD • plan the next move", "#ffe09b", "#493a1b");
      this.cameras.main.shake(100, 0.0018);
    } else if (moves > 8 || occupancy < 0.5) {
      this.dangerShown = false;
    }
  }

  private shapeFitsAnywhere(shape: Shape) {
    for (let r = 0; r < BOARD; r += 1) {
      for (let c = 0; c < BOARD; c += 1) {
        if (this.canPlace(shape, r, c)) return true;
      }
    }
    return false;
  }

  private updateGhost(piece: Piece) {
    const shapeW = piece.shape[0].length;
    const shapeH = piece.shape.length;
    const targetX = piece.container.x - (shapeW * CELL) / 2;
    const targetY = piece.container.y - (shapeH * CELL) / 2;
    const col = Math.round((targetX - BOARD_X) / CELL);
    const row = Math.round((targetY - BOARD_Y) / CELL);
    const valid = this.canPlace(piece.shape, row, col);

    if (
      this.ghostPlacement &&
      this.ghostPlacement.row === row &&
      this.ghostPlacement.col === col &&
      this.ghostPlacement.valid === valid
    ) {
      return;
    }

    this.clearGhost();
    this.ghostPlacement = { row, col, valid };

    piece.shape.forEach((line, r) => {
      line.forEach((value, c) => {
        if (!value) return;
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= BOARD || cc < 0 || cc >= BOARD) return;

        const cell = this.cells[rr][cc];
        const ghost = new ToyBlock(this, cell.x, cell.y, CELL - GAP, valid ? piece.color : 0xff414b)
          .setAlpha(valid ? .65 : .4).setDepth(70);
        ghost.setStrokeStyle(2, valid ? 0xffffff : 0xffb0b4);
        this.ghostCells.push(ghost);
      });
    });
  }

  private clearGhost() {
    this.ghostCells.forEach((cell) => cell.destroy());
    this.ghostCells = [];
    this.ghostPlacement = null;
  }

  private placeFeedback(piece: Piece, row: number, col: number) {
    this.pulseHaptic(12);
    audio.play(this, "place");

    const points: Array<{ x: number; y: number }> = [];
    piece.shape.forEach((line, r) => {
      line.forEach((value, c) => {
        if (!value) return;
        const cell = this.cells[row + r][col + c];
        points.push({ x: cell.x, y: cell.y });
      });
    });

    const material = materialFromColor(piece.color);
    points.slice(0, 6).forEach((point, index) => {
      const impact = this.add
        .rectangle(point.x, point.y, 9, 9, 0xffffff, 0.42)
        .setStrokeStyle(1, piece.color, 0.9)
        .setAngle(45)
        .setDepth(40);
      this.tweens.add({
        targets: impact,
        alpha: 0,
        scale: 1.7,
        duration: 170,
        ease: "Quad.Out",
        onComplete: () => impact.destroy(),
      });
      if (index < 4) {
        emitVoxelBurst(this, point.x, point.y, material, {
          count: 2,
          distance: 16,
          depth: 41,
        });
      }
    });
  }

  private pulseHaptic(pattern: number | number[]) {
    try {
      if (!loadSave().hapticsEnabled) return;
      if ("vibrate" in navigator) navigator.vibrate(pattern);
    } catch {
      // Haptics are optional.
    }
  }

  private showTutorial() {
    if (this.tutorialShown || this.locked || !this.pieces.length || !this.tutorialStep) return;
    this.tutorialShown = true;

    const group = this.add.container(0, 0).setDepth(120);
    const cardY = 577;
    const card = panel(this, W / 2, cardY, W - 66, 44, { fill: 0xfff7df, stroke: 0xe5bc5d, radius: 14, shadowAlpha: 0.18 });
    const hint = text(this, W / 2, cardY, 'Drag a piece onto the board • tap to dismiss', 12, '#426b8c', '500');
    group.add([card, hint]);
    card.setSize(W - 66, 44).setInteractive({ useHandCursor: true }).on('pointerup', () => this.dismissTutorial());
    this.time.delayedCall(4500, () => this.dismissTutorial());
    this.tutorialGroup = group;
  }

  private dismissTutorial() {
    if (!this.tutorialGroup) return;
    const group = this.tutorialGroup;
    this.tutorialGroup = undefined;
    this.tweens.add({
      targets: group,
      alpha: 0,
      duration: 140,
      onComplete: () => group.destroy(true),
    });
  }

  private applyStartingCells(
    startingCells: Array<[number, number]>,
    specialCells: Array<[number, number]>,
    iceCells: Array<[number, number]>,
  ) {
    const specialSet = new Set(specialCells.map(([row, col]) => `${row}:${col}`));
    const iceSet = new Set(iceCells.map(([row, col]) => `${row}:${col}`));

    startingCells.forEach(([row, col]) => {
      if (row < 0 || row >= BOARD || col < 0 || col >= BOARD) return;
      const key = `${row}:${col}`;
      this.grid[row][col] = true;
      const cell = this.cells[row][col];

      if (iceSet.has(key)) {
        this.iceCells.add(key);
        cell.setFillStyle(0x70cfee, 1);
        cell.setStrokeStyle(2, 0xb9f5ff, 0.95);
      } else if (specialSet.has(key)) {
        this.specialCells.add(key);
        cell.setFillStyle(0x9a6b3c, 1);
        cell.setStrokeStyle(2, 0xffd27a, 0.95);
      } else {
        cell.setFillStyle(PIECE_COLORS[(Math.floor(row / 2) + Math.floor(col / 2)) % PIECE_COLORS.length], 1);
        cell.setStrokeStyle(2, 0xc7f1ff, 0.7);
      }
    });
  }

  private createSideObjectiveText() {
    const objectives: Array<{key: string; label: string; target: number; color: number}> = [
      {key:'lines', label:'LINES', target:this.targetLines, color:0x00a7ff},
    ];
    if(this.targetSpecials) objectives.push({key:'wood',label:'WOOD',target:this.targetSpecials,color:0x9a6b3c});
    if(this.targetIce) objectives.push({key:'ice',label:'ICE',target:this.targetIce,color:0x70cfee});
    if(this.targetCombo) objectives.push({key:'combo',label:'COMBO',target:this.targetCombo,color:0xbc35f1});
    const step = Math.min(74, 218 / objectives.length);
    objectives.forEach((goal,i)=>{
      const x = 135 + (i-(objectives.length-1)/2)*step;
      if(goal.key==='lines') {
        const icon=this.add.container(x,183);
        for(let col=0;col<3;col++)icon.add(new ToyBlock(this,(col-1)*13,0,14,goal.color));
      } else if(goal.key==='combo') {
        new ToyBlock(this,x,183,31,goal.color);
        text(this,x,183,'×',23,'#ffffff','800').setStroke('#6e24af',2);
      } else new ToyBlock(this,x,183,32,goal.color);
      const count=text(this,x,204,`0/${goal.target}`,21,'#113a70','800');
      text(this,x,223,goal.label,10,'#426c91','800');
      this.objectiveLabels.set(goal.key,count);
      if(goal.key==='lines') this.goalText=count;
    });
  }

  private updateSideObjectiveText() {
    const values: Record<string, [number, number]> = {
      wood:[this.specialCleared,this.targetSpecials], ice:[this.iceBroken,this.targetIce], combo:[this.bestCombo,this.targetCombo],
    };
    Object.entries(values).forEach(([key,[value,target]])=>this.objectiveLabels.get(key)?.setText(`${Math.min(value,target)}/${target}`));
  }

  private updatePlacementGoal() {
    if (!this.targetPlacements) {
      this.movesText?.setText("∞");
      this.movesCaption?.setText("RELAXED");
      return;
    }
    const remaining = Math.max(0, this.targetPlacements - this.placementsMade);
    this.movesText?.setText(String(remaining));
    this.movesCaption?.setText(remaining === 0 ? "DONE" : "TO PLACE");
  }

  private objectiveComplete() {
    const linesDone = this.linesCleared >= this.targetLines;
    const placementsDone = !this.targetPlacements || this.placementsMade >= this.targetPlacements;
    const comboDone = !this.targetCombo || this.bestCombo >= this.targetCombo;
    const debrisDone = !this.targetSpecials || this.specialCleared >= this.targetSpecials;
    const iceDone = !this.targetIce || this.iceBroken >= this.targetIce;
    return linesDone && placementsDone && comboDone && debrisDone && iceDone;
  }

  private canPlace(shape: Shape, row: number, col: number) {
    for (let r = 0; r < shape.length; r += 1) {
      for (let c = 0; c < shape[r].length; c += 1) {
        if (!shape[r][c]) continue;
        const rr = row + r;
        const cc = col + c;
        if (rr < 0 || rr >= BOARD || cc < 0 || cc >= BOARD) return false;
        if (this.grid[rr][cc]) return false;
      }
    }
    return true;
  }

  private anyPieceFits() {
    for (const piece of this.pieces) {
      for (let r = 0; r < BOARD; r += 1) {
        for (let c = 0; c < BOARD; c += 1) {
          if (this.canPlace(piece.shape, r, c)) return true;
        }
      }
    }
    return false;
  }

  private clearCompletedLines() {
    const rows: number[] = [];
    const cols: number[] = [];

    for (let r = 0; r < BOARD; r += 1) {
      if (this.grid[r].every(Boolean)) rows.push(r);
    }

    for (let c = 0; c < BOARD; c += 1) {
      if (this.grid.every((row) => row[c])) cols.push(c);
    }

    const total = rows.length + cols.length;
    if (!total) {
      this.combo = 0;
      return;
    }

    this.combo += 1;
    this.bestCombo = Math.max(this.bestCombo, this.combo);
    this.linesCleared += total;
    updateSave((save) => ({
      ...save,
      dailyLines: save.dailyLines + total,
      totalLines: save.totalLines + total,
    }));
    this.updateSideObjectiveText();
    this.pulseHaptic(total > 1 ? [18, 35, 26] : 22);
    audio.play(this, total > 1 ? "combo" : "clear");
    this.goalText.setText(`${Math.min(this.linesCleared, this.targetLines)}/${this.targetLines}`);

    const comboLabel = total > 1 ? "BIG CLEAR!" : "NICE!";
    const comboCaption = text(this, W / 2, 470, this.combo > 1 ? `COMBO ×${this.combo}` : `+${total} LINE${total > 1 ? 'S' : ''}`, 26, '#ffffff', '800')
      .setStroke('#0060bd', 5).setShadow(0, 3, '#062c65', 0, true, true).setDepth(91).setAngle(-7);
    this.comboText.setAngle(-7);
    this.tweens.add({targets:comboCaption, y:461, alpha:0, delay:440, duration:280, onComplete:()=>comboCaption.destroy()});
    this.comboText.setText(comboLabel).setAlpha(1).setScale(0.72);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.18,
      scaleY: 1.18,
      alpha: 1,
      duration: 180,
      yoyo: true,
      hold: 180,
      onComplete: () => this.tweens.add({ targets: this.comboText, alpha: 0, duration: 180 }),
    });

    rows.forEach(row => lineClearEffect(this, W / 2, BOARD_Y + row * CELL + CELL / 2, BOARD_PX));
    cols.forEach(col => lineClearEffect(this, BOARD_X + col * CELL + CELL / 2, BOARD_Y + BOARD_PX / 2, BOARD_PX, true));

    const debrisBefore = this.specialCleared;
    const iceBefore = this.iceBroken;
    const touched = new Set<string>();
    rows.forEach((r) => {
      for (let c = 0; c < BOARD; c += 1) touched.add(`${r}:${c}`);
    });
    cols.forEach((c) => {
      for (let r = 0; r < BOARD; r += 1) touched.add(`${r}:${c}`);
    });

    touched.forEach((key) => {
      const [r, c] = key.split(":").map(Number);
      const cell = this.cells[r][c];
      const clearedMaterial = materialFromColor(cell.fillColor);
      emitVoxelBurst(this, cell.x, cell.y, clearedMaterial, {
        count: this.combo > 1 ? 5 : 3,
        distance: this.combo > 1 ? 30 : 22,
        depth: 89,
      });

      if (this.iceCells.has(key)) {
        this.iceCells.delete(key);
        this.iceBroken += 1;
        this.grid[r][c] = true;
        // Commit the exposed stone material before session persistence; animation is cosmetic.
        cell.setFillStyle(0x35616b, 1).setStrokeStyle(2, 0x79b7c3, 0.75);
        this.tweens.add({
          targets: cell,
          scaleX: 1.14,
          scaleY: 1.14,
          duration: 110,
          yoyo: true,
        });
        return;
      }

      if (this.specialCells.has(key)) {
        this.specialCells.delete(key);
        this.specialCleared += 1;
      }

      this.grid[r][c] = false;
      this.tweens.add({
        targets: cell,
        scaleX: 0.1,
        scaleY: 0.1,
        alpha: 0.2,
        duration: 160,
        ease: "Cubic.In",
        onComplete: () => {
          cell.setFillStyle(0x194e83, 1);
          cell.setStrokeStyle(1, 0x2870a6, 0.95);
          cell.setScale(1);
          cell.setAlpha(1);
        },
      });
    });

    this.updateSideObjectiveText();

    const debrisBonus = (this.specialCleared - debrisBefore) * 55;
    const iceBonus = (this.iceBroken - iceBefore) * 65;
    const linePoints = total * 120 + Math.max(0, total - 1) * 90 + this.combo * 35 + debrisBonus + iceBonus;
    this.addScore(linePoints);

    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.14,
      scaleY: 1.14,
      duration: 110,
      yoyo: true,
      ease: "Quad.Out",
    });

    if (total > 1) {
      this.cameras.main.shake(130, 0.0022);
    }

    const flash = this.add.circle(W / 2, BOARD_Y + BOARD_PX / 2, 20, COLORS.mint, 0.08);
    this.tweens.add({
      targets: flash,
      scaleX: 11,
      scaleY: 11,
      alpha: 0,
      duration: 430,
      onComplete: () => flash.destroy(),
    });
  }

  private completeLevel() {
    if (this.locked) return;
    audio.play(this, "reward");
    this.sessionFinished = true;
    clearPuzzleSession(this.dailyMode);
    this.locked = true;

    const today = localDateKey();
    const alreadyCompletedDaily =
      this.dailyMode && loadSave().dailyChallengeCompletedDate === today;
    const definition = getLevelDefinition(this.level);
    const medal = this.dailyMode ? 0 : levelPerformanceMedal(this.level, this.score, this.boostersUsedThisLevel);
    const oldSave = loadSave();
    const chapterBonus =
      !this.dailyMode &&
      definition.milestone &&
      !oldSave.chapterRewards.includes(definition.chapter)
        ? 100 + definition.chapter * 30
        : 0;

    if (this.dailyMode) {
      if (!alreadyCompletedDaily) {
        updateSave((save) => ({
          ...save,
          stars: save.stars + this.rewardStars,
          coins: save.coins + this.rewardCoins,
          dailyChallengeCompletedDate: today,
          chestProgress: Math.min(5, save.chestProgress + 1),
          totalDailyChallenges: save.totalDailyChallenges + 1,
          totalScore: save.totalScore + this.score,
          xp: save.xp + 90,
          eventPoints: Math.min(500, save.eventPoints + 40),
        }));
      }
    } else {
      updateSave((save) => ({
        ...save,
        level: Math.max(save.level, this.level + 1),
        stars: save.stars + this.rewardStars,
        coins: save.coins + this.rewardCoins + chapterBonus,
        totalLevelsCompleted: save.totalLevelsCompleted + 1,
        totalScore: save.totalScore + this.score,
        totalBoostersUsed: save.totalBoostersUsed + this.boostersUsedThisLevel,
        campaignMedals: {
          ...save.campaignMedals,
          [String(this.level)]: Math.max(save.campaignMedals[String(this.level)] || 0, medal),
        },
        chapterRewards:
          chapterBonus > 0
            ? [...save.chapterRewards, definition.chapter]
            : save.chapterRewards,
        xp: save.xp + Math.min(160, 45 + this.level * 5 + medal * 5),
        eventPoints: Math.min(500, save.eventPoints + (definition.milestone ? 40 : 25)),
      }));
    }

    this.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.7).setDepth(150).setInteractive();
    panel(this, W / 2, 420, W - 52, 365, {
      fill: definition.milestone || this.dailyMode ? 0xfffae7 : 0xf8fdff,
      stroke: this.dailyMode ? 0xe4aa31 : definition.milestone ? 0xe8ad31 : 0x72cae9,
      radius: 25,
      shadowAlpha: 0.4,
    }).setDepth(151);

    const star = gameIcon(this, W / 2, 292, this.dailyMode ? "chest" : "trophy", 84).setDepth(152);
    const heroScale = star.scaleX;
    star.setScale(heroScale * 0.2);

    text(
      this,
      W / 2,
      350,
      this.dailyMode
        ? "DAILY COMPLETE"
        : definition.milestone
          ? "CHAPTER COMPLETE"
          : "LEVEL COMPLETE",
      22,
      "#123767",
      "800",
    ).setDepth(152);

    if (!this.dailyMode) {
      const medals = Array.from({ length: 3 }, (_, index) => index < medal ? "★" : "☆").join(" ");
      text(this, W / 2, 382, medals, 24, "#a96912", "800").setDepth(152);
      text(this, W / 2, 405, `Score ${this.score}  •  Target ${this.scoreTarget}`, 12, "#66829b", "700").setDepth(152);
    }

    if (alreadyCompletedDaily) {
      text(this, W / 2, 438, "Challenge already claimed today.", 11, "#6f879b", "700").setDepth(152);
    } else {
      text(
        this,
        W / 2,
        438,
        `+${this.rewardStars} Construction Star${this.rewardStars > 1 ? "s" : ""}   •   +${this.rewardCoins} Coins`,
        11,
        "#178e58",
        "700",
      ).setDepth(152);
    }

    if (chapterBonus > 0) {
      text(this, W / 2, 462, `CHAPTER BONUS  ● ${chapterBonus}`, 10, "#a96912", "800").setDepth(152);
    }

    const profile = profileLevelFromXp(loadSave().xp);
    text(
      this,
      W / 2,
      chapterBonus > 0 ? 490 : 476,
      `BUILDER LV ${profile.level}  •  XP ${profile.currentXp}/${profile.neededXp}`,
      9,
      "#137b50",
      "800",
    ).setDepth(152);

    const destination =
      this.dailyMode
        ? "DailyScene"
        : this.buildBreak
          ? "CityScene"
          : "CampaignScene";
    const actionLabel =
      this.dailyMode
        ? "BACK TO DAILY HUB  →"
        : this.buildBreak
          ? "BUILD THE CITY  →"
          : "CONTINUE JOURNEY  →";

    const go = button(
      this,
      W / 2,
      555,
      W - 100,
      52,
      actionLabel,
      () => {
        if (this.dailyMode) {
          this.scene.start("DailyScene");
          return;
        }
        if (this.buildBreak) {
          // The first three finales reveal their matching buildable district.
          // Later chapters return to the last City view without inventing a new economy.
          const district = definition.chapter <= 3 ? definition.chapter : undefined;
          this.scene.start("CityScene", district ? { district } : undefined);
          return;
        }
        this.scene.start(destination);
      },
      this.dailyMode ? COLORS.gold : COLORS.primary,
      this.dailyMode ? "gold" : "primary",
    );
    go.setDepth(152);

    this.tweens.add({
      targets: star,
      scaleX: heroScale,
      scaleY: heroScale,
      angle: 0,
      duration: 520,
      ease: "Back.Out",
    });

    for (let i = 0; i < (definition.milestone ? 14 : 8); i += 1) {
      const spark = this.add.circle(W / 2, 300, Phaser.Math.Between(2, 4), i % 2 ? COLORS.mint : 0xffd36d, 0.9)
        .setDepth(153);
      const angle = (Math.PI * 2 * i) / (definition.milestone ? 14 : 8);
      this.tweens.add({
        targets: spark,
        x: W / 2 + Math.cos(angle) * Phaser.Math.Between(48, 100),
        y: 300 + Math.sin(angle) * Phaser.Math.Between(40, 88),
        alpha: 0,
        duration: Phaser.Math.Between(460, 780),
        onComplete: () => spark.destroy(),
      });
    }
  }

  private revalidateAfterTool() {
    this.persistSession();
    this.locked = true;
    this.time.delayedCall(320, () => {
      this.locked = false;
      if (this.objectiveComplete()) this.completeLevel();
      else if (!this.anyPieceFits()) this.showNoMoves();
    });
  }

  private showNoMoves() {
    if (this.locked || this.anyPieceFits() || this.noMovesOverlay) return;
    this.dismissTutorial();
    this.locked = true;
    const group = this.add.container(0, 0).setDepth(200);
    this.noMovesOverlay = group;
    const close = () => { group.destroy(true); this.noMovesOverlay = undefined; this.locked = false; };
    const save = loadSave();
    const targets = rescueTargets(this.grid, this.pieces.map(piece => piece.shape));
    const options: Array<{ label: string; run: () => void }> = [];
    if (!this.dailyMode) {
      if (targets.refresh && this.level >= REFRESH_BOOSTER_UNLOCK_LEVEL && save.coins >= REFRESH_BOOSTER_COST)
        options.push({ label: `SHUFFLE  •  ${REFRESH_BOOSTER_COST} coins`, run: () => this.useRefreshBooster() });
      if (targets.hammer && this.level >= HAMMER_BOOSTER_UNLOCK_LEVEL && save.coins >= HAMMER_BOOSTER_COST)
        options.push({ label: `HAMMER  •  ${HAMMER_BOOSTER_COST} coins`, run: () => {
          this.boosterMode = "hammer";
          this.useHammerOnCell(...targets.hammer!);
        } });
      if (targets.row !== undefined && this.level >= BULLDOZER_BOOSTER_UNLOCK_LEVEL && save.coins >= BULLDOZER_BOOSTER_COST)
        options.push({ label: `CLEAR LINE  •  ${BULLDOZER_BOOSTER_COST} coins`, run: () => this.useBulldozer(targets.row) });
    }
    const height = 285 + options.length * 54;
    const top = 420 - height / 2;
    group.add([
      this.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.72).setInteractive(),
      panel(this, W / 2, 420, W - 52, height, { fill: 0xfff5d9, stroke: COLORS.gold, radius: 26 }),
      gameIcon(this, W / 2, top + 46, options.length ? "hammer" : "puzzle", 58),
      text(this, W / 2, top + 96, options.length ? "MAKE SOME ROOM!" : "NO MORE MOVES", 22),
      text(this, W / 2, top + 126, options.length ? "A Power Tool can keep this city growing." : "A fresh board. A new possibility.", 12, '#577891'),
    ]);
    options.forEach((option, index) => group.add(button(this, W / 2, top + 174 + index * 54, 276, 44,
      option.label, () => { close(); option.run(); }, index === 0 ? COLORS.gold : COLORS.primary, index === 0 ? 'gold' : 'primary')));
    group.add(button(this, W / 2, top + 178 + options.length * 54, 276, 44, "TRY AGAIN", () => {
      close(); this.scene.restart({ daily: this.dailyMode, fresh: true });
    }, options.length ? 0x8aa7b8 : COLORS.primary, options.length ? 'muted' : 'primary'));
    const back = text(this, W / 2, top + height - 37, this.dailyMode ? "BACK TO DAILY" : "BACK TO JOURNEY", 12, '#2676ab').setPadding(18, 14).setInteractive({ useHandCursor: true });
    back.on('pointerup', () => this.scene.start(this.dailyMode ? 'DailyScene' : 'CampaignScene'));
    group.add(back);
  }
}
