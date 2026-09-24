import { referenceArt } from './referenceArt';
import { loadSave, updateSave } from "./save";
import { profileLevelFromXp } from "./progression";
import { audio } from "./audio";
import Phaser from "phaser";
import { coastTexture } from "./home/art";

export const W = 390;
export const H = 844;

export { COLORS, UI } from "./ui/tokens";
import { COLORS, UI, hex } from "./ui/tokens";
import { surfaceTexture, iconTexture } from "./ui/art";
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
    fontFamily: UI.font,
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
  const fill = options.fill ?? COLORS.panel;
  const dark = ((fill >> 16) & 255) < 90 && (fill & 255) > 90;
  const stroke = options.stroke ?? (dark ? COLORS.ink : COLORS.outline);
  const key = surfaceTexture(scene, width, height - 4, {
    top: dark ? mixColor(fill, COLORS.primary, .35) : fill,
    bottom: dark ? mixColor(fill, COLORS.primaryDark, .5) : mixColor(fill, COLORS.panel2, .45),
    edge: dark ? COLORS.primaryDark : mixColor(stroke, COLORS.panelBlue, .5),
    outline: dark ? COLORS.ink : stroke,
    highlight: dark ? COLORS.cyan : 0xffffff,
    radius: options.radius ?? UI.radii.card,
    depth: UI.extrusion.card,
    shadow: options.shadow,
    shadowAlpha: options.shadowAlpha,
    shadowColor: options.shadowColor,
  });
  container.add(scene.add.image(0, 2, key).setDisplaySize(width + 24, height + 28).setAlpha(options.alpha ?? 1));
  return container;
}

export function WhiteCardPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, options: PanelOptions = {}) {
  return panel(scene, x, y, w, h, { fill: COLORS.panel, ...options });
}
export function BluePanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, options: PanelOptions = {}) {
  return panel(scene, x, y, w, h, { fill: COLORS.primaryDark, stroke: COLORS.ink, ...options });
}
export function RewardPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, options: PanelOptions = {}) {
  return panel(scene, x, y, w, h, { fill: COLORS.cream, stroke: COLORS.gold, ...options });
}
export const CreamPanel = RewardPanel;
export function StatCard(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, value: string, icon: string) {
  const root = WhiteCardPanel(scene, x, y, w, h);
  root.add([gameIcon(scene, -w * .29, -3, icon, Math.min(40, h * .65)),
    text(scene, w * .12, -9, value, UI.type.label), text(scene, w * .12, 14, label, UI.type.caption, hex(COLORS.textSoft))]);
  return root;
}
export function TaskCard(scene: Phaser.Scene, x: number, y: number, w: number, label: string, icon: string, current: number, total: number) {
  const root = WhiteCardPanel(scene, x, y, w, 84);
  root.add([gameIcon(scene, -w / 2 + 40, 0, icon, 68),
    text(scene, -w / 2 + 84, -18, label, UI.type.body).setOrigin(0, .5).setWordWrapWidth(w - 100),
    progressBar(scene, -w / 2 + 84, 19, w - 142, total > 0 ? current / total : 0, COLORS.mint, 16),
    text(scene, w / 2 - 29, 18, `${current}/${total}`, UI.type.small)]);
  return root;
}
export const TaskRow = TaskCard;

export function pill(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width: number,
  label: string,
  icon: string,
  value: string,
) {
  return ResourceChip(scene, x, y, width, 36, icon === '★' ? 'star' : 'coin', Number(value));
}

export type ButtonStyle = "primary" | "secondary" | "success" | "gold" | "danger" | "muted";

function buttonColors(color: number, style?: ButtonStyle) {
  if (style === "muted") return { top: 0xd2d9e2, bottom: 0x96a1b2, edge: 0x69768b, highlight: 0xeef4fb, text: "#374353" };
  if (style === "gold" || color === COLORS.gold || color === COLORS.goldDark || color === 0x8a682d)
    return { top: 0xfff52b, bottom: 0xffc300, edge: 0xff8508, highlight: 0xfff796, text: hex(COLORS.ink) };
  if (style === "success" || color === COLORS.mintDark || color === COLORS.success)
    return { top: 0x45ed20, bottom: 0x00c637, edge: 0x048d2d, highlight: 0xb9ff94, text: "#ffffff" };
  if (style === "danger") return { top: 0xff7873, bottom: 0xef3049, edge: 0x9e203b, highlight: 0xffb3b8, text: "#ffffff" };
  return { top: 0x00bdff, bottom: 0x0060fb, edge: 0x0343b2, highlight: COLORS.cyan, text: "#ffffff" };
}
export type ButtonOptions = { icon?: string; disabled?: boolean; selected?: boolean; fontSize?: number };
export type GameButton = Phaser.GameObjects.Container & { setDisabled: (disabled: boolean) => GameButton };

export function button(
  scene: Phaser.Scene, x: number, y: number, width: number, height: number,
  label: string, onClick: () => void, color = COLORS.primary, style?: ButtonStyle,
  options: ButtonOptions = {},
): GameButton {
  const root = scene.add.container(x, y) as GameButton;
  const face = scene.add.container(0, 0);
  const gold = style === 'gold' || color === COLORS.gold;
  const radius = Math.min(UI.radii.button, height * .31);
  const depth = gold ? UI.extrusion.primary : UI.extrusion.control;
  const plate = scene.add.image(0, 4, '__WHITE').setDisplaySize(width + 24, height + 32);
  const iconName = options.icon ?? (gold && label === 'PLAY' ? 'play' : undefined);
  const fontSize = options.fontSize ?? (height >= 70 ? 32 : height >= 48 ? 20 : height >= 34 ? 14 : 11);
  const labelText = text(scene, iconName ? height * .23 : 0, -1, label, fontSize, '#ffffff', '800').setName('button-label');
  const available = width - (iconName ? height + 14 : 20);
  if (labelText.width > available) labelText.setFontSize(Math.max(10, fontSize * available / labelText.width));
  face.add(labelText);
  if (iconName) face.add(gameIcon(scene, -labelText.width / 2 - height * .22, -1, iconName, height * .62));
  root.add([plate, face]);
  root.setData('labelText', labelText).setData('buttonFace', face);
  root.setSize(width, Math.max(44, height + depth)).setInteractive({ useHandCursor: true });
  let disabled = options.disabled ?? false;
  let pressed = false;
  const render = () => {
    const palette = buttonColors(color, disabled ? 'muted' : style);
    const key = surfaceTexture(scene, width, height, {
      ...palette, radius, depth: pressed ? 1 : depth, selected: options.selected,
      top: pressed ? mixColor(palette.top, palette.edge, .3) : palette.top,
      bottom: pressed ? mixColor(palette.bottom, palette.edge, .18) : palette.bottom,
      pressed,
    });
    plate.setTexture(key).setDisplaySize(width + 24, height + 32).setY(4 + (pressed ? depth - 1 : 0));
    face.setY(pressed ? depth - 1 : 0);
    labelText.setColor(palette.text).setShadow(0, gold || disabled ? 1 : 2, gold ? '#fff79b' : disabled ? '#edf1f7' : '#003b9a', 0, false, true);
    root.setData('disabled', disabled).setData('pressed', pressed);
  };
  root.setDisabled = (value: boolean) => {
    disabled = value; pressed = false;
    if (value) root.disableInteractive(); else root.setInteractive({ useHandCursor: true });
    render(); return root;
  };
  const release = () => { if (pressed) { pressed = false; render(); } };
  root.on('pointerout', release);
  root.on('pointerdown', () => { if (!disabled) { pressed = true; render(); } });
  root.on('pointerup', () => { const activate = pressed && !disabled; release(); if (activate) onClick(); });
  // A released pointer outside the canvas must not leave a control depressed.
  scene.input.on('pointerup', release);
  root.once('destroy', () => scene.input.off('pointerup', release));
  root.setDisabled(disabled);
  return root;
}
export function PrimaryCTA(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, onClick: () => void, options: ButtonOptions = {}) {
  return button(scene, x, y, w, h, label, onClick, COLORS.gold, 'gold', options);
}
export function SecondaryButton(scene: Phaser.Scene, x: number, y: number, w: number, h: number, label: string, onClick: () => void, options: ButtonOptions = {}) {
  return button(scene, x, y, w, h, label, onClick, COLORS.primary, 'secondary', options);
}
export function SquareIconButton(scene: Phaser.Scene, x: number, y: number, size: number, icon: string, onClick: () => void) {
  const root = SecondaryButton(scene, x, y, size, size, '', onClick);
  (root.getData('buttonFace') as Phaser.GameObjects.Container).add(gameIcon(scene, 0, 0, icon, size * .79));
  return root;
}
export function ResourcePlusButton(scene: Phaser.Scene, x: number, y: number, size: number, onClick: () => void) {
  const root = button(scene, x, y, size, size, '', onClick, COLORS.success, 'success');
  (root.getData('buttonFace') as Phaser.GameObjects.Container).add(gameIcon(scene, 0, 0, 'plus', size * .78));
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
  const value = Phaser.Math.Clamp(Number.isFinite(progress) ? progress : 0, 0, 1);
  const root = scene.add.container(x, y);
  const track = surfaceTexture(scene, width, height, { top: 0xa6cbed, bottom: 0xd4eafa, edge: 0x88b4dc, outline: 0x80afdc, highlight: 0xcdeeff, radius: height / 2, depth: 0, shadow: false });
  root.add(scene.add.image(width / 2, 4, track).setDisplaySize(width + 24, height + 32));
  if (value > 0) {
    const fillWidth = Math.max(2, (width - 4) * value);
    const fill = scene.add.graphics();
    // Clip-free geometry preserves the exact fill fraction, even near zero.
    fill.fillStyle(0x088d2d).fillRoundedRect(2, -height / 2 + 1, fillWidth, height - 2, Math.min(fillWidth / 2, height / 2));
    fill.fillStyle(color).fillRoundedRect(3, -height / 2 + 2, Math.max(1, fillWidth - 2), height - 4, Math.min(fillWidth / 2, height / 2));
    fill.lineStyle(2, 0xd6ff9d, .9).lineBetween(4, -height / 2 + 4, Math.max(4, fillWidth - 1), -height / 2 + 4);
    root.add(fill);
  }
  return root;
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
  const key = iconTexture(scene, kind);
  if (key) return scene.add.image(x, y, key).setDisplaySize(size, size);
  return referenceArt(scene, x, y, kind, size)!;
}

export function BottomNavButton(scene: Phaser.Scene, x: number, y: number, size: number, icon: string, label: string, onClick: () => void, selected = false, notification = false) {
  const root = button(scene, x, y, size, size, '', onClick, COLORS.primary, 'secondary', { selected });
  const face = root.getData('buttonFace') as Phaser.GameObjects.Container;
  face.add([gameIcon(scene, 0, -size * .13, icon, size * .67),
    text(scene, 0, size * .32, label, size >= 78 ? 15 : 12, '#ffffff', '800').setStroke('#06409a', 2)]);
  if (notification) face.add(gameIcon(scene, size * .37, -size * .41, 'notification', size * .31));
  return root;
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
    const tile = BottomNavButton(scene, x, 796, 67, item.icon, item.label, () => {
      if (!selected && canNavigate()) item.action();
    }, selected, alerts.includes(item.key));
    nav.add(tile);
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

export function AvatarFrame(scene: Phaser.Scene, x: number, y: number, size: number, avatar: string) {
  const root = panel(scene, x, y, size, size, { fill: 0x65e835, stroke: 0xffffff, radius: size * .24, shadow: false });
  root.add(gameIcon(scene, 0, 1, avatar, size * 1.04));
  return root;
}
export function LevelBadge(scene: Phaser.Scene, x: number, y: number, size: number, level: number) {
  const root = scene.add.container(x, y);
  root.add([gameIcon(scene, 0, 0, 'level', size), text(scene, 0, 0, String(level), size * .4, '#ffffff', '800').setStroke('#0064c2', 2)]);
  return root;
}
export function PlayerHudChip(scene: Phaser.Scene, x: number, y: number, width: number, height: number, data: { name: string; avatar: string; level: number; currentXp: number; neededXp: number; progress: number }, onAvatar: () => void) {
  const root = BluePanel(scene, x, y, width, height, { stroke: COLORS.cyan, radius: 16 });
  const avatarSize = height - 2;
  const avatar = AvatarFrame(scene, -width / 2 + avatarSize / 2, 0, avatarSize, data.avatar);
  avatar.setSize(avatarSize, avatarSize).setInteractive({ useHandCursor: true }).on('pointerup', onAvatar);
  const left = -width / 2 + avatarSize + 6;
  const available = width - avatarSize - 18;
  const name = text(scene, left, -height * .27, data.name, Math.min(20, height * .28), '#ffffff', '800').setOrigin(0, .5).setShadow(0, 2, '#07539f', 0, false, true);
  if (name.width > available) name.setScale(available / name.width);
  const track = panel(scene, left + available / 2 + 2, height * .20, available, 22, { fill: 0x053679, stroke: 0x042b60, radius: 9, shadow: false });
  const xp = progressBar(scene, left + 9, height * .20, available - 14, data.progress, COLORS.mint, 17);
  const count = text(scene, left + available / 2 + 7, height * .20, `${data.currentXp}/${data.neededXp}`, width > 220 ? 14 : 11, '#ffffff', '800').setStroke('#06549b', 2);
  root.add([avatar, name, track, xp, LevelBadge(scene, left, height * .20, 34, data.level), count]);
  return root;
}
export function ResourceChip(scene: Phaser.Scene, x: number, y: number, width: number, height: number, kind: 'coin' | 'gem' | 'star', value: number, onPlus?: () => void) {
  const root = BluePanel(scene, x, y, width, height, { fill: 0x074986, stroke: 0x0861ac, radius: 9, shadow: false });
  const valueText = text(scene, onPlus ? -1 : 8, -1, value.toLocaleString('en'), height * .56, '#ffffff', '800').setShadow(0, 1, '#002b60', 0, false, true);
  const maxWidth = width - (onPlus ? height * 1.7 : height);
  if(valueText.width > maxWidth) valueText.setScale(maxWidth / valueText.width);
  root.add([gameIcon(scene, -width / 2 + 3, -1, kind, height * 1.3), valueText]);
  if(onPlus) root.add(ResourcePlusButton(scene, width / 2 - 4, -1, height, onPlus));
  root.setData('valueText', valueText);
  return root;
}
export function CoinChip(scene: Phaser.Scene, x: number, y: number, w: number, value: number, onPlus?: () => void, h = 32) { return ResourceChip(scene, x, y, w, h, 'coin', value, onPlus); }
export function GemChip(scene: Phaser.Scene, x: number, y: number, w: number, value: number, onPlus?: () => void, h = 32) { return ResourceChip(scene, x, y, w, h, 'gem', value, onPlus); }
export function StarChip(scene: Phaser.Scene, x: number, y: number, w: number, value: number, onPlus?: () => void, h = 32) { return ResourceChip(scene, x, y, w, h, 'star', value, onPlus); }

export function playerHud(scene: Phaser.Scene, onSettings: () => void, canNavigate = () => true) {
  const save = loadSave();
  const profile = profileLevelFromXp(save.xp);
  const group = scene.add.container(0, 0).setDepth(100);
  group.add(PlayerHudChip(scene, 103, 45, 184, 66, { ...profile, name: 'Player123', avatar: save.avatar }, () => {
    if (canNavigate()) scene.scene.start('ProgressScene');
  }));
  const coins = CoinChip(scene, 291, 25, 134, save.coins, () => { if (canNavigate()) showCurrencyGuide(scene); });
  const stars = StarChip(scene, 291, 65, 134, save.stars, () => { if (canNavigate()) showCurrencyGuide(scene, true); });
  const settings = SquareIconButton(scene, 356, 111, 44, 'settings', onSettings);
  group.add([coins, stars, settings]);
  return { group, coinText: coins.getData('valueText') as Phaser.GameObjects.Text, settings };
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
  nav.add(panel(scene, W / 2, 805, 388, 78, { fill: 0x033f7f, stroke: 0x2bc9ff, radius: 23, shadowAlpha: 0.3 }));
  const items: Array<[string, string, () => void]> = [
    ["hat", "Build", () => scene.scene.start("CityScene")],
    ["puzzle", "Puzzles", () => scene.scene.start("CampaignScene")],
    ["shop", "Shop", () => showCurrencyGuide(scene)],
    ["friends", "Friends", () => showCharacterPicker(scene)],
  ];
  items.forEach(([iconName, label, action], i) => {
    const tile = BottomNavButton(scene, 51 + i * 96, 792, 82, iconName, label, action, false, i === 0 && loadSave().stars > 0);
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
