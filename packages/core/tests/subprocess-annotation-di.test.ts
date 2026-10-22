import { beforeEach, describe, expect, it } from "vitest"
import { Bpmn, lintDiagram, resetIdCounter } from "../src/index.js"

// Annotations declared inside a sub-process live on the sub-process element,
// not on the process, so layout used to skip them and leave them without DI.
describe("sub-process annotation DI", () => {
	beforeEach(() => resetIdCounter())

	it("gives annotations in nested sub-processes a shape and an association edge", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("outer", (o) => {
				o.startEvent("os")
					.subProcess("inner", (i) => {
						i.startEvent("is").userTask("deep", { name: "Deep" }).endEvent("ie")
						i.annotate("deep", "inner note")
					})
					.userTask("t", { name: "T" })
					.endEvent("oe")
				o.annotate("t", "outer note")
			})
			.endEvent("e")
			.withAutoLayout()
			.build()

		const plane = defs.diagrams[0]?.plane
		for (const [annId, assocId] of [
			["TextAnnotation_deep_1", "Association_deep_1"],
			["TextAnnotation_t_1", "Association_t_1"],
		] as const) {
			const shape = plane?.shapes.find((s) => s.bpmnElement === annId)
			expect(shape, annId).toBeDefined()
			expect(
				plane?.edges.find((e) => e.bpmnElement === assocId),
				assocId,
			).toBeDefined()
		}

		const diagnostics = lintDiagram(defs).diagnostics
		expect(diagnostics.filter((d) => d.severity === "error")).toEqual([])
		expect(diagnostics.filter((d) => /annotation|diagram|shape|di/i.test(d.message))).toEqual([])
	})
})
