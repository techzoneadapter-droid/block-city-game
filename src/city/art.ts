import Phaser from 'phaser';
import { cachedCanvas } from '../ui/art';

/** Original coastal toy geometry. Shared by the live city and catalog previews. */
type Ctx = CanvasRenderingContext2D;
type Point = [number, number];
export type CityArt = 'house' | 'coffee' | 'market' | 'tower' | 'apartment' | 'park' | 'garden' | 'boardwalk' | 'lighthouse' | 'wheel' | 'tree' | 'road';
const poly = (c: Ctx, pts: Point[], fill: string, edge?: string) => {
  c.beginPath(); pts.forEach(([x,y],i) => i ? c.lineTo(x,y) : c.moveTo(x,y)); c.closePath();
  c.fillStyle=fill; c.fill(); if(edge){c.strokeStyle=edge;c.lineWidth=.6;c.stroke();}
};
const line = (c: Ctx, a: Point, b: Point, color: string, width=1) => {c.beginPath();c.moveTo(...a);c.lineTo(...b);c.strokeStyle=color;c.lineWidth=width;c.stroke();};
const ellipse = (c: Ctx,x:number,y:number,rx:number,ry:number,color:string) => {c.beginPath();c.ellipse(x,y,rx,ry,0,0,Math.PI*2);c.fillStyle=color;c.fill();};
function box(c:Ctx,x:number,y:number,w:number,d:number,h:number,front='#fff0c8',side='#d4af7e',top='#fffbe9') {
  poly(c,[[x,y-h],[x+w,y+w*.36-h],[x+w,y+w*.36],[x,y]],front);
  poly(c,[[x+w,y+w*.36-h],[x+w+d,y+(w-d)*.36-h],[x+w+d,y+(w-d)*.36],[x+w,y+w*.36]],side);
  poly(c,[[x,y-h],[x+d,y-d*.36-h],[x+w+d,y+(w-d)*.36-h],[x+w,y+w*.36-h]],top);
  const shade=c.createLinearGradient(x,y-h,x+w,y);shade.addColorStop(0,'#ffffff14');shade.addColorStop(1,'#0a487c18');
  c.fillStyle=shade;c.beginPath();c.moveTo(x,y-h);c.lineTo(x+w,y+w*.36-h);c.lineTo(x+w,y+w*.36);c.lineTo(x,y);c.fill();
  line(c,[x,y-h],[x+w,y+w*.36-h],'#ffffff99',.8);
}
function tree(c:Ctx,x:number,y:number,s=1) {
  c.save();c.translate(x,y);c.scale(s,s);ellipse(c,3,2,12,4,'#156b6f25');
  box(c,-2,0,4,3,21,'#ad682b','#77512d','#e1a259');
  [[-10,-15,10,9,12], [1,-18,10,8,14],[-5,-27,10,8,10]].forEach(([xx,yy,w,d,h],i)=>box(c,xx,yy,w,d,h,['#55c718','#31ad21','#8add1d'][i],'#198537','#adf13b'));
  c.restore();
}
function flowers(c:Ctx,x:number,y:number) {
  box(c,x,y,11,5,3,'#e5cea5','#bbaa8d','#6ecb28');
  for(let i=0;i<4;i++){ellipse(c,x+2+i*3,y-3+i*.6,1.5,1.6,i%2?'#fffde8':'#ff7655');}
}
function lamp(c:Ctx,x:number,y:number) {
  box(c,x-2,y,4,3,2,'#244467','#163951','#5b829b');line(c,[x+1,y],[x+1,y-19],'#254867',1.5);
  box(c,x-1,y-16,4,3,6,'#ffe277','#ffbc31','#233c5d');
  poly(c,[[x-3,y-23],[x+3,y-26],[x+7,y-23],[x+1,y-21]],'#224369');
}
function windows(c:Ctx,x:number,y:number,w:number,d:number,h:number) {
  const rows=Math.max(1,Math.floor((h-9)/13));
  for(let r=0;r<rows;r++)for(let col=0;col<3;col++) {
    const xx=x+4+col*(w-6)/3, yy=y-h+7+r*13+(xx-x)*.36;
    poly(c,[[xx,yy],[xx+5,yy+1.8],[xx+5,yy+10],[xx,yy+8.2]],'#fff9df');
    poly(c,[[xx+1,yy+1.5],[xx+4,yy+2.5],[xx+4,yy+8.4],[xx+1,yy+7.4]],'#0485d6');
    line(c,[xx+1.5,yy+2],[xx+1.5,yy+6],'#72eaff',1);
  }
  for(let r=0;r<rows;r++)for(let col=0;col<2;col++) {
    const xx=x+w+3+col*(d-4)/2, yy=y-h+w*.36-(xx-x-w)*.36+7+r*13;
    poly(c,[[xx,yy],[xx+4,yy-1.5],[xx+4,yy+6],[xx,yy+7.5]],'#147bbd');
    line(c,[xx,yy],[xx+4,yy-1.5],'#c0f5ff',1);
  }
}
function building(c:Ctx,kind:CityArt,stage=2) {
  const w=kind==='tower'?26:29,d=19;
  const h=kind==='tower'?58+stage*8:kind==='apartment'?45:kind==='house'?23:29+stage*4;
  ellipse(c,8,8,36,12,'#004c7e22');
  box(c,-28,2,49,29,5,'#e6cda7','#b5a183','#fff4dc');
  box(c,-25,0,43,24,2,'#6cbf33','#3a9f35','#a1df4b');
  const x=-18,y=-2;
  box(c,x,y,w,d,h,kind==='tower'?'#34a9ec':'#ffeac2',kind==='tower'?'#0877c8':'#e3b97f','#fff9de');
  windows(c,x,y,w,d,h);
  if(kind==='house') {
    poly(c,[[x-3,y-h],[x+12,y-h-18],[x+w+3,y-h+w*.36],[x+w/2,y-h+w*.18+1]],'#f94732','#ba3227');
    poly(c,[[x+12,y-h-18],[x+12+d,y-h-18-d*.36],[x+w+d+3,y-h+(w-d)*.36],[x+w+3,y-h+w*.36]],'#ff6b43','#c93427');
    for(let i=1;i<5;i++)line(c,[x+12+i*4,y-h-18+i*5],[x+12+d+i*4,y-h-18-d*.36+i*5],'#cc3327',.8);
    box(c,x+21,y-h-8,5,5,10,'#dc3d28','#ad2e28','#ff8a54');
    poly(c,[[x+12,y-13],[x+18,y-11],[x+18,y+6],[x+12,y+4]],'#92542b');
  } else {
    box(c,x-2,y-h+2,w+4,d+3,4,'#fff2d5','#d6c3a3','#ffffff');
    box(c,x+2,y-h-2,w-4,d-4,5,'#168fe9','#0765b6','#48c5ff');
    if(kind==='tower')box(c,x+7,y-h-8,12,11,9,'#d9f4ff','#328ec5','#ffffff');
    else {box(c,x+9,y-h-7,9,8,8,'#1688e5','#0865b3','#61ceff');windows(c,x+9,y-h-7,9,8,8);}
    line(c,[x+14,y-h-14],[x+14,y-h-26],'#f7f4de',1.5);
    poly(c,[[x+15,y-h-26],[x+24,y-h-23],[x+15,y-h-20]],'#ff593c');
    if(kind==='coffee'||kind==='market') {
      for(let i=0;i<6;i++) {
        const xx=x-2+i*5;
        poly(c,[[xx,y-16+i*1.8],[xx+5,y-14.2+i*1.8],[xx+1,y-6+i*1.8],[xx-4,y-7.8+i*1.8]],i%2?'#fffbef':'#f54838');
        poly(c,[[xx-4,y-7.8+i*1.8],[xx+1,y-6+i*1.8],[xx+1,y-3+i*1.8],[xx-4,y-4.8+i*1.8]],i%2?'#f6e6cc':'#d63027');
      }
      box(c,x+2,y-h+15,w-4,1,8,'#bb702f','#a2602c','#f5ab4d');
      c.save();c.transform(1,.36,0,1,x+14,y-h+13);c.font='bold 6px Arial';c.textAlign='center';c.fillStyle='#fffbdc';c.fillText(kind==='coffee'?'CAFÉ':'MARKET',0,0);c.restore();
    }
  }
  tree(c,-26,-2,.5);tree(c,28,0,.55);flowers(c,-14,12);flowers(c,16,14);
  if(kind==='coffee'||kind==='market') {
    line(c,[0,20],[0,8],'#8b6940',1);ellipse(c,0,9,8,3,'#fff9df');
    poly(c,[[-8,9],[0,3],[0,11]],'#ff5a37');poly(c,[[0,3],[8,9],[0,11]],'#ffcf42');
    box(c,-7,20,3,3,4,'#b16c30','#874b2e','#ffd07c');
  }
}
export function drawCityAsset(c:Ctx,kind:CityArt,x:number,y:number,scale=1,stage=2) {
  c.save();c.translate(x,y);c.scale(scale,scale);
  if(['house','coffee','market','tower','apartment'].includes(kind)) building(c,kind,stage);
  else if(kind==='tree') tree(c,0,0,1.5);
  else if(kind==='lighthouse') {
    box(c,-18,3,30,23,8,'#ccb993','#a48f7e','#9ad637');
    box(c,-8,0,16,13,55,'#fff9e3','#d2dce1','#ffffff');
    box(c,-10,-42,20,16,5,'#ef4932','#bd332a','#ff8e66');
    box(c,-7,-49,14,12,15,'#b2f5ff','#158ccc','#fff2dd');
    poly(c,[[-12,-65],[3,-80],[20,-69],[5,-61]],'#f64b35');
    for(let i=0;i<2;i++)box(c,-3,-10-i*18,4,1,8,'#1c93d3','#1585c1','#ffe1a8');
    tree(c,17,5,.6);flowers(c,-17,7);
  } else if(kind==='wheel') {
    const cy=-39,r=34;
    line(c,[-17,7],[0,cy],'#176ab0',6);line(c,[17,7],[0,cy],'#176ab0',6);
    line(c,[-17,5],[0,cy],'#f6fcff',4);line(c,[17,5],[0,cy],'#f6fcff',4);
    c.beginPath();c.ellipse(0,cy,r,r,0,0,Math.PI*2);c.strokeStyle='#fff';c.lineWidth=3;c.stroke();
    for(let i=0;i<12;i++){const a=i*Math.PI/6, xx=Math.cos(a)*r, yy=cy+Math.sin(a)*r;line(c,[0,cy],[xx,yy],'#eaffff',1.5);box(c,xx-3,yy+3,6,4,6,i%3?'#ff5042':'#199de5','#b93e38','#ffffff');}
    ellipse(c,0,cy,7,7,'#ffd329');ellipse(c,-2,cy-1,1,1,'#885d26');ellipse(c,2,cy-1,1,1,'#885d26');
  } else if(kind==='road') {
    box(c,-30,0,42,24,5,'#d9c6a7','#bca887','#eee8d7');
    poly(c,[[-28,-2],[-7,-10],[31,4],[10,12]],'#657e93');
    for(let i=0;i<3;i++)line(c,[-17+i*13,-2+i*4.7],[-11+i*13,.2+i*4.7],'#fff9dd',2);
  } else if(kind==='boardwalk') {
    for(let i=0;i<5+stage*2;i++)box(c,-26+i*5,i*1.8,5,23,5,'#c87c3a','#965b30','#f5b76c');
    [-25,14].forEach(xx=>{box(c,xx,xx*.36+13,4,4,17,'#b87637','#895328','#ffd286');lamp(c,xx,xx*.36-6);});
  } else {
    box(c,-28,3,45,28,5,'#e7cea7','#b4a180','#85d333');
    poly(c,[[-24,1],[-18,-1],[23,14],[16,16]],'#f6e2b2');
    tree(c,-16,0,.9);if(stage>=2)tree(c,15,2,.8);if(stage>=3)tree(c,2,-9,.75);
    if(stage>=2)box(c,-8,12,16,5,4,'#b67233','#74482b','#e6a24f');if(stage>=3)flowers(c,15,16);
    if(kind==='garden') {flowers(c,-23,8);flowers(c,5,12);}
  }
  c.restore();
}
export function cityAsset(scene:Phaser.Scene,x:number,y:number,kind:CityArt,width=80,height=75,stage=2) {
  const key=cachedCanvas(scene,`coastal-asset-${kind}-${stage}`,110,120,c=>{
    // Tall landmarks need headroom for roof flags and spires in every preview.
    const tall = kind === 'tower' || kind === 'lighthouse' || kind === 'wheel';
    drawCityAsset(c,kind,52,tall ? 100 : 91,tall ? .9 : 1.25,stage);
  });
  return scene.add.image(x,y,key).setDisplaySize(width,height);
}
export function boat(c:Ctx,x:number,y:number,s=1) {
  c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,3,19,5,'#8ef8ff88');
  poly(c,[[-15,-1],[17,0],[10,7],[-9,6]],'#fffce8');line(c,[-10,5],[11,5],'#087ac1',2);
  line(c,[0,0],[0,-31],'#aa8054',1);poly(c,[[-2,-28],[-13,-4],[-2,-3]],'#fffefa');
  poly(c,[[2,-30],[2,-4],[14,-6]],'#ff5b3d');poly(c,[[2,-24],[2,-17],[7,-18]],'#ffffff');c.restore();
}
export function cityPanorama(scene:Phaser.Scene,district:number) {
  return cachedCanvas(scene,`coastal-panorama-${district}`,390,330,c=>{
    const sky=c.createLinearGradient(0,0,0,344);sky.addColorStop(0,'#91e4ff');sky.addColorStop(.3,'#0aaee8');sky.addColorStop(1,'#087bdd');c.fillStyle=sky;c.fillRect(0,0,390,344);
    for(let i=0;i<110;i++){const x=(i*83)%390,y=45+(i*47)%300;line(c,[x,y],[x+3+i%8,y],'#c1f9ff55',i%3===0?1.5:.6);}
    // Distant terraced coastal islands, separated by a navigable blue channel.
    for(let i=0;i<25;i++){const x=i*19-20,y=25+Math.sin(i*.8)*16;box(c,x,y,14,12,10+i%3*8,'#e4ddba','#9dbead','#8eda69');box(c,x+3,y-13,9,9,7,'#d1d6b6','#9cbaad','#a0e178');tree(c,x+5,y-20,.32);}
    drawCityAsset(c,'lighthouse',329,43,.48);boat(c,210,63,.45);boat(c,367,111,.65);
    const shore:Point[]=[[-30,117],[136,54],[382,168],[399,220],[183,323],[-30,217]];
    poly(c,shore.map(([x,y])=>[x,y+15] as Point),'#b7a68d');poly(c,shore,'#f6e5bb');
    poly(c,[[-28,123],[136,65],[372,172],[373,211],[181,305],[-25,213]],'#8fd84d');
    // Small raised gardens break up the lawns without adding sprite overhead.
    for(const [x,y] of [[53,184],[196,252],[299,202],[85,134],[157,282]]) {box(c,x,y,14,9,2,'#65bb31','#419c3c','#ace64b');flowers(c,x+2,y-2);}
    for(let i=0;i<7;i++) {box(c,72+i*6,276+i*2.2,2,2,9,'#cf9655','#996636','#f6ce86');line(c,[74+i*6,272+i*2.2],[80+i*6,274+i*2.2],'#dcaa69',2);}
    // Two diagonal streets with paved sidewalks and zebra crossings.
    const road=(a:Point,b:Point)=>{line(c,a,b,'#fff4d8',25);line(c,a,b,'#b9c5c7',20);line(c,a,b,'#718797',15);c.setLineDash([6,6]);line(c,a,b,'#fff9d9',1);c.setLineDash([]);};
    road([-15,164],[286,290]);road([43,248],[335,133]);
    for(let i=0;i<5;i++)line(c,[149+i*3,222+i*1.2],[153+i*3,212+i*1.2],'#fffcec',1.7);
    // Quay masonry, mooring posts and harbor boardwalk.
    for(let i=0;i<16;i++){const x=185+i*13,y=322-i*6.1;box(c,x,y,9,6,11,i%2?'#dbcaaa':'#e7d7b7','#ac9e88','#fff0d0');if(i%3===0)lamp(c,x+3,y-11);}
    drawCityAsset(c,'boardwalk',340,255,.85);
    // Bridge extends into the foreground. Arched shadows sit behind cream piers.
    line(c,[-15,273],[103,229],'#aeb5ac',22);line(c,[-15,265],[103,221],'#fff0ce',19);line(c,[-15,265],[103,221],'#8e9fa7',10);
    for(let i=0;i<5;i++){const x=4+i*23,y=267-i*8.7;box(c,x,y+27,7,8,31,'#ecdbb9','#b9ac96','#fff8df');line(c,[x,y-4],[x+17,y-10],'#fff3d4',3);lamp(c,x+3,y-2);}
    const objects:Array<{y:number;draw:()=>void}>=[];
    const asset=(kind:CityArt,x:number,y:number,s:number,stage=2)=>objects.push({y,draw:()=>drawCityAsset(c,kind,x,y,s,stage)});
    asset('lighthouse',53,98,.67);asset('house',104,114,.66);asset('apartment',170,121,.78);
    asset(district===3?'tower':'apartment',220,144,.82,3);asset('market',275,166,.66);
    asset('apartment',132,155,.7);asset('house',23,150,.7);asset('house',82,166,.7);asset('apartment',28,207,.7);
    asset(district===3?'tower':'house',112,248,.78);asset('market',256,254,.8);
    asset('wheel',326,213,.95);asset('coffee',324,281,.66);
    [[1,115],[77,105],[142,91],[198,110],[253,131],[311,159],[362,194],[8,232],[57,221],[154,277],[211,291],[292,279],[376,240],[234,211],[91,197]].forEach(([x,y],i)=>objects.push({y,draw:()=>tree(c,x,y,.5+i%3*.12)}));
    for(let i=0;i<12;i++){const x=15+i*24,y=178+i*10;objects.push({y,draw:()=>{if(i%2===0)lamp(c,x,y);else {ellipse(c,x,y,2,1,'#17566d44');line(c,[x,y],[x,y-5],'#0a548b',2);ellipse(c,x,y-7,1.7,2,'#ffd096');}}});}
    for(const [x,y] of [[298,225],[355,243],[231,278]])objects.push({y,draw:()=>{line(c,[x,y],[x-2,y-26],'#b98138',3);for(let i=0;i<5;i++){const a=i*1.2;poly(c,[[x-2,y-26],[x+Math.cos(a)*10,y-33],[x+Math.cos(a)*17,y-21],[x+Math.cos(a)*7,y-26]],i%2?'#3bb329':'#88dc27');}}});
    objects.sort((a,b)=>a.y-b.y).forEach(o=>o.draw());
    // Two compact cars follow the street's perspective.
    for(const [x,y,color] of [[67,198,'#ffcf25'],[263,164,'#22b9ff']] as [number,number,string][]) {ellipse(c,x+4,y+2,9,3,'#194d6555');box(c,x-5,y,12,6,4,color,'#1175ad','#fff1a3');box(c,x-2,y-4,6,5,4,'#92e5ff','#127caf',color);ellipse(c,x-2,y+1,2,2,'#294769');ellipse(c,x+5,y+4,2,2,'#294769');}
    boat(c,121,314,.85);boat(c,35,322,.65);boat(c,363,318,.9);
    // Bright foreground framing foliage, never obscuring the interactive lots.
    tree(c,1,331,1.1);tree(c,387,340,1.05);
  });
}
