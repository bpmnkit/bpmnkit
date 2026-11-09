/**
 * Escape and a pointercancel share one way out of a gesture: each takes back
 * what the gesture previewed and unlocks the viewport. Escape used to skip the
 * rubber band, the connection ghost and a dragged segment, and both skipped the
 * resize outline.
 */
import { describe, expect, it } from "vitest"
import { EditorStateMachine } from "../src/state-machine.js"
import type { HitResult } from "../src/types.js"

/** Callbacks that record every call by name; `getShapes` and `isResizable` answer for a shape drag. */
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

const segment = (nearMidpoint: boolean): HitResult => ({
	type: "edge-segment",
	id: "F",
	segIdx: 0,
	isHoriz: true,
	projPt: { x: 100, y: 100 },
	nearMidpoint,
})

const handle: HitResult = { type: "handle", shapeId: "L", handle: "s" }
const port: HitResult = { type: "port", shapeId: "L", port: "right" }
const endpoint: HitResult = { type: "edge-endpoint", edgeId: "F", isStart: false }
const waypoint: HitResult = { type: "edge-waypoint", id: "F", wpIdx: 1, pt: { x: 100, y: 100 } }

interface Gesture {
	/** The state the press (and drag) leads to. */
	state: string
	press: HitResult
	drag: boolean
	mode?: "select" | "space"
	shift?: boolean
	/** The callback that takes back the preview; null when nothing was drawn yet. */
	undo: string | null
}

const GESTURES: Gesture[] = [
	{ state: "translating", press: { type: "shape", id: "L" }, drag: true, undo: "cancelTranslate" },
	{
		state: "rubber-band",
		press: { type: "canvas" },
		drag: true,
		mode: "select",
		shift: true,
		undo: "cancelRubberBand",
	},
	{ state: "resizing", press: handle, drag: true, undo: "cancelResize" },
	{ state: "connecting", press: port, drag: true, undo: "cancelConnect" },
	{ state: "pointing-edge-endpoint", press: endpoint, drag: false, undo: "cancelEndpointMove" },
	{ state: "dragging-edge-endpoint", press: endpoint, drag: true, undo: "cancelEndpointMove" },
	{
		state: "dragging-edge-waypoint-new",
		press: segment(true),
		drag: true,
		undo: "cancelWaypointInsert",
	},
	{ state: "dragging-edge-segment", press: segment(false), drag: true, undo: "cancelSegmentMove" },
	{ state: "dragging-edge-waypoint", press: waypoint, drag: true, undo: "cancelWaypointMove" },
	{ state: "dragging", press: { type: "canvas" }, drag: true, mode: "space", undo: "cancelSpace" },
	{ state: "pointing-handle", press: handle, drag: false, undo: null },
	{ state: "pointing-port", press: port, drag: false, undo: null },
	{ state: "pointing-edge-segment", press: segment(false), drag: false, undo: null },
	{ state: "pointing-edge-waypoint", press: waypoint, drag: false, undo: null },
]

const ENDS = ["escape", "pointercancel"] as const

const CASES = GESTURES.flatMap((g) => ENDS.map((end) => ({ ...g, end })))

function end(sm: EditorStateMachine, how: (typeof ENDS)[number]): void {
	if (how === "escape") sm.onKeyDown(new KeyboardEvent("keydown", { key: "Escape" }))
	else sm.cancel()
}

describe("cancelling a gesture", () => {
	it.each(CASES)("$end takes back $state and unlocks the viewport", (g) => {
		const { cb, calls } = recorder()
		const sm = new EditorStateMachine(cb)
		if (g.mode === "select") sm.setMode({ mode: "select", sub: { name: "idle", hoveredId: null } })
		if (g.mode === "space") sm.setMode({ mode: "space", sub: { name: "idle" } })
		sm.onPointerDown(pointer("pointerdown", 100, 100, g.shift), { x: 100, y: 100 }, g.press)
		if (g.drag) {
			sm.onPointerMove(pointer("pointermove", 100, 140, g.shift), { x: 100, y: 140 }, g.press)
		}
		const mode = sm.mode
		expect("sub" in mode && mode.sub.name).toBe(g.state)

		end(sm, g.end)

		const cancels = Object.keys(calls).filter((name) => name.startsWith("cancel"))
		expect(cancels).toEqual(g.undo ? [g.undo] : [])
		if (g.undo) expect(calls[g.undo]).toHaveLength(1)
		expect(Object.keys(calls).filter((name) => name.startsWith("commit"))).toEqual([])
		expect(calls.lockViewport?.at(-1)).toEqual([false])
	})

	it.each(ENDS)("%s while pointing at a shape takes back nothing", (how) => {
		const { cb, calls } = recorder()
		const sm = new EditorStateMachine(cb)
		sm.onPointerDown(
			pointer("pointerdown", 100, 100),
			{ x: 100, y: 100 },
			{ type: "shape", id: "L" },
		)
		end(sm, how)
		expect(calls.lockViewport).toBeUndefined()
		expect(Object.keys(calls).filter((name) => name.startsWith("cancel"))).toEqual([])
	})
})
