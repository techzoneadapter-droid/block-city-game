import Phaser from "phaser";
import { BLOCK_MATERIALS, BlockState, MATERIAL_LABELS } from "../art/blockMaterials";
import { ToyBlock } from "../toyBlock";
import { addGradientBackground, panel, sectionLabel, text, W } from "../ui";

/** Development-only material lab. Open `/?debug=blocks`. */
export class BlockMaterialDebugScene extends Phaser.Scene {
  private labels: Phaser.GameObjects.Text[] = [];

  constructor() { super("BlockMaterialDebugScene"); }

  create() {
    addGradientBackground(this, 0x0d75bd, 0xe9fbff);
    panel(this, W / 2, 36, W - 18, 58, { variant: "dark", radius: 18, shadowAlpha: 0.3 });
    text(this, 18, 25, "BLOCK CITY • MATERIAL LAB", 18, "#ffffff", "800").setOrigin(0, 0.5).setStroke("#073f7d", 3);
    const toggle = text(this, 371, 48, "LABELS ON", 9, "#aef8ff", "800").setOrigin(1, 0.5).setInteractive({ useHandCursor: true });
    toggle.on("pointerup", () => {
      const visible = !this.labels[0]?.visible;
      this.labels.forEach(label => label.setVisible(visible));
      toggle.setText(visible ? "LABELS ON" : "LABELS OFF");
    });

    this.materialGrid("FULL SIZE · MATERIAL READ", 72, 122, 48, 68, true);
    this.materialGrid("GAMEPLAY SIZE · BOARD/TRAY", 300, 340, 32, 46, false);
    this.materialGrid("GOAL ICON SIZE · 22 PX", 466, 500, 22, 36, false);

    sectionLabel(this, 12, 610, "INTERACTION / CLEAR STATES");
    const states: BlockState[] = ["normal", "hover", "drag", "selected", "valid", "invalid", "clearing", "disappearing", "disabled", "locked"];
    states.forEach((state, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const x = 39 + col * 78;
      const y = 652 + row * 58;
      new ToyBlock(this, x, y, 34, index < 5 ? "blue" : "crystal").setBlockState(state);
      const label = text(this, x, y + 25, state.toUpperCase(), 8, "#174a78", "800");
      this.labels.push(label);
    });

    sectionLabel(this, 12, 758, "POLYOMINO SPACING · CONSISTENT LIGHTING");
    this.polyomino(65, 805, [[1, 1], [1, 0]], "grass");
    this.polyomino(194, 805, [[1, 1, 1, 1]], "lava");
    this.polyomino(315, 805, [[1, 1], [1, 1]], "rainbow");
  }

  private materialGrid(title: string, sectionY: number, firstRowY: number, side: number, rowStep: number, showNames: boolean) {
    sectionLabel(this, 12, sectionY, title);
    BLOCK_MATERIALS.forEach((material, index) => {
      const col = index % 5;
      const row = Math.floor(index / 5);
      const x = 39 + col * 78;
      const y = firstRowY + row * rowStep;
      new ToyBlock(this, x, y, side, material);
      if (showNames) {
        const label = text(this, x, y + 31, MATERIAL_LABELS[material], 8, "#174a78", "800");
        this.labels.push(label);
      }
    });
  }

  private polyomino(x: number, y: number, shape: number[][], material: "grass" | "lava" | "rainbow") {
    const side = 25;
    const width = shape[0].length * side;
    const height = shape.length * side;
    shape.forEach((row, r) => row.forEach((value, c) => {
      if (!value) return;
      new ToyBlock(this, x + c * side - width / 2 + side / 2, y + r * side - height / 2 + side / 2, side - 1, material);
    }));
  }
}
