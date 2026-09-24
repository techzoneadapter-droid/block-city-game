import Phaser from "phaser";
import { cachedCanvas } from "../ui/art";

/** Original moving harbor props, rasterized once and shared across Home visits. */
type C = CanvasRenderingContext2D;
type P = [number, number];
type Paint = string | CanvasGradient;
const TAU = Math.PI * 2;
function poly(c: C, p: P[], fill: Paint, stroke?: string, width = 0.6) {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke();
  }
}
function line(c: C, p: P[], color: string, width = 1) {
  c.beginPath();
  p.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.stroke();
}
function ellipse(
  c: C,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: Paint,
) {
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, TAU);
  c.fillStyle = color;
  c.fill();
}
function grad(c: C, x: number, y: number, h: number, a: string, b: string) {
  const g = c.createLinearGradient(x, y, x + h * 0.3, y + h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
function mix(hex: string, amount: number) {
  const n = parseInt(hex.slice(1), 16),
    target = amount < 0 ? 0 : 255,
    t = Math.abs(amount);
  return (
    "#" +
    [n >> 16, (n >> 8) & 255, n & 255]
      .map((v) =>
        Math.round(v + (target - v) * t)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}
export const HARBOR_WHEEL = { x: 323, y: 475, size: 118 };

export function boatTexture(scene: Phaser.Scene, yacht = false) {
  return cachedCanvas(scene, `home-boat-${yacht}`, 90, 95, (c) => {
    ellipse(c, 46, 80, 37, 7, "#055b9250");
    line(
      c,
      [
        [4, 80],
        [19, 87],
        [61, 88],
        [84, 79],
      ],
      "#c2ffff",
      1.5,
    );
    poly(
      c,
      [
        [9, 68],
        [66, 74],
        [82, 65],
        [72, 81],
        [60, 85],
        [19, 77],
      ],
      grad(c, 0, 68, 20, "#fffff0", "#a3c9d8"),
      "#387eb1",
      0.8,
    );
    poly(
      c,
      [
        [9, 68],
        [22, 61],
        [82, 65],
        [66, 74],
      ],
      "#f8d68c",
    );
    line(
      c,
      [
        [14, 73],
        [61, 81],
        [75, 74],
      ],
      "#0b63a4",
      2,
    );
    line(
      c,
      [
        [14, 70],
        [61, 78],
        [79, 69],
      ],
      "#ffffff",
      1.3,
    );
    for (let i = 0; i < 6; i++)
      ellipse(c, 23 + i * 6, 76 + i * 0.65, 1.2, 1.1, "#164e7d");
    line(
      c,
      [
        [8, 83],
        [22, 89],
        [56, 91],
      ],
      "#ecffffaa",
      1,
    );
    for (let i = 0; i < 5; i++)
      line(
        c,
        [
          [7 - i * 2, 77 + i * 2],
          [13 - i * 2, 78 + i * 2],
        ],
        "#ffffff77",
        0.6,
      );
    if (yacht) {
      poly(
        c,
        [
          [25, 62],
          [59, 68],
          [60, 52],
          [26, 47],
        ],
        "#f8ffff",
      );
      poly(
        c,
        [
          [59, 68],
          [74, 61],
          [74, 46],
          [60, 52],
        ],
        "#b2d7e0",
      );
      poly(
        c,
        [
          [21, 46],
          [38, 39],
          [77, 45],
          [60, 53],
        ],
        "#ffffff",
      );
      for (let i = 0; i < 4; i++)
        poly(
          c,
          [
            [28 + i * 7, 51 + i],
            [32 + i * 7, 52 + i],
            [32 + i * 7, 59 + i],
            [28 + i * 7, 58 + i],
          ],
          "#095c99",
        );
      poly(
        c,
        [
          [41, 41],
          [59, 44],
          [59, 33],
          [42, 30],
        ],
        "#fffef2",
      );
      poly(
        c,
        [
          [59, 44],
          [68, 39],
          [68, 28],
          [59, 33],
        ],
        "#a4d7e0",
      );
      poly(
        c,
        [
          [38, 30],
          [50, 25],
          [70, 28],
          [59, 34],
        ],
        "#ffffff",
      );
      line(
        c,
        [
          [53, 27],
          [53, 11],
        ],
        "#fff8d6",
        1.5,
      );
      poly(
        c,
        [
          [53, 12],
          [63, 14],
          [53, 17],
        ],
        "#ffbf28",
      );
      for (let i = 0; i < 2; i++)
        poly(
          c,
          [
            [45 + i * 7, 33 + i],
            [49 + i * 7, 34 + i],
            [49 + i * 7, 39 + i],
            [45 + i * 7, 38 + i],
          ],
          "#1076ad",
        );
      poly(
        c,
        [
          [62, 35],
          [66, 33],
          [66, 38],
          [62, 40],
        ],
        "#095f93",
      );
      for (let i = 0; i < 6; i++)
        line(
          c,
          [
            [24 + i * 7, 46 + i * 0.9],
            [24 + i * 7, 41 + i * 0.9],
          ],
          "#fffdf4",
          0.8,
        );
      line(
        c,
        [
          [24, 41],
          [64, 46],
          [76, 40],
        ],
        "#fcffff",
        0.9,
      );
      for (let i = 0; i < 3; i++)
        line(
          c,
          [
            [65 + i * 5, 48 - i * 2],
            [65 + i * 5, 44 - i * 2],
          ],
          "#ffffff",
          0.8,
        );
      line(
        c,
        [
          [61, 65],
          [71, 60],
        ],
        "#0b72a2",
        1.2,
      );
      ellipse(c, 24, 69, 3, 3, "#f3523c");
      ellipse(c, 24, 69, 1.4, 1.4, "#fff3cc");
      poly(
        c,
        [
          [31, 64],
          [42, 66],
          [44, 62],
          [33, 60],
        ],
        "#ffaa25",
      );
    } else {
      line(
        c,
        [
          [45, 69],
          [45, 7],
        ],
        "#fff7d5",
        2,
      );
      poly(
        c,
        [
          [42, 13],
          [17, 59],
          [42, 63],
        ],
        grad(c, 20, 15, 50, "#ffffff", "#d7f2f2"),
        "#ffffff",
        0.8,
      );
      poly(
        c,
        [
          [49, 21],
          [69, 64],
          [49, 64],
        ],
        "#ff543b",
      );
      poly(
        c,
        [
          [49, 37],
          [61, 62],
          [49, 61],
        ],
        "#fff7da",
      );
      poly(
        c,
        [
          [41, 14],
          [35, 28],
          [41, 29],
        ],
        "#fd6247",
      );
      line(
        c,
        [
          [42, 15],
          [42, 63],
          [20, 60],
        ],
        "#ffffff",
        1.1,
      );
      line(
        c,
        [
          [43, 16],
          [68, 68],
        ],
        "#b4a98b",
        0.45,
      );
      line(
        c,
        [
          [45, 8],
          [14, 67],
        ],
        "#c7c2a1",
        0.5,
      );
      line(
        c,
        [
          [45, 61],
          [65, 64],
        ],
        "#934d2c",
        1.3,
      );
      poly(
        c,
        [
          [25, 65],
          [37, 67],
          [36, 72],
          [24, 70],
        ],
        "#ce5132",
      );
      for (let i = 0; i < 5; i++)
        line(
          c,
          [
            [21 + i * 9, 74 + i * 0.8],
            [21 + i * 9, 70 + i * 0.8],
          ],
          "#fffdf1",
          0.6,
        );
      line(
        c,
        [
          [19, 70],
          [65, 75],
          [77, 68],
        ],
        "#fffae3",
        0.8,
      );
    }
  });
}
export function wheelRimTexture(scene: Phaser.Scene) {
  return cachedCanvas(scene, "home-ferris-rim", 120, 120, (c) => {
    // The offset rear rim, cross braces and bright front rim give the frame depth.
    c.beginPath();
    c.arc(62, 61, 48, 0, TAU);
    c.strokeStyle = "#3666b6";
    c.lineWidth = 4;
    c.stroke();
    for (const r of [48, 42]) {
      c.beginPath();
      c.arc(60, 60, r, 0, TAU);
      c.strokeStyle = r === 48 ? "#fffaee" : "#b8e5fc";
      c.lineWidth = r === 48 ? 3 : 1.3;
      c.stroke();
    }
    for (let i = 0; i < 16; i++) {
      const a = (i * TAU) / 16,
        b = ((i + 1) * TAU) / 16;
      line(
        c,
        [
          [60, 60],
          [60 + 48 * Math.cos(a), 60 + 48 * Math.sin(a)],
        ],
        "#8ea8d9",
        3,
      );
      line(
        c,
        [
          [59.5, 59.5],
          [59.5 + 48 * Math.cos(a), 59.5 + 48 * Math.sin(a)],
        ],
        "#fff9ed",
        1.6,
      );
      line(
        c,
        [
          [60 + 42 * Math.cos(a), 60 + 42 * Math.sin(a)],
          [60 + 48 * Math.cos(b), 60 + 48 * Math.sin(b)],
        ],
        "#ffe6ef",
        0.7,
      );
    }
  });
}
export function cabinTexture(scene: Phaser.Scene, color: string) {
  return cachedCanvas(scene, `home-ferris-cabin-${color}`, 14, 16, (c) => {
    line(
      c,
      [
        [7, 1],
        [7, 5],
      ],
      "#ffffff",
      1,
    );
    poly(
      c,
      [
        [1, 5],
        [13, 5],
        [12, 13],
        [9, 15],
        [2, 13],
      ],
      grad(c, 0, 4, 11, mix(color, 0.3), color),
      "#ffffff",
      0.7,
    );
    poly(
      c,
      [
        [3, 5],
        [11, 5],
        [10, 10],
        [3, 10],
      ],
      "#ddf8ff",
    );
    line(
      c,
      [
        [7, 5],
        [7, 11],
      ],
      "#ffffff",
      0.7,
    );
  });
}
export function wheelHubTexture(scene: Phaser.Scene) {
  return cachedCanvas(scene, "home-ferris-hub", 26, 28, (c) => {
    ellipse(c, 13, 15, 12, 12, "#d39a16");
    ellipse(c, 12, 13, 11, 11, grad(c, 0, 0, 25, "#fff15e", "#ffbc0a"));
    ellipse(c, 8.5, 11, 1.2, 2, "#794322");
    ellipse(c, 15.5, 11, 1.2, 2, "#794322");
    c.beginPath();
    c.arc(12, 14, 5, 0.1 * Math.PI, 0.9 * Math.PI);
    c.strokeStyle = "#8b4921";
    c.lineWidth = 1.5;
    c.stroke();
  });
}
