// @vitest-environment node
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Bpmn } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { escapeXmlForScript, toHtml } from "../src/html.js"

const xml = readFileSync(
	join(import.meta.dirname, "../../../conformance/bpmn/sample-order-process/input.bpmn"),
	"utf8",
)

const withText = (text: string) =>
	xml.replace(
		"</bpmn:process>",
		() =>
			`<bpmn:textAnnotation id="TA"><bpmn:text>${text}</bpmn:text></bpmn:textAnnotation></bpmn:process>`,
	)

/** What the page's script element holds, as the viewer reads it. */
const embedded = (html: string): string => {
	const m = /<script type="application\/bpmn\+xml"[^>]*>([\s\S]*?)<\/script>/.exec(html)
	if (!m) throw new Error("no bpmn script")
	return m[1] ?? ""
}

describe("toHtml", () => {
	it("makes one page with the viewer inlined and the XML embedded", () => {
		const html = toHtml(xml)
		expect(html.startsWith("<!doctype html>")).toBe(true)
		expect(html).not.toContain("{{BPMN}}")
		expect(html).not.toMatch(/<script[^>]*\ssrc=/)
		expect(embedded(html)).toBe(xml)
		expect(html).toContain("BpmnLite")
	})

	it("sets an escaped title", () => {
		expect(toHtml(xml, { title: "A <b> & c" })).toContain("<title>A &lt;b&gt; &amp; c</title>")
		expect(toHtml(xml)).toContain("<title>BPMN diagram</title>")
	})

	it("keeps `{{BPMN}}` text in the XML or title untouched", () => {
		const html = toHtml(withText("{{BPMN}} $& $1"), { title: "{{BPMN}}" })
		expect(embedded(html)).toContain("{{BPMN}} $& $1")
		expect(html).toContain("<title>{{BPMN}}</title>")
	})

	it("does not let `</script` in text end the element, and the XML parses the same", () => {
		const input = withText("a &lt;/script&gt; b </ScRiPt c".replace("</ScRiPt", "&lt;/ScRiPt"))
		const html = toHtml(input)
		expect(embedded(html)).not.toMatch(/<\/script/i)
		// Text escapes are already entities: the XML is unchanged.
		expect(embedded(html)).toBe(input)
	})

	it("handles `</script` in CDATA without changing the text", () => {
		const input = withText("<![CDATA[if (a) </script> else </SCRIPT>]]>")
		const html = toHtml(input)
		const body = embedded(html)
		expect(body).not.toMatch(/<\/script/i)
		// Same content once the sections are joined again.
		expect(body.replaceAll("]]><![CDATA[", "")).toBe(input)
		expect(() => Bpmn.parse(body)).not.toThrow()
	})

	it("handles `</script` in a comment", () => {
		const body = embedded(toHtml(withText("x<!-- </script> -->y")))
		expect(body).not.toMatch(/<\/script/i)
	})

	it("refuses a real <script> element, which cannot be hidden", () => {
		expect(() => escapeXmlForScript("<a><script>1</script></a>")).toThrow(/<script>/)
	})

	it("leaves unrelated CDATA and comments alone", () => {
		const s = "<a><!-- c --><![CDATA[x < y]]></a>"
		expect(escapeXmlForScript(s)).toBe(s)
	})

	it("has a file picker and drop handling in every page", () => {
		for (const html of [toHtml(xml), toHtml("")]) {
			expect(html).toMatch(/<input[^>]*type="file"[^>]*accept="\.bpmn,\.xml"/)
			expect(html).toContain("ondrop")
			expect(html).toContain("ondragover")
		}
	})

	it("makes an empty viewer when there is no XML", () => {
		for (const empty of ["", "  \n"]) {
			const html = toHtml(empty)
			expect(html).not.toContain("{{BPMN}}")
			expect(html).not.toContain(`<script type="application/bpmn+xml">`)
			expect(html).toContain("Open or drop a .bpmn file")
		}
	})
})

describe("toHtml theme and colors", () => {
	it("is light and has no theme markup by default", () => {
		const html = toHtml(xml)
		expect(html).not.toContain('data-theme="')
		expect(html).not.toContain("@media (prefers-color-scheme")
		expect(html).toContain("background:var(--bpmnkit-viewer-bg,#f8f9fa)")
	})

	it("sets data-theme on the script and body, and dark page colours", () => {
		const dark = toHtml(xml, { theme: "dark" })
		expect(dark).toContain('<script type="application/bpmn+xml" data-theme="dark">')
		expect(dark).toContain('<body data-theme="dark">')
		expect(dark).toContain(":root{--bpmnkit-viewer-bg:#1e1e2e;--bpmnkit-viewer-text:#cdd6f4}")
		const auto = toHtml(xml, { theme: "auto" })
		expect(auto).toContain(
			"@media (prefers-color-scheme:dark){:root{--bpmnkit-viewer-bg:#1e1e2e;--bpmnkit-viewer-text:#cdd6f4}}",
		)
		expect(embedded(toHtml(xml, { theme: "light" }))).toBe(xml)
		expect(toHtml("", { theme: "dark" })).toContain('<body data-theme="dark">')
	})

	it("emits colours as variables in a fixed order", () => {
		const html = toHtml(xml, {
			colors: { textHalo: "#fff", bg: "#123456", poolHeader: "rgba(0,0,0,.1)" },
		})
		expect(html).toContain(
			":root{--bpmnkit-viewer-bg:#123456;--bpmnkit-viewer-pool-header:rgba(0,0,0,.1);--bpmnkit-viewer-halo:#fff}</style>",
		)
		expect(embedded(html)).toBe(xml)
	})

	it("is deterministic", () => {
		const o = { theme: "auto", colors: { bg: "#fff", text: "#000" } } as const
		expect(toHtml(xml, o)).toBe(toHtml(xml, o))
	})

	it("rejects values that could break out of the CSS or HTML", () => {
		for (const bad of [
			"red;}body{display:none",
			"red</style><script>alert(1)</script>",
			'red" onload="x',
			"url(https://evil.example/x)",
			"var(--x)",
			"red\\",
			"red/*",
			"a{b}",
			"",
			"x".repeat(65),
		]) {
			expect(() => toHtml(xml, { colors: { bg: bad } }), bad).toThrow(/Invalid colour/)
		}
		expect(() => toHtml(xml, { colors: { nope: "#fff" } as never })).toThrow(/Unknown colour/)
		expect(() => toHtml(xml, { theme: "x" as never })).toThrow(/Unknown theme/)
	})
})
