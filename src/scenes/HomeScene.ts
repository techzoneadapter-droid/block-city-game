import Phaser from "phaser";
import { addGradientBackground, button, COLORS, drawBuilding, drawIsoTile, pill, text, W } from "../ui";
import { loadSave } from "../save";
import { localDateKey } from "../retention";
import { profileLevelFromXp } from "../progression";
import { getWeeklyEvent } from "../event";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    addGradientBackground(this);

    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const weeklyEvent = getWeeklyEvent();

    const badge = text(this, 28, 38, "BC", 14, "#061016", "800")
      .setBackgroundColor("#41dfaa")
      .setPadding(9, 7, 9, 7);
    badge.setOrigin(0.5);

    this.add.text(54, 27, "BLOCK CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "16px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });
    this.add.text(54, 47, "PUZZLE  •  BUILD  •  GROW", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#66828b",
      letterSpacing: 1,
    });

    pill(this, 246, 42, 110, "COINS", "●", String(save.coins));
    pill(this, 340, 42, 66, "STAR", "★", String(save.stars));

    const profileChip = this.add.text(
      W - 22,
      88,
      `BUILDER LV ${profile.level}  •  XP ${profile.currentXp}/${profile.neededXp}`,
      {
        fontFamily: "Inter, system-ui",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#78d8b8",
      },
    ).setOrigin(1, 0.5);

    profileChip
      .setBackgroundColor("#12342d")
      .setPadding(8, 5, 8, 5)
      .setInteractive({ useHandCursor: true });

    profileChip.on("pointerup", () => this.scene.start("ProgressScene"));

    this.add.text(24, 105, "EVERY BLOCK", {
      fontFamily: "Inter, system-ui",
      fontSize: "13px",
      fontStyle: "bold",
      color: "#67dcb7",
      letterSpacing: 1,
    });

    const title = this.add.text(24, 128, "BUILDS\nYOUR CITY.", {
      fontFamily: 'Inter, "SF Pro Rounded", system-ui',
      fontSize: "42px",
      fontStyle: "bold",
      color: "#f6f1e4",
      lineSpacing: -7,
    });

    this.add.text(25, 235, "Relaxing block puzzles. A city that grows\nwith every level you solve.", {
      fontFamily: "Inter, system-ui",
      fontSize: "12px",
      color: "#8aa2aa",
      lineSpacing: 7,
    });

    const world = this.add.container(0, 0);
    const city = this.add.graphics();

    city.fillStyle(0x071116, 0.3);
    city.fillEllipse(196, 545, 330, 130);

    drawIsoTile(city, 195, 520, 310, 154, 0x193841);
    drawIsoTile(city, 195, 512, 278, 134, 0x3b775f);

    city.lineStyle(7, COLORS.road, 1);
    city.beginPath();
    city.moveTo(110, 478);
    city.lineTo(268, 556);
    city.strokePath();
    city.beginPath();
    city.moveTo(273, 479);
    city.lineTo(120, 557);
    city.strokePath();

    drawBuilding(city, 124, 482, 62, 30, 68, 0xd96f62, 0xa95350, 0xffb875);
    drawBuilding(city, 266, 490, 72, 34, 88, 0x4f95a8, 0x346f82, 0x91e6dd);
    drawBuilding(city, 196, 546, 72, 32, 55, 0xf0c261, 0xc99142, 0xffe3a2);

    const treeSpots = [
      [82, 515], [105, 550], [291, 521], [320, 540], [180, 464], [220, 465],
    ];
    treeSpots.forEach(([x, y]) => {
      city.fillStyle(0x17412f, 1);
      city.fillRect(x - 2, y, 4, 12);
      city.fillStyle(0x58bb73, 1);
      city.fillCircle(x, y - 4, 10);
      city.fillStyle(0x7dd989, 0.8);
      city.fillCircle(x - 4, y - 8, 6);
    });

    world.add(city);
    world.setY(10);

    this.tweens.add({
      targets: world,
      y: 2,
      duration: 2400,
      yoyo: true,
      repeat: -1,
      ease: "Sine.InOut",
    });

    this.add.rectangle(W / 2, 670, W - 40, 110, COLORS.panel, 0.72)
      .setStrokeStyle(1, 0x23414a, 0.9);

    const districtOneProgress = save.coffeeShopStage + save.parkStage;
    const districtTwoProgress = save.riverMarketStage + save.boardwalkStage;
    const districtThreeProgress = save.skylineTowerStage + save.rooftopGardenStage;
    const showingSkyline = save.district >= 3;
    const showingRiverside = save.district >= 2 && !showingSkyline;
    const activeProgress = showingSkyline
      ? districtThreeProgress
      : showingRiverside
        ? districtTwoProgress
        : districtOneProgress;

    this.add.text(
      34,
      631,
      showingSkyline ? "DISTRICT 03" : showingRiverside ? "DISTRICT 02" : "DISTRICT 01",
      {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#6f8f98",
      },
    );
    this.add.text(34, 652, showingSkyline ? "Skyline Heights" : showingRiverside ? "Riverside" : "Starter Street", {
      fontFamily: "Inter, system-ui",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });
    this.add.text(
      34,
      681,
      `Level ${save.level}  •  City ${activeProgress}/6  •  Pop. ${save.population}`,
      {
        fontFamily: "Inter, system-ui",
        fontSize: "10px",
        color: "#89a0a8",
      },
    );

    if (save.district >= 4) {
      this.add.text(W - 34, 631, "SKYLINE COMPLETE ✦", {
        fontFamily: "Inter, system-ui",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#70d9b6",
      }).setOrigin(1, 0);
    }

    const dailyReady = save.lastCheckinDate !== localDateKey();

    const nextEventMilestone =
      weeklyEvent.milestones.find((milestone, index) => !save.eventClaims.includes(index))?.points ??
      weeklyEvent.target;

    const eventReady = save.eventPoints >= nextEventMilestone;

    const navItems = [
      { x: 52, label: "PLAY", color: COLORS.mintDark, action: () => this.scene.start("CampaignScene") },
      { x: 147, label: "CITY", color: 0x28515e, action: () => this.scene.start("CityScene") },
      { x: 242, label: "DAILY", color: dailyReady ? 0x8a682d : 0x315b52, action: () => this.scene.start("DailyScene") },
      { x: 337, label: "EVENT", color: eventReady ? 0x8a682d : 0x4e4631, action: () => this.scene.start("EventScene") },
    ];

    navItems.forEach((item) => {
      button(this, item.x, 770, 84, 52, item.label, item.action, item.color);
    });

    if (dailyReady) {
      const gift = text(this, 242, 731, "GIFT READY", 7, "#ffe6a1", "800");
      gift.setBackgroundColor("#493a1b").setPadding(7, 4, 7, 4);
      this.tweens.add({
        targets: gift,
        scaleX: 1.04,
        scaleY: 1.04,
        duration: 650,
        yoyo: true,
        repeat: -1,
        ease: "Sine.InOut",
      });
    }

    if (eventReady) {
      const reward = text(this, 337, 731, "REWARD READY", 7, "#ffe6a1", "800");
      reward.setBackgroundColor("#493a1b").setPadding(7, 4, 7, 4);
    } else {
      this.add.text(
        337,
        731,
        `${Math.min(save.eventPoints, weeklyEvent.target)}/${weeklyEvent.target}`,
        {
          fontFamily: "Inter, system-ui",
          fontSize: "7px",
          fontStyle: "bold",
          color: "#776a49",
        },
      ).setOrigin(0.5);
    }

    title.setAlpha(0);
    title.setY(142);
    this.tweens.add({ targets: title, alpha: 1, y: 128, duration: 620, ease: "Cubic.Out" });
  }
}
