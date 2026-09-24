export type CanvasCtx = CanvasRenderingContext2D;

export function hex(color: number) {
  return `#${color.toString(16).padStart(6, "0")}`;
}

export function shade(color: number, amount: number) {
  const r = Math.max(0, Math.min(255, ((color >> 16) & 255) + amount));
  const g = Math.max(0, Math.min(255, ((color >> 8) & 255) + amount));
  const b = Math.max(0, Math.min(255, (color & 255) + amount));
  return (r << 16) | (g << 8) | b;
}

export function roundRect(
  ctx: CanvasCtx,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
  fill: string,
  stroke?: string,
  lineWidth = 2,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function polygon(ctx: CanvasCtx, points: Array<[number, number]>, fill: string, stroke?: string, lineWidth = 2) {
  if (!points.length) return;
  ctx.beginPath();
  points.forEach(([x, y], index) => index ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
  }
}

export function softShadow(ctx: CanvasCtx, x: number, y: number, rx: number, ry: number, alpha = 0.18) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.fillStyle = "#063767";
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

export function isoPrism(
  ctx: CanvasCtx,
  cx: number,
  baseY: number,
  width: number,
  depth: number,
  height: number,
  top: number,
  front: number,
  side: number,
  outline = "#0b4d77",
) {
  const topY = baseY - height;
  const halfW = width / 2;
  const halfD = depth / 2;
  const topFace: Array<[number, number]> = [
    [cx, topY - halfD],
    [cx + halfW, topY],
    [cx, topY + halfD],
    [cx - halfW, topY],
  ];
  const rightFace: Array<[number, number]> = [
    [cx, topY + halfD],
    [cx + halfW, topY],
    [cx + halfW, baseY],
    [cx, baseY + halfD],
  ];
  const leftFace: Array<[number, number]> = [
    [cx - halfW, topY],
    [cx, topY + halfD],
    [cx, baseY + halfD],
    [cx - halfW, baseY],
  ];
  polygon(ctx, rightFace, hex(front), outline, 1.5);
  polygon(ctx, leftFace, hex(side), outline, 1.5);
  polygon(ctx, topFace, hex(top), "#ffffffaa", 1.5);
  ctx.save();
  ctx.globalAlpha = 0.42;
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - halfW + 4, topY + 1);
  ctx.lineTo(cx, topY - halfD + 3);
  ctx.lineTo(cx + halfW - 4, topY + 1);
  ctx.stroke();
  ctx.restore();
}

export function toyWindow(ctx: CanvasCtx, x: number, y: number, width: number, height: number) {
  roundRect(ctx, x, y, width, height, 3, "#c9f4ff", "#ffffffcc", 1.2);
  ctx.save();
  ctx.globalAlpha = 0.65;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(x + 2, y + 2, Math.max(2, width * 0.2), height - 4);
  ctx.restore();
}

export function drawTree(ctx: CanvasCtx, x: number, y: number, scale = 1, palm = false) {
  softShadow(ctx, x, y + 5 * scale, 17 * scale, 6 * scale, 0.12);
  if (palm) {
    roundRect(ctx, x - 4 * scale, y - 34 * scale, 8 * scale, 38 * scale, 3 * scale, "#a96a35");
    const leaves = [
      [-19, -35, -2], [18, -35, 2], [-14, -47, -8], [14, -47, 8], [0, -51, 0],
    ] as Array<[number, number, number]>;
    leaves.forEach(([dx, dy, tilt], i) => {
      ctx.save();
      ctx.translate(x + dx * scale, y + dy * scale);
      ctx.rotate((tilt * Math.PI) / 180);
      roundRect(ctx, -11 * scale, -5 * scale, 22 * scale, 11 * scale, 5 * scale, i % 2 ? "#43bf3f" : "#60d94b");
      ctx.restore();
    });
    return;
  }
  roundRect(ctx, x - 5 * scale, y - 27 * scale, 10 * scale, 31 * scale, 3 * scale, "#9b6439");
  const crown = [
    [-12, -35, "#43c94c"], [10, -37, "#34b941"], [-2, -51, "#63da4e"],
    [-16, -49, "#51c844"], [15, -51, "#54ce45"], [0, -34, "#77e058"],
  ] as Array<[number, number, string]>;
  crown.forEach(([dx, dy, color]) => {
    roundRect(ctx, x + (dx as number) * scale - 10 * scale, y + (dy as number) * scale - 9 * scale, 20 * scale, 18 * scale, 4 * scale, color as string, "#147b3daa", 1);
  });
}

export function drawSparkles(ctx: CanvasCtx, cx: number, cy: number, radius: number, count = 8) {
  for (let i = 0; i < count; i += 1) {
    const angle = (Math.PI * 2 * i) / count;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius * 0.7;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = i % 2 ? "#ffffff" : "#ffe75a";
    ctx.fillRect(-1.5, -6, 3, 12);
    ctx.fillRect(-6, -1.5, 12, 3);
    ctx.restore();
  }
}
