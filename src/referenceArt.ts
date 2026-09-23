import Phaser from 'phaser';

/** Frame coordinates are locked to the supplied 1122 × 1402 reference sheets.
 * Keep the original sheets intact; named frames avoid duplicate raster assets. */
const PORTRAITS: Record<string, [number, number, number, number]> = {
  builder: [308, 282, 116, 110], planner: [850, 283, 111, 110],
  worker: [42, 805, 150, 152], chef: [269, 807, 151, 151],
  mechanic: [491, 807, 148, 151], sailor: [709, 807, 149, 151],
  tourist: [921, 807, 150, 151], corgi: [586, 1273, 85, 77],
  'builder-wink': [446, 282, 117, 111], 'planner-wink': [976, 285, 114, 110],
  logo: [28, 9, 388, 148],
  'builder-excited': [308, 424, 116, 112], 'builder-surprised': [446, 424, 117, 112],
  'planner-calm': [851, 415, 110, 110], 'planner-thinking': [977, 415, 111, 110],
  'worker-body': [30, 800, 202, 277], 'chef-body': [247, 800, 207, 277],
  'mechanic-body': [475, 803, 198, 274], 'sailor-body': [688, 803, 188, 274],
  'tourist-body': [895, 801, 208, 276], 'corgi-body': [184, 1233, 133, 134],
  'builder-cap': [305, 616, 100, 75], 'backpack': [411, 599, 90, 95],
  'blueprint': [854, 589, 64, 98], 'laptop': [924, 584, 99, 104],
  'pencil': [1031, 584, 59, 103], 'camera': [919, 1132, 80, 65],
  'corgi-wink': [688, 1272, 82, 81], 'corgi-excited': [786, 1272, 82, 81],
  'builder-body': [30, 329, 252, 366], 'planner-body': [617, 325, 215, 375],
};
const KIT: Record<string, [number, number, number, number]> = {
  house: [20, 973, 124, 159], coffee: [142, 969, 111, 163],
  apartment: [241, 965, 99, 168], office: [327, 930, 109, 203], cafe: [436, 963, 111, 170],
  market: [429, 963, 121, 170], tower: [327, 930, 109, 203],
  park: [675, 943, 86, 89], garden: [756, 944, 94, 89],
  boardwalk: [677, 1086, 126, 85],
  road: [564, 968, 81, 62], grass: [647, 965, 71, 65],
  tree: [715, 942, 80, 89], palm: [793, 944, 80, 88],
  bench: [873, 955, 84, 75], lamp: [963, 940, 54, 91], fence: [1018, 965, 77, 66],
  bridge: [560, 1060, 119, 111], dock: [677, 1086, 126, 85],
  lighthouse: [804, 1053, 85, 118], wheel: [893, 1052, 103, 121], sailboat: [1004, 1055, 97, 116],
  'block-red': [30, 262, 84, 91], 'block-blue': [120, 262, 85, 91],
  'block-green': [210, 262, 83, 91], 'block-yellow': [300, 262, 86, 91],
  'block-purple': [391, 262, 87, 91], 'block-ice': [487, 260, 91, 95],
  'block-stone': [28, 402, 84, 94], 'block-wood': [119, 402, 84, 94],
  'block-grass': [210, 402, 84, 94], 'block-sand': [302, 402, 84, 94],
  'block-metal': [393, 402, 84, 94], 'block-rainbow': [487, 402, 90, 98],
  hammer: [748, 619, 72, 75], shuffle: [872, 620, 70, 73], line: [995, 620, 74, 75],
  hat: [722, 801, 52, 46], puzzle: [802, 799, 50, 48],
  shop: [880, 800, 51, 47], friends: [959, 800, 51, 47], map: [1037, 799, 49, 49],
  coin: [519, 622, 38, 41], settings: [625, 758, 43, 38],
  'panel-dialog': [622, 1247, 231, 109], 'panel-card': [865, 1247, 222, 109],
  'menu-coast': [37, 1248, 334, 102], 'level-coast': [389, 1248, 216, 102],
};
export function preloadReferenceArt(scene: Phaser.Scene) {
  scene.load.image('reference-characters', '/assets/block-city-characters.png');
  scene.load.image('reference-kit', '/assets/block-city-kit.png');
}
export function referenceArt(scene: Phaser.Scene, x: number, y: number, name: string, width: number, height = width) {
  const character = PORTRAITS[name];
  const rect = character ?? KIT[name];
  const key = character ? 'reference-characters' : 'reference-kit';
  if (!rect || !scene.textures.exists(key)) return undefined;
  // Remove only edge-connected sheet matte. Enclosed white highlights stay intact.
  // Portraits retain their intentionally colored rounded portrait backgrounds.
  const cached = `reference-cutout-${name}`;
  if (!scene.textures.exists(cached)) {
    const [sx, sy, sw, sh] = rect;
    const canvas = scene.textures.createCanvas(cached, sw, sh)!;
    const ctx = canvas.context;
    ctx.drawImage(scene.textures.get(key).getSourceImage() as HTMLImageElement, sx, sy, sw, sh, 0, 0, sw, sh);
    const portrait = Boolean(character) && !name.includes('body') && !['logo', 'builder-cap', 'backpack', 'blueprint', 'laptop', 'pencil', 'camera'].includes(name);
    const intact = portrait || name.startsWith('panel-') || name.endsWith('-coast');
    if (!intact) {
      const pixels = ctx.getImageData(0, 0, sw, sh), data = pixels.data;
      const seen = new Uint8Array(sw * sh), queue: number[] = [];
      const blueMatte = ['hammer', 'shuffle', 'line', 'hat', 'puzzle', 'shop', 'friends', 'map', 'settings'].includes(name);
      const push = (index: number) => {
        if (seen[index]) return;
        seen[index] = 1;
        const i = index * 4, r = data[i], g = data[i + 1], b = data[i + 2];
        if (blueMatte ? b > 130 && r < 65 && g > 65 && g < 210 : r > 175 && g > 195 && b > 190 && Math.max(r, g, b) - Math.min(r, g, b) < 65) queue.push(index);
      };
      for (let x = 0; x < sw; x++) { push(x); push((sh - 1) * sw + x); }
      for (let y = 0; y < sh; y++) { push(y * sw); push(y * sw + sw - 1); }
      for (let head = 0; head < queue.length; head++) {
        const n = queue[head]; data[n * 4 + 3] = 0;
        if (n % sw) push(n - 1); if (n % sw < sw - 1) push(n + 1);
        if (n >= sw) push(n - sw); if (n < sw * (sh - 1)) push(n + sw);
      }
      ctx.putImageData(pixels, 0, 0);
    }
    // Rounded clipping prevents the square matte corners of portrait crops.
    if (portrait) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath(); ctx.roundRect(0, 0, sw, sh, Math.min(sw, sh) * 0.15); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    canvas.refresh();
  }
  return scene.add.image(x, y, cached).setDisplaySize(width, height);
}

/** Canvas gradients avoid Phaser Graphics' per-triangle gradient seams and
 * work identically for cached blocks and WebGL/Canvas UI rendering. */
export function glossyFace(scene: Phaser.Scene, width: number, height: number, radius: number, top: number, bottom: number) {
  const key = `gloss-${width}-${height}-${radius}-${top}-${bottom}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width * 2, height * 2)!;
    const ctx = texture.context;
    ctx.scale(2, 2);
    const hex = (value: number) => `#${value.toString(16).padStart(6, '0')}`;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hex(top)); gradient.addColorStop(1, hex(bottom));
    ctx.fillStyle = gradient;
    ctx.beginPath(); ctx.roundRect(1, 1, width - 2, height - 2, radius); ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(3, 3, width - 6, height - 6, Math.max(2, radius - 2)); ctx.stroke();
    texture.refresh();
  }
  return scene.add.image(0, 0, key).setDisplaySize(width, height);
}
