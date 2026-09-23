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
      const empty = color === 0x194e83 || color === 0x1666a7;
      g.fillStyle(0x062f6c, empty ? 0.55 : 0.28).fillRoundedRect(2, 5, 60, 58, 9);
      // Graphics.generateTexture uses Canvas, which does not support fillGradientStyle.
      // A solid saturated face with layered bevels preserves the actual piece color.
      g.fillStyle(empty ? 0x185b99 : color, 1);
      g.fillRoundedRect(1, 1, 62, 58, 8);
      g.fillStyle(0xffffff, empty ? 0.035 : 0.17).fillRoundedRect(8, 8, 47, 24, 5);
      g.fillStyle(0xffffff, empty ? 0.14 : 0.42).fillPoints([{x: 5, y: 7}, {x: 13, y: 3}, {x: 57, y: 3}, {x: 50, y: 12}, {x: 12, y: 12}], true);
      g.fillStyle(0xffffff, empty ? 0.07 : 0.18).fillPoints([{x: 4, y: 12}, {x: 11, y: 17}, {x: 11, y: 49}, {x: 4, y: 56}], true);
      g.fillStyle(0x00366f, empty ? 0.2 : 0.18).fillPoints([{x: 55, y: 13}, {x: 62, y: 8}, {x: 62, y: 55}, {x: 55, y: 50}], true);
      g.lineStyle(empty ? 2 : 3, empty ? 0x58b7ea : 0xffffff, empty ? 0.55 : 0.62).strokeRoundedRect(4, 4, 55, 52, 6);
      if (!empty) g.lineStyle(2, 0xffffff, 0.65).lineBetween(13, 4, 51, 4);
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
