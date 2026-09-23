import { preloadReferenceArt, referenceArt } from '../referenceArt';
import Phaser from "phaser";
import { gameIcon, button, COLORS, panel, text, W, playerHud, homeNavigation } from "../ui";
import { loadSave, updateSave } from "../save";


/** Reference 1: scenery, oversized logo, a single play action and four toy tabs. */
export class HomeScene extends Phaser.Scene {
  constructor() { super("HomeScene"); }
  preload() {
    preloadReferenceArt(this);
    if (!this.textures.exists("block-city-coast-hero"))
      this.load.image("block-city-coast-hero", "/assets/block-city-coast-hero.png");
  }
  create() {
    this.add.image(W / 2, 422, "block-city-coast-hero").setDisplaySize(W, 844);
    playerHud(this, () => this.showSettings());
    referenceArt(this, W / 2, 224, 'logo', 360, 158);
    const ribbon = panel(this, W / 2, 310, 272, 39, { fill: 0x008eff, stroke: 0x72efff, radius: 11 });
    ribbon.add(text(this, 0, -1, "Build, Puzzle, Grow", 23, "#ffffff"));

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
