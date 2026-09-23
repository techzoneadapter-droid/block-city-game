import Phaser from "phaser";
import { addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { CHAPTERS, getChapterForLevel, getLevelDefinition, TOTAL_CAMPAIGN_LEVELS } from "../levels";
import { loadSave } from "../save";

const CHAPTER_VISUALS: Record<number, { icon: string; accent: number }> = {
  1: { icon: "🏡", accent: 0x29a9e8 },
  2: { icon: "⛵", accent: 0x20bfcf },
  3: { icon: "🏙", accent: 0x6978df },
  4: { icon: "✦", accent: 0xd65ad6 },
  5: { icon: "🌿", accent: 0x51b968 },
  6: { icon: "🏛", accent: 0xd7a52e },
};

export class CampaignScene extends Phaser.Scene {
  constructor() {
    super("CampaignScene");
  }

  create() {
    addGradientBackground(this, 0x35b8f2, 0xeafaff);
    const save = loadSave();
    const currentLevel = save.level;
    const chapter = getChapterForLevel(currentLevel);
    const definition = getLevelDefinition(currentLevel);
    const campaignComplete = currentLevel > TOTAL_CAMPAIGN_LEVELS;

    button(this, 49, 28, 70, 28, "‹ HOME", () => this.scene.start("HomeScene"), COLORS.primary, "secondary");
    sectionLabel(this, 20, 50, campaignComplete ? "MASTER BUILDER MODE" : "CITY JOURNEY", "#1264ad");
    this.add.text(20, 67, campaignComplete ? "The city keeps growing!" : "Build your way forward", {
      fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "23px", fontStyle: "bold", color: "#123767",
    }).setShadow(0, 2, "#ffffff", 1, false, true);
    pill(this, 258, 30, 86, "COINS", "●", String(save.coins));
    pill(this, 347, 30, 72, "STARS", "★", String(save.stars));

    this.drawChapterRail(currentLevel, save.campaignMedals);
    this.drawRoute(currentLevel, chapter.startLevel, chapter.endLevel, save.campaignMedals);
    this.drawMissionCard(currentLevel, definition, campaignComplete);
  }

  private drawChapterRail(currentLevel: number, medals: Record<string, number>) {
    panel(this, W / 2, 140, W - 30, 72, { fill: 0xffffff, alpha: 0.94, stroke: 0x8bd8f3, radius: 17 });
    const currentChapter = getChapterForLevel(currentLevel);
    sectionLabel(this, 29, 108, "6 DISTRICTS  •  30 LEVELS");

    CHAPTERS.forEach((chapter, index) => {
      const x = 43 + index * 61;
      const unlocked = currentLevel >= chapter.startLevel;
      const complete = currentLevel > chapter.endLevel;
      const active = chapter.id === currentChapter.id && currentLevel <= TOTAL_CAMPAIGN_LEVELS;
      const visual = CHAPTER_VISUALS[chapter.id] ?? CHAPTER_VISUALS[1];
      const chapterMedals = Array.from({ length: 5 }, (_, offset) => medals[String(chapter.startLevel + offset)] || 0)
        .reduce((sum, value) => sum + value, 0);

      if (index < CHAPTERS.length - 1) {
        this.add.rectangle(x + 30, 139, 34, 5, complete ? COLORS.mint : 0xb5d7e8, 1);
      }
      const node = this.add.circle(x, 139, active ? 15 : 12, active ? visual.accent : complete ? COLORS.mintDark : unlocked ? 0x65bce8 : 0xc0d3de, 1)
        .setStrokeStyle(2, 0xffffff, 1);
      text(this, x, 139, complete ? "✓" : unlocked ? String(chapter.id) : "🔒", active ? 10 : 8, "#ffffff", "800");
      this.add.text(x, 160, `${chapterMedals}/15`, { fontFamily: "Inter, system-ui", fontSize: "6px", fontStyle: "bold", color: complete ? "#158b53" : "#5d7e9c" }).setOrigin(0.5);
      if (active) this.tweens.add({ targets: node, scaleX: 1.08, scaleY: 1.08, duration: 650, yoyo: true, repeat: -1 });
    });
  }

  private drawRoute(currentLevel: number, chapterStart: number, chapterEnd: number, medals: Record<string, number>) {
    const chapter = getChapterForLevel(currentLevel);
    const chapterVisual = CHAPTER_VISUALS[chapter.id] ?? CHAPTER_VISUALS[1];
    const campaignComplete = currentLevel > TOTAL_CAMPAIGN_LEVELS;
    panel(this, W / 2, 350, W - 30, 326, { fill: 0xf8fdff, alpha: 0.97, stroke: 0x79cbee, radius: 21, shadowAlpha: 0.2 });

    iconBubble(this, 49, 219, chapterVisual.icon, chapterVisual.accent, 22);
    sectionLabel(this, 82, 196, `CHAPTER ${chapter.id}  •  ${chapter.name.toUpperCase()}`, "#1574bd");
    this.add.text(82, 215, chapter.subtitle, { fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "15px", fontStyle: "bold", color: "#123767" });

    const levels = Array.from({ length: chapterEnd - chapterStart + 1 }, (_, index) => chapterStart + index);
    const points = [[56, 390], [125, 326], [195, 390], [265, 320], [334, 384]] as const;
    const route = this.add.graphics();
    route.lineStyle(12, 0xd5edf8, 1);
    route.beginPath(); route.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x, y]) => route.lineTo(x, y)); route.strokePath();
    route.lineStyle(4, 0x6cc7ea, 0.9);
    route.beginPath(); route.moveTo(points[0][0], points[0][1]); points.slice(1).forEach(([x, y]) => route.lineTo(x, y)); route.strokePath();

    levels.forEach((level, index) => {
      const [x, y] = points[index];
      const done = campaignComplete || level < currentLevel;
      const active = !campaignComplete && level === currentLevel;
      const locked = !done && !active;
      const def = getLevelDefinition(level);
      const medal = medals[String(level)] || 0;
      const fill = active ? COLORS.gold : done ? def.milestone ? COLORS.violet : COLORS.mint : 0xb9ceda;
      const radius = def.milestone ? 25 : active ? 23 : 20;

      this.add.circle(x, y + 4, radius, 0x0a4e96, 0.2);
      const node = this.add.circle(x, y, radius, fill, 1).setStrokeStyle(3, 0xffffff, 1);
      text(this, x, y, locked ? "🔒" : String(level), active ? 13 : 10, active ? "#173b68" : "#ffffff", "800");

      if (done && medal > 0) {
        text(this, x, y + 31, Array.from({ length: 3 }, (_, m) => m < medal ? "★" : "☆").join(""), 7, "#f39816", "800");
      } else if (def.milestone) {
        text(this, x, y + 33, "FINALE", 7, locked ? "#8095a6" : "#8b4ac2", "800");
      }
      if (active) {
        const next = text(this, x, y - 36, "NEXT", 8, "#ffffff", "800").setBackgroundColor("#ec6d3d").setPadding(7, 4, 7, 4);
        this.tweens.add({ targets: [node, next], y: "-=4", duration: 650, yoyo: true, repeat: -1, ease: "Sine.InOut" });
      }
    });

    const completed = levels.filter((level) => level < currentLevel).length;
    sectionLabel(this, 34, 467, `CHAPTER PROGRESS  ${Math.min(5, completed)}/5`, "#51799b");
    progressBar(this, 174, 477, 174, completed / 5, COLORS.mint, 11);
  }

  private drawMissionCard(level: number, definition: ReturnType<typeof getLevelDefinition>, campaignComplete: boolean) {
    sectionLabel(this, 20, 530, campaignComplete ? "MASTER PLAN" : "NEXT BUILD PLAN");
    panel(this, W / 2, 625, W - 30, 170, { fill: 0xfffbed, alpha: 0.98, stroke: definition.milestone ? 0xf3b33d : 0x8fd5ed, radius: 20 });
    iconBubble(this, 53, 595, definition.milestone ? "🏆" : "🧩", definition.milestone ? COLORS.warning : COLORS.primary, 24);

    const difficultyColor = definition.difficulty === "Hard" ? "#e24e4d" : definition.difficulty === "Medium" ? "#db8616" : "#16975b";
    this.add.text(88, 556, campaignComplete ? `MASTER LEVEL ${level}` : `LEVEL ${level}  •  ${definition.difficulty.toUpperCase()}${definition.milestone ? "  •  FINALE" : ""}`, {
      fontFamily: "Inter, system-ui", fontSize: "8px", fontStyle: "bold", color: difficultyColor, letterSpacing: 0.5,
    });
    this.add.text(88, 575, definition.label, { fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "18px", fontStyle: "bold", color: "#123767" });

    const goals = [`▦ ${definition.targetLines} lines`];
    if (definition.targetPlacements) goals.push(`◆ ${definition.targetPlacements} blocks`);
    if (definition.targetCombo) goals.push(`⚡ Combo ${definition.targetCombo}`);
    if (definition.specialCells?.length) goals.push(`🧱 ${definition.specialCells.length} debris`);
    if (definition.iceCells?.length) goals.push(`❄ ${definition.iceCells.length} ice`);
    this.add.text(34, 628, goals.join("   •   "), { fontFamily: "Inter, system-ui", fontSize: "8px", fontStyle: "bold", color: "#557796", wordWrap: { width: 320 } });

    panel(this, W / 2, 674, 310, 37, { fill: 0xffefd0, stroke: 0xf4c86c, radius: 10, shadow: false });
    text(this, W / 2, 674, `REWARD  ★ ${definition.rewardStars}   ● ${definition.rewardCoins}   •   TARGET ${definition.scoreTarget}`, 9, "#9a5f12", "800");

    button(this, W / 2, 755, W - 64, 56, campaignComplete ? `PLAY MASTER LEVEL ${level}  ▶` : `PLAY LEVEL ${level}  ▶`, () => this.scene.start("PuzzleScene"), definition.milestone ? COLORS.gold : COLORS.primary, definition.milestone ? "gold" : "primary");
    text(this, W / 2, 806, level < 3 ? "Learn the rhythm • Power Tools unlock at Level 3" : "Every clear helps build your city", 8, "#557999", "700");
  }
}
