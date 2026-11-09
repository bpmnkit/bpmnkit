import {
	type SvgCtx,
	type SvgExportOptions,
	esc,
	fitSize,
	fontStyle,
	iconStyle,
	labelSvg,
	resolveCtx,
	shapeStyle,
	wrapText,
} from "../bpmn/svg.js"
import { layoutDmn } from "./dmn-layout.js"
import type { DmnDecisionTable, DmnDefinitions, HitPolicy } from "./dmn-model.js"

/** Options shared with `exportSvg`; plane, colour and layout options do not apply to DMN. */
export type DmnSvgOptions = Pick<
	SvgExportOptions,
	"theme" | "padding" | "scale" | "maxSize" | "font" | "elementIds" | "background"
>

export interface DecisionTableSvgOptions extends DmnSvgOptions {
	/** Decision name shown in a title bar above the table. */
	name?: string
}

type DrdKind =
	| "decision"
	| "inputData"
	| "knowledgeSource"
	| "businessKnowledgeModel"
	| "annotation"
type EdgeKind = "information" | "knowledge" | "authority" | "association"

function svgRoot(
	ox: number,
	oy: number,
	vw: number,
	vh: number,
	options: DmnSvgOptions | undefined,
	t: SvgCtx,
	body: string[],
	defs: string[] = [],
): string {
	const { width, height } = fitSize(vw, vh, options)
	return [
		`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ox} ${oy} ${vw} ${vh}" width="${width}" height="${height}">`,
		...(options?.background !== false
			? [`<rect x="${ox}" y="${oy}" width="${vw}" height="${vh}" fill="${t.bg}"/>`]
			: []),
		...(defs.length > 0 ? ["<defs>", ...defs, "</defs>"] : []),
		...body,
		"</svg>",
	].join("\n")
}

function emptySvg(options: DmnSvgOptions | undefined, t: SvgCtx): string {
	const rect = options?.background !== false ? `<rect width="1" height="1" fill="${t.bg}"/>` : ""
	return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1 1" width="1" height="1">${rect}</svg>`
}

// ── DRD ───────────────────────────────────────────────────────────────────────

/**
 * Generates a self-contained SVG of a DMN requirements diagram (DRD): decisions
 * (rectangles), input data (stadiums), knowledge sources (wavy bottom), business
 * knowledge models (clipped corners), and information (solid arrow), knowledge
 * (dashed arrow) and authority (dotted, circle end) requirements.
 *
 * Definitions without diagram interchange are laid out with `layoutDmn` first.
 */
export function exportDrdSvg(input: DmnDefinitions, options?: DmnSvgOptions): string {
	const t = resolveCtx(options)
	const padding = options?.padding ?? 20
	const withIds = options?.elementIds === true
	const idAttr = (id: string): string => (withIds ? ` data-element-id="${esc(id)}"` : "")

	const defs = input.diagram && input.diagram.shapes.length > 0 ? input : layoutDmn(input)
	const diagram = defs.diagram
	if (!diagram || diagram.shapes.length === 0) return emptySvg(options, t)

	const kinds = new Map<string, DrdKind>()
	const names = new Map<string, string>()
	const note = (id: string, kind: DrdKind, name: string | undefined): void => {
		kinds.set(id, kind)
		if (name) names.set(id, name)
	}
	for (const d of defs.decisions) note(d.id, "decision", d.name)
	for (const d of defs.inputData) note(d.id, "inputData", d.name)
	for (const k of defs.knowledgeSources) note(k.id, "knowledgeSource", k.name)
	for (const b of defs.businessKnowledgeModels) note(b.id, "businessKnowledgeModel", b.name)
	for (const a of defs.textAnnotations) note(a.id, "annotation", a.text)

	const edgeKinds = new Map<string, EdgeKind>()
	for (const d of defs.decisions) {
		for (const r of d.informationRequirements) edgeKinds.set(r.id, "information")
		for (const r of d.knowledgeRequirements) edgeKinds.set(r.id, "knowledge")
		for (const r of d.authorityRequirements) edgeKinds.set(r.id, "authority")
	}
	for (const b of defs.businessKnowledgeModels) {
		for (const r of b.knowledgeRequirements) edgeKinds.set(r.id, "knowledge")
		for (const r of b.authorityRequirements) edgeKinds.set(r.id, "authority")
	}
	for (const k of defs.knowledgeSources) {
		for (const r of k.authorityRequirements) edgeKinds.set(r.id, "authority")
	}
	for (const a of defs.associations) edgeKinds.set(a.id, "association")

	let minX = Number.POSITIVE_INFINITY
	let minY = Number.POSITIVE_INFINITY
	let maxX = Number.NEGATIVE_INFINITY
	let maxY = Number.NEGATIVE_INFINITY
	for (const { bounds: b } of diagram.shapes) {
		minX = Math.min(minX, b.x)
		minY = Math.min(minY, b.y)
		maxX = Math.max(maxX, b.x + b.width)
		maxY = Math.max(maxY, b.y + b.height)
	}
	for (const e of diagram.edges) {
		for (const wp of e.waypoints) {
			minX = Math.min(minX, wp.x)
			minY = Math.min(minY, wp.y)
			maxX = Math.max(maxX, wp.x)
			maxY = Math.max(maxY, wp.y)
		}
	}

	const ox = minX - padding
	const oy = minY - padding
	const vw = maxX - minX + padding * 2
	const vh = maxY - minY + padding * 2

	const edgeParts: string[] = []
	for (const edge of diagram.edges) {
		if (edge.waypoints.length < 2) continue
		const kind = edgeKinds.get(edge.dmnElementRef) ?? "association"
		const d = edge.waypoints.map((w, i) => `${i === 0 ? "M" : "L"}${w.x},${w.y}`).join(" ")
		const dash =
			kind === "knowledge"
				? ' stroke-dasharray="6 3"'
				: kind === "authority"
					? ' stroke-dasharray="2 3"'
					: kind === "association"
						? ' stroke-dasharray="5 3"'
						: ""
		const marker =
			kind === "information"
				? ' marker-end="url(#drd-info)"'
				: kind === "knowledge"
					? ' marker-end="url(#drd-know)"'
					: kind === "authority"
						? ' marker-end="url(#drd-auth)"'
						: ""
		edgeParts.push(
			`<path d="${d}"${idAttr(edge.dmnElementRef)} fill="none" stroke="${t.flowStroke}" stroke-width="1.5"${dash}${marker}/>`,
		)
	}

	const shapeParts: string[] = []
	for (const shape of diagram.shapes) {
		const { x, y, width, height } = shape.bounds
		const kind = kinds.get(shape.dmnElementRef)
		if (!kind) continue
		const name = names.get(shape.dmnElementRef)
		const style = shapeStyle(t)
		let body: string
		switch (kind) {
			case "decision":
				body = `<rect x="0" y="0" width="${width}" height="${height}" style="${style}"/>`
				break
			case "inputData":
				body = `<rect x="0" y="0" width="${width}" height="${height}" rx="${height / 2}" style="${style}"/>`
				break
			case "knowledgeSource": {
				const wave = Math.min(8, height / 6)
				body = `<path d="M0 0 H${width} V${height - wave} Q${(width * 3) / 4} ${height - wave * 2} ${width / 2} ${height - wave} T0 ${height - wave} Z" style="${style}"/>`
				break
			}
			case "businessKnowledgeModel": {
				const c = Math.min(15, width / 6, height / 4)
				body = `<path d="M${c} 0 H${width - c} L${width} ${c} V${height} H0 V${c} Z" style="${style}"/>`
				break
			}
			case "annotation":
				body = `<path d="M${Math.min(12, width / 4)} 0 H0 V${height} H${Math.min(12, width / 4)}" style="fill:none;stroke:${t.shapeStroke};stroke-width:1.5"/>`
				break
		}
		const label = name ? labelSvg(name, width / 2, height / 2, width - 16, t, false) : ""
		shapeParts.push(
			`<g transform="translate(${x} ${y})"${idAttr(shape.dmnElementRef)}>${body}${label}</g>`,
		)
	}

	const sf = t.flowStroke
	return svgRoot(
		ox,
		oy,
		vw,
		vh,
		options,
		t,
		[...edgeParts, ...shapeParts],
		[
			`  <marker id="drd-info" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6 Z" fill="${sf}"/></marker>`,
			`  <marker id="drd-know" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto" markerUnits="strokeWidth"><path d="M0,0 L8,3 L0,6" fill="none" stroke="${sf}" stroke-width="1"/></marker>`,
			`  <marker id="drd-auth" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto" markerUnits="strokeWidth"><circle cx="3" cy="3" r="2.5" fill="${t.shapeFill}" stroke="${sf}" stroke-width="1"/></marker>`,
		],
	)
}

// ── Decision table ────────────────────────────────────────────────────────────

const HIT_LETTER: Record<HitPolicy, string> = {
	UNIQUE: "U",
	FIRST: "F",
	PRIORITY: "P",
	ANY: "A",
	COLLECT: "C",
	"RULE ORDER": "R",
	"OUTPUT ORDER": "O",
}
const AGG_SUFFIX: Record<string, string> = { SUM: "+", MIN: "<", MAX: ">", COUNT: "#" }

const MIN_COL = 60
const MAX_COL = 280
const CELL_PAD = 8
const TITLE_H = 28
const MIN_ROW_H = 28

function hitLabel(table: DmnDecisionTable): string {
	const letter = HIT_LETTER[table.hitPolicy ?? "UNIQUE"] ?? "U"
	const agg =
		table.hitPolicy === "COLLECT" && table.aggregation ? AGG_SUFFIX[table.aggregation] : ""
	return `${letter}${agg ?? ""}`
}

/**
 * Generates a self-contained SVG of a decision table: hit-policy letter and rule
 * numbers in the first column, then input and output columns, then an annotation
 * column when any rule has a description. Column widths follow the longest text
 * (6.5 px per character) clamped to 60–280 px; longer text wraps.
 */
export function exportDecisionTableSvg(
	table: DmnDecisionTable,
	options?: DecisionTableSvgOptions,
): string {
	const t = resolveCtx(options)
	const padding = options?.padding ?? 20
	const withIds = options?.elementIds === true
	const idAttr = (id: string): string => (withIds ? ` data-element-id="${esc(id)}"` : "")
	const charW = 6.5 * (t.fontSize / 11)

	type Col = { header: string; cells: string[]; w: number; group: "index" | "in" | "out" | "note" }
	const dash = (s: string | undefined): string => (s && s.trim() !== "" ? s : "-")
	const cols: Col[] = [
		{
			header: hitLabel(table),
			cells: table.rules.map((_, i) => String(i + 1)),
			w: 0,
			group: "index",
		},
		...table.inputs.map((inp, i) => ({
			header: inp.label || inp.inputExpression.text || `Input ${i + 1}`,
			cells: table.rules.map((r) => dash(r.inputEntries[i]?.text)),
			w: 0,
			group: "in" as const,
		})),
		...table.outputs.map((out, i) => ({
			header: out.label || out.name || `Output ${i + 1}`,
			cells: table.rules.map((r) => dash(r.outputEntries[i]?.text)),
			w: 0,
			group: "out" as const,
		})),
	]
	if (table.rules.some((r) => r.description)) {
		cols.push({
			header: "Annotations",
			cells: table.rules.map((r) => r.description ?? ""),
			w: 0,
			group: "note",
		})
	}

	for (const col of cols) {
		const longest = Math.max(
			col.header.length,
			...col.cells.map((c) => Math.max(...c.split("\n").map((l) => l.length), 0)),
		)
		col.w = Math.min(MAX_COL, Math.max(MIN_COL, Math.ceil(longest * charW + CELL_PAD * 2)))
	}

	const rowHeight = (texts: string[]): number => {
		let lines = 1
		texts.forEach((txt, i) => {
			const w = cols[i]?.w ?? MIN_COL
			lines = Math.max(lines, wrapText(txt, w - CELL_PAD * 2, charW).length)
		})
		return Math.max(MIN_ROW_H, lines * t.lineH + 12)
	}

	const totalW = cols.reduce((s, c) => s + c.w, 0)
	const headerH = rowHeight(cols.map((c) => c.header))
	const rowHs = table.rules.map((_, ri) => rowHeight(cols.map((c) => c.cells[ri] ?? "")))
	const titleH = options?.name ? TITLE_H : 0
	const totalH = titleH + headerH + rowHs.reduce((s, h) => s + h, 0)

	const textAt = (
		text: string,
		x: number,
		top: number,
		w: number,
		h: number,
		bold: boolean,
	): string => {
		const lines = wrapText(text, w - CELL_PAD * 2, charW)
		const startY = top + h / 2 - (lines.length * t.lineH) / 2 + t.lineH / 2
		const style = esc(
			`fill:${t.text};${fontStyle(undefined, t)}${bold ? ";font-weight:bold" : ""};dominant-baseline:central`,
		)
		return lines
			.map(
				(l, i) =>
					`<text style="${style}" x="${x + CELL_PAD}" y="${startY + i * t.lineH}">${esc(l)}</text>`,
			)
			.join("")
	}

	const parts: string[] = []
	const cellStyle = shapeStyle(t, 1)
	const headStyle = `fill:${t.poolHeader};stroke:${t.shapeStroke};stroke-width:1`
	if (titleH > 0 && options?.name) {
		parts.push(
			`<rect x="0" y="0" width="${totalW}" height="${titleH}" style="${cellStyle}"/>`,
			textAt(options.name, 0, 0, totalW, titleH, true),
		)
	}
	// Header row
	let x = 0
	for (const col of cols) {
		parts.push(
			`<rect x="${x}" y="${titleH}" width="${col.w}" height="${headerH}" style="${cellStyle}"/>`,
			`<rect x="${x}" y="${titleH}" width="${col.w}" height="${headerH}" style="${headStyle}"/>`,
			textAt(col.header, x, titleH, col.w, headerH, true),
		)
		x += col.w
	}
	// Rule rows
	let y = titleH + headerH
	for (const [ri, rule] of table.rules.entries()) {
		const h = rowHs[ri] ?? MIN_ROW_H
		let cx = 0
		const row: string[] = []
		for (const col of cols) {
			const style = col.group === "index" ? headStyle : cellStyle
			row.push(
				`<rect x="${cx}" y="${y}" width="${col.w}" height="${h}" style="${style}"/>`,
				textAt(col.cells[ri] ?? "", cx, y, col.w, h, false),
			)
			cx += col.w
		}
		parts.push(withIds ? `<g${idAttr(rule.id)}>${row.join("")}</g>` : row.join(""))
		y += h
	}
	// Heavier divider between inputs and outputs
	const firstOut = cols.findIndex((c) => c.group === "out")
	if (firstOut > 0) {
		const dx = cols.slice(0, firstOut).reduce((s, c) => s + c.w, 0)
		parts.push(`<path d="M${dx} ${titleH} V${totalH}" style="${iconStyle(t)};stroke-width:2.5"/>`)
	}

	const ox = -padding
	const oy = -padding
	return svgRoot(ox, oy, totalW + padding * 2, totalH + padding * 2, options, t, parts)
}
