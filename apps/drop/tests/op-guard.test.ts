import { describe, expect, it } from "vitest"
import { parseOp } from "../src/lib/op-guard.js"

const bounds = { x: 0, y: 0, width: 600, height: 60 }

describe("parseOp", () => {
	it("accepts the pool and lane ops", () => {
		expect(parseOp({ kind: "addParticipant", bounds, seed: "s" })).not.toBeNull()
		expect(parseOp({ kind: "addParticipant", bounds, name: "Bank", seed: "s" })).not.toBeNull()
		expect(parseOp({ kind: "addLane", refId: "Lane_1", where: "above", seed: "s" })).not.toBeNull()
		expect(parseOp({ kind: "addLane", refId: "Lane_1", where: "below", seed: "s" })).not.toBeNull()
		expect(
			parseOp({ kind: "addLane", refId: "P", where: "below", count: 3, seed: "s" }),
		).not.toBeNull()
	})

	it("refuses them with fields of the wrong shape", () => {
		expect(parseOp({ kind: "addParticipant", bounds: { x: 0 }, seed: "s" })).toBeNull()
		expect(parseOp({ kind: "addParticipant", bounds, name: 3, seed: "s" })).toBeNull()
		expect(parseOp({ kind: "addLane", refId: "Lane_1", where: "left", seed: "s" })).toBeNull()
		expect(parseOp({ kind: "addLane", where: "above", seed: "s" })).toBeNull()
		expect(parseOp({ kind: "addLane", refId: "P", where: "below", count: 4, seed: "s" })).toBeNull()
	})

	it("accepts the space op on either axis and refuses it with fields of the wrong shape", () => {
		expect(parseOp({ kind: "space", origin: 380, axis: "h", delta: 200 })).not.toBeNull()
		expect(parseOp({ kind: "space", origin: 200, axis: "v", delta: -60 })).not.toBeNull()
		expect(parseOp({ kind: "space", origin: 200, axis: "x", delta: 60 })).toBeNull()
		expect(parseOp({ kind: "space", origin: "200", axis: "v", delta: 60 })).toBeNull()
		expect(parseOp({ kind: "space", origin: 200, axis: "v" })).toBeNull()
		expect(parseOp({ kind: "move", moves: [{ id: "a", dx: 10, dy: 0 }] })).not.toBeNull()
	})

	// A kind looked up on a plain object finds its prototype too: `constructor`
	// is `Object`, which returns the value itself and so read as a pass.
	it("refuses a kind that names an Object.prototype member", () => {
		for (const kind of ["constructor", "toString", "hasOwnProperty", "__proto__"]) {
			expect(parseOp({ kind }), kind).toBeNull()
		}
	})
})
