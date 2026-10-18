import { readFileSync } from "node:fs"
import { Bpmn, expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it } from "vitest"
import { badgeText, readiness } from "../src/lib/readiness.js"

const draft = (text: string) => expand(parseProcessText(text).diagram)

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
})

describe("badgeText", () => {
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
