import { describe, expect, it } from "vitest"
import type { BpmnBounds, BpmnDefinitions } from "../src/bpmn/bpmn-model.js"
import { resolveBpmnlintConfig } from "../src/bpmn/bpmnlint.js"
import { expand } from "../src/bpmn/compact.js"
import { lintDiagram } from "../src/bpmn/lint.js"
import {
	PROCESS_TEXT_GUIDE,
	createProcessTextStream,
	parseProcessText,
} from "../src/bpmn/process-text.js"
import { collaborationProblems, laneProblems } from "../src/bpmn/swimlanes.js"

const LANED = `# Order
start[start Order received] > review[user Review order] > ok[xor Approved?]
ok >(Yes: approved) ship[service Ship order] > done[end Shipped]
ok >(No: default) reject[end Rejected]
lane sales[Sales team]: start, review, ok, reject
lane ops[Operations]: ship, done`

const POOLED = `# Payment
start[start Order placed] > pay[send Request payment] > wait[receive Payment received] > done[end Paid]
pool bank[Bank]
msg pay >(Payment request) bank
msg bank > wait`

function process(text: string) {
	const result = parseProcessText(text)
	return { ...result, process: result.diagram.processes[0] }
}

function boundsOf(defs: BpmnDefinitions, id: string): BpmnBounds {
	const shape = defs.diagrams[0]?.plane.shapes.find((s) => s.bpmnElement === id)
	if (!shape) throw new Error(`no shape for ${id}`)
	return shape.bounds
}

function inside(inner: BpmnBounds, outer: BpmnBounds): boolean {
	return (
		inner.x >= outer.x &&
		inner.y >= outer.y &&
		inner.x + inner.width <= outer.x + outer.width &&
		inner.y + inner.height <= outer.y + outer.height
	)
}

describe("process text: lanes", () => {
	it("reads lane lines into the process's lanes", () => {
		const { process: p, problems, fixes } = process(LANED)
		expect(problems).toEqual([])
		expect(fixes).toEqual([])
		expect(p?.lanes).toEqual([
			{ id: "sales", name: "Sales team", members: ["start", "review", "ok", "reject"] },
			{ id: "ops", name: "Operations", members: ["ship", "done"] },
		])
	})

	it("expands to a pool with lanes that hold their nodes", () => {
		const defs = expand(parseProcessText(LANED).diagram)
		const [p] = defs.processes
		expect(p && laneProblems(p)).toEqual([])
		expect(collaborationProblems(defs)).toEqual([])
		expect(defs.collaborations[0]?.participants).toHaveLength(1)
		for (const id of ["start", "review", "ok", "reject"]) {
			expect(inside(boundsOf(defs, id), boundsOf(defs, "sales")), id).toBe(true)
		}
		for (const id of ["ship", "done"]) {
			expect(inside(boundsOf(defs, id), boundsOf(defs, "ops")), id).toBe(true)
		}
	})

	it("passes the lint rules the parser keeps", () => {
		const recommended = resolveBpmnlintConfig({ extends: "bpmnlint:recommended" })
		for (const text of [LANED, POOLED, "s[start] > t[task T] > e[end]\nlane a: s, t, e"]) {
			const findings = lintDiagram(expand(parseProcessText(text).diagram), {
				bpmnlint: recommended,
			}).diagnostics.filter(
				(d) => (d.category === "flow" || d.category === "naming") && d.severity !== "info",
			)
			expect(
				findings.map((d) => `${d.id}: ${d.message}`),
				text,
			).toEqual([])
		}
	})

	it("reads a lane line written before its members", () => {
		const text = ["lane sales[Sales]: s, t", "lane ops[Ops]: e", "s[start] > t[task T] > e[end]"]
		const { process: p, problems } = process(text.join("\n"))
		expect(problems).toEqual([])
		expect(p?.lanes?.map((lane) => lane.members)).toEqual([["s", "t"], ["e"]])
	})

	it("names a lane from its id when it has no name", () => {
		const { process: p } = process("s[start] > e[end]\nlane back_office: s, e")
		expect(p?.lanes).toEqual([{ id: "back_office", name: "Back office", members: ["s", "e"] }])
	})

	it("means the node an id names when the lane line is read", () => {
		// `done` is reused for a second node; the lane line between the two means the first
		const text = [
			"s[start] > g[xor Ok?]",
			"g >(Yes: ok) done[end Approved]",
			"lane a[A]: s, g, done",
			"g >(No: default) done[end Rejected]",
			"lane b[B]: done",
		]
		const { process: p } = process(text.join("\n"))
		expect(p?.lanes?.map((lane) => lane.members)).toEqual([["s", "g", "done"], ["done_2"]])
	})

	it("leaves out a member that is not a node of the diagram", () => {
		const { process: p, problems } = process("s[start] > e[end]\nlane a: s, e, ghost")
		expect(p?.lanes?.[0]?.members).toEqual(["s", "e"])
		expect(problems).toEqual([
			{ line: 2, message: 'lane a: "ghost" is not a node of the diagram; left out' },
		])
	})

	it("keeps a node listed in two lanes in the last one", () => {
		const { process: p, problems } = process(
			"s[start] > t[task T] > e[end]\nlane a: s, t\nlane b: t, e",
		)
		expect(p?.lanes?.map((lane) => lane.members)).toEqual([["s"], ["t", "e"]])
		expect(problems).toEqual([
			{ line: 3, message: 'lane b: "t" is already in lane a; moved it to b' },
		])
	})

	it("adds to a lane written twice", () => {
		const { process: p, problems } = process(
			"s[start] > t[task T] > e[end]\nlane a[A]: s\nlane a: t, e",
		)
		expect(problems).toEqual([])
		expect(p?.lanes).toEqual([{ id: "a", name: "A", members: ["s", "t", "e"] }])
	})

	it("puts a node no lane names, and what the parser adds, in a neighbour's lane", () => {
		const text = [
			"s[start] > g[xor Big?]",
			"g >(Yes: big) a[user Check] > pay[service Pay]",
			"g >(No: default) pay",
			"x[boundary:error Failed | on=pay] > fix[user Fix]",
			"lane front[Front]: s, g, a",
			"lane back[Back]: pay",
		]
		const { process: p, problems, fixes } = process(text.join("\n"))
		expect(problems).toEqual([])
		const members = Object.fromEntries((p?.lanes ?? []).map((lane) => [lane.id, lane.members]))
		// The join before pay follows its predecessors; the boundary follows its host,
		// and its handling follows the boundary
		expect(members.front).toEqual(expect.arrayContaining(["s", "g", "a", "pay_join"]))
		expect(members.back).toEqual(expect.arrayContaining(["pay", "x", "fix"]))
		expect(fixes).toEqual(
			expect.arrayContaining([
				'put "pay_join", which no lane named, in lane front',
				'put "x", which no lane named, in lane back',
				'put "fix", which no lane named, in lane back',
			]),
		)
		const defs = expand(parseProcessText(text.join("\n")).diagram)
		expect(defs.processes[0] && laneProblems(defs.processes[0])).toEqual([])
	})

	it("keeps a boundary event in its host's lane, whatever lane lists it", () => {
		const text = [
			"s[start] > pay[service Pay] > e[end]",
			"x[boundary:error Failed | on=pay] > fix[user Fix] > fe[end Fixed]",
			"lane a: s, pay, e",
			"lane b: x, fix, fe",
		]
		const { process: p, problems } = process(text.join("\n"))
		const members = Object.fromEntries((p?.lanes ?? []).map((lane) => [lane.id, lane.members]))
		expect(members.a).toEqual(["s", "pay", "e", "x"])
		expect(members.b).toEqual(["fix", "fe"])
		expect(problems).toEqual([
			{ line: 4, message: 'lane b: "x" is a boundary event on "pay"; put it in pay\'s lane a' },
		])
	})

	it("says what a lane or pool id clashes with", () => {
		const { problems } = process("s[start] > e[end]\nlane bank: s, e\npool bank")
		expect(problems).toEqual([
			{ line: 3, message: 'pool bank: the id is a lane\'s; wrote the pool as "bank_pool"' },
		])
	})

	it("refuses a member inside an ad-hoc sub-process", () => {
		const text =
			"s[start] > agent[adhoc Agent] > e[end]\ntool[service Tool | inside=agent]\nlane a: s, agent, e, tool"
		const { process: p, problems } = process(text)
		expect(p?.lanes?.[0]?.members).toEqual(["s", "agent", "e"])
		expect(problems).toEqual([
			{
				line: 3,
				message:
					'lane a: "tool" is inside "agent", and a lane holds only top-level nodes; left out',
			},
		])
	})

	it("gives a lane a fresh id when a node already has its id", () => {
		const { process: p, problems } = process(
			"s[start] > review[user Review] > e[end]\nlane review: s, review, e",
		)
		expect(p?.lanes?.[0]?.id).toBe("review_lane")
		expect(problems).toEqual([
			{ line: 2, message: 'lane review: the id is a node\'s; wrote the lane as "review_lane"' },
		])
	})

	it("still reads paths whose ids start with lane, pool or msg", () => {
		const text = "lane_check[start] > pool_up[task Pool] > msg[task Message] > lanes[end]"
		const { process: p, problems } = process(text)
		expect(problems).toEqual([])
		expect(p?.elements.map((e) => e.id)).toEqual(["lane_check", "pool_up", "msg", "lanes"])
		expect(p?.lanes).toBeUndefined()
	})

	it("adds no lanes, pools or message flows to text without them", () => {
		const { diagram } = parseProcessText("s[start] > e[end]")
		expect(diagram.participants).toBeUndefined()
		expect(diagram.messageFlows).toBeUndefined()
		expect(diagram.processes[0]?.lanes).toBeUndefined()
	})
})

describe("process text: pools and message flows", () => {
	it("reads a black-box pool and its messages", () => {
		const { diagram, problems } = parseProcessText(POOLED)
		expect(problems).toEqual([])
		expect(diagram.participants).toEqual([{ id: "bank", name: "Bank" }])
		expect(diagram.messageFlows).toEqual([
			{ id: "MessageFlow_1", source: "pay", target: "bank", name: "Payment request" },
			{ id: "MessageFlow_2", source: "bank", target: "wait" },
		])
	})

	it("expands to the process's own pool beside the partner's", () => {
		const defs = expand(parseProcessText(POOLED).diagram)
		expect(collaborationProblems(defs)).toEqual([])
		const participants = defs.collaborations[0]?.participants ?? []
		expect(participants.map((p) => p.processRef)).toEqual(
			expect.arrayContaining([undefined, defs.processes[0]?.id]),
		)
		expect(defs.collaborations[0]?.messageFlows).toHaveLength(2)
		// Every pool and message flow is drawn
		for (const p of participants) expect(() => boundsOf(defs, p.id)).not.toThrow()
		const edges = defs.diagrams[0]?.plane.edges.map((e) => e.bpmnElement) ?? []
		expect(edges).toEqual(expect.arrayContaining(["MessageFlow_1", "MessageFlow_2"]))
	})

	it("names a pool from its id when it has no name", () => {
		const { diagram } = parseProcessText(
			"s[start] > t[send Ask] > e[end]\npool tax_office\nmsg t > tax_office",
		)
		expect(diagram.participants).toEqual([{ id: "tax_office", name: "Tax office" }])
	})

	it("keeps a message label that holds a colon", () => {
		const { diagram } = parseProcessText(
			"s[start] > t[send Ask] > e[end]\npool p[Partner]\nmsg t >(Order: placed) p",
		)
		expect(diagram.messageFlows?.[0]?.name).toBe("Order: placed")
	})

	it("refuses message flows BPMN does not allow", () => {
		const text = [
			"s[start] > g[xor Ok?]",
			"g >(Yes: ok) t[task T] > e[end]",
			"g >(No: default) e",
			"pool p[Partner]",
			"pool q[Other]",
			"msg s > p", // a start event only receives
			"msg p > e", // an end event only sends
			"msg g > p", // a gateway never takes part
			"msg t > e", // both ends in this process
			"msg p > q", // both ends black boxes
			"msg t > nowhere", // an unknown end
		]
		const { diagram, problems } = parseProcessText(text.join("\n"))
		expect(diagram.messageFlows).toBeUndefined()
		expect(problems.map((p) => p.line)).toEqual([6, 7, 8, 9, 10, 11])
		expect(problems[0]?.message).toBe("msg s > p: a start event cannot send a message; left out")
		expect(problems[1]?.message).toBe("msg p > e: an end event cannot receive a message; left out")
		expect(problems[2]?.message).toBe(
			"msg g > p: a gateway cannot send or receive a message; left out",
		)
		expect(problems[3]?.message).toBe(
			"msg t > e: both ends are in this process; a message goes to or comes from a pool line; left out",
		)
		expect(problems[4]?.message).toBe(
			"msg p > q: both ends are pools; one end must be a node of the process; left out",
		)
		expect(problems[5]?.message).toBe(
			'msg t > nowhere: "nowhere" is not a node or a pool; left out',
		)
	})

	it("refuses an event whose trigger is not a message", () => {
		const text = [
			"s[start] > w[catch:timer Wait | after=PT1H] > t[throw:signal Tell] > e[end]",
			"pool p[Partner]",
			"msg p > w",
			"msg t > p",
		]
		const { diagram, problems } = parseProcessText(text.join("\n"))
		expect(diagram.messageFlows).toBeUndefined()
		expect(problems.map((p) => p.message)).toEqual([
			"msg p > w: a timer event cannot receive a message; left out",
			"msg t > p: a signal event cannot send a message; left out",
		])
	})

	it("reads an id that names both a node and a pool by the other end", () => {
		const { diagram } = parseProcessText(
			"s[start] > bank[send Ask bank] > e[end]\npool bank[Bank]\nmsg bank > bank\npool tax[Tax]\nmsg tax > bank",
		)
		expect(diagram.messageFlows?.map((m) => [m.source, m.target])).toEqual([
			["bank", "bank_pool"],
			["tax", "bank"],
		])
	})

	it("lets a message start or end the process", () => {
		const text =
			"s[start:message Order in] > t[task Handle] > e[end:message Confirmed]\npool c[Customer]\nmsg c > s\nmsg e > c"
		const { diagram, problems } = parseProcessText(text)
		expect(problems).toEqual([])
		expect(diagram.messageFlows?.map((m) => [m.source, m.target])).toEqual([
			["c", "s"],
			["e", "c"],
		])
	})

	it("gives a pool a fresh id when a node already has its id", () => {
		const { diagram, problems } = parseProcessText(
			"s[start] > bank[send Ask bank] > e[end]\npool bank[Bank]\nmsg bank > bank",
		)
		expect(diagram.participants?.[0]?.id).toBe("bank_pool")
		expect(problems[0]?.message).toBe(
			'pool bank: the id is a node\'s; wrote the pool as "bank_pool"',
		)
	})
})

describe("process text: lanes and pools while streaming", () => {
	it("draws a frame for a lane line", () => {
		const stream = createProcessTextStream()
		stream.push("s[start] > t[task T] > e[end]\n")
		const frame = stream.push("lane a[A]: s, t, e\n")
		expect(frame?.processes[0]?.laneSet?.lanes.map((lane) => lane.id)).toEqual(["a"])
	})

	it("produces the same result as parseProcessText", () => {
		for (const text of [LANED, POOLED]) {
			const stream = createProcessTextStream()
			for (const ch of text) stream.push(ch)
			expect(stream.end(), text).toEqual(parseProcessText(text))
		}
	})
})

describe("process text guide: lanes and pools", () => {
	it("teaches lane, pool and msg lines that parse", () => {
		for (const snippet of [
			"lane sales[Sales team]: a, b",
			"pool bank[Bank]",
			"msg pay >(Payment) bank",
		]) {
			expect(PROCESS_TEXT_GUIDE).toContain(snippet)
		}
		const text = [
			"a[start Go] > b[user Check] > pay[send Pay] > done[end Done]",
			"lane sales[Sales team]: a, b",
			"lane ops[Operations]: pay, done",
			"pool bank[Bank]",
			"msg pay >(Payment) bank",
		].join("\n")
		expect(parseProcessText(text).problems).toEqual([])
	})

	it("keeps the guide's main example free of lanes", () => {
		const example = PROCESS_TEXT_GUIDE.slice(PROCESS_TEXT_GUIDE.indexOf("Example:\n"))
		expect(example).not.toMatch(/^(lane|pool|msg) /m)
	})
})
