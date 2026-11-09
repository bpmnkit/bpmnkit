// Dumps TS results for the builder's element factories into elements.json.
// Run from the repo root: node crates/bpmnkit-builder/tests/oracle/elements.mjs
//
// The helpers are not exported from dist, so each case drives a `ProcessBuilder` through the
// public methods that call them and records the finished process. The Rust test replays the
// same steps with the factories and the scope finalisation (`finalize_scope`, hoisting).
import { writeFileSync } from "node:fs"
import { pathToFileURL } from "node:url"
// CORE_DIST points at another checkout's built dist when this one has none.
const dist = process.env.CORE_DIST
	? pathToFileURL(`${process.env.CORE_DIST}/index.js`).href
	: new URL("../../../../packages/core/dist/index.js", import.meta.url).href
const { Bpmn, resetIdCounter } = await import(dist)

const embedded = (id, schema) => ({ id, schema })

const cases = [
	// ── service task ──
	{
		name: "service minimal",
		steps: [["serviceTask", "t", { name: "T", taskType: "work" }]],
	},
	{
		name: "service full",
		steps: [
			[
				"serviceTask",
				"t",
				{
					name: "T",
					taskType: "work",
					retries: "3",
					ioMapping: {
						inputs: [{ source: "=a", target: "b" }],
						outputs: [{ source: "=c", target: "d" }],
					},
					taskHeaders: { zed: "1", 10: "ten", 2: "two", alpha: "a" },
					zeebeProperties: [{ name: "k", value: "v" }],
					agentDefinition: { agentType: "x" },
					linkedResources: [
						{ resourceType: "RPA", resourceId: "r", linkName: "l", bindingType: "latest" },
					],
					modelerTemplate: "tpl",
					modelerTemplateVersion: "2",
					modelerTemplateIcon: "data:x",
					isForCompensation: true,
					documentation: "doc",
					executionListeners: [{ eventType: "start", type: "listen", retries: "2" }],
					multiInstance: {
						isSequential: true,
						collection: "=items",
						elementVariable: "item",
						outputCollection: "out",
						outputElement: "=r",
						completionCondition: "=done",
					},
				},
			],
		],
	},
	{
		name: "service io mapping empty",
		steps: [["serviceTask", "t", { name: "T", taskType: "w", ioMapping: {}, taskHeaders: {} }]],
	},
	{
		name: "service multi instance output only",
		steps: [
			[
				"serviceTask",
				"t",
				{ name: "T", taskType: "w", multiInstance: { outputCollection: "o", isSequential: false } },
			],
		],
	},
	{
		name: "service task listener placement error",
		steps: [
			[
				"serviceTask",
				"t",
				{ name: "T", taskType: "w", taskListeners: [{ eventType: "assigning", type: "x" }] },
			],
		],
	},
	// ── script task ──
	{
		name: "script task",
		steps: [
			[
				"scriptTask",
				"s",
				{
					name: "S",
					expression: "=1+1",
					resultVariable: "r",
					documentation: "d",
					isForCompensation: true,
					multiInstance: { collection: "=xs" },
				},
			],
		],
	},
	// ── user task ──
	{
		name: "user minimal",
		steps: [["userTask", "u"]],
	},
	{
		name: "user form id",
		steps: [
			[
				"userTask",
				"u",
				{ name: "U", formId: "f", formBindingType: "versionTag", formVersionTag: "v1" },
			],
		],
	},
	{ name: "user form key", steps: [["userTask", "u", { formKey: "camunda-forms:bpmn:x" }]] },
	{
		name: "user external reference",
		steps: [["userTask", "u", { externalReference: "https://x" }]],
	},
	{
		name: "user embedded form",
		steps: [["userTask", "u", { embeddedForm: embedded("form1", '{"a":1}') }]],
	},
	{
		name: "user shared embedded form",
		steps: [
			["userTask", "u1", { embeddedForm: embedded("form1", "S") }],
			["userTask", "u2", { embeddedForm: embedded("form1", "S") }],
			["userTask", "u3", { embeddedForm: embedded("form2", "T") }],
		],
	},
	{
		name: "user embedded form conflicting schemas",
		steps: [
			["userTask", "u1", { embeddedForm: embedded("form1", "S") }],
			["userTask", "u2", { embeddedForm: embedded("form1", "T") }],
		],
	},
	{
		name: "user two forms error",
		steps: [["userTask", "u", { formId: "a", formKey: "b" }]],
	},
	{
		name: "user empty form key and form id",
		steps: [["userTask", "u", { formKey: "" }]],
	},
	{
		name: "user assignment and schedule",
		steps: [
			[
				"userTask",
				"u",
				{
					zeebeUserTask: true,
					assignee: "=me",
					candidateGroups: "g1,g2",
					candidateUsers: "u1",
					dueDate: "=d",
					followUpDate: "=f",
					priority: 75,
				},
			],
		],
	},
	{
		name: "user priority fraction and zero",
		steps: [
			["userTask", "u1", { priority: 2.5 }],
			["userTask", "u2", { priority: 0 }],
			["userTask", "u3", { priority: 1e21 }],
		],
	},
	{
		name: "user mappings template listeners",
		steps: [
			[
				"userTask",
				"u",
				{
					name: "U",
					ioMapping: { inputs: [{ source: "=a", target: "b" }] },
					taskHeaders: { h: "1" },
					zeebeProperties: [{ name: "p", value: "q" }],
					modelerTemplate: "t",
					modelerTemplateVersion: "3",
					modelerTemplateIcon: "i",
					isForCompensation: true,
					executionListeners: [{ eventType: "end", type: "e" }],
					taskListeners: [{ eventType: "completing", type: "t" }],
					multiInstance: { collection: "=c", elementVariable: "e" },
				},
			],
		],
	},
	{
		name: "user execution listener on task",
		steps: [["userTask", "u", { executionListeners: [{ eventType: "start", type: "x" }] }]],
	},
	// ── business rule / call activity ──
	{ name: "business rule empty", steps: [["businessRuleTask", "b"]] },
	{
		name: "business rule task type",
		steps: [["businessRuleTask", "b", { name: "B", taskType: "dmn" }]],
	},
	{
		name: "business rule decision default result",
		steps: [["businessRuleTask", "b", { decisionId: "d" }]],
	},
	{
		name: "business rule decision both",
		steps: [
			[
				"businessRuleTask",
				"b",
				{
					taskType: "t",
					decisionId: "d",
					resultVariable: "",
					isForCompensation: true,
					multiInstance: { collection: "=c" },
				},
			],
		],
	},
	{
		name: "call activity",
		steps: [
			[
				"callActivity",
				"c",
				{
					name: "C",
					processId: "child",
					propagateAllChildVariables: false,
					propagateAllParentVariables: true,
					bindingType: "versionTag",
					versionTag: "v2",
					ioMapping: { outputs: [{ source: "=x", target: "y" }] },
					zeebeProperties: [{ name: "n", value: "v" }],
					taskHeaders: { ignored: "yes" },
					multiInstance: { collection: "=c", isSequential: true },
					isForCompensation: true,
				},
			],
		],
	},
	{ name: "call activity minimal", steps: [["callActivity", "c", { processId: "p2" }]] },
	// ── plain tasks and message tasks ──
	{
		name: "manual and plain task",
		steps: [
			["manualTask", "m", { name: "M", documentation: "d", isForCompensation: true }],
			["task", "t", { name: "T", executionListeners: [{ eventType: "start", type: "x" }] }],
			["task", "t2"],
		],
	},
	{
		name: "send task",
		steps: [
			["sendTask", "s", { name: "S", messageName: "Order Placed", isForCompensation: true }],
			["sendTask", "s2", { messageName: "Order Placed", multiInstance: { collection: "=c" } }],
			["sendTask", "s3"],
		],
	},
	{
		name: "receive task correlation",
		steps: [
			["receiveTask", "r", { messageName: "Reply", correlationKey: "=id" }],
			["receiveTask", "r2", { messageName: "Reply", correlationKey: "=id" }],
		],
	},
	{
		name: "receive task conflicting keys stay on elements",
		steps: [
			["receiveTask", "r", { messageName: "Reply", correlationKey: "=a" }],
			["receiveTask", "r2", { messageName: "Reply", correlationKey: "=b" }],
			["receiveTask", "r3", { messageName: "Other", correlationKey: "=c" }],
		],
	},
	{
		name: "receive task with key and with orphan key",
		steps: [
			["receiveTask", "r2", { messageName: "M1", correlationKey: "=k" }],
			["receiveTask", "r3", { correlationKey: "=orphan" }],
		],
	},
	{
		name: "receive task with empty key is refused",
		steps: [["receiveTask", "r", { messageName: "M1", correlationKey: "" }]],
	},
	{
		name: "receive task without key is refused",
		steps: [["receiveTask", "r", { messageName: "M1" }]],
	},
	// ── gateways ──
	{
		name: "gateways",
		steps: [
			["exclusiveGateway", "x", { name: "X", defaultFlow: "Flow_x" }],
			["inclusiveGateway", "i", { defaultFlow: "" }],
			["complexGateway", "c", { defaultFlow: "Flow_c", documentation: "d" }],
			["parallelGateway", "p", { name: "P" }],
			["eventBasedGateway", "e"],
		],
	},
	// ── events ──
	{
		name: "start event shell",
		steps: [
			["startEvent", "s"],
			[
				"startEvent",
				"s2",
				{ name: "S2", formId: "form", zeebeProperties: [{ name: "a", value: "b" }] },
			],
		],
	},
	{
		name: "start event definitions",
		steps: [
			["startEvent", "t", { timerCycle: "R/PT1H" }],
			["startEvent", "t2", { timerDuration: "", timerDate: "" }],
			["startEvent", "m", { messageName: "Go Now", modelerTemplate: "tpl" }],
			["startEvent", "c", { condition: "=x > 1", conditionVariableEvents: ["create", "update"] }],
			["startEvent", "c2", { condition: "=y", conditionVariableEvents: [] }],
			["startEvent", "n", { isInterrupting: false }],
		],
	},
	{
		name: "end event definitions",
		steps: [
			["endEvent", "e1"],
			["endEvent", "e2", { errorCode: "E_FAIL" }],
			["endEvent", "e3", { errorRef: "E_FAIL" }],
			["endEvent", "e4", { errorCode: "" }],
			["endEvent", "e5", { messageName: "Done", signalName: "Sig", escalationCode: "ESC" }],
			["endEvent", "e6", { errorCode: "Other Error", name: "Err" }],
		],
	},
	{
		name: "end event error id clash",
		steps: [
			["endEvent", "e1", { errorCode: "a b" }],
			["endEvent", "e2", { errorCode: "a-b" }],
			["endEvent", "e3", { errorCode: "a b" }],
		],
	},
	{
		name: "intermediate throw",
		steps: [
			["intermediateThrowEvent", "t1"],
			["intermediateThrowEvent", "t2", { messageName: "M" }],
			["intermediateThrowEvent", "t3", { signalName: "S", escalationCode: "X" }],
			["intermediateThrowEvent", "t4", { compensation: true, activityRef: "act" }],
			["intermediateThrowEvent", "t5", { linkName: "go" }],
		],
	},
	{
		name: "intermediate catch",
		steps: [
			["intermediateCatchEvent", "c1"],
			["intermediateCatchEvent", "c2", { timerDuration: "PT5M" }],
			["intermediateCatchEvent", "c3", { messageName: "M", correlationKey: "=k" }],
			["intermediateCatchEvent", "c4", { signalName: "S", timerDate: "2030-01-01T00:00:00Z" }],
			["intermediateCatchEvent", "c5", { linkName: "go" }],
			["intermediateCatchEvent", "c6", { condition: "=a", conditionVariableEvents: ["update"] }],
			["intermediateCatchEvent", "c7", { correlationKey: "=nomsg" }],
		],
	},
	{
		name: "boundary events",
		steps: [
			["task", "host"],
			["boundaryEvent", "b1", { attachedTo: "host", timerDuration: "PT1H" }],
			[
				"boundaryEvent",
				"b2",
				{ attachedTo: "host", cancelActivity: false, messageName: "M", correlationKey: "=k" },
			],
			["boundaryEvent", "b3", { attachedTo: "host", errorCode: "E" }],
			["boundaryEvent", "b4", { attachedTo: "host", signalName: "S", name: "B" }],
			["boundaryEvent", "b5", { attachedTo: "host", compensation: true }],
			[
				"boundaryEvent",
				"b6",
				{ attachedTo: "host", condition: "=c", conditionVariableEvents: ["create"] },
			],
			["boundaryEvent", "b7", { attachedTo: "host" }],
		],
	},
	{
		name: "boundary event without host",
		steps: [["boundaryEvent", "b", { attachedTo: "" }]],
	},
	// ── data elements ──
	{
		name: "data elements",
		steps: [
			["dataObject", "do1", { name: "D", isCollection: true }],
			["dataObject", "do2"],
			["dataObjectReference", "dr1", "do1", { name: "R", isCollection: true }],
			["dataObjectReference", "dr2", "do2"],
			["dataStoreReference", "ds", "store", { name: "S" }],
		],
	},
	// ── ad-hoc sub-process tool grid ──
	{
		name: "tool grid columns error",
		steps: [["adHocSubProcess", "ah", { toolGrid: { columns: 2.5 } }]],
	},
	{
		name: "tool grid columns zero error",
		steps: [["adHocSubProcess", "ah", { toolGrid: { columns: 0 } }]],
	},
	// ── scopes ──
	{
		name: "linear chain finalisation",
		steps: [
			["startEvent", "start"],
			["serviceTask", "t1", { name: "T1", taskType: "a" }],
			["endEvent", "end", { errorCode: "BOOM" }],
		],
	},
]

const NON_CHAIN = new Set(["dataObject", "dataObjectReference", "dataStoreReference"])

const dumpCase = (testCase) => {
	resetIdCounter()
	const out = { name: testCase.name }
	// The option bags go into the fixture as JSON text so key order survives.
	out.steps = testCase.steps.map(([method, id, ...rest]) => ({
		method,
		id,
		args: rest.map((arg) => JSON.stringify(arg ?? null)),
	}))
	try {
		const b = Bpmn.createProcess("p")
		for (const [method, id, ...rest] of testCase.steps) {
			if (method === "adHocSubProcess") {
				b.adHocSubProcess(id, () => {}, rest[0])
			} else {
				b[method](id, ...rest)
			}
		}
		const defs = b.build()
		const process = defs.processes[0]
		out.ok = {
			flowElements: JSON.stringify(process.flowElements),
			sequenceFlows: JSON.stringify(process.sequenceFlows),
			extensionElements: JSON.stringify(process.extensionElements),
			messages: JSON.stringify(defs.messages),
			errors: JSON.stringify(defs.errors),
			signals: JSON.stringify(defs.signals),
			escalations: JSON.stringify(defs.escalations),
		}
	} catch (error) {
		out.error = error.message
	}
	return out
}

// Hand-built scopes for the join gateway inference, nested hoisting and nested forms.
const nested = (() => {
	resetIdCounter()
	const joins = Bpmn.createProcess("j")
		.exclusiveGateway("gw")
		.branch("a", (b) => b.condition("x").task("A"))
		.branch("b", (b) => b.task("B"))
		.task("E")
		.build()
	const parallel = Bpmn.createProcess("j2")
		.parallelGateway("fork")
		.branch("a", (b) => b.task("A"))
		.branch("b", (b) => b.task("B"))
		.parallelGateway("join")
		.build()
	const eventBased = Bpmn.createProcess("j3")
		.eventBasedGateway("eb")
		.branch("a", (b) => b.intermediateCatchEvent("C1", { timerDuration: "PT1M" }).task("A"))
		.branch("b", (b) =>
			b.intermediateCatchEvent("C2", { messageName: "m", correlationKey: "=k" }).task("B"),
		)
		.task("Z")
		.build()
	const sub = Bpmn.createProcess("n")
		.subProcess("sp", (s) =>
			s
				.userTask("u", { embeddedForm: embedded("nf", "SCHEMA") })
				.receiveTask("r", { messageName: "Nested", correlationKey: "=k" }),
		)
		.build()
	return {
		joins: JSON.stringify(joins.processes[0]),
		parallel: JSON.stringify(parallel.processes[0]),
		eventBased: JSON.stringify(eventBased.processes[0]),
		sub: {
			process: JSON.stringify(sub.processes[0]),
			messages: JSON.stringify(sub.messages),
		},
	}
})()

const result = { cases: cases.map(dumpCase), nested }
void NON_CHAIN
writeFileSync(
	new URL("./elements.json", import.meta.url),
	`${JSON.stringify(result, null, "\t")}\n`,
)
