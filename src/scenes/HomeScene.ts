import Phaser from "phaser";
import { createHome } from "../home/presentation";

/**
 * HomeScene delegates the full visible Home UI to the new runtime presentation
 * layer. This makes the current main branch actually render the rebuilt Home
 * instead of the legacy reference-image based scene.
 */
export class HomeScene extends Phaser.Scene {
  constructor() {
    super("HomeScene");
  }

  create() {
    createHome(this);
  }
}
