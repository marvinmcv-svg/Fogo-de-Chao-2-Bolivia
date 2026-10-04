// Optimises curated source media into public/media. Sources live outside the repo (see public/media/MANIFEST.md).
import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { mkdirSync } from "node:fs";
import path from "node:path";

const SRC = process.env.MEDIA_SRC;
if (!SRC) throw new Error("Set MEDIA_SRC to the folder holding the downloaded originals");
const out = (p) => path.join("public/media", p);
mkdirSync(out("img"), { recursive: true });
mkdirSync(out("video"), { recursive: true });
mkdirSync(out("brand"), { recursive: true });

// [output name, source file (relative to MEDIA_SRC/ref), max width]
const images = [
  ["carving-table", "37bef304ea82.jpg", 1800],
  ["picanha-roast", "453d3040d852.jpg", 1600],
  ["steak-sear", "b39e809c1836.jpeg", 1600],
  ["gaucho-carving", "c4c2ee8a75a1.jpg", 1800],
  ["knife-cut", "ed8a39663bf4.jpg", 1600],
  ["ribs-carving", "8b9802b7e6ac.jpg", 1600],
  ["linguica", "afbc9024c2f3.jpg", 1200],
  ["caipirinha", "2a6bc7ab510c.jpg", 1600],
  ["pao-de-queijo", "46c219aa7df9.jpg", 1600],
  ["postre", "be1be7886c41.jpg", 1000],
  ["skewers", "01028b3ce132.jpg", 2000],
  ["sliced-cut", "01822b14ab5f.jpg", 1600],
  ["flank", "c303966d0e66.jpg", 1200],
  ["feijoada", "9cc31338d289.jpg", 1200],
];
for (const [name, file, w] of images) {
  await sharp(path.join(SRC, "ref", file)).rotate().resize({ width: w, withoutEnlargement: true })
    .webp({ quality: 76 }).toFile(out(`img/${name}.webp`));
  // tiny blur placeholder as base64 for LQIP
  const buf = await sharp(path.join(SRC, "ref", file)).resize(16).blur(1).webp({ quality: 40 }).toBuffer();
  console.log(name, buf.length);
}

await sharp(path.join(SRC, "assets/hero-live.jpg")).resize({ width: 1600 }).webp({ quality: 74 }).toFile(out("img/hero-poster.webp"));
await sharp(path.join(SRC, "assets/logo-live.png")).toFile(out("brand/fogo-logo.webp")).catch(() => {});
await sharp(path.join(SRC, "assets/fogo-logo-white.png")).toFile(out("brand/fogo-logo-white.png"));

const ff = (...a) => execFileSync("ffmpeg", ["-loglevel", "error", "-y", ...a], { stdio: "inherit" });
// Hero film (client-owned), muted, web-optimised
ff("-i", path.join(SRC, "assets/hero-live.mp4"), "-an", "-vf", "scale=1280:720", "-c:v", "libx264", "-crf", "29", "-preset", "slow", "-movflags", "+faststart", "-pix_fmt", "yuv420p", out("video/hero.mp4"));
// Vertical clips (client-branded end-card)
ff("-i", path.join(SRC, "ref/hero-desktop.mp4"), "-an", "-vf", "crop=608:1080:656:0,scale=540:960", "-c:v", "libx264", "-crf", "29", "-preset", "slow", "-movflags", "+faststart", "-pix_fmt", "yuv420p", out("video/fuego-vertical.mp4"));
ff("-i", path.join(SRC, "ref/hero-rodizio.mp4"), "-an", "-vf", "scale=540:960", "-c:v", "libx264", "-crf", "29", "-preset", "slow", "-movflags", "+faststart", "-pix_fmt", "yuv420p", out("video/rodizio-vertical.mp4"));
console.log("done");
