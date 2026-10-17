import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"
import { renderBpmnAscii } from "../src/index.js"

// The bake-off fixture lives in @bpmnkit/core, which cannot depend on this package.
const fixture = (name: string) =>
	readFileSync(new URL(`../../core/tests/fixtures/bakeoff/${name}`, import.meta.url), "utf8")

describe("bake-off fixture", () => {
	it("renders AI Agent Chat With Tools as fixtures/bakeoff/expected.txt", () => {
		expect(renderBpmnAscii(fixture("expected.bpmn"))).toBe(fixture("expected.txt"))
	})
})
