import { CanvasCtx, isoPrism, roundRect, softShadow, toyWindow, drawTree, polygon } from "./voxelArt";

function baseIsland(ctx: CanvasCtx, cx: number, y: number, width: number, depth: number, grass = "#78d84e") {
  polygon(ctx, [[cx, y - depth / 2], [cx + width / 2, y], [cx, y + depth / 2], [cx - width / 2, y]], grass, "#2b8b47", 1.5);
  polygon(ctx, [[cx - width / 2, y], [cx, y + depth / 2], [cx, y + depth / 2 + 12], [cx - width / 2, y + 12]], "#bf7b42", "#7f4e2f", 1);
  polygon(ctx, [[cx, y + depth / 2], [cx + width / 2, y], [cx + width / 2, y + 12], [cx, y + depth / 2 + 12]], "#8f5a36", "#6e4329", 1);
}

function buildingPalette(name: string) {
  if (name === "coffee" || name === "cafe" || name === "shopfront") return { top: 0xffd25f, front: 0xff9f58, side: 0xd66f43, roof: "#ff6050" };
  if (name === "office" || name === "tower") return { top: 0x87ddff, front: 0x2d9fe8, side: 0x1763ad, roof: "#e9fbff" };
  if (name === "apartment") return { top: 0xb4eeff, front: 0x4da9e8, side: 0x2a6bb0, roof: "#f7d764" };
  return { top: 0xffecbd, front: 0xffc777, side: 0xd98c55, roof: "#f65c4f" };
}

function drawBuildingCore(ctx: CanvasCtx, name: string, width: number, height: number) {
  const cx = width / 2;
  const p = buildingPalette(name);
  const tall = name === "office" || name === "tower";
  const bodyW = width * (tall ? 0.48 : 0.58);
  const bodyH = height * (tall ? 0.58 : 0.44);
  const depth = width * 0.22;
  const baseY = height * 0.79;
  softShadow(ctx, cx, height * 0.84, width * 0.31, height * 0.045, 0.13);
  baseIsland(ctx, cx, baseY + 3, width * 0.8, height * 0.13, name === "tower" ? "#72c994" : "#8add55");
  isoPrism(ctx, cx, baseY - 2, bodyW, depth, bodyH, p.top, p.front, p.side);
  const left = cx - bodyW / 2 + bodyW * 0.14;
  const topY = baseY - bodyH + depth * 0.15;
  const rows = tall ? 5 : 2;
  const cols = tall ? 3 : 2;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      toyWindow(ctx, left + c * (bodyW * 0.22), topY + 15 + r * (bodyH / (rows + 0.7)), bodyW * 0.13, Math.max(7, bodyH * 0.08));
    }
  }
  roundRect(ctx, cx + bodyW * 0.08, baseY - height * 0.12, bodyW * 0.16, height * 0.12, 3, "#31536e", "#17344b", 1);
  if (name === "house") {
    polygon(ctx, [[cx - bodyW * 0.52, topY + 4], [cx, topY - height * 0.08], [cx + bodyW * 0.52, topY + 4], [cx, topY + height * 0.08]], p.roof, "#b83d36", 1.5);
  }
  if (name === "coffee" || name === "cafe" || name === "shopfront") {
    roundRect(ctx, cx - bodyW * 0.4, baseY - height * 0.19, bodyW * 0.8, height * 0.08, 3, "#ffffff", "#ce4d45", 1);
    for (let i = 0; i < 6; i += 1) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#f65d54";
      ctx.fillRect(cx - bodyW * 0.39 + i * bodyW * 0.13, baseY - height * 0.18, bodyW * 0.13, height * 0.065);
    }
    roundRect(ctx, cx - bodyW * 0.21, topY + 6, bodyW * 0.42, 15, 4, "#168bcd");
    ctx.fillStyle = "#ffffff";
    ctx.font = `bold ${Math.max(8, Math.floor(width * 0.07))}px Arial`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(name === "coffee" ? "CAFE" : "SHOP", cx, topY + 13);
  }
  if (name === "tower") {
    roundRect(ctx, cx - bodyW * 0.13, topY - height * 0.11, bodyW * 0.26, height * 0.12, 3, "#ffcf3f", "#ba7717", 1);
    ctx.fillStyle = "#ff4c44";
    ctx.fillRect(cx - 2, topY - height * 0.23, 4, height * 0.13);
    polygon(ctx, [[cx + 2, topY - height * 0.23], [cx + width * 0.12, topY - height * 0.19], [cx + 2, topY - height * 0.15]], "#ff554d");
  }
}

function drawPark(ctx: CanvasCtx, width: number, height: number, rooftop = false) {
  const cx = width / 2;
  const y = height * 0.69;
  softShadow(ctx, cx, height * 0.82, width * 0.32, height * 0.05, 0.12);
  if (rooftop) {
    isoPrism(ctx, cx, height * 0.82, width * 0.62, width * 0.2, height * 0.36, 0xc4edff, 0x4799dc, 0x2866aa);
    baseIsland(ctx, cx, height * 0.5, width * 0.55, height * 0.14, "#7fd551");
  } else {
    baseIsland(ctx, cx, y, width * 0.78, height * 0.2, "#89dd55");
  }
  drawTree(ctx, cx - width * 0.2, y - height * 0.07, width / 180);
  drawTree(ctx, cx + width * 0.2, y - height * 0.05, width / 200);
  roundRect(ctx, cx - width * 0.11, y - height * 0.02, width * 0.22, height * 0.06, 3, "#a96e3f", "#70452a", 1);
  ctx.strokeStyle = "#f5d798"; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(cx - width * 0.28, y + height * 0.04); ctx.lineTo(cx, y - height * 0.07); ctx.lineTo(cx + width * 0.28, y + height * 0.03); ctx.stroke();
}

function drawMarket(ctx: CanvasCtx, width: number, height: number) {
  const cx = width / 2;
  baseIsland(ctx, cx, height * 0.72, width * 0.82, height * 0.19, "#86da53");
  for (const offset of [-0.2, 0.18]) {
    const x = cx + width * offset;
    roundRect(ctx, x - width * 0.14, height * 0.46, width * 0.28, height * 0.2, 5, "#c88345", "#7e4b2e", 1);
    polygon(ctx, [[x - width * 0.18, height * 0.46], [x - width * 0.1, height * 0.35], [x + width * 0.15, height * 0.35], [x + width * 0.2, height * 0.46]], "#f45b52", "#a13a36", 1);
    for (let i = 0; i < 4; i += 1) {
      ctx.fillStyle = i % 2 ? "#ffffff" : "#ffd65a";
      ctx.fillRect(x - width * 0.14 + i * width * 0.07, height * 0.49, width * 0.05, height * 0.035);
    }
  }
  drawTree(ctx, cx - width * 0.33, height * 0.56, width / 210);
}

function drawBridge(ctx: CanvasCtx, width: number, height: number) {
  const y = height * 0.68;
  softShadow(ctx, width / 2, y + height * 0.08, width * 0.33, height * 0.04, 0.12);
  polygon(ctx, [[width * 0.12, y], [width * 0.5, y - height * 0.15], [width * 0.88, y], [width * 0.5, y + height * 0.14]], "#d9b683", "#8a694a", 1.5);
  ctx.strokeStyle = "#f6dfb5";
  ctx.lineWidth = Math.max(3, width * 0.04);
  ctx.beginPath(); ctx.moveTo(width * 0.18, y - height * 0.02); ctx.quadraticCurveTo(width * 0.5, y - height * 0.34, width * 0.82, y - height * 0.02); ctx.stroke();
  ctx.strokeStyle = "#946c46"; ctx.lineWidth = 2;
  for (let i = 0; i < 6; i += 1) {
    const x = width * (0.22 + i * 0.11);
    ctx.beginPath(); ctx.moveTo(x, y - height * 0.07); ctx.lineTo(x, y + height * 0.04); ctx.stroke();
  }
}

function drawWheel(ctx: CanvasCtx, width: number, height: number) {
  const cx = width / 2, cy = height * 0.48, r = Math.min(width, height) * 0.31;
  softShadow(ctx, cx, height * 0.8, width * 0.28, height * 0.04, 0.1);
  ctx.strokeStyle = "#f6f8ff"; ctx.lineWidth = Math.max(4, width * 0.035);
  ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = "#ef5c5f"; ctx.lineWidth = Math.max(2, width * 0.018);
  for (let i = 0; i < 10; i += 1) {
    const a = (Math.PI * 2 * i) / 10;
    ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a) * r, cy + Math.sin(a) * r); ctx.stroke();
    roundRect(ctx, cx + Math.cos(a) * r - width * 0.05, cy + Math.sin(a) * r - height * 0.035, width * 0.1, height * 0.07, 3, i % 2 ? "#ffd84b" : "#4dc9ef", "#ffffff", 1);
  }
  ctx.fillStyle = "#ffd741"; ctx.beginPath(); ctx.arc(cx, cy, r * 0.18, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = "#37597b"; ctx.lineWidth = Math.max(4, width * 0.03);
  ctx.beginPath(); ctx.moveTo(cx, cy + r * 0.15); ctx.lineTo(cx - r * 0.6, height * 0.84); ctx.moveTo(cx, cy + r * 0.15); ctx.lineTo(cx + r * 0.6, height * 0.84); ctx.stroke();
}

function drawLighthouse(ctx: CanvasCtx, width: number, height: number) {
  const cx = width / 2;
  softShadow(ctx, cx, height * 0.84, width * 0.22, height * 0.04, 0.11);
  baseIsland(ctx, cx, height * 0.8, width * 0.62, height * 0.17, "#7cd24e");
  polygon(ctx, [[cx - width * 0.12, height * 0.72], [cx - width * 0.08, height * 0.28], [cx + width * 0.08, height * 0.28], [cx + width * 0.12, height * 0.72]], "#f9f8ef", "#7e94a8", 1.2);
  ctx.fillStyle = "#ef4d48"; ctx.fillRect(cx - width * 0.095, height * 0.42, width * 0.19, height * 0.1);
  ctx.fillRect(cx - width * 0.11, height * 0.57, width * 0.22, height * 0.09);
  roundRect(ctx, cx - width * 0.14, height * 0.22, width * 0.28, height * 0.12, 4, "#2a80bd", "#173d64", 1.2);
  polygon(ctx, [[cx - width * 0.18, height * 0.23], [cx, height * 0.12], [cx + width * 0.18, height * 0.23]], "#ef4d48", "#a62e30", 1.2);
}

function drawSailboat(ctx: CanvasCtx, width: number, height: number) {
  const cx = width / 2;
  softShadow(ctx, cx, height * 0.77, width * 0.26, height * 0.035, 0.09);
  polygon(ctx, [[width * 0.17, height * 0.61], [width * 0.83, height * 0.61], [width * 0.68, height * 0.78], [width * 0.31, height * 0.78]], "#f7fbff", "#315c7e", 1.4);
  ctx.fillStyle = "#ef4c46"; ctx.fillRect(cx - 2, height * 0.18, 4, height * 0.45);
  polygon(ctx, [[cx, height * 0.2], [cx, height * 0.56], [width * 0.25, height * 0.55]], "#ffffff", "#aabfcd", 1);
  polygon(ctx, [[cx + 3, height * 0.26], [width * 0.77, height * 0.51], [cx + 3, height * 0.56]], "#58c4ef", "#2b7eb0", 1);
}

export const BUILDING_NAMES = new Set([
  "house", "coffee", "shopfront", "apartment", "office", "cafe", "park", "garden", "market", "tower",
]);

export const ENVIRONMENT_NAMES = new Set([
  "road", "grass", "tree", "palm", "bench", "lamp", "fence", "bridge", "dock", "lighthouse", "wheel", "sailboat",
]);

export function drawBuildingTexture(ctx: CanvasCtx, name: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  if (name === "park") drawPark(ctx, width, height, false);
  else if (name === "garden") drawPark(ctx, width, height, true);
  else if (name === "market") drawMarket(ctx, width, height);
  else drawBuildingCore(ctx, name, width, height);
}

export function drawEnvironmentTexture(ctx: CanvasCtx, name: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  if (name === "tree" || name === "palm") {
    drawTree(ctx, width / 2, height * 0.82, Math.min(width, height) / 72, name === "palm");
  } else if (name === "bridge") {
    drawBridge(ctx, width, height);
  } else if (name === "lighthouse") {
    drawLighthouse(ctx, width, height);
  } else if (name === "wheel") {
    drawWheel(ctx, width, height);
  } else if (name === "sailboat") {
    drawSailboat(ctx, width, height);
  } else if (name === "bench") {
    roundRect(ctx, width * 0.15, height * 0.42, width * 0.7, height * 0.22, 4, "#ad6c3d", "#714226", 1.2);
    ctx.fillStyle = "#7e4b2c"; ctx.fillRect(width * 0.22, height * 0.62, width * 0.08, height * 0.2); ctx.fillRect(width * 0.7, height * 0.62, width * 0.08, height * 0.2);
  } else if (name === "lamp") {
    ctx.strokeStyle = "#263c56"; ctx.lineWidth = Math.max(3, width * 0.08); ctx.beginPath(); ctx.moveTo(width / 2, height * 0.8); ctx.lineTo(width / 2, height * 0.25); ctx.stroke();
    roundRect(ctx, width * 0.25, height * 0.14, width * 0.5, height * 0.25, 4, "#ffe67f", "#263c56", 2);
  } else if (name === "dock") {
    polygon(ctx, [[width * 0.1, height * 0.46], [width * 0.75, height * 0.28], [width * 0.92, height * 0.48], [width * 0.28, height * 0.69]], "#bd7b42", "#75492d", 1.4);
    for (let i = 0; i < 5; i += 1) ctx.fillRect(width * (0.26 + i * 0.11), height * 0.64, 3, height * 0.15);
  } else if (name === "road" || name === "grass") {
    polygon(ctx, [[width * 0.08, height * 0.48], [width * 0.5, height * 0.19], [width * 0.92, height * 0.48], [width * 0.5, height * 0.78]], name === "road" ? "#64758b" : "#80d64d", name === "road" ? "#425166" : "#3c9c45", 1.3);
    if (name === "road") {
      ctx.strokeStyle = "#f5e38a"; ctx.lineWidth = 2; ctx.setLineDash([8, 7]); ctx.beginPath(); ctx.moveTo(width * 0.2, height * 0.5); ctx.lineTo(width * 0.5, height * 0.3); ctx.lineTo(width * 0.8, height * 0.5); ctx.stroke(); ctx.setLineDash([]);
    }
  } else if (name === "fence") {
    ctx.strokeStyle = "#a86b3c"; ctx.lineWidth = Math.max(3, width * 0.04);
    ctx.beginPath(); ctx.moveTo(width * 0.1, height * 0.42); ctx.lineTo(width * 0.9, height * 0.42); ctx.moveTo(width * 0.1, height * 0.62); ctx.lineTo(width * 0.9, height * 0.62); ctx.stroke();
    for (let i = 0; i < 5; i += 1) { const x = width * (0.15 + i * 0.18); ctx.beginPath(); ctx.moveTo(x, height * 0.22); ctx.lineTo(x, height * 0.8); ctx.stroke(); }
  }
}
