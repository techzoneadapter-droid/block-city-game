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
  'worker-toolbox': [122, 1133, 84, 67],
  'cake': [368, 1131, 76, 70], 'wrench': [476, 1134, 85, 68],
  'tool-belt': [576, 1132, 82, 66],
  'binoculars': [782, 1133, 93, 67], 'collar': [909, 1276, 90, 65],
  'pencil': [1031, 584, 59, 103], 'camera': [919, 1132, 80, 65],
  'corgi-wink': [688, 1272, 82, 81], 'corgi-excited': [786, 1272, 82, 81],
  'builder-body': [30, 329, 252, 366], 'planner-body': [617, 325, 215, 375],
};
const KIT: Record<string, [number, number, number, number]> = {
  house: [20, 973, 124, 159], coffee: [439, 963, 108, 170],
  shopfront: [143, 973, 99, 159],
  apartment: [241, 965, 99, 168], office: [327, 930, 109, 203], cafe: [436, 963, 111, 170],
  // District projects are composed below; the kit has no dedicated crops.
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
// The poster packs buildings tightly. These ownership masks exclude neighboring
// buildings at crop edges without erasing white windows or the object's base.
const KIT_SILHOUETTES: Record<string, number[][]> = {
  house: [[0,0],[104,0],[104,131],[119,147],[98,159],[0,159]],
  apartment: [[0,0],[89,0],[89,143],[99,153],[99,168],[0,168]],
  office: [[8,0],[87,0],[87,157],[109,185],[109,203],[8,203]],
  shopfront: [[0,0],[90,0],[90,139],[99,153],[99,159],[0,159]],
  coffee: [[9,0],[108,0],[108,170],[0,170],[0,147],[9,135]],
  cafe: [[12,0],[111,0],[111,170],[0,170],[0,147],[12,135]],
};

export function preloadReferenceArt(scene: Phaser.Scene) {
  scene.load.image('reference-characters', '/assets/block-city-characters.png');
  scene.load.image('reference-kit', '/assets/block-city-kit.png');
  scene.load.image('reference-chest', '/assets/block-city-chest.png');
}
function prepareTexture(scene: Phaser.Scene, name: string): string | undefined {
  if (name === 'chest') return scene.textures.exists('reference-chest') ? 'reference-chest' : undefined;
  if (['park', 'garden', 'market', 'tower'].includes(name)) return prepareProject(scene, name);
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
    const portrait = Boolean(character) && !name.includes('body') && !['logo', 'builder-cap', 'backpack', 'blueprint', 'laptop', 'pencil', 'camera', 'worker-toolbox', 'chef-hat', 'cake', 'wrench', 'tool-belt', 'sailor-hat', 'binoculars', 'collar', 'bone'].includes(name);
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
    const silhouette = KIT_SILHOUETTES[name];
    if (silhouette) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath();
      silhouette.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
      ctx.closePath(); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    // Rounded clipping prevents the square matte corners of portrait crops.
    if (portrait) {
      ctx.globalCompositeOperation = 'destination-in';
      ctx.beginPath(); ctx.roundRect(0, 0, sw, sh, Math.min(sw, sh) * 0.15); ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    canvas.refresh();
  }
  return cached;
}

/** Prepare every cutout once at startup, before interactive scenes are created. */
export function prepareReferenceTextures(scene: Phaser.Scene) {
  for (const name of [...Object.keys(PORTRAITS), ...Object.keys(KIT), 'park', 'garden', 'market', 'tower']) prepareTexture(scene, name);
}

export function referenceArt(scene: Phaser.Scene, x: number, y: number, name: string, width: number, height = width) {
  const key = prepareTexture(scene, name);
  if (!key) return undefined;
  return scene.add.image(x, y, key).setDisplaySize(width, height);
}

/** Semantic projects assembled from the kit, never unrelated sheet fragments. */
function prepareProject(scene: Phaser.Scene, name: string) {
  const key = `reference-project-${name}`;
  if (scene.textures.exists(key)) return key;
  const texture = scene.textures.createCanvas(key, 240, 260)!;
  const ctx = texture.context;
  const art = (asset: string, x: number, y: number, w: number, h: number) => {
    const source = prepareTexture(scene, asset);
    if (source) ctx.drawImage(scene.textures.get(source).getSourceImage() as HTMLCanvasElement, x, y, w, h);
  };
  const face = (points: number[][], color: string) => {
    ctx.fillStyle = color; ctx.beginPath(); points.forEach(([x,y], i) => i ? ctx.lineTo(x,y) : ctx.moveTo(x,y)); ctx.closePath(); ctx.fill();
  };
  if (name === 'park') {
    face([[16,166],[120,121],[228,167],[120,221]], '#a7eb53');
    face([[16,166],[120,221],[120,236],[16,181]], '#bc854b');
    face([[120,221],[228,167],[228,182],[120,236]], '#875e35');
    face([[43,176],[136,139],[155,147],[63,187]], '#ffe4a0');
    art('tree', 24, 80, 73, 92); art('tree', 147, 94, 64, 80);
    art('bench', 88, 149, 75, 58); art('lamp', 172, 145, 29, 50);
    for (const [x,y] of [[52,192],[68,200],[175,189]]) {ctx.fillStyle='#23a64c';ctx.fillRect(x,y,13,7);ctx.fillStyle='#ff86b5';ctx.fillRect(x+3,y-4,5,6);}
  } else if (name === 'garden') {
    // Visible apartment pedestal makes this unmistakably a rooftop garden.
    art('apartment', 56, 79, 137, 177);
    face([[52,105],[121,72],[195,105],[120,139]], '#fbe6af');
    face([[61,102],[121,80],[186,104],[120,130]], '#86d747');
    art('tree', 72, 39, 48, 60); art('tree', 132, 56, 40, 49);
    art('bench', 101, 90, 43, 34);
    face([[52,105],[120,139],[120,146],[52,112]], '#e6bf80');
    face([[120,139],[195,105],[195,112],[120,146]], '#bb9863');
  } else if (name === 'market') {
    art('grass', 16, 150, 206, 102);
    art('shopfront', 84, 25, 133, 191);
    // Two open produce stalls distinguish the market from a single café.
    for (const [x,y] of [[20,145],[98,174]]) {
      ctx.fillStyle='#aa6730';ctx.fillRect(x+5,y+18,5,48);ctx.fillRect(x+57,y+18,5,48);
      face([[x,y+18],[x+14,y],[x+70,y],[x+65,y+22]], '#ef5354');
      for(let i=0;i<3;i++) face([[x+8+i*20,y+19],[x+20+i*17,y+1],[x+28+i*17,y+1],[x+17+i*20,y+20]], '#fff5da');
      ctx.fillStyle='#e6af64';ctx.fillRect(x+4,y+46,58,18);
      for(let i=0;i<5;i++){ctx.fillStyle=i%2?'#ffc635':'#5dcc38';ctx.fillRect(x+8+i*10,y+39,8,8);}
    }
  } else {
    art('office', 57, 35, 130, 222);
    art('apartment', 15, 127, 82, 128);
    // Gold crown and spire identify the district landmark.
    face([[89,47],[125,30],[162,47],[126,63]], '#ffda43');
    face([[89,47],[126,63],[126,72],[89,56]], '#e2a92a');
    face([[126,63],[162,47],[162,56],[126,72]], '#b77c18');
    ctx.fillStyle='#ffd44b';ctx.fillRect(123,7,5,28);ctx.fillStyle='#fff5b1';ctx.fillRect(123,7,2,27);
  }
  texture.refresh(); return key;
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
