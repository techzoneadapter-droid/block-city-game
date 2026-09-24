import Phaser from "phaser";

// Original Home art. All geometry is authored in logical pixels and rasterized at
// 3× once; no image sheets, cutouts, network fonts or per-frame canvas redraws.
type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
const NAVY = "#06376a";
function polygon(
  c: Ctx,
  points: Point[],
  color: string,
  stroke?: string,
  width = 1,
) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.closePath();
  c.fillStyle = color;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.lineJoin = "round";
    c.stroke();
  }
}
function rect(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
  r = 0,
) {
  c.fillStyle = color;
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fill();
}
function ellipse(
  c: Ctx,
  x: number,
  y: number,
  rx: number,
  ry: number,
  color: string,
) {
  c.fillStyle = color;
  c.beginPath();
  c.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  c.fill();
}
function line(c: Ctx, points: Point[], color: string, width = 1) {
  c.beginPath();
  points.forEach(([x, y], i) => (i ? c.lineTo(x, y) : c.moveTo(x, y)));
  c.strokeStyle = color;
  c.lineWidth = width;
  c.lineJoin = "round";
  c.lineCap = "round";
  c.stroke();
}
function gradient(c: Ctx, y: number, h: number, a: string, b: string) {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, a);
  g.addColorStop(1, b);
  return g;
}
function label(
  c: Ctx,
  t: string,
  x: number,
  y: number,
  size: number,
  color: string,
) {
  c.font = `900 ${size}px "Arial", sans-serif`;
  c.textAlign = "center";
  c.textBaseline = "middle";
  c.fillStyle = color;
  c.fillText(t, x, y);
}
function texture(
  scene: Phaser.Scene,
  key: string,
  w: number,
  h: number,
  draw: (c: Ctx) => void,
) {
  if (scene.textures.exists(key)) return key;
  const t = scene.textures.createCanvas(key, w * 3, h * 3)!;
  const c = t.context;
  c.scale(3, 3);
  draw(c);
  t.refresh();
  return key;
}
// Oblique solid: lit front, shaded right face, bright top; consistent sunlight.
function cube(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number,
  front: string,
  side: string,
  top: string,
) {
  c.fillStyle = gradient(c, y - h, h, front, front);
  c.fillRect(x, y - h, w, h);
  polygon(
    c,
    [
      [x + w, y - h],
      [x + w + d, y - h - d * 0.55],
      [x + w + d, y - d * 0.55],
      [x + w, y],
    ],
    side,
  );
  polygon(
    c,
    [
      [x, y - h],
      [x + d, y - h - d * 0.55],
      [x + w + d, y - h - d * 0.55],
      [x + w, y - h],
    ],
    top,
  );
  line(
    c,
    [
      [x, y - h],
      [x + w, y - h],
      [x + w + d, y - h - d * 0.55],
    ],
    "rgba(255,255,255,.5)",
    0.65,
  );
}
function tree(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 4, 1, 12, 4, "#217d6440");
  cube(c, -2, 0, 4, 17, 3, "#a35c28", "#714120", "#d39843");
  cube(c, -11, -13, 12, 13, 8, "#3dba26", "#167c36", "#b8ed40");
  cube(c, 0, -19, 11, 14, 7, "#59cc23", "#238b32", "#c6f044");
  cube(c, -5, -27, 10, 11, 7, "#79dc2b", "#28a22c", "#d2f961");
  c.restore();
}
function palm(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  line(
    c,
    [
      [0, 0],
      [2, -18],
      [-1, -34],
    ],
    "#8d6034",
    4,
  );
  for (const [dx, dy] of [
    [-23, 1],
    [-17, -13],
    [0, -17],
    [21, -8],
    [23, 8],
  ])
    polygon(
      c,
      [
        [0, -34],
        [dx * 0.65, -38 + dy],
        [dx, -28 + dy],
        [dx * 0.5, -30 + dy * 0.3],
      ],
      dx < 0 ? "#5dca28" : "#239f36",
    );
  c.restore();
}
function building(
  c: Ctx,
  x: number,
  y: number,
  w: number,
  h: number,
  d: number,
  color: string,
  kind = "apartment",
) {
  ellipse(c, x + w * 0.65, y + 3, w * 0.8, 8, "#04557735");
  cube(c, x - 2, y + 3, w + 4, 5, d + 2, "#fff0c2", "#c7ae88", "#fffbdc");
  cube(
    c,
    x,
    y,
    w,
    h,
    d,
    color,
    kind === "office" ? "#0875b1" : "#c58e5d",
    "#fff0cb",
  );
  c.fillStyle = gradient(c, y - h, h, "#fff8d52b", "#d8811919");
  c.fillRect(x, y - h, w, h);
  rect(c, x, y - h, 2, h, "#fff6d5");
  rect(c, x + w - 2, y - h, 2, h, "#dfac7255");
  for (let row = 0; row < Math.floor((h - 12) / 16); row++) {
    const yy = y - h + 9 + row * 16;
    for (let col = 0; col < Math.max(2, Math.floor(w / 13)); col++) {
      const xx = x + 5 + col * 13;
      rect(c, xx - 1, yy - 1, 9, 12, "#ffefc6");
      rect(c, xx, yy, 7, 9, "#086ba8");
      rect(c, xx + 1, yy + 1, 3, 6, "#46d8ff");
      line(
        c,
        [
          [xx + 1, yy + 6],
          [xx + 6, yy + 2],
        ],
        "#b3f6ff",
        0.65,
      );
      rect(c, xx - 2, yy + 10, 11, 2, "#fff9df");
    }
    polygon(
      c,
      [
        [x + w + 3, yy - 2],
        [x + w + d - 3, yy - d * 0.55 + 1],
        [x + w + d - 3, yy - d * 0.55 + 10],
        [x + w + 3, yy + 7],
      ],
      "#237d9e",
    );
    line(
      c,
      [
        [x + w + 4, yy - 1],
        [x + w + 4, yy + 6],
      ],
      "#79dcf0",
      1.5,
    );
  }
  rect(c, x + w * 0.42, y - 14, 10, 14, "#07618e");
  rect(c, x + w * 0.46, y - 12, 3, 9, "#77dafa");
  cube(c, x - 3, y - h + 1, w + 6, 5, d + 1, "#fff9dc", "#e0cca4", "#fffce7");
  cube(c, x + 2, y - h - 4, w - 3, 5, d - 1, "#087dbd", "#095492", "#32bfff");
  polygon(
    c,
    [
      [x + 5, y - h - 5],
      [x + d + 1, y - h - d * 0.55 - 4],
      [x + w + d - 5, y - h - d * 0.55 - 4],
      [x + w - 3, y - h - 5],
    ],
    "#128ccd",
  );
  cube(c, x + 7, y - h - 7, 7, 3, 5, "#b2e5e5", "#3a8fa8", "#f4ffef");
  if (kind === "cafe") {
    for (let i = 0; i < 6; i++) {
      const xx = x - 3 + (i * (w + 6)) / 6;
      polygon(
        c,
        [
          [xx, y - 23],
          [xx + (w + 6) / 6, y - 23],
          [xx + (w + 6) / 6 - 3, y - 13],
          [xx - 3, y - 13],
        ],
        i % 2 ? "#fff8df" : "#f64f43",
      );
      rect(c, xx - 3, y - 13, (w + 6) / 6, 4, i % 2 ? "#f9e5c1" : "#d63c39", 1);
    }
    rect(c, x + 5, y - 35, w - 10, 9, "#075885", 2);
    label(c, "CAFÉ", x + w / 2, y - 30, 6, "#fff3b8");
  }
  if (kind === "office") {
    cube(
      c,
      x + w * 0.35,
      y - h - 8,
      10,
      12,
      7,
      "#daf9f4",
      "#75a5a9",
      "#ffffff",
    );
    line(
      c,
      [
        [x + w * 0.5, y - h - 20],
        [x + w * 0.5, y - h - 32],
      ],
      "#fff5c6",
      1.5,
    );
    polygon(
      c,
      [
        [x + w * 0.5, y - h - 32],
        [x + w * 0.5 + 13, y - h - 29],
        [x + w * 0.5, y - h - 25],
      ],
      "#ff543c",
    );
  }
}
function lighthouse(c: Ctx, x: number, y: number, s = 1) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  cube(c, -9, 0, 18, 52, 10, "#fffce4", "#b8d9cf", "#ffffff");
  cube(c, -9, -32, 18, 7, 10, "#ff6450", "#cc3436", "#ff9b6a");
  rect(c, -3, -17, 5, 10, "#258db5");
  cube(c, -12, -51, 24, 5, 11, "#fb5844", "#b53035", "#ff9770");
  cube(c, -6, -57, 12, 12, 8, "#46d5ed", "#167ab6", "#fff4b9");
  polygon(
    c,
    [
      [-14, -69],
      [1, -85],
      [21, -75],
      [12, -64],
    ],
    "#ff573d",
  );
  line(
    c,
    [
      [1, -85],
      [1, -91],
    ],
    "#fff5d3",
    2,
  );
  c.restore();
}
function boat(c: Ctx, x: number, y: number, s = 1, yacht = false) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  ellipse(c, 1, 8, 27, 6, "#046bad40");
  line(
    c,
    [
      [-35, 8],
      [-23, 12],
      [5, 13],
      [28, 7],
    ],
    "#a1fbff",
    1.5,
  );
  polygon(
    c,
    [
      [-25, 0],
      [17, 0],
      [28, -8],
      [25, 6],
      [12, 12],
      [-18, 8],
    ],
    "#f4fbe8",
  );
  polygon(
    c,
    [
      [-25, 0],
      [-18, 8],
      [12, 12],
      [12, 7],
      [-19, 3],
    ],
    "#8bc4cf",
  );
  line(
    c,
    [
      [-22, 4],
      [13, 9],
      [25, 3],
    ],
    "#1761a0",
    2,
  );
  polygon(
    c,
    [
      [-25, 0],
      [-11, -8],
      [28, -8],
      [17, 0],
    ],
    "#ffe5a1",
  );
  if (yacht) {
    cube(c, -14, -3, 28, 8, 9, "#f8ffff", "#add7dc", "#ffffff");
    cube(c, -5, -12, 15, 7, 6, "#f4ffff", "#a1cbd4", "#ffffff");
    for (let i = 0; i < 4; i++) rect(c, -11 + i * 7, -10, 4, 5, "#095f99");
    line(
      c,
      [
        [7, -22],
        [7, -32],
      ],
      "#eeffff",
      1.5,
    );
  } else {
    line(
      c,
      [
        [1, -3],
        [1, -52],
      ],
      "#fff9d8",
      1.8,
    );
    polygon(
      c,
      [
        [-1, -48],
        [-20, -8],
        [-1, -8],
      ],
      "#fffcdf",
    );
    polygon(
      c,
      [
        [4, -43],
        [19, -12],
        [4, -12],
      ],
      "#fc5543",
    );
    polygon(
      c,
      [
        [-1, -40],
        [-8, -25],
        [-1, -25],
      ],
      "#ff6046",
    );
  }
  c.restore();
}
function cloud(c: Ctx, x: number, y: number, s: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  polygon(
    c,
    [
      [0, 15],
      [12, 15],
      [12, 0],
      [28, 0],
      [28, -12],
      [48, -12],
      [48, 4],
      [67, 4],
      [67, 16],
      [85, 16],
      [85, 31],
      [0, 31],
    ],
    "#effcff",
  );
  polygon(
    c,
    [
      [0, 31],
      [85, 31],
      [97, 24],
      [85, 17],
      [85, 25],
      [0, 25],
    ],
    "#c9edff",
  );
  rect(c, 29, -10, 17, 12, "#fffef5");
  c.restore();
}

export function coastTexture(scene: Phaser.Scene) {
  return texture(scene, "home-original-coast", 390, 844, (c) => {
    c.fillStyle = gradient(c, 0, 400, "#009bfa", "#b4f2ff");
    c.fillRect(0, 0, 390, 844);
    // Sunlit block clouds and hazy islands frame, rather than cross, the logo.
    cloud(c, -33, 157, 0.9);
    cloud(c, 299, 172, 1.05);
    cloud(c, 12, 294, 0.5);
    cloud(c, 246, 325, 0.6);
    c.fillStyle = gradient(c, 344, 500, "#25c9f0", "#007fc7");
    c.fillRect(0, 344, 390, 500);
    for (let i = 0; i < 95; i++) {
      const x = ((i * 83.31) % 410) - 10,
        y = 355 + ((i * 41.17) % 350);
      line(
        c,
        [
          [x, y],
          [x + 5 + (i % 13), y],
        ],
        i % 3 ? "#84edee66" : "#e3ffffaa",
        i % 3 ? 1 : 1.5,
      );
    }
    // Shallow-water facets and sun flecks follow the harbor perspective.
    for (let row = 0; row < 25; row++)
      for (let col = 0; col < 16; col++) {
        const x = col * 29 + (row % 2) * 14 - 25,
          y = 355 + row * 13;
        const colors = [
          "#22d6f022",
          "#0690d033",
          "#8cf6ee35",
          "#006cb01a",
          "#75f3ee22",
        ];
        polygon(
          c,
          [
            [x, y],
            [x + 18, y - 5],
            [x + 31, y + 1],
            [x + 12, y + 7],
          ],
          colors[(row * 7 + col * 3) % 5],
        );
      }
    // Distant cliff terraces, with alternating sandstone faces.
    for (const [x, y, w, h] of [
      [-18, 380, 32, 50],
      [8, 386, 35, 38],
      [34, 377, 22, 26],
      [329, 373, 32, 53],
      [361, 388, 38, 70],
      [308, 368, 22, 29],
    ]) {
      cube(c, x, y, w, h, 15, "#e8e4b8", "#98bbb2", "#83cd5b");
      cube(
        c,
        x + 4,
        y - 6,
        w * 0.28,
        h * 0.65,
        5,
        "#c8d6b3",
        "#93b6ad",
        "#bae38a",
      );
      tree(c, x + 12, y - h, 0.55);
    }
    for (const [x, y, s] of [
      [2, 338, 0.55],
      [23, 352, 0.45],
      [36, 348, 0.5],
      [334, 331, 0.45],
      [367, 324, 0.7],
      [382, 334, 0.55],
    ])
      tree(c, x, y, s);
    lighthouse(c, 350, 324, 0.53);
    // Miniature green islands brace the wordmark, as an original sculpted crest.
    cube(c, 25, 289, 24, 19, 14, "#d4a76c", "#9e7550", "#a9e847");
    tree(c, 33, 271, 0.62);
    cube(c, 337, 291, 24, 20, 14, "#d4a76c", "#9e7550", "#a9e847");
    tree(c, 343, 273, 0.67);
    cloud(c, 77, 126, 0.46);
    cloud(c, 253, 106, 0.4);
    building(c, 164, 157, 16, 27, 9, "#ffdc8b");
    building(c, 187, 158, 17, 25, 8, "#fff2c4");
    tree(c, 149, 153, 0.5);
    tree(c, 221, 154, 0.63);
    for (let i = 0; i < 6; i++)
      cube(
        c,
        64 + i * 18,
        364,
        12,
        18 + (i % 3) * 10,
        5,
        "#a1d6cf",
        "#83bac9",
        "#d5f0d6",
      );
    boat(c, 263, 365, 0.4);
    boat(c, 67, 401, 0.44);
    // Harbor island: stepped sea wall, continuous promenade, and planned streets.
    polygon(
      c,
      [
        [116, 408],
        [282, 395],
        [400, 480],
        [376, 549],
        [234, 594],
        [71, 514],
      ],
      "#087bb5",
    );
    polygon(
      c,
      [
        [111, 399],
        [281, 389],
        [403, 472],
        [376, 536],
        [235, 581],
        [64, 506],
      ],
      "#bb9471",
    );
    polygon(
      c,
      [
        [64, 490],
        [235, 565],
        [235, 581],
        [64, 506],
      ],
      "#debc8c",
    );
    polygon(
      c,
      [
        [235, 565],
        [376, 520],
        [376, 536],
        [235, 581],
      ],
      "#9f8c70",
    );
    polygon(
      c,
      [
        [111, 391],
        [281, 381],
        [403, 465],
        [376, 520],
        [235, 565],
        [64, 490],
      ],
      "#fff0c3",
    );
    polygon(
      c,
      [
        [121, 400],
        [278, 392],
        [386, 466],
        [366, 507],
        [234, 550],
        [80, 487],
      ],
      "#8dcb65",
    );
    polygon(
      c,
      [
        [112, 419],
        [132, 408],
        [355, 506],
        [333, 516],
      ],
      "#648596",
    );
    polygon(
      c,
      [
        [99, 475],
        [115, 485],
        [302, 416],
        [287, 407],
      ],
      "#648596",
    );
    line(
      c,
      [
        [122, 415],
        [344, 511],
      ],
      "#fef8d4",
      1,
    );
    line(
      c,
      [
        [111, 479],
        [294, 413],
      ],
      "#fef8d4",
      1,
    );
    // The eastern park: paths, flower beds and a red-roof pavilion.
    polygon(
      c,
      [
        [310, 426],
        [359, 448],
        [345, 460],
        [297, 438],
      ],
      "#d9ee8b",
    );
    for (const [x, y] of [
      [315, 437],
      [350, 450],
      [365, 472],
    ]) {
      cube(c, x, y, 8, 4, 6, "#cc9a59", "#9a7749", "#8ada33");
      rect(c, x + 2, y - 7, 3, 3, "#ff6d85");
      rect(c, x + 5, y - 6, 3, 3, "#ffdc50");
    }
    tree(c, 325, 437, 0.7);
    tree(c, 350, 451, 0.64);
    building(c, 292, 431, 23, 24, 13, "#fff0ba");
    polygon(
      c,
      [
        [289, 405],
        [303, 386],
        [330, 391],
        [318, 408],
      ],
      "#fc6546",
    );
    polygon(
      c,
      [
        [318, 408],
        [330, 391],
        [330, 402],
        [320, 414],
      ],
      "#c43d30",
    );
    for (let i = 0; i < 4; i++)
      line(
        c,
        [
          [294 + i * 6, 404],
          [308 + i * 6, 389],
        ],
        "#ffae66",
        0.8,
      );
    // Back row and focal tower.
    tree(c, 145, 418, 0.74);
    building(c, 168, 427, 32, 62, 16, "#ffd082");
    building(c, 215, 415, 31, 94, 16, "#fff3c7", "office");
    building(c, 263, 436, 29, 50, 15, "#ffb99c");
    tree(c, 112, 444, 0.85);
    building(c, 125, 457, 32, 57, 17, "#ffcd7b", "cafe");
    building(c, 183, 465, 35, 105, 18, "#ffedba", "office");
    // Ferris wheel supports are behind its separately animated rotating structure.
    line(
      c,
      [
        [308, 467],
        [288, 523],
      ],
      "#236b9f",
      7,
    );
    line(
      c,
      [
        [308, 467],
        [333, 518],
      ],
      "#236b9f",
      7,
    );
    line(
      c,
      [
        [307, 467],
        [287, 520],
      ],
      "#fff7d4",
      4,
    );
    line(
      c,
      [
        [309, 467],
        [332, 516],
      ],
      "#fff7d4",
      4,
    );
    cube(c, 281, 526, 54, 5, 10, "#f5dca7", "#bd986a", "#fff4ca");
    // A waterfront arcade adds a layered, walkable neighborhood.
    building(c, 88, 451, 23, 32, 13, "#fff0b4", "cafe");
    tree(c, 85, 456, 0.62);
    building(c, 244, 476, 23, 37, 13, "#ffbb83");
    // Front row: lower warm buildings keep the skyline and wheel legible.
    building(c, 99, 490, 28, 42, 16, "#ffe4a0");
    building(c, 145, 512, 34, 53, 18, "#ffd27d", "cafe");
    building(c, 222, 526, 36, 55, 19, "#ffe2a2", "cafe");
    // Café terraces, a kiosk, and parasols give streets a lived-in scale.
    for (const [x, y] of [
      [204, 502],
      [211, 543],
      [345, 504],
    ]) {
      ellipse(c, x, y + 1, 9, 3, "#006c7733");
      line(
        c,
        [
          [x, y],
          [x, y - 13],
        ],
        "#a0783b",
        1.5,
      );
      polygon(
        c,
        [
          [x - 10, y - 11],
          [x, y - 17],
          [x + 10, y - 11],
          [x, y - 7],
        ],
        "#fff4bb",
      );
      polygon(
        c,
        [
          [x, y - 17],
          [x + 10, y - 11],
          [x, y - 7],
        ],
        "#ff6850",
      );
      rect(c, x - 6, y + 2, 3, 3, "#df9852");
      rect(c, x + 4, y - 1, 3, 3, "#df9852");
    }
    tree(c, 84, 486, 0.7);
    tree(c, 197, 529, 0.85);
    tree(c, 271, 534, 0.76);
    palm(c, 344, 509, 0.8);
    palm(c, 372, 487, 0.85);
    tree(c, 157, 537, 0.62);
    // Rooftop gardens.
    tree(c, 272, 383, 0.42);
    tree(c, 151, 398, 0.4);
    // Promenade rail and tiny original citizens / lamps.
    line(
      c,
      [
        [66, 486],
        [235, 560],
        [375, 515],
      ],
      "#fff9db",
      2,
    );
    for (let i = 0; i < 15; i++) {
      const x = 69 + i * 11,
        y = 487 + i * 4.86;
      line(
        c,
        [
          [x, y],
          [x, y - 8],
        ],
        "#fbf4dc",
        1.5,
      );
    }
    for (let i = 0; i < 12; i++) {
      const x = 238 + i * 12,
        y = 559 - i * 3.85;
      line(
        c,
        [
          [x, y],
          [x, y - 8],
        ],
        "#f7edcf",
        1.5,
      );
    }
    for (const [x, y] of [
      [129, 491],
      [196, 512],
      [272, 504],
      [312, 530],
      [355, 492],
    ]) {
      line(
        c,
        [
          [x, y],
          [x, y - 21],
        ],
        "#174d66",
        2,
      );
      rect(c, x - 3, y - 24, 6, 6, "#fff6ad", 1);
      polygon(
        c,
        [
          [x - 5, y - 24],
          [x, y - 28],
          [x + 5, y - 24],
        ],
        "#1b6781",
      );
    }
    for (let i = 0; i < 14; i++) {
      const x = 95 + i * 18,
        y = 491 + (i % 4) * 9;
      ellipse(c, x, y + 2, 2.5, 1, "#416d6760");
      rect(c, x - 1, y - 4, 2, 5, i % 2 ? "#fc7055" : "#1673be");
      rect(c, x - 1, y - 6, 2, 2, "#ffddad");
    }
    // Repeating masonry blocks and waterline reflections break up the quay faces.
    for (let i = 0; i < 14; i++) {
      const x = 71 + i * 11,
        y = 509 + i * 4.84;
      line(
        c,
        [
          [x, y - 8],
          [x, y - 1],
        ],
        "#bfa47d",
        0.8,
      );
      line(
        c,
        [
          [x, y - 5],
          [x + 10, y - 0.6],
        ],
        "#fff0c277",
        0.8,
      );
    }
    for (let i = 0; i < 10; i++) {
      const x = 242 + i * 13,
        y = 579 - i * 4.14;
      line(
        c,
        [
          [x, y - 12],
          [x, y - 2],
        ],
        "#776e5866",
        1,
      );
      line(
        c,
        [
          [x, y + 4],
          [x + 8, y + 1],
        ],
        "#a0fff0aa",
        1.8,
      );
    }
    // Boardwalk into the sheltered harbor.
    polygon(
      c,
      [
        [263, 563],
        [313, 584],
        [312, 593],
        [262, 572],
      ],
      "#996b43",
    );
    polygon(
      c,
      [
        [263, 563],
        [280, 558],
        [331, 580],
        [313, 586],
      ],
      "#e7b873",
    );
    for (let i = 0; i < 7; i++)
      line(
        c,
        [
          [269 + i * 7, 566 + i * 3],
          [281 + i * 7, 562 + i * 3],
        ],
        "#af784b",
        1,
      );
    for (const [x, y] of [
      [263, 567],
      [286, 578],
      [313, 588],
      [329, 581],
    ]) {
      rect(c, x, y, 4, 18, "#876649");
      ellipse(c, x + 2, y, 3, 1.5, "#ffda94");
    }
    // Foreground bridge, with open water arches rather than a solid flat sticker.
    c.save();
    c.transform(1, -0.45, 0, 1, 0, 0);
    for (let i = 0; i < 4; i++) {
      const x = -12 + i * 36;
      rect(c, x, 585, 9, 51, "#e9c794");
      rect(c, x + 9, 585, 4, 51, "#9e9c85");
      c.beginPath();
      c.arc(x + 22, 607, 16, Math.PI, 0);
      c.strokeStyle = "#f7dfaa";
      c.lineWidth = 8;
      c.stroke();
    }
    rect(c, -15, 575, 155, 12, "#d1b084");
    rect(c, -15, 575, 155, 5, "#fff1c5");
    rect(c, -15, 567, 155, 8, "#b0beb0");
    line(
      c,
      [
        [-15, 565],
        [139, 565],
      ],
      "#fff8d9",
      2,
    );
    for (let i = 0; i < 16; i++) rect(c, i * 9, 556, 2, 11, "#fff2cb");
    c.restore();
    boat(c, 209, 608, 0.95, true);
    boat(c, 75, 622, 0.7);
    boat(c, 348, 580, 0.6);
    // Foreground headlands provide a dark green contact frame for the CTA.
    polygon(
      c,
      [
        [0, 586],
        [21, 601],
        [56, 620],
        [63, 689],
        [0, 745],
      ],
      "#ac9863",
    );
    polygon(
      c,
      [
        [0, 586],
        [21, 595],
        [52, 617],
        [43, 643],
        [0, 632],
      ],
      "#94d743",
    );
    polygon(
      c,
      [
        [390, 610],
        [366, 625],
        [343, 656],
        [354, 723],
        [390, 743],
      ],
      "#827c4b",
    );
    polygon(
      c,
      [
        [390, 610],
        [366, 616],
        [340, 645],
        [356, 668],
        [390, 658],
      ],
      "#a3df42",
    );
    for (const [x, y, s] of [
      [4, 644, 1.3],
      [28, 656, 1],
      [1, 701, 1.6],
      [46, 696, 0.8],
      [381, 660, 1.2],
      [361, 683, 1],
      [395, 716, 1.6],
    ])
      tree(c, x, y, s);
    c.fillStyle = gradient(c, 709, 135, "#026cb400", "#03346dee");
    c.fillRect(0, 709, 390, 135);
  });
}
