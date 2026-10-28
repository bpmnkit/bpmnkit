// @vitest-environment happy-dom
/**
 * WP8a in the editor: how selection, hit testing, labels, connections and
 * the context bar and menu treat pools, lanes and message flows.
 */
import { afterEach, describe, expect, it } from "vitest"
import { BpmnEditor } from "../src/editor.js"
import { initEditorHud } from "../src/hud.js"
import { boundsOf, flowableXml, lockedPartnerXml } from "./swimlane-helpers.js"

/** The private members these tests reach; they are the paths a pointer or key takes. */
interface EditorInternals {
	_host: HTMLElement
	_containersG: SVGGElement
	_viewport: { set(state: { tx: number; ty: number; scale: number }): void }
	_hitTest(clientX: number, clientY: number): { type: string; id?: string }
	_previewTranslate(dx: number, dy: number): void
	_previewSpace(
		origin: { x: number; y: number },
		current: { x: number; y: number },
		axis: "v",
	): void
	_isConnectTargetInvalid(targetId: string | null): boolean
	_doConnect(srcId: string, tgtId: string): void
	_findEdgeDropTarget(dx: number, dy: number): string | null
	_canHostBoundary(id: string): boolean
}

const editors: BpmnEditor[] = []

function mount(withHud = false, xml = flowableXml()): { ed: BpmnEditor; inner: EditorInternals } {
	const container = document.createElement("div")
	container.style.width = "800px"
	container.style.height = "600px"
	document.body.appendChild(container)
	const ed = new BpmnEditor({ container, xml, grid: false })
	editors.push(ed)
	if (withHud) initEditorHud(ed, {})
	const inner = ed as unknown as EditorInternals
	// Diagram and client coordinates coincide, so a test can press at diagram points.
	inner._viewport.set({ tx: 0, ty: 0, scale: 1 })
	return { ed, inner }
}

afterEach(() => {
	for (const ed of editors.splice(0)) ed.destroy()
	document.body.innerHTML = ""
})

const SWIMLANES = [
	"Participant_own",
	"Participant_partner",
	"Participant_bank",
	"Lane_sales",
	"Lane_finance",
	"Lane_ops",
]

/** The `<g>` the canvas drew for `id` in the containers layer. */
function drawnGroup(inner: EditorInternals, id: string): Element {
	const g = inner._containersG.querySelector(`[data-bpmnkit-id="${id}"]`)
	if (!g) throw new Error(`no container shape for ${id}`)
	return g
}

describe("8a.3 label editing on pools and lanes", () => {
	it("starts from the pool's name, over its header strip", () => {
		const { ed } = mount()
		ed.editLabel("Participant_own")
		const div = document.querySelector<HTMLElement>(".bpmnkit-label-editor")
		expect(div?.textContent).toBe("Company")
		expect([div?.style.left, div?.style.top, div?.style.width]).toEqual(["0px", "0px", "60px"])
	})

	it("starts from the lane's name, over its header strip", () => {
		const { ed } = mount()
		ed.editLabel("Lane_finance")
		const div = document.querySelector<HTMLElement>(".bpmnkit-label-editor")
		expect(div?.textContent).toBe("Finance")
		expect([div?.style.left, div?.style.top, div?.style.width]).toEqual(["30px", "120px", "60px"])
	})
})

describe("8a.4 element types and the context bar and menu", () => {
	it("names pools, lanes and message flows", () => {
		const { ed } = mount()
		expect(ed.getElementType("Participant_own")).toBe("participant")
		expect(ed.getElementType("Participant_bank")).toBe("participant")
		expect(ed.getElementType("Lane_sales")).toBe("lane")
		expect(ed.getElementType("Message_pay")).toBe("messageFlow")
		expect(ed.getElementType("Flow_1")).toBe("sequenceFlow")
	})

	/** The labels of the right-click menu for the selection `ids`. */
	function menuFor(ed: BpmnEditor, ids: string[]): string[] {
		ed.setSelection(ids)
		ed.container.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
		const items = document.querySelectorAll("#bpmnkit-ctx-menu .drop-item")
		return [...items].map((item) => item.textContent ?? "")
	}

	it("offers only Edit label and Delete for a lane or a pool", () => {
		const { ed } = mount(true)
		expect(menuFor(ed, ["Lane_finance"])).toEqual(["Edit label", "Delete"])
		expect(menuFor(ed, ["Participant_bank"])).toEqual(["Edit label", "Delete"])
		const bar = [...(document.getElementById("ctx-toolbar")?.children ?? [])]
		expect(bar.map((b) => (b as HTMLElement).title)).toEqual(["Edit label", "Delete (Del)"])
		expect(document.getElementById("cfg-toolbar")?.children).toHaveLength(0)
	})

	it("offers no label edit for a message flow, which has no label to edit yet", () => {
		const { ed } = mount(true)
		expect(menuFor(ed, ["Message_pay"])).not.toContain("Edit label")
	})
})

describe("8a.5 pools and lanes are not obstacles in the editor", () => {
	it("places a quick-added task to the right of its source inside a pool", () => {
		const { ed } = mount()
		const id = ed.addConnectedElement("Task_review", "task")
		const defs = ed.getDefinitions()
		if (!id || !defs) throw new Error("not added")
		// Right of Task_review (x 160, width 100) by the 60px gap, not the far fallback.
		expect(boundsOf(defs, id).x).toBe(320)
	})
})

describe("8a.6 connecting to a pool or a lane", () => {
	it("turns the ghost red and commits nothing", () => {
		const { ed, inner } = mount()
		ed.startConnectionFrom("Task_review")
		expect(inner._isConnectTargetInvalid("Lane_finance")).toBe(true)
		expect(inner._isConnectTargetInvalid("Participant_bank")).toBe(true)
		expect(inner._isConnectTargetInvalid("Task_pay")).toBe(false)
		inner._doConnect("Task_review", "Lane_finance")
		inner._doConnect("Task_review", "Participant_own")
		expect(ed.canUndo()).toBe(false)
	})
})

describe("8a.7 select-all leaves swimlanes out", () => {
	it("selects the nodes, not the pools and lanes, from the API and from Ctrl+A", () => {
		const { ed, inner } = mount()
		const seen: string[][] = []
		ed.on("editor:select", (ids) => seen.push(ids))
		ed.selectAll()
		inner._host.dispatchEvent(new KeyboardEvent("keydown", { key: "a", ctrlKey: true }))
		expect(seen).toHaveLength(2)
		for (const ids of seen) {
			expect(ids).toContain("Task_review")
			for (const id of SWIMLANES) expect(ids).not.toContain(id)
		}
	})
})

describe("8a.8 presses and drags on pools and lanes", () => {
	/** Hit-tests `(x, y)` as if the browser found `target` there. */
	function hitAt(inner: EditorInternals, target: Element, x: number, y: number) {
		const original = document.elementFromPoint
		document.elementFromPoint = () => target
		try {
			return inner._hitTest(x, y)
		} finally {
			document.elementFromPoint = original
		}
	}

	it("hits the canvas on a lane or pool body, and the shape on its header strip", () => {
		const { inner } = mount()
		const lane = drawnGroup(inner, "Lane_finance")
		expect(hitAt(inner, lane, 300, 180)).toEqual({ type: "canvas" })
		expect(hitAt(inner, lane, 45, 180)).toEqual({ type: "shape", id: "Lane_finance" })
		const pool = drawnGroup(inner, "Participant_bank")
		expect(hitAt(inner, pool, 300, 430)).toEqual({ type: "canvas" })
		expect(hitAt(inner, pool, 15, 430)).toEqual({ type: "shape", id: "Participant_bank" })
	})

	it("does not drag a lane in the preview, which the move would leave in place", () => {
		const { ed, inner } = mount()
		const lane = drawnGroup(inner, "Lane_sales")
		const before = lane.getAttribute("transform")
		ed.setSelection(["Lane_sales", "Task_review"])
		inner._previewTranslate(37, 0)
		expect(lane.getAttribute("transform")).toBe(before)
	})

	it("does not shift a lane in the space tool preview either", () => {
		const { inner } = mount()
		const lane = drawnGroup(inner, "Lane_ops")
		const before = lane.getAttribute("transform")
		inner._previewSpace({ x: 0, y: 200 }, { x: 0, y: 240 }, "v")
		expect(lane.getAttribute("transform")).toBe(before)
	})
})

describe("8a.6 and 8a.9 drops on a flow and on a boundary host", () => {
	it("offers no split of a flow under a dragged lane or pool", () => {
		const { ed, inner } = mount()
		ed.setSelection(["Lane_finance"])
		expect(inner._findEdgeDropTarget(0, 3)).toBeNull()
		ed.setSelection(["Task_review"])
		expect(inner._findEdgeDropTarget(165, 120)).toBe("Flow_3")
	})

	it("offers no split of a flow under a dragged locked node", () => {
		const { ed, inner } = mount(false, lockedPartnerXml())
		ed.setSelection(["Task_p"])
		// Task_p's centre (210, 430) lands on Flow_3 at (375, 180).
		expect(inner._findEdgeDropTarget(165, -250)).toBeNull()
	})

	it("does not offer a node of another process as a boundary host", () => {
		const { inner } = mount(false, lockedPartnerXml())
		expect(inner._canHostBoundary("Task_p")).toBe(false)
		expect(inner._canHostBoundary("Task_review")).toBe(true)
	})
})
