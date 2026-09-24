import Phaser from "phaser";
import { COLORS, button, gameSettings, homeNavigation, playerHud, text } from "../ui";
import { coastTexture, logoTexture, wheelTexture } from "./art";

/**
 * Home is assembled from the approved Home/Logo/UI/Navigation reference boards.
 * It intentionally uses the shared runtime UI kit so the first screen cannot
 * drift away from Puzzle and City.
 */
function safeInsets(scene: Phaser.Scene) {
  const probe = document.createElement("div");
  probe.style.cssText =
    "position:fixed;visibility:hidden;pointer-events:none;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)";
  document.body.appendChild(probe);
  const css = getComputedStyle(probe);
  const ratio = 390 / scene.scale.displaySize.width;
  const top = Math.max(0, (parseFloat(css.paddingTop) || 0) * ratio - 18);
  const bottom = Math.max(0, (parseFloat(css.paddingBottom) || 0) * ratio - 8);
  probe.remove();
  return { top, bottom };
}

function addAtmosphere(scene: Phaser.Scene) {
  // Small runtime accents keep the Home alive without rebuilding the large
  // procedural coast texture every frame.
  for (const [i, x, y] of [
    [0, 88, 594],
    [1, 286, 610],
    [2, 42, 452],
    [3, 327, 418],
  ] as const) {
    const glint = scene.add.graphics().setDepth(8);
    glint.lineStyle(1.2, 0xdfffff, 0.88);
    glint.lineBetween(-10, 0, 10, 0);
    glint.lineBetween(0, -2.5, 0, 2.5);
    glint.setPosition(x, y);
    scene.tweens.add({
      targets: glint,
      alpha: 0.12,
      x: x + 8,
      duration: 1700 + i * 430,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  }

  const birds = text(scene, 302, 182, "⌁   ⌁", 13, "#ffffff", "800").setDepth(8).setAlpha(0.92);
  scene.tweens.add({
    targets: birds,
    x: 248,
    y: 188,
    alpha: 0.45,
    duration: 6800,
    repeat: -1,
    repeatDelay: 1800,
    onRepeat: () => birds.setPosition(322, 178).setAlpha(0.92),
    ease: "Sine.InOut",
  });
}

export function createHome(scene: Phaser.Scene) {
  const insets = safeInsets(scene);

  // Full hero scene based on the approved 9:16 Home reference.
  scene.add.image(195, 422, coastTexture(scene)).setDisplaySize(390, 844).setDepth(0);
  addAtmosphere(scene);

  const wheel = scene.add.image(309, 468, wheelTexture(scene)).setDisplaySize(104, 104).setDepth(15);
  scene.tweens.add({ targets: wheel, angle: 360, duration: 98000, repeat: -1, ease: "Linear" });

  // Shared HUD: player, XP, currencies and settings in one consistent system.
  const hud = playerHud(scene, () => gameSettings(scene));
  hud.group.setY(insets.top).setDepth(200);

  // Logo silhouette is intentionally the dominant object between HUD and city.
  scene.add.image(195, 227 + insets.top * 0.2, logoTexture(scene)).setDisplaySize(356, 180).setDepth(40);

  // Main CTA follows the approved yellow face / orange extrusion / navy outline.
  const play = button(
    scene,
    195,
    688 - insets.bottom,
    310,
    78,
    "PLAY",
    () => scene.scene.start("CampaignScene"),
    COLORS.gold,
    "gold",
  ).setDepth(210);
  play.add(
    scene.add
      .triangle(-92, -1, 0, 0, 0, 33, 27, 16.5, 0x07396c)
      .setStrokeStyle(1.5, 0xfff6a2),
  );
  const label = play.getData("labelText") as Phaser.GameObjects.Text | undefined;
  if (label) {
    label.setX(24).setFontSize(35).setStyle({ fontStyle: "bold" });
    label.setShadow(0, 2, "#fff5a3", 0, false, true);
  }
  scene.tweens.add({
    targets: play,
    scaleX: 1.008,
    scaleY: 1.008,
    duration: 1600,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
  });

  // Four-button Home navigation from the dedicated navigation reference.
  const nav = homeNavigation(scene);
  nav.setY(-insets.bottom).setDepth(220);
}
