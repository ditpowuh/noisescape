import {defineConfig} from "vite";
import path from "path";

import react, {reactCompilerPreset} from "@vitejs/plugin-react";
import babel from "@rolldown/plugin-babel";

export default defineConfig({
  plugins: [
    react(),
    babel({
      presets: [reactCompilerPreset()]
    })
  ],
  base: "./",
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  build: {
    outDir: path.resolve(__dirname, "../src/Resources/wwwroot"),
    emptyOutDir: true,
  },
});
