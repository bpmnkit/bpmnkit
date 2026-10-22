import { describe, expect, it } from "vitest"
import { Bpmn } from "../src/index.js"

const METHODS = ["subProcess", "transaction", "adHocSubProcess", "eventSubProcess"] as const

// Each context reaches a different builder class that owns its own copy of the methods.
const CONTEXTS: Record<string, (call: (b: never) => unknown) => unknown> = {
	ProcessBuilder: (call) => call(Bpmn.createProcess("p").startEvent("s") as never),
	BranchBuilder: (call) =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.exclusiveGateway("g")
			.branch("a", (b) => {
				call(b as never)
				return b
			}),
	SubProcessContentBuilder: (call) =>
		Bpmn.createProcess("p")
			.startEvent("s")
			.subProcess("outer", (sub) => {
				call(sub as never)
			}),
}

type AnyCall = Record<string, (...a: unknown[]) => unknown>

describe("builder callback-first argument guard", () => {
	for (const [ctx, run] of Object.entries(CONTEXTS)) {
		for (const method of METHODS) {
			it(`${ctx}.${method} throws on (id, options, fn)`, () => {
				expect(() =>
					run((b) => (b as unknown as AnyCall)[method]?.("x1", { name: "X" }, () => {})),
				).toThrow(`${method}("x1", (sub) => ..., { name: "X" })`)
			})

			it(`${ctx}.${method} throws on (id, options) without callback`, () => {
				expect(() => run((b) => (b as unknown as AnyCall)[method]?.("x2", { name: "X" }))).toThrow(
					/x2/,
				)
			})

			it(`${ctx}.${method} still accepts (id, fn, options)`, () => {
				expect(() =>
					run((b) =>
						(b as unknown as AnyCall)[method]?.("ok", (sub: never) => (sub as { _x?: 1 })._x, {
							name: "X",
						}),
					),
				).not.toThrow()
			})
		}
	}

	it("message names method, id and the correct example", () => {
		expect(() =>
			Bpmn.createProcess("p")
				.startEvent("s")
				.subProcess("sp", { name: "X" } as never, (() => {}) as never),
		).toThrow('subProcess("sp", (sub) => ..., { name: "X" })')
	})
})
