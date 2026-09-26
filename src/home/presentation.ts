import Phaser from 'phaser';
import { COLORS, button, gameSettings, homeNavigation, playerHud, text } from '../ui';
import { BlockCityLogo } from '../ui/logo';
import { sprite } from '../ui/assets';
import { coastTexture } from './art';
export function createHome(scene: Phaser.Scene) {
  const motion = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  scene.cameras.main.fadeIn(motion ? 180 : 0, 7,54,103);
  scene.add.image(195,422,coastTexture(scene)).setDisplaySize(390,844);
  const hero = sprite(scene,195,463,'home.harborScene',386,300).setName('home-harbor');
  const logo = BlockCityLogo(scene,195,218,340,'home');
  if (motion) scene.tweens.add({targets:[hero,logo],y:'-=2',duration:3200,yoyo:true,repeat:-1,ease:'Sine.InOut'});
  playerHud(scene,()=>gameSettings(scene),()=>true,'home');
  text(scene,195,602,'YOUR NEXT ADVENTURE STARTS HERE',12,'#ffffff','800').setStroke('#0873b1',2);
  const play=button(scene,195,680,304,100,"PLAY",()=>scene.scene.start("CampaignScene"),COLORS.gold,'gold').setName('home-play');
  play.list.forEach(child => (child as Phaser.GameObjects.Image).setVisible(false));
  play.add(sprite(scene,0,0,'home.play',304,100));
  // Keep the shared button's press/release handler and live hit area.
  homeNavigation(scene);
}
