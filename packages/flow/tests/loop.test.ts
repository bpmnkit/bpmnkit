import { Bpmn, type BpmnFlowElement } from "@bpmnkit/core"
import { Engine } from "@bpmnkit/engine"
import { describe, expect, expectTypeOf, it } from "vitest"
import { type Flow, defineFlow } from "../src/index.js"

/** Lets the simulator's promise chain run to its next wait. */
const settle = () => new Promise<void>((r) => setTimeout(r, 0))

/** Deploys `flow` with its handlers as workers, plus the given extra workers. */
function engineFor(
	flow: Flow<object>,
	workers: Record<string, (vars: Record<string, unknown>) => Record<string, unknown>> = {},
) {
	const engine = new Engine()
	engine.deploy({ bpmn: flow.definitions() })
	for (const step of flow.runSteps) {
		engine.registerJobWorker(step.jobType, async (job) => {
			job.complete({
				...(await step.handler(job.variables, {
					jobKey: job.id,
					processInstanceKey: "1",
					retries: 3,
				})),
			})
		})
	}
	for (const [type, work] of Object.entries(workers)) {
		engine.registerJobWorker(type, (job) => job.complete(work(job.variables)))
	}
	return engine
}

/** A review loop: review; done once the verdict is APPROVE, otherwise fix and review again. */
function reviewLoop(max: number, verdicts: string[]) {
	let fixes = 0
	const flow = defineFlow("pr")
		.input<{ pr: string }>()
		.loop(
			"review-loop",
			(b) => b.agent("review", { role: "pr-review", prompt: "Review {{pr}}", result: "verdict" }),
			{
				until: '= verdict = "APPROVE"',
				max,
				name: "Review",
				escalate: { candidateGroups: "leads" },
				between: (b) =>
					b.run("fix", ({ round, verdict }) => ({
						fixedIn: round,
						fixed: verdict,
						fixes: ++fixes,
					})),
			},
		)
		.run("merge", ({ verdict, round }) => ({ merged: `${verdict} after ${round}` }))
		.build()
	let reviews = 0
	const engine = engineFor(flow, {
		"agent:pr-review": () => ({ verdict: verdicts[reviews++] ?? "REJECT" }),
		userTask: () => ({ overruledBy: "ada" }),
	})
	return { flow, engine, reviewed: () => reviews, fixed: () => fixes }
}

function elements(flow: Flow<object>) {
	const process = Bpmn.parse(flow.toXml()).processes[0]
	if (!process) throw new Error("no process")
	const byId = new Map(process.flowElements.map((e) => [e.id, e]))
	const flows = process.sequenceFlows
	const out = (id: string) => flows.filter((f) => f.sourceRef === id)
	const into = (id: string) => flows.filter((f) => f.targetRef === id)
	return { byId, out, into, get: (id: string) => byId.get(id) as BpmnFlowElement }
}

describe(".loop() — the model", () => {
	it("counts rounds with script tasks around the body and loops back through the between steps", () => {
		const { flow } = reviewLoop(3, [])
		const m = elements(flow)
		expect(m.get("review-loop-start").type).toBe("scriptTask")
		expect(m.get("review-loop").type).toBe("exclusiveGateway")
		expect(
			m
				.into("review-loop")
				.map((f) => f.sourceRef)
				.sort(),
		).toEqual(["fix", "review-loop-start"])
		expect(m.out("review-loop").map((f) => f.targetRef)).toEqual(["review"])
		expect(m.out("review").map((f) => f.targetRef)).toEqual(["review-loop-next"])

		const check = m.get("review-loop-check")
		const exits = m.out("review-loop-check")
		expect(exits.map((f) => f.targetRef).sort()).toEqual([
			"fix",
			"review-loop-end",
			"review-loop-escalate",
		])
		const again = exits.find((f) => f.targetRef === "fix")
		expect(check.type === "exclusiveGateway" && check.default).toBe(again?.id)
		expect(m.out("fix").map((f) => f.targetRef)).toEqual(["review-loop"])
		expect(m.get("review-loop-escalate").type).toBe("userTask")
		expect(m.out("review-loop-end").map((f) => f.targetRef)).toEqual(["merge"])
	})

	it("loops straight back when there are no between steps", () => {
		const flow = defineFlow("f")
			.loop("l", (b) => b.run("a", () => undefined), { until: "true", max: 2 })
			.build()
		const m = elements(flow)
		const again = m.out("l-check").find((f) => !f.conditionExpression)
		expect(again?.targetRef).toBe("l")
	})

	it("guards the give-up exit so it never fires together with the done exit", () => {
		const m = elements(reviewLoop(3, []).flow)
		const conditions = m
			.out("review-loop-check")
			.map((f) => f.conditionExpression?.text)
			.filter(Boolean)
		expect(conditions.sort()).toEqual([
			'=round >= 3 and not(verdict = "APPROVE")',
			'=verdict = "APPROVE"',
		])
	})

	it("includes loop bodies and between steps in the job types", () => {
		const { flow } = reviewLoop(3, [])
		expect(flow.jobTypes).toEqual(["pr.fix", "pr.merge"])
		expect(flow.runSteps.map((s) => s.id)).toEqual(["fix", "merge"])
		expect(flow.agentJobTypes).toEqual(["agent:pr-review"])
	})
})

describe(".loop() — running on the simulator", () => {
	it("repeats the body until the condition holds, running between steps between rounds", async () => {
		const { engine, reviewed, fixed } = reviewLoop(5, ["REJECT", "REJECT", "APPROVE"])
		const instance = engine.start("pr", { pr: "42" })
		await settle()
		expect(instance.state).toBe("completed")
		expect(reviewed()).toBe(3)
		expect(fixed()).toBe(2)
		expect(instance.variables_snapshot).toMatchObject({
			round: 3,
			fixedIn: 2,
			fixed: "REJECT",
			merged: "APPROVE after 3",
		})
		expect(instance.variables_snapshot).not.toHaveProperty("overruledBy")
	})

	it("stops after the first round that satisfies it, without running the between steps", async () => {
		const { engine, reviewed, fixed } = reviewLoop(5, ["APPROVE"])
		const instance = engine.start("pr", { pr: "42" })
		await settle()
		expect(reviewed()).toBe(1)
		expect(fixed()).toBe(0)
		expect(instance.variables_snapshot).toMatchObject({ round: 1, merged: "APPROVE after 1" })
	})

	it("hands over to a person after max rounds, then carries on", async () => {
		const { engine, reviewed, fixed } = reviewLoop(2, [])
		const instance = engine.start("pr", { pr: "42" })
		await settle()
		expect(instance.state).toBe("completed")
		expect(reviewed()).toBe(2)
		expect(fixed()).toBe(1)
		expect(instance.variables_snapshot).toMatchObject({
			round: 2,
			overruledBy: "ada",
			merged: "REJECT after 2",
		})
	})

	it("runs nested loops with their own counters, resetting the inner one each round", async () => {
		const flow = defineFlow("nested")
			.loop(
				"outer",
				(o) =>
					o.loop(
						"inner",
						(i) => i.run("tick", ({ round, step }) => ({ seen: `${round}.${step}` })),
						{
							until: "step = 2",
							max: 5,
							counter: "step",
						},
					),
				{ until: "round = 3", max: 5 },
			)
			.build()
		const instance = engineFor(flow).start("nested")
		await settle()
		expect(instance.state).toBe("completed")
		expect(instance.variables_snapshot).toMatchObject({ round: 3, step: 2, seen: "2.1" })
	})
})

describe(".loop() — validation", () => {
	const body = (b: ReturnType<typeof defineFlow>) => b.run("a", () => undefined)

	it("rejects ids that clash with a loop's own elements or with steps outside the body", () => {
		const base = defineFlow("f").run("x", () => undefined)
		expect(() =>
			base.loop("l", (b) => b.run("l-next", () => undefined), { until: "true", max: 1 }),
		).toThrow(/already has a step "l-next"/)
		expect(() =>
			base.loop("l", (b) => b.run("x", () => undefined), { until: "true", max: 1 }),
		).toThrow(/already has a step "x"/)
		expect(() =>
			base.loop("l", body, { until: "true", max: 1, between: (b) => b.run("a", () => undefined) }),
		).toThrow(/already has a step "a"/)
		const looped = base.loop("l", body, {
			until: "true",
			max: 1,
			between: (b) => b.run("c", () => undefined),
		})
		expect(() => looped.run("c", () => undefined)).toThrow(/already has a step "c"/)
		expect(() => looped.run("l-end", () => undefined)).toThrow(/already has a step "l-end"/)
		expect(() => looped.run("a", () => undefined)).toThrow(/already has a step "a"/)
		expect(() => base.loop("x", body, { until: "true", max: 1 })).toThrow(/already has a step "x"/)
	})

	it("rejects a nested loop that reuses its parent's counter", () => {
		expect(() =>
			defineFlow("f").loop("o", (b) => b.loop("i", body, { until: "true", max: 1 }), {
				until: "true",
				max: 1,
			}),
		).toThrow(/already counts in "round"/)
	})

	it("rejects a bad max, counter, condition or an empty body", () => {
		const f = defineFlow("f")
		expect(() => f.loop("l", body, { until: "true", max: 0 })).toThrow(/max/)
		expect(() => f.loop("l", body, { until: "true", max: 1.5 })).toThrow(/max/)
		expect(() => f.loop("l", body, { until: "=", max: 1 })).toThrow(/until/)
		expect(() => f.loop("l", body, { until: "true", max: 1, counter: "a-b" })).toThrow(/FEEL name/)
		expect(() => f.loop("l", (b) => b, { until: "true", max: 1 })).toThrow(/no steps/)
	})
})

describe(".loop() — types", () => {
	it("gives the body the outer variables and the counter, and the flow what the body added", () => {
		defineFlow("t")
			.input<{ a: string }>()
			.loop(
				"l",
				(b) =>
					b.run("in", (v) => {
						expectTypeOf(v.a).toEqualTypeOf<string>()
						expectTypeOf(v.tries).toEqualTypeOf<number>()
						return { b: true }
					}),
				{ until: "b", max: 2, counter: "tries" },
			)
			.run("after", (v) => {
				expectTypeOf(v.b).toEqualTypeOf<boolean>()
				expectTypeOf(v.tries).toEqualTypeOf<number>()
				// @ts-expect-error — the default counter is not set when another is named
				v.round
			})
	})

	it("gives between steps what the body added, and keeps what they add out of the flow's type", () => {
		defineFlow("t")
			.loop("l", (b) => b.agent("review", { role: "r", prompt: "x", result: "verdict" }), {
				until: "true",
				max: 2,
				between: (b) =>
					b
						.agent("fix", { role: "f", prompt: "Fix {{verdict}} (round {{round}})" })
						.run("note", () => ({ note: "fixed" })),
			})
			.run("after", (v) => {
				expectTypeOf(v.verdict).toEqualTypeOf<string>()
				// @ts-expect-error — between steps do not run when the first round ends the loop
				v.note
			})
		defineFlow("t").loop("l", (b) => b.run("a", () => ({ a: 1 })), {
			until: "true",
			max: 2,
			// @ts-expect-error — `missing` is not a variable in the between steps
			between: (b) => b.agent("fix", { role: "f", prompt: "{{missing}}" }),
		})
	})
})
