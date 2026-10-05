/**
 * The dry run of a generated diagram, in its own bundle: the engine is only
 * fetched once a draft has connectors to prove (`doc/ai-connector-generation-plan.md`
 * WS7). Every outside call is mocked; see `dryRun` in `@bpmnkit/engine/testing`.
 */
import { Bpmn } from "@bpmnkit/core"
import { type DryRunResult, dryRun } from "@bpmnkit/engine/testing"

export type { DryRunResult }

/** Runs the diagram once from start to end with every connector and job mocked. */
export function check(xml: string): Promise<DryRunResult> {
	return dryRun(Bpmn.parse(xml))
}
