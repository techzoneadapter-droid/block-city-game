import Phaser from 'phaser';
import { assetKey, sprite } from '../ui/assets';
import { cachedCanvas } from '../ui/art';
export type CityArt = 'house'|'coffee'|'market'|'tower'|'apartment'|'park'|'garden'|'boardwalk'|'lighthouse'|'wheel'|'tree'|'road'|'grass'|'palm'|'bridge'|'sailboat'|'bench'|'lamp'|'fence';
export function cityTexture(scene:Phaser.Scene,kind:CityArt,_stage=2) {
  const key=assetKey(scene,`city.${kind}`);
  if(!key) throw new Error(`City sprite not loaded: ${kind}`);
  return key;
}
/** Previews center in cards; world callers explicitly request bottom-center. */
export function cityAsset(scene:Phaser.Scene,x:number,y:number,kind:CityArt,width=80,height=75,_stage=2,ground=false) {
  return sprite(scene,x,y,`city.${kind}`,width,height,ground);
}
/** Simple water/ground geometry; all buildings and scenery are separate atlas sprites. */
export function cityPanorama(scene:Phaser.Scene,district:number) {
  return cachedCanvas(scene,`city-ground-${district}`,390,330,c=>{
    const sky=c.createLinearGradient(0,0,0,330);sky.addColorStop(0,'#69d9f6');sky.addColorStop(1,'#008bd3');c.fillStyle=sky;c.fillRect(0,0,390,330);
    for(let i=0;i<35;i++){c.fillStyle='#bdffff55';c.fillRect((i*97)%390,40+(i*53)%290,12,1);}
    const polygon=(points:number[][],color:string)=>{c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.closePath();c.fillStyle=color;c.fill();};
    polygon([[12,130],[190,54],[384,142],[384,225],[190,312],[12,216]],'#ab9572');
    polygon([[12,119],[190,43],[384,131],[384,214],[190,301],[12,205]],'#f4e6bd');
    polygon([[23,119],[190,53],[373,135],[373,207],[190,287],[23,199]],'#95d75b');
  });
}
