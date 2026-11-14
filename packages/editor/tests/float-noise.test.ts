/**
 * Adding fractional deltas left binary noise (`110.20000000000002`) in the
 * saved DI of a file with fractional coordinates. `applyOp` rounds it away on
 * what the op changed and leaves the rest of the file's digits alone.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Bpmn, type BpmnDefinitions } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { applyOp } from "../src/ops.js"

const ROUNDTRIP = join(import.meta.dirname, "..", "..", "core", "tests", "fixtures", "roundtrip")

/** Fixture 08 with every integer DI coordinate made fractional (`120` becomes `120.1`). */
function fractional(): BpmnDefinitions {
	const xml = readFileSync(join(ROUNDTRIP, "08-flowable-lanes-pools.bpmn"), "utf8")
	return Bpmn.parse(
		xml.replace(/ (x|y)="(\d+)"/g, (_m, key: string, v: string) => ` ${key}="${v}.1"`),
	)
}

/** Numbers in the exported XML with more than ten decimals: noise, not something a file states. */
const noisy = (defs: BpmnDefinitions) =>
	[...Bpmn.export(defs).matchAll(/="(-?\d+\.\d{11,})"/g)].map((m) => m[1])

const boundsOf = (defs: BpmnDefinitions, id: string) =>
	defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)?.bounds

describe("float noise in edited DI", () => {
	it("leaves none after resizing a pool or a lane, or moving the own pool", () => {
		const defs = fractional()
		for (const id of ["Participant_company", "Lane_sales", "Lane_ops"]) {
			const b = boundsOf(defs, id)
			if (!b) throw new Error(`no shape ${id}`)
			const resized = applyOp(defs, {
				kind: "resize",
				id,
				bounds: { ...b, height: b.height + 37.3 },
			})
			expect(resized.defs, id).not.toBe(defs)
			expect(noisy(resized.defs), id).toEqual([])
		}
		const moved = applyOp(defs, {
			kind: "move",
			moves: [{ id: "Participant_company", dx: 13.3, dy: 7.7 }],
		})
		expect(moved.defs).not.toBe(defs)
		expect(noisy(moved.defs)).toEqual([])
	})

	it("keeps the digits of shapes a lane resize copies but does not change", () => {
		const defs = Bpmn.parse(readFileSync(join(ROUNDTRIP, "08-flowable-lanes-pools.bpmn"), "utf8"))
		const shapes = defs.diagrams[0]?.plane.shapes ?? []
		const lane = shapes.find((s) => s.bpmnElement === "Lane_ops")
		// A shape above the lane, which a resize of its bottom edge leaves where it is.
		const above = shapes.find(
			(s) =>
				lane && s.bounds.y + s.bounds.height < lane.bounds.y && !s.bpmnElement.startsWith("Lane"),
		)
		if (!lane || !above) throw new Error("fixture")
		above.bounds = { ...above.bounds, x: above.bounds.x + 0.1234567890123456 }
		const stated = above.bounds.x
		const r = applyOp(defs, {
			kind: "resize",
			id: "Lane_ops",
			bounds: { ...lane.bounds, height: lane.bounds.height + 40 },
		})
		expect(r.defs).not.toBe(defs)
		expect(boundsOf(r.defs, above.bpmnElement)?.x).toBe(stated)
	})

	it("keeps the digits of what an edit did not touch", () => {
		const xml = readFileSync(join(ROUNDTRIP, "miwg-A.1.0.bpmn"), "utf8")
		const defs = Bpmn.parse(xml)
		const plane = defs.diagrams[0]?.plane
		const digits = (b: object) => Object.values(b).some((v) => /\.\d{11,}/.test(String(v)))
		// The Trisotech export states its label bounds to sixteen digits.
		const long = plane?.shapes.find((s) => s.label?.bounds && digits(s.label.bounds))
		const other = plane?.shapes.find((s) => s !== long)
		if (!long || !other) throw new Error("fixture")
		const r = applyOp(defs, { kind: "move", moves: [{ id: other.bpmnElement, dx: 0, dy: 0.1 }] })
		expect(r.defs).not.toBe(defs)
		const after = r.defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === long.bpmnElement)
		expect(after?.label?.bounds).toEqual(long.label?.bounds)
	})
})
