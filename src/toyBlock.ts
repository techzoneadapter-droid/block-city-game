import Phaser from 'phaser';

/** Reusable beveled block: the same face in the board and the piece tray. */
export class ToyBlock extends Phaser.GameObjects.Container {
  fillColor: number;
  private face: Phaser.GameObjects.Image;
  private edge: Phaser.GameObjects.Graphics;
  constructor(scene: Phaser.Scene, x: number, y: number, private side: number, color: number) {
    super(scene, x, y);
    this.fillColor = color;
    this.face = scene.add.image(0, 0, this.textureFor(color)).setDisplaySize(side, side);
    this.edge = scene.add.graphics();
    this.add([this.face, this.edge]);
    this.setSize(side, side);
    scene.add.existing(this);
  }
  private textureFor(color: number) {
    const key = `block-face-${color}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      const empty = color === 0x194e83;
      g.fillStyle(color).fillRoundedRect(1, 1, 62, 62, 7);
      g.fillStyle(0x022b66, empty ? 0.3 : 0.24).fillPoints([{x: 3, y: 58}, {x: 10, y: 51}, {x: 53, y: 51}, {x: 61, y: 59}, {x: 55, y: 63}, {x: 8, y: 63}], true);
      g.fillStyle(0xffffff, empty ? 0.06 : 0.5).fillPoints([{x: 4, y: 6}, {x: 10, y: 2}, {x: 56, y: 2}, {x: 51, y: 10}, {x: 12, y: 10}], true);
      g.fillStyle(0xffffff, empty ? 0.03 : 0.2).fillPoints([{x: 3, y: 9}, {x: 10, y: 15}, {x: 10, y: 50}, {x: 3, y: 57}], true);
      g.fillStyle(0x004087, 0.15).fillPoints([{x: 55, y: 12}, {x: 62, y: 7}, {x: 62, y: 56}, {x: 55, y: 50}], true);
      if (!empty) g.lineStyle(2, 0xffffff, 0.5).lineBetween(12, 3, 52, 3);
      g.generateTexture(key, 64, 64); g.destroy();
    }
    return key;
  }
  setFillStyle(color: number, alpha = 1) {
    this.fillColor = color;
    this.face.setTexture(this.textureFor(color)).setAlpha(alpha);
    return this;
  }
  setStrokeStyle(width: number, color: number, alpha = 1) {
    this.edge.clear().lineStyle(width, color, alpha).strokeRoundedRect(-this.side / 2 + 1, -this.side / 2 + 1, this.side - 2, this.side - 2, 5);
    return this;
  }
}
