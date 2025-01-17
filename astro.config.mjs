import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import playformCompress from "@playform/compress";
import terser from "@rollup/plugin-terser";
import swup from "@swup/astro";
import astroI18next from "astro-i18next";

import icon from "astro-icon";

import { defineConfig } from "astro/config";
import dotenv from "dotenv";

dotenv.config();

// https://astro.build/config
export default defineConfig({
  site: "https://shuoshuo.saroprock.com",
  style: {
    scss: {
      includePaths: ["./src/styles"],
    },
  },
  integrations: [
    icon(),
    swup({
      cache: true,
      progress: true,
      accessibility: true,
      smoothScrolling: true,
      preload: {
        hover: true,
        visible: false,
      },
      theme: "slide",
      containers: ["#swup"],
    }),
    terser({
      compress: true,
      mangle: true,
    }),
    sitemap(),
    tailwind(),
    astroI18next(),
    playformCompress(),
  ],
});
