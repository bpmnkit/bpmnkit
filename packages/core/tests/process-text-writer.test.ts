import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import { type CompactProcess, compactify, expand } from "../src/bpmn/compact.js"
import { Bpmn } from "../src/bpmn/index.js"
import { parseProcessDelta } from "../src/bpmn/process-delta.js"
import { writableName, writeProcessText } from "../src/bpmn/process-text-writer.js"
import { PROCESS_TEXT_GUIDE, parseProcessText } from "../src/bpmn/process-text.js"

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
		const process = defs.processes[0]
		const written = new Set(Object.values(aliases))

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
