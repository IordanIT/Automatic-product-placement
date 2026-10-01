const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const BASE = process.env.BASE || "http://localhost:3111";
const OUT = path.join(__dirname, "shots");

const SHOTS = [
  { name: "01-landing-hero", url: "/", w: 1600, h: 1000 },
  { name: "02-landing-full", url: "/", w: 1440, h: 1000, full: true },
  { name: "03-overview", url: "/overview", w: 1600, h: 1000 },
  { name: "04-shelf-photo", url: "/shelf", w: 1600, h: 1050 },
  { name: "05-shelf-schema", url: "/shelf", w: 1600, h: 1050, click: [true] },
  { name: "06-planograms", url: "/planograms", w: 1600, h: 1050 },
  { name: "07-tasks", url: "/tasks", w: 1600, h: 1050 },
  { name: "08-analytics", url: "/analytics", w: 1600, h: 1050 },
  { name: "09-settings", url: "/settings", w: 1600, h: 1050 },
  { name: "10-ipad-shelf", url: "/shelf", w: 1024, h: 1366 },
];

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await puppeteer.launch({
    headless: "new",
    args: ["--no-sandbox", "--disable-setuid-sandbox", "--font-render-hinting=none"],
  });
  const errors = [];
  for (const s of SHOTS) {
    const page = await browser.newPage();
    await page.setViewport({ width: s.w, height: s.h, deviceScaleFactor: 1 });
    page.on("console", (m) => {
      if (m.type() === "error") errors.push(`[${s.name}] console: ${m.text()}`);
    });
    page.on("pageerror", (e) => errors.push(`[${s.name}] pageerror: ${e.message}`));
    await page.goto(BASE + s.url, { waitUntil: "networkidle2", timeout: 60000 });
    await new Promise((r) => setTimeout(r, 1400));
    if (s.click) {
      await page.evaluate(() => {
        const btn = [...document.querySelectorAll("button")].find((b) =>
          b.textContent.trim() === "Схема",
        );
        if (btn) btn.click();
      });
      await new Promise((r) => setTimeout(r, 1200));
    }
    await page.screenshot({ path: path.join(OUT, `${s.name}.png`), fullPage: !!s.full });
    await page.close();
  }
  await browser.close();
  fs.writeFileSync(path.join(OUT, "errors.txt"), errors.join("\n") || "none");
  console.log(errors.length ? errors.join("\n") : "no console/page errors");
})();