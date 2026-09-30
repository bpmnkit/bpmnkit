import { describe, expect, it } from "vitest"
import type { CompactDiagram } from "../src/bpmn/compact.js"
import { expand } from "../src/bpmn/compact.js"

/**
 * `expand` used to turn any compact diagram into XML, valid or not: an edge to
 * an element that was never written came out as a dangling `targetRef`, a
 * repeated id came out twice, a flow without an id came out without one, and an
 * unknown `eventType` vanished. A model writing a diagram makes each of these
 * mistakes, and each surfaced only later — in a modeler or at deploy time.
 */
function diagram(mutate: (d: CompactDiagram) => void): CompactDiagram {
	const d: CompactDiagram = {
		id: "D",
		processes: [
			{
				id: "P",
				elements: [
					{ id: "s", type: "startEvent" },
					{ id: "a", type: "userTask", name: "A" },
					{ id: "e", type: "endEvent" },
				],
				flows: [
					{ id: "f1", from: "s", to: "a" },
					{ id: "f2", from: "a", to: "e" },
				],
			},
		],
	}
	mutate(d)
	return d
}

const proc = (d: CompactDiagram) => d.processes[0] as CompactDiagram["processes"][number]

describe("expand rejects a diagram that cannot be valid BPMN", () => {
	it("accepts a valid diagram", () => {
		expect(() => expand(diagram(() => {}))).not.toThrow()
	})

	it("rejects a flow to an element that does not exist", () => {
		const d = diagram((d) => proc(d).flows.push({ id: "f3", from: "a", to: "ghost" }))
		expect(() => expand(d)).toThrow(/flow "f3" references "ghost"/)
	})

	it("rejects a duplicate element id", () => {
		const d = diagram((d) => proc(d).elements.push({ id: "a", type: "serviceTask" }))
		expect(() => expand(d)).toThrow(/duplicate id "a"/)
	})

	it("rejects an element id reused by a flow", () => {
		const d = diagram((d) => proc(d).flows.push({ id: "a", from: "s", to: "e" }))
		expect(() => expand(d)).toThrow(/duplicate id "a" \(sequence flow\)/)
	})

	it("rejects a flow without an id", () => {
		const d = diagram((d) => proc(d).flows.push({ from: "a", to: "e" } as never))
		expect(() => expand(d)).toThrow(/flow from "a" to "e" has no id/)
	})

	it("rejects an unknown eventType instead of dropping it", () => {
		const d = diagram((d) => {
			const start = proc(d).elements[0]
			if (start) start.eventType = "email"
		})
		expect(() => expand(d)).toThrow(/unknown eventType "email"/)
	})

	it("rejects a boundary event whose host is missing", () => {
		const d = diagram((d) =>
			proc(d).elements.push({
				id: "b",
				type: "boundaryEvent",
				eventType: "timer",
				attachedTo: "nope",
			}),
		)
		expect(() => expand(d)).toThrow(/boundary event "b" is attached to "nope"/)
	})

	it("checks flows against their own scope, not the process", () => {
		const d = diagram((d) =>
			proc(d).elements.push({
				id: "sub",
				type: "subProcess",
				children: {
					elements: [{ id: "inner", type: "task" }],
					// `a` exists, but in the parent process — a flow cannot cross the boundary.
					flows: [{ id: "fx", from: "inner", to: "a" }],
				},
			}),
		)
		expect(() => expand(d)).toThrow(/flow "fx" references "a", which is not an element in "sub"/)
	})

	it("lists every problem in one error", () => {
		const d = diagram((d) => {
			proc(d).flows.push({ id: "f3", from: "a", to: "ghost" })
			proc(d).elements.push({ id: "a", type: "task" })
		})
		expect(() => expand(d)).toThrow(/duplicate id "a".*flow "f3" references "ghost"/)
	})
})
