import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { type CompactProcess, compactify, expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import { parseProcessDelta } from "../src/bpmn/process-delta.js"
import { writableName, writeProcessText } from "../src/bpmn/process-text-writer.js"
import { PROCESS_TEXT_GUIDE, parseProcessText } from "../src/bpmn/process-text.js"
import { leafLanes, primaryProcess } from "../src/bpmn/swimlanes.js"

const EXAMPLE = PROCESS_TEXT_GUIDE.slice(
	PROCESS_TEXT_GUIDE.indexOf("Example:\n") + "Example:\n".length,
)

const ROUNDTRIP = join(__dirname, "fixtures", "roundtrip")
const FIXTURES = readdirSync(ROUNDTRIP).filter((f) => f.endsWith(".bpmn"))

/** The definitions a line-format text describes, as a shared drop would hold them. */
function definitionsOf(text: string) {
	return Bpmn.parse(Bpmn.export(expand(parseProcessText(text).diagram)))
}

/** What a process says, by id: enough to tell two readings of it apart. */
function facts(process: CompactProcess | undefined) {
	return {
		elements: (process?.elements ?? [])
			.map((e) => [e.id, e.type, e.name, e.eventType, e.attachedTo, e.jobType].join("|"))
			.sort(),
		flows: (process?.flows ?? [])
			.map((f) => [f.from, f.to, f.name, f.condition, f.isDefault].join("|"))
			.sort(),
	}
}

describe("writeProcessText", () => {
	it("writes a diagram the parser reads back as the same diagram", () => {
		const defs = definitionsOf(EXAMPLE)
		const { text, aliases } = writeProcessText(defs)
		// The ids are short and readable already, so every alias is the id itself.
		for (const [alias, id] of Object.entries(aliases)) expect(alias).toBe(id)
		const read = parseProcessText(text)
		expect(read.problems).toEqual([])
		expect(read.fixes).toEqual([])
		expect(facts(read.diagram.processes[0])).toEqual(facts(compactify(defs).processes[0]))
		expect(writeProcessText(definitionsOf(text)).text).toBe(text)
	})

	it("keeps every element, condition and default of the guide's example", () => {
		const { text } = writeProcessText(definitionsOf(EXAMPLE))
		const read = parseProcessText(text).diagram.processes[0]
		const source = parseProcessText(EXAMPLE).diagram.processes[0]
		expect(read?.elements.map((e) => e.id).sort()).toEqual(source?.elements.map((e) => e.id).sort())
		expect(read?.flows.find((f) => f.to === "review")).toMatchObject({
			name: "Yes",
			condition: "= amount > 1000",
		})
		expect(read?.flows.find((f) => f.to === "auto")).toMatchObject({ name: "No", isDefault: true })
		expect(read?.elements.find((e) => e.id === "failed")).toMatchObject({
			type: "boundaryEvent",
			eventType: "error",
			attachedTo: "pay",
		})
	})

	it("writes a Modeler id under a name-derived alias and maps it back", () => {
		const defs = definitionsOf(
			"s[start Go] > t[user Review the loan application now] > e[end Done]",
		)
		const process = defs.processes[0]
		const task = process?.flowElements.find((el) => el.id === "t")
		if (!task) throw new Error("fixture has no task")
		task.id = "Activity_0x9k2lm"
		for (const flow of process?.sequenceFlows ?? []) {
			if (flow.sourceRef === "t") flow.sourceRef = task.id
			if (flow.targetRef === "t") flow.targetRef = task.id
		}
		const { text, aliases } = writeProcessText(defs)
		expect(text).toContain("review_the_loan_application[user Review the loan application now]")
		expect(aliases.review_the_loan_application).toBe("Activity_0x9k2lm")
		expect(text).not.toContain("Activity_0x9k2lm")
	})

	it("writes names so the brackets and bars of the format cannot end them early", () => {
		expect(writableName("Check [draft] | send\nnow")).toBe("Check (draft) / send now")
	})

	it("writes a sub-process as a fixed kind and an unreachable node on its own line", () => {
		const xml = readFileSync(join(ROUNDTRIP, "06-events-and-containers.bpmn"), "utf8")
		const { text } = writeProcessText(Bpmn.parse(xml))
		expect(text).toContain("[sub Do the work]")
		expect(text.split("\n")).toContain("on_signal[sub On signal]")
	})

	it("returns nothing for a document without a process", () => {
		const defs = definitionsOf(EXAMPLE)
		expect(writeProcessText({ ...defs, processes: [] })).toEqual({ text: "", aliases: {} })
	})

	describe.each(FIXTURES)("%s", (file) => {
		const defs = Bpmn.parse(readFileSync(join(ROUNDTRIP, file), "utf8"))
		const { text, aliases } = writeProcessText(defs)
		const process = primaryProcess(defs)
		// Lane and pool aliases are not nodes: only flow-element ids count here.
		const nodeIds = new Set(
			(process?.flowElements ?? []).flatMap(function ids(el): string[] {
				return [el.id, ...("flowElements" in el ? el.flowElements.flatMap(ids) : [])]
			}),
		)
		const written = new Set(Object.values(aliases).filter((id) => nodeIds.has(id)))

		it("writes each flow between written nodes exactly once", () => {
			const between = (process?.sequenceFlows ?? []).filter(
				(f) => written.has(f.sourceRef) && written.has(f.targetRef),
			)
			const delta = parseProcessDelta(text)
			expect(delta.flows).toHaveLength(between.length)
			const byAlias = (alias: string) => aliases[alias]
			expect(delta.flows.map((f) => `${byAlias(f.from)}>${byAlias(f.to)}`).sort()).toEqual(
				between.map((f) => `${f.sourceRef}>${f.targetRef}`).sort(),
			)
		})

		it("declares each written node once, and reads as a change script", () => {
			const delta = parseProcessDelta(text)
			expect(delta.problems).toEqual([])
			expect(delta.nodes.map((n) => aliases[n.id]).sort()).toEqual([...written].sort())
		})
	})
})

describe("forms, mappings and platform version", () => {
	const roundTrip = (text: string) =>
		writeProcessText(Bpmn.parse(Bpmn.export(expand(parseProcessText(text).diagram)))).text

	it("writes form= and in. back as they were read", () => {
		const text =
			"start[start Task received | form=ai-agent-chat-initial-request] > fb[user User Feedback | form=ai-agent-chat-user-feedback in.responseText=agent.responseText] > e[end Done]"
		expect(roundTrip(text)).toBe(text)
	})

	it("writes out. and a mapping value with spaces and =, before result and feel", () => {
		const text =
			'start[start A] > t[service T | job=work in.x=if a = 1 then "y" else "z" out.ok=resp.ok] > e[end E]'
		expect(roundTrip(text)).toBe(text)
		const scripted = "start[start A] > s[script S | in.l=items result=n feel=count(l)] > e[end E]"
		expect(roundTrip(scripted)).toBe(scripted)
	})

	it("writes the platform version in the header", () => {
		const text = "# Chat | camunda=8.10\nstart[start A] > e[end E]"
		expect(roundTrip(text)).toBe(text)
	})

	it("writes no header version for a diagram without one", () => {
		const text = "# Chat\nstart[start A] > e[end E]"
		expect(roundTrip(text)).toBe(text)
	})
})

describe("writeProcessText — ad-hoc sub-processes and notes", () => {
	const TEXT = `# Agent | camunda=8.10
start[start Go] > run[xor Run agent] > agent[adhoc AI Agent] > done[xor Satisfied?]
done >(Yes: ok) fin[end Done]
done >(No: default) run
users[service Find sample users | inside=agent]
joke[service Get a safe joke | inside=agent]
note start: Triggered by a user
note agent: The agent picks a tool
note joke: Each tool is a capability`

	it("writes the container, its tools and the notes, and reads them back as the same diagram", () => {
		const defs = definitionsOf(TEXT)
		const { text, aliases } = writeProcessText(defs)
		expect(text).toContain("agent[adhoc AI Agent]")
		expect(text).toContain("users[service Find sample users | inside=agent")
		expect(text).toContain("note agent: The agent picks a tool")
		expect(aliases.users).toBe("users")
		const read = parseProcessText(text)
		expect(read.problems).toEqual([])
		const original = parseProcessText(TEXT)
		expect(read.diagram.processes[0]).toEqual(original.diagram.processes[0])
	})

	it("writes a note on one line, whatever the annotation's own text", () => {
		const defs = definitionsOf("s[start S] > e[end E]\nnote s: one")
		const annotation = defs.processes[0]?.textAnnotations[0]
		if (annotation) annotation.text = "first line\n  second   line"
		const { text } = writeProcessText(defs)
		expect(text).toContain("note s: first line second line")
		expect(parseProcessText(text).problems).toEqual([])
	})

	it("writes nothing for an annotation tied to no element", () => {
		const defs = definitionsOf("s[start S] > e[end E]\nnote s: one")
		if (defs.processes[0]) defs.processes[0].associations = []
		expect(writeProcessText(defs).text).not.toContain("note")
	})

	it("writes the same text for a diagram with neither", () => {
		const { text } = writeProcessText(definitionsOf(EXAMPLE))
		expect(text).not.toContain("note ")
		expect(text).not.toContain("inside=")
	})

	it("writes a change script's text a delta can restate quietly", () => {
		const { text } = writeProcessText(definitionsOf(TEXT))
		const delta = parseProcessDelta(text)
		expect(delta.problems).toEqual([])
		expect(delta.notes.map((n) => n.id)).toEqual(["start", "agent", "joke"])
	})
})

describe("writeProcessText — lanes, pools and messages", () => {
	const fixture = (file: string) => Bpmn.parse(readFileSync(join(ROUNDTRIP, file), "utf8"))
	const lines = (text: string) => text.split("\n")
	const keyed = (text: string) => lines(text).filter((l) => /^(lane|pool|msg) /.test(l))

	it("writes the leaf lanes, the partner pool and its message for a Flowable file", () => {
		const { text, aliases } = writeProcessText(fixture("08-flowable-lanes-pools.bpmn"))
		expect(keyed(text)).toEqual([
			"lane inside_sales[Inside sales]: start, review",
			"lane sales_desk[Sales desk]: decide",
			"lane operations[Operations]: ship, rejected, done",
			"pool customer[Customer]",
			"msg ship >(Confirmation) customer",
		])
		expect(aliases).toMatchObject({
			inside_sales: "Lane_inside",
			sales_desk: "Lane_desk",
			operations: "Lane_ops",
			customer: "Participant_customer",
		})
	})

	it("writes no note for an annotation on a lane, which the format has no note for", () => {
		const defs = fixture("08-flowable-lanes-pools.bpmn")
		const process = defs.processes[0]
		process?.textAnnotations.push({ id: "TA_lane", text: "Lane note" })
		process?.associations.push({ id: "A_lane", sourceRef: "Lane_inside", targetRef: "TA_lane" })
		const { text } = writeProcessText(defs)
		expect(text).not.toContain("Lane note")
		expect(parseProcessText(text).problems.filter((p) => /^note /.test(p.message))).toEqual([])
	})

	it("writes no line for an unnamed lane that holds nothing", () => {
		const defs = fixture("02-collaboration.bpmn")
		const process = primaryProcess(defs)
		process?.laneSet?.lanes.push({ id: "Lane_empty", flowNodeRefs: [], unknownAttributes: {} })
		const { text, aliases } = writeProcessText(defs)
		expect(Object.values(aliases)).not.toContain("Lane_empty")
		expect(parseProcessDelta(text).problems).toEqual([])
	})

	it("writes no parent of a nested lane, and no pool for the written process", () => {
		const { text } = writeProcessText(fixture("08-flowable-lanes-pools.bpmn"))
		expect(text).not.toContain("[Sales]")
		expect(text).not.toContain("[Company]")
	})

	it("writes no message that touches the process's own pool", () => {
		const { text, aliases } = writeProcessText(fixture("02-collaboration.bpmn"))
		expect(keyed(text)).toEqual([
			"lane ordering[Ordering]: need_identified, place_order",
			"lane receiving[Receiving]: ordered",
			"pool seller[Seller]",
			"pool carrier[Carrier]",
		])
		expect(aliases).toMatchObject({
			ordering: "Lane_ordering",
			seller: "Participant_seller",
			carrier: "Participant_carrier",
		})
	})

	it("writes no message between two other pools", () => {
		const defs = fixture("08-flowable-lanes-pools.bpmn")
		const collaboration = defs.collaborations[0]
		if (!collaboration) throw new Error("fixture has no collaboration")
		collaboration.participants.push({ id: "Participant_bank", name: "Bank", unknownAttributes: {} })
		collaboration.messageFlows.push({
			id: "MessageFlow_pay",
			name: "Payment",
			sourceRef: "Participant_customer",
			targetRef: "Participant_bank",
			unknownAttributes: {},
		})
		const { text } = writeProcessText(defs)
		expect(lines(text)).toContain("pool bank[Bank]")
		expect(text).not.toContain("Payment")
	})

	it("writes a message label raw, colons kept, without parentheses", () => {
		const defs = fixture("08-flowable-lanes-pools.bpmn")
		const flow = defs.collaborations[0]?.messageFlows[0]
		if (flow) flow.name = "Confirm (by mail): order\nshipped"
		const { text } = writeProcessText(defs)
		expect(lines(text)).toContain("msg ship >(Confirm by mail : order shipped) customer")
		expect(parseProcessText(text).diagram.messageFlows?.[0]?.name).toBe(
			"Confirm by mail : order shipped",
		)
	})

	it.each(["08-flowable-lanes-pools.bpmn", "02-collaboration.bpmn"])(
		"%s reads back as the same leaf lanes, pools and messages",
		(file) => {
			const defs = fixture(file)
			const { text, aliases } = writeProcessText(defs)
			const read = parseProcessText(text)
			// 08's JUEL condition is not FEEL, a problem of its own; only these lines' count here.
			const swimlane = (line: number) => /^(lane|pool|msg) /.test(lines(text)[line - 1] ?? "")
			expect(read.problems.filter((p) => swimlane(p.line))).toEqual([])
			const real = (alias: string) => aliases[alias] ?? alias
			const process = primaryProcess(defs)
			const written = new Set(Object.values(aliases))
			expect(
				(read.diagram.processes[0]?.lanes ?? []).map((lane) => [
					real(lane.id),
					(lane.members ?? []).map(real),
				]),
			).toEqual(
				leafLanes(process?.laneSet).map((lane) => [
					lane.id,
					lane.flowNodeRefs.filter((id) => written.has(id)),
				]),
			)
			const own = defs.collaborations[0]?.participants.find((p) => p.processRef === process?.id)
			expect((read.diagram.participants ?? []).map((p) => [real(p.id), p.name])).toEqual(
				(defs.collaborations[0]?.participants ?? [])
					.filter((p) => p !== own)
					.map((p) => [p.id, p.name]),
			)
			const ends = new Set([
				...written,
				...(read.diagram.participants ?? []).map((p) => real(p.id)),
			])
			expect(
				(read.diagram.messageFlows ?? []).map((f) => [real(f.source), real(f.target), f.name]),
			).toEqual(
				(defs.collaborations[0]?.messageFlows ?? [])
					.filter((f) => ends.has(f.sourceRef) && ends.has(f.targetRef))
					.map((f) => [f.sourceRef, f.targetRef, f.name]),
			)
		},
	)

	it("writes the executable process of a collaboration that lists it second", () => {
		const defs = fixture("02-collaboration.bpmn")
		defs.processes.reverse()
		defs.collaborations[0]?.participants.reverse()
		const buyer = defs.processes.find((p) => p.id === "Process_buyer")
		buyer?.textAnnotations.push({
			id: "Note_1",
			text: "Orders go out daily",
			unknownAttributes: {},
		})
		buyer?.associations.push({
			id: "Assoc_1",
			sourceRef: "Task_place_order",
			targetRef: "Note_1",
			unknownAttributes: {},
		})
		const { text } = writeProcessText(defs, {
			connectorLine: (el) => (el.id === "Task_place_order" ? "acme" : undefined),
		})
		expect(lines(text)[0]).toBe("# Buyer")
		expect(lines(text)).toContain("pool seller[Seller]")
		expect(text).not.toContain("[Buyer]")
		expect(lines(text)).toContain("note place_order: Orders go out daily")
		expect(lines(text)).toContain("with place_order: acme")
	})

	it("keeps node aliases when a lane or pool name would take one", () => {
		const defs = definitionsOf("s[start S] > review[user Review] > e[end E]")
		const process = defs.processes[0]
		if (!process) throw new Error("no process")
		process.laneSet = {
			id: "LaneSet_1",
			lanes: [
				{ id: "Lane_1", name: "Review", flowNodeRefs: ["s", "review", "e"], unknownAttributes: {} },
			],
			unknownAttributes: {},
		}
		const { text, aliases } = writeProcessText(defs)
		expect(lines(text)).toContain("lane review_2[Review]: s, review, e")
		expect(aliases).toMatchObject({ review: "review", review_2: "Lane_1" })
	})
})
