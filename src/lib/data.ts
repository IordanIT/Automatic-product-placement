import type {
  CatalogSku,
  Detection,
  Device,
  FacetStatus,
  Store,
  Task,
} from "./types";

/* ------------------------------------------------------------------ *
 * Deterministic pseudo-random source — the dataset must be identical *
 * on server and client render, so Math.random() is not acceptable.    *
 * ------------------------------------------------------------------ */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const rnd = mulberry32(20240917);
const pick = <T,>(arr: readonly T[]): T => arr[Math.floor(rnd() * arr.length)]!;
const between = (a: number, b: number) => a + rnd() * (b - a);

/* ------------------------------------------------------------------ *
 * Frame geometry — the shelf capture lives in a 1600×900 plate space *
 * ------------------------------------------------------------------ */
export const PLATE = { w: 1600, h: 900 };

export const BAYS = ["A", "B", "C", "D", "E", "F", "G", "H"] as const;
export const LEVELS = [4, 3, 2, 1] as const; // top → bottom of the frame

const FRAME = { x: 0.055, y: 0.085, w: 0.89, h: 0.845 };

const SHELF_NAMES = [
  ["Coca-Cola 0.5", "Спрайт 0.5", "Фанта 0.5", "Пиво Heineken", "Пиво Tuborg"],
  ["Lays Классик 70г", "Lay's Сметана&Лук", "Cheetos 45г", "Хрустящие чипсы", "Lay's Max 100г"],
  ["Nesquik 340г", "Milo 500г", "Nescafé Classic", "Choco Pie", "Mars Bounty"],
  ["Oatly Barista 1л", "Alpro Soya 1л", "Valio Milk 1л", "Arla Protein", "VitaCoco"],
] as const;

const BRANDS = [
  "Coca-Cola HBC",
  "PepsiCo",
  "PepsiCo",
  "Mondelez",
  "Kraft Heinz",
  "Nestlé",
  "Mars",
  "Oatly",
  "Arla",
  "Lactalis",
] as const;

/* ------------------------------------------------------------------ *
 * Detections — what the CV pipeline returned for frame SH-1142       *
 * ------------------------------------------------------------------ */
function buildDetections(): Detection[] {
  const out: Detection[] = [];
  const levelH = FRAME.h / LEVELS.length;
  const bayW = FRAME.w / BAYS.length;

  LEVELS.forEach((level, li) => {
    const shelf = SHELF_NAMES[li]!;
    BAYS.forEach((bay, bi) => {
      const bayX = FRAME.x + bi * bayW;
      const inner = 0.012;

      // Number of facing slots inside this bay
      const slots = 2 + Math.floor(rnd() * 3);
      const slotW = (bayW - inner * 2) / slots;

      // Roll the state of the whole bay once
      const roll = rnd();
      const bayState: FacetStatus =
        roll > 0.78 ? "oos" : roll > 0.6 ? "misplaced" : roll > 0.46 ? "facing" : "ok";

      for (let s = 0; s < slots; s++) {
        const name = bayState === "misplaced" ? pick(SHELF_NAMES[(li + 1) % SHELF_NAMES.length]!) : shelf[s % shelf.length]!;
        const expected = 3 + Math.floor(rnd() * 4);

        let status: FacetStatus = "ok";
        if (bayState === "misplaced" && s === 0) status = "misplaced";
        else if (bayState === "facing" && s % 2 === 0) status = "facing";
        else if (bayState === "oos" && s === slots - 1) status = "oos";
        else if (rnd() > 0.9) status = "oos";

        const actual =
          status === "oos"
            ? 0
            : status === "misplaced"
              ? Math.max(1, expected - 2 - Math.floor(rnd() * 2))
              : Math.max(0, expected - (rnd() > 0.82 ? 1 : 0));

        const fill = status === "oos" ? between(0.35, 0.6) : between(0.82, 1);
        const w = slotW * fill;
        const x = bayX + inner + slotW * s + (slotW * inner * 2 - w) / 2;
        const h = levelH * between(0.6, 0.8);
        const y = FRAME.y + li * levelH + (levelH - h) / 2 + levelH * 0.09;

        out.push({
          id: `D-${li}${bi}${s}`,
          sku: `44${(500 + li * 137 + bi * 29 + s * 7).toString().padStart(3, "0")}`,
          name,
          brand: pick(BRANDS),
          x,
          y,
          w,
          h,
          facing: status === "facing" ? Math.round(between(0.3, 0.62) * 100) : 100,
          expected,
          actual,
          confidence: Number(between(0.87, 0.997).toFixed(3)),
          status,
          aisle: "12",
          bay,
          level,
        });
      }
    });
  });

  return out;
}

export const DETECTIONS: Detection[] = buildDetections();

/* ------------------------------------------------------------------ *
 * Shelf-level aggregates                                              *
 * ------------------------------------------------------------------ */
export const SHELF_META = {
  id: "SH-1142",
  store: "Гипермаркет «Океан»",
  storeId: "msk-014",
  aisle: "12",
  planogram: "PL-2024-118 «Напитки 0.5л»",
  capturedAt: "2024-09-17 09:42:11",
  device: "CAM-A12-04",
  camera: "2.4 MP · f/2.8 · 6 mm",
  score: 87,
  resolved: 71,
  total: DETECTIONS.length,
  unitsExpected: DETECTIONS.reduce((a, d) => a + d.expected, 0),
  unitsActual: DETECTIONS.reduce((a, d) => a + d.actual, 0),
};

export const STATUS_LABEL: Record<FacetStatus, string> = {
  ok: "СООТВЕТСТВУЕТ",
  oos: "OOS · НЕТ ТОВАРА",
  misplaced: "НЕВЕРНАЯ ВЫКЛАДКА",
  facing: "ФЕЙСИНГ",
  phantom: "ФАНТОМНЫЙ ОСТАТОК",
};

export const STATUS_SHORT: Record<FacetStatus, string> = {
  ok: "ОК",
  oos: "OOS",
  misplaced: "MISPLACED",
  facing: "FACING",
  phantom: "PHANTOM",
};

export const STATUS_COLOR: Record<FacetStatus, string> = {
  ok: "#2A6F5C",
  oos: "#B34747",
  misplaced: "#B34747",
  facing: "#C4A574",
  phantom: "#C4A574",
};

/* ------------------------------------------------------------------ *
 * Tasks                                                                *
 * ------------------------------------------------------------------ */
const ASSIGNEES = [
  "И. Полозова",
  "М. Гаврилов",
  "А. Северов",
  "Р. Тимурзе",
  "Ю. Ким",
  "О. Дроздова",
  null,
] as const;

function buildTasks(): Task[] {
  const anomalies = DETECTIONS.filter((d) => d.status !== "ok");
  const types: Task["type"][] = ["oos", "misplaced", "facing", "phantom"];
  const base = Date.UTC(2024, 8, 17, 9, 45);
  const stores = ["Гипермаркет «Океан»", "Магазин «Проспект»", "Гипермаркет «Ладога»"];

  return anomalies.slice(0, 46).map((d, i) => {
    const roll = rnd();
    const type = types[
      d.status === "misplaced" ? 1 : d.status === "facing" ? 2 : i % 9 === 4 ? 3 : 0
    ]!;
    const severity: Task["severity"] =
      type === "oos" ? (roll > 0.45 ? "critical" : "major") : type === "misplaced" ? "major" : "minor";

    const status: Task["status"] =
      roll > 0.86 ? "done" : roll > 0.66 ? "in_progress" : roll > 0.32 ? "assigned" : "new";

    const mins = Math.round(15 + rnd() * 300);
    const qty = type === "oos" ? Math.max(1, d.expected - d.actual) : 1;

    const body =
      type === "oos"
        ? `Доложить ${qty} ед. SKU ${d.sku} (${d.name}) в секцию ${d.bay}${d.level}. Свободных фейсингов: ${d.expected - d.actual}.`
        : type === "misplaced"
          ? `Товар стоит вне своей секции. Переставить SKU ${d.sku} (${d.name}) в секцию ${d.bay}${d.level}, освободив ${d.expected - d.actual} фейсинга.`
          : type === "facing"
            ? `Развернуть фейсинг SKU ${d.sku} (${d.name}) в секции ${d.bay}${d.level}. Ориентация ${d.facing}%.`
            : `По данным WMS SKU ${d.sku} числится в остатке, на полке отсутствует. Требуется пересчёт ячейки ${d.bay}${d.level}.`;

    return {
      id: `TSK-${2024}${String(i + 1).padStart(3, "0")}`,
      type,
      severity,
      store: stores[i % stores.length]!,
      aisle: d.aisle,
      bay: d.bay,
      level: d.level,
      sku: d.sku,
      title: d.name,
      body,
      assignee: status === "new" ? null : ASSIGNEES[i % ASSIGNEES.length]!,
      deadline: new Date(base + (i % 12) * 5400_000 + 3600_000).toISOString(),
      status,
      createdAt: new Date(base + i * 132_000).toISOString(),
      confidence: d.confidence,
      qty,
      photoBefore: "before",
    };
  });
}

export const TASKS: Task[] = buildTasks();

export const TASK_TYPE_LABEL: Record<Task["type"], string> = {
  oos: "OOS",
  misplaced: "НЕВЕРНАЯ ВЫКЛАДКА",
  facing: "ФЕЙСИНГ",
  phantom: "ФАНТОМНЫЙ ОСТАТОК",
};

export const TASK_STATUS_LABEL: Record<Task["status"], string> = {
  new: "Ожидает",
  assigned: "Назначено",
  in_progress: "В работе",
  done: "Выполнено",
};

/* ------------------------------------------------------------------ *
 * Stores / hardware                                                   *
 * ------------------------------------------------------------------ */
export const STORES: Store[] = [
  { id: "msk-014", name: "Гипермаркет «Океан»", city: "Москва", format: "Гипермаркет", shelves: 412, osa: 94.2, devices: 26, lastScan: "2 мин назад" },
  { id: "msk-031", name: "Магазин «Проспект»", city: "Москва", format: "У дома", shelves: 138, devices: 11, osa: 88.7, lastScan: "9 мин назад" },
  { id: "spb-007", name: "Гипермаркет «Ладога»", city: "Санкт-Петербург", format: "Гипермаркет", shelves: 356, devices: 22, osa: 91.5, lastScan: "6 мин назад" },
  { id: "ekb-002", name: "Супермаркет «Урал»", city: "Екатеринбург", format: "Супермаркет", shelves: 264, devices: 17, osa: 84.1, lastScan: "24 мин назад" },
  { id: "nsk-019", name: "Магазин «Сибирь»", city: "Новосибирск", format: "У дома", shelves: 121, devices: 9, osa: 79.8, lastScan: "51 мин назад" },
  { id: "kzn-004", name: "Гипермаркет «Волга»", city: "Казань", format: "Гипермаркет", shelves: 298, devices: 20, osa: 90.3, lastScan: "12 мин назад" },
];

export const DEVICES: Device[] = [
  { id: "CAM-A12-04", name: "Камера A12-04", kind: "camera", zone: "Ряд 12 · Напитки", status: "online", lastScan: "09:42:11", uptime: 99.4, fps: 12 },
  { id: "CAM-A12-05", name: "Камера A12-05", kind: "camera", zone: "Ряд 12 · Напитки", status: "online", lastScan: "09:41:58", uptime: 98.9, fps: 12 },
  { id: "ROB-04", name: "Робот-сканер RB-04", kind: "robot", zone: "Проход 4–8", status: "online", lastScan: "09:40:12", uptime: 97.2, fps: 4 },
  { id: "ROB-05", name: "Робот-сканер RB-05", kind: "robot", zone: "Проход 9–14", status: "degraded", lastScan: "09:12:03", uptime: 91.6, fps: 2 },
  { id: "HHT-018", name: "Терминал мерчандайзера", kind: "handheld", zone: "Зал · Секция C", status: "online", lastScan: "09:44:20", uptime: 99.9, fps: 30 },
  { id: "CAM-B07-01", name: "Камера B07-01", kind: "camera", zone: "Ряд 07 · Снеки", status: "offline", lastScan: "07:58:40", uptime: 62.1, fps: 0 },
  { id: "CAM-C02-02", name: "Камера C02-02", kind: "camera", zone: "Ряд 02 · Молочное", status: "online", lastScan: "09:43:55", uptime: 98.1, fps: 12 },
  { id: "HHT-024", name: "Терминал мерчандайзера", kind: "handheld", zone: "Зал · Секция B", status: "online", lastScan: "09:38:02", uptime: 99.5, fps: 30 },
];

/* ------------------------------------------------------------------ *
 * Catalogue + planogram                                               *
 * ------------------------------------------------------------------ */
function buildCatalog(): CatalogSku[] {
  const rows: Array<[string, string, string, string, string]> = [
    ["44502", "Coca-Cola 0.5", "Coca-Cola HBC", "Напитки", "Бутылка ПЭТ"],
    ["44503", "Спрайт 0.5", "Coca-Cola HBC", "Напитки", "Бутылка ПЭТ"],
    ["44511", "Фанта 0.5 Апельсин", "Coca-Cola HBC", "Напитки", "Бутылка ПЭТ"],
    ["44520", "Heineken 0.5", "Heineken", "Пиво", "Бутылка стекло"],
    ["44522", "Tuborg Green 0.5", "Carlsberg", "Пиво", "Бутылка стекло"],
    ["45118", "Lay's Классик 70 г", "PepsiCo", "Снеки", "Пакет"],
    ["45120", "Lay's Сметана и лук 70 г", "PepsiCo", "Снеки", "Пакет"],
    ["45133", "Cheetos 45 г", "PepsiCo", "Снеки", "Пакет"],
    ["45140", "Lay's Max 100 г", "PepsiCo", "Снеки", "Пакет"],
    ["46201", "Nesquik 340 г", "Nestlé", "Какао и кофе", "Банка"],
    ["46205", "Milo 500 г", "Nestlé", "Какао и кофе", "Банка"],
    ["46210", "Nescafé Classic 100 г", "Nestlé", "Какао и кофе", "Банка"],
    ["46215", "Choco Pie 39 г", "Mars", "Сладкое", "Упаковка"],
    ["46218", "Mars Bounty 55 г", "Mars", "Сладкое", "Упаковка"],
    ["47300", "Oatly Barista Edition 1 л", "Oatly", "Растительное молоко", "Тетрапак"],
    ["47304", "Alpro Soya 1 л", "Alpro", "Растительное молоко", "Тетрапак"],
    ["47310", "Valio Milk 1 л", "Valio", "Молочное", "Пакет"],
    ["47315", "Arla Protein 1 л", "Arla", "Молочное", "Пакет"],
    ["47320", "VitaCoco 1 л", "Vita Coco", "Напитки", "Тетрапак"],
    ["48101", "Red Bull 250 мл", "Red Bull", "Энергетики", "Банка"],
  ];

  return rows.map(([sku, name, brand, category, unit], i) => ({
    sku,
    name,
    brand,
    category,
    unit,
    barcode: `460${(1000000 + i * 73111).toString()}`,
    height: Number(between(14, 26).toFixed(1)),
    width: Number(between(6, 11).toFixed(1)),
    depth: Number(between(6, 9).toFixed(1)),
    min: 2 + Math.floor(rnd() * 3),
    max: 5 + Math.floor(rnd() * 4),
  }));
}

export const CATALOG: CatalogSku[] = buildCatalog();

export const CATEGORIES = ["Напитки", "Пиво", "Снеки", "Какао и кофе", "Сладкое", "Растительное молоко", "Молочное", "Энергетики"];

/* ------------------------------------------------------------------ *
 * Analytics series — deterministic                                     *
 * ------------------------------------------------------------------ */
export const OOS_SERIES = CATEGORIES.map((c, i) => {
  const base = 18 + i * 6;
  return {
    label: c,
    current: Number((base * between(0.8, 1.35)).toFixed(1)),
    previous: Number((base * between(1.1, 1.7)).toFixed(1)),
  };
});

export const OSA_TREND = Array.from({ length: 14 }, (_, i) => ({
  day: `${i + 4}`.padStart(2, "0"),
  osa: Number((88.4 + i * 0.42 + between(-1.6, 1.9)).toFixed(1)),
  plan: 94,
}));

export const TOP_PROBLEM_SKUS = [
  { sku: "44502", name: "Coca-Cola 0.5", oos: 212, misplaced: 34, total: 246, osa: 81.2, delta: -4.8 },
  { sku: "45118", name: "Lay's Классик 70 г", oos: 184, misplaced: 61, total: 245, osa: 79.4, delta: -7.1 },
  { sku: "44503", name: "Спрайт 0.5", oos: 141, misplaced: 22, total: 163, osa: 85.9, delta: -1.3 },
  { sku: "46201", name: "Nesquik 340 г", oos: 118, misplaced: 48, total: 166, osa: 83.1, delta: -5.2 },
  { sku: "44511", name: "Фанта 0.5", oos: 96, misplaced: 14, total: 110, osa: 89.6, delta: 0.8 },
  { sku: "47300", name: "Oatly Barista 1 л", oos: 88, misplaced: 39, total: 127, osa: 86.2, delta: -2.4 },
  { sku: "45120", name: "Lay's Сметана и лук", oos: 74, misplaced: 27, total: 101, osa: 88.0, delta: -3.0 },
  { sku: "46210", name: "Nescafé Classic 100 г", oos: 61, misplaced: 12, total: 73, osa: 91.7, delta: 1.1 },
];

/* Heatmap: schematic top-down store layout, viewBlock zones */
export const HEATMAP = {
  w: 1000,
  h: 620,
  zones: [
    { id: "Z1", label: "Проход 1–3", x: 40, y: 60, w: 200, h: 180, osa: 96.4 },
    { id: "Z2", label: "Проход 4–6", x: 260, y: 60, w: 200, h: 180, osa: 91.2 },
    { id: "Z3", label: "Проход 7–9", x: 480, y: 60, w: 200, h: 180, osa: 78.6 },
    { id: "Z4", label: "Проход 10–12", x: 700, y: 60, w: 260, h: 180, osa: 69.3 },
    { id: "Z5", label: "Холодный цех", x: 40, y: 260, w: 280, h: 140, osa: 98.1 },
    { id: "Z6", label: "Молочный", x: 340, y: 260, w: 200, h: 140, osa: 94.7 },
    { id: "Z7", label: "Снеки", x: 560, y: 260, w: 200, h: 140, osa: 82.3 },
    { id: "Z8", label: "Напитки", x: 780, y: 260, w: 180, h: 140, osa: 74.8 },
    { id: "Z9", label: "Касса", x: 40, y: 420, w: 180, h: 120, osa: 100 },
    { id: "Z10", label: "Служебная", x: 240, y: 420, w: 160, h: 120, osa: 100 },
    { id: "Z11", label: "Пекарня", x: 420, y: 420, w: 200, h: 120, osa: 99.2 },
    { id: "Z12", label: "Вход / выход", x: 640, y: 420, w: 320, h: 120, osa: 100 },
  ],
};

/* Kpi grid */
export const KPIS = [
  {
    id: "osa",
    label: "Уровень сервиса полки (OSA)",
    value: "94.2",
    unit: "%",
    delta: -1.4,
    target: 96,
    note: "За 14 дней",
  },
  {
    id: "oos",
    label: "Расчётный OOS",
    value: "1 284",
    unit: "ед.",
    delta: -18.6,
    target: null,
    note: "За 7 дней",
  },
  {
    id: "plg",
    label: "Точность планограммы",
    value: "91.8",
    unit: "%",
    delta: 3.1,
    target: 95,
    note: "Доля фейсингов 1:1",
  },
  {
    id: "ttr",
    label: "Среднее время закрытия",
    value: "23",
    unit: "мин",
    delta: -34.0,
    target: 30,
    note: "От сигнала CV",
  },
];

export const TASK_FLOW = [
  { stage: "Обнаружено CV", count: 4820 },
  { stage: "Валидация", count: 4612 },
  { stage: "Задача", count: 4180 },
  { stage: "Назначено", count: 3901 },
  { stage: "Выполнено", count: 3604 },
];