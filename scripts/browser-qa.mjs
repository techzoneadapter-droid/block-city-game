import { spawn, spawnSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const baseUrl = "http://127.0.0.1:4173";

async function waitForServer() {
  for (let i = 0; i < 50; i += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
    } catch {}
    await sleep(200);
  }
  throw new Error("Vite preview did not become ready.");
}

function findChrome() {
  const candidates = ["google-chrome", "google-chrome-stable", "chromium", "chromium-browser"];
  for (const cmd of candidates) {
    const test = spawnSync("bash", ["-lc", `command -v ${cmd}`], { encoding: "utf8" });
    if (test.status === 0 && test.stdout.trim()) return cmd;
  }
  return "";
}

const server = spawn("npx", ["vite", "preview", "--host", "127.0.0.1", "--port", "4173"], {
  stdio: ["ignore", "pipe", "pipe"],
});
let serverLog = "";
server.stdout.on("data", (chunk) => { serverLog += chunk.toString(); });
server.stderr.on("data", (chunk) => { serverLog += chunk.toString(); });

try {
  await waitForServer();
  const chrome = findChrome();
  if (!chrome) throw new Error("Chrome/Chromium is not installed on the CI runner.");

  const userDataDir = mkdtempSync(path.join(tmpdir(), "block-city-chrome-"));
  try {
    const result = spawnSync(chrome, [
      "--headless=new",
      "--no-sandbox",
      "--disable-gpu",
      "--disable-dev-shm-usage",
      "--enable-logging=stderr",
      "--v=0",
      `--user-data-dir=${userDataDir}`,
      "--virtual-time-budget=5000",
      "--dump-dom",
      baseUrl,
    ], { encoding: "utf8", timeout: 30000, maxBuffer: 12 * 1024 * 1024 });

    const output = result.stdout || "";
    const errors = result.stderr || "";
    console.log(errors.split("\n").filter((line) => /SEVERE|ERROR|Uncaught|TypeError|ReferenceError/i.test(line)).slice(-80).join("\n"));

    if (result.status !== 0) {
      throw new Error(`Headless browser exited with ${result.status}.\n${errors.slice(-5000)}`);
    }
    if (!/<canvas\b/i.test(output)) {
      throw new Error(
        "Block City did not mount a Phaser canvas in a real browser.\n" +
        "DOM tail:\n" + output.slice(-5000) + "\nBrowser errors:\n" + errors.slice(-5000),
      );
    }

    console.log("BROWSER QA OK: Phaser canvas mounted in headless Chrome.");
  } finally {
    rmSync(userDataDir, { recursive: true, force: true });
  }
} finally {
  server.kill("SIGTERM");
  if (serverLog.trim()) console.log(serverLog.trim());
}
