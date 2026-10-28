// @vitest-environment happy-dom
/**
 * WP8a in the editor: how selection, hit testing, labels, connections and
 * the context bar and menu treat pools, lanes and message flows.
 */
import { readFileSync } from "node:fs"
import { join } from "node:path"
import { Bpmn } from "@bpmnkit/core"
import { afterEach, describe, expect, it } from "vitest"
import { BpmnEditor } from "../src/editor.js"
import { initEditorHud } from "../src/hud.js"
import { EditorStateMachine } from "../src/state-machine.js"
import {
	boundsOf,
	flowableXml,
	lockedPartnerXml,
	poolLessFlowable,
	poolLessWithOther,
	verticalPoolXml,
} from "./swimlane-helpers.js"

/** The private members these tests reach; they are the paths a pointer or key takes. */
interface EditorInternals {
	_host: HTMLElement
	_containersG: SVGGElement
	_viewport: { set(state: { tx: number; ty: number; scale: number }): void }
	_hitTest(clientX: number, clientY: number): { type: string; id?: string }
	_previewTranslate(dx: number, dy: number): void
	_commitTranslate(dx: number, dy: number): void
	_commitSpace(
		origin: { x: number; y: number },
		current: { x: number; y: number },
		axis: "h" | "v",
	): void
	_previewSpace(
		origin: { x: number; y: number },
		current: { x: number; y: number },
		axis: "v",
	): void
	_isConnectTargetInvalid(targetId: string | null): boolean
	_doConnect(srcId: string, tgtId: string): void
	_findEdgeDropTarget(dx: number, dy: number): string | null
	_canHostBoundary(id: string): boolean
	_onDblClick(e: MouseEvent): void
	_onPointerDown(e: PointerEvent): void
	_onPointerMove(e: PointerEvent): void
	_onPointerUp(e: PointerEvent): void
	_getResizableIds(): Set<string>
	_stateMachine: EditorStateMachine
	_svg: SVGSVGElement
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

	it("offers a lane and a black box their swimlane actions only (8b.5)", () => {
		const { ed } = mount(true)
		expect(menuFor(ed, ["Lane_finance"])).toEqual([
			"Add lane above",
			"Add lane below",
			"Edit label",
			"Delete",
		])
		expect(menuFor(ed, ["Participant_bank"])).toEqual(["Connect", "Edit label", "Delete"])
		const bar = [...(document.getElementById("ctx-toolbar")?.children ?? [])]
		expect(bar.map((b) => (b as HTMLElement).title)).toEqual([
			"Connect to element (click target)",
			"Edit label",
			"Delete (Del)",
		])
		expect(document.getElementById("cfg-toolbar")?.children).toHaveLength(0)
	})

	it("offers a label edit for a message flow (8d.6)", () => {
		const { ed } = mount(true)
		expect(menuFor(ed, ["Message_pay"])).toContain("Edit label")
		expect(menuFor(ed, ["Flow_1"])).not.toContain("Edit label")
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
		expect(inner._isConnectTargetInvalid("Participant_own")).toBe(true)
		// A partner pool takes a message flow since 8d.4.
		expect(inner._isConnectTargetInvalid("Participant_bank")).toBe(false)
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

	it("shifts the lanes below in the space tool preview and outlines the ones it stretches (8c.3)", () => {
		const { inner } = mount()
		const lane = drawnGroup(inner, "Lane_ops")
		inner._previewSpace({ x: 0, y: 200 }, { x: 0, y: 240 }, "v")
		expect(lane.getAttribute("transform")).toBe("translate(30 280)")
		const outlines = [...inner._svg.querySelectorAll(".bpmnkit-space-stretch")].map((r) =>
			["x", "y", "width", "height"].map((k) => Number(r.getAttribute(k))),
		)
		expect(outlines).toContainEqual([0, 0, 640, 400])
		expect(outlines).toContainEqual([30, 120, 610, 160])
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

describe("WP8d in the editor", () => {
	/** The labels of the right-click menu for the selection `ids`. */
	function menuFor(ed: BpmnEditor, ids: string[]): string[] {
		ed.setSelection(ids)
		ed.container.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
		const items = document.querySelectorAll("#bpmnkit-ctx-menu .drop-item")
		return [...items].map((item) => item.textContent ?? "")
	}

	const barTitles = () =>
		[...(document.getElementById("ctx-toolbar")?.children ?? [])].map(
			(b) => (b as HTMLElement).title,
		)

	it("offers no Delete for the own pool, and offers it for a black box", () => {
		const { ed } = mount(true)
		expect(menuFor(ed, ["Participant_own"])).toEqual([
			"Add lane above",
			"Add lane below",
			"Edit label",
		])
		expect(barTitles()).toEqual(["Add lane above", "Add lane below", "Edit label"])
		expect(menuFor(ed, ["Participant_partner"])).toEqual(["Connect", "Edit label", "Delete"])
	})

	it("offers no Delete for a partner pool whose process has content", () => {
		const { ed } = mount(true, lockedPartnerXml())
		expect(menuFor(ed, ["Participant_partner"])).toEqual(["Edit label"])
	})

	it("ignores Delete on the own pool: no undo step", () => {
		const { ed } = mount()
		ed.setSelection(["Participant_own"])
		ed.deleteSelected()
		expect(ed.canUndo()).toBe(false)
	})

	it("moves an aligned node's lane ref with it", () => {
		const { ed } = mount()
		ed.setSelection(["Task_review", "Task_pay"])
		ed.alignSelected("top")
		const lane = ed
			.getDefinitions()
			?.processes[0]?.laneSet?.lanes.find((candidate) => candidate.id === "Lane_sales")
		expect(lane?.flowNodeRefs).toContain("Task_pay")
	})

	it("adds no undo step for a Duplicate of only a lane or a locked node", () => {
		const { ed } = mount(false, lockedPartnerXml())
		for (const id of ["Lane_ops", "Task_p"]) {
			ed.setSelection([id])
			ed.duplicate()
			expect(ed.canUndo(), id).toBe(false)
		}
	})

	it("opens an empty file without diagram interchange untouched, and draws on the first edit", () => {
		const { ed } = mount()
		let changes = 0
		ed.on("diagram:change", () => changes++)
		ed.load(
			'<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" targetNamespace="t"><process id="p" isExecutable="true"/></definitions>',
		)
		expect(changes).toBe(0)
		expect(ed.exportXml()).not.toContain("BPMNDiagram")
		const inner = ed as unknown as {
			_executeOp(op: unknown, options: { label: string }): string[]
		}
		const [created] = inner._executeOp(
			{
				kind: "createShape",
				type: "task",
				bounds: { x: 100, y: 100, width: 100, height: 80 },
				seed: "s",
			},
			{ label: "Create" },
		)
		expect(ed.getShapeBounds(created ?? "")).not.toBeNull()
		expect(changes).toBe(1)
	})
})

describe("WP8d message flows in the editor", () => {
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

	const messages = (ed: BpmnEditor) =>
		ed.getDefinitions()?.collaborations.flatMap((c) => c.messageFlows) ?? []

	it("connects a task to a black box with a message flow, one undo step", () => {
		const { ed, inner } = mount()
		inner._doConnect("Task_review", "Participant_bank")
		expect(messages(ed).map((f) => [f.sourceRef, f.targetRef])).toContainEqual([
			"Task_review",
			"Participant_bank",
		])
		expect(ed.canUndo()).toBe(true)
		ed.undo()
		expect(messages(ed)).toHaveLength(1)
	})

	it("adds no undo step for ends a message flow cannot have", () => {
		const { ed, inner } = mount()
		inner._doConnect("Gateway_ok", "Participant_bank")
		inner._doConnect("Participant_bank", "End_1")
		expect(ed.canUndo()).toBe(false)
	})

	it("reds the ghost for a locked source inside its own pool, not for a message out of it", () => {
		const { ed, inner } = mount(false, lockedPartnerXml())
		ed.startConnectionFrom("Task_p")
		expect(inner._isConnectTargetInvalid("Start_p")).toBe(true)
		expect(inner._isConnectTargetInvalid("Task_review")).toBe(false)
		ed.startConnectionFrom("Gateway_ok")
		expect(inner._isConnectTargetInvalid("Participant_bank")).toBe(true)
	})

	it("targets the innermost pool or lane under the pointer while connecting (I6)", () => {
		const { ed, inner } = mount()
		const pool = drawnGroup(inner, "Participant_bank")
		const lane = drawnGroup(inner, "Lane_finance")
		expect(hitAt(inner, pool, 300, 520)).toEqual({ type: "canvas" })
		ed.startConnectionFrom("Task_review")
		expect(hitAt(inner, pool, 300, 520)).toEqual({ type: "shape", id: "Participant_bank" })
		expect(hitAt(inner, lane, 600, 200)).toEqual({ type: "shape", id: "Lane_finance" })
		expect(hitAt(inner, lane, 320, 180)).toEqual({ type: "shape", id: "Gateway_ok" })
	})

	it("edits a message flow's label from the menu and on a double-click", () => {
		const { ed, inner } = mount()
		ed.editLabel("Message_pay")
		const div = document.querySelector<HTMLElement>(".bpmnkit-label-editor")
		expect(div?.textContent).toBe("Payment")
		expect([div?.style.left, div?.style.top]).toEqual(["455px", "345px"])
		div?.remove()

		const hit = inner._svg.querySelector('[data-bpmnkit-edge-hit="Message_pay"]')
		if (!hit) throw new Error("no hit area")
		const original = document.elementFromPoint
		document.elementFromPoint = () => hit
		try {
			inner._onDblClick(new MouseEvent("dblclick", { clientX: 450, clientY: 300 }))
		} finally {
			document.elementFromPoint = original
		}
		expect(document.querySelector(".bpmnkit-label-editor")?.textContent).toBe("Payment")
	})

	it("offers a locked node no Connect, quick add or annotation", () => {
		const { ed } = mount(true, lockedPartnerXml())
		ed.setSelection(["Task_p"])
		ed.container.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
		const titles = [...(document.getElementById("ctx-toolbar")?.children ?? [])].map(
			(b) => (b as HTMLElement).title,
		)
		expect(titles).not.toContain("Connect to element (click target)")
		expect(titles).not.toContain("Add text annotation")
		expect(titles.some((title) => title.startsWith("Add "))).toBe(false)
		ed.setSelection(["Task_review"])
		const own = [...(document.getElementById("ctx-toolbar")?.children ?? [])].map(
			(b) => (b as HTMLElement).title,
		)
		expect(own).toContain("Connect to element (click target)")
		expect(own).toContain("Add text annotation")
	})
})

describe("final review: drags the model refuses", () => {
	it("puts a dragged node back where it was when the move is refused", () => {
		const { ed, inner } = mount()
		const group = inner._svg.querySelector('[data-bpmnkit-id="Task_review"]')
		ed.setSelection(["Task_review"])
		inner._previewTranslate(0, 420)
		inner._commitTranslate(0, 420)
		expect(ed.canUndo()).toBe(false)
		expect(group?.getAttribute("transform")).toBe("translate(160 20)")
	})

	it("lets the space tool push nodes past the own pool's right edge, which grows", () => {
		const { ed, inner } = mount()
		const ops: unknown[] = []
		ed.on("diagram:op", (op) => ops.push(op))
		inner._commitSpace({ x: 380, y: 0 }, { x: 580, y: 0 }, "h")
		expect(ops).toEqual([{ kind: "space", origin: 380, axis: "h", delta: 200 }])
		const defs = ed.getDefinitions()
		if (!defs) throw new Error("no definitions")
		expect(boundsOf(defs, "Task_pay").x).toBe(600)
		expect(boundsOf(defs, "Participant_own").width).toBe(840)
		ed.undo()
		expect(ed.canUndo()).toBe(false)
	})
})

describe("WP8b in the editor", () => {
	/** The labels of the right-click menu for the selection `ids`. */
	function menuFor(ed: BpmnEditor, ids: string[]): string[] {
		ed.setSelection(ids)
		ed.container.dispatchEvent(new MouseEvent("contextmenu", { bubbles: true }))
		const items = document.querySelectorAll("#bpmnkit-ctx-menu .drop-item")
		return [...items].map((item) => item.textContent ?? "")
	}

	/** Clicks the menu item `label` of the open right-click menu. */
	function choose(label: string): void {
		const items = [...document.querySelectorAll<HTMLElement>("#bpmnkit-ctx-menu .drop-item")]
		const item = items.find((candidate) => candidate.textContent === label)
		if (!item) throw new Error(`no menu item ${label}`)
		item.click()
	}

	const barTitles = () =>
		[...(document.getElementById("ctx-toolbar")?.children ?? [])].map(
			(b) => (b as HTMLElement).title,
		)

	const pointer = (type: string, x: number, y: number) =>
		new PointerEvent(type, { clientX: x, clientY: y, button: 0 })

	const lanes = (ed: BpmnEditor) =>
		(ed.getDefinitions()?.processes.find((p) => p.id === "Process_exec")?.laneSet?.lanes ?? []).map(
			(l) => l.id,
		)

	const pools = (ed: BpmnEditor) =>
		ed.getDefinitions()?.collaborations.flatMap((c) => c.participants) ?? []

	/** {@link flowableXml} with the own pool but no lanes. */
	const unlanedXml = () =>
		flowableXml()
			.replace(/<laneSet[\s\S]*?<\/laneSet>/, "")
			.replace(/\s*<bpmndi:BPMNShape id="Lane_[^"]*"[\s\S]*?<\/bpmndi:BPMNShape>/g, "")

	it("places a pool on a click in the pool tool's create mode (state machine)", () => {
		const calls: Record<string, unknown[][]> = {}
		// biome-ignore lint/suspicious/noExplicitAny: test stub proxying arbitrary callbacks
		const cb = new Proxy({} as any, {
			get:
				(_t, prop: string) =>
				(...args: unknown[]) => {
					calls[prop] = [...(calls[prop] ?? []), args]
				},
		})
		const sm = new EditorStateMachine(cb)
		sm.setMode({ mode: "create", elementType: "participant" })
		sm.onPointerDown(pointer("pointerdown", 5, 6), { x: 5, y: 6 }, { type: "canvas" })
		expect(calls.commitCreatePool).toEqual([[{ x: 5, y: 6 }]])
		expect(calls.commitCreate).toBeUndefined()
		expect(calls.setTool).toEqual([["default"]])
		expect(sm.mode.mode).toBe("default")
		sm.setMode({ mode: "create", elementType: "participant" })
		sm.onKeyDown(new KeyboardEvent("keydown", { key: "Escape" }))
		expect(sm.mode.mode).toBe("default")
		expect(calls.commitCreatePool).toHaveLength(1)
	})

	it("adds a pool button after the space tool that picks the pool tool", () => {
		const { ed } = mount(true)
		const tools: string[] = []
		ed.on("editor:tool", (tool) => tools.push(tool))
		const space = document.getElementById("btn-space")
		const pool = document.getElementById("btn-pool")
		expect(space?.nextElementSibling).toBe(pool)
		expect(pool?.innerHTML).toContain('viewBox="0 0 16 16"')
		pool?.click()
		expect(tools).toEqual(["create:participant"])
		expect(pool?.classList.contains("active")).toBe(true)
	})

	it("ghosts a black box where the click will put it, and puts it there in one undo step", () => {
		const { ed, inner } = mount()
		ed.setTool("create:participant")
		inner._onPointerMove(pointer("pointermove", 300, 630))
		const ghost = document.querySelector(".bpmnkit-ghost")
		expect(ghost?.getAttribute("transform")).toBe("translate(0 600)")
		const rect = ghost?.querySelector("rect")
		expect([rect?.getAttribute("width"), rect?.getAttribute("height")]).toEqual(["640", "60"])
		inner._onPointerDown(pointer("pointerdown", 300, 630))
		const added = pools(ed).at(-1)
		expect(pools(ed)).toHaveLength(4)
		expect(added?.processRef).toBeUndefined()
		expect(boundsOf(ed.getDefinitions() ?? Bpmn.parse(flowableXml()), added?.id ?? "")).toEqual({
			x: 0,
			y: 600,
			width: 640,
			height: 60,
		})
		expect(document.querySelector(".bpmnkit-ghost")).toBeNull()
		expect(ed.getUndoLabel()).toBe("Add pool")
		ed.undo()
		expect(pools(ed)).toHaveLength(3)
		expect(ed.canUndo()).toBe(false)
	})

	it("adds no undo step for a pool clicked over the own pool", () => {
		const { ed, inner } = mount()
		ed.setTool("create:participant")
		inner._onPointerDown(pointer("pointerdown", 300, 100))
		expect(ed.canUndo()).toBe(false)
		expect(pools(ed)).toHaveLength(3)
	})

	it("wraps a process without a pool on the first pool, keeping isExecutable", () => {
		const xml = Bpmn.export(poolLessFlowable(false))
		const { ed, inner } = mount(false, xml)
		ed.setTool("create:participant")
		inner._onPointerDown(pointer("pointerdown", 2000, 2000))
		expect(pools(ed).map((p) => p.processRef)).toEqual(["Process_exec"])
		expect(ed.exportXml()).toContain('isExecutable="true"')
		expect(ed.exportXml()).toContain('flowable:candidateStarterGroups="sales"')
	})

	it("shows no ghost and adds no undo step for a first pool that would leave a process out", () => {
		const { ed, inner } = mount(false, Bpmn.export(poolLessWithOther()))
		ed.setTool("create:participant")
		inner._onPointerMove(pointer("pointermove", 300, 300))
		expect(document.querySelector(".bpmnkit-ghost")).toBeNull()
		inner._onPointerDown(pointer("pointerdown", 300, 300))
		expect(ed.canUndo()).toBe(false)
		expect(pools(ed)).toEqual([])
	})

	it("offers no Add lane or Divide on a pool drawn vertically", () => {
		for (const laned of [true, false]) {
			const { ed } = mount(true, verticalPoolXml(laned))
			for (const id of laned ? ["P", "LA"] : ["P"]) {
				expect(menuFor(ed, [id]), id).not.toContain("Add lane below")
				expect(menuFor(ed, [id]), id).not.toContain("Divide into two lanes")
			}
		}
	})

	it("adds a lane above the right-clicked lane", () => {
		const { ed } = mount(true)
		menuFor(ed, ["Lane_finance"])
		choose("Add lane above")
		const order = lanes(ed)
		expect(order).toHaveLength(4)
		expect(order.indexOf("Lane_finance") - order.indexOf(order[1] ?? "")).toBe(1)
		const defs = ed.getDefinitions()
		if (!defs) throw new Error("no definitions")
		expect(boundsOf(defs, order[1] ?? "").y).toBe(120)
		expect(boundsOf(defs, "Lane_finance").y).toBe(240)
		expect(ed.getUndoLabel()).toBe("Add lane")
		ed.undo()
		expect(lanes(ed)).toEqual(["Lane_sales", "Lane_finance", "Lane_ops"])
	})

	for (const [label, count] of [
		["Divide into two lanes", 2],
		["Divide into three lanes", 3],
	] as const) {
		it(`divides an unlaned pool: ${label}, one undo step`, () => {
			const { ed } = mount(true, unlanedXml())
			expect(lanes(ed)).toEqual([])
			expect(menuFor(ed, ["Participant_own"])).toEqual([
				"Add lane above",
				"Add lane below",
				"Divide into two lanes",
				"Divide into three lanes",
				"Edit label",
			])
			const ops: string[] = []
			ed.on("diagram:op", (op) => ops.push(op.kind))
			choose(label)
			expect(lanes(ed)).toHaveLength(count)
			expect(ops).toEqual(Array.from({ length: count - 1 }, () => "addLane"))
			expect(ed.getUndoLabel()).toBe(label)
			ed.undo()
			expect(lanes(ed)).toEqual([])
			expect(ed.canUndo()).toBe(false)
		})
	}

	it("offers no Divide on a laned pool and no Add lane on nested lanes (I8, fixture 08)", () => {
		const xml = readFileSync(
			join(
				import.meta.dirname,
				"..",
				"..",
				"core",
				"tests",
				"fixtures",
				"roundtrip",
				"08-flowable-lanes-pools.bpmn",
			),
			"utf8",
		)
		const { ed } = mount(true, xml)
		expect(menuFor(ed, ["Participant_company"])).toEqual([
			"Add lane above",
			"Add lane below",
			"Edit label",
		])
		expect(menuFor(ed, ["Lane_sales"])).toEqual(["Edit label"])
		expect(menuFor(ed, ["Lane_inside"])).toEqual(["Edit label", "Delete"])
		expect(menuFor(ed, ["Lane_ops"])).toEqual([
			"Add lane above",
			"Add lane below",
			"Edit label",
			"Delete",
		])
	})

	it("connects a black box to a node with a message flow, from its bar", () => {
		const { ed, inner } = mount(true)
		ed.setSelection(["Participant_bank"])
		const connect = [...(document.getElementById("ctx-toolbar")?.children ?? [])].find(
			(b) => (b as HTMLElement).title === "Connect to element (click target)",
		) as HTMLElement | undefined
		connect?.click()
		const at = { x: 210, y: 60 }
		inner._stateMachine.onPointerDown(pointer("pointerdown", 210, 60), at, {
			type: "shape",
			id: "Task_review",
		})
		const flows = ed.getDefinitions()?.collaborations.flatMap((c) => c.messageFlows) ?? []
		expect(flows.map((f) => [f.sourceRef, f.targetRef])).toContainEqual([
			"Participant_bank",
			"Task_review",
		])
		expect(ed.canUndo()).toBe(true)
	})

	it("anchors a swimlane's bar at its header strip, not below a tall pool", () => {
		const { ed } = mount(true)
		ed.setSelection(["Participant_own"])
		const bar = document.getElementById("ctx-toolbar")
		expect([bar?.style.left, bar?.style.top]).toEqual(["34px", "4px"])
		ed.setSelection(["Lane_finance"])
		expect([bar?.style.left, bar?.style.top]).toEqual(["64px", "124px"])
		ed.setSelection(["Task_review"])
		expect(bar?.style.transform).toBe("")
	})

	it("offers a locked node nothing: no Duplicate, Delete, Color or Edit label", () => {
		const { ed } = mount(true, lockedPartnerXml())
		expect(menuFor(ed, ["Task_p"])).toEqual([])
		expect(document.getElementById("bpmnkit-ctx-menu")?.classList.contains("open")).toBe(false)
		expect(barTitles()).toEqual([])
		expect(document.getElementById("cfg-toolbar")?.children).toHaveLength(0)
		expect(menuFor(ed, ["Task_review"])).toContain("Duplicate")
	})

	it("keeps the clipboard on Ctrl+X of only a lane or a black box, and deletes nothing", () => {
		const { ed, inner } = mount()
		const key = () =>
			inner._host.dispatchEvent(
				new KeyboardEvent("keydown", { key: "x", ctrlKey: true, bubbles: true }),
			)
		ed.setSelection(["Task_review"])
		inner._host.dispatchEvent(
			new KeyboardEvent("keydown", { key: "c", ctrlKey: true, bubbles: true }),
		)
		for (const id of ["Lane_ops", "Participant_bank"]) {
			ed.setSelection([id])
			key()
			expect(ed.canUndo(), id).toBe(false)
		}
		expect(pools(ed)).toHaveLength(3)
		ed.paste()
		const names = ed
			.getDefinitions()
			?.processes[0]?.flowElements.filter((el) => el.name === "Review")
		expect(names).toHaveLength(2)
	})

	// Final review: paste brings back only what the clipboard holds, so a cut
	// deleting the lanes and black boxes of a mixed selection lost them for good.
	it("cuts only the nodes of a mixed selection, leaving its lanes and black boxes", () => {
		for (const swimlane of ["Lane_ops", "Participant_bank"]) {
			const { ed, inner } = mount()
			ed.setSelection(["Task_review", swimlane])
			inner._host.dispatchEvent(
				new KeyboardEvent("keydown", { key: "x", ctrlKey: true, bubbles: true }),
			)
			const defs = ed.getDefinitions()
			const process = defs?.processes.find((p) => p.id === "Process_exec")
			expect(
				process?.flowElements.map((el) => el.id),
				swimlane,
			).not.toContain("Task_review")
			expect(lanes(ed), swimlane).toEqual(["Lane_sales", "Lane_finance", "Lane_ops"])
			expect(pools(ed), swimlane).toHaveLength(3)
			expect(defs?.collaborations.flatMap((c) => c.messageFlows).map((f) => f.id)).toEqual([
				"Message_pay",
			])
			ed.paste()
			const review = ed
				.getDefinitions()
				?.processes.find((p) => p.id === "Process_exec")
				?.flowElements.filter((el) => el.name === "Review")
			expect(review, swimlane).toHaveLength(1)
		}
	})

	// Regression: annotations never reach the clipboard, and the guard above
	// refused the whole cut, so Ctrl+X on a note stopped removing it.
	it("still cuts a text annotation, keeping what was copied", () => {
		const xml = flowableXml()
			.replace(
				'<endEvent id="End_1" name="Done"/>',
				`<endEvent id="End_1" name="Done"/>
    <textAnnotation id="Note_1"><text>Why</text></textAnnotation>`,
			)
			.replace(
				'<bpmndi:BPMNEdge id="Message_pay_di"',
				`<bpmndi:BPMNShape id="Note_1_di" bpmnElement="Note_1"><omgdc:Bounds x="660" y="160" width="100" height="30"/></bpmndi:BPMNShape>
      <bpmndi:BPMNEdge id="Message_pay_di"`,
			)
		const { ed, inner } = mount(false, xml)
		const press = (key: string) =>
			inner._host.dispatchEvent(new KeyboardEvent("keydown", { key, ctrlKey: true, bubbles: true }))
		ed.setSelection(["Task_review"])
		press("c")
		ed.setSelection(["Note_1"])
		press("x")
		const notes = () =>
			ed.getDefinitions()?.processes.flatMap((p) => p.textAnnotations.map((a) => a.id))
		expect(notes()).not.toContain("Note_1")
		expect(ed.canUndo()).toBe(true)
		ed.paste()
		const review = ed
			.getDefinitions()
			?.processes.find((p) => p.id === "Process_exec")
			?.flowElements.filter((el) => el.name === "Review")
		expect(review).toHaveLength(2)
	})

	it("adds no Rename step for a label committed unchanged", () => {
		const { ed } = mount()
		for (const id of ["Task_review", "Participant_own", "Lane_sales"]) {
			ed.editLabel(id)
			const div = document.querySelector<HTMLElement>(".bpmnkit-label-editor")
			div?.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter" }))
			expect(ed.canUndo(), id).toBe(false)
		}
	})
})

describe("WP8c resizing pools and lanes in the editor", () => {
	const pointer = (type: string, x: number, y: number) =>
		new PointerEvent(type, { clientX: x, clientY: y, button: 0 })

	/** The resize handle `dir` the overlay drew for the selected `id`. */
	function handle(inner: EditorInternals, id: string, dir: string): Element {
		const el = inner._svg.querySelector(`[data-bpmnkit-handle="${dir}"][data-bpmnkit-id="${id}"]`)
		if (!el) throw new Error(`no ${dir} handle on ${id}`)
		return el
	}

	/** Drags handle `dir` of `id` from `from` through `path`, the browser finding the handle throughout. */
	function drag(
		inner: EditorInternals,
		id: string,
		dir: string,
		from: { x: number; y: number },
		path: { x: number; y: number }[],
	): void {
		const target = handle(inner, id, dir)
		const original = document.elementFromPoint
		document.elementFromPoint = () => target
		try {
			inner._onPointerDown(pointer("pointerdown", from.x, from.y))
			for (const p of path) inner._onPointerMove(pointer("pointermove", p.x, p.y))
			const end = path.at(-1) ?? from
			inner._onPointerUp(pointer("pointerup", end.x, end.y))
		} finally {
			document.elementFromPoint = original
		}
	}

	it("offers resize handles on the own pool, its lanes and black boxes only", () => {
		const { inner } = mount()
		const ids = inner._getResizableIds()
		for (const id of SWIMLANES) expect(ids.has(id), id).toBe(true)
		const locked = mount(false, lockedPartnerXml()).inner._getResizableIds()
		for (const id of ["Participant_partner", "Start_p", "Task_p"])
			expect(locked.has(id), id).toBe(false)
		expect(locked.has("Participant_bank")).toBe(true)
		const vertical = mount(false, verticalPoolXml(true)).inner._getResizableIds()
		for (const id of ["P", "LA", "LB"]) expect(vertical.has(id), id).toBe(false)
	})

	it("resizes a lane from its bottom handle: one resize op, the lane below shrinks", () => {
		const { ed, inner } = mount()
		const ops: unknown[] = []
		ed.on("diagram:op", (op) => ops.push(op))
		ed.setSelection(["Lane_finance"])
		drag(inner, "Lane_finance", "s", { x: 335, y: 240 }, [
			{ x: 335, y: 260 },
			{ x: 335, y: 280 },
		])
		expect(ops).toEqual([
			{ kind: "resize", id: "Lane_finance", bounds: { x: 30, y: 120, width: 610, height: 160 } },
		])
		const defs = ed.getDefinitions()
		if (!defs) throw new Error("no definitions")
		expect(boundsOf(defs, "Lane_ops")).toEqual({ x: 30, y: 280, width: 610, height: 80 })
		ed.undo()
		expect(ed.canUndo()).toBe(false)
	})

	it("previews the clamped bounds while dragging", () => {
		const { ed, inner } = mount()
		ed.setSelection(["Lane_finance"])
		const target = handle(inner, "Lane_finance", "s")
		const original = document.elementFromPoint
		document.elementFromPoint = () => target
		try {
			inner._onPointerDown(pointer("pointerdown", 335, 240))
			inner._onPointerMove(pointer("pointermove", 335, 160))
		} finally {
			document.elementFromPoint = original
		}
		// Task_pay reaches y=220 in Finance, so the bottom edge stops there.
		const preview = inner._svg.querySelector(".bpmnkit-resize-preview")
		expect(preview?.getAttribute("height")).toBe("100")
	})

	it("adds no undo step for a drag that ends where it started", () => {
		const { ed, inner } = mount()
		ed.setSelection(["Lane_finance"])
		drag(inner, "Lane_finance", "s", { x: 335, y: 240 }, [
			{ x: 335, y: 280 },
			{ x: 335, y: 240 },
		])
		expect(ed.canUndo()).toBe(false)
		expect(inner._svg.querySelector(".bpmnkit-resize-preview")).toBeNull()
	})
})

describe("WP8c moving pools and making space in the editor", () => {
	/** The `<g>` the canvas draws for `id`: containers and nodes alike. */
	const group = (inner: EditorInternals, id: string) =>
		inner._svg.querySelector(`[data-bpmnkit-id="${id}"]`)

	it("drags the own pool's lanes, nodes and notes along in the preview (8c.2)", () => {
		const { ed, inner } = mount()
		ed.setSelection(["Participant_own"])
		inner._previewTranslate(40, 20)
		const [dx, dy] = (group(inner, "Participant_own")?.getAttribute("transform") ?? "")
			.match(/-?[\d.]+/g)
			?.map(Number) ?? [0, 0]
		expect([dx, dy]).not.toEqual([0, 0])
		expect(group(inner, "Lane_finance")?.getAttribute("transform")).toBe(
			`translate(${30 + (dx ?? 0)} ${120 + (dy ?? 0)})`,
		)
		expect(group(inner, "Task_review")?.getAttribute("transform")).toBe(
			`translate(${160 + (dx ?? 0)} ${20 + (dy ?? 0)})`,
		)
		// The partner stays.
		expect(group(inner, "Participant_partner")?.getAttribute("transform")).toBe("translate(0 400)")
	})

	it("moves the pool as one undo step, and puts everything back when the drop is refused", () => {
		const { ed, inner } = mount()
		ed.setSelection(["Participant_own"])
		inner._previewTranslate(0, 100)
		inner._commitTranslate(0, 100)
		// Onto the partner pool: refused, no undo step, the preview reset.
		expect(ed.canUndo()).toBe(false)
		expect(group(inner, "Participant_own")?.getAttribute("transform")).toBe("translate(0 0)")
		expect(group(inner, "Task_review")?.getAttribute("transform")).toBe("translate(160 20)")
		expect(group(inner, "Lane_ops")?.getAttribute("transform")).toBe("translate(30 240)")
		inner._previewTranslate(700, 0)
		inner._commitTranslate(700, 0)
		expect(ed.canUndo()).toBe(true)
		const defs = ed.getDefinitions()
		if (!defs) throw new Error("no definitions")
		expect(boundsOf(defs, "Task_review").x).toBe(860)
		ed.undo()
		expect(ed.canUndo()).toBe(false)
	})

	it("adds no undo step and emits no op for a pool drag that snaps back to where it was", () => {
		const { ed, inner } = mount()
		const ops: unknown[] = []
		ed.on("diagram:op", (op) => ops.push(op))
		ed.setSelection(["Participant_own"])
		inner._previewTranslate(-6, 4)
		inner._commitTranslate(-6, 4)
		expect(ops).toEqual([])
		expect(ed.canUndo()).toBe(false)
		expect(group(inner, "Participant_own")?.getAttribute("transform")).toBe("translate(0 0)")
	})

	it("adds no undo step for a space drag of nothing or across a vertical pool", () => {
		const { ed, inner } = mount()
		inner._commitSpace({ x: 380, y: 0 }, { x: 380, y: 0 }, "h")
		expect(ed.canUndo()).toBe(false)
		const vertical = mount(false, verticalPoolXml(true))
		vertical.inner._previewSpace({ x: 0, y: 200 }, { x: 0, y: 240 }, "v")
		expect(vertical.inner._svg.querySelector(".bpmnkit-space-stretch")).toBeNull()
		vertical.inner._commitSpace({ x: 0, y: 200 }, { x: 0, y: 240 }, "v")
		expect(vertical.ed.canUndo()).toBe(false)
	})
})

describe("WP8b leftovers", () => {
	const pointer = (type: string, x: number, y: number) =>
		new PointerEvent(type, { clientX: x, clientY: y, button: 0 })
	const reviews = (ed: BpmnEditor) =>
		ed
			.getDefinitions()
			?.processes.find((p) => p.id === "Process_exec")
			?.flowElements.filter((el) => el.name === "Review") ?? []

	it("keeps the clipboard on a Ctrl+C or Duplicate of only swimlanes or locked nodes", () => {
		const { ed, inner } = mount(false, lockedPartnerXml())
		const copy = () =>
			inner._host.dispatchEvent(
				new KeyboardEvent("keydown", { key: "c", ctrlKey: true, bubbles: true }),
			)
		ed.setSelection(["Task_review"])
		copy()
		for (const id of ["Lane_ops", "Participant_bank", "Task_p"]) {
			ed.setSelection([id])
			copy()
			ed.duplicate()
			expect(ed.canUndo(), id).toBe(false)
		}
		ed.paste()
		expect(reviews(ed)).toHaveLength(2)
	})

	it("draws the pool tool's ghost in the refused style over the own pool", () => {
		const { ed, inner } = mount()
		ed.setTool("create:participant")
		inner._onPointerMove(pointer("pointermove", 300, 100))
		expect(
			document.querySelector(".bpmnkit-ghost")?.classList.contains("bpmnkit-ghost-refused"),
		).toBe(true)
		inner._onPointerMove(pointer("pointermove", 300, 630))
		const ghost = document.querySelector(".bpmnkit-ghost")
		expect(ghost).not.toBeNull()
		expect(ghost?.classList.contains("bpmnkit-ghost-refused")).toBe(false)
	})

	it("disables the pool button, saying why, where the first pool would be refused", () => {
		const { ed } = mount(true, Bpmn.export(poolLessWithOther()))
		const button = document.getElementById("btn-pool") as HTMLButtonElement | null
		expect(button?.disabled).toBe(true)
		expect(button?.title).toBe("Cannot create a pool: another process with content has no pool")
		ed.load(Bpmn.export(poolLessFlowable(false)))
		expect(button?.disabled).toBe(false)
		expect(button?.title).toBe("Create pool")
	})
})
