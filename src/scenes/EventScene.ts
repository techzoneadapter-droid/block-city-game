import Phaser from "phaser";
import { addGradientBackground, button, COLORS, pill, text, W } from "../ui";
import { getWeeklyEvent, eventProgressLabel } from "../event";
import { loadSave, updateSave } from "../save";

export class EventScene extends Phaser.Scene {
  constructor() {
    super("EventScene");
  }

  create() {
    addGradientBackground(this, 0x10232a, 0x071116);
    const event = getWeeklyEvent();
    const save = loadSave();

    const back = text(this, 24, 28, "← HOME", 9, "#7ba5ad", "800");
    back.setInteractive({ useHandCursor: true });
    back.on("pointerup", () => this.scene.start("HomeScene"));

    this.add.text(24, 50, "WEEKLY EVENT", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#9a875b",
      letterSpacing: 1,
    });

    this.add.text(24, 72, event.title, {
      fontFamily: "Inter, system-ui",
      fontSize: "27px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    this.add.text(24, 106, event.subtitle, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      color: "#839ca3",
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
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private createProgressCard(points: number, target: number, accent: number) {
    this.add.rectangle(W / 2, 170, W - 42, 94, COLORS.panel, 0.98)
      .setStrokeStyle(1, 0x3d5146, 1);

    this.add.text(36, 140, "EVENT PROGRESS", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#9f8e63",
      letterSpacing: 1,
    });

    this.add.text(36, 160, eventProgressLabel(points, target), {
      fontFamily: "Inter, system-ui",
      fontSize: "19px",
      fontStyle: "bold",
      color: "#f5f1e8",
    });

    this.add.rectangle(36, 199, 318, 10, 0x1b3035, 1).setOrigin(0, 0.5);
    this.add.rectangle(
      36,
      199,
      318 * Math.min(1, points / target),
      10,
      accent,
      0.95,
    ).setOrigin(0, 0.5);

    this.add.text(354, 178, points >= target ? "TRACK COMPLETE" : `${Math.max(0, target - points)} pts left`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: points >= target ? "#79dfb9" : "#70898f",
    }).setOrigin(1, 0);
  }

  private createMilestones() {
    const event = getWeeklyEvent();
    const save = loadSave();

    this.add.text(24, 244, "REWARD TRACK", {
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

      this.add.rectangle(W / 2, y, W - 42, 58, 0x0f2229, 0.98)
        .setStrokeStyle(1, claimed ? 0x2e5147 : unlocked ? 0x8d7040 : 0x203c43, 1);

      const nodeColor = claimed ? 0x3e806d : unlocked ? 0xb78b42 : 0x203941;
      this.add.circle(48, y, 16, nodeColor, 1)
        .setStrokeStyle(1, unlocked ? 0xe8c878 : 0x4a6268, 0.9);
      text(this, 48, y, claimed ? "✓" : String(index + 1), 9, "#f7f1e5", "800");

      this.add.text(76, y - 14, `${milestone.points} EVENT POINTS`, {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
        color: unlocked ? "#e7d39d" : "#789096",
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
        color: unlocked ? "#f3e6be" : "#61767c",
      });

      const claim = button(
        this,
        320,
        y,
        92,
        32,
        claimed ? "DONE" : unlocked ? "CLAIM" : "LOCKED",
        () => this.claimMilestone(index),
        claimed ? 0x243a37 : unlocked ? 0x8a682d : 0x1b3339,
      );
      if (!unlocked || claimed) claim.disableInteractive();
    });
  }

  private createWaysToEarn() {
    const y = 695;

    this.add.rectangle(W / 2, y, W - 42, 116, 0x12272e, 0.98)
      .setStrokeStyle(1, 0x2b464d, 1);

    this.add.text(36, y - 42, "EARN EVENT POINTS", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#728f96",
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
        color: "#e8efec",
      });
      this.add.text(270, rowY, reward, {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#d4b76e",
      });
    });

    button(this, W / 2, 785, W - 84, 42, "PLAY NEXT LEVEL  →", () => {
      this.scene.start("PuzzleScene");
    }, 0x2d7764);
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
    const dim = this.add.rectangle(W / 2, 420, W, 844, 0x02080b, 0.76);
    const card = this.add.rectangle(W / 2, 420, W - 72, 230, 0x14262d, 1)
      .setStrokeStyle(1, 0xa98446, 1);
    const sparkle = text(this, W / 2, 354, "✦", 58, "#ffd56d", "800").setScale(0.2);
    const title = text(this, W / 2, 407, "REWARD UNLOCKED", 18, "#f7f1e7", "800");
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
      "#f0d68f",
      "800",
    );
    const done = button(this, W / 2, 505, 210, 42, "COLLECT", () => {
      this.scene.restart();
    }, 0x8a682d);

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
