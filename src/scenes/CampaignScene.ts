import Phaser from "phaser";
import { addGradientBackground, bottomNav, button, COLORS, pill, text, W } from "../ui";
import {
  CHAPTERS,
  getChapterForLevel,
  getLevelDefinition,
  TOTAL_CAMPAIGN_LEVELS,
} from "../levels";
import { loadSave } from "../save";

export class CampaignScene extends Phaser.Scene {
  constructor() {
    super("CampaignScene");
  }

  create() {
    addGradientBackground(this, 0x0b2029, 0x071116);
    const save = loadSave();
    const currentLevel = save.level;
    const chapter = getChapterForLevel(currentLevel);
    const definition = getLevelDefinition(currentLevel);
    const campaignComplete = currentLevel > TOTAL_CAMPAIGN_LEVELS;

    const back = text(this, 24, 26, "← HOME", 9, "#7ba5ad", "800");
    back.setInteractive({ useHandCursor: true });
    back.on("pointerup", () => this.scene.start("HomeScene"));

    this.add.text(24, 48, campaignComplete ? "MASTER BUILDER MODE" : "CITY JOURNEY", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: campaignComplete ? "#d8b66a" : "#6f9299",
      letterSpacing: 1,
    });

    this.add.text(24, 68, campaignComplete ? "The city keeps growing." : "Build your way forward.", {
      fontFamily: "Inter, system-ui",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    pill(this, 258, 42, 84, "COINS", "●", String(save.coins));
    pill(this, 344, 42, 68, "STAR", "★", String(save.stars));

    this.drawChapterRail(currentLevel, save.campaignMedals);
    this.drawRoute(currentLevel, chapter.startLevel, chapter.endLevel, save.campaignMedals);
    this.drawMissionCard(currentLevel, definition, campaignComplete);

    bottomNav(this, "campaign");

    this.add.text(W - 22, 813, "v0.9", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private drawChapterRail(currentLevel: number, medals: Record<string, number>) {
    const currentChapter = getChapterForLevel(currentLevel);

    this.add.text(24, 112, "CAMPAIGN  •  30 LEVELS", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#607f87",
      letterSpacing: 1,
    });

    CHAPTERS.forEach((chapter, index) => {
      const x = 47 + index * 59;
      const unlocked = currentLevel >= chapter.startLevel;
      const complete = currentLevel > chapter.endLevel;
      const active = chapter.id === currentChapter.id && currentLevel <= TOTAL_CAMPAIGN_LEVELS;
      const chapterMedals = Array.from(
        { length: chapter.endLevel - chapter.startLevel + 1 },
        (_, offset) => medals[String(chapter.startLevel + offset)] || 0,
      ).reduce((sum, value) => sum + value, 0);

      this.add.circle(
        x,
        143,
        active ? 15 : 12,
        active ? COLORS.mint : complete ? 0x2d6959 : 0x162a31,
        1,
      ).setStrokeStyle(1, active ? 0xbdf7e1 : unlocked ? 0x55756f : 0x2b4046, 1);

      text(
        this,
        x,
        143,
        complete ? "✓" : String(chapter.id),
        8,
        active ? "#062018" : unlocked ? "#c7d9d5" : "#566970",
        "800",
      );

      this.add.text(x, 165, chapterMedals + "/15", {
        fontFamily: "Inter, system-ui",
        fontSize: "6px",
        fontStyle: "bold",
        color: complete ? "#78c9ae" : active ? "#90cbbb" : "#40555b",
      }).setOrigin(0.5);
    });
  }

  private drawRoute(
    currentLevel: number,
    chapterStart: number,
    chapterEnd: number,
    medals: Record<string, number>,
  ) {
    const chapter = getChapterForLevel(currentLevel);
    const campaignComplete = currentLevel > TOTAL_CAMPAIGN_LEVELS;

    this.add.rectangle(W / 2, 338, W - 42, 300, 0x0f2229, 0.96)
      .setStrokeStyle(1, 0x28444b, 1);

    this.add.text(36, 205, "CHAPTER " + chapter.id + "  •  " + chapter.name.toUpperCase(), {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#7cd8ba",
      letterSpacing: 1,
    });

    this.add.text(36, 226, chapter.subtitle, {
      fontFamily: "Inter, system-ui",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#f1f5f2",
    });

    const levels = Array.from(
      { length: chapterEnd - chapterStart + 1 },
      (_, index) => chapterStart + index,
    );

    const points = [
      [62, 393],
      [127, 335],
      [196, 390],
      [265, 326],
      [331, 385],
    ] as const;

    const route = this.add.graphics();
    route.lineStyle(6, 0x29474d, 1);
    route.beginPath();
    route.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => route.lineTo(x, y));
    route.strokePath();

    levels.forEach((level, index) => {
      const [x, y] = points[index];
      const done = campaignComplete || level < currentLevel;
      const active = !campaignComplete && level === currentLevel;
      const locked = !done && !active;
      const def = getLevelDefinition(level);
      const medal = medals[String(level)] || 0;

      const fill = active
        ? COLORS.mint
        : done
          ? def.milestone
            ? 0x8a682d
            : 0x2c6d5b
          : 0x172c32;

      const stroke = active
        ? 0xb9f6df
        : done
          ? def.milestone
            ? 0xe0bd6f
            : 0x4b9a7e
          : 0x324a50;

      this.add.circle(x, y, def.milestone ? 23 : active ? 21 : 18, fill, 1)
        .setStrokeStyle(def.milestone || active ? 2 : 1, stroke, 1);

      text(
        this,
        x,
        y - 1,
        locked ? "•" : String(level),
        active ? 11 : 9,
        active ? "#062018" : "#dce8e4",
        "800",
      );

      if (done && medal > 0) {
        const medalCopy = Array.from({ length: 3 }, (_, m) => m < medal ? "◆" : "◇").join("");
        this.add.text(x, y + 25, medalCopy, {
          fontFamily: "Inter, system-ui",
          fontSize: "6px",
          fontStyle: "bold",
          color: "#d9b96d",
        }).setOrigin(0.5);
      } else if (def.milestone) {
        this.add.text(x, y + 27, "FINALE", {
          fontFamily: "Inter, system-ui",
          fontSize: "6px",
          fontStyle: "bold",
          color: locked ? "#4f646a" : "#d4b36b",
        }).setOrigin(0.5);
      }

      if (active) {
        const next = text(this, x, y - 34, "NEXT", 7, "#c8f6e6", "800");
        next.setBackgroundColor("#1b4d40").setPadding(6, 3, 6, 3);
        this.tweens.add({
          targets: next,
          y: y - 39,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }
    });

    const completedInChapter = levels.filter((level) => level < currentLevel).length;
    this.add.text(36, 463, "CHAPTER PROGRESS  " + Math.min(levels.length, completedInChapter) + "/" + levels.length, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#718d94",
    });

    this.add.rectangle(160, 467, 180, 6, 0x1a3036, 1).setOrigin(0, 0.5);
    this.add.rectangle(
      160,
      467,
      180 * Math.min(1, completedInChapter / levels.length),
      6,
      COLORS.mint,
      0.86,
    ).setOrigin(0, 0.5);
  }

  private drawMissionCard(
    level: number,
    definition: ReturnType<typeof getLevelDefinition>,
    campaignComplete: boolean,
  ) {
    this.add.text(24, 512, campaignComplete ? "MASTER PLAN" : "NEXT BUILD PLAN", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#67858d",
      letterSpacing: 1,
    });

    this.add.rectangle(W / 2, 630, W - 42, 202, COLORS.panel, 0.98)
      .setStrokeStyle(1, definition.milestone ? 0x8a6a38 : 0x315950, 1);

    const difficultyColor =
      definition.difficulty === "Hard" ? "#ff9d86" :
      definition.difficulty === "Medium" ? "#f2cc75" :
      "#70d9b6";

    this.add.text(
      36,
      548,
      campaignComplete
        ? "MASTER LEVEL " + level
        : "LEVEL " + level + "  •  " + definition.difficulty.toUpperCase() + (definition.milestone ? "  •  FINALE" : ""),
      {
        fontFamily: "Inter, system-ui",
        fontSize: "8px",
        fontStyle: "bold",
        color: difficultyColor,
        letterSpacing: 0.8,
      },
    );

    this.add.text(36, 570, definition.label, {
      fontFamily: "Inter, system-ui",
      fontSize: "19px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    const goals = ["Clear " + definition.targetLines + " lines"];
    if (definition.targetPlacements) goals.push("Place " + definition.targetPlacements + " blocks");
    if (definition.targetCombo) goals.push("Reach combo " + definition.targetCombo);
    if (definition.specialCells?.length) goals.push("Clear " + definition.specialCells.length + " debris");
    if (definition.iceCells?.length) goals.push("Break " + definition.iceCells.length + " ice");

    this.add.text(36, 602, goals.slice(0, 3).join("   •   "), {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      color: "#93a9ae",
      wordWrap: { width: W - 72 },
    });

    if (goals.length > 3) {
      this.add.text(36, 620, goals.slice(3).join("   •   "), {
        fontFamily: "Inter, system-ui",
        fontSize: "8px",
        color: "#93a9ae",
      });
    }

    this.add.text(
      36,
      650,
      "REWARD   ★ " + definition.rewardStars + "   •   ● " + definition.rewardCoins + "   •   SCORE " + definition.scoreTarget,
      {
        fontFamily: "Inter, system-ui",
        fontSize: "8.5px",
        fontStyle: "bold",
        color: "#e8cb79",
      },
    );

    const powerCopy =
      level < 3 ? "Tutorial route • Power Tools unlock at Level 3" :
      level < 5 ? "Power Tools • Refresh available" :
      level < 7 ? "Power Tools • Refresh + Hammer" :
      "Power Tools • Full kit available";

    this.add.text(36, 674, powerCopy, {
      fontFamily: "Inter, system-ui",
      fontSize: "7.5px",
      color: "#6e8f89",
    });

    button(
      this,
      W / 2,
      742,
      W - 72,
      52,
      campaignComplete ? "PLAY MASTER LEVEL " + level + "  →" : "PLAY LEVEL " + level + "  →",
      () => this.scene.start("PuzzleScene"),
      definition.milestone ? 0x8a682d : COLORS.mintDark,
    );
  }
}
