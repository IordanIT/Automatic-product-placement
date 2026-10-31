const puppeteer = require("puppeteer");
const BASE = process.env.BASE || "http://localhost:3111";
const ROUTES = ["/", "/overview", "/shelf", "/planograms", "/tasks", "/analytics", "/settings"];

const srgb = (c) => {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
};
const lum = ([r, g, b]) => 0.2126 * srgb(r) + 0.7152 * srgb(g) + 0.0722 * srgb(b);
const ratio = (a, b) => {
  const [l1, l2] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
};
const parse = (s) => (s.match(/[\d.]+/g) || []).slice(0, 3).map(Number);

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  const problems = [];

  for (const [w, label] of [
    [1600, "desktop"],
    [390, "mobile"],
  ]) {
    await page.setViewport({ width: w, height: 1000 });
    for (const route of ROUTES) {
      await page.goto(BASE + route, { waitUntil: "networkidle2" });
      await new Promise((r) => setTimeout(r, 900));

      const samples = await page.evaluate(() => {
        const bgOf = (el) => {
          let n = el;
          while (n && n !== document.documentElement) {
            const c = getComputedStyle(n).backgroundColor;
            const p = c.match(/[\d.]+/g);
            if (p && (p.length < 4 || Number(p[3]) > 0.85)) return p.slice(0, 3).map(Number);
            n = n.parentElement;
          }
          return [247, 246, 243];
        };
        const out = [];
        const seen = new Set();
        for (const el of document.querySelectorAll("*")) {
          if (el.childElementCount > 0) continue;
          const txt = (el.textContent || "").trim();
          if (!txt) continue;
          const r = el.getBoundingClientRect();
          if (r.width < 2 || r.height < 2) continue;
          if (r.bottom < 0 || r.top > 3000) continue;
          const cs = getComputedStyle(el);
          if (cs.visibility === "hidden" || Number(cs.opacity) < 0.95) continue;
          const size = parseFloat(cs.fontSize);
          const weight = Number(cs.fontWeight) || 400;
          const key = `${cs.color}|${cs.fontSize}|${cs.fontFamily.slice(0, 20)}|${cs.textTransform}`;
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            color: cs.color,
            bg: bgOf(el),            size,
            weight,
            text: txt.slice(0, 24),
          });
        }
        return out;
      });

      for (const s of samples) {
        const cr = ratio(parse(s.color), s.bg);
        // WCAG AA: 3.0 for >=24px (or >=18.66px bold), 4.5 otherwise
        const large = s.size >= 24 || (s.size >= 18.66 && s.weight >= 700);
        const min = large ? 3 : 4.5;
        if (cr < min) {
          problems.push(
            `${label} ${route} "${s.text}" ${s.size}px/${s.weight} ` +
              `contrast ${cr.toFixed(2)} < ${min}`,
          );
        }
      }
    }
  }

  await browser.close();
  console.log("CONTRAST PROBLEMS:", problems.length ? "" : "none");
  for (const p of [...new Set(problems)]) console.log("  " + p);
})();