import Phaser from 'phaser';
import { assetPanel, sprite, textureKey } from '../ui/assets';
import { text, gameIcon, panel } from '../ui';
import { coastTexture } from '../home/art';

export function puzzleBackdrop(scene: Phaser.Scene) {
  scene.add.image(195,422,coastTexture(scene)).setDisplaySize(390,844);
  sprite(scene,195,716,'puzzle.ui.backdrop',390,234).setAlpha(.45);
}
export function puzzlePanel(scene: Phaser.Scene,x:number,y:number,w:number,h:number,kind:'frame'|'well'|'goals'|'moves',_radius=20) {
  return assetPanel(scene,x,y,w,h,kind==='frame'?'puzzle.ui.board':`puzzle.ui.${kind}`);
}
export function boosterIcon(scene:Phaser.Scene,x:number,y:number,kind:string,size=66) {
  return sprite(scene,x,y,`puzzle.booster.${kind==='refresh'?'shuffle':kind==='row'?'line':kind}` as 'puzzle.booster.hammer',size,size);
}
export function lineClearEffect(scene:Phaser.Scene,x:number,y:number,length:number,vertical=false) {
  const effect=scene.add.image(x,y,textureKey(vertical?'puzzle.vfx.column':'puzzle.vfx.row'))
    .setDisplaySize(vertical?55:length,vertical?length:55).setDepth(87);
  scene.tweens.add({targets:effect,alpha:0,duration:360,onComplete:()=>effect.destroy()});
}
// Stable presentation contracts; rules, grids, hit tests and pieces remain in PuzzleScene.
export const PuzzleBoardView = puzzlePanel;
export function BoosterButton(scene:Phaser.Scene,x:number,y:number,options:{key:string;name:string;cost:number;unlock:number;unlocked:boolean;affordable:boolean;onUse:()=>void}) {
  const {key,name,cost,unlock,unlocked,affordable,onUse}=options;
  const root=scene.add.container(x,y).setDepth(25).setName(key+'-tool');
  const icon=boosterIcon(scene,0,0,key,76).setAlpha(unlocked?1:.65);
  const selection=scene.add.circle(0,0,40,0xffffff,0).setStrokeStyle(2,0x88efff).setName('selection');
  const label=text(scene,0,48,name,16,'#ffffff','800').setStroke('#063b76',3);
  const badge=panel(scene,0,68,78,20,{fill:unlocked&&affordable?0xffe06b:0xd5e4ee,shadow:false});
  const count=text(scene,unlocked?10:0,68,unlocked?String(cost):`Lv. ${unlock}`,12,'#143e71','800').setName(key+'-count');
  root.add([icon,selection,label,badge,count]);
  if(unlocked)root.add(gameIcon(scene,-19,68,'coin',18));
  root.setSize(100,90);
  if(unlocked)root.setInteractive({useHandCursor:true}).on('pointerup',onUse);
  return root;
}
