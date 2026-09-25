import Phaser from 'phaser';
import { text } from '../ui';
import { cityAsset, cityPanorama } from './art';

export type DistrictId = 1 | 2 | 3;
export type BuildingKey = 'coffee' | 'park' | 'market' | 'boardwalk' | 'tower' | 'garden';
export type CityStageState = Record<BuildingKey, number>;
const POINTS: Record<BuildingKey, [number, number]> = {
  coffee: [167, 192], park: [246, 211], market: [167, 192],
  boardwalk: [246, 211], tower: [167, 192], garden: [246, 211],
};
/** Cached original scenery, with real progression lots layered above it. */
export class CityWorld {
  readonly root: Phaser.GameObjects.Container;
  private buildings = new Map<BuildingKey, Phaser.GameObjects.Container>();
  private selection?: Phaser.GameObjects.Ellipse;
  constructor(private scene: Phaser.Scene, private district: DistrictId,
    private stages: CityStageState, private onSelect: (key: BuildingKey) => void,
    private offsetY = 210) {
    this.root=scene.add.container(0,offsetY).setDepth(10);
    this.root.add(scene.add.image(0,0,cityPanorama(scene,district)).setOrigin(0).setDisplaySize(390,330));
    const keys:BuildingKey[]=district===1?['coffee','park']:district===2?['market','boardwalk']:['tower','garden'];
    keys.forEach(key=>this.place(key));
  }
  private place(key:BuildingKey) {
    const [x,y]=POINTS[key],stage=this.stages[key];
    const group=this.scene.add.container(x,y);
    if(stage) group.add(cityAsset(this.scene,0,-29,key,88,96,stage));
    else {
      const g=this.scene.add.graphics();
      g.fillStyle(0xe7d0a0).fillPoints([{x:-29,y:0},{x:0,y:-12},{x:30,y:0},{x:0,y:13}],true);
      g.lineStyle(2,0xfff2cb).strokePoints([{x:-29,y:0},{x:0,y:-12},{x:30,y:0},{x:0,y:13}],true);
      for(const xx of [-19,19]) {g.fillStyle(0xd8963e).fillRect(xx,-12,3,16);g.fillStyle(0xffe780).fillRect(xx,-12,3,3);}
      group.add(g);
    }
    const labelY = stage ? -73 : -26;
    const plate=this.scene.add.graphics().fillStyle(0x075291).fillRoundedRect(-26,labelY-10,52,20,7).lineStyle(1.5,0xe8fcff).strokeRoundedRect(-26,labelY-10,52,20,7);
    const label=text(this.scene,0,labelY,stage?`Lv. ${stage}`:'BUILD +',11,'#ffffff','800');
    group.add([plate,label]).setSize(74,85).setInteractive({useHandCursor:true});
    group.input!.hitArea.setTo(0,-37.5,74,98);
    group.on('pointerup',()=>this.onSelect(key));
    this.root.add(group);this.buildings.set(key,group);
  }
  getTarget(key:BuildingKey) {const [x,y]=POINTS[key];return new Phaser.Math.Vector2(x,y+this.offsetY);}
  select(key:BuildingKey) {
    if(this.selection){this.scene.tweens.killTweensOf(this.selection);this.selection.destroy();}
    const [x,y]=POINTS[key];
    this.selection=this.scene.add.ellipse(x,y+8,63,24,0xffe835,.14).setStrokeStyle(2,0xffe948);
    this.root.addAt(this.selection,1);
    this.scene.tweens.add({targets:this.selection,alpha:.45,duration:850,yoyo:true,repeat:-1});
  }
  focus(key:BuildingKey) {
    const target=this.buildings.get(key);if(target)this.scene.tweens.add({targets:target,scale:1.05,duration:250,yoyo:true});
  }
  settle() { /* The fixed viewport keeps construction and input coordinates aligned. */ }
  upgrade(key:BuildingKey,stage:number) {
    this.stages[key]=stage;this.buildings.get(key)?.destroy(true);this.place(key);
    const target=this.buildings.get(key)!;target.setScale(.4);
    this.scene.tweens.add({targets:target,scale:1,duration:600,ease:'Back.Out'});this.select(key);return target;
  }
  celebrateDistrict() {
    this.buildings.forEach(target=>this.scene.tweens.add({targets:target,y:target.y-7,duration:250,yoyo:true,repeat:2}));
  }
  destroy() {
    if(this.selection)this.scene.tweens.killTweensOf(this.selection);
    this.buildings.forEach(target=>this.scene.tweens.killTweensOf(target));this.root.destroy(true);
  }
}
