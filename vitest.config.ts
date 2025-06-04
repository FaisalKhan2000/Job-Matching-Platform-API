import { defineConfig } from "vitest/config";
import { resolve } from "path";

export default defineConfig({
  test: {
    setupFiles: [resolve(__dirname, "./src/tests/setup.ts")],
    environment: "node",
    globals: true,
  },
});
