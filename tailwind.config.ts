import type { Config } from "tailwindcss";
import defaultTheme from "tailwindcss/defaultTheme";

/**
 * Nexus Market — Modern Corporate marketplace theme (slate + deep-navy palette).
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
        surface: "#f8fafc",
        "surface-dim": "#e2e8f0",
        "surface-bright": "#ffffff",
        "surface-container-lowest": "#ffffff",
        "surface-container-low": "#f1f5f9",
        "surface-container": "#eef2f6",
        "surface-container-high": "#e2e8f0",
        "surface-container-highest": "#dbe2ea",
        "surface-variant": "#e2e8f0",
        "on-surface": "#0f172a",
        "on-surface-variant": "#475569",
        "inverse-surface": "#1e293b",
        "inverse-on-surface": "#f1f5f9",
        outline: "#64748b",
        "outline-variant": "#cbd5e1",
        "surface-tint": "#1e3a66",

        primary: "#12284c",
        "on-primary": "#ffffff",
        "primary-container": "#1e3a66",
        "on-primary-container": "#c7d5ea",
        "inverse-primary": "#a9bfdf",
        "primary-fixed": "#e1e9f4",
        "primary-fixed-dim": "#c7d5ea",
        "on-primary-fixed": "#0a1830",
        "on-primary-fixed-variant": "#1e3a66",

        secondary: "#0f766e",
        "on-secondary": "#ffffff",
        "secondary-container": "#ccfbf1",
        "on-secondary-container": "#115e59",
        "secondary-fixed": "#ccfbf1",
        "secondary-fixed-dim": "#99f6e4",
        "on-secondary-fixed": "#042f2e",
        "on-secondary-fixed-variant": "#115e59",

        tertiary: "#611e00",
        "on-tertiary": "#ffffff",
        "tertiary-container": "#872d00",
        "on-tertiary-container": "#ffa583",
        "tertiary-fixed": "#ffdbce",
        "tertiary-fixed-dim": "#ffb59a",
        "on-tertiary-fixed": "#380d00",
        "on-tertiary-fixed-variant": "#802a00",

        error: "#b91c1c",
        "on-error": "#ffffff",
        "error-container": "#fee2e2",
        "on-error-container": "#7f1d1d",

        background: "#f8fafc",
        "on-background": "#0f172a",

        // Project extensions
        accent: "#b45309",
        "on-accent": "#ffffff",
        "accent-container": "#fef3c7",
        "on-accent-container": "#78350f",
        success: "#15803d",
        "on-success": "#ffffff",
        "success-container": "#dcfce7",
        "on-success-container": "#14532d",
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
