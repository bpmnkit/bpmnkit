import { applyAutoLayout } from "./auto-layout.js"
import type { BpmnDefinitions } from "./bpmn-model.js"
import {
	type SvgExportOptions,
	type SvgExportResult,
	exportSvgDetailed as render,
} from "./svg-render.js"

export * from "./svg-render.js"

const semanticLayout = (defs: BpmnDefinitions): BpmnDefinitions => applyAutoLayout(defs, "semantic")

/** Like {@link exportSvg}, plus the drawn size, viewBox, element geometry and warnings. */
export function exportSvgDetailed(
	defs: BpmnDefinitions,
	options?: SvgExportOptions,
): SvgExportResult {
	return render(defs, { layout: semanticLayout, ...options })
}

/**
 * Generates a self-contained SVG string from a `BpmnDefinitions` object.
 *
 * The definitions must already contain diagram interchange (DI) position data —
 * i.e. they were produced by `.withAutoLayout().build()` or parsed from BPMN
 * XML that includes `<bpmndi:BPMNDiagram>` elements (or pass `autoLayout: true`).
 *
 * Works in every environment (Node.js, browsers, Deno, Bun, edge runtimes) with
 * zero external dependencies. Returns a standalone SVG string that can be written
 * to a file, embedded in HTML, or converted to PNG via a canvas API.
 *
 * @example
 * ```ts
 * import { Bpmn, exportSvg } from "@bpmnkit/core"
 *
 * const defs = Bpmn.createProcess("order")
 *   .startEvent("start")
 *   .serviceTask("process", { name: "Process Order", taskType: "process" })
 *   .endEvent("end")
 *   .withAutoLayout()
 *   .build()
 *
 * const svg = exportSvg(defs)                         // light theme
 * const dark = exportSvg(defs, { theme: "dark" })     // dark theme
 * ```
 */
export function exportSvg(defs: BpmnDefinitions, options?: SvgExportOptions): string {
	return exportSvgDetailed(defs, options).svg
}
