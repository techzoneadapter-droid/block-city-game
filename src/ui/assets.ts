import Phaser from 'phaser';
import manifest from '../../public/assets/block-city-v2/asset-registry.json';

export type AssetKey = keyof typeof manifest;
export const ASSETS = manifest;
export const textureKey = (key: string) => `bc2:${key}`;

/** Phaser loads individual exports, caches across scenes, and never requests source sheets. */
export function preloadAssets(scene: Phaser.Scene, domains: string[] = []) {
  const prefixes = ['core.', 'nav.', 'character.portrait.', 'puzzle.booster.', ...domains];
  for (const [key, asset] of Object.entries(ASSETS)) {
    if (prefixes.some(prefix => key.startsWith(prefix)) && !scene.textures.exists(textureKey(key)))
      scene.load.image(textureKey(key), `/assets/block-city-v2/${asset.path}`);
  }
}
export function assetKey(scene: Phaser.Scene, key: string): string | undefined {
  return scene.textures.exists(textureKey(key)) ? textureKey(key) : undefined;
}
export function sprite(scene: Phaser.Scene, x: number, y: number, key: AssetKey, width: number, height = width, ground = false) {
  const meta = ASSETS[key];
  const image = scene.add.image(x, y, textureKey(key));
  const scale = Math.min(width / meta.width, height / meta.height);
  return image.setScale(scale).setOrigin(.5, ground ? 1 : .5);
}

/** Nine-slice rasterization preserves border geometry on the Canvas renderer. */
export function frameTexture(scene: Phaser.Scene, key: AssetKey, width: number, height: number, padX = 0, padY = 0) {
  const id = `bc2-frame:${key}:${width}:${height}:${padX}:${padY}`;
  if (scene.textures.exists(id)) return id;
  const source = scene.textures.get(textureKey(key)).getSourceImage() as HTMLImageElement;
  const target = scene.textures.createCanvas(id, Math.ceil((width + padX * 2) * 2), Math.ceil((height + padY * 2) * 2))!;
  const c = target.context; c.scale(2, 2);
  const sw = source.width, sh = source.height;
  const cap = Math.min(12, sw / 4, sh / 4);
  const edge = Math.min(10, width / 3, height / 3);
  const sx = [0, cap, sw-cap, sw], sy = [0, cap, sh-cap, sh];
  const dx = [padX, padX+edge, padX+width-edge, padX+width];
  const dy = [padY, padY+edge, padY+height-edge, padY+height];
  for (let row=0; row<3; row++) for (let col=0; col<3; col++)
    c.drawImage(source, sx[col], sy[row], sx[col+1]-sx[col], sy[row+1]-sy[row], dx[col], dy[row], dx[col+1]-dx[col], dy[row+1]-dy[row]);
  target.refresh(); return id;
}
export function assetPanel(scene: Phaser.Scene, x: number, y: number, w: number, h: number, key: AssetKey) {
  return scene.add.container(x,y).add(scene.add.image(0,0,frameTexture(scene,key,w,h)).setDisplaySize(w,h));
}
