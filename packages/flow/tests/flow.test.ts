import { Bpmn, type BpmnFlowElement } from "@bpmnkit/core"
import { Engine } from "@bpmnkit/engine"
import { describe, expect, expectTypeOf, it } from "vitest"
import { AGENT_PROMPT_HEADER, AGENT_RESULT_HEADER, type Flow, defineFlow } from "../src/index.js"

const review = () =>
	defineFlow("pr-review", { name: "PR review" })
		.input<{ prKey: string }>()
		.run("fetch-diff", async ({ prKey }) => ({ diff: `diff of ${prKey}` }))
		.agent("review", {
			role: "pr-review",
			rank: "senior",
			prompt: "Review {{prKey}}:\n{{diff}}",
			result: "verdict",
		})
		.waitFor("ci-green", { correlationKey: "prKey", message: "ci-passed" })
		.approve("approve-merge", { name: "Approve merge", candidateGroups: "maintainers" })
		.run("merge", async ({ prKey, verdict }) => ({ merged: `${prKey}:${verdict}` }))
		.build()

function element(flow: Flow<object>, id: string): BpmnFlowElement {
	const defs = Bpmn.parse(flow.toXml())
	const found = defs.processes[0]?.flowElements.find((e) => e.id === id)
	if (!found) throw new Error(`no element ${id}`)
	return found
}

function ext(el: BpmnFlowElement, name: string) {
	return el.extensionElements.find((e) => e.name === name)
}

/** Lets the simulator's promise chain run to its next wait. */
const settle = () => new Promise<void>((r) => setTimeout(r, 0))

describe("defineFlow — the model", () => {
	it("emits one executable process with the steps in order", () => {
		const defs = Bpmn.parse(review().toXml())
		const process = defs.processes[0]
		expect(process?.id).toBe("pr-review")
		expect(process?.name).toBe("PR review")
		expect(process?.isExecutable).toBe(true)
		const order = ["start", "fetch-diff", "review", "ci-green", "approve-merge", "merge", "end"]
		for (let i = 0; i < order.length - 1; i++) {
			expect(
				process?.sequenceFlows.some(
					(f) => f.sourceRef === order[i] && f.targetRef === order[i + 1],
				),
			).toBe(true)
		}
		expect(defs.diagrams).toHaveLength(1)
	})

	it("derives a job type per handler step, and the agent job types", () => {
		const flow = review()
		expect(flow.jobTypes).toEqual(["pr-review.fetch-diff", "pr-review.merge"])
		expect(flow.agentJobTypes).toEqual(["agent:senior:pr-review"])
		const task = ext(element(flow, "fetch-diff"), "zeebe:taskDefinition")
		expect(task?.attributes).toMatchObject({ type: "pr-review.fetch-diff", retries: "3" })
	})

	it("carries an agent step's prompt and result variable as task headers", () => {
		const headers = ext(element(review(), "review"), "zeebe:taskHeaders")
		const values = Object.fromEntries(
			(headers?.children ?? []).map((h) => [h.attributes.key, h.attributes.value]),
		)
		expect(values).toEqual({
			[AGENT_PROMPT_HEADER]: "Review {{prKey}}:\n{{diff}}",
			[AGENT_RESULT_HEADER]: "verdict",
		})
	})

	it("correlates a wait on the named variable", () => {
		const defs = Bpmn.parse(review().toXml())
		const message = defs.messages.find((m) => m.name === "ci-passed")
		const subscription = message?.extensionElements?.find((e) => e.name === "zeebe:subscription")
		expect(subscription?.attributes.correlationKey).toBe("=prKey")
		expect(element(review(), "ci-green").type).toBe("intermediateCatchEvent")
	})

	it("makes an approval a Camunda user task", () => {
		const task = element(review(), "approve-merge")
		expect(task.type).toBe("userTask")
		expect(task.name).toBe("Approve merge")
		expect(ext(task, "zeebe:userTask")).toBeDefined()
		expect(ext(task, "zeebe:assignmentDefinition")?.attributes.candidateGroups).toBe("maintainers")
	})

	it("rejects duplicate, reserved and malformed step ids, and an empty flow", () => {
		const base = defineFlow("f").run("a", () => undefined)
		expect(() => base.run("a", () => undefined)).toThrow(/already has a step "a"/)
		expect(() => base.run("end", () => undefined)).toThrow(/already has a step "end"/)
		expect(() => base.run("1bad", () => undefined)).toThrow(/must match/)
		expect(() => defineFlow("has space")).toThrow(/must match/)
		expect(() => defineFlow("f").build()).toThrow(/has no steps/)
		expect(() => defineFlow("f").agent("x", { role: "a:b", prompt: "" })).toThrow(/role/)
	})

	it("leaves the builder it was called on unchanged", () => {
		const base = defineFlow("f").run("a", () => undefined)
		base.run("b", () => undefined)
		expect(base.build().steps.map((s) => s.id)).toEqual(["a"])
	})
})

describe("defineFlow — running on the simulator", () => {
	it("runs handlers, the agent, the wait and the approval to the end", async () => {
		const flow = review()
		const engine = new Engine()
		engine.deploy({ bpmn: flow.definitions() })
		for (const step of flow.steps) {
			if (step.kind !== "run") continue
			const handler = step.handler
			engine.registerJobWorker(step.jobType, async (job) => {
				const output = await handler(job.variables, {
					jobKey: job.id,
					processInstanceKey: "1",
					retries: 3,
				})
				job.complete({ ...output })
			})
		}
		engine.registerJobWorker("agent:senior:pr-review", (job) => {
			job.complete({ [job.headers[AGENT_RESULT_HEADER] ?? ""]: "approve" })
		})
		engine.registerJobWorker("userTask", (job) => job.complete({ approvedBy: "ada" }))

		const instance = engine.start("pr-review", { prKey: "42" })
		await settle()
		expect(instance.state).toBe("active")
		expect(instance.deliverMessage("ci-passed", {}, "other")).toBe(false)
		expect(instance.deliverMessage("ci-passed", {}, "42")).toBe(true)
		await settle()
		expect(instance.state).toBe("completed")
		expect(instance.variables_snapshot).toMatchObject({
			prKey: "42",
			diff: "diff of 42",
			verdict: "approve",
			approvedBy: "ada",
			merged: "42:approve",
		})
	})
})

describe("defineFlow — types", () => {
	it("gives each step the variables earlier steps provide", () => {
		defineFlow("t")
			.input<{ a: string }>()
			.run("one", (v) => {
				expectTypeOf(v).toEqualTypeOf<{ a: string }>()
				return { b: 1 }
			})
			.run("two", (v) => {
				expectTypeOf(v.a).toEqualTypeOf<string>()
				expectTypeOf(v.b).toEqualTypeOf<number>()
				return { a: 2 }
			})
			.run("three", (v) => {
				expectTypeOf(v.a).toEqualTypeOf<number>()
				return undefined
			})
			.agent("four", { role: "r", prompt: "{{a}}" })
			.run("five", (v) => {
				expectTypeOf(v.result).toEqualTypeOf<string>()
			})
	})

	it("rejects unknown variables in a prompt or as a correlation key", () => {
		const flow = defineFlow("t").input<{ a: string }>()
		flow.agent("ok", { role: "r", prompt: "{{a}} and {{a}}" })
		// @ts-expect-error — `b` is not a variable yet
		flow.agent("bad", { role: "r", prompt: "{{a}} and {{b}}" })
		flow.waitFor("ok", { correlationKey: "a" })
		// @ts-expect-error — `b` is not a variable yet
		flow.waitFor("bad", { correlationKey: "b" })
		flow.run("bad-read", (v) => {
			// @ts-expect-error — `b` is not a variable yet
			return { c: v.b }
		})
	})
})
