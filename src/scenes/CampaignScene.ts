import { referenceArt, glossyFace } from '../referenceArt';
import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, button, COLORS, gameIcon, panel, progressBar, screenHeader, text, W } from "../ui";
import { CHAPTERS, getChapterForLevel, getLevelDefinition, TOTAL_CAMPAIGN_LEVELS } from "../levels";
import { loadSave } from "../save";

const CHAPTER_COLORS = [0x4dcc79, 0x28c9df, 0x7898ed, 0xd98aff, 0x81d657, 0xffcc4c];

export class CampaignScene extends Phaser.Scene {
  constructor() { super("CampaignScene"); }

  create() {
    coastalBackdrop(this);
    const save = loadSave();
    const chapter = getChapterForLevel(save.level);
    const definition = getLevelDefinition(save.level);
    const complete = save.level > TOTAL_CAMPAIGN_LEVELS;
    screenHeader(this, "CITY JOURNEY • 30 LEVELS", complete ? "Your city keeps growing" : chapter.name, save.coins, save.stars);

    // Six chapter badges retain the existing progression, without adding replay rules.
    CHAPTERS.forEach((item, i) => {
      const x = 42 + i * 61;
      const done = save.level > item.endLevel;
      const active = chapter.id === item.id;
      const badge = panel(this, x, 151, 48, 40, { fill: active ? COLORS.primary : done ? COLORS.mintDark : 0x91b8cd, stroke: active ? 0xffffff : 0xb8e7f8, radius: 13 });
      badge.add(text(this, 0, -1, done ? '✓' : String(item.id), 17, '#ffffff'));
    });

    const land = this.add.graphics();
    land.fillStyle(0x086e9e, 0.22).fillRoundedRect(18, 216, 354, 317, 80);
    land.fillStyle(0xe5c28a).fillRoundedRect(18, 205, 354, 312, 80);
    land.fillStyle(CHAPTER_COLORS[chapter.id - 1]).fillRoundedRect(18, 198, 354, 304, 80);
    const terrain = glossyFace(this, 344, 295, 76, CHAPTER_COLORS[chapter.id - 1], chapter.id === 4 ? 0x6560b7 : 0x35af78);
    terrain.setPosition(W / 2, 349);
    // Small grass terraces connect the kit buildings to the island coast.
    [[146, 450], [185, 467], [335, 308], [109, 219]].forEach(([x, y]) => referenceArt(this, x, y, 'grass', 45, 34));
    this.chapterScenery(chapter.id);
    [[42, 266], [345, 390], [175, 219], [37, 463]].forEach(([x, y]) => referenceArt(this, x, y, chapter.id === 2 ? 'palm' : 'tree', 36, 43));
    const points = [[83, 421], [167, 360], [84, 293], [198, 270], [294, 333]];
    const road = this.add.graphics();
    [ [24, 0x367969], [19, 0xc09d6c], [14, 0xffedc3], [2, 0xffffff] ].forEach(([width, color]) => {
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
        text(this, x, y + 35, '★'.repeat(save.campaignMedals[String(level)] || 1), 14, '#ffe477');
      }
      if (i === 4) { gameIcon(this, x + 27, y - 26, 'trophy', 27); }
      if (i === 4) text(this, x, y + (done ? 60 : 44), 'FINALE', 11, '#123767').setBackgroundColor('#fff1b8').setPadding(6, 3);
      if (active) {
        const next = text(this, x, y - 41, 'PLAY', 12, '#ffffff').setBackgroundColor('#f07326').setPadding(9, 4);
        node.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('PuzzleScene'));
        this.tweens.add({ targets: next, y: y - 45, duration: 750, yoyo: true, repeat: -1 });
      }
    });
    const cleared = Math.min(5, Math.max(0, save.level - chapter.startLevel));
    panel(this, W / 2, 521, 280, 35, { fill: 0xffffff, radius: 13 });
    text(this, 98, 520, `${cleared}/5 built`, 12);
    progressBar(this, 145, 521, 172, cleared / 5, COLORS.mint, 12);

    panel(this, W / 2, 620, 354, 137, { fill: COLORS.cream, stroke: definition.milestone ? COLORS.gold : COLORS.outline, radius: 21 });
    gameIcon(this, 52, 580, definition.milestone ? 'trophy' : 'puzzle', 43);
    text(this, 220, 567, `${complete ? 'MASTER' : 'LEVEL'} ${save.level} • ${definition.difficulty}`, 12, '#2674a8');
    const name = text(this, 220, 592, definition.label, 18);
    if (name.width > 263) name.setFontSize(15);
    const goals = [`${definition.targetLines} lines`];
    if (definition.targetPlacements) goals.push(`${definition.targetPlacements} blocks`);
    if (definition.targetCombo) goals.push(`Combo ${definition.targetCombo}`);
    if (definition.specialCells?.length) goals.push(`${definition.specialCells.length} debris`);
    if (definition.iceCells?.length) goals.push(`${definition.iceCells.length} ice`);
    text(this, W / 2, 623, goals.join(' • '), 12).setWordWrapWidth(310);
    text(this, W / 2, 662, `★ ${definition.rewardStars}   ● ${definition.rewardCoins}   •   Score ${definition.scoreTarget}`, 13, '#956112');
    button(this, W / 2, 724, 314, 52, `PLAY ${complete ? 'MASTER ' : ''}LEVEL ${save.level}  ▶`, () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    bottomNavigation(this, 'CampaignScene');
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
