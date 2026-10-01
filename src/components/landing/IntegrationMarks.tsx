import * as React from "react";

/**
 * Integration marks — monochrome, engraving-like glyphs. No vendor logos:
 * a line-drawn mark plus the protocol name is more honest in a B2B document
 * than a rasterised corporate logo.
 */

function Mark({ children }: { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 48 48" className="h-10 w-10" aria-hidden>
      <defs>
        <pattern id="eng" width="4" height="4" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
          <line x1="0" y1="0" x2="0" y2="4" stroke="#1C1C1A" strokeWidth="1" opacity="0.5" />
        </pattern>
      </defs>
      <rect x="0.5" y="0.5" width="47" height="47" fill="none" stroke="#1C1C1A" strokeWidth="1" />
      {children}
    </svg>
  );
}

export const INTEGRATIONS = [
  {
    id: "wms",
    name: "1С:Управление торговлей",
    note: "Задания пополнения, остатки, фейсинги",
    mark: (
      <Mark>
        <rect x="10" y="12" width="28" height="24" fill="url(#eng)" stroke="#1C1C1A" strokeWidth="1" />
        <path d="M16 24h16M16 30h10" stroke="#F7F6F3" strokeWidth="1.6" />
      </Mark>
    ),
  },
  {
    id: "sap",
    name: "SAP S/4HANA",
    note: "IDoc, справочник материалов, MRP",
    mark: (
      <Mark>
        <path d="M12 36 L24 12 L36 36 Z" fill="url(#eng)" stroke="#1C1C1A" strokeWidth="1" />
        <path d="M18 36 L24 25 L30 36" fill="none" stroke="#1C1C1A" strokeWidth="1" />
      </Mark>
    ),
  },
  {
    id: "wms2",
    name: "WMS Axelsoft",
    note: "Очередь replenishment, адресное хранение",
    mark: (
      <Mark>
        <rect x="11" y="16" width="26" height="16" fill="none" stroke="#1C1C1A" strokeWidth="1" />
        <path d="M11 22h26M20 16v16M28 16v16" stroke="#1C1C1A" strokeWidth="0.8" opacity="0.7" />
        <path d="M16 38h16" stroke="#C4A574" strokeWidth="1.4" />
      </Mark>
    ),
  },
  {
    id: "pos",
    name: "Кассовая линия",
    note: "Реестр продаж, выручка по SKU",
    mark: (
      <Mark>
        <rect x="12" y="13" width="24" height="14" fill="none" stroke="#1C1C1A" strokeWidth="1" />
        <path d="M16 36h16l-3-9H19z" fill="url(#eng)" stroke="#1C1C1A" strokeWidth="1" />
      </Mark>
    ),
  },
  {
    id: "promo",
    name: "Trade Marketing",
    note: "Промо-механики, сезонные блоки",
    mark: (
      <Mark>
        <circle cx="24" cy="24" r="13" fill="url(#eng)" stroke="#1C1C1A" strokeWidth="1" />
        <path d="M24 11v26M11 24h26" stroke="#F7F6F3" strokeWidth="1.4" />
        <path d="M15 15l18 18M33 15L15 33" stroke="#F7F6F3" strokeWidth="0.9" />
      </Mark>
    ),
  },
  {
    id: "scales",
    name: "Весы и прилавок",
    note: "Весовой товар, корректировка фасовки",
    mark: (
      <Mark>
        <path d="M13 34h22l-4-18H17z" fill="url(#eng)" stroke="#1C1C1A" strokeWidth="1" />
        <circle cx="24" cy="18" r="3" fill="none" stroke="#1C1C1A" strokeWidth="1" />
      </Mark>
    ),
  },
];