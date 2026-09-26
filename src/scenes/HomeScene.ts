import { preloadAssets } from '../ui/assets';
import Phaser from "phaser";
import { createHome } from "../home/presentation";

/** Home owns asset loading; presentation uses the shared interactive UI kit. */
export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  preload() { preloadAssets(this, ['brand.', 'home.']); }

  create() {
    try {
      createHome(this);
      this.game.events.emit("block-city:home-ready");
    } catch (error) {
      this.game.events.emit("block-city:boot-error", error);
      throw error;
    }
  }
}
