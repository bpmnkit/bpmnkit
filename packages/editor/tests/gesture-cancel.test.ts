/**
 * Escape and a pointercancel share one way out of a gesture: each takes back
 * what the gesture previewed and unlocks the viewport. Escape used to skip the
 * rubber band, the connection ghost and a dragged segment, and both skipped the
 * resize outline.
 */
import { describe, expect, it } from "vitest"
import { EditorStateMachine } from "../src/state-machine.js"

/** Callbacks that record every call by name; `getShapes` and `isResizable` answer for a lane drag. */
function recorder() {
	const calls: Record<string, unknown[][]> = {}
	const answers: Record<string, unknown> = {
		getShapes: [{ id: "L", shape: { bounds: { x: 0, y: 0, width: 200, height: 100 } } }],
		getSelectedIds: [],
		isResizable: true,
		viewportDidPan: false,
		getSelectedEdgeId: null,
	}
	// biome-ignore lint/suspicious/noExplicitAny: test stub proxying arbitrary callbacks
	const cb = new Proxy({} as any, {
		get:
			(_t, prop: string) =>
			(...args: unknown[]) => {
				calls[prop] = [...(calls[prop] ?? []), args]
				return answers[prop]
			},
	})
	return { cb, calls }
}

const pointer = (type: string, x: number, y: number, shiftKey = false) =>
	new PointerEvent(type, { clientX: x, clientY: y, button: 0, shiftKey })

const escapeKey = () => new KeyboardEvent("keydown", { key: "Escape" })

describe("cancelling a gesture", () => {
	it("Escape takes back a rubber band and unlocks the viewport", () => {
		const { cb, calls } = recorder()
		const sm = new EditorStateMachine(cb)
		sm.setMode({ mode: "select", sub: { name: "idle", hoveredId: null } })
		sm.onPointerDown(pointer("pointerdown", 10, 10, true), { x: 10, y: 10 }, { type: "canvas" })
		sm.onPointerMove(pointer("pointermove", 60, 60, true), { x: 60, y: 60 }, { type: "canvas" })
		sm.onKeyDown(escapeKey())
		expect(calls.cancelRubberBand).toHaveLength(1)
		expect(calls.lockViewport?.at(-1)).toEqual([false])
	})

	it("Escape and a pointercancel both drop the resize outline", () => {
		for (const end of ["escape", "cancel"] as const) {
			const { cb, calls } = recorder()
			const sm = new EditorStateMachine(cb)
			const handle = { type: "handle", shapeId: "L", handle: "s" } as const
			sm.onPointerDown(pointer("pointerdown", 100, 100), { x: 100, y: 100 }, handle)
			sm.onPointerMove(pointer("pointermove", 100, 140), { x: 100, y: 140 }, handle)
			expect(calls.previewResize, end).toBeDefined()
			if (end === "escape") sm.onKeyDown(escapeKey())
			else sm.cancel()
			expect(calls.cancelResize, end).toHaveLength(1)
			expect(calls.commitResize, end).toBeUndefined()
			expect(calls.lockViewport?.at(-1), end).toEqual([false])
		}
	})

	it("Escape takes back a dragged segment", () => {
		const { cb, calls } = recorder()
		const sm = new EditorStateMachine(cb)
		const segment = {
			type: "edge-segment",
			id: "F",
			segIdx: 0,
			isHoriz: true,
			projPt: { x: 50, y: 50 },
			nearMidpoint: false,
		} as const
		sm.onPointerDown(pointer("pointerdown", 50, 50), { x: 50, y: 50 }, segment)
		sm.onPointerMove(pointer("pointermove", 50, 90), { x: 50, y: 90 }, segment)
		expect(calls.previewSegmentMove).toBeDefined()
		sm.onKeyDown(escapeKey())
		expect(calls.cancelSegmentMove).toHaveLength(1)
		expect(calls.commitSegmentMove).toBeUndefined()
		expect(calls.lockViewport?.at(-1)).toEqual([false])
	})

	it("Escape takes back the connection ghost", () => {
		const { cb, calls } = recorder()
		const sm = new EditorStateMachine(cb)
		const port = { type: "port", shapeId: "L", port: "right" } as const
		sm.onPointerDown(pointer("pointerdown", 200, 50), { x: 200, y: 50 }, port)
		sm.onPointerMove(pointer("pointermove", 260, 50), { x: 260, y: 50 }, { type: "canvas" })
		expect(calls.previewConnect).toBeDefined()
		sm.onKeyDown(escapeKey())
		expect(calls.cancelConnect).toHaveLength(1)
	})
})
