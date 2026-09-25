import Phaser from "phaser";

export const ART_BASE = "assets/block-city-ui";

export function preloadHome(scene: Phaser.Scene) {
  if (!scene.textures.exists("bc-ui")) {
    scene.load.atlas("bc-ui", `${ART_BASE}/atlases/ui.png`, `${ART_BASE}/atlases/ui.json`);
  }
  if (!scene.textures.exists("bc-icons")) {
    scene.load.atlas("bc-icons", `${ART_BASE}/atlases/icons.png`, `${ART_BASE}/atlases/icons.json`);
  }
  if (!scene.textures.exists("bc-avatars")) {
    scene.load.atlas("bc-avatars", `${ART_BASE}/atlases/avatars.png`, `${ART_BASE}/atlases/avatars.json`);
  }
  if (!scene.textures.exists("bc-logo")) {
    scene.load.image("bc-logo", `${ART_BASE}/sprites/logo/logo.png`);
  }
  if (!scene.textures.exists("bc-hero")) {
    scene.load.image("bc-hero", `${ART_BASE}/sprites/hero/hero-city.png`);
  }
}

export function preloadPuzzle(scene: Phaser.Scene) {
  preloadHome(scene);
  if (!scene.textures.exists("bc-puzzle")) {
    scene.load.atlas("bc-puzzle", `${ART_BASE}/atlases/puzzle.png`, `${ART_BASE}/atlases/puzzle.json`);
  }
}

export function preloadCity(scene: Phaser.Scene) {
  preloadHome(scene);
  if (!scene.textures.exists("bc-city")) {
    scene.load.atlas("bc-city", `${ART_BASE}/atlases/city.png`, `${ART_BASE}/atlases/city.json`);
  }
}

export function artImage(
  scene: Phaser.Scene,
  texture: string,
  frame: string | undefined,
  x: number,
  y: number,
  width: number,
  height = width,
) {
  const image = scene.add.image(x, y, texture, frame);
  image.setDisplaySize(width, height);
  return image;
}

export function icon(
  scene: Phaser.Scene,
  name: string,
  x: number,
  y: number,
  size = 30,
) {
  return artImage(scene, "bc-icons", `icons/${name}`, x, y, size, size);
}

export function uiFrame(
  scene: Phaser.Scene,
  name: string,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  return artImage(scene, "bc-ui", `ui/${name}`, x, y, width, height);
}

export function avatar(
  scene: Phaser.Scene,
  name = "boy-happy",
  x: number,
  y: number,
  size = 52,
) {
  return artImage(scene, "bc-avatars", `avatars/${name}`, x, y, size, size);
}

export function makeArtButton(
  scene: Phaser.Scene,
  options: {
    x: number;
    y: number;
    width: number;
    height: number;
    label: string;
    frame?: string;
    icon?: string;
    textColor?: string;
    fontSize?: number;
    onClick?: () => void;
  },
) {
  const {
    x,
    y,
    width,
    height,
    label,
    frame = "ui/button-blue",
    icon: iconName,
    textColor = "#ffffff",
    fontSize = 16,
    onClick,
  } = options;
  const container = scene.add.container(x, y);
  const skin = scene.add.image(0, 0, "bc-ui", frame).setDisplaySize(width, height);
  const labelX = iconName ? width * 0.07 : 0;
  const labelText = scene.add.text(labelX, 0, label, {
    fontFamily: "Arial, sans-serif",
    fontSize: `${fontSize}px`,
    fontStyle: "bold",
    color: textColor,
    stroke: textColor === "#ffffff" ? "#0a4a8b" : "#ffffff",
    strokeThickness: textColor === "#ffffff" ? 1 : 0,
  }).setOrigin(0.5);
  container.add([skin]);
  if (iconName) {
    container.add(scene.add.image(-width * 0.28, 0, "bc-icons", `icons/${iconName}`).setDisplaySize(height * 0.52, height * 0.52));
  }
  container.add(labelText);
  container.setSize(width, height).setInteractive({ useHandCursor: true });
  container.on("pointerover", () => scene.tweens.add({ targets: container, scaleX: 1.025, scaleY: 1.025, duration: 90 }));
  container.on("pointerout", () => scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90 }));
  container.on("pointerdown", () => scene.tweens.add({ targets: container, scaleX: 0.97, scaleY: 0.97, duration: 60 }));
  container.on("pointerup", () => {
    scene.tweens.add({ targets: container, scaleX: 1, scaleY: 1, duration: 90 });
    onClick?.();
  });
  return container;
}
