import { parseExpression, parseUnaryTests } from "@bpmnkit/feel"
import type { CheckFinding } from "../check-finding.js"
import { DMN_ATTRIBUTE_VALUES } from "../generated/dmn-elements.js"
import type { XmlElement } from "../types/xml-element.js"
import { parseXml } from "../xml/xml-parser.js"

const HIT_POLICIES = DMN_ATTRIBUTE_VALUES["decisionTable.hitPolicy"]
const AGGREGATIONS = DMN_ATTRIBUTE_VALUES["decisionTable.aggregation"]

/** The type names Camunda's DMN engine resolves; anything else is silently treated as `Any`. */
const TYPE_REFS = new Set([
	"string",
	"number",
	"boolean",
	"date",
	"time",
	"dateTime",
	"date and time",
	"dayTimeDuration",
	"days and time duration",
	"yearMonthDuration",
	"years and months duration",
	"duration",
	"context",
	"list",
	"Any",
])

/** Which DRG element each requirement reference must point at. */
const REQUIREMENT_TARGET: Record<string, string> = {
	requiredDecision: "decision",
	requiredInput: "inputData",
	requiredKnowledge: "businessKnowledgeModel",
	requiredAuthority: "knowledgeSource",
}

const DRG_ELEMENTS = new Set(["decision", "inputData", "businessKnowledgeModel", "knowledgeSource"])

function local(el: XmlElement): string {
	const i = el.name.indexOf(":")
	return i === -1 ? el.name : el.name.slice(i + 1)
}

function child(el: XmlElement, name: string): XmlElement | undefined {
	return el.children.find((c) => local(c) === name)
}

function childrenNamed(el: XmlElement, name: string): XmlElement[] {
	return el.children.filter((c) => local(c) === name)
}

function textOf(el: XmlElement | undefined): string {
	if (el === undefined) return ""
	return (child(el, "text")?.text ?? "").trim()
}

function* walk(el: XmlElement): Generator<XmlElement> {
	yield el
	for (const c of el.children) yield* walk(c)
}

/**
 * Checks a DMN document for the mistakes Zeebe either rejects at deploy time
 * or reports with an error that hides the cause: malformed XML, duplicate ids,
 * requirement references that resolve to nothing, FEEL that does not parse,
 * invalid hit policies and unknown types.
 *
 * Reads the raw XML rather than the `Dmn` model so a document the model
 * cannot represent is still reported on instead of thrown away.
 *
 * @param xml - The DMN document's text.
 *
 * @example
 * ```typescript
 * for (const f of lintDmn(xml)) console.log(`${f.rule} [${f.elementId}] ${f.message} — ${f.fix}`)
 * ```
 */
export function lintDmn(xml: string): CheckFinding[] {
	let root: XmlElement
	try {
		root = parseXml(xml)
	} catch (err) {
		return [
			{
				rule: "dmn/malformed-xml",
				severity: "error",
				message: `The document is not well-formed XML: ${(err as Error).message}`,
				fix: "Fix the XML syntax (unclosed or mismatched tags, unquoted attributes, a stray `&` written instead of `&amp;`).",
			},
		]
	}
	if (local(root) !== "definitions") {
		return [
			{
				rule: "dmn/not-dmn",
				severity: "error",
				message: `The root element is <${root.name}>, not <definitions>.`,
				fix: 'Wrap the decisions in <definitions xmlns="https://www.omg.org/spec/DMN/20191111/MODEL/">.',
			},
		]
	}

	const findings: CheckFinding[] = []
	const byId = new Map<string, XmlElement>()
	for (const el of walk(root)) {
		const id = el.attributes.id
		if (id === undefined) continue
		if (byId.has(id)) {
			findings.push({
				rule: "dmn/duplicate-id",
				severity: "error",
				elementId: id,
				message: `The id "${id}" is used by more than one element (<${byId.get(id)?.name}> and <${el.name}>).`,
				fix: "Give one of them a different id; ids must be unique across the whole document.",
			})
		} else {
			byId.set(id, el)
		}
	}

	const drg = root.children.filter((c) => DRG_ELEMENTS.has(local(c)))
	for (const el of drg) {
		if (el.attributes.id === undefined || el.attributes.id === "") {
			findings.push({
				rule: "dmn/missing-id",
				severity: "error",
				message: `A <${el.name}>${el.attributes.name ? ` named "${el.attributes.name}"` : ""} has no id.`,
				fix: "Add an id attribute — requirements and zeebe:calledDecision reference elements by id.",
			})
		}
	}

	const decisions = drg.filter((el) => local(el) === "decision")
	if (decisions.length === 0) {
		findings.push({
			rule: "dmn/no-decision",
			severity: "error",
			message: "The document contains no <decision>.",
			fix: "Add at least one <decision> with a <decisionTable> or <literalExpression>; Zeebe rejects a DRG without decisions.",
		})
	}

	for (const el of drg) checkRequirements(el, byId, findings)
	checkCycles(decisions, findings)
	for (const decision of decisions) checkDecision(decision, findings)
	return findings
}

function hrefTarget(href: string | undefined): string | undefined {
	if (href === undefined || !href.startsWith("#")) return undefined
	return href.slice(1)
}

function checkRequirements(
	owner: XmlElement,
	byId: Map<string, XmlElement>,
	findings: CheckFinding[],
): void {
	const ownerId = owner.attributes.id
	for (const req of owner.children) {
		const kind = local(req)
		if (!kind.endsWith("Requirement")) continue
		for (const ref of req.children) {
			const refKind = local(ref)
			const expected = REQUIREMENT_TARGET[refKind]
			if (expected === undefined) continue
			const href = ref.attributes.href
			// A reference into another file (`other.dmn#id`) is resolved at deploy time, not here.
			if (href !== undefined && href !== "" && !href.startsWith("#")) continue
			const id = hrefTarget(href)
			const target = id === undefined ? undefined : byId.get(id)
			if (id === undefined || id === "") {
				findings.push({
					rule: "dmn/unresolved-requirement",
					severity: "error",
					...(ownerId !== undefined ? { elementId: ownerId } : {}),
					message: `<${kind}> on "${ownerId ?? "?"}" has a <${refKind}> with no href.`,
					fix: `Set href="#<id of the ${expected}>".`,
				})
			} else if (target === undefined) {
				findings.push({
					rule: "dmn/unresolved-requirement",
					severity: "error",
					...(ownerId !== undefined ? { elementId: ownerId } : {}),
					message: `<${refKind} href="${href}"> on "${ownerId ?? "?"}" points at "${id}", which does not exist.`,
					fix: `Point it at the id of an existing <${expected}>, or add a <${expected} id="${id}">.`,
				})
			} else if (local(target) !== expected) {
				findings.push({
					rule: "dmn/unresolved-requirement",
					severity: "error",
					...(ownerId !== undefined ? { elementId: ownerId } : {}),
					message: `<${refKind} href="${href}"> on "${ownerId ?? "?"}" points at a <${target.name}>, not a <${expected}>.`,
					fix:
						local(target) === "inputData"
							? "Use <requiredInput> for input data."
							: local(target) === "decision"
								? "Use <requiredDecision> for a decision."
								: `Point it at a <${expected}>.`,
				})
			}
		}
	}
}

function checkCycles(decisions: XmlElement[], findings: CheckFinding[]): void {
	const requires = new Map<string, string[]>()
	for (const d of decisions) {
		const id = d.attributes.id
		if (id === undefined) continue
		const deps: string[] = []
		for (const req of childrenNamed(d, "informationRequirement")) {
			const target = hrefTarget(child(req, "requiredDecision")?.attributes.href)
			if (target !== undefined) deps.push(target)
		}
		requires.set(id, deps)
	}
	const state = new Map<string, "visiting" | "done">()
	const reported = new Set<string>()
	const visit = (id: string, path: string[]): void => {
		if (state.get(id) === "done") return
		if (state.get(id) === "visiting") {
			const cycle = [...path.slice(path.indexOf(id)), id]
			if (!reported.has(id)) {
				reported.add(id)
				findings.push({
					rule: "dmn/requirement-cycle",
					severity: "error",
					elementId: id,
					message: `Decisions require each other in a cycle: ${cycle.join(" → ")}.`,
					fix: "Remove one of the <requiredDecision> references so the requirement graph is acyclic.",
				})
			}
			return
		}
		state.set(id, "visiting")
		for (const dep of requires.get(id) ?? []) {
			if (requires.has(dep)) visit(dep, [...path, id])
		}
		state.set(id, "done")
	}
	for (const id of requires.keys()) visit(id, [])
}

function checkTypeRef(
	el: XmlElement,
	elementId: string | undefined,
	what: string,
	findings: CheckFinding[],
): void {
	const typeRef = el.attributes.typeRef
	if (typeRef === undefined || typeRef === "" || TYPE_REFS.has(typeRef)) return
	const lower = typeRef.toLowerCase()
	const suggestion = [...TYPE_REFS].find((t) => t.toLowerCase() === lower)
	findings.push({
		rule: "dmn/invalid-type-ref",
		severity: "warning",
		...(elementId !== undefined ? { elementId } : {}),
		message: `${what} has typeRef "${typeRef}", which is not a DMN/FEEL type; the engine treats the value as untyped.`,
		fix:
			suggestion !== undefined
				? `Use typeRef="${suggestion}" (type names are case-sensitive).`
				: "Use one of string, number, boolean, date, time, dateTime, dayTimeDuration, yearMonthDuration, context, list or Any.",
	})
}

function checkFeel(
	text: string,
	mode: "expression" | "unary",
	elementId: string | undefined,
	what: string,
	findings: CheckFinding[],
): void {
	if (text === "") return
	const { errors } = mode === "unary" ? parseUnaryTests(text) : parseExpression(text)
	const first = errors[0]
	if (first === undefined) return
	findings.push({
		rule: "dmn/feel-syntax",
		severity: "error",
		...(elementId !== undefined ? { elementId } : {}),
		message: `${what} is not valid FEEL${mode === "unary" ? " unary tests" : ""}: ${first.message} (at ${first.start}) in \`${text}\`.`,
		fix:
			mode === "unary"
				? 'Write unary tests: a value (`"gold"`, `42`), a comparison (`> 10`), a range (`[1..5]`), a list (`"a","b"`), `not(...)`, or `-` for any.'
				: "Fix the FEEL expression; strings need double quotes and DMN entries have no leading `=`.",
	})
}

function checkDecision(decision: XmlElement, findings: CheckFinding[]): void {
	const decisionId = decision.attributes.id
	const label = `Decision "${decision.attributes.name ?? decisionId ?? "?"}"`
	const table = child(decision, "decisionTable")
	const literal = child(decision, "literalExpression")
	const variable = child(decision, "variable")
	if (variable !== undefined) checkTypeRef(variable, decisionId, `${label}'s variable`, findings)

	if (literal !== undefined) {
		checkTypeRef(literal, decisionId, `${label}'s literal expression`, findings)
		const text = textOf(literal)
		if (text === "") {
			findings.push({
				rule: "dmn/empty-expression",
				severity: "error",
				...(decisionId !== undefined ? { elementId: decisionId } : {}),
				message: `${label} has an empty literal expression.`,
				fix: "Put a FEEL expression in <literalExpression><text>…</text></literalExpression>.",
			})
		}
		checkFeel(text, "expression", decisionId, `${label}'s literal expression`, findings)
	}

	if (table === undefined) {
		if (literal === undefined) {
			findings.push({
				rule: "dmn/decision-no-logic",
				severity: "error",
				...(decisionId !== undefined ? { elementId: decisionId } : {}),
				message: `${label} has neither a <decisionTable> nor a <literalExpression>.`,
				fix: "Add a decision table or a literal expression; Zeebe cannot evaluate an empty decision.",
			})
		}
		return
	}

	const tableId = table.attributes.id ?? decisionId
	const hitPolicy = table.attributes.hitPolicy
	if (hitPolicy !== undefined && !(HIT_POLICIES as readonly string[]).includes(hitPolicy)) {
		const upper = hitPolicy.toUpperCase().replace(/_/g, " ")
		findings.push({
			rule: "dmn/invalid-hit-policy",
			severity: "error",
			...(tableId !== undefined ? { elementId: tableId } : {}),
			message: `${label} has hitPolicy "${hitPolicy}".`,
			fix: (HIT_POLICIES as readonly string[]).includes(upper)
				? `Write hitPolicy="${upper}".`
				: `Use one of ${HIT_POLICIES.join(", ")} (UNIQUE when omitted).`,
		})
	}
	const aggregation = table.attributes.aggregation
	if (aggregation !== undefined) {
		if (!(AGGREGATIONS as readonly string[]).includes(aggregation)) {
			findings.push({
				rule: "dmn/invalid-aggregation",
				severity: "error",
				...(tableId !== undefined ? { elementId: tableId } : {}),
				message: `${label} has aggregation "${aggregation}".`,
				fix: `Use one of ${AGGREGATIONS.join(", ")}.`,
			})
		} else if (hitPolicy !== "COLLECT") {
			findings.push({
				rule: "dmn/invalid-aggregation",
				severity: "error",
				...(tableId !== undefined ? { elementId: tableId } : {}),
				message: `${label} sets aggregation "${aggregation}" with hitPolicy "${hitPolicy ?? "UNIQUE"}".`,
				fix: 'Aggregation only applies to hitPolicy="COLLECT" — set that, or remove the aggregation.',
			})
		}
	}

	const inputs = childrenNamed(table, "input")
	const outputs = childrenNamed(table, "output")
	if (outputs.length === 0) {
		findings.push({
			rule: "dmn/no-output",
			severity: "error",
			...(tableId !== undefined ? { elementId: tableId } : {}),
			message: `${label}'s decision table has no <output>.`,
			fix: 'Add an <output id="…" name="result" typeRef="string"/> column.',
		})
	}

	for (const input of inputs) {
		const inputId = input.attributes.id
		const expr = child(input, "inputExpression")
		const what = `Input "${input.attributes.label ?? inputId ?? "?"}" of ${label}`
		if (expr === undefined || textOf(expr) === "") {
			findings.push({
				rule: "dmn/empty-input-expression",
				severity: "error",
				...(inputId !== undefined ? { elementId: inputId } : {}),
				message: `${what} has no input expression.`,
				fix: "Set <inputExpression><text>variableName</text></inputExpression> to the value the column tests.",
			})
			continue
		}
		checkTypeRef(expr, inputId, what, findings)
		checkFeel(textOf(expr), "expression", inputId, `${what}'s expression`, findings)
	}

	for (const output of outputs) {
		const outputId = output.attributes.id
		checkTypeRef(
			output,
			outputId,
			`Output "${output.attributes.name ?? outputId ?? "?"}"`,
			findings,
		)
		if (outputs.length > 1 && (output.attributes.name ?? "") === "") {
			findings.push({
				rule: "dmn/missing-output-name",
				severity: "error",
				...(outputId !== undefined ? { elementId: outputId } : {}),
				message: `Output "${output.attributes.label ?? outputId ?? "?"}" of ${label} has no name, and the table has ${outputs.length} outputs.`,
				fix: "Give every output a name — with several outputs the result is a context keyed by output name.",
			})
		}
	}

	for (const rule of childrenNamed(table, "rule")) {
		const ruleId = rule.attributes.id
		const inEntries = childrenNamed(rule, "inputEntry")
		const outEntries = childrenNamed(rule, "outputEntry")
		if (inEntries.length !== inputs.length || outEntries.length !== outputs.length) {
			findings.push({
				rule: "dmn/rule-entry-count",
				severity: "error",
				...(ruleId !== undefined ? { elementId: ruleId } : {}),
				message: `Rule "${ruleId ?? "?"}" of ${label} has ${inEntries.length} input and ${outEntries.length} output entries; the table has ${inputs.length} inputs and ${outputs.length} outputs.`,
				fix: "Give every rule exactly one <inputEntry> per input and one <outputEntry> per output, in column order (use `-` for any).",
			})
		}
		for (const entry of inEntries) {
			const text = textOf(entry)
			checkFeel(
				text === "-" ? "" : text,
				"unary",
				entry.attributes.id ?? ruleId,
				`Input entry of rule "${ruleId ?? "?"}"`,
				findings,
			)
		}
		for (const entry of outEntries) {
			checkFeel(
				textOf(entry),
				"expression",
				entry.attributes.id ?? ruleId,
				`Output entry of rule "${ruleId ?? "?"}"`,
				findings,
			)
		}
	}
}
