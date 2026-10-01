const puppeteer = require("puppeteer");

const BASE = process.env.BASE || "http://localhost:3111";
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const ROUTES = ["/", "/overview", "/shelf", "/planograms", "/tasks", "/analytics", "/settings"];

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ["--no-sandbox"] });
  const page = await browser.newPage();
  await page.setViewport({ width: 1600, height: 1000 });

  const problems = [];
  const failed = [];
  const consoleErrors = [];
  page.on("requestfailed", (r) => failed.push(`${r.url()} ${r.failure()?.errorText}`));
  page.on("response", (r) => {
    if (r.status() >= 400) failed.push(`${r.status()} ${r.url()}`);
  });
  page.on("console", (m) => {
    if (m.type() === "error") consoleErrors.push(m.text());
  });
  page.on("pageerror", (e) => consoleErrors.push("pageerror: " + e.message));

  /* ------------------------------------------------------------------ */
  /* landing                                                             */
  /* ------------------------------------------------------------------ */
  await page.goto(BASE + "/", { waitUntil: "networkidle2" });
  await wait(1200);

  const landing = await page.evaluate(() => {
    const faces = [...document.fonts].filter((f) => !f.family.includes("Fallback"));
    const byFamily = {};
    for (const f of faces) {
      byFamily[f.family] ??= [];
      byFamily[f.family].push(f.status);
    }
    return {
      fontFaces: Object.fromEntries(
        Object.entries(byFamily).map(([k, v]) => [k, [...new Set(v)]]),
      ),
      h1: document.querySelector("h1").innerText.replace(/\n/g, " / "),
      h1Family: getComputedStyle(document.querySelector("h1")).fontFamily.split(",")[0],
      h1Size: getComputedStyle(document.querySelector("h1")).fontSize,
      sections: [...document.querySelectorAll("section[id]")].map((s) => s.id),
      forms: document.querySelectorAll("input, button[type=submit]").length,
    };
  });
  console.log("LANDING", JSON.stringify(landing, null, 2));
  for (const [fam, states] of Object.entries(landing.fontFaces)) {
    if (!states.includes("loaded")) problems.push(`font ${fam} never loaded: ${states}`);
  }
  if (landing.h1Family !== "Fraunces") problems.push(`h1 font is ${landing.h1Family}, expected Fraunces`);

  /* ------------------------------------------------------------------ */
  /* shelf: canvas rendering, hit-testing, tooltip, zoom, schema          */
  /* ------------------------------------------------------------------ */
  await page.goto(BASE + "/shelf", { waitUntil: "networkidle2" });
  await wait(2200);

  const px = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    const seen = new Set();
    let nonBg = 0;
    let n = 0;
    for (let i = 0; i < data.length; i += 4 * 37) {
      n++;
      seen.add(
        "#" +
          [data[i], data[i + 1], data[i + 2]]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join(""),
      );
      if (Math.abs(data[i] - 239) + Math.abs(data[i + 1] - 237) + Math.abs(data[i + 2] - 232) > 24)
        nonBg++;
    }
    return { w: c.width, h: c.height, colours: seen.size, fill: +(nonBg / n).toFixed(3) };
  });
  console.log("CANVAS photo", JSON.stringify(px));
  if (px.colours < 300) problems.push(`photo canvas under-rendered (${px.colours} colours)`);
  if (px.fill < 0.5) problems.push(`photo canvas mostly empty (fill ${px.fill})`);

  const cr = await page.evaluate(() =>
    document.querySelector("canvas").getBoundingClientRect().toJSON(),
  );

  /* scan for hit coverage. Shelf boards and slot gaps are real empty pixels, so
     assert structure (4 levels x 8 bays reachable) rather than full coverage. */
  let hits = 0;
  let samples = 0;
  const seenCells = new Set();
  const hitFys = [];
  const hitFxs = [];
  for (let fy = 0.15; fy <= 0.85; fy += 0.05) {
    for (let fx = 0.08; fx <= 0.95; fx += 0.03) {
      samples++;
      await page.mouse.move(cr.x + cr.width * fx, cr.y + cr.height * fy);
      await wait(18);
      const id = await page.evaluate(() => {
        const el = document.querySelector('[role="tooltip"]');
        if (!el) return null;
        const m = /SKU: (\S+)/.exec(el.innerText);
        return m ? m[1] : "?";
      });
      if (id) {
        hits++;
        seenCells.add(id);
        hitFys.push(fy);
        hitFxs.push(fx);
      }
    }
  }
  const bands = (arr, step) => new Set(arr.map((v) => Math.floor(v / step))).size;
  const levels = bands(hitFys, 0.1);
  const bays = bands(hitFxs, 0.06);
  console.log(
    `HIT COVERAGE ${hits}/${samples} (${((hits / samples) * 100).toFixed(0)}%), ` +
      `${seenCells.size} SKUs, ${levels} level-bands, ${bays} bay-bands`,
  );
  if (hits / samples < 0.3) problems.push(`hit coverage too low: ${hits}/${samples}`);
  if (seenCells.size < 25) problems.push(`only ${seenCells.size} SKUs reachable by hover`);
  if (levels < 4) problems.push(`only ${levels} shelf levels reachable by hover, expected 4`);
  if (bays < 6) problems.push(`only ${bays} bay columns reachable by hover, expected 8`);

  /* tooltip content must be complete */
  await page.mouse.move(cr.x + cr.width * 0.1, cr.y + cr.height * 0.26);
  await wait(250);
  await page.mouse.move(cr.x + cr.width * 0.11, cr.y + cr.height * 0.26);
  await wait(350);
  const tip = await page.evaluate(() => {
    const el = document.querySelector('[role="tooltip"]');
    return el ? el.innerText.replace(/\n/g, " | ") : null;
  });
  console.log("TOOLTIP", JSON.stringify(tip));
  if (!tip) problems.push("bbox tooltip missing");
  else {
    for (const field of ["SKU:", "Ожидается", "Факт", "Статус:", "conf"])
      if (!tip.includes(field)) problems.push(`tooltip missing "${field}"`);
  }

  /* coordinate readout */
  const coord = await page.evaluate(
    () => [...document.querySelectorAll("span")].map((s) => s.innerText).find((t) => t?.startsWith("x ")),
  );
  console.log("COORD READOUT", JSON.stringify(coord));
  if (!coord || coord === "x 0 · y 0 мм") problems.push("coordinate readout never updated");

  /* click selects a detection */
  await page.mouse.click(cr.x + cr.width * 0.11, cr.y + cr.height * 0.26);
  await wait(400);
  const sidePanel = await page.evaluate(
    () => /SKU|Ожидается|Факт/.test(document.querySelector("main")?.innerText || ""),
  );
  console.log("CLICK SELECT side panel populated:", sidePanel);
  if (!sidePanel) problems.push("click did not populate the detection detail panel");

  /* zoom via wheel */
  const z0 = await page.evaluate(
    () => [...document.querySelectorAll("span")].find((s) => s.innerText?.startsWith("ZOOM"))?.innerText,
  );
  await page.mouse.move(cr.x + cr.width * 0.5, cr.y + cr.height * 0.5);
  await page.mouse.wheel({ deltaY: -800 });
  await wait(400);
  const z1 = await page.evaluate(
    () => [...document.querySelectorAll("span")].find((s) => s.innerText?.startsWith("ZOOM"))?.innerText,
  );
  console.log("ZOOM", z0, "->", z1);
  if (z0 === z1) problems.push("wheel zoom did not change the zoom readout");

  /* toolbar zoom out / fit */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button[title]")].find((x) =>
      x.getAttribute("title")?.includes("Уменьшить"),
    );
    b?.click();
  });
  await wait(300);
  const z2 = await page.evaluate(
    () => [...document.querySelectorAll("span")].find((s) => s.innerText?.startsWith("ZOOM"))?.innerText,
  );
  console.log("ZOOM after zoom-out", z2);
  if (z2 === z1) problems.push("zoom-out toolbar button had no effect");

  /* schema mode */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) => x.textContent.trim() === "Схема");
    b?.click();
  });
  await wait(1200);
  const schema = await page.evaluate(() => {
    const c = document.querySelector("canvas");
    const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
    const seen = new Set();
    for (let i = 0; i < data.length; i += 4 * 37)
      seen.add(
        "#" +
          [data[i], data[i + 1], data[i + 2]]
            .map((v) => v.toString(16).padStart(2, "0"))
            .join(""),
      );
    return seen.size;
  });
  console.log("CANVAS schema colours:", schema);
  if (schema < 200) problems.push("schema canvas under-rendered");

  /* layer toggles change the render — hash actual pixels, not array length */
  const hashCanvas = () =>
    page.evaluate(() => {
      const c = document.querySelector("canvas");
      const { data } = c.getContext("2d").getImageData(0, 0, c.width, c.height);
      let h = 5381;
      for (let i = 0; i < data.length; i += 4 * 11) h = ((h * 33) ^ data[i]) >>> 0;
      return h;
    });

  const before = await hashCanvas();
  const toggled = await page.evaluate(() => {
    const b = document.querySelector('button[aria-label="Рамки"]');
    if (b) b.click();
    return !!b;
  });
  await wait(700);
  const after = await hashCanvas();
  console.log("LAYER TOGGLE ('Рамки') changed render:", before !== after, "clicked:", toggled);
  if (before === after) problems.push("layer toggle did not change the canvas");
  if (!toggled) problems.push("layer toggle button not found");

  /* detection registry row → focus a bbox */
  const anomaly = await page.evaluate(() => {
    const row = [...document.querySelectorAll("tbody tr")].find((r) => /D-\d/.test(r.innerText));
    if (row) row.click();
    return row ? row.innerText.replace(/\s+/g, " ").slice(0, 48) : null;
  });
  await wait(600);
  console.log("REGISTRY ROW CLICKED:", JSON.stringify(anomaly));
  if (!anomaly) problems.push("detection registry has no rows");

  /* ------------------------------------------------------------------ */
  /* planogram: drag and drop                                            */
  /* ------------------------------------------------------------------ */
  await page.goto(BASE + "/planograms", { waitUntil: "networkidle2" });
  await wait(1000);
  const plan = await page.evaluate(() => {
    const cells = document.querySelectorAll("[data-cell]");
    return { cells: cells.length, empty: document.body.innerText.includes("Ячейка пуста") };
  });
  console.log("PLANOGRAM", JSON.stringify(plan));
  if (plan.cells !== 48) problems.push(`expected 48 grid cells, found ${plan.cells}`);

  const cellBefore = await page.evaluate(
    () => document.querySelector("[data-cell='C-0-3']")?.innerText.replace(/\s+/g, " ").trim(),
  );
  const src = await page.evaluate(() => {
    const b = document.querySelector("button.cursor-grab");
    const r = b.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2, sku: b.innerText.replace(/\s+/g, " ") };
  });
  const dst = await page.evaluate(() => {
    const c = document.querySelector("[data-cell='C-0-3']");
    const r = c.getBoundingClientRect();
    return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
  });
  await page.mouse.move(src.x, src.y);
  await page.mouse.down();
  await page.mouse.move(src.x + 40, src.y + 10, { steps: 5 });
  await page.mouse.move(dst.x, dst.y, { steps: 12 });
  await wait(200);
  const highlighted = await page.evaluate(
    () => document.querySelector("[data-cell].bg-brass-soft")?.dataset.cell ?? null,
  );
  await page.mouse.up();
  await wait(400);
  const cellAfter = await page.evaluate(
    () => document.querySelector("[data-cell='C-0-3']")?.innerText.replace(/\s+/g, " ").trim(),
  );
  const dirtyFlag = await page.evaluate(() => /не сохранено/i.test(document.body.innerText));
  console.log(`DRAG "${src.sku}" -> C-0-3: "${cellBefore}" => "${cellAfter}"`);
  console.log(`  hover highlight=${highlighted} dirty-badge=${dirtyFlag}`);
  if (!highlighted) problems.push("drag hover did not highlight the target cell");
  if (cellBefore === cellAfter) problems.push("drag & drop did not write the SKU into the cell");
  if (!dirtyFlag) problems.push("drop did not mark the planogram as unsaved");

  /* save clears the dirty badge and toasts */
  await page.evaluate(() => {
    const b = [...document.querySelectorAll("button")].find((x) =>
      x.textContent.includes("Сохранить планограмму"),
    );
    b?.click();
  });
  await wait(500);
  const afterSave = await page.evaluate(() => ({
    dirty: /не сохранено/i.test(document.body.innerText),
    toast: /сохранена/i.test(document.body.innerText),
  }));
  console.log("SAVE", JSON.stringify(afterSave));
  if (afterSave.dirty) problems.push("save did not clear the unsaved badge");

  /* ------------------------------------------------------------------ */
  /* design-system audit                                                */
  /* ------------------------------------------------------------------ */
  const audit = {};
  for (const r of ROUTES) {
    await page.goto(BASE + r, { waitUntil: "networkidle2" });
    await wait(1000);
    audit[r] = await page.evaluate(() => {
      const radii = new Set();
      const gradients = [];
      const shadows = [];
      const families = new Set();
      for (const el of document.querySelectorAll("*")) {
        const cs = getComputedStyle(el);
        const br = parseFloat(cs.borderTopLeftRadius);
        if (br > 4) radii.add(br);
        if (/gradient/.test(cs.backgroundImage) && /rgb/.test(cs.backgroundImage)) {
          const g = cs.backgroundImage;
          const isLinePattern = /rgba\(214, 212, 207/.test(g);
          const isHatch = /repeating-linear-gradient/.test(g);
          if (!isLinePattern && !isHatch) gradients.push(g.slice(0, 60));
        }
        if (cs.boxShadow && cs.boxShadow !== "none") shadows.push(cs.boxShadow.slice(0, 50));
        if (el.textContent?.trim() && el.childElementCount === 0)
          families.add(cs.fontFamily.split(",")[0].replace(/"/g, ""));
      }
      return {
        radii: [...radii],
        gradients: gradients.slice(0, 3),
        shadows: shadows.slice(0, 3),
        families: [...families],
        overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
  }
  console.log("AUDIT", JSON.stringify(audit, null, 2));
  for (const [route, a] of Object.entries(audit)) {
    if (a.radii.length) problems.push(`${route}: radius > 4px -> ${a.radii}`);
    if (a.gradients.length) problems.push(`${route}: gradient fill -> ${a.gradients}`);
    if (a.shadows.length) problems.push(`${route}: box-shadow -> ${a.shadows}`);
    const stray = a.families.filter((f) => !["Inter", "Fraunces", "JetBrains Mono"].includes(f));
    if (stray.length) problems.push(`${route}: unexpected font -> ${stray}`);
  }

  /* ------------------------------------------------------------------ */
  /* responsive                                                          */
  /* ------------------------------------------------------------------ */
  const responsive = [];
  for (const [w, h, label] of [
    [1440, 900, "laptop"],
    [1024, 1366, "iPad Pro"],
    [834, 1112, "iPad mini"],
    [390, 844, "iPhone 14"],
  ]) {
    await page.setViewport({ width: w, height: h });
    for (const r of ROUTES) {
      await page.goto(BASE + r, { waitUntil: "networkidle2" });
      await wait(600);
      const o = await page.evaluate(() => ({
        sw: document.documentElement.scrollWidth,
        cw: document.documentElement.clientWidth,
      }));
      if (o.sw > o.cw + 1)
        problems.push(`${label} overflow on ${r}: ${o.sw} > ${o.cw}`);
      responsive.push(`${label.padEnd(10)} ${r.padEnd(12)} ${o.sw}/${o.cw}`);
    }
  }
  console.log("RESPONSIVE\n" + responsive.join("\n"));

  /* mobile policy: planogram editor hidden, tasks viewable */
  await page.setViewport({ width: 390, height: 844 });
  await page.goto(BASE + "/planograms", { waitUntil: "networkidle2" });
  await wait(600);
  const mobilePlan = await page.evaluate(() => ({
    editorVisible: !!document.querySelector("[data-cell]")?.offsetParent,
    // innerText applies text-transform, so compare case-insensitively
    notice: /мобильн/i.test(document.body.innerText),
  }));
  console.log("MOBILE /planograms", JSON.stringify(mobilePlan));
  if (mobilePlan.editorVisible) problems.push("planogram editor still editable on mobile");
  if (!mobilePlan.notice) problems.push("mobile notice missing on /planograms");

  await page.goto(BASE + "/tasks", { waitUntil: "networkidle2" });
  await wait(600);
  const mobileTasks = await page.evaluate(() => {
    const card = [...document.querySelectorAll("button")].find((x) => /TSK-\d+/.test(x.innerText));
    const rows = [...document.querySelectorAll("tbody tr")].filter(
      (r) => /TSK-\d+/.test(r.innerText) && r.offsetParent,
    ).length;
    return {
      cards: [...document.querySelectorAll("button")].filter(
        (x) => /TSK-\d+/.test(x.innerText) && x.offsetParent,
      ).length,
      visibleTableRows: rows,
      firstCard: card ? card.innerText.replace(/\s+/g, " ").slice(0, 60) : null,
    };
  });
  console.log("MOBILE /tasks", JSON.stringify(mobileTasks));
  if (mobileTasks.cards === 0) problems.push("task list not viewable on mobile");
  if (mobileTasks.visibleTableRows !== 0) problems.push("wide table still shown on mobile");

  await browser.close();
  console.log("\nFAILED REQUESTS:", failed.length ? failed : "none");
  console.log("CONSOLE ERRORS:", consoleErrors.length ? consoleErrors : "none");
  console.log(
    "PROBLEMS:",
    problems.length ? problems.map((p, i) => `\n  ${i + 1}. ${p}`).join("") : "none",
  );
})();