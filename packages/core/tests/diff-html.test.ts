import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { diffBpmn } from "../src/bpmn/bpmn-diff.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { diffToSvg, renderDiffHtml } from "../src/bpmn/diff-html.js"

const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/diff")
const pair = (name: string) => {
	const read = (f: string) => parseBpmn(fs.readFileSync(path.join(dir, name, f), "utf8"))
	const before = read("before.bpmn")
	const after = read("after.bpmn")
	return { before, after, diff: diffBpmn(before, after) }
}

describe("renderDiffHtml", () => {
	it("loads nothing from the network", () => {
		const { before, after, diff } = pair("rename")
		const html = renderDiffHtml(before, after, diff)
		expect(html).toContain("default-src 'none'")
		expect(html).not.toMatch(/<link|\ssrc=|@import|url\(http/)
	})

	it("escapes the title and labels", () => {
		const { before, after, diff } = pair("rename")
		const html = renderDiffHtml(before, after, diff, {
			title: "<b>&",
			beforeLabel: 'main "v1"',
			afterLabel: "pr",
		})
		expect(html).toContain("<title>&lt;b&gt;&amp;</title>")
		expect(html).toContain("main &quot;v1&quot;")
		expect(html).not.toContain("<b>&")
	})

	it("lists field changes and counts them", () => {
		const { before, after, diff } = pair("rename")
		const html = renderDiffHtml(before, after, diff)
		expect(html).toContain('<span class="bk-chip bk-k-changed">~1 changed</span>')
		expect(html).toContain(
			"<li><code>name</code> <del>&quot;Review order&quot;</del> → <ins>&quot;Check order&quot;</ins></li>",
		)
	})

	it("prefixes ids per pane so the two diagrams do not share markers", () => {
		const { before, after, diff } = pair("rename")
		const html = renderDiffHtml(before, after, diff)
		expect(html).toContain('id="bk-b-arr"')
		expect(html).toContain('id="bk-a-arr"')
		expect(html).not.toContain("url(#arr)")
	})

	it("marks a semantically identical pair and keeps `<` out of the JSON", () => {
		const { before, after, diff } = pair("move-only")
		const html = renderDiffHtml(before, after, diff)
		expect(html).toContain("semantically identical")
		const json = html
			.split('<script type="application/json" id="bk-diff">')[1]
			?.split("</script>")[0]
		expect(json).not.toContain("<")
		expect(JSON.parse(json ?? "")).toEqual(JSON.parse(JSON.stringify(diff)))
	})

	it("says so when nothing differs", () => {
		const { before } = pair("rename")
		const html = renderDiffHtml(before, before, diffBpmn(before, before))
		expect(html).toContain('<p class="bk-empty">No differences.</p>')
	})

	it("throws for a model without diagram unless asked to lay it out", () => {
		const { before, after, diff } = pair("rename")
		const bare = { ...after, diagrams: [] }
		expect(() => renderDiffHtml(before, bare, diff)).toThrow(/no diagram/)
		expect(renderDiffHtml(before, bare, diff, { autoLayout: true })).toContain("bk-pane-after")
	})
})

describe("diffToSvg", () => {
	it("draws a moved element and a ghost of where it was", () => {
		const { after, diff } = pair("move-only")
		const svg = diffToSvg(after, diff)
		expect(svg.startsWith("<svg ")).toBe(true)
		expect(svg.endsWith("</g></svg>")).toBe(true)
		expect(svg).toContain('stroke-dasharray="6 4"')
		expect(svg).not.toContain("<a ")
	})
})
