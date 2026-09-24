import { VOXEL_BIOMES, createVoxelCharacter, drawVoxelBiomeBackdrop } from './voxelArt';
import { loadSave, updateSave } from "./save";
import { profileLevelFromXp } from "./progression";
import { audio } from "./audio";
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
export const GAME_FONT = '"Trebuchet MS", "Arial Rounded MT Bold", "Avenir Next Rounded", Nunito, system-ui, sans-serif';

function glossyFace(scene: Phaser.Scene, width: number, height: number, radius: number, top: number, bottom: number) {
  const key = `ui-gloss-${width}-${height}-${radius}-${top}-${bottom}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width * 2, height * 2)!;
    const ctx = texture.context;
    ctx.scale(2, 2);
    const hex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hex(top));
    gradient.addColorStop(0.58, hex(top));
    gradient.addColorStop(1, hex(bottom));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(1, 1, width - 2, height - 2, radius);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.78)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, height - 8, Math.max(2, radius - 2));
    ctx.stroke();
    texture.refresh();
  }
  return scene.add.image(0, 0, key).setDisplaySize(width, height);
}

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
    fontFamily: GAME_FONT,
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
  body.lineStyle(2, 0xffffff, 0.65);
  body.strokeRoundedRect(-width / 2 + 3, -height / 2 + 3, width - 6, height - 8, Math.max(2, radius - 3));
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
  const c = scene.add.container(x, y);
  const radius = Math.min(23, height * 0.32);
  const palette = buttonColors(color, style);
  const shadow = scene.add.graphics();
  shadow.fillStyle(palette.edge, 1);
  shadow.fillRoundedRect(-width / 2, -height / 2 + (style === "gold" ? 8 : 5), width, height, radius);
  const outline = scene.add.graphics();
  outline.lineStyle(style === "gold" ? 5 : 3, style === "gold" ? 0x083f8e : 0x064f9d, 1);
  outline.strokeRoundedRect(-width / 2 - 1, -height / 2 - 1, width + 2, height + 3, radius + 1);
  const bg = glossyFace(scene, width, height, radius, palette.top, palette.bottom);
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.18);
  shine.fillRoundedRect(-width / 2 + 8, -height / 2 + 5, width - 16, Math.max(5, height * 0.22), radius * 0.5);
  const labelText = text(scene, 0, -1, label, height >= 50 ? 18 : 12, palette.text, "800");
  if (labelText.width > width - 18) labelText.setFontSize(Math.max(11, Math.floor((width - 18) / labelText.width * (height >= 50 ? 18 : 12))));
  labelText.setShadow(0, 1, style === "gold" || color === 0x8a682d ? "#ffffff" : "#06376b", 0, false, true);
  c.add([shadow, outline, bg, shine, labelText]);
  c.setSize(width, Math.max(44, height + 5)).setInteractive({ useHandCursor: true });
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
    fontFamily: GAME_FONT,
    fontSize: "12px",
    fontStyle: "bold",
    color,
    letterSpacing: 0.7,
  });
  caption.setBackgroundColor("#e4f7ff").setPadding(8, 2).setShadow(0, 1, "#ffffff", 0, false, true);
  return caption;
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
  const supported = ['city', 'house', 'puzzle', 'chest', 'trophy', 'lock', 'hammer', 'shuffle', 'line', 'settings', 'builder', 'planner', 'worker', 'chef', 'sailor', 'mechanic', 'tourist', 'corgi', 'hat', 'shop', 'friends', 'coin', 'star', 'map', 'backpack', 'blueprint', 'laptop', 'worker-toolbox', 'cake', 'wrench', 'tool-belt', 'binoculars', 'camera', 'collar', 'builder-cap'];
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
    } else if (kind === 'house') {
      box(12, 27, 40, 28, 0xf3d294, 3);
      g.fillStyle(0xdc554b).fillTriangle(8,29,32,8,56,29);
      box(27, 39, 11, 16, 0x2787c6, 1);
      box(17, 33, 8, 9, 0xbff3ff, 1); box(41, 33, 8, 9, 0xbff3ff, 1);
      g.fillStyle(0x65c45b).fillRect(8,54,49,5);
    } else if (kind === 'puzzle') {
      // chunky interlocking puzzle piece, not a generic purple blob
      g.fillStyle(0x9b4ce6).fillRoundedRect(12,16,40,36,6);
      g.fillCircle(32,15,9); g.fillCircle(53,34,9);
      g.fillStyle(0x063d79).fillCircle(12,34,8);
      g.fillStyle(0xd48bff,0.75).fillRoundedRect(17,20,25,7,3);
      g.lineStyle(2,0xffffff,0.65).strokeRoundedRect(13,17,38,34,5);
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
    } else if (kind === 'map') {
      box(6, 15, 52, 38, 0xf4f0d6, 3);
      g.fillStyle(0x58c96d).fillRect(9, 18, 15, 31);
      g.fillStyle(0x5db8f2).fillRect(25, 18, 15, 31);
      g.fillStyle(0xffcf44).fillRect(41, 18, 14, 31);
      g.lineStyle(2, 0x0b5da4, 0.65).lineBetween(24,18,24,49).lineBetween(40,18,40,49);
      g.fillStyle(0xf04d52).fillCircle(44, 24, 7).fillTriangle(39,27,49,27,44,39);
    } else if (['backpack','worker-toolbox','tool-belt'].includes(kind)) {
      box(12, 15, 40, 40, kind === 'tool-belt' ? 0xc64a3d : 0x8c532d, 5);
      box(18, 9, 28, 12, kind === 'tool-belt' ? 0xef5e52 : 0xa96732, 4);
      g.fillStyle(0xffce55).fillRect(29, 24, 6, 8);
    } else if (['blueprint','laptop','camera','binoculars'].includes(kind)) {
      box(10, 17, 44, 34, kind === 'blueprint' ? 0x258de5 : 0x49566d, 5);
      if (kind === 'blueprint') g.lineStyle(2,0xffffff,0.8).strokeRect(20,25,24,17);
      else if (kind === 'camera') { g.fillStyle(0x13243d).fillCircle(32,34,10); g.fillStyle(0x74d5ff).fillCircle(32,34,5); }
      else if (kind === 'binoculars') { g.fillStyle(0x13243d).fillCircle(22,34,10).fillCircle(42,34,10); }
      else g.fillStyle(0x9be7ff).fillRect(16,22,32,20);
    } else if (['wrench','cake','collar','builder-cap'].includes(kind)) {
      if (kind === 'wrench') { g.lineStyle(8,0xb7c4d1).lineBetween(18,48,43,22); g.lineStyle(5,0x6e7d8c).strokeCircle(18,48,7); }
      else if (kind === 'cake') { box(12,29,40,22,0xffe6bd,4); box(15,20,34,12,0xff79a3,4); g.fillStyle(0xe74949).fillCircle(32,17,6); }
      else if (kind === 'collar') { g.lineStyle(8,0xe8453f).strokeCircle(32,34,19); g.fillStyle(0xffc839).fillCircle(32,52,6); }
      else { box(9,17,46,28,0xf14c3f,7); box(5,39,54,8,0xf14c3f,3); }
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
  nav.add(panel(scene, W / 2, 801, W - 14, 68, { fill: 0x044f96, stroke: 0x45d7ff, radius: 18, shadowAlpha: 0.28 }));
  const items = [['HomeScene', 'builder', 'Home'], ['CityScene', 'city', 'Build'], ['CampaignScene', 'puzzle', 'Journey'], ['DailyScene', 'chest', 'Daily'], ['EventScene', 'trophy', 'Event']];
  items.forEach(([target, icon, label], index) => {
    const x = 47 + index * 74;
    const tile = button(scene, x, 793, 66, 64, '', () => {});
    if (active === target) tile.add(scene.add.graphics().lineStyle(3, 0xeaffff).strokeRoundedRect(-31, -30, 62, 60, 14));
    tile.setSize(66, 64).setInteractive({ useHandCursor: true }).on('pointerup', () => { if (target !== active && canNavigate()) scene.scene.start(target); });
    const labelText = text(scene, x, 813, label, 11, '#ffffff', '700');
    nav.add([tile, gameIcon(scene, x, 782, icon, 35), labelText]);
    if (alerts.includes(target)) nav.add(scene.add.circle(x + 23, 769, 6, COLORS.coral).setStrokeStyle(2, 0xffffff));
  });
  return nav;
}

export function screenHeader(scene: Phaser.Scene, eyebrow: string, title: string, coins: number, stars: number) {
  playerHud(scene, () => gameSettings(scene));
  button(scene, 33, 110, 44, 35, '‹', () => scene.scene.start('HomeScene'));
  const heading = text(scene, 196, 107, title, 22, '#ffffff').setStroke('#07539d', 3);
  if (heading.width > 260) heading.setFontSize(18);
}

export function coastalBackdrop(scene: Phaser.Scene, tint = 0xffffff) {
  // Original procedural scenery only. Reference sheets are never sampled or composited here.
  const name = scene.scene.key;
  const biome = name === 'EventScene' ? VOXEL_BIOMES.volcano
    : name === 'DailyScene' ? VOXEL_BIOMES.water
      : name === 'ProgressScene' ? VOXEL_BIOMES.cave
        : VOXEL_BIOMES.grass;
  drawVoxelBiomeBackdrop(scene, biome, W, H);
  if (tint !== 0xffffff) {
    scene.add.rectangle(W / 2, H / 2, W, H, tint, 0.08).setBlendMode(Phaser.BlendModes.MULTIPLY);
  }
  const wash = scene.add.rectangle(W / 2, H / 2, W, H, 0xffffff, name === 'CityScene' || name === 'CampaignScene' ? 0.08 : 0.14);
  wash.setDepth(0);
}

export function rewardDialog(scene: Phaser.Scene, title: string, rewards: string, onDone: () => void) {
  const group = scene.add.container(0, 0).setName('blocking-dialog').setDepth(5000);
  const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.75).setInteractive();
  const card = panel(scene, W / 2, 422, 328, 326, { fill: COLORS.cream, stroke: COLORS.gold, radius: 26 });
  audio.play(scene, "reward");
  const art = gameIcon(scene, W / 2, 340, title.includes("BADGE") ? "trophy" : "chest", 100);
  group.add([dim, card, art, text(scene, W / 2, 420, title, 22), text(scene, W / 2, 462, rewards, 16, '#996010'), button(scene, W / 2, 532, 256, 50, 'COLLECT', onDone, COLORS.gold, 'gold')]);
  scene.tweens.add({ targets: art, angle: 5, duration: 400, yoyo: true, repeat: 1 });
  return group;
}

/** Shared reference-kit HUD. Stars remain the earned construction currency. */
export function playerHud(scene: Phaser.Scene, onSettings: () => void, canNavigate = () => true) {
  const save = loadSave();
  const profile = profileLevelFromXp(save.xp);
  const group = scene.add.container(0, 0).setDepth(100);

  // Reference-style player module: one chunky visual cluster rather than detached widgets.
  const avatar = panel(scene, 43, 46, 64, 66, { fill: 0x68dc58, stroke: 0xffffff, radius: 17, shadowAlpha: 0.28 });
  avatar.add(createVoxelCharacter(scene, 0, 8, save.avatar, 54));
  avatar.setSize(64, 66).setInteractive({ useHandCursor: true }).on('pointerup', () => {
    if (canNavigate()) scene.scene.start('ProgressScene');
  });

  const player = panel(scene, 143, 44, 143, 60, { fill: 0x0786dc, stroke: 0x67ddff, radius: 14, shadowAlpha: 0.22 });
  player.add(text(scene, 5, -16, 'Player123', 19, '#ffffff', '800'));

  const xpTrack = panel(scene, 145, 64, 118, 21, { fill: 0x063c83, stroke: 0x0a2f66, radius: 8, shadow: false });
  const xp = progressBar(scene, 91, 64, 106, profile.progress, 0x46e842, 16);
  const badge = panel(scene, 84, 64, 30, 30, { fill: 0x0aaaff, stroke: 0xc8ffff, radius: 9, shadowAlpha: 0.2 });
  badge.add(text(scene, 0, 0, String(profile.level), 15, '#ffffff', '800'));

  group.add([avatar, player, xpTrack, xp, badge, text(scene, 146, 64, `${profile.currentXp}/${profile.neededXp}`, 11, '#ffffff', '700')]);

  let coinText!: Phaser.GameObjects.Text;
  [false, true].forEach((star, i) => {
    const y = 29 + i * 37;
    const chip = panel(scene, 297, y, 151, 32, { fill: 0x075aa9, stroke: 0x54cfff, radius: 10, shadowAlpha: 0.18 });
    const value = text(scene, 300, y, (star ? save.stars : save.coins).toLocaleString('en'), 18, '#ffffff', '800');
    const plus = button(scene, 360, y, 30, 30, '+', () => {
      if (canNavigate()) showCurrencyGuide(scene, star);
    }, COLORS.success, 'success');
    plus.setScale(0.98);
    group.add([chip, gameIcon(scene, 228, y, star ? 'star' : 'coin', 37), value, plus]);
    if (!star) coinText = value;
  });

  const settings = button(scene, 356, 106, 46, 46, '', onSettings);
  settings.add(gameIcon(scene, 0, 0, 'settings', 37));
  group.add(settings);
  return { group, coinText, settings };
}

export function showCurrencyGuide(scene: Phaser.Scene, stars = false) {
  const group = scene.add.container(0, 0).setName('blocking-dialog').setDepth(5000);
  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.72).setInteractive(),
    panel(scene, W / 2, 422, 334, 338, { fill: COLORS.cream, stroke: COLORS.gold, radius: 26 }),
    gameIcon(scene, W / 2, 313, stars ? 'star' : 'shop', 80),
    text(scene, W / 2, 376, stars ? 'BUILDING STARS' : 'CITY SHOP', 25),
    text(scene, W / 2, 427, stars ? 'Win puzzles to earn stars.\nSpend them to grow your city!' : 'Earn coins from puzzles and daily gifts.\nUse coins for Hammer, Shuffle\nand Clear Line while you play.', 15).setLineSpacing(5),
    button(scene, W / 2, 505, 268, 48, stars ? 'PLAY & EARN' : 'DAILY GIFTS', () => scene.scene.start(stars ? 'CampaignScene' : 'DailyScene'), COLORS.gold, 'gold'),
    button(scene, W / 2, 561, 268, 36, 'BACK', () => group.destroy(true)),
  ]);
}

export function homeNavigation(scene: Phaser.Scene) {
  const nav = scene.add.container(0, 0).setDepth(100);
  // Deep navy dock + separated toy tiles mirrors the supplied home reference more closely.
  nav.add(panel(scene, W / 2, 811, 390, 72, { fill: 0x06396f, stroke: 0x0e66ae, radius: 23, shadow: false }));
  const items: Array<[string, string, () => void]> = [
    ['hat', 'Build', () => scene.scene.start('CityScene')],
    ['puzzle', 'Puzzles', () => scene.scene.start('CampaignScene')],
    ['shop', 'Shop', () => showCurrencyGuide(scene)],
    ['friends', 'Friends', () => showCharacterPicker(scene)],
  ];
  items.forEach(([icon, label, action], i) => {
    const x = 49 + i * 97;
    const tile = button(scene, x, 786, 82, 90, '', action);
    tile.add([
      gameIcon(scene, 0, -15, icon, 57),
      text(scene, 0, 29, label, 16, '#ffffff', '800').setStroke('#06457e', 2),
    ]);
    if (i === 0 && loadSave().stars > 0) {
      tile.add(scene.add.circle(31, -37, 10, COLORS.coral).setStrokeStyle(2, 0xffffff));
    }
    nav.add(tile);
  });
}

export const CHARACTER_SUBTITLES: Record<string, string> = { builder: 'Ready to build!', planner: 'Big ideas!', worker: 'Strong cities', chef: 'Happy neighbors', mechanic: 'Keep it moving', sailor: 'New shores', tourist: 'Explore & collect', corgi: 'Your loyal friend' };

export const CHARACTERS = [
  ['builder', 'Builder Boy'], ['planner', 'City Planner'], ['worker', 'Construction'],
  ['chef', 'Chef'], ['mechanic', 'Mechanic'], ['sailor', 'Sailor'], ['tourist', 'Tourist'], ['corgi', 'Corgi'],
];

export const CHARACTER_ACCESSORIES: Record<string, string[]> = {
  builder: ['builder-cap', 'backpack'], planner: ['blueprint', 'laptop'],
  worker: ['hat', 'worker-toolbox'], chef: ['cake'], mechanic: ['wrench', 'tool-belt'],
  sailor: ['binoculars'], tourist: ['camera', 'map'], corgi: ['collar'],
};

export function characterHero(scene: Phaser.Scene, x: number, y: number, id: string) {
  const group = panel(scene, x, y, 330, 224, { fill: id === 'planner' ? 0xffe7f5 : 0xe3f8ff, stroke: 0x62d7ff, radius: 22 });
  group.add(createVoxelCharacter(scene, -85, -4, id, id === 'corgi' ? 88 : 116));
  group.add([text(scene, 68, -80, CHARACTERS.find(([key]) => key === id)?.[1] ?? 'Builder Boy', 19),
    text(scene, 68, -49, CHARACTER_SUBTITLES[id], 12, '#2375a7'),
    text(scene, 68, 86, '✓ SELECTED', 12, '#139447')]);
  (CHARACTER_ACCESSORIES[id] ?? []).forEach((asset, i, items) => {
    group.add(gameIcon(scene, 68 + (i - (items.length - 1) / 2) * 65, 20, asset, 53));
  });
  return group;
}

export function showCharacterPicker(scene: Phaser.Scene) {
  const group = scene.add.container(0, 0).setName('blocking-dialog').setDepth(5000);
  let hero: Phaser.GameObjects.Container;
  const tiles: Phaser.GameObjects.Container[] = [];
  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.72).setInteractive(),
    panel(scene, W / 2, 423, 354, 636, { fill: 0xeafaff, stroke: 0x50cfff, radius: 26 }),
    text(scene, W / 2, 135, 'SMALL PEOPLE. BIG STORIES.', 19),
  ]);
  const refresh = () => {
    hero?.destroy(true);
    hero = characterHero(scene, W / 2, 277, loadSave().avatar); group.add(hero);
    tiles.forEach((tile, i) => {
      const selected = CHARACTERS[i][0] === loadSave().avatar;
      const ring = tile.getByName('selected-ring') as Phaser.GameObjects.Graphics;
      ring.setVisible(selected);
    });
  };
  CHARACTERS.forEach(([id, name], i) => {
    const x = 66 + (i % 4) * 86, y = 453 + Math.floor(i / 4) * 111;
    const tile = panel(scene, x, y, 77, 98, { fill: i % 2 ? 0xffe6f2 : 0xd9f4ff, stroke: 0x9cdaf1, radius: 14 });
    const avatar = createVoxelCharacter(scene, 0, -5, id, 47);
    tile.add([avatar, text(scene, 0, 34, name === 'Construction' ? 'Worker' : name.replace(' ', '\n'), 10)]);
    tile.add(scene.add.graphics().lineStyle(3, 0x1dbe54).strokeRoundedRect(-37, -47, 74, 94, 13).setName('selected-ring'));
    tile.setSize(77, 98).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      updateSave(save => ({ ...save, avatar: id })); refresh();
    });
    tiles.push(tile); group.add(tile);
  });
  refresh();
  group.add(text(scene, W / 2, 643, 'Choose your city companion', 13, '#2375a7'));
  group.add(button(scene, W / 2, 695, 280, 43, 'LET’S GO', () => { group.destroy(true); scene.scene.restart(); }, COLORS.gold, 'gold'));
}

export function gameSettings(scene: Phaser.Scene) {
  const save = loadSave();
  const group = scene.add.container(0, 0).setName('blocking-dialog').setDepth(5000);
  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.7).setInteractive(),
    panel(scene, W / 2, 422, 334, 332, { fill: 0xf1fbff, stroke: 0x64dcff, radius: 25 }),
    gameIcon(scene, W / 2, 302, 'settings', 45),
    text(scene, W / 2, 345, 'SETTINGS', 23),
    button(scene, W / 2, 392, 280, 44, `SOUND • ${save.soundEnabled ? 'ON' : 'OFF'}`, () => {
      updateSave(s => ({ ...s, soundEnabled: !s.soundEnabled })); group.destroy(true); gameSettings(scene);
    }, COLORS.success, save.soundEnabled ? 'success' : 'muted'),
    button(scene, W / 2, 446, 280, 44, `HAPTICS • ${save.hapticsEnabled ? 'ON' : 'OFF'}`, () => {
      updateSave(s => ({ ...s, hapticsEnabled: !s.hapticsEnabled })); group.destroy(true); gameSettings(scene);
    }, COLORS.success, save.hapticsEnabled ? 'success' : 'muted'),
    button(scene, W / 2, 500, 280, 42, 'BACK TO GAME', () => group.destroy(true)),
    button(scene, W / 2, 554, 280, 37, 'HOME', () => scene.scene.start('HomeScene'), COLORS.primary, 'secondary'),
  ]);
}
