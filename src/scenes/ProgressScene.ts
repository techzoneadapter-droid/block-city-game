import Phaser from "phaser";
import { addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { loadSave, updateSave } from "../save";
import {
  ACHIEVEMENTS,
  achievementProgress,
  achievementReady,
  milestoneCopy,
  profileLevelFromXp,
  type AchievementId,
} from "../progression";

export class ProgressScene extends Phaser.Scene {
  constructor() {
    super("ProgressScene");
  }

  create() {
    addGradientBackground(this, 0x3bbcf2, 0xebfbff);
    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const milestone = milestoneCopy(save);

    button(this, 49, 28, 70, 28, "‹ HOME", () => this.scene.start("HomeScene"), COLORS.primary, "secondary");

    this.add.text(24, 52, "BUILDER PROFILE", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#1768aa",
      letterSpacing: 1,
    });

    this.add.text(24, 72, `Level ${profile.level} Builder`, {
      fontFamily: "Inter, system-ui",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#123767",
    });

    pill(this, 260, 44, 86, "COINS", "●", String(save.coins));
    pill(this, 344, 44, 66, "STAR", "★", String(save.stars));

    this.createProfileCard(profile.level, profile.currentXp, profile.neededXp, profile.progress);
    this.createRoadmap(save.level);
    this.createMilestone(milestone.title, milestone.progress, milestone.target, milestone.text);
    this.createAchievements();

    this.add.text(W - 22, 813, "v0.9", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#4f7b9b",
    }).setOrigin(1, 0.5);
  }

  private createProfileCard(level: number, currentXp: number, neededXp: number, progress: number) {
    panel(this, W / 2, 147, W - 34, 96, { fill: 0xffffff, stroke: 0x8bd6ef, radius: 18 });

    iconBubble(this, 60, 147, String(level), COLORS.primary, 27);

    this.add.text(99, 121, "BUILDER XP", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5a82a1",
      letterSpacing: 1,
    });

    this.add.text(99, 141, `${currentXp} / ${neededXp} XP`, {
      fontFamily: "Inter, system-ui",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#123767",
    });

    progressBar(this, 99, 170, 235, Math.max(0.03, progress), COLORS.mint, 10);

    this.add.text(99, 183, "Complete levels, Daily Challenge and city builds to gain XP.", {
      fontFamily: "Inter, system-ui",
      fontSize: "7.5px",
      color: "#6482a0",
    });
  }

  private createRoadmap(currentLevel: number) {
    sectionLabel(this, 24, 215, "LEVEL ROAD");
    this.add.text(24, 215, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6f9299",
      letterSpacing: 1,
    });

    panel(this, W / 2, 292, W - 34, 126, { fill: 0xf7fdff, stroke: 0x8bd6ef, radius: 18 });

    const start = Math.max(1, currentLevel - 2);
    const levels = Array.from({ length: 6 }, (_, i) => start + i);
    const positions = [
      [48, 300],
      [106, 262],
      [164, 305],
      [226, 264],
      [286, 306],
      [344, 270],
    ] as const;

    const line = this.add.graphics();
    line.lineStyle(7, 0xb8dfee, 1);
    line.beginPath();
    line.moveTo(positions[0][0], positions[0][1]);
    positions.slice(1).forEach(([x, y]) => line.lineTo(x, y));
    line.strokePath();

    levels.forEach((level, index) => {
      const [x, y] = positions[index];
      const completed = level < currentLevel;
      const current = level === currentLevel;
      const fill = current ? COLORS.gold : completed ? COLORS.mint : 0xb8cfda;
      const stroke = current ? 0xffffff : completed ? 0xffffff : 0x8fb5c7;

      this.add.circle(x, y, current ? 18 : 15, fill, 1).setStrokeStyle(2, stroke, 0.95);
      text(this, x, y, String(level), 9, current ? "#123767" : "#ffffff", "800");

      if (completed) {
        text(this, x + 13, y - 14, "✓", 8, "#159453", "800");
        const medal = loadSave().campaignMedals[String(level)] || 0;
        if (medal > 0) {
          this.add.text(
            x,
            y + 20,
            Array.from({ length: 3 }, (_, index) => index < medal ? "◆" : "◇").join(""),
            {
              fontFamily: "Inter, system-ui",
              fontSize: "5.5px",
              fontStyle: "bold",
              color: "#d6b86b",
            },
          ).setOrigin(0.5);
        }
      }
      if (current) {
        const label = text(this, x, y + 28, "YOU", 7, "#ffffff", "800");
        label.setBackgroundColor("#ec6d3d").setPadding(5, 3, 5, 3);
      }
    });
  }

  private createMilestone(title: string, progress: number, target: number, description: string) {
    panel(this, W / 2, 410, W - 34, 82, { fill: 0xfff8df, stroke: 0xf0c768, radius: 17 });

    this.add.text(36, 383, "NEXT BIG UNLOCK", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#b36b10",
      letterSpacing: 1,
    });

    this.add.text(36, 404, title, {
      fontFamily: "Inter, system-ui",
      fontSize: "16px",
      fontStyle: "bold",
      color: "#123767",
    });

    this.add.text(36, 428, description, {
      fontFamily: "Inter, system-ui",
      fontSize: "8.5px",
      color: "#647f9b",
    });

    progressBar(this, 250, 411, 105, target ? progress / target : 0, COLORS.gold, 9);
    this.add.text(354, 425, `${progress}/${target}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#7d6a42",
    }).setOrigin(1, 0);
  }

  private createAchievements() {
    sectionLabel(this, 24, 471, "ACHIEVEMENTS");
    this.add.text(24, 471, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6f9299",
      letterSpacing: 1,
    });

    const save = loadSave();

    ACHIEVEMENTS.forEach((achievement, index) => {
      const y = 515 + index * 56;
      const progress = achievementProgress(save, achievement);
      const claimed = save.achievementClaims.includes(achievement.id);
      const ready = achievementReady(save, achievement);

      panel(this, W / 2, y, W - 34, 48, {
        fill: ready ? 0xfff6d9 : claimed ? 0xecfff4 : 0xffffff,
        stroke: ready ? 0xf1bd4a : claimed ? 0x7bd6a1 : 0xa9d5e8,
        radius: 13,
        shadowAlpha: 0.12,
      });

      const medal = ready ? "✦" : claimed ? "✓" : "◇";
      text(this, 45, y, medal, 16, ready ? "#f2a713" : claimed ? "#23a867" : "#7696ad", "800");

      this.add.text(66, y - 13, achievement.title, {
        fontFamily: "Inter, system-ui",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#123767",
      });

      this.add.text(66, y + 4, `${achievement.description}  •  ${progress}/${achievement.target}`, {
        fontFamily: "Inter, system-ui",
        fontSize: "7.5px",
        color: "#69849d",
      });

      const reward = achievement.rewardStars
        ? `● ${achievement.rewardCoins} + ★ ${achievement.rewardStars}`
        : `● ${achievement.rewardCoins}`;

      const claim = button(
        this,
        320,
        y,
        92,
        30,
        claimed ? "DONE" : ready ? "CLAIM" : reward,
        () => this.claimAchievement(achievement.id),
        claimed ? 0x8aa7b8 : ready ? COLORS.gold : 0x78a9c5,
        ready ? "gold" : claimed ? "muted" : "secondary",
      );

      if (!ready) claim.disableInteractive();
    });
  }

  private claimAchievement(id: AchievementId) {
    const achievement = ACHIEVEMENTS.find((item) => item.id === id);
    if (!achievement) return;

    const save = loadSave();
    if (!achievementReady(save, achievement)) return;

    updateSave((current) => ({
      ...current,
      coins: current.coins + achievement.rewardCoins,
      stars: current.stars + achievement.rewardStars,
      chestProgress: Math.min(5, current.chestProgress + 1),
      achievementClaims: [...current.achievementClaims, id],
    }));

    this.scene.restart();
  }
}
