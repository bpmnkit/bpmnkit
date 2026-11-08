#!/usr/bin/env node
// dist/ is build output and not committed, and `pnpm install --ignore-scripts` never builds it,
// so the bin cannot point at it directly: in a fresh checkout it would not exist. Build on first
// use, then hand over to the compiled CLI.
import { spawnSync } from "node:child_process"
import { existsSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")
const cli = join(root, "dist", "cli.js")

if (!existsSync(cli)) {
	const built = spawnSync("pnpm", ["exec", "tsc", "-p", root], { cwd: root, encoding: "utf8" })
	if (built.status !== 0 || !existsSync(cli)) {
		process.stderr.write(
			`bpmnkit-docs: dist/cli.js is missing and building it failed.\n${built.stdout ?? ""}${built.stderr ?? ""}`,
		)
		process.exit(1)
	}
}
await import(pathToFileURL(cli).href)
