import type {
	DmnAggregation,
	DmnDecision,
	DmnDefinitions,
	DmnInput,
	HitPolicy,
	XmlElement,
} from "@bpmnkit/core"
import { evaluate, evaluateUnaryTests, parseExpression, parseUnaryTests } from "@bpmnkit/feel"
import type { FeelValue } from "@bpmnkit/feel"

/**
 * Evaluate a DMN decision table against the provided variables.
 * Returns the result per the table's hit policy.
 */
export function evaluateDecision(decision: DmnDecision, vars: Record<string, unknown>): unknown {
	const table = decision.decisionTable
	if (table === undefined) return null

	const hitPolicy: HitPolicy = table.hitPolicy ?? "UNIQUE"
	const matchedOutputs: Record<string, unknown>[] = []

	// Input expressions do not depend on the rule, so evaluate each column once
	// instead of once per rule.
	const inputValues: FeelValue[] = table.inputs.map((col) => {
		const inputExpr = col.inputExpression.text ?? ""
		return inputExpr.trim() === "" ? null : (evalExpression(inputExpr, vars) as FeelValue)
	})

	for (const rule of table.rules) {
		if (ruleMatches(table.inputs, inputValues, rule.inputEntries, vars)) {
			const output: Record<string, unknown> = {}
			for (let i = 0; i < table.outputs.length; i++) {
				const col = table.outputs[i]
				const entry = rule.outputEntries[i]
				if (col === undefined || entry === undefined) continue
				const colName = col.name ?? col.label ?? col.id
				output[colName] = evalOutputEntry(entry.text, vars)
			}
			matchedOutputs.push(output)
			if (hitPolicy === "FIRST") break
		}
	}

	return buildResult(hitPolicy, table.aggregation, matchedOutputs, table.outputs.length)
}

function ruleMatches(
	inputs: DmnInput[],
	inputValues: FeelValue[],
	inputEntries: { id: string; text: string }[],
	vars: Record<string, unknown>,
): boolean {
	const feelVars = vars as Record<string, FeelValue>
	for (let i = 0; i < inputs.length; i++) {
		const col = inputs[i]
		const entry = inputEntries[i]
		if (col === undefined || entry === undefined) continue
		if (entry.text.trim() === "") continue // empty = "any"
		const inputValue = inputValues[i] ?? null
		const parsed = parseUnaryTests(entry.text, { names: Object.keys(vars) })
		if (parsed.ast === null) continue
		if (!evaluateUnaryTests(parsed.ast, inputValue, { vars: feelVars })) return false
	}
	return true
}

function evalExpression(expr: string, vars: Record<string, unknown>): unknown {
	// Names in scope let FEEL read multi-word variables, such as a required decision's name.
	const parsed = parseExpression(expr.trim(), { names: Object.keys(vars) })
	if (parsed.ast === null) return undefined
	return evaluate(parsed.ast, { vars: vars as Record<string, FeelValue> })
}

function evalOutputEntry(text: string, vars: Record<string, unknown>): unknown {
	if (text.trim() === "") return null
	return evalExpression(text, vars)
}

function buildResult(
	hitPolicy: HitPolicy,
	aggregation: DmnAggregation | undefined,
	rows: Record<string, unknown>[],
	outputCount: number,
): unknown {
	if (rows.length === 0) return null
	const singleOutput = outputCount === 1

	switch (hitPolicy) {
		case "UNIQUE":
		case "FIRST":
		case "ANY": {
			const row = rows[0]
			if (row === undefined) return null
			return singleOutput ? firstValue(row) : row
		}
		case "RULE ORDER":
		case "OUTPUT ORDER":
		case "PRIORITY": {
			if (singleOutput) return rows.map(firstValue)
			return rows
		}
		case "COLLECT": {
			if (aggregation === undefined) {
				if (singleOutput) return rows.map(firstValue)
				return rows
			}
			const values = rows.map(firstValue).filter((v): v is number => typeof v === "number")
			return aggregate(aggregation, values)
		}
		default:
			return null
	}
}

function firstValue(row: Record<string, unknown>): unknown {
	for (const k of Object.keys(row)) {
		return row[k]
	}
	return null
}

function aggregate(op: DmnAggregation, values: number[]): number | null {
	if (values.length === 0) return null
	switch (op) {
		case "SUM":
			return values.reduce((a, b) => a + b, 0)
		case "MIN":
			return Math.min(...values)
		case "MAX":
			return Math.max(...values)
		case "COUNT":
			return values.length
		default:
			return null
	}
}

/** One decision evaluated while evaluating a decision graph, in evaluation order. */
export interface EvaluatedDecision {
	decisionId: string
	result: unknown
}

/** Result of {@link evaluateDecisionGraph}. */
export interface DecisionGraphResult {
	/** The requested decision's result. */
	result: unknown
	/** Every decision evaluated, required decisions first, the requested one last. */
	evaluatedDecisions: EvaluatedDecision[]
}

/**
 * Evaluates a decision together with the decisions it requires (its DRD).
 *
 * Each required decision (`informationRequirement/requiredDecision`) is
 * evaluated once, before the decisions that read it, and its result is in
 * scope under the required decision's name (its id when it has none), as
 * DMN binds a decision's variable to its name. A decision with a decision
 * table evaluates as {@link evaluateDecision}; one without evaluates its
 * literal expression, which the parser keeps in `extensionElements`.
 *
 * @throws Error when the decision (or a required one) is missing or the
 * requirements form a cycle.
 */
export function evaluateDecisionGraph(
	definitions: DmnDefinitions,
	decisionId: string,
	vars: Record<string, unknown>,
): DecisionGraphResult {
	const byId = new Map(definitions.decisions.map((d) => [d.id, d]))
	const done = new Map<string, unknown>()
	const visiting = new Set<string>()
	const evaluatedDecisions: EvaluatedDecision[] = []

	const visit = (id: string): unknown => {
		if (done.has(id)) return done.get(id)
		const decision = byId.get(id)
		if (decision === undefined) throw new Error(`Decision '${id}' not found`)
		if (visiting.has(id)) throw new Error(`Decision '${id}' requires itself`)
		visiting.add(id)
		const scope: Record<string, unknown> = { ...vars }
		for (const req of decision.informationRequirements) {
			if (req.requiredDecision === undefined) continue
			const value = visit(req.requiredDecision)
			const required = byId.get(req.requiredDecision)
			scope[required?.name ?? req.requiredDecision] = value
		}
		visiting.delete(id)
		const result =
			decision.decisionTable !== undefined
				? evaluateDecision(decision, scope)
				: evaluateLiteralExpression(decision, scope)
		done.set(id, result)
		evaluatedDecisions.push({ decisionId: id, result })
		return result
	}

	return { result: visit(decisionId), evaluatedDecisions }
}

function localName(name: string): string {
	const i = name.indexOf(":")
	return i >= 0 ? name.slice(i + 1) : name
}

/** The text of a decision's `<literalExpression>`, kept by the parser in `extensionElements`. */
export function literalExpressionText(decision: DmnDecision): string | undefined {
	const el = decision.extensionElements?.find((c) => localName(c.name) === "literalExpression")
	const text = el?.children.find((c: XmlElement) => localName(c.name) === "text")
	return text?.text
}

function evaluateLiteralExpression(decision: DmnDecision, vars: Record<string, unknown>): unknown {
	const text = literalExpressionText(decision)
	if (text === undefined || text.trim() === "") return null
	return evalExpression(text, vars)
}
