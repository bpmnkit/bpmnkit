import { beforeEach, describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnProcess } from "../src/bpmn/bpmn-model.js"
import { Bpmn, resetIdCounter } from "../src/index.js"

/**
 * Regressions found while porting the builders to Rust, where the TS behaviour
 * was the defect rather than the port. Each `it` names the bug letter of the
 * triage list it pins.
 */

function proc(defs: BpmnDefinitions): BpmnProcess {
	return defs.processes[0] as BpmnProcess
}

function flowPairs(defs: BpmnDefinitions): string[] {
	return proc(defs).sequenceFlows.map((f) => `${f.sourceRef}->${f.targetRef}`)
}

beforeEach(() => resetIdCounter())

describe("withBoundary() host check (C)", () => {
	it("ProcessBuilder refuses a start event as host", () => {
		const b = Bpmn.createProcess("p").startEvent("s")
		expect(() => b.withBoundary("b", { timerDuration: "PT1H" }, (x) => x.endEvent("x"))).toThrow(
			'withBoundary() cannot attach to startEvent "s". It must follow a task or activity element.',
		)
	})

	it("ProcessBuilder refuses a boundary event as host, like the other builders", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("h", { taskType: "h" })
			.boundaryEvent("b1", { attachedTo: "h", timerDuration: "PT1H" })
		expect(() => b.withBoundary("b2", { timerDuration: "PT2H" }, (x) => x.endEvent("x"))).toThrow(
			"withBoundary() cannot attach to a boundary event. It must follow a task or activity element.",
		)
	})

	it("branch and sub-process builders refuse a non-activity host", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.exclusiveGateway("g")
				.branch("a", (b) =>
					b
						.intermediateCatchEvent("c", { timerDuration: "PT1H" })
						.withBoundary("b", { timerDuration: "PT1H" }, (x) => x.endEvent("x")),
				),
		).toThrow('withBoundary() cannot attach to intermediateCatchEvent "c".')
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.subProcess("sp", (b) =>
					b.startEvent("ss").withBoundary("b", { timerDuration: "PT1H" }, (x) => x.endEvent("x")),
				),
		).toThrow('withBoundary() cannot attach to startEvent "ss".')
	})

	it("still attaches to an activity", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.serviceTask("h", { taskType: "h" })
			.withBoundary("b", { timerDuration: "PT1H" }, (x) => x.endEvent("x"))
			.endEvent("e")
			.build()
		expect(flowPairs(defs)).toEqual(["s->h", "b->x", "h->e"])
	})
})

describe("ids are unique across scopes (D)", () => {
	it("refuses an ad-hoc tool and an end event sharing an id", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.adHocSubProcess("ah", (x) => x.serviceTask("e", { taskType: "t" }))
			.endEvent("e")
		expect(() => b.build()).toThrow('Duplicate element ID "e" in process "p"')
	})

	it("refuses the same id in two sibling sub-processes", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("a", (x) => x.startEvent("in").endEvent("out"))
			.subProcess("b", (x) => x.startEvent("in2").endEvent("out"))
			.endEvent("e")
		expect(() => b.build()).toThrow('Duplicate element ID "out" in process "p"')
	})
})

describe("BranchBuilder.startEvent (E)", () => {
	it("honours isInterrupting: false like the other builders", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("a", (b) => b.startEvent("s2", { isInterrupting: false }))
			.build()
		const el = proc(defs).flowElements.find((e) => e.id === "s2")
		expect(el?.type === "startEvent" && el.isInterrupting).toBe(false)
	})
})

describe("BranchBuilder after a nested branch() (F)", () => {
	it("connectTo() joins the nested branches' open ends to the target", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("a", (b) =>
				b
					.exclusiveGateway("g2")
					.branch("x", (c) => c.serviceTask("t1", { taskType: "t" }))
					.branch("y", (c) => c.serviceTask("t2", { taskType: "t" }))
					.connectTo("end"),
			)
			.branch("b", (b) => b.connectTo("end"))
			.endEvent("end")
			.build()
		const pairs = flowPairs(defs)
		expect(pairs.some((p) => p.startsWith("undefined"))).toBe(false)
		expect(pairs).toContain("t1->g2_join")
		expect(pairs).toContain("t2->g2_join")
	})

	it("textAnnotation() refuses rather than annotating undefined", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.exclusiveGateway("g")
				.branch("a", (b) =>
					b
						.exclusiveGateway("g2")
						.branch("x", (c) => c.endEvent("e1"))
						.textAnnotation("hi"),
				),
		).toThrow("textAnnotation() must follow a flow element")
	})
})

describe("link catch inside a branch (G: not a defect)", () => {
	it("leaves open ends waiting for the next element, as ProcessBuilder does", () => {
		const defs = Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("a", (b) =>
				b
					.exclusiveGateway("g2")
					.branch("x", (c) => c.serviceTask("t1", { taskType: "t" }))
					.branch("y", (c) => c.serviceTask("t2", { taskType: "t" }))
					.intermediateCatchEvent("lc", { linkName: "L" })
					.serviceTask("t3", { taskType: "t" }),
			)
			.endEvent("end")
			.build()
		const pairs = flowPairs(defs)
		expect(pairs.filter((p) => p.endsWith("->lc"))).toEqual([])
		expect(pairs).toContain("lc->t3")
		expect(pairs).toContain("g2_join->t3")
	})
})

describe("startEvent() chains from the cursor (K: documented)", () => {
	it("chains after an element, as addStartEvent() documents", () => {
		const defs = Bpmn.createProcess("p").task("t").startEvent("s").endEvent("e").build()
		expect(flowPairs(defs)).toEqual(["t->s", "s->e"])
	})
})

describe("insertAfter() then a cursor jump (M)", () => {
	const source = () => {
		resetIdCounter()
		return Bpmn.createProcess("p")
			.startEvent("s")
			.task("a")
			.exclusiveGateway("g")
			.branch("x", (b) => b.task("b").endEvent("e1"))
			.branch("y", (b) => b.endEvent("e2"))
			.build()
	}

	it("at() keeps the spliced flow on the inserted node", () => {
		const defs = Bpmn.continueProcess(source(), "p")
			.insertAfter("a")
			.task("n")
			.at("g")
			.task("m")
			.endEvent("e3")
			.build()
		const pairs = flowPairs(defs)
		expect(pairs).toContain("a->n")
		expect(pairs).toContain("n->g")
		expect(pairs).not.toContain("e3->g")
	})

	it("element() keeps the spliced flow on the inserted node", () => {
		const defs = Bpmn.continueProcess(source(), "p")
			.insertAfter("a")
			.task("n")
			.element("g")
			.task("m")
			.endEvent("e3")
			.build()
		const pairs = flowPairs(defs)
		expect(pairs).toContain("a->n")
		expect(pairs).toContain("n->g")
	})
})

describe("build() shares nothing with the builder (N)", () => {
	it("returns equal, independent results on repeated builds", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("g")
			.branch("a", (x) => x.task("a"))
			.branch("b", (x) => x.task("b"))
			.endEvent("e")
		const first = b.build()
		const firstJson = JSON.stringify(first)
		const second = b.build()
		expect(JSON.stringify(second)).toBe(firstJson)
		expect(second.processes[0]?.flowElements).not.toBe(first.processes[0]?.flowElements)
		proc(first).flowElements.length = 0
		expect(JSON.stringify(b.build())).toBe(firstJson)
	})

	it("builds again from the builder's state, not the first build's joins", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("g")
			.branch("a", (x) => x.task("a"))
			.branch("b", (x) => x.task("b"))
			.endEvent("e")
		b.build()
		b.at("g").branch("c", (x) => x.task("c").connectTo("e"))
		expect(flowPairs(b.build())).toEqual([
			"s->g",
			"g->a",
			"g->b",
			"a->g_join",
			"b->g_join",
			"g->c",
			"c->g_join",
			"g_join->e",
		])
	})

	it("does not grow an earlier result when the builder continues", () => {
		const b = Bpmn.createProcess("p").startEvent("s").task("t")
		const first = b.build()
		b.endEvent("e")
		expect(proc(first).flowElements.map((e) => e.id)).toEqual(["s", "t"])
		expect(proc(b.build()).flowElements.map((e) => e.id)).toEqual(["s", "t", "e"])
	})

	it("a refused explicitJoins build leaves no inferred join behind", () => {
		const b = Bpmn.createProcess("p")
			.startEvent("s")
			.parallelGateway("g")
			.branch("a", (x) => x.task("a"))
			.branch("b", (x) => x.task("b"))
			.endEvent("e")
		expect(() => b.build({ explicitJoins: true })).toThrow(/Inferred join gateways: g_join/)
		expect(() => b.build({ explicitJoins: true })).toThrow(/Inferred join gateways: g_join/)
	})

	it("keeps a continued document's source untouched across builds", () => {
		const source = Bpmn.createProcess("p").startEvent("s").task("a").endEvent("e").build()
		const b = Bpmn.continueProcess(source, "p").insertAfter("a").task("n")
		const first = b.build()
		expect(b.build()).toEqual(first)
		expect(b.build()).not.toBe(first)
	})
})

// A new build rejects "→" (not an NCName), so the source comes from parsed XML, which keeps any id.
function withArrowIds(defs: BpmnDefinitions, from: string, to: string): BpmnDefinitions {
	return Bpmn.parse(
		Bpmn.export(defs).replaceAll(`"${from}"`, `"${to}"`).replaceAll(`>${from}<`, `>${to}<`),
	)
}

describe("continuing a document whose ids contain → (O)", () => {
	it("does not misread the arrow as the endpoint separator", () => {
		const source = withArrowIds(
			Bpmn.createProcess("p").startEvent("s").task("a").task("x_y").build(),
			"x_y",
			"x→y",
		)
		const defs = Bpmn.continueProcess(source, "p").insertAfter("a").task("n").build()
		expect(flowPairs(defs)).toContain("n->x→y")
	})

	it("splices into a flow whose source id contains →", () => {
		const source = withArrowIds(
			Bpmn.createProcess("p").startEvent("s").task("a_b").endEvent("e").build(),
			"a_b",
			"a→b",
		)
		const built = Bpmn.continueProcess(source, "p").insertAfter("a→b").task("n").build()
		expect(flowPairs(built)).toEqual(["s->a→b", "n->e", "a→b->n"])
	})
})
