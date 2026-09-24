import Phaser from "phaser";
import { cachedCanvas, surfaceTexture } from "../ui/art";

type Context = CanvasRenderingContext2D;
const gradient = (
  c: Context,
  top: string,
  bottom: string,
  y: number,
  h: number,
) => {
  const g = c.createLinearGradient(0, y, 0, y + h);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  return g;
};
function round(
  c: Context,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
  fill: string | CanvasGradient,
  stroke?: string,
  line = 2,
) {
  c.beginPath();
  c.roundRect(x, y, w, h, r);
  c.fillStyle = fill;
  c.fill();
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = line;
    c.stroke();
  }
}
function path(
  c: Context,
  data: string,
  fill: string | CanvasGradient,
  stroke?: string,
  width = 2,
) {
  const p = new Path2D(data);
  c.fillStyle = fill;
  c.fill(p);
  if (stroke) {
    c.strokeStyle = stroke;
    c.lineWidth = width;
    c.stroke(p);
  }
}

/** Original waterfront, drawn once into a shared high-resolution canvas texture. */
export function puzzleBackdrop(scene: Phaser.Scene) {
  const key = cachedCanvas(scene, "puzzle-waterfront-v1", 390, 844, (c) => {
    c.fillStyle = gradient(c, "#53c8ff", "#e1faff", 0, 300);
    c.fillRect(0, 0, 390, 844);
    const cloud = (x: number, y: number, s: number) => {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.globalAlpha = 0.82;
      path(
        c,
        "M0 22 L0 8 L12 8 L12 0 L27 0 L27 12 L42 12 L42 5 L55 5 L55 20 L71 20 L71 33 L0 33 Z",
        "#ffffff",
      );
      c.restore();
    };
    cloud(-10, 78, 1.2);
    cloud(281, 90, 1.1);
    cloud(167, 123, 0.5);
    c.fillStyle = gradient(c, "#70daef", "#0b9fdf", 150, 694);
    c.fillRect(0, 165, 390, 679);
    for (let i = 0; i < 140; i++) {
      const x = (i * 79) % 390,
        y = 167 + ((i * 47) % 677);
      round(
        c,
        x,
        y,
        4 + (i % 17),
        1 + (i % 2),
        1,
        i % 3 ? "#b3f5f659" : "#ffffff7a",
      );
    }
    const house = (
      x: number,
      y: number,
      w: number,
      h: number,
      roof: string,
    ) => {
      path(c, `M${x + w} ${y + 5} l9 -5 v${h} l-9 7 Z`, "#9bc8d5");
      round(c, x, y, w, h, 1.5, gradient(c, "#fffbea", "#f5e0b2", y, h));
      path(c, `M${x - 2} ${y} l9 -6 h${w} l-9 6 Z`, roof);
      c.fillStyle = "#ffffff";
      c.fillRect(x - 2, y, w + 4, 3);
      for (let row = 0; row < Math.floor((h - 7) / 13); row++)
        for (let col = 0; col < Math.floor(w / 11); col++) {
          round(c, x + 4 + col * 11, y + 7 + row * 13, 5, 8, 0.6, "#338bc0");
          c.fillStyle = "#c1f4ff";
          c.fillRect(x + 4 + col * 11, y + 7 + row * 13, 1.5, 7);
          c.fillStyle = "#fffdf2";
          c.fillRect(x + 3 + col * 11, y + 15 + row * 13, 7, 2);
        }
      if (h > 40) {
        c.fillStyle = "#3b99be";
        c.fillRect(x + w * 0.4, y + h - 13, 8, 13);
        for (let j = 0; j < 4; j++)
          path(
            c,
            `M${x + (j * w) / 4} ${y + h - 19} h${w / 4} l3 7 h${-w / 4} Z`,
            j % 2 ? "#fff9ed" : roof,
          );
      }
    };
    const tree = (x: number, y: number, s: number) => {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.fillStyle = "#b58a57";
      c.fillRect(-2, 0, 5, 17);
      round(c, -12, -12, 15, 17, 2, "#6dbe4b");
      round(c, 0, -18, 15, 18, 2, "#8bdd58");
      round(c, -5, -22, 12, 12, 2, "#a8e96b");
      c.fillStyle = "#4ba146";
      c.fillRect(0, -2, 10, 8);
      c.restore();
    };
    // Distant harbor grows toward the edges, leaving the center open and calm.
    for (let i = 0; i < 9; i++) {
      const x = i * 46 - 15,
        h = 20 + ((i * 17) % 40),
        y = 174 - Math.abs(x - 195) * 0.12 - h;
      house(x, y, 25, h, i % 2 ? "#f29769" : "#479bd0");
      tree(x + 34, y + h - 5, 0.55);
    }
    for (const side of [0, 1]) {
      c.save();
      if (side) {
        c.translate(390, 0);
        c.scale(-1, 1);
      }
      path(c, "M0 168 L99 185 L140 224 L100 247 L58 283 L0 332 Z", "#f4e8ca");
      path(c, "M0 185 L96 201 L127 225 L94 250 L49 291 L0 342 Z", "#b5c5bd");
      path(c, "M0 174 L91 191 L126 220 L99 232 L66 250 L0 303 Z", "#fff2d5");
      for (let i = 0; i < 4; i++) {
        house(
          -7 + i * 26,
          144 + i * 12,
          23,
          37 + (i % 2) * 11,
          i % 2 ? "#fa9472" : "#499ecc",
        );
        tree(10 + i * 30, 198 + i * 9, 0.8);
      }
      house(8, 101, 29, 66, "#258cc9");
      house(45, 130, 24, 52, "#ee946a");
      tree(3, 136, 1);
      tree(81, 189, 0.8);
      // Foreground quay is mostly hidden by the board, with a warm edge visible.
      path(c, "M0 379 L15 418 L15 714 L44 759 L100 844 H0 Z", "#d7d8be");
      path(c, "M0 392 L9 428 L9 719 L35 768 L91 844 H0 Z", "#fff0c6");
      for (let i = 0; i < 7; i++) tree(i % 2 ? 4 : 14, 448 + i * 58, 0.9);
      tree(15, 807, 1.6);
      tree(47, 840, 1.4);
      c.restore();
    }
    const boat = (x: number, y: number, s: number) => {
      c.save();
      c.translate(x, y);
      c.scale(s, s);
      c.fillStyle = "#cffcff99";
      c.beginPath();
      c.ellipse(0, 17, 28, 5, 0, 0, Math.PI * 2);
      c.fill();
      path(c, "M-23 8 H23 L14 18 H-13 Z", "#ffffff", "#6aafd1", 1);
      path(c, "M-20 10 H21 L17 14 H-16 Z", "#f78a70");
      path(c, "M0 6 V-42 L-20 6 Z", "#ffffff");
      path(c, "M4 5 V-29 L19 5 Z", "#fff7df");
      c.strokeStyle = "#679caf";
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(1, -44);
      c.lineTo(1, 9);
      c.stroke();
      c.restore();
    };
    boat(219, 178, 0.52);
    boat(170, 214, 0.6);
    boat(370, 408, 0.9);
    c.strokeStyle = "#ffffff";
    c.lineWidth = 2.2;
    c.stroke(
      new Path2D(
        "M231 104 Q237 98 243 104 Q249 96 255 101 M160 89 Q165 85 171 90 Q176 86 181 88",
      ),
    );
    c.fillStyle = "#ecfbff15";
    c.fillRect(0, 0, 390, 844);
  });
  return scene.add.image(195, 422, key).setDisplaySize(390, 844);
}

/** Uses the shared UI Core surface renderer, with explicit puzzle surface roles. */
export function puzzlePanel(
  scene: Phaser.Scene,
  x: number,
  y: number,
  w: number,
  h: number,
  kind: "frame" | "well" | "goals" | "moves",
  radius = 20,
) {
  if (kind === "well") {
    const key = cachedCanvas(
      scene,
      `puzzle-well-${w}-${h}-${radius}`,
      w,
      h,
      (c) => {
        round(c, 0, 0, w, h, radius, "#052544");
        round(
          c,
          2,
          3,
          w - 4,
          h - 5,
          radius - 2,
          gradient(c, "#09294f", "#104777", 0, h),
          "#2379ac",
          1.5,
        );
        // Dark top lip and a subtle blue lower edge convey a recess, not a raised button.
        c.strokeStyle = "#031d3c";
        c.lineWidth = 3;
        c.beginPath();
        c.moveTo(5, radius);
        c.quadraticCurveTo(5, 4, radius, 4);
        c.lineTo(w - radius, 4);
        c.stroke();
      },
    );
    const root = scene.add.container(x, y);
    root.add(scene.add.image(0, 0, key).setDisplaySize(w, h));
    return root;
  }
  const palettes = {
    frame: {
      top: 0x0ac2fa,
      bottom: 0x007fe1,
      edge: 0x0051ad,
      outline: 0x043b76,
      highlight: 0x99f5ff,
    },
    well: {
      top: 0x09274e,
      bottom: 0x12477a,
      edge: 0x06305c,
      outline: 0x06284e,
      highlight: 0x237fb3,
    },
    goals: {
      top: 0xf5fdff,
      bottom: 0xd4efff,
      edge: 0x059ae0,
      outline: 0x38caff,
      highlight: 0xffffff,
    },
    moves: {
      top: 0xfffef1,
      bottom: 0xffedc5,
      edge: 0xbe7626,
      outline: 0x07528a,
      highlight: 0xf5c773,
    },
  };
  const root = scene.add.container(x, y);
  const key = surfaceTexture(scene, w, h - 4, {
    ...palettes[kind],
    radius,
    depth: 5,
    shadow: true,
    shadowAlpha: 0.28,
  });
  root.add(scene.add.image(0, 2, key).setDisplaySize(w + 24, h + 28));
  return root;
}

export function boosterIcon(
  scene: Phaser.Scene,
  x: number,
  y: number,
  kind: string,
  size = 66,
) {
  const key = cachedCanvas(scene, `puzzle-tool-${kind}`, 100, 100, (c) => {
    const ink = "#063571";
    const shape = (d: string, top: string, bottom: string) => {
      c.save();
      c.translate(0, 3);
      path(c, d, ink, ink, 4);
      c.restore();
      path(c, d, gradient(c, top, bottom, 10, 80), ink, 2.5);
    };
    if (kind === "hammer") {
      c.translate(50, 50);
      c.rotate(-0.7);
      c.translate(-50, -50);
      shape("M42 40 H59 V85 Q50 94 42 85 Z", "#fff135", "#ffac00");
      round(c, 45, 54, 4, 28, 2, "#fff583");
      shape("M14 16 H33 V51 H14 Q9 35 14 16 Z", "#ffff62", "#ffba00");
      shape("M69 16 H87 Q93 34 87 51 H69 Z", "#fff744", "#ef9b00");
      shape("M30 12 Q49 6 72 12 V55 Q50 62 30 55 Z", "#ff7971", "#f52b35");
      path(c, "M34 14 H66 L71 20 H37 Z", "#ffc1a6");
      round(c, 37, 57, 27, 10, 3, "#13c5ff", ink);
    } else if (kind === "refresh") {
      shape(
        "M9 26 Q22 17 33 27 L61 58 L68 58 V46 L92 66 L68 87 V73 L58 73 Q53 73 48 66 L24 39 Q20 36 11 42 Z",
        "#ffb9ff",
        "#bc37f0",
      );
      shape(
        "M10 67 L25 67 L53 27 Q56 23 66 23 V11 L91 31 L66 51 V38 L62 38 L35 78 Q28 86 10 80 Z",
        "#f9a4ff",
        "#d34cfb",
      );
      c.strokeStyle = "#ffe4ff";
      c.lineWidth = 2;
      c.stroke(new Path2D("M15 70 H25 L56 29 H67 M72 19 L84 30"));
    } else {
      c.translate(50, 50);
      c.rotate(0.58);
      c.translate(-50, -50);
      shape("M40 72 L37 93 L49 85 L58 94 L62 72 Z", "#fff84d", "#ff9b00");
      shape(
        "M35 49 L22 68 V80 L39 73 H62 L78 80 V68 L65 49 Z",
        "#ff7670",
        "#ed2635",
      );
      shape("M35 26 H65 V72 Q50 80 35 72 Z", "#ffffff", "#b5eaff");
      path(c, "M36 40 H64 V50 H36 Z", "#007ff0");
      path(c, "M36 62 H64 V70 H36 Z", "#1685f0");
      shape("M31 30 Q34 13 50 3 Q67 13 69 30 Z", "#ff7976", "#ff303b");
      c.strokeStyle = "#ffffff";
      c.lineWidth = 3;
      c.stroke(new Path2D("M38 28 Q40 17 49 10 M39 34 V39"));
    }
  });
  return scene.add.image(x, y, key).setDisplaySize(size, size);
}

/** Short-lived cached sprites: no blur filters, particle emitters, or update loops. */
export function lineClearEffect(
  scene: Phaser.Scene,
  x: number,
  y: number,
  length: number,
  vertical = false,
) {
  const beamKey = cachedCanvas(scene, "puzzle-clear-beam", 128, 64, (c) => {
    const g = c.createRadialGradient(64, 32, 0, 64, 32, 64);
    g.addColorStop(0, "#ffffff");
    g.addColorStop(0.12, "#fffccb");
    g.addColorStop(0.36, "#ffeb2988");
    g.addColorStop(1, "#ffcb0000");
    c.fillStyle = g;
    c.fillRect(0, 0, 128, 64);
    path(
      c,
      "M0 32 L52 27 L64 8 L70 27 L128 32 L70 36 L64 57 L56 36 Z",
      "#ffffdc",
    );
  });
  const beam = scene.add
    .image(x, y, beamKey)
    .setDisplaySize(length + 40, 64)
    .setDepth(87);
  if (vertical) beam.setAngle(90);
  scene.tweens.add({
    targets: beam,
    alpha: 0,
    scaleY: beam.scaleY * 0.2,
    duration: 500,
    onComplete: () => beam.destroy(),
  });
  const step = length / 8;
  for (let i = 0; i < 8; i++) {
    const offset = (i - 3.5) * step;
    const px = x + (vertical ? 0 : offset),
      py = y + (vertical ? offset : 0);
    const outline = scene.add.graphics().setDepth(86);
    outline
      .lineStyle(3, 0xffed35, 0.8)
      .strokeRoundedRect(
        px - step / 2 + 2,
        py - step / 2 + 2,
        step - 4,
        step - 4,
        6,
      );
    outline
      .lineStyle(1.5, 0xffffff, 1)
      .strokeRoundedRect(
        px - step / 2 + 4,
        py - step / 2 + 4,
        step - 8,
        step - 8,
        5,
      );
    const star = scene.add
      .image(px, py, beamKey)
      .setDisplaySize(30, 30)
      .setDepth(89)
      .setAngle(i * 24);
    const scale = star.scaleX;
    scene.tweens.add({
      targets: star,
      x: px + (vertical ? (i % 2 ? 28 : -28) : 0),
      y: py + (vertical ? 0 : i % 2 ? 30 : -30),
      angle: star.angle + 80,
      scaleX: scale * 0.2,
      scaleY: scale * 0.2,
      alpha: 0,
      delay: i * 18,
      duration: 420,
      onComplete: () => star.destroy(),
    });
    scene.tweens.add({
      targets: outline,
      alpha: 0,
      delay: i * 18,
      duration: 380,
      onComplete: () => outline.destroy(),
    });
  }
}
