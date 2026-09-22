import Phaser from "phaser";
import {
  addGradientBackground,
  button,
  COLORS,
  drawBuilding,
  drawIsoTile,
  pill,
  text,
  W,
} from "../ui";
import { districtOneComplete, loadSave, updateSave } from "../save";

type BuildingKey = "coffee" | "park";

type BuildingDefinition = {
  name: string;
  eyebrow: string;
  maxStage: number;
  starCost: number;
};

const BUILDINGS: Record<BuildingKey, BuildingDefinition> = {
  coffee: {
    name: "Corner Coffee",
    eyebrow: "COFFEE SHOP",
    maxStage: 3,
    starCost: 1,
  },
  park: {
    name: "Pocket Park",
    eyebrow: "COMMUNITY PARK",
    maxStage: 3,
    starCost: 1,
  },
};

export class CityScene extends Phaser.Scene {
  private cityGraphics!: Phaser.GameObjects.Graphics;
  private save = loadSave();
  private selectedBuilding: BuildingKey = "coffee";

  constructor() {
    super("CityScene");
  }

  init(data?: { selectedBuilding?: BuildingKey }) {
    if (data?.selectedBuilding === "coffee" || data?.selectedBuilding === "park") {
      this.selectedBuilding = data.selectedBuilding;
    }
  }

  create() {
    addGradientBackground(this, 0x09212a, 0x081216);
    this.save = loadSave();

    if (this.save.coffeeShopStage >= 3 && this.save.parkStage < 3) {
      this.selectedBuilding = "park";
    }

    this.add.text(24, 28, "DISTRICT 01", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6b919a",
      letterSpacing: 1,
    });

    this.add.text(24, 48, "Starter Street", {
      fontFamily: "Inter, system-ui",
      fontSize: "24px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    pill(this, 251, 43, 86, "COINS", "●", String(this.save.coins));
    pill(this, 338, 43, 72, "STAR", "★", String(this.save.stars));

    this.add.text(24, 91, "YOUR CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#54747d",
      letterSpacing: 1,
    });

    this.add.text(W - 24, 91, `POPULATION  ${this.save.population}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#72bfa4",
      letterSpacing: 0.5,
    }).setOrigin(1, 0);

    this.cityGraphics = this.add.graphics();
    this.drawCity();

    this.createBuildingSelectors();
    this.createBuildingPanel();

    if (this.save.district >= 2) {
      const banner = text(this, W / 2, 520, "DISTRICT 2 UNLOCKED  ✦", 10, "#d6f7ea", "800");
      banner.setBackgroundColor("#164437").setPadding(12, 7, 12, 7);
    }

    this.add.text(W - 22, 808, "v0.3", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private createBuildingSelectors() {
    this.createSelector(103, 550, "coffee", "☕", this.save.coffeeShopStage);
    this.createSelector(287, 550, "park", "✿", this.save.parkStage);
  }

  private createSelector(
    x: number,
    y: number,
    key: BuildingKey,
    icon: string,
    stage: number,
  ) {
    const selected = this.selectedBuilding === key;
    const container = this.add.container(x, y);
    const bg = this.add.rectangle(
      0,
      0,
      164,
      50,
      selected ? 0x173c39 : 0x102128,
      0.98,
    ).setStrokeStyle(1, selected ? 0x52b894 : 0x29434b, 1);

    const ico = text(this, -62, -2, icon, 18, selected ? "#d6faec" : "#76939a", "800");
    const name = this.add.text(-43, -13, BUILDINGS[key].name, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: selected ? "#effbf7" : "#9db0b6",
    });
    const progress = this.add.text(-43, 4, stage >= 3 ? "Complete" : `Stage ${stage}/3`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: stage >= 3 ? "#63d5a9" : "#607d84",
    });

    container.add([bg, ico, name, progress]);
    container.setSize(164, 50);
    container.setInteractive({ useHandCursor: true });
    container.on("pointerup", () => {
      if (this.selectedBuilding === key) return;
      this.scene.restart({ selectedBuilding: key });
    });
  }

  private createBuildingPanel() {
    const infoY = 650;
    const definition = BUILDINGS[this.selectedBuilding];
    const stage = this.getStage(this.selectedBuilding);

    this.add.rectangle(W / 2, infoY, W - 40, 116, COLORS.panel, 0.95)
      .setStrokeStyle(1, 0x24454e, 1);

    this.add.text(36, infoY - 41, definition.eyebrow, {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#78e1bd",
      letterSpacing: 1,
    });

    this.add.text(
      36,
      infoY - 17,
      stage === 0
        ? this.selectedBuilding === "coffee"
          ? "A new place for the neighborhood"
          : "Turn an empty lot into green space"
        : definition.name,
      {
        fontFamily: "Inter, system-ui",
        fontSize: "16px",
        fontStyle: "bold",
        color: "#f6f1e4",
      },
    );

    this.add.text(
      36,
      infoY + 13,
      stage >= definition.maxStage
        ? "Complete • neighborhood upgraded"
        : `Build stage ${stage + 1} of ${definition.maxStage}  •  costs ★ ${definition.starCost}`,
      {
        fontFamily: "Inter, system-ui",
        fontSize: "9px",
        color: "#829ba3",
      },
    );

    const districtProgress = this.save.coffeeShopStage + this.save.parkStage;
    this.add.text(36, infoY + 36, `District progress  ${districtProgress}/6`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#58747b",
    });

    const progressBg = this.add.rectangle(182, infoY + 40, 118, 5, 0x1a3036, 1).setOrigin(0, 0.5);
    const progressWidth = 118 * Math.min(1, districtProgress / 6);
    this.add.rectangle(182, infoY + 40, progressWidth, 5, COLORS.mint, 0.85).setOrigin(0, 0.5);
    void progressBg;

    const complete = stage >= definition.maxStage;
    const buildLabel = complete ? "PLAY NEXT PUZZLE  →" : `BUILD  •  ★ ${definition.starCost}`;

    button(
      this,
      W / 2,
      753,
      W - 48,
      54,
      buildLabel,
      () => {
        if (complete) {
          this.scene.start("PuzzleScene");
        } else {
          this.buildSelected();
        }
      },
      complete ? 0x275d66 : COLORS.mintDark,
    );

    this.add.text(
      W / 2,
      799,
      districtOneComplete(this.save)
        ? "Starter Street complete • Riverside District is now unlocked"
        : "Solve puzzles → earn Stars → improve your district",
      {
        fontFamily: "Inter, system-ui",
        fontSize: "8.5px",
        color: "#607981",
      },
    ).setOrigin(0.5);
  }

  private getStage(key: BuildingKey) {
    return key === "coffee" ? this.save.coffeeShopStage : this.save.parkStage;
  }

  private drawCity() {
    const g = this.cityGraphics;
    g.clear();

    g.fillStyle(0x02090c, 0.25);
    g.fillEllipse(W / 2, 456, 370, 165);

    drawIsoTile(g, W / 2, 407, 352, 182, 0x17333b);
    drawIsoTile(g, W / 2, 398, 322, 164, 0x3f7a5f);

    g.lineStyle(9, COLORS.road, 1);
    g.beginPath();
    g.moveTo(76, 367);
    g.lineTo(292, 475);
    g.strokePath();

    g.beginPath();
    g.moveTo(302, 356);
    g.lineTo(88, 464);
    g.strokePath();

    drawBuilding(g, 111, 351, 68, 30, 74, 0xdd7366, 0xa9514c, 0xffb377);
    drawBuilding(g, 286, 371, 74, 34, 96, 0x4f96a8, 0x326e82, 0x90e0d8);
    drawBuilding(g, 275, 459, 58, 28, 60, 0xa88ccf, 0x755ea1, 0xd8c2f2);

    this.drawCoffeeShop(g, this.save.coffeeShopStage);
    this.drawPark(g, this.save.parkStage);

    [
      [61, 404],
      [94, 484],
      [330, 421],
      [306, 493],
      [211, 321],
      [173, 319],
    ].forEach(([x, y]) => this.drawTree(g, x, y));

    this.drawCar(g, 216, 442, 0xffcf68);
    this.drawCar(g, 160, 386, 0x70dae2);
  }

  private drawCoffeeShop(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 145;
    const y = 438;

    if (stage === 0) {
      drawIsoTile(g, x, y + 18, 86, 46, 0x765f46);
      g.fillStyle(0x9f835f, 0.9);
      for (let i = 0; i < 5; i += 1) {
        g.fillRect(x - 30 + i * 14, y + 2 + (i % 2) * 4, 8, 15);
      }
      return;
    }

    const heights = [0, 30, 52, 72];
    const height = heights[Math.min(stage, 3)];
    drawBuilding(g, x, y, 78, 36, height, 0xe7b85a, 0xb7843d, 0xffdda0);

    if (stage >= 2) {
      g.fillStyle(0x2d6772, 1);
      g.fillRect(x + 12, y - height + 27, 15, 18);
      g.fillRect(x - 26, y - height + 31, 13, 15);
      g.fillStyle(0x173d35, 1);
      g.fillRect(x - 2, y - height + 34, 11, 24);
    }

    if (stage >= 3) {
      g.fillStyle(0xe36d5e, 1);
      g.fillRect(x - 33, y - height + 12, 66, 8);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x + 30, y - height + 8, 4);
    }
  }

  private drawPark(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 224;
    const y = 364;

    drawIsoTile(g, x, y + 14, 94, 50, stage > 0 ? 0x438a61 : 0x6f624a);

    if (stage === 0) {
      g.fillStyle(0x8c7756, 0.9);
      g.fillRect(x - 25, y + 3, 50, 5);
      return;
    }

    const treeCount = stage === 1 ? 2 : stage === 2 ? 4 : 6;
    const spots = [
      [-24, 2],
      [22, 5],
      [-8, -8],
      [8, 13],
      [-34, 12],
      [33, -4],
    ];

    for (let i = 0; i < treeCount; i += 1) {
      const [dx, dy] = spots[i];
      this.drawTree(g, x + dx, y + dy);
    }

    if (stage >= 2) {
      g.fillStyle(0xdac690, 1);
      g.fillRoundedRect(x - 18, y + 10, 36, 5, 2);
      g.fillStyle(0x80694b, 1);
      g.fillRect(x - 14, y + 15, 3, 6);
      g.fillRect(x + 11, y + 15, 3, 6);
    }

    if (stage >= 3) {
      g.fillStyle(0x78d9d3, 0.9);
      g.fillCircle(x, y - 1, 10);
      g.fillStyle(0xd9f5ef, 0.6);
      g.fillCircle(x - 3, y - 4, 4);
    }
  }

  private drawTree(g: Phaser.GameObjects.Graphics, x: number, y: number) {
    g.fillStyle(0x183d2f, 1);
    g.fillRect(x - 2, y, 4, 14);
    g.fillStyle(0x52b978, 1);
    g.fillCircle(x, y - 5, 11);
    g.fillStyle(0x7bd991, 0.8);
    g.fillCircle(x - 4, y - 10, 6);
  }

  private drawCar(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number) {
    g.fillStyle(0x000000, 0.22);
    g.fillEllipse(x, y + 5, 30, 10);
    g.fillStyle(color, 1);
    g.fillRoundedRect(x - 14, y - 3, 28, 12, 4);
    g.fillStyle(0xdaf8ff, 0.75);
    g.fillRect(x - 4, y - 5, 10, 5);
  }

  private buildSelected() {
    this.save = loadSave();
    const key = this.selectedBuilding;
    const stage = this.getStage(key);
    const definition = BUILDINGS[key];

    if (stage >= definition.maxStage) {
      this.scene.start("PuzzleScene");
      return;
    }

    if (this.save.stars < definition.starCost) {
      this.showNeedStar();
      return;
    }

    const nextStage = stage + 1;
    const populationGain =
      key === "coffee"
        ? nextStage === 3
          ? 15
          : 5
        : nextStage === 3
          ? 10
          : nextStage === 2
            ? 6
            : 4;

    this.save = updateSave((save) => {
      const updated = {
        ...save,
        stars: save.stars - definition.starCost,
        coins: save.coins + (key === "coffee" ? 10 : 8),
        population: save.population + populationGain,
        coffeeShopStage:
          key === "coffee" ? Math.min(3, save.coffeeShopStage + 1) : save.coffeeShopStage,
        parkStage:
          key === "park" ? Math.min(3, save.parkStage + 1) : save.parkStage,
      };

      if (districtOneComplete(updated) && updated.district < 2) {
        return {
          ...updated,
          district: 2,
          coins: updated.coins + 100,
        };
      }

      return updated;
    });

    this.cameras.main.shake(240, 0.0035);
    this.buildDust(key);

    this.time.delayedCall(520, () => {
      this.drawCity();

      const sparkleX = key === "coffee" ? 145 : 224;
      const sparkleY = key === "coffee" ? 346 : 320;
      const sparkle = text(this, sparkleX, sparkleY, "✦", 40, "#ffe596", "800").setScale(0.2);
      this.tweens.add({
        targets: sparkle,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        y: sparkleY - 24,
        duration: 760,
        ease: "Back.Out",
        onComplete: () => sparkle.destroy(),
      });

      const districtDone = districtOneComplete(this.save);
      const message = districtDone
        ? "DISTRICT COMPLETE  •  +100 COINS"
        : nextStage >= 3
          ? `${definition.name.toUpperCase()} COMPLETE!`
          : `BUILD STAGE ${nextStage} COMPLETE`;

      const toast = text(this, W / 2, 512, message, 11, "#b9f8df", "800");
      toast.setBackgroundColor("#11352c").setPadding(12, 8, 12, 8);

      this.tweens.add({
        targets: toast,
        y: 500,
        duration: 220,
        yoyo: true,
        hold: 1050,
        onComplete: () => {
          toast.destroy();
          this.scene.restart({ selectedBuilding: key });
        },
      });
    });
  }

  private buildDust(key: BuildingKey) {
    const centerX = key === "coffee" ? 145 : 224;
    const centerY = key === "coffee" ? 432 : 365;

    for (let i = 0; i < 14; i += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(centerX - 28, centerX + 28),
        Phaser.Math.Between(centerY - 15, centerY + 24),
        Phaser.Math.Between(2, 5),
        key === "coffee" ? 0xe7c58e : 0x8bcf9d,
        Phaser.Math.FloatBetween(0.2, 0.5),
      );

      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-18, 18),
        y: particle.y - Phaser.Math.Between(16, 45),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(420, 700),
        delay: Phaser.Math.Between(0, 180),
        onComplete: () => particle.destroy(),
      });
    }
  }

  private showNeedStar() {
    const toast = text(
      this,
      W / 2,
      708,
      "Solve one more puzzle to earn a ★",
      11,
      "#ffe09b",
      "800",
    );
    toast.setBackgroundColor("#493a1b").setPadding(12, 8, 12, 8);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 692,
      duration: 950,
      delay: 750,
      onComplete: () => {
        toast.destroy();
        this.scene.start("PuzzleScene");
      },
    });
  }
}
