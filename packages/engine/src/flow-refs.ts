import type { BpmnFlowElement, BpmnSequenceFlow } from "@bpmnkit/core"

/**
 * `<bpmn:incoming>`/`<bpmn:outgoing>` are optional in the BPMN schema, so hand-written or
 * generated files may omit or only partly declare them. The engine decides parallel joins
 * and start events from these lists, hence it completes them from the sequence flows.
 * Returns copies (the parsed model stays untouched, so serialization round-trips as is).
 */
export function withDerivedFlowRefs(
	elements: BpmnFlowElement[],
	flows: BpmnSequenceFlow[],
): BpmnFlowElement[] {
	const incoming = new Map<string, string[]>()
	const outgoing = new Map<string, string[]>()
	for (const f of flows) {
		push(outgoing, f.sourceRef, f.id)
		push(incoming, f.targetRef, f.id)
	}
	return elements.map((el) => {
		const inc = merge(el.incoming, incoming.get(el.id))
		const out = merge(el.outgoing, outgoing.get(el.id))
		return inc === el.incoming && out === el.outgoing ? el : { ...el, incoming: inc, outgoing: out }
	})
}

function push(map: Map<string, string[]>, key: string, id: string): void {
	const list = map.get(key)
	if (list === undefined) map.set(key, [id])
	else list.push(id)
}

/** Declared ids first (their order is kept), then any flow that was not declared. */
function merge(declared: string[], derived: string[] | undefined): string[] {
	if (derived === undefined) return declared
	const missing = derived.filter((id) => !declared.includes(id))
	return missing.length === 0 ? declared : [...declared, ...missing]
}
