import { preloadAssets } from '../ui/assets';
import { boardCard, boardLabel, rewardAmount, boardHeader, rewardArt } from '../ui/secondary';
import { boosterIcon } from '../puzzle/art';
import { HAMMER_BOOSTER_COST, REFRESH_BOOSTER_COST, BULLDOZER_BOOSTER_COST, HAMMER_BOOSTER_UNLOCK_LEVEL, REFRESH_BOOSTER_UNLOCK_LEVEL, BULLDOZER_BOOSTER_UNLOCK_LEVEL } from '../levels';
import Phaser from "phaser";
import { bottomNavigation, addGradientBackground, gameIcon, rewardDialog,  button, COLORS, panel, progressBar, text, W } from "../ui";
import { getWeeklyEvent, eventProgressLabel } from "../event";
import { loadSave, updateSave } from "../save";

export class EventScene extends Phaser.Scene {
  constructor() {
    super("EventScene");
  }

  preload() { preloadAssets(this, ['city.']); }

  create() {
    const event = getWeeklyEvent();
    const save = loadSave();

    addGradientBackground(this);
    boardHeader(this, "CITY SHOP • WEEKLY FESTIVAL", event.title, save.coins, save.stars);

    const hero = boardCard(this, 212, 120, true);
    hero.add([
      rewardArt(this, -127, -8, 'trophy', 89),
      text(this, -73, -39, 'THIS WEEK’S FESTIVAL', 11, '#946017', '800').setOrigin(0, .5),
      text(this, -73, -16, event.title, 19).setOrigin(0, .5),
      text(this, -73, 10, event.subtitle, 12, '#426b91').setOrigin(0, .5).setWordWrapWidth(230),
      progressBar(this, -73, 41, 150, save.eventPoints / event.target, COLORS.gold, 14),
      text(this, 124, 40, eventProgressLabel(save.eventPoints, event.target), 12),
    ]);

    boardLabel(this, 291, 'Puzzle boosters', 'Use coins during a level');
    const shelf: Array<[string, string, number, string, number]> = [
      ['hammer', 'Hammer', HAMMER_BOOSTER_COST, 'Remove a block', HAMMER_BOOSTER_UNLOCK_LEVEL],
      ['refresh', 'Shuffle', REFRESH_BOOSTER_COST, 'Refresh the tray', REFRESH_BOOSTER_UNLOCK_LEVEL],
      ['row', 'Clear Line', BULLDOZER_BOOSTER_COST, 'Clear a row', BULLDOZER_BOOSTER_UNLOCK_LEVEL],
    ];
    shelf.forEach(([icon, label, cost, subtitle, unlock], i) => {
      const x = 77 + i * 118;
      const card = panel(this, x, 369, 108, 134, { fill: 0xf8fcff, radius: 16, shadowAlpha: .12 });
      card.add([
        boosterIcon(this, 0, -33, icon, 57),
        text(this, 0, 1, label, 15),
        text(this, 0, 19, subtitle, 11, '#426b91'),
        rewardAmount(this, -20, 36, 'coin', cost),
        text(this, 0, 54, save.level < unlock ? `Level ${unlock}` : 'Ready in puzzle', 11, '#58779a'),
      ]);
    });

    boardLabel(this, 461, 'Festival rewards', `${save.eventClaims.length}/${event.milestones.length} collected`);
    const track = boardCard(this, 587, 226);
    track.add(this.add.rectangle(-148, 0, 4, 176, 0xc4dcec));
    event.milestones.forEach((milestone, index) => {
      const y = -88 + index * 44;
      const ready = save.eventPoints >= milestone.points;
      const done = save.eventClaims.includes(index);
      if (ready && !done) track.add(this.add.rectangle(6, y, 317, 40, 0xffefb4));
      track.add(this.add.circle(-148, y, 15, done ? COLORS.mintDark : ready ? COLORS.gold : 0xe4eff7).setStrokeStyle(2, 0xffffff));
      track.add(done ? text(this, -148, y, '✓', 17, '#ffffff') : gameIcon(this, -148, y, ready ? 'chest' : 'lock', 23));
      track.add(text(this, -124, y - 10, `${milestone.points} POINTS`, 11, '#426b91', '800').setOrigin(0, .5));
      let rewardX = -113;
      const rewards: Array<[string, number]> = [['coin', milestone.coins], ['star', milestone.stars], ['chest', milestone.chestKeys]];
      rewards.forEach(([icon, value]) => { if (value) { track.add(rewardAmount(this, rewardX, y + 10, icon, value)); rewardX += icon === 'coin' ? 65 : 45; } });
      if (ready && !done) track.add(button(this, 120, y, 82, 30, 'CLAIM', () => this.claimMilestone(index), COLORS.success, 'success'));
      else track.add(text(this, 121, y, done ? '✓ Claimed' : 'Locked', 12, done ? '#11864c' : '#58779a'));
    });
    button(this, W / 2, 732, 314, 42, 'PLAY & EARN POINTS', () => this.scene.start('CampaignScene'), COLORS.gold, 'gold');

    const shopRewardReady = event.milestones.some(
      (milestone, index) => save.eventPoints >= milestone.points && !save.eventClaims.includes(index),
    );
    bottomNavigation(this, "EventScene", shopRewardReady ? ["EventScene"] : []);
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
