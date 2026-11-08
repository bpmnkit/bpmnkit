import { compactifyDmn, expandDmn } from "./compact.js"
import { DecisionTableBuilder } from "./dmn-builder.js"
import { layoutDmn } from "./dmn-layout.js"
import type { DmnDefinitions } from "./dmn-model.js"
import { parseDmn } from "./dmn-parser.js"
import { serializeDmn } from "./dmn-serializer.js"
import { DrdBuilder } from "./drd-builder.js"

export { layoutDmn, benchmarkDmnLayout } from "./dmn-layout.js"
export type { DmnBenchmarkResult, DmnElementPosition } from "./dmn-layout.js"
export { drgId } from "./drd-builder.js"
export type {
	DecisionHandle,
	DrdBuilder,
	DrdDecisionOptions,
	DrgId,
	DrgRef,
	InputDataHandle,
} from "./drd-builder.js"
export { compactifyDmn, expandDmn } from "./compact.js"
export type {
	CompactDmn,
	CompactDmnDecision,
	CompactDmnInput,
	CompactDmnOutput,
	CompactDmnRule,
} from "./compact.js"

/** Entry point for DMN decision table operations. */
/**
 * Top-level DMN namespace: build, parse and export decision tables and DRDs.
 *
 * @example
 * ```typescript
 * const defs = Dmn.createDecisionTable("risk")
 *   .input({ label: "Score", expression: "score", typeRef: "number" })
 *   .output({ label: "Level", name: "level", typeRef: "string" })
 *   .rule({ inputs: ["> 700"], outputs: ['"low"'] })
 *   .build()
 * const xml = Dmn.export(defs)
 * ```
 *
 * @see node_modules/@bpmnkit/core/agent-cards/dmn.md — runnable script and traps (~1k tokens)
 */
export const Dmn = {
	/** Create a new DMN decision table using the fluent builder API. */
	createDecisionTable(decisionId: string): DecisionTableBuilder {
		return new DecisionTableBuilder(decisionId)
	},

	/**
	 * Create a multi-decision DRD. `decision()` returns a handle; pass it (or a
	 * `drgId()`) in `requires` of a later decision. Labels are rejected at build time.
	 *
	 * @example
	 * ```typescript
	 * const drd = Dmn.drd("Loan")
	 * const risk = drd.decision("risk", (t) => t.input({ expression: "score" }).output({ name: "level" }))
	 * drd.decision("offer", (t) => t.input({ expression: "level" }).output({ name: "rate" }), {
	 *   requires: [risk], // the handle, not a name
	 * })
	 * const xml = drd.toXml()
	 * ```
	 *
	 * @see node_modules/@bpmnkit/core/agent-cards/dmn.md — the multi-decision DRD script
	 */
	drd(name?: string): DrdBuilder {
		return new DrdBuilder(name)
	},

	/** Parse a DMN XML string into a typed model. */
	parse(xml: string): DmnDefinitions {
		return parseDmn(xml)
	},

	/** Export a typed DMN model to XML string. */
	export(definitions: DmnDefinitions): string {
		return serializeDmn(definitions)
	},

	/**
	 * Returns a minimal valid DMN definitions object with one empty decision table.
	 * Useful for "New Decision" actions.
	 */
	makeEmpty(): DmnDefinitions {
		const id = Math.random().toString(36).slice(2, 9)
		return parseDmn(`<?xml version="1.0" encoding="UTF-8"?>
<definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/"
  id="Definitions_${id}" name="New Decision" namespace="http://bpmn.io/schema/dmn">
  <decision id="Decision_${id}" name="Decision 1">
    <decisionTable id="decisionTable_${id}" hitPolicy="UNIQUE">
      <output id="output_${id}" label="Result" name="result" typeRef="string"/>
    </decisionTable>
  </decision>
</definitions>`)
	},

	/** Auto-layout a DMN definitions object, assigning DMNDI positions. */
	layout(definitions: DmnDefinitions): DmnDefinitions {
		return layoutDmn(definitions)
	},

	/** Convert a DmnDefinitions to a token-efficient compact representation. */
	compactify(definitions: DmnDefinitions): ReturnType<typeof compactifyDmn> {
		return compactifyDmn(definitions)
	},

	/** Convert a compact DMN representation back to DmnDefinitions with auto-layout. */
	expand(compact: Parameters<typeof expandDmn>[0]): DmnDefinitions {
		return expandDmn(compact)
	},
} as const
