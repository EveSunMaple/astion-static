/** @type {import('tailwindcss').Config} */
import { addDynamicIconSelectors } from "@iconify/tailwind";
import typography from "@tailwindcss/typography";
import daisyUI from "daisyui";

/**
 * Notion-like daisyUI themes.
 * The theme names must match `site.theme.light` / `site.theme.dark`
 * in astion.config.yaml.
 */
const notionLight = {
  "color-scheme": "light",
  "--rounded-box": "0.5rem",
  "--rounded-btn": "0.375rem",
  "--rounded-badge": "1rem",
  "--animation-btn": "0",
  "--animation-input": "0",
  "--btn-focus-scale": "1",
  "--border-btn": "0px",
  "--tab-border": "1px",
  "--tab-radius": "0.375rem",
  primary: "#2383e2",
  "primary-content": "#ffffff",
  secondary: "#6940a5",
  "secondary-content": "#ffffff",
  accent: "#d9730d",
  "accent-content": "#ffffff",
  neutral: "#37352f",
  "neutral-content": "#ffffff",
  "base-100": "#ffffff",
  "base-200": "#f7f7f5",
  "base-300": "#eeece9",
  "base-content": "#37352f",
  info: "#2383e2",
  "info-content": "#ffffff",
  success: "#0f7b6c",
  "success-content": "#ffffff",
  warning: "#cb912f",
  "warning-content": "#ffffff",
  error: "#e03e3e",
  "error-content": "#ffffff",
};

const notionDark = {
  "color-scheme": "dark",
  "--rounded-box": "0.5rem",
  "--rounded-btn": "0.375rem",
  "--rounded-badge": "1rem",
  "--animation-btn": "0",
  "--animation-input": "0",
  "--btn-focus-scale": "1",
  "--border-btn": "0px",
  "--tab-border": "1px",
  "--tab-radius": "0.375rem",
  primary: "#529cca",
  "primary-content": "#0b2a3d",
  secondary: "#9a6dd7",
  "secondary-content": "#1a0f2b",
  accent: "#d9730d",
  "accent-content": "#ffffff",
  neutral: "#d4d4d4",
  "neutral-content": "#191919",
  "base-100": "#191919",
  "base-200": "#202020",
  "base-300": "#2f2f2f",
  "base-content": "#d4d4d4",
  info: "#529cca",
  "info-content": "#0b2a3d",
  success: "#4dab9a",
  "success-content": "#0b2420",
  warning: "#ffdc62",
  "warning-content": "#3d2c00",
  error: "#ff7369",
  "error-content": "#3d0f0b",
};

export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "ui-sans-serif",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica",
          "Apple Color Emoji",
          "Arial",
          "PingFang SC",
          "Hiragino Sans GB",
          "Microsoft YaHei",
          "sans-serif",
        ],
        mono: [
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "Liberation Mono",
          "JetBrains Mono",
          "monospace",
        ],
      },
    },
  },
  safelist: [
    "alert",
    "alert-info",
    "alert-success",
    "alert-warning",
    "alert-error",
  ],
  plugins: [daisyUI, typography, addDynamicIconSelectors()],
  daisyui: {
    themes: [{ notion: notionLight }, { "notion-dark": notionDark }],
    darkTheme: "notion-dark",
    logs: false,
  },
};
