import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { ADVERSARIES, SCENARIOS, SPIRITS } from "../src/data.js";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const KNOWN = new Set([
  ...SPIRITS.map((s) => `spirits/${s.id}`),
  ...ADVERSARIES.map((a) => `adversaries/${a.id}`),
  ...SCENARIOS.map((s) => `scenarios/${s.id}`),
]);
const isPng = (b) => b.length > 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47;

const source = process.argv[2];
if (!source) {
  console.error("usage: node scripts/import-images.mjs <bundle.json>");
  process.exit(2);
}

const bundle = JSON.parse(await readFile(source, "utf8"));
const rejected = [];
let saved = 0;
for (const [key, base64] of Object.entries(bundle)) {
  const bytes = Buffer.from(base64, "base64");
  if (!KNOWN.has(key) || !isPng(bytes)) {
    rejected.push(key);
    continue;
  }
  const target = join(ROOT, "images", `${key}.png`);
  await mkdir(dirname(target), { recursive: true });
  await writeFile(target, bytes);
  saved++;
}
const missing = [...KNOWN].filter((k) => !(k in bundle));
console.log(`saved ${saved}, rejected ${rejected.length}, missing ${missing.length}`);
for (const k of rejected) console.log(`  rejected ${k}`);
for (const k of missing) console.log(`  missing ${k}`);
