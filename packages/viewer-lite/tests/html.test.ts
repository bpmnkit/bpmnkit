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
	const m = /<script type="application\/bpmn\+xml">([\s\S]*?)<\/script>/.exec(html)
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
})
