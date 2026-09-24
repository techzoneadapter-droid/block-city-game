import Phaser from "phaser";
import { drawCharacterTexture, drawAccessoryTexture } from "./art/characters";
import { BUILDING_NAMES, ENVIRONMENT_NAMES, drawBuildingTexture, drawEnvironmentTexture } from "./art/buildings";
import { UI_ART_NAMES, drawUiTexture } from "./art/uiKit";

/**
 * Procedural-art compatibility adapter.
 *
 * Historical call sites still use referenceArt(...) as a semantic asset lookup,
 * but this module no longer loads, crops, samples or draws any supplied reference
 * image. Every returned texture is generated from original Canvas/vector drawing.
 */
const CHARACTER_ROLES = new Set([
  "builder", "planner", "worker", "chef", "mechanic", "sailor", "tourist", "corgi",
]);

const ACCESSORIES = new Set([
  "builder-cap", "backpack", "blueprint", "laptop", "pencil",
  "worker-toolbox", "cake", "wrench", "tool-belt", "binoculars",
  "camera", "map", "collar", "bone", "chef-hat", "sailor-hat",
]);

function isCharacter(name: string) {
  const role = name.split("-")[0];
  if (!CHARACTER_ROLES.has(role)) return false;
  return name === role ||
    name.includes("-body") ||
    name.includes("-wink") ||
    name.includes("-excited") ||
    name.includes("-surprised") ||
    name.includes("-calm") ||
    name.includes("-thinking");
}

function textureSize(name: string): [number, number] {
  if (name === "logo") return [420, 180];
  if (name.endsWith("-body")) return [210, 280];
  if (isCharacter(name)) return [150, 150];
  if (BUILDING_NAMES.has(name)) return [220, 240];
  if (ENVIRONMENT_NAMES.has(name)) return [180, 180];
  if (name.startsWith("panel-")) return [280, 132];
  if (name.endsWith("-coast")) return [360, 132];
  return [128, 128];
}

function known(name: string) {
  return isCharacter(name) ||
    ACCESSORIES.has(name) ||
    BUILDING_NAMES.has(name) ||
    ENVIRONMENT_NAMES.has(name) ||
    UI_ART_NAMES.has(name);
}

function ensureTexture(scene: Phaser.Scene, name: string): string | undefined {
  if (!known(name)) return undefined;
  const key = `original-art-${name}`;
  if (scene.textures.exists(key)) return key;

  const [width, height] = textureSize(name);
  const texture = scene.textures.createCanvas(key, width, height);
  if (!texture) return undefined;
  const ctx = texture.context;

  if (isCharacter(name)) {
    drawCharacterTexture(ctx, name, width, height);
  } else if (ACCESSORIES.has(name)) {
    drawAccessoryTexture(ctx, name, width, height);
  } else if (BUILDING_NAMES.has(name)) {
    drawBuildingTexture(ctx, name, width, height);
  } else if (ENVIRONMENT_NAMES.has(name)) {
    drawEnvironmentTexture(ctx, name, width, height);
  } else {
    drawUiTexture(ctx, name, width, height);
  }

  texture.refresh();
  return key;
}

/** Kept for old scene lifecycle compatibility. No external art is loaded. */
export function preloadReferenceArt(_scene: Phaser.Scene) {}

/** Warm commonly reused original textures once at startup when requested. */
export function prepareReferenceTextures(scene: Phaser.Scene) {
  [
    "logo", "builder", "planner", "worker", "chef", "mechanic", "sailor", "tourist", "corgi",
    "house", "coffee", "apartment", "office", "cafe", "park", "garden", "market", "tower",
    "tree", "palm", "bridge", "lighthouse", "wheel", "sailboat",
    "hammer", "shuffle", "line", "hat", "puzzle", "shop", "friends", "map", "coin", "settings", "chest",
  ].forEach((name) => ensureTexture(scene, name));
}

export function referenceArt(
  scene: Phaser.Scene,
  x: number,
  y: number,
  name: string,
  width: number,
  height = width,
) {
  const key = ensureTexture(scene, name);
  if (!key) return undefined;
  return scene.add.image(x, y, key).setDisplaySize(width, height);
}

/** Canvas gradients keep buttons smooth and consistent across WebGL/Canvas. */
export function glossyFace(
  scene: Phaser.Scene,
  width: number,
  height: number,
  radius: number,
  top: number,
  bottom: number,
) {
  const key = `gloss-${width}-${height}-${radius}-${top}-${bottom}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, width * 2, height * 2)!;
    const ctx = texture.context;
    ctx.scale(2, 2);
    const hex = (value: number) => `#${value.toString(16).padStart(6, "0")}`;
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    gradient.addColorStop(0, hex(top));
    gradient.addColorStop(1, hex(bottom));
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(1, 1, width - 2, height - 2, radius);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,.8)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(3, 3, width - 6, height - 6, Math.max(2, radius - 2));
    ctx.stroke();
    texture.refresh();
  }
  return scene.add.image(0, 0, key).setDisplaySize(width, height);
}
