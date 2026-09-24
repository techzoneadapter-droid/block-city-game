import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, gameIcon, rewardDialog, screenHeader, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W , GAME_FONT } from "../ui";
import { getWeeklyEvent, eventProgressLabel } from "../event";
import { loadSave, updateSave } from "../save";
import { createVoxelChest, createVoxelTrophy } from "../voxelArt";

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
    const trophy=createVoxelTrophy(this,68,202,0.72).setDepth(20);
    this.tweens.add({targets:trophy,y:196,duration:1050,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    [[29,146],[104,151],[109,219]].forEach(([x,y],i) => {
      const sparkle=this.add.rectangle(x,y,7,7,i%2?0xffd34a:0xffffff,0.9).setAngle(45);
      this.tweens.add({targets:sparkle,scale:0.45,alpha:0.35,duration:650+i*120,yoyo:true,repeat:-1});
    });
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
      panel(this, 215, y, 310, 56, { fill: done ? 0xbdf0d0 : ready ? 0xffe08a : 0xeaf5fa, stroke: done ? COLORS.mint : ready ? COLORS.gold : 0xb5d6e4, radius: 16 });
      this.add.circle(43, y, 24, done ? COLORS.mintDark : ready ? COLORS.goldDark : 0x549ac9).setStrokeStyle(3, 0xffffff);
      const rewardArt=done ? createVoxelTrophy(this,43,y+10,0.32) : createVoxelChest(this,43,y+9,0.34,false);
      rewardArt.setAlpha(done || ready ? 1 : 0.48).setDepth(20);
      this.add.text(83, y - 20, `${milestone.points} points`, { fontFamily: GAME_FONT, fontSize: '12px', fontStyle: 'bold', color: '#426c8a' });
      let rewardX = 93;
      if (milestone.coins) { gameIcon(this, rewardX, y + 11, 'coin', 22); text(this, rewardX + 28, y + 11, String(milestone.coins), 14, '#986015'); rewardX += 76; }
      if (milestone.stars) { gameIcon(this, rewardX, y + 11, 'star', 22); text(this, rewardX + 24, y + 11, String(milestone.stars), 14, '#986015'); rewardX += 54; }
      if (milestone.chestKeys) text(this, rewardX + 20, y + 11, `+${milestone.chestKeys} key`, 11, '#537392');
      if (ready && !done) button(this, 320, y, 86, 35, 'CLAIM', () => this.claimMilestone(index), COLORS.gold, 'gold');
      else if (done) text(this, 322, y, '✓ Claimed', 11, '#16864d');
      else { gameIcon(this, 318, y - 4, 'lock', 20); text(this, 318, y + 15, 'Locked', 10, '#69899b'); }

    });
    [['puzzle', '+25'], ['chest', '+40'], ['hat', '+15']].forEach(([icon, value], i) => {
      const x = 77 + i * 118;
      panel(this, x, 663, 105, 37, { fill: 0xf7fcff, stroke: 0xb5d6e4, radius: 14, shadow: false });
      gameIcon(this, x - 25, 663, icon, 30); text(this, x + 17, 663, value, 16);
    });
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
