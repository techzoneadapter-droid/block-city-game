import { assetKey } from '../ui/assets';
import Phaser from "phaser";
import { cachedCanvas } from "../ui/art";

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
  "red",
  "blue",
  "green",
  "yellow",
  "purple",
  "grass",
  "stone",
  "wood",
  "sand",
  "metal",
  "ice",
  "lava",
  "waterCoral",
  "crystal",
  "rainbow",
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

type Palette = {
  top: number;
  front: number;
  side: number;
  dark: number;
  light: number;
};

const PALETTES: Record<BlockMaterial, Palette> = {
  empty: {
    top: 0x226ba0,
    front: 0x124a7d,
    side: 0x0a3869,
    dark: 0x062d59,
    light: 0x4d9bc3,
  },
  red: {
    top: 0xff525b,
    front: 0xfb203c,
    side: 0xb9273b,
    dark: 0x8c1d32,
    light: 0xffbab0,
  },
  blue: {
    top: 0x19c3ff,
    front: 0x0086ff,
    side: 0x0862b8,
    dark: 0x064585,
    light: 0xb5efff,
  },
  green: {
    top: 0x73f329,
    front: 0x22cf08,
    side: 0x148c27,
    dark: 0x0c681f,
    light: 0xc6ff9f,
  },
  yellow: {
    top: 0xffec25,
    front: 0xffc000,
    side: 0xd77a08,
    dark: 0x9e5705,
    light: 0xffffbd,
  },
  purple: {
    top: 0xda52ff,
    front: 0xab12ef,
    side: 0x7824ad,
    dark: 0x591782,
    light: 0xf4c1ff,
  },
  grass: {
    top: 0x6ddb36,
    front: 0x9b5b2c,
    side: 0x6e351f,
    dark: 0x492417,
    light: 0xb7f46e,
  },
  stone: {
    top: 0xabb5bf,
    front: 0x788594,
    side: 0x505d6b,
    dark: 0x35424f,
    light: 0xdce3e8,
  },
  wood: {
    top: 0xe49a4a,
    front: 0xb9672c,
    side: 0x82431f,
    dark: 0x5b2c19,
    light: 0xffc878,
  },
  sand: {
    top: 0xffe4a2,
    front: 0xe9bc70,
    side: 0xc38b4b,
    dark: 0x97653b,
    light: 0xfff5ca,
  },
  metal: {
    top: 0xb9c5d2,
    front: 0x7d8b9d,
    side: 0x4b596c,
    dark: 0x303b49,
    light: 0xf3f9ff,
  },
  ice: {
    top: 0xa8f4ff,
    front: 0x51cbe9,
    side: 0x2191c4,
    dark: 0x176b99,
    light: 0xe8ffff,
  },
  lava: {
    top: 0x3f3538,
    front: 0x2a252b,
    side: 0x191820,
    dark: 0x111119,
    light: 0xffc629,
  },
  waterCoral: {
    top: 0x67e3ee,
    front: 0x179ecb,
    side: 0x0872a5,
    dark: 0x07507d,
    light: 0xd1ffff,
  },
  crystal: {
    top: 0xf09cff,
    front: 0x8e46df,
    side: 0x5127a5,
    dark: 0x341a78,
    light: 0xffe0ff,
  },
  rainbow: {
    top: 0x5de3ff,
    front: 0x8466f4,
    side: 0xeb4dab,
    dark: 0x472176,
    light: 0xffffff,
  },
};

const COLOR_MATERIALS = new Map<number, BlockMaterial>([
  [0xff414b, "red"],
  [0xf0444f, "red"],
  [0x00a7ff, "blue"],
  [0x24a8ec, "blue"],
  [0x5e90e5, "blue"],
  [0x168ee8, "blue"],
  [0x45df12, "green"],
  [0x2fbd31, "green"],
  [0xffd21a, "yellow"],
  [0xffbd18, "yellow"],
  [0xbc35f1, "purple"],
  [0xad43df, "purple"],
  [0x70cfee, "ice"],
  [0x35616b, "stone"],
  [0x9a6b3c, "wood"],
  [0x194e83, "empty"],
  [0x1666a7, "empty"],
  [0x9b5b2c, "grass"],
  [0x788594, "stone"],
  [0xb9672c, "wood"],
  [0xe9bc70, "sand"],
  [0x7d8b9d, "metal"],
  [0x51cbe9, "ice"],
  [0x2a252b, "lava"],
  [0x179ecb, "waterCoral"],
  [0x8e46df, "crystal"],
  [0x8466f4, "rainbow"],
]);

// Keep exported palette colors round-trippable as materials evolve.
Object.entries(PALETTES).forEach(([material, palette]) => {
  COLOR_MATERIALS.set(palette.front, material as BlockMaterial);
});

export function materialFromColor(color: number): BlockMaterial {
  return COLOR_MATERIALS.get(color) ?? "blue";
}

export function materialColor(material: BlockMaterial): number {
  return PALETTES[material].front;
}

/** Beveled, rounded toy tiles. The full texture footprint is the cell face. */
export function ensureBlockMaterialTexture(
  scene: Phaser.Scene,
  material: BlockMaterial,
): string {
  const aliases: Partial<Record<BlockMaterial,string>> = { waterCoral: 'ice', crystal: 'rainbow', lava: 'stone' };
  const key = material === 'empty' ? 'puzzle.ui.empty' : `puzzle.block.${aliases[material] ?? material}`;
  const texture = assetKey(scene, key);
  if (!texture) throw new Error(`Missing canonical block: ${key}`);
  return texture;
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

  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count - Math.PI / 2;
    const size = 7 + (index % 3) * 2;
    const shard = scene.add
      .image(x, y, ensureBlockMaterialTexture(scene, material))
      .setDisplaySize(size, size)
      .setAngle(index * 31)
      .setDepth(depth);
    scene.tweens.add({
      targets: shard,
      x: x + Math.cos(angle) * (distance + (index % 2) * 7),
      y: y + Math.sin(angle) * distance - 7,
      angle: shard.angle + 150,
      scaleX: shard.scaleX * 0.2,
      scaleY: shard.scaleY * 0.2,
      alpha: 0,
      duration: 330 + index * 18,
      ease: "Cubic.Out",
      onComplete: () => shard.destroy(),
    });
  }
}
