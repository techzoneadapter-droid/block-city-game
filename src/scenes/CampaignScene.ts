import Phaser from "phaser";
import { bottomNavigation, coastalBackdrop, button, COLORS, gameIcon, panel, progressBar, screenHeader, text, W } from "../ui";
import { CHAPTERS, getChapterForLevel, getLevelDefinition, TOTAL_CAMPAIGN_LEVELS } from "../levels";
import { loadSave } from "../save";
import { VOXEL_BIOMES, createFerrisWheel, createVoxelBoat, createVoxelBridge, createVoxelBuilding, createVoxelTree, voxelGroundTile } from "../voxelArt";

const CHAPTER_COLORS = [0x4dcc79, 0x28c9df, 0x7898ed, 0xd98aff, 0x81d657, 0xffcc4c];

export class CampaignScene extends Phaser.Scene {
  constructor() { super("CampaignScene"); }

  create() {
    coastalBackdrop(this);
    const save = loadSave();
    const chapter = getChapterForLevel(save.level);
    const definition = getLevelDefinition(save.level);
    const complete = save.level > TOTAL_CAMPAIGN_LEVELS;
    screenHeader(this, "CITY JOURNEY • 30 LEVELS", complete ? "Your city keeps growing" : chapter.name, save.coins, save.stars);

    // Six chapter badges retain the existing progression, without adding replay rules.
    CHAPTERS.forEach((item, i) => {
      const x = 42 + i * 61;
      const done = save.level > item.endLevel;
      const active = chapter.id === item.id;
      const badge = panel(this, x, 151, 48, 40, { fill: active ? COLORS.primary : done ? COLORS.mintDark : 0x91b8cd, stroke: active ? 0xffffff : 0xb8e7f8, radius: 13 });
      badge.add(text(this, 0, -1, done ? '✓' : String(item.id), 17, '#ffffff'));
    });

    // One large voxel district instead of a flat rounded board.
    const theme = [VOXEL_BIOMES.grass, VOXEL_BIOMES.water, VOXEL_BIOMES.desert, VOXEL_BIOMES.ice, VOXEL_BIOMES.volcano, VOXEL_BIOMES.cave][chapter.id - 1];
    voxelGroundTile(this, W / 2, 354, 344, 246, theme.ground, theme.groundDark).setDepth(1);
    [[59,296],[331,300],[75,430],[314,443],[192,479]].forEach(([x,y],i)=>{
      voxelGroundTile(this,x,y,74-(i%2)*8,48-(i%2)*4,i%2?theme.ground:theme.accent,theme.groundDark).setDepth(2);
    });
    const environment=this.add.graphics().setDepth(2);
    if(chapter.id===2){
      environment.fillStyle(0x17b6e8,0.92).fillPoints([{x:35,y:333},{x:174,y:402},{x:352,y:318},{x:226,y:260}],true);
      for(let i=0;i<6;i++) environment.fillStyle(0xffffff,0.16).fillRect(65+i*45,330+(i%3)*27,30,2);
      createVoxelBridge(this,245,392,112,.58).setDepth(395);
      createVoxelBoat(this,310,365,.55).setDepth(368);
    } else if(chapter.id===4){
      environment.fillStyle(0xe6fbff,0.72).fillPoints([{x:38,y:315},{x:193,y:232},{x:352,y:315},{x:195,y:405}],true);
      [56,315].forEach((x,i)=>environment.fillStyle(0xb8efff,0.8).fillTriangle(x,355,x+20,300-i*20,x+42,355));
    } else if(chapter.id===5){
      environment.fillStyle(0x30282d,0.95).fillPoints([{x:42,y:320},{x:190,y:242},{x:348,y:320},{x:196,y:405}],true);
      environment.lineStyle(10,0xff5a21,0.95).lineBetween(85,365,184,315).lineBetween(184,315,303,377);
      environment.lineStyle(4,0xffcb38,0.9).lineBetween(87,365,185,316).lineBetween(185,316,300,376);
    } else if(chapter.id===6){
      [65,135,274,326].forEach((x,i)=>{ const col=[0x5be9ee,0xb06cf3,0xff69b5,0x65dc8a][i]; environment.fillStyle(col,0.82).fillTriangle(x,390,x+13,345-(i%2)*18,x+28,390); });
    } else if(chapter.id===3){
      environment.fillStyle(0xe3b36c,0.7).fillTriangle(30,400,105,285,180,400).fillTriangle(215,400,305,275,380,400);
    }

    this.chapterScenery(chapter.id);
    [[42, 266], [345, 390], [175, 219], [37, 463]].forEach(([x, y], i) => createVoxelTree(this, x, y, 0.48 + (i%2)*0.05, chapter.id === 4 ? 'ice' : chapter.id === 5 ? 'volcano' : chapter.id === 3 ? 'desert' : 'grass'));
    const points = [[83, 421], [167, 360], [84, 293], [198, 270], [294, 333]];
    const road = this.add.graphics().setDepth(700);
    [ [24, 0x367969], [19, 0xc09d6c], [14, 0xffedc3], [2, 0xffffff] ].forEach(([width, color]) => {
      road.lineStyle(width, color, 1).beginPath().moveTo(points[0][0], points[0][1]);
      points.slice(1).forEach(([x, y]) => road.lineTo(x, y)); road.strokePath();
    });
    points.forEach(([x, y], i) => {
      const level = chapter.startLevel + i;
      const done = level < save.level;
      const active = level === save.level;
      const locked = !done && !active;
      const color = active ? COLORS.gold : done ? COLORS.mintDark : 0x7399b4;
      this.add.circle(x, y + 7, active ? 33 : locked ? 22 : 27, 0x0b5275, 0.45).setDepth(790);
      const node = this.add.circle(x, y, active ? 33 : locked ? 22 : 27, color).setStrokeStyle(3, 0xffffff).setDepth(800);
      this.add.arc(x, y, locked ? 17 : 22, 210, 310, false, 0xffffff, 0).setStrokeStyle(3, 0xffffff, 0.45).setDepth(801);
      if (locked) gameIcon(this, x, y, 'lock', 23).setDepth(805);
      else text(this, x, y, String(level), 22, active ? '#153863' : '#ffffff').setDepth(805);
      if (done) {
        panel(this, x, y + 35, 58, 21, { fill: 0x136759, stroke: 0xffd655, radius: 10, shadow: false }).setDepth(810);
        text(this, x, y + 35, '★'.repeat(save.campaignMedals[String(level)] || 1), 14, '#ffe477').setDepth(811);
      }
      if (i === 4) { gameIcon(this, x + 27, y - 26, 'trophy', 27).setDepth(812); }
      if (i === 4) text(this, x, y + (done ? 60 : 44), 'FINALE', 11, '#123767').setBackgroundColor('#fff1b8').setPadding(6, 3).setDepth(812);
      if (active) {
        const next = text(this, x, y - 41, 'PLAY', 12, '#ffffff').setBackgroundColor('#f07326').setPadding(9, 4).setDepth(820);
        node.setInteractive({ useHandCursor: true }).on('pointerup', () => this.scene.start('PuzzleScene'));
        this.tweens.add({ targets: next, y: y - 45, duration: 750, yoyo: true, repeat: -1 });
      }
    });
    const cleared = Math.min(5, Math.max(0, save.level - chapter.startLevel));
    panel(this, W / 2, 521, 280, 35, { fill: 0xffffff, radius: 13 });
    text(this, 98, 520, `${cleared}/5 built`, 12);
    progressBar(this, 145, 521, 172, cleared / 5, COLORS.mint, 12);

    panel(this, W / 2, 620, 354, 137, { fill: COLORS.cream, stroke: definition.milestone ? COLORS.gold : COLORS.outline, radius: 21 });
    gameIcon(this, 52, 580, definition.milestone ? 'trophy' : 'puzzle', 43);
    text(this, 220, 567, `${complete ? 'MASTER' : 'LEVEL'} ${save.level} • ${definition.difficulty}`, 12, '#2674a8');
    const name = text(this, 220, 592, definition.label, 18);
    if (name.width > 263) name.setFontSize(15);
    const goals = [`${definition.targetLines} lines`];
    if (definition.targetPlacements) goals.push(`${definition.targetPlacements} blocks`);
    if (definition.targetCombo) goals.push(`Combo ${definition.targetCombo}`);
    if (definition.specialCells?.length) goals.push(`${definition.specialCells.length} debris`);
    if (definition.iceCells?.length) goals.push(`${definition.iceCells.length} ice`);
    text(this, W / 2, 623, goals.join(' • '), 12).setWordWrapWidth(310);
    text(this, W / 2, 662, `★ ${definition.rewardStars}   ● ${definition.rewardCoins}   •   Score ${definition.scoreTarget}`, 13, '#956112');
    button(this, W / 2, 724, 314, 52, `PLAY ${complete ? 'MASTER ' : ''}LEVEL ${save.level}  ▶`, () => this.scene.start('PuzzleScene'), COLORS.gold, 'gold');
    bottomNavigation(this, 'CampaignScene');
  }
  private chapterScenery(chapter: number) {
    const configs: Record<number, Array<[number, number, "house"|"cafe"|"market"|"apartment"|"office"|"tower"|"lighthouse", number, number]>> = {
      1: [[252,236,'house',2,.72],[325,269,'cafe',2,.62],[252,415,'house',2,.68]],
      2: [[280,243,'market',2,.84],[240,415,'cafe',2,.56],[325,452,'house',1,.48]],
      3: [[239,232,'apartment',2,.66],[317,250,'tower',2,.72],[252,400,'office',2,.62]],
      4: [[249,237,'office',2,.7],[326,258,'apartment',2,.62],[253,414,'cafe',2,.66]],
      5: [[287,246,'tower',1,.65],[259,405,'house',2,.65],[216,225,'house',1,.5]],
      6: [[249,237,'tower',3,.72],[334,262,'lighthouse',2,.62],[272,410,'office',3,.66]],
    };
    configs[chapter].forEach(([x,y,kind,stage,scale],i)=>{
      const b=createVoxelBuilding(this,kind,stage,scale).setPosition(x,y).setDepth(4+y);
      this.tweens.add({targets:b,y:y-2,duration:1900+i*130,yoyo:true,repeat:-1,ease:'Sine.InOut'});
    });
    [[47,350],[156,444],[111,228],[333,429]].forEach(([x,y],i)=>createVoxelTree(this,x,y,0.43+(i%2)*0.05,chapter===4?'ice':chapter===5?'volcano':chapter===3?'desert':'grass'));
    if(chapter===1) createFerrisWheel(this,323,451,.44).setDepth(454);
    if(chapter===2){ createVoxelBoat(this,307,451,.46).setDepth(455); createVoxelBridge(this,250,430,92,.48).setDepth(433); }
    if(chapter===6) gameIcon(this,205,458,'trophy',36);
  }
}
