import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/index.js"

const gw = () =>
	Bpmn.createProcess("p").startEvent("s").exclusiveGateway("g", { name: "User satisfied?" })

type Definitions = ReturnType<ReturnType<typeof gw>["build"]>

const process = (d: Definitions) => d.processes[0]
const flows = (d: Definitions) => process(d)?.sequenceFlows ?? []

describe("branch flow labels and ids", () => {
	it("names the flow with label() and keeps the id from the branch id", () => {
		const a = gw()
			.branch("yes", (b) => b.condition("=ok").endEvent("e1"))
			.branch("no", (b) => b.defaultFlow().endEvent("e2"))
			.build()
		const b = gw()
			.branch("yes", (b) => b.label("Yes").condition("=ok").endEvent("e1"))
			.branch("no", (b) => b.label("No").defaultFlow().endEvent("e2"))
			.build()
		expect(flows(b).map((f) => f.name)).toContain("Yes")
		expect(
			flows(b)
				.map((f) => f.id)
				.sort(),
		).toEqual(
			flows(a)
				.map((f) => f.id)
				.sort(),
		)
	})

	it("keeps an explicit flowId, also with connectTo", () => {
		const d = gw()
			.branch("no", (b) => b.flowId("Flow_No").label("No").condition("=x").connectTo("g"))
			.branch("yes", (b) => b.defaultFlow().endEvent("e"))
			.build()
		expect(flows(d).some((f) => f.id === "Flow_No" && f.name === "No")).toBe(true)
	})

	it("keeps the default reference on an explicit flowId", () => {
		const d = gw()
			.branch("yes", (b) => b.condition("=ok").endEvent("e1"))
			.branch("no", (b) => b.flowId("Flow_Def").defaultFlow().endEvent("e2"))
			.build()
		const g = process(d)?.flowElements.find((e) => e.id === "g")
		expect(g && "default" in g ? g.default : undefined).toBe("Flow_Def")
	})

	it("throws when a flowId collides", () => {
		expect(() =>
			gw()
				.branch("x", (b) => b.flowId("g").endEvent("e"))
				.build(),
		).toThrow(/Flow id "g" .*already used/)
	})
})
