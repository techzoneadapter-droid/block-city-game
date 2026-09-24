import Phaser from "phaser";
import "./style.css";
import { HomeScene } from "./scenes/HomeScene";
import { PuzzleScene } from "./scenes/PuzzleScene";
import { CityScene } from "./scenes/CityScene";
import { DailyScene } from "./scenes/DailyScene";
import { ProgressScene } from "./scenes/ProgressScene";
import { EventScene } from "./scenes/EventScene";
import { CampaignScene } from "./scenes/CampaignScene";
import { H, W } from "./ui";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: W,
  height: H,
  backgroundColor: "#42bdf5",
  antialias: true,
  pixelArt: false,
  roundPixels: false,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 2,
    touch: {
      capture: true,
    },
  },
  render: {
    antialias: true,
    transparent: false,
    powerPreference: "high-performance",
  },
  scene: [HomeScene, CampaignScene, PuzzleScene, CityScene, DailyScene, ProgressScene, EventScene],
};

new Phaser.Game(config);
