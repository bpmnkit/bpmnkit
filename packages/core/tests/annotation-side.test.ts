import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { Bpmn, resetIdCounter } from "../src/index.js"
import type { ProcessBuilder } from "../src/index.js"
import type { Bounds } from "../src/layout/types.js"

const TOOLS = [
	"LookupSampleUsers",
	"SearchRecipes",
	"FetchSafeJoke",
	"ListSampleTechnologyProducts",
]
const TEXT = "Each task you add represents a capability your agent will have."

function agent(
	annotate: (p: ProcessBuilder) => void,
	toolGrid?: { columns?: number; fill?: "row" | "column" },
): BpmnDefinitions {
	const p = Bpmn.createProcess("p")
		.startEvent("s")
		.adHocSubProcess(
			"ah",
			(c) => {
				for (const id of TOOLS) c.serviceTask(id, { name: id, taskType: "x" })
			},
			toolGrid ? { toolGrid } : {},
		)
		.userTask("u", { name: "Review" })
		.endEvent("e")
	annotate(p)
	return p.withAutoLayout().build()
}

function bounds(defs: BpmnDefinitions, id: string): Bounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	expect(shape, id).toBeDefined()
	return shape?.bounds as Bounds
}

describe("annotate side hint", () => {
	beforeEach(() => resetIdCounter())

	it("puts the annotation below a tool in the top row of the ad-hoc sub-process", () => {
		const defs = agent((p) => p.annotate("FetchSafeJoke", TEXT, { side: "below" }), {
			columns: 2,
			fill: "column",
		})
		const ah = bounds(defs, "ah")
		const ann = bounds(defs, "TextAnnotation_FetchSafeJoke_1")
		expect(ann.y).toBeGreaterThan(ah.y + ah.height)

		// Without the hint the packer would put it above the sub-process.
		resetIdCounter()
		const plain = agent((p) => p.annotate("FetchSafeJoke", TEXT), { columns: 2, fill: "column" })
		const plainAh = bounds(plain, "ah")
		expect(bounds(plain, "TextAnnotation_FetchSafeJoke_1").y).toBeLessThan(plainAh.y)
	})

	it("puts the annotation above a tool whose natural side is below", () => {
		const plain = agent((p) => p.annotate("FetchSafeJoke", TEXT))
		const plainAh = bounds(plain, "ah")
		expect(bounds(plain, "TextAnnotation_FetchSafeJoke_1").y).toBeGreaterThan(
			plainAh.y + plainAh.height,
		)
		resetIdCounter()
		const defs = agent((p) => p.annotate("FetchSafeJoke", TEXT, { side: "above" }))
		const ah = bounds(defs, "ah")
		const ann = bounds(defs, "TextAnnotation_FetchSafeJoke_1")
		expect(ann.y + ann.height).toBeLessThan(ah.y)
	})

	it("is not written to the model", () => {
		const hinted = agent((p) => p.annotate("FetchSafeJoke", TEXT, { side: "below" }))
		resetIdCounter()
		const plain = agent((p) => p.annotate("FetchSafeJoke", TEXT))
		expect(hinted.processes).toEqual(plain.processes)
	})
})
