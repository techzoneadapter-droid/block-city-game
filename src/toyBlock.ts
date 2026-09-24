import Phaser from "phaser";
import { isBiomeEmptyColor } from "./art/biomes";

type Material = "empty" | "grass" | "water" | "sand" | "magma" | "crystal" | "stone" | "toy";

function materialFor(color: number): Material {
  if (color === 0x194e83 || color === 0x1666a7 || isBiomeEmptyColor(color)) return "empty";
  const r = (color >> 16) & 255;
  const g = (color >> 8) & 255;
  const b = color & 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max - min < 42) return "stone";
  if (g > r * 1.08 && g > b * 0.92) return "grass";
  if (r > 205 && g > 135 && b < 135) return "sand";
  if (r > 205 && g < 150) return "magma";
  if (b > r * 1.12 && b > g * 0.95) return "water";
  if (r > 110 && b > 160) return "crystal";
  return "toy";
}

function shade(color: number, delta: number) {
  const r = Phaser.Math.Clamp(((color >> 16) & 255) + delta, 0, 255);
  const g = Phaser.Math.Clamp(((color >> 8) & 255) + delta, 0, 255);
  const b = Phaser.Math.Clamp((color & 255) + delta, 0, 255);
  return (r << 16) | (g << 8) | b;
}

/** Reusable beveled material block shared by board cells and tray pieces. */
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
    const key = `block-face-v3-${color}`;
    if (!this.scene.textures.exists(key)) {
      const g = this.scene.make.graphics({ x: 0, y: 0 });
      const material = materialFor(color);
      const empty = material === "empty";

      if (empty) {
        // Recessed socket: dark inner well + lower rim, not a glossy occupied tile.
        g.fillStyle(shade(color, -34), 0.78).fillRoundedRect(1, 2, 62, 61, 5);
        g.fillStyle(shade(color, 12), 0.96).fillRoundedRect(4, 4, 56, 54, 4);
        g.fillStyle(shade(color, -20), 0.98).fillRoundedRect(7, 8, 50, 47, 3);
        g.lineStyle(2, shade(color, 28), 0.48).lineBetween(8, 7, 55, 7);
        g.lineStyle(2, shade(color, -38), 0.42).lineBetween(8, 56, 55, 56);
      } else {
        // Squarer toy/voxel silhouette with clear top and side faces.
        g.fillStyle(shade(color, -52), 0.34).fillRoundedRect(2, 5, 61, 58, 6);
        g.fillStyle(color, 1).fillRoundedRect(1, 1, 62, 57, 5);
        g.fillStyle(shade(color, 38), 1).fillPoints([
          { x: 3, y: 4 }, { x: 12, y: 1 }, { x: 61, y: 1 }, { x: 54, y: 10 }, { x: 10, y: 10 },
        ], true);
        g.fillStyle(shade(color, -30), 0.8).fillPoints([
          { x: 55, y: 11 }, { x: 62, y: 4 }, { x: 62, y: 55 }, { x: 55, y: 49 },
        ], true);
        g.fillStyle(0xffffff, 0.22).fillPoints([
          { x: 3, y: 11 }, { x: 10, y: 15 }, { x: 10, y: 49 }, { x: 3, y: 55 },
        ], true);
        g.lineStyle(2, 0xffffff, 0.62).strokeRoundedRect(4, 4, 55, 51, 4);
        g.fillStyle(0xffffff, 0.82).fillRoundedRect(9, 6, 10, 3, 1);

        if (material === "grass") {
          g.fillStyle(shade(color, -32), 0.82);
          [[12,17],[21,14],[34,18],[44,13],[50,20],[29,24]].forEach(([x,y], i) => {
            g.fillRect(x, y, i % 2 ? 4 : 5, i % 3 ? 4 : 6);
          });
          g.fillStyle(shade(color, 28), 0.7).fillRect(14, 12, 28, 3);
        } else if (material === "water") {
          g.lineStyle(2, 0xe5fbff, 0.8);
          for (let y = 20; y <= 42; y += 11) {
            g.beginPath(); g.moveTo(10, y); g.lineTo(20, y - 4); g.lineTo(30, y); g.lineTo(40, y + 4); g.lineTo(52, y); g.strokePath();
          }
        } else if (material === "sand") {
          g.fillStyle(shade(color, -35), 0.65);
          [[15,19],[27,28],[45,18],[18,40],[39,43],[50,34]].forEach(([x,y]) => g.fillCircle(x, y, 1.8));
        } else if (material === "magma") {
          g.lineStyle(3, shade(color, -70), 0.75);
          g.beginPath(); g.moveTo(15, 15); g.lineTo(26, 27); g.lineTo(21, 39); g.lineTo(34, 50); g.strokePath();
          g.lineStyle(2, 0xffd24d, 0.9); g.beginPath(); g.moveTo(27, 18); g.lineTo(38, 30); g.lineTo(34, 39); g.lineTo(48, 47); g.strokePath();
        } else if (material === "crystal") {
          g.fillStyle(0xffffff, 0.36).fillPoints([
            {x:30,y:14},{x:43,y:27},{x:34,y:46},{x:20,y:29},
          ], true);
          g.lineStyle(2, 0xf4dcff, 0.82).strokePoints([
            {x:30,y:14},{x:43,y:27},{x:34,y:46},{x:20,y:29},
          ], true);
        } else if (material === "stone") {
          g.fillStyle(shade(color, -45), 0.55);
          [[15,18,8,5],[34,15,11,5],[23,31,9,6],[42,35,8,5],[16,44,12,5]].forEach(([x,y,w,h]) => g.fillRoundedRect(x,y,w,h,2));
        } else {
          g.fillStyle(0xffffff, 0.16).fillRoundedRect(13, 17, 34, 12, 3);
        }
      }

      g.generateTexture(key, 64, 64);
      g.destroy();
    }
    return key;
  }

  setFillStyle(color: number, alpha = 1) {
    this.fillColor = color;
    this.face.setTexture(this.textureFor(color)).setAlpha(alpha);
    return this;
  }

  setStrokeStyle(width: number, color: number, alpha = 1) {
    this.edge.clear().lineStyle(width, color, alpha).strokeRoundedRect(
      -this.side / 2 + 1,
      -this.side / 2 + 1,
      this.side - 2,
      this.side - 2,
      4,
    );
    return this;
  }
}
