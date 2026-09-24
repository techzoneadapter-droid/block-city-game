import Phaser from "phaser";
import { CHARACTERS, characterHero, showCharacterPicker, bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, button, COLORS, panel, progressBar, sectionLabel, text, W } from "../ui";
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
    const characterName = CHARACTERS.find(([id]) => id === save.avatar)?.[1] ?? "Builder Boy";

    screenHeader(this, "CITY FRIENDS & BADGES", characterName, save.coins, save.stars);

    // Character-first composition from the approved avatar sheet.
    const hero = characterHero(this, W / 2, 246, save.avatar);
    hero.setDepth(20);
    hero.setSize(330, 224).setInteractive({ useHandCursor: true }).on("pointerup", () => showCharacterPicker(this));
    text(this, W / 2, 353, "Tap character to switch companion", 9, "#4f7898", "700");

    const stats: Array<[number, string, string]> = [
      [save.totalLevelsCompleted, "LEVELS", "puzzle"],
      [save.totalBuilds, "BUILDS", "hat"],
      [save.population, "NEIGHBORS", "friends"],
    ];
    stats.forEach(([value, label, icon], index) => {
      const x = 74 + index * 121;
      const card = panel(this, x, 389, 108, 56, {
        fill: 0xf5fcff,
        stroke: 0x8bdcff,
        radius: 14,
        shadowAlpha: 0.14,
      });
      card.add([
        gameIcon(this, -36, 0, icon, 30),
        text(this, 16, -9, String(value), 18, "#123767", "800"),
        text(this, 16, 12, label, 8, "#4e7897", "800"),
      ]);
    });

    const levelCard = panel(this, W / 2, 446, 350, 52, {
      fill: 0x087fd3,
      stroke: 0x5be0ff,
      radius: 16,
      shadowAlpha: 0.2,
    });
    levelCard.add([
      gameIcon(this, -144, 0, "star", 34),
      text(this, -116, -9, `BUILDER LV ${profile.level}`, 11, "#ffffff", "800").setOrigin(0, 0.5),
      text(this, -116, 11, `${profile.currentXp}/${profile.neededXp} XP`, 9, "#dff8ff", "700").setOrigin(0, 0.5),
    ]);
    const xp = progressBar(this, 48, 447, 117, profile.progress, COLORS.mint, 11);
    levelCard.add(xp);

    const nextCard = panel(this, W / 2, 509, 350, 68, {
      fill: COLORS.cream,
      stroke: COLORS.gold,
      radius: 18,
      shadowAlpha: 0.18,
    });
    nextCard.add([
      gameIcon(this, -144, 0, "city", 40),
      text(this, -104, -18, "NEXT BIG UNLOCK", 9, "#946318", "800").setOrigin(0, 0.5),
    ]);
    const milestoneTitle = text(this, -104, 1, milestone.title, 15, "#123767", "800").setOrigin(0, 0.5);
    if (milestoneTitle.width > 190) milestoneTitle.setScale(190 / milestoneTitle.width);
    nextCard.add(milestoneTitle);
    const milestoneBar = progressBar(this, -102, 22, 190, milestone.target ? milestone.progress / milestone.target : 0, COLORS.gold, 9);
    nextCard.add(milestoneBar);
    nextCard.add(text(this, 126, 22, `${milestone.progress}/${milestone.target}`, 9, "#7a6a4b", "800"));

    sectionLabel(this, 22, 548, "BUILDER BADGES");

    ACHIEVEMENTS.forEach((achievement, index) => {
      const wide = index === ACHIEVEMENTS.length - 1;
      const x = wide ? W / 2 : index % 2 === 0 ? 105 : 285;
      const y = wide ? 717 : 583 + Math.floor(index / 2) * 66;
      const width = wide ? 350 : 170;
      const progress = achievementProgress(save, achievement);
      const claimed = save.achievementClaims.includes(achievement.id);
      const ready = achievementReady(save, achievement);

      const card = panel(this, x, y, width, 58, {
        fill: claimed ? 0xe4f9ec : ready ? 0xfff1bf : 0xf5fbff,
        stroke: ready ? COLORS.gold : claimed ? 0x6ed49a : 0xb8dce9,
        radius: 14,
        shadowAlpha: ready ? 0.18 : 0.1,
      });

      const iconX = -width / 2 + 28;
      const infoX = -width / 2 + 54;
      const availableWidth = wide ? 205 : 78;
      card.add(gameIcon(this, iconX, -2, ["puzzle", "hat", "city", "chest", "map"][index] ?? "trophy", 34));

      const title = text(this, infoX, -17, achievement.title, wide ? 11 : 9, "#123767", "800").setOrigin(0, 0.5);
      if (title.width > availableWidth) title.setScale(availableWidth / title.width);
      card.add(title);
      card.add(progressBar(this, infoX, 2, wide ? 170 : 76, progress / achievement.target, claimed ? COLORS.mint : COLORS.gold, 6));
      card.add(text(this, infoX, 15, `${Math.min(progress, achievement.target)}/${achievement.target}`, 8, "#5c7890", "700").setOrigin(0, 0.5));

      const rewardX = wide ? 86 : 38;
      card.add(gameIcon(this, rewardX, -14, "coin", 16));
      card.add(text(this, rewardX + 18, -14, String(achievement.rewardCoins), 9, "#8c6119", "800"));
      if (achievement.rewardStars) {
        card.add(gameIcon(this, rewardX, 6, "star", 15));
        card.add(text(this, rewardX + 18, 6, String(achievement.rewardStars), 9, "#8c6119", "800"));
      }

      if (ready && !claimed) {
        card.add(button(this, width / 2 - 34, 16, 58, 22, "CLAIM", () => this.claimAchievement(achievement.id), COLORS.gold, "gold"));
      } else if (claimed) {
        card.add(text(this, width / 2 - 31, 15, "✓", 15, "#16864d", "800"));
      } else {
        card.add(gameIcon(this, width / 2 - 28, 15, "lock", 15));
      }
    });

    const badgeReady = ACHIEVEMENTS.some((achievement) => achievementReady(save, achievement));
    bottomNavigation(this, "ProgressScene", badgeReady ? ["ProgressScene"] : []);
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
