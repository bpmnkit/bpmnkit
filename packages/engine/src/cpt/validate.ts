import type { CptFile, CptInstruction, CptTestCase } from "./types.js"

type Obj = Record<string, unknown>

const isObj = (v: unknown): v is Obj => typeof v === "object" && v !== null && !Array.isArray(v)

export function isCptFile(json: unknown): boolean {
	return isObj(json) && typeof json.$schema === "string" && json.$schema.includes("cpt-test-cases")
}

const JOB_SELECTOR = ["jobType", "elementId", "processDefinitionId"]
const USER_TASK_SELECTOR = ["elementId", "processDefinitionId"]
const PI_SELECTOR = ["processDefinitionId"]
const ELEMENT_SELECTOR = ["elementId"]

// One allow-list per type: a field outside it would be silently ignored by the
// runner, which would let a test pass while checking less than it says.
const FIELDS: Record<string, string[]> = {
	CREATE_PROCESS_INSTANCE: ["processDefinitionSelector", "variables"],
	COMPLETE_JOB: ["jobSelector", "variables"],
	COMPLETE_JOB_AD_HOC_SUB_PROCESS: [
		"jobSelector",
		"variables",
		"activateElements",
		"completionConditionFulfilled",
		"cancelRemainingInstances",
	],
	COMPLETE_USER_TASK: ["userTaskSelector", "variables"],
	ASSERT_ELEMENT_INSTANCES: ["processInstanceSelector", "elementSelectors", "state"],
	ASSERT_PROCESS_INSTANCE: ["processInstanceSelector", "state"],
}

const STATES: Record<string, string[]> = {
	ASSERT_ELEMENT_INSTANCES: ["IS_ACTIVE", "IS_COMPLETED", "IS_COMPLETED_IN_ORDER"],
	ASSERT_PROCESS_INSTANCE: ["IS_ACTIVE", "IS_COMPLETED"],
}

const NOT_YET = "is not supported by casen test yet"

function parseInstruction(raw: unknown, where: string, errors: string[]): CptInstruction | null {
	if (!isObj(raw)) {
		errors.push(`${where}: must be an object`)
		return null
	}
	const type = raw.type
	if (typeof type !== "string") {
		errors.push(`${where}: type must be a string`)
		return null
	}
	// Own-property lookup: "constructor" or "__proto__" would otherwise find inherited members.
	const allowed = Object.hasOwn(FIELDS, type) ? FIELDS[type] : undefined
	if (!allowed) {
		errors.push(`${where}: ${type} ${NOT_YET}`)
		return null
	}
	const before = errors.length
	const err = (m: string) => errors.push(`${where}: ${m}`)

	for (const key of Object.keys(raw)) {
		if (key !== "type" && !allowed.includes(key)) err(`${type}.${key} ${NOT_YET}`)
	}

	const selector = (key: string, fields: string[], atLeastOne: boolean): Obj | null => {
		const sel = raw[key]
		if (!isObj(sel)) {
			err(`${key} must be an object`)
			return null
		}
		let ok = true
		for (const [k, v] of Object.entries(sel)) {
			if (!fields.includes(k)) {
				err(`${key}.${k} ${NOT_YET}`)
				ok = false
			} else if (typeof v !== "string") {
				err(`${key}.${k} must be a string`)
				ok = false
			}
		}
		if (ok && atLeastOne && !fields.some((f) => f in sel)) {
			err(`${key} needs one of ${fields.join(", ")}`)
			ok = false
		}
		return ok ? sel : null
	}
	const requireId = (sel: Obj | null, key: string, field: string) => {
		if (sel && typeof sel[field] !== "string") err(`${key}.${field} is required`)
	}
	const variables = (obj: Obj, key: string, prefix = ""): Record<string, unknown> => {
		const v = obj[key]
		if (v === undefined) return {}
		if (!isObj(v)) {
			err(`${prefix}${key} must be an object`)
			return {}
		}
		return v
	}
	const flag = (key: string): boolean => {
		const v = raw[key]
		if (v === undefined) return false
		if (typeof v !== "boolean") {
			err(`${key} must be a boolean`)
			return false
		}
		return v
	}
	const state = (): string => {
		const s = raw.state
		if (typeof s !== "string") {
			err("state is required")
			return ""
		}
		if (!((Object.hasOwn(STATES, type) ? STATES[type] : undefined) ?? []).includes(s))
			err(`state ${s} ${NOT_YET}`)
		return s
	}

	let out: CptInstruction | null = null
	switch (type) {
		case "CREATE_PROCESS_INSTANCE": {
			const sel = selector("processDefinitionSelector", PI_SELECTOR, false)
			requireId(sel, "processDefinitionSelector", "processDefinitionId")
			out = {
				type,
				processDefinitionSelector: (sel ?? {}) as { processDefinitionId: string },
				variables: variables(raw, "variables"),
			}
			break
		}
		case "COMPLETE_JOB": {
			const sel = selector("jobSelector", JOB_SELECTOR, true)
			out = { type, jobSelector: sel ?? {}, variables: variables(raw, "variables") }
			break
		}
		case "COMPLETE_JOB_AD_HOC_SUB_PROCESS": {
			const sel = selector("jobSelector", JOB_SELECTOR, true)
			const activateElements: { elementId: string; variables?: Record<string, unknown> }[] = []
			const act = raw.activateElements
			if (act !== undefined && !Array.isArray(act)) err("activateElements must be an array")
			else {
				;(act ?? []).forEach((a: unknown, i: number) => {
					const w = `activateElements[${i}]`
					if (!isObj(a)) return err(`${w} must be an object`)
					for (const k of Object.keys(a)) {
						if (k !== "elementId" && k !== "variables") err(`${w}.${k} ${NOT_YET}`)
					}
					if (typeof a.elementId !== "string") return err(`${w}.elementId is required`)
					const el: { elementId: string; variables?: Record<string, unknown> } = {
						elementId: a.elementId,
					}
					if (a.variables !== undefined) el.variables = variables(a, "variables", `${w}.`)
					activateElements.push(el)
				})
			}
			out = {
				type,
				jobSelector: sel ?? {},
				variables: variables(raw, "variables"),
				activateElements,
				completionConditionFulfilled: flag("completionConditionFulfilled"),
				cancelRemainingInstances: flag("cancelRemainingInstances"),
			}
			break
		}
		case "COMPLETE_USER_TASK": {
			const sel = selector("userTaskSelector", USER_TASK_SELECTOR, true)
			out = { type, userTaskSelector: sel ?? {}, variables: variables(raw, "variables") }
			break
		}
		case "ASSERT_ELEMENT_INSTANCES": {
			const sel = selector("processInstanceSelector", PI_SELECTOR, false)
			requireId(sel, "processInstanceSelector", "processDefinitionId")
			const elementSelectors: { elementId: string }[] = []
			const els = raw.elementSelectors
			if (!Array.isArray(els) || els.length === 0) err("elementSelectors must be a non-empty array")
			else {
				els.forEach((e: unknown, i: number) => {
					const w = `elementSelectors[${i}]`
					if (!isObj(e)) return err(`${w} must be an object`)
					for (const k of Object.keys(e)) {
						if (!ELEMENT_SELECTOR.includes(k)) err(`${w}.${k} ${NOT_YET}`)
					}
					if (typeof e.elementId !== "string") return err(`${w}.elementId is required`)
					elementSelectors.push({ elementId: e.elementId })
				})
			}
			out = {
				type,
				processInstanceSelector: (sel ?? {}) as { processDefinitionId: string },
				elementSelectors,
				state: state() as "IS_ACTIVE",
			}
			break
		}
		case "ASSERT_PROCESS_INSTANCE": {
			const sel = selector("processInstanceSelector", PI_SELECTOR, false)
			requireId(sel, "processInstanceSelector", "processDefinitionId")
			out = {
				type: "ASSERT_PROCESS_INSTANCE",
				processInstanceSelector: (sel ?? {}) as { processDefinitionId: string },
				state: state() as "IS_ACTIVE",
			}
			break
		}
	}
	return errors.length === before ? out : null
}

/**
 * Validate a CPT JSON file and apply defaults. Collects every error instead of
 * stopping at the first so one run lists everything to fix. Unknown top-level
 * keys (`processId`, `_testNotes` appear in real files) carry no semantics and
 * are ignored; unknown fields inside cases and instructions are errors.
 */
export function parseCptFile(json: unknown): { file: CptFile } | { errors: string[] } {
	if (!isObj(json)) return { errors: ["a CPT file must be a JSON object"] }
	const cases = json.testCases
	if (!Array.isArray(cases) || cases.length === 0) {
		return { errors: ["testCases must be a non-empty array"] }
	}
	const errors: string[] = []
	const testCases: CptTestCase[] = []
	cases.forEach((c: unknown, ci: number) => {
		if (!isObj(c)) {
			errors.push(`testCases[${ci}] must be an object`)
			return
		}
		const name = typeof c.name === "string" ? c.name : `testCases[${ci}]`
		if (typeof c.name !== "string") errors.push(`testCases[${ci}]: name must be a string`)
		for (const k of Object.keys(c)) {
			if (!["name", "description", "instructions"].includes(k)) {
				errors.push(`case "${name}": ${k} ${NOT_YET}`)
			}
		}
		if (c.description !== undefined && typeof c.description !== "string") {
			errors.push(`case "${name}": description must be a string`)
		}
		if (!Array.isArray(c.instructions) || c.instructions.length === 0) {
			errors.push(`case "${name}": instructions must be a non-empty array`)
			return
		}
		const instructions: CptInstruction[] = []
		c.instructions.forEach((raw: unknown, ii: number) => {
			const ins = parseInstruction(raw, `case "${name}", instruction ${ii}`, errors)
			if (ins) instructions.push(ins)
		})
		const tc: CptTestCase = { name, instructions }
		if (typeof c.description === "string") tc.description = c.description
		testCases.push(tc)
	})
	if (errors.length > 0) return { errors }
	return { file: { $schema: String(json.$schema ?? ""), testCases } }
}
