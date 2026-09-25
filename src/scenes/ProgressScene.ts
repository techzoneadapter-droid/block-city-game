import Phaser from "phaser";
import { characterHero, showCharacterPicker, bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, button, COLORS, panel, progressBar, sectionLabel, text, W } from "../ui";
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

    screenHeader(this, "YOUR CITY CREW", "City Friends", save.coins, save.stars);

    // Character-first composition from the approved avatar sheet.
    const hero = characterHero(this, W / 2, 254, save.avatar);
    hero.setDepth(20);
    hero.setSize(330, 224).setInteractive({ useHandCursor: true }).on("pointerup", () => showCharacterPicker(this));
    text(this, W / 2, 372, "Tap to meet your city companions", 10, "#4f7898", "700");

    const stats: Array<[number, string, string]> = [
      [save.totalLevelsCompleted, "LEVELS", "puzzle"],
      [save.totalBuilds, "BUILDS", "hat"],
      [save.population, "NEIGHBORS", "friends"],
    ];
    stats.forEach(([value, label, icon], index) => {
      const x = 74 + index * 121;
      const card = panel(this, x, 477, 108, 56, {
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

    const levelCard = panel(this, W / 2, 417, 350, 52, {
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
    const xp = progressBar(this, 28, 3, 117, profile.progress, COLORS.mint, 11);
    levelCard.add(xp);

    const nextCard = panel(this, W / 2, 540, 350, 58, {
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

    sectionLabel(this, 22, 584, "BUILDER BADGES");

    ACHIEVEMENTS.forEach((achievement, index) => {
      const wide = index === ACHIEVEMENTS.length - 1;
      const x = wide ? W / 2 : index % 2 === 0 ? 105 : 285;
      const y = wide ? 735 : 616 + Math.floor(index / 2) * 60;
      const width = wide ? 350 : 170;
      const progress = achievementProgress(save, achievement);
      const claimed = save.achievementClaims.includes(achievement.id);
      const ready = achievementReady(save, achievement);

      const card = panel(this, x, y, width, 52, {
        fill: claimed ? 0xe4f9ec : ready ? 0xfff1bf : 0xf5fbff,
        stroke: ready ? COLORS.gold : claimed ? 0x6ed49a : 0xb8dce9,
        radius: 14,
        shadowAlpha: ready ? 0.18 : 0.1,
      });

      const iconX = -width / 2 + 28;
      const infoX = -width / 2 + 43;
      const availableWidth = wide ? 205 : 112;
      card.add(gameIcon(this, iconX - 5, -1, ["puzzle", "hat", "city", "chest", "map"][index] ?? "trophy", 28));

      const title = text(this, infoX, -14, achievement.title, 11, "#123767", "800").setOrigin(0, 0.5);
      if (title.width > availableWidth) title.setScale(availableWidth / title.width);
      card.add(title);
      card.add(progressBar(this, infoX, 2, wide ? 170 : 66, progress / achievement.target, claimed ? COLORS.mint : COLORS.gold, 6));
      card.add(text(this, infoX, 16, `${Math.min(progress, achievement.target)}/${achievement.target}`, 8, "#5c7890", "700").setOrigin(0, 0.5));

      if (!ready) {
        const rewardX = width / 2 - 51;
        card.add(gameIcon(this, rewardX, 3, "coin", 14));
        card.add(text(this, rewardX + 20, 3, String(achievement.rewardCoins), 11, "#8c6119", "800"));
        if (achievement.rewardStars) card.add(text(this, rewardX + 9, 17, `+${achievement.rewardStars} stars`, 11, "#8c6119", "700"));
      }

      if (ready && !claimed) {
        card.add(button(this, width / 2 - 34, 7, 58, 28, "CLAIM", () => this.claimAchievement(achievement.id), COLORS.gold, "gold"));
      } else if (claimed) {
        card.add(text(this, -width / 2 + 23, 16, "✓", 15, "#16864d", "800"));
      } else {
        card.add(gameIcon(this, -width / 2 + 23, 16, "lock", 15));
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
