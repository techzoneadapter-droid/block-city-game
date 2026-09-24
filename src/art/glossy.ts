import Phaser from "phaser";
import { STROKES } from "../theme";

/** Cached code-native gradient face shared by buttons and terrain. */
export function glossyFace(
  scene: Phaser.Scene,
  width: number,
  height: number,
  radius: number,
  top: number,
  bottom: number,
) {
  const key = `gloss-${width}-${height}-${radius}-${top}-${bottom}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width * 2, height * 2)!;
    const ctx = texture.context;
    ctx.scale(2, 2);
    const hex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hex(top));
    gradient.addColorStop(1, hex(bottom));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(1, 1, width - 2, height - 2, radius);
    ctx.fill();
    ctx.strokeStyle = `rgba(255,255,255,${STROKES.innerHighlightAlpha})`;
    ctx.lineWidth = STROKES.standard;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, height - 6, Math.max(2, radius - 2));
    ctx.stroke();
    texture.refresh();
  }
  return scene.add.image(0, 0, key).setDisplaySize(width, height);
}
