import Phaser from "phaser";
import { button, COLORS, iconBubble, panel, pill, progressBar, text, W } from "../ui";
import { loadSave, updateSave } from "../save";
import { localDateKey } from "../retention";
import { profileLevelFromXp } from "../progression";
import { getWeeklyEvent } from "../event";
import { CityWorld, DistrictId } from "../city/CityWorld";

const HERO_KEY = "block-city-coast-hero";

export class HomeScene extends Phaser.Scene {
  private cityPreview?: CityWorld;

  constructor() {
    super("HomeScene");
  }

  preload() {
    if (!this.textures.exists(HERO_KEY)) {
      this.load.image(HERO_KEY, "/assets/block-city-coast-hero.png");
    }
  }

  create() {
    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const weeklyEvent = getWeeklyEvent();
    const dailyReady = save.lastCheckinDate !== localDateKey();
    const nextEventMilestone = weeklyEvent.milestones.find((_, index) => !save.eventClaims.includes(index))?.points ?? weeklyEvent.target;
    const eventReady = save.eventPoints >= nextEventMilestone;

    const hero = this.add.image(W / 2, 422, HERO_KEY).setDisplaySize(W, 844);
    hero.setTint(0xf8ffff);

    const shade = this.add.graphics();
    shade.fillGradientStyle(0x0876ce, 0x0876ce, 0x0876ce, 0x0876ce, 0.72, 0.72, 0, 0);
    shade.fillRect(0, 0, W, 116);
    shade.fillGradientStyle(0x092d64, 0x092d64, 0x092d64, 0x092d64, 0, 0, 0.72, 0.72);
    shade.fillRect(0, 430, W, 414);

    this.createTopHud(save.coins, save.stars, profile.level, profile.currentXp, profile.neededXp);
    this.createLogo();

    const districtOne = save.coffeeShopStage + save.parkStage;
    const districtTwo = save.riverMarketStage + save.boardwalkStage;
    const districtThree = save.skylineTowerStage + save.rooftopGardenStage;
    const activeDistrict = save.district >= 3 ? 3 : save.district >= 2 ? 2 : 1;
    const districtName = activeDistrict === 3 ? "Skyline Heights" : activeDistrict === 2 ? "Riverside" : "Starter Street";
    const districtProgress = activeDistrict === 3 ? districtThree : activeDistrict === 2 ? districtTwo : districtOne;
    this.createLivingCityPreview(activeDistrict as DistrictId, save);
    this.createDistrictCard(activeDistrict, districtName, districtProgress, save.population);

    const play = button(
      this,
      W / 2,
      619,
      286,
      62,
      `▶  PLAY LEVEL ${save.level}`,
      () => this.scene.start("CampaignScene"),
      COLORS.gold,
      "gold",
    );
    this.tweens.add({ targets: play, scaleX: 1.015, scaleY: 1.015, duration: 900, yoyo: true, repeat: -1, ease: "Sine.InOut" });

    this.createQuickCard(69, 690, "🎁", "DAILY", dailyReady ? "Gift ready!" : `${save.dailyStreak} day streak`, 0xff8a55, () => this.scene.start("DailyScene"), dailyReady);
    this.createQuickCard(195, 690, "🏆", "EVENT", eventReady ? "Claim reward" : `${save.eventPoints}/${weeklyEvent.target} pts`, 0x9d62e8, () => this.scene.start("EventScene"), eventReady);
    this.createQuickCard(321, 690, "🏅", "PROFILE", `Builder Lv ${profile.level}`, 0x22bfc1, () => this.scene.start("ProgressScene"), false);

    this.createBottomNavigation(dailyReady || eventReady);

    const introTargets = this.children.list.filter((child) => child !== hero && child !== shade);
    introTargets.forEach((child) => {
      if ("setAlpha" in child) (child as unknown as { setAlpha: (value: number) => unknown }).setAlpha(0);
    });
    this.tweens.add({ targets: introTargets, alpha: 1, duration: 380, ease: "Sine.Out", stagger: 18 });
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.cityPreview?.destroy();
      this.cityPreview = undefined;
    });
  }

  private createLivingCityPreview(district: DistrictId, save: ReturnType<typeof loadSave>) {
    this.cityPreview = new CityWorld(this, district, {
      coffee: save.coffeeShopStage,
      park: save.parkStage,
      market: save.riverMarketStage,
      boardwalk: save.boardwalkStage,
      tower: save.skylineTowerStage,
      garden: save.rooftopGardenStage,
    }, (building) => this.scene.start("CityScene", { district, selectedBuilding: building }));
    this.cityPreview.root.setScale(0.76).setPosition(47, 59).setDepth(2).setAlpha(0.98);
  }

  private createTopHud(coins: number, stars: number, level: number, xp: number, needed: number) {
    const hud = panel(this, W / 2, 57, W - 24, 82, { fill: 0xffffff, alpha: 0.94, stroke: 0x8cdbf6, radius: 19, shadowAlpha: 0.24 });
    hud.setDepth(5);

    const avatarShadow = this.add.circle(54, 58, 28, 0x0754a0, 0.24).setDepth(6);
    const avatar = this.add.circle(54, 54, 27, 0x6bdb79, 1).setStrokeStyle(3, 0xffffff, 1).setDepth(6);
    const hair = this.add.graphics().setDepth(7);
    hair.fillStyle(0x57301e, 1);
    hair.fillRoundedRect(39, 39, 30, 26, 10);
    hair.fillStyle(0xff5f4f, 1);
    hair.fillRoundedRect(36, 34, 36, 13, 6);
    hair.fillRect(41, 30, 26, 9);
    hair.fillStyle(0xffdfbb, 1);
    hair.fillRoundedRect(42, 44, 24, 20, 7);
    hair.fillStyle(0x17375b, 1);
    hair.fillCircle(48, 52, 2);
    hair.fillCircle(60, 52, 2);
    hair.lineStyle(2, 0xb6493e, 1);
    hair.beginPath(); hair.arc(54, 56, 5, 0.2, Math.PI - 0.2); hair.strokePath();
    avatarShadow.setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.start("ProgressScene"));
    avatar.setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.start("ProgressScene"));

    this.add.text(88, 29, "PLAYER123", { fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "13px", fontStyle: "bold", color: "#113767" }).setDepth(7);
    this.add.text(88, 48, `BUILDER LV ${level}`, { fontFamily: "Inter, system-ui", fontSize: "7px", fontStyle: "bold", color: "#5381a5", letterSpacing: 0.5 }).setDepth(7);
    progressBar(this, 88, 68, 90, xp / needed, COLORS.mint, 9).setDepth(7);
    this.add.text(184, 63, `${xp}/${needed}`, { fontFamily: "Inter, system-ui", fontSize: "7px", fontStyle: "bold", color: "#4f7698" }).setOrigin(1, 0).setDepth(7);

    pill(this, 242, 39, 90, "COINS", "●", String(coins)).setDepth(7);
    pill(this, 337, 39, 72, "STARS", "★", String(stars)).setDepth(7);

    const settings = iconBubble(this, 341, 79, "⚙", 0x167dd4, 17);
    [settings.shadow, settings.bubble, settings.symbol].forEach((item) => item.setDepth(7));
    settings.bubble.setInteractive({ useHandCursor: true }).on("pointerup", () => this.showSettings());
  }

  private createLogo() {
    const block = text(this, W / 2, 132, "BLOCK", 34, "#ffffff", "800").setDepth(4);
    block.setStroke("#0750a0", 7).setShadow(0, 5, "#073467", 4, true, true);
    const city = text(this, W / 2, 166, "CITY", 39, "#ffd426", "800").setDepth(4);
    city.setStroke("#0750a0", 7).setShadow(0, 5, "#b9570b", 3, true, true);
    const strap = text(this, W / 2, 198, "BUILD  •  PUZZLE  •  GROW", 9, "#ffffff", "800").setDepth(4);
    strap.setBackgroundColor("#147fe0").setPadding(13, 5, 13, 5).setStroke("#0750a0", 2);
  }

  private createDistrictCard(district: number, name: string, progress: number, population: number) {
    panel(this, W / 2, 519, W - 34, 100, { fill: 0xf9fdff, alpha: 0.96, stroke: 0x7ed5f4, radius: 18, shadowAlpha: 0.28 });
    iconBubble(this, 52, 512, "🏙", 0x1d99ea, 25);
    this.add.text(87, 482, `DISTRICT ${String(district).padStart(2, "0")}  •  POP. ${population}`, {
      fontFamily: "Inter, system-ui", fontSize: "8px", fontStyle: "bold", color: "#3280b7", letterSpacing: 0.5,
    });
    this.add.text(87, 499, name, { fontFamily: '"Arial Rounded MT Bold", Inter, system-ui', fontSize: "18px", fontStyle: "bold", color: "#123767" });
    this.add.text(87, 522, progress >= 6 ? "District complete — next adventure unlocked!" : `${6 - progress} build stages until the district shines`, {
      fontFamily: "Inter, system-ui", fontSize: "8px", color: "#6685a2",
    });
    progressBar(this, 87, 546, 214, progress / 6, COLORS.mint, 11);
    this.add.text(310, 539, `${progress}/6`, { fontFamily: "Inter, system-ui", fontSize: "9px", fontStyle: "bold", color: "#178b58" });
    const city = iconBubble(this, 342, 518, "›", 0x27b7e7, 20);
    city.bubble.setInteractive({ useHandCursor: true }).on("pointerup", () => this.scene.start("CityScene"));
  }

  private createQuickCard(
    x: number,
    y: number,
    icon: string,
    title: string,
    subtitle: string,
    color: number,
    onClick: () => void,
    ready: boolean,
  ) {
    const c = panel(this, x, y, 112, 75, { fill: 0xffffff, alpha: 0.96, stroke: 0xa8daf1, radius: 15, shadowAlpha: 0.24 });
    c.setSize(112, 75).setInteractive({ useHandCursor: true });
    c.on("pointerdown", () => this.tweens.add({ targets: c, scale: 0.97, duration: 70 }));
    c.on("pointerup", () => { this.tweens.add({ targets: c, scale: 1, duration: 90 }); onClick(); });
    iconBubble(this, x, y - 14, icon, color, 17);
    text(this, x, y + 9, title, 9, "#123767", "800");
    text(this, x, y + 25, subtitle, 7, ready ? "#e35d31" : "#6a86a0", "700");
    if (ready) {
      this.add.circle(x + 42, y - 29, 7, COLORS.coral, 1).setStrokeStyle(2, 0xffffff, 1);
      this.tweens.add({ targets: c, y: y - 2, duration: 700, yoyo: true, repeat: -1, ease: "Sine.InOut" });
    }
  }

  private createBottomNavigation(hasNotification: boolean) {
    panel(this, W / 2, 795, W - 20, 86, { fill: 0x0876ce, stroke: 0x5bdcff, radius: 23, shadowAlpha: 0.3 });
    const items = [
      { x: 56, icon: "🏗", label: "CITY", scene: "CityScene", selected: false },
      { x: 149, icon: "🧩", label: "PUZZLES", scene: "CampaignScene", selected: true },
      { x: 242, icon: "🎁", label: "DAILY", scene: "DailyScene", selected: false },
      { x: 335, icon: "🏆", label: "EVENT", scene: "EventScene", selected: false },
    ];
    items.forEach((item) => {
      const c = panel(this, item.x, 792, 78, 66, {
        fill: item.selected ? 0x21b7ef : 0x0c64ba,
        stroke: item.selected ? 0xbef5ff : 0x369ee6,
        radius: 14,
        shadowAlpha: 0.18,
      });
      c.setSize(78, 66).setInteractive({ useHandCursor: true });
      c.on("pointerup", () => this.scene.start(item.scene));
      text(this, item.x, 778, item.icon, 23, "#ffffff", "800");
      text(this, item.x, 811, item.label, 8, "#ffffff", "800");
    });
    if (hasNotification) this.add.circle(274, 765, 7, COLORS.coral, 1).setStrokeStyle(2, 0xffffff, 1);
  }

  private showSettings() {
    const save = loadSave();
    const group = this.add.container(0, 0).setDepth(200);
    const dim = this.add.rectangle(W / 2, 422, W, 844, 0x063667, 0.7);
    const card = panel(this, W / 2, 420, W - 58, 286, { fill: 0xf8fdff, stroke: 0x79cfee, radius: 24, shadowAlpha: 0.4 });
    const title = text(this, W / 2, 322, "SETTINGS", 21, "#123767", "800");
    const subtitle = text(this, W / 2, 350, "Make Block City feel just right", 9, "#66839c", "700");
    const sound = button(this, W / 2, 397, W - 104, 44, save.soundEnabled ? "🔊  SOUND  •  ON" : "🔇  SOUND  •  OFF", () => {
      updateSave((current) => ({ ...current, soundEnabled: !current.soundEnabled }));
      group.destroy(true);
      this.showSettings();
    }, save.soundEnabled ? COLORS.success : 0x8aa7b8, save.soundEnabled ? "success" : "muted");
    const haptics = button(this, W / 2, 451, W - 104, 44, save.hapticsEnabled ? "📳  HAPTICS  •  ON" : "HAPTICS  •  OFF", () => {
      updateSave((current) => ({ ...current, hapticsEnabled: !current.hapticsEnabled }));
      group.destroy(true);
      this.showSettings();
    }, save.hapticsEnabled ? COLORS.success : 0x8aa7b8, save.hapticsEnabled ? "success" : "muted");
    const close = button(this, W / 2, 518, W - 104, 44, "BACK TO CITY", () => group.destroy(true), COLORS.primary, "primary");
    group.add([dim, card, title, subtitle, sound, haptics, close]);
  }
}
