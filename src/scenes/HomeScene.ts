import { preloadReferenceArt } from '../referenceArt';
import Phaser from "phaser";
import { gameIcon, button, COLORS, panel, text, W, playerHud, homeNavigation } from "../ui";
import { loadSave, updateSave } from "../save";
import { localDateKey } from "../retention";

/** Reference 1: scenery, oversized logo, a single play action and four toy tabs. */
export class HomeScene extends Phaser.Scene {
  constructor() { super("HomeScene"); }
  preload() {
    preloadReferenceArt(this);
    if (!this.textures.exists("block-city-coast-hero"))
      this.load.image("block-city-coast-hero", "/assets/block-city-coast-hero.png");
  }
  create() {
    const save = loadSave();
    this.add.image(W / 2, 422, "block-city-coast-hero").setDisplaySize(W, 844);
    playerHud(this, () => this.showSettings());
    const block = text(this, W / 2, 178, "BLOCK", 73, "#ffffff", "800");
    block.setStroke("#07509b", 10).setShadow(0, 8, "#062e65", 0, true, true).setAngle(-3);
    const city = text(this, W / 2, 250, "CITY", 83, "#ffdc28", "800");
    city.setStroke("#a75407", 7).setShadow(0, 7, "#06326a", 0, true, true).setAngle(-3);
    const ribbon = panel(this, W / 2, 310, 272, 39, { fill: 0x008eff, stroke: 0x72efff, radius: 11 });
    ribbon.add(text(this, 0, -1, "Build, Puzzle, Grow", 23, "#ffffff"));

    // Small optional destinations leave the harbor unobstructed.
    [['DailyScene', 'chest', 'Daily'], ['EventScene', 'trophy', 'Event']].forEach(([target, icon, label], i) => {
      const y = 398 + i * 83;
      const tile = button(this, 43, y, 58, 57, '', () => this.scene.start(target));
      tile.add(gameIcon(this, 0, -2, icon, 47));
      text(this, 43, y + 38, label, 12, '#ffffff').setStroke('#064c91', 3);
      if (i === 0 && save.lastCheckinDate !== localDateKey())
        this.add.circle(67, y - 25, 7, COLORS.coral).setStrokeStyle(2, 0xffffff);
    });
    const play = button(this, W / 2, 675, 318, 88, 'PLAY', () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    (play.list[4] as Phaser.GameObjects.Text).setFontSize(40).setX(20);
    play.add(this.add.triangle(-90, 0, 0, 0, 0, 32, 27, 16, 0x073976).setStrokeStyle(2, 0xfff4a0));
    this.tweens.add({ targets: play, scale: 1.015, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    homeNavigation(this);
  }
  private showSettings() {
    const save = loadSave();
    const group = this.add.container(0, 0).setDepth(200);
    const dim = this.add.rectangle(W / 2, 422, W, 844, 0x063667, 0.7).setInteractive();
    const card = panel(this, W / 2, 420, W - 58, 286, { fill: 0xf8fdff, stroke: 0x79cfee, radius: 24, shadowAlpha: 0.4 });
    const title = text(this, W / 2, 322, "SETTINGS", 21, "#123767", "800");
    const subtitle = text(this, W / 2, 350, "Make Block City feel just right", 9, "#66839c", "700");
    const sound = button(this, W / 2, 397, W - 104, 44, save.soundEnabled ? "Sound • On" : "Sound • Off", () => {
      updateSave((current) => ({ ...current, soundEnabled: !current.soundEnabled }));
      group.destroy(true);
      this.showSettings();
    }, save.soundEnabled ? COLORS.success : 0x8aa7b8, save.soundEnabled ? "success" : "muted");
    const haptics = button(this, W / 2, 451, W - 104, 44, save.hapticsEnabled ? "Haptics • On" : "Haptics • Off", () => {
      updateSave((current) => ({ ...current, hapticsEnabled: !current.hapticsEnabled }));
      group.destroy(true);
      this.showSettings();
    }, save.hapticsEnabled ? COLORS.success : 0x8aa7b8, save.hapticsEnabled ? "success" : "muted");
    const close = button(this, W / 2, 518, W - 104, 44, "BACK TO CITY", () => group.destroy(true), COLORS.primary, "primary");
    group.add([dim, card, title, subtitle, sound, haptics, close]);
  }
}
