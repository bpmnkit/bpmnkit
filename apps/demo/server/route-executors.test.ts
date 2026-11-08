import { describe, expect, it } from "vitest"
import { executeCompactJson } from "./compact-json-executor.js"
import { extractJsonBlock } from "./extractor.js"
import { executePlan } from "./plan-executor.js"

const COMPACT = {
	id: "D",
	processes: [
		{
			id: "P",
			name: "Simple",
			elements: [
				{ id: "s", type: "startEvent", name: "Start" },
				{ id: "e", type: "endEvent", name: "End" },
			],
			flows: [{ id: "f", from: "s", to: "e" }],
		},
	],
}

const PLAN = {
	version: 1,
	process: { id: "Simple", name: "Simple" },
	steps: [
		{ kind: "start", name: "Start" },
		{ kind: "end", name: "End" },
	],
}

describe("extractJsonBlock", () => {
	it("reads a fenced json block", () => {
		expect(extractJsonBlock('text\n```json\n{"a":1}\n```\nmore')).toBe('{"a":1}')
	})
	it("accepts unfenced JSON", () => {
		expect(extractJsonBlock('  {"a":1}  ')).toBe('{"a":1}')
	})
	it("returns null for prose", () => {
		expect(extractJsonBlock("no json here")).toBeNull()
	})
})

describe("executeCompactJson", () => {
	it("expands a CompactDiagram into BPMN XML", () => {
		const xml = executeCompactJson(JSON.stringify(COMPACT))
		expect(xml).toContain("bpmn:startEvent")
		expect(xml).toContain('id="P"')
	})
	it("throws on malformed JSON", () => {
		expect(() => executeCompactJson("{nope")).toThrow()
	})
})

describe("executePlan", () => {
	it("compiles a ProcessPlan into BPMN XML", () => {
		expect(executePlan(JSON.stringify(PLAN))).toContain("bpmn:endEvent")
	})
	it("throws with the compiler's problems when there is no XML", () => {
		expect(() => executePlan(JSON.stringify({ ...PLAN, version: 2 }))).toThrow(/version/)
	})
})
