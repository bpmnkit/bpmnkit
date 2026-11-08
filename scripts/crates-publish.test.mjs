import assert from "node:assert/strict"
import { test } from "node:test"
import { facadeProblems, publishOrder } from "./crates-publish.mjs"

const crate = (name, deps = []) => ({
	name,
	internal: deps.map((d) => ({ name: d })),
	internalAll: deps.map((d) => ({ name: d })),
})

test("publishOrder puts dependencies first and the facade last", () => {
	const crates = [
		crate("bpmnkit", ["bpmnkit-bpmn", "bpmnkit-xml"]),
		crate("bpmnkit-bpmn", ["bpmnkit-xml"]),
		crate("bpmnkit-xml"),
	]
	assert.deepEqual(publishOrder(crates), ["bpmnkit-xml", "bpmnkit-bpmn", "bpmnkit"])
})

test("facadeProblems wants the facade to depend on every other published crate", () => {
	const xml = crate("bpmnkit-xml")
	const bpmn = crate("bpmnkit-bpmn", ["bpmnkit-xml"])
	assert.deepEqual(
		facadeProblems([xml, bpmn, crate("bpmnkit", ["bpmnkit-xml", "bpmnkit-bpmn"])]),
		[],
	)
	assert.deepEqual(facadeProblems([xml, bpmn, crate("bpmnkit", ["bpmnkit-xml"])]), [
		"bpmnkit: the facade does not re-export bpmnkit-bpmn",
	])
	assert.deepEqual(facadeProblems([xml, bpmn]), ["bpmnkit: the facade crate is missing"])
})
