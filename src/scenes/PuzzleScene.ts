import Phaser from "phaser";
import { addGradientBackground, button, COLORS, H, text, W } from "../ui";
import { loadSave, updateSave } from "../save";

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
  private readonly targetLines = 3;
  private level = 1;
  private goalText!: Phaser.GameObjects.Text;
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

  constructor() {
    super("PuzzleScene");
  }

  create() {
    addGradientBackground(this, 0x0a1d25, 0x071116);

    const save = loadSave();
    this.level = save.level;

    this.grid = Array.from({ length: BOARD }, () => Array(BOARD).fill(false));
    this.cells = [];
    this.pieces = [];
    this.linesCleared = 0;
    this.combo = 0;
    this.locked = false;
    this.activePiece = null;
    this.activePointerId = null;
    this.ghostCells = [];
    this.ghostPlacement = null;
    this.tutorialShown = false;

    this.installCanvasDragFallback();

    this.add.text(24, 32, `LEVEL ${this.level}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#6e8d96",
      letterSpacing: 1,
    });

    this.add.text(24, 52, "Clear 3 lines", {
      fontFamily: "Inter, system-ui",
      fontSize: "22px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    this.goalText = this.add.text(W - 24, 43, `0 / ${this.targetLines}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "17px",
      fontStyle: "bold",
      color: "#41dfaa",
    }).setOrigin(1, 0.5);

    this.add.rectangle(W / 2, 112, W - 46, 52, COLORS.panel, 0.88)
      .setStrokeStyle(1, 0x23414a, 0.9);

    this.add.text(40, 98, "BUILD REWARD", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#66838c",
    });
    this.add.text(40, 113, "★  1 Construction Star", {
      fontFamily: "Inter, system-ui",
      fontSize: "12px",
      fontStyle: "bold",
      color: "#f5d779",
    });

    this.comboText = text(this, W / 2, 160, "", 13, "#6fe6ef", "800").setAlpha(0);

    this.createBoard();
    this.spawnTray();

    if (this.level === 1) {
      this.time.delayedCall(380, () => this.showTutorial());
    }

    this.add.text(W / 2, 588, "DRAG THE BLOCKS ONTO THE BOARD", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5f7c84",
      letterSpacing: 1,
    }).setOrigin(0.5);

    this.add.text(W / 2, 777, "Complete rows or columns • No timer • Play at your pace", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      color: "#5f777f",
    }).setOrigin(0.5);

    this.add.text(W - 22, 808, "v0.2", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);

    this.add.text(W / 2, 808, "BLOCK CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#29434a",
      letterSpacing: 2,
    }).setOrigin(0.5);
  }

  private createBoard() {
    this.add.rectangle(
      W / 2,
      BOARD_Y + BOARD_PX / 2,
      BOARD_PX + 18,
      BOARD_PX + 18,
      0x0c1c23,
      0.96,
    ).setStrokeStyle(1, 0x28434b, 1);

    for (let r = 0; r < BOARD; r += 1) {
      const row: Phaser.GameObjects.Rectangle[] = [];
      for (let c = 0; c < BOARD; c += 1) {
        const x = BOARD_X + c * CELL + CELL / 2;
        const y = BOARD_Y + r * CELL + CELL / 2;
        row.push(
          this.add.rectangle(x, y, CELL - GAP, CELL - GAP, 0x132830, 1)
            .setStrokeStyle(1, 0x1d3a43, 0.9),
        );
      }
      this.cells.push(row);
    }
  }

  private spawnTray() {
    this.pieces.forEach((piece) => piece.container.destroy(true));
    this.pieces = [];

    const slots = [80, 195, 310];
    const trayY = 681;

    const shapes = this.generateFairTray();
    for (let i = 0; i < 3; i += 1) {
      const color = Phaser.Utils.Array.GetRandom(PIECE_COLORS);
      this.pieces.push(this.createPiece(shapes[i], slots[i], trayY, color));
    }

    if (!this.anyPieceFits()) this.showNoMoves();
  }

  private createPiece(shape: Shape, x: number, y: number, color: number): Piece {
    const container = this.add.container(x, y).setDepth(20);
    const mini = 24;
    const width = shape[0].length * mini;
    const height = shape.length * mini;

    shape.forEach((row, r) => {
      row.forEach((value, c) => {
        if (!value) return;
        const rx = c * mini - width / 2 + mini / 2;
        const ry = r * mini - height / 2 + mini / 2;
        const shadow = this.add.rectangle(rx, ry + 2, mini - 4, mini - 4, 0x000000, 0.22);
        const block = this.add.rectangle(rx, ry, mini - 4, mini - 4, color, 1)
          .setStrokeStyle(1, 0xffffff, 0.12);
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
        cell.setStrokeStyle(1, 0xffffff, 0.12);
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

    this.placeFeedback(piece, row, col);
    piece.container.destroy(true);
    this.pieces = this.pieces.filter((item) => item !== piece);

    this.time.delayedCall(200, () => {
      this.clearCompletedLines();

      if (this.linesCleared >= this.targetLines) {
        this.time.delayedCall(420, () => this.completeLevel());
      } else if (this.pieces.length === 0) {
        this.time.delayedCall(300, () => this.spawnTray());
      } else if (!this.anyPieceFits()) {
        this.time.delayedCall(320, () => this.showNoMoves());
      }
    });

    return true;
  }

  private generateFairTray() {
    const fitting = SHAPES.filter((shape) => this.shapeFitsAnywhere(shape));
    const safePool = fitting.length ? fitting : SHAPES.filter((shape) => this.blockCount(shape) <= 2);
    const result: Shape[] = [];

    while (result.length < 3) {
      const source = result.length === 0 ? safePool : (Math.random() < 0.78 ? safePool : SHAPES);
      const shape = Phaser.Utils.Array.GetRandom(source);
      result.push(shape);
    }

    if (!result.some((shape) => this.shapeFitsAnywhere(shape))) {
      result[0] = Phaser.Utils.Array.GetRandom(safePool);
    }

    return result;
  }

  private blockCount(shape: Shape) {
    return shape.reduce((sum, row) => sum + row.reduce((rowSum, value) => rowSum + value, 0), 0);
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
    this.playTone(360, 0.045, 0.025);

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
      if ("vibrate" in navigator) navigator.vibrate(pattern);
    } catch {
      // Haptics are optional.
    }
  }

  private playTone(frequency: number, duration: number, gainValue: number) {
    try {
      const AudioContextCtor = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextCtor) return;
      const context = new AudioContextCtor();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = frequency;
      gain.gain.setValueAtTime(gainValue, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + duration);
      oscillator.onended = () => void context.close();
    } catch {
      // Audio feedback is optional.
    }
  }

  private showTutorial() {
    if (this.tutorialShown || this.locked || !this.pieces.length) return;
    this.tutorialShown = true;

    const group = this.add.container(0, 0).setDepth(120);
    const dim = this.add.rectangle(W / 2, H / 2, W, H, 0x02080b, 0.38);
    const card = this.add.rectangle(W / 2, 574, W - 56, 88, 0x10242c, 0.97).setStrokeStyle(1, 0x3d7566, 1);
    const title = text(this, W / 2, 551, "DRAG A BLOCK TO THE BOARD", 13, "#eafaf4", "800");
    const hint = text(this, W / 2, 578, "Complete a full row or column to clear it.", 9, "#8fb2aa", "700");

    const firstPiece = this.pieces[0];
    const hand = text(this, firstPiece.homeX, firstPiece.homeY - 48, "☝", 30, "#ffffff", "800");
    this.tweens.add({
      targets: hand,
      y: firstPiece.homeY - 82,
      duration: 780,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    group.add([dim, card, title, hint, hand]);
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
    this.linesCleared += total;
    this.pulseHaptic(total > 1 ? [18, 35, 26] : 22);
    this.playTone(total > 1 ? 660 : 520, 0.08, 0.045);
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

    const touched = new Set<string>();
    rows.forEach((r) => {
      for (let c = 0; c < BOARD; c += 1) touched.add(`${r}:${c}`);
    });
    cols.forEach((c) => {
      for (let r = 0; r < BOARD; r += 1) touched.add(`${r}:${c}`);
    });

    touched.forEach((key) => {
      const [r, c] = key.split(":").map(Number);
      this.grid[r][c] = false;
      const cell = this.cells[r][c];
      this.tweens.add({
        targets: cell,
        scaleX: 0.1,
        scaleY: 0.1,
        alpha: 0.2,
        duration: 160,
        ease: "Cubic.In",
        onComplete: () => {
          cell.setFillStyle(0x132830, 1);
          cell.setStrokeStyle(1, 0x1d3a43, 0.9);
          cell.setScale(1);
          cell.setAlpha(1);
        },
      });
    });

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
    this.locked = true;

    updateSave((save) => ({
      ...save,
      level: save.level + 1,
      stars: save.stars + 1,
      coins: save.coins + 35,
    }));

    this.add.rectangle(W / 2, H / 2, W, H, 0x031015, 0.78).setDepth(150);
    this.add.rectangle(W / 2, 420, W - 52, 330, COLORS.panel, 1)
      .setStrokeStyle(1, 0x3d6f65, 1)
      .setDepth(151);

    const star = text(this, W / 2, 326, "★", 64, "#ffce67", "800").setDepth(152).setScale(0.2);
    text(this, W / 2, 385, "LEVEL COMPLETE", 23, "#f6f1e4", "800").setDepth(152);
    text(this, W / 2, 423, "+1 Construction Star", 13, "#8fe4c4", "700").setDepth(152);
    text(this, W / 2, 454, "+35 Coins", 12, "#f1cd73", "700").setDepth(152);
    text(this, W / 2, 494, "Your city is ready for an upgrade.", 10, "#7f979f", "700").setDepth(152);

    const go = button(this, W / 2, 550, W - 100, 52, "BUILD THE CITY  →", () => {
      this.scene.start("CityScene");
    });
    go.setDepth(152);

    this.tweens.add({ targets: star, scaleX: 1, scaleY: 1, duration: 500, ease: "Back.Out" });
  }

  private showNoMoves() {
    if (this.locked) return;
    this.locked = true;

    this.add.rectangle(W / 2, H / 2, W, H, 0x031015, 0.72).setDepth(150);
    this.add.rectangle(W / 2, 430, W - 56, 250, COLORS.panel, 1)
      .setStrokeStyle(1, 0x2d5059, 1)
      .setDepth(151);

    text(this, W / 2, 370, "NO MORE MOVES", 22, "#f6f1e4", "800").setDepth(152);
    text(this, W / 2, 410, "Good try. The next board is waiting.", 10, "#829aa2", "700").setDepth(152);

    const retry = button(this, W / 2, 475, W - 110, 50, "TRY AGAIN", () => {
      this.scene.restart();
    }, 0x2f7f69);
    retry.setDepth(152);
  }
}
