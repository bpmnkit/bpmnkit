// @vitest-environment happy-dom
import { Bpmn, type BpmnDefinitions, primaryProcess } from "@bpmnkit/core"
import { afterEach, describe, expect, it } from "vitest"
import { BpmnEditor } from "../src/editor.js"
import type { EditorOp } from "../src/ops.js"
import { lockedIds } from "../src/swimlanes.js"
import { documentOrder, flowableFixture, flowableXml } from "./swimlane-helpers.js"

const editors: BpmnEditor[] = []

function mount(xml?: string): BpmnEditor {
	const container = document.createElement("div")
	container.style.width = "800px"
	container.style.height = "600px"
	document.body.appendChild(container)
	const ed = new BpmnEditor(
		xml === undefined ? { container, grid: false } : { container, xml, grid: false },
	)
	editors.push(ed)
	return ed
}

afterEach(() => {
	for (const ed of editors.splice(0)) ed.destroy()
	document.body.innerHTML = ""
})

/** The editor's single mutation path, which no public method reaches with an id that names nothing. */
function executeOp(ed: BpmnEditor, op: EditorOp): string[] {
	const inner = ed as unknown as { _executeOp(op: EditorOp, options: { label: string }): string[] }
	return inner._executeOp(op, { label: "Rename" })
}

/** Counts the events `load` and edits fire, and keeps the last `diagram:load` warnings. */
function listen(ed: BpmnEditor) {
	const seen = { change: 0, op: 0, missingShapes: [] as string[] }
	ed.on("diagram:change", () => seen.change++)
	ed.on("diagram:op", () => seen.op++)
	ed.on("diagram:load", (_defs, warnings) => {
		seen.missingShapes = warnings.missingShapes
	})
	return seen
}

const FLOW_NODES = ["Start_1", "Task_review", "Gateway_ok", "Task_pay", "End_1"]

describe("the editor on a file whose executable process is drawn on the second diagram", () => {
	it("shows the executable process's plane", () => {
		const ed = mount(flowableXml("second-diagram"))
		for (const id of FLOW_NODES) expect(ed.getShapeBounds(id), id).not.toBeNull()
	})

	it("draws a new shape where it can be seen, and saves the diagrams in their order", () => {
		const ed = mount(flowableXml("second-diagram"))
		const id = ed.addConnectedElement("Task_pay", "task", "Archive")
		expect(id).not.toBeNull()
		expect(ed.getShapeBounds(id ?? "")).not.toBeNull()
		const saved = Bpmn.parse(ed.exportXml())
		expect(documentOrder(saved)).toEqual(documentOrder(flowableFixture("second-diagram")))
	})
})

describe("an edit that changes nothing", () => {
	it("leaves no undo step and tells no one", () => {
		const ed = mount(flowableXml())
		const seen = listen(ed)
		executeOp(ed, { kind: "rename", id: "nothing", name: "x" })
		expect(ed.canUndo()).toBe(false)
		expect(seen.change).toBe(0)
		expect(seen.op).toBe(0)
	})
})

describe("loading a file without diagram interchange", () => {
	const withoutDi = (defs: BpmnDefinitions): BpmnDefinitions => ({ ...defs, diagrams: [] })

	it("lays it out before the first undo step, and says so once with diagram:change", () => {
		const ed = mount()
		const seen = listen(ed)
		ed.loadDefinitions(withoutDi(flowableFixture()))
		for (const id of FLOW_NODES) expect(ed.getShapeBounds(id), id).not.toBeNull()
		expect(ed.canUndo()).toBe(false)
		expect(seen.change).toBe(1)
		expect(seen.op).toBe(0)
		expect(seen.missingShapes).toEqual(expect.arrayContaining(FLOW_NODES))
	})

	it("lays out the executable process on the first plane when it is not listed first", () => {
		const ed = mount()
		ed.loadDefinitions(withoutDi(flowableFixture("second")))
		for (const id of FLOW_NODES) expect(ed.getShapeBounds(id), id).not.toBeNull()
		expect(documentOrder(Bpmn.parse(ed.exportXml())).processes).toEqual([
			"Process_partner",
			"Process_exec",
		])
	})

	it("lays out a pool-less file around its executable process, wherever it is listed", () => {
		const two = `<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" targetNamespace="t">
  <process id="P_other" isExecutable="false"><task id="T_other"/></process>
  <process id="P_exec" isExecutable="true"><task id="T_exec"/></process>
</definitions>`
		const ed = mount()
		ed.load(two)
		const saved = Bpmn.parse(ed.exportXml())
		expect(saved.diagrams[0]?.plane.bpmnElement).toBe("P_exec")
		expect(ed.getShapeBounds("T_exec")).not.toBeNull()
	})

	it("only warns when some shapes are missing, and keeps the layout it has", () => {
		const defs = flowableFixture()
		const plane = defs.diagrams[0]?.plane
		if (!plane) throw new Error("fixture")
		plane.shapes = plane.shapes.filter((s) => s.bpmnElement !== "End_1")
		const ed = mount()
		const seen = listen(ed)
		ed.loadDefinitions(defs)
		expect(ed.getShapeBounds("End_1")).toBeNull()
		expect(ed.getShapeBounds("Task_review")).toEqual({ x: 160, y: 20, width: 100, height: 80 })
		expect(seen.missingShapes).toEqual(["End_1"])
		expect(seen.change).toBe(0)
	})

	it("reports the warnings for the load only, not for each edit after it", () => {
		const defs = flowableFixture()
		const plane = defs.diagrams[0]?.plane
		if (!plane) throw new Error("fixture")
		plane.shapes = plane.shapes.filter((s) => s.bpmnElement !== "End_1")
		const ed = mount()
		const seen = listen(ed)
		ed.loadDefinitions(defs)
		ed.updateColor("Task_review", { fill: "#e0f2f1", stroke: "#00695c" })
		expect(seen.missingShapes).toEqual([])
	})
})

describe("REV-20261028-008: the process the edits go to stays put when its pool is emptied", () => {
	/** A pool `own` drawing `main`, and a pool `other` drawing `partner`. */
	function twoPoolsXml(main: string, partner: string): string {
		const defs = Bpmn.createDiagram("d")
			.process("main", (p) => p.startEvent("a").endEvent("b").participant("own"))
			.process("partner", (p) => p.startEvent("c").endEvent("e").participant("other"))
			.withAutoLayout()
			.build()
		const xml = Bpmn.export(defs)
		return xml
			.replace(/(<bpmn:process id="main")[^>]*>/, `$1${main}>`)
			.replace(/(<bpmn:process id="partner")[^>]*>/, `$1${partner}>`)
	}

	it("keeps the emptied own pool editable, and undo brings its nodes back", () => {
		const ed = mount(twoPoolsXml("", ' isExecutable="false"'))
		executeOp(ed, { kind: "delete", ids: ["a", "b"] })
		const emptied = ed.getDefinitions()
		if (!emptied) throw new Error("no document")
		expect(primaryProcess(emptied)?.id).toBe("main")
		expect(lockedIds(emptied).has("c")).toBe(true)

		const own = emptied.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === "own")?.bounds
		if (!own) throw new Error("no own pool")
		const [created] = executeOp(ed, {
			kind: "createShape",
			type: "task",
			bounds: { x: own.x + 60, y: own.y + 20, width: 100, height: 80 },
			seed: "probe",
		})
		const after = ed.getDefinitions()
		const home = after?.processes.find((p) => p.flowElements.some((e) => e.id === created))
		expect(home?.id).toBe("main")

		ed.undo()
		ed.undo()
		const restored = ed.getDefinitions()
		expect(restored?.processes.map((p) => p.flowElements.map((e) => e.id))).toEqual([
			["a", "b"],
			["c", "e"],
		])
		expect(restored?.processes.map((p) => p.isExecutable)).toEqual([undefined, false])
	})

	it("opens a file whose only process with content is marked non-executable as editable", () => {
		// bpmn.io writes Process_1 isExecutable="false" and a new pool's process without the attribute.
		const xml = twoPoolsXml(' isExecutable="false"', "")
			.replace(/<bpmn:startEvent id="c"[\s\S]*?<\/bpmn:endEvent>/, "")
			.replace(/<bpmn:sequenceFlow id="[^"]*" sourceRef="c"[^>]*\/>/, "")
		const ed = mount(xml)
		const defs = ed.getDefinitions()
		if (!defs) throw new Error("no document")
		expect(defs.processes.find((p) => p.id === "partner")?.flowElements).toEqual([])
		expect(primaryProcess(defs)?.id).toBe("main")
		expect(lockedIds(defs).has("a")).toBe(false)
	})
})
