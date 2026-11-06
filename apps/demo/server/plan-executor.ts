import { type ProcessPlan, compilePlan } from "@bpmnkit/core"

/**
 * Compiles a `ProcessPlan` JSON text into BPMN XML, the same step `casen synth` runs. The compiler
 * collects problems instead of throwing, so a result with no XML is rethrown with them listed.
 */
export function executePlan(jsonText: string): string {
	const result = compilePlan(JSON.parse(jsonText) as ProcessPlan)
	if (result.xml === undefined) {
		throw new Error(
			`Plan did not compile: ${result.problems.map((p) => `${p.path}: ${p.message}`).join("; ")}`,
		)
	}
	return result.xml
}
