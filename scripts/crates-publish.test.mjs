import assert from "node:assert/strict"
import { test } from "node:test"
import {
	TRUSTED_PUBLISHER,
	facadeProblems,
	hasTrustedPublisher,
	indexPath,
	publishOrder,
} from "./crates-publish.mjs"

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

test("indexPath follows the sparse index layout", () => {
	assert.equal(indexPath("ab"), "2/ab")
	assert.equal(indexPath("abc"), "3/a/abc")
	assert.equal(indexPath("bpmnkit-XML"), "bp/mn/bpmnkit-xml")
})

test("hasTrustedPublisher matches only our workflow and environment", () => {
	const ours = { ...TRUSTED_PUBLISHER, repository_owner: "BpmnKit" }
	assert.equal(hasTrustedPublisher([]), false)
	assert.equal(hasTrustedPublisher([ours]), true)
	assert.equal(hasTrustedPublisher([{ ...ours, environment: null }]), false)
	assert.equal(hasTrustedPublisher([{ ...ours, workflow_filename: "ci.yml" }]), false)
})
