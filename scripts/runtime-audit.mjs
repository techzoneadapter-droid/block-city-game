import { chromium } from "playwright";
import fs from "node:fs/promises";

const target = "http://127.0.0.1:4173";
const out = "audit-output";
await fs.rm(out, { recursive: true, force: true });
await fs.mkdir(out, { recursive: true });

const browser = await chromium.launch({ headless: true, args: ["--no-sandbox"] });

async function captureViewport(width, height, labels) {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });
  const page = await context.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push("console: " + m.text()); });
  page.on("pageerror", e => errors.push("page: " + String(e)));

  async function home() {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(1400);
  }
  async function canvasBox() {
    const c = page.locator("canvas").first();
    await c.waitFor({ state: "visible", timeout: 15000 });
    return await c.boundingBox();
  }
  async function click(rx, ry, wait = 1000) {
    const b = await canvasBox();
    if (!b) throw new Error("canvas missing");
    await page.mouse.click(b.x + b.width * rx, b.y + b.height * ry);
    await page.waitForTimeout(wait);
  }
  async function snap(label) {
    const c = page.locator("canvas").first();
    const file = `${out}/${width}x${height}-${label}.png`;
    await c.screenshot({ path: file });
    labels.push(file);
  }

  await home();
  await snap("home");

  await home();
  await click(0.50, 0.80);
  await snap("puzzle");

  {
    const b = await canvasBox();
    if (b) {
      await page.mouse.move(b.x + b.width * 0.20, b.y + b.height * 0.80);
      await page.mouse.down();
      await page.mouse.move(b.x + b.width * 0.25, b.y + b.height * 0.46, { steps: 14 });
      await page.mouse.up();
      await page.waitForTimeout(700);
      await snap("puzzle-after-drag");
    }
  }

  await home();
  await click(0.13, 0.93);
  await snap("city");

  await home();
  await click(0.38, 0.93);
  await snap("campaign");

  await home();
  await click(0.87, 0.93);
  await snap("character-picker");

  await home();
  await click(0.11, 0.055);
  await snap("progress");

  await home();
  await click(0.38, 0.93);
  await click(0.69, 0.945);
  await snap("daily");

  await home();
  await click(0.38, 0.93);
  await click(0.88, 0.945);
  await snap("event");

  await fs.writeFile(`${out}/${width}x${height}-errors.json`, JSON.stringify(errors, null, 2));
  await context.close();
}

const labels = [];
await captureViewport(390, 844, labels);
await captureViewport(360, 800, labels);
await browser.close();

for (const file of labels) {
  const data = await fs.readFile(file);
  await fs.writeFile(file + ".b64", data.toString("base64"), "utf8");
}
