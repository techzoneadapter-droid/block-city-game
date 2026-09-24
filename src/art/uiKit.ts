import { CanvasCtx, hex, isoPrism, roundRect, softShadow, polygon, drawSparkles } from "./voxelArt";

export const UI_ART_NAMES = new Set([
  "logo", "chest", "hammer", "shuffle", "line", "hat", "puzzle", "shop", "friends", "map", "coin", "settings",
  "panel-dialog", "panel-card", "menu-coast", "level-coast",
  "block-red", "block-blue", "block-green", "block-yellow", "block-purple", "block-ice",
  "block-stone", "block-wood", "block-grass", "block-sand", "block-metal", "block-rainbow",
]);

function gradientPanel(ctx: CanvasCtx, width: number, height: number, warm = false) {
  const g = ctx.createLinearGradient(0, 0, 0, height);
  g.addColorStop(0, warm ? "#fff8df" : "#f8fdff");
  g.addColorStop(1, warm ? "#ffe8b7" : "#dff4ff");
  roundRect(ctx, 4, 4, width - 8, height - 8, Math.min(18, height * 0.2), g as unknown as string, undefined);
  // CanvasGradient cannot be typed as a string by the helper, so repaint directly.
  ctx.beginPath();
  ctx.roundRect(4, 4, width - 8, height - 8, Math.min(18, height * 0.2));
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = warm ? "#e3b45a" : "#72cce9";
  ctx.lineWidth = 3;
  ctx.stroke();
  ctx.strokeStyle = "#ffffffaa";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(8, 8, width - 16, height - 18, Math.min(14, height * 0.16));
  ctx.stroke();
}

function drawLogo(ctx: CanvasCtx, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const drawWord = (value: string, y: number, fill: string, outline: string, size: number) => {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `900 ${size}px Arial Rounded MT Bold, Arial Black, Arial, sans-serif`;
    ctx.lineJoin = "round";
    ctx.shadowColor = "#063b73";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 7;
    ctx.strokeStyle = "#063b73";
    ctx.lineWidth = Math.max(7, size * 0.11);
    ctx.strokeText(value, width / 2, y);
    ctx.strokeStyle = outline;
    ctx.lineWidth = Math.max(3, size * 0.05);
    ctx.strokeText(value, width / 2, y - 2);
    ctx.fillStyle = fill;
    ctx.fillText(value, width / 2, y - 2);
    const hi = ctx.createLinearGradient(0, y - size * 0.55, 0, y + size * 0.2);
    hi.addColorStop(0, "#ffffff");
    hi.addColorStop(0.42, fill);
    hi.addColorStop(1, fill);
    ctx.globalAlpha = 0.32;
    ctx.fillStyle = hi;
    ctx.fillText(value, width / 2, y - 4);
    ctx.restore();
  };
  drawWord("BLOCK", height * 0.31, "#eafaff", "#5bcfff", Math.floor(height * 0.38));
  drawWord("CITY", height * 0.72, "#ffc925", "#ff8e18", Math.floor(height * 0.39));
  // Tiny voxel islands anchor the logo without copying the reference.
  isoPrism(ctx, width * 0.11, height * 0.82, width * 0.12, height * 0.08, height * 0.12, 0x7ee353, 0x9f6f42, 0x744d31);
  isoPrism(ctx, width * 0.89, height * 0.82, width * 0.12, height * 0.08, height * 0.12, 0x7ee353, 0x9f6f42, 0x744d31);
}

function blockBase(name: string) {
  const map: Record<string, { color: number; material: string }> = {
    "block-red": { color: 0xff5453, material: "brick" },
    "block-blue": { color: 0x2ca9f5, material: "water" },
    "block-green": { color: 0x55d63e, material: "grass" },
    "block-yellow": { color: 0xffca32, material: "sand" },
    "block-purple": { color: 0xb858ec, material: "crystal" },
    "block-ice": { color: 0x79ddf7, material: "ice" },
    "block-stone": { color: 0x8f969f, material: "stone" },
    "block-wood": { color: 0xb8753f, material: "wood" },
    "block-grass": { color: 0x59c64a, material: "grass" },
    "block-sand": { color: 0xe8c27b, material: "sand" },
    "block-metal": { color: 0x8495a7, material: "metal" },
    "block-rainbow": { color: 0x55bdf1, material: "rainbow" },
  };
  return map[name] ?? { color: 0x47a9ee, material: "plain" };
}

function drawBlock(ctx: CanvasCtx, name: string, width: number, height: number) {
  const { color, material } = blockBase(name);
  const cx = width / 2;
  const baseY = height * 0.74;
  softShadow(ctx, cx, height * 0.83, width * 0.3, height * 0.045, 0.14);
  isoPrism(ctx, cx, baseY, width * 0.62, width * 0.25, height * 0.47, color + 0x111111 > 0xffffff ? color : color + 0x111111, color, Math.max(0, color - 0x1b1b1b));
  ctx.save();
  ctx.globalAlpha = 0.9;
  if (material === "wood") {
    ctx.strokeStyle = "#6f4126"; ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) { ctx.beginPath(); ctx.moveTo(width * 0.33, height * (0.43 + i * 0.1)); ctx.lineTo(width * 0.68, height * (0.48 + i * 0.08)); ctx.stroke(); }
  } else if (material === "stone") {
    ctx.fillStyle = "#5f6873"; [[0.36,0.48],[0.55,0.56],[0.48,0.39]].forEach(([x,y]) => ctx.fillRect(width*x, height*y, 6, 4));
  } else if (material === "grass") {
    ctx.fillStyle = "#2c9f39"; for (let i = 0; i < 5; i += 1) ctx.fillRect(width * (0.31 + i * 0.08), height * (0.36 + (i%2)*0.03), 5, 5);
  } else if (material === "sand") {
    ctx.fillStyle = "#c89955"; for (let i = 0; i < 8; i += 1) ctx.fillRect(width * (0.3 + (i%4)*0.1), height * (0.42 + Math.floor(i/4)*0.12), 3, 3);
  } else if (material === "metal") {
    ctx.fillStyle = "#d6e0ea"; [[0.3,0.4],[0.68,0.4],[0.3,0.66],[0.68,0.66]].forEach(([x,y]) => { ctx.beginPath(); ctx.arc(width*x,height*y,3,0,Math.PI*2); ctx.fill(); });
  } else if (material === "ice") {
    ctx.strokeStyle = "#efffff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(width*0.36,height*0.42); ctx.lineTo(width*0.48,height*0.55); ctx.lineTo(width*0.43,height*0.67); ctx.moveTo(width*0.48,height*0.55); ctx.lineTo(width*0.65,height*0.43); ctx.stroke();
  } else if (material === "brick") {
    ctx.strokeStyle = "#a92d35"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(width*0.3,height*0.52); ctx.lineTo(width*0.7,height*0.58); ctx.moveTo(width*0.48,height*0.45); ctx.lineTo(width*0.48,height*0.68); ctx.stroke();
  } else if (material === "crystal") {
    polygon(ctx, [[width*0.5,height*0.36],[width*0.62,height*0.52],[width*0.52,height*0.68],[width*0.39,height*0.54]], "#e9b2ff88", "#ffffffaa", 1);
  } else if (material === "rainbow") {
    const colors = ["#ff5a58","#ffca35","#65da48","#39b8f4","#b95be9"];
    colors.forEach((c,i) => { ctx.fillStyle = c; ctx.fillRect(width*(0.31+i*0.08),height*0.42,width*0.085,height*0.25); });
  } else if (material === "water") {
    ctx.strokeStyle = "#d6f9ff"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(width*0.32,height*0.5); ctx.quadraticCurveTo(width*0.42,height*0.45,width*0.52,height*0.5); ctx.quadraticCurveTo(width*0.62,height*0.55,width*0.7,height*0.49); ctx.stroke();
  }
  ctx.restore();
}

function drawChest(ctx: CanvasCtx, width: number, height: number) {
  softShadow(ctx, width / 2, height * 0.78, width * 0.3, height * 0.05, 0.13);
  roundRect(ctx, width * 0.16, height * 0.38, width * 0.68, height * 0.4, height * 0.06, "#f59a19", "#a75c0f", 2);
  roundRect(ctx, width * 0.12, height * 0.2, width * 0.76, height * 0.32, height * 0.08, "#ffd738", "#b77810", 2);
  ctx.fillStyle = "#fff078"; ctx.fillRect(width * 0.27, height * 0.21, width * 0.09, height * 0.56); ctx.fillRect(width * 0.64, height * 0.21, width * 0.09, height * 0.56);
  roundRect(ctx, width * 0.42, height * 0.46, width * 0.16, height * 0.2, height * 0.04, "#1e9fd8", "#0d628d", 1.5);
  drawSparkles(ctx, width / 2, height * 0.3, width * 0.34, 6);
}

function drawTool(ctx: CanvasCtx, name: string, width: number, height: number) {
  const cx = width / 2, cy = height / 2;
  if (name === "hammer" || name === "hat") {
    if (name === "hat") {
      roundRect(ctx, width * 0.19, height * 0.29, width * 0.62, height * 0.36, height * 0.11, "#ffd22d", "#b27709", 2);
      roundRect(ctx, width * 0.1, height * 0.58, width * 0.8, height * 0.1, height * 0.03, "#ffc31f", "#a96b07", 1.5);
      ctx.fillStyle = "#fff16c"; ctx.fillRect(cx - width*0.035,height*0.31,width*0.07,height*0.26);
    } else {
      ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.55);
      roundRect(ctx, -width*0.05,-height*0.05,width*0.1,height*0.48,width*0.03,"#ffc84a","#9f651e",1.5);
      roundRect(ctx, -width*0.3,-height*0.22,width*0.6,height*0.2,width*0.06,"#f45b50","#9d302d",1.5);
      ctx.restore();
    }
  } else if (name === "shuffle") {
    ctx.strokeStyle = "#d969ef"; ctx.lineWidth = Math.max(5,width*0.09); ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(width*0.18,height*0.3); ctx.bezierCurveTo(width*0.45,height*0.25,width*0.48,height*0.7,width*0.78,height*0.65); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(width*0.18,height*0.68); ctx.bezierCurveTo(width*0.44,height*0.72,width*0.53,height*0.27,width*0.76,height*0.3); ctx.stroke();
    polygon(ctx, [[width*0.73,height*0.18],[width*0.92,height*0.3],[width*0.73,height*0.41]], "#f3a5ff");
    polygon(ctx, [[width*0.73,height*0.54],[width*0.92,height*0.66],[width*0.73,height*0.78]], "#f3a5ff");
  } else if (name === "line") {
    for (let i = 0; i < 3; i += 1) roundRect(ctx,width*(0.12+i*0.27),height*0.32,width*0.22,height*0.36,height*0.07,i===1?"#ffd53a":"#ff7a3f","#b84827",1.2);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(width*0.08,cy); ctx.lineTo(width*0.92,cy); ctx.stroke();
  }
}

function drawNavIcon(ctx: CanvasCtx, name: string, width: number, height: number) {
  const cx = width / 2;
  if (name === "puzzle") {
    roundRect(ctx, width*0.2,height*0.18,width*0.55,height*0.62,height*0.1,"#bd58ed","#6c2b9a",2);
    ctx.beginPath(); ctx.fillStyle="#df8bff"; ctx.arc(width*0.48,height*0.18,width*0.11,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.fillStyle="#ffffff55"; ctx.arc(width*0.76,height*0.47,width*0.11,0,Math.PI*2); ctx.fill();
  } else if (name === "shop") {
    roundRect(ctx,width*0.2,height*0.37,width*0.6,height*0.38,height*0.05,"#ffdba0","#9a6a35",1.5);
    roundRect(ctx,width*0.43,height*0.5,width*0.14,height*0.25,height*0.03,"#37a9e8","#1c6d9a",1);
    for(let i=0;i<5;i++){ctx.fillStyle=i%2?"#ffffff":"#f25550";ctx.fillRect(width*(0.13+i*0.15),height*0.22,width*0.15,height*0.18);}
  } else if (name === "friends") {
    ctx.fillStyle="#d9f7ff"; ctx.beginPath();ctx.arc(width*0.37,height*0.34,width*0.15,0,Math.PI*2);ctx.fill(); ctx.beginPath();ctx.arc(width*0.66,height*0.34,width*0.15,0,Math.PI*2);ctx.fill();
    roundRect(ctx,width*0.15,height*0.5,width*0.7,height*0.28,height*0.12,"#bceeff","#5a9fc4",1.5);
  } else if (name === "map") {
    polygon(ctx,[[width*0.12,height*0.26],[width*0.37,height*0.16],[width*0.62,height*0.28],[width*0.88,height*0.17],[width*0.88,height*0.75],[width*0.62,height*0.84],[width*0.37,height*0.72],[width*0.12,height*0.82]],"#9ee66e","#438f48",1.5);
    ctx.strokeStyle="#ffffff";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(width*0.37,height*0.16);ctx.lineTo(width*0.37,height*0.72);ctx.moveTo(width*0.62,height*0.28);ctx.lineTo(width*0.62,height*0.84);ctx.stroke();
    ctx.fillStyle="#f1514c";ctx.beginPath();ctx.arc(width*0.57,height*0.42,width*0.08,0,Math.PI*2);ctx.fill();polygon(ctx,[[width*0.52,height*0.45],[width*0.62,height*0.45],[width*0.57,height*0.62]],"#f1514c");
  } else if (name === "coin") {
    ctx.beginPath();ctx.fillStyle="#f2a208";ctx.ellipse(cx,height*0.54,width*0.33,height*0.36,0,0,Math.PI*2);ctx.fill();
    ctx.beginPath();ctx.fillStyle="#ffd430";ctx.ellipse(cx,height*0.48,width*0.33,height*0.36,0,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle="#fff39b";ctx.lineWidth=3;ctx.stroke();
    ctx.strokeStyle="#e59a08";ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,height*0.48,width*0.13,0,Math.PI*2);ctx.stroke();
  } else if (name === "settings") {
    ctx.fillStyle="#e8fbff"; for(let i=0;i<8;i++){const a=i*Math.PI/4;ctx.beginPath();ctx.arc(cx+Math.cos(a)*width*0.25,height*0.5+Math.sin(a)*height*0.25,width*0.09,0,Math.PI*2);ctx.fill();}
    ctx.beginPath();ctx.arc(cx,height*0.5,width*0.28,0,Math.PI*2);ctx.fill();ctx.beginPath();ctx.fillStyle="#197bc6";ctx.arc(cx,height*0.5,width*0.12,0,Math.PI*2);ctx.fill();
  }
}

function drawCoast(ctx: CanvasCtx, width: number, height: number) {
  const sky = ctx.createLinearGradient(0,0,0,height);sky.addColorStop(0,"#5bc9ff");sky.addColorStop(1,"#e7fbff");ctx.fillStyle=sky;ctx.fillRect(0,0,width,height);
  ctx.fillStyle="#4ac8ef";ctx.fillRect(0,height*0.58,width,height*0.42);
  polygon(ctx,[[0,height*0.63],[width*0.23,height*0.43],[width*0.42,height*0.6],[width*0.72,height*0.39],[width,height*0.58],[width,height],[0,height]],"#70c95f");
  for(let i=0;i<5;i++){const x=width*(0.14+i*0.18);isoPrism(ctx,x,height*(0.7-(i%2)*0.08),width*0.1,width*0.04,height*(0.16+(i%3)*0.03),0xd6f7ff,0x36a4e5,0x1769a8);}
  ctx.strokeStyle="#ffffff88";ctx.lineWidth=2;for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(width*0.1,height*(0.72+i*0.08));ctx.quadraticCurveTo(width*0.5,height*(0.67+i*0.08),width*0.9,height*(0.72+i*0.08));ctx.stroke();}
}

export function drawUiTexture(ctx: CanvasCtx, name: string, width: number, height: number) {
  ctx.clearRect(0,0,width,height);
  if (name === "logo") return drawLogo(ctx,width,height);
  if (name.startsWith("block-")) return drawBlock(ctx,name,width,height);
  if (name === "chest") return drawChest(ctx,width,height);
  if (["hammer","shuffle","line","hat"].includes(name)) return drawTool(ctx,name,width,height);
  if (["puzzle","shop","friends","map","coin","settings"].includes(name)) return drawNavIcon(ctx,name,width,height);
  if (name === "panel-dialog" || name === "panel-card") return gradientPanel(ctx,width,height,name==="panel-card");
  if (name === "menu-coast" || name === "level-coast") return drawCoast(ctx,width,height);
  gradientPanel(ctx,width,height,false);
}
