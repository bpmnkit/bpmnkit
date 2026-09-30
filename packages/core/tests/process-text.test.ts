import { describe, expect, it } from "vitest"
import { resolveBpmnlintConfig } from "../src/bpmn/bpmnlint.js"
import { expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import { lintDiagram } from "../src/bpmn/lint.js"
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
		// A branch with a label and no condition gets one on the gateway's question.
		expect(maybe).toMatchObject({ name: "Maybe", condition: '= ok = "Maybe"' })
		expect(other).toMatchObject({ isDefault: true })
	})

	it("joins branches that meet at a task with the gateway type they were split by", () => {
		const text = [
			"s[start] > split[and] > a[task A] > done[end]",
			"split > b[task B] > done",
			"s2[start:message] > g[xor Ok?]",
			"g >(Yes: ok) c[task C] > done2[end]",
			"g >(No: default) d[task D] > done2",
		].join("\n")
		const { diagram, fixes } = parseProcessText(text)
		expect(fixes).toContain('joined 2 flows into "done" with and gateway "done_join"')
		expect(fixes).toContain('joined 2 flows into "done2" with xor gateway "done2_join"')
		const into = diagram.processes[0]?.flows.filter((f) => f.to === "done")
		expect(into?.map((f) => f.from)).toEqual(["done_join"])
	})

	it("gives a gateway that joins and splits a join of its own", () => {
		const text = [
			"s[start] > g[xor Ok?]",
			"g >(Yes: ok) a[task A] > again[xor Retry?]",
			"g >(No: default) b[task B] > again",
			"again >(Yes: retry) a",
			"again >(No: default) e[end Done]",
		].join("\n")
		const { diagram, fixes } = parseProcessText(text)
		expect(fixes).toContain('joined 2 flows into "again" with xor gateway "again_join"')
		const process = diagram.processes[0]
		const gateways = process?.elements.filter((e) => e.type === "exclusiveGateway") ?? []
		for (const gateway of gateways) {
			const ins = process?.flows.filter((f) => f.to === gateway.id).length ?? 0
			const outs = process?.flows.filter((f) => f.from === gateway.id).length ?? 0
			expect(ins > 1 && outs > 1, gateway.id).toBe(false)
		}
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
			{ line: 1, message: '"ghost" is never declared; added as a task' },
			{ line: 2, message: '"a" is already declared on line 1; ignored "user Again"' },
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
		const text = [
			"s[start] > p[parallel] > w[event:message Report received] > d[decision Check credit] > e[end]",
			"p > h[human Review report] > e",
		].join("\n")
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([])
		const types = new Map(elements(text).map((e) => [e.id, e.type]))
		expect([...["p", "w", "d", "h"].map((id) => types.get(id))]).toEqual([
			"parallelGateway",
			"intermediateCatchEvent",
			"businessRuleTask",
			"userTask",
		])
		expect(elements(text).find((e) => e.id === "w")?.eventType).toBe("message")
	})

	it("keeps a condition written in prose as the branch label, not as FEEL", () => {
		// glm-4.7-flash, golden prompt 12.
		const text = [
			"s[start] > check[xor Eligible?]",
			"check >(Yes: applicant is eligible) review[user Review application] > a[end]",
			"check >(No: applicant not eligible) reject[user Reject application] > b[end]",
			"s2[start:message] > g[xor Big?]",
			"g >(Yes: amount > 1000) big[end]",
			"g >(No: amount is small) small[end]",
		].join("\n")
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([
			{
				line: 2,
				message: 'condition "applicant is eligible" is not FEEL; kept as the branch label',
			},
			{
				line: 3,
				message: 'condition "applicant not eligible" is not FEEL; kept as the branch label',
			},
			{ line: 6, message: 'condition "amount is small" is not FEEL; kept as the branch label' },
		])
		const byTarget = new Map(flows(text).map((f) => [f.to, f]))
		// The prose stays the label; the condition asks the gateway's question of a variable.
		expect(byTarget.get("review")).toMatchObject({
			name: "Yes: applicant is eligible",
			condition: "= eligible = true",
		})
		expect(byTarget.get("reject")).toMatchObject({ isDefault: true })
		// With its FEEL sibling kept, the prose branch becomes the default.
		expect(byTarget.get("big")).toMatchObject({ condition: "= amount > 1000" })
		expect(byTarget.get("small")).toMatchObject({ name: "No: amount is small", isDefault: true })
	})

	it("keeps a condition that is FEEL", () => {
		const text =
			's[start] > g[xor Ok?]\ng >(Yes: status = "ok" and count(items) > 0) a[end]\ng >(No) b[end]'
		expect(parseProcessText(text).problems).toEqual([])
	})

	it("declares a node written with a space before its bracket", () => {
		// glm-4.7-flash, golden prompt 01.
		const text = "s[start] > notify[service Notify ops] > done-end [end Done]"
		expect(parseProcessText(text).problems).toEqual([])
		expect(elements(text).find((e) => e.id === "done-end")).toMatchObject({
			type: "endEvent",
			name: "Done",
		})
	})

	it("gives a rule task its id as decision id, so it deploys", () => {
		const els = elements("s[start] > credit[rule Check credit] > e[end]")
		expect(els.find((e) => e.id === "credit")?.decisionId).toBe("credit")
	})

	it("adds an id that is used but never declared as a task named from it", () => {
		// glm-4.7-flash, golden prompt 02: \`pay\` is only ever referenced.
		const text = [
			"start[start Expense submitted] > check[xor Amount over 1000?]",
			"check >(Yes: amount > 1000) review[user Review expense] > pay",
			"check >(No: default) auto[manual Approve] > pay",
			"failed[boundary:error Payment failed | on=pay] > notice[end:error Failure notified]",
			"pay > done[end Expense paid]",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		expect(problems).toEqual([{ line: 2, message: '"pay" is never declared; added as a task' }])
		const els = diagram.processes[0]?.elements ?? []
		expect(els.find((e) => e.id === "pay")).toMatchObject({ type: "task", name: "Pay" })
		expect(els.find((e) => e.id === "failed")).toMatchObject({ attachedTo: "pay" })
		expect(flows(text).some((f) => f.from === "pay" && f.to === "done")).toBe(true)
	})

	it("makes a reused id a new node, and restating a node keeps it", () => {
		// glm-4.7-flash, golden prompts 08 and 12.
		const text = [
			"s[start] > task[task Record offer] > and[and] > task[task Order laptop] > j[and]",
			"and > task[task Grant access] > j",
			"j > check[xor Ok?]",
			"check >(Yes: ok) done[end Approved]",
			"check >(No: default) done[end Rejected]",
			"check >(Yes: ok) done[end Approved]",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		const els = diagram.processes[0]?.elements ?? []
		expect(els.filter((e) => e.type === "task").map((e) => [e.id, e.name])).toEqual([
			["task", "Record offer"],
			["task_2", "Order laptop"],
			["task_3", "Grant access"],
		])
		expect(els.filter((e) => e.type === "endEvent").map((e) => [e.id, e.name])).toEqual([
			["done", "Approved"],
			["done_2", "Rejected"],
		])
		expect(problems.map((p) => p.message)).toContain(
			'"task" on line 1 is a different node; this one is "task_2"',
		)
		// Restated exactly, a node is the same node, without a problem.
		expect(parseProcessText("s[start] > a[task A]\na[task A] > e[end]").problems).toEqual([])
	})

	it("attaches a boundary that reuses its host's id to that host", () => {
		// gemma-4, golden prompt 02.
		const text = [
			"s[start] > pay[service Process payment] > done[end Paid]",
			"pay[boundary:error Payment failed | on=pay] > failed[end:error Failure notified]",
		].join("\n")
		const els = elements(text)
		expect(els.find((e) => e.id === "pay_2")).toMatchObject({
			type: "boundaryEvent",
			attachedTo: "pay",
		})
		expect(flows(text).some((f) => f.from === "pay_2" && f.to === "failed")).toBe(true)
	})

	it("keeps the earlier node when a line starts by restating it differently", () => {
		// glm-4.7-flash, golden prompt 01: the model revised \`validate\` into a gateway.
		const text = [
			"start[start Order created] > validate[user Validate order]",
			"validate[xor Failed validation?] > notify[service Notify ops] > done[end Done]",
		].join("\n")
		const els = elements(text)
		expect(els.find((e) => e.id === "validate")?.type).toBe("userTask")
		expect(els.some((e) => e.id === "validate_2")).toBe(false)
		expect(flows(text).some((f) => f.from === "validate" && f.to === "notify")).toBe(true)
	})

	it("ignores a restatement whose kind is not a kind", () => {
		// gemma-4, golden prompts 10 and 13.
		const text =
			"s[start] > and[and] > t[task T] > e[end]\nand > u[task U] > e\nand[kind and]\ns[id=s kind=start]"
		const { diagram, problems } = parseProcessText(text)
		const ids = diagram.processes[0]?.elements.map((e) => e.id)
		expect(ids).toEqual(expect.arrayContaining(["s", "and", "t", "e", "u"]))
		expect(ids).not.toContain("and_2")
		expect(ids).not.toContain("s_2")
		expect(problems.map((p) => p.line)).toEqual([3, 4])
	})

	it("accepts a second arrow after an edge label", () => {
		const text = "s[start] > g[xor Ok?]\ng >(No: default) > b[task B] > e[end]\ng >(Yes: ok) e"
		expect(parseProcessText(text).problems).toEqual([])
		expect(flows(text).find((f) => f.to === "b")).toMatchObject({ from: "g", isDefault: true })
	})

	it("keeps only one default per gateway, and none off a parallel gateway", () => {
		const text = [
			"s[start] > g[xor]",
			"g >(default) a[end]",
			"g >(default) b[end]",
			"s2[start:message] > p[and]",
			"p >(default) c[end]",
			"p > d[end]",
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

	it("never draws a node that is not on a path from the start (KYC, Drop)", () => {
		// A describe-to-diagram answer for "Generate a KYC process for a bank": the
		// boundary names a host never declared, and the decision has one branch.
		const text = [
			"# KYC process",
			"start[start:kyc Start KYC] > collect[user Collect data] > verify[rule Verify data] > enrich[service Enrich customer profile] > status[xor Status approved?]",
			"status > done[end]",
			"gov[boundary:error Governance check failed | on=governance] > cancel[end:error KYC cancelled]",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		const process = diagram.processes[0]
		expect(process?.elements.map((e) => e.id)).toEqual([
			"start",
			"collect",
			"verify",
			"enrich",
			"done",
		])
		expect(process?.elements[0]?.name).toBe("Start KYC")
		expect(process?.flows.map((f) => [f.from, f.to])).toEqual([
			["start", "collect"],
			["collect", "verify"],
			["verify", "enrich"],
			["enrich", "done"],
		])
		expect(problems.map((p) => p.message)).toEqual([
			'unknown trigger "kyc" for "start"; ignored, the name already says it',
			'"status" has only one branch; gateway removed',
			'boundary "gov" is on "governance", which is never declared; left out',
			'"gov" was left out; flow gov > cancel left out',
			'"cancel" is not connected to a start event; left out',
		])
	})

	it("continues a path that stops short with the fragment written after it", () => {
		// glm-4.7-flash, golden prompt 13: the arrow into the gateway is missing.
		const text = [
			"s[start Order received] > pick[task Pick items] > label[task Print label]",
			"gw[xor Ready?] > dispatch[service Dispatch package] > done[end Order fulfilled]",
			"t[catch:timer Too late] > late[task Chase]",
		].join("\n")
		const { diagram, fixes, problems } = parseProcessText(text)
		expect(fixes).toContain('connected "label" to "gw", which nothing led to')
		// A loose event is not guessed at.
		expect(problems.map((p) => p.message)).toContain(
			'"t" is not connected to a start event; left out',
		)
		const ids = diagram.processes[0]?.elements.map((e) => e.id)
		expect(ids).toContain("dispatch")
		expect(ids).not.toContain("late")
	})

	it("connects a start event left on its own to the first path", () => {
		const { fixes } = parseProcessText("s[start Begun]\na[task A] > e[end Done]")
		expect(fixes).toEqual(['connected start event "s" to "a"'])
	})

	it("splits the flows out of a task with a gateway: xor when labelled, else and", () => {
		const text = [
			"s[start] > review[user Review claim]",
			"review >(Approved) pay[task Pay] > e[end Paid]",
			"review >(Rejected) e2[end Rejected]",
			"s2[start:message Update] > both[task Record update]",
			"both > a[task A] > e3[end Done]",
			"both > b[task B] > e3",
		].join("\n")
		const { diagram } = parseProcessText(text)
		const els = new Map(diagram.processes[0]?.elements.map((e) => [e.id, e]))
		expect(els.get("review_split")).toMatchObject({
			type: "exclusiveGateway",
			name: "Review claim outcome?",
		})
		expect(els.get("both_split")?.type).toBe("parallelGateway")
		expect(els.get("e3_join")?.type).toBe("parallelGateway")
		const out = flows(text).filter((f) => f.from === "review_split")
		expect(out.map((f) => [f.to, f.condition, f.isDefault])).toEqual([
			["pay", '= reviewClaimOutcome = "Approved"', undefined],
			["e2", undefined, true],
		])
	})

	it("gives a decision a default and every other branch a condition", () => {
		const text = [
			"s[start] > g[xor Order valid?]",
			"g >(Yes: order is valid) a[end Accepted]",
			"g >(No: order is not valid) b[end Refused]",
			"s2[start:message] > h[xor Size?]",
			"h >(Big: size > 10) c[end Big]",
			"h >(Small: size <= 10) d[end Small]",
			"s3[start:timer] > p[and] > x[task X] > e[end Done]",
			"p >(Yes: ok) y[task Y] > e",
		].join("\n")
		const byTarget = new Map(flows(text).map((f) => [f.to, f]))
		expect(byTarget.get("a")).toMatchObject({ condition: "= orderValid = true" })
		expect(byTarget.get("b")).toMatchObject({ isDefault: true })
		expect(byTarget.get("b")?.condition).toBeUndefined()
		// Every branch had a condition: the last becomes the default.
		expect(byTarget.get("c")).toMatchObject({ condition: "= size > 10" })
		expect(byTarget.get("d")).toMatchObject({ isDefault: true })
		expect(byTarget.get("d")?.condition).toBeUndefined()
		// A parallel split decides nothing: no condition, no label.
		expect(byTarget.get("y")?.condition).toBeUndefined()
		expect(byTarget.get("y")?.name).toBeUndefined()
	})

	it("names what the model left unnamed", () => {
		const els = elements(
			"s[start] > check_order[task] > g[xor]\ng >(Yes: ok) e[end]\ng >(No: default) e2[end]",
		)
		expect(els.map((e) => e.name)).toEqual(["S", "Check order", "G?", "E", "E2"])
	})

	it("makes an event gateway that waits for one event a catch event", () => {
		// gpt-oss-20b, golden prompt 05.
		const text =
			"start[start Order placed] > wait[eventgw Payment confirmed] > ship[task Ship order] > end[end Order shipped]"
		const { diagram, problems } = parseProcessText(text)
		expect(diagram.processes[0]?.elements.find((e) => e.id === "wait")).toMatchObject({
			type: "intermediateCatchEvent",
			eventType: "message",
		})
		expect(problems.map((p) => p.message)).toEqual([
			'"wait" waits for only one event; made it a message catch event',
		])
		// Before a catch event it is only a detour, and goes.
		const detour = "s[start] > g[eventgw] > w[catch:timer 5 minutes] > e[end Done]"
		expect(elements(detour).map((e) => e.id)).toEqual(["s", "w", "e"])
	})

	it("leads a branch drawn into a boundary event to the boundary's handler", () => {
		// glm-4.7-flash, golden prompt 01.
		const text = [
			"start[start Order received] > check[xor Order valid?]",
			"check >(Yes: default) ship[service Ship order] > done[end Order shipped]",
			"check >(No: order invalid) fail[boundary:error Validation failed | on=ship] > notify[send Notify #ops on Slack] > sent[end Notification sent]",
		].join("\n")
		const { diagram } = parseProcessText(text)
		const process = diagram.processes[0]
		// The decision keeps both branches…
		expect(process?.flows.filter((f) => f.from === "check").map((f) => f.to)).toEqual([
			"ship",
			"notify_join",
		])
		// …and the boundary still leads to the same handler.
		expect(process?.elements.find((e) => e.id === "fail")).toMatchObject({ attachedTo: "ship" })
		expect(process?.flows.find((f) => f.from === "fail")?.to).toBe("notify_join")
	})

	it("keeps one blank start event", () => {
		// gemma-4, golden prompt 12: a legend of the ids after the diagram.
		const text = [
			"start[start Application received] > check[task Check] > done[end Done]",
			"id[start start]",
			"id[check rule]",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		const starts = diagram.processes[0]?.elements.filter((e) => e.type === "startEvent")
		expect(starts?.map((e) => e.id)).toEqual(["start"])
		expect(problems.map((p) => p.message)).toContain('"id" is a second blank start event; left out')
	})

	it("never loops without a way out", () => {
		// glm-4.7-flash, golden prompt 15: a node restated after an arrow is a flow to itself.
		const text =
			"s[start] > poll[task Poll] > wait[catch:timer 2 minutes] > wait[catch:timer 2 minutes]"
		const { diagram, problems } = parseProcessText(text)
		expect(diagram.processes[0]?.flows.some((f) => f.from === f.to)).toBe(false)
		expect(problems.map((p) => p.message)).toContain(
			"a flow cannot lead back to where it starts; flow wait > wait left out",
		)
		// A loop whose only way out was never written gets one at its decision.
		const loop = "s[start] > a[task Try] > g[xor Done?]\ng >(No: default) a"
		const { fixes } = parseProcessText(loop)
		expect(fixes).toContain('added an exit from the loop at "g" to end event "g_end"')
		expect(flows(loop).find((f) => f.to === "g_end")).toMatchObject({ from: "g" })
	})

	it("drops the flows back when parallel branches loop into their own split", () => {
		// glm-4.7-flash, golden prompt 08.
		const text = [
			"start[start Offer signed] > account[task Create account] > and[and Parallel tasks]",
			"and >(item1) it[task Set up IT] > and",
			"and >(item2) facilities[task Set up facilities] > and",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		const process = diagram.processes[0]
		expect(problems.map((p) => p.message)).toContain(
			"flow it > and loops with no way out; left out",
		)
		// Every node now reaches an end event.
		for (const id of ["it", "facilities"]) {
			const next = process?.flows.find((f) => f.from === id)?.to ?? ""
			expect(process?.elements.find((e) => e.id === next)?.type).toBe("endEvent")
		}
	})

	it("makes waits that leave the same task a race, with an event gateway", () => {
		// glm-4.7-flash, golden prompt 15.
		const text = [
			"start[start Poll started] > poll[send Poll external system]",
			"poll > timeout[catch:timer 0:PT5M] > fail[end Poll failed]",
			"poll > get[receive Report from external system] > done[end Poll successful]",
		].join("\n")
		const { diagram, fixes } = parseProcessText(text)
		const els = new Map(diagram.processes[0]?.elements.map((e) => [e.id, e]))
		expect(fixes).toContain('split the flows out of "poll" with event gateway "poll_split"')
		expect(els.get("poll_split")?.type).toBe("eventBasedGateway")
		expect(els.get("get")).toMatchObject({ type: "intermediateCatchEvent", eventType: "message" })
		expect(els.get("timeout")).toMatchObject({ eventType: "timer" })
	})

	it("gives a catch or boundary event written without a trigger a message trigger", () => {
		// gpt-oss-20b, golden prompt 05: `wait[catch Payment confirmed]`.
		const text = [
			"s[start Order placed] > wait[catch Payment confirmed] > ship[task Ship order] > e[end Shipped]",
			"cancel[boundary Order cancelled | on=ship] > c[end Cancelled]",
		].join("\n")
		const { diagram, problems } = parseProcessText(text)
		const els = new Map(diagram.processes[0]?.elements.map((e) => [e.id, e]))
		expect(els.get("wait")).toMatchObject({ type: "intermediateCatchEvent", eventType: "message" })
		expect(els.get("cancel")).toMatchObject({ type: "boundaryEvent", eventType: "message" })
		expect(problems.map((p) => p.message)).toEqual([
			'"wait" waits for nothing in particular; made it a message event',
			'"cancel" waits for nothing in particular; made it a message event',
		])
	})

	it("makes a link event in a path a plain event", () => {
		// glm-4.7-flash, golden prompt 11.
		const text =
			"s[start Order] > got[event:link Address received] > ship[service Ship order] > e[end Shipped]"
		const { diagram, problems } = parseProcessText(text)
		const got = diagram.processes[0]?.elements.find((e) => e.id === "got")
		expect(got).toMatchObject({ type: "intermediateThrowEvent", name: "Address received" })
		expect(got?.eventType).toBeUndefined()
		expect(problems.map((p) => p.message)).toEqual([
			'"got" cannot be a link event here; made it a plain event',
		])
	})

	it("keeps the rules lintDiagram checks, whatever the model wrote", () => {
		const recommended = resolveBpmnlintConfig({ extends: "bpmnlint:recommended" })
		const answers = [
			EXAMPLE,
			"start[start:kyc Start KYC] > collect[user Collect data] > status[xor Status approved?]\nstatus > done[end]\ngov[boundary:error Failed | on=governance] > cancel[end:error Cancelled]",
			"s[start] > a[task A] > b[task B]\na > c[task C]\nb > m[xor Merge?]\nc > m\nm >(ok) d[task D]\nm > a",
			"x[task X] > y[xor Y?]\ny >(Yes: prose here) z[end]\ny >(No: more prose) z",
			"s[start Go]\nt[catch:timer Wait] > u[task U]\nv[user V] > w",
		]
		for (const answer of answers) {
			const defs = expand(parseProcessText(answer).diagram)
			const findings = lintDiagram(defs, { bpmnlint: recommended }).diagnostics.filter(
				(d) => d.category === "flow" || d.category === "naming" || d.category === "feel",
			)
			expect(
				findings.filter((d) => d.severity !== "info").map((d) => `${d.id}: ${d.message}`),
				answer,
			).toEqual([])
		}
	})

	it("reads a path wrapped onto the next line after its arrow (glm, edit 10)", () => {
		const text = [
			"s[start Go] > a[user Fix issue] >",
			"",
			"r[xor Reproducible?]",
			"r >(Yes: default) e[end Done]",
			"r >(No: reproduced = false)",
			"a",
		].join("\n")
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([])
		expect(flows(text).map((f) => `${f.from}>${f.to}`)).toEqual(
			expect.arrayContaining(["a>r", "r>e", "r>a_join"]),
		)
	})

	it("reads a last line that ends in an arrow without it", () => {
		const { problems } = parseProcessText("s[start Go] > a[task A] > e[end Done] >")
		expect(problems).toEqual([
			{ line: 1, message: 'the line ends with ">" and nothing follows; read without it' },
		])
		expect(elements("s[start Go] > a[task A] > e[end Done] >").map((e) => e.id)).toEqual([
			"s",
			"a",
			"e",
		])
	})

	it("ignores a note after the last node of a line (glm, edit 10)", () => {
		const text =
			"s[start Go] > r[xor Reproducible?]      (ADDED)\nr >(Yes: ok) e[end Done]\nr >(No) x[end Dropped]"
		const { problems } = parseProcessText(text)
		expect(problems).toEqual([{ line: 1, message: 'ignored the note "(ADDED)"' }])
		expect(elements(text).find((e) => e.id === "r")?.type).toBe("exclusiveGateway")
	})

	it("reads a second bar in the attributes as a separator (glm, edit 02)", () => {
		const text =
			"s[start Go] > pay[service Pay] > e[end Done]\nt[boundary:timer Late | on=pay | nonint] > l[end Late]"
		expect(parseProcessText(text).problems).toEqual([])
		expect(elements(text).find((e) => e.id === "t")).toMatchObject({
			attachedTo: "pay",
			interrupting: false,
		})
	})

	it("makes a gateway kind used as an id, never declared, that gateway (glm, edit 05)", () => {
		const text =
			"s[start Go] > pick[user Pick] > and\nand > pack[user Pack] > dispatch[user Dispatch]\nand > label[service Label] > dispatch\ndispatch > e[end Done]"
		const and = elements(text).find((e) => e.id === "and")
		expect(and?.type).toBe("parallelGateway")
		expect(and?.name).toBeUndefined()
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

describe("parseProcessText questions", () => {
	const questions = (text: string) => parseProcessText(text).questions

	it("asks nothing about the guide's own example", () => {
		expect(questions(EXAMPLE)).toEqual([])
	})

	it("asks what decides a branch whose condition it made up", () => {
		const [q, ...rest] = questions(
			"s[start Go] > ok[xor Status approved?]\nok >(Yes: it is fine) a[task Ship]\nok >(No) b[task Cancel]",
		)
		expect(rest).toEqual([])
		expect(q).toEqual({
			elementId: "ok",
			text: '"Status approved?" decides on "statusApproved", a variable the diagram made up. What data decides it?',
			options: [],
			draft: 'At "Status approved?", decide on ',
		})
	})

	it("asks about a default it had to pick, offering the other branches", () => {
		const [q] = questions(
			's[start Go] > c[xor Channel?]\nc >(Mail: channel = "mail") m[task Send letter]\nc >(Phone: channel = "phone") p[task Call]',
		)
		expect(q?.text).toBe(
			'When no condition at "Channel?" holds, it takes "Phone". Is that the right fallback?',
		)
		expect(q?.options).toEqual([
			{ label: "Mail", change: 'At "Channel?", make "Mail" the default branch.' },
		])
	})

	it("does not ask about a default that reads as otherwise", () => {
		expect(
			questions("s[start Go] > c[xor Big?]\nc >(Yes: amount > 5) a[task A]\nc >(No) b[task B]"),
		).toEqual([])
	})

	it("asks whether branches it split in parallel are meant to run together", () => {
		const [q] = questions(
			"s[start Go] > a[task Pack]\na > b[task Print label]\na > c[task Invoice]",
		)
		expect(q?.text).toBe(
			'After "Pack", "Print label" and "Invoice" run at the same time. Is that right?',
		)
		expect(q?.options.map((o) => o.label)).toEqual(["Only one of them", "One after the other"])
		expect(q?.options[0]?.change).toBe(
			'After "Pack", only one of "Print label" and "Invoice" happens: decide which with an xor gateway.',
		)
	})

	it("asks what happens otherwise at a question answered one way only", () => {
		const [q] = questions("s[start Go] > ok[xor In stock?] > ship[task Ship] > e[end Done]")
		expect(q).toMatchObject({
			elementId: "ok",
			text: '"In stock?" had only one way to go, so it was removed. What happens otherwise?',
			draft: 'At "In stock?", otherwise ',
		})
	})

	it("asks where a task it left out belongs", () => {
		const [q] = questions(
			"s[start Go] > a[task A] > e[end Done]\nt[catch:timer Wait] > x[task Remind]",
		)
		expect(q).toMatchObject({ elementId: "x", draft: 'Put "Remind" after ' })
	})

	it("asks when a loop it had to end should end", () => {
		const q = questions("s[start Go] > a[task Try] > r[xor Retry?]\nr >(Yes) a").find(
			(x) => x.elementId === "r",
		)
		expect(q?.draft).toBe('Leave the loop at "Retry?" when ')
	})

	it("asks what an event written without a trigger waits for", () => {
		const [q] = questions("s[start Go] > w[catch Payment in] > e[end Done]")
		expect(q?.options.map((o) => o.label)).toEqual(["A timer", "A signal", "Nothing"])
		expect(q?.options[0]?.change).toBe('"Payment in" waits for a timer, not a message.')
	})

	it("asks the same at the end of a stream", () => {
		const stream = createProcessTextStream()
		stream.push("s[start Go] > a[task Pack]\na > b[task Print]\na > c[task Bill]\n")
		expect(stream.end().questions).toHaveLength(1)
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
