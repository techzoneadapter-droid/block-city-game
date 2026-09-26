import { preloadAssets } from '../ui/assets';
import { boardCard, boardLabel, rewardAmount, boardHeader, rewardArt } from '../ui/secondary';
import Phaser from "phaser";
import { bottomNavigation, addGradientBackground, gameIcon, rewardDialog,  button, COLORS, progressBar, text } from "../ui";
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

  preload() { preloadAssets(this, ['city.']); }

  create() {
    addGradientBackground(this);
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

    boardHeader(this, "TASKS & REWARDS", "Daily City Board", save.coins, save.stars);

    const gift = boardCard(this, 227, 148, true);
    gift.add([
      rewardArt(this, -123, -28, "chest", 90),
      text(this, -62, -49, "Daily Gift", 25).setOrigin(0, .5),
      text(this, -62, -22, `${nextStreak} day streak • Keep it growing!`, 12, '#85601c').setOrigin(0, .5),
      rewardAmount(this, -53, 5, 'coin', reward.coins),
    ]);
    if (reward.stars) gift.add(rewardAmount(this, 20, 5, 'star', reward.stars));
    button(this, 291, 235, 122, 32, claimed ? 'COLLECTED' : 'CLAIM GIFT', () => this.claimCheckin(), COLORS.success, 'success', { disabled: claimed, fontSize: 13 });
    const day = ((Math.max(1, nextStreak) - 1) % 7) + 1;
    this.add.graphics().lineStyle(4, 0xe6d7a0).lineBetween(48, 278, 342, 278);
    for (let i = 0; i < 7; i++) {
      const x = 48 + i * 49;
      const done = i + 1 < day || (i + 1 === day && claimed);
      this.add.circle(x, 278, 15, done ? COLORS.mintDark : i + 1 === day ? COLORS.gold : 0xffffff).setStrokeStyle(2, i + 1 === day ? 0xe5a424 : 0xd5c891);
      if (i === 6 && !done) gameIcon(this, x, 278, 'star', 22);
      else if (done) this.add.graphics().lineStyle(3, 0xffffff).beginPath().moveTo(x - 6, 278).lineTo(x - 1, 283).lineTo(x + 7, 273).strokePath();
      else text(this, x, 278, String(i + 1), 13, '#78551e');
    }

    const completed = save.dailyChallengeCompletedDate === today;
    const daily = boardCard(this, 372, 116);
    daily.add([
      gameIcon(this, -131, -15, 'puzzle', 58),
      text(this, -89, -35, 'Daily Puzzle', 21).setOrigin(0, .5),
      text(this, -89, -9, `${challenge.targetLines} lines • ${challenge.targetPlacements} blocks`, 13, '#426b91').setOrigin(0, .5),
      text(this, -89, 12, 'A fresh challenge. No boosters.', 11, '#426b91').setOrigin(0, .5),
      rewardAmount(this, -137, 37, 'coin', challenge.rewardCoins),
      rewardAmount(this, -62, 37, 'star', 1),
    ]);
    button(this, 291, 404, 122, 32, completed ? 'COMPLETED' : 'PLAY', () => this.scene.start('PuzzleScene', { daily: true }), COLORS.primary, 'primary', { disabled: completed, fontSize: 14 });

    boardLabel(this, 450, 'Today’s missions', 'Each task earns a key');
    const missions = boardCard(this, 549, 172);
    DAILY_MISSIONS.forEach((mission, index) => {
      const y = -56 + index * 56;
      const progress = Math.min(mission.target, missionProgress(save, mission.id));
      const done = missionClaimed(save, mission.id);
      const ready = progress >= mission.target;
      if (index) missions.add(this.add.rectangle(0, y - 28, 318, 1, 0xdcedf7));
      missions.add([
        gameIcon(this, -147, y, mission.id === 'builds' ? 'city' : 'puzzle', 33),
        text(this, -120, y - 13, mission.title, 13).setOrigin(0, .5),
        progressBar(this, -120, y + 11, 120, progress / mission.target, COLORS.mint, 12),
        text(this, 21, y + 11, `${progress}/${mission.target}`, 11),
        rewardAmount(this, 66, y - 14, 'coin', mission.rewardCoins),
      ]);
      if (ready && !done) missions.add(button(this, 116, y + 10, 83, 28, 'CLAIM', () => this.claimMission(mission.id), COLORS.success, 'success'));
      else missions.add(text(this, 117, y + 12, done ? '✓ Claimed' : 'In progress', 11, done ? '#11864c' : '#58779a'));
    });

    const ready = save.chestProgress >= 5;
    const chest = boardCard(this, 698, 100, ready);
    chest.add([
      rewardArt(this, -133, 0, 'chest', 76),
      text(this, -84, -28, ready ? 'City Chest is ready!' : 'City Chest', 20).setOrigin(0, .5),
      text(this, -84, -3, `${Math.min(5, save.chestProgress)}/5 keys • Complete your missions`, 12, '#426b91').setOrigin(0, .5),
      progressBar(this, -84, 24, ready ? 105 : 230, save.chestProgress / 5, COLORS.gold, 15),
    ]);
    if (ready) chest.add(button(this, 96, 22, 123, 32, 'OPEN CHEST', () => this.claimChest(), COLORS.gold, 'gold'));

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
