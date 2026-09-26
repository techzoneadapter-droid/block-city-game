import Phaser from 'phaser';
import { assetKey } from '../ui/assets';
export const CAST = ['builder','planner','worker','chef','mechanic','sailor','tourist','corgi'] as const;
export type Expression = 'happy'|'wink'|'thinking'|'focused'|'excited'|'laughing'|'surprised';
export function characterTexture(scene: Phaser.Scene,id: string,body=false,_expression:Expression='happy') {
  return assetKey(scene,`character.${body?'full':'portrait'}.${id}`);
}
export function characterAsset(scene: Phaser.Scene,name: string) {
  const accessory=assetKey(scene,`character.accessory.${name}`);
  if(accessory)return accessory;
  const [id,suffix]=name.split('-');
  if(suffix==='cap')return assetKey(scene,'character.accessory.hat') ?? assetKey(scene,'nav.hat');
  if (CAST.includes(id as typeof CAST[number])) return characterTexture(scene,id,suffix==='body');
  return assetKey(scene,`character.accessory.${name}`);
}
