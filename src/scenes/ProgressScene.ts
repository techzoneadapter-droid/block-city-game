import { referenceArt } from '../referenceArt';
import Phaser from "phaser";
import { CHARACTERS, CHARACTER_ACCESSORIES, CHARACTER_SUBTITLES, showCharacterPicker, bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
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
    text(this, 252, 158, characterName, 21);
    text(this, 252, 188, CHARACTER_SUBTITLES[save.avatar], 12, '#1767a9');
    progressBar(this, 151, 218, 191, profile.progress, COLORS.mint, 13);
    text(this, 246, 241, `Lv. ${profile.level} • ${profile.currentXp} / ${profile.neededXp} XP`, 12);
    (CHARACTER_ACCESSORIES[save.avatar] ?? []).forEach((asset, i) => gameIcon(this, 217 + i * 59, 278, asset, 42));

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
      const x = index % 2 === 0 ? 105 : 285;
      const y = 537 + Math.floor(index / 2) * 85;
      const progress = achievementProgress(save, achievement);
      const claimed = save.achievementClaims.includes(achievement.id);
      const ready = achievementReady(save, achievement);
      panel(this, x, y, 170, 77, { fill: claimed ? 0xe0ffed : ready ? 0xfff2c8 : 0xf4faff, stroke: ready ? COLORS.gold : 0xb5d6e4, radius: 15, shadowAlpha: 0.12 });
      this.add.circle(x - 56, y - 8, 22, claimed || ready ? 0xffe09b : 0xd5e8f0).setStrokeStyle(2, 0xffffff);
      gameIcon(this, x - 56, y - 8, ['puzzle', 'hat', 'city', 'chest', 'map'][index], 34).setAlpha(claimed || ready ? 1 : 0.72);
      text(this, x + 24, y - 24, achievement.title, 11, '#123767', '700');
      text(this, x + 23, y - 7, `${Math.min(progress, achievement.target)}/${achievement.target}`, 11, '#537392');
      progressBar(this, x - 13, y + 6, 75, progress / achievement.target, claimed ? COLORS.mint : COLORS.gold, 5);
      gameIcon(this, x - 57, y + 24, 'coin', 17);
      text(this, x - 31, y + 24, String(achievement.rewardCoins), 11, '#946318');
      if (achievement.rewardStars) { gameIcon(this, x - 3, y + 24, 'star', 16); text(this, x + 13, y + 24, String(achievement.rewardStars), 11, '#946318'); }
      if (ready && !claimed) button(this, x + 51, y + 24, 58, 24, 'CLAIM', () => this.claimAchievement(achievement.id), COLORS.gold, 'gold');
      else if (claimed) text(this, x + 52, y + 24, '✓', 15, '#16864d');
      else gameIcon(this, x + 60, y + 24, 'lock', 15);

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
