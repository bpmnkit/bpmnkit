import { describe, expect, it } from "vitest"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"
import { Bpmn } from "../src/bpmn/index.js"
import { exportSvg, exportSvgDetailed } from "../src/bpmn/svg.js"
import type { DmnDecisionTable } from "../src/dmn/dmn-model.js"
import { parseDmn } from "../src/dmn/dmn-parser.js"
import { exportDecisionTableSvg, exportDrdSvg } from "../src/dmn/svg.js"

const build = () =>
	Bpmn.createProcess("p")
		.startEvent("s", { name: "Start" })
		.userTask("u", { name: "Review" })
		.endEvent("e")
		.withAutoLayout()
		.build()

const viewBox = (svg: string) => /viewBox="([^"]+)"/.exec(svg)?.[1]
const size = (svg: string) => /width="([^"]+)" height="([^"]+)"/.exec(svg)?.slice(1).map(Number)

describe("exportSvg options", () => {
	it("scale changes width/height only", () => {
		const d = build()
		const a = exportSvg(d)
		const b = exportSvg(d, { scale: 2 })
		expect(viewBox(b)).toBe(viewBox(a))
		expect(size(b)).toEqual(size(a)?.map((n) => n * 2))
	})
	it("maxSize fits inside, never upscales", () => {
		const d = build()
		const [w = 0, h = 0] = size(exportSvg(d)) ?? []
		const [sw = 0, sh = 0] = size(exportSvg(d, { maxSize: [w / 2, 10000] })) ?? []
		expect(sw).toBeCloseTo(w / 2)
		expect(sh).toBeCloseTo(h / 2)
		expect(size(exportSvg(d, { maxSize: [1e6, 1e6] }))).toEqual([w, h])
	})
	it("accepts a custom theme and transparent background", () => {
		const theme = {
			bg: "#010203",
			shapeFill: "#111111",
			shapeStroke: "#222222",
			flowStroke: "#333333",
			text: "#444444",
			poolHeader: "#555555",
			textHalo: "#666666",
		}
		const svg = exportSvg(build(), { theme })
		expect(svg).toContain("#010203")
		expect(svg).toContain("#111111")
		expect(exportSvg(build(), { background: false })).not.toContain(`fill="#f8f9fa"`)
	})
	it("elementIds adds data-element-id", () => {
		const svg = exportSvg(build(), { elementIds: true })
		expect(svg).toContain('data-element-id="u"')
		expect(exportSvg(build())).not.toContain("data-element-id")
	})
	it("font overrides family and size", () => {
		const svg = exportSvg(build(), { font: { family: "Foo", size: 13, lineHeight: 16 } })
		expect(svg).toContain("font-family:Foo;font-size:13px")
	})
	it("colors: di honours bioc fill/stroke", () => {
		const d = build()
		const shape = d.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "u")
		if (shape) shape.unknownAttributes = { "bioc:fill": "#abcdef", "bioc:stroke": "#123456" }
		expect(exportSvg(d)).not.toContain("#abcdef")
		const svg = exportSvg(d, { colors: "di" })
		expect(svg).toContain("fill:#abcdef;stroke:#123456")
	})
	it("plane selects by process and throws when missing", () => {
		const d = build()
		expect(() => exportSvg(d, { plane: { process: "nope" } })).toThrow(/Plane not found/)
		expect(exportSvg(d, { plane: { process: "p" } })).toBe(exportSvg(d))
	})
	it("autoLayout lays out DI-less models", () => {
		const d = build()
		const bare = { ...d, diagrams: [] }
		expect(viewBox(exportSvg(bare))).toBe("0 0 1 1")
		const r = exportSvgDetailed(bare, { autoLayout: true })
		expect(r.warnings).toContainEqual({ type: "autoLayoutApplied" })
		expect(r.elements.length).toBeGreaterThan(0)
	})
	it("exportSvgDetailed reports geometry", () => {
		const r = exportSvgDetailed(build())
		expect(r.svg).toBe(exportSvg(build()))
		expect(r.elements.map((e) => e.kind)).toContain("sequenceFlow")
		expect(r.width).toBeGreaterThan(0)
	})
})

describe("markers and data", () => {
	const xml = `<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" id="d" targetNamespace="x">
<bpmn:process id="P"><bpmn:callActivity id="CA"/><bpmn:dataStoreReference id="DS" name="DB"/></bpmn:process>
<bpmndi:BPMNDiagram id="D"><bpmndi:BPMNPlane id="PL" bpmnElement="P">
<bpmndi:BPMNShape id="a" bpmnElement="CA"><dc:Bounds x="0" y="0" width="100" height="80"/></bpmndi:BPMNShape>
<bpmndi:BPMNShape id="b" bpmnElement="DS"><dc:Bounds x="150" y="0" width="50" height="50"/></bpmndi:BPMNShape>
</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`
	it("draws the call-activity plus and data stores", () => {
		const svg = exportSvg(parseBpmn(xml))
		expect(svg).toContain('<rect x="-7" y="-7" width="14" height="14"')
		expect(svg).toContain("<ellipse")
		expect(svg).toContain(">DB</text>")
	})
})

describe("DMN SVG", () => {
	const table: DmnDecisionTable = {
		id: "t",
		hitPolicy: "COLLECT",
		aggregation: "SUM",
		inputs: [{ id: "i", label: "Score", inputExpression: { id: "ie", text: "score" } }],
		outputs: [{ id: "o", label: "Flag" }],
		rules: [
			{
				id: "r1",
				description: "low",
				inputEntries: [{ id: "a", text: "< 500" }],
				outputEntries: [{ id: "b", text: '"review"' }],
			},
		],
	}
	it("renders a decision table with hit policy, title and ids", () => {
		const svg = exportDecisionTableSvg(table, { name: "Credit", elementIds: true })
		for (const s of [
			">Credit</text>",
			">C+</text>",
			">Score</text>",
			">Annotations</text>",
			'data-element-id="r1"',
		]) {
			expect(svg).toContain(s)
		}
	})
	it("honours scale, theme and background", () => {
		const a = size(exportDecisionTableSvg(table))
		expect(size(exportDecisionTableSvg(table, { scale: 2 }))).toEqual(a?.map((n) => n * 2))
		expect(exportDecisionTableSvg(table, { theme: "dark", background: false })).not.toContain(
			'<rect x="-',
		)
	})
	it("renders a DRD, laying out when DI is missing", () => {
		const defs =
			parseDmn(`<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/" id="d" name="n" namespace="x">
<inputData id="in" name="Input"/><decision id="de" name="Decide"><informationRequirement id="ir"><requiredInput href="#in"/></informationRequirement></decision></definitions>`)
		const svg = exportDrdSvg(defs, { elementIds: true })
		expect(svg).toContain(">Input</text>")
		expect(svg).toContain('marker-end="url(#drd-info)"')
		expect(svg).toContain('data-element-id="de"')
	})
})
