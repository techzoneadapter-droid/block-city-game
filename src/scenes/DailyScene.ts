import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
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
    coastalBackdrop(this);
    const save = loadSave();
    const today = localDateKey();
    const challenge = getDailyChallenge(today);
    const claimed = save.lastCheckinDate === today;
    const nextStreak = claimed
      ? save.dailyStreak
      : save.lastCheckinDate === previousDateKey()
        ? save.dailyStreak + 1
        : 1;
    const reward = getCheckinReward(nextStreak);

    screenHeader(this, "TASKS & REWARDS", "Daily City Board", save.coins, save.stars);

    const gift = panel(this, W / 2, 190, 354, 126, {
      fill: 0xfff0b7,
      stroke: COLORS.gold,
      radius: 22,
      shadowAlpha: 0.25,
    });
    gift.add([
      gameIcon(this, -128, -6, "chest", 82),
      text(this, -82, -38, "DAILY GIFT", 10, "#956017", "800").setOrigin(0, 0.5),
      text(this, -82, -14, `${nextStreak} DAY STREAK`, 20, "#123767", "800").setOrigin(0, 0.5),
      gameIcon(this, -79, 19, "coin", 18),
      text(this, -55, 19, String(reward.coins), 11, "#8a5b17", "800"),
    ]);
    if (reward.stars) {
      gift.add([
        gameIcon(this, 0, 19, "star", 18),
        text(this, 24, 19, String(reward.stars), 11, "#8a5b17", "800"),
      ]);
    }
    const claim = button(
      this,
      243,
      224,
      194,
      34,
      claimed ? "COLLECTED ✓" : "CLAIM GIFT",
      () => this.claimCheckin(),
      COLORS.gold,
      claimed ? "muted" : "gold",
    );
    if (claimed) claim.setDisabled(true);

    const streakLine = this.add.graphics();
    streakLine.lineStyle(5, 0xe7b64d, 0.9).lineBetween(48, 258, 342, 258);
    for (let i = 0; i < 7; i += 1) {
      const x = 48 + i * 49;
      const day = ((Math.max(1, nextStreak) - 1) % 7) + 1;
      const active = i + 1 === day;
      const done = i + 1 < day;
      this.add.circle(x, 258, active ? 17 : 15, active ? COLORS.gold : done ? COLORS.mint : 0xcbe1e9)
        .setStrokeStyle(2, 0xffffff);
      text(this, x, 258, i === 6 ? "★" : String(i + 1), 12, active ? "#123767" : "#ffffff", "800");
    }

    const completed = save.dailyChallengeCompletedDate === today;
    const daily = panel(this, W / 2, 337, 354, 120, {
      fill: 0xdff6ff,
      stroke: 0x66d4f5,
      radius: 20,
      shadowAlpha: 0.2,
    });
    daily.add([
      gameIcon(this, -135, -18, "puzzle", 48),
      text(this, -98, -30, "DAILY PUZZLE", 9, "#2b77a8", "800").setOrigin(0, 0.5),
      text(this, -98, -8, challenge.title, 17, "#123767", "800").setOrigin(0, 0.5),
      text(this, -98, 15, `${challenge.targetLines} lines • ${challenge.targetPlacements} blocks`, 10, "#547590", "700").setOrigin(0, 0.5),
      text(this, -135, 43, "NO BOOSTERS", 8, "#7e6b3d", "800"),
      gameIcon(this, -42, 42, "star", 18),
      text(this, -18, 42, "1", 10, "#8a611a", "800"),
      gameIcon(this, 15, 42, "coin", 18),
      text(this, 44, 42, String(challenge.rewardCoins), 10, "#8a611a", "800"),
    ]);
    const play = button(
      this,
      286,
      369,
      142,
      38,
      completed ? "DONE ✓" : "PLAY ▶",
      () => this.scene.start("PuzzleScene", { daily: true }),
      COLORS.primary,
      completed ? "muted" : "primary",
    );
    if (completed) play.setDisabled(true);

    sectionLabel(this, 22, 414, "TODAY’S MISSIONS");
    DAILY_MISSIONS.forEach((mission, index) => {
      const y = 460 + index * 59;
      const progress = Math.min(mission.target, missionProgress(save, mission.id));
      const done = missionClaimed(save, mission.id);
      const ready = progress >= mission.target;
      const card = panel(this, W / 2, y, 354, 50, {
        fill: done ? 0xe2f8ea : ready ? 0xfff0bd : 0xf6fbff,
        stroke: ready ? COLORS.gold : done ? 0x76d8a1 : 0xb9dce9,
        radius: 14,
        shadowAlpha: ready ? 0.17 : 0.1,
      });
      card.add([
        gameIcon(this, -146, 0, mission.id === "builds" ? "city" : "puzzle", 30),
        text(this, -118, -12, mission.title, 10, "#123767", "800").setOrigin(0, 0.5),
        progressBar(this, -118, 8, 135, progress / mission.target, done ? COLORS.mint : COLORS.mintDark, 7),
        text(this, 31, 8, `${progress}/${mission.target}`, 9, "#4d708d", "800"),
        gameIcon(this, 78, -10, "coin", 17),
        text(this, 103, -10, String(mission.rewardCoins), 10, "#8e6118", "800"),
      ]);
      if (ready && !done) {
        card.add(button(this, 126, 12, 74, 24, "CLAIM", () => this.claimMission(mission.id), COLORS.gold, "gold"));
      } else if (done) {
        card.add(text(this, 126, 12, "✓", 15, "#16864d", "800"));
      } else {
        card.add(gameIcon(this, 128, 12, "lock", 15));
      }
    });

    const ready = save.chestProgress >= 5;
    const chest = panel(this, W / 2, 674, 354, 108, {
      fill: COLORS.cream,
      stroke: COLORS.gold,
      radius: 20,
      shadowAlpha: 0.24,
    });
    chest.add([
      gameIcon(this, -132, 0, "chest", 84),
      text(this, -78, -27, ready ? "CITY CHEST READY!" : "CITY CHEST", 12, "#8e6118", "800").setOrigin(0, 0.5),
      text(this, -78, -7, `${save.chestProgress}/5 keys`, 15, "#123767", "800").setOrigin(0, 0.5),
      progressBar(this, -78, 18, 165, save.chestProgress / 5, COLORS.gold, 10),
    ]);
    if (ready) {
      chest.add(button(this, 84, 27, 132, 34, "OPEN CHEST", () => this.claimChest(), COLORS.gold, "gold"));
    } else {
      chest.add(text(this, 87, 26, "Earn keys from tasks", 9, "#627d93", "700"));
    }

    const taskReady =
      !claimed ||
      save.chestProgress >= 5 ||
      DAILY_MISSIONS.some((mission) =>
        missionProgress(save, mission.id) >= mission.target && !missionClaimed(save, mission.id),
      );
    bottomNavigation(this, "DailyScene", taskReady ? ["DailyScene"] : []);
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

    rewardDialog(this, "CITY CHEST OPENED", "● 250   ★ 1   +60 XP", () => this.scene.restart());
  }
}
