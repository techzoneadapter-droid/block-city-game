import Phaser from 'phaser';
import { cachedCanvas } from '../ui/art';

export const CAST = ['builder', 'planner', 'worker', 'chef', 'mechanic', 'sailor', 'tourist', 'corgi'] as const;
export type Expression = 'happy' | 'wink' | 'thinking' | 'focused' | 'excited' | 'laughing' | 'surprised';
const colors: Record<string, [string, string, string]> = {
  builder: ['#ff5545', '#af2027', '#168cf2'], planner: ['#c358ff', '#6629ad', '#9451e0'],
  worker: ['#ffe549', '#d08b08', '#ffac29'], chef: ['#ffffff', '#b8cedf', '#f9fcff'],
  mechanic: ['#269eff', '#084bb2', '#197ad9'], sailor: ['#ffffff', '#b1d4ed', '#f4fcff'],
  tourist: ['#ffdb76', '#b87e2a', '#41b8a0'], corgi: ['#ffce4a', '#c17417', '#ffffff'],
};
/** Original vector-built toys. Body and portrait use the same face, costume and expression rig. */
export function characterTexture(scene: Phaser.Scene, id: string, body = false, expression: Expression = 'happy') {
  if (!CAST.includes(id as typeof CAST[number])) return undefined;
  return cachedCanvas(scene, `cast-v3-${id}-${body}-${expression}`, 200, body ? 270 : 200, c => {
    const [hat, shade, shirt] = colors[id];
    const grad = (a: string, b: string, y = 0, h = 180) => { const g = c.createLinearGradient(35, y, 150, y + h); g.addColorStop(0, a); g.addColorStop(1, b); return g; };
    const shape = (d: string, a: string, b = a, edge = '#163553', w = 2) => {
      const p = new Path2D(d);
      const numbers = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [0,0];
      const ys = numbers.filter((_,i) => i % 2 === 1);
      const top = Math.min(...ys), height = Math.max(15, Math.max(...ys)-top);
      c.fillStyle = grad(a,b,top,height); c.strokeStyle = edge; c.lineWidth = w * .65;
      c.fill(p); if(w) c.stroke(p);
      if(w) { c.save();c.clip(p);c.translate(1.5,2);c.strokeStyle='#ffffff50';c.lineWidth=2;c.stroke(p);c.restore(); }

    };
    const box = (x: number, y: number, w: number, h: number, r: number, a: string, b = a, edge = '#163553') => {
      c.beginPath(); c.roundRect(x, y, w, h, r); const light = c.createRadialGradient(x+w*.24,y+h*.16,1,x+w*.35,y+h*.25,Math.max(w,h)*.85);
      light.addColorStop(0,a);light.addColorStop(.35,a);light.addColorStop(1,b);c.fillStyle=light;c.fill(); c.strokeStyle = edge; c.lineWidth = 1.2; c.stroke();
      c.save(); c.beginPath(); c.roundRect(x, y, w, h, r); c.clip();
      c.fillStyle = '#ffffff22'; c.beginPath(); c.moveTo(x,y); c.lineTo(x+w,y); c.lineTo(x+w-5,y+6); c.lineTo(x+5,y+6); c.lineTo(x+5,y+h-5); c.lineTo(x,y+h); c.fill();
      c.fillStyle = '#102e5145'; c.beginPath(); c.moveTo(x+w,y+3); c.lineTo(x+w,y+h); c.lineTo(x+3,y+h); c.lineTo(x+8,y+h-6); c.lineTo(x+w-7,y+h-6); c.lineTo(x+w-7,y+8); c.fill(); c.restore();
      c.beginPath(); c.moveTo(x + r, y + 3); c.lineTo(x + w - r, y + 3); c.strokeStyle = '#ffffff55'; c.lineWidth = 2; c.stroke();
    };
    const line = (d: string, col: string, w = 3) => { c.strokeStyle = col; c.lineWidth = w; c.stroke(new Path2D(d)); };
    const ellipse = (x: number, y: number, rx: number, ry: number, col: string) => { c.beginPath(); c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2); c.fillStyle = col; c.fill(); };
    if (!body) {
      box(3, 3, 194, 194, 35, id === 'planner' ? '#e6c6ff' : '#a5eeff', id === 'corgi' ? '#ffeab5' : '#54c9e8', '#ffffff');
      c.save(); c.beginPath(); c.roundRect(5, 5, 190, 190, 33); c.clip();
      ellipse(32, 35, 65, 65, '#ffffff44');
      c.translate(-22, -5); c.scale(1.23, 1.23);
    }
    if (id === 'corgi') {
      if(body) { ellipse(101, 250, 72, 10, '#2466a92b'); box(51, 162, 105, 71, 22, '#ffcb52', '#ba711b');
        shape('M148 187 L178 172 L186 188 L162 207 Z','#fff8df','#e9bd69');
        for(const x of [52, 116]) { box(x, 218, 29, 31, 7, '#fffef3', '#d9dce2'); }
        box(78, 179, 44, 54, 14, '#fffef4', '#e5e2d3'); }
      shape('M44 88 L31 28 L43 13 L72 31 L84 70 Z', '#ffd352', '#d08518');
      shape('M120 69 L141 20 L158 15 L169 32 L155 92 Z', '#ffdc59', '#bc7817');
      shape('M47 67 L43 32 L53 33 L72 63 Z', '#ffbdba', '#df777e', '#d28729');
      shape('M134 66 L149 33 L158 31 L152 70 Z', '#ffbdba', '#df777e', '#d28729');
      box(39, 68, 120, 103, 26, '#ffcc48', '#d58a1d');
      shape('M88 71 L109 71 L116 114 L139 127 L140 155 Q100 181 60 154 L58 128 L82 114 Z', '#ffffef', '#e8e5d9', '#ffffee', 0);
      if(expression === 'wink' || expression === 'excited') line('M64 113 L74 107 L79 113', '#292a30', 5); else box(65, 103, 12, 20, 5, '#34302d', '#141d26');
      if(expression === 'excited') line('M123 113 L132 107 L138 113', '#292a30', 5); else box(125, 103, 12, 20, 5, '#34302d', '#141d26');
      box(87, 123, 27, 15, 6, '#4d4540', '#101b25');
      line('M101 138 L101 145 Q89 158 81 144 M101 145 Q113 158 123 144', '#3e3029', 3);
      shape('M94 149 L111 149 L110 166 Q102 177 95 166 Z', '#ff858b', '#e84560', '#b84050', 1);
      box(56, 168, 91, 12, 5, '#ff514d', '#b8242d'); ellipse(101, 184, 12, 12, '#f9c028'); ellipse(98, 181, 6, 6, '#fff6a8');
    } else {
      if(body) {
        ellipse(99, 254, 66, 10, '#2466a92b');
        // Backpack has a raised flap, side pockets and warm metal clasps.
        box(40, 148, 43, 67, 10, '#b77537', '#693d29'); box(33, 174, 17, 33, 4, '#bf7b38', '#744223'); box(48, 161, 14, 8, 2, '#ffd16a', '#b27723');
        for (const x of [67, 106]) { box(x, 216, 27, 27, 5, '#326cb9', '#0f346d'); box(x - 5, 238, 37, 17, 5, id === 'builder' ? '#ff6154' : hat, shade); box(x - 7, 251, 41, 6, 2, '#ffffff', '#c5dfec'); }
        box(61, 151, 78, 65, 13, shirt, id === 'chef' || id === 'sailor' ? '#c0e6ef' : '#1555a2');
        // Outstretched arm and a lifted, mitten-like hand create a friendly silhouette.
        shape('M64 163 L48 159 L37 181 L56 193 L70 179 Z', shirt, '#256bb6');
        box(33, 178, 25, 26, 8, '#ffe1b5', '#e9a16d', '#ae6a42');
        shape('M137 161 L148 150 L162 166 L145 184 L132 178 Z', shirt, '#2774b4');
        c.save(); c.translate(158, 152); c.rotate(.55); box(-12, -20, 26, 30, 7, '#ffe3bd', '#e4a071', '#ae6a42'); line('M-6 -13 L7 -13', '#fff1d6', 2); c.restore();
        if(id === 'builder' || id === 'mechanic') { box(72, 153, 9, 54, 2, '#6bd1ff', '#106cc3'); box(120, 153, 9, 54, 2, '#6bd1ff', '#106cc3'); box(87, 174, 27, 24, 3, '#379fea', '#0c5eb2'); ellipse(77, 170, 3, 3, '#ffe379'); ellipse(124, 170, 3, 3, '#ffe379'); }
        if(id === 'worker') { box(73, 153, 8, 57, 1, '#fff3a4'); box(121, 153, 8, 57, 1, '#fff3a4'); box(64, 189, 72, 9, 1, '#fff3a4'); }
        if(id === 'chef') { shape('M79 153 L101 162 L119 153 L109 176 L99 165 L90 176 Z', '#ff6352', '#ca2632'); box(62, 201, 76, 19, 3, '#f34b46', '#b82a36'); for(const y of [181,194]) for(const x of [89,110]) ellipse(x,y,2.5,2.5,'#243856'); }
        if(id === 'sailor') shape('M69 153 L99 178 L131 153 L117 184 L101 178 L89 191 Z','#1876d5','#103c8b');
        if(id === 'planner') { shape('M63 210 L135 210 L143 225 L58 225 Z', '#42549b', '#242f6c'); c.save(); c.translate(122,185); c.rotate(.2); box(-22,-25,48,58,3,'#1eafff','#0753b5','#efffff'); line('M-14 22 L18 22 M-10 22 L-10 0 L2 0 L2 -12 L10 -12 L10 22 M-17 -19 L16 -19','#bdf3ff',2); c.restore(); }
        if(id === 'tourist') { line('M74 155 L92 189 L119 154','#343b49',5); box(81,182,43,30,5,'#4b6479','#142f44'); ellipse(102,196,11,11,'#edf7ff'); ellipse(102,196,8,8,'#1885cb'); ellipse(99,193,3,3,'#9beeff'); }
        if (id === 'worker' || id === 'mechanic') {
          c.save(); c.translate(151,179); c.rotate(.45);
          box(-5,-17,11,58,4,'#c5d7e3','#627c98');
          shape('M-6 -12 L-17 -22 L-15 -36 L-7 -42 L-7 -27 L4 -27 L9 -40 L16 -34 L16 -22 L7 -12 Z','#dbe9ee','#7a93aa');
          c.restore(); box(135,179,23,19,6,'#ffe0b4','#dfa170','#a36b49');
        }
        if (id === 'chef') {
          box(133,183,50,6,3,'#f2fbff','#8faabb');box(140,162,35,20,3,'#ffd888','#ba7138');
          box(139,157,37,8,3,'#fffef4','#f1ced2');ellipse(158,152,6,6,'#f33c4b');
          line('M158 147 Q158 143 163 142','#319843',2);
        }
        if (id === 'sailor') { line('M78 157 L91 190 L119 157','#173e68',3); box(87,186,13,23,4,'#4c6070','#16334b');box(104,186,13,23,4,'#4c6070','#16334b');ellipse(94,202,5,5,'#55cafa');ellipse(111,202,5,5,'#55cafa'); }
      } else box(58, 148, 86, 58, 17, shirt, '#1855a0');
      // Sculpted hair mass and warm shaded face. Facets are rounded, never pixel stairs.
      box(40, 62, 120, 86, 23, '#754735', '#352331', '#392634');
      if(id === 'planner' || id === 'chef' || id === 'tourist') for(let i=0;i<3;i++) box(36-i*4, 120+i*16, 28, 27, 8, '#704333', '#392733', '#402937');
      box(35, 101, 22, 30, 9, '#ffd9ad', '#d9976f', '#975d42'); box(147, 101, 20, 30, 9, '#ffd9ad', '#d9976f', '#975d42');
      box(51, 71, 99, 86, 23, '#ffe9c8', '#f3b386', '#a86747');
      shape('M140 83 L149 93 L149 134 Q148 148 135 151 L134 137 Z', '#eeb086', '#db9267', '#e0a076', 0);
      for(const [x,y,w,h] of [[48,72,23,33],[67,69,23,24],[87,72,20,31],[108,68,26,20],[131,76,22,30]]) box(x,y,w,h,5,'#80503a','#402934','#402a2d');
      const closed = expression === 'excited' || expression === 'laughing';
      for(const [i,x] of [73,119].entries()) {
        if(closed || (expression === 'wink' && i===1)) line(`M${x-2} 119 Q${x+5} 107 ${x+12} 119`, '#302b2c', 4);
        else { box(x, 109, 10, expression === 'surprised' ? 20 : 17, 4, '#44312b', '#1c2630', '#30282b'); ellipse(x+3,113,2,3,'#fff7dc'); }
      }
      if(expression === 'focused' || expression === 'thinking') line('M69 104 L84 108 M117 107 L131 103', '#604135', 3);
      ellipse(66,133,8,4,'#ee987d66'); ellipse(134,133,8,4,'#ee987d66');
      if(expression === 'surprised') { ellipse(102,140,7,10,'#84372e'); ellipse(103,144,4,4,'#f17c76'); }
      else if(expression === 'thinking' || expression === 'focused') line('M96 140 Q102 136 109 140','#9b4b3e',3);
      else { shape('M90 135 Q103 139 115 134 L113 144 Q101 156 93 145 Z','#ac3c33','#7d2d31','#933d35',1); shape('M96 146 Q103 140 112 145 Q104 153 96 146 Z','#ff8c85','#f06776','#ee7b75',0); }
      if(id === 'worker') { shape('M64 136 L77 143 L90 142 L102 153 L117 142 L135 136 L132 151 L119 162 L82 159 L66 150 Z','#865139','#4b3029','#5b392b',1); line('M92 146 L107 147','#fff1cd',3); }
      // Distinct headwear, lit crown, darker side plane and raised brim.
      if(id === 'chef') {
        for(const [x,y] of [[64,46],[91,36],[120,38],[143,48]]) box(x-20,y-20,40,44,12,'#ffffff','#cbdce4','#aebbc8');
        box(50,53,101,29,5,'#ffffff','#d3e5ef','#a9bed0'); box(51,73,100,9,2,'#ff6657','#c42938');
      } else {
        shape('M43 79 L46 46 L65 29 L114 24 L142 39 L153 76 Z',hat,shade);
        shape('M117 27 L140 39 L150 73 L123 69 Z',hat,shade,shade,1);
        line('M54 63 L57 47 L71 37 L91 33','#ffffff66',4);
        line('M108 31 L114 67',shade,2);
        if(id === 'worker') { box(92,24,17,50,4,'#fff36b','#efb31a','#c89419'); }
        if(id === 'tourist') { box(46,60,105,15,2,'#a77431','#6e482b'); }
        if(id === 'sailor') box(45,63,108,13,2,'#197ade','#0d3e91');
        shape(id==='tourist' ? 'M25 79 Q100 62 174 79 L167 91 Q99 76 29 92 Z' : 'M39 77 Q94 64 157 77 L165 90 Q104 76 40 91 Z',hat,shade);
        line('M47 79 Q97 69 149 79','#ffffff55',2);
        if(id === 'builder') shape('M90 43 L104 43 L104 54 L112 54 L112 63 L83 63 L83 54 L90 54 Z','#394552','#172a37');
        if(id === 'planner') { box(91,42,18,21,1,'#f7e7ff','#ded1ff','#f9eeff'); box(96,46,9,13,0,'#a83ef3'); }
        if(id === 'mechanic') { ellipse(99,51,12,12,'#eefaff'); ellipse(99,51,5,5,'#1866c8'); for(let a=0;a<8;a++){c.save();c.translate(99,51);c.rotate(a*Math.PI/4);box(-3,-15,6,8,1,'#eefaff','#eefaff','#eefaff');c.restore();} }
        if(id === 'sailor') { line('M100 39 L100 60 M89 53 Q100 68 111 53 M93 46 L107 46','#125ea3',3); ellipse(100,37,3,3,'#125ea3'); }
      }
    }
    if(!body) c.restore();
  });
}

export function characterAsset(scene: Phaser.Scene, name: string) {
  const id = CAST.find(kind => name === kind || name.startsWith(`${kind}-`));
  if (!id) return undefined;
  const suffix = name.slice(id.length + 1);
  const expressions: string[] = ['happy','wink','thinking','focused','excited','laughing','surprised'];
  if (suffix && suffix !== 'body' && !expressions.includes(suffix)) return undefined;
  return characterTexture(scene, id, suffix === 'body', expressions.includes(suffix) ? suffix as Expression : 'happy');
}
