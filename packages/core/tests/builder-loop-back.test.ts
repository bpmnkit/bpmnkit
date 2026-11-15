import { describe, expect, it } from "vitest"
import type {
	BpmnDefinitions,
	BpmnDiShape,
	BpmnFlowElement,
	BpmnProcess,
} from "../src/bpmn/bpmn-model.js"
import { Bpmn, lintDiagram, placeNewShapes } from "../src/index.js"

/**
 * A `connectTo()` that loops back gives its target a second incoming flow,
 * which is an uncontrolled merge the builder's own lint rejects. The builder
 * now draws the exclusive merge gateway every agent ended up hand-building.
 */

function processOf(defs: BpmnDefinitions, id = "p"): BpmnProcess {
	return defs.processes.find((p) => p.id === id) as BpmnProcess
}

function incomingOf(scope: Pick<BpmnProcess, "sequenceFlows">, id: string): string[] {
	return scope.sequenceFlows.filter((f) => f.targetRef === id).map((f) => f.sourceRef)
}

function errors(defs: BpmnDefinitions): string[] {
	return lintDiagram(defs)
		.diagnostics.filter((d) => d.severity === "error")
		.map((d) => d.message)
}

/** The base model of repro R8 in doc/agent-friction.md. */
function r8Base(layout = false): string {
	const builder = Bpmn.createProcess("p")
		.startEvent("s")
		.userTask("submit", { name: "Submit", formId: "f" })
		.exclusiveGateway("gw")
		.branch("y", (b) => b.condition("=x>1").endEvent("e1"))
		.branch("n", (b) => b.defaultFlow().endEvent("e2"))
	return Bpmn.export((layout ? builder.withAutoLayout() : builder).build())
}

function r8Edit(base: string): BpmnDefinitions {
	return Bpmn.continueProcess(Bpmn.parse(base), "p")
		.insertAfter("submit")
		.serviceTask("validate", { name: "Validate", taskType: "v" })
		.withBoundary("bErr", { name: "Invalid", errorCode: "RECEIPT_INVALID" }, (b) =>
			b.userTask("fix", { name: "Fix", formId: "f" }).connectTo("validate"),
		)
		.build()
}

function overlaps(a: BpmnDiShape["bounds"], b: BpmnDiShape["bounds"]): boolean {
	return a.x < b.x + b.width && b.x < a.x + a.width && a.y < b.y + b.height && b.y < a.y + a.height
}

describe("R8: preserving edit with a loop-back", () => {
	it("lints clean end to end", () => {
		const ed = r8Edit(r8Base())
		expect(errors(ed)).toEqual([])
	})

	it("merges the loop-back in front of the task", () => {
		const process = processOf(r8Edit(r8Base()))
		expect(incomingOf(process, "validate")).toEqual(["validate_merge"])
		expect(incomingOf(process, "validate_merge").sort()).toEqual(["fix", "submit"])
		const merge = process.flowElements.find((e) => e.id === "validate_merge")
		expect(merge?.type).toBe("exclusiveGateway")
	})

	it("gives the boundary's error event definition an id", () => {
		const process = processOf(r8Edit(r8Base()))
		const boundary = process.flowElements.find((e) => e.id === "bErr") as BpmnFlowElement & {
			eventDefinitions: { id?: string }[]
		}
		expect(boundary.eventDefinitions).toHaveLength(1)
		expect(boundary.eventDefinitions[0]?.id).toBeTruthy()
	})

	it("leaves the event definitions of the untouched part alone", () => {
		const built = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.serviceTask("a", { taskType: "a" })
				.withBoundary("old", { errorCode: "OLD" }, (b) => b.endEvent("oe"))
				.endEvent("e")
				.build(),
		)
		const base = built.replace(/(<bpmn:errorEventDefinition) id="[^"]*"/, "$1")
		expect(base).not.toBe(built)
		const ed = Bpmn.continueProcess(Bpmn.parse(base), "p")
			.insertAfter("a")
			.serviceTask("b", { taskType: "b" })
			.withBoundary("new", { errorCode: "NEW" }, (b) => b.endEvent("ne"))
			.build()
		const defOf = (id: string) =>
			(
				processOf(ed).flowElements.find((e) => e.id === id) as BpmnFlowElement & {
					eventDefinitions: { id?: string }[]
				}
			).eventDefinitions[0]
		expect(defOf("old")?.id).toBeUndefined()
		expect(defOf("new")?.id).toBeTruthy()
	})

	it("placeNewShapes leaves no new shape or label overlapping another, or reports it", () => {
		const { definitions, unplaced } = placeNewShapes(r8Edit(r8Base(true)))
		const elements = processOf(definitions).flowElements
		const hostOf = (id: string) =>
			(elements.find((e) => e.id === id) as { attachedToRef?: string } | undefined)?.attachedToRef
		const boxes = (definitions.diagrams[0]?.plane.shapes ?? []).flatMap((s) => [
			{ id: s.bpmnElement, rect: s.bounds },
			...(s.label?.bounds ? [{ id: s.bpmnElement, rect: s.label.bounds }] : []),
		])
		const reported = new Set(unplaced.map((u) => u.id))
		const clashes: string[] = []
		for (let i = 0; i < boxes.length; i++) {
			for (let j = i + 1; j < boxes.length; j++) {
				const a = boxes[i] as { id: string; rect: BpmnDiShape["bounds"] }
				const b = boxes[j] as { id: string; rect: BpmnDiShape["bounds"] }
				if (a.id === b.id || hostOf(a.id) === b.id || hostOf(b.id) === a.id) continue
				if (!overlaps(a.rect, b.rect)) continue
				if (reported.has(a.id) || reported.has(b.id)) continue
				clashes.push(`${a.id}/${b.id}`)
			}
		}
		expect(clashes).toEqual([])
		for (const u of unplaced) expect(u.reason).toMatch(/overlaps/)
		// Every flow node has a shape.
		const drawn = new Set(boxes.map((s) => s.id))
		for (const el of elements) expect(drawn.has(el.id), el.id).toBe(true)
		expect(errors(definitions)).toEqual([])
	})
})

describe("connectTo() merges a second incoming flow", () => {
	it("in the fresh process builder (backward loop)", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.userTask("review", { name: "Review", formId: "f" })
			.exclusiveGateway("ok")
			.branch("yes", (b) => b.condition("=ok").endEvent("done"))
			.branch("no", (b) => b.defaultFlow().userTask("rework", { formId: "f" }).connectTo("review"))
			.build()
		const process = processOf(defs)
		expect(incomingOf(process, "review")).toEqual(["review_merge"])
		expect(incomingOf(process, "review_merge").sort()).toEqual(["rework", "s"])
		expect(errors(defs)).toEqual([])
	})

	it("to a future element, resolved at build()", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("a", { taskType: "a" })
			.withBoundary("t", { timerDuration: "PT1H" }, (b) =>
				b.serviceTask("late", { taskType: "late" }).connectTo("c"),
			)
			.serviceTask("c", { taskType: "c" })
			.endEvent("e")
			.build()
		const process = processOf(defs)
		expect(incomingOf(process, "c")).toEqual(["c_merge"])
		expect(incomingOf(process, "c_merge").sort()).toEqual(["a", "late"])
		expect(errors(defs)).toEqual([])
	})

	it("inside a sub-process", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("sub", (sb) =>
				sb
					.startEvent("ss")
					.serviceTask("work", { taskType: "w" })
					.withBoundary("err", { errorCode: "E" }, (b) =>
						b.serviceTask("repair", { taskType: "r" }).connectTo("work"),
					)
					.endEvent("se"),
			)
			.endEvent("e")
			.build()
		const sub = processOf(defs).flowElements.find((e) => e.id === "sub") as BpmnProcess & {
			id: string
		}
		expect(incomingOf(sub, "work")).toEqual(["work_merge"])
		expect(incomingOf(sub, "work_merge").sort()).toEqual(["repair", "ss"])
		expect(errors(defs)).toEqual([])
	})

	it("does not merge in front of a gateway or replace an inferred parallel join", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("fork")
			.branch("a", (b) => b.serviceTask("ta", { taskType: "a" }))
			.branch("b", (b) => b.serviceTask("tb", { taskType: "b" }))
			.serviceTask("after", { taskType: "x" })
			.endEvent("e")
			.build()
		const process = processOf(defs)
		expect(incomingOf(process, "after")).toEqual(["fork_join"])
		expect(process.flowElements.find((e) => e.id === "fork_join")?.type).toBe("parallelGateway")
		expect(process.flowElements.some((e) => e.id.endsWith("_merge"))).toBe(false)
	})

	it("picks a free id when <target>_merge is taken", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("review_merge", { taskType: "x" })
			.serviceTask("review", { taskType: "r" })
			.exclusiveGateway("ok")
			.branch("yes", (b) => b.condition("=ok").endEvent("done"))
			.branch("no", (b) => b.defaultFlow().connectTo("review"))
			.build()
		const process = processOf(defs)
		const [merge] = incomingOf(process, "review")
		expect(merge).not.toBe("review_merge")
		expect(process.flowElements.find((e) => e.id === merge)?.type).toBe("exclusiveGateway")
	})

	it("in a preserving edit that loops back to an element the document already had", () => {
		const base = Bpmn.export(
			Bpmn.createProcess("p")
				.startEvent("s")
				.serviceTask("work", { taskType: "w" })
				.endEvent("e")
				.withAutoLayout()
				.build(),
		)
		const source = Bpmn.parse(base)
		const ed = Bpmn.continueProcess(source, "p")
			.element("work")
			.withBoundary("err", { errorCode: "E" }, (b) =>
				b.serviceTask("repair", { taskType: "r" }).connectTo("work"),
			)
			.build()
		const process = processOf(ed)
		expect(incomingOf(process, "work")).toEqual(["work_merge"])
		expect(incomingOf(process, "work_merge").sort()).toEqual(["repair", "s"])
		// The document's flow into "work" keeps its id and its target.
		const original = processOf(source).sequenceFlows.find((f) => f.targetRef === "work")
		const kept = process.sequenceFlows.find((f) => f.id === original?.id)
		expect(kept?.targetRef).toBe("work")
		expect(errors(ed)).toEqual([])
		const placed = placeNewShapes(ed)
		expect(errors(placed.definitions)).toEqual([])
	})
})
