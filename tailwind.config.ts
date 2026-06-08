import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Nexus Market — Modern Corporate marketplace theme.
 * Colors follow the Material Design 3 token set from the Stitch design kit
 * (design/stitch/.../nexus_market/DESIGN.md), with project extensions for
 * the warm-orange accent, success states, and a soft card hairline.
 */
const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./hooks/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#fbf8ff",
        "surface-dim": "#dad9e3",
        "surface-bright": "#fbf8ff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f4f2fc",
        "surface-container": "#eeedf7",
        "surface-container-high": "#e8e7f1",
        "surface-container-highest": "#e3e1eb",
        "surface-variant": "#e3e1eb",
        "on-surface": "#1a1b22",
        "on-surface-variant": "#444653",
        "inverse-surface": "#2f3037",
        "inverse-on-surface": "#f1f0fa",
        outline: "#757684",
        "outline-variant": "#c4c5d5",
        "surface-tint": "#3755c3",

        primary: "#00288e",
        "on-primary": "#ffffff",
        "primary-container": "#1e40af",
        "on-primary-container": "#a8b8ff",
        "inverse-primary": "#b8c4ff",
        "primary-fixed": "#dde1ff",
        "primary-fixed-dim": "#b8c4ff",
        "on-primary-fixed": "#001453",
        "on-primary-fixed-variant": "#173bab",

        secondary: "#006a61",
        "on-secondary": "#ffffff",
        "secondary-container": "#86f2e4",
        "on-secondary-container": "#006f66",
        "secondary-fixed": "#89f5e7",
        "secondary-fixed-dim": "#6bd8cb",
        "on-secondary-fixed": "#00201d",
        "on-secondary-fixed-variant": "#005049",

        tertiary: "#611e00",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#872d00",
        "on-tertiary-container": "#ffa583",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb59a",
        "on-tertiary-fixed": "#380d00",
        "on-tertiary-fixed-variant": "#802a00",

        error: "#ba1a1a",
        "on-error": "#ffffff",
        "error-container": "#ffdad6",
        "on-error-container": "#93000a",

        background: "#fbf8ff",
        "on-background": "#1a1b22",

        // Project extensions
        accent: "#f59e0b",
        "on-accent": "#ffffff",
        "accent-container": "#ffeccc",
        "on-accent-container": "#7a3e00",
        success: "#16a34a",
        "on-success": "#ffffff",
        "success-container": "#dcfce7",
        "on-success-container": "#166534",
        line: "#e2e8f0",
      },
      fontFamily: {
        sans: ["var(--font-sans)", ...defaultTheme.fontFamily.sans],
      },
      fontSize: {
        "display-lg": [
          "48px",
          { lineHeight: "1.2", letterSpacing: "-0.02em", fontWeight: "700" },
        ],
        "headline-lg": [
          "32px",
          { lineHeight: "1.3", letterSpacing: "-0.01em", fontWeight: "600" },
        ],
        "headline-lg-mobile": ["24px", { lineHeight: "1.3", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.4", fontWeight: "600" }],
        "body-lg": ["18px", { lineHeight: "1.6", fontWeight: "400" }],
        "body-md": ["16px", { lineHeight: "1.5", fontWeight: "400" }],
        "label-md": ["14px", { lineHeight: "1.4", fontWeight: "500" }],
        "label-sm": [
          "12px",
          { lineHeight: "1.2", letterSpacing: "0.02em", fontWeight: "600" },
        ],
      },
      spacing: {
        base: "8px",
        gutter: "24px",
        "margin-mobile": "16px",
        "margin-desktop": "40px",
      },
      maxWidth: {
        "container-max": "1280px",
      },
      borderRadius: {
        sm: "0.25rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
        full: "9999px",
      },
      boxShadow: {
        card: "0 4px 6px rgba(0,0,0,0.05)",
        floating: "0 10px 15px rgba(0,0,0,0.1)",
        "floating-lg": "0 20px 40px -12px rgba(0,0,0,0.18)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": { from: { opacity: "0" }, to: { opacity: "1" } },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        marquee: { from: { transform: "translateX(0)" }, to: { transform: "translateX(-50%)" } },
        "pulse-soft": { "0%, 100%": { opacity: "1" }, "50%": { opacity: "0.4" } },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.6s ease-out forwards",
        shimmer: "shimmer 1.6s infinite",
        marquee: "marquee 32s linear infinite",
        "pulse-soft": "pulse-soft 2s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
