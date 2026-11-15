import { describe, expect, it } from "vitest"
import { Bpmn, applyAutoLayout } from "../src/index.js"

describe("auto layout: annotations in a pool with lanes", () => {
	it("grows the pool and its outer lane to hold an annotation the packer put below them", () => {
		const defs = Bpmn.createDiagram("d")
			.process("p", (p) =>
				p
					.inLane("l1", { name: "L1" })
					.startEvent("s", { name: "S" })
					.inLane("l2", { name: "L2" })
					.serviceTask("a", { name: "A", taskType: "a" })
					.endEvent("e", { name: "E" }),
			)
			.participant("pool", { name: "Pool", processId: "p" })
			.build()
		const process = defs.processes[0]
		if (!process) throw new Error("no process")
		process.textAnnotations.push({ id: "n", text: "A note on A", unknownAttributes: {} })
		process.associations.push({ id: "as", sourceRef: "a", targetRef: "n", unknownAttributes: {} })
		const laid = applyAutoLayout(defs, "semantic", { annotationSides: new Map([["n", "below"]]) })
		const bounds = (id: string) =>
			laid.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds
		const note = bounds("n")
		const pool = bounds("pool")
		const lanes = ["l1", "l2"].map(bounds)
		if (!note || !pool) throw new Error("no shapes")
		expect(note.y).toBeGreaterThanOrEqual(pool.y)
		expect(note.y + note.height).toBeLessThanOrEqual(pool.y + pool.height)
		// Lanes still tile the pool exactly.
		const top = Math.min(...lanes.map((l) => l?.y ?? 0))
		const bottom = Math.max(...lanes.map((l) => (l?.y ?? 0) + (l?.height ?? 0)))
		expect([top, bottom]).toEqual([pool.y, pool.y + pool.height])
	})
})
