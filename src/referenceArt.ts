import Phaser from "phaser";

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
function drawPalm(ctx: Ctx, cx: number, base: number, scale = 1) {
  line(ctx, [[cx, base], [cx + 2 * scale, base - 38 * scale], [cx - 2 * scale, base - 56 * scale]], "#8c5c2f", 7 * scale);
  const crownY = base - 58 * scale;
  for (const angle of [-2.5, -1.8, -1.0, -.2, .65]) {
    const ex = cx + Math.cos(angle) * 31 * scale;
    const ey = crownY + Math.sin(angle) * 14 * scale;
    poly(ctx, [[cx, crownY], [cx + (ex-cx)*.55, crownY + (ey-crownY)*.45 - 4*scale], [ex, ey], [cx + (ex-cx)*.52, crownY + (ey-crownY)*.58 + 4*scale]], angle < -1.2 ? "#56d337" : "#27aa37");
  }
}
function drawHouse(ctx: Ctx, x: number, y: number, scale = 1, roof = "#ef5142") {
  const w = 72 * scale, h = 52 * scale, d = 15 * scale;
  cube(ctx, x, y, w, h, d, "#fff2d5", "#d6aa78", "#fffbe7");
  poly(ctx, [[x - 6*scale, y-h], [x+w*.48, y-h-34*scale], [x+w+8*scale, y-h], [x+w*.50, y-h+10*scale]], roof, "#9e2f31", 1.4);
  rectWindow(ctx, x+11*scale, y-h+17*scale, 16*scale, 17*scale);
  rectWindow(ctx, x+44*scale, y-h+17*scale, 16*scale, 17*scale);
  roundRect(ctx, x+w*.43, y-26*scale, 15*scale, 26*scale, 3*scale, "#8c5b3b", "#5f3c2b", 1);
  roundRect(ctx, x+6*scale, y-5*scale, 16*scale, 4*scale, 2*scale, "#5ecb38");
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
function drawBridge(ctx: Ctx, x: number, y: number, scale = 1) {
  const w=150*scale,h=44*scale;
  shadow(ctx,x+w*.5,y+18*scale,w*.55,10*scale,.14);
  roundRect(ctx,x,y-8*scale,w,h*.34,5*scale,"#f2dfbc","#b49a79",1);
  [0,1,2].forEach(i=>{
    const xx=x+16*scale+i*53*scale;
    ctx.strokeStyle="#a98a69";ctx.lineWidth=7*scale;ctx.beginPath();ctx.arc(xx+17*scale,y+12*scale,18*scale,Math.PI,0);ctx.stroke();
  });
  line(ctx,[[x,y-10*scale],[x+w,y-10*scale]],"#fff8e4",4*scale);
  for(let i=0;i<7;i++) line(ctx,[[x+8*scale+i*22*scale,y-14*scale],[x+8*scale+i*22*scale,y-28*scale]],"#9c815f",2*scale);
}
function drawFerris(ctx: Ctx, cx: number, base: number, scale = 1) {
  const r=48*scale;
  line(ctx,[[cx-20*scale,base],[cx,base-r*1.15],[cx+20*scale,base]],"#d9efff",6*scale);
  ctx.strokeStyle="#f9fbff";ctx.lineWidth=5*scale;ctx.beginPath();ctx.arc(cx,base-r,r,0,Math.PI*2);ctx.stroke();
  ctx.strokeStyle="#d34c69";ctx.lineWidth=2*scale;ctx.beginPath();ctx.arc(cx,base-r,r*.82,0,Math.PI*2);ctx.stroke();
  for(let i=0;i<10;i++){
    const a=i*Math.PI*2/10, gx=cx+Math.cos(a)*r, gy=base-r+Math.sin(a)*r;
    line(ctx,[[cx,base-r],[gx,gy]], i%2 ? "#4cc5f4" : "#ef6781",1.4*scale);
    roundRect(ctx,gx-7*scale,gy-5*scale,14*scale,11*scale,3*scale,i%2 ? "#33a7ef":"#f04f67","#ffffff",1);
  }
  ellipse(ctx,cx,base-r,11*scale,11*scale,"#ffd936","#e4a51b",2);
  ctx.fillStyle="#543e23";ctx.beginPath();ctx.arc(cx-3*scale,base-r-2*scale,1.5*scale,0,Math.PI*2);ctx.arc(cx+3*scale,base-r-2*scale,1.5*scale,0,Math.PI*2);ctx.fill();
  line(ctx,[[cx-4*scale,base-r+4*scale],[cx,base-r+6*scale],[cx+4*scale,base-r+4*scale]],"#8a5b24",1.4*scale);
}
function drawLighthouse(ctx: Ctx, cx: number, base: number, scale=1) {
  const w=28*scale,h=78*scale;
  poly(ctx,[[cx-w*.42,base],[cx+w*.42,base],[cx+w*.25,base-h],[cx-w*.25,base-h]],"#fff9e8","#9ab7c3",1);
  for(let i=0;i<3;i++) roundRect(ctx,cx-w*.34,base-22*scale-i*21*scale,w*.68,7*scale,2*scale,i%2?"#ef4d43":"#ffffff");
  roundRect(ctx,cx-w*.42,base-h-5*scale,w*.84,9*scale,2*scale,"#ef4d43","#a62b30",1);
  roundRect(ctx,cx-w*.23,base-h-20*scale,w*.46,16*scale,3*scale,"#49c8ef","#0a699e",1);
  poly(ctx,[[cx-w*.35,base-h-20*scale],[cx,base-h-34*scale],[cx+w*.35,base-h-20*scale]],"#ef4d43","#9e2d31",1);
}
function drawBoat(ctx: Ctx, x:number,y:number,scale=1){
  poly(ctx,[[x,y],[x+76*scale,y],[x+62*scale,y+18*scale],[x+14*scale,y+18*scale]],"#ffffff","#0b659f",1.2);
  poly(ctx,[[x+10*scale,y+10*scale],[x+64*scale,y+10*scale],[x+58*scale,y+17*scale],[x+15*scale,y+17*scale]],"#178ccb");
  line(ctx,[[x+39*scale,y],[x+39*scale,y-59*scale]],"#7d5836",3*scale);
  poly(ctx,[[x+41*scale,y-56*scale],[x+41*scale,y-5*scale],[x+70*scale,y-15*scale]],"#ef4d43","#b62f31",1);
  poly(ctx,[[x+36*scale,y-51*scale],[x+36*scale,y-5*scale],[x+8*scale,y-17*scale]],"#fff8e5","#88b4cc",1);
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
type CharacterKind = "builder"|"planner"|"worker"|"chef"|"mechanic"|"sailor"|"tourist";
function drawCharacter(ctx: Ctx, kind: CharacterKind, body: boolean, expression = "happy") {
  const palettes: Record<CharacterKind,{hat:string,shirt:string,accent:string,hair:string,skin:string}> = {
    builder:{hat:"#ef4742",shirt:"#178be8",accent:"#f5f7ff",hair:"#5a3826",skin:"#ffd2ae"},
    planner:{hat:"#b34ee8",shirt:"#8151d1",accent:"#e4c7ff",hair:"#513049",skin:"#ffd2ae"},
    worker:{hat:"#ffd22e",shirt:"#f07a22",accent:"#fff2c7",hair:"#5e3b2a",skin:"#eac09b"},
    chef:{hat:"#f5f5f5",shirt:"#ffffff",accent:"#e84d4d",hair:"#5b3629",skin:"#ffd0aa"},
    mechanic:{hat:"#177ad0",shirt:"#177ad0",accent:"#76d7ff",hair:"#473024",skin:"#f0c49f"},
    sailor:{hat:"#f5f5f5",shirt:"#ffffff",accent:"#166ab0",hair:"#5a3827",skin:"#efc39f"},
    tourist:{hat:"#d6a43e",shirt:"#65c77b",accent:"#f0cf45",hair:"#513425",skin:"#f2c79f"},
  };
  const p=palettes[kind];
  const cx=60, headY=body?54:60, headR=body?27:34;
  if(body) shadow(ctx,cx,135,36,7,.16);
  // hair silhouette
  roundRect(ctx,cx-headR-4,headY-headR-3,headR*2+8,headR*2+12,14,p.hair);
  // face
  roundRect(ctx,cx-headR,headY-headR,headR*2,headR*2,13,p.skin,"#5d3a2a",1.2);
  // bangs
  for(let i=0;i<5;i++) roundRect(ctx,cx-headR+5+i*11,headY-headR-3+(i%2)*3,12,14,5,p.hair);
  // hat
  const hatY=headY-headR-15;
  if(kind==="chef"){
    for(let dx of [-16,0,16]) ellipse(ctx,cx+dx,hatY+6,18,17,"#ffffff","#d9dfe6",1);
    roundRect(ctx,cx-27,hatY+8,54,18,6,"#ffffff","#d9dfe6",1);
    roundRect(ctx,cx-24,hatY+22,48,7,3,"#ef4d4d");
  } else if(kind==="worker"){
    ellipse(ctx,cx,hatY+14,36,19,p.hat,"#b77f0c",1.2);roundRect(ctx,cx-35,hatY+17,70,9,4,p.hat);
  } else if(kind==="sailor"){
    roundRect(ctx,cx-31,hatY+10,62,20,8,"#ffffff","#cdd7df",1);roundRect(ctx,cx-34,hatY+26,68,7,3,"#166ab0");text(ctx,"⚓",cx,hatY+19,13,"#155b9d");
  } else if(kind==="tourist"){
    ellipse(ctx,cx,hatY+14,37,18,p.hat,"#a6742a",1);roundRect(ctx,cx-39,hatY+16,78,9,5,p.hat);roundRect(ctx,cx-28,hatY+10,56,6,3,"#9a402a");
  } else {
    roundRect(ctx,cx-32,hatY+9,64,25,9,p.hat,"#8b2b40",1);
    roundRect(ctx,cx-35,hatY+26,70,8,4,p.hat);
    if(kind==="mechanic") text(ctx,"⚙",cx,hatY+20,14,"#ffffff");
    if(kind==="builder") roundRect(ctx,cx-6,hatY+14,12,9,2,"#4b2823");
    if(kind==="planner") roundRect(ctx,cx-6,hatY+14,12,9,2,"#f2d5ff");
  }
  // face
  const eyeY=headY+1;
  if(expression==="wink"){
    line(ctx,[[cx-17,eyeY],[cx-10,eyeY+2]],"#3a271f",2);
  } else {
    roundRect(ctx,cx-18,eyeY-5,6,13,3,"#33241e");
  }
  roundRect(ctx,cx+11,eyeY-5,6,13,3,"#33241e");
  if(expression==="surprised") ellipse(ctx,cx,headY+19,4,6,"#a44339");
  else {
    ctx.strokeStyle="#b64c43";ctx.lineWidth=2;ctx.beginPath();ctx.arc(cx,headY+14,9,.15*Math.PI,.85*Math.PI);ctx.stroke();
  }
  ellipse(ctx,cx-21,headY+14,5,3,"rgba(245,113,108,.28)");ellipse(ctx,cx+21,headY+14,5,3,"rgba(245,113,108,.28)");
  if(!body) return;
  // torso
  roundRect(ctx,cx-24,headY+31,48,43,9,p.shirt,"#0a477b",1);
  roundRect(ctx,cx-18,headY+39,36,8,3,p.accent);
  // arms
  roundRect(ctx,cx-35,headY+38,15,38,7,p.skin,"#77452e",1);roundRect(ctx,cx+20,headY+38,15,38,7,p.skin,"#77452e",1);
  // legs
  roundRect(ctx,cx-23,headY+72,18,38,6,kind==="planner"?"#38406d":"#245993","#173252",1);
  roundRect(ctx,cx+5,headY+72,18,38,6,kind==="planner"?"#38406d":"#245993","#173252",1);
  roundRect(ctx,cx-27,headY+101,24,13,5,kind==="builder"?"#ef4d42":"#2f4056","#ffffff",2);
  roundRect(ctx,cx+3,headY+101,24,13,5,kind==="builder"?"#ef4d42":"#2f4056","#ffffff",2);
  // profession cue
  if(kind==="planner") {roundRect(ctx,cx+17,headY+44,24,34,3,"#2c8cf2","#ffffff",1);line(ctx,[[cx+21,headY+53],[cx+35,headY+53],[cx+21,headY+61],[cx+35,headY+61]],"#d9efff",1);}
  if(kind==="worker"||kind==="mechanic") {line(ctx,[[cx+25,headY+45],[cx+39,headY+26]],"#697484",5);ellipse(ctx,cx+41,headY+24,7,7,"#aeb8c2","#5d6975",1);}
  if(kind==="tourist") {ellipse(ctx,cx,headY+55,12,10,"#333e52","#ffffff",2);ellipse(ctx,cx,headY+55,5,5,"#53b9f0");}
}
function drawCorgi(ctx: Ctx, body: boolean, expression="happy") {
  const cx=60, base=body?118:82;
  shadow(ctx,cx,base+12,34,7,.16);
  if(body){roundRect(ctx,31,75,58,42,17,"#d98a22","#9a5a16",1);roundRect(ctx,28,99,17,25,6,"#d98a22");roundRect(ctx,73,99,17,25,6,"#d98a22");}
  roundRect(ctx,cx-29,base-59,58,48,17,"#dc8d22","#935616",1);
  poly(ctx,[[cx-27,base-50],[cx-20,base-78],[cx-5,base-55]],"#d98a22","#925512",1);
  poly(ctx,[[cx+27,base-50],[cx+20,base-78],[cx+5,base-55]],"#d98a22","#925512",1);
  roundRect(ctx,cx-11,base-55,22,34,9,"#fff6e6");
  roundRect(ctx,cx-6,base-37,12,8,4,"#29241f");
  if(expression==="wink") line(ctx,[[cx-19,base-44],[cx-12,base-42]],"#2b241f",2);
  else ellipse(ctx,cx-15,base-44,3,5,"#2b241f");
  ellipse(ctx,cx+15,base-44,3,5,"#2b241f");
  if(expression==="excited") {line(ctx,[[cx-5,base-27],[cx,base-23],[cx+5,base-27]],"#8f392e",2);ellipse(ctx,cx,base-21,4,3,"#ef6862");}
  else line(ctx,[[cx-5,base-28],[cx,base-25],[cx+5,base-28]],"#8f392e",2);
  roundRect(ctx,cx-10,base-17,20,6,3,"#ef463f");ellipse(ctx,cx,base-14,5,5,"#ffd83e","#b77616",1);
}
function accessory(ctx: Ctx, name: string) {
  const cx=60,cy=60;
  if(name==="chef-hat") {
    for (const dx of [-18,0,18]) ellipse(ctx,cx+dx,cy-12,20,18,"#ffffff","#cdd8e3",1);
    roundRect(ctx,28,cy-7,64,28,9,"#ffffff","#cdd8e3",1);
    roundRect(ctx,29,cy+13,62,7,3,"#ef4d4d");
  } else if(name==="sailor-hat") {
    roundRect(ctx,27,cy-12,66,29,10,"#ffffff","#cbd6e1",1);
    roundRect(ctx,24,cy+8,72,8,4,"#1769b0");
    text(ctx,"⚓",cx,cy-1,19,"#1769b0");
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
  } else if(name.includes("cap")) {ellipse(ctx,cx,cy,32,18,"#ed4943","#983036",1);roundRect(ctx,28,58,64,11,4,"#ed4943");}
  else if(name==="backpack") {roundRect(ctx,34,25,52,66,10,"#7d4b2e","#4f2f1f",2);roundRect(ctx,43,35,34,18,5,"#a86635");}
  else if(name==="blueprint") {roundRect(ctx,34,18,52,76,5,"#3b92f0","#ffffff",2);line(ctx,[[44,75],[44,44],[57,44],[57,63],[70,63],[70,34]],"#dff5ff",3);}
  else if(name==="laptop") {roundRect(ctx,25,24,70,50,6,"#7a8290","#d8dee7",2);roundRect(ctx,20,76,80,10,4,"#525a68");}
  else if(name==="pencil") {ctx.save();ctx.translate(cx,cy);ctx.rotate(-.45);roundRect(ctx,-8,-42,16,72,5,"#f2a62a");poly(ctx,[[-8,30],[8,30],[0,47]],"#f0d8b2");ctx.restore();}
  else if(name.includes("toolbox")) {roundRect(ctx,23,39,74,45,7,"#e54835","#8f2d27",2);roundRect(ctx,40,25,40,17,7,"#2d3b4c");}
  else if(name==="cake") {roundRect(ctx,26,45,68,37,5,"#e8b070","#9c6237",1);roundRect(ctx,26,38,68,15,5,"#fff0ea");ellipse(ctx,60,34,6,6,"#e33c3d");}
  else if(name==="wrench") {ctx.save();ctx.translate(cx,cy);ctx.rotate(-.55);roundRect(ctx,-7,-39,14,78,6,"#8e9aaa","#4c5866",1);ellipse(ctx,0,-37,17,14,"#9aa5b3");ellipse(ctx,0,-37,8,7,"#ffffff");ctx.restore();}
  else if(name==="tool-belt") {roundRect(ctx,18,48,84,18,6,"#7d3e27");roundRect(ctx,28,59,20,24,4,"#ba5a2c");roundRect(ctx,72,59,20,24,4,"#ba5a2c");}
  else if(name==="binoculars") {ellipse(ctx,45,56,18,20,"#28394f","#0c6eaa",3);ellipse(ctx,75,56,18,20,"#28394f","#0c6eaa",3);roundRect(ctx,52,49,16,14,4,"#1b2637");}
  else if(name==="camera") {roundRect(ctx,24,38,72,51,9,"#26364b","#101b29",2);ellipse(ctx,60,64,19,19,"#4cbce9","#ffffff",3);roundRect(ctx,34,31,25,11,4,"#374a62");}
  else if(name==="collar") {ctx.strokeStyle="#e64238";ctx.lineWidth=14;ctx.beginPath();ctx.arc(cx,cy,34,.15*Math.PI,.85*Math.PI);ctx.stroke();ellipse(ctx,cx,82,8,8,"#ffd73c","#b77b18",1);}
  else if(name==="bone") {roundRect(ctx,35,52,50,16,8,"#f5f2e8","#c9c7bf",1);ellipse(ctx,34,53,12,12,"#f5f2e8");ellipse(ctx,86,53,12,12,"#f5f2e8");}
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
  else if(name==="coin"){ellipse(ctx,cx,cy,31,31,"#ffc928","#d98612",3);ellipse(ctx,cx,cy,22,22,"#ffeb58","#f1a20e",2);text(ctx,"●",cx,cy,18,"#fff7a2");}
  else if(name==="settings"){
    roundRect(ctx,22,22,76,76,18,"#137de0","#064a9b",3);
    ctx.save();
    ctx.translate(cx,cy);
    ctx.fillStyle="#eefbff";
    for(let i=0;i<8;i++){
      ctx.save();ctx.rotate(i*Math.PI/4);roundRect(ctx,-6,-31,12,17,3,"#eefbff","#7abde5",1);ctx.restore();
    }
    ellipse(ctx,0,0,23,23,"#eefbff","#7abde5",2);
    ellipse(ctx,0,0,9,9,"#1371be","#064a9b",2);
    ctx.restore();
  }
  else if(name==="hat"){ellipse(ctx,cx,cy+5,31,18,"#ffd22e","#a66d0b",2);roundRect(ctx,25,cy+7,70,10,5,"#ffd22e");line(ctx,[[cx,cy-18],[cx,cy+10]],"#e6a51c",2);}
  else if(name==="puzzle"){roundRect(ctx,28,30,64,60,12,"#c55bf0","#702aaf",2);ellipse(ctx,60,29,12,12,"#c55bf0");ellipse(ctx,27,60,12,12,"#c55bf0");}
  else if(name==="shop"){roundRect(ctx,28,49,64,43,6,"#fff1d9","#a95832",2);for(let i=0;i<5;i++)poly(ctx,[[25+i*14,49],[39+i*14,49],[37+i*14,65],[23+i*14,65]],i%2?"#ffffff":"#ef4c43");roundRect(ctx,47,65,23,27,3,"#3fb4ef");}
  else if(name==="friends"){ellipse(ctx,47,48,15,15,"#dff4ff","#4e91c7",2);ellipse(ctx,73,48,15,15,"#dff4ff","#4e91c7",2);roundRect(ctx,28,64,64,29,14,"#dff4ff","#4e91c7",2);}
  else if(name==="map"){poly(ctx,[[22,40],[48,32],[72,40],[98,32],[98,82],[72,90],[48,82],[22,90]],"#7fd34a","#ffffff",2);line(ctx,[[48,32],[48,82],[72,40],[72,90]],"#e9ffe1",2);ellipse(ctx,72,44,15,18,"#ef4b43","#9c2930",2);ellipse(ctx,72,42,5,5,"#ffffff");}
  else if(name==="hammer"){ctx.save();ctx.translate(cx,cy);ctx.rotate(-.6);roundRect(ctx,-7,-15,14,59,6,"#f0a426","#925727",2);roundRect(ctx,-27,-31,54,26,7,"#e94a39","#8c2b2a",2);roundRect(ctx,-22,-28,14,20,5,"#ffd33b");roundRect(ctx,8,-28,14,20,5,"#ffd33b");ctx.restore();}
  else if(name==="shuffle"){line(ctx,[[24,42],[39,42],[78,80],[96,80]],"#8a2cb6",10);line(ctx,[[24,80],[40,80],[77,42],[96,42]],"#d566f1",10);poly(ctx,[[94,33],[110,42],[94,51]],"#d566f1");poly(ctx,[[94,71],[110,80],[94,89]],"#8a2cb6");}
  else if(name==="line"){ctx.save();ctx.translate(cx,cy);ctx.rotate(.65);roundRect(ctx,-10,-39,20,68,7,"#d7e8ff","#6d82a7",2);roundRect(ctx,-13,-50,26,26,7,"#ef443b","#8e2529",2);poly(ctx,[[-13,-50],[0,-68],[13,-50]],"#ef443b");ctx.restore();}
  else if(name==="star"){poly(ctx,Array.from({length:10},(_,i)=>{const a=-Math.PI/2+i*Math.PI/5,r=i%2?14:31;return[cx+Math.cos(a)*r,cy+Math.sin(a)*r] as [number,number];}),"#ffd631","#dc8d0f",2);}
  else if(name==="chest"){roundRect(ctx,27,48,66,43,7,"#f39a1e","#9b5419",2);roundRect(ctx,24,32,72,29,11,"#ffb52b","#a85b18",2);roundRect(ctx,54,48,12,26,3,"#4db9f4","#1d6293",2);}
  else if(name==="trophy"){roundRect(ctx,50,25,20,42,5,"#ffd132","#bd7e0d",2);ellipse(ctx,60,29,24,18,"#ffdc45","#bd7e0d",2);line(ctx,[[42,34],[30,34],[34,52],[47,52]],"#d09016",4);line(ctx,[[78,34],[90,34],[86,52],[73,52]],"#d09016",4);roundRect(ctx,42,70,36,12,4,"#d48b16");}
  else if(name==="lock"){roundRect(ctx,34,53,52,40,8,"#8ea4bb","#4e6278",2);ctx.strokeStyle="#647a90";ctx.lineWidth=7;ctx.beginPath();ctx.arc(cx,53,18,Math.PI,0);ctx.stroke();}
  else text(ctx,name.slice(0,1).toUpperCase(),cx,cy,44,"#ffffff",NAVY,3);
}
function prepareArt(scene: Phaser.Scene, name: string) {
  const key=`block-city-original-${name}-v4`;
  if(scene.textures.exists(key)) return key;
  return canvasTexture(scene,key,120,140,(ctx,w,h)=>{
    ctx.clearRect(0,0,w,h);
    if(name==="logo"){
      text(ctx,"BLOCK",60,42,34,"#f7fdff","#063778",7);
      text(ctx,"BLOCK",60,38,34,"#ffffff","#0b65b8",3);
      text(ctx,"CITY",60,82,37,GOLD,"#833513",7);
      text(ctx,"CITY",60,78,37,"#ffd839","#d57b0d",3);
      voxelTile(ctx,3,106,34,16,"#69da37","#96613b","#6b482f");voxelTile(ctx,82,106,34,16,"#69da37","#96613b","#6b482f");
      drawTree(ctx,18,103,.42);drawTree(ctx,101,103,.42);
      return;
    }
    if(name==="chest"){iconArt(ctx,"chest");return;}
    if(name.startsWith("block-")){drawBlock(ctx,name.replace("block-",""));return;}
    if(["city","coin","settings","hat","puzzle","shop","friends","map","hammer","shuffle","line","star","chest","trophy","lock"].includes(name)){iconArt(ctx,name);return;}
    if(["builder-cap","backpack","blueprint","laptop","pencil","worker-toolbox","cake","wrench","tool-belt","binoculars","camera","collar","bone","chef-hat","sailor-hat","tourist-hat","shop-sign","ship-wheel","chef-hat","sailor-hat","tourist-hat","shop-sign","ship-wheel"].includes(name)){accessory(ctx,name);return;}
    const characterBase=(["builder","planner","worker","chef","mechanic","sailor","tourist"] as string[]).find(k=>name.startsWith(k));
    if(characterBase){
      const body=name.endsWith("-body");
      const expression=name.includes("wink")?"wink":name.includes("surprised")?"surprised":"happy";
      drawCharacter(ctx,characterBase as CharacterKind,body,expression);return;
    }
    if(name.startsWith("corgi")){drawCorgi(ctx,name.endsWith("-body"),name.includes("wink")?"wink":name.includes("excited")?"excited":"happy");return;}
    if(name==="road"){voxelTile(ctx,8,77,104,49,"#5b6d7f","#3d4d5e","#2b3947");line(ctx,[[27,77],[48,67],[70,77],[91,67]],"#f7e978",4);return;}
    if(name==="grass"){voxelTile(ctx,8,77,104,49,"#65d83a","#9a6438","#6b462d");for(let i=0;i<8;i++)ellipse(ctx,22+i*11,66+(i%3)*4,2,2,i%2?"#ffffff":"#ffd34a");return;}
    if(name==="tree"){drawTree(ctx,60,112,1.2);return;}
    if(name==="palm"){drawPalm(ctx,60,116,1.1);return;}
    if(name==="bench"){shadow(ctx,60,101,40,7,.15);roundRect(ctx,27,50,66,12,4,"#b96c35","#744223",1);roundRect(ctx,27,68,66,12,4,"#c27a3d","#744223",1);line(ctx,[[35,80],[35,104],[47,80],[47,104],[78,80],[78,104],[89,80],[89,104]],"#293b50",4);return;}
    if(name==="lamp"){line(ctx,[[60,103],[60,45]],"#263a50",8);roundRect(ctx,45,31,30,27,5,"#263a50");roundRect(ctx,50,36,20,17,3,"#ffd968");poly(ctx,[[42,31],[60,19],[78,31]],"#263a50");return;}
    if(name==="fence"){for(let i=0;i<4;i++){roundRect(ctx,18+i*24,47,10,57,3,"#a76735","#6f4229",1);poly(ctx,[[18+i*24,47],[23+i*24,37],[28+i*24,47]],"#bd7942");}line(ctx,[[18,67],[100,67],[18,88],[100,88]],"#8c552f",7);return;}
    if(name==="bridge"){drawBridge(ctx,1,74,.78);return;}
    if(name==="dock"||name==="boardwalk"){shadow(ctx,60,102,48,7,.15);for(let i=0;i<6;i++)roundRect(ctx,17+i*15,52,14,43,2,i%2?"#bd743a":"#c98545","#754629",1);for(let i=0;i<5;i++)line(ctx,[[20+i*19,93],[20+i*19,112]],"#71452d",5);return;}
    if(name==="lighthouse"){drawLighthouse(ctx,60,112,1);return;}
    if(name==="wheel"){drawFerris(ctx,60,123,.92);return;}
    if(name==="sailboat"){drawBoat(ctx,20,93,.95);return;}
    if(name==="house"){drawHouse(ctx,20,112,1.05);return;}
    if(name==="shopfront"){drawBuilding(ctx,17,114,84,64,13,"#f3c477","shop");return;}
    if(name==="apartment"){drawBuilding(ctx,24,116,72,90,13,"#67b6ec","apartment");return;}
    if(name==="office"){drawBuilding(ctx,25,118,69,106,14,"#4fb4ed","office");return;}
    if(name==="coffee"||name==="cafe"){drawBuilding(ctx,16,115,86,74,13,"#f1b96f","cafe");return;}
    if(name==="market"){drawBuilding(ctx,15,115,90,73,13,"#ecc36f","shop");return;}
    if(name==="tower"){drawBuilding(ctx,27,118,65,112,14,"#59b7ed","office");return;}
    if(name==="park"){
      voxelTile(ctx,8,96,104,46,"#83db47","#9a6539","#6a452d");drawTree(ctx,36,83,.75);drawTree(ctx,87,78,.65);accessory(ctx,"bone");return;
    }
    if(name==="garden"){
      drawBuilding(ctx,28,120,64,79,13,"#77b7e6","apartment");roundRect(ctx,32,35,54,10,4,"#69d643");drawTree(ctx,47,39,.42);return;
    }
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
    "builder-cap","backpack","blueprint","laptop","pencil","worker-toolbox","cake","wrench","tool-belt","binoculars","camera","collar","bone",
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

/** Shared beveled face used by buttons and panels. */
export function glossyFace(scene: Phaser.Scene, width: number, height: number, radius: number, top: number, bottom: number) {
  const key=`block-city-gloss-${width}-${height}-${radius}-${top}-${bottom}-v4`;
  if (!scene.textures.exists(key)) {
    canvasTexture(scene,key,width,height,(ctx,w,h)=>{
      const gradient=ctx.createLinearGradient(0,0,0,h);
      gradient.addColorStop(0,hex(top));gradient.addColorStop(.56,hex(top));gradient.addColorStop(1,hex(bottom));
      ctx.beginPath();ctx.roundRect(1,1,w-2,h-2,radius);ctx.fillStyle=gradient;ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,.86)";ctx.lineWidth=2;ctx.beginPath();ctx.roundRect(3,3,w-6,h-7,Math.max(2,radius-3));ctx.stroke();
      const shine=ctx.createLinearGradient(0,0,0,h*.35);shine.addColorStop(0,"rgba(255,255,255,.40)");shine.addColorStop(1,"rgba(255,255,255,0)");
      ctx.fillStyle=shine;ctx.beginPath();ctx.roundRect(7,5,w-14,Math.max(8,h*.30),Math.max(3,radius*.5));ctx.fill();
    });
  }
  return scene.add.image(0,0,key).setDisplaySize(width,height);
}
