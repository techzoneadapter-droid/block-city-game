import { CanvasCtx, roundRect, softShadow, polygon } from "./voxelArt";

const ROLE_COLORS: Record<string, { cap: string; shirt: string; accent: string; hair: string }> = {
  builder: { cap: "#f44b39", shirt: "#168df0", accent: "#ffffff", hair: "#593423" },
  planner: { cap: "#a94bea", shirt: "#a853e9", accent: "#e9d6ff", hair: "#4b3026" },
  worker: { cap: "#ffc928", shirt: "#f28b21", accent: "#ffffff", hair: "#5a3926" },
  chef: { cap: "#f9fbff", shirt: "#ffffff", accent: "#ed4c4c", hair: "#563425" },
  mechanic: { cap: "#167be8", shirt: "#2679df", accent: "#86d8ff", hair: "#4e3527" },
  sailor: { cap: "#f7fbff", shirt: "#1b80d8", accent: "#ffffff", hair: "#4a3225" },
  tourist: { cap: "#f7bb2a", shirt: "#54c981", accent: "#ffe868", hair: "#553525" },
};

function roleFrom(name: string) {
  return name.split("-")[0];
}

function expressionFrom(name: string) {
  if (name.includes("wink")) return "wink";
  if (name.includes("excited")) return "excited";
  if (name.includes("surprised")) return "surprised";
  if (name.includes("thinking")) return "thinking";
  return "happy";
}

function drawFace(ctx: CanvasCtx, cx: number, cy: number, size: number, expression: string) {
  const eyeY = cy - size * 0.04;
  ctx.fillStyle = "#2c241f";
  if (expression === "wink") {
    ctx.lineWidth = Math.max(2, size * 0.04);
    ctx.strokeStyle = "#2c241f";
    ctx.beginPath();
    ctx.moveTo(cx - size * 0.22, eyeY);
    ctx.lineTo(cx - size * 0.11, eyeY + size * 0.03);
    ctx.stroke();
  } else {
    roundRect(ctx, cx - size * 0.23, eyeY - size * 0.05, size * 0.08, size * 0.16, size * 0.03, "#2c241f");
  }
  roundRect(ctx, cx + size * 0.13, eyeY - size * 0.05, size * 0.08, size * 0.16, size * 0.03, "#2c241f");
  if (expression === "surprised") {
    ctx.beginPath();
    ctx.fillStyle = "#eb6a5e";
    ctx.arc(cx, cy + size * 0.2, size * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else {
    roundRect(ctx, cx - size * 0.08, cy + size * 0.14, size * 0.18, size * 0.09, size * 0.04, "#ef6a61");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cx - size * 0.055, cy + size * 0.145, size * 0.12, size * 0.025);
  }
  if (expression === "excited") {
    ctx.strokeStyle = "#f2a18e";
    ctx.lineWidth = Math.max(1, size * 0.02);
    ctx.beginPath();
    ctx.arc(cx - size * 0.31, cy + size * 0.08, size * 0.05, 0, Math.PI);
    ctx.arc(cx + size * 0.31, cy + size * 0.08, size * 0.05, 0, Math.PI);
    ctx.stroke();
  }
}

function drawCap(ctx: CanvasCtx, cx: number, y: number, size: number, role: string) {
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.builder;
  if (role === "chef") {
    roundRect(ctx, cx - size * 0.33, y - size * 0.02, size * 0.66, size * 0.24, size * 0.08, colors.cap, "#c8d7e1", 1.5);
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.fillStyle = "#ffffff";
      ctx.arc(cx + i * size * 0.17, y - size * 0.02, size * 0.13, Math.PI, Math.PI * 2);
      ctx.fill();
    }
    return;
  }
  if (role === "sailor") {
    roundRect(ctx, cx - size * 0.31, y + size * 0.02, size * 0.62, size * 0.22, size * 0.08, "#ffffff", "#245d9a", 1.5);
    roundRect(ctx, cx - size * 0.35, y + size * 0.18, size * 0.7, size * 0.08, size * 0.03, "#1d72c7");
    ctx.fillStyle = "#1d72c7";
    ctx.fillRect(cx - size * 0.03, y + size * 0.05, size * 0.06, size * 0.12);
    return;
  }
  roundRect(ctx, cx - size * 0.35, y, size * 0.7, size * 0.28, size * 0.09, colors.cap, "#7d3929aa", 1.5);
  roundRect(ctx, cx - size * 0.43, y + size * 0.19, size * 0.86, size * 0.08, size * 0.03, colors.cap);
  ctx.fillStyle = "#ffffff88";
  ctx.fillRect(cx - size * 0.24, y + size * 0.04, size * 0.08, size * 0.13);
  if (role === "builder") {
    ctx.fillStyle = "#33251e";
    ctx.fillRect(cx - size * 0.04, y + size * 0.06, size * 0.08, size * 0.12);
    ctx.fillRect(cx - size * 0.1, y + size * 0.1, size * 0.2, size * 0.05);
  }
}

function drawHuman(ctx: CanvasCtx, name: string, width: number, height: number) {
  const role = roleFrom(name);
  const expression = expressionFrom(name);
  const colors = ROLE_COLORS[role] ?? ROLE_COLORS.builder;
  const body = name.includes("-body");
  const cx = width / 2;
  const headSize = body ? Math.min(width * 0.54, height * 0.33) : Math.min(width * 0.72, height * 0.72);
  const headY = body ? height * 0.33 : height * 0.53;

  softShadow(ctx, cx, height * 0.9, width * 0.28, height * 0.04, 0.13);

  if (body) {
    const torsoY = headY + headSize * 0.42;
    roundRect(ctx, cx - width * 0.2, torsoY, width * 0.4, height * 0.28, width * 0.05, colors.shirt, "#0d5c91", 1.5);
    roundRect(ctx, cx - width * 0.3, torsoY + height * 0.03, width * 0.13, height * 0.22, width * 0.04, "#ffd3ad", "#b96e55", 1);
    roundRect(ctx, cx + width * 0.17, torsoY + height * 0.03, width * 0.13, height * 0.22, width * 0.04, "#ffd3ad", "#b96e55", 1);
    roundRect(ctx, cx - width * 0.18, torsoY + height * 0.25, width * 0.15, height * 0.2, width * 0.035, role === "planner" ? "#383f76" : "#2d5fa8", "#163d6e", 1);
    roundRect(ctx, cx + width * 0.03, torsoY + height * 0.25, width * 0.15, height * 0.2, width * 0.035, role === "planner" ? "#383f76" : "#2d5fa8", "#163d6e", 1);
    roundRect(ctx, cx - width * 0.2, torsoY + height * 0.42, width * 0.18, height * 0.07, width * 0.03, role === "planner" ? "#9d4ce8" : "#f05143", "#743d2c", 1);
    roundRect(ctx, cx + width * 0.02, torsoY + height * 0.42, width * 0.18, height * 0.07, width * 0.03, role === "planner" ? "#9d4ce8" : "#f05143", "#743d2c", 1);
    if (role === "worker") {
      roundRect(ctx, cx - width * 0.09, torsoY + height * 0.02, width * 0.18, height * 0.16, 4, "#ffef9b");
      ctx.fillStyle = "#f36a24";
      ctx.fillRect(cx - width * 0.04, torsoY + height * 0.03, width * 0.08, height * 0.18);
    } else if (role === "chef") {
      ctx.fillStyle = "#ef4a45";
      ctx.fillRect(cx - width * 0.03, torsoY + height * 0.01, width * 0.06, height * 0.22);
    } else if (role === "mechanic") {
      ctx.fillStyle = "#ff4a42";
      ctx.fillRect(cx - width * 0.18, torsoY + height * 0.14, width * 0.36, height * 0.05);
    } else if (role === "sailor") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - width * 0.14, torsoY + height * 0.06, width * 0.28, height * 0.04);
    } else if (role === "tourist") {
      ctx.fillStyle = "#ffe361";
      for (let i = 0; i < 3; i += 1) ctx.fillRect(cx - width * 0.16 + i * width * 0.12, torsoY + height * 0.08, width * 0.05, height * 0.05);
    } else {
      ctx.fillStyle = colors.accent;
      ctx.fillRect(cx - width * 0.04, torsoY + height * 0.05, width * 0.08, height * 0.08);
    }
  }

  // Hair behind face.
  roundRect(ctx, cx - headSize * 0.5, headY - headSize * 0.45, headSize, headSize * 0.84, headSize * 0.17, colors.hair, "#38251c", 1.3);
  roundRect(ctx, cx - headSize * 0.39, headY - headSize * 0.28, headSize * 0.78, headSize * 0.68, headSize * 0.15, "#ffd3ad", "#b86e55", 1.3);
  ctx.fillStyle = colors.hair;
  ctx.fillRect(cx - headSize * 0.38, headY - headSize * 0.27, headSize * 0.17, headSize * 0.2);
  ctx.fillRect(cx - headSize * 0.16, headY - headSize * 0.29, headSize * 0.18, headSize * 0.13);
  ctx.fillRect(cx + headSize * 0.2, headY - headSize * 0.27, headSize * 0.17, headSize * 0.18);
  drawFace(ctx, cx, headY + headSize * 0.02, headSize * 0.72, expression);
  drawCap(ctx, cx, headY - headSize * 0.58, headSize, role);
}

function drawCorgi(ctx: CanvasCtx, name: string, width: number, height: number) {
  const body = name.includes("-body");
  const cx = width / 2;
  softShadow(ctx, cx, height * 0.86, width * 0.3, height * 0.05, 0.13);
  if (body) {
    roundRect(ctx, cx - width * 0.26, height * 0.48, width * 0.52, height * 0.25, width * 0.08, "#f3a126", "#9f5a15", 1.5);
    roundRect(ctx, cx - width * 0.23, height * 0.7, width * 0.13, height * 0.15, width * 0.04, "#f3a126");
    roundRect(ctx, cx + width * 0.1, height * 0.7, width * 0.13, height * 0.15, width * 0.04, "#f3a126");
    ctx.fillStyle = "#fff2cf";
    ctx.fillRect(cx - width * 0.1, height * 0.52, width * 0.2, height * 0.18);
  }
  polygon(ctx, [[cx - width * 0.28, height * 0.3], [cx - width * 0.15, height * 0.04], [cx - width * 0.02, height * 0.31]], "#e8901d", "#9d5715", 1.3);
  polygon(ctx, [[cx + width * 0.28, height * 0.3], [cx + width * 0.15, height * 0.04], [cx + width * 0.02, height * 0.31]], "#e8901d", "#9d5715", 1.3);
  roundRect(ctx, cx - width * 0.32, height * 0.19, width * 0.64, height * 0.43, width * 0.13, "#f7a92b", "#9d5715", 1.5);
  roundRect(ctx, cx - width * 0.15, height * 0.37, width * 0.3, height * 0.23, width * 0.08, "#fff4db");
  ctx.fillStyle = "#2d251f";
  if (!name.includes("wink")) ctx.fillRect(cx - width * 0.18, height * 0.32, width * 0.05, height * 0.07);
  else {
    ctx.strokeStyle = "#2d251f"; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(cx - width * 0.2, height * 0.35); ctx.lineTo(cx - width * 0.12, height * 0.37); ctx.stroke();
  }
  ctx.fillRect(cx + width * 0.13, height * 0.32, width * 0.05, height * 0.07);
  roundRect(ctx, cx - width * 0.06, height * 0.43, width * 0.12, height * 0.07, 4, "#2d251f");
  roundRect(ctx, cx - width * 0.22, height * 0.57, width * 0.44, height * 0.055, 4, "#ef4e43", "#a52c27", 1);
}

export function drawCharacterTexture(ctx: CanvasCtx, name: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  if (name.startsWith("corgi")) drawCorgi(ctx, name, width, height);
  else drawHuman(ctx, name, width, height);
}

export function drawAccessoryTexture(ctx: CanvasCtx, name: string, width: number, height: number) {
  ctx.clearRect(0, 0, width, height);
  const cx = width / 2;
  const cy = height / 2;
  softShadow(ctx, cx, height * 0.82, width * 0.25, height * 0.05, 0.1);
  if (name === "builder-cap" || name === "hat") {
    roundRect(ctx, width * 0.2, height * 0.24, width * 0.6, height * 0.35, height * 0.08, name === "hat" ? "#ffc829" : "#ef4b3c", "#9a5b16", 1.5);
    roundRect(ctx, width * 0.12, height * 0.53, width * 0.76, height * 0.1, height * 0.03, name === "hat" ? "#ffd739" : "#ef4b3c");
  } else if (name === "backpack") {
    roundRect(ctx, width * 0.24, height * 0.18, width * 0.52, height * 0.62, height * 0.09, "#9c5c2d", "#59381f", 2);
    roundRect(ctx, width * 0.31, height * 0.4, width * 0.38, height * 0.21, height * 0.05, "#c87832", "#6f421f", 1.5);
  } else if (name === "blueprint" || name === "map") {
    roundRect(ctx, width * 0.18, height * 0.18, width * 0.64, height * 0.64, height * 0.05, name === "map" ? "#dff28c" : "#3d9fe8", "#1b5c93", 1.5);
    ctx.strokeStyle = "#ffffff"; ctx.lineWidth = 3;
    ctx.strokeRect(width * 0.32, height * 0.34, width * 0.28, height * 0.22);
    ctx.beginPath(); ctx.moveTo(width * 0.28, height * 0.62); ctx.lineTo(width * 0.5, height * 0.4); ctx.lineTo(width * 0.7, height * 0.58); ctx.stroke();
  } else if (name === "laptop") {
    roundRect(ctx, width * 0.22, height * 0.18, width * 0.56, height * 0.47, height * 0.04, "#7d8798", "#424957", 1.5);
    roundRect(ctx, width * 0.29, height * 0.25, width * 0.42, height * 0.3, height * 0.025, "#a7e8ff");
    polygon(ctx, [[width * 0.16, height * 0.68], [width * 0.84, height * 0.68], [width * 0.72, height * 0.82], [width * 0.28, height * 0.82]], "#a7b2c2", "#505866", 1.5);
  } else if (name === "pencil") {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.55);
    roundRect(ctx, -width * 0.09, -height * 0.34, width * 0.18, height * 0.62, width * 0.05, "#ffd03d", "#b77714", 1.5);
    polygon(ctx, [[-width * 0.09, height * 0.28], [width * 0.09, height * 0.28], [0, height * 0.43]], "#f0c193", "#8b5d34", 1);
    ctx.restore();
  } else if (name.includes("toolbox")) {
    roundRect(ctx, width * 0.16, height * 0.34, width * 0.68, height * 0.4, height * 0.06, "#ef493b", "#8f2c25", 1.5);
    roundRect(ctx, width * 0.34, height * 0.18, width * 0.32, height * 0.22, height * 0.05, "#2e3e4d", "#15212b", 1.5);
    ctx.fillStyle = "#ffd34a"; ctx.fillRect(width * 0.47, height * 0.44, width * 0.06, height * 0.13);
  } else if (name === "cake") {
    roundRect(ctx, width * 0.2, height * 0.43, width * 0.6, height * 0.3, height * 0.05, "#ffd9a1", "#b66d42", 1.3);
    roundRect(ctx, width * 0.22, height * 0.34, width * 0.56, height * 0.16, height * 0.05, "#fff4e1");
    ctx.fillStyle = "#ef4c48"; ctx.beginPath(); ctx.arc(cx, height * 0.3, width * 0.06, 0, Math.PI * 2); ctx.fill();
  } else if (name === "wrench") {
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(-0.6);
    roundRect(ctx, -width * 0.06, -height * 0.28, width * 0.12, height * 0.58, width * 0.04, "#aab8c5", "#52616f", 1.5);
    ctx.lineWidth = width * 0.09; ctx.strokeStyle = "#aab8c5"; ctx.beginPath(); ctx.arc(0, -height * 0.26, width * 0.14, 0.25, Math.PI - 0.25); ctx.stroke();
    ctx.restore();
  } else if (name === "tool-belt" || name === "collar") {
    roundRect(ctx, width * 0.12, height * 0.43, width * 0.76, height * 0.15, height * 0.06, name === "collar" ? "#ef4d43" : "#984d2b", "#5c2e20", 1.5);
    roundRect(ctx, width * 0.42, height * 0.4, width * 0.16, height * 0.21, height * 0.03, "#ffd338", "#a97412", 1);
  } else if (name === "binoculars" || name === "camera") {
    roundRect(ctx, width * 0.2, height * 0.31, width * 0.6, height * 0.38, height * 0.06, "#27374b", "#101b29", 1.5);
    [0.36, 0.64].forEach(x => {
      ctx.beginPath(); ctx.fillStyle = "#53b9ef"; ctx.arc(width * x, cy, width * 0.11, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = "#ffffffaa"; ctx.lineWidth = 2; ctx.stroke();
    });
  } else {
    roundRect(ctx, width * 0.2, height * 0.23, width * 0.6, height * 0.54, height * 0.1, "#47a9ee", "#185d93", 1.5);
  }
}
