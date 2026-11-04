import { spawnSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const root = join(dirname(fileURLToPath(import.meta.url)), "..")

describe("bpmnkit-docs bin", () => {
	// A fresh checkout has no dist/ (it is gitignored) and `pnpm install --ignore-scripts` never
	// builds it, so a bin pointing there made `npx bpmnkit-docs` fail before it read any pack.
	it("points at a file that is committed, not at build output", () => {
		const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
			bin: Record<string, string>
		}
		const target = pkg.bin["bpmnkit-docs"] ?? ""
		expect(existsSync(join(root, target))).toBe(true)
		const ignored = spawnSync("git", ["check-ignore", "-q", target], { cwd: root })
		expect(ignored.status).toBe(1)
	})
})
