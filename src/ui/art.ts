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
    if (h >= 40 && o.depth !== 0 && (((o.top >> 16) & 255) < 100 || (o.top & 255) < 120)) {
      const bevel=c.createLinearGradient(0,y+h*.72,0,y+h);
      bevel.addColorStop(0,'#041f5800');bevel.addColorStop(1,'#041f5830');
      c.fillStyle=bevel;c.fillRect(x,y+h*.72,w,h*.28);
      c.fillStyle='#ffffffa8';c.beginPath();c.moveTo(x+7,y+r*.66);c.lineTo(x+13,y+r*.39);c.lineTo(x+18,y+r*.48);c.lineTo(x+10,y+r*.79);c.fill();
    }
    // Broad lower bevel and tight inner rim read clearly at mobile resolution.
    if (h >= 24) {
      c.strokeStyle = hex(o.highlight ?? COLORS.cyan); c.lineWidth = h >= 50 ? 3 : 1.5;
      c.beginPath(); c.roundRect(x + 4, y + 4, w - 8, h - 8, Math.max(3, r - 4)); c.stroke();
    }
    c.strokeStyle = '#ffffff'; c.globalAlpha = o.pressed ? .5 : .94; c.lineWidth = h >= 50 ? 2.5 : 1.5;
    c.beginPath(); c.moveTo(x + 5, y + r * .58); c.quadraticCurveTo(x + 7, y + Math.min(5,h*.2), x + r, y + Math.min(5,h*.2)); c.lineTo(x + w - r, y + Math.min(5,h*.2)); c.stroke();
    c.restore();
  });
}

const iconNames = ['happiness', 'hat', 'puzzle', 'shop', 'friends', 'map', 'settings', 'coin', 'gem', 'star', 'level', 'play', 'plus', 'chevron', 'notification', 'tasks', 'lock', 'chest', 'trophy'];
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
    if (kind === 'tasks') {
      path('M24 16 H77 Q84 16 84 24 V83 Q84 90 76 90 H24 Q16 90 16 82 V25 Q16 16 24 16 Z','#ffffff','#bcecff');
      path('M34 12 H43 Q42 3 50 3 Q58 3 57 12 H66 V26 H34 Z','#b4edff','#258ddf');
      for (const y of [41,57,73]) {line(`M38 ${y} H69`,'#238add',4);line(`M24 ${y} l3 3 l5 -7`,'#1684cc',2.5);}
      line('M22 29 V77','#ffffff',3);
    } else if (kind === 'lock') {
      line('M29 45 V31 C29 5 71 5 71 31 V45','#234568',10);
      line('M30 43 V30 C30 9 69 9 69 30 V43','#c9e3f0',5);
      path('M23 39 H77 Q83 39 83 47 V80 Q83 88 74 88 H25 Q17 88 17 80 V47 Q17 39 23 39 Z','#e0eefa','#779eba','#3a5c7e');
      circle(50,59,6,'#254c70','#143353');path('M47 62 H53 L55 73 H45 Z','#285373','#163a5a', '#234866',1,0);
      line('M24 49 V71','#ffffff',3);
    } else if (kind === 'chest') {
      path('M14 41 L77 42 L87 52 V80 L76 88 L15 82 Z','#c08126','#824011','#75401a');
      path('M14 44 L77 49 V83 L14 77 Z','#ffb92b','#df7805','#9a4d09');
      path('M12 43 Q11 22 25 21 H72 Q86 23 87 44 L77 51 Z','#fff272','#ffb212','#99530b');
      path('M26 22 H34 L31 48 V80 L23 79 V46 Z','#fff6a4','#ffc82b','#b06a0f',1.5,0);
      path('M65 22 H72 L69 50 V83 L62 82 V49 Z','#fff6a4','#ffc82b','#b06a0f',1.5,0);
      path('M43 45 L57 46 V65 L43 64 Z','#9df8ff','#06a2ef','#175f88',1.8,1);
      rounded(c,48,52,4,8,1,'#075390');line('M17 35 Q18 26 28 26 H60','#fffdda',3);
    } else if (kind === 'trophy') {
      path('M27 24 H13 Q8 51 33 55 L37 47 Q22 45 22 32 H29 Z','#fff3a1','#e69c17','#ad6911');
      path('M73 24 H87 Q92 51 67 55 L63 47 Q78 45 78 32 H71 Z','#fff3a1','#e69c17','#ad6911');
      path('M44 54 H56 V72 L69 76 V85 H31 V76 L44 72 Z','#ffe963','#e09312','#aa610e');
      path('M25 18 H75 L69 45 Q65 62 50 62 Q34 62 30 44 Z','#fff685','#ffbb13','#a9670b');
      path('M50 28 L55 38 L66 40 L58 48 L60 59 L50 54 L40 59 L42 48 L34 40 L45 38 Z','#fff9bd','#ffe445','#cf930c',1,0);
      line('M31 24 L35 41','#fffde0',4);line('M36 79 H63','#fff2a8',2);
    } else if (kind === 'happiness') {
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
