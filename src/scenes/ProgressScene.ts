import { referenceArt } from '../referenceArt';
import Phaser from "phaser";
import { CHARACTERS, showCharacterPicker, bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
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
    const characterName = CHARACTERS.find(([id]) => id === save.avatar)?.[1] ?? 'Builder Boy';
    screenHeader(this, 'CHARACTER SHEET', characterName, save.coins, save.stars);
    panel(this, W / 2, 219, 354, 176, { fill: save.avatar === 'planner' ? 0xffeafa : 0xe4f8ff, stroke: 0x80d9f4, radius: 22 });
    const portrait = referenceArt(this, 84, 203, `${save.avatar}-body`, 110, 142)
      ?? gameIcon(this, 84, 203, save.avatar, 100);
    portrait.setInteractive({ useHandCursor: true }).on('pointerup', () => showCharacterPicker(this));
    text(this, 84, 284, 'CHANGE', 11, '#1767a9').setPadding(12, 8).setInteractive({ useHandCursor: true }).on('pointerup', () => showCharacterPicker(this));
    text(this, 252, 160, 'Player123', 23);
    text(this, 252, 188, `Level ${profile.level} • ${characterName}`, 12, '#1767a9');
    progressBar(this, 151, 218, 191, profile.progress, COLORS.mint, 13);
    text(this, 246, 241, `${profile.currentXp} / ${profile.neededXp} XP`, 12);
    gameIcon(this, 191, 278, 'hammer', 32);
    gameIcon(this, 245, 278, save.avatar === 'planner' ? 'planner-wink' : 'builder-wink', 38);
    gameIcon(this, 303, 278, 'corgi', 38);

    const stats = [[save.totalLevelsCompleted, 'Levels'], [save.totalBuilds, 'Builds'], [save.population, 'Neighbors']];
    stats.forEach(([value, label], index) => {
      const x = 74 + index * 121;
      panel(this, x, 345, 110, 58, { fill: 0xf4fcff, stroke: 0x81dbff, radius: 14 });
      text(this, x, 333, String(value), 22);
      text(this, x, 359, String(label), 11, '#1767a9');
    });
    panel(this, W / 2, 424, 354, 80, { fill: COLORS.cream, stroke: COLORS.gold, radius: 20 });
    gameIcon(this, 50, 421, 'city', 42);
    text(this, 224, 400, 'NEXT BIG UNLOCK', 11, '#946318');
    const title = text(this, 224, 422, milestone.title, 17);
    if (title.width > 260) title.setFontSize(14);
    progressBar(this, 86, 447, 228, milestone.target ? milestone.progress / milestone.target : 0, COLORS.gold, 12);
    text(this, 340, 447, `${milestone.progress}/${milestone.target}`, 11);
    sectionLabel(this, 23, 475, 'BUILDER BADGES');
    ACHIEVEMENTS.forEach((achievement, index) => {
      const y = 517 + index * 53;
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
