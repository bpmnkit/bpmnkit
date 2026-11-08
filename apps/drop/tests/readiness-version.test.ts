import { expand, parseProcessText } from "@bpmnkit/core"
import { describe, expect, it, vi } from "vitest"

const lint = vi.hoisted(() => vi.fn())
vi.mock("@bpmnkit/core", async (original) => {
	const real = await original<typeof import("@bpmnkit/core")>()
	lint.mockImplementation(real.lintDiagram)
	return { ...real, lintDiagram: lint }
})

import { readiness } from "../src/lib/readiness.js"

describe("readiness platform", () => {
	it("lints against the default version when the diagram names none, as the badge claims", () => {
		// Ungated, so the diagram names no platform, as a draft the badge judges does
		const defs = expand(parseProcessText("# P\nstart[start Go] > f[end Done]").diagram, {
			validate: false,
		})
		const result = readiness(defs)
		expect(lint).toHaveBeenCalledWith(
			expect.anything(),
			expect.objectContaining({ camundaVersion: "8.10" }),
		)
		expect(result).toEqual({ state: "ready", version: "8.10" })
	})
})
