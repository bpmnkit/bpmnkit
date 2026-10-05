import { readFileSync } from "node:fs"
import { applyConnectorTemplate } from "@bpmnkit/connectors"
import { compilePlan } from "@bpmnkit/core"
import type { PlanScenario, ProcessPlan } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { checkDiagram, formatCheck, toScenarioSidecar } from "./synth.js"

function compiled(prompt: string): string {
	const plan = JSON.parse(
		readFileSync(
			new URL(
				`../../../../scripts/eval-generation/prompts/${prompt}/fixture.plan.json`,
				import.meta.url,
			),
			"utf-8",
		),
	) as ProcessPlan
	const { xml } = compilePlan(plan, { resolveConnector: applyConnectorTemplate })
	if (!xml) throw new Error(`${prompt} does not compile`)
	return xml
}

describe("synth --check", () => {
	it("dry-runs the compiled process and lists the secrets its connectors read", async () => {
		const xml = compiled("01-slack-notify-ops")
		const check = await checkDiagram(xml)
		expect(check.runs).toHaveLength(1)
		expect(check.runs[0]?.reachedEnd).toBe(true)
		expect(check.runs[0]?.connectors).toEqual([
			{ elementId: "notify_ops", type: "io.camunda:slack:1" },
		])
		expect(check.secrets).toEqual([{ name: "SLACK_OAUTH_TOKEN", elementIds: ["notify_ops"] }])
		const lines = formatCheck(check, xml)
		expect(lines.slice(0, 2)).toEqual([
			'✓ Dry run of order-validation-failed reaches "Ops notified" · 1 connector(s) mocked',
			"Secrets to create in the cluster before deploying:",
		])
		expect(lines[2]).toMatch(/^ {2}SLACK_OAUTH_TOKEN — "/)
	})

	it("says where a run that cannot finish stops", async () => {
		const xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">
  <bpmn:process id="p" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:exclusiveGateway id="check" name="Big?"><bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing></bpmn:exclusiveGateway>
    <bpmn:endEvent id="big"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="check"/>
    <bpmn:sequenceFlow id="f2" sourceRef="check" targetRef="big"><bpmn:conditionExpression>=size = "big"</bpmn:conditionExpression></bpmn:sequenceFlow>
  </bpmn:process>
</bpmn:definitions>`
		const lines = formatCheck(await checkDiagram(xml), xml)
		expect(lines[0]).toMatch(/^✖ Dry run of p stops at "Big\?": No condition matched/)
	})
})

describe("toScenarioSidecar", () => {
	it("converts a plan scenario with an outputs mock into the ScenarioLike shape", () => {
		const tests: PlanScenario[] = [
			{
				name: "Happy path",
				mocks: { "test:notify:1": { outputs: { notified: true } } },
				expect: { path: ["start", "notify", "end"], variables: { notified: true } },
			},
		]
		expect(toScenarioSidecar(tests)).toEqual([
			{
				id: "Happy_path",
				name: "Happy path",
				inputs: undefined,
				mocks: { "test:notify:1": { outputs: { notified: true } } },
				expect: { path: ["start", "notify", "end"], variables: { notified: true } },
			},
		])
	})

	it("stringifies an error mock's code and message", () => {
		const tests: PlanScenario[] = [
			{
				name: "Worker errors out",
				mocks: { "test:notify:1": { error: { code: "SEND_FAILED", message: "timeout" } } },
			},
		]
		const [sidecar] = toScenarioSidecar(tests) as Array<{
			mocks: Record<string, { error: string }>
		}>
		expect(sidecar.mocks["test:notify:1"]?.error).toBe("SEND_FAILED: timeout")
	})

	it("de-duplicates ids when scenario names slugify to the same value", () => {
		const tests: PlanScenario[] = [{ name: "Case A" }, { name: "Case A" }]
		const ids = (toScenarioSidecar(tests) as Array<{ id: string }>).map((s) => s.id)
		expect(ids).toEqual(["Case_A", "Case_A_2"])
	})
})
