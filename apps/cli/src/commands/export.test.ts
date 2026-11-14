import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import { afterAll, beforeAll, describe, expect, it } from "vitest"
import type { RunContext } from "../types.js"
import { exportGroup } from "./export.js"
import { commandGroups } from "./index.js"

const BPMN = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="D" targetNamespace="x">
  <bpmn:process id="p"><bpmn:startEvent id="s"/>
    <bpmn:textAnnotation id="t"><bpmn:text><![CDATA[a </script> b]]></bpmn:text></bpmn:textAnnotation>
  </bpmn:process>
</bpmn:definitions>`

describe("casen export html", () => {
	let dir: string
	const lines: string[] = []

	function run(
		positional: string[],
		flags: Record<string, string> = {},
		repeated?: Record<string, string[]>,
	): Promise<void> {
		const cmd = exportGroup.commands.find((c) => c.name === "html")
		if (!cmd) throw new Error("export html command not registered")
		const ctx = {
			positional,
			flags,
			repeated,
			output: { ok: (m: string) => lines.push(m) },
		} as unknown as RunContext
		return cmd.run(ctx)
	}

	beforeAll(() => {
		dir = mkdtempSync(join(tmpdir(), "casen-export-"))
		writeFileSync(join(dir, "order.bpmn"), BPMN)
	})
	afterAll(() => rmSync(dir, { recursive: true, force: true }))

	it("is routed as the only export group", () => {
		expect(commandGroups.filter((g) => g.name === "export")).toHaveLength(1)
	})

	it("writes <file>.html with the viewer inlined and `</script` kept out of the XML", async () => {
		await run([join(dir, "order.bpmn")])
		const html = readFileSync(join(dir, "order.html"), "utf-8")
		expect(html).toContain('<script type="application/bpmn+xml">')
		expect(html).toContain("BpmnLite")
		expect(html).toContain("<![CDATA[a </]]><![CDATA[script> b]]>")
		expect(lines.at(-1)).toBe(`HTML written to ${join(dir, "order.html")}`)
	})

	it("honours -o and --title", async () => {
		await run([join(dir, "order.bpmn")], { o: join(dir, "x.html"), title: "Orders" })
		expect(readFileSync(join(dir, "x.html"), "utf-8")).toContain("<title>Orders</title>")
	})

	it("passes --theme and repeated --color to toHtml", async () => {
		await run(
			[join(dir, "order.bpmn")],
			{ o: join(dir, "t.html"), theme: "dark", color: "stroke=#0b5fff" },
			{ color: ["bg=#101820", "stroke=#0b5fff"] },
		)
		const html = readFileSync(join(dir, "t.html"), "utf-8")
		expect(html).toContain('data-theme="dark"')
		expect(html).toContain("--bpmnkit-viewer-bg:#101820;--bpmnkit-viewer-stroke:#0b5fff")
	})

	it("accepts a single --color", async () => {
		await run([join(dir, "order.bpmn")], { o: join(dir, "c.html"), color: "halo=#fff" })
		expect(readFileSync(join(dir, "c.html"), "utf-8")).toContain("--bpmnkit-viewer-halo:#fff")
	})

	it("rejects a bad theme, colour key, pair or value", async () => {
		const f = join(dir, "order.bpmn")
		await expect(run([f], { theme: "blue" })).rejects.toThrow(/Invalid --theme/)
		await expect(run([f], { color: "nope=#fff" })).rejects.toThrow(/Invalid --color/)
		await expect(run([f], { color: "bg" })).rejects.toThrow(/Invalid --color/)
		await expect(run([f], { color: "bg=red;}" })).rejects.toThrow(/Invalid colour/)
	})

	it("needs a file", async () => {
		await expect(run([])).rejects.toThrow(/Missing required argument/)
	})
})
