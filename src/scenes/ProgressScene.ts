import Phaser from "phaser";
import { addGradientBackground, bottomNav, button, COLORS, pill, text, W } from "../ui";
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
    addGradientBackground(this, 0x0a2028, 0x071116);
    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const milestone = milestoneCopy(save);

    const back = text(this, 24, 29, "← HOME", 9, "#7ba5ad", "800");
    back.setInteractive({ useHandCursor: true });
    back.on("pointerup", () => this.scene.start("HomeScene"));

    this.add.text(24, 52, "BUILDER PROFILE", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6d9098",
      letterSpacing: 1,
    });

    this.add.text(24, 72, `Level ${profile.level} Builder`, {
      fontFamily: "Inter, system-ui",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    pill(this, 260, 44, 86, "COINS", "●", String(save.coins));
    pill(this, 344, 44, 66, "STAR", "★", String(save.stars));

    this.createProfileCard(profile.level, profile.currentXp, profile.neededXp, profile.progress);
    this.createRoadmap(save.level);
    this.createMilestone(milestone.title, milestone.progress, milestone.target, milestone.text);
    this.createAchievements();

    bottomNav(this, "profile");

    this.add.text(W - 22, 813, "v0.9", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private createProfileCard(level: number, currentXp: number, neededXp: number, progress: number) {
    this.add.rectangle(W / 2, 147, W - 42, 92, COLORS.panel, 0.96)
      .setStrokeStyle(1, 0x2d5454, 1);

    const badge = this.add.circle(60, 147, 27, 0x2d8068, 1)
      .setStrokeStyle(2, 0x78dab8, 0.7);
    void badge;
    text(this, 60, 147, String(level), 19, "#f0fff9", "800");

    this.add.text(99, 121, "BUILDER XP", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#718e94",
      letterSpacing: 1,
    });

    this.add.text(99, 141, `${currentXp} / ${neededXp} XP`, {
      fontFamily: "Inter, system-ui",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#eef7f2",
    });

    this.add.rectangle(99, 170, 235, 8, 0x172b31, 1).setOrigin(0, 0.5);
    this.add.rectangle(99, 170, 235 * Math.max(0.03, progress), 8, 0x41c99c, 1).setOrigin(0, 0.5);

    this.add.text(99, 183, "Complete levels, Daily Challenge and city builds to gain XP.", {
      fontFamily: "Inter, system-ui",
      fontSize: "7.5px",
      color: "#647d84",
    });
  }

  private createRoadmap(currentLevel: number) {
    this.add.text(24, 215, "LEVEL ROAD", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6f9299",
      letterSpacing: 1,
    });

    this.add.rectangle(W / 2, 292, W - 42, 126, 0x0f2229, 0.96)
      .setStrokeStyle(1, 0x25424a, 1);

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
    line.lineStyle(4, 0x284a4a, 1);
    line.beginPath();
    line.moveTo(positions[0][0], positions[0][1]);
    positions.slice(1).forEach(([x, y]) => line.lineTo(x, y));
    line.strokePath();

    levels.forEach((level, index) => {
      const [x, y] = positions[index];
      const completed = level < currentLevel;
      const current = level === currentLevel;
      const fill = current ? 0x41c99c : completed ? 0x285f55 : 0x172b31;
      const stroke = current ? 0xa5f1d5 : completed ? 0x65b79e : 0x3b535a;

      this.add.circle(x, y, current ? 18 : 15, fill, 1).setStrokeStyle(2, stroke, 0.95);
      text(this, x, y, String(level), 9, current ? "#071812" : "#d5e6e2", "800");

      if (completed) {
        text(this, x + 13, y - 14, "✓", 8, "#76d6b3", "800");
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
        const label = text(this, x, y + 28, "YOU", 7, "#75d7b6", "800");
        label.setBackgroundColor("#12362f").setPadding(5, 3, 5, 3);
      }
    });
  }

  private createMilestone(title: string, progress: number, target: number, description: string) {
    this.add.rectangle(W / 2, 410, W - 42, 82, 0x132a30, 0.98)
      .setStrokeStyle(1, 0x35555b, 1);

    this.add.text(36, 383, "NEXT BIG UNLOCK", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#d2aa63",
      letterSpacing: 1,
    });

    this.add.text(36, 404, title, {
      fontFamily: "Inter, system-ui",
      fontSize: "16px",
      fontStyle: "bold",
      color: "#f4f0e7",
    });

    this.add.text(36, 428, description, {
      fontFamily: "Inter, system-ui",
      fontSize: "8.5px",
      color: "#758d93",
    });

    this.add.rectangle(250, 411, 105, 7, 0x1a3036, 1).setOrigin(0, 0.5);
    this.add.rectangle(
      250,
      411,
      105 * Math.min(1, target ? progress / target : 0),
      7,
      0xd2aa63,
      0.95,
    ).setOrigin(0, 0.5);
    this.add.text(354, 425, `${progress}/${target}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#b1c0c0",
    }).setOrigin(1, 0);
  }

  private createAchievements() {
    this.add.text(24, 471, "ACHIEVEMENTS", {
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

      this.add.rectangle(W / 2, y, W - 42, 48, 0x0f2229, 0.96)
        .setStrokeStyle(1, ready ? 0x8c6b35 : claimed ? 0x2d5047 : 0x203b43, 1);

      const medal = ready ? "✦" : claimed ? "✓" : "◇";
      text(this, 45, y, medal, 16, ready ? "#ffd270" : claimed ? "#71d1af" : "#607b82", "800");

      this.add.text(66, y - 13, achievement.title, {
        fontFamily: "Inter, system-ui",
        fontSize: "10px",
        fontStyle: "bold",
        color: "#e8f0ed",
      });

      this.add.text(66, y + 4, `${achievement.description}  •  ${progress}/${achievement.target}`, {
        fontFamily: "Inter, system-ui",
        fontSize: "7.5px",
        color: "#71878e",
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
        claimed ? 0x243a37 : ready ? 0x8a682d : 0x1b343a,
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
