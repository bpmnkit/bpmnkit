import { ValidationError } from "../errors.js"
import { generateId } from "../types/id-generator.js"
import { DecisionTableBuilder } from "./dmn-builder.js"
import { layoutDmn } from "./dmn-layout.js"
import type { DmnDecision, DmnDefinitions, DmnInputData } from "./dmn-model.js"
import { serializeDmn } from "./dmn-serializer.js"

// Branded so a decision *name* or label can't be passed where an id is expected.
declare const drgIdBrand: unique symbol
/** Id of a decision or input data element in a DRD. Get one from a handle or `drgId()`. */
export type DrgId = string & { readonly [drgIdBrand]: true }

/** Returned by `DrdBuilder.decision()`; pass it to `requires` of a later decision. */
export interface DecisionHandle {
	readonly kind: "decision"
	readonly id: DrgId
	readonly name: string
}

/** Returned by `DrdBuilder.inputData()`. */
export interface InputDataHandle {
	readonly kind: "inputData"
	readonly id: DrgId
	readonly name: string
}

/** Something a decision can require: a handle or a branded id. */
export type DrgRef = DecisionHandle | InputDataHandle | DrgId

/** Brand a literal id string. Validated against the DRD at `build()`. */
export function drgId(id: string): DrgId {
	return id as DrgId
}

export interface DrdDecisionOptions {
	/** Decisions or input data this decision depends on (never labels). */
	requires?: DrgRef[]
}

/** Fluent builder for multi-decision DRDs with information requirements. */
export class DrdBuilder {
	private readonly decisions: Array<{ decision: DmnDecision; requires: DrgRef[] }> = []
	private readonly inputs: DmnInputData[] = []
	private readonly drdName: string

	constructor(name = "DRD") {
		this.drdName = name
	}

	private assertFreeId(id: string): void {
		const taken = [...this.decisions.map((d) => d.decision.id), ...this.inputs.map((i) => i.id)]
		if (taken.includes(id)) throw new ValidationError(`Duplicate DRD element id "${id}"`)
	}

	/** Add an input data element. */
	inputData(id: string, name = id): InputDataHandle {
		this.assertFreeId(id)
		this.inputs.push({ id, name })
		return { kind: "inputData", id: id as DrgId, name }
	}

	/**
	 * Add a decision. `table` configures its decision table (use `.name()` for the label).
	 * Returns a handle to pass in `requires` of decisions added later.
	 */
	decision(
		id: string,
		table: (t: DecisionTableBuilder) => DecisionTableBuilder,
		options: DrdDecisionOptions = {},
	): DecisionHandle {
		this.assertFreeId(id)
		const built = table(new DecisionTableBuilder(id)).build().decisions[0]
		if (!built) throw new ValidationError(`Decision "${id}" produced no decision`)
		this.decisions.push({ decision: built, requires: options.requires ?? [] })
		return { kind: "decision", id: id as DrgId, name: built.name ?? id }
	}

	private resolve(owner: string, ref: DrgRef): string {
		const id = typeof ref === "string" ? ref : ref.id
		const decisionIds = this.decisions.map((d) => d.decision.id)
		const known = [...decisionIds, ...this.inputs.map((i) => i.id)]
		if (known.includes(id)) return id
		const byName =
			this.decisions.find((d) => d.decision.name === id)?.decision.id ??
			this.inputs.find((i) => i.name === id)?.id
		const hint = byName
			? ` "${id}" is a name/label, not an id. Use the id "${byName}" (pass the handle returned by decision()).`
			: ""
		throw new ValidationError(
			`Decision "${owner}" requires unknown id "${id}". Valid ids: ${known.join(", ") || "(none)"}.${hint} See agent-cards/dmn.md#traps.`,
		)
	}

	/**
	 * Build the DMN definitions with information requirements and DMNDI layout.
	 *
	 * @throws {ValidationError} If a `requires` entry is not the id of a decision or input data.
	 */
	build(): DmnDefinitions {
		const decisions: DmnDecision[] = this.decisions.map(({ decision, requires }) => ({
			...decision,
			informationRequirements: requires.map((ref) => {
				const target = this.resolve(decision.id, ref)
				const isDecision = this.decisions.some((d) => d.decision.id === target)
				return {
					id: generateId("InformationRequirement"),
					...(isDecision ? { requiredDecision: target } : { requiredInput: target }),
				}
			}),
		}))

		return layoutDmn({
			id: generateId("Definitions"),
			name: this.drdName,
			namespace: "http://camunda.org/schema/1.0/dmn",
			exporter: "bpmn-sdk",
			exporterVersion: "0.0.1",
			namespaces: {
				"": "https://www.omg.org/spec/DMN/20191111/MODEL/",
				dmndi: "https://www.omg.org/spec/DMN/20191111/DMNDI/",
				dc: "http://www.omg.org/spec/DMN/20180521/DC/",
				modeler: "http://camunda.org/schema/modeler/1.0",
			},
			modelerAttributes: {
				executionPlatform: "Camunda Cloud",
				executionPlatformVersion: "8.10.0",
			},
			decisions,
			inputData: this.inputs,
			knowledgeSources: [],
			businessKnowledgeModels: [],
			textAnnotations: [],
			associations: [],
		})
	}

	/** Build and export as DMN XML string. */
	toXml(): string {
		return serializeDmn(this.build())
	}
}
