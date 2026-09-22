import Phaser from "phaser";
import { addGradientBackground, button, COLORS, drawBuilding, drawIsoTile, pill, text, W } from "../ui";
import { loadSave, updateSave } from "../save";

export class CityScene extends Phaser.Scene {
  private cityGraphics!: Phaser.GameObjects.Graphics;
  private save = loadSave();

  constructor() {
    super("CityScene");
  }

  create() {
    addGradientBackground(this, 0x09212a, 0x081216);
    this.save = loadSave();

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

    pill(this, 261, 43, 92, "COINS", "â", String(this.save.coins));
    pill(this, 347, 43, 70, "STAR", "â", String(this.save.stars));

    this.add.text(24, 91, "YOUR CITY", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#54747d",
      letterSpacing: 1,
    });

    this.cityGraphics = this.add.graphics();
    this.drawCity();

    const infoY = 638;
    this.add.rectangle(W / 2, infoY, W - 40, 130, COLORS.panel, 0.94)
      .setStrokeStyle(1, 0x24454e, 1);

    this.add.text(36, infoY - 43, "COFFEE SHOP", {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#78e1bd",
      letterSpacing: 1,
    });

    const stage = this.save.coffeeShopStage;
    this.add.text(36, infoY - 17, stage === 0 ? "A new place for the neighborhood" : "Corner Coffee", {
      fontFamily: "Inter, system-ui",
      fontSize: "18px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    this.add.text(36, infoY + 14, stage >= 3 ? "Complete â¢ +25 population" : `Build stage ${stage + 1} of 3`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      color: "#829ba3",
    });

    const buildLabel = stage >= 3 ? "BUILDING COMPLETE â" : "BUILD  â¢  â 1";
    const build = button(
      this,
      W / 2,
      742,
      W - 48,
      56,
      buildLabel,
      () => this.buildCoffeeShop(),
      stage >= 3 ? 0x28424a : COLORS.mintDark,
    );

    if (stage >= 3) build.disableInteractive();

    this.add.text(W / 2, 803, "Solve more puzzles to earn Construction Stars", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      color: "#607981",
    }).setOrigin(0.5);
  }

  private drawCity() {
    const g = this.cityGraphics;
    g.clear();

    g.fillStyle(0x02090c, 0.25);
    g.fillEllipse(W / 2, 480, 370, 165);

    drawIsoTile(g, W / 2, 425, 352, 182, 0x17333b);
    drawIsoTile(g, W / 2, 416, 322, 164, 0x3f7a5f);

    g.lineStyle(9, COLORS.road, 1);
    g.beginPath();
    g.moveTo(76, 385);
    g.lineTo(292, 493);
    g.strokePath();

    g.beginPath();
    g.moveTo(302, 374);
    g.lineTo(88, 482);
    g.strokePath();

    drawBuilding(g, 115, 369, 68, 30, 74, 0xdd7366, 0xa9514c, 0xffb377);
    drawBuilding(g, 280, 389, 74, 34, 96, 0x4f96a8, 0x326e82, 0x90e0d8);
    drawBuilding(g, 263, 475, 58, 28, 60, 0xa88ccf, 0x755ea1, 0xd8c2f2);

    this.drawCoffeeShop(g, this.save.coffeeShopStage);

    [
      [65, 422], [93, 502], [145, 496], [324, 441], [295, 513], [210, 339], [174, 337],
    ].forEach(([x, y]) => this.drawTree(g, x, y));

    this.drawCar(g, 211, 460, 0xffcf68);
    this.drawCar(g, 156, 404, 0x70dae2);
  }

  private drawCoffeeShop(g: Phaser.GameObjects.Graphics, stage: number) {
    const x = 152;
    const y = 454;

    if (stage === 0) {
      drawIsoTile(g, x, y + 18, 90, 48, 0x765f46);
      g.fillStyle(0x9f835f, 0.9);
      for (let i = 0; i < 5; i += 1) {
        g.fillRect(x - 31 + i * 15, y + 2 + (i % 2) * 4, 8, 16);
      }
      return;
    }

    const heights = [0, 30, 52, 72];
    const height = heights[Math.min(stage, 3)];
    drawBuilding(g, x, y, 82, 38, height, 0xe7b85a, 0xb7843d, 0xffdda0);

    if (stage >= 2) {
      g.fillStyle(0x2d6772, 1);
      g.fillRect(x + 14, y - height + 27, 15, 18);
      g.fillRect(x - 27, y - height + 31, 13, 15);
      g.fillStyle(0x173d35, 1);
      g.fillRect(x - 2, y - height + 34, 11, 24);
    }

    if (stage >= 3) {
      g.fillStyle(0xe36d5e, 1);
      g.fillRect(x - 34, y - height + 12, 68, 8);
      g.fillStyle(0xffffff, 0.8);
      g.fillCircle(x + 31, y - height + 8, 4);
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

  private buildCoffeeShop() {
    this.save = loadSave();

    if (this.save.coffeeShopStage >= 3) return;

    if (this.save.stars < 1) {
      this.showNeedStar();
      return;
    }

    const nextStage = this.save.coffeeShopStage + 1;
    this.save = updateSave((save) => ({
      ...save,
      stars: save.stars - 1,
      coffeeShopStage: Math.min(3, save.coffeeShopStage + 1),
      coins: save.coins + 10,
    }));

    this.cameras.main.shake(260, 0.004);

    const dust: Phaser.GameObjects.Arc[] = [];
    for (let i = 0; i < 16; i += 1) {
      const particle = this.add.circle(
        Phaser.Math.Between(122, 182),
        Phaser.Math.Between(420, 470),
        Phaser.Math.Between(2, 5),
        0xe7c58e,
        Phaser.Math.FloatBetween(0.18, 0.5),
      );
      dust.push(particle);
      this.tweens.add({
        targets: particle,
        x: particle.x + Phaser.Math.Between(-20, 20),
        y: particle.y - Phaser.Math.Between(18, 50),
        alpha: 0,
        scale: 0.2,
        duration: Phaser.Math.Between(450, 760),
        delay: Phaser.Math.Between(0, 220),
      });
    }

    this.time.delayedCall(560, () => {
      dust.forEach((particle) => particle.destroy());
      this.drawCity();

      const sparkle = text(this, 152, 364, "â¦", 44, "#ffe596", "800").setScale(0.2);
      this.tweens.add({
        targets: sparkle,
        scaleX: 1.2,
        scaleY: 1.2,
        alpha: 0,
        y: 338,
        duration: 800,
        ease: "Back.Out",
        onComplete: () => sparkle.destroy(),
      });

      const toast = text(
        this,
        W / 2,
        575,
        nextStage >= 3 ? "COFFEE SHOP COMPLETE!" : `BUILD STAGE ${nextStage} COMPLETE`,
        12,
        "#b9f8df",
        "800",
      );
      toast.setBackgroundColor("#11352c").setPadding(12, 8, 12, 8);

      this.tweens.add({
        targets: toast,
        y: 560,
        duration: 240,
        yoyo: true,
        hold: 1200,
        onComplete: () => {
          toast.destroy();
          this.scene.restart();
        },
      });
    });
  }

  private showNeedStar() {
    const toast = text(this, W / 2, 707, "Solve one more puzzle to earn a â", 11, "#ffe09b", "800");
    toast.setBackgroundColor("#493a1b").setPadding(12, 8, 12, 8);

    this.tweens.add({
      targets: toast,
      alpha: 0,
      y: 692,
      duration: 1200,
      delay: 900,
      onComplete: () => {
        toast.destroy();
        this.scene.start("PuzzleScene");
      },
    });
  }
}
