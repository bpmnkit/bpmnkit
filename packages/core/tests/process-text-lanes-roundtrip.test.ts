import { readFileSync, readdirSync } from "node:fs"
import { join } from "node:path"
import { describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnProcess } from "../src/bpmn/bpmn-model.js"
import { Bpmn } from "../src/bpmn/index.js"
import { PROCESS_DELTA_GUIDE, parseProcessDelta } from "../src/bpmn/process-delta.js"
import { writableName, writeProcessText } from "../src/bpmn/process-text-writer.js"
import {
	LANE_LINE,
	MESSAGE_LINE,
	POOL_LINE,
	PROCESS_TEXT_GUIDE,
	parseProcessText,
} from "../src/bpmn/process-text.js"
import { leafLanes, primaryProcess } from "../src/bpmn/swimlanes.js"

/**
 * Integration of the two halves of lane and pool support: what writeProcessText
 * writes for a real diagram must read back through parseProcessDelta (and
 * parseProcessText) as the same lanes, pools and messages. The expected values
 * are derived from the definitions, not from the writer, so a writer that drops
 * or misplaces a line fails here even when its own unit tests pass.
 */

const ROUNDTRIP = join(import.meta.dirname, "fixtures/roundtrip")
const fixtures = readdirSync(ROUNDTRIP).filter((file) => file.endsWith(".bpmn"))
const load = (file: string) => Bpmn.parse(readFileSync(join(ROUNDTRIP, file), "utf8"))

function hasSwimlanes(defs: BpmnDefinitions): boolean {
	return defs.collaborations.length > 0 || defs.processes.some((p) => p.laneSet !== undefined)
}

const laned = fixtures.filter((file) => hasSwimlanes(load(file)))
const laneFree = fixtures.filter((file) => !hasSwimlanes(load(file)))

/** The top-level flow nodes of `source` that the text names (the writer aliases them). */
function writtenNodes(source: BpmnProcess, aliases: Record<string, string>): Set<string> {
	const topLevel = new Set(source.flowElements.map((el) => el.id))
	return new Set(Object.values(aliases).filter((id) => topLevel.has(id)))
}

/** Leaf lane id to its written members, in ref order; a node two leaves list goes to the first. */
function expectedLanes(source: BpmnProcess, nodes: Set<string>) {
	const placed = new Set<string>()
	return leafLanes(source.laneSet).map((lane) => {
		const members = [...new Set(lane.flowNodeRefs)].filter((id) => nodes.has(id) && !placed.has(id))
		for (const id of members) placed.add(id)
		return { id: lane.id, name: lane.name ? writableName(lane.name) : undefined, nodes: members }
	})
}

/** The message flows the writer is specified to write: one top-level node end, one other-pool end. */
function expectedMessages(defs: BpmnDefinitions, source: BpmnProcess, nodes: Set<string>) {
	const collaboration = defs.collaborations[0]
	const pools = new Set(
		(collaboration?.participants ?? []).filter((p) => p.processRef !== source.id).map((p) => p.id),
	)
	return (collaboration?.messageFlows ?? [])
		.filter(
			(f) =>
				(nodes.has(f.sourceRef) && pools.has(f.targetRef)) ||
				(pools.has(f.sourceRef) && nodes.has(f.targetRef)),
		)
		.map((f) => {
			const name = (f.name ?? "").replace(/[()]/g, " ").replace(/\s+/g, " ").trim()
			return { from: f.sourceRef, to: f.targetRef, ...(name ? { name } : {}) }
		})
}

const SWIMLANE_PROBLEM = /\b(lane|pool|msg|message)\b/i

describe("process text lanes and pools — writer to change-script parser", () => {
	it("finds fixtures with lanes or a collaboration, and fixtures without", () => {
		expect(laned).toContain("08-flowable-lanes-pools.bpmn")
		expect(laned).toContain("02-collaboration.bpmn")
		expect(laneFree.length).toBeGreaterThan(0)
	})

	it("the corpus writes lane, pool and msg lines, so the checks below are not vacuous", () => {
		const deltas = laned.map((file) => parseProcessDelta(writeProcessText(load(file)).text))
		expect(deltas.some((d) => d.lanes.length > 0)).toBe(true)
		expect(deltas.some((d) => d.pools.length > 0)).toBe(true)
		expect(deltas.some((d) => d.messageFlows.length > 0)).toBe(true)
	})

	describe.each(laned)("%s", (file) => {
		const defs = load(file)
		const source = primaryProcess(defs)
		const { text, aliases } = writeProcessText(defs)
		const delta = parseProcessDelta(text)
		const real = (written: string) => aliases[written] ?? `<unaliased ${written}>`
		const nodes = source ? writtenNodes(source, aliases) : new Set<string>()

		it("parses as a change script with no problems", () => {
			expect(delta.problems).toEqual([])
		})

		it("lane lines carry exactly the leaf-lane membership of the written process", () => {
			if (!source) throw new Error("no primary process")
			const read = delta.lanes.map((lane) => ({
				id: real(lane.id),
				name: lane.name,
				nodes: lane.nodes.map(real),
			}))
			expect(read).toEqual(expectedLanes(source, nodes))
		})

		it("pool lines are the other participants of the first collaboration", () => {
			if (!source) throw new Error("no primary process")
			const others = (defs.collaborations[0]?.participants ?? []).filter(
				(p) => p.processRef !== source.id,
			)
			expect(delta.pools.map((pool) => ({ id: real(pool.id), name: pool.name }))).toEqual(
				others.map((p) => ({ id: p.id, name: p.name ? writableName(p.name) : undefined })),
			)
		})

		it("msg lines are the node-to-pool and pool-to-node message flows", () => {
			if (!source) throw new Error("no primary process")
			const read = delta.messageFlows.map(({ from, to, name }) => ({
				from: real(from),
				to: real(to),
				...(name ? { name } : {}),
			}))
			expect(read).toEqual(expectedMessages(defs, source, nodes))
		})

		it("parses as process text with no lane, pool or message problem", () => {
			const problems = parseProcessText(text).problems.filter((p) =>
				SWIMLANE_PROBLEM.test(p.message),
			)
			expect(problems).toEqual([])
		})
	})

	// Defect: the writer writes every leaf lane, so an unnamed lane that holds no
	// written node becomes a bare `lane lane:`, which parseProcessDelta reads as
	// prose and reports ("names nothing to change; ignored"). Modelers leave such
	// empty lanes behind. Fix in the writer (skip the line, or write the lane under
	// a name) and drop `.fails`.
	it("an unnamed, empty leaf lane writes a line the change-script parser accepts", () => {
		const defs = load("02-collaboration.bpmn")
		const source = primaryProcess(defs)
		source?.laneSet?.lanes.push({ id: "Lane_empty", flowNodeRefs: [], unknownAttributes: {} })
		expect(parseProcessDelta(writeProcessText(defs).text).problems).toEqual([])
	})

	it.each(laneFree)("%s has no lane, pool or msg line", (file) => {
		const { text } = writeProcessText(load(file))
		const swimlane = text.split("\n").filter((line) => /^(lane|pool|msg)\s/i.test(line))
		expect(swimlane).toEqual([])
	})
})

/** The lane, pool and msg examples a guide gives, as fragments of its text. */
function swimlaneExamples(guide: string): string[] {
	const shapes = [
		/\blane [a-z_]+(?:\[[^\]]*\])?: [a-z_]+(?:, [a-z_]+)*/g,
		/\bpool [a-z_]+\[[^\]]*\]/g,
		/\bmsg [a-z_]+ >(?:\([^)]*\))? [a-z_]+/g,
	]
	return shapes.flatMap((shape) => guide.match(shape) ?? [])
}

describe("PROCESS_TEXT_GUIDE and PROCESS_DELTA_GUIDE agree on lanes, pools and messages", () => {
	const textExamples = swimlaneExamples(PROCESS_TEXT_GUIDE)
	const deltaExamples = swimlaneExamples(PROCESS_DELTA_GUIDE)
	const keywords = (examples: string[]) => new Set(examples.map((e) => e.split(" ")[0]))

	it("both teach the same keywords", () => {
		expect(keywords(textExamples)).toEqual(new Set(["lane", "pool", "msg"]))
		expect(keywords(deltaExamples)).toEqual(keywords(textExamples))
	})

	it("every example of either guide has the shape of the shared line patterns", () => {
		const shapeOf = (line: string) =>
			[LANE_LINE, POOL_LINE, MESSAGE_LINE].filter((pattern) => pattern.test(line)).length
		for (const example of [...textExamples, ...deltaExamples]) {
			expect(shapeOf(example), example).toBe(1)
		}
	})

	it("every example of either guide reads as a change script without problems", () => {
		for (const example of [...textExamples, ...deltaExamples]) {
			const delta = parseProcessDelta(example)
			expect(delta.problems, example).toEqual([])
			expect(delta.lanes.length + delta.pools.length + delta.messageFlows.length, example).toBe(1)
		}
	})

	it("the text guide's examples, on a process that has their ids, read without problems", () => {
		const text = [
			"start[start Order] > a[task A] > b[task B] > pay[send Pay] > paid[catch:message Paid] > done[end Done]",
			...textExamples,
			// Every node in one lane, as the guide's rule asks.
			"lane ops[Operations]: start, pay, paid, done",
		].join("\n")
		const result = parseProcessText(text)
		expect(result.problems).toEqual([])
		expect(result.diagram.processes[0]?.lanes?.map((lane) => lane.id)).toEqual(["sales", "ops"])
		expect(result.diagram.participants?.map((p) => p.id)).toContain("bank")
		expect(result.diagram.messageFlows).toHaveLength(2)
	})
})
