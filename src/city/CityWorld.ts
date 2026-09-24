import Phaser from "phaser";
import { W, text } from "../ui";
import { addIsoCube, createFerrisWheel, createVoxelBoat, createVoxelBridge, createVoxelBuilding, createVoxelTree, voxelGroundTile } from "../voxelArt";

export type DistrictId = 1 | 2 | 3;
export type BuildingKey = "coffee" | "park" | "market" | "boardwalk" | "tower" | "garden";

export type CityStageState = {
  coffee: number;
  park: number;
  market: number;
  boardwalk: number;
  tower: number;
  garden: number;
};

type CityLayer = "ground" | "water" | "road" | "building" | "prop" | "character" | "vehicle" | "vfx";
type WorldObject = Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Depth;

const DYNAMIC_LAYERS = new Set<CityLayer>(["building", "prop", "character", "vehicle"]);

const BUILDING_POINTS: Record<BuildingKey, Phaser.Math.Vector2> = {
  coffee: new Phaser.Math.Vector2(133, 438),
  park: new Phaser.Math.Vector2(248, 358),
  market: new Phaser.Math.Vector2(127, 424),
  boardwalk: new Phaser.Math.Vector2(269, 440),
  tower: new Phaser.Math.Vector2(151, 448),
  garden: new Phaser.Math.Vector2(263, 354),
};

const TEXTURE_KEYS = {
  tree: "city-tree-v2",
  pine: "city-pine-v2",
  bench: "city-bench-v2",
  lamp: "city-lamp-v2",
  carGold: "city-car-gold-v2",
  carBlue: "city-car-blue-v2",
  carPink: "city-car-pink-v2",
  npcBlue: "city-npc-blue-v2",
  npcPink: "city-npc-pink-v2",
  npcGold: "city-npc-gold-v2",
  boat: "city-boat-v2",
  crate: "city-crate-v2",
  cone: "city-cone-v2",
  flower: "city-flower-v2",
};

function makeTexture(
  scene: Phaser.Scene,
  key: string,
  width: number,
  height: number,
  draw: (g: Phaser.GameObjects.Graphics) => void,
) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0 });
  draw(g);
  g.generateTexture(key, width, height);
  g.destroy();
}

/** Repeated city props are rasterized once and reused as lightweight sprites. */
export function ensureCityTextures(scene: Phaser.Scene) {
  makeTexture(scene, TEXTURE_KEYS.tree, 42, 58, (g) => {
    g.fillStyle(0x174a36, 0.16); g.fillEllipse(21, 52, 32, 8);
    g.fillStyle(0x86532e, 1); g.fillRoundedRect(18, 29, 7, 22, 3);
    g.fillStyle(0x087f43, 1); g.fillRoundedRect(5, 15, 27, 24, 2);
    g.fillStyle(0x19aa4f, 1); g.fillRoundedRect(13, 5, 25, 28, 2);
    g.fillStyle(0x69df70, 1); g.fillRoundedRect(18, 8, 11, 9, 3);
  });
  makeTexture(scene, TEXTURE_KEYS.pine, 38, 58, (g) => {
    g.fillStyle(0x174a36, 0.15); g.fillEllipse(19, 52, 30, 8);
    g.fillStyle(0x7a4e2d, 1); g.fillRoundedRect(16, 34, 6, 18, 2);
    g.fillStyle(0x116b54, 1); g.fillTriangle(19, 4, 4, 39, 34, 39);
    g.fillStyle(0x2ab77a, 1); g.fillTriangle(19, 12, 7, 43, 31, 43);
    g.fillStyle(0x75df9a, 0.9); g.fillTriangle(17, 8, 12, 23, 23, 23);
  });
  makeTexture(scene, TEXTURE_KEYS.bench, 38, 23, (g) => {
    g.fillStyle(0x0e4c61, 0.15); g.fillEllipse(19, 20, 34, 6);
    g.fillStyle(0xa86a37, 1); g.fillRoundedRect(4, 6, 30, 6, 2); g.fillRoundedRect(5, 13, 28, 5, 2);
    g.fillStyle(0x563d31, 1); g.fillRect(8, 17, 4, 5); g.fillRect(27, 17, 4, 5);
    g.fillStyle(0xe5a65e, 0.8); g.fillRect(7, 7, 24, 2);
  });
  makeTexture(scene, TEXTURE_KEYS.lamp, 18, 48, (g) => {
    g.fillStyle(0x123b57, 0.16); g.fillEllipse(9, 46, 16, 4);
    g.fillStyle(0x31516b, 1); g.fillRoundedRect(7, 14, 4, 31, 2); g.fillRoundedRect(3, 42, 12, 4, 2);
    g.fillStyle(0xffdf77, 0.28); g.fillCircle(9, 11, 8);
    g.fillStyle(0xffd35c, 1); g.fillRoundedRect(4, 5, 10, 13, 3);
    g.lineStyle(2, 0x31516b, 1); g.strokeRoundedRect(4, 5, 10, 13, 3);
    g.fillStyle(0xffffff, 0.75); g.fillRect(7, 7, 3, 7);
  });
  const car = (key: string, color: number) => makeTexture(scene, key, 44, 26, (g) => {
    g.fillStyle(0x113955, 0.18); g.fillEllipse(22, 22, 38, 7);
    g.fillStyle(color, 1); g.fillRoundedRect(3, 9, 38, 12, 5); g.fillRoundedRect(12, 4, 20, 11, 5);
    g.fillStyle(0xd8f8ff, 1); g.fillRoundedRect(15, 6, 7, 7, 2); g.fillRoundedRect(23, 6, 7, 7, 2);
    g.fillStyle(0x163b5a, 1); g.fillCircle(11, 21, 4); g.fillCircle(34, 21, 4);
    g.fillStyle(0xffffff, 0.85); g.fillCircle(39, 14, 2);
  });
  car(TEXTURE_KEYS.carGold, 0xffc72c);
  car(TEXTURE_KEYS.carBlue, 0x31c8e7);
  car(TEXTURE_KEYS.carPink, 0xff7770);
  const npc = (key: string, color: number) => makeTexture(scene, key, 20, 34, (g) => {
    g.fillStyle(0x113955, 0.16); g.fillEllipse(10, 32, 15, 4);
    g.fillStyle(0x5b3725, 1); g.fillRoundedRect(4, 3, 12, 11, 5);
    g.fillStyle(0xffd3ae, 1); g.fillCircle(10, 10, 6);
    g.fillStyle(color, 1); g.fillRoundedRect(4, 15, 12, 12, 4);
    g.fillStyle(0x254c78, 1); g.fillRect(5, 25, 4, 6); g.fillRect(11, 25, 4, 6);
    g.fillStyle(0x173454, 1); g.fillCircle(8, 9, 1); g.fillCircle(12, 9, 1);
  });
  npc(TEXTURE_KEYS.npcBlue, 0x2f9feb);
  npc(TEXTURE_KEYS.npcPink, 0xf0689c);
  npc(TEXTURE_KEYS.npcGold, 0xf4b732);
  makeTexture(scene, TEXTURE_KEYS.boat, 48, 33, (g) => {
    g.fillStyle(0x0b567a, 0.18); g.fillEllipse(24, 29, 42, 7);
    g.fillStyle(0xffffff, 1); g.fillTriangle(5, 20, 43, 20, 36, 29); g.fillRect(21, 3, 3, 18);
    g.fillStyle(0xf45f55, 1); g.fillTriangle(24, 4, 24, 19, 39, 19);
    g.fillStyle(0x35a8dd, 1); g.fillRoundedRect(8, 18, 32, 5, 2);
  });
  makeTexture(scene, TEXTURE_KEYS.crate, 22, 22, (g) => {
    g.fillStyle(0x6a4227, 0.18); g.fillEllipse(11, 19, 20, 5);
    g.fillStyle(0xb86f35, 1); g.fillRoundedRect(2, 2, 18, 17, 2);
    g.lineStyle(2, 0x784421, 1); g.strokeRoundedRect(2, 2, 18, 17, 2); g.lineBetween(3, 3, 19, 18); g.lineBetween(19, 3, 3, 18);
  });
  makeTexture(scene, TEXTURE_KEYS.cone, 18, 24, (g) => {
    g.fillStyle(0x21445c, 0.15); g.fillEllipse(9, 21, 17, 4);
    g.fillStyle(0xff782e, 1); g.fillTriangle(9, 2, 3, 19, 15, 19);
    g.fillStyle(0xffffff, 1); g.fillRect(5, 12, 8, 3);
    g.fillStyle(0x414b55, 1); g.fillRoundedRect(1, 18, 16, 4, 2);
  });
  makeTexture(scene, TEXTURE_KEYS.flower, 16, 16, (g) => {
    g.fillStyle(0x168a4f, 1); g.fillRect(7, 7, 2, 8);
    g.fillStyle(0xff72a1, 1); g.fillCircle(5, 6, 4); g.fillCircle(11, 6, 4); g.fillCircle(8, 3, 4); g.fillCircle(8, 9, 4);
    g.fillStyle(0xffdc49, 1); g.fillCircle(8, 6, 2);
  });
}

export class CityWorld {
  readonly root: Phaser.GameObjects.Container;
  readonly layers: Record<CityLayer, Phaser.GameObjects.GameObject[]> = {
    ground: [], water: [], road: [], building: [], prop: [], character: [], vehicle: [], vfx: [],
  };

  private buildings = new Map<BuildingKey, Phaser.GameObjects.Container>();
  private ambientTargets: Phaser.GameObjects.GameObject[] = [];
  private timers: Phaser.Time.TimerEvent[] = [];
  private selection?: Phaser.GameObjects.Container;
  private destroyed = false;

  constructor(
    private scene: Phaser.Scene,
    private district: DistrictId,
    private stages: CityStageState,
    private onSelect: (key: BuildingKey) => void,
    private offsetY = 0,
  ) {
    ensureCityTextures(scene);
    this.root = scene.add.container(0, offsetY).setDepth(10);
    this.createBackdrop();
    if (district === 1) this.createStarterStreet();
    else if (district === 2) this.createRiverside();
    else this.createSkyline();
    this.startAmbientSort();
    this.root.sort("depth");
  }

  private add<T extends WorldObject>(object: T, layer: CityLayer, screenY = 0, bias = 0) {
    const base = layer === "ground" ? 0 : layer === "water" ? 10 : layer === "road" ? 20 : layer === "vfx" ? 1000 : 100;
    object.setDepth(base + (DYNAMIC_LAYERS.has(layer) ? screenY : 0) + bias);
    this.layers[layer].push(object);
    this.root.add(object);
    return object;
  }

  private graphics(layer: CityLayer, screenY = 0, bias = 0) {
    return this.add(this.scene.add.graphics(), layer, screenY, bias);
  }

  private createBackdrop() {
    const sky=this.graphics("ground");
    sky.fillGradientStyle(
      this.district===3?0x66b9ef:0x7ad7fb,
      this.district===3?0x66b9ef:0x7ad7fb,
      0xe9fbff,0xe9fbff,1
    );
    sky.fillRoundedRect(13,139,W-26,374,21);

    // Blocky clouds.
    sky.fillStyle(0xffffff,0.74);
    [[44,184,1],[294,195,.82]].forEach(([x,y,s])=>{
      const ss=Number(s);
      sky.fillRect(Number(x),Number(y),56*ss,15*ss);
      sky.fillRect(Number(x)+13*ss,Number(y)-11*ss,30*ss,14*ss);
      sky.fillRect(Number(x)+38*ss,Number(y)-5*ss,27*ss,14*ss);
    });

    // Distant voxel cliffs / skyline, drawn from scratch.
    const distant=this.graphics("ground",0,-1);
    const hillColor=this.district===3?0x6b86bd:0x66b978;
    distant.fillStyle(hillColor,0.42);
    for(let i=0;i<7;i++){
      const x=18+i*58, h=32+(i%3)*18;
      distant.fillRect(x,292-h,48,h);
      distant.fillStyle(0xffffff,0.18).fillRect(x+8,300-h,10,4);
      distant.fillStyle(hillColor,0.42);
    }
    distant.fillStyle(0x6fc867,0.5).fillTriangle(0,310,74,248,146,310).fillTriangle(240,310,316,238,390,310);

    const water=this.graphics("water").setDepth(-0.25);
    water.fillStyle(this.district===3?0x45acd5:0x18bff0,0.88).fillRect(14,302,W-28,210);
    water.fillStyle(0x0c84bd,0.3).fillRect(14,430,W-28,82);
    for(let i=0;i<9;i++){
      const shimmer=this.scene.add.rectangle(30+i*43,326+(i%4)*42,28+(i%3)*9,2,0xffffff,0.34);
      this.add(shimmer,"water");
      this.ambientTargets.push(shimmer);
      this.scene.tweens.add({targets:shimmer,x:shimmer.x+10,alpha:0.08,duration:1550+i*140,yoyo:true,repeat:-1,delay:i*110,ease:"Sine.InOut"});
    }

    // Original distant landmarks, never sampled from reference art.
    if(this.district===2){
      this.add(createVoxelBoat(this.scene,321,323,.45) as unknown as WorldObject,"vehicle",323,-12);
      this.add(createVoxelBoat(this.scene,74,338,.38) as unknown as WorldObject,"vehicle",338,-12);
    }
    if(this.district===3){
      const wheel=createFerrisWheel(this.scene,334,330,.43);
      this.add(wheel as unknown as WorldObject,"prop",330,-10);
    }
  }

  private isoDiamond(g: Phaser.GameObjects.Graphics, x: number, y: number, width: number, height: number, color: number, side = 0x3d8f64) {
    g.fillStyle(0x0c5278, 0.2); g.fillEllipse(x, y + height * 0.62, width * 0.94, height * 0.45);
    g.fillStyle(side, 1);
    g.beginPath(); g.moveTo(x - width / 2, y); g.lineTo(x, y + height / 2); g.lineTo(x + width / 2, y); g.lineTo(x + width / 2, y + 12); g.lineTo(x, y + height / 2 + 13); g.lineTo(x - width / 2, y + 12); g.closePath(); g.fillPath();
    g.fillStyle(color, 1);
    g.beginPath(); g.moveTo(x, y - height / 2); g.lineTo(x + width / 2, y); g.lineTo(x, y + height / 2); g.lineTo(x - width / 2, y); g.closePath(); g.fillPath();
    g.lineStyle(2, 0xb8f3a8, 0.58); g.strokePath();
    g.fillStyle(0xffffff, 0.07).fillPoints([{x, y: y - height / 2}, {x: x + width / 2, y}, {x, y: y + height / 2}], true);
    g.lineStyle(3, 0xd4f6ad, 0.7).lineBetween(x - width / 2, y, x, y - height / 2);
    g.lineStyle(3, 0x1f6c61, 0.25).lineBetween(x, y + height / 2 + 11, x + width / 2, y + 11);
  }

  private addIsland(top: number, side: number) {
    const island = this.graphics("ground");
    this.isoDiamond(island, W / 2, 397, 362, 196, top, side);
    const grass = this.graphics("ground", 0, 1);
    for (let i = 0; i < 17; i += 1) {
      const x = 40 + (i * 43) % 315;
      const y = 343 + ((i * 29) % 110);
      grass.fillStyle(i % 2 ? 0x5cc761 : 0x83dc6d, 0.72);
      grass.fillPoints([{x, y: y - 3}, {x: x + 7, y}, {x, y: y + 3}, {x: x - 7, y}], true);
    }
  }

  /** Original voxel dressing. Names are semantic only; nothing is sampled from the reference images. */
  private addReferenceDressing(items: Array<[string, number, number, number, number]>) {
    items.forEach(([name, x, y, w, h]) => {
      let object: Phaser.GameObjects.GameObject & Phaser.GameObjects.Components.Depth;
      if (name === 'tree' || name === 'palm') {
        object = createVoxelTree(this.scene, x, y, Math.max(0.45, w / 70), name === 'palm' ? 'desert' : 'grass') as unknown as WorldObject;
      } else if (['house','cafe','shopfront','apartment','office','lighthouse'].includes(name)) {
        const kind = name === 'shopfront' ? 'cafe' : name as 'house'|'cafe'|'apartment'|'office'|'lighthouse';
        object = createVoxelBuilding(this.scene, kind, 2, Math.max(0.48, w / 80)).setPosition(x,y) as unknown as WorldObject;
      } else if (name === 'wheel') {
        const wheel = this.scene.add.container(x,y);
        const g = this.scene.add.graphics();
        g.lineStyle(4,0xe7f7ff,1).strokeCircle(0,-22,26);
        g.lineStyle(2,0xff6d71,1);
        for(let i=0;i<8;i++){ const a=i*Math.PI/4; g.lineBetween(0,-22,Math.cos(a)*26,-22+Math.sin(a)*26); }
        g.fillStyle(0xffd33d).fillCircle(0,-22,6);
        g.fillStyle(0x375b75).fillRect(-3,4,6,22);
        wheel.add(g); object = wheel as unknown as WorldObject;
      } else if (name === 'sailboat') {
        object = this.scene.add.image(x,y,TEXTURE_KEYS.boat).setOrigin(0.5,1).setScale(Math.max(0.6,w/55)) as unknown as WorldObject;
      } else if (name === 'bench') {
        object = this.scene.add.image(x,y,TEXTURE_KEYS.bench).setOrigin(0.5,1).setScale(Math.max(0.55,w/45)) as unknown as WorldObject;
      } else if (name === 'lamp') {
        object = this.scene.add.image(x,y,TEXTURE_KEYS.lamp).setOrigin(0.5,1).setScale(Math.max(0.55,w/24)) as unknown as WorldObject;
      } else if (name === 'bridge') {
        const bridge = this.scene.add.container(x,y);
        const g = this.scene.add.graphics();
        g.fillStyle(0xc79b65).fillRect(-w/2,-8,w,16);
        g.fillStyle(0x805535).fillRect(-w/2,8,w,6);
        for(let i=0;i<5;i++) g.fillStyle(0xe4bd80).fillRect(-w/2+8+i*(w-16)/4,-14,5,28);
        bridge.add(g); object = bridge as unknown as WorldObject;
      } else {
        const tile = voxelGroundTile(this.scene,x,y,w,h,0x62c95c);
        object = tile as unknown as WorldObject;
      }
      this.add(object, name === 'sailboat' ? 'vehicle' : 'prop', y, -2);
    });
  }

  private addReferenceGroundTiles() {
    const tiles: Array<[number, number]> = [[93,374],[195,374],[297,374],[93,425],[195,425],[297,425]];
    tiles.forEach(([x,y],i)=>{
      const tile = voxelGroundTile(this.scene,x,y,102,72,i%2?0x63c55b:0x71d267,0x7c5637).setAlpha(0.9);
      this.add(tile as unknown as WorldObject,'ground',y,3);
    });
  }

  private addReferenceRoadTiles(items: Array<[number, number, number]>) {
    items.forEach(([x,y,angle])=>{
      const road = this.scene.add.container(x,y).setAngle(angle);
      const g = this.scene.add.graphics();
      g.fillStyle(0x48525f).fillRect(-40,-9,80,18);
      g.fillStyle(0xd9d3bd).fillRect(-40,-13,80,4).fillRect(-40,9,80,4);
      g.fillStyle(0xffe77a).fillRect(-5,-1,10,2);
      road.add(g);
      this.add(road as unknown as WorldObject,'road',y,1);
    });
  }

  private createStarterStreet() {
    this.addIsland(0x75d66d, 0x3b9a5e);
    this.addReferenceGroundTiles();
    const road = this.graphics("road");
    road.lineStyle(30, 0x27656b, 0.32); road.lineBetween(64, 356, 326, 487); road.lineBetween(319, 348, 73, 472);
    road.lineStyle(27, 0xe8e3cc, 1); road.lineBetween(64, 352, 326, 483); road.lineBetween(319, 344, 73, 468);
    road.lineStyle(19, 0x63758a, 1); road.lineBetween(64, 352, 326, 483); road.lineBetween(319, 344, 73, 468);
    road.lineStyle(2, 0xffe98b, 0.85); road.lineBetween(67, 353, 324, 481); road.lineBetween(317, 346, 75, 467);
    for (let i = 0; i < 8; i += 1) {
      road.lineStyle(3, 0xffffff, 0.7); road.lineBetween(94 + i * 28, 370 + i * 14, 106 + i * 28, 376 + i * 14);
    }
    this.addReferenceRoadTiles([[111, 376, 26], [187, 414, 26], [267, 454, 26], [278, 374, -27], [201, 412, -27], [122, 452, -27]]);

    this.addHouse(85, 354, 56, 58, 0xff8a74, 0xc34f4f, 0xffd18f);
    this.addHouse(301, 397, 62, 78, 0x56a7d6, 0x327ca8, 0x9be6ef);
    this.addHouse(286, 471, 52, 53, 0xb18be2, 0x775db5, 0xf2c6ed);
    this.addHouse(203, 326, 49, 45, 0xf7c66c, 0xb8813f, 0xffe4a8);
    this.addReferenceDressing([
      ['cafe', 133, 342, 48, 72], ['apartment', 245, 350, 42, 68],
      ['house', 52, 386, 45, 58], ['shopfront', 152, 383, 40, 58],
      ['apartment', 339, 447, 38, 62], ['house', 223, 474, 38, 51],
      ['tree', 128, 444, 38, 46], ['tree', 246, 462, 36, 44],
      ['tree', 351, 386, 32, 39], ['palm', 54, 455, 34, 42],
      ['bench', 141, 419, 39, 30], ['bench', 305, 429, 34, 26],
      ['lamp', 256, 401, 22, 38], ['lamp', 169, 462, 20, 36],
      ['lighthouse', 48, 337, 34, 52], ['wheel', 338, 365, 48, 54],
      ['bridge', 102, 492, 70, 61], ['sailboat', 334, 337, 35, 43],
    ]);
    this.placeBuilding("coffee", this.createCoffee(this.stages.coffee));
    this.placeBuilding("park", this.createPark(this.stages.park));

    [[49, 408], [77, 480], [334, 434], [313, 493], [169, 327], [231, 315]].forEach(([x, y], i) => this.addTree(x, y, i % 3 === 0));
    this.addPropSprite(TEXTURE_KEYS.bench, 82, 430);
    this.addPropSprite(TEXTURE_KEYS.lamp, 105, 387);
    this.addPropSprite(TEXTURE_KEYS.lamp, 300, 447);
    this.addPropSprite(TEXTURE_KEYS.flower, 267, 334);
    this.addPropSprite(TEXTURE_KEYS.flower, 278, 338);
    this.addVehicle(TEXTURE_KEYS.carGold, 93, 374, 278, 467, 0);
    this.addVehicle(TEXTURE_KEYS.carBlue, 307, 361, 112, 459, 1300);
    this.addNpc(TEXTURE_KEYS.npcBlue, 111, 416, 157, 438, 500);
    this.addNpc(TEXTURE_KEYS.npcPink, 270, 420, 241, 435, 1800);
    this.addNpc(TEXTURE_KEYS.npcGold, 210, 348, 225, 356, 900);
    this.addBirds();
  }

  private createRiverside() {
    this.addIsland(0x6dcd70, 0x39946d);
    this.addReferenceGroundTiles();
    const inlet = this.graphics("water", 0, 2);
    inlet.fillStyle(0x21b7e8, 1);
    inlet.beginPath(); inlet.moveTo(52, 414); inlet.lineTo(172, 476); inlet.lineTo(340, 391); inlet.lineTo(221, 331); inlet.closePath(); inlet.fillPath();
    inlet.lineStyle(2, 0xc8f8ff, 0.66);
    for (let i = 0; i < 5; i += 1) inlet.lineBetween(92 + i * 44, 409 - i * 22, 132 + i * 44, 429 - i * 22);
    const board = this.graphics("road");
    board.lineStyle(25, 0xf0d3a1, 1); board.lineBetween(79, 374, 306, 486);
    board.lineStyle(17, 0xc88a55, 1); board.lineBetween(79, 374, 306, 486);
    for (let i = 0; i < 11; i += 1) board.lineStyle(1, 0x84552f, 0.55).lineBetween(89 + i * 18, 375 + i * 9, 80 + i * 18, 390 + i * 9);

    this.addHouse(84, 349, 55, 62, 0xff8773, 0xc65350, 0xffcf8a);
    this.addHouse(318, 414, 58, 80, 0x7397ca, 0x4d6da4, 0xd4edff);
    this.addReferenceDressing([
      ['cafe', 135, 356, 48, 72], ['apartment', 251, 350, 44, 72],
      ['house', 55, 395, 43, 55], ['shopfront', 181, 356, 39, 57],
      ['apartment', 345, 438, 37, 61], ['house', 236, 472, 38, 50],
      ['lighthouse', 334, 331, 38, 58], ['wheel', 286, 392, 54, 61],
      ['palm', 63, 420, 34, 43], ['palm', 323, 452, 32, 41],
      ['tree', 156, 462, 31, 38], ['tree', 351, 390, 30, 37],
      ['sailboat', 114, 392, 32, 39], ['sailboat', 274, 455, 29, 36],
      ['bench', 199, 448, 38, 29], ['lamp', 308, 416, 20, 35],
    ]);
    this.placeBuilding("market", this.createMarket(this.stages.market));
    this.placeBuilding("boardwalk", this.createBoardwalk(this.stages.boardwalk));
    [[52, 453], [78, 492], [329, 357], [340, 471], [179, 320]].forEach(([x, y], i) => this.addTree(x, y, i % 2 === 0));
    this.addPropSprite(TEXTURE_KEYS.lamp, 116, 403);
    this.addPropSprite(TEXTURE_KEYS.lamp, 215, 452);
    this.addPropSprite(TEXTURE_KEYS.bench, 303, 465);
    this.addBoat(169, 412, 236, 379, 0);
    this.addBoat(285, 411, 220, 444, 2100);
    this.addNpc(TEXTURE_KEYS.npcPink, 94, 395, 147, 420, 600);
    this.addNpc(TEXTURE_KEYS.npcGold, 278, 463, 235, 445, 1300);
    this.addBirds();
  }

  private createSkyline() {
    this.addIsland(0x74c985, 0x447a77);
    this.addReferenceGroundTiles();
    const road = this.graphics("road");
    road.lineStyle(28, 0xd9e8ec, 1); road.lineBetween(49, 474, 337, 330);
    road.lineStyle(18, 0x596b82, 1); road.lineBetween(49, 474, 337, 330);
    road.lineStyle(3, 0x5be2f0, 0.7); road.lineBetween(57, 475, 340, 333);
    this.addHouse(82, 420, 56, 95, 0x7199c7, 0x456a9d, 0xb8eaf5, true);
    this.addHouse(315, 444, 57, 119, 0x857fbd, 0x5c5790, 0xe0cef5, true);
    this.addHouse(244, 328, 50, 75, 0x54b7c5, 0x337d92, 0xa7edf0, true);
    this.addReferenceDressing([
      ['office', 138, 363, 48, 88], ['apartment', 195, 337, 42, 70],
      ['office', 346, 395, 39, 73], ['apartment', 62, 397, 39, 65],
      ['cafe', 296, 382, 44, 66], ['shopfront', 246, 458, 38, 55],
      ['tree', 54, 447, 34, 41], ['tree', 330, 409, 34, 41],
      ['tree', 145, 468, 29, 35], ['lamp', 205, 454, 22, 38],
      ['lamp', 301, 440, 20, 35], ['wheel', 274, 458, 52, 58],
    ]);
    this.placeBuilding("tower", this.createTower(this.stages.tower));
    this.placeBuilding("garden", this.createGarden(this.stages.garden));
    [[48, 485], [340, 464], [120, 338], [286, 321]].forEach(([x, y]) => this.addTree(x, y, true));
    this.addPropSprite(TEXTURE_KEYS.lamp, 91, 454);
    this.addPropSprite(TEXTURE_KEYS.lamp, 286, 361);
    this.addVehicle(TEXTURE_KEYS.carPink, 70, 462, 310, 342, 0);
    this.addVehicle(TEXTURE_KEYS.carBlue, 320, 353, 103, 462, 1600);
    this.addNpc(TEXTURE_KEYS.npcBlue, 229, 389, 262, 372, 800);
    this.addNpc(TEXTURE_KEYS.npcPink, 111, 430, 140, 414, 1800);
    this.addMetro();
    this.addBirds();
  }

  private placeBuilding(key: BuildingKey, building: Phaser.GameObjects.Container) {
    const point = BUILDING_POINTS[key];
    const stage = this.stages[key];
    if (!stage) {
      building.setAlpha(0.66);
      const blueprint = this.scene.add.graphics();
      blueprint.lineStyle(2,0x9beaff,0.8).strokeRect(-42,-66,84,62);
      blueprint.lineStyle(1,0x9beaff,0.45).lineBetween(-42,-35,42,-35).lineBetween(0,-66,0,-4);
      building.add(blueprint);
    }
    building.setPosition(point.x, point.y).setDepth(100 + point.y);
    building.setSize(key === "tower" ? 96 : 108, key === "tower" ? 170 : 126).setInteractive({ useHandCursor: true });
    building.on("pointerup", () => this.onSelect(key));
    this.add(building as unknown as WorldObject, "building", point.y);
    const tagY = stage ? (key === 'tower' ? -165 : -92) : -39;
    const tag = this.scene.add.container(0, tagY);
    const plate = this.scene.add.graphics();
    plate.fillStyle(0x103d65, 0.22).fillRoundedRect(-34, -10, 68, 25, 9);
    plate.fillStyle(0x124776).fillRoundedRect(-34, -13, 68, 24, 9);
    plate.lineStyle(2, 0xffffff, 0.95).strokeRoundedRect(-34, -13, 68, 24, 9);
    plate.fillStyle(0x124776).fillTriangle(-4, 11, 4, 11, 0, 16);
    tag.add([plate, text(this.scene, stage && stage < 3 ? -7 : 0, -1, stage ? `Lv. ${stage}` : 'BUILD', 12, '#ffffff', '700')]);
    if (stage && stage < 3) tag.add(text(this.scene, 22, -1, '↑', 18, '#adf36c'));
    building.add(tag);
    this.buildings.set(key, building);
  }

  private addHouse(x: number, y: number, width: number, height: number, front: number, side: number, roof: number, modern = false) {
    const building = createVoxelBuilding(this.scene, modern ? 'apartment' : 'house', modern ? 2 : 1, Math.max(0.62, width / 76));
    building.setPosition(x, y);
    this.add(building as unknown as WorldObject, "building", y);
  }

  private toyBuilding(width: number, depth: number, height: number, front: number, side: number, roof: number, windowRows = 2) {
    const c = this.scene.add.container(0, 0);
    const g = this.scene.add.graphics();
    g.fillStyle(0x0a496b, 0.17); g.fillEllipse(0, depth + 8, width * 1.05, depth * 0.7);
    g.fillStyle(front, 1); g.beginPath(); g.moveTo(0, -height + depth / 2); g.lineTo(width / 2, -height + depth); g.lineTo(width / 2, depth); g.lineTo(0, depth / 2); g.closePath(); g.fillPath();
    g.fillStyle(side, 1); g.beginPath(); g.moveTo(-width / 2, -height + depth); g.lineTo(0, -height + depth / 2); g.lineTo(0, depth / 2); g.lineTo(-width / 2, depth); g.closePath(); g.fillPath();
    g.fillStyle(roof, 1); g.beginPath(); g.moveTo(0, -height); g.lineTo(width / 2, -height + depth / 2); g.lineTo(0, -height + depth); g.lineTo(-width / 2, -height + depth / 2); g.closePath(); g.fillPath();
    g.lineStyle(2, 0xffffff, 0.38); g.beginPath(); g.moveTo(0, -height + 2); g.lineTo(width / 2 - 2, -height + depth / 2); g.strokePath();
    g.fillStyle(0xcff7ff, 0.95);
    for (let row = 0; row < windowRows; row += 1) {
      const wy = -height + depth + 13 + row * Math.max(14, (height - depth - 20) / Math.max(1, windowRows));
      if (wy > 4) break;
      g.fillRoundedRect(8, wy, Math.max(8, width * 0.17), 8, 2);
      g.fillRoundedRect(-width / 2 + 7, wy + 4, Math.max(7, width * 0.14), 7, 2);
      g.fillStyle(0xffffff, 0.55); g.fillRect(10, wy + 1, 3, 5); g.fillStyle(0xcff7ff, 0.95);
    }
    g.fillStyle(0x31516b, 1); g.fillRoundedRect(4, 2, 12, depth - 1, 2);
    c.add(g);
    return c;
  }

  private constructionLot(width: number, depth: number) {
    const c=this.scene.add.container(0,0),g=this.scene.add.graphics();
    for(let ry=0;ry<3;ry++) for(let rx=0;rx<4;rx++){
      const x=(rx-ry)*18, y=(rx+ry)*9;
      addIsoCube(g,x,y,20,11,10,(rx+ry)%2?0x9a7248:0xa78355);
    }
    // stacked timber/crates signal a construction plot without using photo/sheet assets
    addIsoCube(g,-22,-4,22,12,16,0xb66d36); addIsoCube(g,18,5,18,10,14,0xc37a3b);
    g.lineStyle(3,0xf2d19b,0.8).lineBetween(-38,-18,34,19);
    c.add(g);
    return c;
  }

  private createCoffee(stage: number) {
    if (stage <= 0) return this.constructionLot(92, 50);
    const height = stage === 1 ? 44 : stage === 2 ? 60 : 72;
    const c = createVoxelBuilding(this.scene, 'cafe', stage, 1.08);
    const g = this.scene.add.graphics();
    if (stage >= 2) {
      g.fillStyle(0x173f63, 1); g.fillRoundedRect(8, -24, 19, 23, 3); g.fillRoundedRect(-31, -20, 17, 18, 3);
      g.fillStyle(0xffffff, 0.75); g.fillRect(11, -21, 6, 14); g.fillRect(-28, -17, 5, 11);
      g.fillStyle(0xf55f55, 1); g.fillRoundedRect(-39, -height + 30, 78, 10, 3);
      for (let x = -31; x < 34; x += 16) { g.fillStyle((x / 16) % 2 ? 0xffffff : 0xffd36c, 1); g.fillRect(x, -height + 31, 9, 9); }
    }
    if (stage >= 3) {
      const sign = text(this.scene, 0, -height - 2, "CAFÉ", 9, "#ffffff", "800").setBackgroundColor("#158f88").setPadding(7, 3, 7, 3);
      const table = this.scene.add.graphics(); table.fillStyle(0x875438, 1); table.fillCircle(48, 7, 7); table.fillRect(46, 9, 4, 10); table.fillStyle(0x2d7961, 1); table.fillRoundedRect(37, 13, 7, 8, 2); table.fillRoundedRect(52, 13, 7, 8, 2);
      const plant = this.scene.add.image(-45, 4, TEXTURE_KEYS.flower).setScale(1.1);
      c.add([g, sign, table, plant]);
      const steamA = this.scene.add.circle(20, -27, 2, 0xffffff, 0.8);
      const steamB = this.scene.add.circle(25, -30, 1.5, 0xffffff, 0.65);
      c.add([steamA, steamB]);
      this.ambientTargets.push(steamA, steamB);
      this.scene.tweens.add({ targets: [steamA, steamB], y: "-=15", x: "+=3", alpha: 0, duration: 1300, delay: 180, repeat: -1, repeatDelay: 850 });
      return c;
    }
    c.add(g);
    return c;
  }

  private createPark(stage: number) {
    const c=this.scene.add.container(0,0),g=this.scene.add.graphics();
    // 4x3 grass-block park platform
    for(let ry=0;ry<3;ry++) for(let rx=0;rx<4;rx++){
      const x=(rx-ry)*20, y=(rx+ry)*10;
      addIsoCube(g,x,y,22,12,10,stage?0x5fc85d:0x9b7650);
    }
    if(stage<=0){
      addIsoCube(g,-18,-2,22,12,15,0xb7743e);
      c.add(g); return c;
    }
    // light stone path across the park
    for(let i=-2;i<=2;i++) addIsoCube(g,i*18,i*3,18,10,5,0xd9c99f);
    c.add(g);
    const count=stage===1?2:stage===2?3:4;
    [[-32,-8],[28,4],[-10,-23],[11,20]].slice(0,count).forEach(([x,y],i)=>{
      const tree=createVoxelTree(this.scene,x,y+8,0.52+i*0.02,'grass'); c.add(tree); this.ambientTargets.push(tree);
    });
    if(stage>=2){
      const bench=this.scene.add.graphics(); addIsoCube(bench,7,17,30,13,8,0xa76636); addIsoCube(bench,7,5,30,9,8,0xbb7a43); c.add(bench);
    }
    if(stage>=3){
      const fountain=this.scene.add.graphics();
      addIsoCube(fountain,0,2,28,16,7,0xa9bac0); addIsoCube(fountain,0,-4,16,9,8,0x5ccdea);
      fountain.fillStyle(0xcdfaff,0.9).fillRect(-2,-17,4,14);
      c.add(fountain);
    }
    return c;
  }

  private createMarket(stage: number) {
    if (stage <= 0) return this.constructionLot(96, 51);
    const c = createVoxelBuilding(this.scene, 'market', stage, 1.02);
    const lot = this.scene.add.graphics();
    const count = stage === 1 ? 2 : stage === 2 ? 4 : 5;
    const spots = [[-25, -3], [12, 7], [-3, -17], [31, -10], [-30, 15]];
    spots.slice(0, count).forEach(([x, y], i) => {
      const stall = this.scene.add.graphics(); stall.fillStyle(0x7f563c, 1); stall.fillRoundedRect(x - 11, y - 5, 22, 17, 2); stall.fillStyle(i % 2 ? 0x35b9c9 : 0xff705f, 1); stall.fillTriangle(x - 15, y - 5, x + 15, y - 5, x, y - 20); stall.fillStyle(0xffda68, 1); stall.fillCircle(x - 5, y + 2, 3); stall.fillCircle(x + 4, y + 3, 3); c.add(stall);
    });
    if (stage >= 2) c.add(this.scene.add.image(43, 13, TEXTURE_KEYS.crate).setScale(0.7));
    if (stage >= 3) {
      const lights = this.scene.add.graphics(); lights.lineStyle(2, 0xffe49a, 0.8); lights.lineBetween(-43, -27, 43, -29); for (let x = -36; x <= 36; x += 12) { lights.fillStyle(0xffd45a, 1); lights.fillCircle(x, -26 + (x % 3), 3); } c.add(lights);
      this.scene.tweens.add({ targets: lights, alpha: 0.62, duration: 800, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    }
    return c;
  }

  private createBoardwalk(stage: number) {
    if(stage<=0) return this.constructionLot(98,50);
    const c=this.scene.add.container(0,0),g=this.scene.add.graphics();
    // diagonal voxel pier made from wood planks
    for(let i=0;i<7;i++){
      const x=-44+i*14, y=17-i*7;
      addIsoCube(g,x,y,24,12,8,i%2?0xb7743e:0xc88449);
      if(i%2===0) addIsoCube(g,x,y+10,7,5,18,0x75462c);
    }
    c.add(g);
    if(stage>=2){
      [-26,4,32].forEach((x,i)=>{
        const lamp=this.scene.add.graphics();
        addIsoCube(lamp,x,4-i*11,6,4,27,0x43596a);
        lamp.fillStyle(0xffdd6b,0.9).fillRect(x-4,-27-i*11,8,8);
        c.add(lamp);
      });
    }
    if(stage>=3){
      const kiosk=createVoxelBuilding(this.scene,'cafe',1,0.42).setPosition(27,-4);
      c.add(kiosk);
      const flags=this.scene.add.graphics();
      flags.lineStyle(1,0xffffff,0.7).lineBetween(-45,-22,42,-36);
      [-36,-17,2,21,40].forEach((x,i)=>flags.fillStyle([0xff5b55,0xffd449,0x55cdef][i%3]).fillTriangle(x,-24-i*3,x+8,-27-i*3,x+4,-18-i*3));
      c.add(flags);
    }
    return c;
  }

  private createTower(stage: number) {
    if (stage <= 0) return this.constructionLot(96, 52);
    const height = stage === 1 ? 73 : stage === 2 ? 112 : 148;
    const c = createVoxelBuilding(this.scene, 'tower', stage, 1.02);
    if (stage >= 2) {
      const fins = this.scene.add.graphics(); fins.lineStyle(3, 0xe6fbff, 0.8); fins.lineBetween(4, -height + 18, 4, 8); fins.lineBetween(26, -height + 28, 26, 18); c.add(fins);
    }
    if (stage >= 3) {
      const beacon = this.scene.add.circle(0, -height - 12, 5, 0xffda57, 1); const mast = this.scene.add.rectangle(0, -height - 4, 3, 20, 0x31516b); c.add([mast, beacon]); this.scene.tweens.add({ targets: beacon, alpha: 0.35, scale: 1.35, duration: 780, yoyo: true, repeat: -1 });
    }
    return c;
  }

  private createGarden(stage: number) {
    const c=this.scene.add.container(0,0),g=this.scene.add.graphics();
    for(let ry=0;ry<3;ry++) for(let rx=0;rx<4;rx++){
      const x=(rx-ry)*20, y=(rx+ry)*10;
      addIsoCube(g,x,y,22,12,10,stage?0x6bc564:0x927250);
    }
    c.add(g);
    if(!stage){ addIsoCube(g,-20,2,20,11,14,0xb7743e); return c; }
    const count=stage===1?3:stage===2?5:7;
    const spots=[[-30,2],[-9,-11],[22,2],[35,-9],[7,16],[-24,17],[27,18]];
    spots.slice(0,count).forEach(([x,y],i)=>{
      const p=this.scene.add.graphics();
      addIsoCube(p,x,y+5,15,9,8,0x9a5c37);
      p.fillStyle(i%2?0x59d875:0x8adc62).fillRect(x-6,y-6,12,8);
      c.add(p);
    });
    if(stage>=2){
      const bench=this.scene.add.graphics(); addIsoCube(bench,-4,20,29,12,7,0xa86838); c.add(bench);
    }
    if(stage>=3){
      const tree=createVoxelTree(this.scene,38,-4,0.42,'grass'); c.add(tree);
      const lights=this.scene.add.graphics(); lights.lineStyle(1,0xffefb0,0.9).lineBetween(-43,-22,44,-18);
      for(let x=-36;x<40;x+=12) lights.fillStyle(0xffd75b).fillRect(x,-22,4,4);
      c.add(lights);
    }
    return c;
  }

  private addTree(x: number, y: number, pine = false) {
    const sprite = createVoxelTree(this.scene, x, y, 0.62, pine ? 'ice' : 'grass');
    this.add(sprite as unknown as WorldObject, "prop", y);
    this.ambientTargets.push(sprite);
    this.scene.tweens.add({ targets: sprite, angle: ((x + y) % 2 ? 1 : -1) * 1.2, duration: 2200 + ((x * y) % 700), yoyo: true, repeat: -1, delay: (x * 17) % 900, ease: "Sine.InOut" });
  }

  private addPropSprite(key: string, x: number, y: number) {
    const sprite = this.scene.add.image(x, y, key).setOrigin(0.5, 1);
    return this.add(sprite as unknown as WorldObject, "prop", y);
  }

  private addVehicle(key: string, x: number, y: number, toX: number, toY: number, delay: number) {
    const car = this.scene.add.image(x, y, key).setOrigin(0.5, 1).setScale(x > toX ? -0.76 : 0.76, 0.76);
    this.add(car as unknown as WorldObject, "vehicle", y, 2);
    this.ambientTargets.push(car);
    this.scene.tweens.add({ targets: car, x: toX, y: toY, duration: 7600 + delay * 0.3, delay, repeat: -1, repeatDelay: 1800 + delay * 0.25, onRepeat: () => car.setPosition(x, y), ease: "Linear" });
  }

  private addBoat(x: number, y: number, toX: number, toY: number, delay: number) {
    const boat = this.scene.add.image(x, y, TEXTURE_KEYS.boat).setOrigin(0.5, 1);
    this.add(boat as unknown as WorldObject, "vehicle", y, -3);
    this.ambientTargets.push(boat);
    this.scene.tweens.add({ targets: boat, x: toX, y: toY, angle: 2, duration: 8500, delay, yoyo: true, repeat: -1, repeatDelay: 900, ease: "Sine.InOut" });
  }

  private addNpc(key: string, x: number, y: number, toX: number, toY: number, delay: number) {
    const npc = this.scene.add.image(x, y, key).setOrigin(0.5, 1).setScale(0.72);
    this.add(npc as unknown as WorldObject, "character", y, 4);
    this.ambientTargets.push(npc);
    this.scene.tweens.add({ targets: npc, x: toX, y: toY, duration: 4600 + delay * 0.2, delay, yoyo: true, repeat: -1, repeatDelay: 1000 + delay * 0.3, ease: "Sine.InOut" });
    this.scene.tweens.add({ targets: npc, scaleY: 0.69, duration: 330, yoyo: true, repeat: -1, delay: delay % 500 });
  }

  private addBirds() {
    const birds = text(this.scene, 312, 229, "⌁  ⌁", 13, "#ffffff", "800").setAlpha(0.9);
    this.add(birds as unknown as WorldObject, "vfx");
    this.ambientTargets.push(birds);
    this.scene.tweens.add({ targets: birds, x: 246, y: 239, alpha: 0.35, duration: 7800, repeat: -1, repeatDelay: 2600, onRepeat: () => birds.setPosition(332, 221), ease: "Sine.InOut" });
  }

  private addMetro() {
    const train = this.scene.add.container(333, 309);
    const g = this.scene.add.graphics(); g.fillStyle(0x245a91, 0.18); g.fillEllipse(0, 11, 76, 8); g.fillStyle(0xeafaff, 1); g.fillRoundedRect(-34, -1, 68, 16, 7); g.fillStyle(0x25bfe1, 1); g.fillRoundedRect(-27, 2, 45, 7, 3); g.fillStyle(0xffd354, 1); g.fillCircle(27, 7, 3); train.add(g);
    train.setRotation(-0.45); this.add(train as unknown as WorldObject, "vehicle", 310, -10); this.ambientTargets.push(train);
    this.scene.tweens.add({ targets: train, x: 185, y: 382, duration: 6200, repeat: -1, repeatDelay: 3500, onRepeat: () => train.setPosition(350, 300), ease: "Sine.InOut" });
  }

  private startAmbientSort() {
    const timer = this.scene.time.addEvent({ delay: 220, loop: true, callback: () => {
      if (this.destroyed) return;
      [...this.layers.vehicle, ...this.layers.character].forEach((object) => {
        const positioned = object as unknown as { y: number; setDepth: (depth: number) => unknown };
        positioned.setDepth(100 + positioned.y + 4);
      });
      this.root.sort("depth");
    } });
    this.timers.push(timer);
  }

  getTarget(key: BuildingKey) {
    return BUILDING_POINTS[key].clone().add(new Phaser.Math.Vector2(0, this.offsetY));
  }

  select(key: BuildingKey) {
    this.selection?.destroy(true);
    const point = BUILDING_POINTS[key];
    const c = this.scene.add.container(point.x, point.y + 16).setDepth(995);
    const ring = this.scene.add.ellipse(0, 0, key === "tower" ? 105 : 116, 47, 0xffe45f, 0.16).setStrokeStyle(3, 0xffdb36, 0.9);
    const marker = text(this.scene, 0, key === "tower" ? -178 : -110, "▼", 16, "#ffcf24", "800");
    marker.setStroke("#ffffff", 3);
    c.add([ring, marker]);
    this.root.add(c); this.layers.vfx.push(c); this.selection = c;
    this.scene.tweens.add({ targets: ring, scaleX: 1.09, scaleY: 1.09, alpha: 0.42, duration: 920, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.scene.tweens.add({ targets: marker, y: marker.y - 7, duration: 720, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    this.root.sort("depth");
  }

  focus(key: BuildingKey) {
    const point = BUILDING_POINTS[key];
    this.scene.tweens.add({ targets: this.root, scale: 1.045, x: -(point.x - W / 2) * 0.08, y: this.offsetY + 3, duration: 380, ease: "Sine.Out" });
  }

  settle() {
    this.scene.tweens.add({ targets: this.root, scale: 1, x: 0, y: this.offsetY, duration: 520, ease: "Back.Out" });
  }

  upgrade(key: BuildingKey, stage: number) {
    this.stages[key] = stage;
    const old = this.buildings.get(key);
    if (old) {
      this.root.remove(old, true);
      this.buildings.delete(key);
    }
    const building = key === "coffee" ? this.createCoffee(stage)
      : key === "park" ? this.createPark(stage)
        : key === "market" ? this.createMarket(stage)
          : key === "boardwalk" ? this.createBoardwalk(stage)
            : key === "tower" ? this.createTower(stage)
              : this.createGarden(stage);
    this.placeBuilding(key, building);
    building.setScale(0.1, 0.05).setAlpha(0.15);
    this.scene.tweens.add({ targets: building, scaleX: 1, scaleY: 1, alpha: 1, duration: 620, ease: "Back.Out" });
    this.select(key);
    this.root.sort("depth");
    return building;
  }

  celebrateDistrict() {
    this.layers.prop.forEach((object, index) => {
      const target = object as unknown as Phaser.GameObjects.Components.Transform & Phaser.GameObjects.Components.Alpha;
      this.scene.tweens.add({ targets: target, scaleX: "*=1.08", scaleY: "*=1.08", duration: 260, yoyo: true, delay: index * 25, ease: "Back.Out" });
    });
    for (let i = 0; i < 18; i += 1) {
      const particle = this.scene.add.rectangle(W / 2, 320, 5, 9, [0xffd634, 0x52dc85, 0x45c8ef, 0xff7586][i % 4], 1).setAngle(i * 23);
      this.add(particle as unknown as WorldObject, "vfx");
      this.scene.tweens.add({ targets: particle, x: 45 + ((i * 71) % 300), y: 460 + (i % 4) * 9, angle: particle.angle + 260, alpha: 0, duration: 1200 + (i % 5) * 90, ease: "Cubic.Out", onComplete: () => particle.destroy() });
    }
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.timers.forEach((timer) => timer.remove(false));
    this.ambientTargets.forEach((target) => this.scene.tweens.killTweensOf(target));
    this.scene.tweens.killTweensOf(this.root);
    this.root.destroy(true);
  }
}
