import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		environment: "happy-dom",
		setupFiles: [fileURLToPath(new URL("../../scripts/vitest-dom-storage.mjs", import.meta.url))],
	},
})
