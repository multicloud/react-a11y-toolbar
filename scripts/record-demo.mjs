import { chromium } from "playwright";
import { resolve } from "path";
import { spawnSync } from "child_process";

const DEMO_PATH = resolve(import.meta.dirname, "../demo/index.html");
const GIF_PATH = resolve(import.meta.dirname, "../demo/demo.gif");
const FPS = 12;
const MS_PER_FRAME = 1000 / FPS;
const WIDTH = 1280;
const HEIGHT = 720;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: WIDTH, height: HEIGHT } });
await page.goto(`file://${DEMO_PATH}`);
await page.waitForTimeout(800);

const frames = [];

// Capture frames continuously for `ms` milliseconds
async function captureFor(ms) {
  const count = Math.max(1, Math.round(ms / MS_PER_FRAME));
  for (let i = 0; i < count; i++) {
    frames.push(await page.screenshot({ type: "png" }));
    if (i < count - 1) await page.waitForTimeout(MS_PER_FRAME);
  }
}

async function click(locator) {
  await locator.click();
}

// --- Scene 1: Page at rest (1.5s) ---
await captureFor(1500);

// --- Scene 2: Open panel (0.8s) ---
await click(page.getByRole("button", { name: /open accessibility menu/i }));
await captureFor(800);

// --- Scene 3: Toggle Readable Font on (0.6s) ---
await click(page.getByRole("switch", { name: /readable font/i }));
await captureFor(600);

// --- Scene 4: Toggle Highlight Links on (0.6s) ---
await click(page.getByRole("switch", { name: /highlight links/i }));
await captureFor(600);

// --- Scene 5: Toggle High Contrast on — pause to show effect (1.4s) ---
await click(page.getByRole("switch", { name: /high contrast/i }));
await captureFor(1400);

// --- Scene 6: Toggle High Contrast off, Dark Contrast on (1.2s) ---
await click(page.getByRole("switch", { name: /high contrast/i }));
await captureFor(400);
await click(page.getByRole("switch", { name: /dark contrast/i }));
await captureFor(1200);

// --- Scene 7: Toggle Dark Contrast off (0.5s) ---
await click(page.getByRole("switch", { name: /dark contrast/i }));
await captureFor(500);

// --- Scene 8: Apply Seizure Safe profile (0.8s) ---
await click(page.getByRole("button", { name: /seizure safe profile/i }));
await captureFor(800);

// --- Scene 9: Reset all (0.8s) ---
await click(page.getByRole("button", { name: /reset all/i }));
await captureFor(800);

// --- Scene 10: Close panel, show page at rest (1.2s) ---
await click(page.getByRole("button", { name: /close accessibility menu/i }));
await captureFor(1200);

await browser.close();

const totalSeconds = (frames.length / FPS).toFixed(1);
console.log(`Captured ${frames.length} frames (${totalSeconds}s at ${FPS}fps) — piping to ffmpeg…`);

const result = spawnSync(
  "ffmpeg",
  [
    "-y",
    "-f", "image2pipe",
    "-framerate", String(FPS),
    "-i", "pipe:0",
    "-vf", `fps=${FPS},scale=${WIDTH}:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer`,
    GIF_PATH,
  ],
  { input: Buffer.concat(frames), stdio: ["pipe", "inherit", "inherit"], maxBuffer: 512 * 1024 * 1024 }
);

if (result.status !== 0) {
  console.error("ffmpeg exited with status", result.status);
  process.exit(1);
}

console.log(`Done → ${GIF_PATH}`);
