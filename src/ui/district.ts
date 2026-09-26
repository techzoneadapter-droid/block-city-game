import Phaser from 'phaser';
import { assetPanel } from './assets';
/** Atlas 09 geometry only. All labels, costs, stats and timers are live scene data. */
export const DistrictHeader = (s:Phaser.Scene,x:number,y:number,w:number,h:number) => assetPanel(s,x,y,w,h,'district.header');
export const DistrictStatCard = (s:Phaser.Scene,x:number,y:number,w:number,h:number) => assetPanel(s,x,y,w,h,'district.stat');
export const BuildingCard = (s:Phaser.Scene,x:number,y:number,w:number,h:number) => assetPanel(s,x,y,w,h,'district.card');
export const ConstructionQueue = (s:Phaser.Scene,x:number,y:number,w:number,h:number) => assetPanel(s,x,y,w,h,'district.queue');
export const DailyTaskPanel = (s:Phaser.Scene,x:number,y:number,w:number,h:number) => assetPanel(s,x,y,w,h,'district.tasks');
export const DistrictTab = (s:Phaser.Scene,x:number,y:number,w:number,h:number,selected=false) => assetPanel(s,x,y,w,h,selected?'district.tabSelected':'district.tab');
