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
