import { readFileSync } from "node:fs"
import { createRequire } from "node:module"
import { dirname, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const here = dirname(fileURLToPath(import.meta.url))
const AD_HOC_TOOLS = readFileSync(resolve(here, "fixtures/ad-hoc-tools.bpmn"), "utf8")

const SINGLE_TASK = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL"
                  xmlns:zeebe="http://camunda.org/schema/zeebe/1.0"
                  id="Definitions_2" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="single-task" isExecutable="true">
    <bpmn:startEvent id="start"><bpmn:outgoing>f1</bpmn:outgoing></bpmn:startEvent>
    <bpmn:serviceTask id="S">
      <bpmn:extensionElements><zeebe:taskDefinition type="s"/></bpmn:extensionElements>
      <bpmn:incoming>f1</bpmn:incoming><bpmn:outgoing>f2</bpmn:outgoing>
    </bpmn:serviceTask>
    <bpmn:endEvent id="end"><bpmn:incoming>f2</bpmn:incoming></bpmn:endEvent>
    <bpmn:sequenceFlow id="f1" sourceRef="start" targetRef="S"/>
    <bpmn:sequenceFlow id="f2" sourceRef="S" targetRef="end"/>
  </bpmn:process>
</bpmn:definitions>`

interface Job {
	key: number
	job_type: string
	state: string
}
interface Snapshot {
	processInstances: Array<{ bpmn_process_id: string; state: string }>
	jobs: Job[]
}
interface Engine {
	deploy(xml: string): unknown
	create_process_instance(processId: string, variables: string): unknown
	activate_job(key: number, worker: string, timeout: number): unknown
	complete_job(key: number, variables: string): unknown
	complete_job_with_result(key: number, variables: string, result: string): unknown
	snapshot(): unknown
}

// Node cannot fetch() the file:// URL wasm-bindgen generates, so read the bytes and initSync.
async function start(xml: string, processId: string) {
	const mod = await import("@bpmnkit/reebe-wasm")
	const jsPath = createRequire(import.meta.url).resolve("@bpmnkit/reebe-wasm")
	mod.initSync({ module: readFileSync(resolve(dirname(jsPath), "reebe_wasm_bg.wasm")) })
	const engine = new mod.WasmEngine() as unknown as Engine
	engine.deploy(xml)
	engine.create_process_instance(processId, "{}")
	const snap = () => engine.snapshot() as Snapshot
	const activatable = (type: string) =>
		snap().jobs.filter((j) => j.job_type === type && j.state === "ACTIVATABLE")
	const state = () => snap().processInstances.find((p) => p.bpmn_process_id === processId)?.state
	const take = (type: string): Job => {
		const job = activatable(type)[0]
		if (!job) throw new Error(`no activatable ${type} job`)
		engine.activate_job(job.key, "w", 30_000)
		return job
	}
	return { engine, activatable, state, take }
}

describe("complete_job_with_result", () => {
	it("activates two tools, then completes on the fulfilled condition", async () => {
		const { engine, activatable, state, take } = await start(AD_HOC_TOOLS, "ad-hoc-tools")

		const agent = take("agent")
		engine.complete_job_with_result(
			agent.key,
			"{}",
			JSON.stringify({ activateElements: [{ elementId: "T1" }, { elementId: "T2" }] }),
		)
		expect(activatable("t1")).toHaveLength(1)
		expect(activatable("t2")).toHaveLength(1)

		engine.complete_job(take("t1").key, "{}")
		engine.complete_job(take("t2").key, "{}")

		const next = take("agent")
		engine.complete_job_with_result(
			next.key,
			"{}",
			JSON.stringify({ isCompletionConditionFulfilled: true }),
		)
		expect(state()).toBe("COMPLETED")
	})

	it("rejects a result that both activates and fulfils", async () => {
		const { engine, take } = await start(AD_HOC_TOOLS, "ad-hoc-tools")
		const agent = take("agent")
		expect(() =>
			engine.complete_job_with_result(
				agent.key,
				"{}",
				JSON.stringify({
					activateElements: [{ elementId: "T1" }],
					isCompletionConditionFulfilled: true,
				}),
			),
		).toThrow(/both activates elements and fulfils the completion condition/)
	})

	it("ignores the result on a non-ad-hoc job", async () => {
		const { engine, state, take } = await start(SINGLE_TASK, "single-task")
		const job = take("s")
		engine.complete_job_with_result(
			job.key,
			"{}",
			JSON.stringify({ isCompletionConditionFulfilled: true }),
		)
		expect(state()).toBe("COMPLETED")
	})
})
