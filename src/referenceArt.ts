import Phaser from "phaser";
import { characterAsset } from "./characters/art";
import { iconTexture } from "./ui/art";
import { cityTexture, type CityArt } from './city/art';
import { logoTexture } from "./ui/logo";

/**
 * Original runtime art for Block City.
 *
 * The visual language follows the nine approved reference boards:
 * chunky 2.5D voxel forms, bright cyan/royal-blue UI, warm gold CTA accents,
 * readable silhouettes, bevel highlights, and soft toy-like contact shadows.
 *
 * No runtime asset below crops or embeds the reference boards.
 */
type Ctx = CanvasRenderingContext2D;

const NAVY = "#073a78";
const BLUE = "#0d8ff4";
const CYAN = "#43d8ff";
const GOLD = "#ffd62e";
const ORANGE = "#f08a16";
const GREEN = "#58d83f";
const GRASS = "#6ee137";
const BROWN = "#8a542f";
const CREAM = "#fff4d8";
const WHITE = "#ffffff";

function hex(value: number) {
  return `#${value.toString(16).padStart(6, "0")}`;
}
function roundRect(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}
function poly(ctx: Ctx, pts: Array<[number, number]>, fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}
function ellipse(ctx: Ctx, x: number, y: number, rx: number, ry: number, fill: string, stroke?: string, lw = 1) {
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.stroke();
  }
}
function line(ctx: Ctx, pts: Array<[number, number]>, stroke: string, lw = 1) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.strokeStyle = stroke;
  ctx.lineWidth = lw;
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  ctx.stroke();
}
function text(ctx: Ctx, value: string, x: number, y: number, size: number, fill: string, stroke?: string, lw = 0) {
  ctx.save();
  ctx.font = `900 ${size}px "Arial Rounded MT Bold", Arial, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  if (stroke && lw) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lw;
    ctx.lineJoin = "round";
    ctx.strokeText(value, x, y);
  }
  ctx.fillStyle = fill;
  ctx.fillText(value, x, y);
  ctx.restore();
}
function canvasTexture(scene: Phaser.Scene, key: string, w: number, h: number, draw: (ctx: Ctx, w: number, h: number) => void) {
  if (scene.textures.exists(key)) return key;
  const scale = 2;
  const texture = scene.textures.createCanvas(key, w * scale, h * scale)!;
  const ctx = texture.context;
  ctx.scale(scale, scale);
  ctx.clearRect(0, 0, w, h);
  draw(ctx, w, h);
  texture.refresh();
  return key;
}
function shadow(ctx: Ctx, cx: number, cy: number, rx: number, ry: number, alpha = 0.18) {
  ellipse(ctx, cx, cy, rx, ry, `rgba(5,48,94,${alpha})`);
}
function cube(ctx: Ctx, x: number, y: number, w: number, h: number, d: number, front: string, side: string, top: string, outline = "#083a6f") {
  shadow(ctx, x + w * 0.58, y + 5, w * 0.55, Math.max(3, d * 0.2), 0.16);
  ctx.fillStyle = front;
  ctx.fillRect(x, y - h, w, h);
  poly(ctx, [[x + w, y - h], [x + w + d, y - h - d * .55], [x + w + d, y - d * .55], [x + w, y]], side, outline, 1);
  poly(ctx, [[x, y - h], [x + d, y - h - d * .55], [x + w + d, y - h - d * .55], [x + w, y - h]], top, outline, 1);
  ctx.strokeStyle = outline;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x, y - h, w, h);
  line(ctx, [[x + 2, y - h + 2], [x + w - 2, y - h + 2]], "rgba(255,255,255,.55)", 1.2);
}
function voxelTile(ctx: Ctx, x: number, y: number, w: number, d: number, top: string, front: string, side: string) {
  poly(ctx, [[x, y], [x + w * .5, y - d * .5], [x + w, y], [x + w * .5, y + d * .5]], top, "#0b4b79", 1);
  poly(ctx, [[x, y], [x + w * .5, y + d * .5], [x + w * .5, y + d * .5 + 10], [x, y + 10]], front, "#0b4b79", 1);
  poly(ctx, [[x + w * .5, y + d * .5], [x + w, y], [x + w, y + 10], [x + w * .5, y + d * .5 + 10]], side, "#0b4b79", 1);
}
function drawTree(ctx: Ctx, cx: number, base: number, scale = 1, blossom?: string) {
  cube(ctx, cx - 5 * scale, base, 9 * scale, 26 * scale, 5 * scale, "#9c5a31", "#6a3e24", "#d4954b");
  const colors = blossom ? [blossom, "#ffb5dc", "#ffd2e8"] : ["#54cf31", "#2eaa35", "#8ee946"];
  [[-15,-26,18,15],[5,-31,18,16],[-4,-44,17,15]].forEach(([dx,dy,w,h], i) => {
    cube(ctx, cx + dx * scale, base + dy * scale, w * scale, h * scale, 7 * scale, colors[i % colors.length], "#188331", "#a9ef55");
  });
}
function rectWindow(ctx: Ctx, x: number, y: number, w: number, h: number) {
  roundRect(ctx, x, y, w, h, 2, "#0c77b8", "#fff9de", 2);
  ctx.fillStyle = "#63ddff";
  ctx.fillRect(x+3, y+3, Math.max(2,w*.3), Math.max(2,h*.5));
}
function drawBuilding(ctx: Ctx, x: number, y: number, w: number, h: number, d: number, front: string, kind: "apartment"|"office"|"shop"|"cafe"|"harbor" = "apartment") {
  cube(ctx, x, y, w, h, d, front, "#0a6ea8", "#fff0cf");
  const rows = Math.max(1, Math.floor((h - 16) / 18));
  const cols = Math.max(2, Math.floor(w / 18));
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rectWindow(ctx, x + 6 + c * ((w - 12)/cols), y - h + 10 + r * ((h - 18)/rows), 10, 12);
    }
  }
  cube(ctx, x-3, y-h+2, w+6, 7, d+2, "#f5e3bd", "#bf9868", "#fff7dc");
  if (kind === "shop" || kind === "cafe" || kind === "harbor") {
    const awningY = y - 27;
    for (let i=0;i<5;i++) {
      const stripeW = (w+8)/5;
      poly(ctx, [[x-4+i*stripeW,awningY],[x-4+(i+1)*stripeW,awningY],[x-7+(i+1)*stripeW,awningY+11],[x-7+i*stripeW,awningY+11]], i%2 ? "#fff4df" : "#ed5045");
    }
    roundRect(ctx, x+6, y-h+8, w-12, 14, 3, "#0a568f");
    text(ctx, kind === "cafe" ? "CAFE" : kind === "harbor" ? "HARBOR" : "SHOP", x+w/2, y-h+15, 8, "#fff4c6");
  }
  if (kind === "office") {
    cube(ctx, x+w*.42, y-h-4, 10, 18, 6, "#e9fbff", "#88a9bc", "#ffffff");
    line(ctx, [[x+w*.5,y-h-22],[x+w*.5,y-h-39]], "#173e6d", 2);
    poly(ctx, [[x+w*.5,y-h-39],[x+w*.5+18,y-h-34],[x+w*.5,y-h-28]], "#ef4b3f");
  }
}
function drawBlock(ctx: Ctx, material: string, w=84, h=84) {
  const palette: Record<string,[string,string,string]> = {
    red:["#f3484f","#bb2740","#ff8680"],blue:["#1599f4","#0665c4","#67d9ff"],green:["#45cf39","#158b33","#97f35d"],
    yellow:["#ffd32f","#e28a12","#fff36a"],purple:["#ad4dea","#7230bd","#e694ff"],stone:["#9599a1","#626979","#c7ccd0"],
    wood:["#b96b32","#74411f","#e49b4d"],grass:["#8b5b31","#68401f","#6edf3e"],sand:["#efd394","#c5a46a","#fff0b8"],
    metal:["#8795a8","#4d5c70","#c5d1de"],ice:["#54d8f5","#159ad0","#d8fbff"],rainbow:["#4cc9f5","#8b45e5","#ffd544"]
  };
  const [front,side,top]=palette[material] ?? palette.blue;
  const x=8,y=72,d=9;
  cube(ctx,x,y,w-25,h-25,d,front,side,top);
  roundRect(ctx,x+4,y-h+29,w-34,h-38,8,"rgba(255,255,255,.05)","rgba(255,255,255,.35)",1);
  if(material==="stone"){
    line(ctx,[[22,29],[30,35],[26,45],[38,53]],"#646a72",2);
    line(ctx,[[50,25],[45,36],[57,43]],"#d0d4d7",1.5);
  } else if(material==="wood"){
    for(let yy=23;yy<63;yy+=14) line(ctx,[[15,yy],[65,yy]],"#6f3d21",2);
    line(ctx,[[31,18],[31,68],[49,18],[49,68]],"#8a4c27",1.2);
  } else if(material==="grass"){
    roundRect(ctx,8,13,59,14,3,"#5ed63c");
    for(let xx=12;xx<64;xx+=9) poly(ctx,[[xx,25],[xx+4,34],[xx+8,25]],"#4bb92f");
  } else if(material==="sand"){
    [[20,31],[37,22],[52,48],[27,58]].forEach(([px,py])=>ellipse(ctx,px,py,2,1.4,"#c29f67"));
  } else if(material==="metal"){
    [[16,21],[58,21],[16,59],[58,59]].forEach(([px,py])=>{ellipse(ctx,px,py,4,4,"#cbd4de","#485467",1);ellipse(ctx,px-1,py-1,1.2,1.2,"#ffffff");});
  } else if(material==="ice"){
    line(ctx,[[16,57],[31,34],[42,48],[61,20]],"rgba(255,255,255,.8)",2);
    line(ctx,[[15,29],[28,20],[37,30]],"rgba(255,255,255,.7)",1.5);
  } else if(material==="rainbow"){
    const cols=["#ff5157","#ffb52f","#f5e631","#51d441","#34a8f2","#9547e8"];
    cols.forEach((col,i)=>ctx.fillStyle=col, cols.forEach(()=>{}));
    cols.forEach((col,i)=>{ctx.fillStyle=col;ctx.fillRect(10+i*9,18,9,47);});
    ctx.fillStyle="rgba(255,255,255,.28)";ctx.fillRect(12,20,48,8);
  }
}
function accessory(ctx: Ctx, name: string) {
  // A consistent beveled finish for equipment, without affecting world art.
  const roundRect = (c: Ctx, x: number, y: number, w: number, h: number, r: number, color: string, edge = "#173955", lw = 2) => {
    const g = c.createLinearGradient(x, y, x + w, y + h);
    g.addColorStop(0, color); g.addColorStop(1, color);
    c.beginPath(); c.roundRect(x, y + 3, w, h, r); c.fillStyle = edge; c.fill();
    c.beginPath(); c.roundRect(x, y, w, h, r); c.fillStyle = g; c.fill(); c.strokeStyle = edge; c.lineWidth = lw; c.stroke();
    c.save(); c.clip(); const light = c.createLinearGradient(0,y,0,y+h);
    light.addColorStop(0,"#ffffff55"); light.addColorStop(.45,"#ffffff00"); light.addColorStop(1,"#07336844");
    c.fillStyle=light;c.fillRect(x,y,w,h);c.restore();
    line(c,[[x+r,y+3],[x+w-r,y+3]],"#ffffff88",2);
  };
  const cx=60,cy=60;
  if(name==="chef-hat") {
    for (const dx of [-18,0,18]) ellipse(ctx,cx+dx,cy-12,20,18,"#ffffff","#cdd8e3",1);
    roundRect(ctx,28,cy-7,64,28,9,"#ffffff","#cdd8e3",1);
    roundRect(ctx,29,cy+13,62,7,3,"#ef4d4d");
  } else if(name==="sailor-hat") {
    roundRect(ctx,27,cy-12,66,29,10,"#ffffff","#cbd6e1",1);
    roundRect(ctx,24,cy+8,72,8,4,"#1769b0");
    line(ctx,[[cx,cy-9],[cx,cy+7],[cx-10,cy],[cx,cy+7],[cx+10,cy]],"#1769b0",3);
  } else if(name==="tourist-hat") {
    ellipse(ctx,cx,cy,37,18,"#d6a43e","#9b712a",1);
    roundRect(ctx,20,cy-2,80,10,5,"#d6a43e");
    roundRect(ctx,31,cy-10,58,7,3,"#a24a32");
  } else if(name==="shop-sign") {
    roundRect(ctx,25,33,70,50,7,"#fff0d8","#a85b34",2);
    for(let i=0;i<5;i++) poly(ctx,[[24+i*15,33],[39+i*15,33],[36+i*15,47],[21+i*15,47]],i%2?"#ffffff":"#ef4e43");
    roundRect(ctx,51,56,18,27,3,"#39b6ed");
  } else if(name==="ship-wheel") {
    ellipse(ctx,cx,cy,26,26,"#c88236","#7c4a23",3);
    ellipse(ctx,cx,cy,8,8,"#e6aa59","#7c4a23",2);
    for(let i=0;i<8;i++){const a=i*Math.PI/4;line(ctx,[[cx+Math.cos(a)*9,cy+Math.sin(a)*9],[cx+Math.cos(a)*38,cy+Math.sin(a)*38]],"#8f5529",5);}
  } else if(name.includes("cap")) {
    const blue = name === "mechanic-cap";
    roundRect(ctx,30,29,61,42,12,blue ? "#168ff0" : "#ef4c40",blue ? "#0a4f9a" : "#9c2e2f",2);
    poly(ctx,[[74,30],[89,40],[91,65],[77,62]],blue ? "#0b63b7" : "#be2d2f");
    roundRect(ctx,24,64,75,12,4,blue ? "#219cf6" : "#ff6354",blue ? "#0a4f9a" : "#9c2e2f",2);
    line(ctx,[[38,55],[39,41],[49,35]],"#ffffff99",3);
    roundRect(ctx,54,43,15,17,2,"#24415d");
  }
  else if(name==="backpack") {roundRect(ctx,34,25,52,66,10,"#7d4b2e","#4f2f1f",2);roundRect(ctx,43,35,34,18,5,"#a86635");roundRect(ctx,45,18,27,10,3,"#6a4028");roundRect(ctx,40,62,40,22,4,"#a86635");roundRect(ctx,49,48,8,11,2,"#ffd564");roundRect(ctx,65,72,8,10,2,"#ffd564");}
  else if(name==="blueprint") {roundRect(ctx,34,18,52,76,5,"#3b92f0","#ffffff",2);line(ctx,[[44,75],[44,44],[57,44],[57,63],[70,63],[70,34]],"#dff5ff",3);}
  else if(name==="laptop") {roundRect(ctx,25,24,70,50,6,"#7a8290","#d8dee7",2);roundRect(ctx,20,76,80,10,4,"#525a68");roundRect(ctx,32,31,56,35,2,"#5c40ac");line(ctx,[[48,58],[48,47],[59,47],[59,37],[70,37],[70,58]],"#e4d9ff",3);}
  else if(name==="pencil") {ctx.save();ctx.translate(cx,cy);ctx.rotate(-.45);roundRect(ctx,-8,-42,16,72,5,"#f2a62a");poly(ctx,[[-8,30],[8,30],[0,47]],"#f0d8b2");ctx.restore();}
  else if(name.includes("toolbox")) {roundRect(ctx,23,39,74,45,7,"#e54835","#8f2d27",2);roundRect(ctx,40,25,40,17,7,"#2d3b4c");roundRect(ctx,34,58,10,15,2,"#e1edf1");roundRect(ctx,78,58,10,15,2,"#e1edf1");}
  else if(name==="cake") {roundRect(ctx,26,45,68,37,5,"#e8b070","#9c6237",1);roundRect(ctx,26,38,68,15,5,"#fff0ea");ellipse(ctx,60,34,6,6,"#e33c3d");}
  else if(name==="wrench") {ctx.save();ctx.translate(cx,cy);ctx.rotate(-.55);roundRect(ctx,-7,-39,14,78,6,"#8e9aaa","#4c5866",1);ellipse(ctx,0,-37,17,14,"#9aa5b3");ellipse(ctx,0,-37,8,7,"#ffffff");ctx.restore();}
  else if(name==="tool-belt") {roundRect(ctx,18,48,84,18,6,"#7d3e27");roundRect(ctx,28,59,20,24,4,"#ba5a2c");roundRect(ctx,72,59,20,24,4,"#ba5a2c");}
  else if(name==="binoculars") {ellipse(ctx,45,56,18,20,"#28394f","#0c6eaa",3);ellipse(ctx,75,56,18,20,"#28394f","#0c6eaa",3);roundRect(ctx,52,49,16,14,4,"#1b2637");}
  else if(name==="camera") {roundRect(ctx,24,38,72,51,9,"#26364b","#101b29",2);ellipse(ctx,60,64,19,19,"#4cbce9","#ffffff",3);roundRect(ctx,34,31,25,11,4,"#374a62");}
  else if(name==="collar") {
    ellipse(ctx,60,57,36,20,"#a8212d","#782033",2);
    ellipse(ctx,60,52,29,12,"#f1faff","#ed5648",6);
    ctx.strokeStyle="#f34a3b";ctx.lineWidth=11;ctx.beginPath();ctx.ellipse(60,60,32,18,0,0,Math.PI);ctx.stroke();
    roundRect(ctx,50,68,20,19,3,"#ffd24e","#b07a20",2);roundRect(ctx,56,73,8,9,1,"#fff8bc");
  }
  else if(name==="bone") {
    ctx.save();ctx.translate(60,60);ctx.rotate(-.35);
    const p=new Path2D('M-24 -9 C-45 -32 -53 -4 -37 0 C-54 14 -31 32 -23 10 L23 10 C35 34 52 13 36 0 C53 -12 36 -32 24 -9 Z');
    ctx.fillStyle="#d8d4ca";ctx.translate(0,4);ctx.fill(p);ctx.translate(0,-4);ctx.fillStyle="#fffdf0";ctx.strokeStyle="#9faaa9";ctx.lineWidth=2;ctx.fill(p);ctx.stroke(p);ctx.restore();
  }
  else if(name.includes("hat")) {ellipse(ctx,cx,cy,33,18,"#ffd02d","#a97510",1);roundRect(ctx,26,60,68,10,5,"#ffd02d");}
  else {text(ctx,"✦",cx,cy,38,"#ffd735",NAVY,2);}
}
function iconArt(ctx: Ctx, name: string) {
  const cx=60,cy=60;
  if(name==="city"){
    voxelTile(ctx,10,92,100,44,"#70d941","#9b673b","#70492e");
    drawBuilding(ctx,22,91,31,43,7,"#f1bd73","shop");
    drawBuilding(ctx,52,91,28,65,7,"#55b8ee","apartment");
    drawBuilding(ctx,79,91,22,81,6,"#4ca9e5","office");
    drawTree(ctx,18,91,.42);
    drawTree(ctx,98,91,.38);
  }
  else if(name==="hammer"){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.6);roundRect(ctx,-7,-15,14,59,6,"#f0a426","#925727",2);roundRect(ctx,-27,-31,54,26,7,"#e94a39","#8c2b2a",2);roundRect(ctx,-22,-28,14,20,5,"#ffd33b");roundRect(ctx,8,-28,14,20,5,"#ffd33b");ctx.restore();}
  else if(name==="shuffle"){line(ctx,[[24,42],[39,42],[78,80],[96,80]],"#8a2cb6",10);line(ctx,[[24,80],[40,80],[77,42],[96,42]],"#d566f1",10);poly(ctx,[[94,33],[110,42],[94,51]],"#d566f1");poly(ctx,[[94,71],[110,80],[94,89]],"#8a2cb6");}
  else if(name==="line"){ctx.save();ctx.translate(cx,cy);ctx.rotate(.65);roundRect(ctx,-10,-39,20,68,7,"#d7e8ff","#6d82a7",2);roundRect(ctx,-13,-50,26,26,7,"#ef443b","#8e2529",2);poly(ctx,[[-13,-50],[0,-68],[13,-50]],"#ef443b");ctx.restore();}
  else if(name==="chest"){roundRect(ctx,27,48,66,43,7,"#f39a1e","#9b5419",2);roundRect(ctx,24,32,72,29,11,"#ffb52b","#a85b18",2);roundRect(ctx,54,48,12,26,3,"#4db9f4","#1d6293",2);}
  else if(name==="trophy"){roundRect(ctx,50,25,20,42,5,"#ffd132","#bd7e0d",2);ellipse(ctx,60,29,24,18,"#ffdc45","#bd7e0d",2);line(ctx,[[42,34],[30,34],[34,52],[47,52]],"#d09016",4);line(ctx,[[78,34],[90,34],[86,52],[73,52]],"#d09016",4);roundRect(ctx,42,70,36,12,4,"#d48b16");}
  else if(name==="lock"){roundRect(ctx,34,53,52,40,8,"#8ea4bb","#4e6278",2);ctx.strokeStyle="#647a90";ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,53,18,Math.PI,0);ctx.stroke();}
  else text(ctx,name.slice(0,1).toUpperCase(),cx,cy,44,"#ffffff",NAVY,3);
}
function prepareArt(scene: Phaser.Scene, name: string) {
  const character = characterAsset(scene, name);
  if (character) return character;
  if (name === 'logo') return logoTexture(scene);
  const sharedIcon = iconTexture(scene, name);
  if (sharedIcon) return sharedIcon;
  const environmentAliases: Record<string, CityArt> = { office: 'tower', cafe: 'coffee', shopfront: 'market', dock: 'boardwalk' };
  const environment = environmentAliases[name] ?? name;
  if (['house','coffee','market','tower','apartment','park','garden','boardwalk','lighthouse','wheel','tree','road','grass','palm','bridge','sailboat','bench','lamp','fence'].includes(environment))
    return cityTexture(scene, environment as CityArt);
  const key=`block-city-original-${name}-v5`;
  if(scene.textures.exists(key)) return key;
  return canvasTexture(scene,key,120,140,(ctx,w,h)=>{
    ctx.clearRect(0,0,w,h);
    if(name==="chest"){iconArt(ctx,"chest");return;}
    if(name.startsWith("block-")){drawBlock(ctx,name.replace("block-",""));return;}
    if(["city","coin","settings","hat","puzzle","shop","friends","map","hammer","shuffle","line","star","chest","trophy","lock"].includes(name)){iconArt(ctx,name);return;}
    if(["builder-cap","mechanic-cap","backpack","blueprint","laptop","pencil","worker-toolbox","cake","wrench","tool-belt","binoculars","camera","collar","bone","chef-hat","sailor-hat","tourist-hat","shop-sign","ship-wheel","chef-hat","sailor-hat","tourist-hat","shop-sign","ship-wheel"].includes(name)){accessory(ctx,name);return;}
    if(name==="menu-coast"||name==="level-coast"){
      const grad=ctx.createLinearGradient(0,0,0,h);grad.addColorStop(0,"#72dfff");grad.addColorStop(1,"#1bb2dc");ctx.fillStyle=grad;ctx.fillRect(0,0,w,h);voxelTile(ctx,8,107,52,22,"#70db3c","#9b663a","#6b482e");drawTree(ctx,30,96,.45);drawBuilding(ctx,61,102,36,48,8,"#62b8ea","office");return;
    }
    if(name==="panel-dialog"||name==="panel-card"){
      roundRect(ctx,7,24,106,87,18,name==="panel-card"?"#fff5dc":"#f8fdff",name==="panel-card"?"#f2c85f":"#5ecff5",4);roundRect(ctx,11,28,98,77,15,"rgba(255,255,255,.25)","#ffffff",2);return;
    }
    iconArt(ctx,name);
  });
}

/**
 * Kept for API compatibility. References are design-only now, so there is no
 * raster sheet to preload.
 */
export function preloadReferenceArt(_scene: Phaser.Scene) {}

export function prepareReferenceTextures(scene: Phaser.Scene) {
  [
    "logo","builder","planner","worker","chef","mechanic","sailor","tourist","corgi",
    "builder-body","planner-body","worker-body","chef-body","mechanic-body","sailor-body","tourist-body","corgi-body",
    "builder-wink","builder-surprised","planner-wink","planner-thinking","corgi-wink","corgi-excited",
    "builder-cap","mechanic-cap","backpack","blueprint","laptop","pencil","worker-toolbox","cake","wrench","tool-belt","binoculars","camera","collar","bone",
    "house","shopfront","apartment","office","coffee","cafe","market","tower","park","garden","road","grass","tree","palm","bench","lamp","fence","bridge","dock","boardwalk","lighthouse","wheel","sailboat",
    "block-red","block-blue","block-green","block-yellow","block-purple","block-stone","block-wood","block-grass","block-sand","block-metal","block-ice","block-rainbow",
    "hammer","shuffle","line","hat","puzzle","shop","friends","map","city","coin","star","settings","chest","trophy","lock","panel-dialog","panel-card","menu-coast","level-coast",
  ].forEach(name=>prepareArt(scene,name));
}

export function referenceArt(scene: Phaser.Scene, x: number, y: number, name: string, width: number, height = width) {
  const key = prepareArt(scene,name);
  if (!key) return undefined;
  return scene.add.image(x,y,key).setDisplaySize(width,height);
}

