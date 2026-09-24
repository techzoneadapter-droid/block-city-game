import Phaser from "phaser";

export type BlockMaterial =
  | "empty"
  | "red"
  | "blue"
  | "green"
  | "yellow"
  | "purple"
  | "grass"
  | "stone"
  | "wood"
  | "sand"
  | "metal"
  | "ice"
  | "lava"
  | "waterCoral"
  | "crystal"
  | "rainbow";

export type BlockState =
  | "normal"
  | "hover"
  | "drag"
  | "selected"
  | "valid"
  | "invalid"
  | "clearing"
  | "disappearing"
  | "disabled"
  | "locked";

export const BLOCK_MATERIALS: BlockMaterial[] = [
  "red", "blue", "green", "yellow", "purple",
  "grass", "stone", "wood", "sand", "metal",
  "ice", "lava", "waterCoral", "crystal", "rainbow",
];

export const MATERIAL_LABELS: Record<BlockMaterial, string> = {
  empty: "EMPTY",
  red: "RED",
  blue: "BLUE",
  green: "GREEN",
  yellow: "YELLOW",
  purple: "PURPLE",
  grass: "GRASS",
  stone: "STONE",
  wood: "WOOD",
  sand: "SAND",
  metal: "METAL",
  ice: "ICE",
  lava: "LAVA",
  waterCoral: "CORAL",
  crystal: "CRYSTAL",
  rainbow: "RARE",
};

type Palette = { top: number; front: number; side: number; dark: number; light: number };

const PALETTES: Record<BlockMaterial, Palette> = {
  empty: { top: 0x226ba0, front: 0x124a7d, side: 0x0a3869, dark: 0x062d59, light: 0x4d9bc3 },
  red: { top: 0xff7a72, front: 0xf0444f, side: 0xb9273b, dark: 0x8c1d32, light: 0xffbab0 },
  blue: { top: 0x55c9ff, front: 0x168ee8, side: 0x0862b8, dark: 0x064585, light: 0xb5efff },
  green: { top: 0x75ef42, front: 0x2fbd31, side: 0x148c27, dark: 0x0c681f, light: 0xc6ff9f },
  yellow: { top: 0xffed58, front: 0xffbd18, side: 0xd77a08, dark: 0x9e5705, light: 0xffffbd },
  purple: { top: 0xdf80ff, front: 0xad43df, side: 0x7824ad, dark: 0x591782, light: 0xf4c1ff },
  grass: { top: 0x6ddb36, front: 0x9b5b2c, side: 0x6e351f, dark: 0x492417, light: 0xb7f46e },
  stone: { top: 0xabb5bf, front: 0x788594, side: 0x505d6b, dark: 0x35424f, light: 0xdce3e8 },
  wood: { top: 0xe49a4a, front: 0xb9672c, side: 0x82431f, dark: 0x5b2c19, light: 0xffc878 },
  sand: { top: 0xffe4a2, front: 0xe9bc70, side: 0xc38b4b, dark: 0x97653b, light: 0xfff5ca },
  metal: { top: 0xb9c5d2, front: 0x7d8b9d, side: 0x4b596c, dark: 0x303b49, light: 0xf3f9ff },
  ice: { top: 0xa8f4ff, front: 0x51cbe9, side: 0x2191c4, dark: 0x176b99, light: 0xe8ffff },
  lava: { top: 0x3f3538, front: 0x2a252b, side: 0x191820, dark: 0x111119, light: 0xffc629 },
  waterCoral: { top: 0x67e3ee, front: 0x179ecb, side: 0x0872a5, dark: 0x07507d, light: 0xd1ffff },
  crystal: { top: 0xf09cff, front: 0x8e46df, side: 0x5127a5, dark: 0x341a78, light: 0xffe0ff },
  rainbow: { top: 0x5de3ff, front: 0x8466f4, side: 0xeb4dab, dark: 0x472176, light: 0xffffff },
};

const COLOR_MATERIALS = new Map<number, BlockMaterial>([
  [0xff414b, "red"], [0xf0444f, "red"],
  [0x00a7ff, "blue"], [0x24a8ec, "blue"], [0x5e90e5, "blue"], [0x168ee8, "blue"],
  [0x45df12, "green"], [0x2fbd31, "green"],
  [0xffd21a, "yellow"], [0xffbd18, "yellow"],
  [0xbc35f1, "purple"], [0xad43df, "purple"],
  [0x70cfee, "ice"], [0x35616b, "stone"],
  [0x9a6b3c, "wood"],
  [0x194e83, "empty"], [0x1666a7, "empty"],
  [0x9b5b2c, "grass"], [0x788594, "stone"], [0xb9672c, "wood"],
  [0xe9bc70, "sand"], [0x7d8b9d, "metal"], [0x51cbe9, "ice"],
  [0x2a252b, "lava"], [0x179ecb, "waterCoral"], [0x8e46df, "crystal"],
  [0x8466f4, "rainbow"],
]);

export function materialFromColor(color: number): BlockMaterial {
  return COLOR_MATERIALS.get(color) ?? "blue";
}

export function materialColor(material: BlockMaterial): number {
  return PALETTES[material].front;
}

function line(g: Phaser.GameObjects.Graphics, color: number, width: number, points: Array<[number, number]>, alpha = 1) {
  g.lineStyle(width, color, alpha);
  g.beginPath();
  g.moveTo(points[0][0], points[0][1]);
  points.slice(1).forEach(([x, y]) => g.lineTo(x, y));
  g.strokePath();
}

function dot(g: Phaser.GameObjects.Graphics, x: number, y: number, radius: number, color: number, alpha = 1) {
  g.fillStyle(color, alpha).fillCircle(x, y, radius);
}

function drawCubeShell(g: Phaser.GameObjects.Graphics, p: Palette) {
  g.fillStyle(p.dark, 0.26).fillRoundedRect(6, 14, 58, 50, 5);
  g.fillStyle(p.front).fillPoints([{ x: 8, y: 18 }, { x: 56, y: 18 }, { x: 56, y: 58 }, { x: 8, y: 58 }], true);
  g.fillStyle(p.top).fillPoints([{ x: 8, y: 18 }, { x: 16, y: 9 }, { x: 63, y: 9 }, { x: 56, y: 18 }], true);
  g.fillStyle(p.side).fillPoints([{ x: 56, y: 18 }, { x: 63, y: 9 }, { x: 63, y: 50 }, { x: 56, y: 58 }], true);
  g.lineStyle(2, p.dark, 0.95).strokePoints([
    { x: 8, y: 18 }, { x: 16, y: 9 }, { x: 63, y: 9 }, { x: 63, y: 50 },
    { x: 56, y: 58 }, { x: 8, y: 58 }, { x: 8, y: 18 }, { x: 56, y: 18 },
    { x: 63, y: 9 },
  ]);
  line(g, p.light, 2, [[17, 11], [58, 11]], 0.78);
  line(g, p.light, 2, [[10, 20], [10, 49]], 0.44);
  line(g, p.dark, 3, [[11, 57], [55, 57]], 0.38);
}

function drawBasic(g: Phaser.GameObjects.Graphics, p: Palette) {
  drawCubeShell(g, p);
  g.fillStyle(p.light, 0.13).fillRect(13, 22, 38, 13);
  line(g, p.light, 2, [[14, 22], [49, 22]], 0.52);
  g.fillStyle(p.dark, 0.16).fillRect(50, 23, 4, 29);
  g.fillStyle(p.light, 0.88).fillRect(14, 23, 7, 3);
  dot(g, 51, 53, 1.4, p.light, 0.42);
}

function drawMaterialDetail(g: Phaser.GameObjects.Graphics, material: BlockMaterial, p: Palette) {
  if (["red", "blue", "green", "yellow", "purple"].includes(material)) {
    drawBasic(g, p);
    return;
  }

  drawCubeShell(g, p);
  switch (material) {
    case "empty":
      g.fillStyle(0x061f47, 0.25).fillRect(12, 22, 40, 31);
      line(g, p.light, 1, [[13, 23], [50, 23]], 0.22);
      break;
    case "grass":
      g.fillStyle(0x53c932).fillPoints([{x:8,y:18},{x:16,y:9},{x:63,y:9},{x:56,y:18}], true);
      g.fillStyle(0x43ba28).fillPoints([{x:8,y:18},{x:56,y:18},{x:56,y:24},{x:50,y:22},{x:45,y:27},{x:39,y:23},{x:33,y:26},{x:27,y:22},{x:19,y:25},{x:13,y:22},{x:8,y:24}], true);
      line(g, 0x2c8b24, 2, [[18,31],[18,56],[34,56],[34,36],[55,36]], 0.33);
      dot(g, 20, 37, 1.6, 0x63341d); dot(g, 42, 48, 1.3, 0xe3a25e); dot(g, 49, 29, 1.1, 0x5d321d);
      break;
    case "stone":
      line(g, p.dark, 2, [[8,38],[29,38],[34,34],[56,34]], 0.62);
      line(g, p.dark, 2, [[32,18],[32,34],[27,42],[27,58]], 0.58);
      line(g, p.light, 1, [[11,36],[28,36]], 0.38);
      line(g, 0x303c48, 2, [[43,38],[39,43],[44,47],[40,52]], 0.72);
      dot(g, 17, 27, 1.1, 0xd2dae0, 0.42); dot(g, 48, 26, 1.2, 0x46515d, 0.55);
      break;
    case "wood":
      [30, 42, 53].forEach(y => line(g, p.dark, 2, [[9,y],[55,y]], 0.58));
      line(g, p.light, 1, [[10,28],[54,28]], 0.38);
      line(g, p.dark, 2, [[28,19],[28,57]], 0.35);
      g.lineStyle(2, p.dark, 0.7).strokeEllipse(18, 36, 9, 5);
      dot(g, 18, 36, 1.2, p.dark, 0.8);
      break;
    case "sand":
      g.fillStyle(p.light, 0.17).fillRect(12, 22, 40, 13);
      [[16,27],[25,45],[44,25],[49,49],[36,37],[15,53]].forEach(([x,y], i) => dot(g, x, y, i % 2 ? 1 : 1.4, i % 2 ? p.dark : p.light, 0.5));
      line(g, p.light, 1, [[11,23],[23,21],[34,23],[48,21]], 0.42);
      break;
    case "metal":
      line(g, p.dark, 2, [[32,19],[32,57]], 0.48);
      line(g, p.light, 2, [[34,21],[52,21]], 0.48);
      [[14,24],[50,24],[14,52],[50,52]].forEach(([x,y]) => {
        dot(g, x, y, 2.3, p.dark); dot(g, x - .5, y - .6, .8, p.light, 0.9);
      });
      line(g, 0xffffff, 2, [[17,13],[45,13]], 0.72);
      break;
    case "ice":
      g.fillStyle(0xe9ffff, 0.17).fillPoints([{x:13,y:22},{x:50,y:22},{x:50,y:52},{x:13,y:52}], true);
      line(g, 0xf2ffff, 3, [[16,24],[26,32],[20,43]], 0.78);
      line(g, 0x1686bd, 2, [[45,21],[36,34],[46,43],[39,54]], 0.42);
      g.fillStyle(0xffffff, 0.72).fillRect(14, 22, 10, 3);
      dot(g, 47, 48, 2, 0xffffff, 0.66);
      break;
    case "lava":
      line(g, 0xffa20b, 4, [[10,29],[21,31],[28,40],[38,35],[45,42],[55,39]], 1);
      line(g, 0xffed5a, 1, [[10,29],[21,31],[28,40],[38,35],[45,42],[55,39]], 1);
      line(g, 0xff5a13, 3, [[25,19],[29,28],[26,39],[31,57]], 0.92);
      dot(g, 47, 25, 2.4, 0xff6b12); dot(g, 16, 48, 1.8, 0xffc11a);
      break;
    case "waterCoral":
      line(g, 0xb9ffff, 2, [[11,27],[19,24],[28,27],[37,24],[48,27],[54,25]], 0.76);
      line(g, 0x46dcec, 2, [[10,35],[20,32],[30,35],[41,32],[53,35]], 0.58);
      line(g, 0xff7b62, 3, [[38,56],[38,43],[32,37],[38,43],[45,35],[38,47],[48,45]], 0.96);
      dot(g, 32, 37, 2.1, 0xffaa78); dot(g, 45, 35, 2.1, 0xffaa78); dot(g, 48, 45, 2.1, 0xffaa78);
      break;
    case "crystal":
      g.fillStyle(0xcb7cff, 0.65).fillPoints([{x:10,y:20},{x:29,y:18},{x:22,y:55},{x:10,y:46}], true);
      g.fillStyle(0x6328be, 0.62).fillPoints([{x:29,y:18},{x:54,y:22},{x:43,y:56},{x:22,y:55}], true);
      g.fillStyle(0xf9c6ff, 0.38).fillPoints([{x:29,y:18},{x:39,y:37},{x:22,y:55}], true);
      line(g, 0xffffff, 2, [[14,23],[25,21],[20,40]], 0.86);
      dot(g, 48, 17, 2, 0xffffff); line(g, 0xffffff, 1, [[48,12],[48,22]], 0.9); line(g, 0xffffff, 1, [[43,17],[53,17]], 0.9);
      break;
    case "rainbow": {
      const colors = [0xff5166, 0xffc928, 0x54d744, 0x21b8ee, 0x8a5aef, 0xef55cb];
      colors.forEach((color, index) => {
        const col = index % 3, row = Math.floor(index / 3);
        g.fillStyle(color).fillRect(10 + col * 15, 20 + row * 18, 15, 18);
        g.fillStyle(0xffffff, 0.18).fillRect(11 + col * 15, 21 + row * 18, 13, 3);
      });
      line(g, 0xffffff, 2, [[10,20],[55,20],[55,56]], 0.72);
      dot(g, 19, 29, 1.8, 0xffffff, 0.8); dot(g, 48, 47, 1.5, 0xffffff, 0.75);
      break;
    }
  }
}

export function ensureBlockMaterialTexture(scene: Phaser.Scene, material: BlockMaterial): string {
  const key = `voxel-material-v3-${material}`;
  if (scene.textures.exists(key)) return key;

  const g = scene.make.graphics({ x: 0, y: 0 });
  drawMaterialDetail(g, material, PALETTES[material]);
  g.generateTexture(key, 72, 68);
  g.destroy();
  return key;
}

/** Lightweight material-colored voxel debris; no filters or per-frame emitters. */
export function emitVoxelBurst(
  scene: Phaser.Scene,
  x: number,
  y: number,
  material: BlockMaterial,
  options: { count?: number; distance?: number; depth?: number } = {},
) {
  const count = options.count ?? 4;
  const distance = options.distance ?? 25;
  const depth = options.depth ?? 87;
  const palette = PALETTES[material];
  const colors = [palette.front, palette.top, palette.side, palette.light];

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const size = 3 + (index % 3);
    const shard = scene.add
      .rectangle(x, y, size, Math.max(3, size - 1), colors[index % colors.length], 0.96)
      .setStrokeStyle(1, palette.light, 0.5)
      .setAngle(index * 31)
      .setDepth(depth);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * (distance + (index % 2) * 7),
      y: y + Math.sin(angle) * distance - 7,
      angle: shard.angle + 150,
      scale: 0.25,
      alpha: 0,
      duration: 330 + index * 18,
      ease: "Cubic.Out",
      onComplete: () => shard.destroy(),
    });
  }
}
