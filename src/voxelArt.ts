import Phaser from "phaser";

export type VoxelBiomeId = "grass" | "water" | "ice" | "volcano" | "desert" | "cave";
export type VoxelMaterialId = "grass" | "stone" | "wood" | "sand" | "metal" | "ice" | "water" | "magma" | "crystal" | "brick";

export type VoxelBiome = {
  id: VoxelBiomeId;
  name: string;
  subtitle: string;
  skyTop: number;
  skyBottom: number;
  ground: number;
  groundDark: number;
  accent: number;
  frame: number;
  emptyCell: number;
  piecePalette: number[];
  materials: VoxelMaterialId[];
};

export const VOXEL_BIOMES: Record<VoxelBiomeId, VoxelBiome> = {
  grass: {
    id: "grass", name: "Meadow", subtitle: "Grass & earth",
    skyTop: 0x35bdf6, skyBottom: 0xdaf8ff, ground: 0x5fc95b, groundDark: 0x80583a,
    accent: 0x8eea60, frame: 0x123f69, emptyCell: 0x1c5d87,
    piecePalette: [0x6a9a43, 0x8b939b, 0xb7743e, 0xc9574e, 0x7a8798],
    materials: ["grass","stone","wood","brick","metal"],
  },
  water: {
    id: "water", name: "Coral Bay", subtitle: "Ocean & reef",
    skyTop: 0x2daef4, skyBottom: 0xcff6ff, ground: 0x1fc4e8, groundDark: 0x116e9d,
    accent: 0x62e8ff, frame: 0x0b3b6d, emptyCell: 0x155b8a,
    piecePalette: [0x25b8df, 0x8567e6, 0xe0b76a, 0x8b939b, 0x7a8798],
    materials: ["water","crystal","sand","stone","metal"],
  },
  ice: {
    id: "ice", name: "Frozen Peaks", subtitle: "Ice & snow",
    skyTop: 0x71c6ff, skyBottom: 0xf0fcff, ground: 0xdff8ff, groundDark: 0x6a9fc3,
    accent: 0xbff7ff, frame: 0x254d78, emptyCell: 0x2c6a91,
    piecePalette: [0x78dff4, 0x8567e6, 0x8b939b, 0x7a8798, 0x25b8df],
    materials: ["ice","crystal","stone","metal","water"],
  },
  volcano: {
    id: "volcano", name: "Magma Core", subtitle: "Fire & lava",
    skyTop: 0x452b40, skyBottom: 0xff7948, ground: 0x41414a, groundDark: 0x1d2028,
    accent: 0xffb326, frame: 0x331f2c, emptyCell: 0x4a3742,
    piecePalette: [0x4c3540, 0x8b939b, 0x7a8798, 0x8567e6, 0xc9574e],
    materials: ["magma","stone","metal","crystal","brick"],
  },
  desert: {
    id: "desert", name: "Sunstone", subtitle: "Sand & canyon",
    skyTop: 0x45bffc, skyBottom: 0xffefc4, ground: 0xe3b56b, groundDark: 0xa3683d,
    accent: 0xffdf79, frame: 0x594a3c, emptyCell: 0x6a5e50,
    piecePalette: [0xe0b76a, 0x8b939b, 0xb7743e, 0xc9574e, 0x7a8798],
    materials: ["sand","stone","wood","brick","metal"],
  },
  cave: {
    id: "cave", name: "Crystal Cave", subtitle: "Stone & crystal",
    skyTop: 0x18233e, skyBottom: 0x3e4c79, ground: 0x58616e, groundDark: 0x282e39,
    accent: 0x67eee7, frame: 0x141d33, emptyCell: 0x34435c,
    piecePalette: [0x8567e6, 0x8b939b, 0x7a8798, 0x78dff4, 0x4c3540],
    materials: ["crystal","stone","metal","ice","magma"],
  },
};

export const BLOCK_MATERIALS: Record<VoxelMaterialId, { base: number; top: number; side: number; detail: number }> = {
  grass: { base: 0x6a9a43, top: 0x63d957, side: 0x775033, detail: 0x2d9a46 },
  stone: { base: 0x8b939b, top: 0xb8bec4, side: 0x636b73, detail: 0x59616a },
  wood: { base: 0xb7743e, top: 0xd99b5c, side: 0x7c4a2d, detail: 0x754328 },
  sand: { base: 0xe0b76a, top: 0xf5d88d, side: 0xb8874e, detail: 0xc69859 },
  metal: { base: 0x7a8798, top: 0xa8b5c5, side: 0x505b69, detail: 0x33414f },
  ice: { base: 0x78dff4, top: 0xc9f7ff, side: 0x4ea8ca, detail: 0xffffff },
  water: { base: 0x25b8df, top: 0x5ee8ff, side: 0x14799f, detail: 0xd5fbff },
  magma: { base: 0x4c3540, top: 0x5a4147, side: 0x2c262d, detail: 0xff6a23 },
  crystal: { base: 0x8567e6, top: 0xc69bff, side: 0x5e47a9, detail: 0x66f0ff },
  brick: { base: 0xc9574e, top: 0xec7a67, side: 0x8f3b37, detail: 0xf6ae92 },
};

export function biomeForLevel(level: number): VoxelBiome {
  const order: VoxelBiomeId[] = ["grass", "water", "desert", "ice", "volcano", "cave"];
  return VOXEL_BIOMES[order[Math.max(0, Math.min(order.length - 1, Math.floor((Math.max(1, level) - 1) / 5)))]];
}

export function shade(color: number, amount: number) {
  const r = (color >> 16) & 255, g = (color >> 8) & 255, b = color & 255;
  const n = (v: number) => amount >= 0 ? Math.min(255, Math.round(v + (255 - v) * amount)) : Math.max(0, Math.round(v * (1 + amount)));
  return (n(r) << 16) | (n(g) << 8) | n(b);
}

export function materialForColor(color: number, biome: VoxelBiome = VOXEL_BIOMES.grass): VoxelMaterialId {
  let best = biome.materials[0];
  let bestD = Number.POSITIVE_INFINITY;
  const cr=(color>>16)&255, cg=(color>>8)&255, cb=color&255;
  for(const id of biome.materials){
    const ref=BLOCK_MATERIALS[id].base, rr=(ref>>16)&255, rg=(ref>>8)&255, rb=ref&255;
    const d=(cr-rr)**2+(cg-rg)**2+(cb-rb)**2;
    if(d<bestD){bestD=d;best=id;}
  }
  return best;
}

export function addIsoCube(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  width: number,
  depth: number,
  height: number,
  color: number,
  alpha = 1,
) {
  const top = shade(color, 0.22);
  const left = shade(color, -0.08);
  const right = shade(color, -0.26);
  const topY = y - height, hw = width / 2, hd = depth / 2;

  g.fillStyle(left, alpha).beginPath();
  g.moveTo(x - hw, topY + hd); g.lineTo(x, topY + depth); g.lineTo(x, y + depth); g.lineTo(x - hw, y + hd); g.closePath(); g.fillPath();

  g.fillStyle(right, alpha).beginPath();
  g.moveTo(x, topY + depth); g.lineTo(x + hw, topY + hd); g.lineTo(x + hw, y + hd); g.lineTo(x, y + depth); g.closePath(); g.fillPath();

  g.fillStyle(top, alpha).beginPath();
  g.moveTo(x, topY); g.lineTo(x + hw, topY + hd); g.lineTo(x, topY + depth); g.lineTo(x - hw, topY + hd); g.closePath(); g.fillPath();

  g.lineStyle(Math.max(1, width * 0.035), shade(color, -0.42), 0.45 * alpha);
  g.strokePoints([
    new Phaser.Math.Vector2(x, topY), new Phaser.Math.Vector2(x + hw, topY + hd),
    new Phaser.Math.Vector2(x + hw, y + hd), new Phaser.Math.Vector2(x, y + depth),
    new Phaser.Math.Vector2(x - hw, y + hd), new Phaser.Math.Vector2(x - hw, topY + hd),
  ], true);
  g.lineStyle(Math.max(1, width * 0.025), 0xffffff, 0.22 * alpha).lineBetween(x - hw + 2, topY + hd - 1, x, topY + 1);
}

export function voxelGroundTile(scene: Phaser.Scene, x: number, y: number, width: number, depth: number, color: number, sideColor = shade(color, -0.28)) {
  const c = scene.add.container(x, y);
  const g = scene.add.graphics();
  g.fillStyle(0x071e2e, 0.18).fillEllipse(0, depth * 0.72, width * 0.92, depth * 0.46);
  g.fillStyle(sideColor).beginPath();
  g.moveTo(-width/2,0); g.lineTo(0,depth/2); g.lineTo(width/2,0); g.lineTo(width/2,14); g.lineTo(0,depth/2+16); g.lineTo(-width/2,14); g.closePath(); g.fillPath();
  g.fillStyle(shade(color,0.1)).beginPath();
  g.moveTo(0,-depth/2); g.lineTo(width/2,0); g.lineTo(0,depth/2); g.lineTo(-width/2,0); g.closePath(); g.fillPath();
  g.lineStyle(2,shade(color,0.34),0.5).lineBetween(-width/2+2,0,0,-depth/2+2);
  c.add(g);
  return c;
}

function addWindow(g: Phaser.GameObjects.Graphics, x:number, y:number, w=7, h=9, lit=false){
  g.fillStyle(0x173f67,1).fillRect(x,y,w,h);
  g.fillStyle(lit?0xffe27b:0xc6f4ff,1).fillRect(x+1,y+1,w-2,h-2);
  g.fillStyle(0xffffff,0.55).fillRect(x+2,y+2,1,h-4);
}

export function createVoxelTree(scene: Phaser.Scene, x=0, y=0, scale=1, biome: VoxelBiomeId="grass") {
  const c=scene.add.container(x,y).setScale(scale), g=scene.add.graphics();
  const trunk=biome==="ice"?0x725f55:biome==="volcano"?0x553a35:0x8a552f;
  addIsoCube(g,0,4,15,9,31,trunk);
  if(biome==="desert"){
    const leaf=0x52b559;
    addIsoCube(g,0,-30,24,13,24,leaf); addIsoCube(g,-11,-20,17,10,18,leaf); addIsoCube(g,12,-22,17,10,18,leaf);
  }else if(biome==="ice"){
    [0,1,2].forEach(i=>{ g.fillStyle(i?0x9fdded:0xc9f5ff,1); g.fillTriangle(0,-58+i*14,-24+i*4,-24+i*12,24-i*4,-24+i*12); });
  }else{
    const leaf=biome==="volcano"?0x70424a:0x2fa750;
    [[-13,-29],[11,-32],[0,-48],[-2,-19],[17,-18]].forEach(([xx,yy],i)=>addIsoCube(g,xx,yy,28-(i%2)*3,16,22,shade(leaf,(i%3-1)*0.07)));
  }
  c.add(g); return c;
}

export type BuildingKind="house"|"cafe"|"apartment"|"office"|"lighthouse"|"market"|"tower";

export function createVoxelBuilding(scene: Phaser.Scene, kind: BuildingKind, stage=1, scale=1) {
  const c=scene.add.container(0,0).setScale(scale), g=scene.add.graphics();
  const configs: Record<BuildingKind,{wall:number;trim:number;roof:number;cols:number;rows:number;baseFloors:number}> = {
    house:{wall:0xf5d49b,trim:0x4aa8d8,roof:0xd85449,cols:3,rows:2,baseFloors:2},
    cafe:{wall:0xf3c56f,trim:0x2b9bd4,roof:0xef624f,cols:4,rows:2,baseFloors:2},
    apartment:{wall:0x5ca7d6,trim:0xf1e3c9,roof:0x2f72ad,cols:3,rows:2,baseFloors:3},
    office:{wall:0x4a9fd1,trim:0xdaf6ff,roof:0x275f97,cols:4,rows:2,baseFloors:4},
    lighthouse:{wall:0xf5f1e8,trim:0x2e78ab,roof:0xf24f44,cols:2,rows:2,baseFloors:5},
    market:{wall:0xf1c16f,trim:0x3bb7a0,roof:0xef5d52,cols:4,rows:2,baseFloors:2},
    tower:{wall:0x4ca4c7,trim:0xc9f6ff,roof:0x2c6f99,cols:3,rows:2,baseFloors:5},
  };
  const cfg=configs[kind], cell=14, floors=cfg.baseFloors+(kind==="house"?0:Math.max(0,stage-1)*(kind==="tower"?2:1));
  g.fillStyle(0x153f4d,0.16).fillEllipse(0,24,cfg.cols*cell*1.5,20);
  for(let z=0;z<floors;z++){
    for(let ry=0;ry<cfg.rows;ry++) for(let rx=0;rx<cfg.cols;rx++){
      const ix=(rx-ry)*cell*0.5, iy=(rx+ry)*cell*0.26-z*10+18;
      addIsoCube(g,ix,iy,cell,cell*0.55,11,shade(cfg.wall,(rx+ry)%3===0?0.02:-0.02));
      if(z>0 && z<floors-1 && (rx+z)%2===0) addWindow(g,ix+2,iy-7,5,6,(rx+ry+z)%4===0);
    }
  }
  const roofY=18-floors*10-3;
  if(kind==="house"||kind==="cafe"||kind==="market"){
    for(let i=-2;i<=2;i++) addIsoCube(g,i*8,roofY+Math.abs(i)*2,18,10,10,cfg.roof);
  }else{
    addIsoCube(g,0,roofY,cfg.cols*cell*0.86,cfg.rows*cell*0.45,8,cfg.roof);
  }

  if(kind==="cafe"||kind==="market"){
    const awnY=6-Math.min(floors,3)*5;
    for(let i=-2;i<=2;i++) addIsoCube(g,i*9,awnY,11,7,6,i%2?0xffffff:cfg.roof);
    g.fillStyle(0x1c6e65).fillRoundedRect(-18,roofY-12,36,10,2);
    g.fillStyle(0xffffff).fillRect(-14,roofY-9,28,3);
  }
  if(kind==="lighthouse"){
    addIsoCube(g,0,roofY-8,29,16,11,cfg.roof); addIsoCube(g,0,roofY-21,10,6,22,cfg.trim);
    g.fillStyle(0xffe978).fillCircle(0,roofY-31,4);
  }
  if(kind==="tower"){
    for(let i=0;i<3;i++) addIsoCube(g,0,roofY-7-i*9,20-i*3,11,10,i===2?0xffd34e:cfg.trim);
  }
  if(stage>=2 && kind!=="lighthouse"){
    const roofPlant=scene.add.graphics(); roofPlant.fillStyle(0x58c65d).fillRect(-12,roofY-11,8,8).fillRect(5,roofY-12,8,9); c.add(roofPlant);
  }
  c.add(g);
  return c;
}

export function createVoxelBridge(scene: Phaser.Scene,x:number,y:number,width=120,scale=1){
  const c=scene.add.container(x,y).setScale(scale), g=scene.add.graphics();
  g.fillStyle(0x80604a).fillRect(-width/2,10,width,8);
  g.fillStyle(0xc7b69a).fillRect(-width/2,0,width,13);
  for(let i=0;i<5;i++){ const xx=-width/2+12+i*(width-24)/4; g.fillStyle(0x8b755e).fillRect(xx,-3,6,26); }
  g.lineStyle(3,0x6f5a49).lineBetween(-width/2,0,width/2,0);
  c.add(g); return c;
}

export function createVoxelBoat(scene: Phaser.Scene,x:number,y:number,scale=1){
  const c=scene.add.container(x,y).setScale(scale),g=scene.add.graphics();
  g.fillStyle(0x0a5479,0.2).fillEllipse(0,12,48,8);
  g.fillStyle(0xf7f5e8).fillPoints([{x:-22,y:0},{x:22,y:0},{x:14,y:11},{x:-14,y:11}],true);
  g.fillStyle(0x2b9bd5).fillRect(-16,-2,32,5); g.fillStyle(0x3a5265).fillRect(-1,-27,3,29);
  g.fillStyle(0xf25951).fillTriangle(2,-24,2,-4,20,-4); g.fillStyle(0xffffff).fillTriangle(-1,-22,-1,-4,-15,-4);
  c.add(g); return c;
}

export function createFerrisWheel(scene:Phaser.Scene,x:number,y:number,scale=1){
  const c=scene.add.container(x,y).setScale(scale),g=scene.add.graphics();
  g.lineStyle(5,0xf2f9ff).strokeCircle(0,-28,34); g.lineStyle(2,0xff6570);
  for(let i=0;i<10;i++){ const a=i*Math.PI/5; const px=Math.cos(a)*34, py=-28+Math.sin(a)*34; g.lineBetween(0,-28,px,py); g.fillStyle([0xffd43e,0x4cc7ef,0xff7080,0x79d55d][i%4]).fillRoundedRect(px-5,py-4,10,8,2); }
  g.fillStyle(0xffd439).fillCircle(0,-28,6); g.fillStyle(0x3b617a).fillRect(-4,5,8,28); g.fillRect(-28,31,56,6);
  c.add(g); return c;
}


export function createVoxelChest(scene:Phaser.Scene,x:number,y:number,scale=1,open=false){
  const c=scene.add.container(x,y).setScale(scale),g=scene.add.graphics();
  g.fillStyle(0x7b4b24,0.2).fillEllipse(0,18,76,18);
  // body blocks
  addIsoCube(g,-18,8,28,16,28,0xd9811f); addIsoCube(g,10,8,28,16,28,0xd9811f);
  addIsoCube(g,-18,-13,28,16,18,0xffc32e); addIsoCube(g,10,-13,28,16,18,0xffc32e);
  g.fillStyle(0xffea78).fillRect(-5,-26,10,50);
  g.fillStyle(0x2f9ed4).fillRoundedRect(-9,0,18,20,3);
  g.fillStyle(0xdff8ff).fillRect(-4,4,8,8);
  if(open){
    const lid=scene.add.graphics(); addIsoCube(lid,0,-30,58,30,12,0xffc32e); lid.setAngle(-10); c.add(lid);
    for(let i=0;i<7;i++){ const gem=scene.add.rectangle(-28+i*9,-34-(i%3)*5,6,6,[0xffd63d,0x62e8ff,0xb768f0][i%3]); gem.setAngle(45); c.add(gem); }
  }
  c.add(g); return c;
}

export function createVoxelTrophy(scene:Phaser.Scene,x:number,y:number,scale=1){
  const c=scene.add.container(x,y).setScale(scale),g=scene.add.graphics();
  addIsoCube(g,0,18,38,20,10,0xd98b17);
  addIsoCube(g,0,5,17,9,28,0xffc72d);
  addIsoCube(g,0,-19,42,23,28,0xffd43c);
  g.lineStyle(6,0xffbd24).strokeCircle(-22,-12,13).strokeCircle(22,-12,13);
  g.fillStyle(0xfff2a1,0.7).fillRect(-12,-31,18,4);
  c.add(g); return c;
}

export function createVoxelBooster(scene:Phaser.Scene,x:number,y:number,kind:"hammer"|"shuffle"|"line",scale=1){
  const c=scene.add.container(x,y).setScale(scale),g=scene.add.graphics();
  if(kind==="hammer"){
    addIsoCube(g,4,8,13,8,36,0xb7743e);
    addIsoCube(g,-4,-22,45,24,20,0xf05d51);
    addIsoCube(g,-22,-22,12,24,20,0xaab7c3);
  }else if(kind==="shuffle"){
    g.lineStyle(10,0xb75bea).lineBetween(-22,-18,22,20).lineBetween(-22,20,22,-18);
    g.fillStyle(0xdd8cff).fillTriangle(16,9,35,20,18,31).fillTriangle(16,-29,35,-18,18,-7);
  }else{
    for(let i=-1;i<=1;i++) addIsoCube(g,i*17,3,17,10,18,i===0?0xffb52e:0xef6349);
    g.lineStyle(4,0xffffff,0.9).lineBetween(-31,-5,31,-5);
  }
  c.add(g); return c;
}

export function createVoxelCharacter(scene: Phaser.Scene,x:number,y:number,id:string,size=64){
  const c=scene.add.container(x,y),g=scene.add.graphics(),s=size/92;
  const cap=id==="planner"?0xb34ee5:id==="worker"?0xffc632:id==="mechanic"?0x2e83df:id==="chef"||id==="sailor"?0xf4f7ff:id==="tourist"?0xe7a73a:0xef4e43;
  const shirt=id==="planner"?0xb96ce7:id==="worker"?0xf08f24:id==="chef"?0xef5149:id==="sailor"?0x2f75c7:id==="tourist"?0x5db56e:0x248fdf;
  const hair=id==="sailor"||id==="mechanic"?0x3b2a24:0x4f3025;
  const bust=size<=68;
  g.fillStyle(0x173654,0.12).fillEllipse(0,bust?26:45,bust?62:54,10);
  if(!bust){
    g.fillStyle(0x173b73).fillRect(-18,17,14,28).fillRect(4,17,14,28);
    g.fillStyle(0xffffff).fillRect(-18,41,14,8).fillRect(4,41,14,8);
    g.fillStyle(shirt).fillRect(-24,-10,48,34); g.fillStyle(0xffffff,0.65).fillRect(-5,-7,10,25);
    g.fillStyle(0xffcba3).fillRect(-32,-6,8,27).fillRect(24,-6,8,27);
  }else{
    g.fillStyle(shirt).fillRoundedRect(-25,12,50,27,4);
  }
  g.fillStyle(hair).fillRect(-27,-42,54,45);
  g.fillStyle(0xffd0a7).fillRect(-21,-35,42,38);
  g.fillStyle(hair).fillRect(-27,-42,10,25).fillRect(17,-42,10,25).fillRect(-11,-42,11,9);
  g.fillStyle(cap).fillRoundedRect(-30,-57,60,20,5).fillRect(-36,-39,72,8);
  g.fillStyle(shade(cap,0.2)).fillRect(-22,-54,17,4);
  g.fillStyle(0x2d251f).fillRect(-12,-22,5,9).fillRect(8,-22,5,9);
  g.fillStyle(0xef6c64).fillRoundedRect(-5,-7,11,5,2);
  if(id==="worker"){ g.fillStyle(0xffef72).fillRect(-20,-54,40,4); }
  if(id==="sailor"){ g.fillStyle(0x275f9c).fillRect(-16,-56,32,5); }
  if(id==="corgi"){
    g.clear(); g.fillStyle(0xe49a28).fillRect(-27,-31,54,39).fillRect(-34,-44,15,24).fillRect(19,-44,15,24);
    g.fillStyle(0xfff0d0).fillRect(-14,-20,28,27); g.fillStyle(0x2e251f).fillRect(-13,-21,5,6).fillRect(8,-21,5,6).fillRect(-4,-8,8,6);
    g.fillStyle(0xe8463e).fillRect(-24,7,48,7);
  }
  c.add(g); c.setScale(s); return c;
}

export function createVoxelLogo(scene: Phaser.Scene,x:number,y:number,scale=1){
  const c=scene.add.container(x,y).setScale(scale);
  const shadow=scene.add.text(4,7,"BLOCK\nCITY",{fontFamily:'"Arial Black", Impact, sans-serif',fontSize:"66px",fontStyle:"bold",align:"center",color:"#062f68",stroke:"#062f68",strokeThickness:14}).setOrigin(.5);
  const block=scene.add.text(0,-4,"BLOCK",{fontFamily:'"Arial Black", Impact, sans-serif',fontSize:"64px",fontStyle:"bold",color:"#f8fdff",stroke:"#0a4b95",strokeThickness:8}).setOrigin(.5);
  const city=scene.add.text(0,50,"CITY",{fontFamily:'"Arial Black", Impact, sans-serif',fontSize:"70px",fontStyle:"bold",color:"#ffc62f",stroke:"#9e5a00",strokeThickness:8}).setOrigin(.5);
  const mini=scene.add.graphics();
  addIsoCube(mini,-105,54,34,18,26,0x55c95d); addIsoCube(mini,105,54,34,18,26,0x55c95d);
  c.add([shadow,block,city,mini]); return c;
}

export function drawVoxelBiomeBackdrop(scene: Phaser.Scene,biome:VoxelBiome,width:number,height:number){
  const g=scene.add.graphics(),bands=32;
  const lerp=(a:number,b:number,t:number)=>Math.round(a+(b-a)*t);
  for(let i=0;i<bands;i++){
    const t=i/(bands-1), ar=(biome.skyTop>>16)&255,ag=(biome.skyTop>>8)&255,ab=biome.skyTop&255, br=(biome.skyBottom>>16)&255,bg=(biome.skyBottom>>8)&255,bb=biome.skyBottom&255;
    g.fillStyle((lerp(ar,br,t)<<16)|(lerp(ag,bg,t)<<8)|lerp(ab,bb,t)).fillRect(0,i*height/bands,width,height/bands+1);
  }
  const cloudColor=biome.id==="volcano"?0x6e515c:0xffffff, cloudAlpha=biome.id==="cave"?0.06:0.58;
  [[-8,105,1],[280,145,.78],[45,260,.52]].forEach(([x,y,ss])=>{ const s=Number(ss); g.fillStyle(cloudColor,cloudAlpha).fillRect(Number(x),Number(y),48*s,13*s).fillRect(Number(x)+12*s,Number(y)-10*s,30*s,15*s).fillRect(Number(x)+34*s,Number(y)-3*s,27*s,14*s); });

  const horizon=330;
  if(biome.id==="water"){
    g.fillStyle(0x14b4e6,.9).fillRect(0,horizon,width,height-horizon);
    for(let i=0;i<10;i++) g.fillStyle(0xffffff,.14).fillRect((i*61)%width,horizon+24+i*34,52,3);
    g.fillStyle(0x7dd16b).fillTriangle(0,horizon+30,68,horizon-35,135,horizon+30).fillTriangle(260,horizon+18,330,horizon-44,width,horizon+18);
  } else if(biome.id==="ice"){
    g.fillStyle(0xbcecff,.92).fillTriangle(0,430,95,235,190,430).fillTriangle(135,430,292,205,width,430);
    g.fillStyle(0xffffff,.95).fillTriangle(55,315,95,235,137,315).fillTriangle(245,278,292,205,334,279);
    g.fillStyle(0xd9f9ff,.85).fillRect(0,430,width,height-430);
  } else if(biome.id==="volcano"){
    g.fillStyle(0x25202a).fillTriangle(0,435,112,226,225,435).fillTriangle(145,435,296,198,width,435);
    g.fillStyle(0xff5a20,.96).beginPath(); g.moveTo(106,286);g.lineTo(119,240);g.lineTo(131,290);g.lineTo(122,395);g.closePath();g.fillPath();
    g.beginPath();g.moveTo(284,258);g.lineTo(296,212);g.lineTo(307,270);g.lineTo(293,400);g.closePath();g.fillPath();
    g.fillStyle(0x372f36).fillRect(0,435,width,height-435);
    for(let i=0;i<8;i++) g.fillStyle(i%2?0xff7422:0xffb126,.65).fillRect((i*73)%width,470+i*37,42,5);
  } else if(biome.id==="desert"){
    g.fillStyle(0xd59a58,.9).fillTriangle(0,430,90,285,185,430).fillTriangle(135,430,282,262,width,430);
    g.fillStyle(0xeacb83).fillRect(0,430,width,height-430);
    for(let i=0;i<5;i++) g.fillStyle(0xbf7d49,.22).fillRect(35+i*78,460+(i%2)*55,58,5);
  } else if(biome.id==="cave"){
    g.fillStyle(0x10182a,.88).fillRect(0,245,width,height-245);
    [42,118,202,286,346].forEach((x,i)=>{ const cc=[0x4dd9e7,0x9b64f1,0xff64b4,0x59df82,0xffce4f][i]; g.fillStyle(cc,.72).fillTriangle(x,365,x+15,300+(i%2)*18,x+31,365); g.fillStyle(cc,.18).fillEllipse(x+15,371,50,14); });
  } else {
    g.fillStyle(0x56bb64,.78).fillTriangle(0,430,86,292,176,430).fillTriangle(145,430,285,268,width,430);
    g.fillStyle(0x61c75d,.82).fillRect(0,430,width,height-430);
  }
  return g;
}
