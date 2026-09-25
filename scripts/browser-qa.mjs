import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync } from "node:fs";
import path from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const baseUrl = "http://127.0.0.1:4173";

function findChrome() {
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
    const timer = setTimeout(() => { pending.delete(id); reject(new Error(`Browser command timed out: ${method}`)); }, 5000);
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
  browser = spawn(chrome, ["--headless=new", "--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage", "--remote-debugging-port=0", `--user-data-dir=${profile}`, "about:blank"], { stdio: ["ignore", "ignore", "pipe"] });
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
  await connection.send("Page.navigate", { url: baseUrl });
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
  await sleep(500);
  if (connection.exceptions.length) throw new Error(connection.exceptions.join("\n"));
  console.log("BROWSER QA OK: Home ready at 390×844 with a Phaser canvas and no runtime exceptions.");
} finally {
  connection?.socket.close();
  await stop(browser);
  await stop(server);
  if (profile) rmSync(profile, { recursive: true, force: true });
}
