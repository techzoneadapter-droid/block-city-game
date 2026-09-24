import Phaser from "phaser";
import { loadSave, updateSave } from "../save";
import { profileLevelFromXp } from "../progression";
import {
  coastTexture,
  wheelTexture,
  logoTexture,
  iconTexture,
  faceTexture,
  type HomeIcon,
} from "./art";

function copy(
  scene: Phaser.Scene,
  x: number,
  y: number,
  value: string,
  size: number,
  color = "#ffffff",
) {
  return scene.add
    .text(x, y, value, {
      fontFamily: '"Arial Rounded MT Bold", Arial, sans-serif',
      fontSize: `${size}px`,
      fontStyle: "bold",
      color,
      align: "center",
      stroke: color === "#ffffff" ? "#07549a" : "#fff58c",
      strokeThickness: color === "#ffffff" ? 2 : 0,
    })
    .setOrigin(0.5);
}
function icon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: HomeIcon,
  size: number,
) {
  return scene.add
    .image(x, y, iconTexture(scene, kind))
    .setDisplaySize(size, size);
}
/** Press only activates if released over the same control. The face sinks into
 * a fixed contact shadow, then springs back; no scene-wide input handlers. */
function toyButton(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  theme: "blue" | "gold" | "green",
  action: () => void,
) {
  const group = scene.add.container(x, y);
  const shadow = scene.add.ellipse(0, h / 2 + 9, w * 0.94, 12, 0x02264e, 0.38);
  const face = scene.add.container(0, 0);
  face.add(
    scene.add
      .image(0, 3, faceTexture(scene, w, h, theme))
      .setDisplaySize(w + 12, h + 16),
  );
  group.add([shadow, face]);
  group.setSize(w, h + 10).setInteractive({ useHandCursor: true });
  let pressed = false;
  const reset = () => {
    pressed = false;
    scene.tweens.killTweensOf(face);
    scene.tweens.add({
      targets: face,
      y: 0,
      scaleY: 1,
      duration: 220,
      ease: "Back.Out",
    });
    shadow.setScale(1);
  };
  group.on("pointerdown", () => {
    pressed = true;
    scene.tweens.killTweensOf(face);
    scene.tweens.add({ targets: face, y: 5, scaleY: 0.96, duration: 65 });
    shadow.setScale(0.9, 0.65);
  });
  group.on("pointerout", reset);
  group.on("pointerup", () => {
    const activate = pressed;
    reset();
    if (activate) action();
  });
  return { group, face };
}
function pane(scene: Phaser.Scene, x: number, y: number, w: number, h: number) {
  const g = scene.add.graphics();
  g.fillStyle(0x03599b, 0.62).fillRoundedRect(x, y, w, h, 12);
  g.lineStyle(1, 0x65d9ff, 0.5).strokeRoundedRect(x, y, w, h, 12);
  return g;
}
function modal(scene: Phaser.Scene, title: string, h = 320) {
  const g = scene.add.container(0, 0).setDepth(5000).setName("blocking-dialog");
  g.add(
    scene.add.rectangle(195, 422, 390, 844, 0x022c55, 0.77).setInteractive(),
  );
  const y = 422 - h / 2;
  const card = scene.add.graphics();
  card.fillStyle(0x063d77).fillRoundedRect(24, y + 8, 342, h, 25);
  card.fillStyle(0xeafaff).fillRoundedRect(24, y, 342, h, 25);
  card.lineStyle(3, 0x6ae6ff).strokeRoundedRect(24, y, 342, h, 25);
  g.add(card);
  g.add(copy(scene, 195, y + 35, title, 23, "#06457d"));
  const close = toyButton(scene, 195, y + h - 40, 264, 42, "blue", () =>
    g.destroy(true),
  );
  close.face.add(copy(scene, 0, 0, "BACK", 18));
  g.add(close.group);
  return { g, y };
}
function currencyGuide(scene: Phaser.Scene, stars = false) {
  const { g, y } = modal(scene, stars ? "BUILDING STARS" : "CITY SHOP");
  g.add(icon(scene, 195, y + 90, stars ? "star" : "coin", 56));
  g.add(
    copy(
      scene,
      195,
      y + 149,
      stars
        ? "Win puzzles to earn stars.\nSpend them to grow your city!"
        : "Earn coins from puzzles and daily gifts.\nUse them for puzzle boosters.",
      15,
      "#236589",
    ),
  );
  const b = toyButton(scene, 195, y + 214, 264, 44, "gold", () =>
    scene.scene.start(stars ? "CampaignScene" : "DailyScene"),
  );
  b.face.add(
    copy(scene, 0, 0, stars ? "PLAY & EARN" : "DAILY GIFTS", 19, "#07376b"),
  );
  g.add(b.group);
}
function companions(scene: Phaser.Scene) {
  const { g, y } = modal(scene, "YOUR CITY CREW", 470);
  const ids: HomeIcon[] = [
    "builder",
    "planner",
    "worker",
    "chef",
    "mechanic",
    "sailor",
    "tourist",
    "corgi",
  ];
  const names = [
    "Builder",
    "Planner",
    "Worker",
    "Chef",
    "Mechanic",
    "Sailor",
    "Tourist",
    "Corgi",
  ];
  g.add(copy(scene, 195, y + 68, "Small people. Big stories.", 15, "#287caa"));
  ids.forEach((id, i) => {
    const x = 73 + (i % 4) * 81,
      yy = y + 135 + Math.floor(i / 4) * 128;
    const tile = toyButton(
      scene,
      x,
      yy,
      63,
      80,
      loadSave().avatar === id ? "green" : "blue",
      () => {
        updateSave((s) => ({ ...s, avatar: id }));
        g.destroy(true);
        scene.scene.restart();
      },
    );
    tile.face.add(icon(scene, 0, -9, id, 58));
    tile.face.add(copy(scene, 0, 29, names[i], 11));
    g.add(tile.group);
  });
  g.add(
    copy(
      scene,
      195,
      y + 354,
      "Choose a companion for your next adventure.",
      12,
      "#287caa",
    ),
  );
}
export function settings(scene: Phaser.Scene) {
  const save = loadSave();
  const { g, y } = modal(scene, "SETTINGS", 334);
  g.add(
    copy(scene, 195, y + 70, "Make Block City feel just right", 13, "#287caa"),
  );
  const toggle = (
    yy: number,
    label: string,
    on: boolean,
    action: () => void,
  ) => {
    const b = toyButton(scene, 195, yy, 264, 46, on ? "green" : "blue", () => {
      action();
      g.destroy(true);
      settings(scene);
    });
    b.face.add(copy(scene, 0, 0, `${label}  •  ${on ? "ON" : "OFF"}`, 18));
    g.add(b.group);
  };
  toggle(y + 126, "SOUND", save.soundEnabled, () =>
    updateSave((s) => ({ ...s, soundEnabled: !s.soundEnabled })),
  );
  toggle(y + 194, "HAPTICS", save.hapticsEnabled, () =>
    updateSave((s) => ({ ...s, hapticsEnabled: !s.hapticsEnabled })),
  );
}
/** Safari exposes notch/home-indicator insets in CSS pixels; convert them to
 * logical canvas pixels without changing the scale or layout of other scenes. */
function safeInsets(scene: Phaser.Scene) {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const css = getComputedStyle(probe),
    ratio = 390 / scene.scale.displaySize.width;
  const top = Math.max(0, (parseFloat(css.paddingTop) || 0) * ratio - 18);
  const bottom = Math.max(0, (parseFloat(css.paddingBottom) || 0) * ratio - 8);
  probe.remove();
  return { top, bottom };
}
export function createHome(scene: Phaser.Scene) {
  const insets = safeInsets(scene);
  const save = loadSave(),
    profile = profileLevelFromXp(save.xp);
  scene.add.image(195, 422, coastTexture(scene)).setDisplaySize(390, 844);
  const wheel = scene.add
    .image(308, 467, wheelTexture(scene))
    .setDisplaySize(104, 104);
  scene.tweens.add({ targets: wheel, angle: 360, duration: 95000, repeat: -1 });
  // Three short glints use shared graphics, without rebuilding the scene texture.
  for (const [i, x, y] of [
    [0, 112, 591],
    [1, 291, 614],
    [2, 42, 428],
  ]) {
    const glint = scene.add
      .graphics()
      .lineStyle(1.2, 0xdfffff, 0.85)
      .lineBetween(-9, 0, 9, 0)
      .lineBetween(0, -2, 0, 2)
      .setPosition(x, y);
    scene.tweens.add({
      targets: glint,
      alpha: 0.1,
      x: x + 7,
      duration: 1900 + i * 400,
      yoyo: true,
      repeat: -1,
    });
  }
  // Compact HUD has its own runtime icon family, regardless of cached global art.
  const hudStart = scene.children.list.length;
  pane(scene, 62, 28, 143, 61);
  const avatar = toyButton(scene, 42, 55, 54, 60, "green", () =>
    scene.scene.start("ProgressScene"),
  );
  const avatarKind = (
    [
      "builder",
      "planner",
      "worker",
      "chef",
      "mechanic",
      "sailor",
      "tourist",
      "corgi",
    ].includes(save.avatar)
      ? save.avatar
      : "builder"
  ) as HomeIcon;
  avatar.face.add(icon(scene, 0, -2, avatarKind, 58));
  copy(scene, 134, 43, "Player123", 19);
  const track = scene.add.graphics();
  track.fillStyle(0x03457d).fillRoundedRect(87, 61, 108, 20, 6);
  track.lineStyle(1.5, 0x033567).strokeRoundedRect(87, 61, 108, 20, 6);
  if (profile.progress > 0) {
    track
      .fillStyle(0x36df40)
      .fillRoundedRect(89, 63, Math.max(6, 104 * profile.progress), 16, 4);
    track
      .fillStyle(0xc4ff70, 0.5)
      .fillRoundedRect(91, 64, Math.max(3, 100 * profile.progress), 5, 3);
  }
  const badge = scene.add.graphics();
  const pts = [0, -16, 12, -8, 14, 7, 0, 18, -14, 7, -12, -8];
  badge
    .fillStyle(0x0053b7)
    .fillPoints(
      pts
        .map((_, i) =>
          i % 2 ? null : new Phaser.Geom.Point(84 + pts[i], 71 + pts[i + 1]),
        )
        .filter(Boolean) as Phaser.Geom.Point[],
      true,
    );
  badge
    .lineStyle(2, 0x99faff)
    .strokePoints(
      pts
        .map((_, i) =>
          i % 2 ? null : new Phaser.Geom.Point(84 + pts[i], 71 + pts[i + 1]),
        )
        .filter(Boolean) as Phaser.Geom.Point[],
      true,
    );
  copy(scene, 84, 71, String(profile.level), 17);
  copy(scene, 144, 71, `${profile.currentXp}/${profile.neededXp}`, 12);
  [false, true].forEach((star, i) => {
    const y = 41 + i * 38;
    pane(scene, 228, y - 15, 143, 30);
    icon(scene, 232, y, star ? "star" : "coin", 35);
    const value = copy(
      scene,
      294,
      y,
      (star ? save.stars : save.coins).toLocaleString("en"),
      19,
    );
    if (value.width > 79) value.setScale(79 / value.width);
    const plus = toyButton(scene, 359, y, 25, 27, "green", () =>
      currencyGuide(scene, star),
    );
    plus.face.add(copy(scene, 0, -1, "+", 30));
  });
  const hud = scene.add.container(0, insets.top);
  hud.add(scene.children.list.slice(hudStart).filter((child) => child !== hud));
  const gear = toyButton(scene, 357, 127, 39, 41, "blue", () =>
    settings(scene),
  );
  gear.face.add(icon(scene, 0, 0, "settings", 34));
  // The title is the primary silhouette above the skyline.
  scene.add.image(195, 228, logoTexture(scene)).setDisplaySize(366, 185);
  const ribbon = scene.add.graphics();
  ribbon.fillStyle(0x043f90).fillRoundedRect(79, 312, 238, 30, 8);
  ribbon.fillStyle(0x049afa).fillRoundedRect(77, 307, 238, 30, 8);
  ribbon.lineStyle(1.5, 0x7ae8ff).strokeRoundedRect(77, 307, 238, 30, 8);
  copy(scene, 196, 322, "Build, Puzzle, Grow", 21);
  // Foreground CTA and toy navigation, anchored inside the 390 × 844 safe frame.
  const play = toyButton(scene, 195, 692 - insets.bottom, 300, 76, "gold", () =>
    scene.scene.start("PuzzleScene"),
  );
  play.face.add(
    scene.add
      .triangle(-81, -1, 0, 0, 0, 31, 25, 15.5, 0x07396c)
      .setStrokeStyle(1.5, 0xfff8a6),
  );
  play.face.add(copy(scene, 25, -1, "PLAY", 43, "#063566"));
  // A very small scale pulse does not fight the face's pressed y animation.
  scene.tweens.add({
    targets: play.group,
    scaleX: 1.009,
    scaleY: 1.009,
    duration: 1600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
  });
  const dock = scene.add.graphics().setY(-insets.bottom);
  dock.fillStyle(0x033b75, 0.9).fillRoundedRect(2, 748, 386, 96, 27);
  dock.lineStyle(2, 0x158fcb, 0.8).strokeRoundedRect(2, 748, 386, 96, 27);
  const items: Array<[HomeIcon, string, () => void]> = [
    ["hat", "Build", () => scene.scene.start("CityScene")],
    ["puzzle", "Puzzles", () => scene.scene.start("CampaignScene")],
    ["shop", "Shop", () => currencyGuide(scene)],
    ["friends", "Friends", () => companions(scene)],
  ];
  items.forEach(([kind, title, action], i) => {
    const b = toyButton(
      scene,
      51 + i * 96,
      787 - insets.bottom,
      78,
      79,
      "blue",
      action,
    );
    b.face.add(icon(scene, 0, -12, kind, 55));
    b.face.add(copy(scene, 0, 26, title, 16));
    const ring = scene.add
      .graphics()
      .lineStyle(2, 0xe0ffff)
      .strokeRoundedRect(-40, -43, 80, 83, 22)
      .setAlpha(0);
    b.face.add(ring);
    b.group.on("pointerover", () => {
      ring.setAlpha(1);
      b.face.setScale(1.025);
    });
    b.group.on("pointerdown", () => ring.setAlpha(1));
    b.group.on("pointerout", () => {
      ring.setAlpha(0);
      b.face.setScale(1);
    });
    if (i === 0 && save.stars > 0) {
      const g = scene.add.graphics();
      g.fillStyle(0x8e1334).fillCircle(29, -35, 10);
      g.fillStyle(0xff4651).fillCircle(29, -38, 10);
      g.lineStyle(1.5, 0xffd9b8).strokeCircle(29, -38, 9);
      g.fillStyle(0xffffff, 0.8).fillEllipse(27, -42, 7, 3);
      b.face.add(g);
    }
  });
}
