import { describe, expect, it } from "vitest"
import type { BpmnDefinitions, BpmnDiEdge, BpmnDiShape } from "../src/bpmn/bpmn-model.js"
import { Bpmn, applyAutoLayout } from "../src/index.js"

// Regression tests for the new-diagram aesthetics pass (doc/layout-aesthetics.md).

type Node = [id: string, type: string, name?: string, extra?: string]
type Flow = [source: string, target: string, name?: string]

function processXml(id: string, nodes: Node[], flows: Flow[], inner = ""): string {
	const els = nodes
		.map(([nid, type, name, extra]) => {
			const n = name ? ` name="${name}"` : ""
			if (type === "subProcess") return `<subProcess id="${nid}"${n}>${extra ?? ""}</subProcess>`
			return `<${type} id="${nid}"${n}${extra ?? ""}/>`
		})
		.join("")
	const seq = flows
		.map(
			([s, t, name], i) =>
				`<sequenceFlow id="${id}_f${i}" sourceRef="${s}" targetRef="${t}"${name ? ` name="${name}"` : ""}/>`,
		)
		.join("")
	return `<process id="${id}">${els}${seq}${inner}</process>`
}

function layout(body: string): BpmnDefinitions {
	return applyAutoLayout(
		Bpmn.parse(
			`<?xml version="1.0"?><definitions xmlns="http://www.omg.org/spec/BPMN/20100524/MODEL" id="d" targetNamespace="t">${body}</definitions>`,
		),
	)
}

const shape = (defs: BpmnDefinitions, id: string): BpmnDiShape => {
	const s = defs.diagrams[0]?.plane.shapes.find((x) => x.bpmnElement === id)
	if (!s) throw new Error(`no shape ${id}`)
	return s
}
const edges = (defs: BpmnDefinitions): BpmnDiEdge[] => defs.diagrams[0]?.plane.edges ?? []
const cy = (s: BpmnDiShape) => s.bounds.y + s.bounds.height / 2

function cuts(e: BpmnDiEdge, b: { x: number; y: number; width: number; height: number }): boolean {
	return e.waypoints.slice(1).some((q, i) => {
		const p = e.waypoints[i] as { x: number; y: number }
		return (
			Math.max(p.x, q.x) > b.x &&
			Math.min(p.x, q.x) < b.x + b.width &&
			Math.max(p.y, q.y) > b.y &&
			Math.min(p.y, q.y) < b.y + b.height
		)
	})
}

describe("layout aesthetics", () => {
	it("keeps about 60 px between neighbours, wider only for a label that needs it", () => {
		const defs = layout(
			processXml(
				"p",
				[
					["s", "startEvent"],
					["a", "task", "A"],
					["b", "task", "B"],
					["c", "task", "C"],
				],
				[
					["s", "a"],
					["a", "b"],
					["b", "c", "when the manager approved"],
				],
			),
		)
		const gap = (l: string, r: string) =>
			shape(defs, r).bounds.x - shape(defs, l).bounds.x - shape(defs, l).bounds.width
		expect(gap("a", "b")).toBe(60)
		expect(gap("b", "c")).toBeGreaterThanOrEqual("when the manager approved".length * 7 + 20)
	})

	it("runs the outer flow straight through an expanded sub-process's inner spine", () => {
		const inner = processXml(
			"x",
			[
				["is", "startEvent"],
				["it", "task", "Inner"],
				["ie", "endEvent"],
			],
			[
				["is", "it"],
				["it", "ie"],
			],
		)
			.replace(/^<process id="x">/, "")
			.replace(/<\/process>$/, "")
		const defs = layout(
			processXml(
				"p",
				[
					["s", "startEvent"],
					["sub", "subProcess", "Screen", inner],
					["gw", "exclusiveGateway", "Hire?"],
					["yes", "task", "Offer"],
					["no", "task", "Reject"],
				],
				[
					["s", "sub"],
					["sub", "gw"],
					["gw", "yes", "yes"],
					["gw", "no", "no"],
				],
			),
		)
		expect(cy(shape(defs, "is"))).toBe(cy(shape(defs, "s")))
		const into = edges(defs).find((e) => e.bpmnElement === "p_f0")
		expect(into?.waypoints).toHaveLength(2)
		// The branch below the gateway clears the gateway's row, not the tall sub-process.
		const gw = shape(defs, "gw").bounds
		expect(shape(defs, "no").bounds.y - (gw.y + gw.height)).toBeLessThanOrEqual(100)
	})

	it("moves a gateway's label off the branch leaving through its bottom", () => {
		const defs = layout(
			processXml(
				"p",
				[
					["s", "startEvent"],
					["gw", "exclusiveGateway", "In stock?"],
					["a", "task", "Reserve"],
					["b", "task", "Order more"],
				],
				[
					["s", "gw"],
					["gw", "a", "yes"],
					["gw", "b", "no"],
				],
			),
		)
		const label = shape(defs, "gw").label?.bounds
		expect(label).toBeDefined()
		for (const e of edges(defs)) expect(cuts(e, label as NonNullable<typeof label>)).toBe(false)
	})

	it("puts a branch condition right at the gateway's exit", () => {
		const defs = layout(
			processXml(
				"p",
				[
					["s", "startEvent"],
					["gw", "exclusiveGateway"],
					["a", "task", "A"],
					["b", "task", "B"],
					["c", "task", "C"],
					["d", "task", "D"],
				],
				[
					["s", "gw"],
					["gw", "a", "yes"],
					["a", "b"],
					["b", "c"],
					["gw", "d", "no"],
					["d", "c"],
				],
			),
		)
		const gw = shape(defs, "gw").bounds
		const yes = edges(defs).find((e) => e.bpmnElement === "p_f1")?.label?.bounds
		expect(yes).toBeDefined()
		expect((yes?.x ?? 0) - (gw.x + gw.width)).toBeLessThanOrEqual(10)
	})

	it("stacks a participant-less primary process below the pools, not on them", () => {
		const defs = layout(
			`<collaboration id="c"><participant id="pp" name="Pool" processRef="other"/></collaboration>${processXml(
				"main",
				[
					["s", "startEvent"],
					["t", "task", "Main"],
				],
				[["s", "t"]],
			)}${processXml(
				"other",
				[
					["s2", "startEvent"],
					["t2", "task", "Other"],
				],
				[["s2", "t2"]],
			)}`,
		)
		const pool = shape(defs, "pp").bounds
		expect(shape(defs, "t").bounds.y).toBeGreaterThanOrEqual(pool.y + pool.height)
	})
})
