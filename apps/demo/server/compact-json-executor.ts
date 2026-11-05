import { Bpmn, type CompactDiagram, expand } from "@bpmnkit/core"

/** Expands a `CompactDiagram` JSON text into BPMN XML in-process. Throws on malformed JSON or shape. */
export function executeCompactJson(jsonText: string): string {
	return Bpmn.export(expand(JSON.parse(jsonText) as CompactDiagram))
}
