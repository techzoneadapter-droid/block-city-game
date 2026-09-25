import Phaser from "phaser";
import { addGradientBackground, button, COLORS, drawBuilding, drawIsoTile, pill, text, W, H } from "../ui";
import { loadSave } from "../save";
import { localDateKey } from "../retention";
import { profileLevelFromXp } from "../progression";
import { getWeeklyEvent } from "../event";
import { avatar, icon, makeArtButton, preloadHome, uiFrame, artImage } from "../art/blockCityArt";

export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  preload() {
    preloadHome(this);
  }

  create() {
    const save = loadSave();
    const profile = profileLevelFromXp(save.xp);
    const weeklyEvent = getWeeklyEvent();
    this.cameras.main.setBackgroundColor("#55c9f2");

    const sky = this.add.graphics();
    sky.fillGradientStyle(0x1aa7ea, 0x168fd5, 0xe9f8ff, 0xc7edf7);
    sky.fillRect(0, 0, W, H);
    this.add.circle(72, 92, 90, 0xffffff, 0.12);
    this.add.circle(336, 210, 130, 0xffffff, 0.1);

    const header = this.add.container(0, 0);
    header.add(avatar(this, "boy-happy", 34, 38, 52));
    header.add(this.add.text(67, 22, "Builder", {
      fontFamily: "Arial, sans-serif", fontSize: "15px", fontStyle: "bold", color: "#ffffff",
    }));
    header.add(this.add.text(67, 42, `LEVEL ${profile.level}`, {
      fontFamily: "Arial, sans-serif", fontSize: "9px", fontStyle: "bold", color: "#d9fbff",
    }));

    uiFrame(this, "resource-chip", 240, 33, 112, 36);
    icon(this, "coin", 203, 33, 30);
    this.add.text(252, 33, String(save.coins), {
      fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#ffffff",
    }).setOrigin(0.5);
    icon(this, "star", 315, 33, 28);
    this.add.text(345, 33, String(save.stars), {
      fontFamily: "Arial, sans-serif", fontSize: "16px", fontStyle: "bold", color: "#ffffff",
    }).setOrigin(0.5);
    const settings = icon(this, "settings", 363, 34, 38).setInteractive({ useHandCursor: true });
    settings.on("pointerup", () => this.scene.start("ProgressScene"));

    const logo = artImage(this, "bc-logo", undefined, W / 2, 157, 318, 212);
    logo.setDepth(2);

    const city = artImage(this, "bc-hero", undefined, W / 2, 418, 370, 370);
    city.setDepth(1);
    this.tweens.add({ targets: city, y: 414, duration: 2500, yoyo: true, repeat: -1, ease: "Sine.InOut" });

    // Small ambient glints make the fixed illustration feel alive without altering game state.
    const glints = [
      [94, 390, 0.6], [304, 420, 0.9], [180, 493, 0.8], [250, 522, 0.7],
    ].map(([x, y, delay]) => {
      const sparkle = this.add.text(x, y, "✦", { fontFamily: "Arial", fontSize: "13px", color: "#ffffff" }).setOrigin(0.5).setAlpha(0.15);
      this.tweens.add({ targets: sparkle, alpha: 0.9, scale: 1.25, duration: 950, delay: delay * 400, yoyo: true, repeat: -1, ease: "Sine.InOut" });
      return sparkle;
    });
    void glints;

    const play = makeArtButton(this, {
      x: W / 2, y: 642, width: 282, height: 82, label: "PLAY", frame: "ui/button-gold",
      icon: "play", textColor: "#073b77", fontSize: 29,
      onClick: () => this.scene.start("CampaignScene"),
    });
    play.setDepth(3);

    this.add.text(W / 2, 699, "BUILD  •  PUZZLE  •  GROW", {
      fontFamily: "Arial, sans-serif", fontSize: "10px", fontStyle: "bold", color: "#075394",
    }).setOrigin(0.5).setDepth(4);

    const navPanel = uiFrame(this, "panel-blue", W / 2, 783, 382, 100).setAlpha(0.98);
    navPanel.setDepth(4);
    const dailyReady = save.lastCheckinDate !== localDateKey();
    const nextEventMilestone = weeklyEvent.milestones.find((milestone, index) => !save.eventClaims.includes(index))?.points ?? weeklyEvent.target;
    const eventReady = save.eventPoints >= nextEventMilestone;
    const items = [
      { key: "home", label: "HOME", icon: "build", selected: true, action: () => this.scene.start("HomeScene") },
      { key: "puzzle", label: "PUZZLE", icon: "puzzle", action: () => this.scene.start("PuzzleScene") },
      { key: "city", label: "CITY", icon: "map", action: () => this.scene.start("CityScene") },
      { key: "campaign", label: "CAMPAIGN", icon: "play", action: () => this.scene.start("CampaignScene") },
      { key: "daily", label: "DAILY", icon: "gift", badge: dailyReady, action: () => this.scene.start("DailyScene") },
      { key: "event", label: "EVENT", icon: "trophy", badge: eventReady, action: () => this.scene.start("EventScene") },
      { key: "profile", label: "PROFILE", icon: "settings", action: () => this.scene.start("ProgressScene") },
    ];
    const startX = 28;
    const gap = 56;
    items.forEach((item, index) => {
      const x = startX + index * gap;
      const button = this.add.container(x, 782).setSize(52, 82).setInteractive({ useHandCursor: true });
      const skin = this.add.image(0, 0, "bc-ui", item.selected ? "ui/button-blue--selected" : "ui/button-square").setDisplaySize(52, 52);
      const itemIcon = this.add.image(0, -4, "bc-icons", `icons/${item.icon}`).setDisplaySize(28, 28);
      const label = this.add.text(0, 28, item.label, { fontFamily: "Arial, sans-serif", fontSize: "7px", fontStyle: "bold", color: "#ffffff" }).setOrigin(0.5);
      button.add([skin, itemIcon, label]);
      button.setDepth(5);
      if (item.badge) {
        button.add(this.add.circle(18, -20, 8, 0xef3f4b, 1).setStrokeStyle(1, 0xffffff, 0.8));
      }
      button.on("pointerover", () => this.tweens.add({ targets: button, scale: 1.06, duration: 90 }));
      button.on("pointerout", () => this.tweens.add({ targets: button, scale: 1, duration: 90 }));
      button.on("pointerup", item.action);
    });

    const subtitle = this.add.text(W / 2, 742, "Every block builds your city", {
      fontFamily: "Arial, sans-serif", fontSize: "10px", fontStyle: "bold", color: "#075394",
    }).setOrigin(0.5);
    subtitle.setAlpha(0.85);
  }
}
