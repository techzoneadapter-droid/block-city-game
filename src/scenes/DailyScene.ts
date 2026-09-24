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
    const nextStreak = claimed ? save.dailyStreak : save.lastCheckinDate === previousDateKey() ? save.dailyStreak + 1 : 1;
    const reward = getCheckinReward(nextStreak);
    screenHeader(this, "A LITTLE JOY, EVERY DAY", "Daily treasures", save.coins, save.stars);

    panel(this, W / 2, 201, 354, 146, { fill: 0xffeaa3, stroke: COLORS.gold, radius: 22 });
    gameIcon(this, 67, 181, 'chest', 90);
    text(this, 68, 222, 'DAILY GIFT', 10, '#976011');
    text(this, 226, 155, `${nextStreak} DAY STREAK`, 21);
    const claim = button(this, 233, 198, 226, 42, claimed ? 'Collected today ✓' : `CLAIM ● ${reward.coins}${reward.stars ? ' + ★ 1' : ''}`, () => this.claimCheckin(), COLORS.gold, claimed ? 'muted' : 'gold');
    if (claimed) claim.disableInteractive();
    this.add.graphics().lineStyle(5, 0xe8b44d).lineBetween(48, 250, 342, 250);
    for (let i = 0; i < 7; i++) {
      const x = 48 + i * 49;
      const day = ((Math.max(1, nextStreak) - 1) % 7) + 1;
      this.add.circle(x, 250, 16, i + 1 === day ? COLORS.gold : i + 1 < day ? COLORS.mint : 0xcbe1e9).setStrokeStyle(2, 0xffffff);
      text(this, x, 250, i === 6 ? '★' : String(i + 1), 13);
    }

    const completed = save.dailyChallengeCompletedDate === today;
    panel(this, W / 2, 351, 354, 134, { fill: 0xbdeeff, stroke: 0x56c5ef, radius: 20 });
    gameIcon(this, 54, 316, 'puzzle', 38);
    text(this, 216, 307, 'Daily City Plan', 21);
    text(this, 216, 333, `${challenge.targetLines} lines • ${challenge.targetPlacements} blocks`, 12);
    text(this, W / 2, 359, `★ 1  •  ● ${challenge.rewardCoins}  •  1 chest key`, 13, '#996010');
    text(this, 92, 396, 'Fair play\nNo boosters', 11, '#426c8a');
    const play = button(this, 255, 395, 194, 40, completed ? 'Completed ✓' : 'PLAY DAILY ▶', () => this.scene.start('PuzzleScene', { daily: true }), COLORS.primary, completed ? 'muted' : 'primary');
    if (completed) play.disableInteractive();

    sectionLabel(this, 22, 430, 'TODAY’S MISSIONS');
    DAILY_MISSIONS.forEach((mission, index) => {
      const y = 478 + index * 63;
      const progress = Math.min(mission.target, missionProgress(save, mission.id));
      const done = missionClaimed(save, mission.id);
      const ready = progress >= mission.target;
      panel(this, W / 2, y, 354, 54, { fill: done ? 0xc5f4d6 : ready ? 0xffe9a1 : 0xc3eaff, stroke: ready ? COLORS.gold : 0x6cc9f2, radius: 15 });
      gameIcon(this, 43, y, mission.id === 'builds' ? 'city' : 'puzzle', 32);
      this.add.text(68, y - 19, mission.title, { fontFamily: 'system-ui', fontSize: '12px', fontStyle: 'bold', color: '#123767' });
      this.add.text(68, y + 2, `● ${mission.rewardCoins}   •   ${progress}/${mission.target}`, { fontFamily: 'system-ui', fontSize: '11px', color: '#426c8a' });
      progressBar(this, 68, y + 21, 179, progress / mission.target, done ? COLORS.mint : COLORS.gold, 5);
      const action = button(this, 319, y, 90, 40, done ? 'Done ✓' : ready ? 'CLAIM' : 'Keep going', () => this.claimMission(mission.id), COLORS.gold, ready && !done ? 'gold' : 'muted');
      if (!ready || done) action.disableInteractive();
    });
    const ready = save.chestProgress >= 5;
    panel(this, W / 2, 694, 354, 106, { fill: COLORS.cream, stroke: COLORS.gold, radius: 20 });
    gameIcon(this, 60, 690, 'chest', 77);
    text(this, 225, 658, ready ? 'Your City Chest is ready!' : `City Chest • ${save.chestProgress}/5 keys`, 15);
    progressBar(this, 113, 681, 220, save.chestProgress / 5, COLORS.gold, 12);
    const chest = button(this, 224, 719, 244, 40, ready ? 'OPEN • ● 250 + ★ 1' : 'Earn keys from missions', () => this.claimChest(), COLORS.gold, ready ? 'gold' : 'muted');
    if (!ready) chest.disableInteractive();
    bottomNavigation(this, 'DailyScene');
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
