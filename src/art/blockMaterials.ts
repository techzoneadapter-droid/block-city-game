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
  return cachedCanvas(scene, `puzzle-material-v4-${material}`, 64, 64, (c) => {
    const p = PALETTES[material];
    const hex = (n: number) => "#" + n.toString(16).padStart(6, "0");
    const grad = (top: number, bottom: number) => {
      const g = c.createLinearGradient(8, 4, 53, 61);
      g.addColorStop(0, hex(top));
      g.addColorStop(1, hex(bottom));
      return g;
    };
    const rr = (
      x: number,
      y: number,
      w: number,
      h: number,
      r: number,
      fill: string | CanvasGradient,
    ) => {
      c.fillStyle = fill;
      c.beginPath();
      c.roundRect(x, y, w, h, r);
      c.fill();
    };
    const poly = (points: number[][], color: string) => {
      c.beginPath();
      points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.closePath();
      c.fillStyle = color;
      c.fill();
    };
    const line = (points: number[][], color: string, width = 2) => {
      c.beginPath();
      points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
      c.strokeStyle = color;
      c.lineWidth = width;
      c.stroke();
    };
    if (material === "empty") {
      rr(1, 1, 62, 62, 8, "#061f40");
      rr(2, 4, 60, 58, 7, grad(0x0b2d57, 0x153e6b));
      line(
        [
          [4, 10],
          [8, 5],
          [55, 5],
          [60, 10],
        ],
        "#235785",
        1.5,
      );
      return;
    }
    rr(1, 3, 62, 61, 9, "#052c56");
    rr(1, 1, 61, 60, 8, hex(p.dark));
    rr(2, 1, 59, 58, 7, grad(p.top, p.side));
    poly(
      [
        [8, 2],
        [54, 2],
        [59, 8],
        [51, 13],
        [12, 13],
        [4, 8],
      ],
      hex(p.light),
    );
    poly(
      [
        [3, 10],
        [11, 16],
        [11, 49],
        [5, 56],
        [3, 51],
      ],
      hex(p.top),
    );
    poly(
      [
        [53, 12],
        [61, 7],
        [61, 51],
        [54, 58],
        [49, 50],
      ],
      hex(p.side),
    );
    poly(
      [
        [12, 48],
        [51, 48],
        [55, 58],
        [9, 58],
        [4, 53],
      ],
      hex(p.side),
    );
    rr(10, 10, 43, 43, 4, grad(p.top, p.front));
    line(
      [
        [13, 10],
        [48, 10],
        [53, 14],
      ],
      "#ffffff99",
      1.4,
    );
    line(
      [
        [5, 9],
        [9, 4],
        [20, 4],
      ],
      "#ffffff",
      2.4,
    );
    // Material details share the same rounded shell and consistent lighting.
    if (material === "wood" || material === "grass") {
      for (const y of [23, 37, 49])
        line(
          [
            [11, y],
            [51, y],
          ],
          hex(p.dark),
          2,
        );
      if (material === "wood") {
        rr(6, 8, 8, 46, 2, grad(p.top, p.front));
        rr(49, 8, 8, 46, 2, grad(p.top, p.front));
        rr(7, 9, 49, 7, 2, hex(p.top));
        rr(7, 47, 49, 7, 2, hex(p.front));
        for (const x of [10, 53])
          for (const y of [12, 50]) {
            c.fillStyle = "#ffe0a3";
            c.beginPath();
            c.arc(x, y, 1.8, 0, 7);
            c.fill();
          }
        line(
          [
            [22, 27],
            [29, 25],
            [39, 28],
          ],
          "#f5ba77",
          1,
        );
        line(
          [
            [21, 41],
            [30, 43],
            [40, 41],
          ],
          "#723914",
          1,
        );
      } else {
        rr(8, 7, 47, 17, 3, "#6be226");
        rr(15, 15, 8, 18, 2, "#4bc814");
        rr(36, 14, 10, 14, 2, "#5bdc1c");
      }
    } else if (material === "ice") {
      poly(
        [
          [12, 12],
          [35, 12],
          [13, 45],
        ],
        "#e7ffff70",
      );
      line(
        [
          [32, 10],
          [29, 23],
          [40, 34],
          [35, 52],
        ],
        "#eeffff",
        2,
      );
      line(
        [
          [12, 29],
          [29, 23],
          [25, 39],
          [12, 46],
        ],
        "#c1ffff",
        1.8,
      );
      line(
        [
          [40, 34],
          [52, 28],
        ],
        "#ffffff",
        2,
      );
    } else if (material === "stone" || material === "metal") {
      if (material === "stone") {
        line(
          [
            [10, 30],
            [28, 30],
            [35, 24],
            [53, 24],
          ],
          hex(p.dark),
        );
        line(
          [
            [28, 11],
            [28, 30],
            [33, 38],
            [30, 52],
          ],
          hex(p.dark),
        );
      } else
        for (const x of [15, 48])
          for (const y of [16, 47]) {
            c.fillStyle = hex(p.dark);
            c.beginPath();
            c.arc(x, y, 3, 0, 7);
            c.fill();
            c.fillStyle = hex(p.light);
            c.beginPath();
            c.arc(x - 1, y - 1, 1.7, 0, 7);
            c.fill();
          }
    } else if (material === "rainbow") {
      [0xff414b, 0xffd21a, 0x45df12, 0x00a7ff, 0xbc35f1, 0xfc69d6].forEach(
        (color, i) =>
          rr(
            11 + (i % 3) * 14,
            12 + Math.floor(i / 3) * 20,
            13,
            19,
            2,
            hex(color),
          ),
      );
    } else if (material === "sand") {
      [
        [18, 20],
        [40, 23],
        [26, 36],
        [43, 45],
        [17, 49],
      ].forEach(([x, y]) => rr(x, y, 3, 4, 1, hex(p.side)));
    } else if (
      material === "crystal" ||
      material === "waterCoral" ||
      material === "lava"
    ) {
      line(
        [
          [13, 27],
          [26, 21],
          [32, 37],
          [49, 29],
        ],
        hex(p.light),
        3,
      );
    }
  });
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
