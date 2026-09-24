import Phaser from "phaser";

export type VoxelBiomeId = "grass" | "water" | "ice" | "volcano" | "desert" | "cave";

export type VoxelBiome = {
  id: VoxelBiomeId;
  name: string;
  subtitle: string;
  skyTop: number;
  skyBottom: number;
  ground: number;
  groundDark: number;
  accent: number;
  frame: number;
  emptyCell: number;
  piecePalette: number[];
};

export const VOXEL_BIOMES: Record<VoxelBiomeId, VoxelBiome> = {
  grass: {
    id: "grass", name: "Meadow", subtitle: "Grass & earth",
    skyTop: 0x39bff7, skyBottom: 0xcaf5ff, ground: 0x61c94f, groundDark: 0x7a512f,
    accent: 0x93ef5d, frame: 0x123f69, emptyCell: 0x1b5d87,
    piecePalette: [0x37cf49, 0x2aa7f7, 0xffcf2e, 0xef4e50, 0xa94de8],
  },
  water: {
    id: "water", name: "Coral Bay", subtitle: "Ocean & reef",
    skyTop: 0x31b6fa, skyBottom: 0xbfefff, ground: 0x19b7e8, groundDark: 0x126d9b,
    accent: 0x58e6ff, frame: 0x0a3d70, emptyCell: 0x155c8f,
    piecePalette: [0x21b4ff, 0x3de0c0, 0xffd43b, 0xff6b58, 0x9b58ef],
  },
  ice: {
    id: "ice", name: "Frozen Peaks", subtitle: "Ice & snow",
    skyTop: 0x70c8ff, skyBottom: 0xe9fbff, ground: 0xd9f7ff, groundDark: 0x67a6c7,
    accent: 0xb8f5ff, frame: 0x235480, emptyCell: 0x2f6d96,
    piecePalette: [0x62dfff, 0x7ba8ff, 0xe5f7ff, 0xa4f0ee, 0xb77af2],
  },
  volcano: {
    id: "volcano", name: "Magma Core", subtitle: "Fire & lava",
    skyTop: 0x4a2c44, skyBottom: 0xff7846, ground: 0x3b3b46, groundDark: 0x1d2028,
    accent: 0xffb321, frame: 0x351f2d, emptyCell: 0x4a3844,
    piecePalette: [0xff5a35, 0xff9d1f, 0xffd232, 0x7f4fe8, 0x4a90ff],
  },
  desert: {
    id: "desert", name: "Sunstone", subtitle: "Sand & canyon",
    skyTop: 0x45c2ff, skyBottom: 0xffedbb, ground: 0xe6bb6a, groundDark: 0xa86838,
    accent: 0xffdf78, frame: 0x5a4c3f, emptyCell: 0x6d6152,
    piecePalette: [0xffbd39, 0xe88743, 0x78c65a, 0x4aaef4, 0xae5be8],
  },
  cave: {
    id: "cave", name: "Crystal Cave", subtitle: "Stone & crystal",
    skyTop: 0x17233e, skyBottom: 0x394875, ground: 0x556070, groundDark: 0x292f3b,
    accent: 0x62f0e9, frame: 0x141d34, emptyCell: 0x33425d,
    piecePalette: [0x62e5ff, 0x7c65f2, 0xff5cad, 0x54d47d, 0xffcc48],
  },
};

export function biomeForLevel(level: number): VoxelBiome {
  const order: VoxelBiomeId[] = ["grass", "water", "desert", "ice", "volcano", "cave"];
  const chapter = Math.max(0, Math.min(order.length - 1, Math.floor((Math.max(1, level) - 1) / 5)));
  return VOXEL_BIOMES[order[chapter]];
}

export function shade(color: number, amount: number) {
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  const n = (v: number) => amount >= 0 ? Math.min(255, Math.round(v + (255 - v) * amount)) : Math.max(0, Math.round(v * (1 + amount)));
  return (n(r) << 16) | (n(g) << 8) | n(b);
}

export function addIsoCube(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  color: number,
  alpha = 1,
) {
  const top = shade(color, 0.24);
  const left = shade(color, -0.1);
  const right = shade(color, -0.25);
  const topY = y - height;
  const hw = width / 2, hd = depth / 2;

  g.fillStyle(left, alpha);
  g.beginPath();
  g.moveTo(x - hw, topY + hd);
  g.lineTo(x, topY + depth);
  g.lineTo(x, y + depth);
  g.lineTo(x - hw, y + hd);
  g.closePath();
  g.fillPath();

  g.fillStyle(right, alpha);
  g.beginPath();
  g.moveTo(x, topY + depth);
  g.lineTo(x + hw, topY + hd);
  g.lineTo(x + hw, y + hd);
  g.lineTo(x, y + depth);
  g.closePath();
  g.fillPath();

  g.fillStyle(top, alpha);
  g.beginPath();
  g.moveTo(x, topY);
  g.lineTo(x + hw, topY + hd);
  g.lineTo(x, topY + depth);
  g.lineTo(x - hw, topY + hd);
  g.closePath();
  g.fillPath();

  g.lineStyle(Math.max(1, width * 0.045), shade(color, -0.38), 0.55 * alpha);
  g.strokePoints([
    new Phaser.Math.Vector2(x, topY),
    new Phaser.Math.Vector2(x + hw, topY + hd),
    new Phaser.Math.Vector2(x + hw, y + hd),
    new Phaser.Math.Vector2(x, y + depth),
    new Phaser.Math.Vector2(x - hw, y + hd),
    new Phaser.Math.Vector2(x - hw, topY + hd),
  ], true);
  g.lineStyle(Math.max(1, width * 0.035), 0xffffff, 0.25 * alpha);
  g.lineBetween(x - hw + 2, topY + hd - 1, x, topY + 1);
}

export function voxelGroundTile(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  depth: number,
  color: number,
  sideColor = shade(color, -0.28),
) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x071e2e, 0.16).fillEllipse(0, depth * 0.72, width * 0.95, depth * 0.5);
  g.fillStyle(sideColor, 1);
  g.beginPath();
  g.moveTo(-width / 2, 0); g.lineTo(0, depth / 2); g.lineTo(width / 2, 0);
  g.lineTo(width / 2, 12); g.lineTo(0, depth / 2 + 14); g.lineTo(-width / 2, 12);
  g.closePath(); g.fillPath();
  g.fillStyle(shade(color, 0.12), 1);
  g.beginPath();
  g.moveTo(0, -depth / 2); g.lineTo(width / 2, 0); g.lineTo(0, depth / 2); g.lineTo(-width / 2, 0);
  g.closePath(); g.fillPath();
  g.lineStyle(2, shade(color, 0.34), 0.55).lineBetween(-width / 2 + 2, 0, 0, -depth / 2 + 2);
  c.add(g);
  return c;
}

export function createVoxelTree(scene: Phaser.Scene, x = 0, y = 0, scale = 1, biome: VoxelBiomeId = "grass") {
  const c = scene.add.container(x, y).setScale(scale);
  const g = scene.add.graphics();
  const trunk = biome === "ice" ? 0x7b6c62 : 0x8a552f;
  addIsoCube(g, 0, 0, 16, 9, 32, trunk);
  const leaf = biome === "ice" ? 0xb9efff : biome === "volcano" ? 0x5e3944 : biome === "desert" ? 0x72ad48 : 0x31a84f;
  [[-12,-27],[10,-31],[0,-45],[-2,-20]].forEach(([xx, yy], i) => addIsoCube(g, xx, yy, 30 - (i%2)*3, 17, 24, shade(leaf, (i%3-1)*0.08)));
  c.add(g);
  return c;
}

export function createVoxelBuilding(
  scene: Phaser.Scene,
  kind: "house" | "cafe" | "apartment" | "office" | "lighthouse" | "market" | "tower",
  stage = 1,
  scale = 1,
) {
  const c = scene.add.container(0, 0).setScale(scale);
  const g = scene.add.graphics();
  const cell = 14;
  const baseY = 16;

  const palettes = {
    house: [0xf5d49b, 0xd85549, 0x67c1e7],
    cafe: [0xf6c66f, 0xef624f, 0x2b9bd4],
    apartment: [0x58a9d8, 0xf1e3c9, 0x2f72ad],
    office: [0x4a9fd1, 0xd8f3ff, 0x275f97],
    lighthouse: [0xf4f1e8, 0xf24f44, 0x2e78ab],
    market: [0xf1c16f, 0xef5d52, 0x3bb7a0],
    tower: [0x4ca4c7, 0xc9f6ff, 0x2c6f99],
  } as const;
  const [wall, roof, trim] = palettes[kind];

  const cols = kind === "tower" || kind === "lighthouse" ? 2 : kind === "office" ? 3 : 3;
  const rows = kind === "market" ? 2 : 2;
  const floors = kind === "house" ? 2 : kind === "cafe" || kind === "market" ? 2 + Math.min(stage,1) : kind === "apartment" ? 3 + stage : kind === "office" ? 4 + stage : kind === "lighthouse" ? 5 + stage : 5 + stage * 2;

  for (let z = 0; z < floors; z++) {
    for (let ry = 0; ry < rows; ry++) {
      for (let rx = 0; rx < cols; rx++) {
        const isoX = (rx - ry) * cell * 0.52;
        const isoY = (rx + ry) * cell * 0.26 - z * 10 + baseY;
        const edge = rx === cols - 1 || ry === rows - 1;
        const blockColor = edge ? shade(wall, -0.03) : wall;
        addIsoCube(g, isoX, isoY, cell, cell * 0.55, 11, blockColor);
        if (z > 0 && z < floors - 1 && ((rx + ry + z) % 2 === 0)) {
          g.fillStyle(0xc8f5ff, 0.95);
          g.fillRect(isoX + 1, isoY - 7, 5, 5);
          g.fillStyle(0xffffff, 0.55).fillRect(isoX + 2, isoY - 7, 1, 4);
        }
      }
    }
  }

  // Pixel/block roofs and landmarks.
  if (kind === "house" || kind === "cafe" || kind === "market") {
    const roofY = baseY - floors * 10 - 3;
    for (let i = -2; i <= 2; i++) {
      addIsoCube(g, i * 8, roofY + Math.abs(i) * 3, 18, 10, 10, roof);
    }
  } else if (kind === "lighthouse") {
    addIsoCube(g, 0, baseY - floors * 10 - 8, 28, 16, 12, roof);
    addIsoCube(g, 0, baseY - floors * 10 - 20, 10, 6, 22, trim);
  } else if (kind === "tower") {
    for (let z = 0; z < 3; z++) addIsoCube(g, 0, baseY - floors * 10 - z * 9, 20 - z * 3, 11, 10, z === 2 ? 0xffd34e : trim);
  } else {
    addIsoCube(g, 0, baseY - floors * 10 - 4, cols * cell * 0.8, rows * cell * 0.44, 9, roof);
  }

  if (kind === "cafe" || kind === "market") {
    const awningY = baseY - Math.max(10, floors * 3);
    for (let i = -2; i <= 2; i++) {
      addIsoCube(g, i * 10, awningY, 12, 7, 6, i % 2 ? 0xffffff : roof);
    }
  }

  c.add(g);
  return c;
}

export function createVoxelCharacter(scene: Phaser.Scene, x: number, y: number, id: string, size = 64) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  const scale = size / 64;
  const cap = id === "planner" ? 0xb24be5 : id === "worker" ? 0xffc52e : id === "mechanic" ? 0x2d83df : id === "chef" || id === "sailor" ? 0xf4f7ff : id === "tourist" ? 0xe8a634 : 0xef4d43;
  const shirt = id === "planner" ? 0xb96ae8 : id === "worker" ? 0xf08f22 : id === "chef" ? 0xef5149 : 0x238fe1;
  // Pixel/voxel portrait built from rectangles only.
  g.fillStyle(0x4f3025).fillRect(15, 18, 34, 26);
  g.fillStyle(0xffd0a7).fillRect(19, 22, 27, 24);
  g.fillStyle(0x4f3025).fillRect(15, 18, 8, 15).fillRect(40, 18, 9, 14).fillRect(24, 17, 8, 7);
  g.fillStyle(cap).fillRect(13, 8, 38, 16).fillRect(8, 20, 48, 7);
  g.fillStyle(shade(cap, 0.2)).fillRect(17, 9, 10, 4);
  g.fillStyle(0x2a2520).fillRect(25, 31, 4, 7).fillRect(38, 31, 4, 7);
  g.fillStyle(0xf0675c).fillRect(31, 41, 8, 4);
  g.fillStyle(shirt).fillRect(16, 47, 36, 14);
  g.fillStyle(0xffffff, 0.65).fillRect(24, 49, 5, 10);
  c.add(g);
  c.setScale(scale);
  return c;
}

export function createVoxelLogo(scene: Phaser.Scene, x: number, y: number, scale = 1) {
  const c = scene.add.container(x, y).setScale(scale);
  const shadow = scene.add.text(3, 7, "BLOCK\nCITY", {
    fontFamily: '"Arial Black", Impact, system-ui',
    fontSize: "64px",
    fontStyle: "bold",
    align: "center",
    color: "#063a78",
    stroke: "#063a78",
    strokeThickness: 14,
  }).setOrigin(0.5);
  const top = scene.add.text(0, 0, "BLOCK\nCITY", {
    fontFamily: '"Arial Black", Impact, system-ui',
    fontSize: "64px",
    fontStyle: "bold",
    align: "center",
    color: "#ffffff",
    stroke: "#0a4b95",
    strokeThickness: 8,
  }).setOrigin(0.5);
  // Tint CITY gold with a separate overlay for a block-logo feel.
  const city = scene.add.text(0, 36, "CITY", {
    fontFamily: '"Arial Black", Impact, system-ui',
    fontSize: "64px",
    fontStyle: "bold",
    color: "#ffc72f",
    stroke: "#9b5b00",
    strokeThickness: 7,
  }).setOrigin(0.5);
  c.add([shadow, top, city]);
  return c;
}

export function drawVoxelBiomeBackdrop(scene: Phaser.Scene, biome: VoxelBiome, width: number, height: number) {
  const g = scene.add.graphics();
  const bands = 24;
  for (let i = 0; i < bands; i++) {
    const t = i / (bands - 1);
    const color = (channel: number) => {
      const a = (biome.skyTop >> channel) & 255, b = (biome.skyBottom >> channel) & 255;
      return Math.round(a + (b - a) * t);
    };
    g.fillStyle((color(16) << 16) | (color(8) << 8) | color(0), 1).fillRect(0, i * height / bands, width, height / bands + 1);
  }

  // Block clouds / smoke.
  const cloudColor = biome.id === "volcano" ? 0x7b5962 : 0xffffff;
  const cloudAlpha = biome.id === "cave" ? 0.08 : 0.65;
  [[18,105,1],[282,151,.75],[55,272,.55]].forEach(([x,y,s]) => {
    const ss = Number(s);
    g.fillStyle(cloudColor, cloudAlpha);
    g.fillRect(Number(x), Number(y), 42*ss, 12*ss);
    g.fillRect(Number(x)+10*ss, Number(y)-10*ss, 30*ss, 14*ss);
    g.fillRect(Number(x)+28*ss, Number(y)-4*ss, 24*ss, 14*ss);
  });

  if (biome.id === "volcano") {
    g.fillStyle(0x241d28, 1);
    g.fillTriangle(0, 430, 115, 238, 225, 430);
    g.fillTriangle(130, 430, 292, 210, width, 430);
    g.fillStyle(0xff5a20, 0.95);
    g.beginPath(); g.moveTo(105, 286); g.lineTo(119, 251); g.lineTo(130, 292); g.lineTo(121, 357); g.closePath(); g.fillPath();
    g.beginPath(); g.moveTo(284, 258); g.lineTo(294, 221); g.lineTo(305, 270); g.lineTo(292, 355); g.closePath(); g.fillPath();
  } else if (biome.id === "ice") {
    g.fillStyle(0xbcecff, 0.9);
    g.fillTriangle(0, 425, 95, 250, 190, 425);
    g.fillTriangle(135, 425, 290, 215, width, 425);
    g.fillStyle(0xffffff, 0.92);
    g.fillTriangle(59, 316, 95, 250, 130, 316);
    g.fillTriangle(244, 279, 290, 215, 331, 280);
  } else if (biome.id === "water") {
    g.fillStyle(0x15aee7, 0.82).fillRect(0, 330, width, height - 330);
    for (let i=0;i<8;i++) g.fillStyle(0xffffff,0.16).fillRect((i*57)%width,360+i*39,48,3);
  } else if (biome.id === "desert") {
    g.fillStyle(0xd99d5a, 0.8);
    g.fillTriangle(0, 410, 92, 300, 185, 410);
    g.fillTriangle(130, 410, 281, 275, width, 410);
  } else if (biome.id === "cave") {
    g.fillStyle(0x12192c, 0.8).fillRect(0, 250, width, height-250);
    [45,130,215,310].forEach((x,i)=> {
      g.fillStyle([0x47dbe7,0x9c63f0,0xff62b2,0x5ae193][i],0.7);
      g.fillTriangle(x, 360, x+15, 310, x+30, 360);
    });
  } else {
    g.fillStyle(0x55b960, 0.78);
    g.fillTriangle(0, 430, 90, 300, 180, 430);
    g.fillTriangle(140, 430, 286, 275, width, 430);
  }
  return g;
}
