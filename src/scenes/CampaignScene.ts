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
    const landmark = this.add.graphics();
    drawBuilding(landmark, 290, 271, 52, 26, 59 + chapter.id * 6, 0xffe4a7, 0xe1a65b, 0x218ce1);
    for (let row = 0; row < 3; row++) for (let col = 0; col < 2; col++) {
      landmark.fillStyle(0xf3fbff).fillRoundedRect(294 + col * 9, 224 + row * 13, 6, 8, 1);
    }
    // Small trees frame the path instead of covering nodes or labels.
    [[42, 270], [337, 370], [178, 220], [49, 454], [276, 476]].forEach(([x, y]) => {
      landmark.fillStyle(0x85582f).fillRect(x - 3, y, 6, 16);
      landmark.fillStyle(0x159d50).fillRoundedRect(x - 12, y - 18, 24, 27, 6);
      landmark.fillStyle(0x9af16b).fillRoundedRect(x - 9, y - 19, 16, 10, 3);
    });
    const points = [[83, 421], [167, 360], [84, 293], [198, 270], [294, 333]];
    const road = this.add.graphics();
    [ [19, 0xb99869], [14, 0xfff1c3], [3, 0xffffff] ].forEach(([width, color]) => {
      road.lineStyle(width, color, 1).beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => road.lineTo(x, y)); road.strokePath();
    });
    points.forEach(([x, y], i) => {
      const level = chapter.startLevel + i;
      const done = level < save.level;
      const active = level === save.level;
      const locked = !done && !active;
      const color = active ? COLORS.gold : done ? COLORS.mintDark : 0x7399b4;
      this.add.circle(x, y + 5, 27, 0x0b5275, 0.45);
      const node = this.add.circle(x, y, 27, color).setStrokeStyle(3, 0xffffff);
      this.add.arc(x, y, 22, 210, 310, false, 0xffffff, 0).setStrokeStyle(3, 0xffffff, 0.45);
      if (locked) gameIcon(this, x, y, 'lock', 29);
      else text(this, x, y, String(level), 22, active ? '#153863' : '#ffffff');
      if (done) text(this, x, y + 38, '★'.repeat(save.campaignMedals[String(level)] || 1), 14, '#fff1a3').setStroke('#947119', 2);
      if (i === 4) text(this, x, y + 44, 'FINALE', 11, '#123767').setBackgroundColor('#fff1b8').setPadding(6, 3);
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
}
