import Phaser from "phaser";
import { cachedCanvas } from "./art";
import { COLORS, UI, hex } from "./tokens";
type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
function polygon(c: Ctx, points: Point[], color: string) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = color;
  c.fill();
}
function line(c: Ctx, points: Point[], color: string, width: number) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}
function gradient(c: Ctx, y: number, h: number, a: string, b: string) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
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
/** An original, font-independent sculpted wordmark. Home gets an integrated city crest. */
export function logoTexture(scene: Phaser.Scene, home = false) {
  return cachedCanvas(
    scene,
    home ? "ui-logo-home" : "ui-logo-main",
    366,
    home ? 244 : 190,
    (c) => {
      const cube = (
        x: number,
        y: number,
        w: number,
        h: number,
        color: string,
      ) => {
        polygon(
          c,
          [
            [x, y],
            [x + w, y],
            [x + w, y + h],
            [x, y + h],
          ],
          color,
        );
        polygon(
          c,
          [
            [x, y],
            [x + 7, y - 5],
            [x + w + 7, y - 5],
            [x + w, y],
          ],
          "#b9f051",
        );
        polygon(
          c,
          [
            [x + w, y],
            [x + w + 7, y - 5],
            [x + w + 7, y + h - 5],
            [x + w, y + h],
          ],
          "#20872a",
        );
      };
      const tree = (x: number, y: number, s: number) => {
        c.save();
        c.translate(x, y);
        c.scale(s, s);
        cube(-2, -15, 5, 20, "#b97b38");
        cube(-12, -26, 15, 16, "#4eca1f");
        cube(-3, -38, 14, 18, "#7be324");
        cube(9, -26, 9, 11, "#54c913");
        c.restore();
      };
      if (home) {
        // Small skyline and vegetation belong to the logo, moving with its whole silhouette.
        for (const [x, y, h] of [
          [136, 66, 22],
          [161, 62, 36],
          [194, 65, 21],
          [218, 68, 25],
        ]) {
          polygon(
            c,
            [
              [x, y - h],
              [x + 18, y - h],
              [x + 18, y],
              [x, y],
            ],
            "#fff0c9",
          );
          polygon(
            c,
            [
              [x + 18, y - h],
              [x + 25, y - h - 5],
              [x + 25, y - 5],
              [x + 18, y],
            ],
            "#1476b2",
          );
          polygon(
            c,
            [
              [x - 2, y - h],
              [x + 7, y - h - 6],
              [x + 26, y - h - 6],
              [x + 19, y - h],
            ],
            "#36c1f4",
          );
          for (let row = 0; row < Math.floor(h / 10); row++)
            for (let col = 0; col < 2; col++)
              polygon(
                c,
                [
                  [x + 3 + col * 8, y - h + 5 + row * 10],
                  [x + 7 + col * 8, y - h + 5 + row * 10],
                  [x + 7 + col * 8, y - h + 11 + row * 10],
                  [x + 3 + col * 8, y - h + 11 + row * 10],
                ],
                "#087bbe",
              );
        }
        line(
          c,
          [
            [173, 27],
            [173, 5],
          ],
          "#fff4cc",
          2,
        );
        polygon(
          c,
          [
            [174, 5],
            [190, 8],
            [187, 14],
            [191, 19],
            [174, 16],
          ],
          "#ff483c",
        );
        line(
          c,
          [
            [175, 6],
            [185, 8],
          ],
          "#ffb184",
          1.4,
        );
        tree(127, 64, 0.66);
        tree(239, 71, 0.7);
        for (const [x, y] of [
          [27, 139],
          [319, 141],
          [38, 196],
          [307, 200],
        ]) {
          polygon(
            c,
            [
              [x - 10, y],
              [x + 9, y + 4],
              [x + 19, y - 4],
              [x + 19, y + 18],
              [x + 7, y + 25],
              [x - 10, y + 20],
            ],
            "#c18d52",
          );
          polygon(
            c,
            [
              [x - 10, y],
              [x + 1, y - 7],
              [x + 19, y - 4],
              [x + 9, y + 4],
            ],
            "#a0ea36",
          );
          line(
            c,
            [
              [x + 7, y + 5],
              [x + 7, y + 23],
            ],
            "#e6b775",
            1,
          );
          tree(x + 1, y, 0.77);
        }
      }
      const word = (
        str: string,
        startX: number,
        y: number,
        scale: number,
        gold: boolean,
      ) => {
        let x = startX;
        for (const [i, ch] of [...str].entries()) {
          const letter = LETTERS[ch],
            w = Math.max(...letter.edge.map((p) => p[0]));
          c.save();
          const t = i - (str.length - 1) / 2;
          c.translate(x + (w * scale) / 2, y + 36 * scale + Math.abs(t) * 1.9);
          c.rotate(t * (home ? 0.055 : 0.027));
          c.scale(scale, scale);
          c.translate(-w / 2, -36);
          const path = new Path2D();
          for (const points of [letter.edge, ...(letter.holes ?? [])]) {
            points.forEach(([px, py], j) =>
              j ? path.lineTo(px, py) : path.moveTo(px, py),
            );
            path.closePath();
          }
          c.lineJoin = "round";
          // Deep navy outline and a blue, offset extrusion connect the letters.
          for (let d = 11; d >= 0; d--) {
            c.save();
            c.translate(-d * 0.36, d);
            c.lineWidth = 12;
            c.strokeStyle = d > 8 ? "#031c4d" : "#0645a4";
            c.stroke(path);
            c.fillStyle = gold ? "#ec7506" : "#0676c1";
            c.fill(path, "evenodd");
            c.restore();
          }
          // A warm visible side wall gives CITY its own orange extrusion inside
          // the shared navy silhouette, rather than flattening it into the outline.
          if (gold) {
            c.save();
            c.translate(-1.5, 5);
            c.lineWidth = 3;
            c.strokeStyle = "#b95406";
            c.stroke(path);
            c.fillStyle = gradient(c, 0, 80, "#ffb514", "#f17805");
            c.fill(path, "evenodd");
            c.restore();
          }
          c.strokeStyle = gold ? "#b76308" : "#052962";
          c.lineWidth = gold ? 2.5 : 7;
          c.stroke(path);
          c.fillStyle = gradient(
            c,
            0,
            72,
            gold ? "#fff833" : "#ffffff",
            gold ? "#ffc508" : "#cef3ff",
          );
          c.fill(path, "evenodd");
          c.save();
          c.clip(path, "evenodd");
          c.strokeStyle = gold ? "#ffcd24" : "#91e6fb";
          c.lineWidth = gold ? 10 : 8;
          c.stroke(path);
          // Directional bevel edges follow each custom letter outline and counter.
          for (const points of [letter.edge, ...(letter.holes ?? [])])
            points.forEach((a, j) => {
              const b = points[(j + 1) % points.length];
              line(
                c,
                [a, b],
                b[0] > a[0]
                  ? gold
                    ? "#fff9a0"
                    : "#ffffff"
                  : gold
                    ? "#e98b07"
                    : "#3bc6ef",
                3.6,
              );
            });
          if (!gold) {
            polygon(
              c,
              [
                [0, 52],
                [16, 46],
                [34, 58],
                [w, 46],
                [w, 72],
                [0, 72],
              ],
              "#5acfed38",
            );
            polygon(
              c,
              [
                [0, 72],
                [16, 46],
                [28, 72],
              ],
              "#f0ffff77",
            );
            polygon(
              c,
              [
                [w, 48],
                [w - 16, 62],
                [w, 72],
              ],
              "#1dc2e94d",
            );
          } else
            polygon(
              c,
              [
                [0, 43],
                [w, 34],
                [w, 65],
                [0, 72],
              ],
              "#ffa50030",
            );
          c.restore();
          c.restore();
          x += (w + 9) * scale;
        }
      };
      word("BLOCK", 17, home ? 61 : 10, 1.01, false);
      word("CITY", 56, home ? 149 : 97, 1.055, true);
      if (home) {
        for (const [x, y] of [
          [31, 80],
          [290, 66],
          [276, 219],
        ]) {
          line(
            c,
            [
              [x - 5, y],
              [x + 5, y],
            ],
            "#e5ffff",
            1.4,
          );
          line(
            c,
            [
              [x, y - 6],
              [x, y + 6],
            ],
            "#ffffff",
            1.4,
          );
        }
      }
    },
  );
}

export function BlockCityLogo(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width = 360,
  variant: "main" | "compact" | "home" = "main",
) {
  const root = scene.add.container(x, y);
  const home = variant === "home";
  root.add(
    scene.add
      .image(0, 0, logoTexture(scene, home))
      .setDisplaySize(width, (width * (home ? 244 : 190)) / 366),
  );
  if (variant === "main")
    root.add(Tagline(scene, 0, width * 0.255, width * 0.61));
  return root;
}
export function Tagline(
  scene: Phaser.Scene,
  x: number,
  y: number,
  width = 220,
) {
  const key = cachedCanvas(scene, "ui-brand-tagline", 300, 58, (c) => {
    const p = new Path2D(
      "M15 13 Q150 -5 285 13 Q297 15 291 31 L285 45 Q283 53 271 50 Q150 33 29 50 Q17 53 15 45 L9 28 Q5 15 15 13 Z",
    );
    c.save();
    c.translate(0, 4);
    c.fillStyle = hex(COLORS.ink);
    c.fill(p);
    c.restore();
    c.lineWidth = 3;
    c.strokeStyle = "#0387f7";
    c.fillStyle = gradient(c, 0, 52, "#08d4ff", "#0056ed");
    c.stroke(p);
    c.fill(p);
    line(
      c,
      [
        [17, 17],
        [58, 11],
        [108, 7],
        [160, 6],
        [218, 10],
        [281, 17],
      ],
      "#a1ffff",
      2,
    );
    c.font = `bold 23px ${UI.font}`;
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.strokeStyle = "#064aaf";
    c.lineWidth = 3;
    c.strokeText("Build • Puzzle • Grow", 150, 28);
    c.fillStyle = "#ffffff";
    c.fillText("Build • Puzzle • Grow", 150, 27);
    for (const px of [99, 204]) {
      c.beginPath();
      c.arc(px, 28, 3.4, 0, Math.PI * 2);
      c.fillStyle = "#ffdb24";
      c.fill();
    }
  });
  return scene.add.image(x, y, key).setDisplaySize(width, (width * 58) / 300);
}
