import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { getWeeklyEvent, eventProgressLabel } from "../event";
import { loadSave, updateSave } from "../save";

export class EventScene extends Phaser.Scene {
  constructor() {
    super("EventScene");
  }

  create() {
    const event = getWeeklyEvent();
    const save = loadSave();

    coastalBackdrop(this, 0xf7edff);
    screenHeader(this, "CITY SHOP • WEEKLY FESTIVAL", event.title, save.coins, save.stars);

    const hero = panel(this, W / 2, 188, 354, 116, {
      fill: 0xffedb1,
      stroke: COLORS.gold,
      radius: 22,
      shadowAlpha: 0.24,
    });
    hero.add([
      gameIcon(this, -126, -4, "trophy", 76),
      text(this, -78, -34, "WEEKLY FESTIVAL", 9, "#946017", "800").setOrigin(0, 0.5),
      text(this, -78, -11, event.title, 18, "#123767", "800").setOrigin(0, 0.5),
      text(this, -78, 13, event.subtitle, 9, "#5d7890", "700").setOrigin(0, 0.5),
      text(this, -78, 36, eventProgressLabel(save.eventPoints, event.target) + " points", 11, "#8a6118", "800").setOrigin(0, 0.5),
      progressBar(this, 54, 35, 108, save.eventPoints / event.target, COLORS.gold, 10),
    ]);

    sectionLabel(this, 22, 258, "BOOSTER SHELF");
    const shelf: Array<[string, string, string, string]> = [
      ["hammer", "Hammer", "35", "Remove 1"],
      ["shuffle", "Shuffle", "45", "New blocks"],
      ["line", "Clear Line", "55", "Clear row"],
    ];
    shelf.forEach(([icon, label, cost, subtitle], i) => {
      const x = 78 + i * 118;
      const card = panel(this, x, 313, 108, 92, {
        fill: i === 0 ? 0xfff4df : i === 1 ? 0xf8eaff : 0xe6f6ff,
        stroke: i === 0 ? 0xf0bb64 : i === 1 ? 0xd59cf2 : 0x80d8f4,
        radius: 16,
        shadowAlpha: 0.14,
      });
      card.add([
        gameIcon(this, 0, -26, icon, 44),
        text(this, 0, 5, label, 10, "#123767", "800"),
        text(this, 0, 21, subtitle, 8, "#667f94", "700"),
        gameIcon(this, -13, 38, "coin", 15),
        text(this, 12, 38, cost, 9, "#8b6119", "800"),
      ]);
    });

    sectionLabel(this, 22, 365, "FESTIVAL REWARD TRACK");
    const rail = this.add.graphics().lineStyle(5, 0xffdc79, 0.85);
    rail.lineBetween(46, 404, 46, 620);

    event.milestones.forEach((milestone, index) => {
      const y = 406 + index * 54;
      const ready = save.eventPoints >= milestone.points;
      const done = save.eventClaims.includes(index);
      const card = panel(this, 214, y, 312, 45, {
        fill: done ? 0xe1f7e9 : ready ? 0xfff0bd : 0xf3f9fc,
        stroke: done ? 0x73d39d : ready ? COLORS.gold : 0xb8d9e6,
        radius: 13,
        shadowAlpha: ready ? 0.16 : 0.08,
      });
      this.add.circle(45, y, 21, done ? COLORS.mintDark : ready ? COLORS.goldDark : 0x6fa6c7)
        .setStrokeStyle(2, 0xffffff);
      gameIcon(this, 45, y, done ? "trophy" : ready ? "chest" : "lock", 31).setAlpha(done || ready ? 1 : 0.78);

      card.add(text(this, -119, -12, `${milestone.points} PTS`, 9, "#4f708a", "800").setOrigin(0, 0.5));
      let rewardX = -108;
      if (milestone.coins) {
        card.add(gameIcon(this, rewardX, 10, "coin", 17));
        card.add(text(this, rewardX + 21, 10, String(milestone.coins), 9, "#8a6017", "800"));
        rewardX += 61;
      }
      if (milestone.stars) {
        card.add(gameIcon(this, rewardX, 10, "star", 16));
        card.add(text(this, rewardX + 20, 10, String(milestone.stars), 9, "#8a6017", "800"));
        rewardX += 48;
      }
      if (milestone.chestKeys) {
        card.add(gameIcon(this, rewardX, 10, "chest", 16));
        card.add(text(this, rewardX + 21, 10, `+${milestone.chestKeys}`, 9, "#5d7890", "800"));
      }

      if (ready && !done) {
        card.add(button(this, 111, 0, 72, 26, "CLAIM", () => this.claimMilestone(index), COLORS.gold, "gold"));
      } else if (done) {
        card.add(text(this, 111, 0, "✓", 15, "#16864d", "800"));
      } else {
        card.add(text(this, 111, 0, "LOCKED", 8, "#718b9e", "800"));
      }
    });

    const earn = panel(this, W / 2, 678, 354, 66, {
      fill: 0xf5fbff,
      stroke: 0xb9deeb,
      radius: 17,
      shadowAlpha: 0.12,
    });
    const earnItems: Array<[string, string]> = [["puzzle", "+25"], ["chest", "+40"], ["hat", "+15"]];
    earnItems.forEach(([icon, value], i) => {
      const x = -118 + i * 118;
      earn.add([
        gameIcon(this, x, -8, icon, 28),
        text(this, x + 29, -8, value, 11, "#123767", "800"),
      ]);
    });
    earn.add(text(this, 0, 20, "Puzzle • Daily • Build to earn festival points", 9, "#5e7890", "700"));

    button(
      this,
      W / 2,
      729,
      314,
      42,
      "PLAY & EARN POINTS ▶",
      () => this.scene.start("CampaignScene"),
      COLORS.gold,
      "gold",
    );

    bottomNavigation(this, "EventScene");
  }

  private claimMilestone(index: number) {
    const event = getWeeklyEvent();
    const milestone = event.milestones[index];
    if (!milestone) return;

    const save = loadSave();
    if (save.eventPoints < milestone.points || save.eventClaims.includes(index)) return;

    updateSave((current) => ({
      ...current,
      coins: current.coins + milestone.coins,
      stars: current.stars + milestone.stars,
      chestProgress: Math.min(5, current.chestProgress + milestone.chestKeys),
      eventClaims: [...current.eventClaims, index],
    }));

    this.showRewardBurst(milestone.coins, milestone.stars, milestone.chestKeys);
  }

  private showRewardBurst(coins: number, stars: number, keys: number) {
    rewardDialog(this, 'REWARD UNLOCKED', [coins ? `● ${coins}` : '', stars ? `★ ${stars}` : '', keys ? `Key +${keys}` : ''].filter(Boolean).join('   '), () => this.scene.restart());
  }
}
