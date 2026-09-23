import Phaser from "phaser";

export const W = 390;
export const H = 844;

/** Shared visual tokens for the bright, toy-like Block City UI. */
export const COLORS = {
  ink: 0x123767,
  inkDark: 0x082954,
  text: 0x163b6a,
  textSoft: 0x58779a,
  muted: 0x7895b2,
  panel: 0xffffff,
  panel2: 0xeaf7ff,
  panelBlue: 0xd8f0ff,
  primary: 0x1688ed,
  primaryDark: 0x0759b8,
  secondary: 0x20b9df,
  mint: 0x43d77c,
  mintDark: 0x12a95b,
  cyan: 0x4bd9f2,
  cream: 0xfffbec,
  gold: 0xffca28,
  goldDark: 0xf28b18,
  coral: 0xff665f,
  violet: 0xb565ef,
  road: 0x63768b,
  success: 0x24c86a,
  warning: 0xffa31a,
  danger: 0xff5f63,
  info: 0x2c9cff,
  outline: 0xa9d9f3,
  shadow: 0x0754a0,
};

export const UI = { margin: 18, radius: 16, radiusSmall: 11, cardShadowY: 5 };

function mixColor(from: number, to: number, t: number) {
  const fr = (from >> 16) & 255;
  const fg = (from >> 8) & 255;
  const fb = from & 255;
  const tr = (to >> 16) & 255;
  const tg = (to >> 8) & 255;
  const tb = to & 255;
  return (Math.round(fr + (tr - fr) * t) << 16) |
    (Math.round(fg + (tg - fg) * t) << 8) |
    Math.round(fb + (tb - fb) * t);
}

/** Bright coastal base used by every screen so transitions feel like one game. */
export function addGradientBackground(scene: Phaser.Scene, top = 0x42bdf5, bottom = 0xdff8ff) {
  const g = scene.add.graphics();
  const bands = 40;
  for (let i = 0; i < bands; i += 1) {
    g.fillStyle(mixColor(top, bottom, i / (bands - 1)), 1);
    g.fillRect(0, Math.floor((H / bands) * i), W, Math.ceil(H / bands) + 1);
  }

  const cloud = (x: number, y: number, scale: number) => {
    g.fillStyle(0xffffff, 0.5);
    g.fillCircle(x, y, 18 * scale);
    g.fillCircle(x + 20 * scale, y - 7 * scale, 25 * scale);
    g.fillCircle(x + 47 * scale, y + 1 * scale, 17 * scale);
    g.fillRoundedRect(x - 8 * scale, y, 70 * scale, 18 * scale, 9 * scale);
  };
  cloud(-15, 112, 0.8);
  cloud(298, 154, 0.72);
  cloud(58, 300, 0.46);

  g.fillStyle(0x60bfbd, 0.15);
  g.beginPath();
  g.moveTo(0, 422);
  g.lineTo(74, 372);
  g.lineTo(146, 411);
  g.lineTo(240, 355);
  g.lineTo(390, 414);
  g.lineTo(390, 520);
  g.lineTo(0, 520);
  g.closePath();
  g.fillPath();

  for (let i = 0; i < 5; i += 1) {
    g.lineStyle(2, 0xffffff, 0.16 - i * 0.02);
    g.beginPath();
    g.moveTo(18 + i * 9, 530 + i * 57);
    g.lineTo(108, 519 + i * 57);
    g.lineTo(206, 531 + i * 57);
    g.lineTo(302, 542 + i * 57);
    g.lineTo(385, 527 + i * 57);
    g.strokePath();
  }
  return g;
}

export function text(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = "#123767",
  weight = "700",
) {
  return scene.add.text(x, y, value, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui, sans-serif',
    fontSize: `${size}px`,
    fontStyle: weight === "800" || weight === "700" ? "bold" : "normal",
    color,
    align: "center",
  }).setOrigin(0.5);
}

export type PanelOptions = {
  fill?: number;
  stroke?: number;
  alpha?: number;
  radius?: number;
  shadow?: boolean;
  shadowColor?: number;
  shadowAlpha?: number;
};

export function panel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  options: PanelOptions = {},
) {
  const container = scene.add.container(x, y);
  const radius = options.radius ?? UI.radius;
  if (options.shadow !== false) {
    const shadow = scene.add.graphics();
    shadow.fillStyle(options.shadowColor ?? COLORS.shadow, options.shadowAlpha ?? 0.18);
    shadow.fillRoundedRect(-width / 2, -height / 2 + UI.cardShadowY, width, height, radius);
    container.add(shadow);
  }
  const body = scene.add.graphics();
  body.fillStyle(options.fill ?? COLORS.panel, options.alpha ?? 0.96);
  body.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  body.lineStyle(2, options.stroke ?? COLORS.outline, 0.95);
  body.strokeRoundedRect(-width / 2, -height / 2, width, height, radius);
  container.add(body);
  return container;
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
  const c = panel(scene, x, y, width, 40, { fill: 0xffffff, stroke: 0x87d6f5, radius: 12, shadowAlpha: 0.15 });
  const isStar = icon === "★";
  const iconBg = scene.add.circle(-width / 2 + 20, -1, 13, isStar ? COLORS.violet : COLORS.gold, 1)
    .setStrokeStyle(2, isStar ? 0x8e45c9 : COLORS.goldDark, 1);
  const ico = text(scene, -width / 2 + 20, -1, icon, 13, isStar ? "#ffffff" : "#fff9cf", "800");
  const title = scene.add.text(-width / 2 + 39, -11, label, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui',
    fontSize: "7px",
    fontStyle: "bold",
    color: "#6686a7",
  });
  const val = scene.add.text(-width / 2 + 39, 0, value, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui',
    fontSize: "13px",
    fontStyle: "bold",
    color: "#123767",
  });
  c.add([iconBg, ico, title, val]);
  return c;
}

export type ButtonStyle = "primary" | "secondary" | "success" | "gold" | "danger" | "muted";

function buttonColors(color: number, style?: ButtonStyle) {
  if (style === "gold" || color === COLORS.gold || color === COLORS.goldDark || color === 0x8a682d) {
    return { top: 0xffdf3d, bottom: 0xffb316, edge: 0xf27c0b, text: "#113467" };
  }
  if (style === "success" || color === COLORS.mintDark || color === COLORS.success) {
    return { top: 0x42df77, bottom: 0x16b955, edge: 0x087f3e, text: "#ffffff" };
  }
  if (style === "danger") return { top: 0xff7773, bottom: 0xed494f, edge: 0xb52b37, text: "#ffffff" };
  if (style === "muted") return { top: 0xaac2d3, bottom: 0x829bae, edge: 0x587184, text: "#ffffff" };
  if (style === "secondary") return { top: 0x35c9ef, bottom: 0x1199da, edge: 0x0870b7, text: "#ffffff" };
  return { top: 0x2aa8ff, bottom: color === COLORS.primary ? 0x147de1 : color, edge: 0x0758ad, text: "#ffffff" };
}

export function button(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  height: number,
  label: string,
  onClick: () => void,
  color = COLORS.primary,
  style?: ButtonStyle,
) {
  const c = scene.add.container(x, y);
  const radius = Math.min(17, height * 0.32);
  const palette = buttonColors(color, style);
  const shadow = scene.add.graphics();
  shadow.fillStyle(palette.edge, 1);
  shadow.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, radius);
  const bg = scene.add.graphics();
  bg.fillGradientStyle(palette.top, palette.top, palette.bottom, palette.bottom, 1);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  bg.lineStyle(2, 0xffffff, 0.7);
  bg.strokeRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 3, radius - 1);
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.18);
  shine.fillRoundedRect(-width / 2 + 8, -height / 2 + 5, width - 16, Math.max(5, height * 0.22), radius * 0.5);
  const labelText = text(scene, 0, -1, label, height >= 50 ? 15 : 12, palette.text, "800");
  labelText.setShadow(0, 1, style === "gold" || color === 0x8a682d ? "#ffffff" : "#06376b", 0, false, true);
  c.add([shadow, bg, shine, labelText]);
  c.setSize(width, height + 5).setInteractive({ useHandCursor: true });
  c.on("pointerover", () => scene.tweens.add({ targets: c, scaleX: 1.025, scaleY: 1.025, duration: 90 }));
  c.on("pointerout", () => scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, y, duration: 90 }));
  c.on("pointerdown", () => scene.tweens.add({ targets: c, scaleX: 0.97, scaleY: 0.97, y: y + 3, duration: 60 }));
  c.on("pointerup", () => {
    scene.tweens.add({ targets: c, scaleX: 1, scaleY: 1, y, duration: 100, ease: "Back.Out" });
    onClick();
  });
  return c;
}

export function progressBar(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  progress: number,
  color = COLORS.mint,
  height = 10,
) {
  const value = Phaser.Math.Clamp(progress, 0, 1);
  const track = scene.add.graphics();
  track.fillStyle(0xb9d5e8, 0.65);
  track.fillRoundedRect(x, y - height / 2, width, height, height / 2);
  track.lineStyle(1, 0x7fb4d4, 0.6);
  track.strokeRoundedRect(x, y - height / 2, width, height, height / 2);
  if (value > 0) {
    track.fillStyle(color, 1);
    track.fillRoundedRect(x + 2, y - height / 2 + 2, Math.max(height - 4, (width - 4) * value), height - 4, (height - 4) / 2);
    track.fillStyle(0xffffff, 0.38);
    track.fillRoundedRect(x + 5, y - height / 2 + 3, Math.max(3, (width - 12) * value), 2, 1);
  }
  return track;
}

export function sectionLabel(scene: Phaser.Scene, x: number, y: number, label: string, color = "#1a69b8") {
  const caption = scene.add.text(x, y, label, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui',
    fontSize: "10px",
    fontStyle: "bold",
    color,
    letterSpacing: 0.7,
  });
  caption.setShadow(0, 1, "#ffffff", 0, false, true);
  return caption;
}

export function iconBubble(scene: Phaser.Scene, x: number, y: number, icon: string, color = COLORS.primary, radius = 20) {
  const shadow = scene.add.circle(x, y + 3, radius, COLORS.shadow, 0.22);
  const bubble = scene.add.circle(x, y, radius, color, 1).setStrokeStyle(2, 0xffffff, 0.8);
  const symbol = text(scene, x, y - 1, icon, radius * 0.82, "#ffffff", "800");
  return { shadow, bubble, symbol };
}

export function drawIsoTile(g: Phaser.GameObjects.Graphics, x: number, y: number, w: number, h: number, color: number, alpha = 1) {
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
  g.fillStyle(0x0a4c75, 0.15);
  g.fillEllipse(x, y + depth + 5, width * 0.9, depth * 0.7);

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

  g.lineStyle(1.5, 0xffffff, 0.34);
  g.beginPath();
  g.moveTo(x, topY);
  g.lineTo(x + width / 2, topY + depth / 2);
  g.lineTo(x, topY + depth);
  g.strokePath();
}
