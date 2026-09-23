import Phaser from "phaser";
import { audio } from "../audio";
import { PuzzleRandom, rescueTargets } from "../puzzleLogic";
import { gameIcon, addGradientBackground, button, COLORS, H, iconBubble, panel, progressBar, sectionLabel, text, W } from "../ui";
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
  color: number;
};

const BOARD = 8;
const CELL = 38;
const GAP = 3;
const BOARD_PX = BOARD * CELL;
const BOARD_X = (W - BOARD_PX) / 2;
const BOARD_Y = 185;

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

const PIECE_COLORS = [
  COLORS.mint,
  COLORS.cyan,
  COLORS.gold,
  COLORS.coral,
  COLORS.violet,
];

export class PuzzleScene extends Phaser.Scene {
  private grid: boolean[][] = [];
  private cells: Phaser.GameObjects.Rectangle[][] = [];
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
  private boosterCardBgs = new Map<string, Phaser.GameObjects.Rectangle>();
  private settingsOverlay?: Phaser.GameObjects.Container;
  private level = 1;
  private goalText!: Phaser.GameObjects.Text;
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
  private ghostCells: Phaser.GameObjects.Rectangle[] = [];
  private ghostPlacement: { row: number; col: number; valid: boolean } | null = null;
  private tutorialGroup?: Phaser.GameObjects.Container;
  private tutorialShown = false;
  private boosterMode: "hammer" | null = null;
  private dailyMode = false;
  private dailyKey = "";
  private random = new PuzzleRandom("");
  private noMovesOverlay?: Phaser.GameObjects.Container;

  constructor() {
    super("PuzzleScene");
  }

  init(data?: { daily?: boolean }) {
    this.dailyMode = Boolean(data?.daily);
    this.dailyKey = this.dailyMode ? localDateKey() : "";
    this.random = new PuzzleRandom(this.dailyKey);
  }

  create() {
    addGradientBackground(this, 0x30b6f0, 0xe6faff);

    const save = loadSave();
    this.level = save.level;

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
    this.boosterCardBgs.clear();
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
    this.createTopControls();

    const chapter = getChapterForLevel(this.level);
    this.add.text(24, 32, this.dailyMode ? "DAILY CHALLENGE" : `LEVEL ${this.level}  •  ${chapter.name.toUpperCase()}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#1768a8",
      letterSpacing: 1,
    });

    this.add.text(24, 52, `Clear ${this.targetLines} lines`, {
      fontFamily: "Inter, system-ui",
      fontSize: "22px",
      fontStyle: "bold",
      color: "#123767",
    });

    this.add.text(24, 78, levelDefinition.difficulty + " puzzle", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: levelDefinition.difficulty === "Hard" ? "#dc4c4d" : levelDefinition.difficulty === "Medium" ? "#b96e10" : "#168b53",
      letterSpacing: 1,
    });

    if (this.targetPlacements > 0) {
      this.add.text(W - 24, 78, `PLACE 0/${this.targetPlacements}`, {
        fontFamily: "Inter, system-ui",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#3477a5",
        letterSpacing: 0.5,
      }).setName("placement-goal").setOrigin(1, 0);
    }

    this.goalText = this.add.text(W - 24, 43, `0 / ${this.targetLines}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "17px",
      fontStyle: "bold",
      color: "#128b55",
    }).setOrigin(1, 0.5);

    panel(this, W / 2, 112, W - 34, 56, { fill: 0xffffff, alpha: 0.96, stroke: 0x8bd4ee, radius: 15 });

    this.add.text(40, 98, "WIN & BUILD", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#5b7f9d",
    });
    this.add.text(40, 113, `★ ${this.rewardStars}   •   +${this.rewardCoins} coins`, {
      fontFamily: "Inter, system-ui",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#aa6710",
    });

    this.scoreText = this.add.text(W - 38, 99, "SCORE 0", {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#5d7e99",
    }).setOrigin(1, 0.5);

    this.coinText = this.add.text(W - 38, 116, `● ${save.coins}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#b26c0e",
    }).setOrigin(1, 0.5);

    this.createSideObjectiveText();
    this.comboText = text(this, W / 2, 166, "", 13, "#ffdd32", "800").setStroke("#075499", 3).setDepth(90).setAlpha(0);

    this.createBoard();
    this.applyStartingCells(
      levelDefinition.startingCells || [],
      "specialCells" in levelDefinition ? levelDefinition.specialCells || [] : [],
      "iceCells" in levelDefinition ? levelDefinition.iceCells || [] : [],
    );
    panel(this, W / 2, 687, W - 26, 94, { fill: 0x36b4dd, alpha: 0.98, stroke: 0x7ecded, radius: 18 });
    [80, 195, 310].forEach((x) => panel(this, x, 687, 100, 72, { fill: 0xc2f0f8, stroke: 0xeaffff, radius: 16, shadow: true }));
    this.spawnTray();

    if (!this.dailyMode && this.tutorialStep) {
      this.time.delayedCall(380, () => this.showTutorial());
    }

    if (this.dailyMode) {
      this.createDailyFairPlayPanel();
    } else {
      this.createBoosters();
    }

    this.add.text(W / 2, 521, "Drag a piece. Fill a row or column.", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#467596",
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.add.text(W / 2, 777, "Take your time. Build something brilliant.", {
      fontFamily: "Inter, system-ui",
      fontSize: "12px",
      color: "#517894",
    }).setOrigin(0.5);

    this.add.text(W - 22, 808, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#59809b",
    }).setOrigin(1, 0.5);

    this.add.text(W / 2, 808, "BLOCK CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#4e7ca0",
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private createBoard() {
    panel(this, W / 2, BOARD_Y + BOARD_PX / 2, BOARD_PX + 22, BOARD_PX + 22, { fill: 0x2197ca, stroke: 0xc8f8ff, radius: 19, shadowAlpha: 0.35 });

    for (let r = 0; r < BOARD; r += 1) {
      const row: Phaser.GameObjects.Rectangle[] = [];
      for (let c = 0; c < BOARD; c += 1) {
        const x = BOARD_X + c * CELL + CELL / 2;
        const y = BOARD_Y + r * CELL + CELL / 2;
        row.push(
          this.add.rectangle(x, y, CELL - GAP, CELL - GAP, 0x63b9d9, 1)
            .setStrokeStyle(1, 0xa4e2ef, 0.95),
        );
      }
      this.cells.push(row);
    }
    // One static bevel layer keeps toy depth inexpensive across all 64 cells.
    const bevel = this.add.graphics();
    for (let r = 0; r < BOARD; r++) for (let c = 0; c < BOARD; c++) {
      const x = BOARD_X + c * CELL + 3;
      const y = BOARD_Y + r * CELL + 3;
      bevel.lineStyle(2, 0xffffff, 0.24).lineBetween(x, y, x + CELL - 8, y);
      bevel.lineStyle(3, 0x087baf, 0.32).lineBetween(x, y + CELL - 7, x + CELL - 8, y + CELL - 7);
    }

  }

  private spawnTray() {
    this.pieces.forEach((piece) => piece.container.destroy(true));
    this.pieces = [];

    const slots = [80, 195, 310];
    const trayY = 681;

    const shapes = this.generateFairTray();
    for (let i = 0; i < 3; i += 1) {
      const color = PIECE_COLORS[Math.floor(this.nextRandom() * PIECE_COLORS.length)];
      this.pieces.push(this.createPiece(shapes[i], slots[i], trayY, color));
    }

    if (!this.anyPieceFits()) this.showNoMoves();
  }

  private createPiece(shape: Shape, x: number, y: number, color: number): Piece {
    const container = this.add.container(x, y).setDepth(20);
    const mini = 25;
    const width = shape[0].length * mini;
    const height = shape.length * mini;

    shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (!value) return;
        const rx = c * mini - width / 2 + mini / 2;
        const ry = r * mini - height / 2 + mini / 2;
        const shadow = this.add.graphics();
        shadow.fillStyle(0x07396f, 0.28);
        shadow.fillRoundedRect(rx - (mini - 4) / 2, ry - (mini - 4) / 2 + 3, mini - 4, mini - 4, 5);
        const block = this.add.graphics();
        block.fillStyle(color, 1);
        block.fillRoundedRect(rx - (mini - 4) / 2, ry - (mini - 4) / 2, mini - 4, mini - 4, 5);
        block.lineStyle(1.5, 0xffffff, 0.72);
        block.strokeRoundedRect(rx - (mini - 4) / 2 + 1, ry - (mini - 4) / 2 + 1, mini - 6, mini - 6, 4);
        block.fillStyle(0xffffff, 0.28);
        block.fillRoundedRect(rx - 6, ry - 7, 11, 3, 1.5);
        container.add([shadow, block]);
      });
    });

    const hitWidth = Math.max(width + 28, 58);
    const hitHeight = Math.max(height + 28, 58);
    const hitArea = this.add
      .rectangle(0, 0, hitWidth, hitHeight, 0xffffff, 0.001)
      .setInteractive({ useHandCursor: true });
    container.addAt(hitArea, 0);
    container.setSize(hitWidth, hitHeight);

    const piece: Piece = { container, shape, homeX: x, homeY: y, color };

    hitArea.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
      if (this.locked || this.activePiece) return;
      this.beginDrag(piece, pointer.worldX, pointer.worldY, pointer.id);
    });

    return piece;
  }

  private beginDrag(piece: Piece, worldX: number, worldY: number, pointerId: number | null = null) {
    if (this.locked || !piece.container.active) return;

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
      scaleX: 1.16,
      scaleY: 1.16,
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
      if (this.locked || this.activePiece) return;
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

    this.time.delayedCall(200, () => {
      this.clearCompletedLines();
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
    this.add.text(24, 550, "POWER TOOLS", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#176da9",
      letterSpacing: 1,
    });

    this.add.text(W - 24, 550, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#27845d",
      letterSpacing: 0.5,
    }).setOrigin(1, 0);

    const configs = [
      {
        x: 70,
        key: "refresh",
        label: "↻",
        name: "Refresh",
        subtitle: "New blocks",
        unlock: REFRESH_BOOSTER_UNLOCK_LEVEL,
        cost: REFRESH_BOOSTER_COST,
        onUse: () => this.useRefreshBooster(),
      },
      {
        x: 195,
        key: "hammer",
        label: "🔨",
        name: "Hammer",
        subtitle: "Remove 1",
        unlock: HAMMER_BOOSTER_UNLOCK_LEVEL,
        cost: HAMMER_BOOSTER_COST,
        onUse: () => this.toggleHammer(),
      },
      {
        x: 320,
        key: "row",
        label: "▰",
        name: "Row Clear",
        subtitle: "Best row",
        unlock: BULLDOZER_BOOSTER_UNLOCK_LEVEL,
        cost: BULLDOZER_BOOSTER_COST,
        onUse: () => this.useBulldozer(),
      },
    ];

    configs.forEach((config) => {
      const unlocked = this.level >= config.unlock;
      const container = this.add.container(config.x, 600).setDepth(25);
      const bg = this.add.rectangle(
        0,
        0,
        108,
        64,
        unlocked ? 0xe9f8ff : 0xc7d6df,
        unlocked ? 0.98 : 0.72,
      ).setStrokeStyle(unlocked ? 2 : 1, unlocked ? 0x50b8e8 : 0x91aab8, 0.95);

      this.boosterCardBgs.set(config.key, bg);

      const shell = panel(this, 0, 0, 108, 68, { fill: unlocked ? 0x148ee0 : 0x92b5c9, stroke: unlocked ? 0xc5f5ff : 0xd7e5ed, radius: 16 });
      bg.setVisible(false);
      const top = gameIcon(this, -34, -4, unlocked ? config.label : "lock", 43);
      const name = text(this, 17, -18, config.name, 12, '#ffffff').setOrigin(0.5);
      const subtitle = text(this, 18, 0, unlocked ? config.subtitle : `Level ${config.unlock}`, 10, '#e4faff');
      const cost = text(this, 0, 23, unlocked ? `● ${config.cost}` : "LOCKED", 12, unlocked ? '#fff3ac' : '#e5eef4');
      shell.setName(config.key + '-shell');
      container.add([bg, shell, top, name, subtitle, cost]);
      container.setSize(108, 64);

      if (unlocked) {
        container.setInteractive({ useHandCursor: true });
        container.on("pointerup", config.onUse);
      }
    });

    this.updateBoosterDock();
  }

  private createDailyFairPlayPanel() {
    panel(this, W / 2, 597, W - 34, 74, { fill: 0xfff7dc, stroke: 0xe8be5d, radius: 17 });
    gameIcon(this, 55, 597, "lock", 42);
    text(this, 234, 583, "DAILY FAIR PLAY", 15, "#956113");
    text(this, 234, 608, "Same rules. No Power Tools.", 12, "#577d98");
  }

  private updateBoosterDock() {
    const hammer = this.boosterCardBgs.get("hammer");
    if (hammer) {
      const unlocked = this.level >= HAMMER_BOOSTER_UNLOCK_LEVEL;
      const selected = unlocked && this.boosterMode === "hammer";
      hammer.setFillStyle(selected ? 0xfff2bd : unlocked ? 0xe9f8ff : 0xc7d6df, unlocked ? 1 : 0.72);
      hammer.setStrokeStyle(
        selected ? 2 : 1,
        selected ? 0xf0a51d : unlocked ? 0x50b8e8 : 0x91aab8,
        selected ? 1 : 0.95,
      );
    }
  }

  private createTopControls() {
    const home = text(this, W - 65, 18, "⌂", 15, "#1268a7", "800")
      .setDepth(95)
      .setInteractive({ useHandCursor: true });
    home.on("pointerup", () => {
      if (!this.locked) this.scene.start("HomeScene");
    });

    const settings = gameIcon(this, W - 22, 18, "settings", 29)
      .setDepth(95)
      .setInteractive({ useHandCursor: true });
    settings.on("pointerup", () => this.showSettingsOverlay());

    const mode = text(
      this,
      133,
      18,
      this.dailyMode ? "DAILY • FAIR PLAY" : "POWER TOOLS",
      7,
      this.dailyMode ? "#9a6212" : "#157a52",
      "800",
    ).setDepth(95);
    mode.setBackgroundColor(this.dailyMode ? "#fff1bd" : "#dff8ed").setPadding(7, 4, 7, 4);
  }

  private showSettingsOverlay() {
    if (this.settingsOverlay || this.locked) return;
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
    if (this.dailyMode || this.level < REFRESH_BOOSTER_UNLOCK_LEVEL || this.locked || this.activePiece) return;
    if (!this.grid.some(row => row.some(cell => !cell))) return;

    const save = loadSave();
    if (save.coins < REFRESH_BOOSTER_COST) {
      this.showToast("Not enough coins for Refresh", "#ffe09b", "#493a1b");
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

    this.coinText.setText(`● ${next.coins}`);
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
    if (this.dailyMode || this.level < HAMMER_BOOSTER_UNLOCK_LEVEL || this.locked || this.activePiece) return;

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
    if (this.dailyMode || this.level < HAMMER_BOOSTER_UNLOCK_LEVEL || this.locked || this.activePiece || this.boosterMode !== "hammer") return;

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

    this.coinText.setText(`● ${next.coins}`);
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
        cell.setFillStyle(0x63b9d9, 1);
        cell.setStrokeStyle(1, 0xa4e2ef, 0.95);
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
    if (this.dailyMode || this.level < BULLDOZER_BOOSTER_UNLOCK_LEVEL || this.locked || this.activePiece) return;

    const save = loadSave();
    if (save.coins < BULLDOZER_BOOSTER_COST) {
      this.showToast("Not enough coins for Row Clear", "#ffe09b", "#493a1b");
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
    this.coinText.setText(`● ${next.coins}`);

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
      this.tweens.add({
        targets: cell,
        x: cell.x + 18,
        alpha: 0,
        duration: 150,
        delay: c * 20,
        onComplete: () => {
          cell.x -= 18;
          cell.setFillStyle(0x63b9d9, 1);
          cell.setStrokeStyle(1, 0xa4e2ef, 0.95);
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
        const ghost = this.add
          .rectangle(cell.x, cell.y, CELL - GAP - 3, CELL - GAP - 3, valid ? piece.color : 0xff6b72, valid ? 0.56 : 0.42)
          .setStrokeStyle(2, valid ? 0xffffff : 0xffb0b4, valid ? 0.6 : 0.85)
          .setDepth(70);
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

    points.slice(0, 8).forEach((point, index) => {
      const spark = this.add.circle(point.x, point.y, 3, piece.color, 0.9).setDepth(40);
      const angle = (Math.PI * 2 * index) / Math.max(1, points.length);
      this.tweens.add({
        targets: spark,
        x: point.x + Math.cos(angle) * 18,
        y: point.y + Math.sin(angle) * 18,
        alpha: 0,
        scale: 0.2,
        duration: 280,
        ease: "Cubic.Out",
        onComplete: () => spark.destroy(),
      });
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

    const copy = {
      drag: {
        title: "DRAG A BLOCK",
        hint: "Pick a piece below and place it anywhere it fits.",
      },
      clear: {
        title: "COMPLETE A LINE",
        hint: "Fill every cell in a row or column to clear it.",
      },
      tools: {
        title: "POWER TOOLS UNLOCK",
        hint: "Refresh can replace a bad tray. Save coins for tough boards.",
      },
    }[this.tutorialStep];

    const group = this.add.container(0, 0).setDepth(120);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x02080b, 0.34);
    const cardY = this.tutorialStep === "tools" ? 622 : 574;
    const card = panel(this, W / 2, cardY, W - 56, 94, { fill: 0xffffff, stroke: 0x75caea, radius: 18, shadowAlpha: 0.25 });
    const title = text(this, W / 2, cardY - 22, copy.title, 13, "#123767", "800");
    const hint = text(this, W / 2, cardY + 9, copy.hint, 12, "#426b8c", "700").setWordWrapWidth(W - 90);

    const focusX = this.tutorialStep === "tools" ? 70 : this.pieces[0].homeX;
    const focusY = this.tutorialStep === "tools" ? 625 : this.pieces[0].homeY - 48;
    const hand = text(this, focusX, focusY, "☝", 30, "#ffffff", "800");

    this.tweens.add({
      targets: hand,
      y: focusY - 28,
      duration: 780,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    group.add([dim, card, title, hint, hand]);
    group.setInteractive(new Phaser.Geom.Rectangle(0, 0, W, H), Phaser.Geom.Rectangle.Contains);
    group.on("pointerup", () => this.dismissTutorial());
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

    startingCells.forEach(([row, col], index) => {
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
        cell.setFillStyle(index % 2 === 0 ? 0x24a8ec : 0x5e90e5, 1);
        cell.setStrokeStyle(2, 0xc7f1ff, 0.7);
      }
    });
  }

  private createSideObjectiveText() {
    const parts: string[] = [];
    if (this.targetSpecials) parts.push(`DEBRIS 0/${this.targetSpecials}`);
    if (this.targetIce) parts.push(`ICE 0/${this.targetIce}`);
    if (this.targetCombo) parts.push(`COMBO 0/${this.targetCombo}`);

    if (!parts.length) return;

    panel(this, W / 2, 151, W - 62, 24, { fill: 0xfff3cc, stroke: 0xebd38f, radius: 10, shadow: false });
    this.add.text(W / 2, 151, parts.join("  •  "), {
      fontFamily: "Inter, system-ui",
      fontSize: "11px",
      fontStyle: "bold",
      color: "#996313",
      letterSpacing: 0.4,
    }).setName("side-objective").setOrigin(0.5);
  }

  private updateSideObjectiveText() {
    const side = this.children.getByName("side-objective") as Phaser.GameObjects.Text | null;
    if (!side) return;

    const parts: string[] = [];
    if (this.targetSpecials) {
      parts.push(`DEBRIS ${Math.min(this.specialCleared, this.targetSpecials)}/${this.targetSpecials}`);
    }
    if (this.targetIce) {
      parts.push(`ICE ${Math.min(this.iceBroken, this.targetIce)}/${this.targetIce}`);
    }
    if (this.targetCombo) {
      parts.push(`COMBO ${Math.min(this.bestCombo, this.targetCombo)}/${this.targetCombo}`);
    }
    side.setText(parts.join("  •  "));
  }

  private updatePlacementGoal() {
    if (!this.targetPlacements) return;
    const placementText = this.children.getByName("placement-goal") as Phaser.GameObjects.Text | null;
    placementText?.setText(`PLACE ${Math.min(this.placementsMade, this.targetPlacements)}/${this.targetPlacements}`);
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
    this.goalText.setText(`${Math.min(this.linesCleared, this.targetLines)} / ${this.targetLines}`);

    const comboLabel = this.combo > 1 ? `COMBO ×${this.combo}` : total > 1 ? "DOUBLE CLEAR!" : "NICE!";
    this.comboText.setText(comboLabel).setAlpha(1).setScale(0.8);
    this.tweens.add({
      targets: this.comboText,
      scaleX: 1.12,
      scaleY: 1.12,
      alpha: 1,
      duration: 180,
      yoyo: true,
      hold: 180,
      onComplete: () => this.tweens.add({ targets: this.comboText, alpha: 0, duration: 180 }),
    });

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

      if (this.iceCells.has(key)) {
        this.iceCells.delete(key);
        this.iceBroken += 1;
        this.grid[r][c] = true;
        this.tweens.add({
          targets: cell,
          scaleX: 1.14,
          scaleY: 1.14,
          duration: 110,
          yoyo: true,
          onComplete: () => {
            cell.setFillStyle(0x35616b, 1);
            cell.setStrokeStyle(2, 0x79b7c3, 0.75);
          },
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
          cell.setFillStyle(0x63b9d9, 1);
          cell.setStrokeStyle(1, 0xa4e2ef, 0.95);
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
        options.push({ label: `REFRESH  •  ${REFRESH_BOOSTER_COST} coins`, run: () => this.useRefreshBooster() });
      if (targets.hammer && this.level >= HAMMER_BOOSTER_UNLOCK_LEVEL && save.coins >= HAMMER_BOOSTER_COST)
        options.push({ label: `HAMMER  •  ${HAMMER_BOOSTER_COST} coins`, run: () => {
          this.boosterMode = "hammer";
          this.useHammerOnCell(...targets.hammer!);
        } });
      if (targets.row !== undefined && this.level >= BULLDOZER_BOOSTER_UNLOCK_LEVEL && save.coins >= BULLDOZER_BOOSTER_COST)
        options.push({ label: `ROW CLEAR  •  ${BULLDOZER_BOOSTER_COST} coins`, run: () => this.useBulldozer(targets.row) });
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
