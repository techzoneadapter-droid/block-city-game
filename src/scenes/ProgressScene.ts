import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
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
    coastalBackdrop(this);
    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const milestone = milestoneCopy(save);
    screenHeader(this, 'MEET THE BUILDER', 'Your city. Your story.', save.coins, save.stars);
    panel(this, W / 2, 206, 354, 151, { fill: 0xe4f8ff, stroke: 0x4dc4f1, radius: 24 });
    this.add.circle(74, 191, 42, 0x7bde88).setStrokeStyle(4, 0xffffff);
    gameIcon(this, 74, 190, 'builder', 78);
    text(this, 246, 156, 'Player123', 23);
    text(this, 246, 185, `Level ${profile.level} Builder`, 16, '#1767a9');
    text(this, 246, 213, `${profile.currentXp} / ${profile.neededXp} XP`, 12);
    progressBar(this, 135, 236, 210, profile.progress, COLORS.mint, 13);
    text(this, W / 2, 263, 'Solve puzzles. Build places. Make memories.', 12, '#426c8a');

    const stats = [[save.totalLevelsCompleted, 'Levels'], [save.totalBuilds, 'Builds'], [save.population, 'Neighbors']];
    stats.forEach(([value, label], index) => {
      const x = 74 + index * 121;
      panel(this, x, 319, 110, 58, { fill: 0x147ecc, stroke: 0x81dbff, radius: 16 });
      text(this, x, 307, String(value), 22, '#ffffff');
      text(this, x, 333, String(label), 11, '#e1f6ff');
    });
    panel(this, W / 2, 407, 354, 94, { fill: COLORS.cream, stroke: COLORS.gold, radius: 20 });
    gameIcon(this, 50, 397, 'city', 42);
    text(this, 224, 380, 'NEXT BIG UNLOCK', 11, '#946318');
    const title = text(this, 224, 402, milestone.title, 17);
    if (title.width > 260) title.setFontSize(14);
    progressBar(this, 86, 431, 228, milestone.target ? milestone.progress / milestone.target : 0, COLORS.gold, 12);
    text(this, 340, 431, `${milestone.progress}/${milestone.target}`, 11);
    sectionLabel(this, 23, 466, 'BUILDER BADGES');
    ACHIEVEMENTS.forEach((achievement, index) => {
      const y = 514 + index * 54;
      const progress = achievementProgress(save, achievement);
      const claimed = save.achievementClaims.includes(achievement.id);
      const ready = achievementReady(save, achievement);
      panel(this, W / 2, y, 354, 48, { fill: claimed ? 0xe0ffed : ready ? 0xfff2c8 : 0xf1faff, stroke: ready ? COLORS.gold : COLORS.outline, radius: 14 });
      gameIcon(this, 44, y, claimed ? 'trophy' : 'lock', 33);
      this.add.text(69, y - 18, achievement.title, { fontFamily: 'system-ui', fontSize: '12px', fontStyle: 'bold', color: '#123767' });
      this.add.text(69, y + 2, `${progress}/${achievement.target} • ● ${achievement.rewardCoins}${achievement.rewardStars ? ' + ★ ' + achievement.rewardStars : ''}`, { fontFamily: 'system-ui', fontSize: '11px', color: '#426c8a' });
      const claim = button(this, 321, y, 87, 38, claimed ? 'Done ✓' : ready ? 'CLAIM' : 'Locked', () => this.claimAchievement(achievement.id), COLORS.gold, ready ? 'gold' : 'muted');
      if (!ready) claim.disableInteractive();
    });
    bottomNavigation(this, 'ProgressScene');
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

    rewardDialog(this, "BADGE EARNED!", `● ${achievement.rewardCoins}  ★ ${achievement.rewardStars}  +1 key`, () => this.scene.restart());
  }
}
