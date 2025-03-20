import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

// https://vitejs.dev/config/
export default defineConfig({
  build: {
    lib: {
      name: "PromiseWorker",
      entry: resolve(__dirname, "src/main.ts"),
      formats: ["es", "umd"],
      fileName: (format) => `promise-worker-ts.${format}.js`,
    },
  },
  plugins: [
    dts({
      insertTypesEntry: true,
      rollupTypes: true,
      exclude: ["**/*.test.ts", "**/*.test.worker.ts", "**/*.test.types.ts"],
    }),
  ],
  resolve: { alias: { src: resolve("src/") } },
});
