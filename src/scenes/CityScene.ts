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
import {
  districtOneComplete,
  districtTwoComplete,
  loadSave,
  updateSave,
} from "../save";

type DistrictId = 1 | 2;
type BuildingKey = "coffee" | "park" | "market" | "boardwalk";

type BuildingDefinition = {
  district: DistrictId;
  name: string;
  eyebrow: string;
  maxStage: number;
  starCost: number;
  coinReward: number;
};

const BUILDINGS: Record<BuildingKey, BuildingDefinition> = {
  coffee: {
    district: 1,
    name: "Corner Coffee",
    eyebrow: "COFFEE SHOP",
    maxStage: 3,
    starCost: 1,
    coinReward: 10,
  },
  park: {
    district: 1,
    name: "Pocket Park",
    eyebrow: "COMMUNITY PARK",
    maxStage: 3,
    starCost: 1,
    coinReward: 8,
  },
  market: {
    district: 2,
    name: "River Market",
    eyebrow: "RIVER MARKET",
    maxStage: 3,
    starCost: 2,
    coinReward: 16,
  },
  boardwalk: {
    district: 2,
    name: "Sunset Boardwalk",
    eyebrow: "BOARDWALK",
    maxStage: 3,
    starCost: 2,
    coinReward: 18,
  },
};

export class CityScene extends Phaser.Scene {
  private cityGraphics!: Phaser.GameObjects.Graphics;
  private save = loadSave();
  private selectedDistrict: DistrictId = 1;
  private selectedBuilding: BuildingKey = "coffee";

  constructor() {
    super("CityScene");
  }

  init(data?: { district?: DistrictId; selectedBuilding?: BuildingKey }) {
    if (data?.district === 1 || data?.district === 2) {
      this.selectedDistrict = data.district;
    }
    if (data?.selectedBuilding && BUILDINGS[data.selectedBuilding]) {
      this.selectedBuilding = data.selectedBuilding;
    }
  }

  create() {
    addGradientBackground(this, 0x09212a, 0x081216);
    this.save = loadSave();

    if (this.save.district >= 2 && districtOneComplete(this.save) && this.selectedDistrict === 1) {
      this.selectedDistrict = 2;
      if (this.selectedBuilding === "coffee" || this.selectedBuilding === "park") {
        this.selectedBuilding = "market";
      }
    }

    if (this.selectedDistrict === 2 && this.save.district < 2) {
      this.selectedDistrict = 1;
      this.selectedBuilding = "coffee";
    }

    if (BUILDINGS[this.selectedBuilding].district !== this.selectedDistrict) {
      this.selectedBuilding = this.selectedDistrict === 1 ? "coffee" : "market";
    }

    const districtName = this.selectedDistrict === 1 ? "Starter Street" : "Riverside";
    const districtNumber = this.selectedDistrict.toString().padStart(2, "0");

    this.add.text(24, 27, `DISTRICT ${districtNumber}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6b919a",
      letterSpacing: 1,
    });

    this.add.text(24, 47, districtName, {
      fontFamily: "Inter, system-ui",
      fontSize: "23px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    pill(this, 251, 42, 86, "COINS", "●", String(this.save.coins));
    pill(this, 338, 42, 72, "STAR", "★", String(this.save.stars));

    this.createDistrictTabs();

    this.add.text(24, 128, "YOUR CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#54747d",
      letterSpacing: 1,
    });

    this.add.text(W - 24, 128, `POPULATION  ${this.save.population}`, {
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

    if (districtTwoComplete(this.save)) {
      const banner = text(this, W / 2, 512, "RIVERSIDE COMPLETE  ✦  NEXT DISTRICT SOON", 9, "#d6f7ea", "800");
      banner.setBackgroundColor("#164437").setPadding(10, 6, 10, 6);
    }

    this.add.text(W - 22, 808, "v0.6", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private createDistrictTabs() {
    const makeTab = (x: number, district: DistrictId, label: string, unlocked: boolean) => {
      const active = this.selectedDistrict === district;
      const container = this.add.container(x, 102);
      const bg = this.add.rectangle(
        0,
        0,
        164,
        34,
        active ? 0x1b4941 : 0x101e24,
        unlocked ? 0.96 : 0.62,
      ).setStrokeStyle(1, active ? 0x52b894 : 0x2a4148, 0.9);
      const labelText = text(
        this,
        0,
        -1,
        unlocked ? label : `🔒 ${label}`,
        9,
        active ? "#e2fff5" : unlocked ? "#91aab0" : "#506268",
        "800",
      );
      container.add([bg, labelText]);
      container.setSize(164, 34);

      if (unlocked) {
        container.setInteractive({ useHandCursor: true });
        container.on("pointerup", () => {
          if (this.selectedDistrict === district) return;
          const selectedBuilding: BuildingKey = district === 1 ? "coffee" : "market";
          this.scene.restart({ district, selectedBuilding });
        });
      }
    };

    makeTab(102, 1, "STARTER STREET", true);
    makeTab(288, 2, "RIVERSIDE", this.save.district >= 2);
  }

  private createBuildingSelectors() {
    const buildings: BuildingKey[] =
      this.selectedDistrict === 1 ? ["coffee", "park"] : ["market", "boardwalk"];

    this.createSelector(103, 550, buildings[0], this.iconFor(buildings[0]), this.getStage(buildings[0]));
    this.createSelector(287, 550, buildings[1], this.iconFor(buildings[1]), this.getStage(buildings[1]));
  }

  private iconFor(key: BuildingKey) {
    if (key === "coffee") return "☕";
    if (key === "park") return "✿";
    if (key === "market") return "◆";
    return "≈";
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
      this.scene.restart({ district: this.selectedDistrict, selectedBuilding: key });
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
      stage === 0 ? this.emptyLotCopy(this.selectedBuilding) : definition.name,
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

    const districtProgress = this.currentDistrictProgress();
    this.add.text(36, infoY + 36, `District progress  ${districtProgress}/6`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#58747b",
    });

    this.add.rectangle(182, infoY + 40, 118, 5, 0x1a3036, 1).setOrigin(0, 0.5);
    this.add.rectangle(
      182,
      infoY + 40,
      118 * Math.min(1, districtProgress / 6),
      5,
      COLORS.mint,
      0.85,
    ).setOrigin(0, 0.5);

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

    const districtComplete =
      this.selectedDistrict === 1 ? districtOneComplete(this.save) : districtTwoComplete(this.save);

    this.add.text(
      W / 2,
      799,
      districtComplete
        ? this.selectedDistrict === 1
          ? "Starter Street complete • Riverside is unlocked"
          : "Riverside complete • the city is ready to expand"
        : "Solve puzzles → earn Stars → improve your district",
      {
        fontFamily: "Inter, system-ui",
        fontSize: "8.5px",
        color: "#607981",
      },
    ).setOrigin(0.5);
  }

  private emptyLotCopy(key: BuildingKey) {
    if (key === "coffee") return "A new place for the neighborhood";
    if (key === "park") return "Turn an empty lot into green space";
    if (key === "market") return "Bring local stalls to the riverfront";
    return "Create a lively walk beside the water";
  }

  private currentDistrictProgress() {
    if (this.selectedDistrict === 1) {
      return this.save.coffeeShopStage + this.save.parkStage;
    }
    return this.save.riverMarketStage + this.save.boardwalkStage;
  }

  private getStage(key: BuildingKey) {
    if (key === "coffee") return this.save.coffeeShopStage;
    if (key === "park") return this.save.parkStage;
    if (key === "market") return this.save.riverMarketStage;
    return this.save.boardwalkStage;
  }

  private drawCity() {
    if (this.selectedDistrict === 1) this.drawStarterStreet();
    else this.drawRiverside();
  }

  private drawStarterStreet() {
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

    [[61, 404], [94, 484], [330, 421], [306, 493], [211, 321], [173, 319]]
      .forEach(([x, y]) => this.drawTree(g, x, y));

    this.drawCar(g, 216, 442, 0xffcf68);
    this.drawCar(g, 160, 386, 0x70dae2);
  }

  private drawRiverside() {
    const g = this.cityGraphics;
    g.clear();

    g.fillStyle(0x02090c, 0.25);
    g.fillEllipse(W / 2, 456, 370, 165);

    drawIsoTile(g, W / 2, 407, 352, 182, 0x173b42);
    drawIsoTile(g, W / 2, 398, 322, 164, 0x4a7759);

    g.fillStyle(0x2c8095, 0.9);
    g.beginPath();
    g.moveTo(62, 420);
    g.lineTo(167, 472);
    g.lineTo(332, 389);
    g.lineTo(229, 337);
    g.closePath();
    g.fillPath();

    g.lineStyle(3, 0x79d8dc, 0.34);
    for (let i = 0; i < 5; i += 1) {
      g.beginPath();
      g.moveTo(103 + i * 36, 418 - i * 18);
      g.lineTo(151 + i * 36, 442 - i * 18);
      g.strokePath();
    }

    g.lineStyle(8, 0xd0b27c, 1);
    g.beginPath();
    g.moveTo(95, 377);
    g.lineTo(287, 473);
    g.strokePath();

    drawBuilding(g, 95, 356, 62, 30, 68, 0xd86f61, 0xa94e48, 0xffb178);
    drawBuilding(g, 301, 405, 65, 31, 80, 0x6687b8, 0x476795, 0xb6d5ef);

    this.drawRiverMarket(g, this.save.riverMarketStage);
    this.drawBoardwalk(g, this.save.boardwalkStage);

    [[72, 440], [102, 485], [315, 350], [329, 462], [182, 324]]
      .forEach(([x, y]) => this.drawTree(g, x, y));

    this.drawBoat(g, 195, 420, 0xf2c061);
    this.drawBoat(g, 245, 392, 0xef8b77);
  }

  private drawCoffeeShop(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 145;
    const y = 438;

    if (stage === 0) {
      drawIsoTile(g, x, y + 18, 86, 46, 0x765f46);
      g.fillStyle(0x9f835f, 0.9);
      for (let i = 0; i < 5; i += 1) g.fillRect(x - 30 + i * 14, y + 2 + (i % 2) * 4, 8, 15);
      return;
    }

    const height = [0, 30, 52, 72][Math.min(stage, 3)];
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
    const spots = [[-24, 2], [22, 5], [-8, -8], [8, 13], [-34, 12], [33, -4]];
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

  private drawRiverMarket(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 128;
    const y = 425;

    if (stage === 0) {
      drawIsoTile(g, x, y + 16, 92, 48, 0x76664e);
      return;
    }

    const stallCount = stage === 1 ? 2 : stage === 2 ? 4 : 5;
    const spots = [[-24, -2], [13, 7], [-3, -15], [30, -10], [-31, 14]];
    for (let i = 0; i < stallCount; i += 1) {
      const [dx, dy] = spots[i];
      const sx = x + dx;
      const sy = y + dy;
      g.fillStyle(i % 2 === 0 ? 0xf0966f : 0xf1c666, 1);
      g.fillRect(sx - 10, sy - 12, 20, 8);
      g.fillStyle(0x7c5b45, 1);
      g.fillRect(sx - 8, sy - 4, 16, 12);
    }

    if (stage >= 3) {
      g.fillStyle(0xf5df9a, 1);
      g.fillCircle(x + 38, y - 24, 6);
      g.lineStyle(2, 0xf5df9a, 0.7);
      g.beginPath();
      g.moveTo(x - 38, y - 23);
      g.lineTo(x + 38, y - 24);
      g.strokePath();
    }
  }

  private drawBoardwalk(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 266;
    const y = 443;

    if (stage === 0) {
      drawIsoTile(g, x, y + 12, 94, 46, 0x776950);
      return;
    }

    g.fillStyle(0xc89e68, 1);
    g.beginPath();
    g.moveTo(x - 46, y + 2);
    g.lineTo(x - 24, y + 13);
    g.lineTo(x + 47, y - 22);
    g.lineTo(x + 24, y - 33);
    g.closePath();
    g.fillPath();

    if (stage >= 2) {
      for (let i = 0; i < 4; i += 1) {
        const lx = x - 23 + i * 18;
        const ly = y + 2 - i * 9;
        g.fillStyle(0x4c4b43, 1);
        g.fillRect(lx, ly - 18, 2, 18);
        g.fillStyle(0xffde87, 0.95);
        g.fillCircle(lx + 1, ly - 19, 4);
      }
    }

    if (stage >= 3) {
      g.fillStyle(0xe16e62, 1);
      g.fillRoundedRect(x + 10, y - 25, 28, 8, 3);
      g.fillStyle(0xf1d6a0, 1);
      g.fillRect(x + 13, y - 17, 3, 8);
      g.fillRect(x + 32, y - 17, 3, 8);
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

  private drawBoat(g: Phaser.GameObjects.Graphics, x: number, y: number, color: number) {
    g.fillStyle(0x031219, 0.22);
    g.fillEllipse(x, y + 5, 32, 10);
    g.fillStyle(color, 1);
    g.beginPath();
    g.moveTo(x - 15, y);
    g.lineTo(x + 15, y);
    g.lineTo(x + 9, y + 9);
    g.lineTo(x - 9, y + 9);
    g.closePath();
    g.fillPath();
    g.fillStyle(0xe7f6f5, 0.8);
    g.fillRect(x - 3, y - 9, 6, 9);
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
      this.showNeedStar(definition.starCost);
      return;
    }

    const nextStage = stage + 1;
    const populationGain = this.populationGain(key, nextStage);

    this.save = updateSave((save) => {
      const updated = {
        ...save,
        stars: save.stars - definition.starCost,
        coins: save.coins + definition.coinReward,
        population: save.population + populationGain,
        dailyBuilds: save.dailyBuilds + 1,
        totalBuilds: save.totalBuilds + 1,
        xp: save.xp + 20,
        coffeeShopStage:
          key === "coffee" ? Math.min(3, save.coffeeShopStage + 1) : save.coffeeShopStage,
        parkStage:
          key === "park" ? Math.min(3, save.parkStage + 1) : save.parkStage,
        riverMarketStage:
          key === "market" ? Math.min(3, save.riverMarketStage + 1) : save.riverMarketStage,
        boardwalkStage:
          key === "boardwalk" ? Math.min(3, save.boardwalkStage + 1) : save.boardwalkStage,
      };

      if (districtOneComplete(updated) && updated.district < 2) {
        return { ...updated, district: 2, coins: updated.coins + 100 };
      }

      if (districtTwoComplete(updated) && updated.district < 3) {
        return { ...updated, district: 3, coins: updated.coins + 150 };
      }

      return updated;
    });

    this.cameras.main.shake(240, 0.0035);
    this.buildDust(key);

    this.time.delayedCall(520, () => {
      this.drawCity();

      const [sparkleX, sparkleY] = this.sparklePosition(key);
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

      const districtDone =
        this.selectedDistrict === 1 ? districtOneComplete(this.save) : districtTwoComplete(this.save);
      const message = districtDone
        ? this.selectedDistrict === 1
          ? "DISTRICT COMPLETE  •  RIVERSIDE UNLOCKED"
          : "RIVERSIDE COMPLETE  •  +150 COINS"
        : nextStage >= 3
          ? `${definition.name.toUpperCase()} COMPLETE!`
          : `BUILD STAGE ${nextStage} COMPLETE`;

      const toast = text(this, W / 2, 512, message, 10, "#b9f8df", "800");
      toast.setBackgroundColor("#11352c").setPadding(10, 8, 10, 8);

      this.tweens.add({
        targets: toast,
        y: 500,
        duration: 220,
        yoyo: true,
        hold: 1050,
        onComplete: () => {
          toast.destroy();
          this.scene.restart({
            district: this.selectedDistrict,
            selectedBuilding: key,
          });
        },
      });
    });
  }

  private populationGain(key: BuildingKey, stage: number) {
    if (key === "coffee") return stage === 3 ? 15 : 5;
    if (key === "park") return stage === 3 ? 10 : stage === 2 ? 6 : 4;
    if (key === "market") return stage === 3 ? 24 : 8;
    return stage === 3 ? 20 : stage === 2 ? 10 : 7;
  }

  private sparklePosition(key: BuildingKey): [number, number] {
    if (key === "coffee") return [145, 346];
    if (key === "park") return [224, 320];
    if (key === "market") return [128, 360];
    return [266, 370];
  }

  private buildDust(key: BuildingKey) {
    const centers: Record<BuildingKey, [number, number]> = {
      coffee: [145, 432],
      park: [224, 365],
      market: [128, 420],
      boardwalk: [266, 435],
    };
    const [centerX, centerY] = centers[key];

    for (let i = 0; i < 14; i += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(centerX - 28, centerX + 28),
        Phaser.Math.Between(centerY - 15, centerY + 24),
        Phaser.Math.Between(2, 5),
        key === "park" || key === "boardwalk" ? 0x8bcf9d : 0xe7c58e,
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

  private showNeedStar(cost: number) {
    const toast = text(
      this,
      W / 2,
      708,
      `Need ★ ${cost}. Solve more puzzles first.`,
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
