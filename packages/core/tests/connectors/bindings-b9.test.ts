import { describe, expect, it } from "vitest"
import { applyElementTemplate, applyTemplateToElement } from "../../src/connectors/index.js"
import type { ElementTemplate, TemplateProperty } from "../../src/connectors/index.js"
import { validateElementTemplate } from "../../src/connectors/validate.js"
import { Bpmn } from "../../src/index.js"
import type { BpmnDefinitions, BpmnFlowElement, XmlElement } from "../../src/index.js"

const FIXTURE = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0" id="D" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:callActivity id="call" />
    <bpmn:businessRuleTask id="rule" />
    <bpmn:userTask id="user" />
    <bpmn:scriptTask id="script" />
    <bpmn:serviceTask id="svc" />
  </bpmn:process>
</bpmn:definitions>`

const fixture = (): BpmnDefinitions => Bpmn.parse(FIXTURE)

function el(defs: BpmnDefinitions, id: string): BpmnFlowElement {
	const found = defs.processes[0]?.flowElements.find((e) => e.id === id)
	if (!found) throw new Error(`no ${id}`)
	return found
}
function ext(defs: BpmnDefinitions, id: string, name: string): XmlElement | undefined {
	return el(defs, id).extensionElements?.find((x) => x.name === name)
}
/** Applies, then round-trips through XML so the assertion sees what a file would hold. */
function applyTo(
	defs: BpmnDefinitions,
	id: string,
	props: TemplateProperty[],
	values: Record<string, string> = {},
	appliesTo = ["bpmn:Task"],
) {
	const t: ElementTemplate = { id: "t", name: "T", version: 1, appliesTo, properties: props }
	const r = applyTemplateToElement(defs, id, t, values)
	return { ...r, definitions: Bpmn.parse(Bpmn.export(r.definitions)) }
}
const hidden = (value: string, binding: TemplateProperty["binding"]): TemplateProperty => ({
	type: "Hidden",
	value,
	binding,
})

describe("template bindings — Zeebe task extensions", () => {
	const A = ["bpmn:CallActivity"]
	it("zeebe:calledElement writes processId, binding and propagation flags", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"call",
			[
				hidden("child", { type: "zeebe:calledElement", property: "processId" }),
				hidden("versionTag", { type: "zeebe:calledElement", property: "bindingType" }),
				hidden("v1", { type: "zeebe:calledElement", property: "versionTag" }),
				{
					type: "Boolean",
					value: true,
					binding: { type: "zeebe:calledElement", property: "propagateAllChildVariables" },
				},
			],
			{},
			A,
		)
		expect(problems).toEqual([])
		expect(ext(definitions, "call", "zeebe:calledElement")?.attributes).toEqual({
			processId: "child",
			bindingType: "versionTag",
			versionTag: "v1",
			propagateAllChildVariables: "true",
		})
	})

	it("zeebe:calledDecision writes decisionId, resultVariable and binding", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"rule",
			[
				hidden("d", { type: "zeebe:calledDecision", property: "decisionId" }),
				hidden("r", { type: "zeebe:calledDecision", property: "resultVariable" }),
				hidden("versionTag", { type: "zeebe:calledDecision", property: "bindingType" }),
				hidden("v2", { type: "zeebe:calledDecision", property: "versionTag" }),
			],
			{},
			["bpmn:BusinessRuleTask"],
		)
		expect(problems).toEqual([])
		expect(ext(definitions, "rule", "zeebe:calledDecision")?.attributes).toEqual({
			decisionId: "d",
			resultVariable: "r",
			bindingType: "versionTag",
			versionTag: "v2",
		})
	})

	it("zeebe:userTask is a flag: present without a value, with formDefinition, assignment, schedule, priority", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"user",
			[
				{ type: "Hidden", binding: { type: "zeebe:userTask" } },
				hidden("f1", { type: "zeebe:formDefinition", property: "formId" }),
				hidden("=boss", { type: "zeebe:assignmentDefinition", property: "assignee" }),
				hidden("g1,g2", { type: "zeebe:assignmentDefinition", property: "candidateGroups" }),
				hidden("=due", { type: "zeebe:taskSchedule", property: "dueDate" }),
				hidden("=fu", { type: "zeebe:taskSchedule", property: "followUpDate" }),
				{
					type: "Number",
					value: 42,
					binding: { type: "zeebe:priorityDefinition", property: "priority" },
				},
			],
			{},
			["bpmn:UserTask"],
		)
		expect(problems).toEqual([])
		expect(ext(definitions, "user", "zeebe:userTask")).toBeDefined()
		expect(ext(definitions, "user", "zeebe:formDefinition")?.attributes).toEqual({ formId: "f1" })
		expect(ext(definitions, "user", "zeebe:assignmentDefinition")?.attributes).toEqual({
			assignee: "=boss",
			candidateGroups: "g1,g2",
		})
		expect(ext(definitions, "user", "zeebe:taskSchedule")?.attributes).toEqual({
			dueDate: "=due",
			followUpDate: "=fu",
		})
		expect(ext(definitions, "user", "zeebe:priorityDefinition")?.attributes).toEqual({
			priority: "42",
		})
	})

	it("zeebe:formDefinition externalReference writes only that", () => {
		const { definitions } = applyTo(
			fixture(),
			"user",
			[hidden("https://x", { type: "zeebe:formDefinition", property: "externalReference" })],
			{},
			["bpmn:UserTask"],
		)
		expect(ext(definitions, "user", "zeebe:formDefinition")?.attributes).toEqual({
			externalReference: "https://x",
		})
	})

	it("zeebe:script writes expression and resultVariable", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"script",
			[
				{
					type: "String",
					feel: "required",
					value: "= a + b",
					binding: { type: "zeebe:script", property: "expression" },
				},
				hidden("sum", { type: "zeebe:script", property: "resultVariable" }),
			],
			{},
			["bpmn:ScriptTask"],
		)
		expect(problems).toEqual([])
		expect(ext(definitions, "script", "zeebe:script")?.attributes).toEqual({
			expression: "= a + b",
			resultVariable: "sum",
		})
	})

	it("reports a placement the Zeebe schema forbids and writes nothing", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"svc",
			[
				hidden("d", { type: "zeebe:calledDecision", property: "decisionId" }),
				hidden("r", { type: "zeebe:calledDecision", property: "resultVariable" }),
			],
			{},
			["bpmn:ServiceTask"],
		)
		expect(problems[0]?.message).toContain("not allowed")
		expect(ext(definitions, "svc", "zeebe:calledDecision")).toBeUndefined()
	})

	it("reports an unusable bindingType instead of writing it", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"call",
			[
				hidden("child", { type: "zeebe:calledElement", property: "processId" }),
				hidden("sometimes", { type: "zeebe:calledElement", property: "bindingType" }),
			],
			{},
			["bpmn:CallActivity"],
		)
		expect(problems[0]?.message).toContain("bindingType")
		expect(ext(definitions, "call", "zeebe:calledElement")?.attributes.bindingType).toBeUndefined()
	})
})

describe("template bindings — ownership on re-apply", () => {
	const v1: TemplateProperty[] = [
		{ type: "Hidden", binding: { type: "zeebe:userTask" } },
		hidden("f1", { type: "zeebe:formDefinition", property: "formId" }),
		hidden("me", { type: "zeebe:assignmentDefinition", property: "assignee" }),
		hidden("=d", { type: "zeebe:taskSchedule", property: "dueDate" }),
		hidden("7", { type: "zeebe:priorityDefinition", property: "priority" }),
	]
	it("applying v2 without a binding removes what v1 wrote", () => {
		const first = applyTo(fixture(), "user", v1, {}, ["bpmn:UserTask"]).definitions
		const v2 = v1.filter(
			(p) => p.binding.type === "zeebe:userTask" || p.binding.type === "zeebe:formDefinition",
		)
		const second = applyTo(first, "user", v2, {}, ["bpmn:UserTask"]).definitions
		expect(ext(second, "user", "zeebe:formDefinition")).toBeDefined()
		for (const stale of [
			"zeebe:assignmentDefinition",
			"zeebe:taskSchedule",
			"zeebe:priorityDefinition",
		]) {
			expect(ext(second, "user", stale), stale).toBeUndefined()
		}
	})

	it("a condition switching a binding off removes it, and re-applying is idempotent", () => {
		const gated: TemplateProperty[] = [
			{
				type: "Dropdown",
				id: "mode",
				choices: [
					{ name: "a", value: "a" },
					{ name: "b", value: "b" },
				],
				value: "a",
				binding: { type: "zeebe:assignmentDefinition", property: "assignee" },
			},
			{
				...hidden("g", { type: "zeebe:assignmentDefinition", property: "candidateGroups" }),
				condition: { property: "mode", equals: "b" },
			},
		]
		const U = ["bpmn:UserTask"]
		const on = applyTo(fixture(), "user", gated, { mode: "b" }, U).definitions
		expect(ext(on, "user", "zeebe:assignmentDefinition")?.attributes).toEqual({
			assignee: "b",
			candidateGroups: "g",
		})
		const off = applyTo(on, "user", gated, { mode: "a" }, U).definitions
		expect(ext(off, "user", "zeebe:assignmentDefinition")?.attributes).toEqual({ assignee: "a" })
		const again = applyTo(off, "user", gated, { mode: "a" }, U).definitions
		expect(Bpmn.export(again)).toBe(Bpmn.export(off))
	})

	it("removes the whole element when nothing remains", () => {
		const prop = (value: string): TemplateProperty => ({
			type: "Hidden",
			value,
			binding: { type: "zeebe:assignmentDefinition", property: "assignee" },
		})
		const first = applyTo(fixture(), "user", [prop("me")], {}, ["bpmn:UserTask"]).definitions
		expect(ext(first, "user", "zeebe:assignmentDefinition")).toBeDefined()
		const second = applyTo(first, "user", [prop("")], {}, ["bpmn:UserTask"]).definitions
		expect(ext(second, "user", "zeebe:assignmentDefinition")).toBeUndefined()
	})

	it("reports a required attribute that resolved to nothing and writes no element", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"script",
			[hidden("r", { type: "zeebe:script", property: "resultVariable" })],
			{},
			["bpmn:ScriptTask"],
		)
		expect(problems[0]?.message).toContain("expression")
		expect(ext(definitions, "script", "zeebe:script")).toBeUndefined()
	})
})

describe("template bindings — value checks", () => {
	it("reports a propagate flag that is not true or false", () => {
		const { definitions, problems } = applyTo(
			fixture(),
			"call",
			[
				hidden("child", { type: "zeebe:calledElement", property: "processId" }),
				hidden("=x", { type: "zeebe:calledElement", property: "propagateAllChildVariables" }),
			],
			{},
			["bpmn:CallActivity"],
		)
		expect(problems[0]?.message).toContain("true or false")
		expect(ext(definitions, "call", "zeebe:calledElement")?.attributes).toEqual({
			processId: "child",
		})
	})

	it("reports a form with both formId and externalReference", () => {
		const { problems } = applyTo(
			fixture(),
			"user",
			[
				hidden("f", { type: "zeebe:formDefinition", property: "formId" }),
				hidden("u", { type: "zeebe:formDefinition", property: "externalReference" }),
			],
			{},
			["bpmn:UserTask"],
		)
		expect(problems[0]?.message).toContain("both formId and externalReference")
	})

	it("a user-task flag bound to a Boolean set to false is not written", () => {
		const { definitions } = applyTo(
			fixture(),
			"user",
			[{ type: "Boolean", value: false, binding: { type: "zeebe:userTask" } }],
			{},
			["bpmn:UserTask"],
		)
		expect(ext(definitions, "user", "zeebe:userTask")).toBeUndefined()
	})
})

describe("template bindings — validation and builder path", () => {
	const tpl = (binding: unknown) => ({
		id: "t",
		name: "T",
		appliesTo: ["bpmn:Task"],
		properties: [{ type: "Hidden", value: "x", binding }],
	})
	it.each([
		[{ type: "zeebe:calledElement", property: "processId" }],
		[{ type: "zeebe:calledDecision", property: "decisionId" }],
		[{ type: "zeebe:userTask" }],
		[{ type: "zeebe:formDefinition", property: "formId" }],
		[{ type: "zeebe:assignmentDefinition", property: "candidateUsers" }],
		[{ type: "zeebe:taskSchedule", property: "followUpDate" }],
		[{ type: "zeebe:priorityDefinition", property: "priority" }],
		[{ type: "zeebe:script", property: "expression" }],
	])("accepts %j with no warning", (binding) => {
		const r = validateElementTemplate(tpl(binding))
		expect(r.problems).toEqual([])
		expect(r.warnings).toEqual([])
	})

	it.each([
		[{ type: "zeebe:calledElement", property: "nope" }],
		[{ type: "zeebe:calledDecision" }],
		[{ type: "zeebe:formDefinition", property: "formKey" }],
		[{ type: "zeebe:assignmentDefinition", property: "owner" }],
		[{ type: "zeebe:taskSchedule", property: "dueIn" }],
		[{ type: "zeebe:priorityDefinition", property: "level" }],
		[{ type: "zeebe:script", property: "language" }],
	])("rejects %j", (binding) => {
		expect(validateElementTemplate(tpl(binding)).valid).toBe(false)
	})

	it("the builder path reports these as not expressible rather than dropping them", () => {
		const t = tpl({
			type: "zeebe:script",
			property: "resultVariable",
		}) as unknown as ElementTemplate
		const r = applyElementTemplate({ ...t, appliesTo: ["bpmn:ServiceTask"] }, {})
		expect(r.problems.some((p) => p.message.includes("zeebe:script"))).toBe(true)
	})
})
