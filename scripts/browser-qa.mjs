import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const baseUrl = "http://127.0.0.1:4173";

function findChrome() {
  if(process.env.CHROME_BIN && existsSync(process.env.CHROME_BIN))return process.env.CHROME_BIN;
  for (const cmd of ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"]) {
    const result = spawnSync("which", [cmd], { encoding: "utf8" });
    if (result.status === 0 && result.stdout.trim()) return result.stdout.trim();
  }
  throw new Error("Chrome/Chromium is not installed on the CI runner.");
}

async function waitFor(check, label, timeout = 15000) {
  const deadline = Date.now() + timeout;
  while (Date.now() < deadline) {
    const value = await check();
    if (value) return value;
    await sleep(100);
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function stop(child) {
  if (!child || child.exitCode !== null || child.signalCode !== null) return;
  await new Promise((resolve) => {
    const force = setTimeout(() => child.kill("SIGKILL"), 2000);
    child.once("exit", () => { clearTimeout(force); resolve(); });
    child.kill("SIGTERM");
  });
}

// Use the real browser clock: virtual-time DOM dumps can stall on animated games.
// Node 22 (also used in CI) provides WebSocket, so no browser-test dependency is needed.
async function connect(url) {
  const socket = new WebSocket(url);
  await new Promise((resolve, reject) => {
    socket.addEventListener("open", resolve, { once: true });
    socket.addEventListener("error", reject, { once: true });
  });
  let sequence = 0;
  const pending = new Map();
  const exceptions = [];
  socket.addEventListener("message", ({ data }) => {
    const message = JSON.parse(data);
    if (message.method === "Runtime.exceptionThrown") {
      const details = message.params.exceptionDetails;
      exceptions.push(details.exception?.description ?? details.text);
    }
    const request = pending.get(message.id);
    if (!request) return;
    clearTimeout(request.timer);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++sequence;
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Browser command timed out: ${method}`)); }, 30000);
    pending.set(id, { resolve, reject, timer });
    socket.send(JSON.stringify({ id, method, params }));
  });
  return { socket, send, exceptions };
}

let server, browser, connection, profile;
let serverLog = "", browserLog = "", launchError;
try {
  const chrome = findChrome();
  server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "preview", "--host", "127.0.0.1", "--port", "4173", "--strictPort"], { stdio: ["ignore", "pipe", "pipe"] });
  server.on("error", (error) => { launchError = error; });
  server.stdout.on("data", (chunk) => { serverLog += chunk; });
  server.stderr.on("data", (chunk) => { serverLog += chunk; });
  await waitFor(async () => {
    if (launchError) throw launchError;
    if (server.exitCode !== null) throw new Error(`Preview exited: ${serverLog}`);
    try { return (await fetch(baseUrl, { signal: AbortSignal.timeout(1000) })).ok; } catch { return false; }
  }, "Vite preview");

  const scratch = path.join(process.cwd(), ".vite");
  mkdirSync(scratch, { recursive: true });
  profile = mkdtempSync(path.join(scratch, "browser-qa-"));
  browser = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--no-zygote", "--single-process", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
  browser.on("error", (error) => { launchError = error; });
  browser.stderr.on("data", (chunk) => { browserLog = (browserLog + chunk).slice(-12000); });
  const endpoint = await waitFor(() => {
    if (launchError) throw launchError;
    if (browser.exitCode !== null) throw new Error(`Browser exited: ${browserLog}`);
    return browserLog.match(/DevTools listening on (ws:\/\/\S+)/)?.[1];
  }, "Chrome DevTools");
  const origin = endpoint.replace(/^ws:/, "http:").split("/devtools/")[0];
  const targets = await (await fetch(`${origin}/json/list`)).json();
  const target = targets.find((entry) => entry.type === "page");
  if (!target) throw new Error("Chrome did not create a page.");
  connection = await connect(target.webSocketDebuggerUrl);
  await connection.send("Runtime.enable");
  await connection.send("Emulation.setDeviceMetricsOverride", { width: 390, height: 844, deviceScaleFactor: 1, mobile: true });
  await connection.send("Page.navigate", { url: baseUrl+"/?qa" });
  await waitFor(async () => {
    if (connection.exceptions.length) throw new Error(connection.exceptions.join("\n"));
    const { result } = await connection.send("Runtime.evaluate", {
      expression: `JSON.stringify({ready:document.documentElement.dataset.blockCityReady==='true' && !!document.querySelector('canvas'),error:document.querySelector('#block-city-boot-status[data-state="error"]')?.textContent})`,
      returnByValue: true,
    });
    if (!result.value) return false;
    const status = JSON.parse(result.value);
    if (status.error) throw new Error(status.error);
    return status.ready;
  }, "Block City Home ready");
  const evaluate = async expression => {
    const value=await connection.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(value.exceptionDetails)throw new Error(value.exceptionDetails.exception?.description ?? value.exceptionDetails.text);
    return value.result.value;
  };
  const active = key => waitFor(()=>evaluate(`window.__blockCityGame.scene.getScenes(true).some(s=>s.scene.key==='${key}' && s.sys.settings.status===5)`),key);
  const click = async (x,y) => {
    const rect=await evaluate(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
    const point={x:rect.x+x*rect.w/390,y:rect.y+y*rect.h/844};
    await connection.send('Input.dispatchMouseEvent',{type:'mousePressed',...point,button:'left',clickCount:1});
    await sleep(120);
    await connection.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point,button:'left',clickCount:1});
    await sleep(250);
  };
  const start = async key => {await evaluate(`void window.__blockCityGame.scene.getScenes(true)[0].scene.start('${key}')`);await active(key);await sleep(250);};
  const report={viewports:[],interactions:[],errors:[]};
  const output=path.join(process.cwd(),'.vite/ui-overhaul-qa');mkdirSync(output,{recursive:true});
  // Real pointer navigation from Home through the existing Journey route.
  await click(195,680);await active('CampaignScene');
  await click(195,730);await active('PuzzleScene');
  await sleep(500);
  // Find a legal target from the live grid; the browser performs the real drag.
  const drag = await evaluate(`(()=>{const s=window.__blockCityGame.scene.getScene('PuzzleScene');
    const p=s.pieces[0];let target;
    for(let r=0;r<8&&!target;r++)for(let c=0;c<8&&!target;c++)if(s.canPlace(p.shape,r,c))target={r,c};
    return {from:{x:p.container.x,y:p.container.y},to:{x:23+(target.c+p.shape[0].length/2)*43,y:255+(target.r+p.shape.length/2)*43+30},before:s.placementsMade};})()`);
  const rect=await evaluate(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
  const point=p=>({x:rect.x+p.x*rect.w/390,y:rect.y+p.y*rect.h/844});
  await connection.send('Input.dispatchMouseEvent',{type:'mousePressed',...point(drag.from),button:'left',buttons:1,clickCount:1});
  for(let i=1;i<=12;i++){
    await connection.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point({x:drag.from.x+(drag.to.x-drag.from.x)*i/12,y:drag.from.y+(drag.to.y-drag.from.y)*i/12}),button:'left',buttons:1});
    await sleep(20);
  }
  await connection.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point(drag.to),button:'left',clickCount:1});
  await sleep(650);
  const placed=await evaluate(`window.__blockCityGame.scene.getScene('PuzzleScene').placementsMade`);
  if(placed!==drag.before+1)throw new Error('Puzzle drag did not commit exactly one placement');
  report.interactions.push('Home PLAY → Journey → Puzzle; legal mouse drag/drop commits one placement');
  // Invalid off-board drop must leave the grid and placement count unchanged.
  const before=await evaluate(`JSON.stringify(window.__blockCityGame.scene.getScene('PuzzleScene').grid)`);
  const from=await evaluate(`(()=>{const p=window.__blockCityGame.scene.getScene('PuzzleScene').pieces[0];return {x:p.container.x,y:p.container.y};})()`);
  await connection.send('Input.dispatchMouseEvent',{type:'mousePressed',...point(from),button:'left',buttons:1,clickCount:1});
  await connection.send('Input.dispatchMouseEvent',{type:'mouseMoved',...point({x:10,y:120}),button:'left',buttons:1});
  await connection.send('Input.dispatchMouseEvent',{type:'mouseReleased',...point({x:10,y:120}),button:'left',clickCount:1});
  await sleep(250);
  if(before!==await evaluate(`JSON.stringify(window.__blockCityGame.scene.getScene('PuzzleScene').grid)`))throw new Error('Invalid drop mutated board');
  report.interactions.push('Invalid drop preserves board');
  await click(38,111);await active('HomeScene');
  await click(51,785);await active('CityScene');
  await click(195,796);await active('CampaignScene');
  await click(346,796);await active('ProgressScene');
  await click(195,250);await click(152,455);await click(195,699);
  if(await evaluate(`JSON.parse(localStorage.getItem('block-city-save-v1')).avatar`)!=='planner')throw new Error('Profile selection did not persist');
  report.interactions.push('Build/Map/Friends navigation and profile selection persist');
  await click(120,796);await active('DailyScene');
  await click(271,796);await active('EventScene');
  report.interactions.push('Tasks and Shop routes open without errors');
  for(const [width,height] of [[360,800],[375,812],[390,844],[412,915],[430,932],[768,1024]]) {
    await connection.send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:true});
    const scenes=[];
    for(const key of ['HomeScene','CityScene','PuzzleScene','ProgressScene']) {
      await start(key);await sleep(250);
      const audit=await evaluate(`(()=>{const s=window.__blockCityGame.scene.getScenes(true)[0];const missing=[];
        const walk=o=>{if(o.texture?.key==='__MISSING')missing.push(o.name);if(o.list)o.list.forEach(walk);};s.children.list.forEach(walk);
        const r=document.querySelector('canvas').getBoundingClientRect();return {missing,canvas:{x:r.x,y:r.y,w:r.width,h:r.height},cells:key==='PuzzleScene'?s.cells?.flat().length:undefined};})()`.replace("key==='PuzzleScene'",JSON.stringify(key)+"==='PuzzleScene'"));
      if(audit.missing.length)throw new Error(`Missing texture in ${key}`);
      if(audit.canvas.x < -1||audit.canvas.y < -1||audit.canvas.x+audit.canvas.w>width+1||audit.canvas.y+audit.canvas.h>height+1)throw new Error(`Canvas clipped at ${width}×${height}`);
      if(key==='PuzzleScene'&&audit.cells!==64)throw new Error('Board is not 8×8');
      // Freeze only the animation clock during capture to avoid software-compositor starvation.
      await evaluate('void window.__blockCityGame.loop.sleep()');
      const shot=await connection.send('Page.captureScreenshot',{format:'png'});
      writeFileSync(path.join(output,`${width}x${height}-${key}.png`),Buffer.from(shot.data,'base64'));
      await evaluate('void window.__blockCityGame.loop.wake()');
      scenes.push({key,...audit});
    }
    report.viewports.push({width,height,scenes});
    console.log(`BROWSER QA OK: ${width}×${height}: Home, City, Puzzle, Profile; no clipping or missing textures.`);
  }
  // A separate local browser fixture unlocks controls without touching user saves.
  await connection.send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});
  await evaluate(`(()=>{const s=JSON.parse(localStorage.getItem('block-city-save-v1'));Object.assign(s,{coins:10000,stars:9,level:8});localStorage.setItem('block-city-save-v1',JSON.stringify(s));})()`);
  await start('CityScene');
  await click(246,421);await sleep(400);
  if(await evaluate(`window.__blockCityGame.scene.getScene('CityScene').selectedBuilding`)!=='park')throw new Error('World building selection hitbox is misaligned');
  await click(148,674);await sleep(3600);
  const built=await evaluate(`JSON.parse(localStorage.getItem('block-city-save-v1'))`);
  if(built.parkStage!==1||built.stars!==8)throw new Error('City build did not preserve stage/cost');
  const depth=await evaluate(`(()=>{const world=window.__blockCityGame.scene.getScene('CityScene').world;return world.root.list.every((o,i,a)=>!i||o.depth>=a[i-1].depth);})()`);
  if(!depth)throw new Error('World depth order changed after construction');
  await start('PuzzleScene');
  const coinBefore=await evaluate(`JSON.parse(localStorage.getItem('block-city-save-v1')).coins`);
  await click(195,758);await sleep(400);
  const boosted=await evaluate(`JSON.parse(localStorage.getItem('block-city-save-v1'))`);
  if(boosted.refreshUses!==1||boosted.coins>=coinBefore)throw new Error('Shuffle booster did not call the existing action');
  await click(70,758);
  if(await evaluate(`window.__blockCityGame.scene.getScene('PuzzleScene').boosterMode`)!=='hammer')throw new Error('Hammer booster action not wired');
  report.interactions.push('World selection, park construction/cost, ground depth after upgrade, shuffle cost/action and hammer mode verified');
  await connection.send('Emulation.setDeviceMetricsOverride',{width:360,height:640,deviceScaleFactor:1,mobile:true});
  await start('CityScene');
  const shortRect=await evaluate(`(()=>{const r=document.querySelector('canvas').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height};})()`);
  await connection.send('Input.dispatchMouseEvent',{type:'mouseWheel',x:shortRect.x+195*shortRect.w/390,y:shortRect.y+650*shortRect.h/844,deltaX:0,deltaY:120});
  await sleep(250);
  if(await evaluate(`window.__blockCityGame.scene.getScene('CityScene').children.getByName('city-management').y`)>=0)throw new Error('Short-screen City management does not scroll');
  report.interactions.push('360×640 short-screen City management scrolls independently of navigation');
  if(connection.exceptions.length)throw new Error(connection.exceptions.join('\n'));
  writeFileSync(path.join(output,'report.json'),JSON.stringify(report,null,2));
  console.log('BROWSER QA OK: navigation, profile persistence, valid/invalid puzzle drag/drop; no runtime exceptions.');

} finally {
  connection?.socket.close();
  await stop(browser);
  await stop(server);
  if (profile) rmSync(profile, { recursive: true, force: true });
}
