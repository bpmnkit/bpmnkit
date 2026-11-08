// Dumps TS results for the shared builder helpers into helpers.json.
// Run from the repo root: node crates/bpmnkit-bpmn/tests/oracle/helpers.mjs
import { writeFileSync } from "node:fs"
import { createFlowElement } from "../../../../packages/core/dist/bpmn/element-shape.js"
import {
	restConnectorRetries,
	restConnectorToIoMappingInputs,
	restConnectorToTaskHeaders,
} from "../../../../packages/core/dist/bpmn/rest-connector.js"
import {
	assertExplicitFlowIdsUnique,
	assignEventDefinitionIds,
	assignStableFlowIds,
	markExplicitFlowId,
	rootDefinitionId,
	setFlowDiscriminatorSource,
} from "../../../../packages/core/dist/bpmn/stable-ids.js"
import {
	ensureZeebeExtension,
	makeConditionalDefinition,
} from "../../../../packages/core/dist/bpmn/zeebe-extensions.js"
import { slugify, uniqueId } from "../../../../packages/core/dist/plan/slug.js"

const json = (value) => JSON.parse(JSON.stringify(value))
const attempt = (fn) => {
	try {
		return { ok: fn() ?? null }
	} catch (error) {
		return { error: error.message }
	}
}

const slugs = [
	"Review application",
	"  ünïcödé — text!  ",
	"___",
	"",
	"﻿a\u0085",
	"123 go",
	"😀 smile",
].map((text) => ({ text, slug: slugify(text) }))

const taken = new Set(["a", "a_2", "b"])
const uniques = ["a", "a", "b", "c", "c"].map((base) => ({ base, id: uniqueId(base, taken) }))

const flow = (id, sourceRef, targetRef, extra = {}) => ({
	id,
	sourceRef,
	targetRef,
	extensionElements: [],
	unknownAttributes: {},
	...extra,
})
const gateway = (id, def) => ({ ...createFlowElement(id, "exclusiveGateway"), default: def })
const long = "x".repeat(150)

const flowCases = [
	{
		name: "single and parallel flows, branch and condition discriminators",
		elements: [
			gateway("gw", "f2"),
			createFlowElement("a", "task"),
			createFlowElement("1b", "task"),
		],
		flows: [
			flow("f1", "gw", "a", { name: "Yes" }),
			flow("f2", "gw", "a", { name: "No" }),
			flow("f3", "gw", "1b", {
				conditionExpression: { text: "= x > 1", attributes: {} },
			}),
			flow("f4", "gw", "1b"),
			flow("f5", "gw", "1b"),
			flow("f6", "a", "1b"),
		],
		branch: { f1: "Approved path" },
		explicit: [],
		preserve: null,
	},
	{
		name: "explicit and preserved ids are kept and reserved",
		elements: [
			createFlowElement("Flow_a_b", "task"),
			createFlowElement("a", "task"),
			createFlowElement("b", "task"),
		],
		flows: [flow("keep", "a", "b"), flow("mine", "a", "b"), flow("gen", "a", "b")],
		branch: {},
		explicit: ["mine"],
		preserve: ["keep"],
	},
	{
		name: "explicit id colliding with an element",
		elements: [createFlowElement("a", "task"), createFlowElement("b", "task")],
		flows: [flow("a", "a", "b")],
		branch: {},
		explicit: ["a"],
		preserve: null,
	},
	{
		name: "long ids are capped",
		elements: [createFlowElement(long, "task"), createFlowElement(`${long}2`, "task")],
		flows: [flow("f1", long, `${long}2`), flow("f2", long, `${long}2`, { name: "branch" })],
		branch: {},
		explicit: [],
		preserve: null,
	},
].map((c) => {
	const elements = json(c.elements)
	const flows = json(c.flows)
	for (const f of flows) {
		if (c.branch[f.id]) setFlowDiscriminatorSource(f, c.branch[f.id])
		if (c.explicit.includes(f.id)) markExplicitFlowId(f)
	}
	const input = { elements: json(elements), flows: json(flows) }
	const result = attempt(() => {
		assignStableFlowIds(elements, flows, c.preserve ? new Set(c.preserve) : undefined)
		assertExplicitFlowIdsUnique(elements, flows)
		return { elements, flows }
	})
	return { ...c, ...input, result }
})

const roots = [
	["Message", "Order placed", []],
	["Message", "Order placed", [{ id: "Message_Order_placed" }]],
	["Error", "500", []],
	["Signal", "", []],
].map(([prefix, source, existing]) => ({
	prefix,
	source,
	existing: existing.map((e) => e.id),
	id: rootDefinitionId(prefix, source, existing),
}))

const eventDefs = [
	["Start", [{ type: "timer" }, { type: "message" }, { type: "timer" }]],
	[
		"1 odd id",
		[
			{ type: "message", id: "1_odd_id_MessageEventDefinition_2" },
			{ type: "message" },
			{ type: "message" },
		],
	],
	["End", [{ type: "terminate" }]],
].map(([owner, defs]) => {
	const out = json(defs)
	assignEventDefinitionIds(owner, out)
	return { owner, defs, out }
})

const rest = [
	{ method: "GET", url: "https://x" },
	{
		name: "Call",
		method: "POST",
		url: "=url",
		authentication: { type: "bearer", token: "t" },
		headers: { b: "1", 2: "two", a: "x" },
		queryParameters: "={q: 1}",
		body: "={}",
		connectionTimeoutInSeconds: 1.5,
		readTimeoutInSeconds: 30,
		retries: "5",
		resultVariable: "r",
		resultExpression: "={a: response}",
		retryBackoff: "PT1S",
	},
].map((config) => ({
	config,
	inputs: restConnectorToIoMappingInputs(config),
	headers: restConnectorToTaskHeaders(config),
	retries: restConnectorRetries(config),
}))

const types = [
	"startEvent",
	"endEvent",
	"intermediateThrowEvent",
	"intermediateCatchEvent",
	"boundaryEvent",
	"task",
	"serviceTask",
	"scriptTask",
	"userTask",
	"sendTask",
	"receiveTask",
	"businessRuleTask",
	"manualTask",
	"callActivity",
	"exclusiveGateway",
	"parallelGateway",
	"inclusiveGateway",
	"eventBasedGateway",
	"complexGateway",
	"subProcess",
	"adHocSubProcess",
	"eventSubProcess",
	"transaction",
	"dataObject",
	"dataObjectReference",
	"dataStoreReference",
]
const shapes = types.map((type) => ({
	type,
	element: json(createFlowElement(`${type}_1`, type, { name: "N", documentation: "D" })),
}))

const conditionals = [
	["= a > 1", undefined],
	["= a > 1", []],
	["= a > 1", ["create", "update"]],
].map(([condition, events]) => ({
	condition,
	events: events ?? null,
	definition: makeConditionalDefinition(condition, events),
}))

const ensures = [
	["process", [], "zeebe:versionTag"],
	[
		"process",
		[{ name: "zeebe:versionTag", attributes: { value: "1" }, children: [] }],
		"zeebe:versionTag",
	],
	["manualTask", [], "zeebe:taskDefinition"],
	["eventSubProcess", [], "zeebe:taskDefinition"],
].map(([type, extensionElements, extension]) => {
	const owner = { type, extensionElements: json(extensionElements) }
	const result = attempt(() => {
		ensureZeebeExtension(owner, extension).attributes.marked = "yes"
		return owner.extensionElements
	})
	return { type, extensionElements, extension, result }
})

writeFileSync(
	new URL("./helpers.json", import.meta.url),
	`${JSON.stringify(
		{ slugs, uniques, flowCases, roots, eventDefs, rest, shapes, conditionals, ensures },
		null,
		"\t",
	)}\n`,
)
