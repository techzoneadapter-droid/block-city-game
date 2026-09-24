import Phaser from "phaser";
import { button, COLORS, panel, text, W, H, playerHud, homeNavigation } from "../ui";
import { VOXEL_BIOMES, createVoxelBuilding, createVoxelLogo, createVoxelTree, drawVoxelBiomeBackdrop, voxelGroundTile } from "../voxelArt";
import { loadSave, updateSave } from "../save";


/** Reference 1: scenery, oversized logo, a single play action and four toy tabs. */
export class HomeScene extends Phaser.Scene {
  constructor() { super("HomeScene"); }
  create() {
    drawVoxelBiomeBackdrop(this, VOXEL_BIOMES.grass, W, H);
    this.buildOriginalVoxelCity();
    playerHud(this, () => this.showSettings());
    createVoxelLogo(this, W / 2, 225, 0.78);
    const ribbon = panel(this, W / 2, 310, 272, 39, { fill: 0x008eff, stroke: 0x72efff, radius: 11 });
    ribbon.add(text(this, 0, -1, "Build, Puzzle, Grow", 23, "#ffffff"));

    const play = button(this, W / 2, 675, 318, 88, 'PLAY', () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    (play.list[4] as Phaser.GameObjects.Text).setFontSize(40).setX(20);
    play.add(this.add.triangle(-90, 0, 0, 0, 0, 32, 27, 16, 0x073976).setStrokeStyle(2, 0xfff4a0));
    this.tweens.add({ targets: play, scale: 1.015, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    homeNavigation(this);
  }
  private buildOriginalVoxelCity() {
    const base = voxelGroundTile(this, W / 2, 475, 360, 180, 0x58c35d, 0x8a5a35).setDepth(2);
    base.setScale(1, 1.05);

    const buildings: Array<[number, number, "house" | "cafe" | "apartment" | "office" | "lighthouse" | "market" | "tower", number, number]> = [
      [62, 470, "house", 2, 0.9], [115, 450, "cafe", 3, 0.9], [172, 428, "apartment", 2, 0.86],
      [228, 435, "office", 2, 0.82], [286, 452, "house", 2, 0.88], [332, 425, "lighthouse", 2, 0.72],
      [82, 515, "market", 2, 0.78], [150, 515, "house", 2, 0.72], [237, 510, "apartment", 2, 0.72],
      [305, 500, "cafe", 2, 0.76],
    ];
    buildings.forEach(([x,y,kind,stage,scale], i) => {
      const b = createVoxelBuilding(this, kind, stage, scale).setPosition(x,y).setDepth(20+y);
      this.tweens.add({ targets: b, y: y - 2, duration: 1800 + i*90, yoyo: true, repeat: -1, ease: "Sine.InOut", delay: i*70 });
    });

    [[32,508],[53,430],[130,485],[198,490],[267,470],[347,492],[315,392],[101,397]].forEach(([x,y],i)=>{
      const tree = createVoxelTree(this,x,y,0.55 + (i%3)*0.04,"grass").setDepth(15+y);
      this.tweens.add({targets:tree, angle:i%2?1.1:-1.1, duration:2400+i*100, yoyo:true, repeat:-1, ease:"Sine.InOut"});
    });

    // Original blocky river/harbor foreground.
    const water = this.add.graphics().setDepth(1);
    water.fillStyle(0x16b9ee,0.9).fillRect(0,540,W,160);
    for(let i=0;i<8;i++) water.fillStyle(0xffffff,0.18).fillRect((i*57)%W,560+i*13,44,3);
    const bridge = this.add.graphics().setDepth(40);
    bridge.fillStyle(0xd5c39f).fillRect(18,552,220,18);
    bridge.fillStyle(0x90765b).fillRect(18,570,220,10);
    for(let i=0;i<8;i++) bridge.fillStyle(0x5a4637).fillRect(30+i*28,548,6,34);
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
