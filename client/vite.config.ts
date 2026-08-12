import {defineConfig} from "vite";
import path from "path";

import react, {reactCompilerPreset} from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";
import svgr from "vite-plugin-svgr";
import checker from "vite-plugin-checker";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    }),
    svgr(),
    checker({
      typescript: {
        tsconfigPath: "./tsconfig.app.json",
      },
      overlay: {
        initialIsOpen: false,
        position: "tl"
      }
    })
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src")
    }
  },
  build: {
    outDir: path.resolve(import.meta.dirname, "../src/Resources/wwwroot"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000
  }
});
