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

      if (empty) {
        // Empty board slots are intentionally RECESSED, not raised blocks.
        // This mirrors the reference board: placed pieces should carry almost all of the visual weight.
        g.fillStyle(0x082f5d, 0.9).fillRoundedRect(1, 1, 62, 62, 9);
        g.fillStyle(0x174f80, 1).fillRoundedRect(5, 5, 54, 54, 7);
        g.fillStyle(0x0b355f, 0.82).fillRoundedRect(8, 8, 48, 47, 6);
        g.fillStyle(0x236b9c, 1).fillRoundedRect(9, 10, 46, 44, 5);
        g.lineStyle(2, 0x06294f, 0.72).lineBetween(10, 10, 53, 10);
        g.lineStyle(2, 0x06294f, 0.55).lineBetween(10, 10, 10, 51);
        g.lineStyle(2, 0x71b9dc, 0.24).lineBetween(11, 54, 53, 54);
        g.lineStyle(2, 0x71b9dc, 0.18).lineBetween(55, 13, 55, 52);
        g.fillStyle(0xffffff, 0.025).fillRoundedRect(14, 15, 34, 9, 4);
      } else {
        // Filled pieces are intentionally chunky and glossy, with a visible lower extrusion.
        const r = (color >> 16) & 255, gg = (color >> 8) & 255, b = color & 255;
        const darker = (Math.max(0, Math.round(r * 0.62)) << 16) |
          (Math.max(0, Math.round(gg * 0.62)) << 8) |
          Math.max(0, Math.round(b * 0.62));
        const lighter = (Math.min(255, Math.round(r + (255 - r) * 0.22)) << 16) |
          (Math.min(255, Math.round(gg + (255 - gg) * 0.22)) << 8) |
          Math.min(255, Math.round(b + (255 - b) * 0.22));

        g.fillStyle(0x062f6c, 0.28).fillRoundedRect(3, 7, 58, 55, 9);
        g.fillStyle(darker, 1).fillRoundedRect(2, 6, 60, 55, 9);
        g.fillStyle(color, 1).fillRoundedRect(2, 1, 60, 55, 8);
        g.fillStyle(lighter, 0.46).fillRoundedRect(6, 5, 52, 16, 6);
        g.fillStyle(0xffffff, 0.78).fillRoundedRect(8, 6, 14, 5, 2);
        g.fillStyle(0xffffff, 0.2).fillPoints([{x: 5, y: 8}, {x: 11, y: 4}, {x: 57, y: 4}, {x: 52, y: 11}, {x: 11, y: 11}], true);
        g.fillStyle(darker, 0.34).fillRoundedRect(8, 49, 48, 7, 3);
        g.lineStyle(2, 0xffffff, 0.58).strokeRoundedRect(4, 3, 56, 51, 7);
        g.lineStyle(1, 0x063b72, 0.3).strokeRoundedRect(2, 1, 60, 58, 8);
      }
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
