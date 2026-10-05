import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		environment: "happy-dom",
		passWithNoTests: true,
		server: {
			deps: {
				// Already compiled; Vite's transform of the bundled connector templates
				// (megabytes of generated JS) takes seconds, Node's import a fraction of one.
				external: [/\/packages\/(core|connectors)\/dist\//],
			},
		},
	},
})
