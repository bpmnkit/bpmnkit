import { DIFF_VIEWER_TEMPLATE } from "../generated/diff-viewer.js"
import type { BpmnChangeKind, BpmnDiff, BpmnElementChange, BpmnGeometry } from "./bpmn-diff.js"
import type { BpmnDefinitions } from "./bpmn-model.js"
import {
	type SvgExportOptions,
	type SvgExportResult,
	esc,
	exportSvg,
	exportSvgDetailed,
} from "./svg.js"

// Every string built here has a byte-identical twin in crates/bpmnkit-diff/src/html.rs, held
// by conformance/diff/<case>/expected/diff.html. Change both or neither.

export interface DiffHtmlOptions {
	/** Page title and heading. Default: "BPMN diff". */
	title?: string
	/** Name of the earlier model in the toolbar and pane caption. Default: "before". */
	beforeLabel?: string
	/** Name of the later model. Default: "after". */
	afterLabel?: string
	/** Diagram theme; the page chrome follows `prefers-color-scheme`. Default: "light". */
	theme?: SvgExportOptions["theme"]
	/** Padding around each diagram. Default: 20. */
	padding?: number
	/** Lay out a model that has no diagram interchange. Default: false. */
	autoLayout?: boolean
}

const KINDS: readonly BpmnChangeKind[] = ["added", "removed", "changed", "moved"]
const SYMBOL: Record<BpmnChangeKind, string> = {
	added: "+",
	removed: "−",
	changed: "~",
	moved: "↔",
}
/** Semantic colours, exempt from brand tokens; inline so a PNG of `diffToSvg` keeps them. */
const COLOR: Record<BpmnChangeKind, string> = {
	added: "#16a34a",
	removed: "#dc2626",
	changed: "#d97706",
	moved: "#2563eb",
}

function sortKeys(v: unknown): unknown {
	if (Array.isArray(v)) return v.map(sortKeys)
	if (v !== null && typeof v === "object") {
		return Object.fromEntries(
			Object.keys(v)
				.sort()
				.map((k) => [k, sortKeys((v as Record<string, unknown>)[k])]),
		)
	}
	return v
}

const stringify = (v: unknown): string => JSON.stringify(sortKeys(v))

/** One highlight mark: a wide translucent route for an edge, an outset box for a shape. */
function mark(g: BpmnGeometry, color: string, ghost: boolean): string {
	const line = ghost
		? `stroke="${color}" stroke-width="2" stroke-dasharray="6 4"`
		: `stroke="${color}" stroke-width="4"`
	if (g.waypoints !== undefined && g.waypoints.length > 0) {
		const points = g.waypoints.map((p) => `${p.x},${p.y}`).join(" ")
		const wide = ghost ? line : `stroke="${color}" stroke-width="10" stroke-opacity="0.35"`
		return `<polyline points="${points}" fill="none" ${wide} stroke-linecap="round" stroke-linejoin="round"/>`
	}
	if (g.x === undefined || g.y === undefined || g.width === undefined || g.height === undefined) {
		return ""
	}
	return `<rect x="${g.x - 4}" y="${g.y - 4}" width="${g.width + 8}" height="${g.height + 8}" rx="6" fill="none" ${line}/>`
}

function changeLabel(c: BpmnElementChange): string {
	const name = c.nameAfter ?? c.nameBefore
	return name === undefined || name === "" ? c.id : `${name} (${c.id})`
}

/**
 * The overlay marks for one side. Removed elements show on the earlier diagram, added ones on
 * the later; changed and moved show on both, a move with a dashed ghost of where it was.
 */
function highlights(diff: BpmnDiff, side: "before" | "after", links: boolean): string {
	let out = ""
	diff.changes.forEach((c, i) => {
		if (side === "before" ? c.kind === "added" : c.kind === "removed") return
		const geometry = side === "before" ? c.geometryBefore : c.geometryAfter
		const color = COLOR[c.kind]
		let marks = geometry === undefined ? "" : mark(geometry, color, false)
		if (side === "after" && c.kind === "moved" && c.geometryBefore !== undefined) {
			marks = mark(c.geometryBefore, color, true) + marks
		}
		if (marks === "") return
		const g = `<g class="bk-hl bk-k-${c.kind}" data-i="${i}"><title>${c.kind}: ${esc(changeLabel(c))}</title>${marks}</g>`
		out += links ? `<a href="#bk-c${i}">${g}</a>` : g
	})
	return out
}

/** Element ids made unique per pane: two inlined SVGs would otherwise share `#arr`. */
const prefixIds = (svg: string, prefix: string): string =>
	svg.replaceAll(' id="', ` id="${prefix}`).replaceAll("url(#", `url(#${prefix}`)

type ViewBox = SvgExportResult["viewBox"]

function pane(
	r: SvgExportResult,
	union: ViewBox,
	prefix: string,
	label: string,
	hl: string,
): string {
	const u = `${union.x} ${union.y} ${union.w} ${union.h}`
	return `<svg class="bk-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${u}" role="img" aria-label="${esc(label)}"><g transform="translate(${r.viewBox.x} ${r.viewBox.y})">${prefixIds(r.svg, prefix)}</g><g class="bk-diff">${hl}</g></svg>`
}

function summary(diff: BpmnDiff): string {
	let chips = ""
	for (const kind of KINDS) {
		const n = diff.summary[kind]
		chips += `<span class="bk-chip bk-k-${kind}${n === 0 ? " bk-zero" : ""}">${SYMBOL[kind]}${n} ${kind}</span>`
	}
	if (diff.beforeHash === diff.afterHash) {
		chips += `<span class="bk-chip bk-same" title="semantic hash ${diff.afterHash}">semantically identical</span>`
	}
	return `<p class="bk-sum">${chips}</p>`
}

function value(v: unknown, tag: "del" | "ins"): string {
	return `<${tag}>${v === undefined ? "(none)" : esc(stringify(v))}</${tag}>`
}

function changeList(diff: BpmnDiff): string {
	if (diff.changes.length === 0) return `<p class="bk-empty">No differences.</p>`
	let out = ""
	for (const kind of KINDS) {
		let rows = ""
		let n = 0
		diff.changes.forEach((c, i) => {
			if (c.kind !== kind) return
			n++
			const name = c.nameAfter ?? c.nameBefore
			let row = `<li class="bk-row bk-k-${kind}" id="bk-c${i}" data-i="${i}" tabindex="0">`
			if (name !== undefined && name !== "") row += `<span class="bk-name">${esc(name)}</span> `
			if (c.elementType !== undefined) row += `<span class="bk-type">${esc(c.elementType)}</span> `
			row += `<code class="bk-id">${esc(c.id)}</code>`
			if (c.fields.length > 0) {
				row += `<ul class="bk-fields">`
				for (const f of c.fields) {
					row += `<li><code>${esc(f.path)}</code> ${value(f.before, "del")} → ${value(f.after, "ins")}</li>`
				}
				row += "</ul>"
			}
			rows += `${row}</li>`
		})
		if (n === 0) continue
		out += `<section class="bk-group bk-k-${kind}"><h2>${SYMBOL[kind]} ${kind} <span class="bk-n">${n}</span></h2><ol>${rows}</ol></section>`
	}
	return out
}

function render(defs: BpmnDefinitions, options: DiffHtmlOptions): SvgExportResult {
	if (options.autoLayout !== true && defs.diagrams.length === 0) {
		throw new Error("model has no diagram to draw (pass autoLayout: true)")
	}
	return exportSvgDetailed(defs, {
		theme: options.theme,
		padding: options.padding,
		autoLayout: options.autoLayout,
	})
}

/** `{{NAME}}` → `vars.NAME` in one pass, so substituted text is never scanned again. */
function fill(template: string, vars: Record<string, string>): string {
	return template.replace(/\{\{([A-Z_]+)\}\}/g, (m, key: string) => vars[key] ?? m)
}

/**
 * A single self-contained HTML page comparing two models: both diagrams with the changes
 * highlighted, side by side or overlaid, and the change list with field-level detail. It loads
 * nothing (a CSP forbids it) and reads without JavaScript; with it, a click on a change zooms
 * both diagrams to it. The same inputs give the same bytes as Rust `bpmnkit_diff::diff_to_html`.
 *
 * @example
 * ```ts
 * const diff = diffBpmn(before, after)
 * writeFileSync("diff.html", renderDiffHtml(before, after, diff, { title: "order.bpmn" }))
 * ```
 */
export function renderDiffHtml(
	before: BpmnDefinitions,
	after: BpmnDefinitions,
	diff: BpmnDiff,
	options: DiffHtmlOptions = {},
): string {
	const b = render(before, options)
	const a = render(after, options)
	const x = Math.min(b.viewBox.x, a.viewBox.x)
	const y = Math.min(b.viewBox.y, a.viewBox.y)
	const union = {
		x,
		y,
		w: Math.max(b.viewBox.x + b.viewBox.w, a.viewBox.x + a.viewBox.w) - x,
		h: Math.max(b.viewBox.y + b.viewBox.h, a.viewBox.y + a.viewBox.h) - y,
	}
	const beforeLabel = options.beforeLabel ?? "before"
	const afterLabel = options.afterLabel ?? "after"
	return fill(DIFF_VIEWER_TEMPLATE, {
		TITLE: esc(options.title ?? "BPMN diff"),
		SUMMARY: summary(diff),
		BEFORE_LABEL: esc(beforeLabel),
		AFTER_LABEL: esc(afterLabel),
		BEFORE_SVG: pane(b, union, "bk-b-", beforeLabel, highlights(diff, "before", true)),
		AFTER_SVG: pane(a, union, "bk-a-", afterLabel, highlights(diff, "after", true)),
		CHANGES: changeList(diff),
		// `<` escaped so no value can close the <script> it sits in.
		DIFF_JSON: stringify(diff).replaceAll("<", "\\u003c"),
	})
}

/**
 * The later model's SVG with the diff drawn over it (added, changed and moved elements, moves
 * with a ghost of the old place): one image for chat surfaces that cannot show HTML.
 */
export function diffToSvg(
	after: BpmnDefinitions,
	diff: BpmnDiff,
	options?: SvgExportOptions,
): string {
	const svg = exportSvg(after, options)
	const end = svg.lastIndexOf("</svg>")
	return `${svg.slice(0, end)}<g class="bk-diff">${highlights(diff, "after", false)}</g></svg>`
}
