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
  if (style === "gold" || color === COLORS.gold || color === COLORS.goldDark || color === 0x8a682d) {
    return { top: 0xffdf3d, bottom: 0xffb316, edge: 0xf27c0b, text: "#113467" };
  }
  if (style === "success" || color === COLORS.mintDark || color === COLORS.success) {
    return { top: 0x42df77, bottom: 0x16b955, edge: 0x087f3e, text: "#ffffff" };
  }
  if (style === "danger") return { top: 0xff7773, bottom: 0xed494f, edge: 0xb52b37, text: "#ffffff" };
  if (style === "muted") return { top: 0xaac2d3, bottom: 0x829bae, edge: 0x587184, text: "#ffffff" };
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
  shadow.fillRoundedRect(-width / 2, -height / 2 + 5, width, height, radius);
  const bg = scene.add.graphics();
  bg.fillGradientStyle(palette.top, palette.top, palette.bottom, palette.bottom, 1);
  bg.fillRoundedRect(-width / 2, -height / 2, width, height, radius);
  bg.lineStyle(2, 0xffffff, 0.7);
  bg.strokeRoundedRect(-width / 2 + 1, -height / 2 + 1, width - 2, height - 3, radius - 1);
  const shine = scene.add.graphics();
  shine.fillStyle(0xffffff, 0.18);
  shine.fillRoundedRect(-width / 2 + 8, -height / 2 + 5, width - 16, Math.max(5, height * 0.22), radius * 0.5);
  const labelText = text(scene, 0, -1, label, height >= 50 ? 18 : 12, palette.text, "800");
  if (labelText.width > width - 18) labelText.setFontSize(Math.max(11, Math.floor((width - 18) / labelText.width * (height >= 50 ? 18 : 12))));
  labelText.setShadow(0, 1, style === "gold" || color === 0x8a682d ? "#ffffff" : "#06376b", 0, false, true);
  c.add([shadow, bg, shine, labelText]);
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
    fontFamily: '"Arial Rounded MT Bold", Nunito, Inter, system-ui',
    fontSize: "12px",
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
  nav.add(panel(scene, W / 2, 799, W - 16, 78, { fill: 0x096ac2, stroke: 0x6ee1ff, radius: 22 }));
  const items = [['HomeScene', 'builder', 'Home'], ['CityScene', 'city', 'Build'], ['CampaignScene', 'puzzle', 'Journey'], ['DailyScene', 'chest', 'Daily'], ['EventScene', 'trophy', 'Event']];
  items.forEach(([target, icon, label], index) => {
    const x = 47 + index * 74;
    const tile = panel(scene, x, 797, 66, 64, { fill: active === target ? 0x20b6f2 : 0x0860b2, stroke: active === target ? 0xd5fcff : 0x258fdb, radius: 14, shadow: false });
    tile.setSize(66, 64).setInteractive({ useHandCursor: true }).on('pointerup', () => { if (target !== active && canNavigate()) scene.scene.start(target); });
    nav.add([tile, gameIcon(scene, x, 787, icon, 34), text(scene, x, 817, label, 11, '#ffffff')]);
    if (alerts.includes(target)) nav.add(scene.add.circle(x + 23, 773, 6, COLORS.coral).setStrokeStyle(2, 0xffffff));
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
  addGradientBackground(scene);
  if (scene.textures.exists('block-city-coast-hero')) {
    scene.add.image(W / 2, H / 2, 'block-city-coast-hero').setDisplaySize(W, H).setTint(tint).setAlpha(0.9);
    scene.add.rectangle(W / 2, 65, W, 130, 0xdff7ff, 0.65);
  }
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
  const avatar = panel(scene, 42, 47, 58, 61, { fill: 0x67d954, stroke: 0xffffff, radius: 15 });
  avatar.add(gameIcon(scene, 0, 0, save.avatar, 57));
  avatar.setSize(58, 61).setInteractive({ useHandCursor: true }).on('pointerup', () => {
    if (canNavigate()) scene.scene.start('ProgressScene');
  });
  const player = panel(scene, 138, 46, 129, 54, { fill: 0x0786dc, stroke: 0x22afff, radius: 12, shadow: false });
  player.add(text(scene, 0, -13, 'Player123', 18, '#ffffff'));
  group.add([avatar, player, progressBar(scene, 87, 62, 104, profile.progress, 0x3eea3a, 17)]);
  const badge = panel(scene, 84, 62, 27, 27, { fill: 0x03aaff, stroke: 0xafffff, radius: 8 });
  badge.add(text(scene, 0, 0, String(profile.level), 15, '#ffffff'));
  group.add([badge, text(scene, 143, 62, `${profile.currentXp}/${profile.neededXp}`, 12, '#ffffff')]);
  let coinText!: Phaser.GameObjects.Text;
  [false, true].forEach((star, i) => {
    const y = 30 + i * 37;
    const chip = panel(scene, 295, y, 150, 30, { fill: 0x085aaa, stroke: 0x178cda, radius: 9, shadow: false });
    const value = text(scene, 294, y, (star ? save.stars : save.coins).toLocaleString('en'), 18, '#ffffff');
    const plus = button(scene, 359, y, 28, 28, '+', () => {
      if (canNavigate()) showCurrencyGuide(scene, star);
    }, COLORS.success, 'success');
    group.add([chip, gameIcon(scene, 228, y, star ? 'star' : 'coin', 36), value, plus]);
    if (!star) coinText = value;
  });
  const settings = button(scene, 356, 111, 42, 42, '', onSettings);
  settings.add(gameIcon(scene, 0, 0, 'settings', 34));
  group.add(settings);
  return { group, coinText };
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
  nav.add(panel(scene, W / 2, 797, 382, 93, { fill: 0x04589f, stroke: 0x24cfff, radius: 25 }));
  const items: Array<[string, string, () => void]> = [
    ['hat', 'Build', () => scene.scene.start('CityScene')],
    ['puzzle', 'Puzzles', () => scene.scene.start('CampaignScene')],
    ['shop', 'Shop', () => showCurrencyGuide(scene)],
    ['friends', 'Friends', () => showCharacterPicker(scene)],
  ];
  items.forEach(([icon, label, action], i) => {
    const tile = button(scene, 51 + i * 96, 794, 82, 79, '', action);
    tile.add([gameIcon(scene, 0, -10, icon, 52), text(scene, 0, 25, label, 16, '#ffffff')]);
    nav.add(tile);
  });
}

export const CHARACTERS = [
  ['builder', 'Builder Boy'], ['planner', 'City Planner'], ['worker', 'Construction'],
  ['chef', 'Chef'], ['mechanic', 'Mechanic'], ['sailor', 'Sailor'], ['tourist', 'Tourist'], ['corgi', 'Corgi'],
];

export function showCharacterPicker(scene: Phaser.Scene) {
  const group = scene.add.container(0, 0).setName('blocking-dialog').setDepth(5000);
  group.add([
    scene.add.rectangle(W / 2, H / 2, W, H, 0x063667, 0.72).setInteractive(),
    panel(scene, W / 2, 419, 354, 560, { fill: 0xeafaff, stroke: 0x50cfff, radius: 26 }),
    text(scene, W / 2, 170, 'MEET YOUR NEIGHBORS', 21),
    text(scene, W / 2, 199, 'Choose your portrait', 14, '#2270a8'),
  ]);
  CHARACTERS.forEach(([id, name], i) => {
    const x = 103 + (i % 2) * 184, y = 257 + Math.floor(i / 2) * 101;
    const selected = loadSave().avatar === id;
    const tile = panel(scene, x, y, 155, 89, { fill: selected ? 0xe5ffd5 : i % 2 ? 0xffe6f2 : 0xd9f4ff, stroke: selected ? 0x39c54d : 0x9cdaf1, radius: 16 });
    tile.add([gameIcon(scene, 0, -11, id, 62), text(scene, 0, 30, name, 12)]);
    tile.setSize(155, 89).setInteractive({ useHandCursor: true }).on('pointerup', () => {
      updateSave(save => ({ ...save, avatar: id }));
      group.destroy(true);
      scene.scene.restart();
    });
    group.add(tile);
  });
  group.add(button(scene, W / 2, 656, 280, 40, 'BACK', () => group.destroy(true)));
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
