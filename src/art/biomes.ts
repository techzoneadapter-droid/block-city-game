import Phaser from "phaser";
import { W, H } from "../ui";

export type BiomeKey = "grass" | "water" | "desert" | "ice" | "volcano" | "cave";

export type BiomeTheme = {
  key: BiomeKey;
  label: string;
  skyTop: number;
  skyBottom: number;
  shell: number;
  boardFrame: number;
  board: number;
  empty: number;
  emptyStroke: number;
  accent: number;
  vfx: number;
  tray: number;
  traySlot: number;
  pieceColors: number[];
};

export const BIOMES: Record<BiomeKey, BiomeTheme> = {
  grass: {
    key: "grass", label: "Meadow District",
    skyTop: 0x43c8f7, skyBottom: 0xe8fbff, shell: 0xe9f8f1,
    boardFrame: 0x146d8a, board: 0x2f839f, empty: 0x216985, emptyStroke: 0x62b4ca,
    accent: 0x69df6a, vfx: 0xffe54f, tray: 0x0d5e84, traySlot: 0x26799a,
    pieceColors: [0x55d63e, 0x2aaaf3, 0xffcd31, 0xff5a55, 0xb85ae8],
  },
  water: {
    key: "water", label: "Coral Bay",
    skyTop: 0x2dc8f3, skyBottom: 0xdffaff, shell: 0xe5f9fb,
    boardFrame: 0x086f91, board: 0x2589aa, empty: 0x17657f, emptyStroke: 0x56c8dd,
    accent: 0x5ce9ee, vfx: 0x8ff7ff, tray: 0x075875, traySlot: 0x1f7998,
    pieceColors: [0x28b8ef, 0x50d652, 0xffd03d, 0xff6a55, 0xa75be8],
  },
  desert: {
    key: "desert", label: "Sunstone Quarter",
    skyTop: 0x66c9f6, skyBottom: 0xffedc8, shell: 0xfff4da,
    boardFrame: 0x9b5c35, board: 0xd08d4d, empty: 0x89664f, emptyStroke: 0xe9b974,
    accent: 0xffc64c, vfx: 0xffef72, tray: 0x805337, traySlot: 0xa66d45,
    pieceColors: [0xf1bd47, 0xff7350, 0x5fd44a, 0x3daee8, 0xb761e7],
  },
  ice: {
    key: "ice", label: "Frozen Peaks",
    skyTop: 0x7fdcff, skyBottom: 0xf5fbff, shell: 0xedf8ff,
    boardFrame: 0x416f9d, board: 0x70a9c8, empty: 0x497897, emptyStroke: 0x9ee9f7,
    accent: 0x8eefff, vfx: 0xeaffff, tray: 0x315b83, traySlot: 0x4c7ca2,
    pieceColors: [0x67dff5, 0x58b8ef, 0x8ee574, 0xffce55, 0xc176ee],
  },
  volcano: {
    key: "volcano", label: "Magma Core",
    skyTop: 0x5965a2, skyBottom: 0xffb172, shell: 0xffe6cf,
    boardFrame: 0x563249, board: 0x70465a, empty: 0x422d45, emptyStroke: 0x9f6671,
    accent: 0xff7a35, vfx: 0xff9b35, tray: 0x392a45, traySlot: 0x5a3c52,
    pieceColors: [0xff5d3e, 0xffa62f, 0xe24e79, 0x9e66e8, 0x56bfdc],
  },
  cave: {
    key: "cave", label: "Crystal Cave",
    skyTop: 0x243b68, skyBottom: 0x7785b5, shell: 0xe8eaff,
    boardFrame: 0x443d72, board: 0x5a5284, empty: 0x30385f, emptyStroke: 0x817ac2,
    accent: 0xc778f2, vfx: 0xf3a6ff, tray: 0x2d315c, traySlot: 0x4a4b7b,
    pieceColors: [0xb95ceb, 0x49c6e8, 0x67d85d, 0xffc84a, 0xff6579],
  },
};

const CHAPTER_BIOMES: BiomeKey[] = ["grass", "water", "desert", "ice", "volcano", "cave"];

export function biomeForLevel(level: number, daily = false): BiomeTheme {
  if (daily) {
    const day = new Date().getDate();
    return BIOMES[CHAPTER_BIOMES[(day - 1) % CHAPTER_BIOMES.length]];
  }
  const chapter = Math.max(1, Math.min(6, Math.ceil(Math.max(1, level) / 5)));
  return BIOMES[CHAPTER_BIOMES[chapter - 1]];
}

export function isBiomeEmptyColor(color: number) {
  return Object.values(BIOMES).some((biome) => biome.empty === color);
}

function cloud(g: Phaser.GameObjects.Graphics, x: number, y: number, s: number) {
  g.fillStyle(0xffffff, 0.35);
  g.fillCircle(x, y, 14 * s);
  g.fillCircle(x + 17 * s, y - 5 * s, 20 * s);
  g.fillCircle(x + 39 * s, y, 13 * s);
  g.fillRoundedRect(x - 5 * s, y, 57 * s, 13 * s, 6 * s);
}

export function decoratePuzzleBiome(scene: Phaser.Scene, theme: BiomeTheme) {
  const g = scene.add.graphics().setDepth(0);
  cloud(g, -8, 145, 0.7);
  cloud(g, 318, 128, 0.55);

  if (theme.key === "grass") {
    g.fillStyle(0x69c65b, 0.5);
    g.beginPath(); g.moveTo(0, 230); g.lineTo(60, 196); g.lineTo(120, 224); g.lineTo(185, 187); g.lineTo(245, 220); g.lineTo(318, 182); g.lineTo(W, 220); g.lineTo(W, 270); g.lineTo(0, 270); g.closePath(); g.fillPath();
    for (const [x, y] of [[28,220],[72,205],[320,204],[355,221]]) {
      g.fillStyle(0x2e9d45).fillRect(x - 3, y - 18, 6, 20);
      g.fillStyle(0x58cf4b).fillCircle(x - 6, y - 22, 9).fillCircle(x + 6, y - 23, 10).fillCircle(x, y - 32, 9);
    }
  } else if (theme.key === "water") {
    g.fillStyle(0x2dbce8, 0.36).fillRect(0, 198, W, 90);
    g.lineStyle(2, 0xe8ffff, 0.55);
    for (let y = 216; y < 280; y += 20) {
      g.beginPath(); g.moveTo(0, y); g.quadraticCurveTo(45, y - 8, 90, y); g.quadraticCurveTo(135, y + 8, 180, y); g.quadraticCurveTo(225, y - 8, 270, y); g.quadraticCurveTo(330, y + 8, W, y); g.strokePath();
    }
    g.fillStyle(0xff705c, 0.6).fillCircle(34, 246, 8).fillCircle(52, 238, 6);
    g.fillStyle(0x55d254, 0.6).fillCircle(346, 248, 11).fillCircle(362, 238, 7);
  } else if (theme.key === "desert") {
    g.fillStyle(0xe9b768, 0.55);
    g.beginPath(); g.moveTo(0, 228); g.quadraticCurveTo(80, 178, 165, 226); g.quadraticCurveTo(270, 270, W, 202); g.lineTo(W, 282); g.lineTo(0, 282); g.closePath(); g.fillPath();
    g.fillStyle(0x2f9a59, 0.65);
    [[35,226],[348,214]].forEach(([x,y]) => {
      g.fillRoundedRect(x - 4, y - 30, 8, 31, 4);
      g.fillRoundedRect(x - 15, y - 20, 12, 6, 3);
      g.fillRoundedRect(x + 3, y - 13, 13, 6, 3);
    });
  } else if (theme.key === "ice") {
    g.fillStyle(0xd9f8ff, 0.5);
    g.fillTriangle(0, 242, 62, 170, 126, 242);
    g.fillTriangle(92, 242, 186, 151, 276, 242);
    g.fillTriangle(238, 242, 334, 164, W, 242);
    g.fillStyle(0xffffff, 0.66);
    g.fillTriangle(38, 198, 62, 170, 82, 198);
    g.fillTriangle(155, 182, 186, 151, 214, 182);
  } else if (theme.key === "volcano") {
    g.fillStyle(0x4c3551, 0.55);
    g.fillTriangle(15, 252, 105, 161, 192, 252);
    g.fillTriangle(206, 252, 304, 172, 390, 252);
    g.fillStyle(0xff6937, 0.62);
    g.beginPath(); g.moveTo(91, 177); g.lineTo(106, 161); g.lineTo(119, 178); g.lineTo(111, 213); g.lineTo(102, 224); g.lineTo(98, 194); g.closePath(); g.fillPath();
    for (let i = 0; i < 9; i += 1) g.fillCircle(20 + i * 47, 226 + (i % 3) * 9, 3, 0xffa13b, 0.72);
  } else {
    g.fillStyle(0x3b3d67, 0.48).fillRect(0, 186, W, 93);
    const crystals = [[26,239,0x9d64ef],[63,226,0x4ad9ef],[330,232,0xc979f2],[365,220,0x68dce8]] as const;
    crystals.forEach(([x,y,c]) => {
      g.fillStyle(c, 0.72);
      g.fillTriangle(x - 10, y, x, y - 37, x + 9, y);
      g.fillTriangle(x + 4, y, x + 15, y - 25, x + 22, y);
    });
  }

  const label = scene.add.text(W / 2, 236, theme.label.toUpperCase(), {
    fontFamily: '"Arial Rounded MT Bold", Nunito, system-ui, sans-serif',
    fontSize: "11px",
    fontStyle: "bold",
    color: theme.key === "cave" || theme.key === "volcano" ? "#ffffff" : "#24577a",
  }).setOrigin(0.5).setAlpha(0.82).setDepth(1);
  return { g, label };
}
