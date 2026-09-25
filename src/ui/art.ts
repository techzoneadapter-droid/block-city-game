import Phaser from 'phaser';
import { COLORS, UI, hex } from './tokens';

type Ctx = CanvasRenderingContext2D;
type Paint = string | CanvasGradient;
export function cachedCanvas(scene: Phaser.Scene, key: string, w: number, h: number, draw: (c: Ctx) => void) {
  if (!scene.textures.exists(key)) {
    const canvas = scene.textures.createCanvas(key, Math.ceil(w * 2), Math.ceil(h * 2))!;
    const c = canvas.context;
    c.scale(2, 2);
    c.lineJoin = 'round'; c.lineCap = 'round';
    draw(c);
    canvas.refresh();
  }
  return key;
}
function gradient(c: Ctx, top: string, bottom: string, y = 0, h = 100) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, top); g.addColorStop(1, bottom); return g;
}
function rounded(c: Ctx, x: number, y: number, w: number, h: number, r: number, fill: Paint, stroke?: string, line = 2) {
  c.beginPath(); c.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2));
  c.fillStyle = fill; c.fill();
  if (stroke) { c.strokeStyle = stroke; c.lineWidth = line; c.stroke(); }
}
export type SurfaceOptions = { top: number; bottom: number; edge: number; radius: number; outline?: number; depth?: number; highlight?: number; shadow?: boolean; shadowAlpha?: number; shadowColor?: number; selected?: boolean; pressed?: boolean };
/** Padding contains the contact shadow and selected glow; callers retain their logical hit bounds. */
export function surfaceTexture(scene: Phaser.Scene, w: number, h: number, o: SurfaceOptions) {
  const key = `ui-surface-${w}-${h}-${JSON.stringify(o)}`;
  return cachedCanvas(scene, key, w + 24, h + 32, c => {
    const x = 12, y = 12, r = o.radius, d = o.depth ?? UI.extrusion.control;
    if (o.selected) {
      c.shadowColor = '#00efff'; c.shadowBlur = 10;
      rounded(c, x - 3, y - 3, w + 6, h + d + 6, r + 3, '#64f7ff', '#edffff', 2);
      c.shadowBlur = 0;
    }
    if (o.shadow !== false) {
      c.shadowColor = hex(o.shadowColor ?? UI.shadow.color); c.shadowBlur = UI.shadow.blur;
      c.shadowOffsetY = UI.shadow.offset; c.globalAlpha = o.shadowAlpha ?? UI.shadow.alpha;
      rounded(c, x + 1, y + d, w - 2, h, r, hex(UI.shadow.color));
      c.shadowBlur = 0; c.shadowOffsetY = 0; c.globalAlpha = 1;
    }
    rounded(c, x, y + d, w, h, r, hex(o.edge), hex(o.outline ?? COLORS.ink), UI.outline.control);
    rounded(c, x, y, w, h, r, gradient(c, hex(o.top), hex(o.bottom), y, h), hex(o.outline ?? COLORS.ink), UI.outline.control);
    c.save(); c.beginPath(); c.roundRect(x + 1, y + 1, w - 2, h - 2, r); c.clip();
    const sheen = c.createLinearGradient(0, y, 0, y + h * .7);
    sheen.addColorStop(0, '#ffffff28'); sheen.addColorStop(1, '#ffffff00');
    c.fillStyle = sheen; c.fillRect(x, y, w, h * .56);
    // Broad lower bevel and tight inner rim read clearly at mobile resolution.
    c.strokeStyle = hex(o.highlight ?? COLORS.cyan); c.lineWidth = h >= 50 ? 3 : 1.5;
    c.beginPath(); c.roundRect(x + 4, y + 4, w - 8, h - 8, Math.max(3, r - 4)); c.stroke();
    c.strokeStyle = '#ffffff'; c.globalAlpha = o.pressed ? .5 : .94; c.lineWidth = h >= 50 ? 2.5 : 1.5;
    c.beginPath(); c.moveTo(x + 7, y + r * .58); c.quadraticCurveTo(x + 10, y + 5, x + r, y + 5); c.lineTo(x + w - r, y + 5); c.stroke();
    c.restore();
  });
}

const iconNames = ['happiness', 'hat', 'puzzle', 'shop', 'friends', 'map', 'settings', 'coin', 'gem', 'star', 'level', 'play', 'plus', 'chevron', 'notification'];
/** Original silhouettes, authored as curves and geometry, independent of the reference files. */
export function iconTexture(scene: Phaser.Scene, kind: string): string | undefined {
  if (!iconNames.includes(kind)) return undefined;
  return cachedCanvas(scene, `ui-icon-${kind}`, 100, 100, c => {
    const navy = hex(COLORS.ink);
    const path = (data: string, top: string, bottom = top, edge = navy, lw = 2.8, depth = 3) => {
      const p = new Path2D(data);
      c.save(); c.translate(0, depth); c.fillStyle = edge; c.strokeStyle = edge; c.lineWidth = lw + 1; c.stroke(p); c.fill(p); c.restore();
      c.fillStyle = gradient(c, top, bottom, 15, 72); c.strokeStyle = edge; c.lineWidth = lw; c.stroke(p); c.fill(p);
    };
    const line = (data: string, color = '#ffffff', width = 2.3) => { c.strokeStyle = color; c.lineWidth = width; c.stroke(new Path2D(data)); };
    const circle = (x: number, y: number, r: number, top: string, bottom: string, edge = navy) => {
      c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = gradient(c, top, bottom, y-r, r*2); c.fill(); c.strokeStyle = edge; c.lineWidth = 2.6; c.stroke();
    };
    if (kind === 'happiness') {
      circle(50, 49, 39, '#fff45b', '#ffc31d', '#ae640e');
      line('M23 37 Q28 18 44 17', '#fffbd1', 4);
      rounded(c, 33, 33, 7, 13, 3, '#693c1e'); rounded(c, 60, 33, 7, 13, 3, '#693c1e');
      path('M30 55 Q50 67 71 55 Q66 82 50 82 Q34 79 30 55 Z', '#a14b22', '#77361f', '#8c461f', 1, 0);
      line('M37 60 Q50 66 63 60', '#fffaf0', 4);
    } else if (kind === 'hat') {
      path('M14 69 Q14 26 43 24 L57 24 Q86 26 86 69 Z', '#fff332', '#ffb900', '#975300');
      path('M42 23 Q49 17 58 23 L59 69 L41 69 Z', '#fff75d', '#ffc000', '#d89500', 2, 0);
      line('M25 61 Q25 34 37 32', '#fffdd1', 4);
      line('M69 33 Q78 44 78 64', '#ec9300', 2);
      path('M9 66 Q49 78 91 66 L92 78 Q50 92 8 78 Z', '#ffe948', '#ffb000', '#9b5800');
      line('M14 69 Q49 81 86 70', '#fff88a', 3);
    } else if (kind === 'puzzle') {
      path('M28 29 L40 29 C27 10 67 8 59 29 L72 29 Q80 29 79 40 C99 29 100 68 79 59 L79 72 Q79 80 67 79 C79 98 41 98 49 79 L29 79 Q21 79 22 68 L22 60 C3 70 4 32 22 41 L22 35 Q22 29 28 29 Z', '#f78cff', '#b627ec', '#571786', 2.8);
      line('M27 44 L27 36 Q27 34 34 34 M43 21 Q49 15 55 21 M29 75 L39 75', '#ffcaff', 2.8);
    } else if (kind === 'shop') {
      rounded(c, 18, 40, 64, 43, 4, gradient(c, '#fff9dd', '#ffcf61'), navy);
      rounded(c, 47, 54, 22, 30, 2, '#049de9', '#fffce7', 3);
      rounded(c, 24, 54, 16, 18, 2, '#33c8ff', '#fffce7', 3);
      line('M27 68 L37 57', '#b7f4ff', 3);
      path('M20 17 L80 17 L94 45 Q91 56 77 51 Q67 57 59 51 Q48 57 39 51 Q28 57 20 51 Q8 56 7 45 Z', '#ff7060', '#f32928', '#96272b');
      path('M33 18 L46 18 L43 45 Q40 57 25 49 Z', '#ffffff', '#e0f3ff', '#ffffff', .5, 0);
      path('M59 18 L72 18 L80 48 Q68 58 60 47 Z', '#ffffff', '#e0f3ff', '#ffffff', .5, 0);
      rounded(c, 16, 81, 69, 7, 2, '#ffde45', '#b97f21'); line('M24 21 L78 21', '#ffc9b8');
    } else if (kind === 'friends') {
      path('M55 55 C83 48 93 65 92 85 L52 85 Z', '#ceffff', '#60c7f5');
      circle(68, 34, 17, '#efffff', '#8cdfff');
      path('M10 86 L10 78 C10 47 54 45 56 78 L56 86 Z', '#edffff', '#80d9ff');
      circle(33, 34, 18, '#ffffff', '#9fe5ff'); line('M14 78 Q13 61 28 59');
    } else if (kind === 'map') {
      path('M12 42 L35 33 L63 42 L85 34 L95 86 L68 94 L36 85 L7 93 Z', '#ffffff', '#c0e8ff');
      path('M16 46 L35 39 L38 78 L13 86 Z', '#a9ec4e', '#60c930', '#ffffff', 1, 0);
      path('M37 39 L61 48 L66 86 L40 78 Z', '#6de76e', '#36bdb1', '#ffffff', 1, 0);
      path('M64 49 L81 41 L89 80 L69 86 Z', '#a9ec4e', '#5bc431', '#ffffff', 1, 0);
      line('M15 72 L31 61 L49 69 L69 61 L84 65', '#fff17c', 4);
      path('M51 10 C21 10 22 42 34 53 L52 73 L70 50 C86 28 70 10 51 10 Z', '#ff7056', '#ef2637', '#9a1e2d');
      circle(52, 31, 10, '#a6f7ff', '#16b5ed'); line('M37 26 Q40 16 50 16', '#ffdcd0', 3);
    } else if (kind === 'settings') {
      const p = new Path2D();
      for (let i = 0; i < 32; i++) { const a = i * Math.PI / 16 - Math.PI / 32; const r = i % 4 < 2 ? 40 : 31; const x=50+Math.cos(a)*r,y=48+Math.sin(a)*r; if(i) p.lineTo(x,y); else p.moveTo(x,y); }
      p.closePath(); p.moveTo(63,48); p.arc(50,48,13,0,Math.PI*2,true);
      c.save(); c.translate(0,3); c.fillStyle='#0a3566'; c.fill(p,'evenodd'); c.restore();
      c.fillStyle=gradient(c,'#ffffff','#d7efff'); c.strokeStyle=navy; c.lineWidth=3; c.stroke(p); c.fill(p,'evenodd');
      line('M25 26 L31 22 M45 12 L53 12', '#ffffff', 3);
    } else if (kind === 'coin') {
      circle(50,52,40,'#ffe945','#ed8900','#925017'); circle(49,47,37,'#fff684','#ffbc08','#fff9b0');
      circle(49,47,28,'#ffd518','#ffea35','#e79a04');
      path('M39 48 Q40 30 54 31 Q68 34 59 50 Q53 64 42 62 Z','#fff79a','#ffd228','#f1b709',2,0);
      line('M23 41 Q28 20 45 19', '#ffffff', 4);
    } else if (kind === 'gem') {
      path('M25 17 L74 17 L94 43 L50 91 L7 43 Z','#b8ffff','#00aaff');
      path('M25 18 L38 41 L8 42 Z','#eaffff','#84e7ff','#d4ffff',1,0);
      path('M25 18 L74 18 L62 41 L38 41 Z','#d7ffff','#6beeff','#ddffff',1,0);
      path('M38 42 L62 42 L50 89 Z','#51eaff','#008dff','#6fedff',1,0);
      line('M10 43 L91 43', '#edffff', 2);
    } else if (kind === 'star' || kind === 'level') {
      let data=''; for(let i=0;i<10;i++){const a=-Math.PI/2+i*Math.PI/5,r=i%2?24:43; data+=`${i?'L':'M'}${50+Math.cos(a)*r} ${49+Math.sin(a)*r} `;} data+='Z';
      path(data,kind==='level'?'#86f7ff':'#fff565',kind==='level'?'#0078ff':'#ffb000',kind==='level'?navy:'#a76807');
      c.save(); c.translate(50,49); c.scale(.83,.83); c.translate(-50,-49); line(data,kind==='level'?'#bcffff':'#fff6a4',2.3); c.restore();
    } else if (kind === 'play') {
      path('M29 15 Q25 13 25 20 L25 79 Q25 86 31 82 L79 54 Q85 50 78 46 Z','#13458a','#05235a',navy,2,1);
    } else if (kind === 'plus') {
      path('M41 19 L59 19 L59 40 L80 40 L80 58 L59 58 L59 80 L41 80 L41 58 L20 58 L20 40 L41 40 Z','#ffffff','#e3ffde','#098333',2,2);
    } else if (kind === 'chevron') {
      path('M33 19 L66 49 L34 81 L22 68 L43 49 L21 31 Z','#ffffff','#d2efff',navy,2,2);
    } else {
      circle(50,49,39,'#ff6d6a','#f0082c','#811b31'); line('M23 38 Q28 18 44 17','#ffffff',6);
    }
  });
}

/** Small original toy portraits share the selected character's profession palette. */
export function portraitTexture(scene: Phaser.Scene, character: string) {
  const palettes: Record<string, [string, string, string]> = {
    builder: ['#ff6844', '#e83226', '#088fea'], planner: ['#d783f5', '#9331c8', '#aa63e5'],
    worker: ['#ffec36', '#e69b08', '#f8a132'], chef: ['#ffffff', '#cbdde6', '#e9f5fd'],
    mechanic: ['#42b3f4', '#096eb7', '#1d90d1'], sailor: ['#ffffff', '#d5eff8', '#1986c7'],
    tourist: ['#ffe19b', '#b98b42', '#5ac955'],
  };
  const colors = palettes[character];
  if (!colors) return undefined;
  return cachedCanvas(scene, `ui-portrait-${character}`, 80, 80, c => {
    rounded(c, 0, 0, 80, 80, 17, gradient(c, '#079b76', '#a5e745', 0, 80));
    rounded(c, 3, 6, 13, 19, 3, '#a3ef4b'); rounded(c, 61, 33, 16, 18, 2, '#d2f75a');
    rounded(c, 17, 20, 47, 46, 12, gradient(c, '#85431d', '#492b1b', 20, 50));
    rounded(c, 13, 66, 56, 24, 15, gradient(c, colors[2], '#0864ac', 60, 20));
    rounded(c, 33, 61, 15, 12, 4, '#e8a36d');
    rounded(c, 12, 39, 9, 17, 5, '#ffc58e', '#9e5b2f', 1);
    rounded(c, 60, 39, 9, 17, 5, '#e4a273', '#9e5b2f', 1);
    rounded(c, 20, 28, 41, 37, 10, gradient(c, '#ffe0ad', '#ffc490', 28, 37));
    // Soft cuboid bangs and sideburns frame the eyes.
    rounded(c, 20, 27, 10, 14, 3, '#6b381c'); rounded(c, 28, 27, 10, 10, 2, '#703919');
    rounded(c, 48, 27, 12, 12, 3, '#703919'); rounded(c, 56, 31, 6, 16, 2, '#64331b');
    rounded(c, 28, 41, 5, 12, 2, '#2c241e'); rounded(c, 48, 41, 5, 12, 2, '#2c241e');
    rounded(c, 28, 41, 2, 4, 1, '#ffffff'); rounded(c, 48, 41, 2, 4, 1, '#ffffff');
    rounded(c, 23, 52, 8, 4, 2, '#f6a47a'); rounded(c, 51, 52, 8, 4, 2, '#f6a47a');
    rounded(c, 36, 54, 10, 8, 4, '#b95339'); rounded(c, 37, 54, 8, 2, 1, '#fffef0');
    rounded(c, 39, 59, 6, 2, 1, '#ff8b7b');
    rounded(c, 22, 69, 5, 14, 2, '#ffcc49'); rounded(c, 55, 68, 5, 15, 2, '#ffcc49');
    // Cap face, curved brim, shaded side and a tiny geometric builder patch.
    const hat = new Path2D('M17 29 L18 18 Q20 7 38 6 Q58 6 63 19 L64 29 Z');
    c.fillStyle = gradient(c, colors[0], colors[1], 6, 25); c.strokeStyle = '#873b29'; c.lineWidth = 1.2; c.stroke(hat); c.fill(hat);
    const side = new Path2D('M50 8 Q60 11 63 19 L64 28 L51 27 Z'); c.fillStyle = colors[1]; c.fill(side);
    const brim = new Path2D('M15 28 Q36 23 66 29 L69 34 Q39 30 14 35 Z');
    c.save(); c.translate(0, 2); c.fillStyle = '#833920'; c.fill(brim); c.restore();
    c.fillStyle = gradient(c, colors[0], colors[1], 23, 13); c.fill(brim);
    c.strokeStyle = '#ffe5b480'; c.lineWidth = 1.5; c.stroke(new Path2D('M21 24 L22 18 Q25 10 32 10'));
    if (character === 'builder') { rounded(c, 36, 13, 10, 10, 1, '#4c3028'); rounded(c, 33, 20, 16, 4, 1, '#4c3028'); }
  });
}
