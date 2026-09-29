import { describe, expect, it } from "vitest"
import { expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import {
	PROCESS_TEXT_GUIDE,
	createProcessTextStream,
	parseProcessText,
} from "../src/bpmn/process-text.js"

const EXAMPLE = PROCESS_TEXT_GUIDE.slice(
	PROCESS_TEXT_GUIDE.indexOf("Example:\n") + "Example:\n".length,
)

function elements(text: string) {
	return parseProcessText(text).diagram.processes[0]?.elements ?? []
}
function flows(text: string) {
	return parseProcessText(text).diagram.processes[0]?.flows ?? []
}

describe("parseProcessText", () => {
	it("reads the guide's own example without problems", () => {
		const { diagram, problems, fixes } = parseProcessText(EXAMPLE)
		expect(problems).toEqual([])
		// `pay` has two incoming branches; that join is the only thing added.
		expect(fixes).toEqual(['joined 2 flows into "pay" with xor gateway "pay_join"'])
		const process = diagram.processes[0]
		expect(process?.name).toBe("Expense approval")
		expect(process?.id).toBe("Expense_approval")
		expect(process?.elements.find((e) => e.id === "failed")).toMatchObject({
			type: "boundaryEvent",
			eventType: "error",
			attachedTo: "pay",
		})
		expect(process?.flows.find((f) => f.to === "review")).toMatchObject({
			name: "Yes",
			condition: "= amount > 1000",
		})
		expect(process?.flows.find((f) => f.to === "auto")).toMatchObject({
			name: "No",
			isDefault: true,
		})
		// And it is a diagram: expand, export, parse back.
		const xml = Bpmn.export(expand(diagram))
		expect(Bpmn.parse(xml).processes[0]?.flowElements).toHaveLength(process?.elements.length ?? -1)
	})

	it("declares a node once and refers to it by id afterwards", () => {
		const text = "a[start Begun] > b[user Do it]\nb > c[end Done]"
		expect(elements(text).map((e) => [e.id, e.type, e.name])).toEqual([
			["a", "startEvent", "Begun"],
			["b", "userTask", "Do it"],
			["c", "endEvent", "Done"],
		])
		expect(flows(text).map((f) => [f.id, f.from, f.to])).toEqual([
			["Flow_1", "a", "b"],
			["Flow_2", "b", "c"],
		])
	})

	it("accepts Mermaid arrows and ignores fences, comments and blank lines", () => {
		const text = "```\n// a comment\n\na[start] -> b[task] --> c[end]\n```"
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([])
		expect(flows(text)).toHaveLength(2)
	})

	it("reads edge labels: label only, condition, default", () => {
		const text = [
			"s[start] > g[xor Ok?]",
			'g >(Yes: status = "ok" and count(items) > 0) a[end A]',
			"g >(Maybe) b[end B]",
			"g >(default) c[end C]",
		].join("\n")
		const [, yes, maybe, other] = flows(text)
		expect(yes).toMatchObject({ name: "Yes", condition: '= status = "ok" and count(items) > 0' })
		expect(maybe).toMatchObject({ name: "Maybe" })
		expect(maybe?.condition).toBeUndefined()
		expect(other).toMatchObject({ isDefault: true })
	})

	it("joins branches that meet at a task, but not at a gateway", () => {
		const text = [
			"s[start] > split[and] > a[task A] > done[end]",
			"split > b[task B] > done",
			"s2[start:message] > m[and] > x[task X]",
		].join("\n")
		const { diagram, fixes } = parseProcessText(text)
		expect(fixes).toContain('joined 2 flows into "done" with xor gateway "done_join"')
		const into = diagram.processes[0]?.flows.filter((f) => f.to === "done")
		expect(into?.map((f) => f.from)).toEqual(["done_join"])
	})

	it("makes the one unconditioned branch of an xor its default", () => {
		const text = "s[start] > g[xor Big?]\ng >(Yes: size > 10) a[end]\ng >(No) b[end]"
		const { fixes } = parseProcessText(text)
		expect(fixes).toContain('made g > b the default branch of "g"')
		expect(flows(text).find((f) => f.to === "b")?.isDefault).toBe(true)
	})

	it("adds a missing start event and an end after every open path", () => {
		const { diagram, fixes } = parseProcessText("a[user A] > b[service B]")
		expect(fixes).toEqual([
			'added start event "start" before "a"',
			'added end event "b_end" after "b"',
		])
		expect(diagram.processes[0]?.elements.find((e) => e.id === "b")?.jobType).toBe("b")
	})

	it("reports what it leaves out, with the line", () => {
		const text = [
			"s[start] > a[task A] > ghost",
			"a[user Again]",
			"x[frobnicate Odd] > e[end:email Done]",
			"b[boundary:timer Late] > a",
			"e > s",
			"this is prose, not a path",
		].join("\n")
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([
			{ line: 1, message: '"ghost" is never declared; flow a > ghost left out' },
			{ line: 2, message: '"a" is already declared on line 1; the first declaration is kept' },
			{ line: 3, message: 'unknown kind "frobnicate" for "x"; used task' },
			{ line: 3, message: 'unknown trigger "email" for "e"; read as part of the name' },
			{ line: 4, message: 'boundary "b" has no on=<task id>; left out' },
			{ line: 4, message: '"b" was left out; flow b > a left out' },
			{ line: 5, message: "an end event has no outgoing flow; flow e > s left out" },
			{ line: 6, message: 'expected ">" at "is prose, not a path"' },
		])
	})

	// Each line below is from a recorded model answer in the Drop benchmark.
	it("reads the kind a model leaves out, from the id", () => {
		const els = elements("start[order placed] > review[Check it] > done[Order shipped]")
		expect(els.map((e) => [e.id, e.type, e.name])).toEqual([
			["start", "startEvent", "order placed"],
			["review", "task", "Check it"],
			["done", "endEvent", "Order shipped"],
		])
	})

	it("reads a name written where the trigger goes", () => {
		const els = elements("start[start:order received] > end[end:success Charge completed]")
		expect(els.map((e) => [e.type, e.name, e.eventType])).toEqual([
			["startEvent", "order received", undefined],
			["endEvent", "success Charge completed", undefined],
		])
	})

	it("accepts the synonyms models use for a kind, without a problem", () => {
		const text =
			"s[start] > p[parallel] > w[event:message Report received] > d[decision Check credit] > e[end]"
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([])
		expect(elements(text).map((e) => e.type)).toEqual([
			"startEvent",
			"parallelGateway",
			"intermediateCatchEvent",
			"businessRuleTask",
			"endEvent",
		])
		expect(elements(text).find((e) => e.id === "w")?.eventType).toBe("message")
	})

	it("keeps only one default per gateway, and none off a parallel gateway", () => {
		const text = [
			"s[start] > g[xor]",
			"g >(default) a[end]",
			"g >(default) b[end]",
			"s2[start] > p[and]",
			"p >(default) c[end]",
		].join("\n")
		const { problems } = parseProcessText(text)
		expect(problems.map((p) => p.line)).toEqual([3, 5])
		expect(flows(text).filter((f) => f.isDefault)).toHaveLength(1)
	})

	it("reads non-interrupting boundaries and job types", () => {
		const text =
			"s[start] > t[service Poll | job=report.poll] > e[end]\nw[boundary:timer Late | on=t, nonint] > f[end]"
		const els = elements(text)
		expect(els.find((e) => e.id === "t")?.jobType).toBe("report.poll")
		expect(els.find((e) => e.id === "w")).toMatchObject({ attachedTo: "t", interrupting: false })
	})

	it("never produces a diagram expand rejects", () => {
		const nasty = [
			"Flow_1[start] > Process_1[task] > start[task]",
			"start > start_end[end]",
			"Process_1 > Process_1",
			"# 123 title",
		].join("\n")
		const { diagram } = parseProcessText(nasty)
		expect(() => expand(diagram)).not.toThrow()
	})
})

describe("createProcessTextStream", () => {
	it("draws each finished line and leaves the unfinished one for later", () => {
		const stream = createProcessTextStream()
		expect(stream.push("# Order\ns[start Placed] > a[user Che")).toBeNull()
		const first = stream.push("ck order] > b[end Done]\nb")
		expect(first?.processes[0]?.flowElements.map((e) => e.id)).toEqual(["s", "a", "b"])
		// The trailing "b" is an unterminated line: nothing new yet.
		expect(stream.push("")).toBeNull()
		const result = stream.end()
		expect(result.problems).toEqual([])
		expect(result.diagram.processes[0]?.name).toBe("Order")
	})

	it("waits for a node that is referenced before it is declared", () => {
		const stream = createProcessTextStream()
		const frame = stream.push("s[start] > g[xor Ok?]\ng >(Yes: ok) later\n")
		expect(frame?.processes[0]?.sequenceFlows).toHaveLength(1)
		stream.push("later[end Done]\n")
		expect(stream.end().diagram.processes[0]?.flows.map((f) => f.to)).toContain("later")
	})

	it("produces the same result as parseProcessText", () => {
		const stream = createProcessTextStream()
		for (const ch of EXAMPLE) stream.push(ch)
		expect(stream.end()).toEqual(parseProcessText(EXAMPLE))
	})
})
