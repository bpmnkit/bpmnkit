import type { BpmnFlowElement, BpmnProcess, BpmnSequenceFlow } from "../bpmn/bpmn-model.js"
import { gridLayoutFlowNodes } from "./grid/grid-engine.js"
import { semanticLayoutProcess } from "./semantic/index.js"
import type { LayoutHints, LayoutResult } from "./types.js"

/**
 * Which layout algorithm to run.
 *
 * `semantic` places nodes by rank and narrative band and honours lane
 * membership. `grid` is the older cell-grid walk, kept for collaborations,
 * where pool and message-flow geometry is still decided by the caller.
 * `layered` keeps the semantic graph, sizes and labels but places and routes
 * lane-free scopes Sugiyama-style (see `layered/index.ts`); experimental.
 */
export type LayoutEngine = "semantic" | "grid" | "layered"

/**
 * Layout a full process. Boundary events, expanded subprocesses and edge
 * labels are handled inside the engine.
 * Never throws on residual label overlap — call assertNoOverlap yourself
 * in tests that validate known-good fixtures.
 */
export function layoutProcess(
	process: BpmnProcess,
	engine: LayoutEngine = "semantic",
	/** Sub-processes the diagram draws collapsed; their contents get their own plane. */
	collapsed?: ReadonlySet<string>,
	/** Tool-grid hints; only the `semantic` engine packs tools into a grid, so `grid` ignores them. */
	grids?: LayoutHints["grids"],
	/** The process is a pool's: its artifacts keep the stacked placement (pool sizes drive message routing). */
	inPool = false,
): LayoutResult {
	if (engine === "grid") return gridLayoutFlowNodes(process.flowElements, process.sequenceFlows)
	return semanticLayoutProcess(process, collapsed, grids, inPool, engine === "layered")
}

/** Layout a set of flow nodes and sequence flows (used by ascii, proxy, compact). */
export function layoutFlowNodes(
	flowNodes: BpmnFlowElement[],
	sequenceFlows: BpmnSequenceFlow[],
): LayoutResult {
	return gridLayoutFlowNodes(flowNodes, sequenceFlows)
}
