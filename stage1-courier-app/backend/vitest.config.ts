import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: [],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000,
    pool: "forks",
  },
});


