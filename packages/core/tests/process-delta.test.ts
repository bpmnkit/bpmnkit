import { describe, expect, it } from "vitest"
import { PROCESS_DELTA_GUIDE, parseProcessDelta } from "../src/bpmn/process-delta.js"

const EXAMPLE = PROCESS_DELTA_GUIDE.slice(
	PROCESS_DELTA_GUIDE.indexOf("Example:\n") + "Example:\n".length,
)

describe("parseProcessDelta", () => {
	it("reads the guide's own example without problems", () => {
		const delta = parseProcessDelta(EXAMPLE)
		expect(delta.problems).toEqual([])
		expect(delta.nodes).toEqual([
			{ id: "second", type: "userTask", name: "Second approval", line: 1 },
			{ id: "review", type: "userTask", name: "Review application", line: 2 },
		])
		expect(delta.flows.map((f) => [f.from, f.to])).toEqual([
			["check", "second"],
			["second", "pay"],
		])
		expect(delta.removedNodes).toEqual([{ id: "notify", line: 3 }])
		expect(delta.addressed).toEqual([
			{ item: 1, ids: ["second"], line: 4 },
			{ item: 2, ids: ["review"], line: 5 },
		])
	})

	it("reads a declaration without a kind as a rename", () => {
		const delta = parseProcessDelta("review[Review the application]")
		expect(delta.nodes).toEqual([{ id: "review", name: "Review the application", line: 1 }])
	})

	it("reads triggers and attributes", () => {
		const delta = parseProcessDelta(
			"late[boundary:timer Two days | on=review nonint] > remind[service Remind | job=remind]",
		)
		expect(delta.problems).toEqual([])
		expect(delta.nodes).toEqual([
			{
				id: "late",
				type: "boundaryEvent",
				trigger: "timer",
				name: "Two days",
				on: "review",
				interrupting: false,
				line: 1,
			},
			{ id: "remind", type: "serviceTask", name: "Remind", jobType: "remind", line: 1 },
		])
	})

	it("reads conditions, labels and defaults on flows", () => {
		const delta = parseProcessDelta(
			"gw >(Yes: amount > 1000) a\ngw >(No: default) b\ngw >(Maybe) c",
		)
		expect(delta.flows).toEqual([
			{ from: "gw", to: "a", name: "Yes", condition: "= amount > 1000", line: 1 },
			{ from: "gw", to: "b", name: "No", isDefault: true, line: 2 },
			{ from: "gw", to: "c", name: "Maybe", line: 3 },
		])
	})

	it("keeps a condition as written, FEEL or not", () => {
		const delta = parseProcessDelta("gw >(Yes: is approved) a")
		expect(delta.flows).toEqual([
			{ from: "gw", to: "a", name: "Yes", condition: "= is approved", line: 1 },
		])
		expect(delta.problems).toEqual([])
	})

	it("reads removals of nodes, lists of nodes and flows along a path", () => {
		const delta = parseProcessDelta("- a\n- b, c,d\n- x > y > z")
		expect(delta.removedNodes.map((r) => r.id)).toEqual(["a", "b", "c", "d"])
		expect(delta.removedFlows).toEqual([
			{ from: "x", to: "y", line: 3 },
			{ from: "y", to: "z", line: 3 },
		])
	})

	it("removes nothing on a prose bullet, even one naming an id", () => {
		const delta = parseProcessDelta("- review is removed\n- Added a second approval step")
		expect(delta.removedNodes).toEqual([])
		expect(delta.removedFlows).toEqual([])
		expect(delta.problems.map((p) => p.line)).toEqual([1, 2])
	})

	it("takes an arrow at the start of a line as a path, not a removal", () => {
		const delta = parseProcessDelta("a >\n-> b")
		expect(delta.removedNodes).toEqual([])
		expect(delta.problems).toEqual([{ line: 2, message: 'expected a node id at "-> b"' }])
	})

	it("joins a path wrapped over two lines", () => {
		const delta = parseProcessDelta("a > b >\n  c")
		expect(delta.flows.map((f) => [f.from, f.to])).toEqual([
			["a", "b"],
			["b", "c"],
		])
	})

	it("reads an unfinished last line without its arrow", () => {
		const delta = parseProcessDelta("a > b >")
		expect(delta.flows.map((f) => [f.from, f.to])).toEqual([["a", "b"]])
		expect(delta.problems).toHaveLength(1)
	})

	it("keeps the first of two declarations of one id", () => {
		const delta = parseProcessDelta("a[user One]\na[user Two]")
		expect(delta.nodes.map((n) => n.name)).toEqual(["One"])
		expect(delta.problems[0]?.message).toContain("already declared on line 1")
	})

	it("reads @ lines, with or without ids, and refuses ones without a number", () => {
		const delta = parseProcessDelta("@1 a, b\n@ 2: c\n@3\n@x a")
		expect(delta.addressed).toEqual([
			{ item: 1, ids: ["a", "b"], line: 1 },
			{ item: 2, ids: ["c"], line: 2 },
			{ item: 3, ids: [], line: 3 },
		])
		expect(delta.problems).toEqual([{ line: 4, message: 'expected "@<feedback number> <ids>"' }])
	})

	it("ignores titles, fences and comments", () => {
		const delta = parseProcessDelta("```\n# Changes\n// note\na > b\n```")
		expect(delta.problems).toEqual([])
		expect(delta.flows).toHaveLength(1)
	})

	it("reports what it cannot read and keeps going", () => {
		const delta = parseProcessDelta("a[user Open\nb > c\nd[task X | color=red]")
		expect(delta.problems.map((p) => p.line)).toEqual([1, 3])
		expect(delta.flows).toHaveLength(1)
		expect(delta.nodes).toEqual([{ id: "d", type: "task", name: "X", line: 3 }])
	})

	it("ignores an unknown trigger and brackets on a removal", () => {
		const delta = parseProcessDelta("e[catch:weather Rain]\n- a[task A] > b")
		expect(delta.nodes[0]).toEqual({
			id: "e",
			type: "intermediateCatchEvent",
			name: "Rain",
			line: 1,
		})
		expect(delta.removedFlows).toEqual([{ from: "a", to: "b", line: 2 }])
		expect(delta.problems.map((p) => p.line)).toEqual([1, 2])
	})
})
