import Phaser from 'phaser';
import { sprite, textureKey } from './assets';
export function logoTexture(_scene: Phaser.Scene, _home = false) { return textureKey('brand.logo'); }
export function BlockCityLogo(scene: Phaser.Scene, x: number, y: number, width = 360, variant: 'main'|'compact'|'home' = 'main') {
  return scene.add.container(x,y).add(sprite(scene,0,0,variant === 'compact' ? 'brand.wordmark' : 'brand.logo',width,width*.69));
}
export function Tagline(scene: Phaser.Scene, x: number,y: number,width=220) { return sprite(scene,x,y,'brand.tagline',width,width*.28); }
