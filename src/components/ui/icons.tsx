import * as React from "react";

/**
 * Single icon system: 24×24 grid, 1.5px stroke, butt caps, miter joins.
 * No icon library. Every glyph is drawn as engineering linework so the set
 * reads as one family next to the drafting-style illustrations.
 */

type IconProps = React.SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 20, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/* -- navigation -------------------------------------------------------- */

export const IconOverview = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3h7v7H3zM14 3h7v4h-7zM14 10h7v11h-7zM3 13h7v8H3z" />
  </Svg>
);

export const IconShelf = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4v16M21 4v16M3 9h18M3 15h18" />
    <path d="M5.5 9v4.5h3V9M11 9v4.5h2.5V9M17 9v4.5h2.5V9" />
  </Svg>
);

export const IconPlanogram = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4h18M3 12h18M3 20h18" />
    <path d="M6 4v8M11 4v8M17 4v8M8 12v8M14 12v8M19 12v8" />
  </Svg>
);

export const IconTasks = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 3h10v18H7zM9.5 3V2M14.5 3V2" />
    <path d="M9.5 9.5l1.8 1.8 3.4-3.6M9.5 15.5l1.8 1.8 3.4-3.6" />
  </Svg>
);

export const IconAnalytics = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 21h18M6 21V11M11 21V4M16 21v-7M21 21v-4" />
  </Svg>
);

export const IconSettings = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 6h12M18 6h3M3 12h5M11 12h10M3 18h12M18 18h3" />
    <path d="M16 3v6M8 9v6M16 15v6" />
  </Svg>
);

/* -- interface --------------------------------------------------------- */

export const IconSearch = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4L21 21" />
  </Svg>
);

export const IconChevronDown = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 9.5l6 6 6-6" />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9.5 5.5l6.5 6.5-6.5 6.5" />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M14.5 5.5L8 12l6.5 6.5" />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 12h17M15 7l5 5-5 5" />
  </Svg>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 17L17 7M8 7h9v9" />
  </Svg>
);

export const IconClose = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 5l14 14M19 5L5 19" />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12.5l5 5L20 6.5" />
  </Svg>
);

export const IconPlus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M4 12h16" />
  </Svg>
);

export const IconMinus = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 12h16" />
  </Svg>
);

export const IconDots = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 5.5v.01M12 12v.01M12 18.5v.01" strokeWidth={2} />
  </Svg>
);

export const IconPanelLeft = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4v16M21 4v16M9 4v16" />
    <path d="M13 9l-3 3 3 3" />
  </Svg>
);

export const IconDownload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3v12M7.5 11L12 15.5 16.5 11M4 20h16" />
  </Svg>
);

export const IconUpload = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 16V4M7.5 8.5L12 4l4.5 4.5M4 20h16" />
  </Svg>
);

export const IconZoomIn = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4L21 21M10.5 7.5v6M7.5 10.5h6" />
  </Svg>
);

export const IconZoomOut = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="10.5" cy="10.5" r="6.5" />
    <path d="M15.4 15.4L21 21M7.5 10.5h6" />
  </Svg>
);

export const IconFit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 8V3h5M21 8V3h-5M3 16v5h5M21 16v5h-5" />
  </Svg>
);

export const IconLayers = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3l8.5 4.5L12 12 3.5 7.5 12 3z" />
    <path d="M3.5 12.5L12 17l8.5-4.5M3.5 17L12 21.5 20.5 17" />
  </Svg>
);

export const IconGrid = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2 12s3.8-6.5 10-6.5S22 12 22 12s-3.8 6.5-10 6.5S2 12 2 12z" />
    <circle cx="12" cy="12" r="2.6" />
  </Svg>
);

export const IconFilter = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5h18l-7 8v6l-4 2v-8L3 5z" />
  </Svg>
);

export const IconRefresh = (p: IconProps) => (
  <Svg {...p}>
    <path d="M20 12a8 8 0 1 1-2.6-5.9M20 4v4h-4" />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7v5.5l3.5 2" />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="8" r="3.75" />
    <path d="M4.5 20.5c1-4 4-6 7.5-6s6.5 2 7.5 6" />
  </Svg>
);

export const IconBell = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 17V11a6 6 0 0 1 12 0v6l1.5 2.5h-15L6 17z" />
    <path d="M10 19.5a2 2 0 0 0 4 0" />
  </Svg>
);

export const IconAlert = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 3.5L21.5 20.5h-19L12 3.5z" />
    <path d="M12 10v4.5M12 17v.01" strokeWidth={1.8} />
  </Svg>
);

export const IconCrosshair = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 1.5v5M12 17.5v5M1.5 12h5M17.5 12h5" />
  </Svg>
);

export const IconEdit = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 20h4L20 8l-4-4L4 16v4z" />
    <path d="M14.5 5.5l4 4" />
  </Svg>
);

export const IconTrash = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 6.5h16M9 6.5V4h6v2.5M6 6.5L7 21h10l1-14.5M10 10v7.5M14 10v7.5" />
  </Svg>
);

export const IconCopy = (p: IconProps) => (
  <Svg {...p}>
    <path d="M8 3h13v13M4 8h13v13H4z" />
  </Svg>
);

export const IconLink = (p: IconProps) => (
  <Svg {...p}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 1 0-5.7-5.7l-1.3 1.3" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 1 0 5.7 5.7l1.3-1.3" />
  </Svg>
);

export const IconKey = (p: IconProps) => (
  <Svg {...p}>
    <circle cx="7.5" cy="12" r="3.5" />
    <path d="M11 12h10M18 12v3.5M15 12v2.5" />
  </Svg>
);

export const IconCamera = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 7.5h4l1.5-2.5h7L17 7.5h4v12H3z" />
    <circle cx="12" cy="13.5" r="3.75" />
  </Svg>
);

export const IconRobot = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 9h16v11H4zM12 9V4M12 4l3 2" />
    <path d="M8.5 13v.01M15.5 13v.01M9.5 16.5h5" strokeWidth={1.8} />
  </Svg>
);

export const IconTerminal = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 4h18v16H3zM6.5 9l3 3-3 3M12 15h5.5" />
  </Svg>
);

export const IconStore = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 9l1.5-5h15L21 9M3 9h18M3 9v11h18V9" />
    <path d="M9.5 20v-6h5v6" />
  </Svg>
);

export const IconBarcode = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 5v14M6 5v14M9 5v10M12 5v14M15.5 5v10M18.5 5v14" />
  </Svg>
);

export const IconRuler = (p: IconProps) => (
  <Svg {...p}>
    <path d="M2.5 14.5l12-12 7 7-12 12z" />
    <path d="M6 11l2 2M9 8l2 2M12 5l2 2M15.5 11l2 2" />
  </Svg>
);

export const IconInbox = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 13.5L5.5 4h13L21 13.5v6.5H3z" />
    <path d="M3 13.5h5l1 2.5h6l1-2.5h5" />
  </Svg>
);

export const IconLogoMark = (p: IconProps) => (
  <Svg {...p}>
    <path d="M3 3v18M3 21h18" />
    <path d="M7 18V8.5h7.5" />
    <path d="M7 13h7.5" />
    <path d="M18.5 8.5V18" />
  </Svg>
);

export const ICON_MAP = {
  overview: IconOverview,
  shelf: IconShelf,
  planogram: IconPlanogram,
  tasks: IconTasks,
  analytics: IconAnalytics,
  settings: IconSettings,
} as const;

export type IconName = keyof typeof ICON_MAP;