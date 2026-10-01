import * as React from "react";

/* Three technical illustrations for «Как это работает». Same drawing
 * language as the hero: hairlines, dimension ticks, hatching, no fills. */

const S = "#1C1C1A";
const A = "#C4A574";

function Frame({
  children,
  label,
}: {
  children: React.ReactNode;
  label: string;
}) {
  return (
    <svg viewBox="0 0 340 220" className="w-full" role="img" aria-label={label}>
      <defs>
        <pattern id={`hp-${label}`} width="14" height="14" patternUnits="userSpaceOnUse">
          <path d="M14 0H0V14" fill="none" stroke="#D6D4CF" strokeWidth="0.6" />
        </pattern>
        <pattern
          id={`hatch-${label}`}
          width="5"
          height="5"
          patternTransform="rotate(45)"
          patternUnits="userSpaceOnUse"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke="#B34747" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
      <rect width="340" height="220" fill={`url(#hp-${label})`} />
      {[
        [8, 8, 1, 1],
        [332, 8, -1, 1],
        [8, 212, 1, -1],
        [332, 212, -1, -1],
      ].map(([cx, cy, sx, sy], i) => (
        <path
          key={i}
          d={`M${cx} ${cy + 14 * sy} L${cx} ${cy} L${cx + 14 * sx} ${cy}`}
          fill="none"
          stroke={A}
          strokeWidth="1"
        />
      ))}
      {children}
    </svg>
  );
}

/* 01 — Capture */
export function StepCapture() {
  return (
    <Frame label="Схема сканирования">
      {/* ceiling rail */}
      <line x1="40" y1="26" x2="300" y2="26" stroke={S} strokeWidth="1.4" />
      {[56, 170, 284].map((x) => (
        <g key={x}>
          <rect x={x - 9} y="30" width="18" height="12" fill="none" stroke={S} strokeWidth="1.4" />
          <circle cx={x} cy="36" r="3.4" fill="none" stroke={S} strokeWidth="1.2" />
        </g>
      ))}

      {/* FOV cones */}
      {[56, 170, 284].map((x, i) => (
        <path
          key={x}
          d={`M${x - 8} 42 L${x - 74} 176 L${x + 74} 176 L${x + 8} 42 Z`}
          fill="none"
          stroke={A}
          strokeWidth="0.9"
          strokeDasharray={i === 1 ? "0" : "4 3"}
          opacity={i === 1 ? 0.9 : 0.55}
        />
      ))}

      {/* shelf elevation */}
      <g>
        <rect x="44" y="104" width="252" height="76" fill="none" stroke={S} strokeWidth="1.4" />
        {[104, 128, 152, 180].map((y, i) => (
          <line key={y} x1="44" x2="296" y1={y} y2={y} stroke={S} strokeWidth={i === 0 ? 1.2 : 0.6} opacity={i === 0 ? 1 : 0.5} />
        ))}
        {[44, 107, 170, 233, 296].map((x) => (
          <line key={x} x1={x} x2={x} y1="104" y2="180" stroke={S} strokeWidth="0.5" opacity="0.35" />
        ))}
        {/* facing blocks */}
        {[
          [52, 110, 22, 15], [76, 110, 22, 15], [100, 110, 22, 15],
          [52, 134, 22, 15], [76, 134, 22, 15],
          [180, 134, 22, 15], [204, 134, 22, 15], [228, 134, 22, 15],
          [180, 158, 22, 15],
        ].map(([x, y, w, h], i) => (
          <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke="#2A6F5C" strokeWidth="0.9" />
        ))}
        {/* gap detected */}
        <rect x="252" y="134" width="22" height="15" fill="url(#hatch-Шаг 01 capture)" stroke="#B34747" strokeWidth="0.9" />
        <rect x="252" y="158" width="22" height="15" fill="none" stroke="#B34747" strokeWidth="0.9" />
      </g>

      {/* dimension */}
      <g stroke={A} strokeWidth="0.8">
        <line x1="44" x2="296" y1="192" y2="192" />
        <line x1="44" x2="44" y1="188" y2="196" />
        <line x1="296" x2="296" y1="188" y2="196" />
      </g>
      <text x="170" y="189" textAnchor="middle" className="fill-[#7E6640] font-mono" style={{ fontSize: 8 }}>
        2400
      </text>

      {/* labels */}
      <text x="40" y="20" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5, letterSpacing: "0.14em" }}>
        CAM-A12-04
      </text>
      <text x="300" y="212" textAnchor="end" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5 }}>
        09:42:11
      </text>
      <text x="286" y="148" className="fill-[#B34747] font-mono" style={{ fontSize: 7.5 }}>
        2 пусто
      </text>
    </Frame>
  );
}

/* 02 — Inference */
export function StepInference() {
  return (
    <Frame label="Схема анализа компьютерным зрением">
      {/* feed */}
      <rect x="30" y="46" width="120" height="80" fill="none" stroke={S} strokeWidth="1.3" />
      <line x1="30" x2="150" y1="86" y2="86" stroke={S} strokeWidth="0.6" opacity="0.5" />
      <line x1="30" x2="150" y1="113" y2="113" stroke={S} strokeWidth="0.6" opacity="0.5" />
      {[40, 62, 84, 106, 128].map((x) => (
        <line key={x} x1={x} x2={x} y1="46" y2="126" stroke={S} strokeWidth="0.5" opacity="0.3" />
      ))}
      {[
        [36, 52, 26, 28], [66, 52, 26, 28], [96, 52, 24, 28], [122, 52, 20, 28],
      ].map(([x, y, w, h], i) => (
        <rect key={i} x={x} y={y} width={w} height={h} fill="none" stroke="#2A6F5C" strokeWidth="0.9" />
      ))}
      <rect x="36" y="92" width="26" height="18" fill="url(#hatch-Шаг 02 inference)" stroke="#B34747" strokeWidth="0.9" />

      {/* connection */}
      <path d="M150 86 L196 86" stroke={S} strokeWidth="1.1" />
      <path d="M192 82 L198 86 L192 90" fill="none" stroke={S} strokeWidth="1.1" />

      {/* network: nodes + edges, hairline only */}
      <g>
        <rect x="198" y="52" width="106" height="68" fill="none" stroke={S} strokeWidth="1.3" />
        {[
          [222, 70], [258, 70], [222, 102], [258, 102], [240, 86],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <rect x={cx - 9} y={cy - 9} width="18" height="18" fill="none" stroke={S} strokeWidth="0.9" />
            <circle cx={cx} cy={cy} r="2" fill={S} />
          </g>
        ))}
        <g stroke={A} strokeWidth="0.8" opacity="0.9">
          <line x1="222" y1="70" x2="240" y2="86" />
          <line x1="258" y1="70" x2="240" y2="86" />
          <line x1="222" y1="102" x2="240" y2="86" />
          <line x1="258" y1="102" x2="240" y2="86" />
          <line x1="222" y1="70" x2="258" y2="70" strokeDasharray="3 2" />
          <line x1="222" y1="102" x2="258" y2="102" strokeDasharray="3 2" />
        </g>
        <text x="251" y="132" textAnchor="middle" className="fill-[#5E5E59] font-mono" style={{ fontSize: 7.5 }}>
          detr-r50
        </text>
      </g>

      {/* output */}
      <path d="M304 86 L316 86" stroke={S} strokeWidth="1.1" />
      <path d="M312 82 L318 86 L312 90" fill="none" stroke={S} strokeWidth="1.1" />

      <g>
        <rect x="216" y="146" width="106" height="54" fill="none" stroke={S} strokeWidth="1.3" />
        <line x1="216" x2="322" y1="162" y2="162" stroke={S} strokeWidth="0.6" opacity="0.5" />
        <text x="222" y="158" className="fill-[#5E5E59] font-mono" style={{ fontSize: 7.5 }}>
          классы
        </text>
        <text x="222" y="176" className="fill-[#2A6F5C] font-mono" style={{ fontSize: 8 }}>
          товар 0.987
        </text>
        <text x="222" y="188" className="fill-[#B34747] font-mono" style={{ fontSize: 8 }}>
          пусто 0.994
        </text>
        <text x="222" y="196" className="fill-[#C4A574] font-mono" style={{ fontSize: 8 }}>
          фейсинг 0.961
        </text>
      </g>

      <text x="30" y="36" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5, letterSpacing: "0.14em" }}>
        ВХОД
      </text>
      <text x="322" y="36" textAnchor="end" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5, letterSpacing: "0.14em" }}>
        ВЫХОД
      </text>
      <text x="30" y="212" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5 }}>
        38 мс · 82 детекции · порог 0.82
      </text>
    </Frame>
  );
}

/* 03 — Action */
export function StepAction() {
  return (
    <Frame label="Схема формирования задачи">
      {/* detection → task */}
      <rect x="28" y="60" width="86" height="52" fill="none" stroke={S} strokeWidth="1.3" />
      <rect x="36" y="70" width="30" height="32" fill="url(#hatch-Шаг 03 action)" stroke="#B34747" strokeWidth="0.9" />
      <rect x="70" y="70" width="30" height="32" fill="none" stroke="#2A6F5C" strokeWidth="0.9" />
      <text x="30" y="54" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5, letterSpacing: "0.14em" }}>
        АНОМАЛИЯ
      </text>

      <path d="M114 86 L142 86" stroke={S} strokeWidth="1.1" />
      <path d="M138 82 L144 86 L138 90" fill="none" stroke={S} strokeWidth="1.1" />

      {/* task card */}
      <rect x="144" y="46" width="168" height="80" fill="none" stroke={S} strokeWidth="1.4" />
      <line x1="144" x2="312" y1="64" y2="64" stroke={S} strokeWidth="0.7" opacity="0.5" />
      <rect x="144" y="46" width="3" height="80" fill="#B34747" />
      <text x="154" y="59" className="fill-[#B34747] font-mono" style={{ fontSize: 8, letterSpacing: "0.1em" }}>
        OOS · РЯД 12 / B4
      </text>
      <text x="154" y="80" className="fill-[#1C1C1A] font-mono" style={{ fontSize: 9 }}>
        Доложить 3 ед. SKU 44502
      </text>
      <text x="154" y="94" className="fill-[#5E5E59] font-mono" style={{ fontSize: 8 }}>
        Секция B · полка 4
      </text>
      <rect x="154" y="102" width="66" height="16" fill="none" stroke={S} strokeWidth="0.9" />
      <text x="160" y="113" className="fill-[#1C1C1A] font-mono" style={{ fontSize: 7.5 }}>
        Назначить
      </text>
      <rect x="228" y="102" width="66" height="16" fill="none" stroke={S} strokeWidth="0.9" />
      <text x="234" y="113" className="fill-[#5E5E59] font-mono" style={{ fontSize: 7.5 }}>
        В WMS
      </text>

      {/* routes */}
      <path d="M228 126 L228 152" stroke={A} strokeWidth="0.9" strokeDasharray="3 2" />
      <path d="M228 148 L224 154 M228 148 L232 154" stroke={A} strokeWidth="0.9" fill="none" />

      {/* two recipients */}
      <g>
        <rect x="150" y="156" width="72" height="40" fill="none" stroke={S} strokeWidth="1.2" />
        <circle cx="168" cy="172" r="7" fill="none" stroke={S} strokeWidth="1" />
        <path d="M156 190 q12 -9 24 0" fill="none" stroke={S} strokeWidth="1" />
        <text x="182" y="176" className="fill-[#1C1C1A] font-mono" style={{ fontSize: 7.5 }}>
          мерч.
        </text>
        <text x="182" y="188" className="fill-[#5E5E59] font-mono" style={{ fontSize: 7 }}>
          iPad
        </text>
      </g>
      <g>
        <rect x="240" y="156" width="72" height="40" fill="none" stroke={S} strokeWidth="1.2" />
        <rect x="250" y="164" width="18" height="14" fill="none" stroke={S} strokeWidth="1" />
        <line x1="250" y1="186" x2="268" y2="186" stroke={S} strokeWidth="1" />
        <circle cx="254" cy="168" r="1.8" fill={S} />
        <circle cx="262" cy="168" r="1.8" fill={S} />
        <text x="274" y="176" className="fill-[#1C1C1A] font-mono" style={{ fontSize: 7.5 }}>
          робот
        </text>
        <text x="274" y="188" className="fill-[#5E5E59] font-mono" style={{ fontSize: 7 }}>
          WMS
        </text>
      </g>

      <text x="28" y="212" className="fill-[#6B6B66] font-mono" style={{ fontSize: 7.5 }}>
        TSK-2024001 · дедлайн 10:24 · P1
      </text>
    </Frame>
  );
}

/* Crop-marked corner bracket used on landing cards */
export function Corner({ className }: { className?: string }) {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" className={className} aria-hidden>
      <path d="M0 12V0h12" fill="none" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}