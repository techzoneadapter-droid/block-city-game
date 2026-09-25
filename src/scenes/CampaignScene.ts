import { boardHeader, rewardAmount } from '../ui/secondary';
import { referenceArt } from '../referenceArt';
import Phaser from "phaser";
import { bottomNavigation, addGradientBackground, button, COLORS, gameIcon, panel, progressBar,  text, W } from "../ui";
import { CHAPTERS, getChapterForLevel, getLevelDefinition, TOTAL_CAMPAIGN_LEVELS } from "../levels";
import { loadSave } from "../save";

const CHAPTER_COLORS = [0x4dcc79, 0x28c9df, 0x7898ed, 0xd98aff, 0x81d657, 0xffcc4c];

export class CampaignScene extends Phaser.Scene {
  constructor() { super("CampaignScene"); }

  create() {
    addGradientBackground(this);
    const save = loadSave();
    const chapter = getChapterForLevel(save.level);
    const definition = getLevelDefinition(save.level);
    const complete = save.level > TOTAL_CAMPAIGN_LEVELS;
    boardHeader(this, "CITY JOURNEY • 30 LEVELS", complete ? "Your city keeps growing" : chapter.name, save.coins, save.stars);

    // Six chapter badges retain the existing progression, without adding replay rules.
    CHAPTERS.forEach((item, i) => {
      const x = 42 + i * 61;
      const done = save.level > item.endLevel;
      const active = chapter.id === item.id;
      const badge = panel(this, x, 164, 48, 32, { fill: active ? COLORS.primary : done ? COLORS.mintDark : 0x91b8cd, stroke: active ? 0xffffff : 0xb8e7f8, radius: 13 });
      badge.add(text(this, 0, -1, String(item.id), 17, '#ffffff'));
    });

    const land = this.add.graphics();
    const topColor = CHAPTER_COLORS[chapter.id - 1];
    const islandTop = [
      [34, 250], [104, 205], [215, 194], [314, 223], [362, 286],
      [356, 406], [304, 474], [221, 510], [121, 492], [47, 447], [25, 356],
    ] as Array<[number, number]>;

    const polygon = (points: Array<[number, number]>, color: number) => {
      land.fillStyle(color).beginPath().moveTo(...points[0]);
      points.slice(1).forEach(([x, y]) => land.lineTo(x, y));
      land.closePath().fillPath();
    };
    // Stepped sandstone strata, with individually lit cliff faces and surf.
    land.fillStyle(0x00a8dc, .4).fillEllipse(194, 392, 372, 299);
    land.lineStyle(3, 0xc8faff, .7).strokeEllipse(194, 400, 374, 287);
    polygon(islandTop.map(([x, y]) => [x + 5, y + 28]), 0x138cad);
    for (let i = 0; i < islandTop.length; i++) {
      const [x, y] = islandTop[i];
      const [nx, ny] = islandTop[(i + 1) % islandTop.length];
      polygon([[x, y], [nx, ny], [nx, ny + 25], [x, y + 25]], i % 2 ? 0xc29161 : 0xe6bd85);
      land.lineStyle(1, 0x9f7855, .6).lineBetween(x, y + 12, nx, ny + 12);
      for (let t = .15; t < 1; t += .24) {
        const bx = x + (nx - x) * t, by = y + (ny - y) * t;
        land.lineStyle(2, 0xffedc3, .7).lineBetween(bx, by + 3, bx, by + 22);
      }
    }
    polygon(islandTop, 0xffefc0);
    const inset = islandTop.map(([x, y]) => [W / 2 + (x - W / 2) * .93, 356 + (y - 356) * .91]) as Array<[number, number]>;
    polygon(inset, topColor);
    // Raised garden terraces provide actual elevation under the landmarks.
    [[236, 234, 89, 53], [228, 408, 93, 58], [78, 222, 57, 36]].forEach(([x,y,w,h]) => {
      polygon([[x,y],[x+w,y-11],[x+w+10,y+h-12],[x+8,y+h]], 0xaf854e);
      polygon([[x,y-9],[x+w,y-20],[x+w+10,y+h-21],[x+8,y+h-9]], 0x99e052);
      land.lineStyle(2, 0xd8fa8f).lineBetween(x, y-9, x+w, y-20);
    });
    // Small grass tufts break up the terrain without a runtime bitmap.
    for (let i = 0; i < 40; i++) {
      const x = 58 + (i * 73) % 266, y = 239 + (i * 47) % 235;
      land.lineStyle(2, i % 2 ? 0xb1f16c : 0x35b965, .7).lineBetween(x, y, x+4, y-3);
    }

    // Layered terraces stop the map from reading like one flat green card.
    [[146, 450], [185, 467], [335, 308], [109, 219], [62, 356], [290, 245]]
      .forEach(([x, y], i) => referenceArt(this, x, y, 'grass', i % 2 ? 42 : 48, i % 2 ? 31 : 36));
    this.chapterScenery(chapter.id);
    [[42, 266], [345, 390], [175, 219], [37, 463]].forEach(([x, y]) => referenceArt(this, x, y, chapter.id === 2 ? 'palm' : 'tree', 36, 43));
    const points = [[83, 421], [167, 360], [84, 293], [198, 270], [294, 333]];
    const road = this.add.graphics();
    [ [24, 0x367969], [19, 0xc09d6c], [14, 0xffedc3], [2, 0xfff8df] ].forEach(([width, color]) => {
      road.lineStyle(width, color, 1).beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => road.lineTo(x, y)); road.strokePath();
    });
    points.forEach(([x, y], i) => {
      const level = chapter.startLevel + i;
      const done = level < save.level;
      const active = level === save.level;
      const locked = !done && !active;
      const color = active ? COLORS.gold : done ? COLORS.mintDark : 0x7399b4;
      this.add.circle(x, y + 7, active ? 33 : locked ? 22 : 27, 0x0b5275, 0.45);
      const node = this.add.circle(x, y, active ? 33 : locked ? 22 : 27, color).setStrokeStyle(3, 0xffffff);
      this.add.arc(x, y, locked ? 17 : 22, 210, 310, false, 0xffffff, 0).setStrokeStyle(3, 0xffffff, 0.45);
      if (locked) gameIcon(this, x, y, 'lock', 23);
      else text(this, x, y, String(level), 22, active ? '#153863' : '#ffffff');
      if (done) {
        panel(this, x, y + 35, 58, 21, { fill: 0x136759, stroke: 0xffd655, radius: 10, shadow: false });
        const medals = save.campaignMedals[String(level)] || 1;
        for (let m = 0; m < medals; m++) gameIcon(this, x + (m - (medals - 1) / 2) * 15, y + 35, 'star', 16);
      }
      if (i === 4) { gameIcon(this, x + 27, y - 26, 'trophy', 27); }
      if (i === 4) text(this, x, y + (done ? 60 : 44), 'FINALE', 11, '#123767').setBackgroundColor('#fff1b8').setPadding(6, 3);
      if (active) {
        const halo = this.add.circle(x, y, 40).setStrokeStyle(3, 0xfff6aa, .85);
        const next = text(this, x, y - 48, 'CURRENT', 12, '#ffffff', '800')
          .setBackgroundColor('#0757a0').setPadding(8, 5);
        this.tweens.add({ targets: halo, alpha: .35, scale: 1.09, duration: 900, yoyo: true, repeat: -1 });
        this.tweens.add({ targets: next, y: y - 52, duration: 900, yoyo: true, repeat: -1 });
      }
    });
    const cleared = Math.min(5, Math.max(0, save.level - chapter.startLevel));
    panel(this, W / 2, 550, 354, 43, {
      fill: 0xf8fdff,
      stroke: 0xbce9f8,
      radius: 14,
      shadowAlpha: 0.16,
    });
    text(this, 83, 540, 'DISTRICT', 11, '#5f7f9b', '800');
    text(this, 83, 556, `${cleared}/5`, 15, '#123767', '800');
    progressBar(this, 128, 550, 181, cleared / 5, COLORS.mint, 13);
    gameIcon(this, 338, 550, cleared >= 5 ? 'trophy' : 'city', 29);

    panel(this, W / 2, 640, 354, 114, { fill: COLORS.cream, stroke: definition.milestone ? COLORS.gold : COLORS.outline, radius: 21 });
    gameIcon(this, 54, 620, definition.milestone ? 'trophy' : 'puzzle', 43);
    text(this, 220, 601, `${complete ? 'MASTER' : 'LEVEL'} ${save.level} • ${definition.difficulty}`, 12, '#2674a8');
    const name = text(this, 220, 624, definition.label, 18);
    if (name.width > 263) name.setFontSize(15);
    const goals = [`${definition.targetLines} lines`];
    if (definition.targetPlacements) goals.push(`${definition.targetPlacements} blocks`);
    if (definition.targetCombo) goals.push(`Combo ${definition.targetCombo}`);
    if (definition.specialCells?.length) goals.push(`${definition.specialCells.length} debris`);
    if (definition.iceCells?.length) goals.push(`${definition.iceCells.length} ice`);
    text(this, W / 2, 652, goals.join(' • '), 13).setWordWrapWidth(310);
    rewardAmount(this, 76, 680, 'star', definition.rewardStars);
    rewardAmount(this, 136, 680, 'coin', definition.rewardCoins);
    text(this, 265, 680, `Score ${definition.scoreTarget}`, 13, '#956112');
    button(this, W / 2, 730, 314, 46, `PLAY ${complete ? 'MASTER ' : ''}LEVEL ${save.level}  ▶`, () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    bottomNavigation(this, 'CampaignScene', save.chestProgress >= 5 ? ['DailyScene'] : []);
  }
  private chapterScenery(chapter: number) {
    // Artwork stays outside the route; nodes are painted above this scenery.
    const scenes: Record<number, Array<[string, number, number, number, number]>> = {
      1: [['house', 252, 236, 73, 87], ['coffee', 325, 269, 62, 92], ['house', 252, 415, 71, 86], ['tree', 317, 445, 42, 51]],
      2: [['market', 280, 243, 113, 120], ['bridge', 252, 419, 106, 93], ['dock', 325, 453, 62, 45], ['sailboat', 331, 388, 43, 54], ['palm', 212, 218, 36, 43]],
      3: [['apartment', 239, 232, 56, 93], ['tower', 317, 250, 79, 119], ['road', 272, 452, 100, 45], ['office', 252, 400, 59, 107]],
      4: [['office', 249, 237, 65, 110], ['apartment', 326, 258, 56, 94], ['cafe', 253, 414, 69, 100], ['road', 310, 458, 76, 41]],
      5: [['garden', 287, 246, 103, 118], ['park', 259, 405, 124, 131], ['tree', 333, 429, 49, 60], ['house', 216, 225, 46, 58]],
      6: [['tower', 249, 237, 74, 113], ['lighthouse', 334, 262, 48, 76], ['wheel', 272, 410, 106, 119], ['sailboat', 337, 461, 39, 47]],
    };
    if (chapter === 2) this.add.graphics().fillStyle(0x16b8ee).fillRoundedRect(218, 376, 127, 96, 25);
    scenes[chapter].forEach(([name, x, y, w, h]) => referenceArt(this, x, y, name, w, h));
    referenceArt(this, 47, 350, chapter === 5 ? 'tree' : 'house', 44, 56);
    referenceArt(this, 156, 444, chapter === 2 ? 'palm' : chapter === 5 ? 'tree' : 'coffee', 42, 57);
    referenceArt(this, 111, 228, chapter >= 3 && chapter !== 5 ? 'apartment' : 'house', 40, 56);
    if (chapter === 4) {
      const neon = this.add.graphics();
      neon.lineStyle(3, 0xffa3e6).lineBetween(229, 287, 269, 287);
      neon.lineStyle(3, 0x94ffed).lineBetween(304, 307, 348, 307);
    }
    if (chapter === 6) gameIcon(this, 205, 458, 'trophy', 36);
  }
}
