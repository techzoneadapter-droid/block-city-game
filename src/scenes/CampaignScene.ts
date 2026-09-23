import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, button, COLORS, drawBuilding, gameIcon, panel, progressBar, screenHeader, text, W } from "../ui";
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
    land.fillStyle(0x086e9e, 0.22).fillRoundedRect(18, 216, 354, 297, 80);
    land.fillStyle(0xe5c28a).fillRoundedRect(18, 205, 354, 292, 80);
    land.fillStyle(CHAPTER_COLORS[chapter.id - 1]).fillRoundedRect(18, 198, 354, 284, 80);
    land.lineStyle(4, 0xe8ffc6, 0.6).strokeRoundedRect(23, 202, 344, 275, 76);
    this.chapterScenery(chapter.id);
    const landmark = this.add.graphics();
    // Small trees frame the path instead of covering nodes or labels.
    [[42, 270], [337, 370], [178, 220], [49, 454], [276, 476]].forEach(([x, y]) => {
      landmark.fillStyle(0x85582f).fillRect(x - 3, y, 6, 16);
      landmark.fillStyle(0x159d50).fillRoundedRect(x - 12, y - 18, 24, 27, 6);
      landmark.fillStyle(0x9af16b).fillRoundedRect(x - 9, y - 19, 16, 10, 3);
    });
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
      this.add.circle(x, y + 7, active ? 33 : 27, 0x0b5275, 0.45);
      const node = this.add.circle(x, y, active ? 33 : 27, color).setStrokeStyle(3, 0xffffff);
      this.add.arc(x, y, 22, 210, 310, false, 0xffffff, 0).setStrokeStyle(3, 0xffffff, 0.45);
      if (locked) gameIcon(this, x, y, 'lock', 29);
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
    panel(this, W / 2, 501, 280, 35, { fill: 0xffffff, radius: 13 });
    text(this, 98, 500, `${cleared}/5 built`, 12);
    progressBar(this, 145, 501, 172, cleared / 5, COLORS.mint, 12);

    panel(this, W / 2, 610, 354, 157, { fill: COLORS.cream, stroke: definition.milestone ? COLORS.gold : COLORS.outline, radius: 21 });
    gameIcon(this, 52, 565, definition.milestone ? 'trophy' : 'puzzle', 43);
    text(this, 220, 550, `${complete ? 'MASTER' : 'LEVEL'} ${save.level} • ${definition.difficulty}`, 12, '#2674a8');
    const name = text(this, 220, 577, definition.label, 18);
    if (name.width > 263) name.setFontSize(15);
    const goals = [`${definition.targetLines} lines`];
    if (definition.targetPlacements) goals.push(`${definition.targetPlacements} blocks`);
    if (definition.targetCombo) goals.push(`Combo ${definition.targetCombo}`);
    if (definition.specialCells?.length) goals.push(`${definition.specialCells.length} debris`);
    if (definition.iceCells?.length) goals.push(`${definition.iceCells.length} ice`);
    text(this, W / 2, 616, goals.join(' • '), 12).setWordWrapWidth(310);
    text(this, W / 2, 662, `★ ${definition.rewardStars}   ● ${definition.rewardCoins}   •   Score ${definition.scoreTarget}`, 13, '#956112');
    button(this, W / 2, 724, 314, 52, `PLAY ${complete ? 'MASTER ' : ''}LEVEL ${save.level}  ▶`, () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    bottomNavigation(this, 'CampaignScene');
  }
  private chapterScenery(chapter: number) {
    const g = this.add.graphics();
    const house = (x: number, y: number, height: number, roof: number, glass = false) => {
      drawBuilding(g, x, y, 35, 18, height, glass ? 0x8ae4ff : 0xffe5b4, glass ? 0x389dce : 0xe0ad71, roof);
      for (let row = 0; row < Math.floor(height / 13); row++) {
        g.fillStyle(glass ? 0xe1faff : 0x238dcc).fillRoundedRect(x + 6, y - height + 9 + row * 12, 7, 7, 1);
        g.fillRoundedRect(x + 19, y - height + 9 + row * 12, 7, 7, 1);
      }
    };
    // Each chapter keeps the same journey while its waterfront and landmark evolve.
    if (chapter === 2) {
      g.fillStyle(0x1baadd).fillRoundedRect(232, 377, 111, 81, 26);
      g.lineStyle(2, 0x9ceaff, 0.8);
      for (let i = 0; i < 4; i++) g.lineBetween(249, 392 + i * 14, 324, 392 + i * 14);
      g.fillStyle(0xb37b49).fillRoundedRect(220, 379, 29, 83, 5);
      for (let i = 0; i < 8; i++) g.lineStyle(2, 0xffd59a).lineBetween(223, 384 + i * 10, 246, 384 + i * 10);
    }
    if (chapter === 5) {
      g.fillStyle(0x55b878).fillEllipse(287, 421, 99, 58);
      g.fillStyle(0xd1fbea).fillRoundedRect(259, 379, 53, 42, 22);
      g.lineStyle(3, 0x349981).strokeRoundedRect(259, 379, 53, 42, 22);
      for (let i = 0; i < 4; i++) g.lineBetween(267 + i * 12, 386, 267 + i * 12, 415);
    }
    house(266, 260, chapter >= 3 && chapter !== 5 ? 69 : 39, chapter === 6 ? 0xffd55b : chapter === 4 ? 0xd669ef : 0x278ce0, chapter === 3 || chapter === 4);
    house(310, 281, chapter === 3 || chapter === 6 ? 75 : 29, chapter === 1 ? 0xf8785f : 0x26acaf, chapter === 3);
    if (chapter === 1 || chapter === 2) {
      g.fillStyle(0xff6c58).fillRect(268, 249, 31, 8);
      for (let i = 0; i < 3; i++) g.fillStyle(0xfff9dc).fillRect(269 + i * 11, 249, 5, 8);
    }
    if (chapter === 3) {
      g.fillStyle(0x607da6).fillRoundedRect(228, 438, 96, 9, 4);
      g.fillStyle(0xf4fcff).fillRoundedRect(241, 421, 64, 18, 6);
      for (let i = 0; i < 5; i++) g.fillStyle(0x269edf).fillRect(247 + i * 10, 425, 7, 7);
    }
    if (chapter === 4) {
      g.lineStyle(3, 0xffc8ef).strokeRoundedRect(264, 210, 39, 15, 4);
      text(this, 283, 217, 'NEON', 9, '#843a9e');
      g.lineStyle(3, 0x95ffec).lineBetween(311, 267, 341, 267);
    }
    if (chapter === 6) {
      g.fillStyle(0xf7df8b).fillEllipse(284, 431, 83, 29);
      g.fillStyle(0x54cafa).fillEllipse(284, 426, 64, 18);
      g.lineStyle(3, 0xe7fcff).lineBetween(284, 424, 284, 402);
      gameIcon(this, 284, 393, 'trophy', 33);
    }
    for (let i = 0; i < 9; i++) {
      const x = 135 + i * 13, y = 450 + Math.sin(i * 1.6) * 12;
      g.fillStyle(0x319d53).fillCircle(x, y, 5);
      g.fillStyle(chapter === 5 ? 0xff8ed4 : 0xffe78a).fillCircle(x, y - 3, 2);
    }
  }

}
