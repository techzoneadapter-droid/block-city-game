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

/** Original cached toy reward illustrations, with a dark rim and warm bevel. */
export function rewardArt(scene: Phaser.Scene, x: number, y: number, kind: 'chest' | 'trophy', size: number) {
  const key = `secondary-reward-${kind}`;
  if (!scene.textures.exists(key)) {
    const texture = scene.textures.createCanvas(key, 200, 200)!;
    const c = texture.context;
    c.scale(2, 2);
    const shape = (path: string, top: string, bottom: string) => {
      const p = new Path2D(path);
      const gradient = c.createLinearGradient(0, 15, 0, 85);
      gradient.addColorStop(0, top); gradient.addColorStop(1, bottom);
      c.fillStyle = gradient; c.strokeStyle = '#713c13'; c.lineWidth = 2.4; c.lineJoin = 'round';
      c.fill(p); c.stroke(p);
    };
    c.fillStyle = '#0a487326'; c.beginPath(); c.ellipse(51, 85, 35, 7, 0, 0, Math.PI * 2); c.fill();
    if (kind === 'chest') {
      shape('M15 44 L80 44 L87 53 L87 78 L77 87 L17 81 Z', '#b87929', '#814519');
      shape('M14 46 L77 51 L77 83 L14 77 Z', '#ffa526', '#d66b0b');
      shape('M12 46 Q10 25 24 23 L73 23 Q85 26 87 45 L77 53 Z', '#ffe76a', '#f3a21a');
      shape('M25 24 L34 24 L31 49 L31 80 L23 79 L23 48 Z', '#fff592', '#ffc031');
      shape('M63 24 L71 24 L69 51 L69 83 L61 82 L61 50 Z', '#fff592', '#ffc031');
      shape('M43 47 L56 48 L56 66 L43 65 Z', '#67eaff', '#008bef');
      c.fillStyle = '#07518a'; c.fillRect(48, 53, 4, 8);
      c.strokeStyle = '#fff9c7'; c.lineWidth = 2.5; c.beginPath(); c.moveTo(17, 37); c.quadraticCurveTo(17, 28, 25, 28); c.lineTo(65, 28); c.stroke();
    } else {
      shape('M25 26 L12 26 Q9 53 33 54 L34 46 Q21 46 21 34 L29 34 Z', '#fff082', '#df8b12');
      shape('M75 26 L88 26 Q91 53 67 54 L66 46 Q79 46 79 34 L71 34 Z', '#fff082', '#df8b12');
      shape('M44 53 L56 53 L56 72 L68 77 L68 83 L32 83 L32 77 L44 72 Z', '#ffe76a', '#d78a0c');
      shape('M25 20 L75 20 L70 44 Q67 62 50 63 Q33 62 30 44 Z', '#fff480', '#ffb016');
      shape('M50 29 L54 38 L64 39 L57 46 L59 55 L50 50 L41 55 L43 46 L36 39 L46 38 Z', '#fffbb5', '#fff06a');
      c.strokeStyle = '#fffad5'; c.lineWidth = 3; c.beginPath(); c.moveTo(31, 25); c.lineTo(35, 42); c.stroke();
    }
    texture.refresh();
  }
  return scene.add.image(x, y, key).setDisplaySize(size, size);
}
