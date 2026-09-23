import Phaser from 'phaser';

/** Frame coordinates are locked to the supplied 1122 × 1402 reference sheets.
 * Keep the original sheets intact; named frames avoid duplicate raster assets. */
const PORTRAITS: Record<string, [number, number, number, number]> = {
  builder: [308, 282, 116, 110], planner: [850, 283, 111, 110],
  worker: [42, 805, 150, 152], chef: [269, 807, 151, 151],
  mechanic: [491, 807, 148, 151], sailor: [709, 807, 149, 151],
  tourist: [921, 807, 150, 151], corgi: [586, 1273, 85, 77],
  'builder-wink': [446, 282, 117, 111], 'planner-wink': [976, 285, 114, 110],
  'builder-body': [30, 329, 252, 366], 'planner-body': [617, 325, 215, 375],
};
const BUILDINGS: Record<string, [number, number, number, number]> = {
  house: [20, 973, 124, 159], coffee: [147, 958, 114, 174],
  market: [429, 963, 121, 170], tower: [327, 930, 109, 203],
  park: [675, 943, 86, 89], garden: [756, 944, 94, 89],
  boardwalk: [669, 1058, 109, 108],
};
export function preloadReferenceArt(scene: Phaser.Scene) {
  scene.load.image('reference-characters', '/assets/block-city-characters.png');
  scene.load.image('reference-kit', '/assets/block-city-kit.png');
}
export function referenceArt(scene: Phaser.Scene, x: number, y: number, name: string, width: number, height = width) {
  const character = PORTRAITS[name];
  const rect = character ?? BUILDINGS[name];
  const key = character ? 'reference-characters' : 'reference-kit';
  if (!rect || !scene.textures.exists(key)) return undefined;
  const texture = scene.textures.get(key);
  if (!texture.has(name)) texture.add(name, 0, ...rect);
  return scene.add.image(x, y, key, name).setDisplaySize(width, height);
}

/** Canvas gradients avoid Phaser Graphics' per-triangle gradient seams and
 * work identically for cached blocks and WebGL/Canvas UI rendering. */
export function glossyFace(scene: Phaser.Scene, width: number, height: number, radius: number, top: number, bottom: number) {
  const key = `gloss-${width}-${height}-${radius}-${top}-${bottom}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width * 2, height * 2)!;
    const ctx = texture.context;
    ctx.scale(2, 2);
    const hex = (value: number) => `#${value.toString(16).padStart(6, '0')}`;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hex(top)); gradient.addColorStop(1, hex(bottom));
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.roundRect(1, 1, width - 2, height - 2, radius); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(3, 3, width - 6, height - 6, Math.max(2, radius - 2)); ctx.stroke();
    texture.refresh();
  }
  return scene.add.image(0, 0, key).setDisplaySize(width, height);
}
