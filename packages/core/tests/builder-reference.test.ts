import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"
import { describe, expect, it } from "vitest"
import { generateBuilderReference } from "../../../scripts/generate-builder-reference.mjs"
import { checkDiCompleteness } from "../src/bpmn/di-check.js"
import { Bpmn } from "../src/index.js"

const REFERENCE = fileURLToPath(new URL("../builder-reference.md", import.meta.url))
const CORE_SRC_INDEX = fileURLToPath(new URL("../src/index.ts", import.meta.url))

function committed(): string {
	return readFileSync(REFERENCE, "utf-8")
}

function examplesOf(markdown: string): string[] {
	return [...markdown.matchAll(/```typescript\n([\s\S]*?)```/g)].map((m) => m[1] ?? "")
}

describe("builder-reference.md", () => {
	it("matches what the generator produces from bpmn-builder.ts", () => {
		// Why: the file is derived from the builder's types, so a new option or method
		// that is not regenerated leaves the demo prompt teaching a stale API.
		expect(
			committed(),
			"builder-reference.md is stale. Run: node scripts/generate-builder-reference.mjs",
		).toBe(generateBuilderReference())
	})

	it("stays within the token budget (chars / 4 <= 3000)", () => {
		expect(committed().length / 4).toBeLessThanOrEqual(3000)
	})

	it("lists methods and the options the generator derives", () => {
		const md = committed()
		for (const needle of [
			"serviceTask(",
			"boundaryEvent(",
			"withBoundary(",
			"timerDuration",
			"condition(",
		]) {
			expect(md).toContain(needle)
		}
		expect(md).not.toContain("modelerTemplate")
	})

	const examples = examplesOf(committed())

	it("has several examples", () => {
		expect(examples.length).toBeGreaterThanOrEqual(5)
	})

	it("type-checks every example against the builder source", () => {
		const dir = mkdtempSync(join(tmpdir(), "builder-ref-"))
		try {
			const files = examples.map((code, i) => {
				const file = join(dir, `example${i}.ts`)
				writeFileSync(file, code)
				return file
			})
			const program = ts.createProgram(files, {
				strict: true,
				noEmit: true,
				skipLibCheck: true,
				target: ts.ScriptTarget.ES2022,
				module: ts.ModuleKind.ESNext,
				moduleResolution: ts.ModuleResolutionKind.Bundler,
				baseUrl: dir,
				paths: { "@bpmnkit/core": [CORE_SRC_INDEX] },
			})
			const diagnostics = ts
				.getPreEmitDiagnostics(program)
				.filter((d) => d.file && files.includes(d.file.fileName))
				.map((d) => ts.flattenDiagnosticMessageText(d.messageText, "\n"))
			expect(diagnostics).toEqual([])
		} finally {
			rmSync(dir, { recursive: true, force: true })
		}
		// Creating a TypeScript program over the builder source takes seconds on a loaded machine.
	}, 60_000)

	it.each(examples.map((code, i) => [i, code] as const))(
		"example %i builds valid BPMN with a complete diagram",
		(_i, code) => {
			const js = ts.transpileModule(code.replace(/^import .*$/m, ""), {
				compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ESNext },
			}).outputText
			const definitions = new Function("Bpmn", `${js}\nreturn definitions`)(Bpmn)
			const xml = Bpmn.export(definitions)
			const parsed = Bpmn.parse(xml)
			expect(parsed.processes.length).toBeGreaterThan(0)
			expect(checkDiCompleteness(parsed)).toEqual({ missingShapes: [], missingEdges: [] })
		},
	)
})
