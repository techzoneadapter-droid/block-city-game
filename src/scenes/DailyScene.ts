import Phaser from "phaser";
import { addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { loadSave, updateSave } from "../save";
import {
  DAILY_MISSIONS,
  getCheckinReward,
  getDailyChallenge,
  localDateKey,
  missionClaimed,
  missionProgress,
  previousDateKey,
} from "../retention";

export class DailyScene extends Phaser.Scene {
  constructor() {
    super("DailyScene");
  }

  create() {
    addGradientBackground(this, 0x35b9f2, 0xebfbff);
    const save = loadSave();
    const today = localDateKey();
    const challenge = getDailyChallenge(today);

    this.add.text(24, 27, "DAILY CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#196aaa",
      letterSpacing: 1,
    });

    this.add.text(24, 48, "Come back. Build more.", {
      fontFamily: "Inter, system-ui",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#123767",
    });

    pill(this, 260, 43, 86, "COINS", "●", String(save.coins));
    pill(this, 344, 43, 66, "STAR", "★", String(save.stars));

    button(this, 53, 91, 82, 30, "‹ HOME", () => this.scene.start("HomeScene"), COLORS.primary, "secondary");

    this.createCheckinCard(save.lastCheckinDate, save.dailyStreak);
    this.createChallengeCard(challenge.targetLines, challenge.targetPlacements, challenge.rewardCoins, save.dailyChallengeCompletedDate === today);
    this.createMissionCards();
    this.createChest();

    this.add.text(W - 22, 813, "v0.9", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#4f7b9b",
    }).setOrigin(1, 0.5);
  }

  private createCheckinCard(lastCheckinDate: string, currentStreak: number) {
    const today = localDateKey();
    const alreadyClaimed = lastCheckinDate === today;
    const nextStreak = alreadyClaimed
      ? currentStreak
      : lastCheckinDate === previousDateKey()
        ? currentStreak + 1
        : 1;
    const reward = getCheckinReward(nextStreak);

    panel(this, W / 2, 151, W - 34, 96, { fill: 0xffffff, stroke: 0x8cd7ef, radius: 18 });

    this.add.text(36, 119, "CHECK-IN STREAK", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#5181a4",
      letterSpacing: 1,
    });

    this.add.text(36, 140, `🔥 ${currentStreak} day${currentStreak === 1 ? "" : "s"}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#123767",
    });

    const daysStart = 38;
    for (let i = 0; i < 7; i += 1) {
      const x = daysStart + i * 35;
      const day = i + 1;
      const activeDay = ((Math.max(1, nextStreak) - 1) % 7) + 1;
      const claimed = alreadyClaimed ? day <= activeDay : day < activeDay;
      const current = day === activeDay;
      this.add.circle(
        x,
        184,
        11,
        current ? COLORS.gold : claimed ? COLORS.mint : 0xc4d8e3,
        1,
      ).setStrokeStyle(2, 0xffffff, 0.95);
      text(this, x, 184, String(day), 8, current ? "#123767" : claimed ? "#ffffff" : "#6e8ca3", "800");
    }

    const rewardLabel = reward.stars
      ? `CLAIM  ● ${reward.coins}  +  ★ ${reward.stars}`
      : `CLAIM  ● ${reward.coins}`;

    const claim = button(
      this,
      302,
      151,
      132,
      42,
      alreadyClaimed ? "CLAIMED ✓" : rewardLabel,
      () => this.claimCheckin(),
      alreadyClaimed ? 0x8aa7b8 : COLORS.gold,
      alreadyClaimed ? "muted" : "gold",
    );
    if (alreadyClaimed) claim.disableInteractive();
  }

  private createChallengeCard(lines: number, placements: number, rewardCoins: number, completed: boolean) {
    panel(this, W / 2, 287, W - 34, 132, { fill: completed ? 0xeafff3 : 0xe6f6ff, stroke: completed ? 0x77d69e : 0x75c9ef, radius: 19 });
    iconBubble(this, 320, 260, completed ? "✓" : "🧩", completed ? COLORS.success : COLORS.primary, 24);

    this.add.text(36, 238, "DAILY CHALLENGE", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#1677b8",
      letterSpacing: 1,
    });

    this.add.text(36, 260, "Daily City Plan", {
      fontFamily: "Inter, system-ui",
      fontSize: "19px",
      fontStyle: "bold",
      color: "#123767",
    });

    this.add.text(36, 291, `Clear ${lines} lines  •  Place ${placements} blocks`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      color: "#557b99",
    });

    this.add.text(36, 315, `Reward  ★ 1  •  ● ${rewardCoins}  •  +1 chest key`, {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#a96b13",
    });

    this.add.text(36, 334, "FAIR PLAY • Boosters disabled inside Daily Challenge", {
      fontFamily: "Inter, system-ui",
      fontSize: "7px",
      fontStyle: "bold",
      color: "#577d98",
    });

    button(
      this,
      299,
      343,
      132,
      38,
      completed ? "COMPLETED ✓" : "PLAY DAILY →",
      () => {
        if (!completed) this.scene.start("PuzzleScene", { daily: true });
      },
      completed ? 0x8aa7b8 : COLORS.primary,
      completed ? "muted" : "primary",
    );
  }

  private createMissionCards() {
    const save = loadSave();

    sectionLabel(this, 24, 374, "DAILY MISSIONS");
    this.add.text(24, 374, "", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6f9299",
      letterSpacing: 1,
    });

    DAILY_MISSIONS.forEach((mission, index) => {
      const y = 420 + index * 72;
      const progress = Math.min(mission.target, missionProgress(save, mission.id));
      const claimed = missionClaimed(save, mission.id);
      const complete = progress >= mission.target;

      panel(this, W / 2, y, W - 34, 58, { fill: complete ? 0xeffff5 : 0xffffff, stroke: complete ? 0x7dd6a2 : 0xa8d5e8, radius: 14, shadowAlpha: 0.12 });

      const icon = mission.id === "lines" ? "▦" : mission.id === "placements" ? "◆" : "🏗";
      text(this, 48, y, icon, 17, complete ? "#1ea761" : "#4f91bb", "800");

      this.add.text(70, y - 14, mission.title, {
        fontFamily: "Inter, system-ui",
        fontSize: "11px",
        fontStyle: "bold",
        color: "#123767",
      });

      this.add.text(70, y + 6, `${progress}/${mission.target}  •  ● ${mission.rewardCoins}`, {
        fontFamily: "Inter, system-ui",
        fontSize: "8.5px",
        color: complete ? "#179157" : "#66839d",
      });

      const label = claimed ? "CLAIMED" : complete ? "CLAIM" : "IN PROGRESS";
      const claim = button(
        this,
        316,
        y,
        102,
        34,
        label,
        () => this.claimMission(mission.id),
        claimed ? 0x8aa7b8 : complete ? COLORS.gold : 0x79aac5,
        complete && !claimed ? "gold" : claimed ? "muted" : "secondary",
      );
      if (!complete || claimed) claim.disableInteractive();
    });
  }

  private createChest() {
    const save = loadSave();
    const ready = save.chestProgress >= 5;

    panel(this, W / 2, 696, W - 34, 116, { fill: ready ? 0xfff5cf : 0xf5fbff, stroke: ready ? 0xf0b638 : 0x9bcde3, radius: 19 });

    iconBubble(this, 58, 687, ready ? "🎁" : "🔑", ready ? COLORS.goldDark : COLORS.primary, 25);

    this.add.text(91, 660, "CITY CHEST", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: ready ? "#ad6a12" : "#587e9d",
      letterSpacing: 1,
    });

    this.add.text(91, 682, ready ? "Chest ready!" : `${save.chestProgress}/5 keys collected`, {
      fontFamily: "Inter, system-ui",
      fontSize: "15px",
      fontStyle: "bold",
      color: "#123767",
    });

    this.add.text(91, 707, "Daily challenge + mission claims give keys.", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      color: "#68839b",
    });

    const chest = button(
      this,
      W / 2,
      765,
      W - 84,
      44,
      ready ? "OPEN CHEST  •  ● 250  +  ★ 1" : "COLLECT 5 KEYS",
      () => this.claimChest(),
      ready ? COLORS.gold : 0x78aac5,
      ready ? "gold" : "secondary",
    );
    if (!ready) chest.disableInteractive();
  }

  private claimCheckin() {
    const today = localDateKey();
    const current = loadSave();
    if (current.lastCheckinDate === today) return;

    const nextStreak =
      current.lastCheckinDate === previousDateKey()
        ? current.dailyStreak + 1
        : 1;
    const reward = getCheckinReward(nextStreak);

    updateSave((save) => ({
      ...save,
      lastCheckinDate: today,
      dailyStreak: nextStreak,
      coins: save.coins + reward.coins,
      stars: save.stars + reward.stars,
    }));

    this.scene.restart();
  }

  private claimMission(id: "lines" | "placements" | "builds") {
    const mission = DAILY_MISSIONS.find((item) => item.id === id);
    if (!mission) return;

    const save = loadSave();
    if (missionClaimed(save, id)) return;
    if (missionProgress(save, id) < mission.target) return;

    updateSave((current) => ({
      ...current,
      coins: current.coins + mission.rewardCoins,
      chestProgress: Math.min(5, current.chestProgress + 1),
      dailyMissionClaims: [...current.dailyMissionClaims, id],
    }));

    this.scene.restart();
  }

  private claimChest() {
    const save = loadSave();
    if (save.chestProgress < 5) return;

    updateSave((current) => ({
      ...current,
      chestProgress: 0,
      coins: current.coins + 250,
      stars: current.stars + 1,
      xp: current.xp + 60,
    }));

    const group = this.add.container(0, 0).setDepth(220);
    const dim = this.add.rectangle(W / 2, 422, W, 844, 0x063667, 0.68);
    const card = panel(this, W / 2, 420, W - 70, 282, { fill: 0xfffbeb, stroke: 0xf0b538, radius: 24, shadowAlpha: 0.35 });

    const glow = this.add.circle(W / 2, 365, 78, 0xffd56d, 0.07);
    const chest = text(this, W / 2, 365, "▣", 74, "#ffd56d", "800").setScale(0.35);
    const title = text(this, W / 2, 434, "CITY CHEST OPENED", 19, "#123767", "800");
    const reward = text(this, W / 2, 472, "● 250   +   ★ 1   +   60 XP", 13, "#a86712", "800");
    const subtitle = text(this, W / 2, 500, "Keep completing Daily missions to fill the next chest.", 8, "#66839c", "700");

    const done = button(this, W / 2, 548, 206, 42, "COLLECT", () => {
      this.scene.restart();
    }, COLORS.gold, "gold");

    group.add([dim, card, glow, chest, title, reward, subtitle, done]);

    this.tweens.add({
      targets: glow,
      scaleX: 1.6,
      scaleY: 1.6,
      alpha: 0,
      duration: 900,
      repeat: -1,
      ease: "Sine.Out",
    });

    this.tweens.add({
      targets: chest,
      scaleX: 1,
      scaleY: 1,
      angle: 8,
      duration: 520,
      ease: "Back.Out",
    });

    for (let i = 0; i < 12; i += 1) {
      const spark = this.add.circle(
        W / 2,
        365,
        Phaser.Math.Between(2, 4),
        i % 2 ? 0xffd56d : 0x75ddb8,
        0.9,
      ).setDepth(221);

      const angle = (Math.PI * 2 * i) / 12;
      this.tweens.add({
        targets: spark,
        x: W / 2 + Math.cos(angle) * Phaser.Math.Between(55, 105),
        y: 365 + Math.sin(angle) * Phaser.Math.Between(45, 90),
        alpha: 0,
        duration: Phaser.Math.Between(520, 820),
        ease: "Cubic.Out",
        onComplete: () => spark.destroy(),
      });
    }
  }
}
