import { readFileSync } from "node:fs"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { badgeText, fillPlaceholders, readiness, shareRefusal } from "../src/lib/readiness.js"

// A draft is unfinished by definition: readiness, not expand's gate, judges it
const draft = (text: string) => expand(parseProcessText(text).diagram, { validate: false })

describe("readiness", () => {
	it("calls the bake-off model ready, with its platform version", () => {
		const xml = readFileSync(
			new URL("../../../packages/core/tests/fixtures/bakeoff/expected.bpmn", import.meta.url),
			"utf8",
		)
		expect(readiness(Bpmn.parse(xml))).toEqual({ state: "ready", version: "8.10.0" })
	})

	it("calls a plain draft with a service task shape-only, naming the element", () => {
		const result = readiness(draft("# P\nstart[start Go] > a[service Do it] > f[end Done]"), "8.10")
		expect(result.state).toBe("shape-only")
		if (result.state !== "shape-only") return
		expect(result.missing.map((m) => m.elementId)).toEqual(["a"])
		expect(result.missing[0]?.what).toMatch(/job type|connector/)
	})

	it("lists user, script and business rule tasks that cannot run as drafted", () => {
		const result = readiness(
			draft(
				"# P\nstart[start Go] > b[user Review] > e[script Calc] > d[rule Decide] > f[end Done]",
			),
		)
		expect(result.state).toBe("shape-only")
		if (result.state !== "shape-only") return
		expect(result.missing.map((m) => m.elementId).sort()).toEqual(["b", "d", "e"])
	})

	it("calls a draft with only events and gateways ready", () => {
		expect(readiness(draft("# P\nstart[start Go] > f[end Done]"), "8.10")).toEqual({
			state: "ready",
			version: "8.10",
		})
	})

	it("calls a model with a deploy error invalid", () => {
		const defs = draft("# P\nstart[start Go] > f[end Done]")
		const process = defs.processes[0]
		if (!process) throw new Error("no process")
		process.isExecutable = false
		const result = readiness(defs)
		expect(result.state).toBe("invalid")
		if (result.state !== "invalid") return
		expect(result.errors).toHaveLength(1)
		expect(result.errors[0]?.message).toMatch(/not marked executable/)
	})

	it("counts a task with no task definition as missing, not invalid", () => {
		const defs = draft("# P\nstart[start Go] > a[service Do it] > f[end Done]")
		const task = defs.processes[0]?.flowElements.find((e) => e.id === "a")
		if (!task) throw new Error("no task")
		task.extensionElements = []
		const result = readiness(defs)
		expect(result.state).toBe("shape-only")
	})

	it("lists a plain task, at any depth, as one that does nothing when run", () => {
		const result = readiness(draft("# P\nstart[start Go] > a[task Work] > f[end Done]"), "8.10")
		expect(result.state).toBe("shape-only")
		if (result.state !== "shape-only") return
		expect(result.missing).toEqual([
			{
				elementId: "a",
				what: "a plain task does nothing when run — make it a service, user or script task",
			},
		])
		expect(badgeText(result)).toBe("Shape only — 1 step needs configuration")
	})

	it("lists a plain task inside an ad-hoc sub-process", () => {
		const defs = draft("# P\nstart[start Go] > f[end Done]")
		const process = defs.processes[0]
		if (!process) throw new Error("no process")
		const base = { incoming: [], outgoing: [], extensionElements: [], unknownAttributes: {} }
		process.flowElements.push({
			...base,
			id: "adhoc",
			type: "adHocSubProcess",
			flowElements: [{ ...base, id: "inner", type: "task" }],
			sequenceFlows: [],
			textAnnotations: [],
			associations: [],
			groups: [],
		} as never)
		const result = readiness(defs, "8.10")
		if (result.state !== "shape-only") throw new Error(result.state)
		expect(result.missing.map((m) => m.elementId)).toContain("inner")
	})
})

describe("readiness, review fixes", () => {
	it("calls a mapping whose FEEL does not parse invalid, naming the element", () => {
		const result = readiness(
			draft("# P | camunda=8.10\ns[start S | form=a] > u[user U | form=f in.x=)( ] > e[end E]"),
		)
		expect(result.state).toBe("invalid")
		if (result.state !== "invalid") return
		expect(result.errors[0]?.elementId).toBe("u")
		expect(result.errors[0]?.message).toMatch(/in\.x|input.*x/)
	})

	it("keeps a mapping that parses ready", () => {
		const result = readiness(
			draft(
				"# P | camunda=8.10\ns[start S | form=a] > u[user U | form=f in.x=if a = 1 then 2 else 3 | out.y=r.ok] > e[end E]",
			),
		)
		expect(result.state).toBe("ready")
	})

	const AGENT = (doc: string) => {
		const defs = draft(
			`# P | camunda=8.10\ns[start S | form=a] > agent[adhoc Agent] > e[end E]\nt[script Tool | inside=agent feel=1]${doc}`,
		)
		const agent = defs.processes[0]?.flowElements.find((e) => e.id === "agent")
		if (!agent) throw new Error("no agent")
		agent.unknownAttributes["zeebe:modelerTemplate"] =
			"io.camunda.connectors.agenticai.ai-agent-subprocess.v2"
		return defs
	}

	it("lists an agent tool without documentation as shape-only", () => {
		const result = readiness(AGENT(""))
		expect(result.state).toBe("shape-only")
		if (result.state !== "shape-only") return
		expect(result.missing).toContainEqual({ elementId: "t", what: "needs a tool description" })
	})

	it("calls an agent tool with documentation ready", () => {
		expect(readiness(AGENT("\ndoc t: Counts things")).state).toBe("ready")
	})
})

describe("badgeText", () => {
	it("shows major.minor of a full platform version", () => {
		expect(badgeText({ state: "ready", version: "8.10.0" })).toBe("Ready to deploy (8.10)")
	})

	it("words each verdict", () => {
		expect(badgeText({ state: "ready", version: "8.10" })).toBe("Ready to deploy (8.10)")
		expect(
			badgeText({
				state: "shape-only",
				missing: [
					{ elementId: "a", what: "x" },
					{ elementId: "b", what: "y" },
				],
			}),
		).toBe("Shape only — 2 steps need configuration")
		expect(badgeText({ state: "shape-only", missing: [{ elementId: "a", what: "x" }] })).toBe(
			"Shape only — 1 step needs configuration",
		)
		expect(badgeText({ state: "invalid", errors: [{ elementId: "a", message: "m" }] })).toBe(
			"1 deploy error",
		)
		expect(
			badgeText({
				state: "invalid",
				errors: [
					{ elementId: "a", message: "m" },
					{ elementId: "b", message: "m" },
				],
			}),
		).toBe("2 deploy errors")
	})
})

describe("deploy gate in the readiness check", () => {
	// A message wait with no correlation key: a placeholder fills it.
	const waiting = () =>
		draft("# P\nstart[start Go] > w[catch:message Reply received | msg=reply] > f[end Done]")

	it("adds the gate's lines and offers placeholders when a fill makes it deploy", () => {
		const result = readiness(waiting(), "8.10")
		expect(result.state).toBe("shape-only")
		if (result.state !== "shape-only") return
		expect(result.gate?.fillable).toBe(true)
		expect(result.gate?.message).toMatch(
			/^Not deployable on Camunda 8\.10: 1 error\(s\)\n- Message_reply: .*\(zeebe\/message-subscription\)$/,
		)
		expect(result.missing.map((m) => m.elementId)).toContain("Message_reply")
	})

	it("fills the placeholders on request, after which the draft is ready", () => {
		const filled = fillPlaceholders(waiting(), "8.10")
		expect(filled?.filled).toEqual(['Message_reply: correlationKey = ="placeholder-Message_reply"'])
		if (!filled) return
		expect(readiness(filled.definitions, "8.10").state).toBe("ready")
	})

	it("calls what no placeholder can fix invalid, with the gate's rule", () => {
		const defs = draft("# P\nstart[start Go] > a[service Do it] > f[end Done]")
		const flow = defs.processes[0]?.sequenceFlows[0]
		if (!flow) throw new Error("no flow")
		// A condition on a flow leaving a start event: no placeholder removes it.
		flow.conditionExpression = { text: "=x", attributes: {} }
		const result = readiness(defs, "8.10")
		expect(result.state).toBe("invalid")
		if (result.state !== "invalid") return
		expect(result.gate?.fillable).toBe(false)
		expect(result.gate?.message).toContain("(zeebe/conditional-flow-source)")
		expect(fillPlaceholders(defs, "8.10")).toBeNull()
	})

	it("refuses to share XML that would not deploy, with the gate's lines first", () => {
		const xml = Bpmn.export(waiting(), { validate: false })
		const refusal = shareRefusal(xml)
		expect(refusal).toMatch(/^Not deployable on Camunda \d+\.\d+: 1 error\(s\)\n- Message_reply: /)
		expect(refusal).toContain("Fill placeholders")
		const filled = fillPlaceholders(waiting())
		if (!filled) throw new Error("not fillable")
		expect(shareRefusal(Bpmn.export(filled.definitions, { validate: false }))).toBeNull()
	})
})
