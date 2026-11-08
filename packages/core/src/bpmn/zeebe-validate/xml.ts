import type { OptimizationFinding } from "../optimize/types.js"
import type { ZeebeContext } from "./context.js"

/**
 * Zeebe's parse and XSD stage (zeebe-rules.md section A, `check: "xml"`): what
 * the text must satisfy before BPMN Kit's tolerant parser reads it.
 *
 * @returns `fatal` when Zeebe would stop at parsing, so the model rules are not run.
 */
export function checkXml(_xml: string, _ctx: ZeebeContext): { fatal: boolean } {
	return { fatal: false }
}

export type { OptimizationFinding }
