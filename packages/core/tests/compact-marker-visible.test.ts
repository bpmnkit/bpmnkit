import { describe, expect, it } from "vitest"
import type { CompactDiagram } from "../src/bpmn/compact.js"
import { expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"

// The bpmn-js Viewer draws the gateway "X" only when the DI shape says
// isMarkerVisible, so expand() must set it for exclusive gateways (#251).
const COMPACT: CompactDiagram = {
	id: "d",
	processes: [
		{
			id: "P",
			elements: [
				{ id: "S", type: "startEvent" },
				{ id: "G", type: "exclusiveGateway" },
				{ id: "A", type: "task" },
				{ id: "P1", type: "parallelGateway" },
				{
					id: "Sub",
					type: "subProcess",
					children: {
						elements: [
							{ id: "SubG", type: "exclusiveGateway" },
							{ id: "B", type: "task" },
							{ id: "C", type: "task" },
						],
						flows: [
							{ id: "SF1", from: "SubG", to: "B", condition: "= ok" },
							{ id: "SF2", from: "SubG", to: "C", isDefault: true },
						],
					},
				},
			],
			flows: [
				{ id: "F1", from: "S", to: "G" },
				{ id: "F2", from: "G", to: "A", condition: "= ok" },
				{ id: "F3", from: "G", to: "P1", isDefault: true },
				{ id: "F4", from: "P1", to: "Sub" },
			],
		},
	],
}

describe("expand() gateway marker", () => {
	const defs = expand(COMPACT)
	const shapes = defs.diagrams[0]?.plane.shapes ?? []
	const shape = (id: string) => shapes.find((s) => s.bpmnElement === id)

	it("marks exclusive gateways, including nested ones", () => {
		expect(shape("G")?.isMarkerVisible).toBe(true)
		expect(shape("SubG")?.isMarkerVisible).toBe(true)
	})

	it("leaves the field off other shapes", () => {
		for (const id of ["S", "A", "P1", "Sub"]) {
			expect(shape(id)).toBeDefined()
			expect(shape(id) && "isMarkerVisible" in (shape(id) ?? {})).toBe(false)
		}
	})

	it("exports isMarkerVisible on the gateway shape", () => {
		const xml = Bpmn.export(defs)
		expect(xml).toMatch(/<bpmndi:BPMNShape[^>]*bpmnElement="G"[^>]*isMarkerVisible="true"/)
		expect(xml).toMatch(/<bpmndi:BPMNShape[^>]*bpmnElement="SubG"[^>]*isMarkerVisible="true"/)
	})
})
