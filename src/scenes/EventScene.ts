import Phaser from "phaser";
import { addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { getWeeklyEvent, eventProgressLabel } from "../event";
import { loadSave, updateSave } from "../save";

export class EventScene extends Phaser.Scene {
  constructor() {
    super("EventScene");
  }

  create() {
    addGradientBackground(this, 0x3cbdf3, 0xebfbff);
    const event = getWeeklyEvent();
    const save = loadSave();

    button(this, 49, 28, 70, 28, "‹ HOME", () => this.scene.start("HomeScene"), COLORS.primary, "secondary");

    this.add.text(24, 50, "WEEKLY EVENT", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#9f6718",
      letterSpacing: 1,
    });

    this.add.text(24, 72, event.title, {
      fontFamily: "Inter, system-ui",
      fontSize: "27px",
      fontStyle: "bold",
      color: "#123767",
    });

    this.add.text(24, 106, event.subtitle, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      color: "#587c99",
    });

    pill(this, 260, 45, 86, "COINS", "●", String(save.coins));
    pill(this, 344, 45, 66, "STAR", "★", String(save.stars));

    this.createProgressCard(save.eventPoints, event.target, event.accent);
    this.createMilestones();
    this.createWaysToEarn();

    this.add.text(W - 22, 813, "v0.9", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#4f7b9b",
    }).setOrigin(1, 0.5);
  }

  private createProgressCard(points: number, target: number, accent: number) {
    panel(this, W / 2, 170, W - 34, 98, { fill: 0xfffae7, stroke: 0xefc15b, radius: 18 });
    iconBubble(this, 324, 157, "🏆", accent, 24);

    this.add.text(36, 140, "EVENT PROGRESS", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#a36d1d",
      letterSpacing: 1,
    });

    this.add.text(36, 160, eventProgressLabel(points, target), {
      fontFamily: "Inter, system-ui",
      fontSize: "19px",
      fontStyle: "bold",
      color: "#123767",
    });

    progressBar(this, 36, 199, 318, points / target, accent, 12);

    this.add.text(354, 178, points >= target ? "TRACK COMPLETE" : `${Math.max(0, target - points)} pts left`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: points >= target ? "#159453" : "#68839b",
    }).setOrigin(1, 0);
  }

  private createMilestones() {
    const event = getWeeklyEvent();
    const save = loadSave();

    sectionLabel(this, 24, 244, "REWARD TRACK");
    this.add.text(24, 244, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#718e95",
      letterSpacing: 1,
    });

    event.milestones.forEach((milestone, index) => {
      const y = 292 + index * 72;
      const unlocked = save.eventPoints >= milestone.points;
      const claimed = save.eventClaims.includes(index);

      panel(this, W / 2, y, W - 34, 58, { fill: claimed ? 0xedfff4 : unlocked ? 0xfff6d8 : 0xffffff, stroke: claimed ? 0x78d29c : unlocked ? 0xf0bd48 : 0xa5d2e5, radius: 14, shadowAlpha: 0.12 });

      const nodeColor = claimed ? COLORS.success : unlocked ? COLORS.goldDark : 0x9eb7c7;
      this.add.circle(48, y, 16, nodeColor, 1)
        .setStrokeStyle(2, 0xffffff, 0.95);
      text(this, 48, y, claimed ? "✓" : String(index + 1), 9, "#f7f1e5", "800");

      this.add.text(76, y - 14, `${milestone.points} EVENT POINTS`, {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
        color: unlocked ? "#9d6515" : "#66849c",
      });

      const rewards = [
        milestone.coins ? `● ${milestone.coins}` : "",
        milestone.stars ? `★ ${milestone.stars}` : "",
        milestone.chestKeys ? `KEY +${milestone.chestKeys}` : "",
      ].filter(Boolean).join("   ");

      this.add.text(76, y + 5, rewards, {
        fontFamily: "Inter, system-ui",
        fontSize: "10px",
        fontStyle: "bold",
        color: unlocked ? "#b26a0c" : "#70889b",
      });

      const claim = button(
        this,
        320,
        y,
        92,
        32,
        claimed ? "DONE" : unlocked ? "CLAIM" : "LOCKED",
        () => this.claimMilestone(index),
        claimed ? 0x8aa7b8 : unlocked ? COLORS.gold : 0x78a9c5,
        unlocked && !claimed ? "gold" : claimed ? "muted" : "secondary",
      );
      if (!unlocked || claimed) claim.disableInteractive();
    });
  }

  private createWaysToEarn() {
    const y = 695;

    panel(this, W / 2, y, W - 34, 116, { fill: 0xf6fcff, stroke: 0x9cd2e8, radius: 18 });

    this.add.text(36, y - 42, "EARN EVENT POINTS", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#527d9c",
      letterSpacing: 1,
    });

    const rows = [
      ["Normal level", "+25 pts"],
      ["Daily Challenge", "+40 pts"],
      ["Build a city stage", "+15 pts"],
    ];

    rows.forEach(([label, reward], index) => {
      const rowY = y - 18 + index * 22;
      this.add.text(36, rowY, label, {
        fontFamily: "Inter, system-ui",
        fontSize: "10px",
        fontStyle: "bold",
          color: "#123767",
      });
      this.add.text(270, rowY, reward, {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
          color: "#a96813",
      });
    });

    button(this, W / 2, 785, W - 84, 42, "PLAY NEXT LEVEL  →", () => {
      this.scene.start("PuzzleScene");
    }, COLORS.primary, "primary");
  }

  private claimMilestone(index: number) {
    const event = getWeeklyEvent();
    const milestone = event.milestones[index];
    if (!milestone) return;

    const save = loadSave();
    if (save.eventPoints < milestone.points || save.eventClaims.includes(index)) return;

    updateSave((current) => ({
      ...current,
      coins: current.coins + milestone.coins,
      stars: current.stars + milestone.stars,
      chestProgress: Math.min(5, current.chestProgress + milestone.chestKeys),
      eventClaims: [...current.eventClaims, index],
    }));

    this.showRewardBurst(milestone.coins, milestone.stars, milestone.chestKeys);
  }

  private showRewardBurst(coins: number, stars: number, keys: number) {
    const group = this.add.container(0, 0).setDepth(180);
    const dim = this.add.rectangle(W / 2, 420, W, 844, 0x063667, 0.68);
    const card = panel(this, W / 2, 420, W - 72, 230, { fill: 0xfffae8, stroke: 0xeeb84c, radius: 24, shadowAlpha: 0.35 });
    const sparkle = text(this, W / 2, 354, "✦", 58, "#ffd56d", "800").setScale(0.2);
    const title = text(this, W / 2, 407, "REWARD UNLOCKED", 18, "#123767", "800");
    const reward = text(
      this,
      W / 2,
      449,
      [
        coins ? `● ${coins}` : "",
        stars ? `★ ${stars}` : "",
        keys ? `KEY +${keys}` : "",
      ].filter(Boolean).join("   "),
      15,
      "#a76a14",
      "800",
    );
    const done = button(this, W / 2, 505, 210, 42, "COLLECT", () => {
      this.scene.restart();
    }, COLORS.gold, "gold");

    group.add([dim, card, sparkle, title, reward, done]);

    this.tweens.add({
      targets: sparkle,
      scaleX: 1,
      scaleY: 1,
      angle: 180,
      duration: 520,
      ease: "Back.Out",
    });
  }
}
