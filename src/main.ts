import Phaser from "phaser";
import "./style.css";
import { HomeScene } from "./scenes/HomeScene";
import { PuzzleScene } from "./scenes/PuzzleScene";
import { CityScene } from "./scenes/CityScene";
import { H, W } from "./ui";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: "app",
  width: W,
  height: H,
  backgroundColor: "#07131b",
  antialias: true,
  pixelArt: false,
  roundPixels: true,
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    activePointers: 3,
    touch: {
      capture: true,
    },
  },
  render: {
    antialias: true,
    transparent: false,
    powerPreference: "high-performance",
  },
  scene: [HomeScene, PuzzleScene, CityScene],
};

new Phaser.Game(config);
