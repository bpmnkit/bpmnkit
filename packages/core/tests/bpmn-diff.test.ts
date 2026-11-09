import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"
import { diffBpmn } from "../src/bpmn/bpmn-diff.js"
import { parseBpmn } from "../src/bpmn/bpmn-parser.js"

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "../../../conformance/diff")
const load = (name: string, side: "before" | "after") =>
	parseBpmn(fs.readFileSync(path.join(root, name, `${side}.bpmn`), "utf8"))
const diff = (name: string) => diffBpmn(load(name, "before"), load(name, "after"))

describe("diffBpmn", () => {
	it("reports a rename as one field change", () => {
		const d = diff("rename")
		expect(d.summary).toEqual({ added: 0, removed: 0, changed: 1, moved: 0, total: 1 })
		expect(d.changes[0]).toMatchObject({
			id: "Task_review",
			elementType: "serviceTask",
			nameBefore: "Review order",
			nameAfter: "Check order",
			fields: [{ path: "name", before: "Review order", after: "Check order" }],
		})
	})

	it("paths into extension elements read like XPath", () => {
		const paths = diff("zeebe-header-change").changes[0]?.fields.map((f) => f.path)
		expect(paths).toEqual([
			"extensionElements/zeebe:taskDefinition/@type",
			"extensionElements/zeebe:taskHeaders/zeebe:header/@value",
		])
	})

	it("sees a layout-only change as moved, with the same hash", () => {
		const d = diff("move-only")
		expect(d.changes.every((c) => c.kind === "moved" && c.fields.length === 0)).toBe(true)
		expect(d.changes[0]?.geometryBefore).not.toEqual(d.changes[0]?.geometryAfter)
		expect(d.beforeHash).toBe(d.afterHash)
	})

	it("treats reformatting as no change", () => {
		const d = diff("noop-reformat")
		expect(d.changes).toEqual([])
		expect(d.planes).toEqual([])
		expect(d.beforeHash).toBe(d.afterHash)
	})

	it("shows an id change as removed + added plus the flows that follow it", () => {
		const d = diff("ids-only-change")
		expect(d.changes.map((c) => `${c.kind}:${c.id}`)).toEqual([
			"added:Task_check",
			"removed:Task_review",
			"changed:Flow_1",
			"changed:Flow_2",
			"changed:Process_1",
		])
	})

	it("keeps the hashes apart when the model differs", () => {
		const d = diff("lane-add")
		expect(d.beforeHash).not.toBe(d.afterHash)
		expect(d.beforeHash).toMatch(/^[0-9a-f]{64}$/)
	})
})
