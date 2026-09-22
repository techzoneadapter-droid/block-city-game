import Phaser from "phaser";
import { addGradientBackground, button, COLORS, drawBuilding, drawIsoTile, pill, text, W } from "../ui";
import { loadSave } from "../save";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    addGradientBackground(this);

    const save = loadSave();

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
    const showingRiverside = save.district >= 2;
    const activeProgress = showingRiverside ? districtTwoProgress : districtOneProgress;

    this.add.text(
      34,
      631,
      showingRiverside ? "DISTRICT 02" : "DISTRICT 01",
      {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        fontStyle: "bold",
        color: "#6f8f98",
      },
    );
    this.add.text(34, 652, showingRiverside ? "Riverside" : "Starter Street", {
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

    if (save.district >= 3) {
      this.add.text(W - 34, 631, "RIVERSIDE COMPLETE ✦", {
        fontFamily: "Inter, system-ui",
        fontSize: "8px",
        fontStyle: "bold",
        color: "#70d9b6",
      }).setOrigin(1, 0);
    }

    button(this, 112, 770, 176, 56, "PLAY PUZZLE", () => {
      this.scene.start("PuzzleScene");
    });

    button(this, 298, 770, 154, 56, "VIEW CITY", () => {
      this.scene.start("CityScene");
    }, 0x28515e);

    title.setAlpha(0);
    title.setY(142);
    this.tweens.add({ targets: title, alpha: 1, y: 128, duration: 620, ease: "Cubic.Out" });
  }
}
