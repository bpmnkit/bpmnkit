import { fileURLToPath } from "node:url"
import { defineConfig } from "vitest/config"

export default defineConfig({
	test: {
		include: ["tests/**/*.test.ts"],
		alias: {
			// `vscode` is injected by the editor at runtime and has no package to
			// resolve, so activation is exercised against a recorder instead.
			vscode: fileURLToPath(new URL("./tests/vscode-stub.ts", import.meta.url)),
		},
		server: {
			deps: {
				// Already compiled; Vite's transform of the bundled connector templates
				// (megabytes of generated JS) takes seconds, Node's import a fraction of one.
				external: [/\/packages\/(core|connectors)\/dist\//],
			},
		},
	},
})
