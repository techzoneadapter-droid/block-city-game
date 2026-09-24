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
      const empty = color === 0x194e83 || color === 0x1666a7 || color === 0x1b5d87 || color === 0x155c8f || color === 0x2f6d96 || color === 0x4a3844 || color === 0x6d6152 || color === 0x33425d;

      if (empty) {
        // Recessed voxel socket: square, deep and quiet so placed cubes dominate.
        g.fillStyle(0x071f3d, 0.95).fillRect(0, 0, 64, 64);
        g.fillStyle(color, 1).fillRect(5, 5, 54, 54);
        g.fillStyle(0x061a32, 0.42).fillRect(7, 7, 50, 5);
        g.fillStyle(0x061a32, 0.34).fillRect(7, 7, 5, 50);
        g.fillStyle(0xffffff, 0.1).fillRect(12, 53, 43, 3);
        g.fillStyle(0xffffff, 0.06).fillRect(54, 12, 3, 41);
        // subtle pixel noise, never glossy
        g.fillStyle(0xffffff, 0.025).fillRect(17, 19, 8, 8).fillRect(38, 34, 6, 6);
      } else {
        const r = (color >> 16) & 255, gg = (color >> 8) & 255, b = color & 255;
        const shade = (factor: number) => {
          const rr = Math.max(0, Math.min(255, Math.round(r * factor)));
          const rg = Math.max(0, Math.min(255, Math.round(gg * factor)));
          const rb = Math.max(0, Math.min(255, Math.round(b * factor)));
          return (rr << 16) | (rg << 8) | rb;
        };
        const dark = shade(0.56), midDark = shade(0.78), light = shade(1.16);

        // Minecraft-like cube face: almost square with a visible top ledge and right extrusion.
        g.fillStyle(0x051a33, 0.28).fillRect(4, 8, 58, 54);
        g.fillStyle(dark, 1).fillRect(3, 6, 59, 55);
        g.fillStyle(midDark, 1).fillRect(5, 4, 56, 54);
        g.fillStyle(color, 1).fillRect(5, 2, 52, 52);

        // top face / right face illusion
        g.fillStyle(light, 1).fillPoints([{x:5,y:2},{x:12,y:0},{x:62,y:0},{x:57,y:6},{x:5,y:6}], true);
        g.fillStyle(midDark, 0.92).fillPoints([{x:57,y:6},{x:62,y:0},{x:62,y:53},{x:57,y:58}], true);
        g.fillStyle(dark, 0.92).fillPoints([{x:5,y:54},{x:57,y:54},{x:62,y:58},{x:10,y:58}], true);

        // pixel texture patches instead of plastic gradients
        g.fillStyle(light, 0.22).fillRect(11, 12, 10, 8).fillRect(31, 8, 7, 7).fillRect(41, 25, 9, 8);
        g.fillStyle(dark, 0.16).fillRect(16, 33, 8, 7).fillRect(31, 40, 12, 8).fillRect(8, 45, 6, 5);
        g.fillStyle(0xffffff, 0.45).fillRect(8, 7, 16, 3);
        g.lineStyle(2, dark, 0.75).strokeRect(5, 2, 52, 52);
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
