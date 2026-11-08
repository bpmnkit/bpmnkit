import { ValidationError } from "../errors.js"
import type { BpmnFlowElement, BpmnProcess } from "./bpmn-model.js"

/**
 * Build-time checks for attributes the BPMN/Zeebe XSD types strictly.
 *
 * A script-supplied value outside the type serialises fine and is only
 * rejected at deploy ("cvc-datatype-valid", "cvc-enumeration-valid") with the
 * attribute name redacted, so these throw at the call site's `build()` with the
 * allowed values instead.
 */

const NCNAME = /^[A-Za-z_][A-Za-z0-9_.-]*$/
// Zeebe accepts a whole number or a FEEL expression ("=retryCount").
const RETRIES = /^(=.+|\d+)$/

const HINT = " See agent-cards/bpmn.md#traps."

/** xsd:ID is an NCName: no spaces or colons, and it never starts with a digit. */
export function assertNcName(id: unknown, what: string): void {
	if (typeof id !== "string" || !NCNAME.test(id)) {
		throw new ValidationError(
			`${what} id ${JSON.stringify(id)} is not a valid XML id (xsd:ID). Allowed: letters, digits, "_", "-", "." — starting with a letter or "_", no spaces or ":". Example: "Task_ApproveOrder".${HINT}`,
		)
	}
}

function assertBoolean(value: unknown, attr: string, id: string): void {
	if (value !== undefined && typeof value !== "boolean") {
		throw new ValidationError(
			`${attr} on "${id}" must be a boolean (true | false), got ${JSON.stringify(value)}.${HINT}`,
		)
	}
}

function assertRetries(value: unknown, id: string): void {
	if (value === undefined) return
	if (typeof value !== "string" || !RETRIES.test(value)) {
		throw new ValidationError(
			`retries on "${id}" must be a whole-number string like "3" or a FEEL expression like "=retries", got ${JSON.stringify(value)}.${HINT}`,
		)
	}
}

function checkElements(elements: readonly BpmnFlowElement[]): void {
	for (const el of elements) {
		assertNcName(el.id, "Element")
		const loose = el as unknown as Record<string, unknown>
		assertBoolean(loose.cancelActivity, "cancelActivity", el.id)
		assertBoolean(loose.isInterrupting, "isInterrupting", el.id)
		const loop = loose.loopCharacteristics as { isSequential?: unknown } | undefined
		assertBoolean(loop?.isSequential, "multiInstance.isSequential", el.id)
		if (Array.isArray(loose.flowElements)) {
			checkElements(loose.flowElements as BpmnFlowElement[])
		}
	}
}

/** @throws {ValidationError} On the first value the XSD would reject at deploy. */
export function assertXsdValues(process: BpmnProcess): void {
	assertNcName(process.id, "Process")
	checkElements(process.flowElements)
	for (const flow of process.sequenceFlows) assertNcName(flow.id, "Sequence flow")
}

/** Checks `retries` as typed on the builder option, before it is serialised. */
export function assertRetriesOption(value: unknown, id: string): void {
	assertRetries(value, id)
}
