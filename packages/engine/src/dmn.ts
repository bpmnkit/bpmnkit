import type {
	DmnAggregation,
	DmnDecision,
	DmnDefinitions,
	DmnInput,
	DmnOutput,
	HitPolicy,
} from "@bpmnkit/core"
import { evaluate, evaluateUnaryTests, parseExpression, parseUnaryTests } from "@bpmnkit/feel"
import type { FeelValue } from "@bpmnkit/feel"

/**
 * Evaluate a DMN decision table against the provided variables.
 * Returns the result per the table's hit policy.
 *
 * @throws Error when UNIQUE matches more than one rule, or when a value does not
 * conform to its input or output `typeRef` (see `conformToType`).
 */
export function evaluateDecision(decision: DmnDecision, vars: Record<string, unknown>): unknown {
	const table = decision.decisionTable
	if (table === undefined) return null

	const hitPolicy: HitPolicy = table.hitPolicy ?? "UNIQUE"
	const matched: { ruleId: string; output: Record<string, unknown> }[] = []

	// Input expressions do not depend on the rule, so evaluate each column once.
	const inputValues: FeelValue[] = table.inputs.map((col) => {
		const inputExpr = col.inputExpression.text ?? ""
		if (inputExpr.trim() === "") return null
		const value = evalExpression(inputExpr, vars) as FeelValue
		return conformToType(
			decision.id,
			`input '${inputExpr.trim()}'`,
			value,
			col.inputExpression.typeRef,
		)
	})

	for (const rule of table.rules) {
		if (ruleMatches(table.inputs, inputValues, rule.inputEntries, vars)) {
			const output: Record<string, unknown> = {}
			for (let i = 0; i < table.outputs.length; i++) {
				const col = table.outputs[i]
				const entry = rule.outputEntries[i]
				if (col === undefined || entry === undefined) continue
				const colName = outputName(col)
				output[colName] = conformToType(
					decision.id,
					`output '${colName}' of rule '${rule.id}'`,
					evalOutputEntry(entry.text, vars) as FeelValue,
					col.typeRef,
				)
			}
			matched.push({ ruleId: rule.id, output })
			if (hitPolicy === "FIRST") break
		}
	}

	// DMN 1.3: UNIQUE is violated by a second matching rule, whatever it outputs.
	if (hitPolicy === "UNIQUE" && matched.length > 1) {
		const ids = matched.map((m) => m.ruleId).join(", ")
		throw new Error(
			`Hit policy UNIQUE violated in decision '${decision.id}': ${matched.length} rules match (${ids})`,
		)
	}

	let rows = matched.map((m) => m.output)
	if (hitPolicy === "PRIORITY" || hitPolicy === "OUTPUT ORDER") {
		rows = orderByOutputValues(table.outputs, rows)
	}
	return buildResult(hitPolicy, table.aggregation, rows, table.outputs.length)
}

function outputName(col: DmnOutput): string {
	return col.name ?? col.label ?? col.id
}

/**
 * Sorts rows by the output clauses' allowed values (`outputValues`), highest
 * priority first (DMN 1.3, 8.2.2): the first output column decides, later ones
 * break ties. A value missing from the list ranks after all listed ones; a
 * column without a list does not take part, so with no lists the rule order
 * stays. The sort is stable.
 */
function orderByOutputValues(
	outputs: DmnOutput[],
	rows: Record<string, unknown>[],
): Record<string, unknown>[] {
	const columns = outputs.flatMap((col) => {
		const allowed = col.outputValues ? evalExpression(`[${col.outputValues}]`, {}) : undefined
		return Array.isArray(allowed) ? [{ name: outputName(col), allowed }] : []
	})
	if (columns.length === 0) return rows
	const rank = (allowed: unknown[], value: unknown): number => {
		const at = evalExpression("index of(allowed, value)", { allowed, value })
		return Array.isArray(at) && typeof at[0] === "number" ? at[0] - 1 : allowed.length
	}
	return rows
		.map((row) => ({ row, key: columns.map((c) => rank(c.allowed, row[c.name])) }))
		.sort((a, b) => {
			for (let i = 0; i < columns.length; i++) {
				const d = (a.key[i] as number) - (b.key[i] as number)
				if (d !== 0) return d
			}
			return 0
		})
		.map((x) => x.row)
}

/** Numeric `typeRef`s Camunda 7 models use besides `number`. */
const NUMBER_TYPES = new Set(["number", "integer", "long", "double"])

/** FEEL expression that converts a string `v` to the temporal `typeRef`. */
const TEMPORAL_CONVERSIONS: Record<string, string> = {
	date: "date(v)",
	time: "time(v)",
	dateTime: "date and time(v)",
	dayTimeDuration: "duration(v)",
	yearMonthDuration: "duration(v)",
}

/** The DMN type name of a value. */
function dmnTypeName(value: FeelValue): string {
	if (value === null) return "null"
	if (Array.isArray(value)) return "list"
	switch (typeof value) {
		case "number":
			return "number"
		case "string":
			return "string"
		case "boolean":
			return "boolean"
	}
	switch ((value as { type?: string }).type) {
		case "date":
			return "date"
		case "time":
			return "time"
		case "date-time":
			return "dateTime"
		case "days-time-duration":
			return "dayTimeDuration"
		case "years-months-duration":
			return "yearMonthDuration"
		case "range":
			return "range"
		case "function":
			return "function"
	}
	return "context"
}

/**
 * Applies a `typeRef` the way Zeebe documents it: after an input expression or
 * output entry is evaluated, the value must convert to the declared type, else
 * the decision fails. Nothing is coerced except that a string converts to a
 * temporal type if FEEL can parse it (`"2024-01-31"` to `date`), because JSON
 * variables carry dates as strings. `null`, `Any`, and a `typeRef` outside the
 * documented data types (plus Camunda 7's `integer`/`long`/`double`) are not
 * checked.
 *
 * @throws Error when the value has another type.
 */
function conformToType(
	decisionId: string,
	what: string,
	value: FeelValue,
	typeRef: string | undefined,
): FeelValue {
	if (typeRef === undefined || value === null || value === undefined) return value
	const actual = dmnTypeName(value)
	const isNumber = NUMBER_TYPES.has(typeRef)
	const temporal = TEMPORAL_CONVERSIONS[typeRef]
	if (!isNumber && temporal === undefined && typeRef !== "string" && typeRef !== "boolean") {
		return value
	}
	if (isNumber ? actual === "number" : actual === typeRef) return value
	if (temporal !== undefined && actual === "string") {
		const converted = evalExpression(temporal, { v: value }) as FeelValue
		if (converted !== null && dmnTypeName(converted) === typeRef) return converted
	}
	throw new Error(
		`Decision '${decisionId}': ${what} is of type '${actual}' but its typeRef is '${typeRef}'`,
	)
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
		case "ANY":
		case "PRIORITY": {
			const row = rows[0]
			if (row === undefined) return null
			return singleOutput ? firstValue(row) : row
		}
		case "RULE ORDER":
		case "OUTPUT ORDER": {
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
 * literal expression.
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

/** The text of a decision's `<literalExpression>`. */
export function literalExpressionText(decision: DmnDecision): string | undefined {
	return decision.literalExpression?.text
}

function evaluateLiteralExpression(decision: DmnDecision, vars: Record<string, unknown>): unknown {
	const text = literalExpressionText(decision)
	if (text === undefined || text.trim() === "") return null
	return evalExpression(text, vars)
}
