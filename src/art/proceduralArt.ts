import Phaser from "phaser";
import { COLORS, TEXT_COLORS } from "../theme";

type Graphics = Phaser.GameObjects.Graphics;

const CHARACTER_NAMES = new Set([
  "builder", "planner", "worker", "chef", "mechanic", "sailor", "tourist",
  "builder-wink", "builder-excited", "builder-surprised", "planner-wink",
  "planner-calm", "planner-thinking",
]);
const BODY_NAMES = new Set([
  "builder-body", "planner-body", "worker-body", "chef-body",
  "mechanic-body", "sailor-body", "tourist-body",
]);
const BUILDING_NAMES = new Set([
  "house", "coffee", "shopfront", "apartment", "office", "cafe",
  "market", "tower", "park", "garden",
]);
const PROP_NAMES = new Set([
  "grass", "tree", "palm", "bench", "lamp", "fence", "bridge", "dock",
  "boardwalk", "lighthouse", "wheel", "sailboat", "road",
]);
const ACCESSORY_NAMES = new Set([
  "builder-cap", "backpack", "blueprint", "laptop", "pencil", "camera",
  "worker-toolbox", "cake", "wrench", "tool-belt", "binoculars", "collar",
  "map",
]);

function createTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Graphics) => void,
) {
  if (scene.textures.exists(key)) return key;
  const g = scene.make.graphics({ x: 0, y: 0 });
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
  return key;
}

function toyBox(g: Graphics, x: number, y: number, w: number, h: number, color: number, radius = 5) {
  g.fillStyle(0x063d79, 0.28).fillRoundedRect(x, y + 4, w, h, radius);
  g.fillStyle(color).fillRoundedRect(x, y, w, h, radius);
  g.lineStyle(2, 0xffffff, 0.58).strokeRoundedRect(x + 1, y + 1, w - 2, h - 3, Math.max(2, radius - 1));
}

function paletteForCharacter(name: string) {
  const id = name.split("-")[0];
  if (id === "planner") return { cap: 0xb34fed, shirt: 0x8b51d8 };
  if (id === "worker") return { cap: 0xffcb27, shirt: 0xff8a28 };
  if (id === "chef") return { cap: 0xf7fbff, shirt: 0xf05c67 };
  if (id === "mechanic") return { cap: 0x2788e6, shirt: 0x166fc5 };
  if (id === "sailor") return { cap: 0xf7fbff, shirt: 0x2b7bd4 };
  if (id === "tourist") return { cap: 0xffcc4c, shirt: 0x48b479 };
  return { cap: 0xf4523f, shirt: 0x168aec };
}

function ensureCharacter(scene: Phaser.Scene, name: string, body: boolean) {
  const key = `art-procedural-${name}-v1`;
  const width = body ? 128 : 96;
  const height = body ? 176 : 96;
  return createTexture(scene, key, width, height, (g) => {
    const palette = paletteForCharacter(name);
    const cx = width / 2;
    if (body) {
      g.fillStyle(0x164d75, 0.14).fillEllipse(cx, 169, 91, 12);
      toyBox(g, cx - 28, 92, 56, 54, palette.shirt, 11);
      toyBox(g, cx - 42, 96, 18, 47, 0xffd0ac, 8);
      toyBox(g, cx + 24, 96, 18, 47, 0xffd0ac, 8);
      toyBox(g, cx - 27, 136, 23, 32, 0x20518a, 5);
      toyBox(g, cx + 4, 136, 23, 32, 0x20518a, 5);
      toyBox(g, cx - 34, 158, 31, 13, 0xf7f8ef, 5);
      toyBox(g, cx + 3, 158, 31, 13, 0xf7f8ef, 5);
    }
    const headY = body ? 39 : 17;
    g.fillStyle(0x5a3427).fillRoundedRect(cx - 35, headY + 12, 70, 66, 15);
    g.fillStyle(0xffd2ad).fillRoundedRect(cx - 29, headY + 22, 58, 53, 13);
    g.fillStyle(0xffe2c4, 0.65).fillRoundedRect(cx - 23, headY + 26, 46, 13, 6);
    g.fillStyle(0x5a3427).fillRect(cx - 30, headY + 17, 13, 21).fillRect(cx - 10, headY + 17, 16, 10).fillRect(cx + 19, headY + 17, 12, 19);
    toyBox(g, cx - 35, headY, 70, 29, palette.cap, 9);
    g.fillStyle(palette.cap).fillRoundedRect(cx - 42, headY + 24, 84, 8, 3);
    g.fillStyle(0xffffff, 0.55).fillRect(cx - 27, headY + 3, 10, 18);
    g.fillStyle(0x2c241f);
    if (name.includes("wink")) {
      g.fillRect(cx - 18, headY + 46, 7, 4);
    } else {
      g.fillRoundedRect(cx - 19, headY + 42, 6, 12, 2);
    }
    g.fillRoundedRect(cx + 13, headY + 42, 6, 12, 2);
    g.fillStyle(0xed625f).fillRoundedRect(cx - 7, headY + 59, 15, name.includes("surprised") ? 12 : 8, 4);
    g.fillStyle(0xffffff).fillRect(cx - 5, headY + 59, 11, 3);
  });
}

function drawIsoBuilding(g: Graphics, modern: boolean, accent: number) {
  const x = 64, base = 145, w = modern ? 62 : 76, d = 34, h = modern ? 104 : 74;
  g.fillStyle(0x0a4c75, 0.17).fillEllipse(x, base + 9, 100, 20);
  g.fillStyle(accent).beginPath().moveTo(x, base - h + d / 2).lineTo(x + w / 2, base - h + d).lineTo(x + w / 2, base + d).lineTo(x, base + d / 2).closePath().fillPath();
  g.fillStyle(modern ? 0x1976a8 : 0xe4a35a).beginPath().moveTo(x - w / 2, base - h + d).lineTo(x, base - h + d / 2).lineTo(x, base + d / 2).lineTo(x - w / 2, base + d).closePath().fillPath();
  g.fillStyle(modern ? 0xbceffc : 0xff725c).beginPath().moveTo(x, base - h).lineTo(x + w / 2, base - h + d / 2).lineTo(x, base - h + d).lineTo(x - w / 2, base - h + d / 2).closePath().fillPath();
  g.lineStyle(2, 0xffffff, 0.45).lineBetween(x, base - h + 2, x + w / 2 - 2, base - h + d / 2);
  g.fillStyle(0xd9f8ff);
  const rows = modern ? 5 : 3;
  for (let row = 0; row < rows; row += 1) {
    const yy = base - h + d + 13 + row * 17;
    g.fillRoundedRect(x + 8, yy, 12, 9, 2).fillRoundedRect(x - w / 2 + 7, yy + 3, 11, 8, 2);
    g.fillStyle(0xffffff, 0.65).fillRect(x + 10, yy + 1, 3, 5);
    g.fillStyle(0xd9f8ff);
  }
  g.fillStyle(0x244a70).fillRoundedRect(x + 3, base + 4, 14, 27, 3);
}

function ensureBuilding(scene: Phaser.Scene, name: string) {
  const key = `art-procedural-${name}-v1`;
  return createTexture(scene, key, 128, 184, (g) => {
    if (name === "park" || name === "garden") {
      g.fillStyle(0x164d63, 0.15).fillEllipse(64, 154, 116, 30);
      g.fillStyle(0x3a9562).beginPath().moveTo(8, 126).lineTo(64, 98).lineTo(120, 126).lineTo(64, 157).closePath().fillPath();
      g.fillStyle(0x70d766).beginPath().moveTo(8, 117).lineTo(64, 89).lineTo(120, 117).lineTo(64, 148).closePath().fillPath();
      g.lineStyle(12, 0xffdc9a).lineBetween(25, 126, 103, 106);
      [[29, 103], [91, 103], [48, 124], [80, 129]].forEach(([x, y], i) => {
        g.fillStyle(0x805431).fillRect(x - 3, y - 2, 6, 20);
        g.fillStyle(i % 2 ? 0x26aa52 : 0x54d56a).fillRoundedRect(x - 13, y - 21, 26, 24, 6);
        g.fillStyle(0xa4f080, 0.7).fillRect(x - 7, y - 17, 8, 7);
      });
      if (name === "garden") toyBox(g, 35, 139, 58, 18, 0x3a8cc0, 4);
      return;
    }
    if (name === "market") {
      g.fillStyle(0x4fab62).fillPoints([{ x: 8, y: 135 }, { x: 64, y: 105 }, { x: 120, y: 135 }, { x: 64, y: 166 }], true);
      [[22, 112], [65, 125], [52, 92]].forEach(([x, y], i) => {
        toyBox(g, x, y, 39, 28, 0xffd88a, 3);
        g.fillStyle(i % 2 ? 0x20b9df : 0xff665f).fillTriangle(x - 4, y, x + 44, y, x + 20, y - 19);
        g.fillStyle(0xffffff, 0.8).fillRect(x + 10, y + 7, 8, 8);
      });
      return;
    }
    drawIsoBuilding(g, ["apartment", "office", "tower"].includes(name), name === "coffee" || name === "cafe" ? 0xffd080 : name === "tower" ? 0x39a7d0 : 0xf7c86d);
    if (name === "coffee" || name === "cafe" || name === "shopfront") {
      g.fillStyle(0xf55f55).fillRoundedRect(31, 93, 71, 12, 3);
      for (let x = 34; x < 96; x += 15) g.fillStyle(x % 2 ? 0xffffff : 0xffd25c).fillRect(x, 95, 9, 9);
    }
    if (name === "tower") {
      g.fillStyle(0xffd62d).fillTriangle(51, 43, 64, 25, 77, 43);
      g.fillRect(62, 11, 4, 22);
    }
  });
}

function ensureProp(scene: Phaser.Scene, name: string) {
  const key = `art-procedural-${name}-v1`;
  return createTexture(scene, key, 128, 112, (g) => {
    if (name === "grass" || name === "road") {
      g.fillStyle(0x276b55, 0.22).fillEllipse(64, 77, 112, 29);
      g.fillStyle(name === "road" ? 0x65778b : 0x63d461).fillPoints([{ x: 9, y: 51 }, { x: 64, y: 25 }, { x: 119, y: 51 }, { x: 64, y: 81 }], true);
      g.lineStyle(2, 0xc2f6ad, 0.7).lineBetween(9, 51, 64, 25);
    } else if (name === "tree" || name === "palm") {
      g.fillStyle(0x174a36, 0.16).fillEllipse(64, 102, 58, 12);
      g.fillStyle(0x86532e).fillRoundedRect(58, 50, 12, 48, 4);
      if (name === "palm") {
        g.fillStyle(0x24a94d);
        ([[25, 38, 64, 47, 48, 56], [103, 35, 64, 47, 80, 57], [45, 16, 64, 47, 59, 57], [84, 15, 64, 47, 70, 58]] as Array<[number, number, number, number, number, number]>).forEach((p) => g.fillTriangle(...p));
      } else {
        toyBox(g, 28, 27, 48, 48, 0x139a45, 7);
        toyBox(g, 48, 13, 49, 53, 0x36c65c, 7);
        g.fillStyle(0x94ec7c, 0.8).fillRoundedRect(57, 19, 20, 15, 4);
      }
    } else if (name === "sailboat") {
      g.fillStyle(0x155a85, 0.17).fillEllipse(64, 92, 91, 14);
      g.fillStyle(0xffffff).fillTriangle(20, 65, 108, 65, 92, 89).fillRect(62, 13, 5, 53);
      g.fillStyle(0xff5f55).fillTriangle(68, 16, 68, 62, 101, 62);
      g.fillStyle(0x24b9df).fillRoundedRect(28, 62, 69, 11, 3);
    } else if (name === "wheel") {
      g.lineStyle(8, 0xffffff).strokeCircle(64, 50, 37);
      g.lineStyle(4, 0xff665f);
      for (let i = 0; i < 8; i += 1) {
        const a = i * Math.PI / 4;
        g.lineBetween(64, 50, 64 + Math.cos(a) * 35, 50 + Math.sin(a) * 35);
        g.fillStyle([COLORS.gold, COLORS.coral, COLORS.cyan, COLORS.violet][i % 4]).fillCircle(64 + Math.cos(a) * 37, 50 + Math.sin(a) * 37, 6);
      }
      g.fillStyle(0x31516b).fillTriangle(39, 103, 64, 51, 89, 103).fillRect(28, 100, 72, 7);
    } else if (name === "lighthouse") {
      toyBox(g, 47, 29, 34, 72, 0xf4f8ed, 5);
      g.fillStyle(0xff5e51).fillRect(47, 45, 34, 11).fillRect(47, 72, 34, 11);
      g.fillStyle(0x244d72).fillRoundedRect(41, 17, 46, 19, 5);
      g.fillStyle(0xffd65c).fillRect(53, 21, 22, 10);
      g.fillStyle(0xff5e51).fillTriangle(39, 18, 89, 18, 64, 2);
    } else if (["bridge", "dock", "boardwalk"].includes(name)) {
      g.fillStyle(0x1d7fac, 0.25).fillEllipse(64, 88, 112, 22);
      g.fillStyle(0xb9783d).fillPoints([{ x: 10, y: 47 }, { x: 50, y: 70 }, { x: 117, y: 37 }, { x: 78, y: 17 }], true);
      for (let i = 0; i < 7; i += 1) g.lineStyle(2, 0x75451f, 0.7).lineBetween(24 + i * 12, 45 + i * 2, 38 + i * 12, 54 + i * 2);
    } else if (name === "bench") {
      toyBox(g, 22, 39, 84, 17, 0xb57639, 4); toyBox(g, 27, 63, 74, 14, 0xb57639, 4);
      g.fillStyle(0x493c32).fillRect(33, 75, 8, 24).fillRect(87, 75, 8, 24);
    } else if (name === "lamp") {
      g.fillStyle(0x31516b).fillRoundedRect(59, 34, 10, 68, 3).fillRoundedRect(42, 96, 44, 8, 3);
      toyBox(g, 47, 10, 34, 34, 0xffd35c, 7);
    } else {
      toyBox(g, 14, 48, 100, 22, 0xa46a34, 5);
    }
  });
}

function ensureAccessory(scene: Phaser.Scene, name: string) {
  const key = `art-procedural-${name}-v1`;
  return createTexture(scene, key, 72, 72, (g) => {
    if (name === "builder-cap") {
      g.fillStyle(0xf34d3e).fillRoundedRect(13, 18, 46, 30, 12).fillRoundedRect(7, 43, 59, 9, 4);
      g.fillStyle(0xffffff, 0.45).fillRect(19, 21, 8, 17);
    } else if (name === "backpack" || name === "worker-toolbox" || name === "tool-belt") {
      toyBox(g, 10, 20, 52, 39, name === "worker-toolbox" ? 0xef5144 : 0x8b552d, 7);
      g.lineStyle(5, 0x5a3523).strokeRoundedRect(24, 11, 25, 19, 6);
      g.fillStyle(0xffc13a).fillRoundedRect(31, 33, 10, 12, 2);
    } else if (name === "blueprint" || name === "laptop") {
      toyBox(g, 10, 13, 52, 43, name === "blueprint" ? 0x1688ed : 0x596579, 6);
      g.lineStyle(3, 0xffffff, 0.85).strokeRoundedRect(23, 25, 26, 20, 2).lineBetween(18, 57, 58, 57);
    } else if (name === "wrench") {
      g.lineStyle(12, 0x8191a2).lineBetween(20, 54, 52, 22);
      g.lineStyle(8, 0xd5e1eb).strokeCircle(53, 21, 11);
      g.fillStyle(0x4c5c6d).fillCircle(18, 56, 7);
    } else if (name === "cake") {
      toyBox(g, 13, 31, 48, 28, 0xffd7af, 5);
      g.fillStyle(0xffffff).fillRoundedRect(10, 23, 54, 17, 7);
      g.fillStyle(0xf04f4f).fillCircle(43, 18, 8).fillStyle(0x319c4d).fillRect(41, 7, 4, 8);
    } else if (name === "map") {
      g.fillStyle(0x0d5ba5, 0.24).fillRoundedRect(8, 14, 58, 48, 8);
      g.fillStyle(0xeaf8d5).fillPoints([{ x: 9, y: 15 }, { x: 27, y: 22 }, { x: 27, y: 61 }, { x: 9, y: 54 }], true);
      g.fillStyle(0x87d96f).fillPoints([{ x: 27, y: 22 }, { x: 47, y: 14 }, { x: 47, y: 53 }, { x: 27, y: 61 }], true);
      g.fillStyle(0xd8f3ff).fillPoints([{ x: 47, y: 14 }, { x: 65, y: 22 }, { x: 65, y: 61 }, { x: 47, y: 53 }], true);
      g.lineStyle(2, 0xffffff, 0.8).lineBetween(27, 22, 27, 61).lineBetween(47, 14, 47, 53);
      g.lineStyle(3, 0x1688ed, 0.75).lineBetween(13, 43, 23, 35).lineBetween(23, 35, 36, 43).lineBetween(36, 43, 56, 31);
      g.fillStyle(0xff5f63).fillCircle(52, 25, 8).fillTriangle(47, 29, 57, 29, 52, 42);
      g.fillStyle(0xffffff).fillCircle(52, 25, 3);
    } else if (name === "camera" || name === "binoculars") {
      toyBox(g, 9, 22, 54, 34, 0x26384b, 6);
      g.fillStyle(0x78dcff).fillCircle(36, 39, 14).fillStyle(0xdaf8ff).fillCircle(33, 35, 5);
    } else if (name === "collar") {
      g.lineStyle(12, 0xf04d42).strokeEllipse(36, 36, 54, 28);
      g.fillStyle(0xffd02e).fillCircle(36, 53, 8);
    } else {
      toyBox(g, 28, 7, 16, 57, 0xffc83c, 5);
    }
  });
}

function ensureCorgi(scene: Phaser.Scene, body: boolean) {
  const key = `art-procedural-corgi${body ? "-body" : ""}-v1`;
  return createTexture(scene, key, body ? 128 : 96, body ? 144 : 96, (g) => {
    const cx = body ? 64 : 48, y = body ? 39 : 12;
    if (body) {
      g.fillStyle(0x164d75, 0.14).fillEllipse(cx, 132, 93, 12);
      toyBox(g, cx - 36, 79, 72, 47, 0xffb52d, 12);
      toyBox(g, cx - 39, 112, 25, 23, 0xfff6dc, 7); toyBox(g, cx + 14, 112, 25, 23, 0xfff6dc, 7);
    }
    g.fillStyle(0xf4a515).fillTriangle(cx - 34, y + 28, cx - 22, y - 3, cx - 7, y + 28).fillTriangle(cx + 8, y + 28, cx + 24, y - 3, cx + 35, y + 31);
    toyBox(g, cx - 38, y + 20, 76, 58, 0xffb52d, 13);
    g.fillStyle(0xfff6dc).fillRoundedRect(cx - 22, y + 34, 44, 41, 11);
    g.fillStyle(0x30251e).fillRoundedRect(cx - 24, y + 38, 7, 12, 2).fillRoundedRect(cx + 17, y + 38, 7, 12, 2).fillRoundedRect(cx - 8, y + 52, 16, 10, 4);
    g.fillStyle(0xed625f).fillRoundedRect(cx - 6, y + 64, 12, 10, 4);
  });
}

/**
 * Returns an original code-generated sprite for semantic game art. The
 * function deliberately has no file-loading or reference-sheet dependency.
 */
export function artSprite(
  scene: Phaser.Scene,
  x: number,
  y: number,
  name: string,
  width: number,
  height = width,
) {
  let key: string | undefined;
  if (name === "corgi" || name.startsWith("corgi-")) key = ensureCorgi(scene, name.includes("body"));
  else if (BODY_NAMES.has(name)) key = ensureCharacter(scene, name, true);
  else if (CHARACTER_NAMES.has(name)) key = ensureCharacter(scene, name, false);
  else if (BUILDING_NAMES.has(name)) key = ensureBuilding(scene, name);
  else if (PROP_NAMES.has(name)) key = ensureProp(scene, name);
  else if (ACCESSORY_NAMES.has(name)) key = ensureAccessory(scene, name);
  if (!key) return undefined;
  return scene.add.image(x, y, key).setDisplaySize(width, height);
}

/** Layered original coastal world used instead of a flattened screenshot. */
export function addCoastalWorld(scene: Phaser.Scene) {
  const g = scene.add.graphics();
  g.fillGradientStyle(COLORS.sky, COLORS.sky, COLORS.skyPale, COLORS.skyPale, 1);
  g.fillRect(0, 0, 390, 844);
  g.fillStyle(0xffffff, 0.72);
  [[18, 139, 0.8], [294, 175, 0.65]].forEach(([x, y, scale]) => {
    g.fillCircle(x, y, 23 * scale); g.fillCircle(x + 27 * scale, y - 9 * scale, 31 * scale);
    g.fillCircle(x + 59 * scale, y + 2 * scale, 20 * scale); g.fillRoundedRect(x - 10 * scale, y, 85 * scale, 23 * scale, 10 * scale);
  });
  g.fillStyle(0x77bd86, 0.8);
  g.beginPath().moveTo(0, 386).lineTo(69, 318).lineTo(122, 374).lineTo(191, 286).lineTo(252, 360).lineTo(327, 301).lineTo(390, 369).lineTo(390, 458).lineTo(0, 458).closePath().fillPath();
  g.fillStyle(0x20b9df).fillRect(0, 385, 390, 459);
  g.fillStyle(0x75d66d).beginPath().moveTo(-18, 582).lineTo(187, 458).lineTo(414, 574).lineTo(207, 724).closePath().fillPath();
  g.fillStyle(0x3b9a5e).beginPath().moveTo(-18, 582).lineTo(207, 724).lineTo(207, 763).lineTo(-18, 621).closePath().fillPath();
  for (let i = 0; i < 9; i += 1) g.fillStyle(0xffffff, 0.35).fillRoundedRect(18 + (i * 47) % 340, 410 + (i % 4) * 45, 33, 3, 2);
  const skyline = [
    [35, 444, "house", 75, 100], [105, 420, "coffee", 82, 116], [185, 393, "apartment", 72, 135],
    [255, 431, "house", 78, 104], [326, 391, "office", 74, 143],
  ] as const;
  skyline.forEach(([x, y, name, w, h]) => artSprite(scene, x, y, name, w, h)?.setOrigin(0.5, 1));
  [[18, 505], [86, 530], [150, 498], [238, 519], [305, 505], [371, 541]].forEach(([x, y]) => artSprite(scene, x, y, "tree", 49, 58)?.setOrigin(0.5, 1));
  artSprite(scene, 320, 475, "wheel", 92, 92)?.setOrigin(0.5, 1);
  artSprite(scene, 72, 610, "sailboat", 66, 50)?.setOrigin(0.5, 1);
  artSprite(scene, 273, 628, "sailboat", 72, 52)?.setOrigin(0.5, 1);
  return g;
}

/** Original block-letter logo assembled from text and bevel layers. */
export function addBlockCityLogo(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const group = scene.add.container(x, y);
  const make = (value: string, yy: number, size: number, color: string, edge: string) => {
    const shadow = scene.add.text(4, yy + 8, value, {
      fontFamily: "Impact, Arial Black, system-ui", fontSize: `${size}px`, fontStyle: "bold", color: edge, align: "center",
    }).setOrigin(0.5).setStroke("#052f6b", 9);
    const face = scene.add.text(0, yy, value, {
      fontFamily: "Impact, Arial Black, system-ui", fontSize: `${size}px`, fontStyle: "bold", color, align: "center",
    }).setOrigin(0.5).setStroke("#0753a0", 8).setShadow(0, 4, "#082954", 0, true, true);
    group.add([shadow, face]);
  };
  make("BLOCK", -31, 68, "#f4fbff", "#1688ed");
  make("CITY", 32, 75, "#ffd62d", "#f28b18");
  group.setScale(scale);
  group.setName("block-city-logo");
  return group;
}

export const ART_SYSTEM_NOTE = `${TEXT_COLORS.primary} • original procedural 2.5D assets`;
