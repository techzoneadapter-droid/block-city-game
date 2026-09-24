import Phaser from "phaser";
import { button, COLORS, panel, text, W, H, playerHud, homeNavigation } from "../ui";
import { VOXEL_BIOMES, createFerrisWheel, createVoxelBoat, createVoxelBridge, createVoxelBuilding, createVoxelLogo, createVoxelTree, drawVoxelBiomeBackdrop, voxelGroundTile } from "../voxelArt";
import { loadSave, updateSave } from "../save";


/** Reference 1: scenery, oversized logo, a single play action and four toy tabs. */
export class HomeScene extends Phaser.Scene {
  constructor() { super("HomeScene"); }
  create() {
    drawVoxelBiomeBackdrop(this, VOXEL_BIOMES.grass, W, H);
    this.buildOriginalVoxelCity();
    playerHud(this, () => this.showSettings());
    createVoxelLogo(this, W / 2, 226, 0.84).setDepth(70);
    const ribbon = panel(this, W / 2, 316, 268, 38, { fill: 0x078ee9, stroke: 0x79efff, radius: 10 }).setDepth(72);
    ribbon.add(text(this, 0, -1, "Build, Puzzle, Grow", 22, "#ffffff"));

    const play = button(this, W / 2, 680, 318, 88, 'PLAY', () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold').setDepth(90);
    (play.list[4] as Phaser.GameObjects.Text).setFontSize(40).setX(20);
    play.add(this.add.triangle(-90, 0, 0, 0, 0, 32, 27, 16, 0x073976).setStrokeStyle(2, 0xfff4a0));
    this.tweens.add({ targets: play, scale: 1.015, duration: 1100, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    homeNavigation(this);
  }
  private buildOriginalVoxelCity() {
    // Water first, then islands, then props/buildings. Nothing is sampled from the reference images.
    const water = this.add.graphics().setDepth(1);
    water.fillStyle(0x12b7e8, 0.96).fillRect(0, 500, W, 208);
    water.fillStyle(0x0e8ec9, 0.45).fillRect(0, 620, W, 88);
    for (let i = 0; i < 11; i++) water.fillStyle(0xffffff, 0.17).fillRect((i * 49) % W, 520 + (i % 5) * 31, 38 + (i % 3) * 8, 3);

    const base = voxelGroundTile(this, W / 2, 466, 360, 184, 0x5dc65d, 0x845936).setDepth(4);
    base.setScale(1, 1.03);
    voxelGroundTile(this, 71, 387, 96, 58, 0x67cb62, 0x845936).setDepth(3);
    voxelGroundTile(this, 322, 374, 92, 55, 0x67cb62, 0x845936).setDepth(3);

    const buildings: Array<[number, number, "house" | "cafe" | "apartment" | "office" | "lighthouse" | "market" | "tower", number, number]> = [
      [52, 458, "house", 2, 0.82], [103, 444, "cafe", 3, 0.84], [154, 419, "apartment", 2, 0.82],
      [205, 421, "office", 2, 0.84], [258, 446, "market", 2, 0.78], [315, 411, "lighthouse", 2, 0.72],
      [87, 506, "market", 2, 0.72], [146, 496, "house", 2, 0.68], [218, 495, "apartment", 2, 0.71],
      [285, 492, "cafe", 2, 0.72], [336, 470, "house", 2, 0.62],
    ];
    buildings.forEach(([x, y, kind, stage, scale], i) => {
      const b = createVoxelBuilding(this, kind, stage, scale).setPosition(x, y).setDepth(20 + y);
      this.tweens.add({ targets: b, y: y - 1.5, duration: 1900 + i * 95, yoyo: true, repeat: -1, ease: "Sine.InOut", delay: i * 55 });
    });

    [[29,491],[49,420],[123,480],[184,479],[246,468],[355,486],[333,392],[90,395],[293,435]].forEach(([x,y],i)=>{
      const tree=createVoxelTree(this,x,y,0.48+(i%3)*0.035,"grass").setDepth(16+y);
      this.tweens.add({targets:tree,angle:i%2?0.8:-0.8,duration:2500+i*80,yoyo:true,repeat:-1,ease:"Sine.InOut"});
    });

    createFerrisWheel(this, 342, 468, 0.78).setDepth(455);
    createVoxelBridge(this, 98, 558, 170, 1).setDepth(570);
    const boatA=createVoxelBoat(this, 288, 573, 0.72).setDepth(578);
    const boatB=createVoxelBoat(this, 185, 621, 0.58).setDepth(625).setScale(-0.58,0.58);
    this.tweens.add({targets:boatA,x:318,y:568,duration:4800,yoyo:true,repeat:-1,ease:"Sine.InOut"});
    this.tweens.add({targets:boatB,x:145,y:626,duration:5600,yoyo:true,repeat:-1,ease:"Sine.InOut"});

    // Small voxel quay blocks to give the city a strong harbor silhouette.
    const quay=this.add.graphics().setDepth(540);
    quay.fillStyle(0xe0c49b).fillRect(18,533,240,13);
    quay.fillStyle(0x8a6548).fillRect(18,546,240,8);
    for(let i=0;i<8;i++) quay.fillStyle(0x6d4c39).fillRect(28+i*30,531,5,28);
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
