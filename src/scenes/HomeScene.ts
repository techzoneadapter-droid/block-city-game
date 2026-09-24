import { prepareReferenceTextures, referenceArt } from "../referenceArt";
import Phaser from "phaser";
import { button, COLORS, coastalBackdrop, panel, text, W, playerHud, homeNavigation } from "../ui";
import { loadSave, updateSave } from "../save";

/**
 * Home is the marketing-quality front door: one clear PLAY action,
 * a living original toy-city hero, and four non-duplicated bottom destinations.
 */
export class HomeScene extends Phaser.Scene {
  constructor() { super("HomeScene"); }

  create() {
    prepareReferenceTextures(this);
    coastalBackdrop(this);
    const save = loadSave();

    playerHud(this, () => this.showSettings());

    const logo = referenceArt(this, W / 2, 218, "logo", 356, 152);
    logo?.setDepth(8);

    const ribbon = panel(this, W / 2, 306, 272, 39, { fill: 0x078de8, stroke: 0x7beeff, radius: 11, shadowAlpha: 0.28 });
    ribbon.setDepth(8);
    ribbon.add(text(this, 0, -1, "Build, Puzzle, Grow", 21, "#ffffff", "800"));

    this.createCityHero();

    const journey = panel(this, W / 2, 590, 224, 40, { fill: 0xf6fdff, stroke: 0x6fdcff, radius: 13, shadowAlpha: 0.22 });
    journey.add([
      text(this, -52, -1, `CITY JOURNEY`, 12, "#2872a0", "800"),
      text(this, 62, -1, `LEVEL ${Math.min(save.level, 30)}`, 15, "#123767", "800"),
    ]);

    const play = button(this, W / 2, 666, 318, 86, "PLAY", () => this.scene.start("CampaignScene"), COLORS.gold, "gold");
    const playText = play.list.find((child) => child instanceof Phaser.GameObjects.Text) as Phaser.GameObjects.Text | undefined;
    playText?.setFontSize(39).setX(20);
    play.add(this.add.triangle(-91, 0, 0, 0, 0, 32, 27, 16, 0x073976).setStrokeStyle(2, 0xfff4a0));
    this.tweens.add({ targets: play, scale: 1.014, duration: 1150, yoyo: true, repeat: -1, ease: "Sine.InOut" });

    homeNavigation(this);
  }

  private createCityHero() {
    const glow = this.add.ellipse(W / 2, 486, 358, 184, 0xdffaff, 0.23).setDepth(1);
    const island = this.add.graphics().setDepth(2);
    island.fillStyle(0x70d250, 0.96);
    island.beginPath();
    island.moveTo(31, 523); island.lineTo(193, 435); island.lineTo(360, 520); island.lineTo(195, 600); island.closePath(); island.fillPath();
    island.fillStyle(0xb97b47, 0.92);
    island.beginPath();
    island.moveTo(31, 523); island.lineTo(195, 600); island.lineTo(195, 616); island.lineTo(31, 540); island.closePath(); island.fillPath();
    island.fillStyle(0x895735, 0.9);
    island.beginPath();
    island.moveTo(195, 600); island.lineTo(360, 520); island.lineTo(360, 537); island.lineTo(195, 616); island.closePath(); island.fillPath();

    const art = (name: string, x: number, y: number, w: number, h: number, depth: number) =>
      referenceArt(this, x, y, name, w, h)?.setDepth(depth);

    art("bridge", 194, 558, 155, 82, 3);
    art("house", 74, 517, 72, 88, 4);
    art("apartment", 132, 489, 79, 111, 5);
    art("tower", 195, 460, 86, 145, 6);
    art("coffee", 258, 516, 79, 91, 6);
    art("lighthouse", 329, 449, 58, 92, 5);
    art("wheel", 307, 520, 91, 101, 7);
    art("tree", 48, 500, 44, 53, 7);
    art("tree", 103, 451, 37, 46, 7);
    art("palm", 281, 462, 42, 49, 7);
    art("tree", 348, 505, 39, 47, 7);
    art("sailboat", 51, 575, 42, 43, 6);
    art("sailboat", 336, 582, 39, 40, 6);

    this.tweens.add({ targets: glow, alpha: { from: 0.16, to: 0.3 }, duration: 1800, yoyo: true, repeat: -1, ease: "Sine.InOut" });
  }

  private showSettings() {
    const save = loadSave();
    const group = this.add.container(0, 0).setName("blocking-dialog").setDepth(5000);
    const dim = this.add.rectangle(W / 2, 422, W, 844, 0x063667, 0.7).setInteractive();
    const card = panel(this, W / 2, 420, W - 58, 286, { fill: 0xf8fdff, stroke: 0x79cfee, radius: 24, shadowAlpha: 0.4 });
    const title = text(this, W / 2, 322, "SETTINGS", 21, "#123767", "800");
    const subtitle = text(this, W / 2, 350, "Make Block City feel just right", 11, "#66839c", "700");
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
