import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const read = (p) => fs.readFileSync(path.join(root, p), "utf8");
const exists = (p) => fs.existsSync(path.join(root, p));
const fail = (message) => {
  console.error("QA FAIL:", message);
  process.exitCode = 1;
};
const ok = (condition, message) => condition ? console.log("QA OK:", message) : fail(message);

const required = [
  "src/scenes/HomeScene.ts",
  "src/scenes/CampaignScene.ts",
  "src/scenes/PuzzleScene.ts",
  "src/scenes/CityScene.ts",
  "src/scenes/DailyScene.ts",
  "src/scenes/EventScene.ts",
  "src/scenes/ProgressScene.ts",
  "src/home/presentation.ts",
  "src/referenceArt.ts",
  "src/ui.ts",
  "VISUAL_SYSTEM.md",
];
required.forEach((file) => ok(exists(file), `required file: ${file}`));

const main = read("src/main.ts");
ok(main.includes("roundPixels: false"), "sub-pixel animation remains enabled");
["HomeScene","CampaignScene","PuzzleScene","CityScene","DailyScene","ProgressScene","EventScene"]
  .forEach((scene) => ok(main.includes(scene), `registered scene: ${scene}`));

const home = read("src/home/presentation.ts");
ok(home.includes('scene.scene.start("CampaignScene")'), "Home PLAY routes through Journey map");
ok(home.includes('"PLAY"'), "Home primary PLAY CTA exists");

const ui = read("src/ui.ts");
["City","Tasks","Map","Shop","Friends"].forEach((label) =>
  ok(ui.includes(`label: "${label}"`), `world navigation includes ${label}`)
);
["Build","Puzzles","Shop","Friends"].forEach((label) =>
  ok(ui.includes(`"${label}"`), `Home navigation includes ${label}`)
);
ok(ui.includes('panel(scene, W / 2, 805, 388, 78'), "Home navigation remains inside 844px viewport");

const city = read("src/scenes/CityScene.ts");
ok(city.includes('bottomNavigation(this, "CityScene"'), "City uses shared world navigation");
ok(city.includes("const queue = ConstructionQueue(this, 101, 726, 184, 60"), "City construction footer clears the shared navigation");
ok(city.includes("x, 674, 75, 23"), "Catalog actions fit above construction and daily tasks");

const puzzle = read("src/scenes/PuzzleScene.ts");
ok(puzzle.includes("const BOARD = 8;"), "Puzzle board stays 8x8");
ok(puzzle.includes("this.createDailyFairPlayPanel();"), "Daily puzzle fair-play mode remains available");
ok(puzzle.includes("emitVoxelBurst"), "Puzzle voxel placement/clear feedback remains wired");

const visual = read("VISUAL_SYSTEM.md");
ok(visual.includes("Approved visual-board roles"), "nine-board visual source of truth is documented");

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

const publicFiles = walk(path.join(root, "public"));
const raster = publicFiles.filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
let provenance = {};
try {
  provenance = JSON.parse(read("public/art/provenance.json"));
} catch {
  provenance = {};
}
const canonical = JSON.parse(read('public/assets/block-city-v2/asset-registry.json'));
const canonicalPaths = new Set(Object.values(canonical).map(entry => path.join(root,'public/assets/block-city-v2',entry.path)));
const provenancedRaster = raster.every((file) => {
  if(canonicalPaths.has(file))return true;
  const artRoot = path.join(root, "public", "art");
  const rel = path.relative(artRoot, file).split(path.sep).join("/");
  const entry = !rel.startsWith("../") ? provenance[rel] : undefined;
  return Boolean(
    entry &&
    ["original-generated", "original-authored"].includes(entry.origin) &&
    entry.referenceImagesUsedAsInput === false
  );
});
ok(provenancedRaster, "runtime raster art has explicit authorized provenance");

const sourceText = walk(path.join(root, "src"))
  .filter((file) => /\.(ts|tsx|js|jsx|css)$/i.test(file))
  .map((file) => fs.readFileSync(file, "utf8"))
  .join("\n");
ok(!sourceText.includes(".vibaocode-references"), "runtime source never reads Vibaocode reference boards");
ok(!sourceText.includes("block-city-coast-hero.png"), "legacy Home raster is not referenced");
ok(!sourceText.includes("block-city-kit.png"), "legacy UI kit raster is not referenced");
ok(!sourceText.includes("block-city-characters.png"), "legacy character raster is not referenced");

if (process.exitCode) {
  console.error("\nBlock City QA failed.");
} else {
  console.log("\nBlock City QA passed.");
}
