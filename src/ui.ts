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
  const artLoaded = scene.textures.exists("bc-ui");
  const bg = artLoaded
    ? scene.add.image(0, 0, "bc-ui", "ui/resource-chip").setDisplaySize(width, 40)
    : scene.add.rectangle(0, 0, width, 40, COLORS.panel, 0.92).setStrokeStyle(1, 0x24434b, 0.9);
  const ico = artLoaded && scene.textures.exists("bc-icons")
    ? scene.add.image(-width / 2 + 19, 0, "bc-icons", icon === "●" ? "icons/coin" : icon === "★" ? "icons/star" : undefined).setDisplaySize(22, 22)
    : text(scene, -width / 2 + 19, 0, icon, 16, "#f6f1e4");
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
  const artLoaded = scene.textures.exists("bc-ui");
  const frame = color === COLORS.gold || color === 0x8a682d ? "ui/button-gold" : color === COLORS.mintDark || color === 0x315b52 ? "ui/button-green" : "ui/button-blue";
  const shadow = artLoaded ? undefined : scene.add.rectangle(0, 5, width, height, 0x000000, 0.26);
  const bg = artLoaded
    ? scene.add.image(0, 0, "bc-ui", frame).setDisplaySize(width, height)
    : scene.add.rectangle(0, 0, width, height, color, 1).setStrokeStyle(1, 0xffffff, 0.08);
  const labelText = text(scene, 0, -1, label, artLoaded ? Math.max(12, Math.round(height * 0.28)) : 15, frame === "ui/button-gold" ? "#073b77" : "#ffffff", "800");
  c.add([...(shadow ? [shadow] : []), bg, labelText]);
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

export function bottomNav(scene: Phaser.Scene, active: "home" | "puzzle" | "city" | "campaign" | "daily" | "event" | "profile") {
  const bar = scene.add.rectangle(W / 2, 817, W, 54, 0x071823, 0.97)
    .setStrokeStyle(1, 0x1d4350, 0.9)
    .setDepth(55);
  const items = [
    { id: "home" as const, label: "HOME", icon: "icons/map", target: "HomeScene" },
    { id: "puzzle" as const, label: "PUZZLE", icon: "icons/puzzle", target: "PuzzleScene" },
    { id: "city" as const, label: "CITY", icon: "icons/build", target: "CityScene" },
    { id: "campaign" as const, label: "CAMPAIGN", icon: "icons/rocket", target: "CampaignScene" },
    { id: "daily" as const, label: "DAILY", icon: "icons/gift", target: "DailyScene" },
    { id: "event" as const, label: "EVENT", icon: "icons/badge", target: "EventScene" },
    { id: "profile" as const, label: "PROFILE", icon: "icons/trophy", target: "ProgressScene" },
  ];
  const startX = 28;
  const gap = 56;
  items.forEach((item, index) => {
    const x = startX + index * gap;
    const activeItem = item.id === active;
    const group = scene.add.container(x, 817).setDepth(56);
    if (activeItem) {
      group.add(scene.add.circle(0, -7, 16, 0x1e8d76, 0.42));
    }
    const icon = scene.textures.exists("bc-icons")
      ? scene.add.image(0, -9, "bc-icons", item.icon).setDisplaySize(20, 20)
      : scene.add.text(0, -10, "•", { fontSize: "18px", color: activeItem ? "#6fe6ef" : "#6f8c95" }).setOrigin(0.5);
    if (activeItem && "setTint" in icon) icon.setTint(0xffd36d);
    const label = scene.add.text(0, 12, item.label, {
      fontFamily: "Inter, system-ui",
      fontSize: "6px",
      fontStyle: "bold",
      color: activeItem ? "#f4d77b" : "#75939d",
      letterSpacing: 0.3,
    }).setOrigin(0.5);
    group.add([icon, label]);
    group.setSize(48, 46).setInteractive({ useHandCursor: true });
    group.on("pointerup", () => scene.scene.start(item.target));
  });
  return bar;
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
