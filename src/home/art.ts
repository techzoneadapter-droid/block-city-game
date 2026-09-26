import Phaser from 'phaser';
import { cachedCanvas } from '../ui/art';
export function coastTexture(scene: Phaser.Scene) {
  return cachedCanvas(scene,'coast-gradient',390,844,c=>{
    const g=c.createLinearGradient(0,0,0,844);g.addColorStop(0,'#058fe9');g.addColorStop(.5,'#a7edff');g.addColorStop(1,'#087fce');c.fillStyle=g;c.fillRect(0,0,390,844);
  });
}
