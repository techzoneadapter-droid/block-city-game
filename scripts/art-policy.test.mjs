import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const root = process.cwd();
const publicDir = path.join(root, "public");
const artDir = path.join(publicDir, "art");
const provenancePath = path.join(artDir, "provenance.json");

const fail = (message) => {
  console.error("ART POLICY FAIL:", message);
  process.exitCode = 1;
};
const ok = (message) => console.log("ART POLICY OK:", message);

function walk(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });
}

let provenance = {};
if (fs.existsSync(provenancePath)) {
  try {
    provenance = JSON.parse(fs.readFileSync(provenancePath, "utf8"));
  } catch (error) {
    fail(`invalid public/art/provenance.json: ${error instanceof Error ? error.message : String(error)}`);
  }
}

const rasterFiles = walk(publicDir).filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
const allowedOrigins = new Set(["original-generated", "original-authored"]);

for (const file of rasterFiles) {
  const publicRelative = path.relative(publicDir, file).split(path.sep).join("/");
  const artRelative = path.relative(artDir, file).split(path.sep).join("/");
  const entry = !artRelative.startsWith("../") ? provenance[artRelative] : undefined;

  if (!entry) {
    fail(`${publicRelative} is a runtime raster without explicit public/art/provenance.json metadata`);
    continue;
  }
  if (!allowedOrigins.has(entry.origin)) {
    fail(`${publicRelative} has disallowed provenance origin: ${String(entry.origin)}`);
  }
  if (entry.referenceImagesUsedAsInput !== false) {
    fail(`${publicRelative} must explicitly declare referenceImagesUsedAsInput=false`);
  }
  if (!entry.sha256 || typeof entry.sha256 !== "string") {
    fail(`${publicRelative} is missing sha256 provenance`);
  } else {
    const actual = crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
    if (actual !== entry.sha256.toLowerCase()) {
      fail(`${publicRelative} sha256 does not match provenance`);
    }
  }
}

const sourceFiles = walk(path.join(root, "src")).filter((file) => /\.(ts|tsx|js|jsx|css|html)$/i.test(file));
const sourceText = sourceFiles.map((file) => fs.readFileSync(file, "utf8")).join("\n");
const forbiddenRuntimeRefs = [
  ".vibaocode-references",
  "block-city-coast-hero.png",
  "block-city-kit.png",
  "block-city-characters.png",
];
for (const token of forbiddenRuntimeRefs) {
  if (sourceText.includes(token)) fail(`runtime source contains forbidden reference-art token: ${token}`);
}

if (!process.exitCode) {
  ok(`${rasterFiles.length} runtime raster file(s) have explicit non-reference provenance`);
  ok("runtime source contains no known Vibaocode/reference-board asset paths");
}
