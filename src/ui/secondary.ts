import Phaser from 'phaser';
import { COLORS, gameIcon, panel, screenHeader, text } from '../ui';

/** Quiet shared surfaces let rewards and playable actions carry the emphasis. */
export function boardCard(scene: Phaser.Scene, y: number, height: number, reward = false) {
  return panel(scene, 195, y, 354, height, {
    fill: reward ? 0xfff7d6 : COLORS.panel,
    stroke: reward ? 0xffd45b : 0xb4ddf5,
    radius: 18, shadowAlpha: 0.13,
  });
}
export function boardLabel(scene: Phaser.Scene, y: number, title: string, detail = '') {
  text(scene, 22, y, title, 14, '#073a78', '800').setOrigin(0, .5);
  if (detail) text(scene, 367, y, detail, 11, '#315f88').setOrigin(1, .5);
}
export function rewardAmount(scene: Phaser.Scene, x: number, y: number, icon: string, value: number) {
  const root = scene.add.container(x, y);
  root.add([gameIcon(scene, 0, 0, icon, 22), text(scene, 16, 0, String(value), 14, '#123767', '800').setOrigin(0, .5)]);
  return root;
}

/** Secondary screens reserve the scenery for their own content. */
export function boardHeader(scene: Phaser.Scene, eyebrow: string, title: string, coins: number, stars: number) {
  const header = screenHeader(scene, eyebrow, title, coins, stars);
  header.ribbon.destroy();
  text(scene, 195, 132, eyebrow, 11, '#07518a', '800');
}

/** Rewards use the same sculpted icon in cards, dialogs and navigation. */
export function rewardArt(scene: Phaser.Scene, x: number, y: number, kind: 'chest' | 'trophy', size: number) {
  return gameIcon(scene, x, y, kind, size);
}
