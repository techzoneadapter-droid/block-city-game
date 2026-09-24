import Phaser from "phaser";
import { ensureBlockMaterialTexture, materialFromColor } from "./art/blockMaterials";

/**
 * Reusable Block City voxel cell.
 *
 * Filled cells use the material system from the approved Puzzle Asset sheet.
 * Empty cells stay recessed and dark so the 8×8 board reads like a toy tray
 * rather than a grid of generic buttons.
 */
export class ToyBlock extends Phaser.GameObjects.Container {
  fillColor: number;
  private face: Phaser.GameObjects.Image;
  private edge: Phaser.GameObjects.Graphics;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    private side: number,
    color: number,
  ) {
    super(scene, x, y);
    this.fillColor = color;
    this.face = scene.add.image(0, 0, this.textureFor(color));
    this.edge = scene.add.graphics();
    this.add([this.face, this.edge]);
    this.refreshFace(color);
    this.setSize(side, side);
    scene.add.existing(this);
  }

  private isEmpty(color: number) {
    return materialFromColor(color) === "empty";
  }

  private textureFor(color: number) {
    return ensureBlockMaterialTexture(this.scene, materialFromColor(color));
  }

  private refreshFace(color: number) {
    const empty = this.isEmpty(color);
    this.face.setTexture(this.textureFor(color));
    if (empty) {
      // The empty material is intentionally inset and slightly smaller.
      this.face.setDisplaySize(this.side * 0.96, this.side * 0.91).setY(1.5).setAlpha(0.98);
    } else {
      // Material textures include their own top/right voxel faces.
      this.face.setDisplaySize(this.side * 1.08, this.side * 1.02).setY(-1.5).setAlpha(1);
    }
  }

  setFillStyle(color: number, alpha = 1) {
    this.fillColor = color;
    this.refreshFace(color);
    this.face.setAlpha(alpha);
    return this;
  }

  setStrokeStyle(width: number, color: number, alpha = 1) {
    this.edge.clear();
    if (width > 0) {
      this.edge
        .lineStyle(width, color, alpha)
        .strokeRoundedRect(
          -this.side / 2 + 1,
          -this.side / 2 + 1,
          this.side - 2,
          this.side - 2,
          Math.max(4, this.side * 0.13),
        );
    }
    return this;
  }
}
