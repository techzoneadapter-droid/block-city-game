import Phaser from "phaser";

export const W = 390;
export const H = 844;

export const COLORS = {
  ink: 0x07131b,
  panel: 0x0e2028,
  panel2: 0x132a32,
  mint: 0x41dfaa,
  mintDark: 0x1a9b75,
  cyan: 0x6fe6ef,
  cream: 0xf6f1e4,
  muted: 0x8ea5ad,
  gold: 0xffce67,
  coral: 0xff8e77,
  violet: 0xa995ff,
  road: 0x263941,
};

export function addGradientBackground(scene: Phaser.Scene, top = 0x071720, bottom = 0x061016) {
  const g = scene.add.graphics();
  const bands = 32;
  for (let i = 0; i < bands; i += 1) {
    const t = i / (bands - 1);
    const tr = (top >> 16) & 255;
    const tg = (top >> 8) & 255;
    const tb = top & 255;
    const br = (bottom >> 16) & 255;
    const bg = (bottom >> 8) & 255;
    const bb = bottom & 255;
    const r = Math.round(tr + (br - tr) * t);
    const gg = Math.round(tg + (bg - tg) * t);
    const b = Math.round(tb + (bb - tb) * t);
    g.fillStyle((r << 16) | (gg << 8) | b, 1);
    g.fillRect(0, Math.floor((H / bands) * i), W, Math.ceil(H / bands) + 1);
  }

  scene.add.circle(72, 118, 120, COLORS.mint, 0.045);
  scene.add.circle(344, 220, 130, COLORS.cyan, 0.035);
  return g;
}

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = "#f6f1e4",
  weight = "700",
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: 'Inter, "SF Pro Rounded", system-ui, sans-serif',
      fontSize: `${size}px`,
      fontStyle: weight === "800" ? "bold" : weight === "700" ? "bold" : "normal",
      color,
      align: "center",
    })
    .setOrigin(0.5);
}

export function pill(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  icon: string,
  value: string,
) {
  const c = scene.add.container(x, y);
  const bg = scene.add.rectangle(0, 0, width, 40, COLORS.panel, 0.92).setStrokeStyle(1, 0x24434b, 0.9);
  const ico = text(scene, -width / 2 + 19, 0, icon, 16, "#f6f1e4");
  const title = scene.add.text(-width / 2 + 33, -9, label, {
    fontFamily: "Inter, system-ui",
    fontSize: "8px",
    fontStyle: "bold",
    color: "#78939d",
  });
  const val = scene.add.text(-width / 2 + 33, 2, value, {
    fontFamily: "Inter, system-ui",
    fontSize: "13px",
    fontStyle: "bold",
    color: "#f6f1e4",
  });
  c.add([bg, ico, title, val]);
  return c;
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  color = COLORS.mintDark,
) {
  const c = scene.add.container(x, y);
  const shadow = scene.add.rectangle(0, 5, width, height, 0x000000, 0.26);
  const bg = scene.add.rectangle(0, 0, width, height, color, 1).setStrokeStyle(1, 0xffffff, 0.08);
  const labelText = text(scene, 0, -1, label, 15, "#ffffff", "800");
  c.add([shadow, bg, labelText]);
  c.setSize(width, height);
  c.setInteractive({ useHandCursor: true });
  c.on("pointerover", () => scene.tweens.add({ targets: c, scaleX: 1.025, scaleY: 1.025, duration: 90 }));
  c.on("pointerout", () => scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 90 }));
  c.on("pointerdown", () => scene.tweens.add({ targets: c, scaleX: 0.97, scaleY: 0.97, duration: 60 }));
  c.on("pointerup", () => {
    scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, duration: 90 });
    onClick();
  });
  return c;
}

export function drawIsoTile(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
  color: number,
  alpha = 1,
) {
  g.fillStyle(color, alpha);
  g.beginPath();
  g.moveTo(x, y - h / 2);
  g.lineTo(x + w / 2, y);
  g.lineTo(x, y + h / 2);
  g.lineTo(x - w / 2, y);
  g.closePath();
  g.fillPath();
}

export function drawBuilding(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  front: number,
  side: number,
  roof: number,
) {
  const topY = y - height;

  g.fillStyle(front, 1);
  g.beginPath();
  g.moveTo(x, topY + depth / 2);
  g.lineTo(x + width / 2, topY + depth);
  g.lineTo(x + width / 2, y + depth);
  g.lineTo(x, y + depth / 2);
  g.closePath();
  g.fillPath();

  g.fillStyle(side, 1);
  g.beginPath();
  g.moveTo(x - width / 2, topY + depth);
  g.lineTo(x, topY + depth / 2);
  g.lineTo(x, y + depth / 2);
  g.lineTo(x - width / 2, y + depth);
  g.closePath();
  g.fillPath();

  g.fillStyle(roof, 1);
  g.beginPath();
  g.moveTo(x, topY);
  g.lineTo(x + width / 2, topY + depth / 2);
  g.lineTo(x, topY + depth);
  g.lineTo(x - width / 2, topY + depth / 2);
  g.closePath();
  g.fillPath();
}
