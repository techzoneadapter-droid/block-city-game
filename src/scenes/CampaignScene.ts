import Phaser from "phaser";
import { addGradientBackground, button, COLORS, pill, text, W } from "../ui";
import { getLevelDefinition } from "../levels";
import { loadSave } from "../save";

export class CampaignScene extends Phaser.Scene {
  constructor() {
    super("CampaignScene");
  }

  create() {
    addGradientBackground(this, 0x0b2029, 0x071116);
    const save = loadSave();
    const current = save.level;
    const def = getLevelDefinition(current);

    const back = text(this, 24, 28, "← HOME", 9, "#7ba5ad", "800");
    back.setInteractive({ useHandCursor: true });
    back.on("pointerup", () => this.scene.start("HomeScene"));

    this.add.text(24, 50, "CITY JOURNEY", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#6f9299",
      letterSpacing: 1,
    });

    this.add.text(24, 72, "Build your way forward.", {
      fontFamily: "Inter, system-ui",
      fontSize: "25px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    pill(this, 258, 44, 84, "COINS", "●", String(save.coins));
    pill(this, 344, 44, 68, "STAR", "★", String(save.stars));

    this.drawRoute(current);
    this.drawMissionCard(current, def);

    this.add.text(W - 22, 813, "v0.8", {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#365a63",
    }).setOrigin(1, 0.5);
  }

  private drawRoute(current: number) {
    this.add.text(24, 122, "CAMPAIGN MAP", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#67858d",
      letterSpacing: 1,
    });

    this.add.rectangle(W / 2, 282, W - 42, 290, 0x0f2229, 0.96)
      .setStrokeStyle(1, 0x28444b, 1);

    const start = Math.max(1, current - 3);
    const levels = Array.from({ length: 8 }, (_, i) => start + i);
    const points = [
      [64, 358], [118, 310], [180, 347], [244, 292],
      [320, 334], [275, 404], [190, 432], [104, 408],
    ] as const;

    const route = this.add.graphics();
    route.lineStyle(5, 0x29474d, 1);
    route.beginPath();
    route.moveTo(points[0][0], points[0][1]);
    points.slice(1).forEach(([x, y]) => route.lineTo(x, y));
    route.strokePath();

    levels.forEach((level, index) => {
      const [x, y] = points[index];
      const done = level < current;
      const active = level === current;
      const locked = level > current;
      const fill = active ? COLORS.mint : done ? 0x2c6d5b : 0x172c32;
      const stroke = active ? 0xb9f6df : done ? 0x4b9a7e : 0x324a50;

      this.add.circle(x, y, active ? 22 : 17, fill, 1)
        .setStrokeStyle(active ? 3 : 1, stroke, 1);

      text(this, x, y - 1, locked ? "•" : String(level), active ? 12 : 9, active ? "#062018" : "#dce8e4", "800");

      if (active) {
        const you = text(this, x, y - 34, "NEXT", 7, "#c8f6e6", "800");
        you.setBackgroundColor("#1b4d40").setPadding(6, 3, 6, 3);
        this.tweens.add({
          targets: you,
          y: y - 38,
          duration: 700,
          yoyo: true,
          repeat: -1,
          ease: "Sine.InOut",
        });
      }

      if (level === 5 || level === 10 || level === 15) {
        this.add.text(x, y + 24, level === 5 ? "BOOSTER" : level === 10 ? "FINALE" : "SKYLINE", {
          fontFamily: "Inter, system-ui",
          fontSize: "6px",
          fontStyle: "bold",
          color: active || done ? "#8ab5a7" : "#4f646a",
        }).setOrigin(0.5);
      }
    });

    const district =
      current <= 5 ? "STARTER STREET" :
      current <= 10 ? "RIVERSIDE" :
      "SKYLINE HEIGHTS";

    this.add.text(36, 174, district, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: "#7cd8ba",
      letterSpacing: 1,
    });

    this.add.text(36, 194, `Level ${current} is ready`, {
      fontFamily: "Inter, system-ui",
      fontSize: "16px",
      fontStyle: "bold",
      color: "#f1f5f2",
    });
  }

  private drawMissionCard(level: number, def: ReturnType<typeof getLevelDefinition>) {
    this.add.text(24, 456, "NEXT BUILD PLAN", {
      fontFamily: "Inter, system-ui",
      fontSize: "9px",
      fontStyle: "bold",
      color: "#67858d",
      letterSpacing: 1,
    });

    this.add.rectangle(W / 2, 578, W - 42, 210, COLORS.panel, 0.98)
      .setStrokeStyle(1, 0x315950, 1);

    const difficultyColor =
      def.difficulty === "Hard" ? "#ff9d86" :
      def.difficulty === "Medium" ? "#f2cc75" :
      "#70d9b6";

    this.add.text(36, 494, `LEVEL ${level}  •  ${def.difficulty.toUpperCase()}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      fontStyle: "bold",
      color: difficultyColor,
      letterSpacing: 0.8,
    });

    this.add.text(36, 518, def.label, {
      fontFamily: "Inter, system-ui",
      fontSize: "20px",
      fontStyle: "bold",
      color: "#f6f1e4",
    });

    const goals = [`Clear ${def.targetLines} lines`];
    if (def.targetPlacements) goals.push(`Place ${def.targetPlacements} blocks`);
    if (def.targetCombo) goals.push(`Reach combo ${def.targetCombo}`);
    if (def.specialCells?.length) goals.push(`Clear ${def.specialCells.length} debris`);
    if (def.iceCells?.length) goals.push(`Break ${def.iceCells.length} ice`);

    this.add.text(36, 554, goals.join("\n"), {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      color: "#93a9ae",
      lineSpacing: 7,
    });

    this.add.text(36, 646, `REWARD   ★ ${def.rewardStars}   •   ● ${def.rewardCoins}`, {
      fontFamily: "Inter, system-ui",
      fontSize: "10px",
      fontStyle: "bold",
      color: "#e8cb79",
    });

    const powerCopy =
      level < 3 ? "Power Tools unlock from Level 3." :
      level < 5 ? "Refresh is available." :
      level < 7 ? "Refresh + Hammer are available." :
      "Refresh + Hammer + Row Clear are available.";

    this.add.text(36, 674, powerCopy, {
      fontFamily: "Inter, system-ui",
      fontSize: "8px",
      color: "#6e8f89",
    });

    button(this, W / 2, 746, W - 72, 52, `PLAY LEVEL ${level}  →`, () => {
      this.scene.start("PuzzleScene");
    }, COLORS.mintDark);
  }
}
