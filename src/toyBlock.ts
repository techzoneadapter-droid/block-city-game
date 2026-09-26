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
    this.face.setTexture(this.textureFor(color));
    this.face.setDisplaySize(this.side, this.side).setY(0).setAlpha(1);
  }

  setFillStyle(color: number, alpha = 1) {
    this.fillColor = color;
    this.refreshFace(color);
    this.face.setAlpha(alpha);
    return this;
  }

  setStrokeStyle(width: number, color: number, alpha = 1) {
    this.edge.clear();
    // The texture owns its bevel; an optional faint rim must not flatten it.
    if (width > 0 && !this.isEmpty(this.fillColor)) {
      this.edge.lineStyle(Math.min(width, 1), color, alpha * .22)
        .strokeRoundedRect(-this.side / 2 + 1, -this.side / 2 + 1,
          this.side - 2, this.side - 3, Math.max(3, this.side * .12));
    }
    return this;
  }
}

export { ToyBlock as PuzzleCellView };
/** Piece visuals only: the scene retains all drag hit areas, generation and rules. */
export class PuzzlePieceView extends Phaser.GameObjects.Container {
  constructor(scene:Phaser.Scene,x:number,y:number,shape:number[][],cellSize:number,color:number) {
    super(scene,x,y);scene.add.existing(this);this.setDepth(20);
    const width=shape[0].length*cellSize,height=shape.length*cellSize;
    shape.forEach((row,r)=>row.forEach((value,c)=>{
      if(value)this.add(new ToyBlock(scene,c*cellSize-width/2+cellSize/2,r*cellSize-height/2+cellSize/2,cellSize-2,color).setStrokeStyle(1,0xd9ffff,.8));
    }));
  }
}
