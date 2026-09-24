import { glossyFace, referenceArt } from './referenceArt';
import { loadSave, updateSave } from "./save";
import { profileLevelFromXp } from "./progression";
import { audio } from "./audio";
import Phaser from "phaser";
import { coastTexture } from "./home/art";

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
  gold: 0xffd62d,
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
  weight = size >= 15 ? "700" : "500",
) {
  return scene.add.text(x, y, value, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui, sans-serif',
    fontSize: `${Math.max(11, size)}px`,
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
  const fill = options.fill ?? COLORS.panel;
  const stroke = options.stroke ?? COLORS.outline;

  if (options.shadow !== false) {
    const shadow = scene.add.graphics();
    shadow.fillStyle(options.shadowColor ?? 0x073f79, options.shadowAlpha ?? 0.2);
    shadow.fillRoundedRect(-width / 2 + 1, -height / 2 + UI.cardShadowY + 1, width - 2, height, radius + 1);
    container.add(shadow);
  }

  // Bottom extrusion gives every card the toy-like 2.5D thickness from the UI sheet.
  const extrusion = scene.add.graphics();
  const extrusionColor = stroke === 0xffffff ? 0x8fc7dd : stroke;
  extrusion.fillStyle(extrusionColor, 0.92);
  extrusion.fillRoundedRect(-width / 2, -height / 2 + 3, width, height, radius);
  container.add(extrusion);

  const body = scene.add.graphics();
  body.fillStyle(fill, options.alpha ?? 0.98);
  body.fillRoundedRect(-width / 2, -height / 2, width, Math.max(1, height - 4), radius);
  body.lineStyle(2, stroke, 0.98);
  body.strokeRoundedRect(-width / 2, -height / 2, width, Math.max(1, height - 4), radius);
  body.lineStyle(2, 0xffffff, 0.72);
  body.strokeRoundedRect(
    -width / 2 + 3,
    -height / 2 + 3,
    width - 6,
    Math.max(1, height - 10),
    Math.max(3, radius - 3),
  );

  // A restrained top sheen keeps panels readable without turning them into glass.
  body.fillStyle(0xffffff, 0.1);
  body.fillRoundedRect(-width / 2 + 7, -height / 2 + 5, width - 14, Math.min(11, height * 0.18), Math.max(3, radius * 0.45));
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
  const c = panel(scene, x, y, width, 36, { fill: 0x075caf, stroke: 0x3ec9ff, radius: 11, shadowAlpha: 0.2 });
  const display = text(scene, 12, -1, Number(value).toLocaleString('en'), 16, '#ffffff');
  if (display.width > width - 34) display.setScale((width - 34) / display.width);
  c.add([gameIcon(scene, -width / 2 + 15, -1, icon === '★' ? 'star' : 'coin', 31), display]);
  return c;
}

export type ButtonStyle = "primary" | "secondary" | "success" | "gold" | "danger" | "muted";

function buttonColors(color: number, style?: ButtonStyle) {
  if (style === "muted") return { top: 0xcbd4df, bottom: 0x8b9aaf, edge: 0x53627a, text: "#34445c" };
  if (style === "gold" || color === COLORS.gold || color === COLORS.goldDark || color === 0x8a682d) {
    return { top: 0xffff45, bottom: 0xffb719, edge: 0xb85308, text: "#113467" };
  }
  if (style === "success" || color === COLORS.mintDark || color === COLORS.success) {
    return { top: 0x42df77, bottom: 0x16b955, edge: 0x087f3e, text: "#ffffff" };
  }
  if (style === "danger") return { top: 0xff7773, bottom: 0xed494f, edge: 0xb52b37, text: "#ffffff" };
  if (style === "secondary") return { top: 0x35c9ef, bottom: 0x1199da, edge: 0x0870b7, text: "#ffffff" };
  return { top: 0x08bcff, bottom: color === COLORS.primary ? 0x0064f7 : color, edge: 0x0758ad, text: "#ffffff" };
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
  const root = scene.add.container(x, y);
  const radius = Math.min(style === "gold" ? 24 : 20, height * 0.34);
  const palette = buttonColors(color, style);
  const extrusionY = style === "gold" ? 8 : 5;

  const contact = scene.add.graphics();
  contact.fillStyle(0x052d59, 0.28);
  contact.fillRoundedRect(-width / 2 + 3, -height / 2 + extrusionY + 7, width - 6, height, radius + 1);

  const extrusion = scene.add.graphics();
  extrusion.fillStyle(palette.edge, 1);
  extrusion.fillRoundedRect(-width / 2, -height / 2 + extrusionY, width, height, radius);

  const face = scene.add.container(0, 0);
  const outline = scene.add.graphics();
  outline.lineStyle(style === "gold" ? 4 : 3, style === "gold" ? 0x073c80 : 0x064d9c, 1);
  outline.strokeRoundedRect(-width / 2 - 1, -height / 2 - 1, width + 2, height + 2, radius + 1);
  const bg = glossyFace(scene, width, height, radius, palette.top, palette.bottom);
  const inner = scene.add.graphics();
  inner.lineStyle(2, 0xffffff, style === "muted" ? 0.34 : 0.7);
  inner.strokeRoundedRect(-width / 2 + 4, -height / 2 + 4, width - 8, height - 9, Math.max(4, radius - 4));
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, style === "muted" ? 0.08 : 0.18);
  shine.fillRoundedRect(-width / 2 + 9, -height / 2 + 6, width - 18, Math.max(5, height * 0.2), Math.max(4, radius * 0.45));

  const labelText = text(scene, 0, -1, label, height >= 50 ? 18 : 12, palette.text, "800");
  labelText.setName("button-label");
  if (labelText.width > width - 20) {
    labelText.setFontSize(Math.max(10, Math.floor((width - 20) / labelText.width * (height >= 50 ? 18 : 12))));
  }
  labelText.setShadow(0, 2, style === "gold" ? "#fff5a3" : "#06376b", style === "gold" ? 0 : 1, false, true);

  face.add([outline, bg, inner, shine, labelText]);
  root.add([contact, extrusion, face]);
  root.setData("labelText", labelText);
  root.setData("buttonFace", face);
  root.setSize(width, Math.max(44, height + extrusionY)).setInteractive({ useHandCursor: true });

  let pressed = false;
  const release = () => {
    pressed = false;
    scene.tweens.killTweensOf(face);
    scene.tweens.add({ targets: face, y: 0, scaleX: 1, scaleY: 1, duration: 120, ease: "Back.Out" });
    contact.setAlpha(1);
  };

  root.on("pointerover", () => {
    if (!pressed) scene.tweens.add({ targets: face, scaleX: 1.018, scaleY: 1.018, duration: 90 });
  });
  root.on("pointerout", release);
  root.on("pointerdown", () => {
    pressed = true;
    scene.tweens.killTweensOf(face);
    scene.tweens.add({ targets: face, y: extrusionY - 1, scaleX: 0.985, scaleY: 0.97, duration: 65, ease: "Sine.Out" });
    contact.setAlpha(0.55);
  });
  root.on("pointerup", () => {
    const activate = pressed;
    release();
    if (activate) onClick();
  });
  return root;
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

  // The shared bars use a shallow toy-like recess and highlight so XP,
  // mission, event and district progress all read as the same component.
  track.fillStyle(0x2f6f9c, 0.2);
  track.fillRoundedRect(x, y - height / 2 + 2, width, height, height / 2);
  track.fillStyle(0xc8e3ef, 0.9);
  track.fillRoundedRect(x, y - height / 2, width, height, height / 2);
  track.lineStyle(1, 0x73acd0, 0.72);
  track.strokeRoundedRect(x, y - height / 2, width, height, height / 2);
  track.fillStyle(0xffffff, 0.42);
  track.fillRoundedRect(x + 2, y - height / 2 + 1, width - 4, 2, 1);

  if (value > 0) {
    const fillWidth = Math.max(height - 4, (width - 4) * value);
    track.fillStyle(color, 1);
    track.fillRoundedRect(x + 2, y - height / 2 + 2, fillWidth, height - 4, (height - 4) / 2);
    track.fillStyle(0xffffff, 0.42);
    track.fillRoundedRect(x + 5, y - height / 2 + 3, Math.max(3, fillWidth - 7), 2, 1);
  }
  return track;
}

export function sectionLabel(scene: Phaser.Scene, x: number, y: number, label: string, color = "#1a69b8") {
  const root = scene.add.container(x, y);
  const caption = scene.add.text(12, 0, label, {
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui',
    fontSize: "11px",
    fontStyle: "bold",
    color,
    letterSpacing: 0.6,
  }).setOrigin(0, 0.5);

  const width = Math.max(118, caption.width + 28);
  const bg = scene.add.graphics();
  bg.fillStyle(0x0b5ca6, 0.14);
  bg.fillRoundedRect(0, -11, width, 22, 9);
  bg.fillStyle(0xe8f8ff, 0.98);
  bg.fillRoundedRect(0, -13, width, 21, 9);
  bg.lineStyle(1, 0x8dddf8, 0.95);
  bg.strokeRoundedRect(0, -13, width, 21, 9);
  bg.fillStyle(0x24bdf2, 1);
  bg.fillRoundedRect(4, -8, 4, 12, 2);
  bg.fillStyle(0xffffff, 0.56);
  bg.fillRoundedRect(11, -10, width - 18, 2, 1);

  root.add([bg, caption]);
  return root;
}

export function iconBubble(scene: Phaser.Scene, x: number, y: number, icon: string, color = COLORS.primary, radius = 20) {
  const shadow = scene.add.circle(x, y + 3, radius, COLORS.shadow, 0.22);
  const bubble = scene.add.circle(x, y, radius, color, 1).setStrokeStyle(2, 0xffffff, 0.8);
  const symbol = gameIcon(scene, x, y - 1, icon, radius * 1.55);
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

/** One cached toy-icon family; no platform-dependent emoji in navigation or rewards. */
export function gameIcon(scene: Phaser.Scene, x: number, y: number, name: string, size = 40) {
  const aliases: Record<string, string> = { '🏗': 'city', '🏙': 'city', '🏡': 'city', '🏛': 'city', '⛵': 'city', '🌿': 'city', '🧩': 'puzzle', '🎁': 'chest', '🔑': 'chest', '🏆': 'trophy', '🏅': 'trophy', '🔒': 'lock', '🔨': 'hammer', '↻': 'shuffle', '▰': 'line', '⚙': 'settings' };
  const kind = aliases[name] ?? name;
  const portrait = referenceArt(scene, x, y, kind, size);
  if (portrait) return portrait;
  const supported = ['city', 'puzzle', 'chest', 'trophy', 'lock', 'hammer', 'shuffle', 'line', 'settings', 'builder', 'planner', 'worker', 'chef', 'sailor', 'mechanic', 'tourist', 'corgi', 'hat', 'shop', 'friends', 'coin', 'star'];
  if (!supported.includes(kind)) return text(scene, x, y, name, size * 0.65, '#ffffff');
  const key = `toy-icon-${kind}-v2`;
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0 });
    const box = (xx: number, yy: number, w: number, h: number, color: number, radius = 5) => {
      g.fillStyle(0x063d79, 0.65).fillRoundedRect(xx, yy + 3, w, h, radius);
      g.fillStyle(color).fillRoundedRect(xx, yy, w, h, radius);
      g.lineStyle(1.5, 0xffffff, 0.65).strokeRoundedRect(xx + 1, yy + 1, w - 2, h - 2, radius);
    };
    if (kind === 'city') {
      box(6, 44, 52, 11, 0x81d842); box(12, 22, 20, 28, 0xffc663); box(31, 9, 22, 41, 0x229cef);
      for (let row = 0; row < 3; row++) for (let col = 0; col < 2; col++) box(35 + col * 8, 16 + row * 10, 5, 6, 0xe8fbff, 1);
      box(17, 28, 9, 10, 0x178ada, 1);
    } else if (kind === 'chest') {
      box(8, 22, 48, 32, 0xf39a19); box(6, 13, 52, 21, 0xffd438);
      box(17, 14, 7, 39, 0xffe673, 1); box(40, 14, 7, 39, 0xffe673, 1); box(27, 28, 12, 15, 0x25b9f2, 3);
    } else if (kind === 'trophy') {
      g.lineStyle(5, 0xffcf32).strokeCircle(15, 23, 9).strokeCircle(49, 23, 9);
      box(18, 9, 28, 29, 0xffd432, 9); box(28, 37, 8, 12, 0xffb427, 2); box(18, 49, 28, 7, 0xffd432, 2);
    } else if (['builder', 'planner', 'worker', 'chef', 'sailor', 'mechanic', 'tourist'].includes(kind)) {
      const cap = kind === 'planner' ? 0xad46ed : kind === 'worker' || kind === 'tourist' ? 0xffca23 : kind === 'mechanic' ? 0x167bea : kind === 'chef' || kind === 'sailor' ? 0xf3faff : 0xf64c37;
      box(12, 46, 40, 17, kind === 'planner' ? 0xb356e9 : 0x138cff, 5);
      box(8, 18, 48, 36, 0x573225, 6);
      box(15, 24, 35, 29, 0xffd2a9, 5);
      g.fillStyle(0xffe3c6).fillRect(18, 27, 27, 10);
      g.fillStyle(0x613a2b).fillRect(15, 24, 8, 12).fillRect(24, 24, 8, 7).fillRect(39, 24, 10, 9);
      box(11, 5, 42, 21, cap, 5); box(7, 21, 52, 7, cap, 2);
      g.fillStyle(0xffffff, 0.6).fillRect(19, 7, 7, 13);
      g.fillStyle(0x38291f).fillRect(32, 11, 8, 7).fillRect(34, 8, 4, 5);
      g.fillStyle(0x30251e).fillRoundedRect(23, 34, 4, 9, 1).fillRoundedRect(39, 34, 4, 9, 1);
      g.fillStyle(0xef6c65).fillRoundedRect(29, 44, 9, 6, 2);
      g.fillStyle(0xffffff).fillRect(30, 44, 7, 2);
      g.fillStyle(0xffffff, 0.45).fillRect(26, 53, 4, 9).fillRect(40, 53, 4, 9);
    } else if (kind === 'corgi') {
      box(10, 8, 13, 25, 0xf9ad20, 2); box(42, 8, 13, 25, 0xf9ad20, 2);
      box(12, 24, 42, 31, 0xffb52d, 6); box(23, 33, 20, 24, 0xfff7dc, 5);
      g.fillStyle(0x30251e).fillRect(20, 32, 5, 7).fillRect(43, 32, 5, 7).fillRoundedRect(28, 39, 11, 7, 3);
      box(15, 54, 37, 5, 0xf64c37, 2);
    } else if (kind === 'hat') {
      g.fillStyle(0xa76a00).fillEllipse(32, 50, 58, 15);
      g.fillStyle(0xffbe08).fillRoundedRect(9, 17, 46, 34, 19);
      g.fillStyle(0xffe340).fillRoundedRect(15, 15, 32, 31, 14);
      box(28, 10, 9, 38, 0xffcf23, 3); box(4, 45, 57, 9, 0xffd529, 4);
    } else if (kind === 'shop') {
      box(12, 22, 42, 34, 0xffdb8a, 4); box(26, 36, 12, 20, 0x13aaff, 2);
      box(15, 36, 9, 12, 0x83e6ff, 1); box(41, 36, 9, 12, 0x83e6ff, 1);
      for (let i = 0; i < 5; i++) box(7 + i * 10, 13, 10, 19, i % 2 ? 0xffffff : 0xff5b4d, 3);
      box(7, 54, 52, 5, 0xffbb20, 2);
    } else if (kind === 'friends') {
      g.fillStyle(0x0b75bd).fillCircle(44, 22, 12).fillRoundedRect(30, 35, 30, 23, 10);
      g.fillStyle(0x81e4ff).fillCircle(43, 20, 11).fillRoundedRect(30, 33, 27, 22, 10);
      g.fillStyle(0xc8f6ff).fillCircle(22, 22, 12).fillRoundedRect(6, 36, 32, 22, 10);
      g.lineStyle(2, 0xffffff, 0.8).strokeCircle(22, 22, 12).strokeRoundedRect(6, 36, 32, 22, 10);
    } else if (kind === 'coin') {
      g.fillStyle(0xc97603).fillEllipse(32, 35, 48, 54);
      g.fillStyle(0xffce22).fillEllipse(32, 30, 48, 52);
      g.lineStyle(3, 0xfff395).strokeEllipse(32, 30, 39, 43);
      g.lineStyle(4, 0xee9b07).strokeEllipse(32, 30, 20, 27);
      g.lineStyle(2, 0xfffbca).lineBetween(20, 12, 14, 25);
    } else if (kind === 'star') {
      const points = Array.from({ length: 10 }, (_, i) => {
        const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? 14 : 27;
        return new Phaser.Math.Vector2(32 + Math.cos(a) * r, 32 + Math.sin(a) * r);
      });
      g.fillStyle(0xffdc30).fillPoints(points, true);
      g.lineStyle(3, 0xfff6b0).strokePoints(points, true);
    } else if (kind === 'lock') {
      g.lineStyle(6, 0xe6f7ff).strokeRoundedRect(20, 10, 24, 30, 10); box(12, 28, 40, 27, 0x7aa9c5);
      g.fillStyle(0x204d76).fillCircle(32, 39, 4).fillRect(30, 40, 4, 7);
    } else if (kind === 'hammer') {
      box(29, 24, 10, 33, 0xffc44d, 3); box(10, 10, 44, 22, 0xff6657, 6); box(8, 12, 9, 18, 0xd9f3ff, 3);
    } else if (kind === 'line') {
      for (let i = 0; i < 3; i++) box(5 + i * 18, 22, 17, 24, i === 1 ? 0xffe047 : 0xff7d36, 4);
      g.lineStyle(4, 0xffffff).lineBetween(5, 32, 59, 32);
    } else if (kind === 'shuffle') {
      g.lineStyle(8, 0xe28cff).lineBetween(10, 17, 49, 47).lineBetween(10, 47, 49, 17);
      g.fillStyle(0xf3b1ff).fillTriangle(42, 8, 57, 13, 51, 28).fillTriangle(42, 37, 57, 48, 42, 57);
    } else if (kind === 'settings') {
      g.fillStyle(0xe2f8ff);
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; g.fillCircle(32 + Math.cos(a) * 19, 32 + Math.sin(a) * 19, 7); }
      g.fillCircle(32, 32, 21).fillStyle(0x147dd1).fillCircle(32, 32, 9);
    } else {
      box(12, 18, 40, 34, 0xce65f2, 7);
      g.fillStyle(0xe496ff).fillCircle(30, 15, 9).fillCircle(53, 32, 9);
      g.fillStyle(0xffffff, 0.5).fillRoundedRect(18, 22, 19, 4, 2);
    }
    g.generateTexture(key, 64, 64); g.destroy();
  }
  return scene.add.image(x, y, key).setDisplaySize(size, size);
}

export function bottomNavigation(scene: Phaser.Scene, active: string, alerts: string[] = [], canNavigate: () => boolean = () => true) {
  const nav = scene.add.container(0, 0).setDepth(100);
  nav.add(panel(scene, W / 2, 804, W - 10, 76, { fill: 0x034b8f, stroke: 0x38cfff, radius: 21, shadowAlpha: 0.3 }));

  // The persistent world navigation now follows the approved City reference:
  // City • Tasks • Map • Shop • Friends. Existing scenes are preserved.
  const items: Array<{
    key: string;
    icon: string;
    label: string;
    action: () => void;
  }> = [
    { key: "CityScene", icon: "city", label: "City", action: () => scene.scene.start("CityScene") },
    { key: "DailyScene", icon: "chest", label: "Tasks", action: () => scene.scene.start("DailyScene") },
    { key: "CampaignScene", icon: "map", label: "Map", action: () => scene.scene.start("CampaignScene") },
    { key: "EventScene", icon: "shop", label: "Shop", action: () => scene.scene.start("EventScene") },
    { key: "ProgressScene", icon: "friends", label: "Friends", action: () => scene.scene.start("ProgressScene") },
  ];

  items.forEach((item, index) => {
    const x = 44 + index * 75.5;
    const selected = active === item.key;
    const tile = button(scene, x, 796, 67, 65, "", () => {
      if (!selected && canNavigate()) item.action();
    }, selected ? COLORS.primary : 0x066cc7, "primary");

    if (selected) {
      const glow = scene.add.graphics();
      glow.lineStyle(3, 0x8ff5ff, 1).strokeRoundedRect(-31, -30, 62, 60, 14);
      glow.lineStyle(1, 0xffffff, 0.9).strokeRoundedRect(-27, -26, 54, 52, 11);
      tile.add(glow);
    }

    tile.add(gameIcon(scene, 0, -9, item.icon, 38));
    tile.add(text(scene, 0, 22, item.label, 11, "#ffffff", "800").setStroke("#064b8a", 2));
    nav.add(tile);

    if (alerts.includes(item.key)) {
      const badge = scene.add.container(x + 24, 768);
      badge.add(scene.add.circle(0, 3, 8, 0x981f31, 0.6));
      badge.add(scene.add.circle(0, 0, 8, 0xf33f4c).setStrokeStyle(1.5, 0xffffff));
      badge.add(scene.add.circle(-2, -3, 2.5, 0xffffff, 0.75));
      nav.add(badge);
    }
  });
  return nav;
}

export function screenHeader(scene: Phaser.Scene, eyebrow: string, title: string, _coins: number, _stars: number) {
  playerHud(scene, () => gameSettings(scene));

  const back = button(scene, 31, 111, 44, 36, "‹", () => scene.scene.start("HomeScene")).setDepth(118);
  const heading = text(scene, 196, 106, title, 22, "#ffffff", "800")
    .setStroke("#07539d", 3)
    .setDepth(118);
  if (heading.width > 252) heading.setFontSize(18);

  const ribbon = panel(scene, W / 2, 128, 242, 16, {
    fill: 0x0757a0,
    stroke: 0x55d8ff,
    radius: 9,
    shadow: false,
  }).setDepth(117);
  const eyebrowText = text(scene, 0, -1, eyebrow, 7, "#e9fbff", "800");
  if (eyebrowText.width > 222) eyebrowText.setScale(222 / eyebrowText.width);
  ribbon.add(eyebrowText);

  return { back, heading, ribbon };
}

export function coastalBackdrop(scene: Phaser.Scene, tint = 0xffffff) {
  scene.cameras.main.fadeIn(150, 7, 54, 103);
  addGradientBackground(scene);
  const name = scene.scene.key;
  const world = name === "CityScene" || name === "CampaignScene";
  const puzzle = name === "PuzzleScene";

  // Reuse the original procedural coast as a world backdrop. It is generated
  // at runtime from code, not sampled from any reference board.
  const coast = scene.add.image(W / 2, H / 2, coastTexture(scene)).setDisplaySize(W, H).setTint(tint);
  coast.setAlpha(world ? 0.44 : puzzle ? 0.36 : 0.28);

  // A light atmospheric veil protects UI/board readability while keeping the
  // harbor, cliffs and skyline visibly part of the same Block City universe.
  const atmosphere = scene.add.graphics();
  if (puzzle) {
    atmosphere.fillGradientStyle(0xdff7ff, 0xdff7ff, 0x76d9ef, 0x76d9ef, 0.16, 0.16, 0.42, 0.42);
    atmosphere.fillRect(0, 0, W, H);
    atmosphere.fillStyle(0x063f78, 0.12).fillRoundedRect(8, 112, W - 16, 662, 28);
  } else if (world) {
    atmosphere.fillGradientStyle(0xe6f8ff, 0xe6f8ff, 0x78d8ef, 0x78d8ef, 0.16, 0.16, 0.48, 0.48);
    atmosphere.fillRect(0, 0, W, H);
  } else {
    atmosphere.fillStyle(0xeaf8ff, 0.34).fillRect(0, 0, W, H);
  }
}

export function rewardDialog(scene: Phaser.Scene, title: string, rewards: string, onDone: () => void) {
  const group = scene.add.container(0, 0).setName("blocking-dialog").setDepth(5000);
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.78).setInteractive();
  const glow = scene.add.circle(W / 2, 356, 118, 0xffe86d, 0.12);
  const card = panel(scene, W / 2, 422, 338, 352, {
    fill: 0xfffbec,
    stroke: COLORS.gold,
    radius: 28,
    shadowAlpha: 0.42,
  });
  const ribbon = panel(scene, W / 2, 312, 228, 38, {
    fill: 0x0b7fd6,
    stroke: 0x7ce9ff,
    radius: 14,
    shadowAlpha: 0.2,
  });
  ribbon.add(text(scene, 0, -1, "REWARD", 12, "#ffffff", "800"));

  audio.play(scene, "reward");
  const art = gameIcon(scene, W / 2, 371, title.includes("BADGE") ? "trophy" : "chest", 104);
  const titleText = text(scene, W / 2, 438, title, 22, "#123767", "800");
  if (titleText.width > 286) titleText.setFontSize(18);

  const rewardPlate = panel(scene, W / 2, 482, 268, 48, {
    fill: 0xfff1b8,
    stroke: 0xf2c551,
    radius: 15,
    shadow: false,
  });
  rewardPlate.add(text(scene, 0, -1, rewards, 16, "#8d5c12", "800"));

  const collect = button(
    scene,
    W / 2,
    546,
    272,
    54,
    "COLLECT",
    () => {
      group.destroy(true);
      onDone();
    },
    COLORS.gold,
    "gold",
  );

  group.add([dim, glow, card, ribbon, art, titleText, rewardPlate, collect]);

  for (let i = 0; i < 10; i += 1) {
    const angle = (Math.PI * 2 * i) / 10;
    const x = W / 2 + Math.cos(angle) * 118;
    const y = 374 + Math.sin(angle) * 92;
    const spark = text(scene, x, y, i % 3 ? "✦" : "◆", i % 3 ? 15 : 11, i % 2 ? "#fff2a0" : "#ffffff", "800").setDepth(5002);
    group.add(spark);
    scene.tweens.add({
      targets: spark,
      alpha: 0.25,
      scaleX: 0.65,
      scaleY: 0.65,
      angle: 90,
      duration: 900 + i * 70,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  art.setScale(0.2);
  scene.tweens.add({ targets: art, scaleX: 1, scaleY: 1, angle: 4, duration: 360, ease: "Back.Out" });
  scene.tweens.add({ targets: glow, scaleX: 1.18, scaleY: 1.18, alpha: 0.05, duration: 1200, yoyo: true, repeat: -1 });
  return group;
}

export function playerHud(scene: Phaser.Scene, onSettings: () => void, canNavigate = () => true) {
  const save = loadSave();
  const profile = profileLevelFromXp(save.xp);
  const group = scene.add.container(0, 0).setDepth(100);

  // Player chip mirrors the approved HUD sheet: portrait, name, star-level badge and XP.
  const player = panel(scene, 103, 45, 184, 66, { fill: 0x087fd3, stroke: 0x35c9ff, radius: 15, shadowAlpha: 0.22 });
  const avatar = panel(scene, -65, 0, 62, 62, { fill: 0x62d94e, stroke: 0xffffff, radius: 15, shadow: false });
  avatar.add(gameIcon(scene, 0, 0, save.avatar, 59));
  avatar.setSize(62, 62).setInteractive({ useHandCursor: true }).on("pointerup", () => {
    if (canNavigate()) scene.scene.start("ProgressScene");
  });
  player.add([avatar, text(scene, 15, -17, "Player123", 18, "#ffffff", "800")]);

  const xpTrack = panel(scene, 26, 13, 112, 21, { fill: 0x063b7a, stroke: 0x042e63, radius: 7, shadow: false });
  player.add(xpTrack);
  const xp = progressBar(scene, -28, 13, 104, profile.progress, 0x45e640, 17);
  player.add(xp);
  const badge = panel(scene, -26, 13, 30, 30, { fill: 0x02a9ff, stroke: 0xb5ffff, radius: 9, shadow: false });
  badge.add(text(scene, 0, 0, String(profile.level), 15, "#ffffff", "800"));
  player.add([badge, text(scene, 31, 13, `${profile.currentXp}/${profile.neededXp}`, 12, "#ffffff", "800")]);
  group.add(player);

  let coinText!: Phaser.GameObjects.Text;
  const chipData: Array<[boolean, number]> = [[false, 25], [true, 63]];
  chipData.forEach(([star, y]) => {
    const chip = panel(scene, 291, y, 142, 32, { fill: 0x0758a7, stroke: 0x178dd9, radius: 10, shadow: false });
    const value = text(scene, 286, y, (star ? save.stars : save.coins).toLocaleString("en"), 18, "#ffffff", "800");
    if (value.width > 74) value.setScale(74 / value.width);
    const plus = button(scene, 355, y, 30, 30, "+", () => {
      if (canNavigate()) showCurrencyGuide(scene, star);
    }, COLORS.success, "success");
    group.add([chip, gameIcon(scene, 226, y, star ? "star" : "coin", 38), value, plus]);
    if (!star) coinText = value;
  });

  const settings = button(scene, 356, 104, 44, 44, "", onSettings);
  settings.add(gameIcon(scene, 0, 0, "settings", 36));
  group.add(settings);
  return { group, coinText, settings };
}

export function showCurrencyGuide(scene: Phaser.Scene, stars = false) {
  const group = scene.add.container(0, 0).setName("blocking-dialog").setDepth(5000);
  group.add(scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.76).setInteractive());
  group.add(panel(scene, W / 2, 422, 350, stars ? 382 : 430, {
    fill: stars ? 0xfffbeb : 0xeefaff,
    stroke: stars ? COLORS.gold : 0x52d6ff,
    radius: 27,
    shadowAlpha: 0.42,
  }));

  group.add(button(scene, 344, stars ? 259 : 235, 36, 36, "×", () => group.destroy(true), 0x0b6fc5, "secondary"));
  group.add(gameIcon(scene, W / 2, stars ? 314 : 282, stars ? "star" : "shop", 76));
  group.add(text(scene, W / 2, stars ? 366 : 336, stars ? "BUILDING STARS" : "CITY SHOP", 24, "#123767", "800"));

  if (stars) {
    group.add(text(
      scene,
      W / 2,
      420,
      "Win puzzles to earn Construction Stars.\nSpend them to upgrade districts and landmarks.",
      14,
      "#426b8c",
      "700",
    ).setLineSpacing(5).setWordWrapWidth(290).setAlign("center"));
    const starCard = panel(scene, W / 2, 482, 284, 62, { fill: 0xfff2bd, stroke: 0xf2c95b, radius: 16, shadow: false });
    starCard.add([
      gameIcon(scene, -98, 0, "star", 42),
      text(scene, -46, -9, "PUZZLE REWARD", 10, "#8e631a", "800").setOrigin(0, 0.5),
      text(scene, -46, 10, "Clear goals • earn stars", 11, "#5e7790", "700").setOrigin(0, 0.5),
    ]);
    group.add(starCard);
    group.add(button(scene, W / 2, 552, 278, 48, "PLAY & EARN", () => scene.scene.start("CampaignScene"), COLORS.gold, "gold"));
  } else {
    group.add(text(scene, W / 2, 370, "BOOSTER SHELF", 11, "#4b7191", "800"));
    const boosters: Array<[string, string, string]> = [
      ["hammer", "Hammer", "Remove 1"],
      ["shuffle", "Shuffle", "New blocks"],
      ["line", "Clear Line", "Clear a row"],
    ];
    boosters.forEach(([icon, label, sub], i) => {
      const x = 82 + i * 113;
      const card = panel(scene, x, 440, 100, 116, {
        fill: i === 0 ? 0xfff4de : i === 1 ? 0xf6eaff : 0xe7f6ff,
        stroke: i === 0 ? 0xf2b85e : i === 1 ? 0xd398f1 : 0x7ed7f6,
        radius: 17,
        shadowAlpha: 0.18,
      });
      card.add([
        gameIcon(scene, 0, -26, icon, 50),
        text(scene, 0, 15, label, 11, "#123767", "800"),
        text(scene, 0, 33, sub, 8, "#66829b", "700"),
        gameIcon(scene, -14, 51, "coin", 16),
        text(scene, 13, 51, i === 0 ? "35" : i === 1 ? "45" : "55", 10, "#8d611b", "800"),
      ]);
      group.add(card);
    });
    group.add(text(scene, W / 2, 518, "Earn coins from puzzles, missions and daily gifts.", 11, "#567693", "700"));
    group.add(button(scene, W / 2, 570, 278, 48, "DAILY GIFTS", () => scene.scene.start("DailyScene"), COLORS.gold, "gold"));
  }

  return group;
}

export function homeNavigation(scene: Phaser.Scene) {
  const nav = scene.add.container(0, 0).setDepth(100);
  nav.add(panel(scene, W / 2, 807, 388, 78, { fill: 0x033f7f, stroke: 0x2bc9ff, radius: 23, shadowAlpha: 0.3 }));
  const items: Array<[string, string, () => void]> = [
    ["hat", "Build", () => scene.scene.start("CityScene")],
    ["puzzle", "Puzzles", () => scene.scene.start("CampaignScene")],
    ["shop", "Shop", () => showCurrencyGuide(scene)],
    ["friends", "Friends", () => showCharacterPicker(scene)],
  ];
  items.forEach(([iconName, label, action], i) => {
    const tile = button(scene, 51 + i * 96, 792, 82, 82, "", action);
    tile.add(gameIcon(scene, 0, -11, iconName, 52));
    tile.add(text(scene, 0, 27, label, 15, "#ffffff", "800").setStroke("#064c91", 3));
    if (i === 0 && loadSave().stars > 0) {
      tile.add(scene.add.circle(31, -34, 10, 0x9b1e32, 0.65));
      tile.add(scene.add.circle(31, -37, 10, COLORS.coral).setStrokeStyle(2, 0xffffff));
      tile.add(scene.add.circle(28, -40, 3, 0xffffff, 0.7));
    }
    nav.add(tile);
  });
  return nav;
}

export const CHARACTER_SUBTITLES: Record<string, string> = {
  builder: "Curious, upbeat, ready to build!",
  planner: "Creative, organized, full of big ideas!",
  worker: "Strong hands, stronger cities!",
  chef: "Good food, happier people!",
  mechanic: "Fix it. Improve it. Keep it moving!",
  sailor: "Explore new shores!",
  tourist: "Discover. Photograph. Collect!",
  corgi: "A loyal friend for every adventure!",
};

export const CHARACTERS = [
  ["builder", "Builder Boy"],
  ["planner", "City Planner Girl"],
  ["worker", "Construction Worker"],
  ["chef", "Chef / Shop Owner"],
  ["mechanic", "Mechanic"],
  ["sailor", "Sailor"],
  ["tourist", "Tourist"],
  ["corgi", "Corgi"],
];

export const CHARACTER_ACCESSORIES: Record<string, string[]> = {
  builder: ["builder-cap", "backpack", "hammer"],
  planner: ["blueprint", "laptop", "pencil"],
  worker: ["hat", "worker-toolbox", "wrench"],
  chef: ["chef-hat", "cake", "shop-sign"],
  mechanic: ["builder-cap", "worker-toolbox", "wrench"],
  sailor: ["sailor-hat", "binoculars", "ship-wheel"],
  tourist: ["tourist-hat", "camera", "map"],
  corgi: ["collar", "bone"],
};

export function characterHero(scene: Phaser.Scene, x: number, y: number, id: string) {
  const accent = id === "planner" ? 0xffe7f5 : id === "corgi" ? 0xfff3d8 : 0xe3f8ff;
  const stroke = id === "planner" ? 0xd98cf5 : id === "corgi" ? 0xf5c65e : 0x62d7ff;
  const group = panel(scene, x, y, 330, 224, { fill: accent, stroke, radius: 22 });

  const body = referenceArt(
    scene,
    -92,
    5,
    `${id}-body`,
    id === "corgi" ? 138 : 126,
    id === "corgi" ? 140 : 194,
  );
  if (body) group.add(body);

  const displayName = CHARACTERS.find(([key]) => key === id)?.[1] ?? "Builder Boy";
  const title = text(scene, 68, -82, displayName, 19, "#123767", "800");
  if (title.width > 182) title.setFontSize(16);

  const subtitle = text(scene, 68, -50, CHARACTER_SUBTITLES[id], 11, "#2375a7", "700")
    .setWordWrapWidth(174)
    .setAlign("center");

  const accessories = CHARACTER_ACCESSORIES[id] ?? [];
  accessories.slice(0, 3).forEach((asset, i, items) => {
    group.add(gameIcon(scene, 68 + (i - (items.length - 1) / 2) * 56, 30, asset, 46));
  });

  const expressionStrip = panel(scene, 68, 83, 178, 45, {
    fill: 0xffffff,
    stroke: 0xbfe9f6,
    radius: 13,
    shadow: false,
  });
  const expressionIds = id === "corgi"
    ? ["corgi", "corgi-wink", "corgi-excited"]
    : [id, `${id}-wink`, `${id}-surprised`];
  expressionIds.forEach((asset, i) => {
    expressionStrip.add(gameIcon(scene, -55 + i * 55, -1, asset, 38));
  });

  group.add([
    title,
    subtitle,
    text(scene, 68, 3, "ACCESSORIES", 8, "#6a78a1", "800"),
    expressionStrip,
    text(scene, 68, 58, "EXPRESSIONS", 8, "#6a78a1", "800"),
    text(scene, 68, 103, "✓ SELECTED", 10, "#139447", "800"),
  ]);
  return group;
}

export function showCharacterPicker(scene: Phaser.Scene) {
  const group = scene.add.container(0, 0).setName("blocking-dialog").setDepth(5000);
  let hero: Phaser.GameObjects.Container;
  const tiles: Phaser.GameObjects.Container[] = [];

  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.76).setInteractive(),
    panel(scene, W / 2, 422, 360, 650, { fill: 0xeafaff, stroke: 0x50cfff, radius: 27, shadowAlpha: 0.42 }),
    text(scene, W / 2, 116, "CITY FRIENDS", 22, "#123767", "800"),
    text(scene, W / 2, 141, "Choose your companion", 11, "#4d7898", "700"),
  ]);
  group.add(button(scene, 343, 122, 36, 36, "×", () => group.destroy(true), 0x0b6fc5, "secondary"));

  const refresh = () => {
    hero?.destroy(true);
    hero = characterHero(scene, W / 2, 270, loadSave().avatar);
    hero.setDepth(5001);
    group.add(hero);
    tiles.forEach((tile, i) => {
      const selected = CHARACTERS[i][0] === loadSave().avatar;
      const ring = tile.getByName("selected-ring") as Phaser.GameObjects.Graphics;
      ring.setVisible(selected);
      tile.setScale(selected ? 1.04 : 1);
    });
  };

  CHARACTERS.forEach(([id, name], i) => {
    const x = 66 + (i % 4) * 86;
    const y = 455 + Math.floor(i / 4) * 108;
    const tile = panel(scene, x, y, 77, 94, {
      fill: i % 2 ? 0xffe6f2 : 0xd9f4ff,
      stroke: 0x9cdaf1,
      radius: 14,
      shadowAlpha: 0.15,
    });
    tile.add([
      gameIcon(scene, 0, -12, id, 60),
      text(scene, 0, 31, name === "Construction Worker" ? "Worker" : name.replace(" / ", "\n").replace(" ", "\n"), 9, "#123767", "800"),
    ]);
    tile.add(
      scene.add.graphics()
        .lineStyle(3, 0x1dbe54)
        .strokeRoundedRect(-37, -45, 74, 90, 13)
        .setName("selected-ring"),
    );
    tile.setSize(77, 94).setInteractive({ useHandCursor: true }).on("pointerup", () => {
      updateSave((save) => ({ ...save, avatar: id }));
      refresh();
    });
    tiles.push(tile);
    group.add(tile);
  });

  refresh();
  group.add(text(scene, W / 2, 650, "Tap a portrait to switch your city companion", 11, "#4d7898", "700"));
  group.add(button(scene, W / 2, 699, 282, 44, "USE THIS CHARACTER", () => {
    group.destroy(true);
    scene.scene.restart();
  }, COLORS.gold, "gold"));
  return group;
}

export function gameSettings(scene: Phaser.Scene) {
  const save = loadSave();
  const group = scene.add.container(0, 0).setName("blocking-dialog").setDepth(5000);

  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.76).setInteractive(),
    panel(scene, W / 2, 422, 338, 382, { fill: 0xf1fbff, stroke: 0x64dcff, radius: 27, shadowAlpha: 0.42 }),
    gameIcon(scene, W / 2, 286, "settings", 58),
    text(scene, W / 2, 333, "SETTINGS", 24, "#123767", "800"),
  ]);

  group.add(button(scene, 340, 276, 36, 36, "×", () => group.destroy(true), 0x0b6fc5, "secondary"));

  const toggleRow = (y: number, icon: string, label: string, enabled: boolean, onToggle: () => void) => {
    const row = panel(scene, W / 2, y, 286, 62, { fill: 0xffffff, stroke: 0xbfe7f6, radius: 17, shadowAlpha: 0.13 });
    row.add([
      gameIcon(scene, -104, 0, icon, 38),
      text(scene, -72, -9, label, 12, "#123767", "800").setOrigin(0, 0.5),
      text(scene, -72, 11, enabled ? "Enabled" : "Disabled", 9, enabled ? "#158c55" : "#7992a6", "700").setOrigin(0, 0.5),
    ]);
    const toggle = button(scene, 100, 0, 76, 32, enabled ? "ON" : "OFF", onToggle, enabled ? COLORS.success : 0x91a8b8, enabled ? "success" : "muted");
    row.add(toggle);
    group.add(row);
  };

  toggleRow(392, "settings", "SOUND", save.soundEnabled, () => {
    updateSave((state) => ({ ...state, soundEnabled: !state.soundEnabled }));
    group.destroy(true);
    gameSettings(scene);
  });
  toggleRow(465, "star", "HAPTICS", save.hapticsEnabled, () => {
    updateSave((state) => ({ ...state, hapticsEnabled: !state.hapticsEnabled }));
    group.destroy(true);
    gameSettings(scene);
  });

  group.add(text(scene, W / 2, 516, "GAME", 9, "#66829b", "800"));
  group.add(button(scene, W / 2, 552, 286, 42, "BACK TO GAME", () => group.destroy(true), COLORS.primary, "primary"));
  group.add(button(scene, W / 2, 602, 286, 38, "HOME", () => scene.scene.start("HomeScene"), 0x0b6fc5, "secondary"));
  return group;
}
