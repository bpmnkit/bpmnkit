import type { BpmnDefinitions, BpmnDiEdge, BpmnDiShape } from "./bpmn-model.js"
import { type BpmnDiffPlaneSummary, diffDiagram } from "./diagram-diff.js"
import { type JsonValue, diffSemantics, projectSemantics, semanticHash } from "./semantic-hash.js"

/** How an element differs; same vocabulary as {@link BpmnDiffCategory}. */
export type BpmnChangeKind = "added" | "removed" | "changed" | "moved"

/**
 * One property that differs inside a changed element.
 *
 * `path` is a JSON-pointer-like route into the element's projection, with `/`
 * and `~` escaped as `~1` / `~0`. Extension elements read as
 * `extensionElements/zeebe:taskDefinition/@type`; list entries are keyed by `id`
 * or `name` when they carry one, and by position otherwise. A side that does
 * not have the property is omitted.
 */
export interface BpmnFieldChange {
	readonly path: string
	readonly before?: JsonValue
	readonly after?: JsonValue
}

/** Where an element is drawn, rounded to two decimals. A shape has a box, an edge a route. */
export interface BpmnGeometry {
	readonly x?: number
	readonly y?: number
	readonly width?: number
	readonly height?: number
	readonly waypoints?: ReadonlyArray<{ readonly x: number; readonly y: number }>
}

export interface BpmnElementChange {
	readonly id: string
	readonly kind: BpmnChangeKind
	/** `type` of the element, or the singular of the list it sits in (`participant`, `sequenceFlow`, …). */
	readonly elementType?: string
	readonly nameBefore?: string
	readonly nameAfter?: string
	/** Only for `changed`; empty otherwise. */
	readonly fields: readonly BpmnFieldChange[]
	readonly geometryBefore?: BpmnGeometry
	readonly geometryAfter?: BpmnGeometry
}

export interface BpmnDiffSummary {
	readonly added: number
	readonly removed: number
	readonly changed: number
	readonly moved: number
	readonly total: number
}

/**
 * A full diff of two models: every semantic change with its field-level detail,
 * layout-only moves, and the per-plane counts of what a canvas can show.
 *
 * `changes` lists every semantic difference, including elements with nothing to
 * draw (a process attribute, a message definition); `planes` counts only the
 * drawable ones, exactly as {@link diffDiagram} does. `beforeHash === afterHash`
 * means the models are semantically identical.
 */
export interface BpmnDiff {
	readonly changes: readonly BpmnElementChange[]
	readonly planes: readonly BpmnDiffPlaneSummary[]
	readonly summary: BpmnDiffSummary
	readonly beforeHash: string
	readonly afterHash: string
}

const KIND_ORDER: Record<BpmnChangeKind, number> = { added: 0, removed: 1, changed: 2, moved: 3 }

function isRecord(value: unknown): value is Record<string, JsonValue> {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

// UTF-16 code-unit order, which the Rust twin reproduces, so both sort alike.
const compare = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

const escapeSegment = (s: string): string => s.replaceAll("~", "~0").replaceAll("/", "~1")

function singular(key: string): string {
	if (key.endsWith("ies")) return `${key.slice(0, -3)}y`
	if (key.endsWith("ses")) return key.slice(0, -2)
	return key.endsWith("s") ? key.slice(0, -1) : key
}

/** Same walk as the semantic index, so every indexed id gets a type. */
function collectTypes(value: JsonValue, key: string, into: Map<string, string>): void {
	if (Array.isArray(value)) {
		for (const entry of value) collectTypes(entry, key, into)
		return
	}
	if (!isRecord(value)) return
	if (typeof value.id === "string") {
		into.set(value.id, typeof value.type === "string" ? value.type : singular(key))
	}
	for (const [k, entry] of Object.entries(value)) collectTypes(entry, k, into)
}

function itemKey(item: JsonValue): string | undefined {
	if (typeof item === "string") return item
	if (isRecord(item)) {
		if (typeof item.id === "string") return item.id
		if (typeof item.name === "string") return item.name
	}
	return undefined
}

/** Keys for matching two lists entry by entry, or `undefined` when they are not unique. */
function listKeys(left: JsonValue[], right: JsonValue[]): [string[], string[]] | undefined {
	const keysOf = (list: JsonValue[]): string[] | undefined => {
		const keys = list.map(itemKey)
		if (keys.some((k) => k === undefined)) return undefined
		return new Set(keys).size === keys.length ? (keys as string[]) : undefined
	}
	const l = keysOf(left)
	const r = keysOf(right)
	return l !== undefined && r !== undefined ? [l, r] : undefined
}

// Empty `attributes` / `children` are dropped by the projection, so either one marks an XML node.
const isXmlElement = (v: JsonValue): boolean =>
	isRecord(v) && typeof v.name === "string" && (isRecord(v.attributes) || Array.isArray(v.children))

function jsonChanges(
	before: JsonValue | undefined,
	after: JsonValue | undefined,
	path: string,
	out: BpmnFieldChange[],
): void {
	if (before === undefined || after === undefined) {
		if (before !== after) out.push(change(path, before, after))
		return
	}
	if (isRecord(before) && isRecord(after)) {
		const xml = isXmlElement(before) || isXmlElement(after)
		const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort(compare)
		for (const key of keys) {
			const l = before[key]
			const r = after[key]
			if (xml && key === "attributes") {
				// An attribute reads as `@name`, the way XPath writes it.
				const lo = (l ?? {}) as Record<string, JsonValue>
				const ro = (r ?? {}) as Record<string, JsonValue>
				for (const n of [...new Set([...Object.keys(lo), ...Object.keys(ro)])].sort(compare)) {
					jsonChanges(lo[n], ro[n], join(path, `@${n}`), out)
				}
			} else {
				// `children` is the XML tree's own nesting, not a name worth a path segment.
				jsonChanges(l, r, xml && key === "children" ? path : join(path, key), out)
			}
		}
		return
	}
	if (Array.isArray(before) && Array.isArray(after)) {
		const keyed = listKeys(before, after)
		if (keyed !== undefined) {
			const [lk, rk] = keyed
			const l = new Map(lk.map((k, i) => [k, before[i] as JsonValue]))
			const r = new Map(rk.map((k, i) => [k, after[i] as JsonValue]))
			for (const k of [...new Set([...lk, ...rk])].sort(compare)) {
				jsonChanges(l.get(k), r.get(k), join(path, k), out)
			}
			return
		}
		const n = Math.max(before.length, after.length)
		for (let i = 0; i < n; i++) jsonChanges(before[i], after[i], join(path, `[${i}]`), out)
		return
	}
	if (JSON.stringify(before) !== JSON.stringify(after)) out.push(change(path, before, after))
}

function change(
	path: string,
	before: JsonValue | undefined,
	after: JsonValue | undefined,
): BpmnFieldChange {
	return {
		path,
		...(before !== undefined ? { before } : {}),
		...(after !== undefined ? { after } : {}),
	}
}

function join(path: string, segment: string): string {
	const s = escapeSegment(segment)
	return path === "" ? s : `${path}/${s}`
}

const round = (v: number): number => Math.round(v * 100) / 100

function geometryOf(definitions: BpmnDefinitions): Map<string, BpmnGeometry> {
	const index = new Map<string, BpmnGeometry>()
	for (const diagram of definitions.diagrams) {
		for (const shape of diagram.plane.shapes as BpmnDiShape[]) {
			const { x, y, width, height } = shape.bounds
			index.set(shape.bpmnElement, {
				x: round(x),
				y: round(y),
				width: round(width),
				height: round(height),
			})
		}
		for (const edge of diagram.plane.edges as BpmnDiEdge[]) {
			index.set(edge.bpmnElement, {
				waypoints: edge.waypoints.map((p) => ({ x: round(p.x), y: round(p.y) })),
			})
		}
	}
	return index
}

/**
 * Diffs two models: what changed, field by field, what only moved, and a hash
 * of each side.
 *
 * Composes {@link diffSemantics} (the model half) and {@link diffDiagram} (the
 * layout half). The Rust crate `bpmnkit-diff` produces the same result; both
 * are held to `conformance/diff/`.
 *
 * @param before - The earlier model.
 * @param after - The later model.
 */
export function diffBpmn(before: BpmnDefinitions, after: BpmnDefinitions): BpmnDiff {
	const left = projectSemantics(before)
	const right = projectSemantics(after)
	const semantic = diffSemantics(before, after)
	const diagram = diffDiagram(before, after)

	const types = new Map<string, string>()
	collectTypes(left.value, "definitions", types)
	collectTypes(right.value, "definitions", types)
	const nameOf = (v: JsonValue | undefined): string | undefined =>
		isRecord(v) && typeof v.name === "string" ? v.name : undefined
	const geoBefore = geometryOf(before)
	const geoAfter = geometryOf(after)

	const make = (
		id: string,
		kind: BpmnChangeKind,
		b: JsonValue | undefined,
		a: JsonValue | undefined,
	): BpmnElementChange => {
		const fields: BpmnFieldChange[] = []
		if (kind === "changed") jsonChanges(b, a, "", fields)
		const elementType = types.get(id)
		const nameBefore = nameOf(b)
		const nameAfter = nameOf(a)
		const gb = geoBefore.get(id)
		const ga = geoAfter.get(id)
		return {
			id,
			kind,
			...(elementType !== undefined ? { elementType } : {}),
			...(nameBefore !== undefined ? { nameBefore } : {}),
			...(nameAfter !== undefined ? { nameAfter } : {}),
			fields,
			...(gb !== undefined ? { geometryBefore: gb } : {}),
			...(ga !== undefined ? { geometryAfter: ga } : {}),
		}
	}

	const changes: BpmnElementChange[] = [
		...semantic.added.map((id) => make(id, "added", undefined, right.elements.get(id))),
		...semantic.removed.map((id) => make(id, "removed", left.elements.get(id), undefined)),
		// A parent whose child list was merely reordered by the canonical sort differs in
		// `diffSemantics` but in no field; there is nothing to show for it.
		...semantic.changed
			.map((c) => make(c.id, "changed", c.before, c.after))
			.filter((c) => c.fields.length > 0),
		...diagram.moved.map((id) => make(id, "moved", left.elements.get(id), right.elements.get(id))),
	].sort((a, b) => KIND_ORDER[a.kind] - KIND_ORDER[b.kind] || compare(a.id, b.id))

	const count = (kind: BpmnChangeKind): number => changes.filter((c) => c.kind === kind).length
	return {
		changes,
		planes: diagram.planes,
		summary: {
			added: count("added"),
			removed: count("removed"),
			changed: count("changed"),
			moved: count("moved"),
			total: changes.length,
		},
		beforeHash: semanticHash(before),
		afterHash: semanticHash(after),
	}
}
