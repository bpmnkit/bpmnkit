import { parseExpression } from "@bpmnkit/feel"
import { type CheckFinding, withCardHint } from "../check-finding.js"
import { FORM_ELEMENTS_BY_TRAIT, FORM_ELEMENT_NAMES } from "../generated/form-elements.js"

// Component types and their traits come from spec/elements/form.json (pnpm spec:gen).
const KNOWN_TYPES: ReadonlySet<string> = new Set(FORM_ELEMENT_NAMES)

/** Components that bind a value to a process variable, and so need a `key`. */
const KEYED_TYPES: ReadonlySet<string> = new Set(FORM_ELEMENTS_BY_TRAIT.keyed)

/** Components that choose from a list of options. */
const OPTION_TYPES: ReadonlySet<string> = new Set(FORM_ELEMENTS_BY_TRAIT.options)

/** Containers whose `path` opens a nested data scope for the keys inside them. */
const SCOPED_CONTAINERS: ReadonlySet<string> = new Set(FORM_ELEMENTS_BY_TRAIT.scope)

const KEY_PATTERN = /^[A-Za-z_$][\w$]*(\.[A-Za-z_$][\w$]*)*$/

/** Properties that are not expressions even though a value may happen to start with `=`. */
const NON_FEEL_KEYS = new Set(["components", "id", "type", "key", "path", "values"])

type Json = Record<string, unknown>

function isObject(value: unknown): value is Json {
	return typeof value === "object" && value !== null && !Array.isArray(value)
}

interface Walk {
	findings: CheckFinding[]
	ids: Map<string, string>
	/** Keys bound so far, per data scope (`""` is the form's root). */
	keys: Map<string, Set<string>>
}

/**
 * Checks a Camunda form (form-js JSON schema) for what Zeebe deploys without
 * complaint but Tasklist then fails on: invalid schema shape, duplicate
 * component ids or keys, input fields bound to no variable, and FEEL in
 * conditions and expressions that does not parse.
 *
 * Works on the raw JSON rather than `Form.parse`, so every problem in the
 * document is reported instead of only the first one the parser throws on.
 *
 * @param json - The form's JSON text.
 *
 * @example
 * ```typescript
 * for (const f of lintForm(json)) console.log(`${f.rule} [${f.elementId}] ${f.message} — ${f.fix}`)
 * ```
 */
export function lintForm(json: string): CheckFinding[] {
	return withCardHint(lintFormFindings(json), "form")
}

function lintFormFindings(json: string): CheckFinding[] {
	let root: unknown
	try {
		root = JSON.parse(json)
	} catch (err) {
		return [
			{
				rule: "form/invalid-json",
				severity: "error",
				message: `The form is not valid JSON: ${(err as Error).message}`,
				fix: "Fix the JSON syntax (trailing commas, unquoted keys and single quotes are not allowed).",
			},
		]
	}
	if (!isObject(root)) {
		return [
			{
				rule: "form/invalid-schema",
				severity: "error",
				message: "The form's top level is not a JSON object.",
				fix: 'Write the form as { "id": "…", "type": "default", "components": [ … ] }.',
			},
		]
	}

	const findings: CheckFinding[] = []
	if (typeof root.id !== "string" || root.id === "") {
		findings.push({
			rule: "form/missing-id",
			severity: "error",
			message: "The form has no id.",
			fix: 'Add a top-level "id" — a user task links the form by it (zeebe:formDefinition formId).',
		})
	}
	if (root.type !== "default") {
		findings.push({
			rule: "form/invalid-schema",
			severity: "error",
			message: `The form's top-level "type" is ${JSON.stringify(root.type)}, not "default".`,
			fix: 'Set "type": "default".',
		})
	}
	if (root.schemaVersion !== undefined && typeof root.schemaVersion !== "number") {
		findings.push({
			rule: "form/invalid-schema",
			severity: "warning",
			message: `"schemaVersion" is ${JSON.stringify(root.schemaVersion)}, not a number.`,
			fix: 'Set "schemaVersion" to a number, e.g. 16, or remove it.',
		})
	}
	if (!Array.isArray(root.components)) {
		findings.push({
			rule: "form/invalid-schema",
			severity: "error",
			message: 'The form has no "components" array.',
			fix: 'Add "components": [ … ] with the form\'s fields.',
		})
		return findings
	}

	const walk: Walk = { findings, ids: new Map(), keys: new Map() }
	if (typeof root.id === "string") walk.ids.set(root.id, "the form")
	walkComponents(root.components, "", "components", walk)
	return findings
}

function walkComponents(components: unknown[], scope: string, path: string, w: Walk): void {
	components.forEach((component, index) => {
		const at = `${path}[${index}]`
		if (!isObject(component)) {
			w.findings.push({
				rule: "form/invalid-schema",
				severity: "error",
				message: `${at} is not an object.`,
				fix: 'Write each component as { "id": "…", "type": "…", … }.',
			})
			return
		}
		checkComponent(component, scope, at, w)
	})
}

function checkComponent(c: Json, scope: string, at: string, w: Walk): void {
	const id = typeof c.id === "string" && c.id !== "" ? c.id : undefined
	const where = id !== undefined ? { elementId: id } : {}
	const label = id !== undefined ? `Component "${id}"` : at
	const type = typeof c.type === "string" ? c.type : undefined

	if (type === undefined) {
		w.findings.push({
			rule: "form/invalid-schema",
			severity: "error",
			...where,
			message: `${label} has no "type".`,
			fix: `Set "type" to one of ${[...KNOWN_TYPES].join(", ")}.`,
		})
	} else if (!KNOWN_TYPES.has(type)) {
		w.findings.push({
			rule: "form/unknown-type",
			severity: "warning",
			...where,
			message: `${label} has type "${type}", which form-js does not provide.`,
			fix: `Use one of ${[...KNOWN_TYPES].join(", ")} — unless "${type}" is a custom component registered in your Tasklist.`,
		})
	}

	if (id === undefined) {
		w.findings.push({
			rule: "form/missing-id",
			severity: "error",
			message: `${at}${type !== undefined ? ` (${type})` : ""} has no id.`,
			fix: 'Give every component a unique "id", e.g. "Field_amount".',
		})
	} else if (w.ids.has(id)) {
		w.findings.push({
			rule: "form/duplicate-id",
			severity: "error",
			elementId: id,
			message: `The id "${id}" is used by ${w.ids.get(id)} and by ${at}.`,
			fix: "Give each component its own id.",
		})
	} else {
		w.ids.set(id, at)
	}

	if (type !== undefined && KEYED_TYPES.has(type)) checkKey(c, type, scope, label, where, w)

	if (type !== undefined && OPTION_TYPES.has(type)) {
		const hasValues = Array.isArray(c.values) && c.values.length > 0
		const hasSource = typeof c.valuesKey === "string" || typeof c.valuesExpression === "string"
		if (!hasValues && !hasSource) {
			w.findings.push({
				rule: "form/missing-options",
				severity: "error",
				...where,
				message: `${label} (${type}) has no options.`,
				fix: 'Add "values": [{ "label": "…", "value": "…" }], or take them from a variable with "valuesKey" or "valuesExpression".',
			})
		}
	}

	if (type === "expression" && (typeof c.expression !== "string" || c.expression.trim() === "")) {
		w.findings.push({
			rule: "form/missing-expression",
			severity: "error",
			...where,
			message: `${label} is an expression field with no "expression".`,
			fix: 'Set "expression" to a FEEL expression starting with "=", e.g. "=amount * 1.2".',
		})
	}

	if (
		type === "button" &&
		c.action !== undefined &&
		c.action !== "submit" &&
		c.action !== "reset"
	) {
		w.findings.push({
			rule: "form/invalid-schema",
			severity: "error",
			...where,
			message: `${label} has button action ${JSON.stringify(c.action)}.`,
			fix: 'Use "action": "submit" or "reset".',
		})
	}

	checkConditional(c, label, where, w)
	checkValidation(c, label, where, w)
	checkFeelProperties(c, "", label, where, w)

	if (Array.isArray(c.components)) {
		const path = typeof c.path === "string" && c.path !== "" ? c.path : undefined
		const nested =
			type !== undefined && SCOPED_CONTAINERS.has(type) && path !== undefined
				? scope === ""
					? path
					: `${scope}.${path}`
				: scope
		walkComponents(c.components, nested, `${at}.components`, w)
	}
}

function checkKey(
	c: Json,
	type: string,
	scope: string,
	label: string,
	where: { elementId?: string },
	w: Walk,
): void {
	const key = c.key
	if (typeof key !== "string" || key === "") {
		// An expression field may compute a value without binding it.
		if (type === "expression") return
		w.findings.push({
			rule: "form/missing-key",
			severity: "error",
			...where,
			message: `${label} (${type}) is not bound to a variable — it has no "key".`,
			fix: 'Set "key" to the process variable the field reads and writes, e.g. "amount".',
		})
		return
	}
	if (!KEY_PATTERN.test(key)) {
		w.findings.push({
			rule: "form/invalid-key",
			severity: "error",
			...where,
			message: `${label} has key "${key}", which is not a variable name or dotted path.`,
			fix: "Use letters, digits, `_` and `$`, not starting with a digit; separate nested names with dots.",
		})
	}
	const keys = w.keys.get(scope) ?? new Set<string>()
	w.keys.set(scope, keys)
	if (keys.has(key)) {
		w.findings.push({
			rule: "form/duplicate-key",
			severity: "error",
			...where,
			message: `${label} binds key "${key}"${scope === "" ? "" : ` (in "${scope}")`}, which another field already binds.`,
			fix: "Give each field its own key; two fields on one key overwrite each other's value on submit.",
		})
	}
	keys.add(key)
}

function checkConditional(c: Json, label: string, where: { elementId?: string }, w: Walk): void {
	if (!isObject(c.conditional)) return
	const hide = c.conditional.hide
	if (typeof hide === "string" && hide.trim() !== "" && !hide.trim().startsWith("=")) {
		w.findings.push({
			rule: "form/conditional-not-feel",
			severity: "warning",
			...where,
			message: `${label}'s conditional.hide is "${hide}", which is not an expression.`,
			fix: `Prefix it with "=" to make it FEEL, e.g. "=${hide.trim()}".`,
		})
	}
}

function checkValidation(c: Json, label: string, where: { elementId?: string }, w: Walk): void {
	if (!isObject(c.validate)) return
	const v = c.validate
	if (typeof v.pattern === "string") {
		try {
			new RegExp(v.pattern)
		} catch (err) {
			w.findings.push({
				rule: "form/invalid-validation",
				severity: "error",
				...where,
				message: `${label}'s validate.pattern is not a valid regular expression: ${(err as Error).message}`,
				fix: "Fix the pattern; backslashes must be doubled in JSON (`\\\\d`).",
			})
		}
	}
	for (const [lo, hi] of [
		["min", "max"],
		["minLength", "maxLength"],
	] as const) {
		const a = v[lo]
		const b = v[hi]
		if (typeof a === "number" && typeof b === "number" && a > b) {
			w.findings.push({
				rule: "form/invalid-validation",
				severity: "error",
				...where,
				message: `${label} has validate.${lo} ${a} greater than validate.${hi} ${b}; no value can pass.`,
				fix: `Swap them, or lower ${lo} below ${hi}.`,
			})
		}
	}
}

/** Parses every string property that form-js reads as FEEL (one starting with `=`). */
function checkFeelProperties(
	value: Json,
	prefix: string,
	label: string,
	where: { elementId?: string },
	w: Walk,
): void {
	for (const [key, v] of Object.entries(value)) {
		if (prefix === "" && NON_FEEL_KEYS.has(key)) continue
		const prop = prefix === "" ? key : `${prefix}.${key}`
		if (typeof v === "string") {
			const trimmed = v.trim()
			if (!trimmed.startsWith("=")) continue
			const { errors } = parseExpression(trimmed.slice(1))
			const first = errors[0]
			if (first === undefined) continue
			w.findings.push({
				rule: "form/feel-syntax",
				severity: "error",
				...where,
				message: `${label}'s ${prop} is not valid FEEL: ${first.message} in \`${trimmed}\`.`,
				fix: "Fix the FEEL after the `=`; strings need double quotes, and `and`/`or` join conditions.",
			})
		} else if (isObject(v)) {
			checkFeelProperties(v, prop, label, where, w)
		}
	}
}
