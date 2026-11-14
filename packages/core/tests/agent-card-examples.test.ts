import { mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"

const PKG = join(import.meta.dirname, "..")
const INDEX = join(PKG, "src/index.ts")
const CARDS = join(PKG, "agent-cards")

// Why: the cards are the only API docs agents read, so a drifted example costs every run.
// Each ```ts block that imports @bpmnkit/core is run against the source, in a scratch dir.
function blocks(card: string): string[] {
	const md = readFileSync(join(CARDS, card), "utf8")
	return [...md.matchAll(/```ts\n([\s\S]*?)```/g)]
		.map((m) => m[1] ?? "")
		.filter((code) => code.includes('"@bpmnkit/core"'))
}

describe("agent card examples run as printed", () => {
	const cwd = process.cwd()
	let dir = ""
	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "card-"))
		process.chdir(dir)
	})
	afterAll(() => {
		process.chdir(cwd)
		rmSync(dir, { recursive: true, force: true })
	})

	for (const card of readdirSync(CARDS).filter((f) => f.endsWith(".md"))) {
		blocks(card).forEach((code, i) => {
			it(`${card} block ${i + 1} exits clean and writes lint-clean files`, async () => {
				const exit = vi.spyOn(process, "exit").mockImplementation(((c?: number) => {
					throw new Error(`process.exit(${c})`)
				}) as never)
				const file = join(dir, `${card}-${i}.ts`)
				writeFileSync(file, code.replaceAll('"@bpmnkit/core"', JSON.stringify(INDEX)))
				try {
					// The scripts report lint errors with exit(1), which the spy turns into a throw.
					await import(/* @vite-ignore */ file)
					expect(exit).not.toHaveBeenCalled()
				} finally {
					exit.mockRestore()
				}
				const out = readdirSync(dir).filter((f) => /\.(bpmn|dmn|form)$/.test(f))
				expect(out.length).toBeGreaterThan(0)
			})
		})
	}

	it("the BPMN card shows a pools example", () => {
		// The card's templates are casen build specs; apps/cli's agent-card test builds them.
		const card = readFileSync(join(CARDS, "bpmn.md"), "utf8")
		expect(card).toMatch(/^## .*\| id=/m)
		expect(card).toContain(" ~> ")
	})
})
