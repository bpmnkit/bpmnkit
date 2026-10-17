import { cpSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"
import { afterAll, describe, expect, it } from "vitest"
import { INCLUDED, stage } from "../src/stage.js"

const page = (title: string) => `---\ntitle: ${title}\n---\n\n${title} explains one thing.\n`

const root = mkdtempSync(join(tmpdir(), "camunda-docspack-stage-"))
const source = join(root, "docs-checkout")
const out = join(root, "out")
afterAll(() => rmSync(root, { recursive: true, force: true }))

// A checkout holding every included path, plus a sibling of one single-file entry.
for (const entry of INCLUDED) {
	const path = join(source, entry)
	if (entry.endsWith(".md")) {
		mkdirSync(dirname(path), { recursive: true })
		writeFileSync(path, page(entry))
	} else {
		mkdirSync(path, { recursive: true })
		writeFileSync(join(path, "index.md"), page(entry))
	}
}
writeFileSync(join(source, "docs/reference/contact.md"), page("Contact"))
const spec = join(source, "api/camunda/v2")
mkdirSync(spec, { recursive: true })
const fixtures = join(dirname(fileURLToPath(import.meta.url)), "fixtures")
for (const name of ["common.yaml", "jobs.yaml"]) cpSync(join(fixtures, name), join(spec, name))
cpSync(join(fixtures, "main.yaml"), join(spec, "camunda-openapi.yaml"))

describe("stage", () => {
	const result = stage({ source, out })

	it("stages every page of a directory entry", () => {
		expect(existsSync(join(out, "guides/index.md"))).toBe(true)
	})

	it("stages a single-file entry and not its siblings", () => {
		expect(existsSync(join(out, "reference/glossary.md"))).toBe(true)
		expect(existsSync(join(out, "reference/contact.md"))).toBe(false)
	})

	it("counts the pages and the digested operations", () => {
		expect(result.operations).toBe(2)
		expect(result.documents).toBe(INCLUDED.length + result.operations)
	})
})
