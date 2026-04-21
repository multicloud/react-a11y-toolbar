import { defineConfig } from "tsup";

export default defineConfig([
  // Library build (CJS + ESM, React external)
  {
    entry: ["src/index.ts", "src/accessibility.css"],
    format: ["cjs", "esm"],
    dts: true,
    sourcemap: true,
    clean: true,
    external: ["react", "react-dom"],
    loader: { ".css": "copy" },
  },
  // Demo build (single IIFE, all deps bundled, no external)
  {
    entry: { demo: "demo/demo.tsx" },
    format: ["iife"],
    globalName: "Demo",
    outDir: "demo",
    sourcemap: false,
    clean: false,
    noExternal: [/./],
    loader: { ".css": "empty" },
    outExtension: () => ({ js: ".bundle.js" }),
    define: { "process.env.NODE_ENV": '"production"' },
  },
]);
