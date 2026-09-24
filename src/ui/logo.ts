import Phaser from 'phaser';
import { cachedCanvas } from './art';
import { COLORS, UI, hex } from './tokens';
type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
function polygon(c: Ctx, points: Point[], color: string) { c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath(); c.fillStyle = color; c.fill(); }
function line(c: Ctx, points: Point[], color: string, width: number) { c.beginPath(); points.forEach(([x,y], i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.strokeStyle=color; c.lineWidth=width; c.stroke(); }
function gradient(c: Ctx, y: number, h: number, a: string, b: string) { const g=c.createLinearGradient(0,y,0,y+h); g.addColorStop(0,a);g.addColorStop(1,b);return g; }
const LETTERS: Record<string, { edge: Point[]; holes?: Point[][] }> = {
  B: {
    edge: [
      [0, 0],
      [43, 0],
      [54, 8],
      [54, 29],
      [47, 35],
      [57, 42],
      [57, 64],
      [46, 72],
      [0, 72],
    ],
    holes: [
      [
        [19, 15],
        [35, 15],
        [35, 27],
        [19, 27],
      ],
      [
        [19, 43],
        [37, 43],
        [37, 56],
        [19, 56],
      ],
    ],
  },
  L: {
    edge: [
      [0, 0],
      [21, 0],
      [21, 51],
      [54, 51],
      [54, 72],
      [0, 72],
    ],
  },
  O: {
    edge: [
      [10, 0],
      [46, 0],
      [57, 11],
      [57, 61],
      [46, 72],
      [10, 72],
      [0, 61],
      [0, 11],
    ],
    holes: [
      [
        [20, 19],
        [37, 19],
        [37, 53],
        [20, 53],
      ],
    ],
  },
  C: {
    edge: [
      [11, 0],
      [56, 0],
      [56, 21],
      [21, 21],
      [21, 51],
      [56, 51],
      [56, 72],
      [11, 72],
      [0, 61],
      [0, 11],
    ],
  },
  K: {
    edge: [
      [0, 0],
      [20, 0],
      [20, 26],
      [36, 0],
      [59, 0],
      [38, 35],
      [60, 72],
      [36, 72],
      [20, 46],
      [20, 72],
      [0, 72],
    ],
  },
  I: {
    edge: [
      [0, 0],
      [27, 0],
      [27, 72],
      [0, 72],
    ],
  },
  T: {
    edge: [
      [0, 0],
      [60, 0],
      [60, 21],
      [41, 21],
      [41, 72],
      [20, 72],
      [20, 21],
      [0, 21],
    ],
  },
  Y: {
    edge: [
      [0, 0],
      [24, 0],
      [34, 26],
      [45, 0],
      [69, 0],
      [45, 46],
      [45, 72],
      [23, 72],
      [23, 46],
    ],
  },
};
export function logoTexture(scene: Phaser.Scene) {
  return cachedCanvas(scene, "ui-logo-main", 366, 185, (c) => {
    const word = (
      str: string,
      startX: number,
      y: number,
      scale: number,
      gold: boolean,
    ) => {
      let x = startX;
      for (const [i, ch] of [...str].entries()) {
        c.save();
        c.translate(x, y + Math.abs(i - (str.length - 1) / 2) * 1.8);
        c.scale(scale, scale);
        c.rotate((i - (str.length - 1) / 2) * 0.018);
        const letter = LETTERS[ch];
        const path = new Path2D();
        for (const points of [letter.edge, ...(letter.holes ?? [])]) {
          points.forEach(([px, py], j) =>
            j ? path.lineTo(px, py) : path.moveTo(px, py),
          );
          path.closePath();
        }
        c.lineJoin = "round";
        for (let d = 10; d >= 0; d--) {
          c.save();
          c.translate(-d * 0.45, d);
          c.lineWidth = 12;
          c.strokeStyle = hex(COLORS.inkDark);
          c.stroke(path);
          c.fillStyle = gold ? "#f18808" : "#0876c3";
          c.fill(path, "evenodd");
          c.restore();
        }
        c.lineWidth = 5;
        c.strokeStyle = gold ? "#ffe976" : "#8be2ff";
        c.stroke(path);
        c.fillStyle = gradient(
          c,
          0,
          72,
          gold ? "#fff641" : "#ffffff",
          gold ? "#ffb80a" : "#c1ecff",
        );
        c.fill(path, "evenodd");
        c.save();
        c.clip(path, "evenodd");
        line(
          c,
          [
            [4, 69],
            [4, 3],
            [52, 3],
          ],
          gold ? "#fffca8" : "#ffffff",
          2,
        );
        polygon(
          c,
          [
            [-10, 58],
            [70, 12],
            [70, 24],
            [-10, 70],
          ],
          "#ffffff22",
        );
        if (!gold) {
          polygon(c, [[0, 53], [18, 47], [34, 61], [57, 48], [57, 72], [0, 72]], '#57d7f13b');
          polygon(c, [[0, 72], [18, 47], [27, 72]], '#edffff80');
        }
        c.restore();
        c.restore();
        x += (Math.max(...letter.edge.map((p) => p[0])) + 10) * scale;
      }
    };
    word("BLOCK", 15, 8, 1.02, false);
    word("CITY", 65, 94, 0.97, true);
  });
}


export function BlockCityLogo(scene: Phaser.Scene, x: number, y: number, width = 360, variant: 'main' | 'compact' = 'main') {
  const root = scene.add.container(x, y);
  root.add(scene.add.image(0, 0, logoTexture(scene)).setDisplaySize(width, width * 185 / 366));
  if (variant === 'main') root.add(Tagline(scene, 0, width * .255, width * .61));
  return root;
}
export function Tagline(scene: Phaser.Scene, x: number, y: number, width = 220) {
  const key = cachedCanvas(scene, 'ui-brand-tagline', 300, 58, c => {
    const p = new Path2D('M15 13 Q150 -5 285 13 Q297 15 291 31 L285 45 Q283 53 271 50 Q150 33 29 50 Q17 53 15 45 L9 28 Q5 15 15 13 Z');
    c.save(); c.translate(0,4); c.fillStyle=hex(COLORS.ink);c.fill(p);c.restore();
    c.lineWidth=3;c.strokeStyle='#0387f7';c.fillStyle=gradient(c,0,52,'#08d4ff','#0056ed');c.stroke(p);c.fill(p);
    line(c,[[17,17],[58,11],[108,7],[160,6],[218,10],[281,17]],'#a1ffff',2);
    c.font=`bold 23px ${UI.font}`;c.textAlign='center';c.textBaseline='middle';
    c.strokeStyle='#064aaf';c.lineWidth=3;c.strokeText('Build • Puzzle • Grow',150,28);
    c.fillStyle='#ffffff';c.fillText('Build • Puzzle • Grow',150,27);
    for(const px of [99,204]){c.beginPath();c.arc(px,28,3.4,0,Math.PI*2);c.fillStyle='#ffdb24';c.fill();}
  });
  return scene.add.image(x,y,key).setDisplaySize(width,width*58/300);
}
