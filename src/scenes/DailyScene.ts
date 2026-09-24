import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W , GAME_FONT } from "../ui";
import { loadSave, updateSave } from "../save";
import { createVoxelBuilding, createVoxelChest, createVoxelTree, voxelGroundTile } from "../voxelArt";
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
    const giftChest=createVoxelChest(this,67,193,0.82,claimed).setDepth(20);
    if(!claimed) this.tweens.add({targets:giftChest,y:188,duration:1050,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    text(this, 68, 230, 'DAILY GIFT', 10, '#976011');
    text(this, 226, 155, `${nextStreak} DAY STREAK`, 21);
    const claim = button(this, 233, 205, 226, 34, claimed ? 'Collected today ✓' : 'CLAIM GIFT', () => this.claimCheckin(), COLORS.gold, claimed ? 'muted' : 'gold');
    if (claimed) claim.disableInteractive();
    gameIcon(this, 190, 175, 'coin', 18);
    text(this, 215, 175, String(reward.coins), 12, '#895b17');
    if (reward.stars) { gameIcon(this, 256, 175, 'star', 18); text(this, 278, 175, String(reward.stars), 12); }
    this.add.graphics().lineStyle(5, 0xe8b44d).lineBetween(48, 250, 342, 250);
    for (let i = 0; i < 7; i++) {
      const x = 48 + i * 49;
      const day = ((Math.max(1, nextStreak) - 1) % 7) + 1;
      this.add.circle(x, 250, 16, i + 1 === day ? COLORS.gold : i + 1 < day ? COLORS.mint : 0xcbe1e9).setStrokeStyle(2, 0xffffff);
      text(this, x, 250, i === 6 ? '★' : String(i + 1), 13);
    }

    const completed = save.dailyChallengeCompletedDate === today;
    panel(this, W / 2, 351, 354, 134, { fill: 0xbdeeff, stroke: 0x56c5ef, radius: 20 });
    voxelGroundTile(this,64,348,76,43,0x61c95b,0x7d5434).setDepth(5);
    createVoxelBuilding(this,'house',1,0.42).setPosition(55,347).setDepth(8);
    createVoxelTree(this,78,345,0.34,'grass').setDepth(9);
    text(this, 222, 307, 'Daily City Plan', 21);
    text(this, 216, 333, `${challenge.targetLines} lines • ${challenge.targetPlacements} blocks`, 12);
    gameIcon(this, 94, 360, 'star', 21); text(this, 118, 360, '1', 13);
    gameIcon(this, 151, 360, 'coin', 21); text(this, 182, 360, String(challenge.rewardCoins), 13);
    text(this, 278, 360, '1 chest key', 12, '#996010');
    text(this, 92, 396, 'Fair play\nNo boosters', 11, '#426c8a');
    const play = button(this, 255, 395, 194, 40, completed ? 'Completed ✓' : 'PLAY DAILY ▶', () => this.scene.start('PuzzleScene', { daily: true }), COLORS.primary, completed ? 'muted' : 'primary');
    if (completed) play.disableInteractive();

    sectionLabel(this, 22, 430, 'TODAY’S MISSIONS');
    DAILY_MISSIONS.forEach((mission, index) => {
      const y = 478 + index * 63;
      const progress = Math.min(mission.target, missionProgress(save, mission.id));
      const done = missionClaimed(save, mission.id);
      const ready = progress >= mission.target;
      panel(this, W / 2, y, 354, 54, { fill: done ? 0xe0f7e8 : ready ? 0xffefbd : 0xf4fbff, stroke: ready ? COLORS.gold : 0xb6d9e7, radius: 15 });
      gameIcon(this, 43, y, mission.id === 'builds' ? 'city' : 'puzzle', 32);
      this.add.text(68, y - 19, mission.title, { fontFamily: GAME_FONT, fontSize: '12px', fontStyle: 'bold', color: '#123767' });
      progressBar(this, 68, y + 8, 139, progress / mission.target, done ? COLORS.mint : COLORS.mintDark, 7);
      text(this, 234, y + 8, `${progress}/${mission.target}`, 11, '#426c8a');
      gameIcon(this, 286, y - 10, 'coin', 20);
      text(this, 321, y - 10, String(mission.rewardCoins), 14, '#996010');
      if (ready && !done) button(this, 314, y + 13, 84, 25, 'CLAIM', () => this.claimMission(mission.id), COLORS.gold, 'gold');
      else if (done) text(this, 313, y + 13, '✓ CLAIMED', 10, '#16864d');

    });
    const ready = save.chestProgress >= 5;
    panel(this, W / 2, 694, 354, 106, { fill: COLORS.cream, stroke: COLORS.gold, radius: 20 });
    const cityChest=createVoxelChest(this,62,704,0.86,ready).setDepth(20);
    if(ready) this.tweens.add({targets:cityChest,scaleX:0.92,scaleY:0.92,duration:650,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    text(this, 225, 658, ready ? 'Your City Chest is ready!' : `City Chest • ${save.chestProgress}/5 keys`, 15);
    progressBar(this, 113, 681, 220, save.chestProgress / 5, COLORS.gold, 12);
    if (ready) button(this, 224, 719, 244, 40, 'OPEN CITY CHEST', () => this.claimChest(), COLORS.gold, 'gold');
    else { gameIcon(this, 132, 715, 'lock', 20); text(this, 236, 715, 'Earn keys from missions', 12, '#537392'); }
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
