import { readFileSync } from "node:fs"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { type CptReport, runCptTestCases } from "../../src/cpt/index.js"

const here = dirname(fileURLToPath(import.meta.url))
const BAKEOFF = readFileSync(
	resolve(here, "../../../core/tests/fixtures/bakeoff/expected.bpmn"),
	"utf8",
)
const CASES = JSON.parse(readFileSync(resolve(here, "fixtures/bakeoff.test.json"), "utf8")) as {
	$schema: string
	testCases: { name: string; instructions: { type: string }[] }[]
}
const SCHEMA = CASES.$schema
const [HAPPY, LOOP, , RECIPES] = CASES.testCases.map((c) => c.name)

function caseNamed(report: CptReport, name: string | undefined) {
	const c = report.cases.find((x) => x.name === name)
	if (!c) throw new Error(`no case ${name} in report`)
	return c
}

function nthIndexOf(name: string | undefined, type: string, n: number): number {
	const tc = CASES.testCases.find((c) => c.name === name)
	const hits = (tc?.instructions ?? []).flatMap((ins, i) => (ins.type === type ? [i] : []))
	const at = hits[n]
	if (at === undefined) throw new Error(`case ${name} has no ${type} #${n}`)
	return at
}

function process(id: string, body: string): string {
	return `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                  id="Definitions_${id}" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${id}" isExecutable="true">${body}</bpmn:process>
</bpmn:definitions>`
}

const SERVICE_TASK = process(
	"svc",
	`
    <bpmn:startEvent id="Start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="Task">
      <bpmn:extensionElements><zeebe:taskDefinition type="work"/></bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="End"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Task"/>
    <bpmn:sequenceFlow id="f2" sourceRef="Task" targetRef="End"/>`,
)

const BAD_GATEWAY = process(
	"gw",
	`
    <bpmn:startEvent id="Start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:exclusiveGateway id="Gateway_Broken"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:endEvent id="End"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="Start" targetRef="Gateway_Broken"/>
    <bpmn:sequenceFlow id="f2" sourceRef="Gateway_Broken" targetRef="End">
      <bpmn:conditionExpression xsi:type="bpmn:tFormalExpression">=x.y.z</bpmn:conditionExpression>
    </bpmn:sequenceFlow>`,
)

const create = (processDefinitionId: string) => ({
	type: "CREATE_PROCESS_INSTANCE",
	processDefinitionSelector: { processDefinitionId },
})
const completeWork = { type: "COMPLETE_JOB", jobSelector: { jobType: "work" } }
const assertProcess = (processDefinitionId: string, state: string) => ({
	type: "ASSERT_PROCESS_INSTANCE",
	processInstanceSelector: { processDefinitionId },
	state,
})
const assertOrder = (ids: string[]) => ({
	type: "ASSERT_ELEMENT_INSTANCES",
	processInstanceSelector: { processDefinitionId: "svc" },
	elementSelectors: ids.map((elementId) => ({ elementId })),
	state: "IS_COMPLETED_IN_ORDER",
})
const file = (testCases: { name: string; instructions: unknown[] }[]) => ({
	$schema: SCHEMA,
	testCases,
})

describe("runCptTestCases", () => {
	it("passes the bake-off fixture's six cases", async () => {
		const report = await runCptTestCases({ bpmn: BAKEOFF, cases: CASES })
		expect(report.cases).toHaveLength(6)
		for (const c of report.cases) expect(c, c.name).toMatchObject({ passed: true })
	})

	it("fails the loop case when Flow_No can never be taken", async () => {
		const broken = BAKEOFF.replace(
			/(<bpmn:sequenceFlow id="Flow_No"[^>]*>\s*<bpmn:conditionExpression[^>]*>)[^<]*/,
			"$1=false",
		)
		expect(broken).not.toBe(BAKEOFF)
		const report = await runCptTestCases({ bpmn: broken, cases: CASES })
		const loop = caseNamed(report, LOOP)
		expect(loop.passed).toBe(false)
		expect(loop.failure?.index).toBe(nthIndexOf(LOOP, "COMPLETE_JOB_AD_HOC_SUB_PROCESS", 1))
		expect(loop.failure?.type).toBe("COMPLETE_JOB_AD_HOC_SUB_PROCESS")
		expect(loop.failure?.message).toContain("no open job")
		expect(loop.failure?.message).toContain("io.camunda.agenticai:aiagent:subprocess:2")
		expect(caseNamed(report, HAPPY).passed).toBe(true)
	})

	it("fails the recipes case when SearchRecipes is removed", async () => {
		const broken = BAKEOFF.replace(
			/<bpmn:serviceTask id="SearchRecipes"[\s\S]*?<\/bpmn:serviceTask>/,
			"",
		).replace(/<bpmndi:BPMNShape id="SearchRecipes_di"[\s\S]*?<\/bpmndi:BPMNShape>/, "")
		expect(broken).not.toContain('"SearchRecipes"')
		const report = await runCptTestCases({ bpmn: broken, cases: CASES })
		const recipes = caseNamed(report, RECIPES)
		expect(recipes.passed).toBe(false)
		expect(recipes.failure?.index).toBe(nthIndexOf(RECIPES, "COMPLETE_JOB_AD_HOC_SUB_PROCESS", 0))
		expect(recipes.failure?.message).toContain("is not an element it can activate")
		expect(caseNamed(report, HAPPY).passed).toBe(true)
	})

	// Parity run 2026-10-18: real CPT fails every case here with "no user task is available".
	it("does not complete a user task without zeebe:userTask (a job-worker user task)", async () => {
		const broken = BAKEOFF.replace(/\s*<zeebe:userTask\/>/, "")
		expect(broken).not.toContain("<zeebe:userTask/>")
		const report = await runCptTestCases({ bpmn: broken, cases: CASES })
		expect(report.cases).toHaveLength(6)
		for (const c of report.cases) {
			const tc = CASES.testCases.find((x) => x.name === c.name)
			expect(c.passed, c.name).toBe(false)
			expect(c.failure?.type, c.name).toBe("COMPLETE_USER_TASK")
			expect(c.failure?.index, c.name).toBe(
				tc?.instructions.findIndex((ins) => ins.type === "COMPLETE_USER_TASK"),
			)
			expect(c.failure?.message).toContain("UserTask_ReviewAgentResponse")
			expect(c.failure?.message).toContain("zeebe:userTask")
		}
	})

	it("reports a selector that matches nothing, listing what is open", async () => {
		const report = await runCptTestCases({
			bpmn: SERVICE_TASK,
			cases: file([
				{
					name: "typo",
					instructions: [create("svc"), { type: "COMPLETE_JOB", jobSelector: { jobType: "nope" } }],
				},
			]),
		})
		const [c] = report.cases
		expect(c?.passed).toBe(false)
		expect(c?.failure?.index).toBe(1)
		expect(c?.failure?.message).toContain('jobType "nope"')
		expect(c?.failure?.message).toContain("work@Task")
		expect(c?.failure?.message).toContain("active elements: Task")
		expect(c?.failure?.message).toContain("open user tasks:")
		expect(c?.failure?.message).toContain("incidents:")
	})

	it("fails the case, not the run, when the BPMN does not deploy", async () => {
		const report = await runCptTestCases({
			bpmn: "<not bpmn",
			cases: file([{ name: "bad", instructions: [create("svc")] }]),
		})
		expect(report.cases).toHaveLength(1)
		expect(report.cases[0]?.passed).toBe(false)
		expect(report.cases[0]?.failure?.type).toBe("DEPLOY")
		expect(report.cases[0]?.failure?.index).toBe(-1)
	})

	it("reports an incident's element on a failed completion assertion", async () => {
		const report = await runCptTestCases({
			bpmn: BAD_GATEWAY,
			cases: file([
				{ name: "incident", instructions: [create("gw"), assertProcess("gw", "IS_COMPLETED")] },
			]),
		})
		const [c] = report.cases
		expect(c?.passed).toBe(false)
		expect(c?.failure?.index).toBe(1)
		expect(c?.failure?.message).toContain("Gateway_Broken")
		expect(c?.failure?.message).toMatch(/incidents: Gateway_Broken: .+/)
	})

	it("IS_COMPLETED_IN_ORDER checks the completion order", async () => {
		const report = await runCptTestCases({
			bpmn: SERVICE_TASK,
			cases: file([
				{
					name: "in order",
					instructions: [create("svc"), completeWork, assertOrder(["Start", "Task", "End"])],
				},
				{
					name: "out of order",
					instructions: [create("svc"), completeWork, assertOrder(["End", "Task"])],
				},
			]),
		})
		expect(report.cases[0]?.passed).toBe(true)
		const bad = report.cases[1]
		expect(bad?.passed).toBe(false)
		expect(bad?.failure?.index).toBe(2)
		expect(bad?.failure?.message).toContain("Start, Task, End")
	})

	it("isolates cases", async () => {
		const report = await runCptTestCases({
			bpmn: SERVICE_TASK,
			cases: file([
				{
					name: "leaves it active",
					instructions: [create("svc"), assertProcess("svc", "IS_ACTIVE")],
				},
				{
					name: "own instance",
					instructions: [create("svc"), completeWork, assertProcess("svc", "IS_COMPLETED")],
				},
			]),
		})
		expect(report.cases.map((c) => c.passed)).toEqual([true, true])
	})

	it("turns an engine rejection into the case's failure without aborting later cases", async () => {
		const report = await runCptTestCases({
			bpmn: BAKEOFF,
			cases: file([
				{
					name: "both",
					instructions: [
						create("ai-agent-chat-with-tools"),
						{
							type: "COMPLETE_JOB_AD_HOC_SUB_PROCESS",
							jobSelector: { jobType: "io.camunda.agenticai:aiagent:subprocess:2" },
							completionConditionFulfilled: true,
							activateElements: [{ elementId: "FetchSafeJoke" }],
						},
					],
				},
				{ name: "after", instructions: [create("ai-agent-chat-with-tools")] },
			]),
		})
		expect(report.cases[0]?.failure?.index).toBe(1)
		expect(report.cases[0]?.failure?.message).toContain("both activates elements")
		expect(report.cases[1]?.passed).toBe(true)
	})

	it("runs only selected cases", async () => {
		const report = await runCptTestCases({ bpmn: BAKEOFF, cases: CASES, select: [HAPPY ?? ""] })
		expect(report.cases).toHaveLength(1)
		expect(report.cases[0]?.name).toBe(HAPPY)
		expect(report.cases[0]?.passed).toBe(true)
	})

	it("reports an unknown selected name as a failed case", async () => {
		const report = await runCptTestCases({ bpmn: BAKEOFF, cases: CASES, select: ["nope"] })
		expect(report.cases).toHaveLength(1)
		expect(report.cases[0]?.passed).toBe(false)
		expect(report.cases[0]?.failure?.message).toBe('no test case named "nope"')
	})

	it("reports validation errors without running", async () => {
		const report = await runCptTestCases({
			bpmn: SERVICE_TASK,
			cases: file([{ name: "x", instructions: [{ type: "PUBLISH_MESSAGE" }] }]),
		})
		expect(report.cases).toHaveLength(1)
		expect(report.cases[0]).toMatchObject({
			name: "(test file)",
			passed: false,
			failure: { index: -1, type: "VALIDATION" },
		})
		expect(report.cases[0]?.failure?.message).toContain("PUBLISH_MESSAGE")
	})
})
