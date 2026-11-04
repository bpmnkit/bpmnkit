// Run with: node --test scripts/lib/closeness.test.mjs
import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { test } from "node:test"
import { scoreCloseness } from "./closeness.mjs"

const shape = (id, x) =>
	`<bpmndi:BPMNShape id="${id}_di" bpmnElement="${id}"><dc:Bounds x="${x}" y="100" width="100" height="80"/></bpmndi:BPMNShape>`

const model = ({
	taskName = "Check",
	jobType = "check",
	dx = 0,
	withEnd = true,
} = {}) => `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="d" targetNamespace="x">
<bpmn:process id="p" name="Proc" isExecutable="true">
<bpmn:startEvent id="s" name="Go"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
<bpmn:serviceTask id="t" name="${taskName}"><bpmn:extensionElements><zeebe:taskDefinition type="${jobType}"/></bpmn:extensionElements><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:serviceTask>
${withEnd ? '<bpmn:endEvent id="e" name="Done"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>' : ""}
<bpmn:sequenceFlow id="f1" sourceRef="s" targetRef="t"/>
${withEnd ? '<bpmn:sequenceFlow id="f2" sourceRef="t" targetRef="e"/>' : ""}
<bpmn:textAnnotation id="a"><bpmn:text>Note</bpmn:text></bpmn:textAnnotation>
<bpmn:association id="as" sourceRef="t" targetRef="a"/>
</bpmn:process>
<bpmndi:BPMNDiagram id="g"><bpmndi:BPMNPlane id="pl" bpmnElement="p">
${shape("s", 0 + dx)}${shape("t", 200 + dx)}${withEnd ? shape("e", 400 + dx) : ""}
</bpmndi:BPMNPlane></bpmndi:BPMNDiagram>
</bpmn:definitions>`

const ref = model()
const parts = (r) => Object.fromEntries(Object.entries(r.parts).map(([k, v]) => [k, v.score]))

test("identical input scores 100", () => {
	const r = scoreCloseness(ref, ref)
	assert.equal(r.total, 100)
	assert.deepEqual(
		Object.values(r.parts).map((p) => p.score),
		Object.values(r.parts).map((p) => p.max),
	)
})

test("renaming a task lowers only structure", () => {
	const base = parts(scoreCloseness(ref, ref))
	const p = parts(scoreCloseness(model({ taskName: "Other" }), ref))
	assert.ok(p.structure < base.structure)
	assert.equal(p.configuration, base.configuration)
	assert.equal(p.annotations, base.annotations)
	assert.equal(p.layout, base.layout)
})

test("changing the job type lowers only configuration", () => {
	const base = parts(scoreCloseness(ref, ref))
	const p = parts(scoreCloseness(model({ jobType: "other" }), ref))
	assert.ok(p.configuration < base.configuration)
	assert.equal(p.structure, base.structure)
	assert.equal(p.layout, base.layout)
})

test("moving every shape by 200 px lowers only layout", () => {
	const base = parts(scoreCloseness(ref, ref))
	const p = parts(scoreCloseness(model({ dx: 200 }), ref))
	assert.ok(p.layout < base.layout)
	assert.equal(p.structure, base.structure)
	assert.equal(p.configuration, base.configuration)
	assert.equal(p.annotations, base.annotations)
})

test("layout: false drops the layout part and rescales the total", () => {
	const r = scoreCloseness(model({ dx: 200 }), ref, { layout: false })
	assert.equal(r.parts.layout.max, 0)
	assert.equal(r.total, 100)
})

test("a missing element lowers structure", () => {
	const base = parts(scoreCloseness(ref, ref))
	const p = parts(scoreCloseness(model({ withEnd: false }), ref))
	assert.ok(p.structure < base.structure)
})

test("bake-off expected.bpmn against itself scores 100", () => {
	const xml = readFileSync(
		new URL("../../packages/core/tests/fixtures/bakeoff/expected.bpmn", import.meta.url),
		"utf8",
	)
	assert.equal(scoreCloseness(xml, xml).total, 100)
})

// --- structure mode (options.match: "structure") ---------------------------------------------

const NS =
	'xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"'

// nodes: [id, bpmn element, name, inner xml]; edges: [from, to]; col/row place the shapes.
const graph = (nodes, edges, { pos = {}, rename = (s) => s } = {}) => {
	const els = nodes
		.map(([id, tag, name, inner = "", attrs = ""]) => {
			const n = rename(id)
			return `<bpmn:${tag} id="${n}" name="${rename(name)}"${attrs}>${inner}</bpmn:${tag}>`
		})
		.join("")
	const flows = edges
		.map(
			([a, b]) =>
				`<bpmn:sequenceFlow id="${rename(`${a}_${b}`)}" sourceRef="${rename(a)}" targetRef="${rename(b)}"/>`,
		)
		.join("")
	const shapes = nodes
		.map(([id], i) => {
			const [x, y] = pos[id] ?? [i * 150, 100]
			return `<bpmndi:BPMNShape id="${rename(id)}_di" bpmnElement="${rename(id)}"><dc:Bounds x="${x}" y="${y}" width="100" height="80"/></bpmndi:BPMNShape>`
		})
		.join("")
	return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions ${NS} id="${rename("d")}" targetNamespace="x"><bpmn:process id="${rename("p")}" name="${rename("Proc")}" isExecutable="true">${els}${flows}</bpmn:process>
<bpmndi:BPMNDiagram id="g"><bpmndi:BPMNPlane id="pl" bpmnElement="${rename("p")}">${shapes}</bpmndi:BPMNPlane></bpmndi:BPMNDiagram></bpmn:definitions>`
}

const svc = '<bpmn:extensionElements><zeebe:taskDefinition type="job"/></bpmn:extensionElements>'
const frm = '<bpmn:extensionElements><zeebe:formDefinition formId="f"/></bpmn:extensionElements>'
const timer = "<bpmn:timerEventDefinition/>"
const structure = { match: "structure" }

// start -> A(service) -> B(user) -> XOR split -> C / D -> XOR join -> end, plus a timer boundary on A.
const FLOW_NODES = [
	["s", "startEvent", "Begin"],
	["a", "serviceTask", "Validate order", svc],
	["b", "userTask", "Approve", frm],
	["g", "exclusiveGateway", "Fine?"],
	["c", "serviceTask", "Ship", svc],
	["d", "serviceTask", "Reject", svc],
	["j", "exclusiveGateway", ""],
	["e", "endEvent", "Finished"],
]
const FLOW_EDGES = [
	["s", "a"],
	["a", "b"],
	["b", "g"],
	["g", "c"],
	["g", "d"],
	["c", "j"],
	["d", "j"],
	["j", "e"],
]
const POS = {
	s: [0, 100],
	a: [150, 100],
	b: [300, 100],
	g: [450, 100],
	c: [600, 0],
	d: [600, 200],
	j: [750, 100],
	e: [900, 100],
}
const refG = graph(FLOW_NODES, FLOW_EDGES, { pos: POS })

test("structure: default mode is id and details.match reports the mode", () => {
	assert.equal(scoreCloseness(refG, refG).details.match, "id")
	assert.equal(scoreCloseness(refG, refG, structure).details.match, "structure")
	assert.equal(scoreCloseness(refG, refG, structure).total, 100)
})

test("structure: renaming every id and name keeps a high score only in structure mode", () => {
	const renamed = graph(FLOW_NODES, FLOW_EDGES, {
		pos: POS,
		rename: (s) => `x_${s.split("").reverse().join("")}`,
	})
	const st = scoreCloseness(renamed, refG, structure)
	const id = scoreCloseness(renamed, refG)
	assert.ok(st.total >= 95, `structure ${st.total}`)
	assert.ok(id.total < 50, `id ${id.total}`)
})

test("structure: a removed branch scores lower than identical", () => {
	const nodes = FLOW_NODES.filter(([id]) => id !== "d")
	const edges = FLOW_EDGES.filter(([a, b]) => a !== "d" && b !== "d")
	const r = scoreCloseness(graph(nodes, edges, { pos: POS }), refG, structure)
	assert.ok(r.total < 100)
	assert.ok(r.parts.structure.score < 25)
})

test("structure: swapping two sequential tasks costs a little, not the floor", () => {
	const swapped = FLOW_NODES.map((n) =>
		n[0] === "a"
			? ["a", "userTask", n[2], frm]
			: n[0] === "b"
				? ["b", "serviceTask", n[2], svc]
				: n,
	)
	const r = scoreCloseness(graph(swapped, FLOW_EDGES, { pos: POS }), refG, structure)
	assert.ok(r.total < 100)
	assert.ok(r.total > 85 && r.total < 99, `total ${r.total}`)
})

test("structure: same element types wired differently score clearly lower", () => {
	// Same nodes and positions, but a plain chain in a scrambled order (no gateway split/join).
	const order = ["s", "c", "g", "d", "a", "j", "b", "e"]
	const edges = order.slice(1).map((id, i) => [order[i], id])
	const r = scoreCloseness(graph(FLOW_NODES, edges, { pos: POS }), refG, structure)
	// Structure is only 25 points and half of it is the (still matched) elements, so ~10 is the realistic gap.
	assert.ok(r.total <= 92, `total ${r.total}`)
	assert.ok(r.parts.structure.score <= 18, `structure ${r.parts.structure.score}`)
})

test("structure: robust to loops (back edges)", () => {
	const edges = [...FLOW_EDGES, ["j", "a"]]
	const g = graph(FLOW_NODES, edges, { pos: POS })
	assert.equal(scoreCloseness(g, g, structure).total, 100)
})

test("structure: no annotations on either side gives the full annotation points in both modes", () => {
	for (const opts of [{}, structure])
		assert.equal(scoreCloseness(refG, refG, opts).parts.annotations.score, 15)
})

test("structure: a boundary event matches by its event definition", () => {
	const withTimer = graph(
		[...FLOW_NODES, ["t", "boundaryEvent", "", timer, ' attachedToRef="a"']],
		FLOW_EDGES,
		{ pos: POS },
	)
	assert.equal(scoreCloseness(withTimer, withTimer, structure).total, 100)
})
