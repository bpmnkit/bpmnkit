/**
 * Every example that produces BPMN produces BPMN Camunda 8 deploys: each script runs
 * in a scratch directory and every file it writes goes through the deploy gate.
 */
import { mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { assertDeployableXml } from "@bpmnkit/core"
import { afterAll, beforeAll, describe, expect, it } from "vitest"

const EXAMPLES = [
	"01-employee-onboarding",
	"02-incident-response",
	"03-loan-approval",
	"04-invoice-processing",
	"05-content-publishing",
	"06-ai-code-review-agent",
	"07-ai-ticket-triage-clef",
	"ai/corpus-to-bpmn",
]

const cwd = process.cwd()
let dir: string

beforeAll(() => {
	dir = mkdtempSync(join(tmpdir(), "bpmnkit-examples-"))
	process.chdir(dir)
})
afterAll(() => {
	process.chdir(cwd)
	rmSync(dir, { recursive: true, force: true })
})

describe("examples", () => {
	it.each(EXAMPLES)(
		"%s writes BPMN that deploys",
		async (name) => {
			const before = new Set(bpmnFiles())
			// A path vite cannot analyse: each script runs when imported, once.
			await import(/* @vite-ignore */ new URL(`../src/${name}.ts`, import.meta.url).href)
			const written = bpmnFiles().filter((f) => !before.has(f))
			expect(written.length).toBeGreaterThan(0)
			for (const file of written) {
				expect(() =>
					assertDeployableXml(readFileSync(join(dir, "output", file), "utf8")),
				).not.toThrow()
			}
		},
		60_000,
	)
})

function bpmnFiles(): string[] {
	try {
		return readdirSync(join(dir, "output")).filter((f) => f.endsWith(".bpmn"))
	} catch {
		return []
	}
}
