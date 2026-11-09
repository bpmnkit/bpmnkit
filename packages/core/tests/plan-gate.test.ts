import { describe, expect, it } from "vitest"
import { assertDeployable } from "../src/bpmn/zeebe-validate/gate.js"
import { Bpmn, type ProcessPlan, compilePlan, mergePlan } from "../src/index.js"

/** A send task with no job type: Zeebe refuses it. */
const NO_TYPE: ProcessPlan = {
	version: 1,
	process: { id: "payment" },
	steps: [
		{ kind: "start", name: "Ordered" },
		{ kind: "sendTask", id: "notify", name: "Notify", messageName: "Paid" },
		{ kind: "end", name: "Done" },
	],
}

const OK: ProcessPlan = {
	version: 1,
	process: { id: "payment" },
	steps: [
		{ kind: "start", name: "Ordered" },
		{ kind: "serviceTask", name: "Charge", jobType: "charge" },
		{ kind: "end", name: "Done" },
	],
}

describe("compilePlan deploy gate", () => {
	it("returns XML for a plan that deploys", () => {
		const result = compilePlan(OK)
		expect(result.problems).toEqual([])
		expect(result.placeholders).toEqual([])
		expect(() => assertDeployable(Bpmn.parse(result.xml ?? ""))).not.toThrow()
	})

	it("returns no XML for a plan Zeebe would refuse, one problem per reason", () => {
		const result = compilePlan(NO_TYPE)
		expect(result.xml).toBeUndefined()
		expect(result.defs).toBeDefined()
		expect(result.problems).toContainEqual({
			path: "element:notify",
			message:
				"Not deployable on Camunda 8.10: Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element (zeebe/send-task-implementation)",
		})
	})

	it("checks camundaVersion when given", () => {
		const result = compilePlan(NO_TYPE, { camundaVersion: "8.6" })
		expect(result.problems.map((p) => p.message)).toContain(
			"Not deployable on Camunda 8.6: Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element (zeebe/send-task-implementation)",
		)
	})

	it("fills placeholders on request and lists them", () => {
		const result = compilePlan(NO_TYPE, { placeholders: true })
		expect(result.xml).toBeDefined()
		expect(result.placeholders?.map((p) => `${p.elementId} ${p.field} ${p.value}`)).toEqual([
			"notify jobType placeholder-notify",
		])
		expect(() => assertDeployable(Bpmn.parse(result.xml ?? ""))).not.toThrow()
	})

	it("validate: false returns the XML as it is", () => {
		const result = compilePlan(NO_TYPE, { validate: false })
		expect(result.xml).toBeDefined()
		expect(() => assertDeployable(Bpmn.parse(result.xml ?? ""))).toThrow(/Not deployable/)
	})

	it("reports a step the builder refuses as a problem, not a throw", () => {
		const result = compilePlan({
			version: 1,
			process: { id: "payment" },
			steps: [
				{ kind: "start" },
				{ kind: "receiveTask", name: "Await payment", messageName: "Paid" },
				{ kind: "end" },
			],
		})
		expect(result.xml).toBeUndefined()
		expect(result.problems).toEqual([
			{
				path: "steps",
				message:
					'Build failed: receiveTask(): message "Paid" needs a correlationKey; Camunda 8 requires a zeebe:subscription correlationKey on a message caught outside a process start event',
			},
		])
	})

	it("mergePlan gates the merged model, not the delta", () => {
		const base: ProcessPlan = {
			version: 1,
			process: { id: "proc" },
			steps: [
				{ kind: "start", id: "s" },
				{ kind: "serviceTask", id: "ship", jobType: "shipping:1" },
				{ kind: "end", id: "e" },
			],
		}
		const delta: ProcessPlan = {
			version: 1,
			process: { id: "proc" },
			steps: [
				{ kind: "start", id: "s" },
				{ kind: "serviceTask", id: "ship", jobType: "shipping:1" },
				{ kind: "sendTask", id: "notify", name: "Notify", messageName: "Shipped" },
				{ kind: "end", id: "e" },
			],
		}
		const existing = () => Bpmn.parse(compilePlan(base).xml ?? "")
		const refused = mergePlan(existing(), delta)
		expect(refused.xml).toBeUndefined()
		expect(refused.problems).toContainEqual({
			path: "element:notify",
			message:
				"Not deployable on Camunda 8.10: Must have either one 'zeebe:publishMessage' or one 'zeebe:taskDefinition' extension element (zeebe/send-task-implementation)",
		})
		const filled = mergePlan(existing(), delta, { placeholders: true })
		expect(filled.placeholders?.map((p) => p.elementId)).toEqual(["notify"])
		expect(() => assertDeployable(Bpmn.parse(filled.xml ?? ""))).not.toThrow()
	})

	it("mergePlan drops the flows of an element the delta no longer reaches", () => {
		const base: ProcessPlan = {
			version: 1,
			process: { id: "proc" },
			steps: [
				{ kind: "start", id: "s" },
				{ kind: "serviceTask", id: "ship", jobType: "shipping:1" },
				{ kind: "end", id: "e" },
			],
		}
		const delta: ProcessPlan = {
			version: 1,
			process: { id: "proc" },
			steps: [
				{ kind: "start", id: "s" },
				{ kind: "serviceTask", id: "bill", jobType: "billing:1" },
				{ kind: "end", id: "e" },
			],
		}
		const merged = mergePlan(Bpmn.parse(compilePlan(base).xml ?? ""), delta)
		// "ship" lost its flows (the dead-end fix may give it a new one), but no id it names is gone.
		expect(merged.xml).toBeDefined()
		const process = merged.defs?.processes[0]
		const flows = new Set(process?.sequenceFlows.map((f) => f.id))
		const ship = process?.flowElements.find((e) => e.id === "ship")
		for (const id of [...(ship?.incoming ?? []), ...(ship?.outgoing ?? [])]) {
			expect(flows.has(id), id).toBe(true)
		}
	})
})
