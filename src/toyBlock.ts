import Phaser from "phaser";
import { BLOCK_MATERIALS, shade, type VoxelMaterialId } from "./voxelArt";

function inferMaterial(color:number):VoxelMaterialId{
  const r=(color>>16)&255,g=(color>>8)&255,b=color&255;
  if(b>180 && r<150 && g>150) return "ice";
  if(b>175 && r<130) return "water";
  if(r>180 && g<120) return "magma";
  if(r>180 && b>150) return "crystal";
  if(r>170 && g>140 && b<100) return "sand";
  if(g>150 && r<150) return "grass";
  if(Math.abs(r-g)<30 && Math.abs(g-b)<30) return "stone";
  return r>150 && g>80 ? "wood" : "metal";
}

/** Material-aware block face used by the puzzle board and tray. */
export class ToyBlock extends Phaser.GameObjects.Container {
  fillColor:number;
  material:VoxelMaterialId;
  private face:Phaser.GameObjects.Image;
  private edge:Phaser.GameObjects.Graphics;

  constructor(scene:Phaser.Scene,x:number,y:number,private side:number,color:number,material?:VoxelMaterialId){
    super(scene,x,y);
    this.fillColor=color;
    this.material=material ?? inferMaterial(color);
    this.face=scene.add.image(0,0,this.textureFor(color,this.material)).setDisplaySize(side,side);
    this.edge=scene.add.graphics();
    this.add([this.face,this.edge]);
    this.setSize(side,side);
    scene.add.existing(this);
  }

  private isEmpty(color:number){
    return [0x194e83,0x1666a7,0x1b5d87,0x155c8f,0x2f6d96,0x4a3844,0x6d6152,0x33425d,0x1c5d87,0x155b8a,0x2c6a91,0x4a3742,0x6a5e50,0x34435c].includes(color);
  }

  private textureFor(color:number,material:VoxelMaterialId){
    const empty=this.isEmpty(color);
    const key=empty?`voxel-empty-${color}`:`voxel-${material}-${color}`;
    if(this.scene.textures.exists(key)) return key;

    const g=this.scene.make.graphics({x:0,y:0});
    if(empty){
      g.fillStyle(0x06192f,0.96).fillRect(0,0,64,64);
      g.fillStyle(shade(color,-0.15)).fillRect(4,4,56,56);
      g.fillStyle(shade(color,-0.36)).fillRect(7,7,50,6).fillRect(7,7,6,50);
      g.fillStyle(shade(color,0.08)).fillRect(13,51,41,4).fillRect(51,13,4,38);
      g.fillStyle(0xffffff,0.035).fillRect(19,20,8,8).fillRect(37,36,6,6);
      g.lineStyle(1,0x06172a,0.8).strokeRect(4,4,56,56);
    }else{
      const mat=BLOCK_MATERIALS[material];
      const top=shade(color,0.2), side=shade(color,-0.23), bottom=shade(color,-0.4);

      g.fillStyle(0x04172c,0.22).fillRect(5,8,56,53);
      g.fillStyle(bottom).fillRect(4,6,57,53);
      g.fillStyle(side).fillRect(7,5,53,52);
      g.fillStyle(color).fillRect(6,2,50,51);

      g.fillStyle(top).fillPoints([{x:6,y:2},{x:13,y:0},{x:62,y:0},{x:56,y:7},{x:6,y:7}],true);
      g.fillStyle(side).fillPoints([{x:56,y:7},{x:62,y:0},{x:62,y:52},{x:56,y:58}],true);
      g.fillStyle(bottom).fillPoints([{x:6,y:53},{x:56,y:53},{x:62,y:58},{x:12,y:58}],true);

      if(material==="grass"){
        g.fillStyle(0x62d95c,0.95).fillRect(6,2,50,13);
        g.fillStyle(0x369b48).fillRect(10,12,7,7).fillRect(29,10,5,9).fillRect(44,13,8,6);
        g.fillStyle(0x795132,0.42).fillRect(9,28,9,8).fillRect(35,36,11,7);
      }else if(material==="stone"){
        g.fillStyle(mat.detail,0.35).fillRect(11,11,12,8).fillRect(34,9,10,10).fillRect(19,32,9,11).fillRect(39,38,12,7);
        g.lineStyle(2,shade(color,-0.28),0.55).lineBetween(10,26,27,26).lineBetween(27,26,34,19).lineBetween(34,19,52,19);
      }else if(material==="wood"){
        g.lineStyle(2,mat.detail,0.58);
        [12,24,36,48].forEach(x=>g.lineBetween(x,8,x,50));
        g.fillStyle(shade(color,-0.2),0.35).fillRect(11,20,39,3).fillRect(14,39,35,3);
      }else if(material==="sand"){
        g.fillStyle(0xffe2a1,0.35).fillRect(12,12,7,6).fillRect(35,17,5,5).fillRect(20,34,6,5).fillRect(42,40,7,5);
      }else if(material==="metal"){
        g.fillStyle(mat.top,0.24).fillRect(10,9,40,9);
        [[10,10],[48,10],[10,47],[48,47]].forEach(([x,y])=>{g.fillStyle(0x2d3945).fillCircle(x,y,2.3);g.fillStyle(0xd8e2eb).fillCircle(x-.5,y-.5,1);});
        g.lineStyle(1,shade(color,-0.25),0.55).strokeRect(9,9,40,38);
      }else if(material==="ice"){
        g.fillStyle(0xffffff,0.24).fillRect(9,7,18,5).fillRect(35,14,12,4);
        g.lineStyle(2,0xffffff,0.52).lineBetween(14,44,29,28).lineBetween(29,28,40,36).lineBetween(40,36,51,19);
      }else if(material==="water"){
        g.fillStyle(0xffffff,0.2).fillRect(8,11,25,4).fillRect(26,27,24,4).fillRect(11,42,19,4);
        g.fillStyle(0x0a77a9,0.22).fillRect(13,19,34,5).fillRect(9,35,28,4);
      }else if(material==="magma"){
        g.fillStyle(0xff6a23,0.88).fillRect(9,13,8,23).fillRect(17,28,19,7).fillRect(32,18,8,17).fillRect(39,13,13,7).fillRect(43,36,8,12);
        g.fillStyle(0xffcc3f,0.9).fillRect(11,15,4,17).fillRect(20,30,12,3).fillRect(35,21,3,11);
      }else if(material==="crystal"){
        g.fillStyle(0x67eeff,0.42).fillTriangle(11,43,20,11,29,43).fillTriangle(28,46,38,16,48,46);
        g.fillStyle(0xffffff,0.62).fillTriangle(15,39,20,16,23,39);
      }else if(material==="brick"){
        g.lineStyle(2,shade(color,-0.23),0.45);
        [18,35].forEach(y=>g.lineBetween(7,y,55,y));
        [18,42].forEach(x=>g.lineBetween(x,7,x,18));
        [30].forEach(x=>g.lineBetween(x,18,x,35));
        [20,43].forEach(x=>g.lineBetween(x,35,x,52));
      }

      g.fillStyle(0xffffff,0.34).fillRect(9,7,16,3);
      g.lineStyle(2,shade(color,-0.38),0.7).strokeRect(6,2,50,51);
    }

    g.generateTexture(key,64,64); g.destroy();
    return key;
  }

  setFillStyle(color:number,alpha=1,material?:VoxelMaterialId){
    this.fillColor=color;
    if(material) this.material=material; else if(!this.isEmpty(color)) this.material=inferMaterial(color);
    this.face.setTexture(this.textureFor(color,this.material)).setAlpha(alpha);
    return this;
  }

  setStrokeStyle(width:number,color:number,alpha=1){
    this.edge.clear();
    if(width>0) this.edge.lineStyle(width,color,alpha).strokeRect(-this.side/2+1,-this.side/2+1,this.side-2,this.side-2);
    return this;
  }
}
