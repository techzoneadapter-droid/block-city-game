import Phaser from "phaser";
import { COLORS, button, gameSettings, homeNavigation, playerHud } from "../ui";
import { BlockCityLogo } from "../ui/logo";
import {
  boatTexture,
  cabinTexture,
  HARBOR_WHEEL,
  wheelHubTexture,
  wheelRimTexture,
} from "./harbor";

function harborLife(scene: Phaser.Scene, motion: boolean) {
  for (const [x, y, size, yacht] of [
    [40, 422, 30, 0],
    [244, 615, 69, 1],
    [126, 617, 58, 0],
  ]) {
    const boat = scene.add
      .image(x, y, boatTexture(scene, !!yacht))
      .setDisplaySize(size, (size * 95) / 90)
      .setDepth(12);
    if (motion)
      scene.tweens.add({
        targets: boat,
        x: x + 7,
        y: y + 1.6,
        duration: 4800 + x * 9,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
  }
  const { x, y, size } = HARBOR_WHEEL;
  const supports = scene.add.graphics().setDepth(13);
  supports
    .lineStyle(7, 0x276d9d)
    .lineBetween(x, y, x - 22, y + 65)
    .lineBetween(x, y, x + 25, y + 65);
  supports
    .lineStyle(3.5, 0xfff6de)
    .lineBetween(x - 1, y, x - 23, y + 63)
    .lineBetween(x + 1, y, x + 24, y + 63);
  supports.fillStyle(0xfce8bd).fillEllipse(x + 1, y + 66, 60, 12);
  const rim = scene.add
    .image(x, y, wheelRimTexture(scene))
    .setDisplaySize(size, size)
    .setDepth(14);
  const cabins = Array.from({ length: 16 }, (_, i) =>
    scene.add
      .image(
        0,
        0,
        cabinTexture(scene, ["#fc405b", "#168df4", "#ffbf24"][i % 3]),
      )
      .setDisplaySize(12, 14)
      .setDepth(15),
  );
  const orbit = { angle: 0 };
  const positionCabins = () =>
    cabins.forEach((c, i) => {
      const a = orbit.angle + (i * Math.PI) / 8;
      c.setPosition(
        x + Math.cos(a) * size * 0.4,
        y + Math.sin(a) * size * 0.4 + 3,
      );
    });
  positionCabins();
  scene.add
    .image(x, y, wheelHubTexture(scene))
    .setDisplaySize(20, 22)
    .setDepth(16);
  if (motion) {
    scene.tweens.add({
      targets: rim,
      angle: 360,
      duration: 120000,
      repeat: -1,
      ease: "Linear",
    });
    scene.tweens.add({
      targets: orbit,
      angle: Math.PI * 2,
      duration: 120000,
      repeat: -1,
      ease: "Linear",
      onUpdate: positionCabins,
    });
  }
  for (const [i, gx, gy] of [
    [0, 65, 469],
    [1, 264, 624],
    [2, 165, 383],
    [3, 38, 596],
  ]) {
    const g = scene.add.graphics().setPosition(gx, gy).setDepth(10);
    g.lineStyle(1, 0xe4ffff, 0.9)
      .lineBetween(-7, 0, 7, 0)
      .lineBetween(0, -2, 0, 2);
    if (motion)
      scene.tweens.add({
        targets: g,
        x: gx + 6,
        alpha: 0.15,
        duration: 1800 + i * 550,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
  }
  // Drawn gulls, with no font glyph or emoji dependency.
  for (const [gx, gy, s] of [
    [43, 257, 1],
    [354, 279, 0.8],
  ]) {
    const g = scene.add.graphics().setPosition(gx, gy).setScale(s).setDepth(8);
    g.lineStyle(2, 0xffffff, 0.95);
    g.beginPath();
    g.moveTo(-9, -2);
    g.lineTo(-3, -4);
    g.lineTo(0, 0);
    g.lineTo(5, -6);
    g.lineTo(12, -7);
    g.strokePath();
  }
}

export function createHome(scene: Phaser.Scene) {
  const motion = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  scene.cameras.main.fadeIn(motion ? 180 : 0, 7, 54, 103);
  if (!scene.textures.exists("home-harbor"))
    throw new Error("Home harbor artwork failed to load.");
  scene.add.rectangle(195, 422, 390, 844, 0x1599f5);
  scene.add.image(195, 502, "home-harbor").setDisplaySize(390, 844);
  harborLife(scene, motion);
  const hud = playerHud(
    scene,
    () => gameSettings(scene),
    () => true,
    "home",
  );
  hud.group.setDepth(200);
  const logoY = 197;
  const logo = BlockCityLogo(scene, 195, logoY, 352, "home").setDepth(40);
  if (motion)
    scene.tweens.add({
      targets: logo,
      y: logoY - 2,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });
  button(
    scene,
    195,
    687,
    304,
    76,
    "PLAY",
    () => scene.scene.start("CampaignScene"),
    COLORS.gold,
    "gold",
    { fontSize: 41 },
  )
    .setName("home-play")
    .setDepth(210);
  homeNavigation(scene).setDepth(220);
}
