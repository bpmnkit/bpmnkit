/**
 * Form fields for user tasks written without `fields=`: the variables the next
 * decisions read are what the person at that task has to enter. Without this a
 * generated form is a lone "Done" checkbox, which agents then rewrite by hand.
 */
import type { BpmnDefinitions, BpmnFlowElement, BpmnSequenceFlow, XmlElement } from "@bpmnkit/core"

type FieldType = "checkbox" | "number" | "text" | { select: Set<string> }

const COMPARE =
	/(?<![\w.])([A-Za-z_]\w*)\s*(!=|<=|>=|=|<|>)\s*(true|false|-?\d+(?:\.\d+)?|"[^"]*"|[A-Za-z_][\w.]*)/g
const FEEL_WORDS = new Set([
	"true",
	"false",
	"null",
	"not",
	"and",
	"or",
	"in",
	"if",
	"then",
	"else",
])

function* walk(elements: readonly BpmnFlowElement[]): Generator<BpmnFlowElement> {
	for (const el of elements) {
		yield el
		if ("flowElements" in el && Array.isArray(el.flowElements)) yield* walk(el.flowElements)
	}
}

function* walkFlows(elements: readonly BpmnFlowElement[]): Generator<BpmnSequenceFlow> {
	for (const el of elements)
		if ("sequenceFlows" in el && Array.isArray(el.sequenceFlows)) {
			yield* el.sequenceFlows as BpmnSequenceFlow[]
			yield* walkFlows(el.flowElements as BpmnFlowElement[])
		}
}

/** Variables an element sets itself: a worker's or a decision's result is not the user's to enter. */
function written(el: BpmnFlowElement, into: Set<string>): void {
	const visit = (x: XmlElement) => {
		const a = x.attributes
		if (a.resultVariable) into.add(a.resultVariable)
		if (x.name === "zeebe:output" && a.target) into.add(a.target)
		for (const c of x.children) visit(c)
	}
	for (const x of el.extensionElements) visit(x)
}

/** Reads one condition: `approved = true`, `amount > 1000`, `risk = "low"`, `not(urgent)`, `urgent`. */
function read(condition: string, found: Map<string, FieldType>): void {
	const text = condition.trim().replace(/^=\s*/, "")
	let matched = false
	for (const m of text.matchAll(COMPARE)) {
		matched = true
		const [, name = "", , value = ""] = m
		if (FEEL_WORDS.has(name)) continue
		const prev = found.get(name)
		if (value === "true" || value === "false") found.set(name, prev ?? "checkbox")
		else if (/^-?\d/.test(value)) found.set(name, prev ?? "number")
		else if (value.startsWith('"')) {
			const options = typeof prev === "object" ? prev.select : new Set<string>()
			options.add(value.slice(1, -1))
			if (prev === undefined || typeof prev === "object") found.set(name, { select: options })
		} else found.set(name, prev ?? "text")
	}
	if (matched) return
	const bare = /^(?:not\s*\(\s*)?([A-Za-z_]\w*)\s*\)?$/.exec(text)?.[1]
	if (bare !== undefined && !FEEL_WORDS.has(bare)) found.set(bare, found.get(bare) ?? "checkbox")
}

function conditionOf(el: BpmnFlowElement): string | undefined {
	const defs = (el as { eventDefinitions?: { type: string; condition?: string }[] })
		.eventDefinitions
	return defs?.find((d) => d.type === "conditional")?.condition
}

/**
 * Fills `fields` (the `fields=` per user task) for each user task that has
 * none: one field per variable a condition reads on the way to the next user
 * task, typed by what it is compared with. Leaves a task alone when no
 * condition is found; it then keeps the "Done" checkbox. Changes `fields`.
 */
export function deriveFormFields(
	defs: BpmnDefinitions,
	fields: Record<string, string>,
	skip?: ReadonlySet<string>,
): void {
	for (const process of defs.processes) {
		const flows = [...process.sequenceFlows, ...walkFlows(process.flowElements)]
		const nodes = new Map([...walk(process.flowElements)].map((e) => [e.id, e]))
		const outgoing = new Map<string, BpmnSequenceFlow[]>()
		for (const f of flows) outgoing.set(f.sourceRef, [...(outgoing.get(f.sourceRef) ?? []), f])
		const produced = new Set<string>()
		for (const el of nodes.values()) written(el, produced)

		for (const task of nodes.values()) {
			if (task.type !== "userTask" || fields[task.id] !== undefined || skip?.has(task.id)) continue
			const found = new Map<string, FieldType>()
			const seen = new Set<string>([task.id])
			const queue = [...(outgoing.get(task.id) ?? [])]
			for (let f = queue.shift(); f !== undefined; f = queue.shift()) {
				if (f.conditionExpression) read(f.conditionExpression.text, found)
				const next = nodes.get(f.targetRef)
				if (next === undefined || seen.has(next.id) || next.type === "userTask") continue
				seen.add(next.id)
				const condition = conditionOf(next)
				if (condition !== undefined) read(condition, found)
				queue.push(...(outgoing.get(next.id) ?? []))
			}
			const items = [...found]
				.filter(([name]) => !produced.has(name))
				.map(([name, type]) =>
					typeof type === "object"
						? `${name}:select(${[...type.select].join("|")})`
						: type === "text"
							? name
							: `${name}:${type}`,
				)
			if (items.length > 0) fields[task.id] = items.join(",")
		}
	}
}
