import { referenceArt } from '../referenceArt';
import Phaser from "phaser";
import { gameSettings, playerHud, coastalBackdrop, showCurrencyGuide, showCharacterPicker, bottomNavigation, gameIcon, addGradientBackground, button, COLORS, iconBubble, panel, pill, progressBar, sectionLabel, text, W } from "../ui";
import { districtOneComplete, districtTwoComplete, districtThreeComplete, loadSave, updateSave } from "../save";
import { BuildingKey, CityStageState, CityWorld, DistrictId } from "../city/CityWorld";

type BuildingDefinition = {
  district: DistrictId;
  name: string;
  eyebrow: string;
  maxStage: number;
  starCost: number;
  coinReward: number;
};

const BUILDINGS: Record<BuildingKey, BuildingDefinition> = {
  coffee: { district: 1, name: "Corner Coffee", eyebrow: "NEIGHBORHOOD CAFÉ", maxStage: 3, starCost: 1, coinReward: 10 },
  park: { district: 1, name: "Pocket Park", eyebrow: "COMMUNITY GREEN", maxStage: 3, starCost: 1, coinReward: 8 },
  market: { district: 2, name: "River Market", eyebrow: "WATERSIDE MARKET", maxStage: 3, starCost: 2, coinReward: 16 },
  boardwalk: { district: 2, name: "Sunset Boardwalk", eyebrow: "RIVER PROMENADE", maxStage: 3, starCost: 2, coinReward: 18 },
  tower: { district: 3, name: "Metro Tower", eyebrow: "SKYLINE LANDMARK", maxStage: 3, starCost: 3, coinReward: 26 },
  garden: { district: 3, name: "Rooftop Garden", eyebrow: "SKY GARDEN", maxStage: 3, starCost: 3, coinReward: 24 },
};

const DISTRICT_COPY: Record<DistrictId, { name: string; subtitle: string; icon: string }> = {
  1: { name: "Starter Street", subtitle: "A cozy neighborhood taking shape", icon: "🏡" },
  2: { name: "Riverside", subtitle: "Markets, boats & golden boardwalk lights", icon: "⛵" },
  3: { name: "Skyline Heights", subtitle: "Bright towers above the bay", icon: "🏙" },
};

export class CityScene extends Phaser.Scene {
  private save = loadSave();
  private selectedDistrict: DistrictId = 1;
  private selectedBuilding: BuildingKey = "coffee";
  private world?: CityWorld;
  private buildInProgress = false;
  private sequenceTimers: Phaser.Time.TimerEvent[] = [];

  constructor() {
    super("CityScene");
  }

  init(data?: { district?: DistrictId; selectedBuilding?: BuildingKey }) {
    // District changes now only happen through an explicit tab/reveal action.
    if (data?.district === 1 || data?.district === 2 || data?.district === 3) this.selectedDistrict = data.district;
    if (data?.selectedBuilding && BUILDINGS[data.selectedBuilding]) this.selectedBuilding = data.selectedBuilding;
  }

  create() {
    coastalBackdrop(this);
    this.save = loadSave();
    this.buildInProgress = false;
    this.sequenceTimers = [];
    this.clampSelectionToUnlocks();
    this.createHeader();
    this.world = new CityWorld(this, this.selectedDistrict, this.stageState(), (key) => this.selectBuilding(key), 40);
    this.world.select(this.selectedBuilding);
    this.createBuildingSelectors();
    this.createBuildingPanel();
    this.createCompletionChip();

    this.playCitySound("city-open");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cleanup());
  }

  private clampSelectionToUnlocks() {
    const highest: DistrictId = this.save.district >= 3 ? 3 : this.save.district >= 2 ? 2 : 1;
    if (this.selectedDistrict > highest) this.selectedDistrict = highest;
    if (BUILDINGS[this.selectedBuilding].district !== this.selectedDistrict) this.selectedBuilding = this.defaultBuilding(this.selectedDistrict);
  }

  private createHeader() {
    const copy = DISTRICT_COPY[this.selectedDistrict];
    playerHud(this, () => { if (!this.buildInProgress) gameSettings(this); }, () => !this.buildInProgress).settings.setY(99).setScale(0.78);
    const identity = panel(this, 140, 135, 246, 76, { fill: 0x078be2, stroke: 0x80ecff, radius: 17, shadowAlpha: 0.32 }).setDepth(100);
    identity.add([gameIcon(this, -94, 0, 'house', 42), text(this, 20, -17, copy.name, 18, '#ffffff').setStroke('#07539d', 2), text(this, 20, 13, copy.subtitle.replace(' taking shape', '\ntaking shape').replace(' & ', '\n'), 10, '#e7faff')]);
    const change = button(this, 323, 147, 98, 50, '', () => this.showDistrictMap()).setDepth(101);
    change.add([gameIcon(this, -30, 0, 'map', 30), text(this, 15, 0, 'Change\nDistrict', 12, '#ffffff')]);
    const stats = [[String(this.save.population), 'Population', 'friends'], [`${this.currentDistrictProgress()}/6`, 'Growth', 'city'], [String(this.save.totalBuilds), 'Built', 'hat'], [String(Math.min(3, this.save.district)), 'Districts', 'trophy']];
    stats.forEach(([value, label, icon], i) => {
      const card = panel(this, 55 + i * 94, 214, 88, 76, { fill: 0xf7fdff, stroke: 0xc1f3ff, radius: 12, shadowAlpha: 0.22 }).setDepth(100);
      card.add([text(this, 0, -22, label, 11, '#225f9b'), gameIcon(this, -23, 8, icon, 29), text(this, 15, 8, value, 18)]);
    });
  }

  private showDistrictMap() {
    if (this.buildInProgress) return;
    const group = this.add.container(0, 0).setDepth(4000);
    group.add([this.add.rectangle(W / 2, 422, W, 844, 0x063667, 0.72).setInteractive(), panel(this, W / 2, 420, 342, 365, { fill: COLORS.cream, stroke: COLORS.gold, radius: 25 }), text(this, W / 2, 274, 'YOUR COASTAL CITY', 23)]);
    ([1, 2, 3] as DistrictId[]).forEach((district, i) => {
      const unlocked = this.save.district >= district;
      const tile = button(this, W / 2, 333 + i * 76, 298, 57, unlocked ? DISTRICT_COPY[district].name : `Locked • ${DISTRICT_COPY[district].name}`, () => this.scene.restart({ district, selectedBuilding: this.defaultBuilding(district) }), COLORS.primary, unlocked ? 'primary' : 'muted');
      if (!unlocked) tile.disableInteractive();
      group.add(tile);
    });
    group.add(button(this, W / 2, 558, 298, 37, 'BACK', () => group.destroy(true)));
  }

  private createBuildingSelectors() {
    const buildings = this.buildingsForDistrict(this.selectedDistrict);
    panel(this, W / 2, 613, W - 14, 128, { fill: 0xf3fcff, stroke: 0xffffff, radius: 19 });
    const heading = panel(this, W / 2, 566, 350, 30, { fill: 0x087edd, stroke: 0x74ddff, radius: 10 });
    heading.add(text(this, 0, 0, 'BUILDINGS & DISTRICT PROJECTS', 13, '#ffffff'));
    this.createSelector(103, 629, buildings[0], this.getStage(buildings[0]));
    this.createSelector(287, 629, buildings[1], this.getStage(buildings[1]));
  }

  private createSelector(x: number, y: number, key: BuildingKey, stage: number) {
    const selected = this.selectedBuilding === key;
    const complete = stage >= 3;
    const c = panel(this, x, y, 168, 79, {
      fill: 0xffffff,
      stroke: selected ? 0x1599ea : complete ? 0x43c978 : 0xa4d4e9,
      radius: 14,
      shadowAlpha: selected ? 0.22 : 0.12,
    });
    const icon = referenceArt(this, -51, -1, key, 52, 64) ?? gameIcon(this, -51, -1, 'city', 38);
    const name = this.add.text(-19, -26, BUILDINGS[key].name.replace(" ", "\n"), {
      fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "12px", fontStyle: "bold", color: selected ? "#123767" : "#4f7090",
    });
    const state = this.add.text(-19, 12, complete ? "Complete" : `★ ${BUILDINGS[key].starCost} • Lv. ${stage}`, {
      fontFamily: "Inter, system-ui", fontSize: "11px", fontStyle: "bold", color: complete ? "#159453" : "#6d89a1",
    });
    c.add([icon, name, state]).setSize(168, 79).setInteractive({ useHandCursor: true });
    c.on("pointerup", () => this.selectBuilding(key));
  }

  private createBuildingPanel() {
    const y = 698;
    const definition = BUILDINGS[this.selectedBuilding];
    const stage = this.getStage(this.selectedBuilding);
    panel(this, W / 2, y, W - 30, 46, { fill: 0xfff8e5, alpha: 0.97, stroke: 0xf4cd68, radius: 18, shadowAlpha: 0.26 });
    text(this, W / 2, y - 9, stage >= 3 ? `${definition.name} • Complete!` : `${definition.name} • Lv. ${stage} → ${stage + 1}`, 15);
    text(this, W / 2, y + 10, stage >= 3 ? 'Your neighborhood is thriving' : `+${this.populationGain(this.selectedBuilding, stage + 1)} neighbors   •   +${definition.coinReward} coins`, 12, '#337195');

    const complete = stage >= definition.maxStage;
    button(this, W / 2, 738, W - 48, 38, complete ? "CONTINUE JOURNEY  →" : `BUILD ${definition.name.toUpperCase()}   ★ ${definition.starCost}`, () => {
      if (complete) this.scene.start("CampaignScene");
      else this.buildSelected();
    }, complete ? COLORS.primary : COLORS.success, complete ? "primary" : "success");
    const actions: Array<[string, string, () => void]> = [
      ['city', 'City', () => this.scene.start('HomeScene')], ['chest', 'Tasks', () => this.scene.start('DailyScene')],
      ['map', 'Map', () => this.showDistrictMap()], ['shop', 'Shop', () => showCurrencyGuide(this)], ['friends', 'Friends', () => showCharacterPicker(this)],
    ];
    panel(this, W / 2, 804, W - 8, 78, { fill: 0x075db0, stroke: 0x44cfff, radius: 20 });
    actions.forEach(([icon, label, action], i) => {
      const tile = button(this, 43 + i * 76, 800, 68, 65, '', () => { if (!this.buildInProgress) action(); });
      tile.add([gameIcon(this, 0, -9, icon, 39), text(this, 0, 22, label, 12, '#ffffff')]);
    });
  }

  private createCompletionChip() {
    const completed = this.selectedDistrict === 1 ? districtOneComplete(this.save) : this.selectedDistrict === 2 ? districtTwoComplete(this.save) : districtThreeComplete(this.save);
    if (!completed) return;
    const label = this.selectedDistrict === 3 ? "MASTER BUILDER DISTRICT" : "✓  DISTRICT COMPLETE";
    text(this, W / 2, 501, label, 11, "#ffffff", "800").setBackgroundColor("#19a765").setPadding(11, 5, 11, 5).setDepth(1010);
  }

  private selectBuilding(key: BuildingKey) {
    if (this.buildInProgress || key === this.selectedBuilding) {
      if (key === this.selectedBuilding) this.world?.focus(key);
      return;
    }
    this.pulseHaptic(7);
    this.playCitySound("building-select");
    this.scene.restart({ district: this.selectedDistrict, selectedBuilding: key });
  }

  private buildSelected() {
    if (this.buildInProgress) return;
    this.save = loadSave();
    const key = this.selectedBuilding;
    const stage = this.getStage(key);
    const definition = BUILDINGS[key];
    if (stage >= definition.maxStage) { this.scene.start("CampaignScene"); return; }
    if (this.save.stars < definition.starCost) { this.showNeedStar(definition.starCost); return; }
    this.buildInProgress = true;
    this.world?.focus(key);
    this.playCitySound("star-fly");
    this.flyConstructionStar(key, () => this.impactAndBuild(key, stage + 1));
  }

  private flyConstructionStar(key: BuildingKey, onComplete: () => void) {
    const end = this.world?.getTarget(key) ?? new Phaser.Math.Vector2(W / 2, 380);
    const start = new Phaser.Math.Vector2(344, 32);
    const control = new Phaser.Math.Vector2((start.x + end.x) / 2 + (end.x < start.x ? -36 : 28), 100);
    const star = text(this, start.x, start.y, "★", 23, "#ffe142", "800").setStroke("#f28b18", 4).setDepth(3000);
    const glow = this.add.circle(start.x, start.y, 18, 0xffda3d, 0.26).setDepth(2999);
    const progress = { t: 0, trailStep: 0 };
    this.tweens.add({ targets: [star, glow], scaleX: 1.35, scaleY: 1.35, duration: 140, yoyo: true, ease: "Back.Out" });
    this.tweens.add({
      targets: progress, t: 1, duration: 690, ease: "Cubic.InOut",
      onUpdate: () => {
        const t = progress.t;
        const one = 1 - t;
        const x = one * one * start.x + 2 * one * t * control.x + t * t * end.x;
        const y = one * one * start.y + 2 * one * t * control.y + t * t * (end.y - 38);
        star.setPosition(x, y).setAngle(t * 240).setScale(1 + Math.sin(t * Math.PI) * 0.35);
        glow.setPosition(x, y).setScale(0.75 + Math.sin(t * Math.PI) * 0.4);
        if (t > progress.trailStep + 0.075) {
          progress.trailStep = t;
          const trail = this.add.circle(x, y, 3.5, 0xffef85, 0.9).setDepth(2998);
          this.tweens.add({ targets: trail, alpha: 0, scale: 0.15, y: y + 10, duration: 330, onComplete: () => trail.destroy() });
        }
      },
      onComplete: () => { star.destroy(); glow.destroy(); onComplete(); },
    });
  }

  private impactAndBuild(key: BuildingKey, nextStage: number) {
    const target = this.world?.getTarget(key) ?? new Phaser.Math.Vector2(W / 2, 380);
    this.pulseHaptic(22);
    this.playCitySound("construction-impact");
    this.cameras.main.shake(150, 0.0024);
    const ring = this.add.ellipse(target.x, target.y - 28, 20, 10, 0xffe55f, 0.3).setStrokeStyle(3, 0xffffff, 0.9).setDepth(2500);
    this.tweens.add({ targets: ring, scaleX: 5, scaleY: 5, alpha: 0, duration: 440, ease: "Cubic.Out", onComplete: () => ring.destroy() });
    this.constructionDust(target.x, target.y);
    const scaffolding = this.createScaffolding(target.x, target.y, key === "tower" ? 132 : 85);
    this.queue(330, () => {
      this.playCitySound("construction-hammer");
      this.save = this.applyBuildReward(key, nextStage);
      this.world?.upgrade(key, nextStage);
      this.tweens.add({ targets: scaffolding, alpha: 0, scaleX: 1.08, duration: 390, onComplete: () => scaffolding.destroy(true) });
    });
    this.queue(820, () => {
      this.playCitySound("building-complete");
      this.pulseHaptic([18, 35, 28]);
      this.rewardBurst(target.x, target.y - (key === "tower" ? 120 : 78), key, nextStage);
    });
    this.queue(1260, () => this.finishBuildSequence(key, nextStage));
  }

  private applyBuildReward(key: BuildingKey, nextStage: number) {
    const definition = BUILDINGS[key];
    return updateSave((save) => {
      const updated = {
        ...save,
        stars: save.stars - definition.starCost,
        coins: save.coins + definition.coinReward,
        population: save.population + this.populationGain(key, nextStage),
        dailyBuilds: save.dailyBuilds + 1,
        totalBuilds: save.totalBuilds + 1,
        xp: save.xp + 20,
        eventPoints: Math.min(500, save.eventPoints + 15),
        coffeeShopStage: key === "coffee" ? Math.min(3, save.coffeeShopStage + 1) : save.coffeeShopStage,
        parkStage: key === "park" ? Math.min(3, save.parkStage + 1) : save.parkStage,
        riverMarketStage: key === "market" ? Math.min(3, save.riverMarketStage + 1) : save.riverMarketStage,
        boardwalkStage: key === "boardwalk" ? Math.min(3, save.boardwalkStage + 1) : save.boardwalkStage,
        skylineTowerStage: key === "tower" ? Math.min(3, save.skylineTowerStage + 1) : save.skylineTowerStage,
        rooftopGardenStage: key === "garden" ? Math.min(3, save.rooftopGardenStage + 1) : save.rooftopGardenStage,
      };
      if (districtOneComplete(updated) && updated.district < 2) return { ...updated, district: 2, coins: updated.coins + 100 };
      if (districtTwoComplete(updated) && updated.district < 3) return { ...updated, district: 3, coins: updated.coins + 150 };
      if (districtThreeComplete(updated) && updated.district < 4) return { ...updated, district: 4, coins: updated.coins + 250, stars: updated.stars + 2 };
      return updated;
    });
  }

  private finishBuildSequence(key: BuildingKey, nextStage: number) {
    const districtDone = this.selectedDistrict === 1 ? districtOneComplete(this.save) : this.selectedDistrict === 2 ? districtTwoComplete(this.save) : districtThreeComplete(this.save);
    if (districtDone) {
      this.world?.settle();
      this.world?.celebrateDistrict();
      this.playCitySound("district-complete");
      this.showDistrictCompleteCinematic(key);
      return;
    }
    const definition = BUILDINGS[key];
    const message = nextStage >= 3 ? `${definition.name.toUpperCase()} IS ALIVE!` : `STAGE ${nextStage} BUILT  •  CITY GREW!`;
    const toast = text(this, W / 2, 492, message, 10, "#ffffff", "800").setBackgroundColor("#128f61").setPadding(12, 8, 12, 8).setDepth(3000).setScale(0.7);
    this.tweens.add({ targets: toast, scale: 1, y: 482, duration: 280, ease: "Back.Out" });
    this.queue(1050, () => this.scene.restart({ district: this.selectedDistrict, selectedBuilding: key }));
  }

  private showDistrictCompleteCinematic(key: BuildingKey) {
    const overlay = this.add.container(0, 0).setDepth(4000);
    const shade = this.add.rectangle(W / 2, 323, W - 28, 378, 0x0a5c88, 0.18);
    const banner = panel(this, W / 2, 321, W - 62, 178, { fill: 0xffffff, alpha: 0.97, stroke: 0xffcd35, radius: 23, shadowAlpha: 0.35 });
    const title = text(this, W / 2, 305, "DISTRICT COMPLETE!", 21, "#12629f", "800");
    const next = this.selectedDistrict === 1 ? "RIVERSIDE UNLOCKED" : this.selectedDistrict === 2 ? "SKYLINE HEIGHTS UNLOCKED" : "MASTER BUILDER CITY";
    const subtitle = text(this, W / 2, 334, next, 11, "#15935c", "800");
    const rewards = text(this, W / 2, 360, this.selectedDistrict === 3 ? "● +250   •   ★ +2" : `● +${this.selectedDistrict === 1 ? 100 : 150} • City thriving`, 9, "#5b7894", "700");
    const skip = text(this, W / 2, 409, "TAP TO CONTINUE", 8, "#ffffff", "800").setBackgroundColor("#1688ed").setPadding(12, 6, 12, 6);
    overlay.add([shade, banner, gameIcon(this, W / 2, 262, "trophy", 56), title, subtitle, rewards, skip]).setAlpha(0);
    this.tweens.add({ targets: overlay, alpha: 1, duration: 330 });
    const finish = () => {
      if (!overlay.active) return;
      overlay.destroy(true);
      this.scene.restart({ district: this.selectedDistrict, selectedBuilding: key });
    };
    shade.setInteractive({ useHandCursor: true }).once("pointerup", finish);
    this.queue(2200, finish);
  }

  private createScaffolding(x: number, y: number, height: number) {
    const c = this.add.container(x, y).setDepth(2200);
    const g = this.add.graphics().lineStyle(3, 0xb77b3b, 0.95);
    g.lineBetween(-40, 4, -31, -height); g.lineBetween(40, 4, 31, -height);
    for (let row = 0; row < 4; row += 1) {
      const yy = -row * (height / 4);
      g.lineBetween(-39 + row * 2, yy, 39 - row * 2, yy);
      g.lineBetween(-38, yy, 36, yy - height / 4);
    }
    const hammer = gameIcon(this, 0, -height / 2, "hammer", 36);
    c.add([g, hammer]).setScale(0.2);
    this.tweens.add({ targets: c, scale: 1, duration: 250, ease: "Back.Out" });
    this.tweens.add({ targets: hammer, angle: -24, duration: 130, yoyo: true, repeat: 4, ease: "Quad.InOut" });
    return c;
  }

  private constructionDust(x: number, y: number) {
    for (let i = 0; i < 16; i += 1) {
      const p = this.add.circle(x + Phaser.Math.Between(-29, 29), y + Phaser.Math.Between(-9, 20), Phaser.Math.Between(2, 5), i % 3 === 0 ? 0xffd66d : 0xe6c18d, Phaser.Math.FloatBetween(0.35, 0.75)).setDepth(2400);
      this.tweens.add({ targets: p, x: p.x + Phaser.Math.Between(-28, 28), y: p.y - Phaser.Math.Between(22, 58), alpha: 0, scale: 0.15, duration: Phaser.Math.Between(470, 790), delay: Phaser.Math.Between(0, 150), onComplete: () => p.destroy() });
    }
  }

  private rewardBurst(x: number, y: number, key: BuildingKey, stage: number) {
    const definition = BUILDINGS[key];
    const reward = text(this, x, y, `+${this.populationGain(key, stage)} people   ● +${definition.coinReward}`, 10, "#ffffff", "800").setBackgroundColor("#157ec4").setPadding(9, 6, 9, 6).setDepth(2900).setScale(0.4);
    this.tweens.add({ targets: reward, y: y - 35, scale: 1, duration: 540, ease: "Back.Out", hold: 580, alpha: 0, onComplete: () => reward.destroy() });
    for (let i = 0; i < 12; i += 1) {
      const sparkle = text(this, x, y, i % 3 ? "✦" : "★", i % 3 ? 10 : 13, i % 2 ? "#ffdd44" : "#ffffff", "800").setDepth(2800);
      const angle = (Math.PI * 2 * i) / 12;
      this.tweens.add({ targets: sparkle, x: x + Math.cos(angle) * (42 + (i % 3) * 11), y: y + Math.sin(angle) * (34 + (i % 4) * 8), angle: i * 48, alpha: 0, duration: 650 + i * 22, ease: "Cubic.Out", onComplete: () => sparkle.destroy() });
    }
  }

  private showNeedStar(cost: number) {
    this.pulseHaptic([8, 40, 8]);
    const toast = text(this, W / 2, 705, `Need ★ ${cost} • finish a puzzle to build`, 10, "#ffffff", "800").setBackgroundColor("#d26530").setPadding(12, 8, 12, 8).setDepth(3000);
    this.tweens.add({ targets: toast, y: 690, duration: 260, ease: "Back.Out", hold: 1100, alpha: 0, onComplete: () => { toast.destroy(); this.scene.start("CampaignScene"); } });
  }

  private queue(delay: number, callback: () => void) {
    this.sequenceTimers.push(this.time.delayedCall(delay, callback));
  }

  private playCitySound(key: string) {
    if (!loadSave().soundEnabled) return;
    // Production audio can use these semantic cache keys; no oscillator is created.
    if (this.cache.audio.exists(key)) this.sound.play(key, { volume: 0.65 });
  }

  private pulseHaptic(pattern: number | number[]) {
    try {
      if (loadSave().hapticsEnabled && typeof navigator !== "undefined" && navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // Haptics are optional on desktop and restricted browsers.
    }
  }

  private cleanup() {
    this.sequenceTimers.forEach((timer) => timer.remove(false));
    this.sequenceTimers = [];
    this.world?.destroy();
    this.world = undefined;
    this.tweens.killAll();
  }

  private stageState(): CityStageState {
    return {
      coffee: this.save.coffeeShopStage,
      park: this.save.parkStage,
      market: this.save.riverMarketStage,
      boardwalk: this.save.boardwalkStage,
      tower: this.save.skylineTowerStage,
      garden: this.save.rooftopGardenStage,
    };
  }

  private buildingsForDistrict(district: DistrictId): [BuildingKey, BuildingKey] {
    return district === 1 ? ["coffee", "park"] : district === 2 ? ["market", "boardwalk"] : ["tower", "garden"];
  }

  private defaultBuilding(district: DistrictId): BuildingKey {
    const choices = this.buildingsForDistrict(district);
    return choices.find((key) => this.getStage(key) < 3) ?? choices[0];
  }

  private iconFor(key: BuildingKey) {
    if (key === "coffee") return "☕";
    if (key === "park") return "✿";
    if (key === "market") return "🛍";
    if (key === "boardwalk") return "≈";
    if (key === "tower") return "▥";
    return "✦";
  }

  private getStage(key: BuildingKey) {
    if (key === "coffee") return this.save.coffeeShopStage;
    if (key === "park") return this.save.parkStage;
    if (key === "market") return this.save.riverMarketStage;
    if (key === "boardwalk") return this.save.boardwalkStage;
    if (key === "tower") return this.save.skylineTowerStage;
    return this.save.rooftopGardenStage;
  }

  private currentDistrictProgress() {
    const [first, second] = this.buildingsForDistrict(this.selectedDistrict);
    return this.getStage(first) + this.getStage(second);
  }

  private populationGain(key: BuildingKey, stage: number) {
    if (key === "coffee") return stage === 3 ? 15 : 5;
    if (key === "park") return stage === 3 ? 10 : stage === 2 ? 6 : 4;
    if (key === "market") return stage === 3 ? 24 : 8;
    if (key === "boardwalk") return stage === 3 ? 20 : stage === 2 ? 10 : 7;
    if (key === "tower") return stage === 3 ? 40 : stage === 2 ? 22 : 14;
    return stage === 3 ? 28 : stage === 2 ? 16 : 10;
  }

  private emptyLotCopy(key: BuildingKey) {
    if (key === "coffee") return "A tiny café is ready to rise";
    if (key === "park") return "Grow a green heart for the street";
    if (key === "market") return "Bring colorful stalls to the river";
    if (key === "boardwalk") return "Light a warm walk by the water";
    if (key === "tower") return "Raise a new skyline landmark";
    return "Turn a rooftop into a green escape";
  }

  private districtStatusCopy() {
    if (this.currentDistrictProgress() < 6) return "Puzzle → Construction Star → a bigger, happier city";
    if (this.selectedDistrict === 1) return "Starter Street complete • Riverside is ready whenever you are";
    if (this.selectedDistrict === 2) return "Riverside complete • Skyline Heights is now open";
    return "Skyline complete • your Block City is thriving";
  }
}
