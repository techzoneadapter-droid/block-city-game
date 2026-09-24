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
    screenHeader(this, 'WEEKLY CITY FESTIVAL', event.title, save.coins, save.stars);
    panel(this, W / 2, 205, 354, 146, { fill: 0xffe7a0, stroke: COLORS.gold, radius: 24 });
    this.add.circle(68, 189, 47, 0xfff6ca).setStrokeStyle(3, 0xffd047);
    gameIcon(this, 68, 183, 'trophy', 78);
    [[29,146],[104,151],[109,219]].forEach(([x,y]) => text(this, x, y, '✦', 19, '#ffaf15'));
    text(this, 236, 159, 'Build big. Win bigger.', 17);
    text(this, 236, 194, `${save.eventPoints} / ${event.target} points`, 23);
    text(this, W / 2, 232, event.subtitle, 11).setWordWrapWidth(314);
    progressBar(this, 38, 261, 314, save.eventPoints / event.target, COLORS.gold, 13);
    sectionLabel(this, 22, 294, 'YOUR FESTIVAL PRIZES');
    const trail = this.add.graphics().lineStyle(6, 0xffdf82, 0.9);
    trail.lineBetween(49, 343, 49, 611);
    event.milestones.forEach((milestone, index) => {
      const y = 345 + index * 66;
      const ready = save.eventPoints >= milestone.points;
      const done = save.eventClaims.includes(index);
      panel(this, 215, y, 310, 56, { fill: done ? 0xbdf0d0 : ready ? 0xffe08a : 0xb9d9ed, stroke: done ? COLORS.mint : ready ? COLORS.gold : 0x80b9d9, radius: 16 });
      this.add.circle(43, y, 24, done ? COLORS.mintDark : ready ? COLORS.goldDark : 0x549ac9).setStrokeStyle(3, 0xffffff);
      gameIcon(this, 43, y, done ? 'trophy' : 'chest', 40).setAlpha(done || ready ? 1 : 0.55);
      this.add.text(83, y - 20, `${milestone.points} points`, { fontFamily: 'system-ui', fontSize: '12px', fontStyle: 'bold', color: '#426c8a' });
      const rewards = [milestone.coins ? `● ${milestone.coins}` : '', milestone.stars ? `★ ${milestone.stars}` : '', milestone.chestKeys ? `Key +${milestone.chestKeys}` : ''].filter(Boolean).join('  ');
      this.add.text(83, y + 2, rewards, { fontFamily: 'system-ui', fontSize: '13px', fontStyle: 'bold', color: '#986015' });
      const claim = button(this, 319, y, 90, 40, done ? 'Claimed ✓' : ready ? 'CLAIM' : 'Locked', () => this.claimMilestone(index), COLORS.gold, ready && !done ? 'gold' : 'muted');
      if (!ready || done) claim.disableInteractive();
    });
    text(this, W / 2, 660, 'Puzzle +25 • Daily +40 • Build +15 points', 12, '#123767').setBackgroundColor('#e5f8ff').setPadding(10, 7);
    button(this, W / 2, 719, 316, 52, 'PLAY & EARN POINTS ▶', () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    bottomNavigation(this, 'EventScene');
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
