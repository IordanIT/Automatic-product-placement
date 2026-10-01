import type { Config } from "tailwindcss";

/**
 * Design system — "Architectural Precision & Editorial Retail"
 * Every colour, radius, font and shadow used by the product is declared here.
 * Nothing in `src/` is allowed to introduce an arbitrary value outside this scale.
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    colors: {
      // Paper / concrete surfaces
      paper: {
        DEFAULT: "#F7F6F3", // primary background
        sunk: "#EFEDE8", // secondary surface: sections, cards
        raised: "#FBFAF8", // raised surface inside sunk areas
      },
      // Warm neutrals — muted/faint are tuned to clear WCAG AA (4.5:1) on
      // paper.raised, paper and paper.sunk, so small mono labels stay legible.
      ink: {
        DEFAULT: "#1C1C1A", // primary text
        muted: "#5E5E59", // secondary text
        faint: "#6B6B66", // tertiary / placeholders
      },
      line: {
        DEFAULT: "#D6D4CF", // borders & grid
        strong: "#B9B6AF", // emphasised dividers
        faint: "#E4E2DD", // hairline inside surfaces
      },
      // Accents
      slate: {
        DEFAULT: "#2C3E50", // action / interactive
        deep: "#1E2C39",
        soft: "#EAEDF0",
        line: "#C3CBD3",
      },
      forest: {
        DEFAULT: "#2A6F5C", // success / on-shelf
        deep: "#1E5244",
        soft: "#E4EEEA",
        line: "#B3CFC5",
      },
      brick: {
        DEFAULT: "#B34747", // error / attention
        deep: "#8B3434",
        soft: "#F4E7E7",
        line: "#E0C4C4",
      },
      brass: {
        DEFAULT: "#C4A574", // detail / highlight / hover — fills & rules only
        deep: "#7E6640", // the readable shade, for text on paper
        soft: "#F3ECE0",
        line: "#DECFB2",
      },
    },
    fontFamily: {
      display: ["var(--font-display)", "Fraunces", "Georgia", "serif"],
      sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      mono: ["var(--font-mono)", "JetBrains Mono", "ui-monospace", "monospace"],
    },
    fontSize: {
      // Editorial scale — deliberately tight leading on display sizes
      micro: ["0.6875rem", { lineHeight: "1rem", letterSpacing: "0.08em" }],
      micro2: ["0.75rem", { lineHeight: "1.125rem", letterSpacing: "0.06em" }],
      small: ["0.8125rem", { lineHeight: "1.25rem" }],
      body: ["0.9375rem", { lineHeight: "1.5625rem" }],
      lead: ["1.0625rem", { lineHeight: "1.6875rem" }],
      h4: ["1.375rem", { lineHeight: "1.625rem", letterSpacing: "-0.012em" }],
      h3: ["1.75rem", { lineHeight: "2rem", letterSpacing: "-0.016em" }],
      h2: ["2.375rem", { lineHeight: "2.5rem", letterSpacing: "-0.022em" }],
      h1: ["3.375rem", { lineHeight: "3.25rem", letterSpacing: "-0.03em" }],
      display: ["4.75rem", { lineHeight: "4.25rem", letterSpacing: "-0.035em" }],
    },
    borderRadius: {
      none: "0px",
      xs: "2px",
      sm: "2px",
      DEFAULT: "2px",
      md: "2px",
      lg: "2px",
      xl: "2px",
      "2xl": "2px",
      "3xl": "2px",
      full: "2px",
    },
    boxShadow: {
      // Hairline only. Depth comes from borders, not blur.
      none: "none",
      hairline: "0 1px 0 0 #D6D4CF",
      press: "inset 0 1px 0 0 rgba(28,28,26,0.04)",
    },
    transitionTimingFunction: {
      precise: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    extend: {
      maxWidth: {
        shell: "1560px",
        editorial: "1240px",
      },
      spacing: {
        rail: "64px",
        railOpen: "240px",
        topbar: "56px",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(6px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "draw-x": {
          from: { transform: "scaleX(0)" },
          to: { transform: "scaleX(1)" },
        },
        "draw-y": {
          from: { strokeDashoffset: "1" },
          to: { strokeDashoffset: "0" },
        },
        "sweep": {
          from: { transform: "translateX(-100%)" },
          to: { transform: "translateX(300%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 420ms cubic-bezier(0.4, 0, 0.2, 1) both",
        "sweep": "sweep 1.6s cubic-bezier(0.4, 0, 0.2, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;